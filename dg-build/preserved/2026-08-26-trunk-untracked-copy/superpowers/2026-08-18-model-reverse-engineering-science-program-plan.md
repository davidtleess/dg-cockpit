---
document: Model Reverse-Engineering and Scientific Bake-Off Implementation Plan
version: 0.1.0
status: DRAFT — independent Codex plan; ready for comparative gate, not execution-authorized
date: 2026-08-18
author: Codex
design: docs/superpowers/specs/2026-08-18-model-reverse-engineering-science-program-design.md
primary_layer: 3 — models
decision_supported: false
---

# Model Reverse-Engineering and Scientific Bake-Off Implementation Plan

## 0. Outcome and authority

This plan turns the companion design into a reproducible, test-first research program that can answer
which outcomes, features, preprocessing choices, estimators, and downstream value transforms deserve
promotion consideration for each position and forecast horizon.

This is a planning artifact only. It authorizes no product-code edit, production retrain, active model
pointer change, threshold change, commit, push, publication, or dynasty recommendation. The incumbent
remains frozen. Every generated artifact is recursively `decision_supported=false` until David rules
on a completed validation report.

The first execution gate is not “train a better model.” It is to establish that the incumbent can be
replayed exactly and to expose the known production-versus-validation preprocessing mismatch. Scaled
and unscaled Ridge are separate candidates until evidence and a later human ruling select one.

## 1. Preconditions and decisions required before the registered run

The following must be frozen in the study registration before candidate results are inspected:

1. **Outcome season type:** regular season only or regular plus postseason. The harness may compute both
   as a sensitivity, but only David can name the primary outcome.
2. **Engine B target eligibility:** minimum-game rules, treatment of zero-game seasons, and whether the
   estimand is unconditional production or production conditional on appearing.
3. **Engine A decision timestamp:** exact draft/preseason cutoff and the permissible draft-capital state.
4. **Promotion loss:** the primary position/horizon metric and the maximum tolerated regression in
   calibration, tail ranking, coverage, and vulnerable cohorts.
5. **QB rushing boundary:** rushing production remains a hypothesis **under test**. No new rushing
   feature candidate enters this program unless the registered QB-1 study is executed and David's
   ruling authorizes that lane. Incumbent behavior may be audited factually.

Work Packages 1–4 are descriptive and may run before those choices. The preregistered comparative run
must not begin until the choices are recorded.

## 2. Intended file and artifact topology

### 2.1 New research code

```text
app/config/model_science_program_v1.json
src/dynasty_genius/eval/model_science/
  __init__.py
  contracts.py
  inventory.py
  parity.py
  labels.py
  folds.py
  features.py
  estimators.py
  attribution.py
  metrics.py
  transforms.py
  artifacts.py
  runner.py
scripts/run_model_reverse_engineering.py
scripts/run_model_science_bakeoff.py
scripts/generate_model_science_report.py
```

The module is additive and isolated under `eval/model_science`. Existing trainers, services, active
manifests, and backtest behavior are read-only inputs during research. Any later production fix needs
its own authorization and plan.

### 2.2 New tests

```text
tests/model_science/test_contracts.py
tests/model_science/test_inventory.py
tests/model_science/test_parity.py
tests/model_science/test_labels.py
tests/model_science/test_folds.py
tests/model_science/test_features.py
tests/model_science/test_estimators.py
tests/model_science/test_attribution.py
tests/model_science/test_metrics.py
tests/model_science/test_transforms.py
tests/model_science/test_artifacts.py
tests/model_science/test_runner.py
tests/contract/test_model_science_artifact_schema.py
tests/contract/test_model_science_leakage_red.py
```

### 2.3 Immutable run output

```text
app/data/backtest/model_science/runs/<run_id>/
  run_manifest.json
  input_inventory.json
  source_provenance.json
  incumbent_replay.json
  pipeline_parity.json
  label_audit.json
  fold_registry.json
  feature_catalog.json
  candidate_registry.json
  predictions.parquet
  fold_metrics.parquet
  comparison_matrix.parquet
  attribution.parquet
  cohort_metrics.parquet
  transform_audit.parquet
  falsification_results.json
  reproducibility.json
  report.md
```

