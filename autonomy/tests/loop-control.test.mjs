import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { appendFile, mkdir, mkdtemp, readFile, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import { loadContract } from "../core/lib/policy.mjs";
import { createRun } from "../core/lib/run-state.mjs";
import {
  applyLoopVerdict,
  closeRound,
  loopVerdict,
  openRound,
  recordFinding,
  recordReviewerVerdict,
  resolveFinding,
} from "../core/lib/loop-control.mjs";

const SCOPE = ["src/app.mjs"];

async function makeWorktree(files = { "src/app.mjs": "line one\n" }) {
  const worktree = await mkdtemp(join(tmpdir(), "dg-loop-"));
  for (const [relativePath, content] of Object.entries(files)) {
    await mkdir(join(worktree, dirname(relativePath)), { recursive: true });
    await writeFile(join(worktree, relativePath), content);
  }
  return worktree;
}

async function makeRun({ role = "claude", files } = {}) {
  const worktree = await makeWorktree(files);
  const statePath = join(worktree, ".dg-state", "run.json");
  const options = { statePath };
  const run = await createRun(
    { role, goal: "goal", repository: "repo", worktree, scope: "scope" },
    options,
  );
  return { run, worktree, statePath, options };
}

function blockerFinding(overrides = {}) {
  return {
    severity: "BLOCKER",
    criterionId: "F-locator-1",
    file: "src/app.mjs",
    summary: "locator drops rows",
    evidence: "reproduced: node probe.mjs returned 0 rows",
    ...overrides,
  };
}

async function appendLines(worktree, relativePath, count) {
  let block = "";
  for (let index = 0; index < count; index += 1) block += `appended line ${index} of ${count}\n`;
  await appendFile(join(worktree, relativePath), block);
}

// Drives one full round: open → optional findings → optional churn → close.
async function playRound(state, { phase = "red", findings = [], churnLines = 0, resolveIds = [] }) {
  let run = await openRound(state.run, { phase, scope: SCOPE }, state.options);
  const roundIndex = run.reviewRounds.at(-1).index;
  for (const finding of findings) {
    run = await recordFinding(run, { round: roundIndex, ...finding }, state.options);
  }
  if (churnLines > 0) await appendLines(state.worktree, SCOPE[0], churnLines);
  for (const findingId of resolveIds) {
    run = await resolveFinding(run, { findingId, round: roundIndex }, state.options);
  }
  run = await closeRound(run, { round: roundIndex }, state.options);
  state.run = run;
  return run;
}

test("F1: recordFinding fails closed on invalid severity or missing fields and leaves state unchanged", async () => {
  const state = await makeRun();
  state.run = await openRound(state.run, { phase: "red", scope: SCOPE }, state.options);
  const before = await readFile(state.statePath, "utf8");

  for (const bad of [
    blockerFinding({ severity: "blocker" }),
    blockerFinding({ severity: "CRITICAL" }),
    (() => { const f = blockerFinding(); delete f.severity; return f; })(),
    (() => { const f = blockerFinding(); delete f.criterionId; return f; })(),
    (() => { const f = blockerFinding(); delete f.file; return f; })(),
    (() => { const f = blockerFinding(); delete f.evidence; return f; })(),
    blockerFinding({ evidence: "   " }),
  ]) {
    await assert.rejects(
      recordFinding(state.run, { round: 1, ...bad }, state.options),
      TypeError,
    );
  }
  assert.equal(await readFile(state.statePath, "utf8"), before);
});

test("F2: WARN/STYLE-only round yields CLEAR_ELIGIBLE, routes items to run backlog and rendered backlog.md", async () => {
  const state = await makeRun();
  await playRound(state, {
    findings: [
      blockerFinding({ severity: "WARN", criterionId: "W-naming-1" }),
      blockerFinding({ severity: "STYLE", criterionId: "S-format-1" }),
    ],
  });
  const contract = await loadContract();
  const verdict = loopVerdict(state.run, contract);
  assert.equal(verdict.status, "CLEAR_ELIGIBLE");
  assert.equal(state.run.backlog.length, 2);
  const rendered = await readFile(join(dirname(state.statePath), "backlog.md"), "utf8");
  assert.match(rendered, /W-naming-1/);
  assert.match(rendered, /S-format-1/);
});

test("F3: an unresolved BLOCKER under both caps yields CONTINUE", async () => {
  const state = await makeRun();
  await playRound(state, { findings: [blockerFinding()], churnLines: 30 });
  const verdict = loopVerdict(state.run, await loadContract());
  assert.equal(verdict.status, "CONTINUE");
  assert.deepEqual(verdict.reasons, []);
});

test("F4: phase cap with an unresolved BLOCKER halts, applies as BLOCKED with PHASE_ROUND_CAP, and round 6 cannot open", async () => {
  const state = await makeRun();
  const contract = await loadContract();
  let firstBlockerId;
  for (let round = 1; round <= contract.loopControl.phaseRoundCap; round += 1) {
    await playRound(state, {
      findings: round === 1 ? [blockerFinding()] : [],
      churnLines: 20,
    });
    if (round === 1) firstBlockerId = state.run.reviewRounds[0].findings[0].id;
  }
  assert.ok(firstBlockerId);
  const verdict = loopVerdict(state.run, contract);
  assert.equal(verdict.status, "HUMAN_GATE_REQUIRED");
  assert.ok(verdict.reasons.includes("PHASE_ROUND_CAP"));

  await assert.rejects(openRound(state.run, { phase: "red", scope: SCOPE }, state.options), /cap/i);

  const applied = await applyLoopVerdict(state.run, verdict, state.options);
  assert.equal(applied.terminalState, "BLOCKED");
  assert.ok(applied.reasonCodes.includes("PHASE_ROUND_CAP"));
});

test("F5: at the phase cap with all BLOCKERs resolved, no CLEAR means CLEAR_ELIGIBLE and a recorded CLEAR means ADVANCE_PHASE", async () => {
  const state = await makeRun();
  const contract = await loadContract();
  await playRound(state, { findings: [blockerFinding()], churnLines: 20 });
  const blockerId = state.run.reviewRounds[0].findings[0].id;
  for (let round = 2; round <= contract.loopControl.phaseRoundCap; round += 1) {
    await playRound(state, {
      churnLines: 20,
      resolveIds: round === contract.loopControl.phaseRoundCap ? [blockerId] : [],
    });
  }
  assert.equal(loopVerdict(state.run, contract).status, "CLEAR_ELIGIBLE");

  state.run = await recordReviewerVerdict(
    state.run,
    { round: contract.loopControl.phaseRoundCap, evidence: "checked all five rounds, re-ran probe" },
    state.options,
  );
  assert.equal(loopVerdict(state.run, contract).status, "ADVANCE_PHASE");
});

test("F6: the run cap halts an unresolved BLOCKER but never forces a halt on a clean phase; round 11 cannot open", async () => {
  const state = await makeRun();
  const contract = await loadContract();

  // framing: 4 rounds, blocker raised and resolved, explicit CLEAR.
  await playRound(state, { phase: "framing", findings: [blockerFinding({ criterionId: "F-frame-1" })], churnLines: 20 });
  const framingBlocker = state.run.reviewRounds[0].findings[0].id;
  for (let round = 2; round <= 4; round += 1) {
    await playRound(state, { phase: "framing", churnLines: 20, resolveIds: round === 4 ? [framingBlocker] : [] });
  }
  state.run = await recordReviewerVerdict(state.run, { round: 4, evidence: "framing checks enumerated" }, state.options);

  // red: 5 rounds, blocker raised and resolved, explicit CLEAR.
  await playRound(state, { phase: "red", findings: [blockerFinding({ criterionId: "F-red-1" })], churnLines: 20 });
  const redBlocker = state.run.reviewRounds.at(-1).findings[0].id;
  for (let round = 2; round <= 5; round += 1) {
    await playRound(state, { phase: "red", churnLines: 20, resolveIds: round === 5 ? [redBlocker] : [] });
  }
  state.run = await recordReviewerVerdict(state.run, { round: 5, evidence: "red matrix verified" }, state.options);

  // green-review: the 10th round overall, with an unresolved blocker.
  await playRound(state, { phase: "green-review", findings: [blockerFinding({ criterionId: "F-green-1" })], churnLines: 20 });
  let verdict = loopVerdict(state.run, contract);
  assert.equal(verdict.status, "HUMAN_GATE_REQUIRED");
  assert.ok(verdict.reasons.includes("RUN_ROUND_CAP"));

  // Zero-blocker path at the same cap follows the CLEAR rule instead of halting.
  const greenBlocker = state.run.reviewRounds.at(-1).findings[0].id;
  state.run = await resolveFinding(state.run, { findingId: greenBlocker, round: 1 }, state.options);
  verdict = loopVerdict(state.run, contract);
  assert.equal(verdict.status, "CLEAR_ELIGIBLE");
  state.run = await recordReviewerVerdict(state.run, { round: 1, evidence: "green verified against matrix" }, state.options);
  assert.equal(loopVerdict(state.run, contract).status, "ADVANCE_PHASE");

  await assert.rejects(openRound(state.run, { phase: "green-review", scope: SCOPE }, state.options), /cap/i);
});

test("F7: the same fingerprint unresolved across 3 rounds with combined churn 9 is DIMINISHING_RETURNS", async () => {
  const state = await makeRun();
  await playRound(state, { findings: [blockerFinding()], churnLines: 3 });
  await playRound(state, { churnLines: 3 });
  await playRound(state, { churnLines: 3 });
  const verdict = loopVerdict(state.run, await loadContract());
  assert.equal(verdict.status, "HUMAN_GATE_REQUIRED");
  assert.ok(verdict.reasons.includes("DIMINISHING_RETURNS"));
});

test("F8: a two-line round that RESOLVES its blocker never halts", async () => {
  const state = await makeRun();
  await playRound(state, { findings: [blockerFinding()], churnLines: 3 });
  await playRound(state, { churnLines: 3 });
  const blockerId = state.run.reviewRounds[0].findings[0].id;
  await playRound(state, { churnLines: 2, resolveIds: [blockerId] });
  const verdict = loopVerdict(state.run, await loadContract());
  assert.equal(verdict.status, "CLEAR_ELIGIBLE");
  assert.ok(!verdict.reasons.includes("DIMINISHING_RETURNS"));
});

test("F9: combined churn of exactly 10 across the window is NOT diminishing (exclusive threshold)", async () => {
  const state = await makeRun();
  await playRound(state, { findings: [blockerFinding()], churnLines: 4 });
  await playRound(state, { churnLines: 3 });
  await playRound(state, { churnLines: 3 });
  const verdict = loopVerdict(state.run, await loadContract());
  assert.equal(verdict.status, "CONTINUE");
  assert.ok(!verdict.reasons.includes("DIMINISHING_RETURNS"));
});

test("F10: fingerprints are script-computed from normalized fields; caller-supplied fingerprints are rejected", async () => {
  const state = await makeRun();
  state.run = await openRound(state.run, { phase: "red", scope: SCOPE }, state.options);
  state.run = await recordFinding(
    state.run,
    { round: 1, ...blockerFinding({ criterionId: "  C-Locator-1 " }) },
    state.options,
  );
  state.run = await recordFinding(
    state.run,
    { round: 1, ...blockerFinding({ criterionId: "c-locator-1", summary: "reworded entirely" }) },
    state.options,
  );
  const [first, second] = state.run.reviewRounds[0].findings;
  assert.equal(first.fingerprint, second.fingerprint);

  await assert.rejects(
    recordFinding(state.run, { round: 1, ...blockerFinding(), fingerprint: "deadbeef" }, state.options),
    TypeError,
  );
});

test("F11: cap and diminishing report together — one reason never masks the other", async () => {
  const state = await makeRun();
  const contract = await loadContract();
  await playRound(state, { findings: [blockerFinding()], churnLines: 2 });
  for (let round = 2; round <= contract.loopControl.phaseRoundCap; round += 1) {
    await playRound(state, { churnLines: 2 });
  }
  const verdict = loopVerdict(state.run, contract);
  assert.equal(verdict.status, "HUMAN_GATE_REQUIRED");
  assert.ok(verdict.reasons.includes("PHASE_ROUND_CAP"));
  assert.ok(verdict.reasons.includes("DIMINISHING_RETURNS"));
});

test("F12: a v2 run with no reviewRounds is CONTINUE, never a throw or a spurious halt", async () => {
  const contract = await loadContract();
  const verdict = loopVerdict(
    {
      schemaVersion: 2,
      id: "legacy",
      role: "claude",
      phase: "verifying",
      checks: [],
      failureCounts: {},
      terminalState: null,
    },
    contract,
  );
  assert.equal(verdict.status, "CONTINUE");
  assert.deepEqual(verdict.reasons, []);
});

test("F13: round verbs reject tower runs and unknown phases", async () => {
  const towerState = await makeRun({ role: "tower" });
  await assert.rejects(
    openRound(towerState.run, { phase: "red", scope: SCOPE }, towerState.options),
    /tower/i,
  );
  const state = await makeRun();
  await assert.rejects(
    openRound(state.run, { phase: "vibes", scope: SCOPE }, state.options),
    TypeError,
  );
});

test("F17: two mutations from the same revision conflict by name instead of silently losing one", async () => {
  const state = await makeRun();
  const opened = await openRound(state.run, { phase: "red", scope: SCOPE }, state.options);
  const staleCopy = structuredClone(opened);

  const closed = await closeRound(opened, { round: 1 }, state.options);
  assert.equal(closed.reviewRounds[0].closedAt === null, false);

  await assert.rejects(
    closeRound(staleCopy, { round: 1 }, state.options),
    (error) => error.code === "DG_REVISION_CONFLICT",
  );
});

test("F19: scope validation rejects escapes, governance-noise paths, binaries, and oversized files before snapshotting", async () => {
  const contract = await loadContract();
  const bigBody = "x".repeat(contract.loopControl.maxSnapshotFileBytes + 1);
  const state = await makeRun({
    files: {
      "src/app.mjs": "line one\n",
      "AGENT_SYNC.md": "sync\n",
      "docs/agent-ledger/2026-08-12.md": "ledger\n",
      "assets/blob.bin": "bin ary\n",
      "assets/huge.txt": bigBody,
    },
  });
  await symlink("/etc", join(state.worktree, "src", "escape-link"));
  const before = await readFile(state.statePath, "utf8");

  for (const scope of [
    ["/etc/hosts"],
    ["../outside.txt"],
    ["AGENT_SYNC.md"],
    ["docs/agent-ledger/2026-08-12.md"],
    ["src/escape-link"],
    ["assets/blob.bin"],
    ["assets/huge.txt"],
    [],
  ]) {
    await assert.rejects(openRound(state.run, { phase: "red", scope }, state.options), TypeError);
  }
  assert.equal(await readFile(state.statePath, "utf8"), before);
});

test("F20: closeRound rejects any caller-supplied churn assertion", async () => {
  const state = await makeRun();
  state.run = await openRound(state.run, { phase: "red", scope: SCOPE }, state.options);
  await assert.rejects(closeRound(state.run, { round: 1, linesChanged: 0 }, state.options), TypeError);
  await assert.rejects(
    closeRound(state.run, { round: 1, churn: { linesChanged: 0 } }, state.options),
    TypeError,
  );
});

test("F21: churn is measured from script-owned snapshots and never touches the real git index", async () => {
  const state = await makeRun();
  const git = (...args) =>
    execFileSync("git", ["-C", state.worktree, ...args], { encoding: "utf8" });
  git("init", "--quiet");
  git("add", ".");
  git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "--quiet", "-m", "base");

  state.run = await openRound(state.run, { phase: "red", scope: SCOPE }, state.options);
  await appendLines(state.worktree, SCOPE[0], 2);
  const statusBefore = git("status", "--porcelain");

  state.run = await closeRound(state.run, { round: 1 }, state.options);
  const round = state.run.reviewRounds[0];
  assert.equal(round.churn.linesChanged, 2);
  assert.equal(typeof round.churn.openSnapshotHash, "string");
  assert.equal(typeof round.churn.closeSnapshotHash, "string");
  assert.notEqual(round.churn.openSnapshotHash, round.churn.closeSnapshotHash);

  assert.equal(git("status", "--porcelain"), statusBefore);
  assert.equal(git("diff", "--cached", "--name-only"), "");
});

test("reviewer CLEAR is rejected while any BLOCKER remains unresolved", async () => {
  const state = await makeRun();
  await playRound(state, { findings: [blockerFinding()], churnLines: 20 });
  await assert.rejects(
    recordReviewerVerdict(state.run, { round: 1, evidence: "looks good" }, state.options),
    /blocker/i,
  );
});
