# CODEX independent model science program — execution plan

**Prepared by:** **CODEX — Independent Third-Party Consultant**  
**Recommendation owner:** **CODEX**  
**Owner gate:** David / Judge  
**Design source:** `docs/agent-ledger/evidence/2026-08-18/independent_model_reverse_engineering_design_codex_v1.md`  
**Execution status:** not started; this plan makes no product or registry change  
**Layer:** 3 (intelligence) with Layer 1–2 and Layer 5 prerequisites  

## Scope

Build a reproducible model-research lane that reverse engineers every active model, replaces incomparable validation with a common nested expanding-time contract, tests a narrow set of scientific challengers, and evaluates whether forecasts improve actual dynasty decisions. Preserve the production registry until a separate human promotion gate.

Out of scope: market-derived predictive features; broad feature-store rebuild; Studio/UI work; automatic registry writes; deep learning; cross-position monoliths; reinterpreting the accepted QB-1 result beyond the pinned veteran regular-season PPG ceiling.

## Human decisions required before Task 3

1. Decide regular-season-only versus all-game aggregation for Engine B. Recommended: regular-season only, with postseason represented only in explicitly named decision simulations.
2. Define governed participation/PPG denominators by position.
3. Select the first decision lane. Recommended: trade/roster-value decisions because multi-horizon availability and production are material there.
4. Approve minimum promotion effects and acceptable abstention/calibration thresholds.

Tasks 1–2 are safe evidence and contract work. Tasks 3 onward must wait for these definitions and for current R1/R2 outcome-loop priorities to clear.

## Task 1 — freeze and reproduce the current baselines

**Tests first**

- Add `tests/contract/test_model_science_active_baselines.py`.
- Assert every active registry entry resolves to a readable artifact and immutable SHA-256.
- Assert artifact feature order equals the inference contract.
- Assert QB/RB/WR predictions and metrics reproduce the saved 2022–2023 reports within `1e-6` from the pinned dataset hash.
- Assert TE is labeled `in_sample` and cannot be placed in a `temporal_holdout` comparison table.
- Assert v1.1 overall metrics cannot be consumed as position-specific evidence.
- Assert active Engine B Ridge bundles declare whether scaling occurred; current bundles should produce an explicit legacy-unscaled warning.

**Implementation**

- Add `src/dynasty_genius/eval/model_science/provenance.py` for artifact, dataset, code, split, target, and preprocessing manifests.
- Add `src/dynasty_genius/eval/model_science/active_baselines.py` to emit frozen out-of-fold/holdout predictions without retraining.
- Add `scripts/export_active_model_baselines.py` with required `--output-dir` and no registry mutation path.
- Write outputs under a dated evidence directory, never `app/data/models/`.

**Verify**

```bash
.venv/bin/python3.14 -m pytest tests/contract/test_model_science_active_baselines.py -q
.venv/bin/python3.14 scripts/export_active_model_baselines.py --output-dir docs/agent-ledger/evidence/YYYY-MM-DD/model-science-baselines
git diff -- app/config/model_registry.json app/data/models
```

Expected final command output: empty diff.

## Task 2 — repair inference routing before judging model lift

**Tests first**

- Extend `tests/test_engine_b_service.py` for the 114 served low-game rows: a veteran without a true Engine A prior must never report `dvs_engine=A`.
- Add cases for 0, 1–3, 4–7, and 8+ games and for true rookies versus veterans.
- Assert the 108 1–3 game players remain represented by an explicit governed state rather than being silently removed before inference.
- Assert fallbacks expose reason, evidence age, model eligibility, and uncertainty.

**Implementation**

- Introduce an explicit inference state enum in the existing Engine B service boundary: `PROSPECT_PRIOR`, `LOW_SAMPLE_VETERAN_PRIOR`, `BLENDED`, `ENGINE_B`, `PRE_MODEL`.
- Use a veteran position/age prior or abstention for low-game veterans; do not route them to the rookie forecast.
- Preserve continuous shrinkage and the governed eight-game eligibility threshold until a separate validation changes it.

**Verify**

```bash
.venv/bin/python3.14 -m pytest tests/test_engine_b_service.py tests/test_roster_engine_b_section5.py -q
```

