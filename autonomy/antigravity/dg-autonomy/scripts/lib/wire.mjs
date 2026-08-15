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

export async function runWire(statePaths, { exec } = {}) {
  const results = [];
  for (const statePath of statePaths) {
    let run;
    try {
      run = JSON.parse(await readFile(statePath, "utf8"));
    } catch {
      results.push({ statePath, status: "unreadable" });
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
