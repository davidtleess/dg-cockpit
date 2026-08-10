# Dynasty Autonomy Layer Design

**Date:** 2026-08-09  
**Status:** Approved design; implementation pending  
**Source:** Superpowers brainstorming workflow

## Summary

Build a Dynasty-owned autonomy layer that gives the engineering agents—Claude, Codex, and Gemini—a common goal-to-gate workflow while preserving each runtime's native strengths. Reuse Superpowers where it already works, repair and pin the useful parts of Antigravity Swarm (ASW) for Gemini, and provide small host-native adapters instead of forcing one plugin format across incompatible runtimes.

Tower remains a product-health verifier, not an engineering orchestrator. Studio remains an independent fresh-eyes design environment and does not receive the shared engineering layer.

The system may inspect, plan, edit, test, run browser QA, delegate bounded subtasks, and self-review autonomously. It must stop before commit, push, merge, destructive operations, permission escalation, or unapproved scope expansion. Every autonomous run ends in `READY_FOR_GATE` or `BLOCKED`.

## Goals

- Give Claude, Codex, and Gemini consistent autonomy commands and terminal states.
- Let each engineering runtime use its native planning, implementation, testing, and review capabilities.
- Make ASW useful even though its current cross-host packaging and capability coverage are incomplete.
- Preserve Tower's health/freshness/model-honesty charter.
- Preserve Studio's separation from crew governance and product-repository writes.
- Make installation repeatable, auditable, reversible, and safe around existing user configuration.
- Fail closed when a hook, permission check, validator, or scope check cannot establish safety.

## Non-goals

- Making ASW the universal runtime for all Dynasty roles.
- Replacing Superpowers in Claude or Codex.
- Turning Tower into an orchestrator, engineer, relay, or product decision-maker.
- Adding team roadmaps, backlogs, governance, or crew machinery to Studio.
- Granting blanket shell, filesystem, network, or destructive permissions.
- Automating commits, pushes, merges, releases, or other external publication gates.
- Guaranteeing identical internal behavior across Claude, Codex, and Gemini.

## Selected Approach

Use a **Dynasty Autonomy Layer** with a shared contract and host-native adapters.

Alternatives rejected:

1. **Install ASW everywhere.** Rejected because the upstream package currently targets an older Gemini/Antigravity layout, does not validate as a Claude plugin, does not provide a Codex plugin manifest, and duplicates capabilities already supplied by Superpowers.
2. **Repository instructions only.** Rejected because prose alone cannot provide reliable installation, host validation, terminal-state enforcement, rollback, or hook-level safety checks.

## Shared Contract

The engineering adapters expose four conceptual commands:

- `dg-auto <goal>` — run the complete autonomous engineering workflow to a human gate.
- `dg-plan <goal>` — inspect context and produce an implementation plan without editing product code.
- `dg-review` — review the current worktree changes, tests, and relevant real surfaces.
- `dg-status` — report current scope, phase, checks, blockers, and terminal state.

Adapters may express these commands using the host's native skill or command mechanism. Their external behavior must remain consistent even if internal implementation differs.

Every run records:

- requested goal;
- authorized repository and scope;
- isolated worktree path and branch;
- current phase;
- validations attempted and results;
- files changed;
- remaining human gate;
- terminal state: `READY_FOR_GATE` or `BLOCKED`.

`READY_FOR_GATE` means the authorized implementation and verification work is complete and the next action requires human approval. `BLOCKED` means safe autonomous progress is no longer possible; it must include the concrete blocking condition and the smallest action needed to resume.

## Role Boundaries

### Claude, Codex, and Gemini

May autonomously:

- inspect authorized repositories and documentation;
- clarify scope from available local evidence;
- create an isolated worktree;
- plan and implement changes;
- run tests, linters, type checks, builds, and browser QA;
- delegate bounded subtasks when the active runtime permits it;
- review their own changes and collect evidence;
- prepare a gate-ready handoff.

Must stop before:

- commit, push, merge, release, or publication;
- destructive operations or irreversible data changes;
- permission escalation;
- modifying repositories or systems outside the authorized scope;
- external communication or coordination not explicitly authorized;
- expanding the goal in a way that materially changes the requested outcome.

### Tower

Tower receives a dedicated `dg-tower` adapter for product-health verification only. It may inspect product state, freshness signals, and model-honesty evidence and may update its own permitted boards or memory. It may not edit product code, orchestrate engineering agents, relay or gate crew work, or make product decisions.

