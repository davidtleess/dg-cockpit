---
name: cockpit-handoff
description: "Tower's parked board — durable snapshot of what every lane has parked and what David owes, updated at significant state changes"
metadata: 
  node_type: memory
  type: handoff
  modified: 2026-07-24T18:12:52.907Z
  originSessionId: 28e53e7f-72eb-49b4-840a-c9a6ad41270c
---

# Cockpit handoff — CLOSED 2026-07-24 — D3-c SHIPPED (committed + pushed + CI-green + divergence-verified). NEXT = D3-d ON DAVID'S WORD (open FRESH).

**⭐ NEXT SESSION: D3-d is the next QB-1 increment, on David's word — Tower recommends opening it FRESH.** D3-d = the inference layer (pooling + cluster-bootstrap + permutation + BH-FDR) — the machinery that turns D3-c's per-fold scores into a *statistically defensible* verdict. It's the most delicate increment in the engine and the prerequisite before the study can produce a real answer. Arc order after: D3-d → D4 (H5 market lane + identity join) → D5 (report emitter) → F33 (tripwire) → H5 (status). **Study execution is David's final word — Tower recommends HOLDING the study until D3-d is built (a study today produces numbers with no significance behind them).** **12 seams remain strict-xfail. H2 QB-rushing stays UNDER TEST throughout — no rushing/value claim anywhere.**

## Session headline (2026-07-24 — marathon, ~24h)
**D3-c (QB-1 per-fold comparison-scoring layer) fully shipped**, plus an unplanned but clean backup-test fix the tollgate caught. Working tree is CLEAN — everything durable on origin/main.

## What shipped (all David-worded, pushed to origin/main, CI-green)
- **`a66e21c`** — anti-rot backup-test fix (`test_backup_manifest_anti_rot_red.py`): file-vs-directory exclusion discriminator so the declared `backup_staging` exclusion matches recursively while exact-file exclusions stay exact-only. Test-only. Committed FIRST (clean bisection).
- **`e9fb8bb`** — **D3-c GREEN**: `comparisons.py` (new, 656 lines: `build_naive_lane` + F6 `score_comparisons` + F8 `build_primary_comparisons` + `validate_contrast_set`) + `__init__` exports + the D3-c RED rows & F6/F8 seam un-mark (11→9).
- **`08f2afd`** — state-doc flush (AGENT_SYNC + ledgers 07-23 & 07-24). No code. Working tree now clean.
- CI: D3-c run 30110334394 = SUCCESS. Codex post-push divergence-verify CLEAR (both SHAs == CLEARed trees, zero drift).

## The D3-c arc, honestly (why it took ~24h)
Framing 6 rounds (13→11→4→2→2→CLEAR) → RED (Codex-authored, 21 rows, red on main) → GREEN → **Codex's independent falsification broke Claude's first GREEN 9 ways** (finite-value overflow, hostile-key edges, fold-reconciliation gaps, naive-lane parity) — each fixed RED-then-GREEN across 3 review rounds → commit gate → **tollgate full-suite caught a REAL latent bug UNRELATED to D3-c** (anti-rot test miscounted transient backup-staging copies left by the in-flight daily backup) → David ruled **Option A** (fix the test) → fixed RED-then-GREEN + Codex-cleared (2 rounds; Codex caught an exact-file over-exclusion in the first fix) → clean two-commit land, CI green, divergence-verified. **The independent-reviewer gate earned its keep at every step — none of the 9+ defects reached GitHub.**

