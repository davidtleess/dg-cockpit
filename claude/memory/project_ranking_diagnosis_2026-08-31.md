---
name: project_ranking_diagnosis_2026-08-31
description: Why Dynasty Genius ranks only ~12% of skill players and why its premium data reaches no model coefficient — measured and adversarially verified 2026-08-31
metadata: 
  node_type: memory
  type: project
  originSessionId: daab5375-6c9f-478d-8739-b758480b06a7
  modified: 2026-09-01T10:08:26.006Z
---

The 2026-08-31 brainstorm (lane "Greg") measured why so little of the product carries a model
rank. Every number below was measured on live artifacts and survived adversarial verification
(22-agent census + 14 verifiers, 0 refuted; then 4 refuters on the headline claim, unanimous
CONFIRMED_BUT_OVERSTATED). Corrected magnitudes are the ones recorded here.

**COVERAGE.** 468 of 12,226 served players carry a dynasty_value_score. Honest denominator
(skill position + NFL roster + Sleeper-Active): 498 of 954 UNRANKED (52.2%). 224 of 606 players
who took a 2025 offensive snap get nothing. 363 of 443 rookie-year skill players unranked;
rookie coverage is capped by a hand-maintained 82-row resources/prospect_cards.json.

**THE DEAD WINDOW.** ENGINE_B_MIN_GAMES_T=8 (engine_b_contract.py:143) plus an undocumented
MIN_GAMES_THRESHOLD=4. The designed rescue — a per-position Bayesian blend w_B=n/(n+k) — is
STRUCTURALLY UNREACHABLE: it needs an Engine A prior, Engine A needs draft pick+round, and the
39-column active feature table carries neither. **0 firings in 866,861 rows over 67 days**,
verified by executing the assembler. 114 players/day fall to null. DG-021 (landed 08-25) fixed
the false *label* on these same 114; this measured the root cause.

**THE HEADLINE FINDING — the premium data is not in the model.** Eleven columns (all six NGS,
air_yards_share, route_participation, target_share_nfl, dropback_count, pass_attempts) sit in
engine_b_features_runtime.csv and appear in NONE of the four deployed pickles. Ablating every
premium feature at once moves no player more than 4 slots (QB 4, WR 3, TE 1, RB 0), Spearman
>=0.995. Premium share of projection spread: RB 0.0%, TE 0.8%, WR 2.9%, QB 11.9% (all CPOE).
Engine B = ppg_t + two prior PPG seasons + age + games_t. **It beats a naive box-score ranking
using age and games played — two free public fields.** Nothing paid-for contributes.
Corrected: it is NOT "PPG x 0.79" — it reorders meaningfully (30% of players move >10 slots).

**WHY**: no StandardScaler in any pickle, so Ridge penalises small-scale rate features hardest.
BUT a refit with scaling moves attribution dramatically (TE efficiency 0.4%->30.5%) while CV R²
is flat. So the real cause is the TARGET, not plumbing: for an established player last season's
PPG is near-sufficient, which is why a free-data crowd ranks known starters well. Premium data
pays only where the box score is blind (low-sample players), on CHANGES not levels, and on
separating opportunity from talent.

**SURVIVORSHIP (confirmed outright).** 638 of 2,880 training rows deleted at the outcome join,
9.3x concentrated in the lowest snap-share decile. Those washout seasons are the EVENT, not
missing data.

**THE AGE BIAS — live on screen.** Divergence BUY list mean age 27.4, SELL list 23.8;
corr(age, model-minus-market delta) = +0.39; 40 of 85 buys are 28+, 49 of 79 sells are rookies
or sophomores. In a dynasty league the recommendation surface points backwards. Cause is the
missing longevity/hazard term, not an insight.

**CORRECTION TO AN EARLIER BELIEF**: the "model-vs-market is ~194x underpowered" diagnosis is
WRONG. The binding constraint is the ESTIMATOR (a 4-fold sign test), not n. A paired
player-level bootstrap at n~400 has SE~0.022 — a 0.05 Spearman gain is detectable in ONE season.
Cluster the bootstrap on team-season; effective n is below 400.

