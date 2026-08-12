#!/usr/bin/env node

// Dynasty-bounded replacement for the vendored ASW Stop hook.
//
// The pinned upstream (`asw-stop-check.mjs`, ASW 0.2.4) emits
// `decision: "continue"` whenever background work is not idle, without bound
// and without consulting run state — the exact unbounded-continuation defect
// the loop-control spec removes (F14). This script preserves upstream
// behavior byte-for-byte when no Dynasty autonomy run is in scope (F16), and
// refuses continuation the moment the run is terminal or loop control says a
// human gate is required. Unreadable state in a run context fails closed to
// no-continue (F15). It must return fast and never hang.

import { loadContract } from "../lib/policy.mjs";
import { loopVerdict } from "../lib/loop-control.mjs";
import { readRunSnapshotSync } from "../lib/run-state.mjs";

async function readStandardInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return chunks.join("");
}

// Mirrors the pinned vendor's asw-redact.mjs safeMode() exactly.
function safeMode(payload = {}) {
  return /^(1|true|yes)$/i.test(String(process.env.ASW_SAFE_MODE ?? ""))
    || payload.aswSafeMode === true
    || payload.safeMode === true
    || payload.settings?.aswSafeMode === true
    || payload.settings?.safeMode === true;
}

function emit(payload) {
  process.stdout.write(JSON.stringify(payload));
}

async function main() {
  let payload = {};
  try {
    payload = JSON.parse(await readStandardInput() || "{}");
  } catch {
    payload = {};
  }

  if (safeMode(payload)) {
    emit({ decision: "" });
    return;
  }

  const snapshot = readRunSnapshotSync({ cwd: payload.cwd ?? process.cwd() });
  if (snapshot.status === "corrupt") {
    emit({ decision: "", reason: "Dynasty loop control: run state unreadable — failing closed; no continuation." });
    return;
  }
  if (snapshot.status === "ok") {
    const contract = await loadContract();
    const verdict = loopVerdict(snapshot.run, contract);
    if (snapshot.run.terminalState || verdict.status === "ADJUDICATION_REQUIRED") {
      const codes = verdict.reasons.length > 0 ? verdict.reasons.join(", ") : snapshot.run.reason ?? "terminal";
      emit({ decision: "", reason: `Dynasty loop control: ADJUDICATION REQUIRED — routes to the judge; David remains above (${codes}). No continuation.` });
      return;
    }
  }

  if (payload.fullyIdle === false) {
    emit({
      decision: "continue",
      reason: "Antigravity Swarm detected active background work. Continue until spawned work is idle, verified, and cleaned up.",
    });
    return;
  }
  emit({ decision: "" });
}

main().catch(() => emit({ decision: "" }));
