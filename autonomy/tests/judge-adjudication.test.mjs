import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";

import { loadContract } from "../core/lib/policy.mjs";
import { blockRun, createRun } from "../core/lib/run-state.mjs";
import {
  adjudicateRun,
  applyLoopVerdict,
  closeRound,
  loopVerdict,
  openRound,
  recordFinding,
  referToJudge,
} from "../core/lib/loop-control.mjs";

const autonomyRoot = fileURLToPath(new URL("..", import.meta.url));
const claudeToolPolicy = join(autonomyRoot, "claude", "dg-engineering", "scripts", "pre-tool-use.mjs");

const SCOPE = ["src/app.mjs"];

async function makeRun() {
  const worktree = await mkdtemp(join(tmpdir(), "dg-judge-"));
  await mkdir(join(worktree, "src"), { recursive: true });
  await writeFile(join(worktree, "src", "app.mjs"), "line one\n");
  const statePath = join(await mkdtemp(join(tmpdir(), "dg-judge-state-")), "run.json");
  const options = { statePath };
  const run = await createRun(
    { role: "claude", goal: "goal", repository: "repo", worktree, scope: "scope" },
    options,
  );
  return { run, worktree, statePath, options };
}

function blocker() {
  return {
    severity: "BLOCKER",
    criterionId: "F-dispute-1",
    file: "src/app.mjs",
    summary: "disputed behavior",
    evidence: "probe output attached",
  };
}

// Drives the run into a judge-referred BLOCKED state before any cap.
async function referredRun() {
  const state = await makeRun();
  state.run = await openRound(state.run, { phase: "red", scope: SCOPE }, state.options);
  state.run = await recordFinding(state.run, { round: 1, ...blocker() }, state.options);
  state.run = await closeRound(state.run, { round: 1 }, state.options);
  state.run = await referToJudge(
    state.run,
    { by: "codex", reason: "severity dispute", evidence: "positions attached in round 1" },
    state.options,
  );
  const verdict = loopVerdict(state.run, await loadContract());
  state.run = await applyLoopVerdict(state.run, verdict, state.options);
  return state;
}

test("J1: early referral gates the run for adjudication before any cap", async () => {
  const state = await makeRun();
  state.run = await openRound(state.run, { phase: "red", scope: SCOPE }, state.options);
  state.run = await recordFinding(state.run, { round: 1, ...blocker() }, state.options);
  state.run = await closeRound(state.run, { round: 1 }, state.options);

  state.run = await referToJudge(
    state.run,
    { by: "claude", reason: "deadlocked on severity", evidence: "round 1 disposition attached" },
    state.options,
  );
  const verdict = loopVerdict(state.run, await loadContract());
  assert.equal(verdict.status, "ADJUDICATION_REQUIRED");
  assert.ok(verdict.reasons.includes("JUDGE_REFERRAL"));
});

test("J1b: a referral without evidence or reason fails closed", async () => {
  const state = await makeRun();
  state.run = await openRound(state.run, { phase: "red", scope: SCOPE }, state.options);
  await assert.rejects(
    referToJudge(state.run, { by: "claude", reason: "", evidence: "x" }, state.options),
    TypeError,
  );
  await assert.rejects(
    referToJudge(state.run, { by: "claude", reason: "r", evidence: "  " }, state.options),
    TypeError,
  );
});

test("J2: a SHIP ruling terminally resolves the gate and records the ruling with evidence and pins", async () => {
  const state = await referredRun();
  const ruled = await adjudicateRun(
    state.run,
    {
      ruling: "SHIP",
      evidence: "read both positions; reviewer BLOCKER does not reproduce under pinned fixture",
      pins: ["sha256-green-pin"],
    },
    state.options,
  );
  assert.equal(ruled.terminalState, "READY_FOR_GATE");
  assert.equal(ruled.judgeRuling.ruling, "SHIP");
  assert.match(ruled.judgeRuling.evidence, /does not reproduce/);
  assert.deepEqual(ruled.judgeRuling.pins, ["sha256-green-pin"]);
});