**OTHER LIVE DEFECTS**: zero of 12,226 players carry a market_overlay on the served object;
team_value_matrix.py:18-20 turns null into 0.0 silently; Trade Lab drops xvar<=0 (107 of 274
selectable); 23 players tied at exactly DVS 100.0 (11 TE) with ties broken by array order;
`/api/roster/audit` returns 23 nulls for David's roster while `/api/players/{id}` returns real
scores (serving defect, Bob's lane). Two trade-partner score terms are constants across all 41
counterparties (activity_recency_score = 0.0 hardcoded; divergence_density_score saturates
to 1.0) — instances 3 and 4 of the DG-123/DG-124 "constant presented as measurement" class.

**DO NOT** propose changing XVAR_LAMBDA_ENGINE_B — the positional P90 cancels out of xVAR
entirely; DG-092 guards it. See [[david_rulings_dg3]] and [[project_season_readiness_2026]].

## WHAT WAS FIXED — landed 2026-08-31, commit `58d3b20c` on origin/main

- **638 attrition player-seasons un-deleted.** They are now KEPT and labelled
  `outcome_returned` (True/False, NA outside a complete window). The points column stays
  NaN for them — the absence of an opportunity was observed, never a capacity of zero.
  `training_eligible` keeps its old meaning (complete window AND observed outcome) so no
  NaN target reaches a points regression. Training table 2,741 -> 3,384 rows.
- **Attrition by age, now measurable:** return rate 85.5% (<=23) / 81.1 / 76.0 / 72.2 /
  **65.6% (31+)**. On the OLD table the 31+ band looked like 77.5% — the censoring was
  concealing its own severity.
- **TE now takes a real test.** Its path scored in-sample with `promotion_warranted`
  hardcoded null; it now holds out, scores OOS, baselines on the same held-out rows, gates.
- **Manifest publishes atomically** (was a truncating write; a reader in that window got the
  superseded v1 model for every position).
- **Retrained** `20260831T204458Z`: all four pass a real gate 3/3 — QB R² 0.439/ρ0.696,
  RB 0.593/0.788, WR 0.682/0.809, TE 0.641/0.789. TE moved OFF the never-gated te_v3 head
  onto te_v2, **dropping its two CFBD college features** (implicit, flagged, not a win).
- **NGS reached deployed coefficients for the first time** — efficiency share RB 0.1%→2.5%,
  TE 1.3%→16.6%, WR 3.0%→4.2%. ⚠ **THOSE THREE PERCENTAGES DO NOT REPRODUCE (2026-09-03) — retired.
  A verifier swept sixteen definitions and could not recover them; the measured raw |coef| share on the
  served run 20260831T204458Z is QB 2.42% / RB 9.74% / WR 6.00% / TE 23.51%. The CLAIM they supported —
  that NGS is in all four served pickles — stands on that independent measurement.** So "premium data
  reaches ZERO coefficients" is NO LONGER
  TRUE. What survives: lagged PPG is still 51–83% of effect everywhere.

## ⚠ WHAT IS *NOT* FIXED — do not let the green chain imply otherwise
- **The age bias is UNCHANGED.** Age coefficients: QB −0.0841→−0.0850, RB −0.2162→−0.2163,
  WR −0.2334→−0.2333, TE −0.1025→−0.1153. Because the 638 rows are **consumed by nothing**
  — the availability/hurdle model does not exist. Un-deleting is necessary, not sufficient.
- **Coverage is UNCHANGED at 468 scored.** The 8-game gate was never touched. David's roster
  still shows 3 nulls in the artifact.
- Next step is the availability half of the hurdle: P(plays) trained on all complete-window
  rows using `outcome_returned`, then value = P(plays) × E[points | plays].

## 2026-09-01 — THE HURDLE IS LIVE (commit `ee57d802`, merged to origin/main)

Served value now composes **P(plays) x E[points | plays]**. `apply_availability()` in
pvo_assembler multiplies the projection BEFORE the existing normalisation, so the coupled
DG-092 constants (P90 / XVAR_LAMBDA / REPLACEMENT_DVS) are untouched.

- **Age effect on the LIVE artifact: −0.4028** (was −0.2593; market −0.3855). Gap closed.
- **Ceiling population FELL 21 → 18.** A probability is a discount (P<=1) so it can never
  invent a ceiling player. ⚠ An earlier variant that divided P by the base rate to hold
  the DVS scale steady TRIPLED the ceiling to 58 — do not reintroduce it.
- Availability model: walk-forward pooled AUC 0.811, beats base rate every fold. Age is its
  3rd-strongest predictor (std −0.535; a 31yo has 0.28x the odds of a 23yo).
- ⚠ **−0.4028 is ALIGNMENT WITH THE MARKET, NOT PROOF OF PROFIT.** Nothing here has ever
  graded a prediction against a real outcome. Do not quote it as an edge.
- **KNOWN SIMPLIFICATION:** `score_rows` fits at scoring time from the training CSV rather
  than a published artifact, so regenerating that CSV changes served values without a model
  publish. Promoting it into the manifest + sentinel scope is the follow-up.
- Coverage UNCHANGED at 468/12,226; the 8-game gate was never touched. David's roster still
  shows 3 nulls (Garrett Wilson games_t=7, Braelon Allen games_t=4, Tank Dell PRE_MODEL).

**TE COLLEGE FEATURES: tested, NOT promoted** — Spearman +0.0053, 95% CI [−0.0091, +0.0202].
See `docs/validation/2026-09-01-engine-b-te-college-features-decision.md`. The old 4-fold
sign test would have promoted it on 3-of-4; the paired player-clustered bootstrap did not.

**⚠ CORRECTION to a claim in `58d3b20c`'s pushed message:** the retrain did NOT drop TE's
college features. TWO artifacts are named te_v3 — `head_a/.../te_v3.pkl` (Engine A prospect
head, HAS college, untouched) and `engine_b/runs/20260626T165649Z/te_v3.pkl` (NO college,
replaced). New TE model is a strict superset: 14 features → 16. And
`ENGINE_A_PROHIBITED_IN_B` never blocked those fields.

**Presentation defect worth fixing:** `feature_completeness` measures whether COLUMNS are
populated; the gate measures whether there is enough SEASON. Garrett Wilson reads 1.0
complete over 7 games and gets no score, with no caveat explaining it.

## ⭐ 2026-09-01 — THE CHEAPEST COVERAGE FIX (David's catch, verified)

`games_t` is ONE SEASON, not the player. Reading the 8-game gate as a judgement about a
PLAYER is wrong and makes it look defensible. Measured on the runtime CSV:

    2025 rows                                  505
    below the gate (games_t < 8)               115
      with a prior-season ppg on the SAME ROW   72   <-- not cold-start at all
      with TWO prior seasons on the same row    55
      genuinely thin                            43

Garrett Wilson: 2022 g=17 ppg=12.69 | 2023 g=17 ppg=12.54 | 2025 g=7 ppg=14.21. The dead
window refuses him and reaches OUTWARD for an Engine A college/draft prior while
`ppg_t_minus_1`=14.82 and `ppg_t_minus_2`=12.54 sit in the very row it is refusing.

**So 63% of the gap needs NO new data** — no contracts join, no college prior. Use the row.
The contract prior is still right for the 43 genuinely thin players and for rookies.

Reconciliation: 114 (served artifact: projection_2y present, DVS null) vs 115 (runtime CSV:
games_t<8) are different populations, not an off-by-one.

**⭐ THE STRUCTURAL FORM OF THE DEFECT — state it this way, not as a coverage count.**
Read from the SERVED artifact (`runs/20260831T204458Z/wr_v2.pkl` via `.venv/bin/python`;
system python has no sklearn):

    age, aging_curve_value, games_t, ngs_avg_cushion, ngs_avg_separation,
    ppg_t, ppg_t_minus_1, ppg_t_minus_1_available, ppg_t_minus_2, ppg_t_minus_2_available,
    snap_share, snap_share_t_minus_1, snap_share_t_minus_1_available,
    tprr, weighted_opportunity, yprr

**ppg has TWO lags. snap_share has ONE. games has ZERO.** The pipeline demonstrably knows how
to build lagged features — it built three — and the one signal the gate depends on is the only
one left at a single season. The gate asks "is this player durable?" and is handed exactly one
season to answer with. That is a MISSING COLUMN, not a coverage shortfall: it says what to
BUILD (`games_t_minus_1` / `games_t_minus_2`, then let the dead-window path consider them).

**⛔ DO NOT BACKFILL 2024 FEATURE ROWS AS THE COVERAGE FIX — it moves Wilson ZERO.** The gate
reads `games_t` off the *2025* row; adding a 2024 row does not touch that row. This is the
plausible-and-useless scope someone lands on from "2024 is missing"; it costs days and measures
no coverage movement. Only a lagged games column moves anyone.

**2024 IS ALREADY IN EVERY PLAYER'S MODEL.** `ppg_t_minus_1` is a live model feature and holds
Wilson's 2024 season (14.82). Provable without a 2024 row: his 2025 `ppg_t_minus_2` = 12.541
exactly equals his 2023 `ppg_t`, so t-2 is 2023 and t-1 is 2024. "2024 is missing" is false at
the level that matters — what is missing is the 2024 ROW.

2024's absence from every feature table is INTENDED and pinned by
`tests/contract/test_inference_partition_seasons.py::test_the_in_between_season_is_dropped_entirely`
— it is the in-between season with no complete outcome window. Do not re-investigate.
That test is parameterised `(2026, {2018..2024, 2026})`, so **2024 enters training automatically
once the window reaches 2026** — the drop is DEFERRAL, not exclusion, and nobody has to
remember to do anything.

