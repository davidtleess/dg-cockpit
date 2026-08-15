import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { deliverToPane } from "../core/lib/docket.mjs";
import { computeReviewerWake, runWire } from "../core/lib/wire.mjs";

// The reviewer wake: twice on 2026-08-15 a review round opened and the
// reviewer lane never picked it up — the strand sat until a human noticed.
// Built on David's word tonight ("ok go"), per Tower's spec. Laws mirror
// computeWake's: the wire wakes, never decides; one wake per event forever;
// delivery proven by marker; a failed delivery retries, never silences;
// never interrupt a busy pane.

const OPENED = "2026-08-15T20:00:00.000Z";
const T0 = Date.parse(OPENED);
const MIN = 60 * 1000;

function openRun(overrides = {}) {
  return {
    terminalState: null,
    reviewRounds: [
      { phase: "green-review", index: 2, openedAt: OPENED, closedAt: null, reviewerVerdict: null },
    ],
    ...overrides,
  };
}

// Fake Codex pane: "›" composer, no live panes ever.
function codexExec({ tail } = {}) {
  const state = { sent: "", calls: [] };
  state.exec = (args) => {
    state.calls.push(args);
    if (args[0] === "list-panes") return "%3 ⬡ codex\n%1 ✳ claude\n";
    if (args[0] === "send-keys" && args.includes("-l")) state.sent += args.at(-1);
    if (args[0] === "capture-pane") return tail ?? `${state.sent}\n› \n`;
    return "";
  };
  return state;
}

test("reviewer wake is due only for a stale open round on an active run", () => {
  const statePath = "/state/run.json";
  const now = () => T0 + 11 * MIN;

  const wake = computeReviewerWake(openRun(), { statePath }, { now });
  assert.match(wake.marker, /^RVW-[0-9a-f]{8}$/);
  assert.equal(wake.key, "review:green-review:2");
  assert.equal(wake.paneTitle, "⬡ codex");
  assert.match(wake.message, /green-review round 2/);
  assert.match(wake.message, /\/state\/run\.json/);
  assert.match(wake.message, /awaits your review verdict — proceed per the loop contract/);
  assert.match(wake.message, /no one authored this wake/);
  assert.equal(
    computeReviewerWake(openRun(), { statePath }, { now }).marker,
    wake.marker,
    "marker is stable for one round",
  );

  assert.equal(
    computeReviewerWake({ ...openRun(), terminalState: "BLOCKED" }, { statePath }, { now }),
    null,
    "terminal runs are never the wire's",
  );
  assert.equal(
    computeReviewerWake(
      openRun({
        reviewRounds: [
          { phase: "green-review", index: 2, openedAt: OPENED, closedAt: "x", reviewerVerdict: "CLEAR" },
        ],
      }),
      { statePath },
      { now },
    ),
    null,
    "a closed round has no waiting reviewer",
  );
  const cleared = openRun();
  cleared.reviewRounds[0].reviewerVerdict = "CLEAR";
  assert.equal(
    computeReviewerWake(cleared, { statePath }, { now }),
    null,
    "a recorded verdict means the reviewer already moved",
  );
  assert.equal(computeReviewerWake({ terminalState: null, reviewRounds: [] }, { statePath }, { now }), null);
  const dateless = openRun();
  delete dateless.reviewRounds[0].openedAt;
  assert.equal(
    computeReviewerWake(dateless, { statePath }, { now }),
    null,
    "no openedAt means staleness is unprovable — fail closed, never nag",
  );
});

test("grace period: the first ten minutes belong to the normal handover path", () => {
  const statePath = "/state/run.json";
  assert.equal(computeReviewerWake(openRun(), { statePath }, { now: () => T0 + 5 * MIN }), null);
  assert.equal(computeReviewerWake(openRun(), { statePath }, { now: () => T0 + 10 * MIN - 1 }), null);
  assert.ok(
    computeReviewerWake(openRun(), { statePath }, { now: () => T0 + 10 * MIN }),
    "at exactly ten minutes the wake is due",
  );
});