The runner must fail on an existing `run_id`; it never overwrites a prior run. A later convenience
pointer may reference a run, but may not mutate its contents.

## 3. Test and verification conventions

- Every task begins with a failing focused test or a deliberately failing audit assertion.
- Unit tests use synthetic fixtures with known labels, leakage traps, duplicate identities, missingness,
  and coefficients. Integration tests use pinned small repository fixtures.
- Full-data runs happen only after focused tests and repository quality checks pass.
- Comparisons use the same registered rows and folds. If a candidate loses rows, both intersection and
  full-coverage results are reported.
- Hyperparameters are selected only inside each training fold. No holdout season informs preprocessing,
  selection, calibration, imputation, or thresholds.
- Player identity is the clustering unit for uncertainty estimates and resampling.
- Generated Markdown is a view over machine-readable evidence, never an independent source of truth.

Standard focused command:

```bash
.venv/bin/python3.14 -m pytest -q tests/model_science/<test_file>.py
```

Standard research-suite command:

```bash
.venv/bin/python3.14 -m pytest -q tests/model_science tests/contract/test_model_science_artifact_schema.py tests/contract/test_model_science_leakage_red.py
```

Standard Python hygiene command for touched files:

```bash
uvx ruff check src/dynasty_genius/eval/model_science scripts/run_model_reverse_engineering.py scripts/run_model_science_bakeoff.py scripts/generate_model_science_report.py tests/model_science tests/contract/test_model_science_artifact_schema.py tests/contract/test_model_science_leakage_red.py
```

## 4. Work packages

### WP0 — Register the study contract and preserve independence

**Goal:** make all decision-sensitive choices inspectable before results exist.

**Files:**

- add `app/config/model_science_program_v1.json`;
- add `src/dynasty_genius/eval/model_science/contracts.py`;
- add `tests/model_science/test_contracts.py`;
- add a dated registration under `docs/validation/` only after David resolves the preconditions.

**RED tests:**

1. reject a contract without source snapshots, decision timestamps, season type, target definitions,
   cohort dispositions, fold rules, primary metrics, guardrails, multiple-testing policy, seed, and code
   revision;
2. reject `decision_supported=true` anywhere in a research contract;
3. reject market-derived fields in the model feature allow-list;
4. reject a QB rushing candidate while the QB-1 gate is unresolved;
5. reject mutable aliases in registered input paths.

**Implementation:** define strict dataclasses or typed validation functions and a canonical JSON hash.
The contract hash becomes part of every output row.

**Verification:** run `test_contracts.py`; parse and canonicalize the checked-in JSON twice and require
identical hashes.

**Exit evidence:** `contract_hash`, explicit human decisions, and a registration status of
`registered_not_run`. No empirical result is written into the registration.

### WP1 — Inventory every incumbent and reconstruct the execution chain

**Goal:** answer exactly what is active, what trained it, what data it saw, and how its prediction reaches
the product.

**Files:**

- add `inventory.py`, `test_inventory.py`;
- add `scripts/run_model_reverse_engineering.py`.

**RED tests:**

1. resolve Engine A's routed TE override separately from the baseline position artifacts;
2. resolve Engine B QB/RB/WR and TE artifact timestamps from the active manifest;
3. reconstruct exact feature order, coefficient, intercept, alpha, imputer, scaler presence, fit seasons,
   and fit-row count;
4. fail closed when a referenced artifact, feature, or provenance field cannot be resolved;
5. identify training-eligible seasons that were held out and not included in the saved fit;
6. enumerate downstream DVS, blend, replacement, and xVAR transforms without executing mutations.

**Implementation:** build a normalized inventory schema with one row per active position/model route and
one row per feature. Hash model files, manifests, datasets, and transformation source files.

**Verification:** compare reconstructed row counts and active timestamps against the manifests and
training datasets. Expected incumbent facts include QB/RB/WR Engine B fit through 2021 and the separately
refit TE artifact.