## Task 3 — create explicit multi-horizon outcome contracts

**Tests first**

- Add `tests/contract/test_forecast_outcome_contract.py`.
- Pin definitions for `active_h1..h3`, `games_h1..h3`, `ppg_h1..h3`, and `role_h1`.
- Assert every label uses data strictly after feature season T and only information mature as of the dataset cutoff.
- Assert partial H2/H3 horizons are null, not averaged into a shorter label.
- Assert 2024 can be eligible for H1 while remaining ineligible for immature H2/H3.
- Assert regular-season/postseason semantics match the human decision.

**Implementation**

- Add `src/dynasty_genius/models/forecast_outcome_contract.py`.
- Add `scripts/assemble_forecast_outcomes.py` that writes a new versioned candidate dataset; do not overwrite `engine_b_features_v2.csv`.
- Emit a manifest with source hashes, row counts, horizon maturity, rejection reasons, scoring version, and postseason mode.

**Verify**

```bash
.venv/bin/python3.14 -m pytest tests/contract/test_forecast_outcome_contract.py -q
.venv/bin/python3.14 scripts/assemble_forecast_outcomes.py --as-of YYYY-MM-DD --output app/data/training/candidates/forecast_outcomes_v1.csv --manifest docs/agent-ledger/evidence/YYYY-MM-DD/forecast_outcomes_v1.manifest.json
```

## Task 4 — build the common nested expanding-time harness

**Tests first**

- Add `tests/test_nested_walk_forward.py`.
- Assert outer training seasons are strictly less than each test season.
- Assert imputation, scaling, feature selection, tuning, and calibration fit only on each training fold.
- Assert inner folds remain strictly inside the outer training window.
- Assert repeated player rows cannot cross backward in time.
- Assert the output includes every position × horizon × outer-season cell, pooled predictions, worst-season metrics, and player-cluster intervals.
- Add `tests/contract/test_model_experiment_manifest.py` for hypothesis, population, features, grids, metrics, seeds, hashes, and decision rules.

**Implementation**

- Add `src/dynasty_genius/eval/model_science/nested_walk_forward.py`.
- Add `src/dynasty_genius/eval/model_science/cluster_bootstrap.py`.
- Add `src/dynasty_genius/eval/model_science/calibration.py`.
- Reuse stable metric primitives from `src/dynasty_genius/eval/backtest_metrics.py`; do not silently change their definitions.
- Add `scripts/run_model_science_bakeoff.py --experiment-manifest ... --output-dir ...`.

**Verify**

```bash
.venv/bin/python3.14 -m pytest tests/test_nested_walk_forward.py tests/contract/test_model_experiment_manifest.py tests/test_backtest_metrics.py -q
```

## Task 5 — establish controls and target-decomposition baselines

**Tests first**

- Add `tests/test_forecast_baselines.py`.
- Pin naive prior-season, position/age mean, frozen active artifact, standardized Ridge, and Elastic Net predictions.
- Assert availability and conditional-production predictions recombine arithmetically into unconditional expected points.
- Assert continuous age transforms have no hard cliffs.

**Implementation**

- Add `src/dynasty_genius/models/forecast_baselines.py`.
- Add a logistic or discrete-time survival availability baseline and standardized conditional Ridge.
- Use position/experience partial pooling where sample size supports it.
- Make all coefficients, scales, intercepts, and fold-local preprocessing exportable.

**Verify**

```bash
.venv/bin/python3.14 -m pytest tests/test_forecast_baselines.py tests/test_aging_curves.py -q
```

## Task 6 — run feature-block ablations

**Tests first**

- Add `tests/contract/test_model_feature_blocks.py`.
- Assert every feature has lineage, as-of timestamp, coverage, missingness semantics, and allowed position(s).
- Assert market features and Engine A-only college fields are rejected from Engine B matrices.
- Assert optional NGS features cannot be imputed across positions.
- Assert coverage and era indicators are evaluated, not silently discarded.

**Implementation**

