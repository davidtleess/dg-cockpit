# Memory Index

## 🚨 READ BEFORE CLAIMING ANY SEAT
- [**Cockpit session identity**](cockpit_session_identity.md) — loading this memory does NOT make you Tower; verify your tty against pane 2.2 first. A helper session assumed the seat 2026-08-13→15, the real Tower disavowed it, and David had to intervene twice.

## ⭐ READ FIRST — Tower's role
- [**Tower role v2 — product steward**](tower_role_v2.md) — **David-authorized 2026-08-08. SUPERSEDES
  every earlier description of Tower.** Steward of Dynasty Genius's operational health and David's
  spokesperson for it: data fresh · models honest · truth when he sits down, plus Studio's bridge and
  his dated commitments. **NOT an orchestrator, relay, gate or approval seat — those are surrendered.**
  **AMENDED 2026-08-18: David turned governance to near zero** — *"im ready to let the crew work
  freely and the judge to have its own free thinking. as well as you, tower."* The three-label ritual
  is retired as a format. The substance stands: do not claim something exists that does not, and cite
  what you ran. Two-week kill criterion from 2026-08-08.

## 🖥 THE MACHINE CHANGED — 2026-08-22
- [**MacBook Pro M5 (migrated from an INTEL Air)**](machine_macbook_pro_m5_migration.md) — no Rosetta, so migrated binaries cannot exec at all; plus the zsh `log` shadow, launchd's penalty box, and the gcloud/Gatekeeper traps that cost a session.

## Project state
- [**Season readiness sprint 2026**](project_season_readiness_2026.md) — **kickoff 2026-09-10, freeze 09-04.** Approved architecture plan + amendments Rev 2; **DO NOT edit XVAR_LAMBDA_ENGINE_B (retracted finding)**; git ahead/behind was reported inverted all session.
- [**David's rulings — DG 3.0**](david_rulings_dg3.md) — verbatim. **PPG = ALL GAMES (2026-08-19)** ·
  governance to near zero (2026-08-18) · **dg-build IS backed up as of 2026-08-23** — private remote `github.com/davidtleess/dg-build` created and pushed, all 35 tickets + SEASON-BRIEF.md on `origin/main`. (The 2026-08-22 "backed up NOWHERE" finding was true when measured and is now resolved. The stale dg-cockpit mirror at DG-034 is superseded, not repaired.)
- [**DG 3.0 build system**](project_dg3_build_system.md) — `~/dg-build/`: the ticket board (DG-001..035),
  the parallel-work protocol, and the worktree tooling. **Governance turned to near zero by David
  2026-08-18.** Its own git repo; **still NOT in backup.sh / `backup_manifest.json`** — its backup copy is GitHub (private remote added 2026-08-23), which is the code copy the three-copy architecture calls for.
- [Loop-control build](project_loop_control.md) — LIVE all lanes 2026-08-13 (judge pane permanent, Codex+Gemini activated on David's word, drill proven end-to-end); **2026-08-17: QB-1 program EXECUTED (run_status=ok, decision_supported=false held), readout reproduced byte-identical, accepted by David, LANDED and PUSHED (product repo level with origin, closeout commit 6fbe161) — the "product push gated" note is obsolete**; **gotchas: dg-cockpit backup law auto-commits worktrees; installer hash-guards the live flight deck — never hand-edit it; backup.sh verify.sh abort STILL blocks auto commit+push — but the CAUSE was misdiagnosed: verified 2026-08-19 it is exit 127, `node: command not found` at verify.sh:13, aborting before `git add -A`; NOT the cockpit.test.mjs $HOME assertion — Tower completes commit+push manually after byte-for-byte coverage verification (precedent 526cb03, 2026-08-17); the 23-round QB-1 run record f8f7551c was OVERWRITTEN without a .bak (custodial finding on Tower's board)**
- [**Architecture review + 3-way merge (2026-08-19)**](project_architecture_review_2026-08-19.md) — Master Proposal 2 on Desktop. **⚠️ the antigravity source doc carries a REG-only retrain step that REVERSES David's same-day "all games" ruling — strike it before working from that doc.**
- [OpenAPI regen trap](reference_openapi_regen_trap.md) — a dirty `frontend/openapi.json` can silently REVERT landed commits; always regenerate, never commit the working copy.
- [nflverse "unchanged" trap](reference_nflverse_unchanged_trap.md) — a stale nflverse DB mtime/ledger date means a HEALTHY idempotent capture, not lost data; contracts runs last and cannot roll back the stat streams.
- [Manager identity tracking](project_manager_identity_tracking.md) — David wants manager/team-name changes tracked; raw history already captured + backed up, only reconciliation missing (Layer 4, post-freeze).
- [Dynasty Genius project state](project_dynasty_genius.md) — what's built, model performance, Sleeper IDs, next steps
- [Frontend Studio outsider agent](project_frontend_studio.md) — Studio lane: ungoverned front-end agent in ~/frontend-studio. **Correction: David is no longer the message bus — Tower carries this lane, and it is Tower's only structural monopoly (STANDING WALL TW29-WALL-35 bars every crew lane from reading or touching it).**
- [Grounding-layer plan](project_grounding_layer.md) — kernel now (H2 guard + constitution honesty markup). **✅ GATE CLOSED 2026-08-14 — David ruled QB-1 GO, full build DEFERRED, no re-gate date. This line previously read "DUE NOW" and that staleness produced a false Tower claim to David on 2026-08-18. Not a live commitment.**
- [Backup architecture](reference_backup_architecture.md) — three-copy model: code→GitHub, data→GCS, cockpit→dg-cockpit repo; new-Mac bootstrap. **⚠️ `~/dg-wt` ticket worktrees are in NO copy — an unpushed `ticket/DG-NNN` branch is unbacked work (7 were, 2026-08-23); never recreate a worktree before its branch is pushed.**
- [David's research register](david_research_register.md) — track every research doc David sends
- [Frontier brainstorm handoff](project_frontier_brainstorm.md) — 07-17 four-dive brainstorm done; doc on Desktop

## About David
- [David's profile](user_profile.md) — background, experience level, Sleeper username, working style
- [Push not pull](feedback_david_workflow.md) — David rejects file/pull workflows; tell him in sentences, never point him at a file
- [Python environment](feedback_python39_syntax.md) — project venv is Python 3.14 now; old 3.9 constraints obsolete; avoid `round` as param name

## Other projects
- [Shayla's learning games](project_shayla_games.md) — single-file HTML games for David's daughter; the no-fail / one-input-per-game / drag-never-required design rules
- [BMW search project](project_bmw_search.md) — used-BMW market research; facebook-marketplace MCP connected; awaiting David's car list + scoping answers

## HISTORICAL — the orchestrator era. Context only; do NOT act on these duties.
Kept because they hold hard-won facts about the environment, not because their duties still apply.
- [Cockpit handoff](cockpit_handoff.md) — the parked board. **INHERITED CLAIM, never a source — verify against the artifact.**
- [Tower operating method](feedback_tower_situational_awareness.md) — 2026-07-27 correction: know state from source, never from your own prior messages. **This principle SURVIVES as Rule 2 of the v2 charter.** The orchestration machinery around it does not.
- [Ghost text in panes](feedback_ghost_text.md) — grey AI prompt-suggestions look like typed input in capture-pane; ALWAYS verify with `-e` (dim `\e[2m` = ghost). **Still live and still relevant — Tower reads Studio's pane.**
- [David's rulings 2026-07-25](david_rulings_2026-07-25_dg2.md) — DG 2.0 ruling set