**Exit evidence:** `input_inventory.json`, `source_provenance.json`, and a human-readable chain map for
every active route.

### WP2 — Reproduce incumbent predictions and establish pipeline parity

**Goal:** distinguish artifact replay from scientific validation and make `RE-PARITY-1` measurable.

**Files:**

- add `parity.py`, `test_parity.py`;
- do not modify `scripts/train_engine_b.py`, `app/services/engine_b_service.py`, or the current harness.

**RED tests:**

1. replay a stored artifact on its pinned inputs and require prediction equality within `1e-10`;
2. detect feature-order drift, dtype drift, imputer mismatch, scaler mismatch, and alpha mismatch;
3. prove that median-imputer-plus-unscaled-Ridge and median-imputer-plus-scaler-plus-Ridge are different
   candidate identities even when their feature names match;
4. fail a “validated deployed model” claim when the validation pipeline hash differs from production;
5. preserve the mismatch as evidence rather than silently normalizing it away.

**Implementation:** serialize a preprocessing/estimator fingerprint and compare production training,
production scoring, existing backtest, and newly registered candidate pipelines.

**Verification:** the initial repository audit is expected to return:

```text
artifact_replay: pass
production_train_vs_score: inspect/pass if reconstructed components match
production_vs_existing_walk_forward: fail
reason: StandardScaler present only in existing walk-forward path
```

An unexpected pass stops the program for investigation because it contradicts the verified design
inventory. The study proceeds by evaluating scaled and unscaled pipelines as separate candidates; it
does not repair production implicitly.

**Exit evidence:** `incumbent_replay.json` and `pipeline_parity.json` with component hashes and explicit
claim limits.

### WP3 — Build point-in-time labels and exploit all mature horizons

**Goal:** stop treating “not mature for two years” as “not usable.”

**Files:**

- add `labels.py`, `test_labels.py`.

**RED tests:**

1. a 2024 feature row may receive an H1 outcome when 2025 is complete, but may not receive an H2 outcome
   requiring incomplete 2026 data;
2. no outcome week/season may leak into its own features;
3. regular-season and postseason-inclusive labels are separate columns with provenance;
4. zero-game, roster-exit, injury/absence, and missing-source states are not conflated;
5. Engine A `year-1`, `best-3-of-4`, threshold/role, and survival labels obey maturity masks;
6. Engine B H1, H2, H3, conditional-PPG, games/role, replacement-crossing, and roster-retention labels
   carry their own observability masks;
7. duplicate player-season outcomes and unresolved identities fail closed.

**Implementation:** create long-form labels keyed by canonical player, feature season, target horizon,
season type, and target family. Retain both numerator production and exposure/availability components.

**Verification:** publish counts by feature season, position, label, maturity, zero-game state, and source.
Manually reconcile sampled player-season histories at every boundary year.

**Exit evidence:** `label_audit.json`. The output must make clear that 2024 contributes to mature H1 tests
without pretending it has a mature H2 label.

### WP4 — Freeze walk-forward folds and leakage protections

**Goal:** give every candidate the same honest temporal exam.

**Files:**

- add `folds.py`, `test_folds.py`;
- add `tests/contract/test_model_science_leakage_red.py`.

**RED tests:**

1. training labels must mature before the validation decision timestamp;
2. a canonical player cannot appear in both train and validation when the registered contrast forbids it;
3. preprocessing and hyperparameter fit methods receive training rows only;
4. fold definitions are identical across candidates for a position/horizon comparison;
5. late-arriving source snapshots are rejected even when their stat season looks historical;
6. feature selection using all seasons triggers the red-team leakage fixture.

**Implementation:** materialize a fold registry rather than generating folds ad hoc. Support expanding
walk-forward folds, rookie-class holdouts, cold-start reporting, and a final untouched terminal season.

**Verification:** inspect row counts, date inequalities, player overlap, maturity masks, and fold hashes.
Run the leakage-red suite separately and require it to fail each planted leak.

**Exit evidence:** `fold_registry.json` plus fold membership checksums.

### WP5 — Create the point-in-time feature-family catalog

