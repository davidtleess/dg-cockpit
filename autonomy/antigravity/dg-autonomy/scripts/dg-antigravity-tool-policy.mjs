#!/usr/bin/env node

import { homedir } from "node:os";
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
  // Antigravity reads policy denials from JSON; any nonzero status means the
  // hook process itself crashed and hides the decision reason from the agent.
  process.stdout.write(`${JSON.stringify({ decision: value, ...(reason ? { reason } : {}) })}\n`);
}

async function readInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return JSON.parse(chunks.join(""));
}

// Antigravity emits PascalCase destination keys such as TargetFile. Normalize
// key casing so valid in-worktree writes reach the scope check instead of
// being rejected as targetless.
const TARGET_KEYS = new Set([
  "file_path",
  "filepath",
  "path",
  "target_file",
  "targetfile",
  "target_path",
  "targetpath",
]);

function pushTargets(targets, value) {
  if (!value || typeof value !== "object") return;
  for (const [key, candidate] of Object.entries(value)) {
    if (typeof candidate === "string" && TARGET_KEYS.has(key.toLowerCase())) {
      targets.push(candidate);
    }
  }
}

function fileTargets(args) {
  const targets = [];
  pushTargets(targets, args);
  for (const key of ["edits", "Edits"]) {
    if (Array.isArray(args?.[key])) {
      for (const edit of args[key]) pushTargets(targets, edit);
    }
  }
  const patch = typeof args?.patch === "string"
    ? args.patch
    : typeof args?.Patch === "string"
      ? args.Patch
      : null;
  if (patch) {
    for (const match of patch.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm)) {
      targets.push(match[1]);
    }
  }
  return targets;
}

const COMMAND_KEYS = new Set(["command", "commandline", "command_line", "cmd"]);

function commandString(args) {
  if (!args || typeof args !== "object") return null;
  for (const [key, candidate] of Object.entries(args)) {
    if (typeof candidate === "string" && COMMAND_KEYS.has(key.toLowerCase())) {
      return candidate;
    }
  }
  return null;
}

const studioRoot = resolve(homedir(), "frontend-studio");
const forbiddenRoots = new Set([resolve("/"), resolve(homedir())]);

function collapseWorkspaceRoots(roots) {
  const resolved = roots
    .filter((root) => typeof root === "string" && root.length > 0)
    .map((root) => resolve(root));
  if (resolved.length === 0) return null;

  // Antigravity reports the repository root plus nested workspace folders.
  // Accept that shape only when one entry contains every other entry.
  const authorizedRoot = resolved.reduce(
    (shortest, candidate) => candidate.length < shortest.length ? candidate : shortest,
  );
  if (resolved.some((candidate) =>
    candidate !== authorizedRoot && !isPathWithinScope(authorizedRoot, candidate))) {
    return null;
  }
  if (forbiddenRoots.has(authorizedRoot)) return null;
  if (authorizedRoot === studioRoot || isPathWithinScope(authorizedRoot, studioRoot)) return null;
  return authorizedRoot;
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
  if (typeof name !== "string" || !args || typeof args !== "object" || !Array.isArray(roots)) {
    decision("deny", "Dynasty autonomy requires one explicit authorized workspace");
    return;
  }
  const authorizedRoot = collapseWorkspaceRoots(roots);
  if (!authorizedRoot) {
    decision("deny", "Dynasty autonomy requires one explicit authorized workspace");
    return;
  }
  const cwd = resolve(event?.cwd ?? authorizedRoot);
  if (!isPathWithinScope(authorizedRoot, cwd)) {
    decision("deny", "Dynasty autonomy current directory leaves the authorized workspace");
    return;
  }

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
      (/^(?:run_command|run_shell_command|Bash)$/i.test(name) && isReadOnlyCommand(commandString(args) ?? "")) ||
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
    const command = commandString(args);
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
    const targets = fileTargets(args);
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
