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
import { readFile, rename, writeFile } from "node:fs/promises";

import { deliverToPane } from "./docket.mjs";

const IMPLEMENTER_TITLE = "✳ claude";
const TOWER_TITLE = "🗼 tower";

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
  const ruling = run.judgeRuling?.ruling;
  const message =
    `${marker} — PARKED FOR DAVID: ${reason}${ruling ? ` (judge ruled ${ruling})` : ""}. ` +
    `Record: ${statePath}. Machinery-carried notice — nothing moves until David's word.`;
  const banner = `Dynasty parked for you: ${reason}${ruling ? ` — judge ruled ${ruling}` : ""}`;
  return { key, marker, message, banner, paneTitle: TOWER_TITLE };
}

function defaultBanner(text) {
  const safe = text.replaceAll('"', "'");
  execFileSync("osascript", ["-e", `display notification "${safe}" with title "Dynasty cockpit"`], {
    timeout: 4000,
  });
}

export async function runWire(statePaths, { exec, banner = defaultBanner } = {}) {
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
      const receipt = await readWireReceipt(statePath);
      if (receipt.sent[park.key]) {
        results.push({ statePath, status: "already-notified", key: park.key });
        continue;
      }
      try {
        banner(park.banner);
      } catch {
        // Banner is best-effort; the receipt still records only on success below.
      }
      const delivery = deliverToPane({
        paneTitle: park.paneTitle,
        message: park.message,
        marker: park.marker,
        ...(exec ? { exec } : {}),
      });
      receipt.sent[park.key] = new Date().toISOString();
      await writeWireReceipt(statePath, receipt);
      results.push({ statePath, status: "parked-notified", key: park.key, seat: delivery.status });
      continue;
    }
    const wake = computeWake(run, { statePath });
    if (!wake) {
      results.push({ statePath, status: "no-wake-due" });
      continue;
    }
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
  }
  return results;
}