**Goal:** test information families rather than merely accumulating columns.

**Files:**

- add `features.py`, `test_features.py`.

**RED tests:**

1. every feature declares source, timestamp, position eligibility, unit, transformation, missingness
   policy, and governance status;
2. `substrate_only` and `context_signal` features cannot enter a candidate without an explicit registered
   research lane;
3. market/ADP/rank fields are rejected from training matrices;
4. missingness indicators are generated only inside registered candidates and never from future coverage;
5. a feature-family join with duplicate or conflicting identities fails closed;
6. continuous age transformations pass; hard age-cliff encodings fail;
7. family ablations preserve the exact comparison row set or label the coverage change.

**Implementation:** define position-specific families:

- incumbent production/exposure;
- age/experience and continuous aging;
- role/opportunity and depth-chart state;
- efficiency and usage quality;
- availability/injury context;
- contract/organization context;
- college/draft priors for Engine A and low-sample Engine B;
- isolated research lanes for NGS, objective PFF fields, PlayerProfiler, and other curated candidates.

Correlated fields are grouped so the experiment can compare substitute families and conditional lift.
The catalog reports source coverage and missingness by season before any fit.

**Verification:** generate matrix hashes for every candidate/fold and compare sample counts. Run a
feature-availability audit at each historical decision timestamp.

**Exit evidence:** `feature_catalog.json` with approved, excluded, unavailable, and research-only states.

### WP6 — Implement baselines and the estimator registry

**Goal:** make complexity compete against strong, interpretable baselines.

**Files:**

- add `estimators.py`, `test_estimators.py`.

**RED tests:**

1. each pipeline owns imputation, scaling, feature transformations, and estimator in one fold-local object;
2. tuning sees only inner training splits;
3. predictions are deterministic under the registered seed;
4. candidate IDs change when preprocessing, target, feature family, estimator, or hyperparameters change;
5. scaled and unscaled Ridge produce separately attributed output;
6. unsupported optional dependencies fail with `dependency_gate_required`, not an automatic install;
7. quantile outputs are ordered and probability outputs remain within `[0, 1]`.

**Tier 0 baselines:**

- position mean and age/experience mean;
- last observed PPG;
- games-weighted PPG carry-forward;
- current Engine A and Engine B artifact replay;
- draft-capital-only Engine A baseline.

**Tier 1 candidates using existing dependencies:**

- scaled and unscaled Ridge/ElasticNet;
- robust Huber regression;
- spline or basis-expanded regularized regression for continuous aging/nonlinearity;
- histogram gradient boosting and conservative gradient boosting;
- quantile regression for interval/tail behavior;
- calibrated logistic classifiers for role, survival, and replacement crossing;
- two-stage hurdle models: probability of role/appearance × conditional production.

**Tier 2 candidates behind a separate dependency and governance gate:** CatBoost/XGBoost, Bayesian
hierarchical models, survival models, or sequence models. They are not installed by this plan.

**Verification:** recover known coefficients on synthetic data; prove no gain over a baseline when the
fixture contains no incremental signal; verify all fold pipelines serialize their full fingerprint.

**Exit evidence:** `candidate_registry.json` with rationale, dependency status, target, and fingerprint.

### WP7 — Add attribution, stability, and causal-claim guardrails

**Goal:** explain predictive behavior without pretending prediction establishes causality.

**Files:**

- add `attribution.py`, `test_attribution.py`.

**RED tests:**

1. raw and standardized linear coefficients are both reported with units;
2. permutation and drop-column importance use held-out predictions only;
3. clustered bootstrap resamples players, not player-season rows independently;
4. sign stability and rank stability degrade on a deliberately unstable fixture;
5. correlated substitute features are not described as independently additive signal;
6. partial-dependence/ICE inputs stay within observed support or carry an extrapolation flag;
7. tree SHAP, if available, is computed only on out-of-fold models/rows and is descriptive.

**Implementation:** produce coefficient paths, standardized effects, player-cluster bootstrap intervals,
fold sign/rank stability, held-out permutation, family drop-column loss, and supported-range PDP/ICE.
SHAP is optional for compatible tree candidates and never the sole attribution method.

