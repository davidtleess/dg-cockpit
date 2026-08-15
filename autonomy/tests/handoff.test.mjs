import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { computeHandoff, runHandoffSweep } from "../core/lib/handoff.mjs";

// David's words 2026-08-15: "i want every agent to finish their work and create
// a handoff around 30% remaining in their context window - then i want them the
// '/clear' their session - and a new fresh session to pickup where it left off."
// Design of record: docs/2026-08-15-context-handoff-design.md. Laws under test:
// never interrupt a turn; verify the artifact, not the claim; the wire clears;
// one cycle per crossing; a failed delivery never silences the cycle;
// disabled by default — activation is David-gated.

const OBSERVED = "2026-08-15T12:00:00.000Z";

const PANE_STATE = {
  schemaVersion: 1,
  provider: "claude",
  paneId: "%0",
  target: "dynasty:1.1",
  role: "claude",
  label: "✳ claude",
  sessionId: "session-1",
  model: "Fable 5",
  usedPercentage: 72,
  remainingPercentage: 28,
  usedTokens: 720000,
  contextWindowSize: 1000000,
  sourceTimestamp: null,
  observedAt: OBSERVED,
  status: "fresh",
  compactedAt: null,
  compactionCount: 0,
};

const CONFIG = { enabled: true, lanes: { "1.1": { floor: 30 } } };

test("computeHandoff arms on the floor crossing, for configured lanes only", () => {
  const now = () => Date.parse(OBSERVED);
  const armed = computeHandoff(PANE_STATE, CONFIG, { now });
  assert.equal(armed.lane, "1.1");
  assert.equal(armed.floor, 30);
  assert.equal(armed.remaining, 28);

  assert.equal(computeHandoff({ ...PANE_STATE, remainingPercentage: 31 }, CONFIG, { now }), null, "above the floor never arms");
  assert.equal(
    computeHandoff({ ...PANE_STATE, target: "dynasty:2.2", label: "🗼 tower" }, CONFIG, { now }),
    null,
    "unconfigured lanes never arm — judge and Tower exempt by design",
  );
  assert.equal(computeHandoff(PANE_STATE, { ...CONFIG, enabled: false }, { now }), null, "disabled is disabled");
  assert.equal(
    computeHandoff(PANE_STATE, { enabled: true, lanes: { "1.1": { floor: 20 } } }, { now }),
    null,
    "per-lane floors are honored",
  );
  assert.equal(computeHandoff({ ...PANE_STATE, status: "unknown" }, CONFIG, { now }), null, "an unknown instrument never arms");
  assert.equal(computeHandoff({ ...PANE_STATE, remainingPercentage: null }, CONFIG, { now }), null);
  assert.equal(
    computeHandoff(PANE_STATE, CONFIG, { now: () => Date.parse(OBSERVED) + 11 * 60 * 1000 }),
    null,
    "a stale instrument never arms",
  );
});

// A fake cockpit: two panes with per-pane transcripts, a composer, and the
// busy/dialog states the boundary check must respect. Same fake-exec shape as
// release-wire.test.mjs — no live pane is ever touched by these tests.
function cockpitHarness() {
  const panes = {
    "%0": { title: "✳ claude", transcript: "", pending: "", busy: false, dialog: false },
    "%4": { title: "🗼 tower", transcript: "", pending: "", busy: false, dialog: false },
  };
  const exec = (args) => {
    if (args[0] === "list-panes") {
      return Object.entries(panes).map(([id, pane]) => `${id} ${pane.title}`).join("\n");
    }
    const id = args[args.indexOf("-t") + 1];
    const pane = panes[id];
    if (!pane) return "";
    if (args[0] === "capture-pane") {
      const busyLine = pane.busy ? "✻ Cogitating… (esc to interrupt)\n" : "";
      const dialogLine = pane.dialog ? "Do you want to proceed?\n" : "";
      return `${pane.transcript}${dialogLine}${busyLine}❯ \n`;
    }
    if (args[0] === "send-keys") {
      if (args.includes("-l")) {
        pane.pending += args.at(-1);
      } else if (args.at(-1) === "C-m") {
        if (pane.pending === "/clear") pane.transcript = "";
        else if (pane.pending) pane.transcript += `${pane.pending}\n`;
        pane.pending = "";
      }
      return "";
    }
    return "";
  };
  return { panes, exec };
}

