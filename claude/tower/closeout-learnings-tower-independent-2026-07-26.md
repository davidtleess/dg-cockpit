# Tower's independent closeout harvest — written 2026-07-26 BEFORE seeing the crew's

Sealed deliberately. The crew was ordered to harvest the 2026-07-25/26 true-close independently and
Tower withheld this list so the comparison is a real check rather than an echo. Any item here that is
missing from theirs is a gap Tower names; any item in theirs that is missing here is a gap Tower missed.

Source evidence: `docs/agent-ledger/2026-07-26.md` (Codex + Claude entries 00:15–08:46),
`docs/agent-ledger/2026-07-25.md`, `~/.claude/tower/SESSION-RECORD-2026-07-25.md`.

## What the true-close actually had to rescue

1. **"Closed" was declared while the PUSHED state was red.** Local gates were green; `origin/main` CI
   was failing on three runs and the fix existed only in a working tree. A closeout that verifies the
   local tree verifies the wrong thing. **Rule: a session is not closed until the pushed state passes
   its own gate. Local green is not evidence about origin.**

2. **Durable conclusions pointed at session-scoped storage.** Reports, a reproducer and six screenshots
   lived in `/tmp` and were cited by documents intended to outlive the session. They were promoted only
   because someone attacked for it. **Rule: closeout sweeps every durable document for session-scoped
   or machine-scoped locators and fails if one is found.**

3. **A promoted reproducer only ran on this machine.** Hardcoded `/Users/davidleess/...`, a sibling
   checkout, and gitignored runtime inputs. **Rule: an artifact is durable only if it derives its own
   root, takes its inputs explicitly, and refuses on missing or mismatched inputs.**

4. **An unchanged-hash claim was made after the locators had been edited, then withdrawn.** Correct
   behaviour on the withdrawal; the claim should not have been made. **Rule: assert byte-identity only
   from a hash computed after the last edit, never from the intent to copy unchanged.**

5. **"Backup ran" was nearly allowed to stand for "the data is protected."** The marker was true and
   narrow: it covers the current manifest only, while four named irreplaceable files and the
   league-snapshot family sit outside it. **Rule: every backup statement at closeout names what the
   backup does NOT cover, or it is not made.**

6. **State-document METADATA rotted while its body was correct.** The DG2 backlog's cover page still
   described the boundary rule as unsettled, pointed at a rejected proposal, and listed resolved
   decisions as open — after Ruling K had landed. Reviews read bodies; nobody read the header.
   **Rule: closeout re-reads the head matter of every live state document against the day's rulings.**

7. **Silent non-delivery is the dangerous wire failure.** A review packet was parked for Tower and never
   carried; the gap was found by another lane's probe, not by Tower. Both sides believed the other had
   it. **Rule: a carried message is not delivered until the recipient says so.**

## What WORKED and must be preserved, not just the failures

8. The postflight shape the crew already uses is good and should be codified rather than reinvented:
   approved-but-uncommitted · half-done · background work by name · **never-told-to-David** ·
   product-boundary restatement. The "never told to David: none knowingly" line is the one that
   surfaces omissions, and it earned its place.

9. **The adversarial closeout worked.** Claude's durability attack found the `/tmp` citations, the
   machine-bound reproducer and the omitted CI-red board state. A closeout reviewed by the lane that
   performed it would have shipped all three. **Independent review is part of closing, not part of
   building.**

10. **Restating the product boundary at closeout** ("the QB-1 study has not run; H2 remains UNDER TEST")
    stops a hypothesis drifting into a finding across sessions. Keep it verbatim as a required line.

## Tower's own closeout ritual — the amendments these imply

- Step 2 (crew flush) must require the **pushed** gate, not the local one, before the debrief is written.
- Step 3/4 must include the durability sweep: no durable document cites a session-scoped path.
- A new step: **state-document head-matter check** against the day's rulings.
- The debrief's backup line must state coverage gaps, never bare "backup ran."
- Studio's closeout already flushes learnings to `DAVID.md`; add the same durability sweep, since Studio
  writes prototypes and notes to disk that its next session must be able to open.
