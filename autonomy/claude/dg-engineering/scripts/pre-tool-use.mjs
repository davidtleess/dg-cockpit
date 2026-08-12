#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

import {
  classifyCommand,
  evaluateAction,
  findScopeViolation,
  isPathWithinScope,
  isReadOnlyCommand,
} from "./lib/policy.mjs";
import { readRunSnapshotSync } from "./lib/run-state.mjs";

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

  // Loop-control terminal deny (spec F18): once a run is terminal, only
  // read-only inspection may proceed until David's word. Corrupt state on an
  // existing run file fails closed.
  const runSnapshot = readRunSnapshotSync({ cwd });
  if (runSnapshot.status === "corrupt") {
    deny("Dynasty loop control: run state unreadable — failing closed");
    return;
  }
  // A judge SHIP ruling authorizes exactly the commit of the ruled content —
  // nothing else. Push and edits stay gated.
  const shipRuled =
    runSnapshot.status === "ok" &&
    runSnapshot.run?.terminalState === "READY_FOR_GATE" &&
    runSnapshot.run?.judgeRuling?.ruling === "SHIP";
  if (runSnapshot.status === "ok" && runSnapshot.run?.terminalState) {
    const readOnly = toolName === "Bash" && isReadOnlyCommand(input?.command ?? "");
    const shipCommit =
      shipRuled && toolName === "Bash" && classifyCommand(input?.command ?? "") === "commit";
    if (!readOnly && !shipCommit) {
      deny(
        `Dynasty loop control: run is terminal (${runSnapshot.run.terminalState}); only read-only inspection${shipRuled ? " and the judge-ruled commit" : ""} is permitted until David's word`,
      );
      return;
    }
  }
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

  if (action === "commit" && shipRuled) {
    // The judge's recorded SHIP ruling is the authorization for this commit;
    // scope was already checked above. Post-commit divergence audit remains
    // the reviewer's duty per governance 02.
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