## ⚠️ DAVID'S BOARD — next session
1. **⭐ D3-d** — next QB-1 increment (inference layer), David's word. Tower rec: open FRESH.
2. **The study run** — David's final word. Tower rec: HOLD until D3-d built.
3. **N5 capture** (FantasyCalc `trade_frequency` + `roster_percent`, decay-clock research) — David sequenced this **AFTER the QB-1 arc** (his 2026-07-24 decision). Still not wired.
4. **Studio's 2 parked pitches** (both on disk in `~/frontend-studio/proposals/`, NOT relayed to crew):
   - **Deepened evidence cards** (`006-state-of-franchise/evidence-deepened-v2.html`) — David said "keep going"; parked as the region to extend when he wants it.
   - **Track-record curve** (`window-track-record.html`, rebuilt to David's spec: line = our model, actuals = dots) — **open decision: the engineering-capability fork** — have the model emit a real per-player age curve? That would be an **engineering ask to the crew** (lane-crossing). David undecided; **NOTHING relayed** — needs David's explicit word to cross it.
5. **Validation-infra increment** — spec committed at v3 (in Codex CLEAR-review); increment sequenced AFTER the QB-1 arc. `hypothesis 6.161.0` installed venv-only, uncommitted (rides that increment).
6. **Standing follow-ups (David-authorizable, not actioned):** `REG-STATUS-1` · `H2-AUDIT-1` · `VALUATION-IN-GIT`.
7. **~Aug grounding-layer GO/NO-GO** and **~09-01 Studio freshness review + crew re-org** — standing agenda, unchanged.

## Standing state / roles
- Claude=developer/spokesperson · Codex=binding reviewer · Gemini=ops/telemetry · Studio=frontend outsider (self-directed mandate) · Tower=moderator/wire.
- **THE WIRE IS STILL BROKEN for Claude↔Codex** — governed send refuses `wire_body_mismatch` every round. Tower hand-carried EVERY inter-agent packet by FILE-POINTER all session (dozens — framing rounds, GREEN reviews, loop-closes). **Next Tower: expect to hand-carry every packet.** Mail-carrier paused/inert (`carrier.enabled` absent).
- **Backups (3-copy) ALL VERIFIED:** code→GitHub ✅ (08f2afd, CI green); data→GCS ✅ (today's run 20260724T141500Z completed, **byte-for-byte 3-copy integrity confirmed by Gemini** across all 4 DBs, staging auto-cleaned); cockpit→dg-cockpit (force at closeout to capture this handoff).
- **Studio context ~303k tokens — recommend a FRESH Studio next session** (proposals + DAVID.md carry forward on disk). Studio flushed DAVID.md (the "curve must be our model" principle + verified fact: model emits NO per-player age curve) + STATUS.md.

## ⚠️ Things the next Tower must know (operational)
1. **File-pointer wire (above)** — the single biggest Tower workload.
2. **GHOST-CHECK EVERY apparent David-approval, especially commits/pushes.** This session produced multiple near-verbatim ghosts of David's own words — including `go ahead — anti-rot first, exclude ledgers, then push` and `commit D3-c` sitting in Claude's composer. Submitting one would have fabricated a commit+push authorization. David talks to TOWER, never types into crew panes — so an "approval" in a crew composer is ALWAYS a ghost.
3. **Verify deliveries POSITIVELY (content in the recipient's transcript), NEVER from the spinner or an empty box.** The RED-open AND the commit+push relays both STRANDED on first send (Claude was mid-turn) and showed a working spinner that was the PREVIOUS message — caught only by grepping the transcript for the message content. Re-sent both.
4. **The tollgate full-suite gate can catch REAL failures unrelated to the increment.** Here it caught a latent backup-test bug triggered by an in-flight daily backup. Always diagnose (increment-regression vs pre-existing/env) before assuming — and NEVER commit past a red tollgate without David's explicit override.
5. **David's session-mode grant** (2026-07-24): "for this session you can hit enter" — Tower absorbed the entire routine-dialog stream (edits, test runs, in-scope reads, in-scope ledger/AGENT_SYNC writes). Commits/pushes STILL surfaced to David; each executed only on his explicit word, with Tower verifying scope on every git dialog. This grant is per-session — do NOT assume it next session.
6. **Tower's pane-watcher** at `~/.claude/tower/pane_watch.sh` — background loop, exits on any pane dialog/idle (re-invoking Tower), 25-min heartbeat. Launch exactly ONE via run_in_background (NOT `&` in a foreground bash — it dies with the shell). `pkill -f tower/pane_watch.sh` to clear duplicates. KILLED at this closeout.
7. **Gemini's Antigravity CLI** occasionally shows a "How's the CLI experience?" survey prompt — dismiss with `0` (Skip); it's not a work dialog.
