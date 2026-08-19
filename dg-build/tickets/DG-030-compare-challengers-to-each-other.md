# DG-030 — Compare model families to each other, not just to naive

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** Tower, 2026-08-18, adversarial review

**Problem:** A program-level recommendation — "make sophisticated models beat linear baselines
first" — rests on a comparison that was never run. Every uncertainty interval in the supporting
evidence is challenger-versus-naive. There is no interval on the difference between Ridge and a tree,
which is the quantity the recommendation is about.

**How we know:** pooled RMSE, WR — elastic net 2.846021, random forest 2.846081. **A separation of
6e-5** against bootstrap intervals roughly seven percentage points wide. Per fold, trees win 5 of 12.

**Done looks like:** paired comparisons between candidate families on identical folds, with a
cluster bootstrap interval on the *difference*. Families that are statistically indistinguishable get
said out loud rather than ranked.

**Depends on:** DG-026 — running this on a leaking split would just produce contaminated rankings.

---

**Notes**
This is not an argument for trees. It is an argument against picking a winner from the fifth decimal
place, which is what the current evidence does.