test("a phase with no reviewer pane mapping never wakes", () => {
  const statePath = "/state/run.json";
  const now = () => T0 + 11 * MIN;
  const framing = openRun();
  framing.reviewRounds[0].phase = "framing";
  assert.equal(computeReviewerWake(framing, { statePath }, { now }), null);
});

test("wire wakes the reviewer exactly once per stale round", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dg-rvw-"));
  const statePath = join(directory, "run.json");
  await writeFile(statePath, JSON.stringify(openRun()));

  const tmux = codexExec();
  const first = await runWire([statePath], { exec: tmux.exec, now: () => T0 + 11 * MIN });
  assert.equal(first[0].status, "delivered");
  assert.match(tmux.sent, /REVIEWER WAKE/);
  assert.match(tmux.sent, /green-review round 2/);
  assert.match(tmux.sent, /no one authored this wake/);

  const second = await runWire([statePath], { exec: tmux.exec, now: () => T0 + 12 * MIN });
  assert.equal(second[0].status, "already-woken", "one wake per round, forever");

  const third = await runWire([statePath], {
    exec: () => {
      throw new Error("tmux must not be called");
    },
    now: () => T0 + 13 * MIN,
  });
  assert.equal(third[0].status, "already-woken", "dedupe holds even with no tmux at all");
});

test("a busy reviewer pane is never interrupted — skip this poll, retry the next", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dg-rvw-busy-"));
  const statePath = join(directory, "run.json");
  await writeFile(statePath, JSON.stringify(openRun()));

  const busy = codexExec({ tail: "thinking… (esc to interrupt)\n" });
  const skipped = await runWire([statePath], { exec: busy.exec, now: () => T0 + 11 * MIN });
  assert.equal(skipped[0].status, "reviewer-busy");
  assert.equal(
    busy.calls.some((args) => args[0] === "send-keys"),
    false,
    "never interrupt: nothing may be sent into a generating pane",
  );

  const dialog = codexExec({ tail: "Do you want to proceed?\n› 1. Yes\n" });
  const refused = await runWire([statePath], { exec: dialog.exec, now: () => T0 + 11 * MIN });
  assert.equal(refused[0].status, "reviewer-busy", "an open dialog swallows pastes");

  const idle = codexExec();
  const delivered = await runWire([statePath], { exec: idle.exec, now: () => T0 + 11 * MIN });
  assert.equal(delivered[0].status, "delivered", "the freed pane gets the wake next poll");
});

test("a failed reviewer delivery retries next poll — never silenced", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dg-rvw-retry-"));
  const statePath = join(directory, "run.json");
  await writeFile(statePath, JSON.stringify(openRun()));

  const dead = await runWire([statePath], { exec: () => "", now: () => T0 + 11 * MIN });
  assert.equal(dead[0].status, "reviewer-busy", "no codex pane found → skip, not silence");

  // Pane present and idle, but the paste never lands in the transcript.
  const mute = (args) => {
    if (args[0] === "list-panes") return "%3 ⬡ codex\n";
    if (args[0] === "capture-pane") return "› \n";
    return "";
  };
  const failed = await runWire([statePath], { exec: mute, now: () => T0 + 11 * MIN });
  assert.equal(failed[0].status, "failed", "unproven delivery is a failure, not a receipt");

  const live = codexExec();
  const retry = await runWire([statePath], { exec: live.exec, now: () => T0 + 11 * MIN });
  assert.equal(retry[0].status, "delivered", "the retry delivers and records");
  const again = await runWire([statePath], { exec: live.exec, now: () => T0 + 12 * MIN });
  assert.equal(again[0].status, "already-woken");
});

