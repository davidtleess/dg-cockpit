// Record observation: make the run record OBSERVED, not the schema cleverer
// (Tower's ruling, built on David's word "build it", 2026-08-15).
//
// Every poll hashes the raw bytes of each run record and compares against the
// last observation persisted in a sidecar. A change becomes ONE named,
// timestamped event; steady state stays silent. Purpose: any direct rewrite
// of run.json outside persistRun — the judge's 02:50 ruling documented one,
// and a judgeRuling resurrected unexplained at 11:08-12:17 today — stops
// being invisible. The observer only watches: it sends nothing, decides
// nothing, and never touches a pane.

import { createHash } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";

function sidecarPath(statePath) {
  return `${statePath}.observed.json`;
}

// The record's own version claim: the revision counter persistRun maintains
// when present, else updatedAt. The byte sha is the witness either way — a
// rewrite that forgets to bump revision still changes the hash.
export function observationOf(raw) {
  const sha = createHash("sha256").update(raw).digest("hex").slice(0, 8);
  let revision = null;
  try {
    const parsed = JSON.parse(raw);
    revision = parsed?.revision ?? parsed?.updatedAt ?? null;
  } catch {
    revision = null;
  }
  return { revision, sha };
}

export async function observeRecord(statePath, { now = () => new Date().toISOString() } = {}) {
  let raw;
  try {
    raw = await readFile(statePath);
  } catch {
    return { statePath, status: "unreadable" };
  }
  const observation = observationOf(raw);

  let previous = null;
  try {
    previous = JSON.parse(await readFile(sidecarPath(statePath), "utf8"));
  } catch {
    previous = null;
  }
  if (previous?.sha === observation.sha) {
    return { statePath, status: "unchanged", ...observation };
  }

  const record = { ...observation, observedAt: now() };
  const temporary = `${sidecarPath(statePath)}.tmp-${process.pid}`;
  await writeFile(temporary, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600 });
  await rename(temporary, sidecarPath(statePath));

  return previous
    ? { statePath, status: "changed", ...observation, previous }
    : { statePath, status: "first-observed", ...observation };
}
