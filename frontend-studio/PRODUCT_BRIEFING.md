# Dynasty Genius — Product Briefing

*Compiled 2026-07-14 from three independent inspections of the codebase and the running application, reconciled and verified against the live app.*

Dynasty Genius is a single-user web application for managing one dynasty fantasy football team. It values every NFL player with its own machine-learning models, overlays market prices from FantasyCalc, and presents the two side by side across a set of read-heavy screens. It is wired to one specific Sleeper league (a 12-team Superflex PPR dynasty league; roster id 1 is the user's team). Every API payload carries `decision_supported: false`; the UI renders descriptive numbers with caveats and never renders buy/sell/win/lose verdicts. A banned-vocabulary check (`banned_vocabulary.json`) runs in both backend and frontend against player-analysis strings. Positive/negative gaps are not colored generic red/green.

The system has three layers: scheduled batch jobs (macOS launchd) that capture external data and build JSON artifacts each morning; a FastAPI backend that serves those artifacts (plus a few live computations) under `/api`; and a React single-page app served as static files by the same FastAPI process. It does not submit Sleeper transactions or alter the Sleeper roster in any way.

---

## 1. Screens

Navigation is a left rail in a fixed shell (dark theme, hardcoded — a light token palette exists in CSS but no toggle control exists). Routing is a hand-rolled `?surface=<slug>` query-param scheme; there is no router library; an absent or invalid value opens Daily What-Changed. A command palette opens on Cmd/Ctrl-K (text filtering, arrow keys, Enter, Escape; list options have no mouse click handler). A top status pill expands to a trust strip and data-freshness card; it currently displays "Status unavailable" (see §5). A right-hand "Inspector" aside shows a neutral player preview when a player is selected anywhere, with a button to open the full player evidence card.

### Daily What-Changed (default screen)
Data (`GET /api/league/what-changed`, from a report built daily at 09:45): a masthead with the date and a "Moves on the tape" count; a stale-data badge when the capture is ≥26h old; a model-output-changes region (per-player signed dynasty-value-score delta, percentile delta, above-replacement delta); a market-movement region split into "Your roster" and "Around the league" rows (value delta, current FantasyCalc value, 30-day trend) plus chips for players entering/exiting the valued universe; a current-roster-context block (team posture, team value aggregates, league opportunity counts, drop pressure, snapshot counts); and a context rail with capture/model provenance facts, feed diagnostics, and receipts. Zeros render as a neutral dash with a tooltip; sub-precision declines render as `-0`. A "Movement history" chart slot renders a permanent placeholder ("History accrues one verified capture per day; the line begins once enough days are on the books.").
Actions: expand/collapse "Show all N" on market rows. Nothing else is interactive.

### Roster Audit
Data (`GET /api/roster/audit`, computed live against the Sleeper API at request time): every QB/RB/WR/TE on the user's roster with model grade, model status, dynasty value score (DVS), age signal, signal completeness, and caveats; rows include both modeled and `PRE_MODEL` records; each row expands to a counter-argument, top drivers, risk flags, 1/2/3-year projections, xVAR, liquidity risk, and biological-debt fields; QB rows get an EPA/CPOE/DAKOTA context section. Age-cliff thresholds in code: RB 26, WR 28, TE 30, QB 33.
Actions (all client-side): sort select (aging urgency, age-cliff risk, age, signal completeness, xVAR), group select (position, depreciation band, xVAR bracket), position filter checkboxes, active/prospect filter, reset, per-row expand.

### Trade Lab
Data: an asset search (`GET /api/trade/assets?q=`, minimum 3 characters, rostered players + future picks); two side builders ("sends" / "receives"); on "Run comparison", two parallel POSTs — `/api/trade/reconcile` (model lane) and `/api/trade/reconcile/market` (market lane). The model lane shows side values, a parity band, value-at-risk and recovery ranges, an adjusted fairness delta range, and forced-cut candidates (the roster-capacity penalty). The market lane shows raw FantasyCalc totals per side, per-asset divergence labels, realism warnings, coverage gaps, and the market source timestamp. A divergence strip shows the model-lane and market-lane deltas as two separate facts; the two lanes can return different scales, availability, caveats, and transaction-rule states. A fixed caveat block states the panel does not calculate whether a trade is won or lost; `favors` fields returned by the API are not rendered.
Actions: search, click-to-add an asset to the active side (also opens the inspector), side-activation buttons, counterparty roster number input, run button. The in-progress trade persists in `localStorage`. There is no control to remove an asset from a side (the state helper for it exists but is unwired).

### Roster Capacity
Data (`GET /api/roster/capacity`, from a prebuilt artifact): capacity health (total players 27, capacity 26, cuts required, active-slot overflow, per-slot-class counts), a cut-exposure candidate table (player, position, cut priority, raw xVAR, DVS), scenario blocks with cumulative value-at-risk and marginal-next-cut ranges (always low→high spans), and per-position waiver replacement ranges. At review time, replacement ranges rendered as unavailable for many positions.
Actions: none; fully read-only.

### League Pulse
Data (`GET /api/league/pulse`, assembled from three prebuilt artifacts): partner rankings per counterparty (score plus complementarity/divergence-density/activity-recency/posture-alignment components and evidence), a team-posture table for all 12 teams (posture label, score, component z-scores — posture derives from four weighted roster signals: 60% starter value, 20% age, 15% draft picks, 5% taxi/development stash), a team-value overview (starter-weighted/lineup/depth-credit/capped-total xVAR views, age profile, future picks, positional z-scores), and opportunity cards in two lanes (model-native and market-overlay). The response `status` is always `degraded` (it reports artifact state, never a live computation), and the header carries an EXPERIMENTAL banner.
Actions: none; read-only.

### Model Trust
Data (`GET /api/trust-surface/{POS}` and `.../model-card`): per-position backtest evidence — a gate matrix (rank correlation, RMSE stability, market superiority, divergence validity → MET/UNMET/DEFERRED/INSUFFICIENT DATA with justifications), a fold table (train/test years, N, Kendall tau and Spearman rho with CI95, rank IC, RMSE, MAE), a QB-only reliability callout, model-card essentials (intended use, out-of-scope, known failure modes), and a provenance footer (run id, model version, artifact hash, git SHA, market source, snapshot dates). Fixed copy: "Consensus-competitive, edge unproven."
Actions: QB/RB/WR/TE tab buttons.

### Accuracy Tracker (Diagnostic Scorecard)
Data (`GET /api/realized-outcome/scorecard`): currently returns `status: "inactive"` with `status_reason: "awaiting_first_finalized_week"` and `settlement_status: unsettled`. The screen renders the inactive explanation ("Realized-outcome loop inactive — 2026 data accrues from September."), settlement status, and a data-maturity percentage. No metrics table is rendered in any state.
Actions: none.

### Player Inspector (aside) and Player Detail Page
Inspector (`GET /api/players/{sleeper_id}`): a neutral preview — name, modeled/unmodeled category, market availability, counts of caveats/drivers/risk flags. Buttons: "Open full evidence card", "Close".
Detail page (same endpoint): a two-lane valuation card — model lane (engine path, model grade, DVS, xVAR, position percentile, 1/2/3-year projections) and market lane (FantasyCalc value, overall/position rank, timestamp) — plus a neutral divergence label and an evidence section (full counter-argument, top drivers, risk flags with age-cliff flags styled amber, caveats). A non-dismissible "Descriptive only — not decision-grade." banner. No actions.

### Parked surfaces (nav-visible, explanation cards only, no data or controls)
**Rookie Board** ("Rookie valuation stands on the draft-capital + age prior… The legacy rookie_board.html remains available outside the app."), **Waiver Radar** ("needs in-season usage signals (routes, snaps) that only accrue while games are played"), **Research Assistant** (no active design yet).

### Developer surfaces
**Project Tracker** (rail "Developer" zone; `GET /api/internal/project-plan`): phases and tasks with status badges; refresh and expand controls; rendered data timestamp June 24, 2026. **Asset Primitive Capture** (URL-only, `?surface=asset-primitive-capture`, absent from rail and palette): a static demo of identity, spread-bar, and metric-cell UI primitives with no data or actions.

---

## 2. The user and the workflows that exist

The user is one dynasty manager operating one team in one Sleeper league. The workflows the app supports today:

- **Daily check-in:** open the default screen each morning and read what moved — model deltas on the roster, market price movement on the roster and around the league — against fresh 09:00–09:45 captures.
- **Roster evaluation:** audit every skill player on the roster with model values, aging signals, projections, and per-player evidence; drill into any player's full two-lane card.
- **Trade analysis:** assemble a two-sided trade from rostered players and future picks; read model-lane and market-lane valuations side by side, with roster-capacity forced-cut penalties applied and divergence between the lanes shown but never merged into a verdict.
- **Cut/capacity planning:** read cut-exposure rankings and value-at-risk ranges against roster limits (27 players vs 26 capacity today).
- **Counterparty scouting:** read partner rankings, team postures, and league-wide value distributions to see which of the other 11 teams complement the user's roster shape.
- **Model skepticism:** read the backtest evidence, gate matrix, and model cards for each position's model at any time.
- Waiver work and rookie-draft boards are explicitly parked (see §1); a rookie prospect can still be scored via the API (`POST /api/rookies/score`) but no screen calls it. There is no free-agent evaluation surface.

---

## 3. Front-end stack and running locally

**Stack:** React 19.2.7 + TypeScript 6.0.3, built with Vite 8.0.16 (no `@vitejs/plugin-react`; JSX via esbuild). No router library (query-param navigation), no data-fetching library (raw `fetch` + a small custom hook), Zod 4.4.3 validation at the API boundary with types generated from the backend OpenAPI schema by `@hey-api/openapi-ts` (a non-200 response or schema mismatch produces a loading/unavailable/parse-error state, never an unvalidated table). Styling is hand-written CSS with OKLCH design tokens — no Tailwind. Fonts are self-hosted latin subsets via `@fontsource` (Archivo, IBM Plex Sans/Mono); no external font calls. Lint/format is Biome 2.4.16; tests are Vitest 4.1.8 plus Playwright 1.61.1 for visual smoke. Node 24.15.0 / npm 11.14.0.

There is **no `npm run dev`** and no Vite dev proxy — the frontend calls same-origin relative `/api/...` URLs, so the workflow is build-then-serve-through-FastAPI. `npm run preview` serves only static files on 4173 with no API. Scripts: `build`, `preview`, `lint`, `test`, `typecheck`, `banned-language`, `openapi-gen`, `visual:smoke`, and `gate` (all of the above chained).

**Run it locally from a fresh terminal:**
```bash
# prerequisites: Python 3.14, Node 24, from the repo root
python3.14 -m venv .venv
.venv/bin/pip install -r requirements.txt          # FastAPI 0.136.1, Pydantic 2.13.4, uvicorn, httpx…
.venv/bin/pip install -r requirements-dev.txt      # pytest, ruff, etc.

cd frontend
npm ci
npm run build          # emits frontend/dist; FastAPI only mounts the SPA if dist/index.html exists
cd ..

# env vars required by the live Roster Audit route (422 without them):
export DYNASTY_SLEEPER_USERNAME=<sleeper username>
export DYNASTY_SLEEPER_LEAGUE_ID=<league id>
export DYNASTY_SLEEPER_LEAGUE_NAME=<league name>
export DYNASTY_SEASON=<season year>

.venv/bin/python3.14 -m uvicorn app.main:app --reload
# app at http://127.0.0.1:8000  (SPA at /, API under /api, OpenAPI at /openapi.json)
```
Backend tests run as `PYTHONPATH=. .venv/bin/pytest` (a known collection-level failure exists: `market_divergence_history.db` is not covered by the backup manifest, tripping `test_backup_manifest_covers_present_dbs_and_registry_references`). Frontend checks: `cd frontend && npm run gate`.

Most screens read prebuilt artifacts under `app/data/`; the repository ships with current artifacts, so the app renders real data immediately. The artifacts are refreshed by seven launchd jobs (macOS): 09:00 FantasyCalc capture, 09:15 feature refresh, 09:30 model PVO refresh, 09:40 market-divergence refresh, 09:45 What-Changed report, 10:15 backup, and a weekly realized-outcome scoring run. Without these jobs the app still runs; data just stops refreshing.

**Backend stack:** FastAPI 0.136.1 / Pydantic 2.13.4 / uvicorn on Python 3.14. Domain logic lives in `src/dynasty_genius/`; API routes in `app/api/routes/`; batch producers in `scripts/`. Data stores: JSON `*_latest.json` artifacts plus four SQLite databases (`fc_forward_capture.db`, `fc_snapshots.db`, `model_forward_capture.db`, `market_divergence_history.db`).

---

## 4. Hard constraints

**Sleeper API (`https://api.sleeper.app/v1`, no auth, read-only).** The client calls exactly: `/user/{username}`, `/user/{id}/leagues/nfl/{season}`, `/league/{id}`, `/league/{id}/rosters`, `/league/{id}/users`, `/league/{id}/traded_picks`, `/league/{id}/drafts`, `/draft/{id}`, `/draft/{id}/picks`, `/players/nfl`, `/state/nfl`. What Sleeper provides: league settings (including daily-waiver config), rosters with starters/taxi/IR membership, traded picks (moved picks only — the snapshot builder reconstructs full future-pick ownership from the deltas; pick xVAR comes from a local value curve), drafts and picks, the full NFL player map (updated by Sleeper roughly once per day), and season state. What it does not provide: player values or rankings, projections, usage/stat lines through these endpoints, or news text. The league-transactions endpoint exists at Sleeper but is not called anywhere in this codebase — past transactions are not in the snapshot. The snapshot normalizer retains exactly six fields per player — `full_name`, `position`, `team`, `age`, `years_exp`, `sleeper_status` — and drops everything else in Sleeper's player object (injury_status, depth_chart_position, news_updated, college, height/weight, external IDs, `fantasy_positions`, …); any feature needing those fields requires a normalizer change.

**FantasyCalc (`https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=2&numTeams=12&ppr=1`).** The only active market-value source. File cache at `app/cache/fantasycalc/` with a seasonal TTL (6h in season, Aug 16–Jan 15; 24h otherwise) and a three-stage degrade: fresh cache → stale-with-caveat → empty list with `market_data_unavailable`. Its `source_timestamp` is fetch time, not publish time (a caveat states this on every payload). Redraft-value fields are stripped at the cache boundary. Historical market values exist only from the app's own daily capture, which began 2026-06-24 — there is no obtainable backfill before that date.

**KeepTradeCut:** `KTCMarketSource.fetch` raises `NotImplementedError`; the code comment states KTC's terms of service prohibit automated access. Empty placeholder modules exist for KTC, PFF, and PlayerProfiler scrapers (comment-only files, no code).

**Other external sources:** MyFantasyLeague (rookie ADP overlay) and CollegeFootballData (college QB/receiving stats used in prospect features).

**Environment:** Python 3.14 (venv and CI; `ruff target-version py314`), Node 24 / npm for the frontend. The scheduler is macOS launchd — the daily data cadence is tied to a Mac that is awake; there is no server deployment. FantasyCalc/market fields cannot be model inputs, only display overlays; this is enforced in code (`validate_no_prohibited_features`).

---

## 5. Current state (verified live on 2026-07-14)

**Working end-to-end:**
- The API serves and the SPA renders with real data. `/api/system/capture-health` shows the FantasyCalc capture store complete at 21/21 days (2026-06-24 → 2026-07-14, zero gaps).
- Daily What-Changed returns `overall_status: ok` with today's market/model diff (comparison window 2026-07-13 → 2026-07-14).
- Roster Audit computes live against Sleeper and returns `status: active` with per-position model statuses.
- Roster Capacity returns real numbers (27 players / 26 capacity / 1 cut required).
- Trade Lab's search, reconcile, and market-reconcile endpoints operate against current artifacts.
- Model Trust serves per-position backtest artifacts and model cards.
- All four positions have active Engine B models (`ACTIVE_B`); prospect scoring routes through Engine A (per-position Ridge; a TE-only v3 head exists). xVAR and DVS are computed in the PVO assembler; a Bayesian blend covers players with 1–7 games.
- `npm run build` completes clean.

**Degraded right now:**
- `GET /api/health` returns **503** `{"error":"system_health_unavailable"}` while every feature endpoint returns 200; the shell status pill shows "Status unavailable". (Earlier the same day it returned 200 with `overall_status: degraded` — the endpoint's behavior changed during the day.)
- League Pulse always returns `degraded` (it reports artifact state), and two of its three source artifacts (team posture, team value matrix) are dated 2026-06-23 — three weeks stale relative to the daily-refreshed divergence data shown on the same page.

**Stubbed / inactive / dead:**
- Accuracy Tracker: the backing artifact directory does not exist; the route returns a defined `inactive` state and the screen has no metrics table in any state. The weekly scorer job runs and no-ops (this morning's run wrote `status: noop` at 10:00).
- Three parked screens (Rookie Board, Waiver Radar, Research Assistant) render explanation cards only.
- Six API endpoints are never called by the frontend: `/api/engine-b/scores`, `/api/trade/analyze`, `/api/trade/evaluate`, `/api/rookies/score`, `/api/rookies/score-class`, `/api/system/tier-readiness`.
- Two route files (`leagues.py`, `rosters.py`) are empty routers not mounted in the app.
- Engine A's QB prospect model is graded `PROSPECT_D` in code (negative out-of-sample R²).
- Tier-readiness's `mif_breaker` component reports `insufficient_data` in the off-season (presence probe only).

**Broken / defects observable in the UI:**
- Command-palette options cannot be clicked with the mouse (no click handler); keyboard Enter only.
- Trade Lab has no way to remove an asset once added to a side (the state helper exists, unwired); clearing requires wiping the `localStorage` draft or reloading state.
- The Daily What-Changed "Movement history" chart is a permanent placeholder slot.
- Player identity throughout the app is initials-only chips; a conditional headshot-cache static mount exists in `app/main.py` but the cache directory is absent, so no headshots render (headshot requests 404).
- Roster Capacity replacement ranges render as unavailable for many positions.
