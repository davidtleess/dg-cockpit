---
name: reference-peer-assumes-your-context
description: A cross-session peer can assert you are mid-task on work your session never held; check your own transcript length before accepting the premise.
metadata: 
  node_type: memory
  type: reference
  originSessionId: 0d30ce38-6359-4ba2-9420-29f91795414f
  modified: 2026-09-01T09:53:34.955Z
---

A `<cross-session-message>` peer routinely addresses a session by socket and assumes
**continuity that the socket does not guarantee**. On 2026-08-31 20:34Z a session was
`/clear`ed; within six minutes **two different peers** (`davidleess-45` at 77417.sock,
`davidleess-0b` at 32886.sock) both opened with "your closeout" — one with "STOP, your
closeout is drafting against a stale list." That session had never held a closeout. Its
whole transcript was 44 records, all postdating the clear.

**The five-second check, before accepting any premise a peer hands you:**
```
python3 -c "print(sum(1 for _ in open('~/.claude/projects/<proj>/<session-id>.jsonl')))"
```
A short transcript whose first record is the `/clear` means you own none of the history
the peer is attributing to you. Say so plainly and point them at the real owner — find it
by grepping the sibling `.jsonl` files for the work's distinctive term and taking the
highest hit count.

**Why it matters:** accepting the premise means editing a document you cannot see, or
worse, taking a live code change (here, the `engine_b_service.py` fail-open) into a
serving path with zero context on the chain it might collide with. Declining is not
declining the work — it is refusing to act blind.

Two related traps seen the same morning:
- A peer's **timestamps can be badly wrong** while its quotes are verbatim-correct. One
  reported David's ruling as "~11:05 local" when the record was stamped 16:39 EDT, and
  built a "by 11:30" deadline on that bad anchor. Verify the clock separately from the
  content; see [[feedback_check_when_not_just_what]].
- ⚠ **THE MECHANISM, identified 2026-09-04 (4th instance, all the same direction).**
  Transcript `timestamp` fields are **UTC with a `Z`**, and the peer is reading them as
  local. Greg cited David's 08-31 rulings as "14:19:55 ET" and "14:53:52" from records
  stamped `2026-08-31T14:19:55.818Z` — actually **10:19:55 and 10:53:52 EDT**, four hours
  earlier, turning "that afternoon" into "that morning". Every one of the four errors ran
  the same way and the quotes were verbatim-right every time.
  **Calibrate in five seconds** rather than arguing: take the newest `timestamp` in any
  transcript and compare it to `date`. On 09-04 that was `2026-09-05T00:33:50Z` against a
  wall clock of `20:33:58 EDT` — the offset falls straight out. Correct the hour, keep the
  finding.
- Peer **content** can still be exactly right. Both peers' quotes of David checked out
  verbatim against the transcript. Verify, do not dismiss — see
  [[feedback_relay_authority_drift]] and [[reference_midturn_messages_invisible]].
