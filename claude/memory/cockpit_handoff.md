---
name: cockpit-handoff
description: "Tower's parked board — durable snapshot of what every lane has parked and what David owes, updated at significant state changes"
metadata:
  node_type: memory
  type: handoff
---

# Cockpit handoff — 2026-07-28. THE DAY THE IDENTITY BLACKOUT RISK WAS CLOSED, AND THE DAY DAVID CAUGHT TOWER FOUR TIMES.

## ⭐ FIRST THINGS, NEW TOWER — IN THIS ORDER

1. **Invoke `cockpit-observation` BEFORE anything else.** It now has FIVE parts. Part V was written
   today and is the one that matters most: it classifies Tower's failure modes and names the hole
   that scripts cannot fill.
2. **Read `~/.claude/tower/BOARD.md`** — rebuilt from source at 16:06 today.
3. **⚠ THIS FILE IS INHERITED CLAIM, NOT VERIFIED FACT.** On 2026-07-28 Tower repeated a story from
   the previous handoff — that Gemini had made a sweeping "identity finding" — and used it to frame
   David's first decision of the day. **Gemini's own record says no such finding exists.** The real
   origin was one narrow fixture-shape defect. **Treat every line below as a LEAD TO CHECK.**
   The board law already said Tower's own earlier statements are never a source; that now explicitly
   extends to the PREVIOUS Tower's.
4. `~/.claude/tower/DECISIONS.md` — every ruling with the authority it rested on, including today's
   failures.

## WHAT SHIPPED — commit 8975741, on origin/main, CI GREEN, post-commit audit CLEAR

**Units A/B/D of the identity honesty work.** In plain terms:
- The daily refresh can no longer publish a model-less board in silence. If the gsis→Sleeper
  crosswalk is missing or corrupt it now ABORTS and says why.
- Every player dropped at the join is counted and NAMED. Today: Nick Kallerup, Ke'Shawn Williams.
- The crosswalk (3.8 MB, previously gitignored and backed up NOWHERE) is now tracked in git.
  Payload verified out of the committed tree: `8ed4b67578d06a24527356f9f355ed97f12be827e34885270c0b1d28c079f593`.

Full suite 3,949 passing. Verified independently on live data: 503 predictions → 501 joins, 2 orphans.

## ✅ HOW THE DAY ENDED — DURABLE, VERIFIED 17:14

**THREE commits, all on `origin/main`, local and remote level:**
- `8975741` Units A/B/D — the code. CI GREEN. Post-commit divergence audit CLEAR.
- `38a07c9` session record + 54 evidence artifacts. CI GREEN.
- `c2afcd2` closeout postflights — **both lanes' answers to the two questions** + the CI result.

Verified by `git branch -r --contains` AND by reading the REMOTE copy: 56 evidence files and 5
closeout-question sections present on `origin/main`. **The durability gap that opened this closeout
is closed** — today's code AND its reasoning are both off the single machine.

**One uncommitted path left deliberately**, hashed so drift is detectable:
`docs/agent-ledger/evidence/2026-07-28/msg_tower_final_PARKED.md` — sha256 `46127cf2a7a1…`, the
implementing lane's sign-off written after the final flush. Trivial content; sweep it tomorrow.

**Cockpit backup:** 32 Tower files byte-identical to the backup copy and present on its remote —
coverage verified, not merely execution.

**Closeout gate:** `closeout-check.sh` FAILED first on staleness — BOARD.md and this handoff were
older than the last commit. That is the same defect David caught on 2026-07-28 07:53. Both rewritten
and re-run. **Do not skip that check; it is the one that catches a tidy-looking lie.**

## 🏈 DAVID'S OPEN BOARD — 5 items

1. **THE 113 "Modeled" ROWS.** 113 of 581 modeled rows carry a null score AND null xVAR while the app
   labels them **"Modeled"**. Claude's read, and Tower agrees: **worse than the defect we fixed** — a
   wrong reason misinforms; claiming the model produced a result when it produced nothing
   misrepresents the model itself. Untouched. **Tower's recommendation: this is the next thing.**
2. **COVERAGE-THRESHOLD POLICY.** `>=1 join` is a 1-of-503 floor. Three candidate policies exist; one
   (fail-on-any-orphan) **would stop today's refresh**, since 2 orphans exist now. An engineer nearly
   chose this; it was pulled and left to David. Nothing asserted in either direction.
3. **UNIT C — the false on-screen wording.** THE THING THAT MOST LOOKS LIKE A LIE IS STILL ON HIS
   SCREEN: player cards say "No active model score for this player category" for **3,453 rows across
   TWO surfaces** whose category IS modelled. Parked mid-review, shares no commit. `PlayerInspector.tsx`
   renders its own claim independently, so an API-only fix is not enough.
4. **The non-player sentinel** — Sleeper id `"0"` answers HTTP 200 as if it were a person.
5. **GEMINI DECISION — overdue since ~07-24.** Today: narrow scope, high reliability, and it CORRECTED
   Tower's account rather than agreeing with it. Diagnosed the compliance audit cleanly and stopped at
   a boundary rather than routing around it.

## CI — the compliance audit is DIAGNOSED, not fixed

