---
document: Model Reverse-Engineering and Scientific Bake-Off Program
version: 0.1.0
status: DRAFT — independent Codex design; not cockpit-cleared or David-ratified
date: 2026-08-18
author: Codex
authority: research design only; no model, feature, threshold, promotion, or publication authority
primary_layer: 3 — models
foundation_check: Layers 1–2 inspected; raw substrate is broad, but curated model consumption is sparse
decision_supported: false
---

# Model Reverse-Engineering and Scientific Bake-Off Program

## 0. David's directive and the deliverable

David's directive, verbatim:

> reverse engineer the models - test outcomes vs data features and weights and different science
> techniques - this should lead to the best desisions and the path foward. i will have claude do the
> same. i want a full design spec and plan

This document is Codex's independent design. Claude's independent work should not be anchored to it
before both drafts exist. The two artifacts should then be compared claim-by-claim, with disagreements
preserved for David rather than silently blended.

This program does four things:

1. reconstructs exactly what every active model and downstream valuation transform does;
2. tests which features, weights, cohorts, and outcomes actually carry repeatable forward signal;
3. compares alternative scientific methods under one pre-registered temporal contract; and
4. produces a position-by-position, horizon-by-horizon promotion decision and the next product path.

It does **not** authorize retraining production, changing feature contracts, updating model pointers,
changing DVS/xVAR, committing, pushing, publishing, or presenting any candidate as decision-grade.

## 1. Executive design decision

The unit under review is not a pickle. It is the entire causal-looking but predictive-only chain:

```text
source snapshot
  -> identity resolution
  -> temporally valid curated feature
  -> cohort / eligibility rule
  -> target construction
  -> preprocessing
  -> estimator + hyperparameters
  -> raw prediction / uncertainty
  -> Engine A/B routing or blend
  -> DVS normalization and clamp
  -> replacement baseline and xVAR
  -> roster/trade/league decision surface
```

A model can be statistically better and still make worse dynasty decisions if the target is wrong,
the cohort excludes the players David cares about, preprocessing differs between validation and
production, uncertainty is discarded, or the DVS/xVAR transform destroys the improvement. The study
therefore audits and tests every link.

The incumbent remains frozen throughout. Every experiment is a validation-only candidate. A candidate
may win for one position and horizon and lose elsewhere; promotion is independent by cell.

## 2. Governance and hard boundaries

### 2.1 Analytical boundaries

- Engine A remains the pre-NFL/rookie forecast; Engine B remains the active-NFL forecast unless David
  separately ratifies a boundary change.
- Market data is a comparison benchmark only. KTC, FantasyCalc, ADP, rankings, and market-derived
  fields never enter either model's training features.
- RAS remains risk/context unless its own pre-registered test earns positive lift.
- Aging remains continuous and fitted. No candidate may encode hard age cliffs.
- QB rushing production remains a hypothesis **under test**, not a finding. This program may audit the
  incumbent `is_dual_threat` behavior as a fact about shipped code, but it may not use the QB-1
  registration or interim output as evidence that rushing predicts the target. Any new rushing feature
  lane remains governed by the registered QB-1 result and David's later ruling.
- All outputs remain recursively `decision_supported=false`.
- The program predicts and describes. It does not emit buy/sell/hold, keep/cut, trade verdicts, or
  nominated targets.

### 2.2 Layer check

The presenting work is Layer 3. The Layers 1–2 dependency check found:

- a broad raw foundation: nflverse, NGS, PFF, PlayerProfiler, CFBD, injury, depth-chart, contract, and
  other source families exist in varying states;
- a much smaller curated model surface: many sources are `substrate_only`, NGS columns reach the
  runtime Engine B dataset but not the active estimator artifacts, PlayerProfiler has no production
  model consumer, and most PFF families have no consumer;
- therefore raw-data scarcity is not the primary blocker. The dominant foundation dependency is
  Layer-2 curation: identity-stable, point-in-time, position-specific feature candidates with clear
  missingness and provenance.

