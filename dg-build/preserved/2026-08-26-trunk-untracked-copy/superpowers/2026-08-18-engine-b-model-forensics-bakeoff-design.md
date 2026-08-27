# Engine B Model Forensics + Technique Bake-Off — Design Spec

| | |
| :-- | :-- |
| **Date** | 2026-08-18 |
| **Status** | **DRAFT — awaiting cockpit CLEAR, then David authorization** |
| **Authoring lane** | Claude Code (spec + framing) · Codex (independent parallel spec, then sole binding reviewer + RED author) · Gemini (awareness only; telemetry facts on request) |
| **Scope** | Engine B's *modeling methodology* — the estimator, the feature contract, the target, the evaluation protocol, and a durable forensic instrument for all four. **Not** Engine A, not the PVO assembler, not the Dead Window bridge, not any David-facing surface. |
| **Authorization** | David, 2026-08-18, verbatim: *"reverse engineer the models - test outcomes vs data features and weights and different science techniques - this should lead to the best desisions and the path foward. i will have codex do the same. i want a full design spec and plan"* |
| **Layer** (`05`, pending codification, followed voluntarily) | **Layer 3 (models)** presenting. Layers 1–2 dependency check recorded in §1.4 — **result is mixed and one arm has a genuine layer-2 dependency**, named rather than assumed. |

> **Parallel-authorship note.** David is having Codex author the same spec independently. This
> document was therefore written **without** a Codex framing challenge, deliberately — routing
> first would destroy the independence he is buying. The normal challenge/disposition round opens
> **after** both specs exist and David has compared them. Nothing here is cockpit-CLEARed.

---

## 1. Problem (measured, not inferred)

### 1.1 What we believed

Engine B is described throughout the repo as a multi-feature, position-stratified active-player
forecast consuming the signal classes `00-product-constitution.md` §Position Signals names — snap
share, route participation, target share, air yards share, YPRR, TPRR, weighted opportunity, EPA and
CPOE, and a fitted continuous aging curve.

### 1.2 What the deployed artifacts actually do

**Reproduced.** Command and captured output:

```bash
.venv/bin/python3.14 docs/agent-ledger/evidence/2026-08-18/engine_b_coefficient_forensics_claude_v1.py
```

Standardized weight share (|coef × sd of the training rows the artifact was fit on|), abridged:

```
QB  version=engine_b_v2_qb  alpha=1000.0  n_features=15
ppg_t                    raw 0.3226   sd 6.218   std  2.0056
games_t                  raw 0.3623   sd 5.142   std  1.8628
cpoe                     raw 0.0737   sd 6.273   std  0.4622
epa_per_dropback         raw 0.0047   sd 0.229   std  0.0011
dakota                   raw 0.0035   sd 0.173   std  0.0006
snap_share_t_minus_1     raw -0.0016  sd 0.230   std -0.0004
ppg_* family carries 52.4% of total standardized weight

RB  alpha=500.0  n_features=11
ppg_t                    raw 0.5886   sd 5.821   std  3.4265
snap_share               raw 0.0047   sd 0.218   std  0.0010
ppg_* family carries 85.6% of total standardized weight

WR  alpha=200.0  n_features=14
ppg_t                    raw 0.6263   sd 5.313   std  3.3274
yprr                     raw 0.1784   sd 0.607   std  0.1082
weighted_opportunity     raw 0.0747   sd 0.197   std  0.0147
tprr                     raw 0.0177   sd 0.057   std  0.0010
ppg_* family carries 74.6% of total standardized weight

TE  alpha=100.0  n_features=14
ppg_t                    raw 0.5716   sd 3.919   std  2.2402
yprr                     raw -0.0354  sd 0.538   std -0.0190
tprr                     raw 0.0004   sd 0.057   std  0.0000
ppg_* family carries 77.2% of total standardized weight
```

**Engine B is a PPG autoregression with an age term.** The `ppg_*` family carries **52–86%** of
standardized weight. The signal classes `00` names are at or near numerical noise: `tprr` 0.0010
(WR) and 0.0000 (TE); `epa_per_dropback` 0.0011 and `dakota` 0.0006 (QB); `snap_share` 0.0010 (RB).
`aging_curve_value` is ≤ 0.011 standardized in **all four** models — `01-north-star-architecture.md`
§Aging Curve Architecture ("models consume fitted continuous curves") is nominally satisfied and
functionally inert; the raw `age` term does that work instead.

