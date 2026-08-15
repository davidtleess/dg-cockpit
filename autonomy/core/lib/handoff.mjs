// The context handoff: finish, hand off, /clear, resume fresh. Never compact.
// Design of record: docs/2026-08-15-context-handoff-design.md. David's words,
// 2026-08-15: "i want every agent to finish their work and create a handoff
// around 30% remaining in their context window - then i want them the '/clear'
// their session - and a new fresh session to pickup where it left off."
// Build authorized by his word "build it" (2026-08-15). Hardened per Tower's
// line-by-line review of 9c73fff (findings F1-F4, 2026-08-15).
//
// Laws (from the design doc, binding):
// - Never interrupt a turn: the threshold ARMS the order; only an idle
//   boundary (composer visible, no dialog, not generating) FIRES it.
// - Verify the artifact, not the claim — the 2026-07-27 lesson mechanized.
//   F1: the artifact must CONTAIN this cycle's order marker: the ledger
//   directory is shared, so mtime alone attributes another lane's postflight
//   to this handoff. Attribution and intent in one check.
// - The wire clears; the lane never self-clears. The wire waits for the
//   lane's HANDOFF-DONE reply (in addition to the artifact) before /clear.
//   F2: order echoes are counted from the transcript itself (order/renotice
//   signatures), never from a receipt counter — a landed-but-unverified
//   delivery would desync the counter and fake a reply.
// - F3: the clear intent is persisted BEFORE /clear is sent, and the fresh
//   prompt is verified with a settle retry — a redraw race must leave a
//   record, or the next poll re-derives from a wiped transcript and strands
//   a cleared lane without its boot prompt. A cycle mid-clear also outranks
//   the above-floor reset until the boot lands.
// - F4: the deadline parks the ENTIRE ordered phase — a lane that wrote the
//   artifact but never replies is as stuck as one that wrote nothing.
// - Judge and Tower are exempt by design: only lanes named in the config
//   participate. Start with lane 1.1; extend after burn-in.
// - Receipts follow the park laws: one cycle per threshold crossing,
//   transition-based (reset only when context returns above the floor),
//   never silenced by one failed delivery.
// - David-gated activation: the config ships { "enabled": false }; the sweep
//   is a no-op until his word flips it. Each enable/disable transition is
//   logged once with the config hash for activation provenance.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import { deliverToPane, findPaneByTitle } from "./docket.mjs";

const TOWER_TITLE = "🗼 tower";
const DEFAULT_FLOOR = 30;
const DEFAULT_DEADLINE_MINUTES = 20;
const DEFAULT_CLEAR_COMMAND = "/clear";
// The instrument's own staleness horizon: an observation this old is a dead
// monitor, not a reading — never arm on it.
const STALE_OBSERVATION_MS = 10 * 60 * 1000;
// Same refire law as the wire's parks: re-banner an undelivered park at most
// every 15 minutes; the seat delivery retries every poll.
const BANNER_REFIRE_MS = 15 * 60 * 1000;
// F3: fresh-prompt verification settles briefly instead of trusting the
// first capture mid-redraw.
const CLEAR_SETTLE_ATTEMPTS = 3;
const CLEAR_SETTLE_MS = 250;
// F2: the strings that identify a machinery echo of the HANDOFF-DONE token
// in the transcript. Each order and each renotice carries the token exactly
// once; anything beyond those echoes is the lane speaking.
const ORDER_SIGNATURE = "CONTEXT HANDOFF ORDER";
const RENOTICE_SIGNATURE = "CONTEXT HANDOFF RENOTICE";

const DEFAULT_LEDGER_DIR = "/Users/davidleess/dynasty-genius-product/docs/agent-ledger";

function defaultExec(args, timeout = 4000) {
  return execFileSync("tmux", args, { encoding: "utf8", timeout });
}

function defaultBanner(text, title = "Dynasty cockpit") {
  const safe = text.replaceAll('"', "'");
  const safeTitle = title.replaceAll('"', "'");
  execFileSync("osascript", ["-e", `display notification "${safe}" with title "${safeTitle}"`], {
    timeout: 4000,
  });
}

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function laneOf(paneState) {
  const target = paneState?.target ?? "";
  const separator = target.indexOf(":");
  return separator === -1 ? null : target.slice(separator + 1);
}

function parseHandoffConfig(raw) {
  try {
    const parsed = JSON.parse(raw);
    return {
      enabled: parsed.enabled === true,
      deadlineMinutes: parsed.deadlineMinutes,
      lanes: parsed.lanes && typeof parsed.lanes === "object" ? parsed.lanes : {},
    };
  } catch {
    // No config, or an unreadable one, means DISABLED — activation is
    // David-gated and never defaults on.
    return { enabled: false, lanes: {} };
  }
}

