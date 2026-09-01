# DG-119 — The trade partners view is an unstyled dump: who to call, buried in 6,401 pixels

**Layer:** 6 · **State:** done · **Lane:** Davids-MacBook-Pro-66209 · **DG 3.0** · **frontend-only · DG-091 follow-on**
**Source:** David, 2026-08-30: *"do the trade partners view and the raw token"*. DG-116 made this
conspicuous and deliberately did not fix it; DG-114 moved it under Trades. Measured on the LIVE
product at 1440 (screenshot: session scratchpad `partners/partners-1440.png`).

**Problem — the page is 6,401px tall and answers nothing at a glance.** Eleven partner entries,
each ~90px of flat text with no card frame and no ranking hierarchy. Per entry, all as bare
label-over-value pairs on separate lines: `Roster 7` · `Market-influenced` · **`Trade-fit score
2.091`** (a raw three-decimal number with no scale, no range, no units) · a bare position pair
(`RB, WR`) · five component metrics as raw decimals (`0.84`, `1.00`, `0.00`, `0.25`) · `Where you
are / Rebuilding` · `Where they are / Contending` · `Players we price differently / 5` · per-position
scores (`RB 0.55`, `WR 0.84`) · **and the same caveat sentence repeated on EVERY ONE of the eleven
cards** — exactly the stamped furniture DG-111 retired everywhere else.

**Build:**
1. **Card frames and a real hierarchy.** Manager name leads. What the reader wants first is *who
   to call and why*, in a sentence — not eleven identical metric stacks. Use DG-115's tokens.
2. **Say what the score MEANS or stop showing three decimals.** `2.091` is meaningless without a
   range; either express it in words ("strongest fit in your league"), give it a scale, or demote
   it to the receipt. The component metrics (0.84 / 1.00 / 0.00 / 0.25) need the same treatment —
   a bare 0-1 decimal is not a fact a manager can use.
3. **The caveat once, not eleven times.** One honest sentence at the top of the section: the score
   is partly market-derived and is context, not a validated ranking. Removing ten repetitions is
   removing FURNITURE, not the fact.
4. **Compress vertically.** Label/value on one line, position scores inline, components behind a
   disclosure. The whole section should be readable without a 6,000px scroll.
5. Partner names are league-authored text (`[data-user-text]`) — never rename them.

**Honesty law:** the fact that this ranking is market-influenced and unvalidated SURVIVES, said
once, plainly. Do not invent a confidence the producer does not express. If a component is 0.00
because the input is missing rather than because the value is zero, say which.
**Done:** a manager can see who to call and why in one screen; the caveat renders exactly once;
no bare unexplained decimals; the section is a fraction of 6,401px; real-browser proof at 1440
AND 390; the DG-118 gate covers this state (`Trades · Trade partners` is already one of its 23).
