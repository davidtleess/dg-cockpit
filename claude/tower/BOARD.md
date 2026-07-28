# TOWER BOARD — the live state of every lane
# RULE: every line carries WHEN it was verified and FROM WHAT. A line without a fresh
# verification stamp is NOT reportable to David. Rebuild from source, never from Tower's
# own earlier messages — and never from the PREVIOUS Tower's handoff, which is INHERITED
# CLAIM, not fact. That distinction was learned on 2026-07-28 by getting it wrong.
# SOURCES: today's ledger read in full · each lane's complete postflight · the artifact
# itself (git, CI, marker, disk) · Studio from DISK (pane 2.1 retains no scrollback).

LAST FULL REBUILD: 2026-07-28 17:15 ET — CLOSEOUT COMPLETE, all lanes stopped

## LANE: Claude (dynasty:1.1) — implementing lane, spokesperson
STATUS      BLOCKED on the records-commit dialog awaiting DAVID'S KEYSTROKE (Tower's guard
            refuses commits under any standing authority). Postflight already filed.
TODAY       Shipped Thread 1 (Units A/B/D) end to end: RED verified, GREEN, CLEAR, tollgate,
            commit 8975741 under David's fresh word, post-commit audit CLEAR, pushed, CI green.
SELF-DISCLOSED  SIX assertions retracted (incl. "2,233 rows" -> 3,453, which it calls
            conceptually wrong not arithmetic; and "cannot be re-pinned in principle").
            SIX figures checked by nobody else, named individually. THREE authority items
            against itself, incl. writing David-facing copy before reading PRODUCT/DESIGN,
            and `git add` ahead of the commit word.
BACKGROUND  Nothing of its survives the session.
VERIFIED    16:06 from its postflight + git + pane

## LANE: Codex (dynasty:1.2) — review lane
STATUS      CLOSED. Postflight filed; lane stopped.
TODAY       Broke Claude's population figure (2,233 -> 3,453), found the SECOND David-visible
            surface rendering its own false claim, found both decoder holes (duplicate JSON keys,
            non-UTF-8), and issued the enumerated CLEARs plus the post-commit divergence audit.
SELF-DISCLOSED  FOUR retractions, incl. reversing its own reading that Claude could commit under
            David's older word — reversed in the STRICTER direction.
NO SINGLE-LANE FIGURES  claims none of its substantive figures remain unchecked.
BACKGROUND  Nothing survives.
VERIFIED    16:06 from its postflight

## LANE: Gemini (dynasty:1.3) — operations & telemetry, read-only
STATUS      CLOSED. Postflight filed.
COMPLIANCE AUDIT — DIAGNOSED (David released it 15:35; Tower assigned read-only)
   ESTABLISHED: failing since 2026-07-25 (a day EARLIER than Tower's count). Cause is a cold
   SQL-warehouse start >50s; the synchronous call returns non-terminal PENDING/RUNNING, the
   script has no polling/retry and no on_wait_timeout, so it dies after ~250s with an
   "Unknown error" fallback. THE STATIC COMPLIANCE CHECKS THEMSELVES PASS GREEN.
   => it is a BROKEN CHECK, not a product defect. Nothing shipped unguarded in the sense
   that matters.
   UNKNOWN, and correctly left unknown: the warehouse's actual state. Verifying it needed an
   external API call with David's credentials; the lane stopped at the boundary and reported
   the gap instead of routing around it.
ALSO TODAY  the identity-origin answer that CORRECTED Tower's inflated account, cited to exact
            lines which Tower then read directly rather than trusting.
BACKGROUND  Nothing survives. /tmp artifacts it downloaded do NOT survive a reboot.
VERIFIED    16:06 from its postflight + Tower's own read of the cited lines

## LANE: Studio (dynasty:2.1) — outsider design, self-directed. PANE RETAINS NO SCROLLBACK.
STATUS      CLOSED — "Studio closed. Good night." DAVID.md 15:58, STATUS.md 15:59, both
            verified from DISK.
TODAY       Woken into its standing licence at 09:33 after going blocked-idle. Produced the
            day's only crew-independent work: a craft-gate instrument that reproduces David's
            own past verdicts; LIVE-APP findings (30 failed image requests on every load of the
            opening screen; three screens with no charts); its own type scale fixed after
            self-criticism; and a named defect class — spacing logic keyed to a hard-coded font
            size passes every check until someone touches the type.
FRESH EYES  It found the product's own visual-craft audit files and DELIBERATELY DID NOT OPEN
            THEM, unprompted, because correlating its instrument with ours is what it is there
            not to do. Guard this behaviour.
TIER GRAIN  Answered COARSE (Tower's answer, at David's direction, explicitly labelled as NOT
            David's taste). Studio then TESTED it and broke the QB exception Tower had attached,
            with a better argument: a fine boundary sits on ~0.5pt while a real revision moves a
            player ~7.5pt, so distinct is not resolved. Tower's reasoning was the weaker half.
VERIFIED    16:06 from disk + visible pane

## PRODUCT / INFRA
GIT         VERIFIED 17:14 — THREE commits, ALL on origin/main, local and remote LEVEL:
              8975741 Units A/B/D (code)  · CI GREEN · post-commit divergence audit CLEAR
              38a07c9 session record + 54 evidence artifacts · CI GREEN
              c2afcd2 closeout postflights (both lanes' two-question answers) + CI result
            Verified by `git branch -r --contains` and by reading the REMOTE copy: 56 evidence
            files and 5 closeout-question sections present on origin/main. The durability gap
            that opened this closeout is CLOSED.
            ⚠ ONE uncommitted path remains, deliberately: msg_tower_final_PARKED.md
              sha256 46127cf2a7a1… — the lane's sign-off message, written after the final flush.
              Trivial content; hashed here so the next Tower can detect drift.
CI          `CI` green on 8975741. `Codex Compliance Audit` RED since 2026-07-25 — now DIAGNOSED
            as a broken check (see Gemini above), not a product defect.
DATA JOBS   ran ON TIME today (09:00-09:30). Yesterday's 10h sleep-delay did not repeat.
BACKUP      data backup run 20260728T141500Z: 300 files, ~1.24 GB, drill passed, 0 failures.

## DAVID'S OPEN BOARD
1 THE 113 "Modeled" rows — shown as Modeled with no value at all. Tower's read: the biggest
  remaining honesty defect, and the one David is most likely to care about.
2 COVERAGE-THRESHOLD POLICY — how much missing data should stop a refresh. Genuinely his;
  nobody invented it in his absence.
3 UNIT C — the false on-screen wording. Parked mid-review, shares no commit.
4 The non-player sentinel ("0") answering as if it were a person.
5 GEMINI DECISION — overdue since ~07-24. Today's record: narrow scope, high reliability,
  and it corrected Tower rather than agreeing with it.

## TOWER'S OWN OPEN DEFECTS
- Everything Tower says to DAVID bypasses every guard Tower owns. turn-brief.sh narrows the
  state half; nothing covers the PROVENANCE of a claim. Named in SKILL.md Part V.
- `--closeout-push` still relaxes `git commit`, broader than the charter line granting PUSH.
- contamination guard false-positives on the literal word "independent" near any figure.
- open-asks REPLY pattern only recognises a Tower marker; asks answered lane-to-lane need
  explicit retirement in RESOLVED-ASKS.md.
