#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import { basename, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

let root = fileURLToPath(new URL("../../", import.meta.url));
const args = process.argv.slice(2);
if (args.length > 0) {
  if (args.length !== 2 || args[0] !== "--root") {
    process.stderr.write("Usage: scan-tree.mjs [--root PATH]\n");
    process.exit(64);
  }
  root = resolve(args[1]);
}

const findings = new Map();
const skippedDirectories = new Set([".git", "node_modules", "tests"]);
const cacheDirectories = new Set([
  "__pycache__",
  ".cache",
  ".plugin-cache",
  ".state",
  ".smoke",
]);

function addFinding(path, rule) {
  const key = relative(root, path) || basename(path);
  const rules = findings.get(key) ?? new Set();
  rules.add(rule);
  findings.set(key, rules);
}

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isSymbolicLink()) {
      addFinding(path, "symbolic link escapes deterministic source scan");
      continue;
    }
    if (entry.isDirectory()) {
      if (skippedDirectories.has(entry.name)) continue;
      if (cacheDirectories.has(entry.name)) {
        addFinding(path, "cache or transient state directory");
        continue;
      }
      await walk(path);
      continue;
    }
    if (!entry.isFile()) continue;

    if (
      entry.name === ".env" ||
      /(?:^|[._-])(?:secret|token|credential|private[-_]?key)(?:[._-]|$)/i.test(
        entry.name,
      )
    ) {
      addFinding(path, "secret-bearing filename");
    }
    if (/\.(?:log|db|sqlite|pyc)$/i.test(entry.name)) {
      addFinding(path, "log, database, or cache artifact");
    }

    const content = await readFile(path, "utf8");
    if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content)) {
      addFinding(path, "private key material");
    }
    if (
      /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|sk-(?:live-)?[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}|AKIA[A-Z0-9]{16})\b/.test(
        content,
      )
    ) {
      addFinding(path, "token-shaped value");
    }
    if (/~\/\.gemini\/config\b/.test(content)) {
      addFinding(path, "legacy Gemini configuration path");
    }
    if (
      /wjgoarxiv\/antigravity-swarm\/(?:tree|archive)\/(?:main|master)\b/.test(
        content,
      )
    ) {
      addFinding(path, "floating ASW source reference");
    }
    if (
      /\.(?:mjs|js|sh)$/.test(entry.name) &&
      /(?:^|[;&|]\s*)(?:curl|wget|npx)\s+/m.test(content)
    ) {
      addFinding(path, "runtime download command");
    }
  }
}

await walk(root);
if (findings.size > 0) {
  for (const [path, rules] of [...findings].sort(([a], [b]) => a.localeCompare(b))) {
    process.stderr.write(`${path}: ${[...rules].sort().join(", ")}\n`);
  }
  process.exitCode = 1;
} else {
  process.stdout.write(`supply-chain scan clean: ${root}\n`);
}
