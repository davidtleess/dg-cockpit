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
  process.stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    })}\n`,
  );
  process.exitCode = 2;
}

async function readStandardInput() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return chunks.join("");
}

async function main() {
  let event;
  try {
    event = JSON.parse(await readStandardInput());
  } catch {
    deny("Dynasty autonomy hook failed closed");
    return;
  }

  const toolName = event?.tool_name;
  const input = event?.tool_input;
  const cwd = event?.cwd ?? process.cwd();
  let authorizedRoot = process.env.DG_AUTONOMY_WORKTREE;
  if (!authorizedRoot) {
    try {
      authorizedRoot = execFileSync(
        "git",
        ["-C", cwd, "rev-parse", "--show-toplevel"],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      ).trim();
    } catch {
      deny("Dynasty autonomy requires an authorized git worktree");
      return;
    }
  }
  let action;
  if (toolName === "Bash") {
    if (typeof input?.command !== "string" || input.command.trim() === "") {
      deny("Dynasty autonomy hook failed closed");
      return;
    }
    action = classifyCommand(input.command);
    const scopeViolation = findScopeViolation(input.command, {
      cwd,
      authorizedRoot,
    });
    if (scopeViolation) {
      deny(`Requested command leaves the authorized worktree: ${scopeViolation}`);
      return;
    }
  } else if (["Write", "Edit", "MultiEdit"].includes(toolName)) {
    if (typeof input?.file_path !== "string" || input.file_path.trim() === "") {
      deny("Dynasty autonomy hook failed closed");
      return;
    }
    const target = resolve(cwd, input.file_path);
    if (!isPathWithinScope(authorizedRoot, target)) {
      deny(`Requested edit leaves the authorized worktree: ${target}`);
      return;
    }
    action = "edit";
  } else {
    deny("Dynasty autonomy hook failed closed");
    return;
  }

  const result = await evaluateAction({ role: "claude", action });
  if (!result.allowed) {
    deny(result.reason);
  }
}

main().catch(() => {
  deny("Dynasty autonomy hook failed closed");
});
