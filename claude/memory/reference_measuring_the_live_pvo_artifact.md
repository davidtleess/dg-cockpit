---
name: reference_measuring_the_live_pvo_artifact
description: "Two traps that invalidated a whole TE brief: the runtime PVO is REWRITTEN at 09:00/11:30/14:00 under a running measurement, and projection_2y is NOT the number the score is computed from"
metadata:
  type: reference
---

**Both cost a full rewrite of the tight-end brief on 2026-09-04.** A five-lens audit returned
25 corrections, five of them blockers, and these two caused most of them.

**1. The artifact moves while you measure it.** `app/data/valuation_runtime/universe_pvo_runtime.json`
is rewritten by the 09:00 chain and again by the 11:30 and 14:00 `run_pvo_refresh` jobs. I started
measuring at 08:0x and finished after 09:00, so half my figures came from the 09-03 artifact and half
from 09-04 — the Engine-B scored population had gone 388 → 502 and TE 89 → 108 underneath me, and the
brief's own header cited the stale count while its tables cited the fresh one.
**Always read `captured_at` out of the artifact and print it with the numbers**, and re-run the whole
measurement in one pass if a boundary was crossed. The clamped counts happened to be identical (TE 8 /
RB 5 / WR 4), which is exactly how a mixed-vintage brief survives a spot check.

**2. `projection_2y` is NOT what the score is computed from.** `pvo_assembler.py` does
`_adjusted = apply_availability(projection_2y, availability_p)` and normalises THAT. The availability
factor is not in the artifact (median served/projection ≈ 0.825). So:
* for an UNCLAMPED player the served input is exactly recoverable as `dvs/100 * P90[pos]` — use that;
* for a CLAMPED player (`dvs == 100`) it is only bounded: `(P90[pos], projection_2y]`. Any point
  estimate for such a player is invented. Give an interval or say "at most".
Using projections as inputs makes every re-based number optimistic, and it broke the option that
proposed setting a ceiling to a projection: nobody is ever SERVED that value, so the top of the 0-100
scale would have become unreachable.

**Also learned in the same pass:** measure "how many are pinned" against the ranks that
`ENGINE_B_VAR_THRESHOLDS` declares (QB 25 / RB 33 / WR 53 / TE 13 — they already include this league's
flex and superflex), not against bare starter slots; a population-wide rate hides the defect
(TE 7.4% of everyone, but 8 of 13 startable). And when proposing new constants, derive them in ONE
calculation (ceiling → lambda = ceiling/WR ceiling → replacement = repl_ppg/ceiling) or the
`test_phase15_xvar.py` identity test goes red on a 0.1 rounding difference.

Related: [[feedback_synthesis_is_the_weak_layer]], [[feedback_check_when_not_just_what]],
[[project_review_verdicts_2026-09-03]], [[feedback_a_ruling_names_a_field_not_the_block]].
