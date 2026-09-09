# DG-205 Product Brainstorm: Track Record & Evaluation Contract

**Author:** David's Actual AGY Gemini Session (Product Brainstormer)  
**Coordination:** Authorized by David for Codex Root Planning  
**Date:** September 8, 2026  
**Target Destination:** `/private/tmp/dg205-gemini-product-brainstorm.md`  

---

## 1. Session, Environment & Role Confirmation

- **Actual Session & Identity:** David's interactive AGY Gemini terminal session.
- **Active Model:** Gemini 3.8 Flash (High).
- **Current Working Directory:** `/Users/davidleess/dynasty-genius-product` (Shared Trunk — treated as strictly **READ ONLY**).
- **Current Verified Trunk Commit:** `4ad796c2` (remote/main verified; DG-189 snapshot archive merged).
- **Adjacent Worktree Notice:** `/Users/davidleess/dg-wt/DG-204` contains uncommitted hosting and CI/CD work; preserved and untouched.
- **Session Assignment Status:** **No other assignment in progress.** Invited strictly as a **PRODUCT BRAINSTORMER**, not a coding builder.
- **Operating Boundaries Honored:**
  - Zero edits to product code in shared trunk or worktrees.
  - Zero git commits, branches, worktrees, or pushes.
  - Zero dependency installations or database writes.
  - Zero access to `~/frontend-studio`.
  - Zero subagent invocations.
  - Deliverable written exclusively to `/private/tmp/dg205-gemini-product-brainstorm.md`.

---

## 2. Scope Challenge in Plain Football Language

### A. The ONE Useful Question David Should Answer
> **"Before NFL Week 1 kicked off, what exact football production bet did our model lock in for 2026, and does it project real divergence from dead-simple benchmarks (prior-season points and positional median), or is it mostly hugging the baseline?"**

On September 8, 2026, the 2026 NFL regular season has played **0 of 17 weeks**. Any screen claiming to show "performance" today is lying. David does not need a fake scorecard; he needs **transparency of the freeze**:
1. *What did we predict before the games started?*
2. *What simple, non-magical baselines are we holding the model accountable against?*
3. *Are we measuring all 825 eligible players (including busts, practice squadders, and backups), or are we cheating by only grading David's roster?*

### B. What Would Mislead Him (The 5 Traps)
1. **Conflating FantasyCalc Market Drift with Football Truth:**
   If a rookie wide receiver gains +600 points on FantasyCalc in Week 2 because of hype on Twitter/Reddit, that is *market sentiment*, not points on David's fantasy scoreboard. A market swing must never be displayed as proof that the model was "right" about football production.
2. **Conflating 17 Weeks of 2026 with 5-Year Dynasty Asset Value:**
   Engine B outputs a 5-year discounted asset value ($DVS$). If a 21-year-old rookie running back has a slow 4-game start (low 2026 PPG), that single data point does not disprove a 5-year career arc. Conversely, a 32-year-old veteran scoring 18 PPG in September does not validate his 5-year dynasty value. The single-season football evaluation must be strictly bound to **2026 NFL regular-season weeks 1–17**.
3. **Roster-Only / Cherry-Picking Bias (Survivor Bias):**
   David naturally cares most about his 27 rostered players and high-profile trade targets. But grading only his roster (or only players who broke out) introduces massive survivor bias. The evaluation contract must enforce the full eligible population (all 825 forecast players, including unranked players and starting estimates).
4. **Retroactive Baseline Creep:**
   Comparing frozen model predictions against a "baseline" that was computed retroactively with knowledge of 2026 roles, injuries, or depth charts is dishonest. The baselines (2025 actuals and 2025 positional medians) must be frozen as cold, unmoving numbers right now.
5. **Alphabetical Ordering Inside DVS Ties:**
   For players below the replacement threshold who share a $DVS = 0.00$, alphabetical sorting is a UI artifact, not a model ranking. The evaluation surface must never score rank-order accuracy within clipped ties.

