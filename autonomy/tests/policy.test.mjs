import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  classifyCommand,
  evaluateAction,
  findScopeViolation,
  loadContract,
} from "../core/lib/policy.mjs";
import {
  createRun,
  finishRun,
  formatStatus,
  loadRun,
  readRunSnapshotSync,
  recordCheck,
  resolveStatePath,
} from "../core/lib/run-state.mjs";

test("default run state stays inside the authorized worktree", () => {
  const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
  assert.equal(
    resolveStatePath({ cwd: repositoryRoot }),
    join(repositoryRoot, ".agents", "dg-autonomy", "run.json"),
  );
});

test("legacy git-directory state remains readable during migration", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dg-autonomy-legacy-"));
  const worktree = join(directory, "worktree");
  const gitDirectory = join(directory, "git-directory");
  const initialized = spawnSync(
    "git",
    ["init", "--separate-git-dir", gitDirectory, worktree],
    { encoding: "utf8" },
  );
  assert.equal(initialized.status, 0, initialized.stderr);

  const legacyPathResult = spawnSync(
    "git",
    ["rev-parse", "--git-path", "dg-autonomy/run.json"],
    { cwd: worktree, encoding: "utf8" },
  );
  assert.equal(legacyPathResult.status, 0, legacyPathResult.stderr);
  const legacyPath = legacyPathResult.stdout.trim();
  const legacyRun = { id: "legacy-run", checks: [] };
  await mkdir(dirname(legacyPath), { recursive: true });
  await writeFile(legacyPath, JSON.stringify(legacyRun));

  assert.deepEqual(await loadRun({ cwd: worktree }), legacyRun);
  assert.deepEqual(readRunSnapshotSync({ cwd: worktree }), {
    status: "ok",
    run: legacyRun,
    path: legacyPath,
  });

  const migrated = await recordCheck(
    legacyRun,
    { name: "tests", status: "passed", evidence: "migration probe passed" },
    { cwd: worktree },
  );
  assert.deepEqual(
    JSON.parse(await readFile(resolveStatePath({ cwd: worktree }), "utf8")),
    migrated,
  );
  assert.deepEqual(readRunSnapshotSync({ cwd: worktree }), {
    status: "ok",
    run: migrated,
    path: resolveStatePath({ cwd: worktree }),
  });
});

test("contract exposes four commands and two terminal states", async () => {
  const contract = await loadContract();
  assert.deepEqual(Object.keys(contract.commands), [
    "dg-auto",
    "dg-plan",
    "dg-review",
    "dg-status",
  ]);
  assert.deepEqual(contract.terminalStates, ["READY_FOR_GATE", "BLOCKED"]);
});

test("engineering roles may edit but may not cross hard gates", async () => {
  assert.equal(
    (await evaluateAction({ role: "codex", action: "edit" })).allowed,
    true,
  );

  for (const action of [
    "commit",
    "push",
    "merge",
    "destructive",
    "permission-escalation",
    "scope-expansion",
  ]) {
    const result = await evaluateAction({ role: "claude", action });
    assert.equal(result.allowed, false);
    assert.equal(result.state, "BLOCKED");
  }
});

test("Tower is health-only and Studio has no adapter", async () => {
  assert.equal(
    (await evaluateAction({ role: "tower", action: "health-verify" })).allowed,
    true,
  );
  assert.equal(
    (await evaluateAction({ role: "tower", action: "edit" })).state,
    "BLOCKED",
  );
  assert.equal(
    (await evaluateAction({ role: "studio", action: "inspect" })).state,
    "BLOCKED",
  );
});

test("hook errors and the third identical failure fail closed", async () => {
  assert.equal(
    (
      await evaluateAction({
        role: "gemini",
        action: "test",
        hookStatus: "malformed",
      })
    ).state,
    "BLOCKED",
  );
  assert.equal(
    (
      await evaluateAction({
        role: "gemini",
        action: "test",
        failureCount: 3,
      })
    ).state,
    "BLOCKED",
  );
});