### 1.3 Three interventions that should have fixed it — and did not

This is the load-bearing part of the spec, and it exists because **two hypotheses I advanced to
David earlier in this session were refuted by measurement within the hour.** Both refutations are
pinned here so the program does not re-litigate them.

**Root cause candidate 1 — no feature standardization.** `scripts/train_engine_b.py` builds
`SimpleImputer → Ridge` with no scaler (`_fit_position_ridge`, `scripts/train_engine_b.py:107-119`;
`_train_position`, `:270-277`). `grep -n "Scaler|scale|standardiz|Pipeline" scripts/train_engine_b.py`
returns **no output**. Ridge penalizes β², so on unstandardized inputs a rate feature on a 0–1 scale
is penalized orders of magnitude harder than `ppg_t` on a 0–25 scale. Plausible, and it is why the
raw coefficients above are not comparable.

**Reproduced — and the accuracy claim is REFUTED:**

```bash
.venv/bin/python3.14 docs/agent-ledger/evidence/2026-08-18/engine_b_scaling_hypothesis_probe_claude_v1.py
```

```
pos  variant            RMSE       R2  Spearman    alpha
QB   as-deployed       4.507    0.439     0.696   1000.0
QB   +scaler           4.487    0.444     0.682     50.0
RB   as-deployed       3.583    0.591     0.783    500.0
RB   +scaler           3.583    0.591     0.782     10.0
WR   as-deployed       2.886    0.684     0.810    200.0
WR   +scaler           2.853    0.691     0.812     50.0
TE   as-deployed       2.256    0.630     0.786    200.0
TE   +scaler           2.269    0.625     0.778     50.0
```

RidgeCV simply selects a smaller alpha and lands in the same place. **Standardization is an
interpretability fix, not an accuracy fix.**

**Root cause candidates 2 and 3 — wrong model class, and wrongly excluded features.**
`src/dynasty_genius/models/engine_b_contract.py:117-125` excludes `target_share_nfl`,
`air_yards_share` ("r=0.95–0.98 collinearity inverts Ridge coefficients"), `route_participation`
("r=0.785 collinear with snap_share"), and `total_points_t`. Those exclusions are correct *for a
linear model* and would not bind a tree ensemble. So: swap Ridge for a GBM and readmit the features.

**Reproduced — both REFUTED:**

```bash
.venv/bin/python3.14 docs/agent-ledger/evidence/2026-08-18/engine_b_technique_pilot_claude_v1.py
```

```
pos  arm                  nfeat     RMSE       R2  Spearman
QB   ridge / contract        15    4.507    0.439     0.696
QB   ridge / wide            19    4.498    0.442     0.673
QB   gbm / contract          15    4.676    0.396     0.663
QB   gbm / wide              19    4.811    0.361     0.655
QB   baseline ppg_t           1    5.461    0.177     0.634

RB   ridge / contract        11    3.583    0.591     0.783
RB   ridge / wide            15    3.628    0.581     0.777
RB   gbm / contract          11    3.991    0.493     0.683
RB   gbm / wide              15    4.014    0.487     0.691
RB   baseline ppg_t           1    4.033    0.482     0.762

WR   ridge / contract        14    2.886    0.684     0.810
WR   ridge / wide            18    2.838    0.694     0.811
WR   gbm / contract          14    3.040    0.649     0.755
WR   gbm / wide              18    3.094    0.636     0.744
WR   baseline ppg_t           1    3.470    0.543     0.778

TE   ridge / contract        14    2.256    0.630     0.786
TE   ridge / wide            18    2.329    0.605     0.784
TE   gbm / contract          14    2.536    0.532     0.685
TE   gbm / wide              18    2.408    0.578     0.721
TE   baseline ppg_t           1    2.475    0.554     0.759
```

**GBM is worse than Ridge in all four positions.** RB's GBM (3.991) barely beats the naive
carry-forward baseline (4.033). Readmitting the excluded features gains ~1.7% RMSE for WR and
*hurts* RB and TE.

