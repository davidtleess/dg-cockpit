# DG-153 — Nothing reports how the model does on a player it has never seen

**Layer:** 3 · **State:** done · **Lane:** Davids-MacBook-Pro-48631 · **DG 3.0** · **model honesty · medium**
**Source:** Bob (`davidleess-08 [b202b7]`), 2026-09-04 ~13:5x ET, found while measuring DG-027/DG-026 and filed at
Greg's direction as its own ticket — it is a bigger finding than the split bug it fell out of and must not be buried
in that closeout. **Neither DG-027 nor DG-026 names it.**

**Problem:** every published Engine B number is measured on a holdout that shares most of its players with training.
On the frame the fit actually sees, **65.6% of holdout players also appear in the training rows** (QB 75.0%, RB 63.0%,
WR 64.9%, TE 64.4%). So the reported skill is largely skill at RE-RATING a player the model has already met. Nothing
anywhere reports the other number — how it does on a player it is meeting for the first time — and that is the waiver
pickup and the rookie, the two cases David most needs help with.

**How we know (measured 2026-09-04, read-only, in `~/dg-wt/DG-027`; alphas reproduce the served run
`20260831T204458Z` exactly, so this is the shipped model, not an approximation).** Alpha selected by player-grouped
CV, scored on the 2022-23 holdout, then scored again on only those holdout rows whose `player_id` never appears in
the fitted training rows:

| pos | published r² | honest-split r² | **unseen-player r²** | rho published → unseen | unseen rows |
|-----|-------------:|----------------:|---------------------:|-----------------------:|------------:|
| QB  | +0.439 | +0.365 | **−0.158** | 0.696 → 0.416 | 18 |
| RB  | +0.593 | +0.600 | **+0.461** | 0.788 → 0.709 | 60 |
| WR  | +0.682 | +0.691 | **+0.612** | 0.806 → 0.764 | 88 |
| TE  | +0.641 | +0.597 | **+0.483** | 0.789 → 0.578 | 44 |

**⛔ THE TABLE ABOVE IS SUPERSEDED — it was measured against the PRE-DG-027/026 training set.** It stands as
the record of what the SHIPPED model did on 2026-09-04. See the corrected figures in the acceptance below:
under the landed split the QB figure is **+0.016 with an interval spanning zero**, so the honest statement is
**"we cannot say"**, NOT "worse than the average" — and the code now says exactly that.

**⚠ CAVEATS THAT TRAVEL WITH THESE NUMBERS AND MUST NOT BE STRIPPED:** single split, point estimates, no repeats;
the unseen samples are small (QB 18 rows especially). **The DIRECTION is solid — every position drops, none
improves. The MAGNITUDES are rough.** Nobody should quote them as settled, including the lane that produced them.

**Done looks like:** whatever reports model skill also reports it on unseen players, or refuses to.
1. **"Unseen" is defined against the ACTUAL FITTED ROWS, never the CSV.** The fit drops rows (`training_eligible`
   is False on 1,143 of 3,384), so a player can sit in the file and still be unseen by the model. The definition
   belongs in the code and in the report, stated.
2. **The metric REFUSES rather than reports below a stated sample floor.** QB's n=18 is exactly the case that would
   otherwise ship a confident number; an honest surface says "too few unseen players to say" and names the count.
3. The figure appears wherever the position's skill is claimed, beside the pooled one, never instead of it — both
   are true of different questions.

**Anti-scope:** does not retrain, re-promote or change any served value; a promotion is David's word through
DG-058/059, which are unbuilt. Does not touch `XVAR_LAMBDA_ENGINE_B` (DG-092) or the coupled TE constants.

**Depends on:** nothing. Reads better after DG-027's grouped-CV fix lands, but stands alone.

---

**Notes**

- **Population definitions, because two lanes measured two different things and both were right.** Greg's
  spot-check said 53.5% holdout overlap; mine said 79-90%. Reconciled 2026-09-04 ~14:1x ET: his pooled figure
  counted `feature_season >= 2022`, which sweeps in the **505 unlabelled 2025 rows — the inference partition, not a
  holdout at all** (0 of them are `training_eligible`). Mine was measured on the RAW csv before the eligibility
  filter. **On the frame the fit sees, 2022-23 only, the answer is 65.6% pooled** and the per-position table above.
  My "79-90%" was the raw-csv number and is **retracted**; the r² measurements were always computed on the fitted
  frame and stand.
- **Same lesson on the repeated-row figure.** I reported 52-58% of training rows "share a player"; that was the
  SURPLUS count (a player with k rows contributes k−1). Greg counted every row belonging to a repeated player (k),
  which is the right statistic for a leak question — **85-90% per position on the fitted train rows.** Both numbers
  are true; his is the one that answers "how many rows can leak", and it is the one to quote.

**Acceptance — LANDED `43c15699` 2026-09-04 ~16:5x ET by Bob (`~/dg-build/bin/dg-land.sh DG-153`).** Backend 6,967.
Nothing retrained, nothing promoted. The run report now carries `metrics_unseen_players` per position.

**CORRECTED FIGURES, under the split DG-027/026 landed at `e7391650`.** The training set changed, which changes both
the model AND which players count as unseen, so the ticket's original numbers no longer describe the code:

| pos | unseen players / rows | unseen r² | 90% interval | all-holdout r² | status |
|-----|----------------------:|----------:|--------------|---------------:|--------|
| QB  | 26 / 39  | *(withheld)* | [−0.365, +0.286] width **0.65** | +0.345 | `insufficient_unseen_players` |
| RB  | 59 / 85  | +0.526 | [+0.375, +0.644] width 0.27 | +0.596 | `measured` |
| WR  | 88 / 129 | +0.673 | [+0.588, +0.740] width 0.15 | +0.679 | `measured` |
| TE  | 54 / 73  | +0.543 | [+0.401, +0.642] width 0.24 | +0.631 | `measured` |

**What I got wrong when I filed this, corrected rather than quietly dropped:** I reported QB at −0.158, "worse than
predicting the average". Under the landed split the same figure is **+0.016 with a 90% interval of [−0.365, +0.286]**
— it spans zero, so QB is **not measurable at this sample size** and the metric withholds it. I also reported WR
dropping .682→.612; the real drop is **.679→.673, essentially none**. **The DIRECTION survives** — no position scores
better on unseen players than on the full holdout — **but my magnitudes were wrong.** Greg's instruction to say so if
the figure could not be made stable is what this is: for QB it cannot, and the code refuses instead of pretending.

**Three honesty properties, all pinned by tests:**
1. **"Unseen" is measured against the FITTED rows, never the file** — the fit drops 1,143 of 3,384 rows and DG-026
   drops a whole feature season, so a player can sit in the training file and still be unseen by the model.
2. **It REFUSES rather than reporting.** Below `MIN_UNSEEN_PLAYERS = 30`, or with a bootstrap interval wider than
   `MAX_UNSEEN_R2_INTERVAL_WIDTH = 0.40`, the estimate is withheld and the reason named. **Both thresholds are
   calibrated on the served dataset** (QB 26 players → width 0.65; TE 54 → 0.24), not picked from the air, and the
   calibration is in the code beside them.
3. **The interval and the caveats travel in the ARTIFACT**, not only here — a number that leaves its caveats behind
   gets quoted as settled by the next reader. Deterministic bootstrap seed, so a report that moves means something moved.