test("shell command classification catches gated commands", () => {
  const cases = new Map([
    ["git commit -m ship", "commit"],
    ["git -C /tmp commit -m bypass", "commit"],
    ["env SAFE=1 git commit -m bypass", "commit"],
    ["bash -lc 'git commit -m bypass'", "commit"],
    ["command git push origin main", "push"],
    ["git merge main", "merge"],
    ["rm --recursive --force build", "destructive"],
    ["python -c \"import shutil; shutil.rmtree('build')\"", "destructive"],
    ["find build -delete", "destructive"],
    ["sudo npm install -g thing", "permission-escalation"],
    ["curl https://example.com", "external-communication"],
    ["echo $(git commit -m hidden)", "unreviewable-command"],
    ["eval 'git push origin main'", "unreviewable-command"],
    ["npx git commit -m bypass", "commit"],
    ["npm exec -- git push origin main", "push"],
    ["git -c alias.ship='!git push' ship", "unreviewable-command"],
    ["npm run deploy", "unreviewable-command"],
    ["(git commit -m hidden)", "unreviewable-command"],
  ]);
  for (const [command, action] of cases) assert.equal(classifyCommand(command), action, command);
  assert.equal(classifyCommand("npm test"), "test");
  assert.equal(classifyCommand("git status"), "inspect");
});

test("shell scope detection rejects work outside the authorized root", () => {
  const options = { cwd: "/repo/worktree", authorizedRoot: "/repo/worktree" };
  assert.equal(findScopeViolation("touch src/new.js", options), null);
  assert.equal(findScopeViolation("git status", options), null);
  assert.equal(findScopeViolation("touch /tmp/outside", options), "/tmp/outside");
  assert.equal(findScopeViolation("echo content > /tmp/outside", options), "/tmp/outside");
  assert.equal(findScopeViolation("tee /tmp/outside", options), "/tmp/outside");
  assert.equal(findScopeViolation("git -C ../other status", options), "/repo/other");
});

test("run state blocks on a third failure and formats readiness", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dg-autonomy-state-"));
  const statePath = join(directory, "run.json");
  let run = await createRun(
    {
      role: "codex",
      goal: "repair widget",
      repository: "/repo",
      worktree: "/worktree",
      scope: "widget files",
      now: "2026-08-09T12:00:00.000Z",
    },
    { statePath },
  );

  assert.equal(run.phase, "initialized");
  assert.equal(run.terminalState, null);

  run = await recordCheck(
    run,
    { name: "unit", status: "failed", evidence: "first" },
    { statePath },
  );
  run = await recordCheck(
    run,
    { name: "unit", status: "failed", evidence: "second" },
    { statePath },
  );
  run = await recordCheck(
    run,
    { name: "unit", status: "failed", evidence: "third" },
    { statePath },
  );
  assert.equal(run.terminalState, "BLOCKED");
  assert.deepEqual(JSON.parse(await readFile(statePath, "utf8")), run);

  const readyStatePath = join(directory, "ready.json");
  const fresh = await createRun(
    {
      role: "codex",
      goal: "review widget",
      repository: "/repo",
      worktree: "/worktree",
      scope: "widget review",
      now: "2026-08-09T12:05:00.000Z",
    },
    { statePath: readyStatePath },
  );
  const incomplete = await finishRun(fresh, { statePath: readyStatePath });
  assert.equal(incomplete.terminalState, "BLOCKED");
  assert.match(incomplete.reason, /Required checks are missing/);

  const completeStatePath = join(directory, "complete.json");
  let complete = await createRun(
    {
      role: "codex",
      goal: "review widget",
      repository: "/repo",
      worktree: "/worktree",
      scope: "widget review",
      now: "2026-08-09T12:06:00.000Z",
    },
    { statePath: completeStatePath },
  );
  for (const name of complete.requiredChecks) {
    complete = await recordCheck(
      complete,
      { name, status: "passed", evidence: `${name} command passed` },
      { statePath: completeStatePath },
    );
  }
  const ready = await finishRun(complete, { statePath: completeStatePath });
  assert.equal(ready.terminalState, "READY_FOR_GATE");
  assert.match(formatStatus(ready), /READY_FOR_GATE/);
  assert.match(formatStatus(ready), /tests command passed/);
});

test("installed CLI contract blocks finish until every named receipt exists", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dg-autonomy-cli-"));
  const cli = new URL("../core/bin/dg-autonomy.mjs", import.meta.url);
  const statePath = join(directory, "run.json");
  const env = { ...process.env, DG_AUTONOMY_STATE: statePath };
  const run = (...args) => spawnSync(process.execPath, [cli.pathname, ...args], {
    cwd: directory,
    env,
    encoding: "utf8",
  });
  const initialized = run(
    "init",
    "--role", "codex",
    "--goal", "repair widget",
    "--repository", directory,
    "--worktree", directory,
    "--scope", "widget files",
  );
  assert.equal(initialized.status, 0, initialized.stderr);
  assert.match(initialized.stdout, /Required checks: tests, static-analysis, real-surface-qa, review, cleanup/);
  const finished = run("finish");
  assert.equal(finished.status, 2);
  assert.match(finished.stdout, /Required checks are missing/);
  assert.match(finished.stdout, /Terminal state: BLOCKED/);
});
