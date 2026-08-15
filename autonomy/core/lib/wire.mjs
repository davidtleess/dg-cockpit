// The resume wire: lanes strand at turn boundaries — a reviewer files CLEAR
// and the implementer sits idle until a human notices. This wire watches the
// run record for that transition and delivers the wake itself. Built on
// David's word 2026-08-14 ("correct - thats what needs to be built").
//
// Laws:
// - The wire wakes; it never decides. The wake message carries the event and
//   the record path, no instructions beyond "proceed per contract".
// - One wake per event, forever: sent keys persist in a receipt sidecar, so
//   restarts and re-polls never double-wake.
// - Runaway is bounded by loop control itself: round caps and failure limits
//   are what make automated continuation safe to build at all.
// - Delivery is proven by marker-in-transcript, same as the docket clerk.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, rename, writeFile } from "node:fs/promises";

import { deliverToPane, findPaneByTitle } from "./docket.mjs";

const IMPLEMENTER_TITLE = "✳ claude";
const TOWER_TITLE = "🗼 tower";

// Which pane reviews which phase — the one obvious place to extend when a
// phase gains a different reviewer. A phase absent here never wakes anyone.
// Note: Tower's spec names "red-review", but the loop contract's phase is
// spelled "red" (contract.json loopControl.phases: framing, red,
// green-review); both spellings map so neither the spec's vocabulary nor the
// contract's can strand a round.
const REVIEWER_TITLES = {
  "green-review": "⬡ codex",
  "red-review": "⬡ codex",
  red: "⬡ codex",
};

// Grace before a reviewer wake: the implementer's own handover usually
// reaches the reviewer within moments of the round opening — the wake covers
// the strand, not the normal path. Ten minutes is long past any honest
// handover and short enough that a stranded round loses only one poll cycle
// of consequence.
const REVIEWER_GRACE_MS = 10 * 60 * 1000;

function wireReceiptPath(statePath) {
  return `${statePath}.wire.json`;
}

export async function readWireReceipt(statePath) {
  try {
    return JSON.parse(await readFile(wireReceiptPath(statePath), "utf8"));
  } catch {
    return { sent: {} };
  }
}