The study may measure and specify those gaps. It may not silently promote a source from
`context_signal` or `substrate_only` to `model_input`.

## 3. Verified incumbent inventory

These facts ground the study. They are not candidate results.

### 3.1 Engine A — rookie forecast

The active pointer `app/data/models/latest.json` selects run `20260502T153931Z` for the baseline
rookie models. The baseline family is per-position Ridge with:

- features: `pick`, `round`, `age`;
- target: `y24_ppg`;
- training classes: 2015–2020;
- fixed holdout: 2021;
- unmatured classes excluded: 2022–2025.

Recorded holdout evidence:

| Position | Train | Holdout | RMSE | R² | Spearman | Grade |
| :-- | --: | --: | --: | --: | --: | :-- |
| QB | 68 | 10 | 6.672 | -0.208 | 0.517 | D |
| RB | 129 | 19 | 2.977 | 0.509 | 0.719 | C |
| WR | 193 | 35 | 4.112 | 0.408 | 0.729 | C |
| TE | 87 | 11 | 2.152 | 0.197 | 0.545 | C |

TE has a separately promoted Head-A v3 override: standardized Ridge, alpha 50, 62 training rows,
target `best3of4_ppg`, and five features (`nfl_pick`, `nfl_round`, `final_college_age`,
`te_ryptpa_final`, `te_yards_per_reception_career`). No other position appears in
`app/data/models/head_a/v3_manifest.json`.

The program must treat Engine A as a routed system, not one homogeneous model.

### 3.2 Engine B — active-player forecast

`app/data/models/engine_b/v2_manifest.json` selects:

- QB/RB/WR artifacts from `20260513T012309Z`;
- TE v3 from `20260626T165649Z`.

The current training CSV contains 2,236 eligible player-season rows for 2018–2023 and 505 inference
rows for 2025. The promoted QB/RB/WR artifacts were fit only on 2018–2021; 2022–2023 were used as the
fixed holdout and were not refit into those saved production artifacts:

| Position | Active artifact fit rows | Eligible 2022–2023 rows left out of fit | Features |
| :-- | --: | --: | --: |
| QB | 169 | 95 | 15 |
| RB | 387 | 186 | 11 |
| WR | 607 | 300 | 14 |
| TE | 492 | 0 | 14 |

The target is `avg_ppg_t1_t2`. The output partition correctly uses 2024 data in 2025 lag features
while omitting 2024 as a standalone two-year-labeled row because 2026 is incomplete. That narrow
partition is not the defect. The single-target design nevertheless wastes labels that are already
mature for shorter horizons; 2024 can support H1 now even though it cannot support H2.

### 3.3 Preliminary weight reconstruction

Production Engine B stores unscaled Ridge coefficients. Raw coefficient magnitude is not comparable
across units, so Codex reconstructed one-standard-deviation effects using the exact training rows and
the stored imputer. Largest effects in predicted PPG units:

| Position | Dominant standardized effects | Material observation |
| :-- | :-- | :-- |
| QB | `ppg_t` +1.94, `games_t` +1.78, `ppg_t_minus_1` +0.62, `cpoe` +0.44, `age` -0.43 | Most efficiency and role fields are near zero |
| RB | `ppg_t` +3.40, `age` -0.58, `ppg_t_minus_2` +0.53 | No active RB-specific usage-quality feature |
| WR | `ppg_t` +3.37, `ppg_t_minus_1` +0.67, `age` -0.67, `games_t` +0.61; `yprr` +0.09 | WOPR/TPRR/snap effects are nearly zero |
| TE | `ppg_t` +2.19, `games_t` +0.54, `ppg_t_minus_1` +0.37, `age` -0.32 | YPRR is slightly negative; WOPR/TPRR are nearly zero |

This does **not** prove that the small-weight features are useless. Ridge penalization is scale
sensitive, and the production trainer does not standardize. The result is a hypothesis-generating
finding: the active system behaves mostly like a regularized PPG carry-forward with age and games.

### 3.4 Blocking estimator-parity discrepancy

