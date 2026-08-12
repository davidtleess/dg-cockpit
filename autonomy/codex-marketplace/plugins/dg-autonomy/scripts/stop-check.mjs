#!/usr/bin/env node

// Dynasty loop-control Stop hook for Claude and Codex lanes.
//
// This hook NEVER blocks a stop and never emits a continuation decision —
// forcing continuation is exactly the unbounded-loop failure loop control
// exists to remove, and `stop_hook_active` payloads must never re-enter a
// loop (spec F22). Its only job is to surface the loop-control verdict as
// the lane's last word when a human gate is required. It must return fast
// and never hang: a hanging hook froze the Codex lane on 2026-08-12.

import { loadContract } from "./lib/policy.mjs";
import { loopVerdict } from "./lib/loop-control.mjs";
import { readRunSnapshotSync } from "./lib/run-state.mjs";

async function readStandardInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return chunks.join("");
}

function emit(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

async function main() {
  let payload = {};
  try {
    payload = JSON.parse(await readStandardInput() || "{}");
  } catch {
    payload = {};
  }

  const snapshot = readRunSnapshotSync({ cwd: payload.cwd ?? process.cwd() });
  if (snapshot.status === "corrupt") {
    emit({ systemMessage: "Dynasty loop control: run state unreadable — failing closed; no continuation." });
    return;
  }
  if (snapshot.status !== "ok") {
    emit({});
    return;
  }

  const contract = await loadContract();
  const verdict = loopVerdict(snapshot.run, contract);
  if (snapshot.run.terminalState || verdict.status === "ADJUDICATION_REQUIRED") {
    const codes = verdict.reasons.length > 0 ? verdict.reasons.join(", ") : snapshot.run.reason ?? "terminal";
    emit({ systemMessage: `Dynasty loop control: ADJUDICATION REQUIRED — routes to the judge; David remains above (${codes}). The loop stops here for David's decision.` });
    return;
  }
  emit({});
}

main().catch(() => emit({}));