- Define blocks in `src/dynasty_genius/models/forecast_feature_contract.py`: production, role, efficiency, availability/health, team context, trajectory, prospect priors, and optional NGS.
- Add blocks one at a time to the strongest standardized control.
- Export per-fold incremental metrics, feature coverage, sign/effect drift, permutation importance on held-out folds, and ablation deltas.
- Quarantine blocks whose gains disappear under era, missingness, or player-cluster sensitivity.

**Verify**

```bash
.venv/bin/python3.14 -m pytest tests/contract/test_model_feature_blocks.py tests/test_engine_b_contract.py -q
```

## Task 7 — execute the preregistered technique bakeoff

Candidate families: standardized Ridge, Elastic Net, continuous-age GAM/splines, shallow histogram gradient boosting, two-part availability-plus-production, and a hierarchical partial-pooling model if diagnostics support it.

**Hard gates**

- positive RMSE and MAE lift with player-cluster 90% interval above zero;
- no material Spearman/NDCG or decision-utility degradation;
- governed interval coverage and calibration slope/intercept;
- no catastrophic outer season or protected critical segment;
- stable qualitative effects across folds;
- all artifacts and out-of-fold predictions reproducible by hash.

**Tests first**

- Add `tests/test_model_promotion_evidence.py` to fail closed on missing cells, missing predictions, incomparable folds, in-sample metrics, or a failed hard gate.
- Assert RMSE and R² cannot count as two independent reasons by themselves.
- Assert the runner cannot write `app/config/model_registry.json`.

**Verify**

```bash
.venv/bin/python3.14 -m pytest tests/test_model_promotion_evidence.py -q
.venv/bin/python3.14 scripts/run_model_science_bakeoff.py --experiment-manifest docs/model-science/experiments/<approved>.json --output-dir docs/agent-ledger/evidence/YYYY-MM-DD/<run-id>
```

Judge reviews the evidence pack. A passing run remains a candidate until David explicitly approves promotion.

## Task 8 — validate decision advantage, not just forecast skill

**Tests first**

- Add `tests/test_decision_backtest.py`.
- Assert league settings, replacement, scarcity, roster window, uncertainty, transaction cost, and abstention are explicit inputs.
- Assert market values enter only after the football forecast is frozen.
- Assert outputs include feasible-alternative regret, action precision/coverage, expected utility, realized utility, and calibration by confidence bucket.
- Assert unsupported or high-uncertainty actions abstain.

**Implementation**

- Add `src/dynasty_genius/eval/decision_backtest.py` as an evaluation-only module.
- Start with the human-selected decision lane and reconstruct point-in-time feasible alternatives.
- Test action thresholds on inner seasons and score them only on outer seasons.
- Segment results by league format, position, contender/rebuilder window, liquidity, and confidence.

**Verify**

```bash
.venv/bin/python3.14 -m pytest tests/test_decision_backtest.py -q
```

## Task 9 — shadow, monitor, and promote one lane at a time

**Tests first**

- Add contract tests for feature freshness, schema drift, population drift, residual drift, calibration drift, fallback, registry atomicity, and rollback.
- Assert shadow forecasts cannot affect user-facing values or recommendations.
- Assert promotion requires an approved evidence manifest and explicit human approval token.

**Implementation**

- Run the candidate beside production for one governed evaluation window.
- Publish forecast and decision scorecards through the existing outcome loop.
- Promote one position × horizon lane at a time using a separately reviewed registry-only change.
- Preserve the prior artifact and one-command rollback.

**Verify**

```bash
.venv/bin/python3.14 -m pytest tests/contract/test_model_shadow_lane.py tests/contract/test_model_registry_promotion.py -q
git diff --check
```

## Delivery checklist

- [ ] Human decisions recorded and postseason semantics pinned.
- [ ] Active baseline predictions reproduced by hash.
- [ ] Low-game inference routing corrected and observable.
- [ ] H1/H2/H3 target manifests validated.
- [ ] Nested expanding-time harness red/green tests pass.
- [ ] Strong standardized controls established.
- [ ] Feature blocks pass leakage, coverage, and era review.
- [ ] Candidate bakeoff passes all hard gates.
- [ ] Decision backtest shows positive utility after uncertainty and costs.
- [ ] Shadow lane and rollback pass real-surface QA.
- [ ] Judge review complete; David promotion approval explicit.

READY_FOR_GATE