async function environment({ config = CONFIG, remaining = 28 } = {}) {
  const root = await mkdtemp(join(tmpdir(), "dg-handoff-"));
  const stateDir = join(root, "state");
  const receiptDir = join(root, "autonomy");
  const ledgerDir = join(root, "ledger");
  await mkdir(stateDir, { recursive: true });
  await mkdir(receiptDir, { recursive: true });
  await mkdir(ledgerDir, { recursive: true });
  const configPath = join(root, "handoff-config.json");
  await writeFile(configPath, JSON.stringify(config));

  let clock = Date.now() - 60_000;
  const statePath = join(stateDir, "dynasty_1_1.json");
  const writeState = async (fields = {}) => {
    await writeFile(
      statePath,
      JSON.stringify({ ...PANE_STATE, remainingPercentage: remaining, ...fields, observedAt: new Date(clock).toISOString() }),
    );
  };
  await writeState();
  // An exempt seat's state file and a monitor temp file sit alongside — the
  // sweep must ignore both.
  await writeFile(
    join(stateDir, "dynasty_2_2.json"),
    JSON.stringify({ ...PANE_STATE, target: "dynasty:2.2", label: "🗼 tower", paneId: "%4", remainingPercentage: 12 }),
  );
  await writeFile(join(stateDir, "dynasty_1_3.json.123.tmp"), "{half-written");

  return {
    dirs: { configPath, stateDir, receiptDir, ledgerDir },
    ledgerDir,
    receiptDir,
    writeState,
    clock: () => clock,
    advance: (ms) => { clock += ms; },
  };
}

test("the full cycle: arm at the boundary, order, artifact, clear, rebirth — one cycle per crossing", async () => {
  const env = await environment();
  const { panes, exec } = cockpitHarness();
  const opts = { ...env.dirs, exec, banner: () => {}, now: () => env.clock() };

  // Busy pane: the threshold arms; the boundary has not fired.
  panes["%0"].busy = true;
  let [entry] = await runHandoffSweep(opts);
  assert.equal(entry.status, "arm-wait");
  assert.equal(panes["%0"].transcript, "", "never interrupt a turn");

  // Dialog open: still not a boundary.
  panes["%0"].busy = false;
  panes["%0"].dialog = true;
  [entry] = await runHandoffSweep(opts);
  assert.equal(entry.status, "arm-wait");
  assert.equal(panes["%0"].transcript, "");

  // Idle boundary: the order goes, fixed-format and machinery-carried.
  panes["%0"].dialog = false;
  [entry] = await runHandoffSweep(opts);
  assert.equal(entry.status, "order-delivered");
  assert.match(panes["%0"].transcript, /CONTEXT HANDOFF ORDER/);
  assert.match(panes["%0"].transcript, /smallest honest increment/);
  assert.match(panes["%0"].transcript, /UNPROVEN/);
  assert.match(panes["%0"].transcript, /HANDOFF-DONE/);
  assert.match(panes["%0"].transcript, /Do not start new work/);
  assert.equal(panes["%4"].transcript, "", "the exempt Tower seat hears nothing");
  const receipt = JSON.parse(await readFile(join(env.receiptDir, "handoff-1.1.json"), "utf8"));
  assert.equal(receipt.cycle.phase, "ordered");

  // The claim alone moves nothing: verify the artifact, not the claim.
  panes["%0"].transcript += "HANDOFF-DONE\n";
  [entry] = await runHandoffSweep(opts);
  assert.equal(entry.status, "awaiting-artifact");

  // The ledger artifact lands (mtime after the order): the wire clears and reboots.
  const artifactPath = join(env.ledgerDir, "2026-08-15.md");
  await writeFile(artifactPath, "## postflight — context handoff\n");
  [entry] = await runHandoffSweep(opts);
  assert.equal(entry.status, "reborn");
  assert.doesNotMatch(panes["%0"].transcript, /CONTEXT HANDOFF ORDER/, "the wire cleared the pane before rebirth");
  assert.match(panes["%0"].transcript, /FRESH SESSION/);
  assert.match(panes["%0"].transcript, /AGENT_SYNC/);
  assert.ok(panes["%0"].transcript.includes(artifactPath), "the boot prompt names the ledger handoff");
  assert.match(panes["%0"].transcript, /run state/);
  const done = JSON.parse(await readFile(join(env.receiptDir, "handoff-1.1.json"), "utf8"));
  assert.equal(done.cycle.phase, "done");

  // Still below the floor: one cycle per threshold crossing, forever.
  [entry] = await runHandoffSweep(opts);
  assert.equal(entry.status, "cycle-complete");

  // The fresh session climbs above the floor: the receipt resets; the next
  // crossing starts a new cycle at an idle boundary.
  await env.writeState({ remainingPercentage: 92, sessionId: "session-2" });
  [entry] = await runHandoffSweep(opts);
  assert.equal(entry.status, "reset-above-floor");
  await env.writeState({ remainingPercentage: 25 });
  [entry] = await runHandoffSweep(opts);
  assert.equal(entry.status, "order-delivered");
});

