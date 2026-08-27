# CODEX independent model reverse-engineering and decision-science design

**Prepared by:** **CODEX — Independent Third-Party Consultant**  
**Recommendation owner:** **CODEX**  
**Date:** 2026-08-18  
**Status:** design and diagnostic evidence only; `decision_supported=False`  
**Audience:** DG Tower, Judge, Studio, Claude, DG Codex, Gemini, and human owners  
**Independence protocol:** this assessment used the active code, registries, model artifacts, training tables, governance, and accepted validation evidence. It did not read or incorporate the same-day drafts or probes produced by other team members.

## 1. Technical summary

DG has enough signal to build an advantage, but not yet a single scientifically comparable model-selection system. The active rookie and veteran models answer different questions, use different validation regimes, and expose metrics that cannot safely be ranked side by side. The correct path is not to add more features to the current pipelines. It is to establish a common research contract, decompose the outcomes, validate every challenger with nested expanding-time tests, and connect calibrated forecasts to explicit dynasty decisions.

The existing evidence supports five conclusions:

1. **Recent NFL production is the dominant Engine B signal.** Across positions, `ppg_t` has the largest one-standard-deviation conditional effect. Historical production, games, and age add smaller adjustments. Receiver opportunity and efficiency are useful univariate signals but receive small conditional weights once recent production and correlated usage variables enter the active Ridge.
2. **The active Engine B weights are not interpretable as feature importance.** Inputs were median-imputed but not standardized before RidgeCV. The penalty therefore depends on feature units. Raw coefficients must not drive product or football conclusions.
3. **QB/RB/WR show reproducible lift over the naive `ppg_t` baseline on the stored 2022–2023 holdout.** Reproduced RMSE improvements are approximately 17.5% QB, 11.2% RB, and 16.8% WR. Those results justify continued use as guarded evidence, not unconditional trust.
4. **TE has a validation-provenance gap.** Its active v3 report is fit and scored on all 492 eligible rows. That in-sample result is not comparable to the QB/RB/WR temporal holdouts and cannot establish production superiority.
5. **Simple regularized models remain the best first challengers.** In a fixed, diagnostic expanding-time screen over feature seasons 2021–2023, scaled Ridge and Elastic Net produced the most consistent gains. Nonlinear tree methods did not show a general advantage. This is directional only because hyperparameters were fixed rather than tuned inside nested time folds.

**CODEX recommends** a **forecast stack**, not one monolithic dynasty score:

```text
immutable season-T features
        │
        ├── availability / survival model ──► P(active), games distribution
        ├── conditional production model ──► PPG distribution | active
        ├── role / opportunity model ───────► routes, snaps, touches, dropbacks
        └── multi-horizon models ───────────► H1, H2, H3 forecasts
                                                │
                                                ▼
                              calibrated player outcome distribution
                                                │
                              league/scarcity/replacement transformation
                                                │
                              decision simulator and action thresholds
                                                │
                              market overlay (comparison only; never input)
```

## 2. What the current models actually do

### Engine A: prospects

The active Engine A is a position-specific Ridge using `pick`, `round`, and age to predict `y24_ppg`. It trained on draft seasons 2015–2020 and held out 2021. Its holdouts are small: 10 QB, 19 RB, 35 WR, and 11 TE. QB has negative holdout R² (-0.208); the other positions have positive but uncertain R². No active report contains 80% interval coverage.

The coefficients are conditional and collinear. For example, WR `round` is slightly positive while `pick` is negative. That does not mean later rounds help; it is a sign that two encodings of draft capital are competing inside a small linear sample. The model should be treated as a draft-capital-and-age baseline, not a complete prospect model.

An existing Head A TE candidate already demonstrates a better scientific pattern: standardized features, four expanding-time folds, out-of-fold metrics, dataset hash, and explicit promotion gates. That pattern should become universal, even where the candidate itself is not adopted.

### Engine B: active NFL players

The current table has 2,741 rows, 2,236 training-eligible rows, 959 players, and no duplicate `(player_id, feature_season)` keys. Eligible rows are QB 264, RB 573, WR 907, and TE 492. The target is the mean of T+1 and T+2 PPG, with partial horizons retained. That collapses multiple football processes into one label and causes examples with one known future season to be treated like examples with two.

Active QB/RB/WR models trained on 2018–2021 and were tested on 2022–2023. Active TE was later refit on all eligible rows and evaluated in sample. The registry therefore points to artifacts with incompatible evidence bases.

