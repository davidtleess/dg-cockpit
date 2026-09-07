---
name: feedback-the-evaluation-must-describe-the-model-that-scored
description: "DG-165 2026-09-06: a run wrote the PLAIN arm's evaluation.json / out_of_time_predictions.csv, then a trend experiment decided, then the class was scored by the TREND model — a consumer graded the wrong arm. When a pipeline chooses between arms, the chosen arm's evaluation is the canonical file and the other arm is saved beside it."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: b80e4907-2b8e-494e-987a-b2e7a5ee6cd2
  modified: 2026-09-06T15:17:19.984Z
---

**The defect (found by lane 25057 grading my file, 2026-09-06):** my runner evaluated the plain model, wrote
`evaluation.json` and `out_of_time_predictions.csv`, THEN ran the bounded trend experiment, whose rule selected
the trend arm for scoring `rookie_scores_2026.csv`. The evaluation described one model and the scored file
another. The integration lane graded the plain arm's predictions on their joint board and reported a
10–35-point rookie under-prediction that the trend arm had mostly removed.

**Why it happened:** the experiment was bolted on after the evaluation step instead of being the evaluation
step. Sequencing in a script silently defines what "the evaluation" means.

**How to apply:**
- If a pipeline decides between model variants, run every arm with the one procedure, then write the
  DECIDED arm's evaluation and predictions as the canonical files and the other arm(s) as
  `evaluation_other_arm_<name>.json` beside them. Record in the manifest which arm is canonical and why.
- A consumer must be able to read "the evaluation" and "the scored file" and be reading the same model.
- Same family as [[feedback_a_rebuild_invalidates_every_claim_from_the_old_build]]: a later step inside the
  same run invalidated an artifact written earlier in it.
