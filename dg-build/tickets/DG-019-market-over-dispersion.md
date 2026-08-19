# DG-019 — The market appears to over-disperse by roughly 2×

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** crew lane horse race, 2026-08-18

**Problem:** Trained on 2020–21 and tested on 2022–23, one specification beats the market:
**+0.008 Spearman, 95% CI [+0.0002, +0.0217]**. The mechanism is that when the market's coefficient
is estimated freely rather than forced to 1.0, it comes out near 0.5 — the market spreads values
about twice as far apart as it should.

**Why it matters here specifically:** over-dispersion is invisible in a ranking and decisive in a
trade. Ranking players is not what David does with this product; valuing them against each other is.

**How we know:** the two alternative specifications that fail both implicitly force the market
coefficient to 1.0. That is the difference between the one that works and the two that don't.

**Done looks like:** the effect replicates on cohorts it was not fitted on, or it is dropped.

**Depends on:** DG-020 — two training cohorts is not enough to trust this.

---

**Notes, stated plainly rather than buried**
This is **small and fragile**: a lower CI bound of +0.0002 is a hair from zero, on two cohorts.
It should not move `decision_supported`, and the lane that found it said so first.

Treat it as the most interesting lead on the board, not as a result.