// PASTE-SETTLE: twice on 2026-08-15 the Codex TUI held the pasted wake in its
// composer after the first C-m — the text sat unsubmitted after the "›"
// prompt. One bare C-m submits it. Fake sequences reproduce the observed
// behavior exactly; no live panes.
test("paste-settle: a composer that holds the paste gets one bare C-m, then verifies", () => {
  let composer = "";
  let transcript = "";
  let cm = 0;
  const slept = [];
  const exec = (args) => {
    if (args[0] === "list-panes") return "%3 ⬡ codex\n";
    if (args[0] === "send-keys" && args.includes("-l")) {
      composer += args.at(-1);
      return "";
    }
    if (args[0] === "send-keys" && args.at(-1) === "C-m") {
      cm += 1;
      if (cm >= 2) {
        // Observed live: the first C-m leaves the text in the composer; the
        // second submits it into the transcript.
        transcript += `${composer}\n`;
        composer = "";
      }
      return "";
    }
    if (args[0] === "capture-pane") {
      // The composer wraps long pastes across lines, like the real screen.
      const wrapped = composer ? `${composer.slice(0, 6)}\n${composer.slice(6)}` : "";
      return `${transcript}\n› ${wrapped}\n`;
    }
    return "";
  };

  const result = deliverToPane({
    paneTitle: "⬡ codex",
    message: "RVW-cafe0123 — REVIEWER WAKE test payload",
    marker: "RVW-cafe0123",
    exec,
    sleep: (ms) => slept.push(ms),
  });
  assert.equal(result.status, "delivered");
  assert.equal(cm, 2, "exactly one settle nudge after the held paste");
  assert.deepEqual(slept, [1000], "the settle wait runs once, ~1s");
});

test("paste-settle: a composer still held after the settle C-m is a FAILURE, never a delivery", () => {
  // Tower review of 3f43b62: without this guard, a double-failed submit let
  // the full-transcript check see the composer text and record a phantom
  // delivery on a wake the reviewer never got — the exact strand this build
  // exists to kill. A held composer fails; failed retries next poll.
  let composer = "";
  let cm = 0;
  const slept = [];
  const exec = (args) => {
    if (args[0] === "list-panes") return "%3 ⬡ codex\n";
    if (args[0] === "send-keys" && args.includes("-l")) {
      composer += args.at(-1);
      return "";
    }
    if (args[0] === "send-keys" && args.at(-1) === "C-m") {
      cm += 1; // NO C-m ever submits: the text stays in the composer
      return "";
    }
    if (args[0] === "capture-pane") return `\n› ${composer}\n`;
    return "";
  };

  const result = deliverToPane({
    paneTitle: "⬡ codex",
    message: "RVW-dead8901 — REVIEWER WAKE test payload",
    marker: "RVW-dead8901",
    exec,
    sleep: (ms) => slept.push(ms),
  });
  assert.equal(result.status, "failed", "a held composer must never count as delivered");
  assert.match(result.error, /composer held after settle/);
  assert.equal(cm, 2, "one settle nudge only — no C-m storm into a stuck TUI");
  assert.deepEqual(slept, [1000]);
});

test("paste-settle: a pane that submits on the first C-m is untouched", () => {
  let composer = "";
  let transcript = "";
  let cm = 0;
  const slept = [];
  const exec = (args) => {
    if (args[0] === "list-panes") return "%3 ⬡ codex\n";
    if (args[0] === "send-keys" && args.includes("-l")) {
      composer += args.at(-1);
      return "";
    }
    if (args[0] === "send-keys" && args.at(-1) === "C-m") {
      cm += 1;
      transcript += `${composer}\n`;
      composer = "";
      return "";
    }
    if (args[0] === "capture-pane") return `${transcript}\n› ${composer}\n`;
    return "";
  };

  const result = deliverToPane({
    paneTitle: "⬡ codex",
    message: "RVW-beef4567 — REVIEWER WAKE test payload",
    marker: "RVW-beef4567",
    exec,
    sleep: (ms) => slept.push(ms),
  });
  assert.equal(result.status, "delivered");
  assert.equal(cm, 1, "no extra C-m for a pane that already submitted");
  assert.deepEqual(slept, [], "no settle wait on the normal path");
});