### C. What Should Be Deferred
- **Historical Outcome Grading (Backfilled Track Records):** Do not reconstruct 2023 or 2024 retro-evaluations to manufacture a historical win-rate badge. Keep the focus entirely on the forward freeze starting September 8, 2026.
- **Decision Logging & Counterfactuals:** Recording Trade Lab "accept/reject" decisions or waiver claims is valuable, but should be deferred until the production freeze and baseline display are solid.
- **Market Price Movement Grading:** FantasyCalc price delta evaluation must remain marked `not_registered_for_grading` until market capture windows, inflation adjustments, and consensus baselines are formally defined. Football production comes first.
- **Model Tuning / Availability Threshold Edits:** Do not adjust Engine B parameters, availability hurdle weights, or $P(\text{plays})$ formulas in response to early 2026 news.

### D. How to Avoid Calling Production or Market Evidence a "Proven Dynasty Decision Edge"
1. **Maintain Three Strict, Uncoupled Vocabularies:**
   - **Football Production Accuracy:** Measured purely in Mean Absolute Error (MAE) of fantasy points vs. Baselines A & B across Weeks 1–17.
   - **Market Convergence:** Descriptive delta between our valuation rank and FantasyCalc market rank over 30/60/90 days.
   - **Decision Edge:** Measurable net point gain from a manager action (e.g. trading Player A for Player B) relative to the counterfactual of holding.
2. **Explicit Screen Declarations:**
   Because zero manager decisions are logged and zero games are completed, the UI must plainly display:
   > *"Decision supported: false. No decision-making advantage or repeatable edge is established by this archive."*
3. **Statistical Gate Enforcement:**
   Adhere strictly to the rule in `workspace_evaluation_plan.json`: The model can only claim to have beaten a baseline if the paired 95% bootstrap interval on the primary MAE difference lies **entirely below zero across all four positions**. If even one position fails or lacks data, aggregate edge claims are refused.

---

## 3. Smallest Runnable Implementation

### A. Lovable Route Integration (`lovable/src/routes/track-record.tsx`)
Currently, `track-record.tsx` displays a static 2-line placeholder:
```tsx
<p className="text-sm">
  This saved preview does not include evaluated outcomes. It does not establish a decision-making advantage.
</p>
```
**The Smallest Runnable Step:**
Replace the placeholder with a structured, fantasy-native **"Pre-Season Freeze & Evaluation Ledger"**:
1. **Header & Provenance Card:**
   - Saved Snapshot: `September 8, 2026` (Cutoff timestamp).
   - Underlying Forecast Date: `September 6/7, 2026`.
   - Evaluation Plan ID: `workspace-production-2026-v1`.
   - Scoring Window: `2026 NFL Regular Season Weeks 1–17 (PPR)`.
   - Status Badge: `Ungraded — Season in Progress (0 / 17 Weeks Completed)`.
2. **Declared Baselines Summary:**
   - **Baseline A (Prior-Season Production):** 2025 total points in same 17-week PPR scoring.
   - **Baseline B (Positional Median):** 2025 median for qualifying QB / RB / WR / TE.
   - Explicit receipt note: *"Baselines reconstructed retrospectively at freeze time; frozen prior to Week 1 kickoff."*
3. **Frozen Forecasts Table (Searchable / Filterable):**
   - Columns: `Player`, `Position`, `Team`, `2026 Model Forecast (Pts)`, `2025 Prior Points (Baseline A)`, `2025 Pos Median (Baseline B)`, `2026 Actual Pts (Outcome)`, `Status`.
   - `2026 Actual Pts` renders `—` with tooltip `"Pending Week 1–17 completion"`.
   - Population Filter: `Your Roster (27)`, `League Free Agents`, `All Forecasted (825)`.

