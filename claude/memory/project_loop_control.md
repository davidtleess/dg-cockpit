---
name: project-loop-control
description: "Loop-control build state (2026-08-12) — built and green in dg-cockpit working tree, awaiting Codex review + David's commit/activate/D5 words; cockpit backup law auto-commits worktrees"
metadata: 
  node_type: memory
  type: project
  originSessionId: 26f1041e-2e14-44c4-a4a2-12ffeee413bb
  modified: 2026-08-27T20:50:30.154Z
---

Loop control (severity budget · 5/10 round caps · diminishing-returns detector · bounded stop hooks · PreToolUse terminal deny) was BUILT and made DURABLE 2026-08-12 (dg-cockpit 033b883 committed+pushed; product-repo docs a6cb629 committed, push gated) on David's word "build it yourself" (Codex lane was frozen), TDD against spec F1–F22. Spec of record + §7 disposition + §8 as-built: `dynasty-genius-product/docs/superpowers/specs/2026-08-12-loop-control-design.md`. Code: `dg-cockpit/autonomy/` (core/lib/loop-control.mjs, run-state v3 w/ revision conflicts, CLI round verbs, Dynasty-bounded Antigravity stop hook, Claude/Codex stop hooks, terminal deny in all three tool policies). Serial suite 50/51 green; the 1 failure is the PRE-EXISTING flight-deck launcher-path test.

**JUDGE LANE added same day (David: "the judge rules and we ship what the judge rules — the judge can consult Tower"):** standing binding adjudication seat, NEW dedicated lane (not Gemini), pane 2.3 in the Studio–Tower window, charter `~/.claude/agents/judge.md`, wired in flight deck §7b. Gate verdict renamed ADJUDICATION_REQUIRED; caps + diminishing returns + early referrals route to the Judge; SHIP ruling → READY_FOR_GATE and hooks permit exactly `git commit` of the ruled content (no push/edits); STOP → parked for David. Judge can never override verification failures. Seeds J1–J8 green.

