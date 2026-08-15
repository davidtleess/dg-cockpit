#!/usr/bin/env node

// Fallback docket sweep: retries any fired loop-control gate whose docket has
// not been VERIFIED in the judge's transcript. The stop hook is the fast path;
// this is the guarantor, because a hook can fail silently and silence must
// never be read as delivery. Run it from Tower's boot ritual or any watchdog:
//
//   node docket-sweep.mjs <run.json path> [...more paths]

import { sweepDockets } from "../lib/docket.mjs";

const statePaths = process.argv.slice(2);
if (statePaths.length === 0) {
  process.stderr.write("Usage: docket-sweep.mjs <run.json path> [...more paths]\n");
  process.exitCode = 64;
} else {
  const results = await sweepDockets(statePaths);
  for (const entry of results) {
    process.stdout.write(`${entry.status}${entry.error ? ` (${entry.error})` : ""}: ${entry.statePath}\n`);
  }
  if (results.some((entry) => entry.status === "failed")) process.exitCode = 1;
}
