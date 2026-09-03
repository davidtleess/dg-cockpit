---
name: feedback_check_when_not_just_what
description: "Reading WHAT an artifact says without establishing WHEN it arrived — the single most repeated error shape; the settling lookup is always cheap and always on disk"
metadata:
  type: feedback
---

**An artifact's as-of is part of its claim. Read WHEN it arrived, not only WHAT it says.**

2026-08-31, four agents working in parallel produced **seven** instances of one shape in a single
morning. A representative pair:

- A lane grepped for a function, found it, and reported that "someone had already built this — the
  morning's survey was stale." `git log -S "<name>"` dated the commit to **sixty seconds earlier**,
  by the agent it was talking to, with the author in the commit message. The survey had been right.
- A lane inferred "you pushed this" from a synced tree. The reflog said another agent had pushed it.
  Sequence is not evidence.

**Why it recurs:** the reasoning is genuinely good and the premises are genuinely true. "The code is
present" and "the survey said it was absent" really do imply staleness — unless the code is a minute
old. The inference feels like knowledge, so the cheap confirming lookup never gets run.

**2026-09-02 evening, my own work this time:** I wrote "Built 15:40–16:20" in a closeout for work whose
worktree git created at 20:32 and whose commit is stamped 20:39. No source — I never ran `date`; the
window was invented from a feeling of how long it had taken. Two independent auditors caught it
(the branch reflog, the .venv birth time, the machine clock all agreed). The same draft called a
writable symlink into the live 1.4 GB capture DB "read-only" because a rule said *don't write* — a
rule about me became a property of the file.

**How to apply:**
- **Before writing ANY time about your own work, run `date` and `git log -1 --date=iso`.** Your sense
  of when you did something is not a clock. A board row's timestamp is what later sessions sequence
  events by.
- A constraint you are under ("read-only for me") is not a property of the thing ("read-only").
- Before reporting that something already exists, was already fixed, or is stale: `git log -S "<the
  symbol>"` or `stat`. **Five seconds.** Do it before speaking, not after being contradicted.
- Distinguish *sequence* from *evidence*. "My command ran and the state is now correct" does not
  establish that your command caused it.
- **Documenting an incident is not measuring what it cost.** A careful incident note in a header
  comment described a killed run; nobody asked what it left behind, and 1.9GB sat in that exact
  directory for a month. A written-up incident reads as a closed one.
- State what a measurement COVERS. Two agents reported 4.3GB and 7.8GB for the same directory; both
  were right, about different sets (one excluded an in-flight run).

Related: [[reference_midturn_messages_invisible]], [[feedback_relay_authority_drift]],
[[reference_nflverse_unchanged_trap]].
