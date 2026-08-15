// The release verb: David's word made executable. Lifting a terminal run used
// to mean a hand-whispered `mv` into .git internals; now it is one command
// David runs himself — the keystroke IS the word, no courier. Built on his
// word 2026-08-14: "correct - thats what needs to be built".
//
// Laws:
// - Only a TERMINAL run can be released; an active run has nothing to lift.
// - The archive is byte-preserved (rename, never rewrite) and refuses to
//   clobber an existing archive.
// - Sidecar receipts (docket, wire) are archived with it so a fresh run at
//   the same path inherits nothing.
// - Every release appends to releases.jsonl: label, when, what state it was
//   in, the content hash, and the word it was released on. Authority is
//   auditable forever.
// - The lanes cannot run this: `dg-autonomy release` classifies as the
//   "release" hard gate, and the terminal-state allowlist already refuses it.

import { createHash } from "node:crypto";
import { appendFile, readFile, rename, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

const LABEL_PATTERN = /^[a-z0-9][a-z0-9-]{1,63}$/;

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function releaseRun({ statePath, label, word, now = () => new Date().toISOString() }) {
  if (!LABEL_PATTERN.test(label ?? "")) {
    throw new TypeError("release label must be kebab-case: lowercase letters, digits, dashes");
  }
  let raw;
  try {
    raw = await readFile(statePath, "utf8");
  } catch {
    throw new Error(`no run state at ${statePath}`);
  }
  const run = JSON.parse(raw);
  if (!run.terminalState) {
    throw new Error("run is ACTIVE — release lifts terminal runs only; there is nothing to lift");
  }

  const directory = dirname(statePath);
  const archivePath = join(directory, `run.${label}.json.bak`);
  if (await exists(archivePath)) {
    throw new Error(`archive already exists: ${archivePath} — pick a different label`);
  }

  await rename(statePath, archivePath);
  for (const sidecar of ["docket", "wire"]) {
    const sidecarPath = `${statePath}.${sidecar}.json`;
    if (await exists(sidecarPath)) {
      await rename(sidecarPath, `${archivePath}.${sidecar}.json`);
    }
  }

  const record = {
    label,
    releasedAt: now(),
    archivePath,
    terminalState: run.terminalState,
    reason: run.reason ?? null,
    judgeRuling: run.judgeRuling?.ruling ?? null,
    sha256: createHash("sha256").update(raw).digest("hex"),
    word: word ?? null,
  };
  await appendFile(join(directory, "releases.jsonl"), `${JSON.stringify(record)}\n`, { mode: 0o600 });
  return record;
}