Tower reports health findings using `READY_FOR_GATE` or `BLOCKED` only when participating in an explicit autonomy-layer verification run; this does not change its standing charter.

### Studio

Studio receives no ASW, autonomy, or crew plugin. It retains its existing tools and fresh-eyes covenant. It may research, inspect the live product, and create prototypes or proposals inside `frontend-studio`, but it may not write to the product repository or acquire team roadmap, backlog, governance, or orchestration responsibilities.

The installer and verifier must prove that Studio cannot discover the Dynasty engineering layer through its launch configuration.

## Run Lifecycle

```text
request
  -> establish authority and scope
  -> create isolated worktree
  -> produce native plan
  -> implement
  -> run tests and static checks
  -> run relevant real-surface QA
  -> perform independent review
  -> READY_FOR_GATE
```

At any phase, the run transitions to `BLOCKED` when:

- authority or scope cannot be established;
- a requested operation crosses a hard gate;
- a hook or policy check fails or is malformed;
- the same required verification fails three times without a materially new remedy;
- required credentials, permissions, or external state are unavailable;
- pre-existing user changes cannot be safely preserved;
- cleanup cannot be completed safely.

Pre-existing user changes must never be overwritten, discarded, stashed, committed, or absorbed into the autonomous change set without explicit approval. Each run uses a dedicated worktree so unrelated working-tree state remains untouched.

## Architecture and Repository Layout

All source-of-truth files live in `dg-cockpit`:

```text
autonomy/
├── core/
│   ├── contracts/
│   ├── policies/
│   └── scripts/
├── vendor/
│   └── antigravity-swarm/
├── antigravity/
│   └── dg-autonomy/
├── claude/
│   ├── dg-engineering/
│   └── dg-tower/
├── codex-marketplace/
│   ├── .agents/plugins/marketplace.json
│   └── plugins/dg-autonomy/
├── tests/
├── install.sh
└── verify.sh
```

### Shared core

`autonomy/core` contains host-neutral contracts, policy text, terminal-state rules, and small validation helpers. It does not attempt to be a universal agent runtime. Host adapters copy or reference this contract in the form required by their platform.

### ASW vendor snapshot

Vendor the audited ASW source at commit `a949cb8b9736115c555bf493eeb009ccb28a703e`. Record its upstream URL, commit, license, and local modifications. Do not run the upstream installer.

Only capabilities used by the Gemini adapter are exposed. Incompatible packaging is repaired locally:

- use the current Antigravity plugin root layout;
- provide root `hooks.json` when hooks are enabled;
- use current plural `permissions` semantics;
- avoid writes to legacy `~/.gemini/config` paths;
- remove floating runtime downloads and undeclared dependencies;
- keep unsupported ASW capabilities absent rather than pretending they work.

### Claude adapters

`dg-engineering` supplies the shared engineering contract while routing planning, execution, TDD, review, and verification to installed Superpowers/native Claude capabilities. `dg-tower` contains only Tower-safe health verification behavior.

The flight deck launches engineering Claude with `dg-engineering` and Tower with `dg-tower`. Existing global Claude plugins, hooks, settings, and permissions remain unchanged.

### Codex adapter

Publish `dg-autonomy` through a private local marketplace rooted in `dg-cockpit`. The plugin contains a valid `.codex-plugin/plugin.json` and routes lifecycle phases to installed Superpowers/native Codex capabilities. Existing global Codex plugins, hooks, settings, and permissions remain unchanged.

### Antigravity adapter

Package the repaired Gemini adapter as a current Antigravity plugin installable with `agy plugin install`. It combines the shared contract with the audited, compatible ASW skills and agents. It does not broaden the user's Antigravity permissions.

## Installation and Lifecycle Management

`autonomy/install.sh` is idempotent and supports staged validation, activation, verification, and uninstall/rollback. It must:

- resolve paths relative to `dg-cockpit` rather than a caller's working directory;
- validate source manifests before touching live configuration;
- back up every live file it changes;
- never replace an existing settings or hooks file wholesale;
- install through host-native plugin commands where available;
- update only the relevant flight-deck launch commands;
- leave Studio's launch command unchanged;
- record installed version, source commit, generated paths, and rollback steps;
- support repeated runs without duplicate registrations or configuration drift;
- uninstall only files or registrations owned by the autonomy layer.