test("J3: a STOP ruling keeps the run blocked and parks it for David", async () => {
  const state = await referredRun();
  const ruled = await adjudicateRun(
    state.run,
    { ruling: "STOP", evidence: "neither position is safe to ship; park for David" },
    state.options,
  );
  assert.equal(ruled.terminalState, "BLOCKED");
  assert.ok(ruled.reasonCodes.includes("JUDGE_STOP"));
  assert.equal(ruled.judgeRuling.ruling, "STOP");
});

test("J4: the judge cannot override a verification-failure BLOCKED run", async () => {
  const state = await makeRun();
  const blocked = await blockRun(state.run, "tests failed 3 times", state.options);
  await assert.rejects(
    adjudicateRun(blocked, { ruling: "SHIP", evidence: "irrelevant" }, state.options),
    /loop-control/i,
  );
});

test("J5: adjudication fails closed on a bad ruling word, missing evidence, or an active run", async () => {
  const state = await referredRun();
  await assert.rejects(
    adjudicateRun(state.run, { ruling: "APPROVE", evidence: "x" }, state.options),
    TypeError,
  );
  await assert.rejects(
    adjudicateRun(state.run, { ruling: "SHIP", evidence: "" }, state.options),
    TypeError,
  );

  const active = await makeRun();
  await assert.rejects(
    adjudicateRun(active.run, { ruling: "SHIP", evidence: "x" }, active.options),
    /gate/i,
  );
});

test("J6: a second ruling on the same gate is refused — one gate, one ruling", async () => {
  const state = await referredRun();
  const ruled = await adjudicateRun(
    state.run,
    { ruling: "STOP", evidence: "parked" },
    state.options,
  );
  await assert.rejects(
    adjudicateRun(ruled, { ruling: "SHIP", evidence: "changed my mind" }, state.options),
    /already ruled/i,
  );
});

test("J7: after a SHIP ruling the hooks permit exactly commit — no edits, no push", async () => {
  const state = await referredRun();
  const ruled = await adjudicateRun(
    state.run,
    { ruling: "SHIP", evidence: "ship the pinned green", pins: ["pin"] },
    state.options,
  );
  await writeFile(state.statePath, JSON.stringify(ruled));

  const invoke = (payload) =>
    spawnSync(process.execPath, [claudeToolPolicy], {
      input: JSON.stringify(payload),
      encoding: "utf8",
      env: { ...process.env, DG_AUTONOMY_WORKTREE: state.worktree, DG_AUTONOMY_STATE: state.statePath },
      timeout: 15000,
    });

  const commit = invoke({
    tool_name: "Bash",
    tool_input: { command: "git commit -m 'ship per judge ruling'" },
    cwd: state.worktree,
  });
  assert.equal(commit.status, 0, commit.stdout);
  assert.ok(!commit.stdout.includes("deny"), `unexpected deny: ${commit.stdout}`);

  const push = invoke({
    tool_name: "Bash",
    tool_input: { command: "git push" },
    cwd: state.worktree,
  });
  assert.equal(push.status, 2);
  assert.match(push.stdout, /deny/);

  const edit = invoke({
    tool_name: "Write",
    tool_input: { file_path: join(state.worktree, "src", "app.mjs"), content: "x" },
    cwd: state.worktree,
  });
  assert.equal(edit.status, 2);
  assert.match(edit.stdout, /deny/);
});

test("J8: without a SHIP ruling, commit stays hard-gated even on a READY_FOR_GATE run", async () => {
  const state = await makeRun();
  const ready = {
    ...structuredClone(state.run),
    terminalState: "READY_FOR_GATE",
    reason: "checks complete",
  };
  await writeFile(state.statePath, JSON.stringify(ready));
  const commit = spawnSync(process.execPath, [claudeToolPolicy], {
    input: JSON.stringify({
      tool_name: "Bash",
      tool_input: { command: "git commit -m 'no ruling'" },
      cwd: state.worktree,
    }),
    encoding: "utf8",
    env: { ...process.env, DG_AUTONOMY_WORKTREE: state.worktree, DG_AUTONOMY_STATE: state.statePath },
    timeout: 15000,
  });
  assert.equal(commit.status, 2);
  assert.match(commit.stdout, /deny/);
});
