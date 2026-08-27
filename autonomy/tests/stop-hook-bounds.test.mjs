import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";

const autonomyRoot = fileURLToPath(new URL("..", import.meta.url));
const antigravityStop = join(autonomyRoot, "core", "scripts", "antigravity-stop-check.mjs");
const stopCheck = join(autonomyRoot, "core", "scripts", "stop-check.mjs");
const codexToolPolicy = join(autonomyRoot, "core", "scripts", "codex-tool-policy.mjs");
const claudeToolPolicy = join(autonomyRoot, "claude", "dg-engineering", "scripts", "pre-tool-use.mjs");
const antigravityToolPolicy = join(autonomyRoot, "core", "scripts", "antigravity-tool-policy.mjs");

function baseRun(overrides = {}) {
  return {
    schemaVersion: 3,
    id: "run-under-test",
    role: "claude",
    goal: "goal",
    repository: "repo",
    worktree: "/tmp/unused",
    scope: "scope",
    requiredChecks: [],
    phase: "verifying",
    checks: [],
    failureCounts: {},
    terminalState: null,
    reason: null,
    reasonCodes: [],
    reviewRounds: [],
    backlog: [],
    revision: 3,
    createdAt: "2026-08-12T00:00:00.000Z",
    updatedAt: "2026-08-12T00:00:00.000Z",
    ...overrides,
  };
}

function cappedRounds() {
  const rounds = [];
  for (let index = 1; index <= 5; index += 1) {
    rounds.push({
      phase: "red",
      index,
      openedAt: "2026-08-12T00:00:00.000Z",
      closedAt: "2026-08-12T00:10:00.000Z",
      reviewerVerdict: null,
      scope: ["src/app.mjs"],
      findings:
        index === 1
          ? [{
              id: "finding-1",
              severity: "BLOCKER",
              criterionId: "c-1",
              file: "src/app.mjs",
              summary: "still broken",
              evidence: "probe output",
              fingerprint: "aaaa",
              recordedInRound: 1,
              resolvedInRound: null,
            }]
          : [],
      churn: {
        filesChanged: 1,
        linesChanged: 20,
        openSnapshotHash: `open-${index}`,
        closeSnapshotHash: `close-${index}`,
      },
    });
  }
  return rounds;
}

async function stateDir() {
  const dir = await mkdtemp(join(tmpdir(), "dg-stop-"));
  return { dir, statePath: join(dir, "run.json") };
}

function invoke(script, payload, env = {}, worktree = "/tmp") {
  const result = spawnSync(process.execPath, [script], {
    input: typeof payload === "string" ? payload : JSON.stringify(payload),
    encoding: "utf8",
    env: { ...process.env, DG_AUTONOMY_WORKTREE: worktree, ...env },
    timeout: 15000,
  });
  return result;
}

test("F14: Antigravity stop hook never emits continue for a terminal or human-gate run", async () => {
  const { statePath } = await stateDir();
  await writeFile(
    statePath,
    JSON.stringify(baseRun({ terminalState: "BLOCKED", reason: "cap", reasonCodes: ["PHASE_ROUND_CAP"] })),
  );
  const terminal = invoke(antigravityStop, { fullyIdle: false }, { DG_AUTONOMY_STATE: statePath });
  assert.equal(terminal.status, 0);
  assert.ok(!terminal.stdout.includes('"continue"'), `unexpected continue: ${terminal.stdout}`);

  const gate = await stateDir();
  await writeFile(gate.statePath, JSON.stringify(baseRun({ reviewRounds: cappedRounds() })));
  const halted = invoke(antigravityStop, { fullyIdle: false }, { DG_AUTONOMY_STATE: gate.statePath });
  assert.equal(halted.status, 0);
  assert.ok(!halted.stdout.includes('"continue"'), `unexpected continue: ${halted.stdout}`);
});

test("F15: unreadable state in an autonomy-run context fails closed to no-continue", async () => {
  const { statePath } = await stateDir();
  await writeFile(statePath, "{corrupt json");
  const result = invoke(antigravityStop, { fullyIdle: false }, { DG_AUTONOMY_STATE: statePath });
  assert.equal(result.status, 0);
  assert.ok(!result.stdout.includes('"continue"'), `unexpected continue: ${result.stdout}`);
});

test("F16: without a run in scope, and for an active under-cap run, upstream continue behavior is preserved", async () => {
  const { dir } = await stateDir();
  const missing = invoke(antigravityStop, { fullyIdle: false }, { DG_AUTONOMY_STATE: join(dir, "absent.json") });
  assert.equal(missing.status, 0);
  assert.ok(missing.stdout.includes('"continue"'), `expected continue: ${missing.stdout}`);

  const safe = invoke(antigravityStop, { fullyIdle: false, safeMode: true }, { DG_AUTONOMY_STATE: join(dir, "absent.json") });
  assert.ok(!safe.stdout.includes('"continue"'), "safe mode must suppress continuation");

  const active = await stateDir();
  await writeFile(active.statePath, JSON.stringify(baseRun()));
  const underCap = invoke(antigravityStop, { fullyIdle: false }, { DG_AUTONOMY_STATE: active.statePath });
  assert.equal(underCap.status, 0);
  assert.ok(underCap.stdout.includes('"continue"'), `expected continue: ${underCap.stdout}`);
});