**Verification:** test against known synthetic truth, duplicated correlated features, outliers, and
season-shift fixtures.

**Exit evidence:** `attribution.parquet` with method, fold, feature/family, effect, interval, stability,
coverage, and claim-limit fields.

### WP8 — Implement metrics, uncertainty, and candidate comparisons

**Goal:** select models by the decisions they support, not a single aggregate score.

**Files:**

- add `metrics.py`, `test_metrics.py`.

**RED tests:**

1. verify RMSE, MAE, Spearman, calibration slope/intercept, Brier/log loss, AUROC/AUPRC, NDCG/top-k, and
   coverage/interval width against hand-calculated fixtures;
2. require paired comparisons on identical fold rows;
3. require player-clustered confidence intervals and fold-level dispersion;
4. detect a candidate that improves mean RMSE but materially harms a registered vulnerable cohort;
5. apply registered practical-effect thresholds before significance labels;
6. apply Benjamini–Hochberg correction within registered comparison families;
7. report missing/undefined metrics rather than coercing them to zero.

**Implementation:** compute outcome-appropriate metrics for continuous production, rank/tail decisions,
binary role/survival, and probabilistic/interval predictions. Candidate decisions are independent by
engine, position, horizon, and target family.

**Verification:** compare library output to small manually calculated tables and simulate null comparisons
to test false-discovery behavior.

**Exit evidence:** `fold_metrics.parquet`, `cohort_metrics.parquet`, and `comparison_matrix.parquet`, each
with paired row counts, effect sizes, intervals, corrected q-values, and guardrail status.

### WP9 — Audit DVS, low-game routing, replacement, and xVAR transforms

**Goal:** determine whether raw forecast gains survive product transformations.

**Files:**

- add `transforms.py`, `test_transforms.py`;
- keep current product transformation code read-only.

**RED tests:**

1. reconstruct incumbent DVS and xVAR exactly for pinned fixtures;
2. quantify P90 normalization drift by season and position;
3. count clamp-to-0 and clamp-to-100 saturation and detect rank ties introduced by clamping;
4. report replacement crossings before and after transformation;
5. prove low-game blending uses the intended prior population; flag a rookie prior applied to veterans;
6. flag missing `projection_1y`/`projection_3y` when a surface claims those horizons;
7. preserve predictive uncertainty or explicitly record where the transform discards it.

**Implementation:** create a shadow transform evaluator that consumes out-of-fold predictions and mirrors
incumbent transforms without changing production. Measure rank preservation, threshold flips, saturation,
calibration distortion, and cohort-specific routing behavior.

**Verification:** compare shadow outputs with shipped outputs on a pinned sample, then perturb raw
predictions around P90 and replacement thresholds to test discontinuities and information loss.

**Exit evidence:** `transform_audit.parquet`. A statistically winning raw model cannot pass promotion if
the downstream transform erases the registered practical gain or increases false confidence.

### WP10 — Orchestrate immutable runs and reproducibility checks

**Goal:** make one command produce a complete, non-overwriting evidence packet.

**Files:**

- add `artifacts.py`, `runner.py`, `test_artifacts.py`, `test_runner.py`;
- add `scripts/run_model_science_bakeoff.py`;
- add `tests/contract/test_model_science_artifact_schema.py`.

**RED tests:**

1. reject an existing run directory;
2. fail before fitting when an input hash, contract hash, fold hash, or code revision differs from the
   manifest;
3. write through a staging directory and expose the immutable run only after all required artifacts pass;
4. reject missing schema fields or any nested `decision_supported=true`;
5. require candidate, fold, row, feature, and pipeline fingerprints on every prediction;
6. rerunning the same fixture produces the same predictions and canonical evidence hashes;
7. an interrupted run cannot masquerade as complete.

**Implementation:** build a manifest-first runner with atomic publication into the run directory, explicit
status (`started`, `failed`, `complete_research_only`), package/version capture, seeds, and checksum table.