The production and trust paths do not implement the same estimator:

- production training (`scripts/train_engine_b.py`) applies median imputation and Ridge/RidgeCV, but
  no `StandardScaler`;
- production scoring (`app/services/engine_b_service.py`) applies the stored imputer and model only;
- walk-forward validation (`src/dynasty_genius/eval/backtest_harness.py`) applies median imputation,
  then `StandardScaler`, then Ridge.

The trust surface therefore validates a scaled fold model while production serves an unscaled model.
Its fold coefficients and performance cannot be treated as validation of the deployed artifact until
parity is established. **RE-PARITY-1 is the first blocker in the program.** The study does not assume
which path is correct; it measures both under the same folds.

### 3.5 Downstream value transform

Raw predictions are not what downstream tools consume:

- Engine A DVS = `clamp(predicted_ppg / P90_A[position] * 100, 0, 100)`;
- Engine B DVS = `clamp(predicted_avg_ppg_t1_t2 / P90_B[position] * 100, 0, 100)`;
- low-game rows attempt an Engine A/B blend with `w_B = games / (games + k_pos)`;
- xVAR subtracts a frozen replacement DVS and applies a position multiplier;
- `projection_1y` and `projection_3y` are currently null on the Engine B PVO path;
- the DVS ceiling can collapse distinct raw predictions to 100.

The program must evaluate both raw prediction quality and post-transform decision utility. It must
never declare a model winner solely from DVS/xVAR or solely from RMSE.

## 4. Questions the program must answer

### Q1 — Are we predicting the right outcomes?

Compare the incumbent two-year average PPG target with explicit horizon targets and role-conditioned
targets. Determine whether one scalar hides materially different dynasty states: healthy starter,
injured incumbent, low-volume veteran, developing young player, and roster-exit risk.

### Q2 — Does the deployed pipeline match the validated pipeline?

Reproduce production predictions byte-for-byte, then run scaled and unscaled estimators under identical
folds. Any preprocessing, feature-order, missingness, or alpha difference must be explicit.

### Q3 — Which features add forward information beyond production history?

Measure marginal and conditional lift, stability, coverage, and interaction—not raw correlation alone.
Correlated families are substitutes in bake-offs, not additive shopping lists.

### Q4 — Are current weights stable or artifacts of units, regularization, collinearity, or outliers?

Test coefficient stability across seasons, player-cluster bootstrap samples, leave-one-player-out
perturbations, alternate scaling, and correlated-family substitutions.

### Q5 — Which scientific technique generalizes best at our effective sample size?

Compare simple baselines, regularized linear models, smooth nonlinear models, tree boosting, robust and
quantile methods, and role/production hurdle models. Complexity earns its place only through temporal
out-of-sample lift and stable calibration.

### Q6 — Where does each method work or fail?

Report performance by position, horizon, age/experience, prior role, games observed, injury/availability,
and starter-depth cohort. Do not hide weak subpopulations behind aggregate averages.

### Q7 — Does better prediction survive DVS/xVAR and routing?

Measure ordering changes, clamp saturation, replacement crossings, low-game behavior, and uncertainty
loss after transformation.

### Q8 — Does the output improve a real dynasty decision?

Use roster-relevant rank and threshold metrics: top-QB/RB/WR/TE identification, starter retention,
replacement crossing, and false-confidence costs. Market is a comparison lane, never the truth label.

## 5. Registered study populations and time contract

### 5.1 Engine A population

- One row per drafted or eligible rookie entrant at the pre-NFL decision timestamp.
- Features must be known by the pinned draft decision date.
- Outcomes must be structurally observable for the horizon under test.
- Undrafted and missing-draft-capital states are explicit cohorts, never silently dropped.
- Position models remain separate; TE's v3 routed override is evaluated as incumbent TE.

### 5.2 Engine B population

- One row per canonical player and feature-season at the end-of-season decision timestamp.
- Weekly data may create features, but the evaluation unit remains player-season; weeks are not treated
  as independent samples.
