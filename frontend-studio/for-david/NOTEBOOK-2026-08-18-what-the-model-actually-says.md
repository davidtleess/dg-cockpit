# Working note — what our model actually says, measured

**Status: a killed framing and a redirect. No surface built, nothing shown, nothing relayed.**
Tool: `tools/what-is-the-projection-actually-saying.py` (deterministic across two runs).
Sources: `app/data/valuation_runtime/universe_pvo_runtime.json` (captured 2026-08-18T13:30Z) joined
to `nflverse_usage.db` `ff_opportunity`, **2025 regular season only (weeks 1-18)**, on
`dg_player_id`. **495 of 503 Engine-B rows join; 494 have 2025 tape.**

## The premise I announced to David, and it was half wrong

I told him the model "has a real opinion about nearly every player on your roster, in points per
game, and the screen shows you a blank column instead." I tested the premise before building on it.

**corr(2025 actual PPG, projection_2y) = 0.947** (0.964 on players with 8+ games).

A **one-parameter rule** — take last season's points per game and shrink it toward the positional
mean — explains **R² = 0.887** of the entire model projection, with 1.12 PPG of scatter left over.
Every "opinion" in the top-departures list is that rule working: young low producers pulled up
(LeQuint Allen, Kaleb Johnson, Isaiah Bond, all 21-22), high producers pulled down (McCaffrey −5.5,
Purdy −5.0, Taylor −4.7, Bijan −4.3).

**So for most of the roster, showing him our projection is showing him last season with a haircut.**
He can get last season anywhere. That surface should not be built.

## Where the premise survives, measured rather than hoped

| position | n | best shrink k | R² of the shrink rule | unexplained sd | **unexplained ÷ that position's own actual spread** |
|---|---|---|---|---|---|
| **QB** | 37 | 0.64 | **0.513** | 1.32 PPG | **0.375** |
| WR | 133 | 0.79 | 0.889 | 1.08 | 0.237 |
| TE | 74 | 0.71 | 0.864 | 0.72 | 0.193 |
| RB | 84 | 0.71 | 0.852 | 0.93 | 0.173 |

**At QB the model is doing something the shrink rule is not, and it is not an artifact of restricted
range** — the obvious alternative explanation, tested rather than dismissed. QB's actual-PPG spread
(3.52) is the second *smallest* of the four while its unexplained scatter (1.32) is the *largest*.
Both directions agree: relative to its own spread, the model departs from "last season shrunk" about
**twice as much at QB as at RB**.

**The honest caveat: QB n=37 is the smallest cell here, so this ratio is the least stable of the
four.** It should be re-run when the 2026 season adds rows.

## Why that matters here specifically, and it is not a coincidence

This is a **Superflex** league — two quarterbacks start, so QB is the scarcest asset. David holds
**five**: McCarthy, Dart, Gabriel, Mac Jones, Mendoza. He has described them as the bet. Two are in
unresolved Week 1 competitions that settle at the **30 August cutdown** (verified 2026-08-09).

And the five largest independent opinions in the whole model — the players the shrink rule cannot
explain — **are all quarterbacks**: Cam Ward +3.11, Sam Darnold +3.06, Tua +2.36, Bryce Young +2.07,
**Dillon Gabriel +1.97**.

**Gabriel is on his roster, and the app currently ranks him the 4th most cut-exposed player of 21.**
The model likes him ~2 points a game more than last season does; the cut queue puts him near the
front. That is a real tension with a named entity on both sides.

## What this changes about the thread

- **Killed:** a roster-wide "here is what the model thinks of each player" surface. At RB/WR/TE it
  restates last season and would fail the compounding test the same way 014/018/020 did.
- **Alive:** the model's quarterback view, which is the one place it has an independent signal, in
  the format where the position is scarcest, on the group David has the most open decisions about,
  three weeks before those decisions resolve.
- **It compounds by construction:** from September the weekly actuals score the projection, and the
  question "have we been right about him" becomes answerable — David's own 2026-07-23 idea, now with
  a quantity worth tracking rather than a restatement.

## Costs and open questions, stated now