async function writeWireReceipt(statePath, receipt) {
  const temporary = `${wireReceiptPath(statePath)}.tmp-${process.pid}`;
  await writeFile(temporary, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
  await rename(temporary, wireReceiptPath(statePath));
}

// A wake is due when the run is ACTIVE and its newest closed round carries a
// reviewer CLEAR — the loop's own signal that the next move belongs to the
// implementer. Terminal runs are the docket clerk's or David's, never ours.
export function computeWake(run, { statePath }) {
  if (!run || run.terminalState) return null;
  const rounds = Array.isArray(run.reviewRounds) ? run.reviewRounds : [];
  const last = rounds.at(-1);
  if (!last || last.closedAt === null || last.reviewerVerdict !== "CLEAR") return null;
  const key = `clear:${last.phase}:${last.index}`;
  const marker = `WIRE-${createHash("sha256")
    .update(`${statePath}\0${key}`)
    .digest("hex")
    .slice(0, 8)}`;
  const message =
    `${marker} — RESUME WIRE: reviewer CLEAR recorded on ${last.phase} round ${last.index}. ` +
    `Run record: ${statePath}. The next move is the implementer's — proceed per the loop ` +
    `contract (advance, next round, or gate). Machinery-carried; no one authored this wake.`;
  return { key, marker, message, paneTitle: IMPLEMENTER_TITLE };
}

// A reviewer wake is due when the run is ACTIVE and its newest round has sat
// open with no verdict past the grace period — the reviewer-strand observed
// twice on 2026-08-15. Same laws as computeWake: the wire wakes, it never
// decides; no instruction beyond proceed-per-contract.
export function computeReviewerWake(run, { statePath }, { now = () => Date.now() } = {}) {
  if (!run || run.terminalState) return null;
  const rounds = Array.isArray(run.reviewRounds) ? run.reviewRounds : [];
  const last = rounds.at(-1);
  if (!last || last.closedAt !== null || last.reviewerVerdict != null) return null;
  const paneTitle = REVIEWER_TITLES[last.phase];
  if (!paneTitle) return null;
  const opened = Date.parse(last.openedAt ?? "");
  // No parseable openedAt means staleness is unprovable: fail closed (silent),
  // never nag on a guess.
  if (!Number.isFinite(opened) || now() - opened < REVIEWER_GRACE_MS) return null;
  const key = `review:${last.phase}:${last.index}`;
  const marker = `RVW-${createHash("sha256")
    .update(`${statePath}\0${key}`)
    .digest("hex")
    .slice(0, 8)}`;
  const message =
    `${marker} — REVIEWER WAKE: ${last.phase} round ${last.index} is open with no reviewer ` +
    `verdict. Run record: ${statePath}. The open round awaits your review verdict — proceed ` +
    `per the loop contract. Machinery-carried; no one authored this wake.`;
  return { key, marker, message, paneTitle };
}

// Never-interrupt boundary for the reviewer pane. paneBoundary (handoff.mjs)
// is Claude-specific — its composer glyph is "❯" — so a Codex pane would
// read "no-composer" forever. Choices here, per Tower's spec note:
// - An open dialog refuses (a paste would be swallowed) — same law as
//   deliverToPane.
// - /esc to interrupt/i refuses: it is Claude's generating banner, harmless
//   and cheap to honor for any pane that shows it.
// - A visible composer prompt ("❯" or "›") is required: no composer means
//   the pane is mid-render or not a TUI yet.
// - The Codex "Worked for Ns" header was REJECTED as a busy signal: it
//   persists in the visible transcript after a turn completes, so treating
//   it as busy would starve the wake forever. A Codex spinner has no stable
//   text to match; the dialog + composer checks are what is trivially and
//   safely detectable.
function reviewerBoundary(paneTitle, exec) {
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
  if (!tail.includes("❯") && !tail.includes("›")) return { state: "no-composer", pane };
  return { state: "idle", pane };
}

// A park is any terminal run: the machinery has stopped for David's word.
// The watcher informs — one banner, one notice into the remote-controlled
// Tower seat so the phone hears it — and never lifts anything itself.
// (Phone-command design, docs/2026-08-15-phone-command-design.md.)
export function computePark(run, { statePath }) {
  if (!run?.terminalState) return null;
  const key = `park:${run.terminalState}:${run.updatedAt ?? "unknown"}`;
  const marker = `PARK-${createHash("sha256")
    .update(`${statePath}\0${key}`)
    .digest("hex")
    .slice(0, 8)}`;
  const reason = run.reason ?? run.terminalState;
  // Cite the bench ONLY for judge-jurisdiction parks (loop-gate reasonCodes).
  // A stale judgeRuling from an earlier adjudication must never label a later
  // unrelated park — PARK-82b8f120 told David's phone "judge ruled STOP" about
  // an event no judge ever saw (Tower review, 2026-08-15).
  const ruling = run.reasonCodes?.length ? run.judgeRuling?.ruling : undefined;
  // Two-tier per Tower's review ruling 2026-08-15: both classes are parks whose
  // blocker is David's word, so both notify — but lock-screen triage must be
  // possible without opening anything. BLOCKED = stuck, his word un-sticks it.
  // READY = good news awaiting his gate word, act at leisure.
  const ready = run.terminalState === "READY_FOR_GATE";
  const lead = ready ? "READY" : "BLOCKED";
  const message = ready
    ? `${marker} — READY: ${reason}${ruling ? ` (judge ruled ${ruling})` : ""} — awaits your gate word. Record: ${statePath}. Machinery-carried notice.`
    : `${marker} — BLOCKED: ${reason}${ruling ? ` (judge ruled ${ruling})` : ""}. Record: ${statePath}. Machinery-carried notice — nothing moves until David's word.`;
  const banner = ready
    ? `${reason}${ruling ? ` — judge ruled ${ruling}` : ""} — awaits your gate word`
    : `${reason}${ruling ? ` — judge ruled ${ruling}` : ""} — your word un-sticks it`;
  const bannerTitle = ready ? "Dynasty READY" : "Dynasty BLOCKED";
  return { key, marker, lead, message, banner, bannerTitle, paneTitle: TOWER_TITLE };
}

function defaultBanner(text, title = "Dynasty cockpit") {
  const safe = text.replaceAll('"', "'");
  const safeTitle = title.replaceAll('"', "'");
  execFileSync("osascript", ["-e", `display notification "${safe}" with title "${safeTitle}"`], {
    timeout: 4000,
  });
}

// Banner refire law (Tower ruling): first attempt banners; while the park
// stays undeliverable to the seat, re-banner at most every 15 minutes —
// three banners a minute trains David to ignore the channel, banner-once
// risks losing the moment across a daemon restart. Pane retry every poll.
const BANNER_REFIRE_MS = 15 * 60 * 1000;

export async function runWire(statePaths, { exec, banner = defaultBanner, now = () => Date.now() } = {}) {
  const results = [];
  for (const statePath of statePaths) {
    let run;
    try {
      run = JSON.parse(await readFile(statePath, "utf8"));
    } catch {
      results.push({ statePath, status: "unreadable" });
      continue;
    }
    const park = computePark(run, { statePath });
    if (park) {
      // Transition-based dedupe (Tower review, third notice for one event):
      // David is notified when a run ENTERS a terminal state — never because
      // the record's write clock moved. lastPark survives bookkeeping writes;
      // it resets only when the run is observed non-terminal in between.
      const receipt = await readWireReceipt(statePath);
      const samePark = receipt.lastPark?.terminalState === run.terminalState;
      if (samePark && receipt.lastPark.delivered) {
        results.push({ statePath, status: "already-notified", key: park.key });
        continue;
      }
      const next = samePark ? { ...receipt.lastPark } : { terminalState: run.terminalState };
      const lastBanner = samePark && next.bannerAt ? Date.parse(next.bannerAt) : 0;
      let receiptDirty = false;
      if (now() - lastBanner >= BANNER_REFIRE_MS) {
        try {
          banner(park.banner, park.bannerTitle);
        } catch {
          // Banner is best-effort on top; seat delivery below is the recorded fact.
        }
        next.bannerAt = new Date(now()).toISOString();
        receiptDirty = true;
      }
      const delivery = deliverToPane({
        paneTitle: park.paneTitle,
        message: park.message,
        marker: park.marker,
        ...(exec ? { exec } : {}),
      });
      // Record delivered ONLY on verified delivery — a failed park delivery
      // retries next poll, never silenced by one bad attempt.
      if (delivery.status === "delivered") {
        next.delivered = true;
        next.notifiedAt = new Date(now()).toISOString();
        receiptDirty = true;
      }
      if (receiptDirty) {
        receipt.lastPark = next;
        await writeWireReceipt(statePath, receipt);
      }
      results.push({ statePath, status: delivery.status === "delivered" ? "parked-notified" : "park-retry", key: park.key, seat: delivery.status });
      continue;
    }
    // Non-terminal observation: any previous park is genuinely over; clear it
    // so the NEXT transition into terminal notifies even if the state string
    // repeats.
    if ((await readWireReceipt(statePath)).lastPark) {
      const receipt = await readWireReceipt(statePath);
      delete receipt.lastPark;
      await writeWireReceipt(statePath, receipt);
    }
    const wake = computeWake(run, { statePath });
    if (wake) {
      const receipt = await readWireReceipt(statePath);
      if (receipt.sent[wake.key]) {
        results.push({ statePath, status: "already-woken", key: wake.key });
        continue;
      }
      const delivery = deliverToPane({
        paneTitle: wake.paneTitle,
        message: wake.message,
        marker: wake.marker,
        ...(exec ? { exec } : {}),
      });
      if (delivery.status === "delivered") {
        receipt.sent[wake.key] = new Date().toISOString();
        await writeWireReceipt(statePath, receipt);
      }
      results.push({ statePath, key: wake.key, ...delivery });
      continue;
    }
    // Reviewer wake: a round stranded open past the grace period. Same
    // receipt dedupe as the CLEAR wake; recorded ONLY on verified delivery
    // (the park lesson — a failed delivery retries, never silences); and the
    // never-interrupt law holds — a busy reviewer pane skips this poll and
    // the next poll tries again.
    const reviewerWake = computeReviewerWake(run, { statePath }, { now });
    if (!reviewerWake) {
      results.push({ statePath, status: "no-wake-due" });
      continue;
    }
    const receipt = await readWireReceipt(statePath);
    if (receipt.sent[reviewerWake.key]) {
      results.push({ statePath, status: "already-woken", key: reviewerWake.key });
      continue;
    }
    const execFn = exec ?? ((args) => execFileSync("tmux", args, { encoding: "utf8", timeout: 4000 }));
    const boundary = reviewerBoundary(reviewerWake.paneTitle, execFn);
    if (boundary.state !== "idle") {
      results.push({ statePath, status: "reviewer-busy", key: reviewerWake.key, boundary: boundary.state });
      continue;
    }
    const delivery = deliverToPane({
      paneTitle: reviewerWake.paneTitle,
      message: reviewerWake.message,
      marker: reviewerWake.marker,
      ...(exec ? { exec } : {}),
    });
    if (delivery.status === "delivered") {
      receipt.sent[reviewerWake.key] = new Date(now()).toISOString();
      await writeWireReceipt(statePath, receipt);
    }
    results.push({ statePath, key: reviewerWake.key, ...delivery });
  }
  return results;
}