- Players with 0, 1–3, 4–7, and 8+ games are preserved as named cohorts.
- Identity unresolved, duplicate/conflict, position mismatch, and source-degraded rows are explicit
  dispositions.

### 5.3 Season type

The present Engine B aggregation includes postseason. The governing record does not settle whether the
target should be regular-season only. The research phase must run both definitions as a sensitivity,
but **David must rule the primary definition before the pre-registration is frozen and before any model
promotion decision**. No lane may silently select one.

### 5.4 Time folds

All evaluation is expanding-window and forward-only. For each target/horizon:

- training seasons precede the test feature-season;
- imputers, scalers, feature selection, encoders, calibration, and hyperparameters fit on training only;
- the outer fold is never used for candidate or hyperparameter selection;
- repeated player identities are allowed across seasons because that is the forecasting reality, but
  confidence intervals and permutation resampling cluster by player;
- one most-recent structurally mature season is reserved as a lockbox and is opened once per registered
  program version.

The exact fold table is generated after the season-type and target definitions are pinned. A fold with
insufficient evaluable population reports `unsupported_power`; it never borrows confidence from another
position or horizon.

## 6. Outcome suite

### 6.1 Engine A candidates

| ID | Target | Purpose |
| :-- | :-- | :-- |
| A0 | incumbent `y24_ppg` | Exact current-model reproduction |
| A1 | `best3of4_ppg` | Existing TE v3 absolute-production target generalized only as a candidate |
| A2-H1/H2/H3 | horizon-specific PPG | Separates immediate and developmental value |
| A3-H1/H2/H3 | startable-role occupancy | Probability the prospect holds a meaningful role |
| A4 | production residual after draft-capital expectation | Tests signal beyond the strongest rookie anchor without removing draft capital from Head A |

### 6.2 Engine B candidates

| ID | Target | Purpose |
| :-- | :-- | :-- |
| B0 | incumbent average PPG at T+1/T+2 | Exact current-model reproduction |
| B1-H1/H2/H3 | horizon-specific PPG | Uses all mature labels; feature-season 2024 may enter H1 now |
| B2-H1/H2/H3 | meaningful-role / availability probability | Separates exit/injury/role risk from conditional production |
| B3-H1/H2/H3 | PPG conditional on role | Magnitude among players with an observable role |
| B4-H1/H2/H3 | quantiles or prediction interval | Represents asymmetric forecast uncertainty |

The hurdle representation reports role probability and conditional production separately. A derived
expected value may be evaluated internally, but the two components remain available and no hidden blend
becomes a David-facing verdict.

## 7. Feature-family experiments

Every feature has `source`, `as_of`, `availability`, `version`, `coverage`, `identity_state`, and
`allowed_engine`. Family selection occurs inside training folds.

### 7.1 Incumbent/control families

1. draft capital and age-at-entry (Engine A);
2. current and lagged PPG;
3. games, snaps, and historical availability;
4. fitted age-curve state;
5. current Engine B position-specific efficiency/opportunity fields.

### 7.2 Candidate families

1. **Role trajectory:** weekly snaps, routes, targets, carries, red-zone/high-value opportunity,
   rolling slopes, volatility, and sustained-change indicators.
2. **Efficiency quality:** YPRR/TPRR alternatives, WOPR versus orthogonal components, EPA/CPOE and
   position-specific rate stats.
3. **NGS:** time to throw/CPOE, separation/cushion, RYOE/box rate—position-specific, never a unified
   wrong-constant matrix.
4. **PFF objective charting:** routes, alignment, pressure/depth, man/zone, opportunity and usage
   splits. Subjective grades remain prohibited unless separately ruled.
5. **PlayerProfiler:** breakout/production/athletic/medical candidates, with Engine A/B boundary and
   point-in-time availability tested rather than assumed.
6. **Availability/medical:** injury history, missed-time state, practice/participation only when
   point-in-time provenance supports the decision timestamp.
7. **Organizational context:** contracts, depth charts, roster competition, team continuity and role
   change. These are candidates, not established predictors.
