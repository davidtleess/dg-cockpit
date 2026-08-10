# Dynasty Autonomy Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Claude, Codex, and Gemini a safe goal-to-gate engineering workflow while preserving Tower's health-only role and Studio's independence.

**Architecture:** A host-neutral JSON contract and Node.js policy/state utilities define commands, hard gates, failure behavior, and terminal states. Thin native plugin adapters expose that contract to Claude, Codex, and Antigravity; Claude and Codex route execution to their installed Superpowers workflows, while Antigravity adds a pinned, repaired ASW snapshot. An idempotent shell installer validates, activates, verifies, and removes only the registrations it owns.

**Tech Stack:** Bash 3.2-compatible shell, Node.js 18+ ESM and built-in `node:test`, JSON, TOML, Markdown skills, Claude Code plugins, Codex local marketplace plugins, Antigravity CLI plugins.

**Commit boundary:** The approved design forbids autonomous commits. Ignore the normal Superpowers commit steps: after each task, inspect the diff and leave it uncommitted. Do not stage, commit, push, merge, or publish.

---

## File Map

### Shared contract and generators

- Create `autonomy/core/contract.json` — canonical commands, roles, capabilities, gates, failure limit, and terminal states.
- Create `autonomy/core/lib/policy.mjs` — pure action classification and policy evaluation.
- Create `autonomy/core/lib/run-state.mjs` — worktree-local state transitions stored beneath the worktree git directory.
- Create `autonomy/core/bin/dg-autonomy.mjs` — CLI for init, policy checks, verification receipts, block, finish, and status.
- Create `autonomy/core/templates/dg-auto.md` — complete goal-to-gate skill template.
- Create `autonomy/core/templates/dg-plan.md` — plan-only skill template.
- Create `autonomy/core/templates/dg-review.md` — review-only skill template.
- Create `autonomy/core/templates/dg-status.md` — status skill template.
- Create `autonomy/core/scripts/sync-adapters.mjs` — deterministic host adapter generation and ASW assembly.
- Create `autonomy/core/scripts/scan-tree.mjs` — secret/cache/floating-dependency supply-chain scan.

### Claude

- Create `autonomy/claude/dg-engineering/.claude-plugin/plugin.json` — engineering plugin manifest.
- Create `autonomy/claude/dg-engineering/hooks/hooks.json` — fail-closed PreToolUse policy hook.
- Create `autonomy/claude/dg-engineering/scripts/pre-tool-use.mjs` — Claude hook event translator.
- Generate `autonomy/claude/dg-engineering/skills/{dg-auto,dg-plan,dg-review,dg-status}/SKILL.md`.
- Create `autonomy/claude/dg-tower/.claude-plugin/plugin.json` — Tower-only plugin manifest.
- Create `autonomy/claude/dg-tower/skills/dg-health/SKILL.md` — product-health workflow with explicit non-engineering boundaries.

### Codex

- Create `autonomy/codex-marketplace/.agents/plugins/marketplace.json` — `dynasty-autonomy` local marketplace.
- Create `autonomy/codex-marketplace/plugins/dg-autonomy/.codex-plugin/plugin.json` — validated Codex manifest.
- Generate `autonomy/codex-marketplace/plugins/dg-autonomy/skills/{dg-auto,dg-plan,dg-review,dg-status}/SKILL.md`.
- Copy `autonomy/core/bin/dg-autonomy.mjs` and its libraries into the plugin's `scripts/` directory during sync.

### Antigravity and ASW

- Create `autonomy/vendor/antigravity-swarm/UPSTREAM.json` — source URL, audited commit, version, license, and copied paths.
- Copy upstream `LICENSE` and `plugins/antigravity-swarm/` at commit `a949cb8b9736115c555bf493eeb009ccb28a703e` into `autonomy/vendor/antigravity-swarm/`.
- Generate `autonomy/antigravity/dg-autonomy/plugin.json` — current Antigravity manifest.
- Generate `autonomy/antigravity/dg-autonomy/hooks.json` — current root hook file.
- Generate Dynasty skills plus the vetted ASW skills, agents, and scripts beneath `autonomy/antigravity/dg-autonomy/`.

### Lifecycle, tests, and cockpit

