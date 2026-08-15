#!/usr/bin/env node

// The resume wire daemon. Watches run records and wakes the implementer lane
// when a reviewer CLEAR lands — no human courier, no stranded turn boundary.
//
//   node resume-wire.mjs --once <run.json> [...more]     one pass (tests, cron)
//   node resume-wire.mjs --loop 20 <run.json> [...more]  poll every 20s
//
// The pidfile makes starts idempotent: a live daemon refuses a second copy;
// a stale pidfile is replaced. Dedupe lives in the per-run wire receipts, so
// even overlapping daemons cannot double-wake.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join } from "node:path";

import { runHandoffSweep } from "../lib/handoff.mjs";
import { observeRecord } from "../lib/observe.mjs";
import { runWire } from "../lib/wire.mjs";

const stateRoot = process.env.DG_AUTONOMY_HOME ?? join(homedir(), ".dg-autonomy");
const pidPath = join(stateRoot, "resume-wire.pid");

function log(line) {
  process.stdout.write(`${new Date().toISOString()} ${line}\n`);
}

// Steady-state handoff outcomes that would flood the log every poll; the
// transitions (orders, parks, rebirths, failures) are the record.
const HANDOFF_QUIET = new Set([
  "no-handoff-due",
  "above-floor",
  "arm-wait",
  "awaiting-artifact",
  "awaiting-handoff-done",
  "cycle-complete",
  "parked-held",
]);

async function onePass(statePaths) {
  // Record observation first — the record as polled, before anything else
  // this pass does (Tower's ruling, 2026-08-15): any rewrite of run.json
  // outside persistRun becomes a named, timestamped log event. One line per
  // change (the first sight is the baseline); steady state stays silent.
  for (const statePath of statePaths) {
    try {
      const observation = await observeRecord(statePath);
      if (observation.status === "changed" || observation.status === "first-observed") {
        log(`record-change [${basename(statePath)}] revision=${observation.revision ?? "none"} sha=${observation.sha}`);
      }
    } catch (error) {
      log(`record-observe failed (${error.message}): ${statePath}`);
    }
  }
  const results = await runWire(statePaths);
  for (const entry of results) {
    // "reviewer-busy" is quiet: an actively reviewing pane past the grace
    // period is steady state, and the never-interrupt skip retries every
    // poll — logging it would print a line every 20s for the length of a
    // review. The delivery (or failure) is the transition worth recording.
    if (entry.status !== "no-wake-due" && entry.status !== "already-woken" && entry.status !== "reviewer-busy") {
      log(`${entry.status}${entry.error ? ` (${entry.error})` : ""}${entry.key ? ` [${entry.key}]` : ""}: ${entry.statePath}`);
    }
  }
  // Context handoff protocol (docs/2026-08-15-context-handoff-design.md).
  // David-gated: ~/.dg-autonomy/handoff-config.json ships disabled, so this
  // sweep is a silent no-op until his word flips "enabled". Each enable
  // transition logs once with the config hash — activation provenance
  // (Tower, 2026-08-15); entry.detail carries it.
  try {
    for (const entry of await runHandoffSweep()) {
      if (!HANDOFF_QUIET.has(entry.status)) {
        log(`handoff ${entry.status}${entry.detail ? ` ${entry.detail}` : ""}${entry.error ? ` (${entry.error})` : ""}${entry.lane ? ` [lane ${entry.lane}]` : ""}`);
      }
    }
  } catch (error) {
    log(`handoff sweep failed: ${error.message}`);
  }
  return results;
}

const [mode, ...rest] = process.argv.slice(2);

if (mode === "--once") {
  if (rest.length === 0) {
    process.stderr.write("Usage: resume-wire.mjs --once <run.json path> [...more]\n");
    process.exitCode = 64;
  } else {
    await onePass(rest);
  }
} else if (mode === "--loop") {
  const interval = Number(rest[0]);
  const statePaths = rest.slice(1);
  if (!Number.isFinite(interval) || interval < 5 || statePaths.length === 0) {
    process.stderr.write("Usage: resume-wire.mjs --loop <seconds >= 5> <run.json path> [...more]\n");
    process.exitCode = 64;
  } else {
    await mkdir(stateRoot, { recursive: true });
    try {
      const existing = Number(await readFile(pidPath, "utf8"));
      if (existing && !Number.isNaN(existing)) {
        try {
          process.kill(existing, 0);
          log(`resume-wire already running (pid ${existing}); exiting`);
          process.exit(0);
        } catch {
          // stale pidfile — take over
        }
      }
    } catch {
      // no pidfile
    }
    await writeFile(pidPath, `${process.pid}\n`, { mode: 0o600 });
    log(`resume-wire up (pid ${process.pid}, every ${interval}s): ${statePaths.join(", ")}`);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        await onePass(statePaths);
      } catch (error) {
        log(`pass failed: ${error.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, interval * 1000));
    }
  }
} else {
  process.stderr.write("Usage: resume-wire.mjs --once|--loop <seconds> <run.json path> [...more]\n");
  process.exitCode = 64;
}