### 1.4 The actual diagnosis, and the layers 1–2 check

Three independent interventions at the estimator/feature layer each failed. That is a coherent
signal, not three coincidences: **at season granularity, with 169–607 training rows per position,
the ~14-feature season-row problem is at its information ceiling.** A heavily-regularized linear
model is the right estimator *for the problem as currently posed*. GBM loses because it has too
little data to spend on variance. The rate features add nothing *because a season average of a rate
stat is nearly collinear with a season average of points.*

**The constraint is the shape of the training row, not the estimator, and not the feature list.**

**Layers 1–2 dependency check (`05` §3 Rule 2), recorded as three separate things:**

- **The check performed.** Enumerated `app/data/nflverse_usage.db` table row counts; read the source
  list `feature_assembly.py` actually consumes (`read_fns[...]`, `src/dynasty_genius/features/feature_assembly.py:139-237`).
- **The result.** The store holds ~1.6M rows: `depth_charts` 812,074 · `player_snap_count` 253,106 ·
  `ftn_charting` 185,215 · `contracts` 97,022 · `ff_opportunity` 47,282 · `nflverse_injury_report`
  45,337 · PFR splits 59,609 · NGS 26,723. Feature assembly reads **six** sources and never touches
  `ff_opportunity`, `contracts`, `nflverse_injury_report`, `ftn_charting`, `depth_charts`, or PFR.
- **The conclusion — deliberately split, because it differs by arm.** Layer 1 (ingest) is **not** the
  gap: the data is on disk. Arms B1–B3 and B5–B6 below are **genuinely at layer 3** and proceed.
  **Arm B4 (week-level granularity) has a real layer-2 (curate) dependency** — no modeling-ready
  week-level table exists, and building one is curation work, not modeling work. Per `05` §3, *a
  conclusion is not a licence to fix*: B4's layer-2 prerequisite is **named here and requires
  David's separate word**, and this spec does not open it.

### 1.5 Two further defects found during forensics

**D1 — the deployed models have never seen a training example after the 2021 season.**
`HOLDOUT_SEASONS = [2022, 2023]` (`scripts/train_engine_b.py:66`), and `_train_position` pickles the
model fit on the **non-holdout** rows only (`:265-277`). The holdout is never folded back in. 2024
cannot be a training row under a 2-year outcome window. Row counts confirm: QB 169 = 2018-21
(40+40+43+46); RB 387; WR 607. Artifacts are dated 2026-05-13. **Today's dynasty valuations come
from a model whose most recent training example is the 2021 season.**

**D2 — TE's shipped metrics are in-sample.** `train_te_deployment_model` computes
`y_pred = model.predict(X)` on the **training** matrix (`scripts/train_engine_b.py:147-149`), writes
them to a file named `validation_report_te.json`, and sets `promotion_warranted: null`. The
preceding held-out `te_v2` **failed** its gate (`improvements: 0`, `not_promoted`) and `te_v3` is
what ships. Refitting on all data for deployment after a separate validation is legitimate, and a
real gate record exists (`docs/validation/2026-06-26-te-v3-rederivation-decision.md`, G2 stability
10.26% < 25%) — **the defect is the labeling**, not the decision: nothing in the JSON says the
numbers are fit statistics.

### 1.6 Consequence

We ship dynasty valuations from a 2018–2021-trained PPG autoregression, we have **no instrument**
that would tell us if it drifted, and the three obvious repairs are measured dead ends. Without the
forensic instrument this spec proposes, the next agent will re-derive these same three refutations
from scratch.

### 1.7 What this does NOT say about QB rushing

`is_dual_threat` carries 0.018 standardized weight in the QB artifact. **That is a descriptive fact
about a heavily-penalized artifact and is not evidence about H2 either way.** Per `CLAUDE.md`
§UNDER TEST, QB rushing production is a **hypothesis under test**; the pre-registered study
(`docs/validation/2026-07-21-qb-1-study-registration.md`) has not run and there is no result. A
near-zero coefficient in a model at alpha=1000 is uninformative about the underlying question. **No
arm in this spec tests H2, and no output of this program may be cited for or against it.**