### B. Future-Data Input Contract (NFLverse Weeks 1–17)
When regular season weeks conclude, outcomes must feed into an immutable schema:
- **Source:** NFLverse player stats (`player_stats_def.parquet` / weekly CSV).
- **Filters:** `season = 2026`, `season_type = 'REG'`, `week BETWEEN 1 AND 17`.
- **Target Scoring Preset:** PPR_nflverse_default:
  - Passing: 0.04 pts/yd, 4.0 pts/TD, -2.0 pts/INT.
  - Rushing: 0.1 pts/yd, 6.0 pts/TD.
  - Receiving: 0.1 pts/yd, 6.0 pts/TD, 1.0 pt/reception.
  - Fumbles Lost: -2.0 pts.
  - 2-Pt Conversions: 2.0 pts.
- **Fail-Closed Identity Resolution:**
  - Join on canonical `sleeper_id` through `catalog.json`.
  - If a player was active/rostered in NFL but scored 0 stats -> record `0.0`.
  - If a player identity cannot be resolved or source feed is truncated -> record `outcome_missing` (fail closed, do not assume zero).

### C. Code Paths & Potential Conflicts
1. **Lovable Frontend Data Layer (`lovable/src/lib/dg/backend.ts` & `queries.ts`):**
   - *Architecture Notice:* Lovable is currently built around a static bundle `/data/dg-bundle.json` ingested via `bundleQuery`.
   - *Conflict Avoidance:* Do **NOT** overload `DgBundle` in `backend.ts`, because `readBundle()` contains strict assert guards that throw on unexpected fields.
   - *Solution:* Add a parallel, dedicated query in `queries.ts` (e.g. `trackRecordQuery`), consuming `/data/dg-track-record.json` (or `/api/research/snapshots` if live API is connected).
2. **Export Adapter (`src/dynasty_genius/adapters/lovable_bundle.py`):**
   - Extend the adapter or create a sibling script (`scripts/export_lovable_track_record.py`) to serialize the merged DG-189 archive (`receipt`, `evaluation-plan.json`, `comparison.json`, and frozen baseline values) into `lovable/public/data/dg-track-record.json`.
3. **Workspace Isolation (`DG-204` vs New Ticket):**
   - `/Users/davidleess/dg-wt/DG-204` has dirty hosting/CI files. Root should issue a fresh ticket worktree (e.g. `DG-205` or `DG-206`) via `dg-work.sh` rather than contaminating DG-204.

---

## 4. Milestone Ranking & Recommendation

### Milestone 1: "The Pre-Season Contract Lock" (Recommended)
- **Scope:**
  1. Freeze baseline values for all 825 players (2025 actual points and 2025 positional medians under identical PPR week 1–17 rules). Stamp with `retrospective_reconstruction_v1`.
  2. Export the frozen September 8 snapshot bundle and baselines to Lovable.
  3. Replace `lovable/src/routes/track-record.tsx` placeholder with the Pre-Season Freeze & Evaluation Ledger table.
  4. Display honest pending states: *"0 of 17 weeks completed; outcomes ungraded"*.
- **Why It Wins:**
  - Smallest runnable slice.
  - Zero live-feed dependencies (no broken scrapers before games are even played).
  - Gives David immediate confidence that the product locked its predictions before kickoff and is ready for accountability.

### Milestone 2: "Weekly In-Season Production Accumulator"
- **Scope:**
  - Milestone 1 plus an automated weekly NFLverse ingestion job that aggregates Weeks 1..N and computes interim cumulative points and descriptive tracking.
- **Evaluation:**
  - Good follow-up after Week 1 games conclude, but premature to build right now while 0 games have completed.

### Milestone 3: "Dual-Track Production & Market Movement"
- **Scope:**
  - Milestone 2 plus weekly FantasyCalc price tracking and delta correlations.
- **Evaluation:**
  - High risk of confusing David with mixed signals (market hype vs football reality) before single-season football evaluation is even established. Defer.

---

## 5. Recommendation Summary for Root Planner

1. **Adopt Milestone 1 immediately.**
2. **Create Ticket DG-205 (or next available)** for the Lovable `/track-record` route and track-record bundle exporter.
3. **Keep `evaluation_status: "ungraded"`** across all views until Week 17 concludes.
4. **Preserve DG-204 uncommitted files** by executing in a clean worktree.
