# DG-176 — the survival cells cannot price young quarterbacks or tight ends

**Layer:** 3 · **State:** open · **Lane:** — · **DG 3.0** · **model coverage · medium**

Three players come back BLANK from the asset number, and **none of them is a rookie
problem**: Fernando Mendoza, Ty Simpson and Kenyon Sadiq all fail on **suppressed
23-and-under quarterback and tight-end margin bins** in `retention_R_v3.json`.

⚠ **Mendoza is on David's roster — third on it as of 2026-09-05.**

**This is not fixed by the rookie probability factor and will be hidden by it.** Bob's
`P(ever qualifies)` gives the other 77 rookies a number; these three still have no cell
to multiply. Left inside DG-168 the headline reads "rookies are priced now" and this
disappears. Hence its own ticket.

**The shape.** `QB <=23` publishes 1 of 10 bins; `TE <=23` publishes 0 of 10. Every
other position/age band is well covered. The cause is arithmetic rather than an error:
the availability bar admits fewer qualifying player-seasons than the structural bar did
(20,885 against 33,240), and the youngest bands are thinnest to begin with, so
suppression at n<12 lands hardest exactly where David's interest is highest.

**Options, none costed:**
* pool the 23-and-under band with 24-25 at these two positions only, and say so on the card
* widen the margin bins for thin bands rather than the whole table
* accept the blank and carry the reason — defensible, but it is a blank on a rostered
  player, which is the worst place for one

⛔ **Do not solve it by borrowing a neighbouring cell.** That is the rule that has held
all week and the one that would be most tempting here, because the neighbours look close.

**Verify:** Mendoza, Simpson and Sadiq carry a number or carry a stated reason; no cell
is populated from a neighbour; and the three are named in whatever ships, not silently
absent.
