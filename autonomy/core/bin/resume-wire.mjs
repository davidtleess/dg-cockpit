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
import { join } from "node:path";

import { runWire } from "../lib/wire.mjs";

const stateRoot = process.env.DG_AUTONOMY_HOME ?? join(homedir(), ".dg-autonomy");
const pidPath = join(stateRoot, "resume-wire.pid");

function log(line) {
  process.stdout.write(`${new Date().toISOString()} ${line}\n`);
}

async function onePass(statePaths) {
  const results = await runWire(statePaths);
  for (const entry of results) {
    if (entry.status !== "no-wake-due" && entry.status !== "already-woken") {
      log(`${entry.status}${entry.error ? ` (${entry.error})` : ""}${entry.key ? ` [${entry.key}]` : ""}: ${entry.statePath}`);
    }
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
