// The context handoff: finish, hand off, /clear, resume fresh. Never compact.
// Design of record: docs/2026-08-15-context-handoff-design.md. David's words,
// 2026-08-15: "i want every agent to finish their work and create a handoff
// around 30% remaining in their context window - then i want them the '/clear'
// their session - and a new fresh session to pickup where it left off."
// Build authorized by his word "build it" (2026-08-15).
//
// Laws (from the design doc, binding):
// - Never interrupt a turn: the threshold ARMS the order; only an idle
//   boundary (composer visible, no dialog, not generating) FIRES it.
// - Verify the artifact, not the claim — the 2026-07-27 lesson mechanized:
//   only a ledger file modified after the order moves the cycle; HANDOFF-DONE
//   alone moves nothing.
// - The wire clears; the lane never self-clears. The wire waits for the
//   lane's HANDOFF-DONE reply (in addition to the artifact) before /clear.
// - Judge and Tower are exempt by design: only lanes named in the config
//   participate. Start with lane 1.1; extend after burn-in.
// - Receipts follow the park laws: one cycle per threshold crossing,
//   transition-based (reset only when context returns above the floor),
//   never silenced by one failed delivery.
// - David-gated activation: the config ships { "enabled": false }; the sweep
//   is a no-op until his word flips it.

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

export function laneOf(paneState) {
  const target = paneState?.target ?? "";
  const separator = target.indexOf(":");
  return separator === -1 ? null : target.slice(separator + 1);
}