---

## 2. Design

A three-phase program. **Phase A is the deliverable that persists; Phases B and C are gated.**

### 2.1 Phase A — the forensic instrument (`scripts/engine_b_forensics.py`)

The "reverse engineer the models" ask, made durable and rerunnable instead of a one-off. Read-only:
it loads artifacts and datasets, writes a report, and **never fits or promotes a model.**

```python
def forensics_report(
    *,
    artifact_path: Path,
    dataset: pd.DataFrame,          # injected frame — never a gitignored path read internally
    holdout_seasons: list[int],
    cohort_specs: Sequence[CohortSpec] = DEFAULT_COHORTS,
) -> ForensicsReport: ...

@dataclass(frozen=True)
class ForensicsReport:
    artifact_version: str
    position: str
    fit_population: FitPopulation        # {"held_out" | "in_sample" | "unknown"} + row counts
    coefficient_table: list[CoefficientRow]   # raw, sd, standardized, share-of-total
    contribution_decomposition: list[ContributionRow]
    cohort_residuals: list[CohortResidualRow] # by age band, games band, season, dvs decile
    calibration: CalibrationCurve
    baseline_comparison: list[BaselineRow]    # vs ppg_t carry-forward and position mean
    decision_supported: bool = False          # always False — descriptive instrument
```

Four design commitments, each answering a defect found above:

1. **`fit_population` is computed, never assumed.** The tool determines whether the artifact's
   training rows intersect the evaluation rows and labels metrics `in_sample` when they do. This is
   D2 made structurally unrepeatable.
2. **Standardization uses the sd of the rows the artifact was fit on**, not the full CSV. Using the
   wrong population silently rescales every coefficient — seed F1.
3. **Walk-forward evaluation is a first-class mode**, not a fixed holdout. Fit on seasons ≤ *k*,
   score *k+1*, roll. This is what makes D1 (staleness) visible and is the protocol Phase B needs.
