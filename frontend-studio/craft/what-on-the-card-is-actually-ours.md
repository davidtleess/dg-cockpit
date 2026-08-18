# What on the player card is actually ours

**Written 2026-08-17 after David's verdict on 023: *"these are fine. nothing special."*** Rather
than iterate the drawing, every fact the card puts on screen was classified by where a dynasty
manager could otherwise get it. The sources are ones already studied in this lane with a browser
(`craft/how-the-category-shows-time.md`, 2026-08-09) plus the app's own briefing §4.

## The audit

| # | fact on the card | where else he can get it | ours alone? |
|---|---|---|---|
| 1 | name · position · age · IR/taxi status | Sleeper (his own app), everywhere | no |
| 2 | market value today | FantasyCalc, KTC — free, same source we overlay | no |
| 3 | positional rank today | FantasyCalc, KTC | no |
| 4 | **his own price band (low / today / high)** | **KTC player page — and better**: a full line with `1mo · 3mo · 6mo · 1yr · All Time`, change readout for the range, value labelled at the line's end | **no — and theirs is strictly better** |
| 5 | band width vs the population (12.2% sit at their own low) | nowhere | **yes** |
| 6 | our model's positional percentile | nowhere — this is the product | **yes** |
| 7 | market positional percentile | derivable free from any rankings page | no |
| 8 | best unrostered player at the position | Sleeper's free-agent list, ranked | no |
| 9 | the written read | Studio's hand, not a data asset | n/a |

**Two of nine facts are ours.** One of those two (#6) is a single number that, as measured the same
day, **has not moved since 2026-06-26**.

## The conclusion, which is not about the drawing

The card is mostly a re-rendering of free data around one static proprietary number, and its
apparent centrepiece — the price band — is the one thing the category already does with years of
history where we have 55 days. That is a complete explanation of *"fine, nothing special"*, and no
amount of craft fixes it, because **the ceiling is set by how much our lane can say, not by how
well it is drawn.**

This lands exactly on David's own stated product mission (2026-07-15): *"(1) rank players with a
deeply analytical model. (2) Display OUR rankings in comparison to the market — this is the one we
seem to be struggling with."* The juxtaposition cannot carry a surface while one side of it
contributes a single unchanging percentile.

## Where the leverage actually is

1. **Make our lane say more.** Known constraint (2026-07-24, verified against the live API): per
   player the model emits a value, an xVAR, and *sparse* 1/2/3-year projections — often only one of
   the three. It publishes no per-player arc and no rank comparable to the market's. This is an
   engineering question, not a design one, and it gates every two-lane surface.
2. **Build on the asset nobody else holds — his league.** KTC aggregates 200,813 leagues and
   therefore has breadth with no memory; DG owns *one* league's continuous four-season history: 39
   trades with both sides symmetric, a live transaction ledger, ownership for all 12 teams, and now
   55 days of two-lane prices. Nothing about a player card is unique. **What his own league has
   paid, and what happened next, is unique by construction.** That is the 021 direction.

## The lesson about the surface, separately

023 also repeated a known failure: it was organised as a **component sheet** — "one unit, six
situations" — with Studio's own retraction as the first block on the page. That is the 018/020
error a fourth time: the mechanism presented where the manager's situation belongs. The cards were
praised on 2026-08-17 *inside a decision* ("who is the last cut") and shrugged at the same day
*presented as cards*. **A unit is not a surface, and a catalogue of a unit is never his question.**
