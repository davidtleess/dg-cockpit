import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { observeRecord } from "../core/lib/observe.mjs";
import { openRound, recordFinding } from "../core/lib/loop-control.mjs";
import { createRun, persistRun } from "../core/lib/run-state.mjs";

// Make the run record OBSERVED, not the schema cleverer — Tower's ruling,
// built on David's word "build it" (2026-08-15). Context: the judge's 02:50
// ruling documented a prior direct non-atomic rewrite of run.json, and an
// unexplained judgeRuling resurrection at 11:08-12:17 today. Any rewrite of
// the record outside persistRun becomes a named, timestamped event; the
// consumed-ruling contract is pinned against resurrection, whatever the
// vector.

async function recordDir() {
  const directory = await mkdtemp(join(tmpdir(), "dg-observe-"));
  return { directory, statePath: join(directory, "run.json") };
}

test("a run record's bytes are observed: first sight, silence, then a named change", async () => {
  const { statePath } = await recordDir();
  await writeFile(statePath, JSON.stringify({ revision: 3, terminalState: null }));

  const first = await observeRecord(statePath);
  assert.equal(first.status, "first-observed");
  assert.equal(first.revision, 3);
  assert.match(first.sha, /^[0-9a-f]{8}$/);
  const sidecar = JSON.parse(await readFile(`${statePath}.observed.json`, "utf8"));
  assert.equal(sidecar.sha, first.sha);
  assert.equal(sidecar.revision, 3);
  assert.ok(sidecar.observedAt, "the observation is timestamped");

  const second = await observeRecord(statePath);
  assert.equal(second.status, "unchanged", "steady state stays silent");

  await writeFile(statePath, JSON.stringify({ revision: 4, terminalState: null }));
  const third = await observeRecord(statePath);
  assert.equal(third.status, "changed");
  assert.equal(third.revision, 4);
  assert.notEqual(third.sha, first.sha);
  assert.equal(third.previous.sha, first.sha, "the previous observation is named alongside the change");
});

test("a direct rewrite that leaves revision untouched still changes the sha — the byte hash is the witness", async () => {
  // The 11:08 resurrection shape: same revision on the record, different
  // content. Revision alone would call this steady state.
  const { statePath } = await recordDir();
  await writeFile(statePath, JSON.stringify({ revision: 7, judgeRuling: null }));
  await observeRecord(statePath);

  await writeFile(statePath, JSON.stringify({ revision: 7, judgeRuling: { ruling: "STOP" } }));
  const observed = await observeRecord(statePath);
  assert.equal(observed.status, "changed");
  assert.equal(observed.revision, 7);
  assert.notEqual(observed.sha, observed.previous.sha);
});

test("revision falls back to updatedAt, and unparseable bytes still hash", async () => {
  const { statePath } = await recordDir();
  await writeFile(statePath, JSON.stringify({ updatedAt: "2026-08-15T02:50:23.167Z" }));
  const observed = await observeRecord(statePath);
  assert.equal(observed.revision, "2026-08-15T02:50:23.167Z");

  await writeFile(statePath, "{half-written");
  const corrupt = await observeRecord(statePath);
  assert.equal(corrupt.status, "changed", "a corrupt rewrite is exactly the event to name");
  assert.equal(corrupt.revision, null);
  assert.match(corrupt.sha, /^[0-9a-f]{8}$/);
});

test("an unreadable record reports, never throws", async () => {
  const { statePath } = await recordDir();
  const observed = await observeRecord(statePath);
  assert.equal(observed.status, "unreadable");
});

test("a judgeRuling consumed by openRound never resurrects through persistRun-mediated writes", async () => {
  const worktree = await mkdtemp(join(tmpdir(), "dg-resurrect-"));
  await mkdir(join(worktree, "src"), { recursive: true });
  await writeFile(join(worktree, "src", "app.mjs"), "line one\n");
  const statePath = join(await mkdtemp(join(tmpdir(), "dg-resurrect-state-")), "run.json");
  const options = { statePath };

  let run = await createRun(
    { role: "claude", goal: "goal", repository: "repo", worktree, scope: "scope" },
    options,
  );
  // The adjudicated-then-continued shape: a ruling sits on the record and the
  // run is active again — the state in which openRound consumes the ruling.
  run = await persistRun(
    { ...run, judgeRuling: { ruling: "SHIP", evidence: "settled dispute", pins: [], ruledAt: "2026-08-15T02:50:23.167Z" } },
    options,
  );
  const stale = structuredClone(run); // a writer still holding the consumed ruling

  run = await openRound(run, { phase: "red", scope: ["src/app.mjs"] }, options);
  assert.ok(!("judgeRuling" in run), "openRound consumes the ruling");
  assert.ok(
    !("judgeRuling" in JSON.parse(await readFile(statePath, "utf8"))),
    "the consumption is persisted",
  );

  // Subsequent persistRun-mediated writes never bring it back.
  run = await recordFinding(
    run,
    { round: 1, severity: "BLOCKER", criterionId: "F-pin-1", file: "src/app.mjs", summary: "s", evidence: "e" },
    options,
  );
  const afterFinding = JSON.parse(await readFile(statePath, "utf8"));
  assert.ok(!("judgeRuling" in afterFinding), "mediated writes carry the consumption forward");

  // The resurrection vector, pinned: a stale writer still holding the ruling
  // gets a named revision conflict — never a silent restore.
  await assert.rejects(() => persistRun(stale, options), /revision conflict/);
  const afterConflict = JSON.parse(await readFile(statePath, "utf8"));
  assert.ok(!("judgeRuling" in afterConflict), "the consumed ruling stays consumed, whatever the vector");
});

test("the resume-wire daemon names every record change it polls", async () => {
  const source = await readFile(new URL("../core/bin/resume-wire.mjs", import.meta.url), "utf8");
  assert.match(source, /observeRecord/);
  assert.match(source, /observe\.mjs/);
  assert.match(source, /record-change \[/, "the log line names the record by basename");
});