4. **A leakage assertion runs on every call.** No column matching the market/consensus families may
   enter any matrix (`00` §KTC And Market Data; `01` §Engine B "Market-derived features in Engine B
   are leakage defects").

### 2.2 Phase B — the pre-registered contrast set

`00` §In-Season requires **pre-registered validation** before any model change. The registration
document is written and frozen **before** any arm runs, at
`docs/validation/2026-08-<dd>-engine-b-technique-bakeoff-registration.md`.

| Arm | Change | Status | Prior evidence |
| :-- | :-- | :-- | :-- |
| **B0** | As-deployed control | Control | §1.2 |
| **B1** | + StandardScaler | **Pinned negative** — regression control only, not re-litigated | §1.3 |
| **B2** | + readmitted collinear features | **Pinned negative/marginal** | §1.3 |
| **B3** | GBM / tree ensemble | **Pinned negative** at season granularity | §1.3 |
| **B4** | **Week-level rows** (~17× sample) | **LIVE — highest expected value; has a layer-2 prerequisite (§1.4)** | none |
| **B5** | **Target decomposition** — per-game rate × availability, modeled separately | **LIVE** | none |
| **B6** | **Hierarchical partial pooling** — player/position priors, shrinkage instead of exclusion | **LIVE** | none |
| **B7** | **Horizon extension** — 3y+ outcome window vs the current 2y | **LIVE** | none |
| **B8** | **Walk-forward refit** — recency, replacing the frozen 2022–23 holdout | **LIVE — cheapest** | §1.5 D1 |

**The decision rule is registered before running, not chosen after.** An arm is a candidate only if
it beats B0 on **≥2 of {RMSE, R², Spearman}** *under walk-forward* — the same
`COMPOSITE_GATE_MIN_PASSING = 2` shape already in `engine_b_contract.py:113`, applied to a stronger
protocol. Beating the naive `ppg_t` baseline is necessary and nowhere near sufficient.

**B6 is the arm that closes a live product hole.** The 114 players shipping a false "Engine A
prospect score used as prior" caveat (today's board; `pvo_assembler.py:460-465`) exist because the
Dead Window bridge needs a prior that Engine A does not supply for veterans. Partial pooling
produces exactly that prior, for every player, with honest uncertainty. **This spec does not fix
that defect** — the R1 repair is David's separately ordered next action — but B6 is the modeling
answer underneath it, and the two should be sequenced knowingly rather than collide.

### 2.3 Phase C — the decision packet

A single David-facing document: what each arm measured, what was refuted, what the honest ceiling
looks like, and the recommended path with its counter-argument (`00` §Counter-Argument Required).
**No promotion, no artifact swap, no manifest write happens in this program.** Promotion is a
separate spec, a separate RED, and David's separate word.

---

## 3. Out of scope (named, not hidden)

1. **Promoting any model.** This program measures and reports. Artifact promotion, manifest writes
   and `model_version` changes are a follow-on spec — `00` §In-Season: "human-gated, pre-registered."
2. **The 114-player false-prior caveat and R1 generally.** David has already sequenced R1 → R2 → A7.
   Named here only where B6 touches it (§2.2); not fixed here.
3. **Engine A.** Untouched. The Dead Window's missing veteran prior is an Engine A/architecture
   question this spec deliberately does not open.
4. **Building the week-level curated table.** B4's layer-2 prerequisite (§1.4). Named, costed in
   Phase C, and requiring David's separate word — `05` §3, a conclusion is not a licence to fix.
5. **The Engine B regular-season-vs-postseason definition.** Corroborated during forensics (2025
   `games_t` maxes at **21**; **54 rows exceed 17 games**) but it is an open David definition
   question from today's board, not a modeling arm. Any arm that changes the label definition is
   blocked behind his ruling.
6. **QB rushing / H2.** §1.7. Explicitly out of scope, in both directions.

---

## 4. Falsification seeds — the RED matrix

**Test path:** `tests/contract/test_engine_b_forensics_red.py`
**Construction law:** every seed drives `forensics_report(...)` directly with an **injected**
DataFrame and a tmp-path artifact. No seed reads `app/data/**` (gitignored), asserts a live artifact,
touches the network, or writes outside `tmp_path`.

| # | Seed (inputs / state) | Required behavior |
| :-- | :-- | :-- |
| **F1** | Artifact fit on seasons ≤2021; dataset also contains 2022–25 rows with a deliberately different feature sd | Standardization uses the **fit** population's sd. Mutating the tool to use full-dataset sd must fail this test. |
| **F2** | Pickle missing the `features` key | Fail closed with a named error — never `KeyError`, never a silent empty table |
| **F3** | `len(model.coef_) != len(features)` | Fail closed, naming both lengths |
| **F4** | A feature that is constant on the fit rows (sd = 0) | Standardized share reported as **undefined**, not `0.0`, and never a division by zero |
| **F5** | Walk-forward config where a test season also appears in train | Raises a temporal-leakage error. **Mutation-tested:** removing the guard must turn this test red. |
| **F6** | Baseline scored on a different row set than the model | Fail closed — a mismatched row set silently flatters the model |
| **F7** | Target column contains NaN | Rows excluded, **count and reason reported** in the output; never silently dropped |
| **F8** | Artifact whose training rows fully intersect the evaluation rows (the D2 / TE case) | `fit_population == "in_sample"`; metrics carry that label. Mutating it to `"held_out"` must fail. |
| **F9** | Dataset carrying a market-derived column (`ktc_value`, `adp`, consensus) | Leakage assertion raises. **Mutation-tested** per `00` §KTC and `01` §Engine B. |
| **F10** | Any report rendered to text/JSON | `decision_supported == False` recursively; banned-language scan finds no verdict/imperative (`00` §No-Verdict Line) |
| **F11** | Same seed, same inputs, run twice | Byte-identical numeric output (reproducibility — `00` §Product Tenets) |
| **F12** | Two positions where the first raises | The second position's failure is still reported; one failure must not mask another |
| **F13** | Cohort spec producing an empty cohort | Reported as an empty cohort with `n=0`, never omitted from the table and never an average over zero |

Seeds F1, F5, F8 and F9 are the ones that must be **mutation-tested** — each guards a defect that
was live in the codebase and would otherwise pass with everything green.

---

## 5. Sequence (cockpit-TDD)

1. **David compares this spec against Codex's independent one** and rules on scope. *(Non-standard
   first step, by his design — parallel authorship precedes the challenge round.)*
