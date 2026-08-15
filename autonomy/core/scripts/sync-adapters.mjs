#!/usr/bin/env node

import { chmod, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const autonomyRoot = fileURLToPath(new URL("../../", import.meta.url));
const coreRoot = join(autonomyRoot, "core");
const checkOnly = process.argv.slice(2).includes("--check");
const unexpected = process.argv.slice(2).filter((value) => value !== "--check");

if (unexpected.length > 0) {
  throw new Error(`Unknown sync argument: ${unexpected.join(" ")}`);
}

const hosts = {
  claude: {
    label: "Claude",
    role: "claude",
    root: join(autonomyRoot, "claude", "dg-engineering"),
    backend:
      "Use installed Superpowers skills for brainstorming, planning, worktrees, TDD, execution, review, and verification.",
  },
  codex: {
    label: "Codex",
    role: "codex",
    root: join(autonomyRoot, "codex-marketplace", "plugins", "dg-autonomy"),
    backend:
      "Use installed Superpowers skills for brainstorming, planning, worktrees, TDD, execution, review, and verification.",
  },
  gemini: {
    label: "Gemini",
    role: "gemini",
    root: join(autonomyRoot, "antigravity", "dg-autonomy"),
    backend:
      "Use the bundled, pinned ASW planning, programming, debugging, UI/UX, loop, and review skills only within this Dynasty contract.",
  },
};

const skillNames = ["dg-auto", "dg-plan", "dg-review", "dg-status"];
const expected = new Map();

async function addTree(sourceRoot, destinationRoot) {
  for (const entry of await readdir(sourceRoot, { withFileTypes: true })) {
    const sourcePath = join(sourceRoot, entry.name);
    const destinationPath = join(destinationRoot, entry.name);
    if (entry.isDirectory()) {
      await addTree(sourcePath, destinationPath);
    } else if (entry.isFile()) {
      expected.set(destinationPath, await readFile(sourcePath, "utf8"));
    }
  }
}

for (const definition of Object.values(hosts)) {
  for (const skillName of skillNames) {
    const template = await readFile(
      join(coreRoot, "templates", `${skillName}.md`),
      "utf8",
    );
    const content = template
      .replaceAll("{{HOST}}", definition.label)
      .replaceAll("{{ROLE}}", definition.role)
      .replaceAll("{{BACKEND}}", definition.backend);
    if (content.includes("{{")) {
      throw new Error(`Unresolved template token in ${skillName} for ${definition.label}`);
    }
    expected.set(join(definition.root, "skills", skillName, "SKILL.md"), content);
  }

  const contract = await readFile(join(coreRoot, "contract.json"), "utf8");
  const policy = await readFile(join(coreRoot, "lib", "policy.mjs"), "utf8");
  const runState = await readFile(join(coreRoot, "lib", "run-state.mjs"), "utf8");
  const loopControl = await readFile(join(coreRoot, "lib", "loop-control.mjs"), "utf8");
  const docket = await readFile(join(coreRoot, "lib", "docket.mjs"), "utf8");
  const release = await readFile(join(coreRoot, "lib", "release.mjs"), "utf8");
  const wire = await readFile(join(coreRoot, "lib", "wire.mjs"), "utf8");
  const cli = (
    await readFile(join(coreRoot, "bin", "dg-autonomy.mjs"), "utf8")
  )
    .replace('"../lib/run-state.mjs"', '"./lib/run-state.mjs"')
    .replace('"../lib/policy.mjs"', '"./lib/policy.mjs"')
    .replace('"../lib/loop-control.mjs"', '"./lib/loop-control.mjs"')
    .replace('"../lib/release.mjs"', '"./lib/release.mjs"');
  expected.set(join(definition.root, "scripts", "contract.json"), contract);
  expected.set(join(definition.root, "scripts", "lib", "policy.mjs"), policy);
  expected.set(join(definition.root, "scripts", "lib", "run-state.mjs"), runState);
  expected.set(join(definition.root, "scripts", "lib", "loop-control.mjs"), loopControl);
  expected.set(join(definition.root, "scripts", "lib", "docket.mjs"), docket);
  expected.set(join(definition.root, "scripts", "lib", "release.mjs"), release);
  expected.set(join(definition.root, "scripts", "lib", "wire.mjs"), wire);
  expected.set(join(definition.root, "scripts", "dg-autonomy.mjs"), cli);
}

// The Claude/Codex Stop hook surfaces loop-control human gates and never
// forces continuation; it is generated into both engineering adapters.
const stopCheckSource = (
  await readFile(join(coreRoot, "scripts", "stop-check.mjs"), "utf8")
)
  .replace('"../lib/policy.mjs"', '"./lib/policy.mjs"')
  .replace('"../lib/run-state.mjs"', '"./lib/run-state.mjs"')
  .replace('"../lib/loop-control.mjs"', '"./lib/loop-control.mjs"')
  .replace('"../lib/docket.mjs"', '"./lib/docket.mjs"');
expected.set(join(hosts.claude.root, "scripts", "stop-check.mjs"), stopCheckSource);
expected.set(join(hosts.codex.root, "scripts", "stop-check.mjs"), stopCheckSource);

const codexRoot = hosts.codex.root;
const codexToolPolicy = await readFile(
  join(coreRoot, "scripts", "codex-tool-policy.mjs"),
  "utf8",
);
expected.set(
  join(codexRoot, "scripts", "pre-tool-use.mjs"),
  codexToolPolicy
    .replace('"../lib/policy.mjs"', '"./lib/policy.mjs"')
    .replace('"../lib/run-state.mjs"', '"./lib/run-state.mjs"'),
);
expected.set(
  join(codexRoot, "hooks", "hooks.json"),
  `${JSON.stringify({
    description: "Dynasty autonomy hard-gate checks for Codex tool calls.",
    hooks: {
      PreToolUse: [
        {
          matcher: "*",
          hooks: [
            {
              type: "command",
              command: 'node "${PLUGIN_ROOT}/scripts/pre-tool-use.mjs"',
              timeout: 10,
              statusMessage: "Checking Dynasty autonomy boundary",
            },
          ],
        },
      ],
      Stop: [
        {
          hooks: [
            {
              type: "command",
              command: 'node "${PLUGIN_ROOT}/scripts/stop-check.mjs"',
              timeout: 10,
              statusMessage: "Dynasty loop control: checking the human gate",
            },
          ],
        },
      ],
    },
  }, null, 2)}\n`,
);

const antigravityRoot = hosts.gemini.root;
const vendorRoot = join(autonomyRoot, "vendor", "antigravity-swarm", "plugin");
await addTree(join(vendorRoot, "skills"), join(antigravityRoot, "skills"));
await addTree(join(vendorRoot, "agents"), join(antigravityRoot, "agents"));
await addTree(join(vendorRoot, "scripts"), join(antigravityRoot, "scripts"));

const antigravityPolicyHook = await readFile(
  join(coreRoot, "scripts", "antigravity-policy-hook.mjs"),
  "utf8",
);
expected.set(
  join(antigravityRoot, "scripts", "dg-antigravity-policy.mjs"),
  antigravityPolicyHook,
);
const antigravityToolPolicy = await readFile(
  join(coreRoot, "scripts", "antigravity-tool-policy.mjs"),
  "utf8",
);
expected.set(
  join(antigravityRoot, "scripts", "dg-antigravity-tool-policy.mjs"),
  antigravityToolPolicy
    .replace('"../lib/policy.mjs"', '"./lib/policy.mjs"')
    .replace('"../lib/run-state.mjs"', '"./lib/run-state.mjs"'),
);

// Dynasty-bounded Stop hook replaces the vendored unbounded asw-stop-check
// wiring: identical behavior with no run in scope, no continuation once the
// run is terminal or loop control requires a human gate.
const antigravityStopCheck = (
  await readFile(join(coreRoot, "scripts", "antigravity-stop-check.mjs"), "utf8")
)
  .replace('"../lib/policy.mjs"', '"./lib/policy.mjs"')
  .replace('"../lib/run-state.mjs"', '"./lib/run-state.mjs"')
  .replace('"../lib/loop-control.mjs"', '"./lib/loop-control.mjs"');
expected.set(
  join(antigravityRoot, "scripts", "dg-antigravity-stop.mjs"),
  antigravityStopCheck,
);

const antigravityManifest = {
  name: "dg-autonomy",
  version: "0.2.0",
  description:
    "Safe Dynasty Genius engineering autonomy with a pinned Antigravity Swarm backend.",
  author: "Dynasty Genius",
  license: "MIT",
  skills: "./skills",
  hooks: "./hooks.json",
  interface: {
    displayName: "Dynasty Autonomy",
    shortDescription: "Goal-to-gate engineering autonomy with pinned ASW workflows.",
    category: "Developer Tools",
    capabilities: ["Skills", "Hooks", "Subagents", "Workflow"],
    defaultPrompt: [
      "dg-auto complete this bounded engineering goal",
      "dg-plan write a test-first plan",
      "dg-review verify this worktree",
    ],
    brandColor: "#00B8A9",
  },
};
expected.set(
  join(antigravityRoot, "plugin.json"),
  `${JSON.stringify(antigravityManifest, null, 2)}\n`,
);

const upstreamHooks = JSON.parse(
  await readFile(join(vendorRoot, "hooks", "hooks.json"), "utf8"),
)["antigravity-swarm"];
const antigravityHooks = {
  "dg-autonomy": {
    ...upstreamHooks,
    Stop: [
      {
        type: "command",
        command: 'node "${PLUGIN_ROOT}/scripts/dg-antigravity-stop.mjs"',
        timeout: 10,
        statusMessage: "ASW: checking continuation (Dynasty-bounded)",
      },
    ],
    PreInvocation: [
      {
        type: "command",
        command: 'node "${PLUGIN_ROOT}/scripts/dg-antigravity-policy.mjs"',
        timeout: 10,
        statusMessage: "Dynasty: applying autonomy boundary",
      },
      ...upstreamHooks.PreInvocation,
    ],
    PreToolUse: [
      {
        matcher: ".*",
        hooks: [
          {
            type: "command",
            command: 'node "${PLUGIN_ROOT}/scripts/dg-antigravity-tool-policy.mjs"',
            timeout: 10,
            statusMessage: "Dynasty: enforcing tool boundary",
          },
        ],
      },
    ],
  },
};
expected.set(
  join(antigravityRoot, "hooks.json"),
  `${JSON.stringify(antigravityHooks, null, 2)}\n`,
);

const drift = [];
for (const [path, content] of expected) {
  if (checkOnly) {
    let current;
    try {
      current = await readFile(path, "utf8");
    } catch {
      drift.push(path);
      continue;
    }
    if (current !== content) {
      drift.push(path);
    }
    continue;
  }
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
  if (
    path.endsWith(".mjs") &&
    path.includes("/scripts/")
  ) {
    await chmod(path, 0o755);
  }
}

if (drift.length > 0) {
  process.stderr.write(`Generated adapter drift:\n${drift.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(checkOnly ? "adapter sources in sync\n" : "adapter sources generated\n");
}