8. **College priors in Engine B:** isolated experiment only. No wholesale migration; it tests whether
   a frozen rookie prior retains residual signal after NFL evidence arrives.

### 7.3 Required family tests

For each family and position/horizon:

- standalone coverage and missingness;
- point-in-time and leakage proof;
- univariate association with uncertainty, labeled descriptive;
- correlation/VIF or mutual-dependence map;
- incumbent + family incremental bake-off;
- incumbent with correlated family substituted, not duplicated;
- leave-one-family-out ablation from the best training-fold candidate;
- coefficient/permutation importance stability across folds;
- missingness-indicator and complete-case sensitivity;
- population-retention cost.

No feature is promoted because it has a plausible football story, a favorable coefficient, or a single
fold win.

## 8. Estimator bake-off

### 8.1 Baselines

- prior-season PPG;
- two- and three-season weighted carry-forward;
- age-adjusted carry-forward fitted within train;
- position mean/median by age-and-role cohort;
- incumbent production artifact and incumbent walk-forward implementation as separate controls until
  parity is resolved.

### 8.2 Tier-1 candidates — existing dependency surface

- standardized RidgeCV;
- ElasticNetCV;
- Huber/robust linear regression;
- spline/GAM-like additive model using `SplineTransformer` + regularized linear estimator;
- `HistGradientBoostingRegressor`;
- shallow `GradientBoostingRegressor`;
- quantile gradient boosting for interval heads;
- calibrated logistic regression and shallow gradient boosting for role heads.

Tree candidates use bounded depth/leaves and minimum leaf sizes derived from fold sample size. No deep
learning candidate is justified by the current effective N.

### 8.3 Tier-2 candidates — separate dependency gate

- CatBoost or XGBoost;
- Bayesian hierarchical / partial-pooling model;
- survival-specific library;
- sequence model over weekly trajectories.

Tier 2 opens only if Tier 1 leaves a material, named failure that the additional dependency directly
addresses and David authorizes the dependency. The core study must be runnable without Tier 2.

### 8.4 Ensembling

Stacking is permitted only from strict outer-fold OOF predictions and only if it beats its best member
by the registered materiality margin. No in-sample blending and no hand-tuned model weights.

## 9. Reverse-engineering and attribution methods

Attribution is diagnostic, not causal.

For every incumbent and candidate:

1. exact artifact metadata, feature order, preprocessing objects, coefficients/tree structure, hashes;
2. byte-exact prediction replay on a pinned fixture and the real inference frame;
3. raw coefficients plus standardized one-SD effects for linear models;
4. fold-wise and player-cluster bootstrap coefficient intervals;
5. permutation importance on untouched outer folds;
6. drop-column and leave-one-family-out importance;
7. partial dependence/ICE for continuous nonlinear candidates, with support-density warnings;
8. SHAP only for compatible tree candidates, computed on held-out rows and reconciled to predictions;
9. prediction sensitivity to missingness, feature perturbation, and outliers;
10. error slices and named player-level traces selected by pre-defined strata—not cherry-picked names.

The report distinguishes:

- **weight:** estimator parameter under a particular scale and correlated feature set;
- **importance:** change in predictive loss when information is disrupted;
- **association:** relationship in observed data;
- **causal effect:** not established by this program.

## 10. Evaluation metrics

### 10.1 Continuous production

- RMSE and MAE;
- R², reported with fold population;
- Spearman ρ and Kendall τ-b;
- calibration intercept/slope and residual-by-decile;
- top-k NDCG and precision/hit rate using position-aware roster-relevant k;
- quantile pinball loss and empirical interval coverage where intervals exist.

### 10.2 Role probability

- Brier score and log loss;
- AUROC and average precision, never alone;
- calibration slope/intercept and reliability curve;
- sensitivity/specificity at pre-registered descriptive thresholds;
- cohort prevalence and confidence intervals.

### 10.3 Decision-aligned utility