2. **Cockpit CLEAR:** Codex challenges the merged framing in writing → Claude issues a written
   disposition on every item → Codex technical review to explicit, evidence-cited CLEAR. Gemini
   receives an awareness copy.
3. **David authorizes the RED.**
4. **Codex authors the RED** (F1–F13), demonstrably red on `main`.
5. **Claude implements GREEN** — `scripts/engine_b_forensics.py` + the registration document. Runs
   the focused bundle **and** the full suite (`.venv/bin/python3.14 -m pytest`, zero collection
   errors, count remeasured not predicted), plus `.venv/bin/ruff check src app`. Self-probes the
   falsification matrix before routing.
6. **Codex independent review → CLEAR.**
7. **David-authorized only:** commit. Then Phase B arms run against the **frozen** registration.
8. **Phase C decision packet → David.** Any promotion is a new spec from step 1.

**Gates that are David's alone and are not implied by any CLEAR here:** commit, push, PR, merge,
running Phase B, opening B4's layer-2 curation work, and any model promotion.

---

## 6. Risks

| Risk | Mitigation | Residual |
| :-- | :-- | :-- |
| **Pilot ≠ program.** §1.3's refutations are single-split pilots at n=169–607, not walk-forward. | Arms B1–B3 are pinned as **regression controls** and re-measured under walk-forward before the negative is called durable. | A pinned negative could reverse under a better protocol. Stated, not hidden. |
| **Multiple-comparisons.** Eight arms on one small holdout will produce a winner by chance. | Decision rule and arms frozen **before** running; walk-forward not a single split; ≥2-of-3 composite. | Small-n instability is real; Phase C reports effect sizes, not just wins. |
| **B4 opens a layer-2 project in disguise.** Week-level rows need a curated table that does not exist. | Named as a prerequisite in §1.4 and §3.4, costed in Phase C, requiring David's separate word. | He may reasonably decline; then the ceiling in §1.4 stands and Phase C says so. |
| **The honest answer may be "the ceiling is near."** | Phase C is written to be able to say that. A program that cannot return a null result is not a validation. | This costs cycles to learn. `00`: be right, not fast. |
| **Forensics tool becomes a promotion back door.** | Read-only by construction; no fit, no manifest write, no artifact output. F10 keeps outputs descriptive. | Reviewer-enforced at review time. |
| **Path rot.** Line citations here (`train_engine_b.py:66`, `:107-119`, `:147-149`, `:265-277`; `engine_b_contract.py:113`, `:117-125`; `pvo_assembler.py:460-465`; `feature_assembly.py:139-237`) drift as files change. | Each is paired with quoted content so it is recoverable by grep. Evidence scripts are rerunnable and pinned by name. | Verify before citing in a later session. |
| **Model-vs-market framing.** Nothing here validates divergence as an edge. | This program touches Engine B accuracy only; divergence remains descriptive and unvalidated. | Unchanged by this spec. |

### What this program does not prove

It does not prove Engine B is bad — all four models **beat** the naive carry-forward baseline
meaningfully (WR R² 0.684 vs 0.543; QB 0.439 vs 0.177). It proves the *methodology* is saturated at
its current row shape, and that the three cheapest repairs do not lift it. It does not establish that
any live arm will lift it either. **That is what Phase B is for, and a null result is a legitimate
outcome.**

---

## 7. Evidence index

| Artifact | What it establishes |
| :-- | :-- |
| `docs/agent-ledger/evidence/2026-08-18/engine_b_coefficient_forensics_claude_v1.py` | §1.2 — standardized coefficient shares from the deployed pickles |
| `docs/agent-ledger/evidence/2026-08-18/engine_b_scaling_hypothesis_probe_claude_v1.py` | §1.3 — standardization refutation |
| `docs/agent-ledger/evidence/2026-08-18/engine_b_technique_pilot_claude_v1.py` | §1.3 — GBM and readmitted-feature refutations |

All three are read-only, Ruff-clean, and fit no artifact they persist.
