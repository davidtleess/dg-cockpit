# Context handoff — finish, hand off, clear, resume fresh. Never compact.

**David's words, 2026-08-15:** "i want every agent to finish their work and create a handoff
around 30% remaining in their context window - then i want them the '/clear' their session -
and a new fresh session to pickup where it left off. this is to avoid context compacting and
low quality work when context gets too low."

## The idea

Compaction degrades silently; low-context work degrades before that. So no lane ever works deep
into its window: at ~30% remaining, the machinery tells it to land the current increment, write
its handoff, and step aside; the machinery then clears the pane and boots a fresh session that
resumes from disk. Quality stays constant because context never gets scarce.

## Why this cockpit is unusually ready for it

- **The instrument exists:** `~/.dg-context/state/dynasty_<w>_<p>.json` + `run/pane-map.json`
  already track per-pane context (the pane-title percentages). The wire reads files; no new
  measurement needed.
- **Handoffs are already the culture:** run state, ledger postflights, AGENT_SYNC banners,
  releases.jsonl — the cockpit's law is that conversational memory dies and disk inherits.
  A context handoff is just a postflight written early.
- **The delivery machinery exists:** the resume-wire daemon already watches state and delivers
  verified messages to panes at turn boundaries.

## The protocol (per lane)

1. **Threshold** — remaining % from dg-context state crosses the floor (default 30%, per-lane
   configurable). Wire arms the lane's handoff order but delivers ONLY at a turn boundary
   (idle prompt, no dialog) — never mid-turn.
2. **Handoff order** — machinery-carried: "context low: land the smallest honest increment,
   write your handoff (ledger postflight + parked-state note; name what is UNPROVEN), reply
   HANDOFF-DONE. Do not start new work."
3. **Verification** — the wire confirms the handoff ARTIFACT exists on disk (ledger entry mtime
   / postflight marker), not just the claim. No artifact → renotify, and past a deadline park
   it for David (BLOCKED tier).
4. **Clear** — wire sends `/clear` (Claude lanes; Codex equivalent needs its own verb + the
   known paste-settle quirk). Verify the fresh prompt arrived.
5. **Rebirth** — wire sends the boot prompt: "fresh session: read AGENT_SYNC banner + your
   ledger handoff + run state; resume exactly where the handoff parks you." SessionStart hooks
   already run the lane's ritual.
6. **Receipts** — same laws as parks: one cycle per threshold crossing, transition-based,
   never lost to one failed delivery.

## Laws

- **Never interrupt a turn.** The threshold arms; the boundary fires.
- **Verify the artifact, not the claim** — the 2026-07-27 lesson, mechanized.
- **The wire clears; the lane never self-clears mid-instruction** (a lane that /clears itself
  on its own judgment can vanish mid-dispute; the wire waits for HANDOFF-DONE).
- **Judge exempt by design** — its charter already bootstraps fresh per ruling. Tower manages
  its own seat. Start with lane 1.1, extend after burn-in.
- **David-gated activation:** touches every lane's session lifecycle — flight-deck/daemon
  changes ship only on his word, reviewed by Tower like the wire was.

## Open questions for the build session

- dg-context state schema: field names for used/remaining (read runtime/lib before coding).
- Codex clear verb + paste-settle handling.
- Threshold tuning: 30% default; judge/Tower exempt; Studio David's call.

## Status

DESIGN COMMITTED, BUILD NOT STARTED. Authored by the helper session at ~10% of its own context
— which is the pitch: by this very protocol, the right move is committing this handoff and
letting a fresh session build it. Practice what it specifies.
