---
name: feedback-indistinguishable-is-not-equal-bound-the-difference
description: "Statistically indistinguishable" is a failure to reject, not a finding of equality — bound the difference directly and the claim becomes positive and defensible.
metadata:
  type: feedback
---

**2026-09-05, DG-164.** I wrote that two survival cells were *"statistically indistinguishable"* — E 2.88 [2.30,
3.37] against 2.85 [2.44, 3.23], n=16. Fred's correction: **that is a failure to reject, not a finding of
equality.** With n=16 the intervals are wide enough that a real gap could hide inside them, and a reviewer asking
*"how do you know they are equal rather than merely unmeasured?"* would be right. As phrased, the sentence sounded
stronger than it was.

**THE FIX — bound the DIFFERENCE, not the two levels.** Direct bootstrap, players resampled once from the **union**
of both cells with both recomputed inside each replicate (so a player appearing in both is handled):

    WR 30+ 2.3x+  -  WR <=23 1.0-1.3x   =  +0.03   90% CI [-0.70, +0.69]   (0 players overlap)
    WR 28-29 2.3x+ - WR 24-25 1.0-1.3x  =  +2.35   90% CI [+1.86, +2.82]
    RB 28-29 2.3x+ - RB 24-25 1.0-1.3x  =  +1.18   90% CI [+0.38, +1.88]

The claim becomes **positive**: *equal to within 0.7 of a season* — about a quarter of the 2.85 level, small enough
to be meaningful. An equivalence bound survives the reviewer question; "indistinguishable" does not.

**Two method notes worth keeping:**
- Resample from the **union** and recompute both cells per replicate. Bootstrapping each cell separately and
  differencing assumes independence, which fails whenever the same player appears in both (here 4–7 players in
  three of four pairs; the load-bearing pair happened to have zero).
- Fred's cheap approximation — recover SEs from the marginal 90% intervals assuming symmetry, combine in
  quadrature — landed **within 0.06 on every bound**. Good enough to sanity-check a direct computation, and fast.
- ⚠ **BUT THE APPROXIMATION'S ERROR HAS A DIRECTION, and it is the bad one (Fred, 09-05).** Shared players inflate
  the apparent precision of a difference built from two independent bootstraps, so it **fails toward false
  confidence** — on the RB pair his lower bound was **+0.48 against the direct +0.38**. It did not change that
  verdict, but it fails *hardest on the marginal comparisons where the answer is actually in doubt* — precisely the
  row we agreed not to claim, at [−0.05, +0.96]. **Use quadrature as a sanity check; never let it decide whether
  something separates.**

Sibling rule from the same exchange: [[feedback_a_null_needs_a_sample_that_spans_the_effect]]. Both are about not
reading an absence of measured difference as a fact about the world.
