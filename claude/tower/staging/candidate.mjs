#!/usr/bin/env node

import { resolve } from "node:path";
import { homedir } from "node:os";

import {
  classifyCommand,
  evaluateAction,
  findScopeViolation,
  isPathWithinScope,
  isReadOnlyCommand,
} from "./lib/policy.mjs";
import { readRunSnapshotSync } from "./lib/run-state.mjs";
import { appendFileSync } from "node:fs";
const __DBG = `${process.env.HOME}/.claude/tower/hook-debug.log`;
const __DBG_ON = !!process.env.DG_HOOK_DEBUG;
function __dbg(o){ if (!__DBG_ON) return; try { appendFileSync(__DBG, JSON.stringify(o) + "\n"); } catch {} }

function decision(value, reason) {
  __dbg({ at: new Date().toISOString(), phase: "decision", value, reason: reason ?? null });
  process.stdout.write(`${JSON.stringify({ decision: value, ...(reason ? { reason } : {}) })}\n`);
  if (value === "deny") process.exitCode = 2;
}

async function readInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return JSON.parse(chunks.join(""));
}

// Destination-key matching is CASE-INSENSITIVE on purpose.
// Antigravity/agy sends the destination as `TargetFile` (PascalCase). The original
// list held only file_path / path / target_file / targetFile, so no key ever matched
// an agy write: `targets` came back empty and EVERY agy write was denied with
// "has no verifiable target" — the scope check never ran at all. Established
// 2026-08-19 by logging the live hook payload (tool_arg_keys included TargetFile).
// Matching case-insensitively makes the scope check actually execute. It grants
// nothing that scope would otherwise refuse; an out-of-scope target still denies.
const TARGET_KEYS = new Set([
  "file_path", "filepath", "path", "target_file", "targetfile", "target_path", "targetpath",
]);

function pushTargets(out, obj) {
  if (!obj || typeof obj !== "object") return;
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string" && TARGET_KEYS.has(key.toLowerCase())) out.push(value);
  }
}

// ---------------------------------------------------------------------------
// Workspace-root resolution.
//
// agy/Antigravity reports ONE workspace as its root PLUS nested subdirectories:
//   ["/repo", "/repo/docs/agent-ledger"]
// The original `roots.length !== 1` test read that as ambiguous and denied EVERY
// agy tool call — reads, writes, localhost browser, all of it. Established
// 2026-08-19 by logging the live hook payload.
//
// Collapsing to the common ancestor fixes that, but must NEVER hand out a root
// broad enough to cover Studio's lane or the dotfiles. `$HOME` and `/` are
// ancestors of ~/frontend-studio (David's STANDING WALL TW29-WALL-35), ~/.ssh,
// ~/.gemini and ~/.claude. The pre-existing policy DID allow those when a single
// workspace entry of [$HOME] or [/] was supplied — measured as 3 failures in
// verify-tool-policy.sh against the unpatched file. The guard below closes that.
// A session legitimately rooted at $HOME must name a narrower scope explicitly
// via DG_AUTONOMY_WORKTREE.
// ---------------------------------------------------------------------------
const STUDIO_LANE = resolve(homedir(), "frontend-studio");
const FORBIDDEN_ROOTS = new Set([resolve("/"), resolve(homedir())]);

// Returns the single root a workspace denotes, or null meaning DENY:
// null when entries are genuinely disjoint, when the root is forbidden, or when
// the root would contain Studio's lane.
function collapseToSingleRoot(roots) {
  const resolved = roots
    .filter((r) => typeof r === "string" && r.length > 0)
    .map((r) => resolve(r));
  if (resolved.length === 0) return null;

  let root = resolved[0];
  for (const candidate of resolved) {
    if (candidate.length < root.length) root = candidate;
  }
  for (const candidate of resolved) {
    if (candidate !== root && !isPathWithinScope(root, candidate)) return null;
  }
  if (FORBIDDEN_ROOTS.has(root)) return null;
  if (root === STUDIO_LANE || isPathWithinScope(root, STUDIO_LANE)) return null;
  return root;
}

function fileTargets(name, args) {
  const targets = [];
  pushTargets(targets, args);
  for (const key of ["edits", "Edits"]) {
    if (Array.isArray(args?.[key])) for (const edit of args[key]) pushTargets(targets, edit);
  }
  const patch = typeof args?.patch === "string" ? args.patch
              : typeof args?.Patch === "string" ? args.Patch : null;
  if (patch) {
    for (const match of patch.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm)) {
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
  __dbg({ at: new Date().toISOString(), phase: "received",
    env_DG_AUTONOMY_WORKTREE: process.env.DG_AUTONOMY_WORKTREE ?? null,
    env_DG_AUTONOMY_STATE: process.env.DG_AUTONOMY_STATE ?? null,
    process_cwd: process.cwd(),
    event_cwd: event?.cwd ?? null,
    event_workspacePaths: event?.workspacePaths ?? null,
    tool: event?.toolCall?.name ?? null,
    tool_arg_keys: event?.toolCall?.args ? Object.keys(event.toolCall.args) : null,
    tool_args_preview: (()=>{ try { const a=event?.toolCall?.args??{}; const o={};
      for (const k of Object.keys(a)) { const v=a[k]; o[k]= typeof v==='string' ? v.slice(0,160) : v; }
      return o; } catch { return null; } })(),
    event_keys: event ? Object.keys(event) : null });
  const toolCall = event?.toolCall;
  const name = toolCall?.name;
  const args = toolCall?.args;
  const roots = process.env.DG_AUTONOMY_WORKTREE
    ? [process.env.DG_AUTONOMY_WORKTREE]
    : event?.workspacePaths;
  if (typeof name !== "string" || !args || typeof args !== "object" || !Array.isArray(roots) || roots.length === 0) {
    decision("deny", "Dynasty autonomy requires one explicit authorized workspace");
    return;
  }
  const authorizedRoot = collapseToSingleRoot(roots);
  if (!authorizedRoot) {
    decision("deny", "Dynasty autonomy requires one explicit authorized workspace");
    return;
  }
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
