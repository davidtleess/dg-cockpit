---
name: feedback-declare-the-policy-before-the-outer-loop
description: "DG-165 round 2 (2026-09-06): comparing two arms on the outer walk-forward years and publishing the winner's evaluation is retrospective model selection, not independent evidence; '5 of 6 metrics' are correlated. Declare the complete policy ex ante (selection only inside training windows), report alternatives as exploratory with a paired bootstrap of the difference."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: b80e4907-2b8e-494e-987a-b2e7a5ee6cd2
  modified: 2026-09-06T15:43:13.377Z
---

**What the round-2 review caught:** my trend experiment evaluated a plain arm and an auto arm on all
outer forecast years, then a rule picked the winner and the runner published the winner's evaluation as the
canonical evidence, with "improves 5 of 6 compared metrics" as confirmation. The inner-window selection was
fine; the OUTER choice between arms was retrospective model selection presented as an independent test, and
the six metrics were correlated readings of the same rows.

**Why it matters:** the evidence for a scoring policy is only independent if the policy — including how it
selects among variants — was fixed before the outer loop ran. Choosing on the outer results and then
quoting those results is the same optimism the review named in DG-178's "selection on forecasts".

**How to apply:**
1. Declare the COMPLETE policy first (e.g. `inner_menu`: choose among a fixed menu using only the three
   most recent complete classes inside each training window, by a rule written down in advance).
2. The outer evaluation of that policy is canonical and is exactly what final scoring runs.
3. Alternatives are evaluated beside it and labelled `exploratory`; compare with a PAIRED bootstrap of the
   difference on the same test rows ([[feedback_indistinguishable_is_not_equal_bound_the_difference]]); no
   `decision` field, nothing reassigns the canonical files.
4. Put the policy and arm in affirmative identifiers (`model_policy`, `scoring_arm_id`, `evaluation.policy_id`,
   output hashes, a pairing block that raises) so mispairing is detectable without prose
   ([[feedback_the_evaluation_must_describe_the_model_that_scored]]).
