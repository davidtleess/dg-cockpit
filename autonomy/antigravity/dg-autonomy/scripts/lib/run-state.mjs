import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
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

async function writeRun(run, options = {}) {
  const statePath = resolveStatePath(options);
  await mkdir(dirname(statePath), { recursive: true });
  const temporaryPath = `${statePath}.tmp-${process.pid}`;
  await writeFile(temporaryPath, `${JSON.stringify(run, null, 2)}\n`, {
    mode: 0o600,
  });
  await rename(temporaryPath, statePath);
  return run;
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
    schemaVersion: 2,
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
    createdAt: now,
    updatedAt: now,
  };
  return writeRun(run, options);
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

export async function blockRun(run, reason, options = {}) {
  assertActive(run);
  if (typeof reason !== "string" || reason.trim() === "") {
    throw new TypeError("block reason must be a non-empty string");
  }
  const next = structuredClone(run);
  next.phase = "blocked";
  next.terminalState = "BLOCKED";
  next.reason = reason;
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
