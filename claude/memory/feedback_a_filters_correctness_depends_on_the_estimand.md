---
name: feedback_a_filters_correctness_depends_on_the_estimand
description: "The same filter can be REQUIRED for one question and DESTROY another. censored_incomplete_arc is correct for 'how good is he if he makes it' and annihilates 'does he make it' — which is why it was right everywhere it had ever been used and nobody caught it. Found 2026-09-06."
metadata:
  node_type: memory
  type: feedback
---

**The shape:** a filter is not right or wrong in itself. **Its correctness depends on the estimand** — on which
question the fitted quantity is answering. A filter that has been correct in every prior use can annihilate the
next one, and it will look like established practice while doing it.

**The instance, 2026-09-06 (Bob, DG-165).** `censored_incomplete_arc` in `prospects_with_outcomes_v3.csv` conflates
*"we cannot observe his arc yet"* with *"he never played."* In the completed 2015-2020 classes:

    censored=0   n=313   played zero games:   0   median 33 games
    censored=1   n=165   played zero games:  85   median  0 games

- **Engine A asks *how good is he IF he makes it*** — a rate, `best3of4_ppg`, fitted on 313 non-censored rows with
  a minimum of 8 games and zero zeros in the target. **Excluding the washouts is REQUIRED.** Include them and the
  target is contaminated with players who have no rate at all.
- **The rookie factor asks *does he make it*** — `P(ever qualifies)`. **Excluding the washouts DESTROYS the
  question**: the surviving population is entirely players who qualified, so the fitted P returns **≈ 1.** Not a
  biased estimate — the quantity ceases to exist, and a seventh-round tight end prices like a first-rounder.

**Same file, same column, same 165 rows. Opposite correctness.**

⭐ **WHY NOBODY CAUGHT IT, and this is the part worth carrying:** *it has been correct everywhere it has ever been
used.* A filter with a clean track record reads as settled, and its name (`censored_…`) describes the case it
handles correctly. Nothing about it looks like a decision, so nothing invites the question.

**How to apply:**
1. **Before reusing any filter, state the estimand out loud** — the exact sentence the fitted quantity answers.
   Then ask whether the filter removes rows that ARE the answer.
2. ⛔ **The tell is a filter that removes the extreme cases of the outcome you are modelling.** Washouts for a
   survival question, zeros for a rate question, refusals for an acceptance question.
3. **A filter is not a bug to remove.** Bob's conclusion: do not delete `censored_incomplete_arc` — it is right for
   Engine A. Scope it per estimand.
4. Related: an inherited flag whose gate you have not read is [[feedback_a_placeholder_hardens_into_a_fact]] in
   another costume. `low_sample_flag` (533 of 874) and `head_b_training_eligible` (320 of 874) are still unexamined.

⚠ **A dead column found in the same pass:** `yprr_college` is **0% populated** — a feature carried in the contract
with no data in it. See [[project_ranking_diagnosis_2026-08-31]] on features that reach zero coefficients.
