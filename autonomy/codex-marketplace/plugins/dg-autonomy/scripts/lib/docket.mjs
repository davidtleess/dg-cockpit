// The docket clerk: carries a fired loop-control gate to the judge pane so no
// human — Tower included — is a single point of failure on the courthouse
// door. Built on David's word 2026-08-14 after "well what if you're not
// around?".
//
// Laws (each one earned in production):
// - Jurisdiction is the loop-gate reason codes ONLY. A check-failure block has
//   no codes and parks for David; the judge can never override verification.
// - The docket is machinery-composed: trigger + record path, never a lane's
//   framing of its case.
// - Delivery is proven only by marker-in-transcript, tolerant of line wrap.
// - An open dialog swallows pastes: refuse, record, let the sweep retry.
// - A verified receipt is final: never deliver the same firing twice.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, rename, writeFile } from "node:fs/promises";

const LOOP_GATE_CODES = new Set([
  "PHASE_ROUND_CAP",
  "RUN_ROUND_CAP",
  "DIMINISHING_RETURNS",
]);

const JUDGE_TITLE = "⚖ judge";

export function needsDocket(run) {
  if (!run?.terminalState) return false;
  const codes = Array.isArray(run.reasonCodes) ? run.reasonCodes : [];
  return codes.some((code) => LOOP_GATE_CODES.has(code));
}

export function composeDocket(run, { statePath }) {
  const codes = (run.reasonCodes ?? []).filter((code) => LOOP_GATE_CODES.has(code));
  const marker = `ADJ-${createHash("sha256")
    .update(`${statePath}\0${run.updatedAt ?? ""}\0${codes.join(",")}`)
    .digest("hex")
    .slice(0, 8)}`;
  const message =
    `⚖ DOCKET ${marker} — ADJUDICATION_REQUIRED (${codes.join(", ")}). ` +
    `Run record: DG_AUTONOMY_STATE=${statePath} · worktree ${run.worktree ?? "unknown"}. ` +
    `Per your charter: bootstrap from source, re-run what must be re-run, rule SHIP or STOP ` +
    `via the adjudicate verb with pins. This docket is machinery-carried; no lane authored it ` +
    `and no position rides with it.`;
  return { marker, message };
}

function defaultExec(args) {
  return execFileSync("tmux", args, { encoding: "utf8", timeout: 4000 });
}

function receiptPath(statePath) {
  return `${statePath}.docket.json`;
}

export async function readReceipt(statePath) {
  try {
    return JSON.parse(await readFile(receiptPath(statePath), "utf8"));
  } catch {
    return null;
  }
}

async function writeReceipt(statePath, receipt) {
  const temporary = `${receiptPath(statePath)}.tmp-${process.pid}`;
  await writeFile(temporary, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
  await rename(temporary, receiptPath(statePath));
  return receipt;
}

function findJudgePane(exec) {
  const listing = exec(["list-panes", "-a", "-F", "#{pane_id} #{pane_title}"]) ?? "";
  for (const line of listing.split("\n")) {
    const separator = line.indexOf(" ");
    if (separator === -1) continue;
    if (line.slice(separator + 1).trim().startsWith(JUDGE_TITLE)) {
      return line.slice(0, separator);
    }
  }
  return null;
}

export async function deliverDocket({ statePath, run, exec = defaultExec, now = () => new Date().toISOString() }) {
  const existing = await readReceipt(statePath);
  if (existing?.status === "delivered" && existing.verified) {
    return { status: "already-delivered", marker: existing.marker };
  }
  const attempts = (existing?.attempts ?? 0) + 1;
  const { marker, message } = composeDocket(run, { statePath });

  const fail = async (error) => {
    await writeReceipt(statePath, {
      status: "failed",
      error,
      marker,
      attempts,
      lastAttemptAt: now(),
    });
    return { status: "failed", error, marker };
  };

  let pane;
  try {
    pane = findJudgePane(exec);
  } catch (error) {
    return fail(`tmux unavailable: ${error.message}`);
  }
  if (!pane) return fail("no judge pane with the ⚖ judge title");

  const tail = exec(["capture-pane", "-p", "-t", pane]) ?? "";
  if (tail.includes("Do you want to proceed?")) {
    return fail("open dialog in the judge pane; a paste would be discarded");
  }

  exec(["send-keys", "-t", pane, "-l", message]);
  exec(["send-keys", "-t", pane, "C-m"]);

  const transcript = exec(["capture-pane", "-p", "-t", pane, "-S", "-"]) ?? "";
  const verified = transcript.replaceAll("\n", "").includes(marker);
  if (!verified) return fail("marker not found in the judge transcript after send");

  await writeReceipt(statePath, {
    status: "delivered",
    verified: true,
    marker,
    pane,
    attempts,
    deliveredAt: now(),
  });
  return { status: "delivered", verified: true, marker, pane };
}

export async function sweepDockets(statePaths, { exec = defaultExec } = {}) {
  const results = [];
  for (const statePath of statePaths) {
    let run;
    try {
      run = JSON.parse(await readFile(statePath, "utf8"));
    } catch {
      results.push({ statePath, status: "unreadable" });
      continue;
    }
    if (!needsDocket(run)) {
      results.push({ statePath, status: "out-of-jurisdiction" });
      continue;
    }
    const result = await deliverDocket({ statePath, run, exec });
    results.push({ statePath, ...result });
  }
  return results;
}
