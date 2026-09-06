---
name: feedback-check-what-the-quantity-measures
description: Two failures from one root on 2026-09-05 — a constraint nobody tested, and a ratio whose denominator was near zero by design. Before measuring against a quantity, establish what it is.
metadata:
  type: feedback
---

**2026-09-05, DG-164. Two lanes, two hours, two errors with the same root: measuring diligently against a quantity
neither had defined.**

### 1. "Survival cannot rise" — a constraint nobody checked was real

Fred and Bob both treated a rising survival cell as **impossible for a cohort** and used its frequency as a
publishing gate. They argued about the *metric* (cells-containing-a-rise, 35%, versus steps-that-rise, 13.6%),
reconciled it, agreed which was the harsher gate — **and never asked whether the constraint held.**

It does not. **S(h) here is a PREVALENCE curve, not a survival curve**: it asks *is he qualifying in year h*, not
*has he failed yet*. Failure is **not absorbing**. Measured: **13% of out-of-the-money player-years return the next
year; 25% of players go out and come back inside five.** A rising cell is **recovery**, which is real football —
and isotonic "repair" would have deleted the fact a dynasty owner most needs (*do I sell a good player having a bad
year?*).

⚠ **The premise propagated through a withdrawal, a re-derivation and a spec handoff** before dying: it was the
basis of a three-horizon limit put to David twice, and it survived being withdrawn because it had become the
shipping decision. **Retiring a constraint needs the same deliberate act as adopting one.**

⭐ **Agreement between two measurers is not evidence about the world.** Both lanes checking each other made the
error *more* durable, not less, because reconciling the metric felt like validating the premise.

### 2. A ratio whose denominator is near zero by design

Retention was published as `VOR_at_h / VOR_at_0` per player. Near the replacement bar **VOR₀ is tiny by
construction** — median 105 in the top half, **32.5** in the bottom — so ordinary noise became an enormous ratio.
Published bottom half read **126–135% ("they improve!")**; the ratio of **cell means** is **90% → 38%**. Nobody
improved. **The top half was wrong too: 69% against a correct 31% at year five.**

**A median does not fix this.** It guards the numerator against outliers; it does nothing about a denominator that
is small by design. **Check the denominator's scale before publishing any ratio.**

### 3. The consequence that nearly shipped: conditional vs unconditional

The per-player ratio was **conditional on still qualifying**, so it had to be multiplied by S(h). The ratio of cell
means is **unconditional** — non-qualifiers contribute zero — so **survival is already inside it, and multiplying
by S(h) again double-counts the exit.** Two quantities with the same name and units, differing only in what they
condition on, and one of them silently contains the other term of the product.

**Ask of every published quantity: what is it conditional on, and what does its denominator do near zero?**
Related: [[feedback_a_null_needs_a_sample_that_spans_the_effect]],
[[feedback_indistinguishable_is_not_equal_bound_the_difference]], [[feedback_check_when_not_just_what]].