- correct ordering within likely starter pools;
- top-k realized-role and production capture;
- replacement-level crossing accuracy;
- false-high cost: player ranked as starter-relevant who fails to retain role;
- false-low cost: player omitted from starter-relevant pool who succeeds;
- stability of rankings under plausible data perturbations.

No utility metric becomes an automated transaction recommendation.

### 10.4 Statistical comparison

- paired outer-fold predictions on identical rows;
- player-clustered BCa bootstrap intervals for metric deltas;
- registered practical materiality margins, not p-values alone;
- Benjamini-Hochberg correction within declared candidate families;
- fold minimums and `unsupported_power` state;
- no winner when intervals include both meaningful benefit and meaningful harm.

## 11. Promotion gates

A position/horizon candidate is eligible for David's promotion ruling only when all apply:

1. **Parity:** candidate pipeline is identical between training, backtest, artifact, and serving.
2. **Leakage:** all features pass engine, market, point-in-time, and label-separation contracts.
3. **Population:** identity/join coverage and cohort retention meet registered floors.
4. **Primary metric:** paired improvement over the stronger of incumbent and naive baseline clears the
   registered materiality margin with a compatible clustered interval.
5. **Calibration:** no material calibration regression; probabilistic heads meet coverage/calibration
   floors.
6. **Stability:** no unexplained sign reversal, fold collapse, or outlier dependence.
7. **Most-recent fold:** does not regress beyond tolerance.
8. **Transformation:** improvement survives DVS/xVAR/routing evaluation without greater saturation or
   false certainty.
9. **Simplicity:** if two candidates are statistically inseparable, the simpler and more interpretable
   one wins.
10. **Human gate:** David separately rules on promotion. A winning bake-off does not auto-promote.

Promotion is per engine × position × target/horizon. No system-wide winner is inferred.

## 12. DVS, xVAR, blend, and routing audit

The study runs the OOF predictions through the exact downstream transforms and reports:

- raw prediction distribution by position and horizon;
- DVS distribution before and after clamp;
- number and identities-by-stratum—not David-facing target nomination—of ceiling/floor collisions;
- rank pairs destroyed by clamping;
- replacement crossings and sensitivity to replacement definitions;
- xVAR ordering and position-multiplier sensitivity;
- 0/1–3/4–7/8+ game cohort behavior;
- rookie-versus-veteran prior routing;
- uncertainty retained versus discarded;
- percentage of PVO rows with H1/H2/H3 and score-state completeness.

The current low-game bridge's rookie-prior request for mostly veteran players is an incumbent defect to
measure. Candidate research uses separate rookie and veteran prior contracts; it does not patch the
incumbent during the study.

## 13. Artifact contract

Every run writes an immutable directory:

```text
app/data/backtest/model_science/runs/<run_id>/
  run_manifest.json
  source_manifest.json
  cohort_census.json
  feature_catalog.json
  parity_audit.json
  candidate_registry.json
  fold_registry.json
  metrics.json
  comparison_matrix.json
  attribution.json
  transform_audit.json
  oof_predictions.parquet
  errors.parquet
  report.json
```

`run_manifest.json` pins:

- program/spec/config hash;
- code commit and dirty-state declaration;
- source paths, hashes, vintages, and permitted roles;
- target/scoring/season-type definitions;
- population filters and identity version;
- folds and lockbox state;
- candidates and hyperparameter spaces;
- random seeds;
- package versions;
- output hashes and terminal status.

The runner refuses overwrite. `_latest` may point to a verified run, but immutable runs accumulate for
longitudinal comparison.

## 14. Falsification matrix