**JUDGE PANE MADE PERMANENT 2026-08-13 (David's word: "permanently placed in the studio tower window and used going forward"):** the crash+relaunch that morning came up judge-less because the LIVE `~/dynasty_flight_deck.sh` had never received the committed §7b wiring (activation was gated), and the backup daemon had copied the stale live file back OVER dg-cockpit's working copy — an uncommitted deletion of the judge wiring that the backup law would have auto-committed. Fixed: both files restored byte-identical to dg-cockpit HEAD (verified `git diff` empty), pane 2.3 spawned live and verified running `@judge` in the product repo. Judge pane came up in **manual permission mode** — mode choice not yet put to David.

**ACTIVATION DONE 2026-08-13 (David's word "yes activate codex and gemini"; he ran `install.sh --activate` himself after the classifier blocked Tower):** Codex `dg-autonomy@dynasty-autonomy` installed+enabled 0.2.0, Gemini plugin at `~/.gemini/config/plugins/dg-autonomy`, flight deck installer-owned with §7b. **Installer gotcha:** it hash-guards the live flight deck against its manifest (`~/.dg-autonomy/install.json`) — hand-editing `~/dynasty_flight_deck.sh` trips `BLOCKED: changed outside Dynasty ownership`; the sanctioned path is restore-recorded-state → let `--activate` render from source. **Verdict gotcha:** diminishing-returns fires only on a BLOCKER left unresolved across the 3-round window; resolved WARNs with tiny churn stay CLEAR_ELIGIBLE. End-to-end drill proven same day: PHASE_ROUND_CAP → ADJUDICATION_REQUIRED → judge pane ruled.

**COURIER MACHINERY 2026-08-14/15 (David: "correct - thats what needs to be built"):** three wires replaced Tower-as-messenger — (1) **docket clerk** (`core/lib/docket.mjs`, wired into stop hooks): fired loop gates auto-deliver to the ⚖ judge pane, marker-verified, receipt-idempotent, never dockets check-failure blocks or already-ruled runs; `docket-sweep.mjs` is the retry guarantor. (2) **`dg-autonomy release --as <label> --word "..."`**: David-run archive of terminal runs (byte-preserved rename + receipts + releases.jsonl audit) — RETIRES the hand-`mv` ritual; lanes denied via release hard-gate classification. (3) **resume wire** (`resume-wire.mjs --loop`, flight-deck-started, pidfile-idempotent): wakes the implementer pane on reviewer CLEAR, one wake per event via receipts. All at dg-cockpit f3d0291; suite 72/73 (known launcher-path failure). First real judge ruling was a STOP (fail-open QB-1 publication gate + false safety record) — remediation David-authorized same night.

**Still gated (David's words, not given as of 2026-08-13):** product-repo push · D5 ruling (combined-window vs per-round churn threshold — built combined). §9 authority transfer RATIFIED (David's word 2026-08-12 evening). Codex after-the-fact CLEAR review pending on the whole increment.

**Why (environment gotchas):**
- The dg-cockpit **backup law commits and pushes the whole repo**, including any lane's uncommitted mid-build work — a 13:50 ET backup (5836106) pushed a broken RED-era intermediate during the build. "No commit until David's word" is not protected from the backup daemon in dg-cockpit.
- Parallel `node --test tests/*.mjs` (verify.sh's invocation) hung once >6 min inside installer-test's `install.sh --status`; standalone/serial deterministic. Root cause not established; recommend `--test-concurrency=1` in verify.sh.
- verify.sh --isolated aborts at the pre-existing flight-deck test (`set -e`); remaining steps (sync check, scan-tree, all three plugin validations) pass when run individually.
- **CORRECTION 2026-08-19 (verified): the SCHEDULED backup failure is NOT the flight-deck/`cockpit.test.mjs $HOME` assertion.** `launchctl list` shows `com.davidleess.dg-cockpit-backup` exit **127**, and `/tmp/dg-cockpit-backup.log` holds four × `node: command not found` at `autonomy/verify.sh:13`. `backup.sh:6` sets PATH to only `/usr/local/bin:/opt/homebrew/bin`; node lives under `~/.nvm/versions/node/*/bin`. Under `set -euo pipefail` it aborts **before `git add -A`**, so execution never reaches any test. Last auto-commit 2026-08-09; dead ~10 days, masked by manual pushes. Fix = absolute-path node in verify.sh, not test surgery.
- **✅ FIXED 2026-08-27 (dg-cockpit `680614a` + `d90e0f6`):** backup.sh now prepends the newest
  `~/.nvm/versions/node/*/bin` + `~/.local/bin` to PATH (cures the 127), AND verify no longer
  blocks preservation — snapshot commits/pushes first, a red verify exits nonzero loudly at the
  end. Three stalled days (08-24→08-27) were caught up manually and verified on origin. verify
  still fails HONESTLY on autonomy WIP (adapter drift + red `node --test`) — that belongs to the
  autonomy lane, preserved as-is in 680614a.

Related: [[project_dynasty_genius]], [[tower_role_v2]]

## Context-handoff protocol + Tower-held trigger (2026-08-15)
David's design (finish→handoff→/clear→fresh session, never compact) LIVE for lane 1.1 only
(floor 30) since 12:14Z — dg-cockpit handoff.mjs, reviewed twice by Tower (4 defects fixed,
CLEAR at 817097d), activated on David's conditional word after the CLEAR. **STANDING ORDER
(committed ae1edff, David verbatim: "ok add codex when the burn-in passes"): Tower's burn-in
audit of the FIRST REAL 1.1 CYCLE is the trigger.** On Tower PASS: Codex extension builds
without re-asking (clear verb → clearCommand hook; paste-settle in deliverToPane; Codex boundary
signatures), Tower reviews, David flips 1.2 into the config. Receipt trail of the first cycle is
preserved untouched for the audit (helper commitment). Codex was at ~20% remaining on 08-15 —
below floor, uncovered; watch it.
