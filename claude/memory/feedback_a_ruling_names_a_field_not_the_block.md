---
name: feedback_a_ruling_names_a_field_not_the_block
description: "When David rules on one field, exclude exactly that field — widening to the container silently removes its siblings from the guarantee, and the tests you wrote for the ruling all still pass"
metadata:
  type: feedback
---

**DG-141, 2026-09-04.** David ruled "B" to the framing "drop the Sleeper player-list hash".
That hash lives in each PVO row's `lineage` block. I excluded `lineage` — the whole block —
from `_semantic_projection`. The block's OTHER field is `governance_version`, and
`resolve_provenance_subset` excludes row lineage by its own docstring, so after that commit
a governance bump was hashed by **nothing at all** and would have shipped as
`vintage_changed: false` — the exact failure the ticket existed to end.

**Every test I wrote for the ruling passed.** They tested the field he named. Nothing tested
the sibling, because I never formed the thought that the block had one. Five independent
review lenses found it at full vote; measured proof was one line: bump `governance_version`
on all 12,227 live rows and the hash does not move.

**Why:** a ruling is about a *thing that behaves badly*. The container is an implementation
detail I chose, and excluding it silently re-scopes his decision to everything it holds.
"He said drop the Sleeper hash, the Sleeper hash is in lineage, so drop lineage" is one
substitution too many, and it reads as faithful right up until you enumerate the siblings.

**How to apply, before excluding / deleting / disabling anything on a ruling:**
1. Enumerate what else lives in the container. `Counter` the live artifact's keys, or read
   the producer (here `universe_pvo_batch.py:266-269`) — do not trust the fixture, which
   may carry only the field you are thinking about.
2. For each sibling, ask what else covers it. If the answer is "nothing", that sibling is
   now unguarded and the ruling did not say to unguard it.
3. Exclude the named field, not its parent. Project the container instead of dropping it.
4. Write the test for the SIBLING too — "a changed `governance_version` still trips" —
   because the tests for the ruling itself cannot fail on this.

Related: [[feedback_synthesis_is_the_weak_layer]] (verified pieces, wrong whole),
[[feedback_my_conventions_are_not_davids_rules]], [[feedback_workflows_die_on_spend_limit]]
(same panel: 8 refuters died on API errors — a dead refuter is UNVERIFIED, never a
refutation; I re-checked those findings by hand and one of them was this defect's sibling).
