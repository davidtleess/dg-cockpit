# Dynasty Autonomy Layer

This layer gives the Dynasty Genius engineering panes one safe contract while keeping each host native. Claude and Codex use their installed Superpowers workflows. Gemini uses a repaired, pinned Antigravity Swarm (ASW) backend. It is not a universal ASW installation.

## Roles

| Role | Autonomy surface | Boundary |
| --- | --- | --- |
| Claude | Planning, edits, tests, browser QA, review through Superpowers | PreToolUse policy hook plus native permissions |
| Codex | Planning, edits, tests, browser QA, review through Superpowers | Plugin PreToolUse policy hook plus native sandbox and approvals |
| Gemini | Planning, edits, tests, browser QA, review through pinned ASW | PreToolUse policy hook plus native permissions |
| Tower | Product health, freshness, and model-honesty verification only | No engineering or orchestration |
| Studio | None; Studio remains independent | No crew plugin or product-repository writes |

The engineering skill commands are:

- `dg-auto <goal>` — take an authorized goal through implementation and verification.
- `dg-plan <goal>` — inspect and write a test-first implementation plan without product edits.
- `dg-review` — review the worktree, evidence, real surface, security, and cleanup.
- `dg-status` — report scope, worktree, phase, checks, blocker, and terminal state.

Every terminal run ends exactly `READY_FOR_GATE` or `BLOCKED`. `READY_FOR_GATE` requires fresh receipts for tests, static analysis, real-surface QA, review, and cleanup; zero or incomplete receipts become `BLOCKED`. `BLOCKED` names the concrete condition and smallest action needed to resume.

## Hard gates

The layer never authorizes commit, push, merge, release, publication, destructive work, permission escalation, unapproved scope expansion, or external communication. Claude, Codex, and Gemini hooks deny supported tool calls, wrapped hard-gate commands, opaque inline interpreters, and writes outside the authorized worktree. Malformed hook input fails closed. Native host sandboxes and permission engines remain the final boundary: tool hooks are guardrails, not a claim that arbitrary programs can be proven safe by static command inspection. The third failure of the same required verification becomes `BLOCKED`.

Existing user changes, host settings, hooks, and permissions are preserved. Autonomous work belongs in a dedicated worktree. Run state is stored below the worktree's git directory, not in product source.

## ASW compatibility

ASW is vendored from `https://github.com/wjgoarxiv/antigravity-swarm` at audited commit `a949cb8b9736115c555bf493eeb009ccb28a703e`, upstream version `0.2.4`, under the MIT license. The upstream installer is never run.

The original ASW capabilities are incomplete for the current Dynasty host mix: its upstream packaging does not validate natively for Claude or Codex, and its older installer targets legacy Gemini configuration. The Dynasty adapter exposes only the vetted Gemini skills, agents, scripts, and hooks that validate in the current Antigravity CLI. Unsupported capabilities stay absent; the layer does not claim false parity.

## Install and verify

From the `dg-cockpit` root:

```bash
./autonomy/install.sh --check
./autonomy/verify.sh --isolated
./autonomy/install.sh --activate
./autonomy/verify.sh --live
./autonomy/install.sh --status
```

`--check` and `--isolated` do not change live host configuration. Activation validates first, backs up the live flight deck, registers the repo-local Codex marketplace and plugin, installs the Antigravity plugin, and writes an ownership record. Claude plugins load by explicit flight-deck path rather than modifying global Claude settings.

Codex requires a human to review and trust a new or changed plugin hook hash. After activation, start a fresh Codex session, run `/hooks`, inspect the `dg-autonomy` `PreToolUse` command, and trust it. This trust review is intentionally not bypassed by the installer. See the [official Codex hooks documentation](https://developers.openai.com/codex/hooks).

The new-Mac `bootstrap.sh` restores base host configuration before activation. `backup.sh` verifies repository source but does not copy generated plugin caches or run state.

## Ownership and rollback

Runtime ownership and backups live under `~/.dg-autonomy/` by default:

```text
~/.dg-autonomy/
├── install.json
├── bin/dg-autonomy -> <owned source>/autonomy/core/bin/dg-autonomy.mjs
├── backups/dynasty_flight_deck.before.sh
└── history/
```

To roll back only what this layer owns:

```bash
./autonomy/install.sh --uninstall
```

Uninstall removes the owned Codex plugin and marketplace, removes the owned Antigravity plugin, and restores the recorded flight-deck backup. If the live flight deck or backup changed after activation, uninstall stops `BLOCKED` and preserves both versions. It never rewrites Claude, Codex, or Antigravity settings or permission blocks.

## Diagnosing `BLOCKED`

Run `"$HOME/.dg-autonomy/bin/dg-autonomy" status` inside an active engineering worktree and `./autonomy/install.sh --status` for installation ownership. Then run `./autonomy/verify.sh --live`. Live status checks source paths, flight-deck hashes, the CLI launcher, and current Codex and Antigravity registrations; repeated activation repairs missing owned registrations but refuses to overwrite an externally changed flight deck. Use the first failing check and its evidence as the resume point.