| Position | Active alpha | Features | Evaluation rows | Model RMSE | Naive RMSE | Evidence interpretation |
|---|---:|---:|---:|---:|---:|---|
| QB | 1000 | 15 | 95 | 4.507 | 5.461 | fixed 2022–2023 holdout |
| RB | 500 | 11 | 186 | 3.583 | 4.033 | fixed 2022–2023 holdout |
| WR | 200 | 14 | 300 | 2.886 | 3.470 | fixed 2022–2023 holdout |
| TE | 100 | 14 | 492 | 2.365 | 2.689 | in-sample; not comparable |

The v1.1 unified report is also copied into each position report as though it were position-specific. Those reference metrics are overall metrics and must not be used for position-level model selection.

### Weight interpretation

Raw active Engine B coefficients are unit-dependent. A more defensible descriptive view multiplies each coefficient by the feature's training standard deviation. The leading effects are:

| Position | Largest one-SD effects in predicted PPG |
|---|---|
| QB | current PPG +1.94; games +1.78; prior-year PPG +0.85; CPOE +0.44; age -0.43 |
| RB | current PPG +3.40; T-2 PPG +0.96; age -0.58; prior-year PPG +0.33 |
| WR | current PPG +3.37; prior-year PPG +0.90; age -0.67; games +0.61 |
| TE | current PPG +2.19; games +0.54; prior-year PPG +0.46; T-2 PPG +0.37; age -0.32 |

These remain conditional associations, not causal importance. Correlated features share or suppress weight; missingness flags and median imputation change interpretations; and TE effects use the all-row fit.

## 3. Diagnostic technique screen

The independent screen trained only on seasons earlier than each outer test season (2021, 2022, 2023). It compared current PPG with fixed scaled Ridge, Elastic Net, histogram gradient boosting, and random forest candidates. The intervals below are player-cluster bootstrap 90% intervals for pooled RMSE improvement versus naive.

| Position | Best diagnostic challenger | RMSE | Spearman | Median improvement | 90% interval |
|---|---|---:|---:|---:|---:|
| QB | scaled Ridge | 4.252 | 0.695 | 19.4% | 10.6% to 26.6% |
| RB | Elastic Net | 3.390 | 0.787 | 12.9% | 8.2% to 17.7% |
| WR | Elastic Net | 2.846 | 0.802 | 17.7% | 14.1% to 21.4% |
| TE | Elastic Net | 2.201 | 0.786 | 7.4% | 2.4% to 12.4% |

This screen says where to spend research time. It does not select a production winner: it uses fixed hyperparameters, pools three outer seasons, and retains the flawed two-year-average target. Its most useful finding is that DG should force sophisticated models to beat strong, standardized linear baselines before increasing complexity.

## 4. The scientific target architecture

### 4.1 Outcome contract

Replace `avg_ppg_t1_t2` as the primary training target with explicit labels:

- `active_h1`, `active_h2`, `active_h3`: probability the player records a governed minimum NFL opportunity in each future season.
- `games_h1`, `games_h2`, `games_h3`: count or distribution of games conditional on roster/active status.
- `ppg_h1`, `ppg_h2`, `ppg_h3`: fantasy PPG conditional on governed participation.
- `role_h1`: position-appropriate opportunity such as routes, targets, touches, or dropbacks.
- `ceiling_h1` and `floor_h1`: governed quantiles, not arbitrary point cutoffs.

Then compute unconditional value explicitly:

`E[points_h] = P(active_h) × E[games_h | active] × E[PPG_h | active]`.

This prevents availability, durability, role, and scoring ability from being mixed into a single opaque label. It also lets 2024 contribute to H1 immediately without pretending H2/H3 are mature.

The accepted QB-1 finding belongs only in the governed veteran regular-season QB ceiling lane: the four-factor composite was supported across its accepted contrasts, while a naive marginal rushing hypothesis was contradicted. It must not be generalized to dynasty value or used as evidence that rushing is universally unimportant.

### 4.2 Feature families

Every feature requires an owner, definition, lineage, coverage profile, as-of timestamp, leakage review, and expected causal direction. Candidate families should enter as ablation blocks:

1. **Production state:** governed scoring, PPG, total opportunity, position-specific counting rates.
2. **Role and usage:** snap share, routes, target/touch/dropback shares, red-zone work, route participation, depth-chart state.
3. **Efficiency:** YPRR/TPRR/WOPR, EPA/CPOE/Dakota, broken-tackle or rushing-over-expected measures where coverage supports them.
4. **Availability and health:** games, injury transactions, missed-time cause, return timelines. Missing health data must not be silently interpreted as health.
5. **Team context:** coaching and coordinator continuity, teammate competition, offensive line/pass rate/pace, quarterback quality for receivers, contract and roster control.
6. **Trajectory:** continuously estimated age curves, recent slopes, role changes, shrinkage toward position/experience priors.
7. **Prospect priors:** draft capital and college features for true prospects or young-player priors only. A low-game veteran must never be silently routed to a rookie prior.
8. **Market:** prohibited from model inputs. Keep KTC/ADP/platform ownership solely as a downstream comparison and opportunity overlay.

NGS fields should be tested as position-exclusive optional blocks. Coverage, era, and missingness indicators must be evaluated inside each outer fold. An apparent gain that comes from identifying recent seasons rather than player quality fails the gate.

### 4.3 Candidate model families

The formal bakeoff should be deliberately narrow:

- **Controls:** previous-season PPG; position/age mean; current active model frozen by hash.
- **Regularized linear:** standardized Ridge and Elastic Net.
- **Shape-constrained additive:** GAM or spline model with fitted continuous age and interpretable nonlinear effects.
- **Boosted trees:** histogram or gradient boosting with shallow structure, calibrated uncertainty, and strict early stopping.
- **Two-part/hurdle models:** classifier or survival model for availability plus conditional production regressor.
- **Hierarchical partial pooling:** position and experience group effects where sample size supports it.
- **Quantile/distributional models:** only after point-forecast discipline is established.

Deep learning, unrestricted ensembles, and one model across all positions should remain out of scope until they demonstrate an information or sample-size rationale.

## 5. Experimental design and gates

### 5.1 Preregister before fitting

For each experiment, freeze:

- hypothesis and football mechanism;
- eligible population, seasons, game definition, and postseason rule;
- outcome definition and maturation policy;
- exact features and transformations;
- missing-data behavior learned on training folds only;
- candidate families and tuning grids;
- primary metric, secondary metrics, guardrails, and minimum effect;
- decision rule, uncertainty method, seeds, dataset hash, and code SHA.

David must resolve regular-season-only versus all-game Engine B aggregation before a promotion-quality rebuild. Current evidence shows postseason inclusion changes 160 of 162 participant PPG values and moves six players across the eight-game gate.

### 5.2 Nested expanding walk-forward

Use seasons as the time axis. For every outer test season Y, train only on seasons `<Y`. Tune hyperparameters using expanding inner folds wholly inside the outer training history. Fit imputers, scalers, feature selection, and calibration inside each fold. Report:

- every position × horizon × outer-season cell;
- pooled out-of-fold predictions and metrics;
- worst-season and worst-segment performance;
- player-cluster bootstrap confidence intervals;
- coefficient/sign/importance drift across folds;
- calibration and interval coverage;
- data coverage and rejection rates.

Do not use random row CV for temporal tuning. A player appearing in multiple historical seasons is normal for forecasting, but all transformations must remain as-of correct.

### 5.3 Promotion gates

A challenger is promotable only if all hard gates pass:

1. **Integrity:** no future, market, duplicate, or prohibited features; immutable dataset and artifact hashes; reproducible predictions.
2. **Comparability:** same folds, population, target, scoring, and baselines for every candidate.
3. **Skill:** positive pooled RMSE/MAE improvement with a player-cluster 90% interval above zero; no material degradation in rank correlation or decision-weighted utility.
4. **Robustness:** no catastrophic outer season or critical segment; directionally stable effects; missingness/era sensitivity accepted.
5. **Calibration:** interval coverage inside a preregistered tolerance and no material calibration slope/intercept failure.
6. **Operational:** feature freshness, latency, fallback, monitoring, and rollback proven on the real product surface.
7. **Human gate:** Judge reviews evidence; David approves registry promotion. Report generation never mutates the registry.

The current two-of-three RMSE/R²/Spearman gate should remain a descriptive panel but not the sole promotion rule. RMSE and R² largely encode the same squared-error movement, so counting both can overstate independent evidence.

## 6. Turning forecasts into an advantage

Forecast accuracy alone does not create a dynasty edge. DG needs an explicit decision layer:

1. Produce calibrated player distributions for multiple horizons.
2. Transform outcomes through league settings, replacement, scarcity, roster window, and roster constraints.
3. Simulate transactions or roster actions, including opportunity cost and consolidation risk.
4. Compare DG's football-only fair value with the market overlay.
5. Recommend an action only when expected utility clears uncertainty, liquidity, and transaction-cost thresholds.
6. Log the recommendation, information set, later outcome, and realized regret for continual evaluation.

The primary decision metrics should include regret versus feasible alternatives, hit rate above an action threshold, value captured after costs, calibration of confidence, and decision coverage. A model can improve RMSE without improving start/sit, trade, waiver, or rookie-draft decisions; that model should not be called an advantage.

High-value opportunity patterns to test after calibration:

- market prices slow role changes more slowly or quickly than DG forecasts;
- uncertainty is mispriced, especially when the market treats identical medians as identical assets;
- replacement and scarcity are misapplied across league formats;
- multi-horizon roster-window value differs from single-rank consensus;
- aging and availability risk are handled with cliffs instead of continuous probabilities.

These are hypotheses, not promises. The market comparison stays downstream to preserve an independent football signal.

## 7. Limitations and uncertainty

- The diagnostic screen used fixed hyperparameters and the current flawed target; it is not promotion evidence.
- Active artifact reports do not all record dataset hashes and comparable out-of-fold predictions.
- The Engine B table currently ends with mature labels through feature season 2023; 2025 rows are ineligible. Era depth is limited.
- Injury, role, team, and NGS coverage are incomplete or not active in the current artifacts.
- Engine A holdouts are too small for confident position-specific tail claims.
- Postseason treatment is unresolved.
- The current low-game bridge can represent veterans as an Engine A rookie prior, while 1–3 game rows can be removed before inference. Those routing problems must be fixed before model gains can be trusted end to end.
- Existing QB-1 evidence is valid only for its pinned veteran regular-season PPG ceiling scope.

## 8. CODEX recommendations and path forward

### Phase 0 — trust repair (now, before a large model push)

Resolve R1/R2 outcome-loop priorities, postseason semantics, low-game routing, the 1–3 game exclusion, artifact provenance, and a frozen baseline prediction table. Add comparable out-of-fold evidence for active TE. Do not change production weights.

### Phase 1 — target and harness foundation

Build H1/H2/H3 labels, availability/production separation, fold-local preprocessing, nested expanding-time evaluation, clustered uncertainty, calibration, and immutable experiment manifests. Reproduce all active baselines inside this harness.

### Phase 2 — controlled science

Run position-specific ablations and the narrow candidate family bakeoff. Prioritize scaled Ridge, Elastic Net, continuous-age GAM, and a shallow boosted challenger. Add weekly/role/injury/team feature blocks one at a time.

### Phase 3 — decision validation

Backtest concrete DG decisions under league rules. Establish action thresholds, abstention, regret, and market-overlay evaluation. Select models by decision utility subject to calibration and robustness gates, not a single predictive metric.

### Phase 4 — shadow and promotion

Run a full-season shadow lane, compare forecasts and decisions without user impact, prove drift/fallback/rollback, obtain Judge review and David approval, then promote one governed position/horizon at a time.

## 9. Further questions for the DG team

1. Is the canonical football target regular-season only, and how are fantasy playoffs represented?
2. What constitutes “active” and a valid PPG denominator by position and horizon?
3. Which decision has first priority: trade, waiver, rookie draft, lineup, or roster construction?
4. What minimum economic advantage justifies surfacing an action after uncertainty and costs?
5. Which injuries, contracts, depth charts, and coaching context can be made historically point-in-time correct?
6. Should replacement and scarcity be recalculated per league snapshot or governed by stable format priors?
7. What abstention rate is acceptable if it materially improves decision precision?
8. Who owns target definitions, feature acceptance, scientific review, and the final human promotion gate?

## 10. Reproducibility

- Analysis: `docs/agent-ledger/evidence/2026-08-18/independent_model_audit_codex_v1.py`
- Results: `docs/agent-ledger/evidence/2026-08-18/independent_model_audit_codex_v1.results.json`
- Notebook: `docs/agent-ledger/evidence/2026-08-18/independent_model_audit_codex_v1.ipynb`
- Primary Engine B dataset SHA-256 is recorded in the results artifact.
- No model registry, runtime artifact, product code, or source dataset was changed.