export async function readHandoffConfig(configPath) {
  try {
    const parsed = JSON.parse(await readFile(configPath, "utf8"));
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
// wire — never the lane — clears the pane.
function orderMessage({ marker, lane, remaining, floor }) {
  return (
    `${marker} — CONTEXT HANDOFF ORDER (lane ${lane}: ${remaining}% remaining, floor ${floor}%): ` +
    `land the smallest honest increment, then write your handoff — ledger postflight + parked-state ` +
    `note; name what is UNPROVEN — and reply HANDOFF-DONE. Do not start new work. The wire clears ` +
    `this pane after your handoff artifact lands; never /clear yourself. Machinery-carried; no one ` +
    `authored this order.`
  );
}

function renoticeMessage({ marker, lane }) {
  return (
    `${marker} — CONTEXT HANDOFF RENOTICE (lane ${lane}): no handoff artifact has landed. The order ` +
    `stands — land the smallest honest increment, write the ledger postflight handoff, reply ` +
    `HANDOFF-DONE. Do not start new work. Machinery-carried.`
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

async function readReceipt(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return {};
  }
}

async function writeReceipt(path, receipt) {
  const temporary = `${path}.tmp-${process.pid}`;
  await writeFile(temporary, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
  await rename(temporary, path);
}

async function newestArtifactAfter(ledgerDir, sinceMs) {
  let names;
  try {
    names = await readdir(ledgerDir);
  } catch {
    return null;
  }
  let newest = null;
  for (const name of names) {
    if (name.startsWith(".")) continue;
    let info;
    try {
      info = await stat(join(ledgerDir, name));
    } catch {
      continue;
    }
    if (!info.isFile() || info.mtimeMs <= sinceMs) continue;
    if (!newest || info.mtimeMs > newest.mtimeMs) {
      newest = { path: join(ledgerDir, name), mtimeMs: info.mtimeMs };
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

async function stepLane({ pane, lane, laneConfig, config, receiptDir, ledgerDir, exec, execFn, banner, now }) {
  const floor = Number.isFinite(laneConfig.floor) ? laneConfig.floor : DEFAULT_FLOOR;
  const deadlineMinutes = laneConfig.deadlineMinutes ?? config.deadlineMinutes ?? DEFAULT_DEADLINE_MINUTES;
  const deadlineMs = deadlineMinutes * 60_000;
  const clearCommand = laneConfig.clearCommand ?? DEFAULT_CLEAR_COMMAND;
  const receiptPath = receiptFileFor(receiptDir, lane);
  const receipt = await readReceipt(receiptPath);
  const remaining = pane.remainingPercentage;

  // Reset law: context back above the floor means a fresh session — the
  // crossing is over, whatever became of the last cycle. The NEXT crossing
  // starts a new cycle even if the phases repeat verbatim.
  if (Number.isFinite(remaining) && remaining > floor) {
    if (receipt.cycle) {
      delete receipt.cycle;
      await writeReceipt(receiptPath, receipt);
      return { lane, status: "reset-above-floor" };
    }
    return { lane, status: "above-floor" };
  }

  let cycle = receipt.cycle;
  if (!cycle) {
    const due = computeHandoff(pane, config, { now });
    if (!due) return { lane, status: "no-handoff-due" };
    cycle = {
      armedAt: new Date(now()).toISOString(),
      floor: due.floor,
      remainingAtArm: due.remaining,
      phase: "armed",
      ordersSent: 0,
    };
    cycle.orderMarker = cycleMarker("HND", lane, cycle.armedAt);
    receipt.cycle = cycle;
    await writeReceipt(receiptPath, receipt);
  }

  const persist = () => writeReceipt(receiptPath, receipt);

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
    cycle.ordersSent = 1;
    cycle.orderDeliveredAt = new Date(now()).toISOString();
    await persist();
    return { lane, status: "order-delivered", marker: cycle.orderMarker };
  }

  // ORDERED: wait for the ARTIFACT (ledger file modified after the order).
  if (cycle.phase === "ordered") {
    const orderedAt = Date.parse(cycle.orderDeliveredAt);
    const artifact = await newestArtifactAfter(ledgerDir, orderedAt);
    if (!artifact) {
      const overdue = now() - orderedAt;
      if (overdue >= deadlineMs) {
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
            `${parkMarker} — BLOCKED: context handoff for lane ${lane} (${pane.label}) produced no ` +
            `ledger artifact within ${deadlineMinutes} minutes of the order. The pane was NOT cleared. ` +
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
      }
      // Design step 3: no artifact → renotify (once, at half the deadline, at
      // a boundary), THEN the deadline parks.
      if (overdue >= deadlineMs / 2 && !cycle.renotifiedAt) {
        const boundary = paneBoundary(pane.label, execFn);
        if (boundary.state === "idle") {
          const renoticeMarker = `${cycle.orderMarker}-R2`;
          const delivery = deliverToPane({
            paneTitle: pane.label,
            message: renoticeMessage({ marker: renoticeMarker, lane }),
            marker: renoticeMarker,
            ...(exec ? { exec } : {}),
          });
          if (delivery.status === "delivered") {
            cycle.renotifiedAt = new Date(now()).toISOString();
            cycle.ordersSent += 1;
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
    if (boundary.state !== "idle") return { lane, status: "awaiting-handoff-done", boundary: boundary.state };
    const transcript = execFn(["capture-pane", "-p", "-t", boundary.pane, "-S", "-"]) ?? "";
    // The order itself contains the token once per delivery; the lane's reply
    // is any occurrence beyond those echoes (wrap-tolerant).
    const replies = countOccurrences(transcript.replaceAll("\n", ""), "HANDOFF-DONE");
    if (replies <= (cycle.ordersSent ?? 1)) return { lane, status: "awaiting-handoff-done" };

    // CLEAR: the wire sends the clear verb and verifies the fresh prompt on
    // the VISIBLE screen (tmux scrollback keeps history, so the visible
    // region — redrawn by the clear — is the honest witness).
    execFn(["send-keys", "-t", boundary.pane, "-l", clearCommand]);
    execFn(["send-keys", "-t", boundary.pane, "C-m"]);
    const visible = execFn(["capture-pane", "-p", "-t", boundary.pane]) ?? "";
    const flatVisible = visible.replaceAll("\n", "");
    if (flatVisible.includes(cycle.orderMarker) || !visible.includes("❯")) {
      return { lane, status: "clear-unverified" };
    }
    cycle.phase = "cleared";
    cycle.clearedAt = new Date(now()).toISOString();
    cycle.artifactPath = artifact.path;
    await persist();
    // Fall through: boot the fresh session in the same pass.
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
// writes), acts only on lanes named in the David-gated config, and returns []
// untouched-and-silent while the config says disabled.
export async function runHandoffSweep({
  configPath = join(homedir(), ".dg-autonomy", "handoff-config.json"),
  stateDir = join(homedir(), ".dg-context", "state"),
  receiptDir = join(homedir(), ".dg-autonomy"),
  ledgerDir = DEFAULT_LEDGER_DIR,
  exec,
  banner = defaultBanner,
  now = () => Date.now(),
} = {}) {
  const config = await readHandoffConfig(configPath);
  if (!config.enabled) return [];
  const execFn = exec ?? ((args) => defaultExec(args));

  let entries;
  try {
    entries = await readdir(stateDir);
  } catch {
    return [{ status: "state-dir-unreadable", stateDir }];
  }

  const results = [];
  for (const name of entries.filter((entry) => /^dynasty_\d+_\d+\.json$/.test(entry)).sort()) {
    const statePath = join(stateDir, name);
    let pane;
    try {
      pane = JSON.parse(await readFile(statePath, "utf8"));
    } catch {
      results.push({ statePath, status: "unreadable" });
      continue;
    }
    const lane = laneOf(pane);
    const laneConfig = lane ? config.lanes?.[lane] : undefined;
    if (!laneConfig) continue; // exempt seats never appear in the results
    results.push(
      await stepLane({ pane, lane, laneConfig, config, receiptDir, ledgerDir, exec, execFn, banner, now }),
    );
  }
  return results;
}
