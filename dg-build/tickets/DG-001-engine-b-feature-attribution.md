# DG-001 — Find out what actually drives the Engine B projection

**Layer:** 3  ·  **State:** answered, pending DG-017  ·  **Lane:** crew forensics  ·  **DG 3.0**

**Problem:** Nobody can say which features move the Engine B projection. Without that, we can't tell
whether the model has an opinion or is restating last season with a haircut — and we can't defend any
number it produces.

**How we know:** No feature-attribution code exists in the product at all.
```
$ grep -rniE "\bshap\b|permutation_importance|feature_importances_" --include=*.py app/ src/ scripts/
(no matches)          # run 2026-08-18
```
Corroborating measurement, independent of us and not ours to cite as our own: a one-parameter shrink
of last season's points-per-game reproduces R² = 0.887 of the whole Engine B projection, but only
0.513 at QB. If that holds, three of four positions are largely restating prior-season production.

**Done looks like:** a per-position attribution run over the Engine B model matrix — SHAP or
permutation importance, either is fine — that answers one question in a table: **how much of the
projection is explained by `ppg_t_minus_1` alone, and what else carries any weight.** Output written
to a versioned artifact, not a chat message.

**Depends on:** nothing. The model, the feature runtime and the matrix are all on disk today.

---

**Notes**
The allowed feature set is `ENGINE_B_ALLOWED_FEATURES` in `src/dynasty_genius/models/engine_b_contract.py`.
Worth knowing before starting: `route_participation` is deliberately excluded there as collinear with
snap_share (r = 0.785, `:118-122`), and `DVS_BLEND_K` at `:97` carries the comment *"REQUIRED: fit
these from Engine B per-position residual variance before changing"* — meaning the shipped blend
constants were never fitted. Attribution may well land on that.

If it turns out the model is mostly last-season-shrunk outside QB, that is a finding worth having,
not a failed ticket.

---

## ANSWERED 2026-08-18, by two methods that never spoke to each other

Crew forensics ran coefficient decomposition on the shipped models: **the `ppg_*` family carries
52–86% of standardized coefficient weight.** Everything else is at numerical noise — `tprr` 0.0010
(WR) and 0.0000 (TE), `epa_per_dropback` 0.0011 and `dakota` 0.0006 (QB), `snap_share` 0.0010 (RB).
`aging_curve_value` is ≤0.011 across all four, meaning the fitted continuous curve is inert and raw
`age` does that work.

Separately and with no knowledge of that work, a one-parameter shrink of last season's PPG was
measured to reproduce R² = 0.887 of the whole projection — 0.513 at QB.

**Two different methods, two isolated lanes, same conclusion: Engine B is a PPG autoregression with
an age term.** That is as close to independent confirmation as this operation gets.

**And three attempted fixes were refuted in the same session** — GBM instead of Ridge (worse at all
four positions), readmitting the excluded collinear features (~1.7% for WR, worse for RB and TE),
and a standardization theory (RidgeCV picks a smaller alpha, lands in the same place). So the
constraint is not the estimator and not the feature list. It is that a season-averaged rate stat is
nearly collinear with season-averaged points — **the shape of the training row.**

⇒ This makes DG-006 (sequence / week-level rows) the ticket that matters, and gives it a reason
rather than a fashion.

**⚠ QUALIFIED SAME NIGHT — see DG-017.** The deployed fit is unscaled Ridge with α hardcoded at 100,
which systematically suppresses small-magnitude features during fitting. The conclusion above may be
partly an artifact of that fit. **State corrected from ANSWERED to ANSWERED-PENDING-DG-017.** The
falsifier is named in DG-017 and it is cheap: refit scaled with tuned α and re-run the decomposition.
