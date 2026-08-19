# DG-017 — We validate a scaled model and deploy an unscaled one

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** crew lane (parallel author), 2026-08-18; verified independently by Tower same night

**Problem:** The evaluation harness standardizes features before fitting Ridge. The training script
that produces the deployed artifact does not, and it hardcodes the penalty. So every validation
number we have describes an estimator we do not ship.

**How we know:**
```
$ grep -c "StandardScaler" scripts/train_engine_b.py
0
$ sed -n '194,199p' scripts/train_engine_b.py
    imputer = SimpleImputer(strategy="mean")
    X_train = imputer.fit_transform(X_train_raw)      # imputed, NOT scaled
    model = Ridge(alpha=100.0)                        # penalty hardcoded
$ grep -n "StandardScaler\|Ridge(" src/dynasty_genius/eval/backtest_harness.py
455:  - Scaling: StandardScaler fit on train only
489:  scaler = StandardScaler()
562:  ridge = Ridge(alpha=alpha)
```
Same split in `eval/qb_validation/ridge_lane.py:275`, `eval/te_archetype_bakeoff.py:89`,
`eval/te_role_risk_experiment.py:38`. The evaluation side scales everywhere; the deployed side never does.

**Done looks like:** one pipeline object used by both paths, so the thing measured is the thing
shipped — and a replay proving the deployed artifact reproduces from its stated recipe.

**Depends on:** nothing. This is the gate everything else should sit behind.

---

## Why this is worse than a tidiness problem, and it bears on DG-001

Ridge's penalty is scale-dependent. With features left on their raw scales — `ppg_t` roughly 0–25,
`age` 21–35, `snap_share` 0–1, `tprr` 0–0.3 — a **fixed** α=100 penalizes a small-magnitude feature
far harder than a large-magnitude one, because a small-scale feature needs a large coefficient to
move the target at all, and large coefficients are exactly what the penalty removes.

**HYPOTHESIS, not a finding:** the DG-001 headline — ppg family 52–86% of weight, rate stats at
numerical noise — could be partly an artifact of this fit rather than a fact about football.

**Falsifier, cheap and decisive:** refit with a train-fitted scaler and a tuned α, then re-run the
same coefficient decomposition. **If the ppg family still carries 52–86%, this hypothesis is dead
and DG-001 stands as measured.** If the rate stats come up materially, DG-001's conclusion was
about the fit, not the sport.

**What does NOT settle it:** the separate result that a one-parameter PPG shrink reproduces R²=0.887
of the projection. That measures how the model *behaves*, and both explanations predict that same
behaviour. It cannot discriminate between them.

**Also does not settle it:** the earlier test showing RidgeCV-with-scaling "lands in the same place."
That tested *accuracy* with α re-tuned. Production uses α **fixed at 100**, and the question here is
*attribution*, not RMSE. Different question, different answer.

---

## CONFIRMED SAME NIGHT — the hypothesis above fired, and the ablation was run

`ALPHA_CANDIDATES = [0.1, 1.0, 10.0, 50.0, 100.0, 200.0, 500.0, 1000.0]` (`train_engine_b.py:69`).
**QB selected α = 1000.0 — the ceiling of the grid.** A boundary selection means the search never
found an optimum; it wanted more regularisation than it was allowed to ask for. Per-position selected
alphas span 1.0 (TE) to 1000.0 (QB) — a 1000× spread, itself a symptom of unscaled inputs.

Effect size measured by a third lane: a 1-SD move in WR snap share shifts the prediction by
**0.019 PPG**; TE `tprr` by **0.00004**. Not weak — inert.

**And the decisive ladder was run: a model with NO usage features at all matches or beats the shipped
model at RB, WR and TE.**

⇒ DG-001's headline survives as a description of the shipped model, and is now explained: the usage
features were never given a chance to contribute. Whether they *would* contribute under a scaled fit
with a re-tuned α remains the open question, and it is the reason to do this ticket rather than
conclude from it.

**One overstatement corrected:** the claim that `train_engine_b.py` is "the only trainer in the repo
that omits StandardScaler" is too broad — `backtest_engine_a_cfbd_only.py`, `backtest_qb_cfbd.py` and
`run_wr_college_bakeoff.py` also have none. It IS the only Engine B *deployment* trainer without one
while every Engine B evaluation harness has one, which is the substance.
