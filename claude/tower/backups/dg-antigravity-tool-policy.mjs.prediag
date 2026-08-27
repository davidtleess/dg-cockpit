#!/usr/bin/env node

import { resolve } from "node:path";

import {
  classifyCommand,
  evaluateAction,
  findScopeViolation,
  isPathWithinScope,
  isReadOnlyCommand,
} from "./lib/policy.mjs";
import { readRunSnapshotSync } from "./lib/run-state.mjs";

function decision(value, reason) {
  process.stdout.write(`${JSON.stringify({ decision: value, ...(reason ? { reason } : {}) })}\n`);
  if (value === "deny") process.exitCode = 2;
}

async function readInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return JSON.parse(chunks.join(""));
}

function fileTargets(name, args) {
  const targets = [];
  for (const key of ["file_path", "path", "target_file", "targetFile"]) {
    if (typeof args?.[key] === "string") targets.push(args[key]);
  }
  if (Array.isArray(args?.edits)) {
    for (const edit of args.edits) {
      if (typeof edit?.file_path === "string") targets.push(edit.file_path);
      if (typeof edit?.path === "string") targets.push(edit.path);
    }
  }
  if (name === "apply_patch" && typeof args?.patch === "string") {
    for (const match of args.patch.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm)) {
      targets.push(match[1]);
    }
  }
  return targets;
}

async function main() {
  let event;
  try {
    event = await readInput();
  } catch {
    decision("deny", "Dynasty autonomy tool hook failed closed");
    return;
  }
  const toolCall = event?.toolCall;
  const name = toolCall?.name;
  const args = toolCall?.args;
  const roots = process.env.DG_AUTONOMY_WORKTREE
    ? [process.env.DG_AUTONOMY_WORKTREE]
    : event?.workspacePaths;
  if (typeof name !== "string" || !args || typeof args !== "object" || !Array.isArray(roots) || roots.length !== 1) {
    decision("deny", "Dynasty autonomy requires one explicit authorized workspace");
    return;
  }
  const authorizedRoot = resolve(roots[0]);
  const cwd = resolve(event?.cwd ?? authorizedRoot);

  // Loop-control terminal deny (spec F18): once a run is terminal, only
  // read-only inspection may proceed until David's word. Corrupt state on an
  // existing run file fails closed.
  const runSnapshot = readRunSnapshotSync({ cwd });
  if (runSnapshot.status === "corrupt") {
    decision("deny", "Dynasty loop control: run state unreadable — failing closed");
    return;
  }
  const terminalRun = runSnapshot.status === "ok" && runSnapshot.run?.terminalState;
  if (terminalRun) {
    const readOnly =
      (/^(?:run_command|run_shell_command|Bash)$/i.test(name) && isReadOnlyCommand(args.command ?? "")) ||
      /^(?:read_file|view_file|list_directory|list_dir|grep_search|search_files|glob|get_errors|get_diagnostics)$/i.test(name);
    if (!readOnly) {
      decision(
        "deny",
        `Dynasty loop control: run is terminal (${runSnapshot.run.terminalState}); only read-only inspection is permitted until David's word`,
      );
      return;
    }
  }

  if (/^(?:run_command|run_shell_command|Bash)$/i.test(name)) {
    const command = args.command;
    if (typeof command !== "string") {
      decision("deny", "Dynasty autonomy command input is malformed");
      return;
    }
    const violation = findScopeViolation(command, { cwd, authorizedRoot });
    const result = await evaluateAction({
      role: "gemini",
      action: violation ? "scope-expansion" : classifyCommand(command),
    });
    decision(result.allowed ? "allow" : "deny", result.reason);
    return;
  }

  const writeTool = /^(?:write_to_file|write_file|replace_file_content|multi_replace_file_content|apply_patch|Write|Edit|MultiEdit)$/i.test(name);
  if (writeTool) {
    const targets = fileTargets(name, args);
    if (targets.length === 0 || targets.some((target) => !isPathWithinScope(authorizedRoot, resolve(cwd, target)))) {
      decision("deny", "Requested edit leaves the authorized worktree or has no verifiable target");
      return;
    }
    decision("allow");
    return;
  }

  if (/^(?:read_file|view_file|list_directory|list_dir|grep_search|search_files|glob|get_errors|get_diagnostics)$/i.test(name)) {
    decision("allow");
    return;
  }
  if (/browser/i.test(name)) {
    const url = Object.values(args).find((value) => typeof value === "string" && /^(?:https?|file):/.test(value));
    if (url && !/^(?:https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)|file:)/i.test(url)) {
      decision("deny", "Remote browser access crosses the external-communication gate");
      return;
    }
    decision("allow");
    return;
  }
  decision("deny", `Tool is not in the Dynasty autonomy allowlist: ${name}`);
}

main().catch(() => decision("deny", "Dynasty autonomy tool hook failed closed"));