test("the wire waits for HANDOFF-DONE even with the artifact on disk", async () => {
  const env = await environment();
  const { panes, exec } = cockpitHarness();
  const opts = { ...env.dirs, exec, banner: () => {}, now: () => env.clock() };

  let [entry] = await runHandoffSweep(opts);
  assert.equal(entry.status, "order-delivered");
  await writeFile(join(env.ledgerDir, "2026-08-15.md"), "## postflight\n");

  [entry] = await runHandoffSweep(opts);
  assert.equal(entry.status, "awaiting-handoff-done");
  assert.match(panes["%0"].transcript, /CONTEXT HANDOFF ORDER/, "the pane was not cleared under the lane");

  panes["%0"].transcript += "HANDOFF-DONE\n";
  [entry] = await runHandoffSweep(opts);
  assert.equal(entry.status, "reborn");
});

test("no artifact: renotify at half-deadline, park BLOCKED at the deadline — once, never clearing the pane", async () => {
  const env = await environment();
  const { panes, exec } = cockpitHarness();
  const banners = [];
  const opts = { ...env.dirs, exec, banner: (text, title) => banners.push({ text, title }), now: () => env.clock() };

  let [entry] = await runHandoffSweep(opts);
  assert.equal(entry.status, "order-delivered");
  panes["%0"].transcript += "HANDOFF-DONE\n";

  // Half the deadline with no artifact: the order is renoticed, once.
  env.advance(11 * 60 * 1000);
  [entry] = await runHandoffSweep(opts);
  assert.equal(entry.status, "renotified");
  [entry] = await runHandoffSweep(opts);
  assert.equal(entry.status, "awaiting-artifact", "the renotice fires once per cycle");

  // Past the deadline: park BLOCKED-tier to the Tower seat, banner fired.
  env.advance(10 * 60 * 1000);
  [entry] = await runHandoffSweep(opts);
  assert.equal(entry.status, "parked");
  assert.match(panes["%4"].transcript, /BLOCKED/);
  assert.match(panes["%4"].transcript, /handoff/i);
  assert.equal(banners.length, 1);
  assert.equal(banners[0].title, "Dynasty BLOCKED");
  assert.match(panes["%0"].transcript, /CONTEXT HANDOFF ORDER/, "a parked lane is never cleared");

  [entry] = await runHandoffSweep(opts);
  assert.equal(entry.status, "parked-held");
  assert.equal(banners.length, 1, "one park per cycle");
});

test("a failed delivery retries next poll — never silences the cycle", async () => {
  const env = await environment();
  const banners = [];
  const baseOptions = { ...env.dirs, banner: (text, title) => banners.push({ text, title }), now: () => env.clock() };

  // tmux answers but the lane's pane is missing: armed, waiting, not lost.
  let [entry] = await runHandoffSweep({ ...baseOptions, exec: () => "" });
  assert.equal(entry.status, "arm-wait");

  const { panes, exec } = cockpitHarness();
  [entry] = await runHandoffSweep({ ...baseOptions, exec });
  assert.equal(entry.status, "order-delivered", "the retry delivers the same cycle");
  assert.match(panes["%0"].transcript, /CONTEXT HANDOFF ORDER/);
});

test("disabled or missing config: the sweep is a no-op that never touches tmux", async () => {
  const env = await environment({ config: { enabled: false, lanes: { "1.1": { floor: 30 } } } });
  const untouchable = { exec: () => { throw new Error("tmux must not be touched"); }, banner: () => { throw new Error("no banners"); } };

  assert.deepEqual(await runHandoffSweep({ ...env.dirs, ...untouchable }), []);
  assert.deepEqual(
    await runHandoffSweep({ ...env.dirs, configPath: join(env.dirs.stateDir, "no-such-config.json"), ...untouchable }),
    [],
    "no config file means disabled",
  );
});

test("the resume-wire daemon carries the sweep behind the David-gate", async () => {
  const source = await readFile(new URL("../core/bin/resume-wire.mjs", import.meta.url), "utf8");
  assert.match(source, /runHandoffSweep/);
  assert.match(source, /handoff\.mjs/);
});
