---
name: project_te_scale_ruling_2026-09-04
description: "David 2026-09-04 ~16:5x ET ruled the TE scale: take option 3 now, and SHIP THE FULL RESCALE BEFORE WEEK 1 (kickoff 09-10) — overruling Greg's advice to wait. One scale for all positions, position carried by calibration. Fred has the core, Bob the three coupled surfaces; neither half may land alone."
metadata: 
  node_type: memory
  type: project
  originSessionId: dd3c4b75-c1e4-44f2-a62c-1e402ed9822a
  modified: 2026-09-04T22:33:15.971Z
---

**THE RULING.** David, 2026-09-04, two messages. The principle (~15:2x ET, verbatim): *"we need to put the tight
ends on the same kind of scale as the rest of the players. If you have eight tight ends at a hundred, the scale is
wrong… It can't have its own scale; it can have a calibration to the position, but it has to be on the same
scale."* Then the schedule (~16:5x ET, verbatim, in full): **"take decision one now. then build before week 1"**
— i.e. option 3 immediately, the full rescale before kickoff **2026-09-10**. Greg recommended the rescale wait
until after week 1; **David overruled it.** Do not re-litigate.

**WHY THE SCALE IS WRONG, in one table.** Each position is normalised by its OWN ceiling, so 100 means a different
amount of football at each: `ENGINE_B_P90_PPG` QB 20.1 · RB 15.7 · WR 14.5 · **TE 9.4**. Replacement:
QB 64.2 · RB 46.4 · WR 60.6 · **TE 95.6** — so the entire startable TE range is 8.99→9.4 ppg and everyone good
piles at the top. Clamped at exactly 100 on the 09-04 artifact: QB 0/72 · RB 6/139 · WR 4/241 · **TE 8/130**
(measured by Greg; the eight include David's Tucker Kraft, with projections spanning McBride 15.0 to Loveland 9.9).

**DECISION ONE — option 3, immediate.** Corrects the 17 players the ceiling flattened. **Zero displayed scores
move** (by construction: the score is set on one line, the cross-positional value derived on another; option 3
edits only the second). No constant moves; all 14 coupled-constant guard tests pass. Biggest corrections Puka
Nacua and Trey McBride, roughly doubling. ⚠ **~103 of 502 players change PLACE** in the cross-positional ordering
(the 17 plus 86 leapfrogged) and that ordering drives cut advice, so advice shifts for players whose cards look
identical. David has been told.

**DECISION TWO — the rescale, before kickoff.** Every cross-positional number ×0.72, uniformly (measured 0.7195–
0.7235 across 482 rows; the spread is decimal rounding). **Uniform ⇒ every ordering, sign and ratio preserved: a
change of UNIT, not of meaning** — but a 28% move on numbers David reads. His roster: Kraft 100→47-51 (an
INTERVAL — he is pinned, served value not recoverable), Barner 90→42.1, Johnson 75.5→35.3, and **Mendoza
85.1→70.7**, the largest QB move on the board, scored by the second engine whose ceiling is 16.7 not 20.1.

**⛔ FOUR THINGS THAT BREAK QUIETLY UNLESS THEY SHIP IN THE SAME CHANGE** — Bob owns the first three, Fred the core:
1. The prospect-card producer refuses to write when any score moves and EXITS → the rookie/pick boards would not
   rebuild at all on the morning it ships. Find what that gate protects; declare the movement, do not delete the
   invariance.
2. A hard threshold at 80 stops firing for every TE and most WR/RB once values shrink 28% → **silently removes the
   MANDATORY counter-argument on his best assets.** Arrives by arithmetic, not by an edit.
3. The what-changed model section has NO mover cap (market caps at 25) → rebase morning lists his whole roster and
   the whole league as FALLERS. **Greg's ruling: a uniform re-denomination is not a fall and must not render as
   one.**
4. The band, replacement and multiplier are one derivation.

**GREG'S STANDING RULINGS on this change:** the whole thing must be **reversible in one commit**; neither half may
land alone; and whatever moves must be legible to David on the day rather than arriving as an unexplained drop.

**⛔ THE OPEN QUESTION, now IN scope.** The replacement levels ARE the "calibration to the position" half of David's
own sentence, and Fred found their provenance is **circular** — the calibration artifact on disk disagrees with the
shipped constants. A rescale that leaves them un-audited does half of what he ruled. Resolve, or state precisely why
not before the 10th and what ships instead.

**Traps carried in:** `ENGINE_B_P90_PPG` / `ENGINE_B_REPLACEMENT_DVS` / `XVAR_LAMBDA_ENGINE_B` are algebraically
COUPLED (P90 cancels in unclamped xVAR); **DG-092 guards the lambda**; Fred tripped that identity once by proposing
multipliers of 1.386 while citing the guard as evidence the design was sound. Under one denominator the identity
forces every multiplier to **1.000**, which is where the 0.72 comes from. See
[[project_review_verdicts_2026-09-03]], [[project_season_readiness_2026]].