export async function readHandoffConfig(configPath) {
  try {
    return parseHandoffConfig(await readFile(configPath, "utf8"));
  } catch {
    return { enabled: false, lanes: {} };
  }
}

// Pure threshold decision: arms only for an enabled config, a configured lane,
// a fresh instrument, and a remaining % at or below the lane's floor.
export function computeHandoff(paneState, config, { now = () => Date.now() } = {}) {
  if (config?.enabled !== true) return null;
  const lane = laneOf(paneState);
  const laneConfig = lane ? config.lanes?.[lane] : undefined;
  if (!laneConfig) return null; // judge and Tower exempt by design
  if (paneState.status !== "fresh") return null;
  const observed = Date.parse(paneState.observedAt ?? "");
  if (!Number.isFinite(observed) || now() - observed > STALE_OBSERVATION_MS) return null;
  const remaining = paneState.remainingPercentage;
  if (!Number.isFinite(remaining)) return null;
  const floor = Number.isFinite(laneConfig.floor) ? laneConfig.floor : DEFAULT_FLOOR;
  if (remaining > floor) return null;
  return { lane, floor, remaining, paneTitle: paneState.label };
}

// Turn-boundary check, extending deliverToPane's capture checks: an open
// dialog would swallow a paste, a generating lane must never be interrupted,
// and only a visible composer counts as a boundary.
export function paneBoundary(paneTitle, exec) {
  let pane;
  try {
    pane = findPaneByTitle(paneTitle, exec);
  } catch (error) {
    return { state: "unreachable", error: error.message };
  }
  if (!pane) return { state: "missing" };
  const tail = exec(["capture-pane", "-p", "-t", pane]) ?? "";
  if (tail.includes("Do you want to proceed?")) return { state: "dialog", pane };
  if (/esc to interrupt/i.test(tail)) return { state: "busy", pane };
  if (!tail.includes("❯")) return { state: "no-composer", pane };
  return { state: "idle", pane };
}

function cycleMarker(prefix, lane, armedAt) {
  return `${prefix}-${createHash("sha256").update(`${lane}\0${armedAt}`).digest("hex").slice(0, 8)}`;
}

// Fixed-format, machinery-carried. The lane finishes and steps aside; the
// wire — never the lane — clears the pane. The lane signs its ledger entry
// with the order marker: that signature is what attributes the artifact (F1).
function orderMessage({ marker, lane, remaining, floor }) {
  return (
    `${marker} — ${ORDER_SIGNATURE} (lane ${lane}: ${remaining}% remaining, floor ${floor}%): ` +
    `land the smallest honest increment, then write your handoff — a ledger postflight + parked-state ` +
    `note that includes this order's marker verbatim (${marker}); name what is UNPROVEN — and reply ` +
    `HANDOFF-DONE. Do not start new work. The wire clears this pane after your signed handoff artifact ` +
    `lands; never /clear yourself. Machinery-carried; no one authored this order.`
  );
}

function renoticeMessage({ marker, lane, orderMarker }) {
  return (
    `${marker} — ${RENOTICE_SIGNATURE} (lane ${lane}): no signed handoff artifact has landed. The order ` +
    `stands — land the smallest honest increment, write the ledger postflight handoff including the ` +
    `marker verbatim (${orderMarker}), reply HANDOFF-DONE. Do not start new work. Machinery-carried.`
  );
}

function bootMessage({ marker, lane, artifactPath }) {
  return (
    `${marker} — FRESH SESSION (lane ${lane}): your predecessor handed off at low context. Pickup ` +
    `points: the AGENT_SYNC banner, your ledger handoff (${artifactPath}), and the run state. Resume ` +
    `exactly where the handoff parks you; start nothing it does not name. Machinery-carried.`
  );
}

function receiptFileFor(receiptDir, lane) {
  return join(receiptDir, `handoff-${lane}.json`);
}

