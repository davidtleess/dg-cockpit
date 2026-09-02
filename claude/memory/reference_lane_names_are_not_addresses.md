---
name: reference_lane_names_are_not_addresses
description: "David's lane names (Fred/Bob/Greg/Lou) do not map stably to session addresses — a cleared session can inherit a name; ask David which session, never infer it from a transcript's self-description"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 63ad1fbb-22bf-497c-99a3-041ec8887667
  modified: 2026-09-02T01:44:09.049Z
---

On 2026-09-01 David said "send to Greg for advice". I grepped transcripts, found a live
session (`davidleess-a0`, sock 1147) whose transcript said "I'm Greg", and sent the DG-128 brief
and the advice request there — then relayed its answer to David as "Greg's advice". David: "wrong
greg" and "i think u sent both your update and your advice question to the wrong session". The
real Greg was `davidleess-0b`. The a0 transcript itself contained the warning: "Greg is gone —
that session was cleared this morning. What's at that address now is a fresh session" that had
taken the name.

Lane names as of 2026-09-01: Fred = me (davidleess-45, DG-128 lane), Bob = tickets lane, Greg =
davidleess-0b (did DG-132 that day), Lou = Codex (on no message bus; David relays by hand).
These WILL drift — a `/clear` or a new terminal reassigns them.

**Why:** a name David uses is a label he assigns to a seat he can see; a session's own claim to a
name is not provenance. Sending a strategy brief to the wrong seat also mis-attributes the
answer, which he then reads as counsel from someone he trusts.

**How to apply:** when David names a recipient (Greg/Bob/Lou), ask him which `davidleess-xx` row
it is unless he has said so in THIS session. Never send on the strength of a transcript's
self-description. When relaying an answer, name the session it came from, not the lane name you
assumed. Related: [[feedback_relay_authority_drift]], [[reference_peer_assumes_your_context]],
[[feedback_parallel_session_coordination]].
