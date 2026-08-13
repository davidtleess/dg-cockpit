import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

import { loadContract } from "../core/lib/policy.mjs";
import { blockRun, createRun } from "../core/lib/run-state.mjs";
import * as loopControl from "../core/lib/loop-control.mjs";

const {
  adjudicateRun,
  applyLoopVerdict,
  closeRound,
  loopVerdict,
  openRound,
  recordFinding,
} = loopControl;

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

// Drives the run to the QUANTIFIABLE gate: 5 closed rounds in one phase with
// an unresolved BLOCKER — the only way (besides the run cap and diminishing
// returns) a case can ever reach the judge.
async function cappedRun() {
  const state = await makeRun();
  const contract = await loadContract();
  for (let round = 1; round <= contract.loopControl.phaseRoundCap; round += 1) {
    state.run = await openRound(state.run, { phase: "red", scope: SCOPE }, state.options);
    if (round === 1) {
      state.run = await recordFinding(state.run, { round: 1, ...blocker() }, state.options);
    }
    state.run = await closeRound(state.run, { round }, state.options);
  }
  const verdict = loopVerdict(state.run, contract);
  assert.equal(verdict.status, "ADJUDICATION_REQUIRED");
  assert.ok(verdict.reasons.includes("PHASE_ROUND_CAP"));
  state.run = await applyLoopVerdict(state.run, verdict, state.options);
  assert.equal(state.run.terminalState, "BLOCKED");
  return state;
}

test("J1: routing is purely quantifiable — no referral surface exists and legacy referral fields carry no weight", async () => {
  assert.ok(!("referToJudge" in loopControl), "referToJudge must not exist");

  const state = await makeRun();
  state.run = await openRound(state.run, { phase: "red", scope: SCOPE }, state.options);
  state.run = await recordFinding(state.run, { round: 1, ...blocker() }, state.options);
  state.run = await closeRound(state.run, { round: 1 }, state.options);

  const legacy = { ...structuredClone(state.run), judgeReferral: { by: "codex", reason: "x", evidence: "y" } };
  const verdict = loopVerdict(legacy, await loadContract());
  assert.equal(verdict.status, "CONTINUE");
  assert.ok(!verdict.reasons.includes("JUDGE_REFERRAL"));
});

test("J1b: the CLI carries no refer verb", () => {
  const cli = join(autonomyRoot, "core", "bin", "dg-autonomy.mjs");
  const result = spawnSync(process.execPath, [cli, "refer", "--by", "codex"], {
    encoding: "utf8",
    timeout: 15000,
  });
  assert.equal(result.status, 64);
  assert.match(result.stderr, /Unknown command/);
});

test("J2: a SHIP ruling on a capped run terminally resolves the gate with evidence and pins", async () => {
  const state = await cappedRun();
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
  const state = await cappedRun();
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
  const state = await cappedRun();
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
  const state = await cappedRun();
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
  const state = await cappedRun();
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