- Create `autonomy/install.sh` — check, activate, status, uninstall, backup, and ownership-record lifecycle.
- Create `autonomy/verify.sh` — source, native, isolated-home, security, and live-registration verification.
- Create `autonomy/README.md` — operator guide and rollback instructions.
- Create `autonomy/tests/policy.test.mjs` — policy and state transition tests.
- Create `autonomy/tests/adapters.test.mjs` — generated content and role-boundary tests.
- Create `autonomy/tests/installer.test.mjs` — isolated HOME installer lifecycle tests with fake host CLIs.
- Create `autonomy/tests/cockpit.test.mjs` — flight-deck, bootstrap, backup, and Studio non-regression tests.
- Create `autonomy/tests/fixtures/hooks/*.json` — allowed, denied, malformed, and missing-data hook inputs.
- Modify `home/dynasty_flight_deck.sh` — load engineering Claude and Tower plugins; leave Studio unchanged.
- Modify `bootstrap.sh` — validate and activate the layer during restore.
- Modify `backup.sh` — verify source coverage and exclude generated state/caches.
- Modify `.gitignore` — ignore autonomy ownership state, generated caches, and smoke-test artifacts.
- Modify `README.md` — document the team capability and human gate.

## Task 1: Establish the Test Harness and Canonical Contract

**Files:**
- Create: `autonomy/tests/policy.test.mjs`
- Create: `autonomy/core/contract.json`
- Create: `autonomy/core/lib/policy.mjs`

- [ ] **Step 1: Write failing contract and policy tests**

Create tests using `node:test` that import `evaluateAction`, `classifyCommand`, and `loadContract`. Cover these exact cases:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { classifyCommand, evaluateAction, loadContract } from "../core/lib/policy.mjs";

test("contract exposes four commands and two terminal states", async () => {
  const contract = await loadContract();
  assert.deepEqual(Object.keys(contract.commands), ["dg-auto", "dg-plan", "dg-review", "dg-status"]);
  assert.deepEqual(contract.terminalStates, ["READY_FOR_GATE", "BLOCKED"]);
});

test("engineering roles may edit but may not cross hard gates", async () => {
  assert.equal((await evaluateAction({ role: "codex", action: "edit" })).allowed, true);
  for (const action of ["commit", "push", "merge", "destructive", "permission-escalation", "scope-expansion"]) {
    const result = await evaluateAction({ role: "claude", action });
    assert.equal(result.allowed, false);
    assert.equal(result.state, "BLOCKED");
  }
});

test("Tower is health-only and Studio has no adapter", async () => {
  assert.equal((await evaluateAction({ role: "tower", action: "health-verify" })).allowed, true);
  assert.equal((await evaluateAction({ role: "tower", action: "edit" })).state, "BLOCKED");
  assert.equal((await evaluateAction({ role: "studio", action: "inspect" })).state, "BLOCKED");
});

test("hook errors and the third identical failure fail closed", async () => {
  assert.equal((await evaluateAction({ role: "gemini", action: "test", hookStatus: "malformed" })).state, "BLOCKED");
  assert.equal((await evaluateAction({ role: "gemini", action: "test", failureCount: 3 })).state, "BLOCKED");
});

