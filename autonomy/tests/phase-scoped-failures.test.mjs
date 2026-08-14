import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { createRun, recordCheck } from "../core/lib/run-state.mjs";

// Reproduces the 2026-08-14 wedge (David's word: "fix the counter"): the scorer
// run went terminal on "review failed 3 times" where two failures came from
// framing rounds and only one from green-review — round 1 of 5. The failure
// limit exists to stop a lane grinding against the SAME wall three times; a
// wall is (loop phase, check), never the check alone across the whole run.

function withLoopPhase(run, phase) {
  const next = structuredClone(run);
  next.reviewRounds = [...(next.reviewRounds ?? []), { phase, closedAt: "closed" }];
  return next;
}

test("check failures count per loop phase, not across phases", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dg-autonomy-phase-fail-"));
  const statePath = join(directory, "run.json");
  let run = await createRun(
    {
      role: "claude",
      goal: "wire scorer",
      repository: "/repo",
      worktree: "/worktree",
      scope: "scorer files",
      now: "2026-08-14T12:00:00.000Z",
    },
    { statePath },
  );

  run = withLoopPhase(run, "framing");
  run = await recordCheck(
    run,
    { name: "review", status: "failed", evidence: "framing round 1 NOT CLEAR" },
    { statePath },
  );
  run = await recordCheck(
    run,
    { name: "review", status: "failed", evidence: "framing round 2 NOT CLEAR" },
    { statePath },
  );
  assert.equal(run.terminalState, null, "two framing failures must not block");

  run = withLoopPhase(run, "green-review");
  run = await recordCheck(
    run,
    { name: "review", status: "failed", evidence: "green round 1 NOT CLEAR" },
    { statePath },
  );
  assert.equal(
    run.terminalState,
    null,
    "the first green-review failure is strike one against a NEW wall, not strike three",
  );

  run = await recordCheck(
    run,
    { name: "review", status: "failed", evidence: "green round 2 NOT CLEAR" },
    { statePath },
  );
  assert.equal(run.terminalState, null, "two green-review failures must not block");

  run = await recordCheck(
    run,
    { name: "review", status: "failed", evidence: "green round 3 NOT CLEAR" },
    { statePath },
  );
  assert.equal(run.terminalState, "BLOCKED", "three failures inside one phase block");
  assert.match(run.reason, /green-review/, "the reason names the phase that struck out");
});

test("failures before any round still block on the third strike", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dg-autonomy-preloop-fail-"));
  const statePath = join(directory, "run.json");
  let run = await createRun(
    {
      role: "codex",
      goal: "repair widget",
      repository: "/repo",
      worktree: "/worktree",
      scope: "widget files",
      now: "2026-08-14T12:05:00.000Z",
    },
    { statePath },
  );

  for (const evidence of ["first", "second", "third"]) {
    run = await recordCheck(
      run,
      { name: "unit", status: "failed", evidence },
      { statePath },
    );
  }
  assert.equal(run.terminalState, "BLOCKED");
});