`bootstrap.sh` recreates the installation from repository source. `backup.sh` preserves source, manifests, and ownership records, but not generated plugin caches or ephemeral run state.

## Security and Supply Chain

- Pin ASW to the audited commit and retain its MIT license notice.
- Do not fetch code, packages, or instructions at autonomy-layer runtime.
- Do not depend on a floating branch, tag, or remote installer.
- Scan vendored and generated files for secrets, tokens, private logs, caches, and machine-specific credentials before activation.
- Treat malformed or missing safety hooks as failures, not warnings.
- Do not broaden Claude, Codex, or Antigravity permissions.
- Keep allow/deny decisions in host-native policy mechanisms; the shared layer documents the contract but does not bypass platform enforcement.
- Ensure command input is passed as data and not interpolated into shell code.
- Keep run artifacts local and exclude transient state from version control.

## Verification Strategy

### Native validation

- Antigravity validates all packaged skills, agents, manifests, and hooks.
- Claude validates both role-specific plugin packages.
- Codex validates the plugin manifest and private marketplace entry.

### Contract tests

- `dg-auto`, `dg-plan`, `dg-review`, and `dg-status` expose the required phases and terminal states in every engineering adapter.
- Forbidden operations transition to `BLOCKED` before execution.
- Scope expansion transitions to `BLOCKED`.
- Tower cannot access engineering implementation commands.
- Studio's launch configuration contains no autonomy-layer or ASW registration.
- Three repeated failures of the same verification transition to `BLOCKED`.

### Hook fixture tests

Test valid, denied, malformed, and missing hook fixtures for each host-specific format. Malformed output and hook execution failure must fail closed.

### Installer tests

Exercise fresh install, repeated install, verify, uninstall, and rollback in isolated temporary homes. Assert that pre-existing settings, hooks, and permissions are byte-for-byte unchanged except for explicitly owned registration fields. Assert that no permissions are broadened.

### Live smoke tests

After all isolated tests pass:

- run one harmless, disposable autonomy scenario in each engineering runtime;
- run one Tower product-health verification scenario;
- confirm Studio starts with its previous tool surface and no engineering adapter;
- verify cleanup of worktrees and transient state.

No product change from a smoke test may be committed or published.

## Rollout and Rollback

The implementation remains inactive until native validation, contract tests, hook fixtures, installer tests, supply-chain scans, and isolated-host tests pass. Activation occurs only after the exact rollback procedure and ownership record have been generated.

Roll out one host at a time in this order:

1. Claude engineering adapter;
2. Codex adapter;
3. Gemini/Antigravity adapter;
4. Tower health adapter;
5. Studio non-regression check.

After each host, run its native validator and smoke test before proceeding. A failure stops rollout and triggers rollback for that host without disturbing previously validated hosts.

Rollback removes only autonomy-layer registrations and generated artifacts, restores any explicitly modified launch file from its backup, and re-runs host validators. Existing global plugins and user permissions must remain intact.

## Acceptance Criteria

The design is implemented when:

- Claude, Codex, and Gemini can each take a bounded engineering goal through planning, implementation, verification, and review to `READY_FOR_GATE` without crossing a hard gate.
- A forbidden or unsafe request reliably ends `BLOCKED` before the operation occurs.
- Native validators pass for every installed adapter.
- Fresh/repeat/uninstall installer tests pass without configuration drift or permission broadening.
- Tower performs product-health verification without gaining engineering or orchestration powers.
- Studio's environment and launch behavior remain unchanged.
- The vendored ASW source is pinned, licensed, scanned, and never installed through its upstream installer.
- Existing unrelated worktree changes and global host configuration are preserved.
- The full test and verification evidence is available in a gate-ready handoff, with no commit, push, or merge performed automatically.

## Approved Decisions

- Primary outcome: more autonomous engineering capability for the Dynasty Genius team.
- Architecture: Dynasty Autonomy Layer with host-native backends.
- Engineering boundary: autonomous through edit/test/QA/review; stop at commit/push/merge/destructive/permission gates.
- Studio boundary: no shared engineering layer.
- Tower boundary: health verification only.
- Isolation: one worktree per autonomous run.
- Failure behavior: fail closed and use explicit `READY_FOR_GATE` / `BLOCKED` terminal states.
- Activation: only after the complete isolated verification suite passes and rollback is recorded.