test("shell command classification catches publication and destructive commands", () => {
  assert.equal(classifyCommand("git commit -m ship"), "commit");
  assert.equal(classifyCommand("git push origin feature"), "push");
  assert.equal(classifyCommand("git merge main"), "merge");
  assert.equal(classifyCommand("rm -rf build"), "destructive");
  assert.equal(classifyCommand("sudo npm install -g thing"), "permission-escalation");
  assert.equal(classifyCommand("npm test"), "test");
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test autonomy/tests/policy.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `autonomy/core/lib/policy.mjs`.

- [ ] **Step 3: Add the canonical contract**

Create `contract.json` with schema version `1`, the four ordered commands, engineering roles `claude`, `codex`, `gemini`, Tower's sole capability `health-verify`, Studio `adapter: false`, terminal states `READY_FOR_GATE` and `BLOCKED`, failure limit `3`, and these hard gates:

```json
[
  "commit",
  "push",
  "merge",
  "release",
  "publish",
  "destructive",
  "permission-escalation",
  "scope-expansion",
  "external-communication"
]
```

Engineering allowed actions must be exactly `inspect`, `plan`, `edit`, `test`, `qa`, `delegate`, `review`, `status`, and `cleanup`.

- [ ] **Step 4: Implement the pure policy module**

Implement `loadContract()` using `readFile(new URL("../contract.json", import.meta.url))`. Implement `classifyCommand()` with anchored word-boundary patterns for `git commit`, `git push`, `git merge`, release/publish commands, `rm -rf`, destructive database commands, and privilege escalation (`sudo`, `doas`); default recognized verification commands to `test` and everything else to `inspect`. Implement `evaluateAction()` in this order: missing/unknown role, non-`ok` hook status, scope expansion, third repeated failure, Studio, Tower, hard gate, engineering allowlist, default deny. Every denial returns `{ allowed: false, state: "BLOCKED", reason }`; allowed actions return `{ allowed: true, state: null, reason: null }`.

- [ ] **Step 5: Run tests and inspect the diff**

Run: `node --test autonomy/tests/policy.test.mjs`

Expected: 5 tests pass, 0 fail.

Run: `git diff --check && git status --short`

Expected: only autonomy-layer work plus the pre-existing `carrier.log` and `delivery.db` changes; do not stage or commit.

## Task 2: Add Worktree-Local Run State and CLI

**Files:**
- Modify: `autonomy/tests/policy.test.mjs`
- Create: `autonomy/core/lib/run-state.mjs`
- Create: `autonomy/core/bin/dg-autonomy.mjs`

- [ ] **Step 1: Write failing lifecycle tests**

Add tests using a temporary `DG_AUTONOMY_STATE` path. Assert:

```js
const run = await createRun({ role: "codex", goal: "repair widget", repository: "/repo", worktree: "/worktree", now: "2026-08-09T12:00:00.000Z" });
assert.equal(run.phase, "initialized");
assert.equal(run.terminalState, null);

await recordCheck(run, { name: "unit", status: "failed", evidence: "first" });
await recordCheck(run, { name: "unit", status: "failed", evidence: "second" });
const blocked = await recordCheck(run, { name: "unit", status: "failed", evidence: "third" });
assert.equal(blocked.terminalState, "BLOCKED");

const fresh = await createRun({ role: "codex", goal: "review widget", repository: "/repo", worktree: "/worktree", now: "2026-08-09T12:05:00.000Z" });
const ready = await finishRun(fresh);
assert.equal(ready.terminalState, "READY_FOR_GATE");
assert.match(formatStatus(ready), /READY_FOR_GATE/);
```

- [ ] **Step 2: Run the lifecycle tests and verify RED**

Run: `node --test autonomy/tests/policy.test.mjs`

Expected: FAIL because `run-state.mjs` exports do not exist.

- [ ] **Step 3: Implement state transitions**

Store JSON at `DG_AUTONOMY_STATE` when set; otherwise resolve `git rev-parse --git-path dg-autonomy/run.json`. Create parent directories recursively. A run contains `schemaVersion`, `id`, `role`, `goal`, `repository`, `worktree`, `phase`, `checks`, `failureCounts`, `terminalState`, `reason`, `createdAt`, and `updatedAt`. Refuse to mutate a terminal run. The third failed receipt for the same check sets `BLOCKED`. `finishRun()` refuses readiness if any latest check status is `failed`; otherwise it sets `READY_FOR_GATE`. `formatStatus()` prints goal, role, phase, checks, reason, and terminal state without secrets.

- [ ] **Step 4: Implement the CLI**

Support these exact commands and JSON-safe argument handling:

```text
dg-autonomy init --role ROLE --goal GOAL --repository PATH --worktree PATH
dg-autonomy check-action --role ROLE --action ACTION [--hook-status STATUS] [--failure-count N]
dg-autonomy record-check --name NAME --status passed|failed --evidence TEXT
dg-autonomy block --reason TEXT
dg-autonomy finish
dg-autonomy status
```

Exit `0` for allowed/active/ready operations, `2` for `BLOCKED`, and `64` for malformed input. Never evaluate or interpolate argument text as shell code.

- [ ] **Step 5: Verify CLI behavior**

Run the test suite, then exercise `init`, `status`, and a denied `check-action` against a temporary state path. Expected: tests pass; denied action prints `BLOCKED` and exits `2`; no file appears in the repository working tree.

## Task 3: Generate the Host-Neutral Skills and Role Contracts

**Files:**
- Create: `autonomy/core/templates/dg-auto.md`
- Create: `autonomy/core/templates/dg-plan.md`
- Create: `autonomy/core/templates/dg-review.md`
- Create: `autonomy/core/templates/dg-status.md`
- Create: `autonomy/core/scripts/sync-adapters.mjs`
- Create: `autonomy/tests/adapters.test.mjs`

- [ ] **Step 1: Write failing adapter-generation tests**

Test that the sync script produces four skills for each engineering host, leaves no `{{...}}` token, includes all hard gates and both terminal states, mentions Superpowers in Claude/Codex output, mentions ASW in Gemini output, and never generates a Studio directory. Test that Tower has only `dg-health`.

- [ ] **Step 2: Run adapter tests and verify RED**

Run: `node --test autonomy/tests/adapters.test.mjs`

Expected: FAIL because templates and sync script do not exist.

- [ ] **Step 3: Write the four complete templates**

Each template starts with valid skill front matter and embeds placeholders only for `{{HOST}}` and `{{BACKEND}}`.

`dg-auto` must require: authority/scope check; dirty-tree preservation; isolated worktree; run initialization; native planning; test-first implementation; tests/static checks; relevant browser/real-surface QA; self-review; cleanup; and exactly one terminal state. It must say never commit, push, merge, publish, perform destructive work, escalate permission, contact external parties, or expand scope.

`dg-plan` must inspect without product edits and produce exact files, tests, commands, acceptance criteria, gates, and cleanup.

`dg-review` must inspect the diff, test evidence, real surface, scope, security, configuration preservation, and cleanup; findings lead, and absence of evidence cannot produce readiness.

`dg-status` must read the state record and report goal, scope, worktree, phase, checks, changed files, blocker/next gate, and terminal state.

Backends substitute exactly:

```js
const backends = {
  claude: "Use installed Superpowers skills for brainstorming, planning, worktrees, TDD, execution, review, and verification.",
  codex: "Use installed Superpowers skills for brainstorming, planning, worktrees, TDD, execution, review, and verification.",
  gemini: "Use the bundled, pinned ASW planning, programming, debugging, UI/UX, loop, and review skills only within this Dynasty contract."
};
```

- [ ] **Step 4: Implement deterministic sync**

`sync-adapters.mjs` reads templates, substitutes only the two declared tokens, rejects leftover `{{`, creates host skill directories, and writes identical generated content on repeated runs. It copies the core CLI and libraries into adapter `scripts/` folders. It accepts `--check` to compare expected content without writing and exits nonzero on drift.

- [ ] **Step 5: Run sync twice and verify determinism**

Run: `node autonomy/core/scripts/sync-adapters.mjs`

Run: `node autonomy/core/scripts/sync-adapters.mjs --check`

Run: `node --test autonomy/tests/adapters.test.mjs`

Expected: sync check and all adapter tests pass; no Studio adapter exists.

## Task 4: Add Claude Engineering and Tower Plugins with a Fail-Closed Hook

**Files:**
- Create: `autonomy/claude/dg-engineering/.claude-plugin/plugin.json`
- Create: `autonomy/claude/dg-engineering/hooks/hooks.json`
- Create: `autonomy/claude/dg-engineering/scripts/pre-tool-use.mjs`
- Create: `autonomy/claude/dg-tower/.claude-plugin/plugin.json`
- Create: `autonomy/claude/dg-tower/skills/dg-health/SKILL.md`
- Create: `autonomy/tests/fixtures/hooks/claude-allowed.json`
- Create: `autonomy/tests/fixtures/hooks/claude-denied.json`
- Create: `autonomy/tests/fixtures/hooks/claude-malformed.json`
- Modify: `autonomy/tests/adapters.test.mjs`

- [ ] **Step 1: Write failing Claude manifest and hook tests**

Assert both manifests contain valid names, strict semver, descriptions, and author names. Spawn the hook with each fixture: `npm test` exits `0`; `git commit -m nope` emits a Claude `PreToolUse` denial and exits `2`; malformed/missing tool input fails closed with a denial. Assert Tower's tree contains no `dg-auto`, `dg-plan`, or engineering script.

- [ ] **Step 2: Run tests and verify RED**

Expected: missing manifests/hook cause failures.

- [ ] **Step 3: Create the Claude manifests and hook registration**

Use plugin names `dg-engineering` and `dg-tower`, version `0.1.0`, author `Dynasty Genius`, and MIT license. Register a `PreToolUse` hook matching `Bash|Write|Edit|MultiEdit` with command:

```json
{
  "type": "command",
  "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/pre-tool-use.mjs\"",
  "timeout": 10,
  "statusMessage": "Checking Dynasty autonomy boundary"
}
```

- [ ] **Step 4: Implement Claude event translation**

Read one JSON event from stdin. For Bash, classify `tool_input.command`; for writes/edits allow only when a non-empty path is present and the run is active. Call the copied policy module. On denial print valid Claude hook JSON with `hookEventName: "PreToolUse"`, `permissionDecision: "deny"`, and the policy reason, then exit `2`. Any parse error, missing field, or policy exception uses reason `Dynasty autonomy hook failed closed` and exits `2`.

- [ ] **Step 5: Write the Tower health skill**

Allow product-health, freshness, model-honesty, and evidence inspection plus updates to Tower-owned boards/memory. Explicitly deny product edits, implementation, orchestration, relaying, approval/gating, and product decisions. It must not reference Superpowers or ASW as an execution backend.

- [ ] **Step 6: Validate and test**

Run:

```bash
claude plugin validate autonomy/claude/dg-engineering
claude plugin validate autonomy/claude/dg-tower
node --test autonomy/tests/adapters.test.mjs
```

Expected: both native validations and all tests pass.

## Task 5: Scaffold and Validate the Codex Marketplace Plugin

**Files:**
- Create: `autonomy/codex-marketplace/.agents/plugins/marketplace.json`
- Create: `autonomy/codex-marketplace/plugins/dg-autonomy/.codex-plugin/plugin.json`
- Generate: `autonomy/codex-marketplace/plugins/dg-autonomy/skills/*/SKILL.md`
- Modify: `autonomy/tests/adapters.test.mjs`

- [ ] **Step 1: Scaffold using the plugin-creator helper**

Run from `/Users/davidleess/.codex/skills/.system/plugin-creator`:

```bash
python3 scripts/create_basic_plugin.py dg-autonomy \
  --path /Users/davidleess/.config/superpowers/worktrees/dg-cockpit/dynasty-autonomy-layer/autonomy/codex-marketplace/plugins \
  --marketplace-path /Users/davidleess/.config/superpowers/worktrees/dg-cockpit/dynasty-autonomy-layer/autonomy/codex-marketplace/.agents/plugins/marketplace.json \
  --marketplace-name dynasty-autonomy \
  --with-skills --with-scripts --with-marketplace \
  --category Productivity
```

Use the global worktree path shown above because the approved no-commit boundary prevents adding and committing a project-local `.worktrees` ignore rule. Do not write the live personal marketplace.

- [ ] **Step 2: Write failing Codex schema tests**

Assert marketplace name `dynasty-autonomy`, source `./plugins/dg-autonomy`, installation `AVAILABLE`, authentication `ON_INSTALL`, category `Productivity`, and no `policy.products`. Assert the manifest has name/version/description/author and `skills: "./skills/"`, and does not declare unsupported `hooks`, `apps`, or `mcpServers`.

- [ ] **Step 3: Replace scaffold metadata with final values**

Set version `0.1.0`, description `Safe goal-to-gate engineering autonomy for Dynasty Genius`, author name/developer name `Dynasty Genius`, category `Productivity`, capabilities `Planning`, `Editing`, `Testing`, `QA`, `Review`, and default prompts for `dg-auto`, `dg-plan`, and `dg-review`. Keep optional URL/logo fields absent.

- [ ] **Step 4: Generate skills and validate**

Run sync, then:

```bash
python3 /Users/davidleess/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py autonomy/codex-marketplace/plugins/dg-autonomy
node --test autonomy/tests/adapters.test.mjs
```

Expected: plugin validator and tests pass, with no global Codex config change.

## Task 6: Vendor, Repair, and Validate the Antigravity ASW Adapter

**Files:**
- Create: `autonomy/vendor/antigravity-swarm/UPSTREAM.json`
- Create: `autonomy/vendor/antigravity-swarm/LICENSE`
- Copy: `autonomy/vendor/antigravity-swarm/plugin/**`
- Create/generated: `autonomy/antigravity/dg-autonomy/**`
- Modify: `autonomy/core/scripts/sync-adapters.mjs`
- Modify: `autonomy/tests/adapters.test.mjs`

- [ ] **Step 1: Verify the audited upstream checkout**

Run in `/private/tmp/antigravity-swarm-audit-20260809`:

```bash
test "$(git rev-parse HEAD)" = "a949cb8b9736115c555bf493eeb009ccb28a703e"
git status --short
node --test test/agy-surface.test.mjs test/agents.test.mjs test/code-health.test.mjs test/docs.test.mjs test/hooks.test.mjs test/installer.test.mjs test/package-surface.test.mjs test/release-hardening.test.mjs test/skills.test.mjs test/statusline.test.mjs
```

Expected: exact commit, clean tree, and all 53 runtime/plugin tests pass. The optional cover-generator test is deliberately excluded because its Python image dependency (NumPy) is not part of the plugin runtime.

- [ ] **Step 2: Copy the pinned source and provenance**

Copy upstream `LICENSE` and `plugins/antigravity-swarm` to `autonomy/vendor/antigravity-swarm/LICENSE` and `autonomy/vendor/antigravity-swarm/plugin`. Write `UPSTREAM.json` containing the GitHub URL, exact commit, upstream version `0.2.4`, audit date `2026-08-09`, license `MIT`, and copied paths. Never run the upstream installer.

- [ ] **Step 3: Write failing repaired-adapter tests**

Assert the generated Antigravity root has `plugin.json` and root `hooks.json`, 19 skills (15 ASW plus 4 Dynasty), 6 agents, and the ASW scripts plus copied Dynasty policy scripts. Assert the manifest points to `./skills`, names `dg-autonomy`, contains no singular `permission` field, and no file references `~/.gemini/config` or a floating GitHub branch.

- [ ] **Step 4: Extend sync to assemble the adapter**

Copy vetted ASW skills, agents, and scripts from the pinned vendor tree; generate the four Dynasty skills; write current `plugin.json`; transform the vendored nested hook file to root `hooks.json`; prepend a `PreInvocation` policy hook for the Dynasty boundary without removing ASW diagnostics hooks. Rewrite plugin-root references only where required by current Antigravity validation. Do not generate or modify user permissions.

- [ ] **Step 5: Validate the repaired adapter**

Run:

```bash
node autonomy/core/scripts/sync-adapters.mjs
agy plugin validate autonomy/antigravity/dg-autonomy
node --test autonomy/tests/adapters.test.mjs
```

Expected: Antigravity reports 19 skills, 6 agents, hooks found/processed, and no validation errors.

## Task 7: Build the Idempotent Installer and Rollback Lifecycle

**Files:**
- Create: `autonomy/install.sh`
- Create: `autonomy/tests/installer.test.mjs`
- Create: `autonomy/tests/fixtures/fake-bin/{claude,codex,agy}` through the test setup

- [ ] **Step 1: Write failing isolated-HOME lifecycle tests**

For each test, create a temporary HOME containing sentinel Claude, Codex, and Antigravity settings and a sentinel `dynasty_flight_deck.sh`. Put fake `claude`, `codex`, and `agy` executables first in PATH; they append arguments to a log and return controlled status. Cover:

1. `--check` validates sources and changes no HOME byte.
2. First `--activate` backs up and installs the flight deck, adds the Codex marketplace/plugin, and installs Antigravity.
3. Second `--activate` is idempotent: no duplicate registration and no new configuration drift.
4. `--status` reports ownership and registrations.
5. `--uninstall` removes only owned registrations and restores the exact sentinel flight deck.
6. A native validator failure stops before any activation command.
7. Claude/Codex/Antigravity settings and hooks remain byte-for-byte identical throughout.

- [ ] **Step 2: Run installer tests and verify RED**

Run: `node --test autonomy/tests/installer.test.mjs`

Expected: FAIL because `install.sh` does not exist.

- [ ] **Step 3: Implement installer argument and ownership handling**

Use Bash 3.2-compatible syntax, `set -euo pipefail`, and root resolution from `BASH_SOURCE[0]`. Support exactly `--check`, `--activate`, `--status`, and `--uninstall`. Use `${DG_AUTONOMY_HOME:-$HOME/.dg-autonomy}` for ownership/backups and `${DG_AUTONOMY_FLIGHT_DECK:-$HOME/dynasty_flight_deck.sh}` for the live launcher. Refuse unknown flags.

Ownership JSON records schema version, layer version, source root, activated hosts, marketplace name/path, Antigravity plugin name, flight-deck backup path/hash, install time, and rollback commands. Write it atomically through a same-directory temporary file and `mv`.

- [ ] **Step 4: Implement check-before-touch activation**

Run sync `--check`, contract tests, adapter tests, Claude validation, Codex helper validation, and Antigravity validation before changing HOME. Back up the live flight deck once, preserving mode. Copy the repository flight deck atomically. Register the repo marketplace with `codex plugin marketplace add`, install `dg-autonomy@dynasty-autonomy`, and install the Antigravity plugin. Before each registration, inspect native lists so repeated activation skips existing owned entries.

- [ ] **Step 5: Implement narrow uninstall**

Read the ownership file and verify its schema/source. Remove `dg-autonomy` from Codex, remove the `dynasty-autonomy` marketplace only when its recorded path matches this repo, uninstall Antigravity `dg-autonomy`, and restore the recorded flight-deck backup only when the current file hash matches the installed source hash. If the live flight deck changed after activation, stop `BLOCKED` and preserve both files. Never edit host settings/hooks directly.

- [ ] **Step 6: Run lifecycle tests**

Run: `node --test autonomy/tests/installer.test.mjs`

Expected: all lifecycle cases pass and sentinel settings/hook hashes match.

## Task 8: Add Verification, Supply-Chain Scanning, and Cockpit Integration

**Files:**
- Create: `autonomy/core/scripts/scan-tree.mjs`
- Create: `autonomy/verify.sh`
- Create: `autonomy/tests/cockpit.test.mjs`
- Modify: `home/dynasty_flight_deck.sh`
- Modify: `bootstrap.sh`
- Modify: `backup.sh`
- Modify: `.gitignore`

- [ ] **Step 1: Write failing cockpit and security tests**

Assert:

- Claude engineering launches with `--plugin-dir "$HOME/dg-cockpit/autonomy/claude/dg-engineering"`.
- Codex launch remains `codex` and relies on its installed marketplace plugin.
- Gemini launch remains `agy` and relies on its installed Antigravity plugin.
- Tower launches with `--agent tower --plugin-dir "$HOME/dg-cockpit/autonomy/claude/dg-tower"`.
- Studio's exact launch line remains `tmux send-keys -t "$SESSION:2.1" "claude" C-m`.
- bootstrap invokes `autonomy/install.sh --activate` only after base host configuration exists.
- backup invokes `autonomy/verify.sh --source-only` and never copies `.dg-autonomy`, plugin caches, or run state.
- the scanner rejects private keys, token-shaped values, `.env`, logs, caches, `__pycache__`, legacy Gemini config paths, floating ASW URLs, and runtime download commands.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test autonomy/tests/cockpit.test.mjs`

Expected: current launch/bootstrap/backup files fail the new assertions.

- [ ] **Step 3: Implement the scanner**

Walk only `autonomy/`, skip test fixtures explicitly marked synthetic, and report path plus rule name without printing secret-looking contents. Rules cover private-key headers, common token prefixes, secret-bearing filenames, `.env`, logs/databases/caches, `__pycache__`, `~/.gemini/config`, `curl|wget|npx` runtime downloads in adapter scripts, and unpinned ASW GitHub references. Exit nonzero on any finding.

- [ ] **Step 4: Implement verification modes**

`verify.sh` supports `--source-only`, `--isolated`, and `--live`. Source-only runs sync check, Node tests, scanner, and all three native validators. Isolated additionally runs installer lifecycle tests in temporary homes. Live additionally checks installed host lists, ownership, source hashes, flight-deck launch lines, and Studio non-exposure. Missing validators are failures in live mode and clearly reported blockers in source-only mode.

- [ ] **Step 5: Update the flight deck**

Add `COCKPIT_DIR="$HOME/dg-cockpit"`. Change only the engineering Claude and Tower launch commands to the approved `--plugin-dir` forms. Do not change Studio's working directory, launch command, comments, or covenant.

- [ ] **Step 6: Update bootstrap, backup, and ignore rules**

Expand bootstrap progress labels to seven stages and run `"$REPO/autonomy/install.sh" --activate` after host configs and before data restore. In backup, run `autonomy/verify.sh --source-only` before staging; source is already under the repo, so do not copy runtime caches back. Ignore `.dg-autonomy/`, `autonomy/.state/`, `autonomy/.smoke/`, and generated plugin caches, but keep the generated source adapters tracked.

- [ ] **Step 7: Run the complete isolated suite**

Run:

```bash
node --test autonomy/tests/*.test.mjs
autonomy/verify.sh --isolated
git diff --check
```

Expected: all Node tests, native validators, supply-chain scan, isolated installs, repeated installs, uninstall, and whitespace checks pass.

## Task 9: Document Operation, Rollback, and ASW Limitations

**Files:**
- Create: `autonomy/README.md`
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-08-09-dynasty-autonomy-layer-design.md` only if implementation reveals a factual mismatch

- [ ] **Step 1: Write documentation assertions**

Extend cockpit tests to require documentation for the four commands, role matrix, both terminal states, hard gates, staged activation, verification commands, uninstall/rollback, pinned ASW commit/license, incomplete-ASW behavior, and Studio/Tower boundaries.

- [ ] **Step 2: Run the documentation test and verify RED**

Expected: missing `autonomy/README.md` fails.

- [ ] **Step 3: Write the operator guide**

Document exact commands:

```bash
./autonomy/install.sh --check
./autonomy/verify.sh --isolated
./autonomy/install.sh --activate
./autonomy/verify.sh --live
./autonomy/install.sh --status
./autonomy/install.sh --uninstall
```

Explain that ASW is a pinned Gemini backend, not a universal dependency; unsupported capabilities stay absent. Include the role matrix, terminal-state meanings, no-commit gate, backup/ownership locations, new-Mac bootstrap behavior, rollback safeguards, and how to diagnose `BLOCKED`.

- [ ] **Step 4: Update the root README**

Add a concise Autonomy Layer section linking to `autonomy/README.md`, state which panes receive it, and reiterate that Studio remains independent and Tower remains health-only.

- [ ] **Step 5: Re-run documentation and full tests**

Run: `node --test autonomy/tests/*.test.mjs && autonomy/verify.sh --isolated`

Expected: all pass.

## Task 10: Activate One Host at a Time and Produce the Gate-Ready Handoff

**Files:**
- Runtime ownership/backups only beneath `~/.dg-autonomy/`
- No repository source changes expected unless a validator exposes a compatibility defect

- [ ] **Step 1: Record pre-activation hashes and lists**

Capture SHA-256 hashes of existing Claude, Codex, and Antigravity settings/hooks without printing contents. Capture `claude plugin list`, `codex plugin list`, and `agy plugin list`. Confirm `carrier.log` and `delivery.db` remain the only pre-existing dirty files.

- [ ] **Step 2: Activate through the installer**

Run: `./autonomy/install.sh --activate`

Expected sequence: all source/isolated validation passes first; Claude remains launch-path-only; Codex marketplace/plugin is registered; Antigravity plugin is installed; flight deck is backed up and updated; ownership record is written.

- [ ] **Step 3: Verify hosts in rollout order**

Run native validation and harmless disposable checks in this order: Claude engineering, Codex, Gemini, Tower, Studio non-regression. Use temporary repositories/worktrees and goals that create only disposable text fixtures. Do not commit or publish. Clean every temporary worktree and fixture after collecting evidence.

- [ ] **Step 4: Verify configuration preservation**

Recompute pre-activation hashes. Expected: Claude/Codex/Antigravity settings and hooks are unchanged except native CLI-owned plugin registration fields already covered by the ownership record; no permission block is broadened. Studio launch line remains exact.

- [ ] **Step 5: Run final verification**

Run:

```bash
./autonomy/verify.sh --live
node --test autonomy/tests/*.test.mjs
git diff --check
git status --short
```

Expected: all checks pass. Repository changes remain uncommitted. `carrier.log` and `delivery.db` are untouched and excluded from the autonomy diff review.

- [ ] **Step 6: Produce the gate-ready handoff**

Report:

- hosts activated and exact versions;
- tests/validators/smoke scenarios and results;
- ASW source commit and retained limitations;
- settings/hook preservation evidence;
- owned runtime paths and rollback command;
- repository files changed;
- explicit terminal state `READY_FOR_GATE` or concrete `BLOCKED` reason;
- next human action, with no commit, push, merge, or publication performed.
