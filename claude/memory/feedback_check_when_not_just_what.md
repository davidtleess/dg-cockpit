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

---

## ⭐ 2026-09-04 — THE MECHANISM BEHIND THE CLOCK ERRORS IS NAMED, AND IT IS ONE CHARACTER

Five times now a lane has stamped a time roughly four hours off, always in the same direction, always with the
substance right. Bob found the cause on 09-04: **transcript `timestamp` fields are UTC (`...Z`), and they were
being read as local and re-labelled "ET".** In EDT that is a four-hour forward error, which is exactly enough to
move a morning ruling into the afternoon and quietly rewrite the order of a day's events.

Four fresh instances were introduced and corrected within the same hour on 09-04 — a ruling recorded at
"14:19 ET" was made at 10:19, a `/goal` at "16:00 ET" was typed at 12:00. The narrative built on top of one of
them ("he ruled it that afternoon") was already wrong before anyone read it.

**How to apply — mechanical, no judgement required:**
1. A stamp ending in `Z` is **UTC**. Never label it ET, EDT or "local" without subtracting.
2. **Calibrate rather than assume the offset.** Bob's method: take the newest stamp anywhere in the transcripts
   and compare it to `date` on the wall clock. He measured 2026-09-05T00:33:50Z against 20:33:58 EDT. That
   survives daylight saving, a travelling laptop and a machine with a wrong timezone — arithmetic on a
   remembered offset does not.
3. When quoting a time to David, prefer **"that morning" / "the same day"** over a precise hour unless the hour
   is doing work. Most of the time it is not, and a wrong hour discredits a paragraph that is otherwise correct.

Note the shape: five errors, substance right every time, only the hour wrong. That is the signature of a
systematic conversion fault rather than carelessness, and systematic faults are fixed by a rule, not by care.

---

## ⭐ 2026-09-05 — THE GENERAL FORM: one source cannot separate the states you care about

Fred's wording, and it subsumes everything above: **a claim about state needs two sources whenever one of them
cannot distinguish the states you care about.**

The instance that produced it: he reported "the 09:00 chain has not run, and if anything goes wrong it will
consume the morning" **at 06:50** — the job was not due for another two hours. The runtime artifacts were stamped
the previous day at 14:00, which is exactly correct at that hour. **A not-yet-due scheduled job and a failed one
are byte-identical in the artifact.** Only the schedule against the wall clock separates them, and that is one
`date` call. He had in fact checked the clock and then described it in risk language anyway — which is worse than
not checking, because it launders a known-fine state into a live concern and spends someone else's attention.

Same shape, other costumes, all already in the record:
- **stale log read as live evidence** — the "grading harness crash" that was a 2026-07-07 pre-migration trace
  (frame paths, line numbers and a later fix commit all separated them; the log alone could not).
- **working tree vs ref** — the artifact said one thing, `git log` said another.
- **a deliberate carry vs a forgotten one** — byte-identical in the tree; only the commit body and the board row
  separate them ([[feedback_relay_authority_drift]]).
- **"no consumer" vs "unfinished"** — the code cannot tell you which.

**How to apply:** before asserting a state, ask *what else would produce exactly this observation?* If a benign
cause and an alarming one produce the same bytes, you do not have a finding — you have one source. Name the second
source that separates them and run it. It is almost always `date`, `git log -1 --format=%B`, `stat`, or the board.

And the corollary about tone: **do not describe a state in risk language when you have already established it is
fine.** Attach the reassuring fact in the same sentence as the observation, or leave the observation out.