**Verification:** run the synthetic end-to-end fixture twice under distinct run IDs and compare semantic
hashes. Corrupt one artifact and require schema validation to fail.

**Exit evidence:** a complete synthetic run packet and `reproducibility.json`.

### WP11 — Execute the preregistered bake-off

**Goal:** generate evidence, not a promotion.

**Preconditions:** WP0 human decisions recorded; WPs 1–10 tests and contract checks green; input snapshots
pinned; no candidate results previously exposed under a mutable registration.

**Command shape:**

```bash
.venv/bin/python3.14 scripts/run_model_science_bakeoff.py \
  --config app/config/model_science_program_v1.json \
  --run-id <immutable-run-id>
```

**Execution order:**

1. incumbent replay and parity audit;
2. label and coverage audit;
3. frozen-fold baseline run;
4. preprocessing comparison;
5. feature-family additions and ablations;
6. estimator bake-off;
7. attribution/stability analysis;
8. cohort and falsification tests;
9. downstream transform audit;
10. schema and reproducibility validation.

No stage may remove a failed candidate or cohort from the report. Infrastructure failures are distinct
from statistical losses. If the active incumbent cannot be replayed, all comparative model claims stop;
the failure itself is the result.

**Exit evidence:** one immutable `complete_research_only` run packet. No production pointer or product file
is changed.

### WP12 — Generate the decision report and path forward

**Goal:** convert the complete packet into a falsifiable promotion recommendation for David.

**Files:**

- add `scripts/generate_model_science_report.py`;
- create `docs/validation/<date>-model-science-bakeoff-decision.md` using the `validation-report` skill at
  execution time.

**Required report sections:**

1. decision asked and authority boundary;
2. registered contract and deviations;
3. exact incumbent reconstruction and parity result;
4. label coverage, including what 2024 can and cannot support;
5. candidate and feature-family results by engine/position/horizon;
6. coefficient/importance stability and missingness/coverage costs;
7. cohort failures and falsification results;
8. DVS/xVAR/routing consequences;
9. deployment, rollback, and monitoring implications;
10. cell-by-cell disposition: `PROMOTION_CANDIDATE`, `RESEARCH_ONLY`, `INCUMBENT_RETAINED`,
    `NO_DECISION`, or `INVALID`;
11. explicit human decisions required.

The generator must render claims from registered result fields, not infer winners from prose templates.
The report links every material claim to a run artifact and carries `decision_supported=false` until
David rules.

**Verification:** validate all cited run paths and comparison IDs, search for unregistered causal language,
and independently reconcile a sample of report values to source rows.

**Exit evidence:** validation report plus a short prioritized path forward:

- production-parity repair, if warranted;
- target/horizon changes, if warranted;
- feature curation backlog ranked by measured conditional lift × coverage × stability × cost;
- estimator promotions by position/horizon, if any;
- DVS/xVAR redesign tasks where transformation destroys useful signal;
- “do nothing” cells where the incumbent wins or evidence is inadequate.

## 5. Registered falsification matrix

The completed runner must attempt to disprove, not merely support, each candidate claim:

| Claim | Falsification test | Failure disposition |
| :-- | :-- | :-- |
| New feature family adds signal | held-out drop-column loss, shuffled-family placebo, season stability | reject or research-only |
| Weight is meaningful | standardized effect, player bootstrap sign/rank stability, correlated substitute | descriptive only if unstable |
| Nonlinear model is better | paired temporal folds, terminal season, calibration and cohort guardrails | retain simpler model |
| 2024 improves evidence | H1-only maturity audit; exclude any immature H2/H3 label | invalidate contaminated comparison |
| Scaled Ridge validates production | full pipeline fingerprint equality | claim invalid while hashes differ |
| Aggregate gain helps decisions | top-k/replacement metrics and transform audit | no promotion if utility is erased |
| Low-game blend helps | veteran/rookie separation and prior-appropriateness test | redesign blend before promotion |
| More source data helps | point-in-time coverage, conditional lift, missingness shift, licensing/security | do not curate/promote source |
| Confidence is honest | empirical interval coverage and probability calibration | no confidence-bearing surface |