test("F22: the Claude/Codex stop hook never blocks a stop and never self-loops on stop_hook_active", async () => {
  const { statePath } = await stateDir();
  await writeFile(statePath, JSON.stringify(baseRun()));
  const active = invoke(stopCheck, { stop_hook_active: true }, { DG_AUTONOMY_STATE: statePath });
  assert.equal(active.status, 0);
  assert.ok(!active.stdout.includes('"block"'), `unexpected block: ${active.stdout}`);
  assert.ok(!active.stdout.includes('"continue"'), `unexpected continue: ${active.stdout}`);

  const gate = await stateDir();
  await writeFile(gate.statePath, JSON.stringify(baseRun({ reviewRounds: cappedRounds() })));
  const halted = invoke(stopCheck, { stop_hook_active: false }, { DG_AUTONOMY_STATE: gate.statePath });
  assert.equal(halted.status, 0);
  assert.ok(!halted.stdout.includes('"block"'), `unexpected block: ${halted.stdout}`);
  assert.match(halted.stdout, /HUMAN GATE|PHASE_ROUND_CAP/i);

  const corrupt = await stateDir();
  await writeFile(corrupt.statePath, "{nope");
  const failedClosed = invoke(stopCheck, { stop_hook_active: false }, { DG_AUTONOMY_STATE: corrupt.statePath });
  assert.equal(failedClosed.status, 0);
  assert.ok(!failedClosed.stdout.includes('"block"'), `unexpected block: ${failedClosed.stdout}`);
});

async function terminalStateFixture() {
  const worktree = await mkdtemp(join(tmpdir(), "dg-terminal-"));
  await mkdir(join(worktree, "src"), { recursive: true });
  await writeFile(join(worktree, "src", "app.mjs"), "line\n");
  await writeFile(join(worktree, "README.md"), "readme\n");
  const statePath = join(worktree, ".dg-state", "run.json");
  await mkdir(dirname(statePath), { recursive: true });
  await writeFile(
    statePath,
    JSON.stringify(baseRun({ terminalState: "BLOCKED", reason: "cap", reasonCodes: ["PHASE_ROUND_CAP"], worktree })),
  );
  return { worktree, statePath };
}

test("F18: Codex PreToolUse denies mutation on a terminal run but permits read-only inspection", async () => {
  const { worktree, statePath } = await terminalStateFixture();
  const env = { DG_AUTONOMY_STATE: statePath };

  const patch = invoke(
    codexToolPolicy,
    { tool_name: "apply_patch", tool_input: { command: "*** Update File: src/app.mjs\npatch" }, cwd: worktree },
    env,
    worktree,
  );
  assert.equal(patch.status, 2);
  assert.match(patch.stdout, /deny/);

  const mutate = invoke(
    codexToolPolicy,
    { tool_name: "Bash", tool_input: { command: "touch scratch.txt" }, cwd: worktree },
    env,
    worktree,
  );
  assert.equal(mutate.status, 2);
  assert.match(mutate.stdout, /deny/);

  const inspect = invoke(
    codexToolPolicy,
    { tool_name: "Bash", tool_input: { command: "cat README.md" }, cwd: worktree },
    env,
    worktree,
  );
  assert.equal(inspect.status, 0);
  assert.ok(!inspect.stdout.includes("deny"), `unexpected deny: ${inspect.stdout}`);
});

test("F18: Claude PreToolUse denies Write and mutating Bash on a terminal run but permits git status", async () => {
  const { worktree, statePath } = await terminalStateFixture();
  const env = { DG_AUTONOMY_STATE: statePath };

  const write = invoke(
    claudeToolPolicy,
    { tool_name: "Write", tool_input: { file_path: join(worktree, "src", "app.mjs"), content: "x" }, cwd: worktree },
    env,
    worktree,
  );
  assert.equal(write.status, 2);
  assert.match(write.stdout, /deny/);

  const mutate = invoke(
    claudeToolPolicy,
    { tool_name: "Bash", tool_input: { command: "touch scratch.txt" }, cwd: worktree },
    env,
    worktree,
  );
  assert.equal(mutate.status, 2);
  assert.match(mutate.stdout, /deny/);

  const inspect = invoke(
    claudeToolPolicy,
    { tool_name: "Bash", tool_input: { command: "git status" }, cwd: worktree },
    env,
    worktree,
  );
  assert.equal(inspect.status, 0);
  assert.ok(!inspect.stdout.includes("deny"), `unexpected deny: ${inspect.stdout}`);
});

test("F18: Antigravity PreToolUse denies write tools on a terminal run but permits read-only commands", async () => {
  const { worktree, statePath } = await terminalStateFixture();
  const env = { DG_AUTONOMY_STATE: statePath };

  const write = invoke(
    antigravityToolPolicy,
    { toolCall: { name: "write_to_file", args: { file_path: join(worktree, "src", "app.mjs") } }, cwd: worktree },
    env,
    worktree,
  );
  assert.equal(write.status, 0);
  assert.match(write.stdout, /deny/);

  const inspect = invoke(
    antigravityToolPolicy,
    { toolCall: { name: "run_command", args: { command: "ls src" } }, cwd: worktree },
    env,
    worktree,
  );
  assert.equal(inspect.status, 0);
  assert.match(inspect.stdout, /allow/);
});

test("terminal-state deny fails closed when the state file exists but cannot be parsed", async () => {
  const { worktree, statePath } = await terminalStateFixture();
  await writeFile(statePath, "{corrupt");
  const env = { DG_AUTONOMY_STATE: statePath };
  const write = invoke(
    claudeToolPolicy,
    { tool_name: "Write", tool_input: { file_path: join(worktree, "src", "app.mjs"), content: "x" }, cwd: worktree },
    env,
    worktree,
  );
  assert.equal(write.status, 2);
  assert.match(write.stdout, /deny/);
});
