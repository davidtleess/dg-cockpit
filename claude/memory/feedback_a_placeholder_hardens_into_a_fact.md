---
name: feedback_a_placeholder_hardens_into_a_fact
description: "A number that was eyeballed, guessed or filled in as a placeholder becomes indistinguishable from a measured one after it is restated a few times — and an incomplete handoff invites the receiving lane to invent the missing piece. Two instances in one hour, 2026-09-05, one from each lane."
metadata:
  node_type: memory
  type: feedback
---

**The shape:** a number enters as an estimate, a placeholder or an eyeball. Nothing marks it as provisional. It is
then quoted, restated and built upon until it is indistinguishable from a measurement — including to the person
who made it up. **Repetition manufactures confidence.** No lie is told at any step.

**Two instances within one hour, 2026-09-05, one per lane, on the SAME handoff:**

1. **Fred's `RB60`.** He needed the rank of the best unrostered running back, *eyeballed where the player sat*,
   never computed it, and then restated it across three messages until it read as a finding. **It is 45.** Greg
   measured it independently on two different orderings and raised a fifteen-rank discrepancy; Fred's own
   re-measurement confirmed the error was entirely his. Fifteen ranks IS the replacement bar — everything
   downstream would have been wrong in a way that looks like a result.
2. **Bob's `TE=34`.** Fred sent three of the four availability ranks and omitted tight end. Bob **filled the gap
   with an invented number** rather than asking for the missing one. It produced four tight ends as the largest
   movers and drove his entire headline (Spearman 0.274). **It is 21** — thirteen ranks too deep, at the
   shallowest position, where the same absolute gap is a quarter of the pool rather than a tenth. He was one
   message from escalating a false ruling to David.

**The deeper defect is not either number — it is that the handoff had no completeness check.** Four values were
required, three were sent, and neither lane noticed the fourth was missing until it had been built upon. Bob
caught his own guess only because every large mover shared a position.

**How to apply:**
1. **Mark provisional numbers at birth, in the text that carries them** — "eyeballed, not computed", "placeholder".
   A caveat attached later never catches up with the number.
2. **Never fill a gap in someone else's handoff.** Ask for the missing value. A guess in a received payload is
   invisible to the sender and authoritative to everyone downstream.
3. **Enumerate what a handoff owes.** Four positions means four numbers; the receiving side should refuse an
   incomplete set rather than complete it. Same rule as
   [[feedback_a_ruling_names_a_field_not_the_block]] — enumerate the siblings.
4. **When a peer's number disagrees with yours, measure it a second independent way before arguing.** Both
   corrections here came from computing the same quantity on two different orderings and getting the same answer.

**A related formulation from the same hour, worth keeping for its own sake.** Asked whether unpriceable players
would be BLANK or ABSENT on a new board, Fred answered: **absent by construction, blank by diligence — and
diligence is not a mechanism.** His ranking dropped null-valued players with an `if is not None` filter and they
appeared only because he had separately written a print statement listing what was dropped. One forgotten line
and a board missing eighty players reads as complete. The fix is structural and testable: carry unpriceable rows
through with a null value and a stated reason, no filtering between join and render, and assert
**rows out == players in.** See [[feedback_the_failure_path_returns_the_success_signal]].
