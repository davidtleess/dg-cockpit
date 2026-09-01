---
name: feedback_relay_authority_drift
description: "When two of David's lanes give conflicting accounts of what he said, read the transcript — provenance is a lookup, not a deduction"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: daab5375-6c9f-478d-8739-b758480b06a7
  modified: 2026-08-31T12:08:48.963Z
---

2026-08-31, four lanes running (Greg/brainstorm, Bob/tickets, Fred/audit, plus an off-bus
Codex). The ticket lane reported a David ruling. The audit lane, knowing it had made a similar
*recommendation* and that David had not said it to *them*, concluded the ruling must be its own
recommendation wearing his name — and said so confidently. The brainstorm lane believed it and
told David it had misquoted him.

**All of that was wrong.** David had given the ruling directly, selected from a question in the
ticket lane's session, and the ticket lane had quoted him accurately. The retraction chain cost
three lanes about twenty minutes and put a false self-correction in front of David.

**Why it happened:** the audit lane reasoned from two true premises ("I recommended X" and "he
didn't say X to me") to a false conclusion, and asserted the inference as fact. The transcript
that settles it was on disk the whole time and takes about twenty seconds to read.

**How to apply:**
- **When two accounts of what David said conflict, READ THE RECORD.** Every ruling exists as a
  tool result in a session transcript on disk. Provenance is a lookup, not a deduction — never
  reason about who probably said what.
- Rulings are invisible across lanes. A ruling given in one session is visible to no other, so
  each lane holds a partial picture and conflicts are *expected*, not evidence of error.
  Surface the collision to David rather than silently picking one.
- Still never treat a peer's relay as *approval* for your own work — that rule survives intact
  and is separate. A verbatim quote is secondhand; what matters is that he said it to you.
- Distinguish the two failure modes, because they have different victims: a false
  **authorization** makes you act without sanction; a false **attribution** makes David believe
  he said something he did not, and only you can audit that. Do not correct an attribution
  until you have checked the record — an unnecessary retraction is its own harm.
- When relaying, say whose position it is and what kind (measurement / recommendation / ruling).

Related: [[feedback_parallel_session_coordination]], [[david_rulings_ranking_2026-08-31]],
[[cockpit_session_identity]].