## 6. Promotion gates

A candidate may be presented to David as `PROMOTION_CANDIDATE` only when all applicable gates pass:

1. exact incumbent replay;
2. explicit estimator/pipeline identity and parity status;
3. leakage-free point-in-time labels and folds;
4. primary metric practical lift with clustered uncertainty;
5. no registered material regression in calibration, tail ranking, or vulnerable cohorts;
6. feature coverage, identity, provenance, licensing, and runtime cost acceptable;
7. attribution direction and magnitude sufficiently stable for the intended surface;
8. downstream DVS/xVAR/routing retains the benefit and does not increase false confidence;
9. complete immutable artifacts and reproducible rerun;
10. independent review and David's explicit ruling.

Passing gates permits a promotion proposal, not production deployment. Deployment requires a separate
implementation plan, rollback design, shadow evaluation, and pointer-change authorization.

## 7. Sequencing, dependencies, and parallel-safe lanes

```text
WP0 contract ─┬─> WP3 labels ─> WP4 folds ───────────────┐
              └─> WP1 inventory ─> WP2 parity ──────────┤
WP4 folds + WP5 features + WP6 estimators ─> WP7/WP8 ───┤
WP2 parity + WP8 metrics ─> WP9 transforms ─────────────┤
WP0–WP9 ─> WP10 immutable runner ─> WP11 run ─> WP12 report/human gate
```

After the contract is frozen, feature-catalog construction, estimator unit implementation, metric
fixtures, and transform reconstruction can proceed in parallel because they write disjoint modules.
Label/fold logic and incumbent/parity logic remain serial within their lanes. No parallel lane edits
active production trainers, services, manifests, or pointers.

## 8. Estimated execution slices

These are scope slices, not promises of statistical success:

1. **Foundation audit:** WP0–WP2 — contract, incumbent inventory, exact replay, parity evidence.
2. **Truth set:** WP3–WP5 — labels, folds, point-in-time feature catalog.
3. **Science engine:** WP6–WP10 — candidates, attribution, metrics, transforms, immutable runner.
4. **Registered run:** WP11 — compute and immutable artifacts.
5. **Decision packet:** WP12 — validation report, independent review, David gate.

Each slice ends with an evidence review. A failed slice is not bypassed by starting a later one.

## 9. Final implementation verification checklist

Before a registered run is called complete:

- focused and full model-science tests pass;
- touched-file Ruff checks pass under the code-hygiene policy;
- artifact schema and leakage-red contracts pass;
- active artifacts replay or the report explicitly stops comparative claims;
- all run inputs, code, folds, pipelines, and outputs are hashed;
- no market-derived training feature exists;
- no unsupported QB rushing claim or candidate exists;
- 2024 contributes only to structurally mature outcomes;
- all candidates include baselines and exact paired row counts;
- fold and player-cluster uncertainty is present;
- failed/null results and vulnerable-cohort regressions remain visible;
- downstream transformation effects are reported;
- the run is immutable and a duplicate semantic run reproduces;
- report claims resolve to machine-readable evidence;
- every artifact remains `decision_supported=false` pending David's ruling.

## 10. Comparative gate for the Claude and Codex designs

When Claude's independent design is complete, compare without silently merging:

1. outcome definitions and maturity treatment;
2. incumbent reconstruction and production/validation parity;
3. fold, leakage, and uncertainty contracts;
4. feature families and source-governance assumptions;
5. estimator set and complexity controls;
6. attribution and falsification methods;
7. downstream DVS/xVAR/routing coverage;
8. promotion thresholds and human decision points;
9. implementation topology, sequencing, cost, and rollback implications.

For every disagreement, preserve: Codex claim, Claude claim, shared evidence, missing evidence, decision
impact, reversible experiment, and David's ruling. Agreement between agents is not validation; it is
only a prioritization signal.

## 11. Plan status

**READY_FOR_GATE** — the design and implementation sequence are specific enough for independent review
and comparison with Claude's draft. Execution of the registered comparative run remains gated on the
five decisions in Section 1 and on explicit implementation authorization.