async function readJsonFile(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

async function writeJsonFile(path, value) {
  const temporary = `${path}.tmp-${process.pid}`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await rename(temporary, path);
}

// F1: an artifact belongs to this cycle only if its CONTENT carries the
// order marker — the ledger directory is shared across lanes, so mtime alone
// would attribute another lane's postflight (and feed the wrong file into
// the rebirth prompt).
async function newestSignedArtifactAfter(ledgerDir, sinceMs, marker) {
  let names;
  try {
    names = await readdir(ledgerDir);
  } catch {
    return null;
  }
  let newest = null;
  for (const name of names) {
    if (name.startsWith(".")) continue;
    const path = join(ledgerDir, name);
    let info;
    try {
      info = await stat(path);
    } catch {
      continue;
    }
    if (!info.isFile() || info.mtimeMs <= sinceMs) continue;
    let content;
    try {
      content = await readFile(path, "utf8");
    } catch {
      continue;
    }
    if (!content.includes(marker)) continue;
    if (!newest || info.mtimeMs > newest.mtimeMs) {
      newest = { path, mtimeMs: info.mtimeMs };
    }
  }
  return newest;
}

function countOccurrences(haystack, needle) {
  let count = 0;
  let index = 0;
  while ((index = haystack.indexOf(needle, index)) !== -1) {
    count += 1;
    index += needle.length;
  }
  return count;
}

// F3: verify the fresh prompt on the VISIBLE screen (tmux scrollback keeps
// history, so the redrawn visible region is the honest witness), settling
// briefly instead of trusting a single mid-redraw capture.
async function freshPromptVisible(execFn, paneId, orderMarker, sleep) {
  for (let attempt = 0; attempt < CLEAR_SETTLE_ATTEMPTS; attempt += 1) {
    if (attempt > 0) await sleep(CLEAR_SETTLE_MS);
    const visible = execFn(["capture-pane", "-p", "-t", paneId]) ?? "";
    if (!visible.replaceAll("\n", "").includes(orderMarker) && visible.includes("❯")) return true;
  }
  return false;
}

async function stepLane({ pane, lane, laneConfig, config, receiptDir, ledgerDir, exec, execFn, banner, now, sleep }) {
  const floor = Number.isFinite(laneConfig.floor) ? laneConfig.floor : DEFAULT_FLOOR;
  const deadlineMinutes = laneConfig.deadlineMinutes ?? config.deadlineMinutes ?? DEFAULT_DEADLINE_MINUTES;
  const deadlineMs = deadlineMinutes * 60_000;
  const clearCommand = laneConfig.clearCommand ?? DEFAULT_CLEAR_COMMAND;
  const receiptPath = receiptFileFor(receiptDir, lane);
  const receipt = (await readJsonFile(receiptPath)) ?? {};
  const remaining = pane.remainingPercentage;
  let cycle = receipt.cycle;

  // Reset law: context back above the floor means a fresh session — the
  // crossing is over. F3 exception: a cycle mid-clear (clear sent, boot not
  // yet delivered) must finish its rebirth first; the freshly cleared
  // session reads above the floor by definition, and resetting here would
  // strand a cleared lane without its boot prompt.
  const midClear = cycle && (cycle.phase === "clearing" || cycle.phase === "cleared");
  if (!midClear && Number.isFinite(remaining) && remaining > floor) {
    if (cycle) {
      delete receipt.cycle;
      await writeJsonFile(receiptPath, receipt);
      return { lane, status: "reset-above-floor" };
    }
    return { lane, status: "above-floor" };
  }

  if (!cycle) {
    const due = computeHandoff(pane, config, { now });
    if (!due) return { lane, status: "no-handoff-due" };
    cycle = {
      armedAt: new Date(now()).toISOString(),
      floor: due.floor,
      remainingAtArm: due.remaining,
      phase: "armed",
    };
    cycle.orderMarker = cycleMarker("HND", lane, cycle.armedAt);
    receipt.cycle = cycle;
    await writeJsonFile(receiptPath, receipt);
  }

  const persist = () => writeJsonFile(receiptPath, receipt);

  // ARMED: the threshold has crossed; only an idle boundary fires the order.
  if (cycle.phase === "armed") {
    const boundary = paneBoundary(pane.label, execFn);
    if (boundary.state !== "idle") return { lane, status: "arm-wait", boundary: boundary.state };
    const delivery = deliverToPane({
      paneTitle: pane.label,
      message: orderMessage({ marker: cycle.orderMarker, lane, remaining: cycle.remainingAtArm, floor }),
      marker: cycle.orderMarker,
      ...(exec ? { exec } : {}),
    });
    if (delivery.status !== "delivered") return { lane, status: "order-retry", error: delivery.error };
    cycle.phase = "ordered";
    cycle.orderDeliveredAt = new Date(now()).toISOString();
    await persist();
    return { lane, status: "order-delivered", marker: cycle.orderMarker };
  }

  // ORDERED: wait for the SIGNED artifact and the lane's reply. F4: past the
  // deadline, ANY stuck point in this phase parks — artifact-less and
  // reply-less alike.
  if (cycle.phase === "ordered") {
    const orderedAt = Date.parse(cycle.orderDeliveredAt);
    const overdue = now() - orderedAt >= deadlineMs;

    const park = async (reason) => {
      // Park BLOCKED-tier via the park path: banner + verified delivery to
      // the Tower seat, retried until delivered, never clearing the lane.
      const parkMarker = cycleMarker("HNP", lane, cycle.armedAt);
      const lastBanner = cycle.parkBannerAt ? Date.parse(cycle.parkBannerAt) : 0;
      let dirty = false;
      if (now() - lastBanner >= BANNER_REFIRE_MS) {
        try {
          banner(`lane ${lane} context handoff overdue — your word un-sticks it`, "Dynasty BLOCKED");
        } catch {
          // Banner is best-effort; seat delivery below is the recorded fact.
        }
        cycle.parkBannerAt = new Date(now()).toISOString();
        dirty = true;
      }
      const delivery = deliverToPane({
        paneTitle: TOWER_TITLE,
        message:
          `${parkMarker} — BLOCKED: context handoff for lane ${lane} (${pane.label}) — ${reason} ` +
          `within ${deadlineMinutes} minutes of the order. The pane was NOT cleared. ` +
          `Machinery-carried notice — nothing moves until David's word.`,
        marker: parkMarker,
        ...(exec ? { exec } : {}),
      });
      if (delivery.status === "delivered") {
        cycle.phase = "parked";
        cycle.parkedAt = new Date(now()).toISOString();
        dirty = true;
      }
      if (dirty) await persist();
      return { lane, status: delivery.status === "delivered" ? "parked" : "park-retry" };
    };

    const artifact = await newestSignedArtifactAfter(ledgerDir, orderedAt, cycle.orderMarker);
    if (!artifact) {
      if (overdue) return park("no signed ledger artifact landed");
      // Design step 3: no artifact → renotify (once, at half the deadline,
      // at a boundary), THEN the deadline parks.
      if (now() - orderedAt >= deadlineMs / 2 && !cycle.renotifiedAt) {
        const boundary = paneBoundary(pane.label, execFn);
        if (boundary.state === "idle") {
          const renoticeMarker = `${cycle.orderMarker}-R2`;
          const delivery = deliverToPane({
            paneTitle: pane.label,
            message: renoticeMessage({ marker: renoticeMarker, lane, orderMarker: cycle.orderMarker }),
            marker: renoticeMarker,
            ...(exec ? { exec } : {}),
          });
          if (delivery.status === "delivered") {
            cycle.renotifiedAt = new Date(now()).toISOString();
            await persist();
            return { lane, status: "renotified", marker: renoticeMarker };
          }
        }
      }
      return { lane, status: "awaiting-artifact" };
    }

    // Artifact verified. The wire still waits for the lane's HANDOFF-DONE
    // reply at an idle boundary — a lane mid-sentence is never cleared.
    const boundary = paneBoundary(pane.label, execFn);
    if (boundary.state !== "idle") {
      if (overdue) return park("handoff artifact landed but the lane never reached an idle boundary");
      return { lane, status: "awaiting-handoff-done", boundary: boundary.state };
    }
    const transcript = execFn(["capture-pane", "-p", "-t", boundary.pane, "-S", "-"]) ?? "";
    // F2: derive the echo count from the transcript itself — every order and
    // renotice carries the token exactly once, and a landed-but-unverified
    // delivery leaves an echo no receipt counter ever saw. Replies are
    // whatever remains beyond the echoes (wrap-tolerant).
    const flat = transcript.replaceAll("\n", "");
    const echoes = countOccurrences(flat, ORDER_SIGNATURE) + countOccurrences(flat, RENOTICE_SIGNATURE);
    const replies = countOccurrences(flat, "HANDOFF-DONE") - echoes;
    if (replies < 1) {
      if (overdue) return park("handoff artifact landed but no HANDOFF-DONE reply came");
      return { lane, status: "awaiting-handoff-done" };
    }

    // F3: persist the clear intent BEFORE the send — a crash or redraw race
    // must leave a record, or the next poll re-derives from a wiped
    // transcript and strands the cleared lane without its boot prompt.
    cycle.phase = "clearing";
    cycle.artifactPath = artifact.path;
    cycle.clearRequestedAt = new Date(now()).toISOString();
    await persist();
    execFn(["send-keys", "-t", boundary.pane, "-l", clearCommand]);
    execFn(["send-keys", "-t", boundary.pane, "C-m"]);
    if (!(await freshPromptVisible(execFn, boundary.pane, cycle.orderMarker, sleep))) {
      return { lane, status: "clear-unverified" };
    }
    cycle.phase = "cleared";
    cycle.clearedAt = new Date(now()).toISOString();
    await persist();
    // Fall through: boot the fresh session in the same pass.
  }

  // CLEARING: a clear was requested but never verified. Verify first; only
  // resend at an idle boundary while the order is still on screen.
  if (cycle.phase === "clearing") {
    const boundary = paneBoundary(pane.label, execFn);
    if (boundary.state === "missing" || boundary.state === "unreachable") {
      return { lane, status: "clear-unverified", boundary: boundary.state };
    }
    if (!(await freshPromptVisible(execFn, boundary.pane, cycle.orderMarker, sleep))) {
      if (boundary.state !== "idle") return { lane, status: "clear-unverified", boundary: boundary.state };
      execFn(["send-keys", "-t", boundary.pane, "-l", clearCommand]);
      execFn(["send-keys", "-t", boundary.pane, "C-m"]);
      if (!(await freshPromptVisible(execFn, boundary.pane, cycle.orderMarker, sleep))) {
        return { lane, status: "clear-unverified" };
      }
    }
    cycle.phase = "cleared";
    cycle.clearedAt = new Date(now()).toISOString();
    await persist();
  }

  // CLEARED: deliver the rebirth boot prompt, marker-verified.
  if (cycle.phase === "cleared") {
    const bootMarker = cycleMarker("HNB", lane, cycle.armedAt);
    const delivery = deliverToPane({
      paneTitle: pane.label,
      message: bootMessage({ marker: bootMarker, lane, artifactPath: cycle.artifactPath }),
      marker: bootMarker,
      ...(exec ? { exec } : {}),
    });
    if (delivery.status !== "delivered") return { lane, status: "boot-retry", error: delivery.error };
    cycle.phase = "done";
    cycle.bootMarker = bootMarker;
    cycle.bootDeliveredAt = new Date(now()).toISOString();
    await persist();
    return { lane, status: "reborn", marker: bootMarker };
  }

  if (cycle.phase === "parked") return { lane, status: "parked-held" };
  return { lane, status: "cycle-complete" };
}

// One poll of the handoff protocol across every instrumented pane. Reads the
// dg-context state files (the pane-title percentages the monitor already
// writes), acts only on lanes named in the David-gated config, and stays a
// silent no-op while the config says disabled — except the one activation
// provenance entry emitted when the enabled flag TRANSITIONS, carrying the
// config hash (Tower, 2026-08-15).
export async function runHandoffSweep({
  configPath = join(homedir(), ".dg-autonomy", "handoff-config.json"),
  stateDir = join(homedir(), ".dg-context", "state"),
  receiptDir = join(homedir(), ".dg-autonomy"),
  ledgerDir = DEFAULT_LEDGER_DIR,
  exec,
  banner = defaultBanner,
  now = () => Date.now(),
  sleep = defaultSleep,
} = {}) {
  let raw = null;
  try {
    raw = await readFile(configPath, "utf8");
  } catch {
    raw = null;
  }
  const config = parseHandoffConfig(raw);
  const results = [];

  const activationPath = join(receiptDir, "handoff-activation.json");
  const previous = (await readJsonFile(activationPath)) ?? {};
  if ((previous.enabled === true) !== config.enabled) {
    const configHash = raw === null ? "none" : createHash("sha256").update(raw).digest("hex").slice(0, 8);
    await writeJsonFile(activationPath, { enabled: config.enabled, configHash, at: new Date(now()).toISOString() });
    results.push({
      status: "activation",
      enabled: config.enabled,
      configHash,
      detail: `enabled=${config.enabled} config=${configHash}`,
    });
  }
  if (!config.enabled) return results;

  const execFn = exec ?? ((args) => defaultExec(args));

  let entries;
  try {
    entries = await readdir(stateDir);
  } catch {
    results.push({ status: "state-dir-unreadable", stateDir });
    return results;
  }

  for (const name of entries.filter((entry) => /^dynasty_\d+_\d+\.json$/.test(entry)).sort()) {
    const statePath = join(stateDir, name);
    const pane = await readJsonFile(statePath);
    if (!pane) {
      results.push({ statePath, status: "unreadable" });
      continue;
    }
    const lane = laneOf(pane);
    const laneConfig = lane ? config.lanes?.[lane] : undefined;
    if (!laneConfig) continue; // exempt seats never appear in the results
    results.push(
      await stepLane({ pane, lane, laneConfig, config, receiptDir, ledgerDir, exec, execFn, banner, now, sleep }),
    );
  }
  return results;
}
