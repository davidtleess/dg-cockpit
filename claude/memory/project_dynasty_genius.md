---
name: Dynasty Genius project state
description: What has been built in dynasty-genius, key decisions, and what comes next
type: project
originSessionId: 97a692d2-b28f-4943-af9e-aa0310451d58
---
Project at: /Users/davidleess/dynasty-genius. FastAPI backend + `src/dynasty_genius/` package + React/TS `frontend/`. Superflex PPR, single-user (David). Governance-first.
IMPORTANT: the local checkout is often FAR behind origin/main (was 793 commits / PR#19 vs PR#95 on 2026-06-30). ALWAYS `git fetch` and review origin/main (worktree it) before assessing — local state lies. gh authed as davidtleess; repo davidtleess/dynasty-genius.

**Why:** Personal dynasty intelligence system. Mission = continuous dynasty value for ALL QB/RB/WR/TE (roster, rookies, waivers, opponents).

## 2026-07-01 increment (PRs #96-#105, origin/main @ dff3cc5)
Additive UI-surfacing increment (no paradigm shift): No-Verdict program CLOSED OUT (#96); new read-only surfaces Roster Capacity Sandbox (#98/#99, GET /api/roster/capacity) + Daily What-Changed UI (#100/#102); Realized-Outcome Scorecard API+UI SHELL scaffolded (#104) = front half of BUILD-1 but returns `200 inactive` with NO real data until ~Sept 2026 (first finalized 2026 NFL week). KEY INSIGHT: BUILD-1 (edge-proof) is now CALENDAR-GATED — verdict can't render until back half of 2026 season; spend interim on BUILD-2/3/4 + pre-writing the graduation bar (DECIDE-1). Report holistically updated + Desktop copy refreshed.

## Current reality (origin/main @ PR #95, 2026-06-30)
- TWO-CODEBASE GAP IS CLOSED: modern `src/dynasty_genius` PVO layer is the single source of truth; routes assemble PVOs live via `pvo_assembler.py` + fail-closed seed/runtime resolver (`pvo_source.py`). Static prospect_cards.json retired.
- FULL React/TS frontend (Vite, React 19, Zod, generated OpenAPI client). 8 surfaces; LIVE: Trade Lab, Roster Audit, League Pulse, Trust Console, Player cards. Placeholders: Rookie Board, Waiver Radar, Research Assistant.
- Trade Lab = two-lane (model xVAR vs FantasyCalc market) + RC-v1 roster-capacity forced-cut net value-at-risk ranges. No-Verdict Line enforced by a banned-language LINTER in CI.
- War Room #2: daily point-in-time capture (FantasyCalc/model/outcome) + what-changed diffs, run via macOS LaunchAgents (ops/launchd/*.plist) writing gitignored SQLite. Realized-Outcome Loop + Gate-4 divergence-edge validator both live (diagnostic).
- Three-agent "cockpit" TDD: Claude=GREEN impl, Codex=RED/falsifier, Gemini=strategy/UX. Governance caught a real bug (Tyler Conklin duplicated 128×/season = 35% of TE rows → TE v3 re-derivation).

## Models
- Engine B (active players) LIVE since ~2026-05-12: Ridge, rich usage features (snap/route/YPRR/TPRR/air-yards/EPA/CPOE/dual-threat/aging curves), 2yr-fwd PPG target. R²=0.621 Spearman=0.775 on 752-row holdout, beats naive baseline 3/3. TE v3 = grade ACTIVE_B. BUT all surfaces still `decision_supported: false`; Trust Console states edge UNPROVEN (statistically tied w/ DynastyProcess ECR consensus, NDCG-diff CIs include zero).
- Engine A (rookies) UNCHANGED/stale: still 3-feature pick/round/age (run 20260502T153931Z). WR C(R²0.41)/RB C(0.51)/TE C(0.20)/QB D(-0.21). CFBD enrichment defined but unpromoted (backtests didn't beat baseline). Now a nav placeholder.
- Databricks gen_alpha.* medallion configured + hourly refresh but NOT in the hot API path.

## The central tension NOW (see docs/product-report-2026-06-30.md, IDs BUILD/AVOID/DEBT/DECIDE)
Models work but no proven edge over free market/consensus; nothing is decision-grade yet. Priorities: BUILD-3 harden single-laptop capture (unrecoverable gap risk); BUILD-1 prove-or-disprove edge on ONE surface + define what flips decision_supported=true; BUILD-2 revive-or-park rookie engine; BUILD-4 Superflex-QB (weakest in both engines, most valuable position).

## Key data
- Redzone Champions League ID 1183088915091423232; David roster_id 1 (Woodbury Riders), 4-24 in 2025, heavy rebuild. Live sources: nflreadpy, Sleeper, FantasyCalc + MFL ADP (market overlays only). Stubbed/deferred: CFBD(contract-only), PlayerProfiler(<80% coverage), RAS, KTC(ToS).
- Training: app/data/training/prospects_with_outcomes.csv (874 rows); engine_b_features_v2.csv (~2742 rows). Full test suite needs Python 3.11+.

## How to apply
Backend: `uvicorn app.main:app --reload --port 8000`. Frontend: `cd frontend && npm run dev`; governance lint `npm run test:governance`. Multiple git worktrees exist (main product at /Users/davidleess/dynasty-genius-product).
