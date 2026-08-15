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
// Findings F1-F4 are Tower's line-by-line review of 9c73fff (2026-08-15).

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

// Lane results only — the activation-provenance entry is asserted in its own
// test and filtered everywhere else.
async function sweep(options) {
  return (await runHandoffSweep(options)).filter((entry) => entry.status !== "activation");
}

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
// busy/dialog states the boundary check must respect. `freezeScreen` pins
// what capture-pane returns regardless of the real transcript — the tool for
// simulating verification blindness (F2) and redraw races (F3). Same
// fake-exec shape as release-wire.test.mjs — no live pane is ever touched.
function cockpitHarness() {
  const panes = {
    "%0": { title: "✳ claude", transcript: "", pending: "", busy: false, dialog: false, freezeScreen: null },
    "%4": { title: "🗼 tower", transcript: "", pending: "", busy: false, dialog: false, freezeScreen: null },
  };
  const exec = (args) => {
    if (args[0] === "list-panes") {
      return Object.entries(panes).map(([id, pane]) => `${id} ${pane.title}`).join("\n");
    }
    const id = args[args.indexOf("-t") + 1];
    const pane = panes[id];
    if (!pane) return "";
    if (args[0] === "capture-pane") {
      if (pane.freezeScreen !== null) return pane.freezeScreen;
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

  const orderMarker = async () =>
    JSON.parse(await readFile(join(receiptDir, "handoff-1.1.json"), "utf8")).cycle.orderMarker;

  return {
    dirs: { configPath, stateDir, receiptDir, ledgerDir },
    ledgerDir,
    receiptDir,
    writeState,
    orderMarker,
    clock: () => clock,
    advance: (ms) => { clock += ms; },
  };
}

function optionsFor(env, exec, extra = {}) {
  return { ...env.dirs, exec, banner: () => {}, now: () => env.clock(), sleep: async () => {}, ...extra };
}

test("the full cycle: arm at the boundary, order, artifact, clear, rebirth — one cycle per crossing", async () => {
  const env = await environment();
  const { panes, exec } = cockpitHarness();
  const opts = optionsFor(env, exec);

  // Busy pane: the threshold arms; the boundary has not fired.
  panes["%0"].busy = true;
  let [entry] = await sweep(opts);
  assert.equal(entry.status, "arm-wait");
  assert.equal(panes["%0"].transcript, "", "never interrupt a turn");

  // Dialog open: still not a boundary.
  panes["%0"].busy = false;
  panes["%0"].dialog = true;
  [entry] = await sweep(opts);
  assert.equal(entry.status, "arm-wait");
  assert.equal(panes["%0"].transcript, "");

  // Idle boundary: the order goes, fixed-format and machinery-carried.
  panes["%0"].dialog = false;
  [entry] = await sweep(opts);
  assert.equal(entry.status, "order-delivered");
  assert.match(panes["%0"].transcript, /CONTEXT HANDOFF ORDER/);
  assert.match(panes["%0"].transcript, /smallest honest increment/);
  assert.match(panes["%0"].transcript, /UNPROVEN/);
  assert.match(panes["%0"].transcript, /HANDOFF-DONE/);
  assert.match(panes["%0"].transcript, /Do not start new work/);
  assert.match(panes["%0"].transcript, /marker verbatim/, "the order instructs the lane to sign its ledger entry");
  assert.equal(panes["%4"].transcript, "", "the exempt Tower seat hears nothing");
  const receipt = JSON.parse(await readFile(join(env.receiptDir, "handoff-1.1.json"), "utf8"));
  assert.equal(receipt.cycle.phase, "ordered");
  const marker = receipt.cycle.orderMarker;

  // The claim alone moves nothing: verify the artifact, not the claim.
  panes["%0"].transcript += "HANDOFF-DONE\n";
  [entry] = await sweep(opts);
  assert.equal(entry.status, "awaiting-artifact");

  // The signed ledger artifact lands (mtime after the order, marker inside):
  // the wire clears and reboots.
  const artifactPath = join(env.ledgerDir, "2026-08-15.md");
  await writeFile(artifactPath, `## postflight — context handoff ${marker}\n`);
  [entry] = await sweep(opts);
  assert.equal(entry.status, "reborn");
  assert.doesNotMatch(panes["%0"].transcript, /CONTEXT HANDOFF ORDER/, "the wire cleared the pane before rebirth");
  assert.match(panes["%0"].transcript, /FRESH SESSION/);
  assert.match(panes["%0"].transcript, /AGENT_SYNC/);
  assert.ok(panes["%0"].transcript.includes(artifactPath), "the boot prompt names the ledger handoff");
  assert.match(panes["%0"].transcript, /run state/);
  const done = JSON.parse(await readFile(join(env.receiptDir, "handoff-1.1.json"), "utf8"));
  assert.equal(done.cycle.phase, "done");

  // Still below the floor: one cycle per threshold crossing, forever.
  [entry] = await sweep(opts);
  assert.equal(entry.status, "cycle-complete");

  // The fresh session climbs above the floor: the receipt resets; the next
  // crossing starts a new cycle at an idle boundary.
  await env.writeState({ remainingPercentage: 92, sessionId: "session-2" });
  [entry] = await sweep(opts);
  assert.equal(entry.status, "reset-above-floor");
  await env.writeState({ remainingPercentage: 25 });
  [entry] = await sweep(opts);
  assert.equal(entry.status, "order-delivered");
});

test("F1: only a ledger artifact carrying the order marker moves the cycle — another lane's file never does", async () => {
  const env = await environment();
  const { panes, exec } = cockpitHarness();
  const opts = optionsFor(env, exec);

  let [entry] = await sweep(opts);
  assert.equal(entry.status, "order-delivered");
  panes["%0"].transcript += "HANDOFF-DONE\n";

  // Another lane writes the shared agent-ledger directory after the order:
  // right mtime, wrong lane. It must not feed the cycle or the boot prompt.
  const decoyPath = join(env.ledgerDir, "2026-08-15-other-lane.md");
  await writeFile(decoyPath, "## another lane's postflight — no marker here\n");
  [entry] = await sweep(opts);
  assert.equal(entry.status, "awaiting-artifact", "an unsigned artifact is another lane's, not this handoff's");

  const marker = await env.orderMarker();
  const signedPath = join(env.ledgerDir, "2026-08-15-lane-1-1.md");
  await writeFile(signedPath, `## postflight handoff ${marker}\n`);
  [entry] = await sweep(opts);
  assert.equal(entry.status, "reborn");
  assert.ok(panes["%0"].transcript.includes(signedPath), "the boot prompt names the SIGNED artifact");
  assert.ok(!panes["%0"].transcript.includes(decoyPath), "another lane's file never reaches the rebirth prompt");
});

test("F2: order echoes are counted from the transcript, not the receipt — a landed-but-unverified order never fakes a reply", async () => {
  const env = await environment();
  const { panes, exec } = cockpitHarness();
  const opts = optionsFor(env, exec);

  // The order LANDS in the pane, but verification is blind (the live failure
  // mode: wrap/redraw hides the marker from capture) — delivery reports
  // failure and the receipt never records the send.
  panes["%0"].freezeScreen = "❯ \n";
  let [entry] = await sweep(opts);
  assert.equal(entry.status, "order-retry");
  assert.match(panes["%0"].transcript, /CONTEXT HANDOFF ORDER/, "the first order landed despite the failed verification");

  // The retry lands a second copy: the transcript now carries TWO order
  // echoes of HANDOFF-DONE and the lane has said nothing.
  panes["%0"].freezeScreen = null;
  [entry] = await sweep(opts);
  assert.equal(entry.status, "order-delivered");

  const marker = await env.orderMarker();
  await writeFile(join(env.ledgerDir, "2026-08-15.md"), `## postflight ${marker}\n`);
  [entry] = await sweep(opts);
  assert.equal(entry.status, "awaiting-handoff-done", "order echoes never count as the lane's reply");
  assert.match(panes["%0"].transcript, /CONTEXT HANDOFF ORDER/, "the pane was not cleared on a faked reply");

  panes["%0"].transcript += "HANDOFF-DONE\n";
  [entry] = await sweep(opts);
  assert.equal(entry.status, "reborn");
});

test("F3: clear intent persists before /clear — a redraw race still boots the fresh session, even above the floor", async () => {
  const env = await environment();
  const { panes, exec } = cockpitHarness();
  const opts = optionsFor(env, exec);

  let [entry] = await sweep(opts);
  assert.equal(entry.status, "order-delivered");
  panes["%0"].transcript += "HANDOFF-DONE\n";
  const marker = await env.orderMarker();
  await writeFile(join(env.ledgerDir, "2026-08-15.md"), `## postflight ${marker}\n`);

  // Freeze the screen at its pre-clear content: the /clear takes (the real
  // transcript wipes) but every verification capture still shows the order.
  panes["%0"].freezeScreen = `${panes["%0"].transcript}❯ \n`;
  [entry] = await sweep(opts);
  assert.equal(entry.status, "clear-unverified");
  const receipt = JSON.parse(await readFile(join(env.receiptDir, "handoff-1.1.json"), "utf8"));
  assert.equal(receipt.cycle.phase, "clearing", "the clear intent was persisted BEFORE the send");
  assert.ok(receipt.cycle.artifactPath, "the artifact path survives the race for the boot prompt");
  assert.equal(panes["%0"].transcript, "", "the /clear itself took");

  // Still frozen: the next poll retries the clear, it does not re-derive from
  // the wiped transcript.
  [entry] = await sweep(opts);
  assert.equal(entry.status, "clear-unverified");

  // The redraw completes AND the monitor already shows the fresh session
  // above the floor — the reset law must not strand the cleared lane.
  panes["%0"].freezeScreen = null;
  await env.writeState({ remainingPercentage: 95, sessionId: "session-2" });
  [entry] = await sweep(opts);
  assert.equal(entry.status, "reborn", "the boot prompt is sent, never lost to the above-floor reset");
  assert.match(panes["%0"].transcript, /FRESH SESSION/);

  // Only after the cycle completes does the floor reset apply.
  [entry] = await sweep(opts);
  assert.equal(entry.status, "reset-above-floor");
});

test("F4: the deadline parks the whole ordered phase — artifact without HANDOFF-DONE past deadline parks BLOCKED", async () => {
  const env = await environment();
  const { panes, exec } = cockpitHarness();
  const banners = [];
  const opts = optionsFor(env, exec, { banner: (text, title) => banners.push({ text, title }) });

  let [entry] = await sweep(opts);
  assert.equal(entry.status, "order-delivered");
  const marker = await env.orderMarker();
  await writeFile(join(env.ledgerDir, "2026-08-15.md"), `## postflight ${marker}\n`);

  [entry] = await sweep(opts);
  assert.equal(entry.status, "awaiting-handoff-done");

  env.advance(21 * 60 * 1000);
  [entry] = await sweep(opts);
  assert.equal(entry.status, "parked", "a silent lane past the deadline parks even with the artifact on disk");
  assert.match(panes["%4"].transcript, /BLOCKED/);
  assert.match(panes["%4"].transcript, /HANDOFF-DONE/);
  assert.equal(banners.length, 1);
  assert.equal(banners[0].title, "Dynasty BLOCKED");
  assert.match(panes["%0"].transcript, /CONTEXT HANDOFF ORDER/, "a parked lane is never cleared");

  [entry] = await sweep(opts);
  assert.equal(entry.status, "parked-held");
  assert.equal(banners.length, 1, "one park per cycle");
});

test("the wire waits for HANDOFF-DONE even with the artifact on disk", async () => {
  const env = await environment();
  const { panes, exec } = cockpitHarness();
  const opts = optionsFor(env, exec);

  let [entry] = await sweep(opts);
  assert.equal(entry.status, "order-delivered");
  const marker = await env.orderMarker();
  await writeFile(join(env.ledgerDir, "2026-08-15.md"), `## postflight ${marker}\n`);

  [entry] = await sweep(opts);
  assert.equal(entry.status, "awaiting-handoff-done");
  assert.match(panes["%0"].transcript, /CONTEXT HANDOFF ORDER/, "the pane was not cleared under the lane");

  panes["%0"].transcript += "HANDOFF-DONE\n";
  [entry] = await sweep(opts);
  assert.equal(entry.status, "reborn");
});

test("no artifact: renotify at half-deadline, park BLOCKED at the deadline — once, never clearing the pane", async () => {
  const env = await environment();
  const { panes, exec } = cockpitHarness();
  const banners = [];
  const opts = optionsFor(env, exec, { banner: (text, title) => banners.push({ text, title }) });

  let [entry] = await sweep(opts);
  assert.equal(entry.status, "order-delivered");
  panes["%0"].transcript += "HANDOFF-DONE\n";

  // Half the deadline with no artifact: the order is renoticed, once.
  env.advance(11 * 60 * 1000);
  [entry] = await sweep(opts);
  assert.equal(entry.status, "renotified");
  [entry] = await sweep(opts);
  assert.equal(entry.status, "awaiting-artifact", "the renotice fires once per cycle");

  // Past the deadline: park BLOCKED-tier to the Tower seat, banner fired.
  env.advance(10 * 60 * 1000);
  [entry] = await sweep(opts);
  assert.equal(entry.status, "parked");
  assert.match(panes["%4"].transcript, /BLOCKED/);
  assert.match(panes["%4"].transcript, /handoff/i);
  assert.equal(banners.length, 1);
  assert.equal(banners[0].title, "Dynasty BLOCKED");
  assert.match(panes["%0"].transcript, /CONTEXT HANDOFF ORDER/, "a parked lane is never cleared");

  [entry] = await sweep(opts);
  assert.equal(entry.status, "parked-held");
  assert.equal(banners.length, 1, "one park per cycle");
});

test("a failed delivery retries next poll — never silences the cycle", async () => {
  const env = await environment();
  const banners = [];
  const base = { ...env.dirs, banner: (text, title) => banners.push({ text, title }), now: () => env.clock(), sleep: async () => {} };

  // tmux answers but the lane's pane is missing: armed, waiting, not lost.
  let [entry] = await sweep({ ...base, exec: () => "" });
  assert.equal(entry.status, "arm-wait");

  const { panes, exec } = cockpitHarness();
  [entry] = await sweep({ ...base, exec });
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

test("activation transitions log once, with the config hash, in both directions", async () => {
  const env = await environment();
  const { exec } = cockpitHarness();
  const opts = optionsFor(env, exec);

  const first = await runHandoffSweep(opts);
  assert.equal(first[0].status, "activation", "the enable transition leads the results");
  assert.equal(first[0].enabled, true);
  assert.match(first[0].configHash, /^[0-9a-f]{8}$/);
  assert.match(first[0].detail ?? "", /enabled=true/);

  const second = await runHandoffSweep(opts);
  assert.ok(!second.some((entry) => entry.status === "activation"), "no transition, no provenance line");

  await writeFile(env.dirs.configPath, JSON.stringify({ enabled: false, lanes: { "1.1": { floor: 30 } } }));
  const disabled = await runHandoffSweep(opts);
  assert.equal(disabled.length, 1);
  assert.equal(disabled[0].status, "activation");
  assert.equal(disabled[0].enabled, false);
});

test("the resume-wire daemon carries the sweep behind the David-gate", async () => {
  const source = await readFile(new URL("../core/bin/resume-wire.mjs", import.meta.url), "utf8");
  assert.match(source, /runHandoffSweep/);
  assert.match(source, /handoff\.mjs/);
  assert.match(source, /entry\.detail/, "activation provenance reaches the daemon log");
});
