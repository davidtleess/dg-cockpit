# TOWER HANDOFF — written 2026-08-08

**TREAT THIS AS INHERITED CLAIM, NEVER AS A SOURCE.** Every line is a lead to check against the
artifact. The previous handoff was stale the moment it was written, twice.

## FIRST: your role changed on 2026-08-08. Read the charter before anything else.

`~/.claude/agents/tower.md` was rewritten. **Tower is no longer an orchestrator.** No relay, no
crew approvals, no gating, no closeout ushering, no lane-status reporting. If a prior document tells
you to do any of those, it is historical — do not act on it.

You are the steward of Dynasty Genius's operational health and David's spokesperson for it:
**data fresh · models honest · truth when he sits down**, plus **Studio's bridge** and **his dated
commitments**. Full spec and its evidence: `~/.claude/tower/SPEC-2026-08-08-tower-role-v2.md`.

**Rule 1, David's word:** never invent product features. Every statement about the product is
labelled **VERIFIED**, **PROPOSED PRODUCT CHANGE**, or **RELAYED PROPOSAL**.

**You are on a two-week trial from 2026-08-08.** The kill criterion is in the charter. Read it.

## THE BOARD

Live product health, verified 2026-08-08 with commands recorded:
`~/.claude/tower/PRODUCT-HEALTH-BOARD.md`. Re-verify before quoting any of it — the whole point of
Rule 2 is that yesterday's measurement is not today's fact.

**The three findings that define the current work:**
1. `/api/health` has read `degraded` for ~24 days because two declared artifacts have no scheduled
   producer. The amber light carries no information.
2. `feature_refresh` grades `fresh` while its own provenance records four of five upstream streams
   falling back to cache and one loading empty.
3. **Nothing has ever compared a prediction to an outcome.** The scorer's loaders `return []` while
   500,303 prediction snapshots sit in `model_forward_capture.db`. From September it will report
   healthy all season while grading nothing.

## OPEN WITH DAVID — in dependency order

1. **The eight PROPOSED PRODUCT CHANGES** on the board. None started, none authorized. Tower's
   recommended first: wire the outcome scorer to the existing snapshots — it is the only path to
   model honesty and to any drift signal, and its statistics are already built.
2. **Grounding-layer GO/NO-GO — DUE NOW.** His charter edit of 2026-07-22 gated it to "~August 2026"
   with an instruction to raise it proactively. NO-GO is a legitimate outcome.
3. **The Gemini seat** — contribution record, due ~2026-07-24, two weeks overdue.
4. **Crew-facing documents still describe the old Tower** and need his word plus the crew's hands —
   `AGENT_SYNC.md` (TW29-WALL-35 escalation path), `docs/governance/02-agent-operating-loop.md`,
   `.claude/skills/cockpit-closeout/SKILL.md`. Tower must NOT edit these; they are product-repo
   commits.
5. **The SessionStart and UserPromptSubmit hooks** still run orchestration-era instrumentation
   (`watchdog.sh`, `turn-brief.sh`). Changing them is a settings change — his word only.
6. **`~/dg-cockpit/backup.sh` was edited 2026-08-08** to cover the new skill directory; the previous
   hardcoded path would have left the new persona outside the backup. **It has NOT been run or
   pushed** — that needs his word.

## STUDIO

Rest through early August was **David's deliberate choice** while the crew built Layer 1 — not
neglect. Working under its own licence overnight 08-07/08. Disk is the only truth (pane 2.1 retains
almost no scrollback). Last proposal 2026-07-30; `DAVID.md` last written 2026-08-01 15:27.
The ~2026-09-01 fresh-eyes review is live.

## TOWER'S OWN ERRORS THIS SESSION — recorded because the next Tower should know

1. Read eight quiet days in Studio as neglect without checking; David corrected it — the rest was
   intentional. **Rest is fine; blocked-idle is the waste.**
2. Reported that Studio was actively working as though it were valuable news. It was status, not
   value. David: *"thats marginally - if that - valuable."*
3. **Blurred the product-change line inside the pitch for this role** — four unbuilt changes stated
   as duties. David caught it and made the labelling rule binding. This is why Rule 1 exists.
