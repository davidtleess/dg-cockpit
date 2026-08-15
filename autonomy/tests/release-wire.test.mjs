import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { releaseRun } from "../core/lib/release.mjs";
import { computeWake, runWire } from "../core/lib/wire.mjs";
import { classifyCommand, isReadOnlyCommand } from "../core/lib/policy.mjs";

// David's word 2026-08-14: the two remaining human couriers become machinery.
// release = his word made executable; wire = the turn-boundary wake.

const TERMINAL_RUN = {
  role: "claude",
  goal: "study",
  worktree: "/worktree",
  terminalState: "BLOCKED",
  reason: "Loop control requires David's decision: PHASE_ROUND_CAP",
  reasonCodes: ["PHASE_ROUND_CAP"],
  judgeRuling: { ruling: "STOP", ruledAt: "2026-08-15T02:50:23.167Z" },
};

test("release archives a terminal run, its receipts, and appends the audit line", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dg-release-"));
  const statePath = join(directory, "run.json");
  await writeFile(statePath, JSON.stringify(TERMINAL_RUN));
  await writeFile(`${statePath}.docket.json`, JSON.stringify({ status: "delivered" }));

  const record = await releaseRun({ statePath, label: "qb1-stop-r5", word: "i do authorize the work" });
  assert.equal(record.terminalState, "BLOCKED");
  assert.equal(record.judgeRuling, "STOP");

  const archived = JSON.parse(await readFile(join(directory, "run.qb1-stop-r5.json.bak"), "utf8"));
  assert.equal(archived.reason, TERMINAL_RUN.reason, "archive is byte-preserved content");
  await readFile(join(directory, "run.qb1-stop-r5.json.bak.docket.json"), "utf8");
  const audit = (await readFile(join(directory, "releases.jsonl"), "utf8")).trim().split("\n");
  assert.equal(audit.length, 1);
  assert.equal(JSON.parse(audit[0]).word, "i do authorize the work");

  await assert.rejects(
    () => releaseRun({ statePath, label: "qb1-stop-r5" }),
    /no run state/,
    "the run is gone after release; releasing again fails plainly",
  );
});

test("release refuses active runs, bad labels, and archive collisions", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dg-release-refuse-"));
  const statePath = join(directory, "run.json");

  await writeFile(statePath, JSON.stringify({ ...TERMINAL_RUN, terminalState: null }));
  await assert.rejects(() => releaseRun({ statePath, label: "fine-label" }), /ACTIVE/);

  await writeFile(statePath, JSON.stringify(TERMINAL_RUN));
  await assert.rejects(() => releaseRun({ statePath, label: "Bad Label!" }), /kebab-case/);

  await writeFile(join(directory, "run.taken.json.bak"), "occupied");
  await assert.rejects(() => releaseRun({ statePath, label: "taken" }), /already exists/);
});

test("the lanes cannot reach release: hard-gate classification and terminal allowlist", () => {
  assert.equal(classifyCommand("dg-autonomy release --as foo"), "release");
  assert.equal(classifyCommand("node /x/scripts/dg-autonomy.mjs release --as foo"), "release");
  assert.equal(isReadOnlyCommand("dg-autonomy release --as foo"), false);
  assert.equal(classifyCommand("dg-autonomy status"), "inspect", "other verbs stay unclassified");
});

test("wire wakes exactly once on a reviewer CLEAR, and only then", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dg-wire-"));
  const statePath = join(directory, "run.json");
  const cleared = {
    terminalState: null,
    reviewRounds: [
      { phase: "green-review", index: 1, closedAt: "x", reviewerVerdict: null },
      { phase: "green-review", index: 2, closedAt: "x", reviewerVerdict: "CLEAR" },
    ],
  };
  await writeFile(statePath, JSON.stringify(cleared));

  assert.equal(computeWake({ ...cleared, terminalState: "BLOCKED" }, { statePath }), null, "terminal runs are not the wire's");
  assert.equal(
    computeWake({ terminalState: null, reviewRounds: [{ phase: "red", index: 1, closedAt: null, reviewerVerdict: null }] }, { statePath }),
    null,
    "an open round means the loop is mid-flight",
  );

  let sent = "";
  const exec = (args) => {
    if (args[0] === "list-panes") return "%1 ✳ claude\n%7 ⚖ judge\n";
    if (args[0] === "send-keys" && args.includes("-l")) sent += args.at(-1);
    if (args[0] === "capture-pane") return `${sent}\n❯ \n`;
    return "";
  };

  const first = await runWire([statePath], { exec });
  assert.equal(first[0].status, "delivered");
  assert.match(sent, /reviewer CLEAR recorded on green-review round 2/);
  assert.match(sent, /no one authored this wake/);

  const second = await runWire([statePath], { exec });
  assert.equal(second[0].status, "already-woken", "one wake per event, forever");

  const third = await runWire([statePath], { exec: () => { throw new Error("tmux must not be called"); } });
  assert.equal(third[0].status, "already-woken", "dedupe holds even with no tmux at all");
});
