---
name: project_ranking_diagnosis_2026-08-31
description: Why Dynasty Genius ranks only ~12% of skill players and why its premium data reaches no model coefficient — measured and adversarially verified 2026-08-31
metadata: 
  node_type: memory
  type: project
  originSessionId: daab5375-6c9f-478d-8739-b758480b06a7
  modified: 2026-08-31T12:04:18.994Z
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
  TE 1.3%→16.6%, WR 3.0%→4.2%. So "premium data reaches ZERO coefficients" is NO LONGER
  TRUE. What survives: lagged PPG is still 51–83% of effect everywhere.

## ⚠ WHAT IS *NOT* FIXED — do not let the green chain imply otherwise
- **The age bias is UNCHANGED.** Age coefficients: QB −0.0841→−0.0850, RB −0.2162→−0.2163,
  WR −0.2334→−0.2333, TE −0.1025→−0.1153. Because the 638 rows are **consumed by nothing**
  — the availability/hurdle model does not exist. Un-deleting is necessary, not sufficient.
- **Coverage is UNCHANGED at 468 scored.** The 8-game gate was never touched. David's roster
  still shows 3 nulls in the artifact.
- Next step is the availability half of the hurdle: P(plays) trained on all complete-window
  rows using `outcome_returned`, then value = P(plays) × E[points | plays].

