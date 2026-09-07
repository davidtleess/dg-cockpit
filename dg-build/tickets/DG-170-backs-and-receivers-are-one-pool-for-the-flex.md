# DG-170 — Backs and receivers are ONE pool for the flex, so the thresholds cannot over-subscribe

**Layer:** 3 · **State:** open · **Lane:** — · **DG 3.0** · **replacement level**
**Source:** Dynasty Nerds (Liberman 2022): *"We typically perform this analysis for each position except for RB and
WR. Due to the many flex spots, we will combine these two positions."* Filed by Greg 2026-09-06.

---

## THE DEFECT THIS RETIRES, which is ours and was measured

DG-160's detector found the four shipped replacement ranks **cannot all be true at once**: they demanded **48 flex
and superflex places from a league that has 36**, receiver alone demanding 28. No whole-number split of the flex
makes all four true. That is arithmetic, not a view about how managers use their flex.

**Combining backs and receivers into one pool removes the allocation problem by construction.** There is nothing
left to over-subscribe, because the shared slots are counted once against a shared population instead of being
divided between two positions by an assumption.

**His league:** 2 dedicated RB + 2 dedicated WR + 2 FLEX = **6 shared slots × 12 teams = 72**, so the RB/WR
replacement is the 73rd best back-or-receiver. (⚠ Sleeper FLEX is RB/WR/TE-eligible — establish whether tight ends
enter the pool from his actual settings rather than assuming.) QB and TE keep their own lines; SUPER_FLEX is a QB
question, not a flex one.

## THE ALTERNATIVE, and why this one is preferred

Both other sources handle flex **probabilistically** — Draft Value Analytics cites 4for4 as having published
flex-adjusted replacement levels modelling the distribution of flex usage; the Reddit author fills flex slots from
projections. That works, but it introduces a probability we would have to estimate and defend. **The combined pool
needs no parameter at all**, which matters because [[feedback_a_placeholder_hardens_into_a_fact]] — a flex share
we invented would become load-bearing by repetition.

## DONE WHEN

The RB/WR replacement line is derived from the shared slot count in his live Sleeper settings, the four thresholds
are simultaneously satisfiable by construction, and DG-160's budget detector confirms it rather than being told.

## ⛔ TRAPS

- ⛔ **Do not hardcode 72.** Derive from `league.roster_positions` every run. The WR53 defect was a number written
  down once, reasoned from a slot he does not have.
- ⛔ DG-160's detector must be re-pointed at the pooled structure or it will report a violation that no longer
  exists — and a detector that cries wolf gets switched off.
- ⚠ This changes cross-positional value for backs and receivers together. Expect movement on his roster and put it
  to him in ORDER and CARD SENTENCES before it lands, per his standing instruction.
