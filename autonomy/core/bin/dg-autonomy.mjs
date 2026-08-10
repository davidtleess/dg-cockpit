#!/usr/bin/env node

import {
  blockRun,
  createRun,
  finishRun,
  formatStatus,
  loadRun,
  recordCheck,
} from "../lib/run-state.mjs";
import { evaluateAction } from "../lib/policy.mjs";

function usage(message) {
  if (message) {
    process.stderr.write(`${message}\n`);
  }
  process.stderr.write(
    "Usage: dg-autonomy init|check-action|record-check|block|finish|status [--name value]\n",
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
  usage(`Unknown command: ${command ?? "none"}`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 64;
});
