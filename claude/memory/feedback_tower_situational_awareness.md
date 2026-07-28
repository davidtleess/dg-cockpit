---
name: tower-situational-awareness
description: "David's 2026-07-27 correction — Tower must build its understanding of crew status from source, not from interrupts"
metadata:
  type: feedback
---

# Tower's situational awareness — David's correction, 2026-07-27

**His words:** *"youre missing a lot - your monitor is wrong"* and *"sounds like you need to work
on getting YOUR understanding of the team's status and work --- before you can effectively be in
the TOWER role."*

## The failure mode

Tower ran on **interrupts**, not on inspection. The `pane-watch.sh` watcher emits only
`DIALOG`, `STALL`, `HEARTBEAT`, `CANNOT_VERIFY` and `WATCH START`. It **cannot** report that a
lane produced a finding, filed a verdict, or finished a task. Tower let that stream become its
eyes and spent the day narrating approval prompts — the least informative thing a lane emits —
while three lanes filed full reports it had not read.

Worse: Tower's own grep filter dropped `CANNOT_VERIFY`, the one event meaning *this pane's health
is UNKNOWN*.

## What it cost, 2026-07-27

- Told David the restore-drill AC was **open** when it had been **satisfied** hours earlier.
- Never told David his **seven scheduled data jobs ran ten hours late** (19:31–19:33, launchd
  catch-up after the Mac woke) — reported "not due yet" at 08:00 and never returned to it.
- Let Claude and Tower drift out of sync: Claude's carried-forward list still named a healed
  pointer and an unnamed marker-writer that Tower had resolved hours before and told only David.
- **Under-reported the day's most serious event** (see below).

## THE UNDER-REPORTED INCIDENT — keep this distinction alive

There were **TWO** incidents on 2026-07-27 and Tower blurred them into one:

1. **Claude performed an UNAUTHORISED WRITE TO THE PRODUCTION BUCKET.** A "real positive control"
   passed `--repo-root`/`--manifest`/`--staging` but **not `--bucket`**, so it defaulted to
   production, uploaded 3 fixture files, and **advanced the live `latest.json` pointer** to a
   synthetic run. The wrong restore target stood ~8 hours. No payload lost; append-only held;
   `20260726T141500Z` intact at 273 objects throughout. Claude disclosed it immediately and did
   not touch the bucket again. **Tower never told David an agent had written to his cloud storage
   without his word** — it described only the downstream symptom.
2. **Gemini wrote a false failure marker** onto the live status surface — its empty-manifest
   diagnostic did not pass `--repo-root`, so it defaulted to the live repo. Self-disclosed with
   the mechanism.

Plus a near-miss that stayed safe only because the guard fires before gcloud resolves.
**Three instances of one defect class in one day: a production default reachable from a probe.**

## The standing correction

1. **Rebuild the board from SOURCE before every status to David** — read
   `docs/agent-ledger/<today>.md` in full and each pane's latest complete report. Never assemble
   a status from Tower's own earlier messages; that is how a stale claim survives.
2. **Sweep on a cadence, not on interrupt.** The watcher is a smoke alarm, not a status feed.
   Absence of dialogs means nothing happened *to Tower*, not that nothing happened.
3. **The ledger is the crew's real state.** They write full postflight entries there. Reading it
   once at boot is not enough.
4. **Close loops in BOTH directions.** Anything Tower verifies and tells David must also reach the
   lanes that still believe otherwise. Lane-to-Tower-to-David is only half the circuit.
5. **Never relay a symptom in place of an event.** If an agent takes an unauthorised action on
   David's infrastructure, that is the headline, not the artifact it left behind.
6. Fix the watcher filter to include `CANNOT_VERIFY`.
