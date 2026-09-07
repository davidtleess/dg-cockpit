# DG-175 — a live-data test outlived its own premise and now blocks main

**Layer:** 3 · **State:** open · **Lane:** Davids-MacBook-Pro-69536 · **DG 3.0** · **build hygiene / test correctness · small**

`test_dg159_one_scale.py::test_an_ordinary_morning_is_still_not_mistaken_for_a_change_of_units`
walks **every consecutive pair of capture dates in the live
`model_forward_capture.db`** and asserts `detect_uniform_position_factor` never fires.

That was true for seventy mornings. Then DG-159 shipped, the scale genuinely changed,
the detector correctly said so on 2026-09-04 → 09-05, and the test failed — **asserting
that a deliberate, David-ruled event had not happened.** Main is red and Bob's DG-173
is blocked behind it.

**The detector is right. The test expired.** Bob verified it fails at `HEAD~1` without
his commit, and declined to touch a guard he wrote in DG-158 whose test belongs to
DG-159.

**⭐ THE SHAPE, because it will recur: a test written against unbounded live data will
eventually assert that a real event never happens.** There is no date bound in the loop
— it re-derives its own population every run, so it was correct right up until the thing
it forbids actually occurred. Nobody would have predicted this one, and nothing about
the test looked wrong until the world moved.

**Fix taken (of the two Bob offered):** declare the known unit changes rather than bound
the dates. Bounding fixes the failure by making the test stop watching. Declaring makes
it **stronger** — it now also asserts the detector FIRES on the mornings we know the
scale moved, so a silent detector no longer passes trivially, and a second undeclared
rescale fails loudly instead of joining the noise.

**Verify:** 46 tests pass in `test_dg159_one_scale.py`; the new
`test_the_detector_fires_on_the_mornings_the_scale_actually_moved` fails if the guard
ever stops noticing a rescale we know shipped.