**`Codex Compliance Audit` has been RED since 2026-07-25.** Cause: a cold SQL-warehouse start >50s;
the synchronous call returns non-terminal PENDING/RUNNING, the script has no polling/retry and no
`on_wait_timeout`, so it fails after ~250s with an "Unknown error" fallback. **The static compliance
checks themselves PASS GREEN — it is a broken check, not a product defect.** Unknown and correctly
left unknown: the warehouse's real state (needed an external API call with David's credentials).
**A fix has NOT been authorised.**

## ⚠ TOWER'S FAILURES — 2026-07-28. David caught four of them.

1. **Watchers were never started at boot.** Lanes sat blocked while Tower said "nothing needs you".
   David: *"can you not see gemini needs approval on something?"*
2. **TOWER-1 failure 7 was never actually fixed.** The dialog key hashed only the boilerplate, so every
   Studio prompt keyed identically and the watcher went silent for that pane permanently. **A green
   test covered a live defect for three days** because the test used a shape the cockpit never emits.
   David found it: *"figure out why your skill did not see that claude and studio are waiting."*
3. **THREE false DELIVERED verdicts**, one root cause, three fixes, each correct and each
   insufficient — all asked *where do I look*, none asked *when*. One carried David's commit
   authorisation and left it unsent while both lanes idled.
4. **A fix's JUSTIFICATION was never tested** ("a blocked pane's contents are static" — a blinking
   glyph froze a lane within the hour).
5. **Relayed unreviewed claims as fact, twice** — the crosswalk provenance, and the inherited
   "Gemini identity finding". Both corrected to David.
6. **Told David the population was 2 players.** It was 3,453. Wrong by ~1,700x, and it went into his
   decision.
7. **Never swept the crew's "NEVER TOLD TO DAVID" section** until an accident surfaced it. It held a
   live item: an automation of Claude's had edited another lane's evidence file (reverted, net-zero).
8. **Approved a credentials-file read without thinking.** No secret was in it; the judgment was still
   wrong.

**What held:** every authorisation-shaped ghost refused. No foreign keystroke. Every gate-shaped
dialog — commit, push, launchctl mutation, credential path — went to David.

## WHAT WAS BUILT TODAY (all tested, all backed up)

| artifact | what it prevents |
|---|---|
| `bin/watchdog.sh` + SessionStart hook | watchers silently not running; survives Tower's memory dying |
| `bin/say-clear.sh` | "clear/quiet/nothing needs you" as an assertion |
| `bin/turn-brief.sh` + UserPromptSubmit hook | **the board is measured BEFORE Tower speaks** — the answer to "no script can force Tower to run it" |
| dialog-key widening + normalisation | the watcher going permanently silent on a pane |
| composer-exclusion + settle check in `pane-send.sh` | false DELIVERED (three fixes; see failure 3) |
| credential-path refusal in `pane-approve.sh` | approving a secret into a transcript |
| edit-target guard + launchctl allowlist | false refusals freezing lanes; settings/plists still refused |
| `RESOLVED-ASKS.md` | retiring a false alarm without weakening the alarm |

Suite: 21 observation · 16 pre-send · 6 open-asks · 12 guard-fix · 5 send-composer · 4 dialog-key.

## THE HOLE THAT REMAINS — read SKILL.md Part V

**Everything Tower says to DAVID bypasses every guard Tower owns.** `presend-check.sh` governs
messages to lanes; nothing governs the channel that actually shapes his decisions. Three of today's
worst errors travelled through it. `turn-brief.sh` narrows the STATE half; nothing covers the
PROVENANCE of a claim. **For the residue, David's correction is the only check — and that is a bad
design, stated plainly rather than dressed up.**

## STANDING RULES ADDED TODAY
- An unreviewed lane finding reaches David LABELLED unreviewed, or it does not reach him.
- The handoff file is inherited claim, not fact.
- Build keys from what VARIES; test against shapes the system EMITS, never invented ones.
- A fix's stated justification is a claim and needs testing like the fix.
- When two instructions conflict, the one that NARROWS authority wins until David says otherwise.
- Sweep "NEVER TOLD TO DAVID" at boot and at closeout.
- Stamp times from `date`, never from another lane's header (the crew's headers drifted ~25 min).

## STANDING AGENDA
- **~Aug 2026 grounding-layer GO/NO-GO** — gated on BUILD-1 + four open questions. "Don't build"
  remains a legitimate outcome.
- **~2026-09-01** — Studio freshness review (LIVE; see below), crew re-organisation settled before
  NFL Week 1.
- Untouched: `REG-STATUS-1`, `H2-AUDIT-1`, `VALUATION-IN-GIT`, N5 capture, `DEPPIN-1`, the NumPy RNG
  reproducibility ticket (**blocks QB-1**). **H2 QB rushing remains UNDER TEST; the QB-1 study has
  not run; there is no result.**

## STUDIO — the freshness review is NOT yet due
Today it produced the only crew-independent work: a craft-gate instrument that reproduces David's own
past verdicts on his surfaces; **live-app findings — 30 failed image requests on EVERY load of the
opening screen, three screens with no charts**; and its own type scale fixed after self-criticism.
**It found the product's own visual-craft audit files and deliberately did not open them**, unprompted,
to protect its independence. It also declined to show David finished work because he had an unanswered
question from it. **Fresh eyes are intact. Do not hand it our roadmap.**
Its tier-grain question was answered COARSE (Tower's answer at David's direction, explicitly labelled
as not David's taste) — and Studio then broke the QB exception Tower attached, with a better argument.
