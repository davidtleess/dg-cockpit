---
name: feedback_workflows_die_on_spend_limit
description: Review workflows can die mid-run on the monthly spend limit (18 of 21 agents 2026-09-02) — the main session keeps working; verify the decision-relevant questions inline and say which lenses never ran
metadata:
  type: feedback
---

On 2026-09-02 ~07:30 the DG-137 adversarial review workflow lost 18 of 21 agents to
"You've hit your monthly spend limit … resets 10:20am (America/New_York)". The main session was unaffected.

**Why:** a review that silently loses most of its lenses reads as "reviewed" in the closeout; the ticket had to
say "2 of 5 lenses, 3 died" to stay true. Session-only crons may also fire while still under the limit.
**How to apply:** when a workflow returns fewer results than agents launched, read the journal, list the lenses
that never ran, verify the decision-relevant questions yourself inline, and record the gap in the closeout.
Never re-launch a fleet to fill the gap while the limit is on. See [[feedback_synthesis_is_the_weak_layer]].
