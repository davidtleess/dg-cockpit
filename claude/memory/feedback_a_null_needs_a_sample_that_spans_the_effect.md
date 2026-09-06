---
name: feedback-a-null-needs-a-sample-that-spans-the-effect
description: A null result is only a result if the sample spans the range where the effect would live — Fred called the contend/rebuild toggle inert from six players covering a third of the spread.
metadata:
  type: feedback
---

**2026-09-05, DG-164.** Fred measured the contend/rebuild discount across six probe players, found **one swap
across the whole range**, and reported that the toggle "is very nearly INERT". The mechanism he gave was correct —
a discount reorders two players only when their survival curves **cross**. The conclusion was false.

Tested across all 59 published cells: **66 of 1,711 pairs reorder, maximum repricing 1.74×.**

**Why:** his six players' curves spanned **3.44–4.02** on the front-loaded/back-loaded axis. The published range is
**2.43–4.22**. He sampled roughly a third of the spread, found little movement inside it, and reported a property
of the mechanism. Five of the six were young or prime; the sixth was a QB — the one position whose curve does not
collapse. **His sample contained no front-loaded player, which is the only kind the effect acts on.**

**THE RULE (his words, worth keeping):** *a null result is only a result if the sample spans the range where the
effect would live.* Before reporting "X does nothing", state where X would act if it acted, and show the sample
reaches there. Cheap to check, and it is a different failure from
[[feedback_the_failure_path_returns_the_success_signal]] — nothing here was broken and nothing returned a wrong
signal. The apparatus was fine; the sample could not see the subject.

**Same shape, other costume:** measuring the apparatus and reporting it as the subject. Compare the stale-log trap
in [[feedback_the_failure_path_returns_the_success_signal]] and the wrong-denominator finding in
[[project_dg162_what_the_model_reads_2026-09-04]] (4.8% coverage against a universe 8,185 of whose rows are
unstartable in his format).

**What he got right, and it matters for how to concede:** his factual claim — McCaffrey's own cell IS suppressed,
RB HAS no elite cell at 30–31 or 32+ — was true. Only the inference from it failed, because `RB 28-29 elite`
(n=23, S = 90/63/57/38/12) supplies the same front-loaded shape one band down. **Separate the fact from the
inference when conceding; conceding both is as inaccurate as conceding neither.**
