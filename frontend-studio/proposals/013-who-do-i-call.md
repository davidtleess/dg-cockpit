# 013 — Who do I call, and is now the time

**Status: sketch. Not approved, not relayed.** Built after David's judgement on 012: *"you have the data
analysis that could be a valuable foundation for this page but you are really missing the mark when it
comes to the UI/UX."* He reacted to the reframe below with **"not a bad idea"** — a weak green light on
the QUESTION, nothing more.

---

## Problem

**012 rendered a history and left the reader to derive the implication.** Twelve lanes of dots across
four seasons is a dataset with a chart on it. Measured against the standing bars of this engagement it
failed four ways, and none of them were fixable by redrawing:

1. **No thesis.** The bar is that a surface carries a verdict about the manager's situation — the
   approved front door says "rebuilding, at the bottom, but young and stocked." 012 said "here is some
   data about your league."
2. **No juxtaposition.** Not one figure on it was ours-versus-the-market, on a surface built after two
   separate rulings that a market-only panel does not ship.
3. **It answered the analyst's question.** "How does my league trade?" is read once. "Who do I call,
   and is now even the time?" is a weekday morning.
4. **It read as a terminal** — already said once about a different surface.

**The deeper cause, conceded:** two days went into the *drawing* (density gates, collision maths,
target sizes) and none into the *form*. That is the 008 failure repeating — the craft improved every
version and the outcome did not.

## Evidence

The activity data is sound and it contains a real, actionable thesis that 012 never stated:

| finding | measured |
|---|---|
| **You are buying picks** | 70% of everything you take back is draft capital; **net +11 picks**; 13 players sent out |
| **Four managers pay in picks** | Free Kelly 33%, MDEF 35%, jspringe88 20%, Kissane's Team 0% — the other side of what you are doing |
| **Five collect picks like you do** | 42–50% appetite; on capital you are bidding against them, not trading with them |
| **Two are unreachable** | Seidmans Sasquatches: 1 trade in 4 seasons, last Nov 2024. jgil96: none ever |
| **Nobody is dealing right now** | **July and August have never produced a trade** in four seasons; 71% close Sep–Dec (Wilson 55–83%, n=38) |
| **The app disagrees, checkably** | It ranks **Seidmans Sasquatches #4 of 11** as a trade partner — a manager with one trade in four years |

## Proposal

**League activity is not the subject of a page. It is the evidence inside one.**

- **The hero is the window**, because seasonality is the most characteristic fact in this subject's
  world. It renders the same shape every day — only the words and the today-marker move — which is the
  instrument-not-editorial rule. A month that has never produced a trade draws as **absence** (a hatched
  baseline stub), never as a zero-height bar in a row of bars.
- **Then your own posture**, stated as the reason the sheet is ordered the way it is.
- **Then the call sheet:** one list, eleven managers, grouped by **what each has historically paid in** —
  a categorical truth — and ordered inside each group by deals a season. **Deliberately no composite
  "call score":** blending a partner into one number is the failure named on 2026-07-24, where every
  attempt averaged away the only thing that mattered.
- **The signature is one shared axis** running down every row with **you fixed on it**, so the sheet
  reads as a distribution at a glance and no row is drawn on a scale of its own — the auto-scaling
  problem confirmed as 004 N4.
- **Rows expand in place** (the standing default since 2026-07-15) into the evidence-card pattern David
  confirmed: a read assembled from measured clauses, a four-factor grid, and his actual last three deals
  with positions in the product's own four hues.
- **A soft, uncoloured lean** — *worth a call / long shot / skip* — earned by the shown evidence, never
  a prescription.

## Prototype

`proposals/013-who-do-i-call/{build.mjs,template.html,prototype.html}` — self-contained, every figure
**generated** from `analysis/league-activity.json` rather than transcribed.

**Verified:** craft gate **0 fail, 1 warn** (the warn is two declared display sizes), density **1.22 per
10k px²** against the approved front door's 2.13; **all 11 controls ≥24px**, all named; keyboard Enter
expands a row; reduced motion renders 7/7 bars at final state with the today marker visible; no overflow
at 1440 or 390; zero console errors; gate output identical across runs.

**Two declared extensions, stated not smuggled:** a display type size (44/28px) above the product's 18px
ceiling, because a verdict that must be read first cannot be set at body size; and the four position
hues, which ship in the product unused and appear here only where a position is actually named.

## Costs, honestly

- **It says what managers have DONE, never what they want now.** A manager who paid in picks for four
  years may be finished doing it. Rosters change; the record does not update itself.
- **The samples are small.** 38 trades across 11 counterparties is ~3.5 each. Marks resting on fewer
  than four deals are drawn hatched and carry their n, but three of ten partners are in that state.
- **No player valuations enter this page.** The juxtaposition here is the app's own partner ranking
  against the transaction record, not model-versus-market on players. That is a narrower juxtaposition
  than the standing doctrine asks for, and it is a real limitation of this surface rather than a choice.
- **The timing verdict is a pooled four-season average.** It cannot know that this specific August is
  different.
- **It needs the uncalled endpoint.** Everything here comes from a Sleeper endpoint the product has
  never called (`grep -rn "transactions" src/ app/` returns zero) — so this surface cannot exist until
  that lands, which is item T3 on the unauthorised 012 relay.

## Open questions

1. Is the grouping right — *what he pays in* — or is the more useful first cut *who is contending versus
   rebuilding* (the app has postures, though its posture artifact is stale and its partner ranking
   demonstrably wrong)?
2. Should the timing verdict be this loud? It is the most opinionated thing on the page, and for six
   weeks a year it says "do nothing."
3. Does the shared axis earn its place, or would raw "picks in / picks out" numbers per row read faster?
