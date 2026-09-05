# DG-152 — Schedule the model-vs-market grade, and make its weekly job fail LOUD rather than no-op

**Layer:** 3 · **State:** open · **Lane:** — · **DG 3.0** · **model quality / grading · small**
**Source:** filed 2026-09-04 13:3x ET by Fred (`davidleess-eb [d4e70e]`) at Greg's request
(`davidleess-eb [a78c76]`), immediately after landing DG-018 (`5a2bfc12`). Serves David's
2026-09-04 13:14 ET redirect, verbatim: *"For now, I think we need to focus on getting our model
to be robust and continuing to work on the usage of the data we have at our fingertips and the
pipelines that we will be ingesting data from, so that our rankings of players are the best in
the world."*

**Why this is a ticket and not a note to self.** Greg's reason, and it is the right one: an
unfiled intention has the same shape as the bug DG-018 exists to prevent — something that looks
fine while doing nothing. Writing it down is the fix for that shape at the process level.

**Problem:** DG-018 landed the scorer and its runner
(`scripts/run_model_vs_market_scoring.py`) but wired NOTHING to a schedule, deliberately: there
is nothing to grade until **week 4** of the 2026 season. That deliberate gap is invisible to
anyone reading the board six weeks from now, and a grade nobody runs is worth the same as no
grade at all.

**Not urgent, and the reason matters.** ⛔ Do NOT schedule this expecting week-1 output. Measured
in DG-018: `realized_outcome_scorer.ELIGIBLE_GAMES_MIN = 4` (a player needs 4 played games to be
rank-eligible) and `POWER_FLOOR_MIN_COHORT = 10` (a position needs 10 such players). After week 1
every player has one game, so every position returns `power_floor_not_met` with no numbers. The
**earliest a real figure can exist is week 4.** Also measured: nothing perishes by waiting —
`run_realized_outcome_scoring._build_outcomes` loops `range(1, week + 1)` into a THROWAWAY store
and rebuilds every finalised week from nflverse on each run, so a first run in week 6 grades
weeks 1 through 6.

**Done looks like:** the grade runs on a schedule after each week finalises, its scorecard is
written where model quality is reported, and a run that grades nothing says so LOUDLY.

**The hard requirement, and the whole point of the ticket:** the scheduled job must
**fail loud on finalised-weeks-with-no-outcomes**, never no-op. `run_model_vs_market_scoring.run`
already returns `failed:no_outcomes_for_finalized_weeks` for exactly this case (DG-018 pinned it
with `test_finalized_weeks_with_no_outcomes_fails_loud_instead_of_reading_as_preseason`) — the
scheduling must preserve that distinction end to end: a non-zero exit, a marker that records the
failure, and no scorecard on disk. ⚠ Note the precedent: on the realized-outcome artifact's
`auxiliary` tier a `noop` is a SUCCESS status, which is precisely how an undeclared freeze could
have reported the loop healthy all season (`FrozenPredictionSetUndeclared`'s own docstring says
so). Do not inherit that hazard.

**Suggested shape (not a decision):** the realized-outcome scorer already runs Tuesdays 10:00
(`com.davidleess.dynasty-realized-outcome-scoring.plist`). Either add this as a second step in
that job, so the two scorecards are always computed from the same finalised weeks and cannot
disagree, or give it its own plist immediately after. The first is preferable — they share the
frozen declaration, the finality law and the outcome builder; splitting them invites drift.

**Anti-scope:** no API route, no surface, no dashboard. DG-018's own note stands: a grading run
that fires and stores an honest result beats a scorecard nobody can reach. Do not change the
scorer, the frozen declaration (David's, 2026-08-13), or the power floors to make an earlier week
produce a number.

**Verify:** with no finalised week, the job exits 0 and writes no scorecard. With finalised weeks
and resolvable outcomes, it writes a scorecard carrying the frozen date, the paired count and the
model-only / market-only counts. With finalised weeks and zero resolvable outcomes, it exits
NON-ZERO, records the failure, and writes no scorecard.

---

**Notes**

**The near-miss from DG-018, recorded verbatim at Greg's request, because it is the most valuable
thing the ticket produced:**

> My first cut resolved player identity in the wrong direction. The bridge maps sleeper to gsis
> forward only and has no reverse lookup, and I had hedged the reverse with a `hasattr` guard.
> That would have returned zero outcomes for ever while reporting a healthy no-op every single
> week, and the run would have looked green the whole way. I caught it reading my own code before
> committing, wrote the test first, and the mapping is now driven from the predictions.

**This is the third instance of one failure shape, and Greg's observation is that it now deserves
a general rule.** The three on record:
1. **DG-136** — a capture refusal exited **0**, so a refusal morning read as a healthy run.
2. **DG-142** — the roster trust badge compared a version **string that was identical on both
   sides**, so it always agreed and never checked the served bytes.
3. **DG-018 (this near-miss)** — a reverse identity lookup that does not exist, hedged with
   `hasattr`, would have graded **nothing** while reporting green weekly.

The shape: **a check whose failure path is indistinguishable from its success path.** Each was
found by reading the code rather than by running it, because running it produced green in every
case. Someone should eventually write the general rule down — a candidate ticket of its own, not
folded into this one.
