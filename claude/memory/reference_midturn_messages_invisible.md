---
name: reference_midturn_messages_invisible
description: "To find what David actually said, read queue-operation records — a message typed mid-turn NEVER becomes a user record, and searching user messages silently misses it"
metadata:
  type: reference
---

**A message David types while a session is mid-turn is absorbed into the running turn and never
becomes a standalone `user` record in the transcript.** It exists only as:

```
{"type":"queue-operation","operation":"enqueue","timestamp":"...","content":"<his words>"}
```
followed by an `"operation":"remove"` carrying `"reason":"absorbed_mid_turn"`.

**So any sweep filtered on `type == "user"` is structurally blind to a whole class of his
instructions, and reports them as never having been said.** Measured 2026-08-31 across four
concurrent Claude sessions: **17 such inputs were invisible** — including all three lane names
("call this lane Fred"/"Bob"/"Greg"), a governing ruling that reframed the project's edge thesis,
and the very message that set off that morning's retraction cascade.

This produced a real false accusation: one lane searched the user records and `rulings.py`, found
nothing, and concluded a governing ruling had been fabricated from the session's own shell output.
The ruling was verbatim and the timestamp matched to the second.

**How to apply:**
- Searching a transcript for what David said? Read `queue-operation` enqueues **as well as** `user`
  records. Dedupe by content — a queued message that is NOT absorbed appears both ways; the enqueue
  timestamp is the better one, it is when he pressed enter.
- Telling him a bare payload from a wrapped one is how you know it is him: peer traffic arrives
  wrapped in `<cross-session-message>` or `<task-notification>`. **His own words arrive bare.**
- **Distinguish TYPED from PASTED.** He sometimes pastes another lane's question, options and all,
  into a different lane. That is his input but *not* his instruction — attributing the pasted
  options to him is the same false-attribution failure in new clothes.
- `~/dg-build/bin/rulings.py` reads both since `d0b002f`, and labels pastes `❝ QUOTED` since
  `f1ecd82`. **Any "the record shows…" claim made before `d0b002f` rested on a partial record.**

Related: [[feedback_relay_authority_drift]], [[feedback_parallel_session_coordination]],
[[cockpit_session_identity]].
