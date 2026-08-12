import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { loadContract } from "./policy.mjs";

export function resolveStatePath({
  statePath = process.env.DG_AUTONOMY_STATE,
  cwd = process.cwd(),
} = {}) {
  if (statePath) {
    return resolve(statePath);
  }
  const gitPath = execFileSync(
    "git",
    ["rev-parse", "--git-path", "dg-autonomy/run.json"],
    { cwd, encoding: "utf8" },
  ).trim();
  return resolve(cwd, gitPath);
}

// Optimistic concurrency: every mutation carries the revision it was loaded at.
// A stale writer gets a named conflict instead of silently clobbering a
// concurrent finding or round (loop-control spec F17).
export async function persistRun(run, options = {}, { fresh = false } = {}) {
  const statePath = resolveStatePath(options);
  let next = run;
  if (!fresh) {
    const base = Number.isInteger(run.revision) ? run.revision : 0;
    let diskRaw = null;
    try {
      diskRaw = await readFile(statePath, "utf8");
    } catch {
      diskRaw = null;
    }
    if (diskRaw !== null) {
      let disk = null;
      try {
        disk = JSON.parse(diskRaw);
      } catch {
        disk = null;
      }
      const diskRevision = Number.isInteger(disk?.revision) ? disk.revision : 0;
      if (diskRevision !== base) {
        const error = new Error(
          `Run state revision conflict: disk is at ${diskRevision}, caller loaded ${base} — reload and retry`,
        );
        error.code = "DG_REVISION_CONFLICT";
        throw error;
      }
    }
    next = { ...run, revision: base + 1 };
  }
  await mkdir(dirname(statePath), { recursive: true });
  const temporaryPath = `${statePath}.tmp-${process.pid}`;
  await writeFile(temporaryPath, `${JSON.stringify(next, null, 2)}\n`, {
    mode: 0o600,
  });
  await rename(temporaryPath, statePath);
  return next;
}

async function writeRun(run, options = {}) {
  return persistRun(run, options);
}

// Hook-safe state read: bounded, synchronous, and never throws. Hooks run
// inside 10s host timeouts and today (2026-08-12) a hanging hook froze the
// Codex lane for 41 minutes — nothing here may block or recurse.
export function readRunSnapshotSync({
  statePath = process.env.DG_AUTONOMY_STATE,
  cwd = process.cwd(),
} = {}) {
  let path = statePath;
  if (!path) {
    try {
      const gitPath = execFileSync(
        "git",
        ["rev-parse", "--git-path", "dg-autonomy/run.json"],
        { cwd, encoding: "utf8", timeout: 2000, stdio: ["ignore", "pipe", "ignore"] },
      ).trim();
      path = resolve(cwd, gitPath);
    } catch {
      return { status: "missing", run: null };
    }
  }
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return { status: "missing", run: null };
  }
  try {
    return { status: "ok", run: JSON.parse(raw) };
  } catch {
    return { status: "corrupt", run: null };
  }
}

function assertActive(run) {
  if (!run || typeof run !== "object") {
    throw new TypeError("A run object is required");
  }
  if (run.terminalState) {
    throw new Error(`Run is already terminal: ${run.terminalState}`);
  }
}

export async function loadRun(options = {}) {
  return JSON.parse(await readFile(resolveStatePath(options), "utf8"));
}

export async function createRun(
  { role, goal, repository, worktree, scope, now = new Date().toISOString() },
  options = {},
) {
  const contract = await loadContract();
  const knownRoles = new Set([...contract.engineeringRoles, "tower"]);
  if (!knownRoles.has(role)) {
    throw new TypeError(`Unsupported run role: ${role}`);
  }
  for (const [name, value] of Object.entries({ goal, repository, worktree, scope })) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new TypeError(`${name} must be a non-empty string`);
    }
  }

  const run = {
    schemaVersion: 3,
    id: randomUUID(),
    role,
    goal,
    repository,
    worktree,
    scope,
    requiredChecks:
      role === "tower"
        ? [...contract.requiredChecks.tower]
        : [...contract.requiredChecks.engineering],
    phase: "initialized",
    checks: [],
    failureCounts: {},
    terminalState: null,
    reason: null,
    reasonCodes: [],
    reviewRounds: [],
    backlog: [],
    revision: 0,
    createdAt: now,
    updatedAt: now,
  };
  return persistRun(run, options, { fresh: true });
}

export async function recordCheck(run, receipt, options = {}) {
  assertActive(run);
  const { name, status, evidence } = receipt ?? {};
  if (typeof name !== "string" || name.trim() === "") {
    throw new TypeError("check name must be a non-empty string");
  }
  if (!new Set(["passed", "failed"]).has(status)) {
    throw new TypeError("check status must be passed or failed");
  }
  if (typeof evidence !== "string" || evidence.trim() === "") {
    throw new TypeError("check evidence must be a non-empty string");
  }

  const contract = await loadContract();
  const next = structuredClone(run);
  next.phase = "verifying";
  next.checks.push({
    name,
    status,
    evidence,
    recordedAt: new Date().toISOString(),
  });
  if (status === "failed") {
    next.failureCounts[name] = (next.failureCounts[name] ?? 0) + 1;
    if (next.failureCounts[name] >= contract.failureLimit) {
      next.terminalState = "BLOCKED";
      next.reason = `${name} failed ${contract.failureLimit} times`;
      next.phase = "blocked";
    }
  }
  next.updatedAt = new Date().toISOString();
  return writeRun(next, options);
}

export async function blockRun(run, reason, options = {}, { reasonCodes } = {}) {
  assertActive(run);
  if (typeof reason !== "string" || reason.trim() === "") {
    throw new TypeError("block reason must be a non-empty string");
  }
  const next = structuredClone(run);
  next.phase = "blocked";
  next.terminalState = "BLOCKED";
  next.reason = reason;
  if (Array.isArray(reasonCodes) && reasonCodes.length > 0) {
    next.reasonCodes = [...reasonCodes];
  }
  next.updatedAt = new Date().toISOString();
  return writeRun(next, options);
}

export async function finishRun(run, options = {}) {
  assertActive(run);
  const latest = new Map();
  for (const check of run.checks) {
    latest.set(check.name, check.status);
  }
  const failed = [...latest.entries()].filter(([, status]) => status === "failed");
  if (failed.length > 0) {
    return blockRun(
      run,
      `Required checks remain failed: ${failed.map(([name]) => name).join(", ")}`,
      options,
    );
  }
  const missing = run.requiredChecks.filter(
    (name) => latest.get(name) !== "passed",
  );
  if (missing.length > 0) {
    return blockRun(
      run,
      `Required checks are missing: ${missing.join(", ")}`,
      options,
    );
  }

  const next = structuredClone(run);
  next.phase = "gate";
  next.terminalState = "READY_FOR_GATE";
  next.reason = "Authorized implementation and verification are complete";
  next.updatedAt = new Date().toISOString();
  return writeRun(next, options);
}

export function formatStatus(run) {
  const checks = run.checks.length
    ? run.checks.map(({ name, status, evidence }) => `- ${name}: ${status} — ${evidence}`).join("\n")
    : "- none recorded";
  return [
    `Goal: ${run.goal}`,
    `Role: ${run.role}`,
    `Repository: ${run.repository}`,
    `Worktree: ${run.worktree}`,
    `Scope: ${run.scope}`,
    `Required checks: ${run.requiredChecks.join(", ")}`,
    `Phase: ${run.phase}`,
    "Checks:",
    checks,
    `Reason: ${run.reason ?? "none"}`,
    `Terminal state: ${run.terminalState ?? "ACTIVE"}`,
  ].join("\n");
}