1. **n=37 at QB.** The strongest number here rests on the smallest cell.
2. **"Better than a shrink" is not "right".** The app's own backtest still says the model does not
   out-rank the market at any position (QB nDCG −0.024). Departing from last season is not evidence
   of being correct, and no surface may imply it is.
3. **Cannot be tested forward yet.** Whether the QB departures are skill or noise needs realized
   outcomes, which start accruing in September. Until then this is a characterisation, not a
   validation.
4. **13 players carry a negative projected PPG** (Manhertz −0.39, Carter −2.17, Hodge −0.75…). In
   0-100 score space the floor clamp hides them; speaking the points exposes them. Naming the unit
   makes a real flaw visible — an honest cost of the thing I keep arguing for.

---

## CORRECTION, same evening, before anything was built — the redirect was wrong too

**What I pitched to David:** *"the five largest independent opinions in the model are all
quarterbacks… the model likes Dillon Gabriel ~2 points a game more than last season does, while the
app ranks him 4th most cut-exposed."*

**It does not hold.** Those residuals came from a shrink baseline fitted on **all positions pooled**.
Quarterbacks score far more per game than skill players, so a pooled mean systematically inflates
every QB residual. Re-fitted **within position** — the only defensible comparison — the five shrink:

| player | pooled residual (what I quoted) | per-position edge (correct) |
|---|---|---|
| Sam Darnold | +3.06 | **+1.45** |
| Cam Ward | +3.11 | **+1.11** |
| Bryce Young | +2.07 | **+0.37** |
| Tua Tagovailoa | +2.36 | **+0.33** |
| **Dillon Gabriel** | **+1.97** | **−0.64** |

**Gabriel's edge is negative.** The raw +2.19 against his own 2025 actual is the shrink rule pulling
a low producer toward the mean — precisely the artifact this note was written to expose. **I
diagnosed regression-to-the-mean as the model's whole behaviour and then quoted it back as the
model's opinion, one hour later, in a pitch.**

**And on David's roster the null is complete.** All four of his Engine-B quarterbacks sit *below* the
QB baseline:

| QB | age | 2025 actual | model | QB baseline | edge | cut-exposure rank |
|---|---|---|---|---|---|---|
| Jaxson Dart | 23 | 17.40 (14g) | 15.58 | 16.78 | −1.20 | 19 of 21 |
| J.J. McCarthy | 23 | 12.94 (10g) | 12.15 | 13.92 | −1.77 | 12 |
| Mac Jones | 27 | 12.19 (11g) | 11.39 | 13.44 | −2.05 | 8 |
| Dillon Gabriel | 25 | 7.79 (9g) | 9.98 | 10.63 | −0.64 | 4 |
| Fernando Mendoza | 22 | **no 2025 tape** | **no projection** (Engine A) | — | — | not a candidate |

**There is no "the model is high on your quarterback" story, because there is no player David owns
that our model has a distinctive view about.**

## What still stands after the correction

1. **The model is last season shrunk** — R² 0.887 pooled, 0.85–0.89 at RB/WR/TE. Unaffected: that
   fit was never the pooled-residual calculation.
2. **QB has the lowest within-position shrink R² (0.513)**, and the restricted-range control held
   (QB's actual spread is second smallest, its unexplained scatter the largest). **This was always
   fitted within position and survives.**
3. **What the model actually does differently at QB is mark proven producers DOWN.** Five of the ten
   largest per-position departures in the entire model are quarterbacks and **every one is negative**:
   Fields −3.84, Penix −3.60, Brissett −3.42, Purdy −3.41, Mariota −2.86. It is a pessimism, not an
   edge — and none of those players is David's.

## The lesson, and it is the third instance of one class

**Pooling across incomparable populations.** Recorded 2026-07-30 (*"raw rank gaps averaged across
incomparable pools — 36 ranks among 45 QBs ≠ 36 among 140 WRs"*), recorded again 2026-07-22 (*"a raw
model-vs-market gap sort is mostly an age sort"*), and committed again tonight in points-per-game
space. **Every time, the fix is the same and it is known in advance: fit the baseline inside the
population you are making the claim about.**

**Caught by building the picture.** The error was invisible in the summary table and appeared the
moment the five named players were computed for a figure. That is the argument for drawing early:
**the artifact is an instrument, and this one convicted the pitch that commissioned it.**
