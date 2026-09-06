---
name: feedback_a_test_carrying_its_own_copy_is_an_antitest
description: "A test that restates the constant it guards certifies the error instead of catching it — worse than no test, because it makes the wrongness harder to find"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 117b7259-8014-45bf-986e-039a51e5410d
  modified: 2026-09-05T08:26:56.353Z
---

**DG-159, 2026-09-04.** The four replacement points-per-game values the whole cross-positional
layer rests on — QB 12.91 / RB 7.29 / WR 8.79 / TE 8.99 — **had no source at all.** They existed
only as inline comments on `ENGINE_B_REPLACEMENT_DVS`, citing
`app/data/backtest/phase14/var_batch_20260516_190328.json`. That artifact holds
**13.47 / 8.59 / 8.65 / 9.76**. No feature season of `engine_b_features_v2.csv` reproduces the
shipped numbers at the shipped ranks, and neither does any population of the served artifact
(all-scored, Engine-B-only, Active-only, raw `projection_2y` — all four checked).

**The reason nobody found it for months is the part worth keeping.** `test_phase15_xvar.py`
guarded the coupled identity, and to do so it declared its own `_REPLACEMENT_PPG` dict with the
same four numbers, with a comment explaining that no such constant existed in the code so it was
"restated here so the coupled identity is executable". So the test and the code agreed with each
other, **and neither agreed with anything measured.**

**Why:** a restated copy is not a weaker test, it is an ANTI-test. It actively certifies the
error, and it makes the mistake HARDER to find than if nothing had been checked — the green tick
is now evidence FOR the wrong number. Greg's framing, and it is right: "the test agreed with the
code because it contained a copy of the code's mistake" is a distinct failure from
[[feedback_the_failure_path_returns_the_success_signal]], where the check runs but its failure
path is indistinguishable from success. Here the check cannot fail at all.

**The sharp form of the rule, after sweeping for it.** The dangerous shape is NOT a test table
that duplicates a production constant — that is merely redundant, and if the two ever disagree
something goes red. It is a test table whose values appear **nowhere in the code it guards**.
12.91 / 7.29 / 8.79 / 8.99 were not copied from anywhere; the test file was the only place in the
repository they existed. There was nothing for the assertion to disagree WITH. So: *a test
supplying the expected value of a production constant, where that value exists nowhere in
production, is not a check* — an expected value must come from the code, an artifact, or a
computation.

**Swept 2026-09-04 at `96dad300`: clean.** The grep tell ("restated here") hits exactly once
across 419 test files — this instance. A stronger AST sweep (per-position table in a test, none of
whose values appear as a literal anywhere in `src/` or `app/`) also returns only this one, and was
validated by firing on `f80e0309` before being trusted. ⚠ The first run of that sweep looked clean
for the wrong reason: it read the trunk WORKING TREE, which was 17 commits behind, so it was
scanning pre-fix code. Read files through `git show origin/main:<path>`, never off disk — see
[[reference_trunk_frontend_bundle_is_a_manual_build]] for why "the working tree" is a claim about
a commit, not a fact.

**How to apply:** when a test needs a value the code does not name, that absence IS the finding —
stop and make the value a real, derived, dated constant, then have both read it. Never copy it
into the test. The tell is a comment saying "no such constant exists, so it is restated here",
or any test-local literal that duplicates a production number rather than deriving it. Ask of
every provenance test: *could this pass if the number were simply invented?* And check the cited
artifact actually contains the cited number — it took one `json.load` to disprove months of
documentation.

Related: [[feedback_the_failure_path_returns_the_success_signal]],
[[feedback_check_when_not_just_what]], [[project_dg159_one_scale_landed_2026-09-04]].
