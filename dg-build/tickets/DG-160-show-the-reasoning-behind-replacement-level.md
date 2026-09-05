# DG-160 — Show the reasoning behind replacement level, computed from his real lineup so a wrong derivation is visible

**Layer:** 3 (+6) · **State:** done · **Lane:** Davids-MacBook-Pro-69536 · **DG 3.0** · **product truth / bug detector · small**
**Source:** the unbuilt SECOND HALF of David's 2026-08-31 ranking ruling 5, given directly by him:
*"REPLACEMENT LEVEL — let the derived number stand and show the reasoning. Compute it as an order statistic from
the real lineup structure. 'Replacement TE = the 12th-best TE, because your league starts 12.' Accept the answer
even if the best TE ranks below WR46. Do NOT tune constants until TEs look right."*
The order-statistic half exists in code (`ENGINE_B_VAR_THRESHOLDS`). **The "show the reasoning" half was never
built**, four days on.

**Problem:** his roster row detail prints *"Value over replacement: 2.85"* and nothing else. He cannot see what the
number is measured against — not the rank, not why that rank, not what it resolves to in points per game.

**Why this is worth doing NOW, and it is not cosmetic.** This ruling is a **bug detector**, and having it switched
off cost a wrong constant that survived to six days before kickoff. `ENGINE_B_VAR_THRESHOLDS['WR'] = 53` is
documented as *"12 × 3 = 36 + ~7 flex + buffer"* — built on a **third receiver slot his league does not have**
(the snapshot reads QB 1, RB 2, WR 2, TE 1, FLEX 2, SUPER_FLEX 1). Had the roster printed *"replacement receiver =
the 53rd-best receiver, because your league starts three"*, he would have said "I start two" in August. Build the
thing that would have caught the bug.

**Done looks like:** for each position, the derivation stated the way he stated it — the **rank**, the **reason
from his real starting slots**, and the **points per game it resolves to** — computed from the LIVE league snapshot
rather than from the comment above the constant, because the comment is the thing that was wrong.

⛔ **THE DETECTOR TEST, which this must pass to be worth landing:** *if the derivation were completely wrong, would
this look any different?* Printing "replacement = 8.79 ppg" fails that test — a wrong rank is invisible. Printing
"the 53rd-best receiver, because your league starts 3 WR plus flex" passes it, because the premise is on screen
next to a league that starts 2. **The surface must therefore carry the slot arithmetic, not just the result, and
must compare the shipped rank against the one his lineup implies and say when they disagree.**

⚠ **Where the flex share is an assumption rather than a lineup fact, SAY SO on screen.** The dedicated slots are
unambiguous (12 × QB1/RB2/WR2/TE1 = 84 starters); the 24 flex and superflex places are shared, and how they split
between positions is behavioural, not structural. Measuring it honestly is not currently possible — 52 daily
snapshots are the same lineups re-observed with two edits between them, i.e. **one observation of 21 filled flex
slots, not 1,091**, and pooling them would be pseudo-replication. That uncertainty is exactly what his ruling wants
visible rather than hidden behind a round number.

**Anti-scope, and hold to it.** **Change NO constant. Change NO number he already sees.** This is a derivation made
legible, not a correction — the receiver-threshold fix and the rescale are separate and both wait on him. **If
building this reveals a second wrong derivation, REPORT it, do not fix it.** No retrain, no promotion.

**Verify:** the surface reads the slot structure from the league snapshot, not from the constant's comment; it
states rank, reason and ppg per position; it flags the receiver mismatch on today's data without anyone hard-coding
that mismatch; and it says plainly which part of the derivation is an assumption.

---

**LANDED main `2c606831` 2026-09-04 late (Fred, davidleess-eb d4e70e) — NOT live until the next trunk pull.** Gate 7014 passed / 33 skipped, frontend 95 files / 661 tests. 19 tests.

**THE DETECTOR IS A BUDGET, and my first design was useless.** I began with a per-position bound — "is this rank individually defensible?" — and it flagged NOTHING, because allowing every shared place to go to one position makes almost any rank arguable. The question that bites is whether the four ranks can be true **at the same time**, since they compete for one pool of flex and superflex places. Each rank demands `rank − dedicated − 1` shared places. **His four shipped ranks demand 48 from a league that has 36 — over-subscribed by 12, receiver alone demanding 28.** No split of the flex makes all four true. Arithmetic, not a view about manager behaviour, and nothing in the code is told receiver is the broken one.

**What he would read, from the live snapshot rather than any comment:**
> *"Replacement is the 13th-best tight end, because your league starts 12 tight ends every week. That resolves to 8.99 points a game."*
> *"Replacement is the 53rd-best receiver, because your league starts 24 receivers every week and this assumes 28 more are started in your 36 flex and superflex places."*
> *"Your replacement levels assume 48 players start in a flex or superflex place, but your league only has 36 of them — 28 of that demand is at receiver alone."*

⛔ **I NEARLY SHIPPED THIS AS DECORATION — sixth instance of the day's shape, in my own work.** `run_audit_pvo` returns **no league block at all**, so the panel would have been **silently empty in production while all 19 unit tests passed**. Caught by asking "does the real payload actually carry this?" rather than trusting the assembler test. The reader now falls back to the captured league snapshot, and a test pins the PATH it reads, because a wrong path degrades to a blank panel rather than an error.

⚠ **Quarterback is NOT assumption-free, contrary to what I expected.** Its rank of 25 needs all 12 superflex places to hold quarterbacks; measured on his league, **9 of 11 filled superflex slots do and two hold a back and a receiver**. Even the structural-looking position carries a behavioural premise, so the screen says so rather than implying certainty.

⚠ **The flex split is disclosed as a judgement and NOT invented.** The 52 daily snapshots are the same lineups re-observed with two edits between them — **one observation of 21 filled slots, not 1,091** — so pooling them would be pseudo-replication that looked like evidence.

**Anti-scope held:** no constant moved, no number he already sees changed. Purely additive — two new view models on the roster-audit response. OpenAPI regenerated and verified **additive (126/0, 88/0, 40/0, zero deletions)**, so no landed endpoint was reverted (the DG-023 trap).

**Still open and NOT this ticket:** correcting the receiver threshold (his ruling, scope question with him — fixing it correctly moves running backs by arithmetic since the flex pool is shared), and the rescale (DG-159, waiting on his anchor value).