| Class | Required break attempt | Fail-closed result |
| :-- | :-- | :-- |
| Artifact parity | reorder feature, omit scaler, alter imputer, mutate alpha | `pipeline_parity_failed` |
| Temporal leakage | introduce T+1 field or post-decision snapshot | `temporal_leakage` |
| Market leakage | add market/ADP field or derived alias | `market_leakage` |
| Identity | unresolved, duplicate, conflicting position, many-to-many join | quarantined census; no silent row |
| Target | missing outcome, incomplete horizon, postseason disagreement | explicit non-evaluable or sensitivity state |
| Missingness | all-null train feature, test-only feature, shifted null rate | candidate/fold unavailable |
| Scaling | zero variance, non-finite state, production/backtest mismatch | parity or numerical failure |
| Small N | fold below registered minimum | `unsupported_power` |
| Outlier | leave-one-player changes sign/material verdict | instability failure |
| Collinearity | correlated family added without substitution test | candidate invalid |
| Multiple testing | undeclared candidate/hyperparameter after lockbox | registration violation |
| Transform | clamp destroys ordering or uncertainty state | transformation gate failure |
| Reproducibility | same manifest yields different hashes/predictions | run invalid |

## 15. Security, licensing, and privacy

- No proprietary raw PFF/PlayerProfiler rows enter committed artifacts or reports.
- Aggregate coverage, hashes, feature names, distributions, and validation metrics may be retained when
  permitted; provider-native player-level exports remain protected and gitignored.
- Pickles are loaded only from pinned local model manifests; the audit runner records hashes before
  deserialization.
- Paths in portable artifacts are repository-relative; no machine-bound or temporary paths.
- External dependency or source expansion is a separate David gate.

## 16. Compounding-product contract

- **Daily-login value:** the eventual product can show what changed in a player's role, forecast, and
  uncertainty, but this research phase itself creates no new David-facing verdict surface.
- **Refresh cadence:** source capture follows meaningful change; models remain frozen until a governed
  promotion. Estimates may later refresh through the separately governed overlay.
- **Compounding:** every immutable run adds OOF predictions, errors, attribution, and calibration history.
  Forward realized outcomes append to the benchmark rather than overwriting prior evidence.
- **Honesty:** accumulating evidence never makes it decision-grade automatically.

## 17. Required outputs to David

1. **Incumbent forensic report:** every active artifact, feature, preprocessing step, weight, training
   population, target, and downstream transform.
2. **Data-to-model coverage map:** what we own, what is curated, what is consumed, and why each unused
   family is blocked.
3. **Outcome report:** which target definition best matches each decision horizon.
4. **Feature report:** marginal lift, stability, coverage, and redundancy by position/horizon.
5. **Science bake-off:** baselines and candidates with paired OOF deltas and uncertainty.
6. **Transformation audit:** whether DVS/xVAR preserves or destroys useful information.
7. **Decision matrix:** promote, retain incumbent, unsupported power, or research further for each cell.
8. **Path forward:** smallest set of separately authorized production changes justified by the evidence.

## 18. Human gates and status vocabulary

The research program ends in one of:

- `READY_FOR_RULING`: complete, reproducible evidence; David may rule per cell;
- `INCONCLUSIVE`: valid run, insufficient separation/power;
- `INVALID`: parity, leakage, data, or reproducibility failure;
- `BLOCKED`: a required David definition or external permission is absent.

Separate David words are required for:

1. ratifying the study definitions and pre-registration;
2. executing any paid-source refresh or new external-source access;
3. adding dependencies;
4. changing an engine feature contract;
5. compiling a candidate production artifact;
6. updating a model pointer or serving path;
7. commit, push, merge, or publication as governed at the time;
8. declaring any model or surface decision-grade.

## 19. Explicit non-goals

- no automated buy/sell/hold engine;
- no market-derived training feature;
- no giant all-columns model;
- no neural network justified by raw row count alone;
- no causal claim from predictive attribution;
- no rewriting the incumbent during the audit;
- no frontend redesign;
- no global winner that hides position/horizon failures;
- no promotion from a single fold, metric, coefficient, or anecdote.

## 20. Design readiness

This draft is internally executable but not yet a cleared study registration. Before execution:

1. compare it with Claude's independent design without pre-anchoring either lane;
2. reconcile factual differences by rerunning the cited repo probes;
3. preserve methodological disagreements for David;
4. obtain David's rulings on primary season type, target priority, and execution scope;
5. freeze the final registration hash; and
6. open the RED-first implementation plan that accompanies this document.

