#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

import {
  classifyCommand,
  evaluateAction,
  findScopeViolation,
  isPathWithinScope,
} from "./lib/policy.mjs";

function deny(reason) {
  process.stdout.write(`${JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  })}\n`);
  process.exitCode = 2;
}

async function readInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return JSON.parse(chunks.join(""));
}

function patchTargets(patch) {
  return [...patch.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm)]
    .map((match) => match[1]);
}

async function main() {
  let event;
  try {
    event = await readInput();
  } catch {
    deny("Dynasty autonomy Codex hook failed closed");
    return;
  }
  const name = event?.tool_name;
  const input = event?.tool_input;
  const cwd = event?.cwd;
  if (typeof name !== "string" || !input || typeof input !== "object" || typeof cwd !== "string") {
    deny("Dynasty autonomy Codex hook received malformed input");
    return;
  }

  let authorizedRoot = process.env.DG_AUTONOMY_WORKTREE;
  if (!authorizedRoot) {
    try {
      authorizedRoot = execFileSync("git", ["-C", cwd, "rev-parse", "--show-toplevel"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
    } catch {
      deny("Dynasty autonomy requires an authorized git worktree");
      return;
    }
  }

  if (name === "Bash") {
    const command = input.command;
    if (typeof command !== "string") {
      deny("Dynasty autonomy command input is malformed");
      return;
    }
    const violation = findScopeViolation(command, { cwd, authorizedRoot });
    const result = await evaluateAction({
      role: "codex",
      action: violation ? "scope-expansion" : classifyCommand(command),
    });
    if (!result.allowed) deny(result.reason);
    return;
  }

  if (name === "apply_patch") {
    const patch = input.command;
    const targets = typeof patch === "string" ? patchTargets(patch) : [];
    if (targets.length === 0 || targets.some((target) => !isPathWithinScope(authorizedRoot, resolve(cwd, target)))) {
      deny("Requested patch leaves the authorized worktree or has no verifiable target");
    }
    return;
  }

  if (/^mcp__/.test(name)) {
    deny("MCP calls cross the external-communication gate during autonomous runs");
    return;
  }
  if (!["update_plan", "view_image", "request_user_input", "Agent"].includes(name)) {
    deny(`Tool is not in the Dynasty autonomy allowlist: ${name}`);
  }
}

main().catch(() => deny("Dynasty autonomy Codex hook failed closed"));
