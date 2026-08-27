import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const autonomyRoot = new URL("..", import.meta.url);
const contract = JSON.parse(
  await readFile(new URL("../core/contract.json", import.meta.url), "utf8"),
);

const hosts = {
  claude: {
    root: "claude/dg-engineering",
    backend: "Superpowers",
  },
  codex: {
    root: "codex-marketplace/plugins/dg-autonomy",
    backend: "Superpowers",
  },
  gemini: {
    root: "antigravity/dg-autonomy",
    backend: "ASW",
  },
};

const skillNames = ["dg-auto", "dg-plan", "dg-review", "dg-status"];

test("engineering adapters expose the shared command contract", async () => {
  for (const [host, definition] of Object.entries(hosts)) {
    for (const skillName of skillNames) {
      const skillPath = new URL(
        `${definition.root}/skills/${skillName}/SKILL.md`,
        autonomyRoot,
      );
      const skill = await readFile(skillPath, "utf8");
      assert.match(skill, new RegExp(`name: ${skillName}`));
      assert.match(skill, new RegExp(definition.backend));
      assert.doesNotMatch(skill, /\{\{/);
      for (const terminalState of contract.terminalStates) {
        assert.match(skill, new RegExp(terminalState));
      }
      for (const gate of contract.hardGates) {
        assert.match(skill, new RegExp(gate.replaceAll("-", "[- ]"), "i"));
      }
      if (skillName === "dg-auto") {
        assert.match(skill, /\.dg-autonomy\/bin\/dg-autonomy/);
        assert.match(skill, /record-check --name tests/);
        assert.match(skill, new RegExp(`--role ${host}`));
      }
    }
  }
});

test("generated adapter runtimes contain the same contract", async () => {
  for (const definition of Object.values(hosts)) {
    const generated = JSON.parse(
      await readFile(
        new URL(`${definition.root}/scripts/contract.json`, autonomyRoot),
        "utf8",
      ),
    );
    assert.deepEqual(generated, contract);
  }
});

test("Studio receives no autonomy adapter", async () => {
  await assert.rejects(
    access(join(new URL(autonomyRoot).pathname, "studio")),
    { code: "ENOENT" },
  );
});

test("Claude role plugins have valid, separated manifests", async () => {
  for (const [relativePath, expectedName] of [
    ["claude/dg-engineering/.claude-plugin/plugin.json", "dg-engineering"],
    ["claude/dg-tower/.claude-plugin/plugin.json", "dg-tower"],
  ]) {
    const manifest = JSON.parse(
      await readFile(new URL(relativePath, autonomyRoot), "utf8"),
    );
    assert.equal(manifest.name, expectedName);
    assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
    assert.ok(manifest.description.length > 20);
    assert.equal(manifest.author.name, "Dynasty Genius");
  }

  const towerRoot = fileURLToPath(new URL("claude/dg-tower/", autonomyRoot));
  await access(join(towerRoot, "skills", "dg-health", "SKILL.md"));
  for (const forbidden of ["dg-auto", "dg-plan", "scripts"]) {
    await assert.rejects(access(join(towerRoot, forbidden === "scripts" ? forbidden : join("skills", forbidden))), {
      code: "ENOENT",
    });
  }
});

test("Claude policy hook allows verification and fails closed", async () => {
  const hookPath = fileURLToPath(
    new URL("claude/dg-engineering/scripts/pre-tool-use.mjs", autonomyRoot),
  );
  const fixtureRoot = new URL("fixtures/hooks/", import.meta.url);
  const cases = [
    ["claude-allowed.json", 0, null],
    ["claude-denied.json", 2, "deny"],
    ["claude-malformed.json", 2, "deny"],
  ];

  for (const [fixtureName, expectedStatus, decision] of cases) {
    const input = await readFile(new URL(fixtureName, fixtureRoot), "utf8");
    const result = spawnSync(process.execPath, [hookPath], {
      input,
      encoding: "utf8",
    });
    assert.equal(result.status, expectedStatus, result.stderr);
    if (decision) {
      const output = JSON.parse(result.stdout);
      assert.equal(
        output.hookSpecificOutput.permissionDecision,
        decision,
      );
      assert.equal(output.hookSpecificOutput.hookEventName, "PreToolUse");
    }
  }

  const adversarial = [
    "git -C /tmp commit -m bypass",
    "env git commit -m bypass",
    "bash -lc 'git commit -m bypass'",
    "command git push origin main",
    "rm --recursive --force build",
    "python -c \"import shutil; shutil.rmtree('build')\"",
  ];
  for (const command of adversarial) {
    const result = spawnSync(process.execPath, [hookPath], {
      input: JSON.stringify({
        tool_name: "Bash",
        tool_input: { command },
        cwd: fileURLToPath(autonomyRoot),
      }),
      encoding: "utf8",
      env: { ...process.env, DG_AUTONOMY_WORKTREE: fileURLToPath(autonomyRoot) },
    });
    assert.equal(result.status, 2, command);
    assert.equal(JSON.parse(result.stdout).hookSpecificOutput.permissionDecision, "deny");
  }

  const outsideEdit = spawnSync(process.execPath, [hookPath], {
    input: JSON.stringify({
      tool_name: "Write",
      tool_input: { file_path: "/tmp/dg-outside" },
      cwd: fileURLToPath(autonomyRoot),
    }),
    encoding: "utf8",
    env: { ...process.env, DG_AUTONOMY_WORKTREE: fileURLToPath(autonomyRoot) },
  });
  assert.equal(outsideEdit.status, 2);
  assert.match(outsideEdit.stdout, /leaves the authorized worktree/);
});

test("Codex marketplace and plugin use the native schema", async () => {
  const marketplace = JSON.parse(
    await readFile(
      new URL("codex-marketplace/.agents/plugins/marketplace.json", autonomyRoot),
      "utf8",
    ),
  );
  assert.equal(marketplace.name, "dynasty-autonomy");
  assert.equal(marketplace.plugins.length, 1);
  assert.deepEqual(marketplace.plugins[0], {
    name: "dg-autonomy",
    source: { source: "local", path: "./plugins/dg-autonomy" },
    policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    category: "Productivity",
  });

  const manifest = JSON.parse(
    await readFile(
      new URL(
        "codex-marketplace/plugins/dg-autonomy/.codex-plugin/plugin.json",
        autonomyRoot,
      ),
      "utf8",
    ),
  );
  assert.equal(manifest.name, "dg-autonomy");
  assert.match(manifest.version, /^0\.2\.0(?:\+codex\.[0-9A-Za-z.-]+)?$/);
  assert.equal(
    manifest.description,
    "Safe goal-to-gate engineering autonomy for Dynasty Genius",
  );
  assert.equal(manifest.author.name, "Dynasty Genius");
  assert.equal(manifest.skills, "./skills/");
  assert.deepEqual(manifest.interface.capabilities, [
    "Planning",
    "Editing",
    "Testing",
    "QA",
    "Review",
  ]);
  for (const unsupported of ["hooks", "apps", "mcpServers"]) {
    assert.equal(unsupported in manifest, false);
  }

  const hooks = JSON.parse(
    await readFile(
      new URL("codex-marketplace/plugins/dg-autonomy/hooks/hooks.json", autonomyRoot),
      "utf8",
    ),
  );
  assert.equal(hooks.hooks.PreToolUse[0].matcher, "*");
  const hookPath = fileURLToPath(
    new URL("codex-marketplace/plugins/dg-autonomy/scripts/pre-tool-use.mjs", autonomyRoot),
  );
  const cwd = fileURLToPath(autonomyRoot);
  for (const [toolName, toolInput, expectedStatus] of [
    ["Bash", { command: "npm test" }, 0],
    ["Bash", { command: "git -C /tmp commit -m bypass" }, 2],
    ["Bash", { command: "bash -lc 'git push origin main'" }, 2],
    ["Bash", { command: "echo content > /tmp/outside" }, 2],
    ["apply_patch", { command: "*** Begin Patch\n*** Update File: /tmp/outside\n*** End Patch" }, 2],
    ["mcp__remote__send", { message: "ship" }, 2],
  ]) {
    const result = spawnSync(process.execPath, [hookPath], {
      input: JSON.stringify({ tool_name: toolName, tool_input: toolInput, cwd }),
      encoding: "utf8",
      env: { ...process.env, DG_AUTONOMY_WORKTREE: cwd },
    });
    assert.equal(result.status, expectedStatus, `${toolName}: ${result.stderr}`);
    if (expectedStatus === 2) {
      const output = JSON.parse(result.stdout);
      assert.equal(output.hookSpecificOutput.hookEventName, "PreToolUse");
      assert.equal(output.hookSpecificOutput.permissionDecision, "deny");
    }
  }
});

test("Antigravity adapter assembles the pinned ASW surface", async () => {
  const provenance = JSON.parse(
    await readFile(
      new URL("vendor/antigravity-swarm/UPSTREAM.json", autonomyRoot),
      "utf8",
    ),
  );
  assert.equal(
    provenance.commit,
    "a949cb8b9736115c555bf493eeb009ccb28a703e",
  );
  assert.equal(provenance.version, "0.2.4");
  assert.equal(provenance.license, "MIT");

  const pluginRoot = new URL("antigravity/dg-autonomy/", autonomyRoot);
  const manifest = JSON.parse(
    await readFile(new URL("plugin.json", pluginRoot), "utf8"),
  );
  assert.equal(manifest.name, "dg-autonomy");
  assert.equal(manifest.skills, "./skills");
  assert.equal("permission" in manifest, false);
  await access(new URL("hooks.json", pluginRoot));

  const skills = await readdir(new URL("skills/", pluginRoot));
  const agents = await readdir(new URL("agents/", pluginRoot));
  const scriptEntries = await readdir(new URL("scripts/", pluginRoot), {
    withFileTypes: true,
  });
  const scripts = scriptEntries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
  assert.equal(skills.length, 19);
  assert.equal(agents.filter((name) => name.endsWith(".toml")).length, 6);
  for (const script of [
    "asw-hook.mjs",
    "asw-lsp-check.mjs",
    "asw-redact.mjs",
    "asw-stop-check.mjs",
    "dg-autonomy.mjs",
    "dg-antigravity-tool-policy.mjs",
  ]) {
    assert.ok(scripts.includes(script));
  }

  const hookManifest = JSON.parse(await readFile(new URL("hooks.json", pluginRoot), "utf8"))["dg-autonomy"];
  const toolHook = manifest.hooks && hookManifest.PreToolUse;
  assert.equal(toolHook[0].matcher, ".*");
  for (const phase of ["PreInvocation", "PostToolUse", "Stop", "PreToolUse"]) {
    const serialized = JSON.stringify(hookManifest[phase]);
    assert.match(serialized, /\$\{HOME\}\/\.gemini\/config\/plugins\/dg-autonomy\/scripts\//);
    assert.doesNotMatch(serialized, /\$\{PLUGIN_ROOT\}/);
  }

  const policyPath = fileURLToPath(new URL("scripts/dg-antigravity-tool-policy.mjs", pluginRoot));
  const baseEvent = {
    workspacePaths: [fileURLToPath(autonomyRoot)],
    cwd: fileURLToPath(autonomyRoot),
  };
  for (const [toolCall, expectedDecision] of [
    [{ name: "run_command", args: { command: "npm test" } }, "allow"],
    [{ name: "run_command", args: { CommandLine: "npm test" } }, "allow"],
    [{ name: "run_command", args: { command: "bash -lc 'git push origin main'" } }, "deny"],
    [{ name: "write_file", args: { file_path: "/tmp/outside", content: "x" } }, "deny"],
    [{ name: "mcp_remote_send", args: { message: "ship" } }, "deny"],
  ]) {
    const result = spawnSync(process.execPath, [policyPath], {
      input: JSON.stringify({ ...baseEvent, toolCall }),
      encoding: "utf8",
    });
    assert.equal(result.status, 0, `${toolCall.name}: ${result.stderr}`);
    assert.equal(JSON.parse(result.stdout).decision, expectedDecision);
  }

  for (const [workspacePaths, toolCall, expectedDecision] of [
    [
      [baseEvent.cwd, join(baseEvent.cwd, "docs")],
      { name: "write_file", args: { TargetFile: join(baseEvent.cwd, "safe.txt"), content: "x" } },
      "allow",
    ],
    [
      [baseEvent.cwd, join(baseEvent.cwd, "docs")],
      { name: "write_file", args: { TargetFile: "/tmp/outside", content: "x" } },
      "deny",
    ],
    [
      [baseEvent.cwd, "/tmp/disjoint"],
      { name: "read_file", args: { path: join(baseEvent.cwd, "README.md") } },
      "deny",
    ],
    [
      [process.env.HOME],
      { name: "read_file", args: { path: join(baseEvent.cwd, "README.md") } },
      "deny",
    ],
  ]) {
    const result = spawnSync(process.execPath, [policyPath], {
      input: JSON.stringify({ ...baseEvent, workspacePaths, toolCall }),
      encoding: "utf8",
    });
    assert.equal(result.status, 0, `${toolCall.name}: ${result.stderr}`);
    assert.equal(JSON.parse(result.stdout).decision, expectedDecision);
  }

  const policySource = await readFile(policyPath, "utf8");
  assert.doesNotMatch(policySource, /DG_HOOK_DEBUG|hook-debug\.log|tool_args_preview/);

  const searchableFiles = [
    "plugin.json",
    "hooks.json",
    ...scripts.map((name) => `scripts/${name}`),
  ];
  for (const relativePath of searchableFiles) {
    const path = new URL(relativePath, pluginRoot);
    const content = await readFile(path, "utf8");
    assert.doesNotMatch(content, /~\/\.gemini\/config/);
    assert.doesNotMatch(content, /wjgoarxiv\/antigravity-swarm\/(?:tree|archive)\/(?:main|master)/);
  }
});
