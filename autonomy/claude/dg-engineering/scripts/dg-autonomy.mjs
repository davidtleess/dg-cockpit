#!/usr/bin/env node

import {
  blockRun,
  createRun,
  finishRun,
  formatStatus,
  loadRun,
  recordCheck,
} from "./lib/run-state.mjs";
import { evaluateAction, loadContract } from "./lib/policy.mjs";
import {
  adjudicateRun,
  applyLoopVerdict,
  closeRound,
  loopVerdict,
  openRound,
  recordFinding,
  recordReviewerVerdict,
  resolveFinding,
} from "./lib/loop-control.mjs";

function usage(message) {
  if (message) {
    process.stderr.write(`${message}\n`);
  }
  process.stderr.write(
    "Usage: dg-autonomy init|check-action|record-check|block|finish|status|round-open|finding|resolve|reviewer-clear|round-close|verdict|adjudicate [--name value]\n",
  );
  process.exitCode = 64;
}

function parseArguments(values) {
  const result = {};
  for (let index = 0; index < values.length; index += 2) {
    const flag = values[index];
    const value = values[index + 1];
    if (!flag?.startsWith("--") || value === undefined) {
      throw new TypeError(`Malformed argument near ${flag ?? "end"}`);
    }
    result[flag.slice(2)] = value;
  }
  return result;
}

async function main() {
  const [command, ...values] = process.argv.slice(2);
  let args;
  try {
    args = parseArguments(values);
  } catch (error) {
    usage(error.message);
    return;
  }

  if (command === "init") {
    const run = await createRun({
      role: args.role,
      goal: args.goal,
      repository: args.repository,
      worktree: args.worktree,
      scope: args.scope,
    });
    process.stdout.write(`${formatStatus(run)}\n`);
    return;
  }
  if (command === "check-action") {
    const result = await evaluateAction({
      role: args.role,
      action: args.action,
      hookStatus: args["hook-status"] ?? "ok",
      failureCount: Number(args["failure-count"] ?? 0),
    });
    process.stdout.write(`${JSON.stringify(result)}\n`);
    if (!result.allowed) {
      process.exitCode = 2;
    }
    return;
  }
  if (command === "record-check") {
    const run = await recordCheck(await loadRun(), {
      name: args.name,
      status: args.status,
      evidence: args.evidence,
    });
    process.stdout.write(`${formatStatus(run)}\n`);
    if (run.terminalState === "BLOCKED") {
      process.exitCode = 2;
    }
    return;
  }
  if (command === "block") {
    const run = await blockRun(await loadRun(), args.reason);
    process.stdout.write(`${formatStatus(run)}\n`);
    process.exitCode = 2;
    return;
  }
  if (command === "finish") {
    const run = await finishRun(await loadRun());
    process.stdout.write(`${formatStatus(run)}\n`);
    if (run.terminalState === "BLOCKED") {
      process.exitCode = 2;
    }
    return;
  }
  if (command === "status") {
    process.stdout.write(`${formatStatus(await loadRun())}\n`);
    return;
  }
  if (command === "round-open") {
    const run = await openRound(await loadRun(), {
      phase: args.phase,
      scope: (args.scope ?? "").split(",").map((entry) => entry.trim()).filter(Boolean),
    });
    process.stdout.write(`Opened ${args.phase} round ${run.reviewRounds.at(-1).index}\n`);
    return;
  }
  if (command === "finding") {
    const run = await recordFinding(await loadRun(), {
      round: Number(args.round),
      severity: args.severity,
      criterionId: args.criterion,
      file: args.file,
      summary: args.summary,
      evidence: args.evidence,
    });
    const round = run.reviewRounds.at(-1);
    process.stdout.write(`Recorded ${args.severity} ${round.findings.at(-1).id}\n`);
    return;
  }
  if (command === "resolve") {
    await resolveFinding(await loadRun(), {
      findingId: args.finding,
      round: Number(args.round),
    });
    process.stdout.write(`Resolved ${args.finding} in round ${args.round}\n`);
    return;
  }
  if (command === "reviewer-clear") {
    await recordReviewerVerdict(await loadRun(), {
      round: Number(args.round),
      evidence: args.evidence,
    });
    process.stdout.write(`Reviewer CLEAR recorded on round ${args.round}\n`);
    return;
  }
  if (command === "round-close") {
    const run = await closeRound(await loadRun(), { round: Number(args.round) });
    const round = run.reviewRounds.findLast((candidate) => candidate.index === Number(args.round));
    process.stdout.write(
      `Closed round ${args.round}: ${round.churn.linesChanged} line(s) across ${round.churn.filesChanged} file(s)\n`,
    );
    return;
  }
  if (command === "verdict") {
    let run = await loadRun();
    const verdict = loopVerdict(run, await loadContract());
    if (args.apply === "true" && verdict.status === "ADJUDICATION_REQUIRED") {
      run = await applyLoopVerdict(run, verdict);
    }
    process.stdout.write(`${JSON.stringify(verdict)}\n`);
    if (verdict.status === "ADJUDICATION_REQUIRED") {
      process.exitCode = 2;
    }
    return;
  }
  if (command === "adjudicate") {
    const run = await adjudicateRun(await loadRun(), {
      ruling: args.ruling,
      evidence: args.evidence,
      pins: args.pins ? args.pins.split(",").map((pin) => pin.trim()).filter(Boolean) : undefined,
    });
    process.stdout.write(`Judge ruling recorded: ${run.judgeRuling.ruling} — ${run.reason}\n`);
    if (run.judgeRuling.ruling === "STOP") {
      process.exitCode = 2;
    }
    return;
  }
  usage(`Unknown command: ${command ?? "none"}`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 64;
});
