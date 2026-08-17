# 021 — The trade ledger (trade retrospective)

**Status: prototype built 2026-08-12, delivered to David same day. Not relayed.**

## Problem

The category's best trade tool — KeepTradeCut's Trade Database — has breadth and no memory:
25,000 trades from 200,813 leagues, shown as *date | side A got | side B got*, and it never says
what happened next. It structurally cannot; it aggregates across leagues. Dynasty Genius holds the
inverse asset: one league, four seasons, 39 trades captured symmetrically, plus daily two-lane
pricing. Nothing in the app uses the trade ledger at all — a grep of `app/api/routes/` finds no
consumer of `league_transactions.db`.

This is the compounding criterion (David, 2026-08-09: *"the thing needed is surfaces that will
become valuable with more and more data"*) made into a surface: a trade ledger's afterlife column
gets richer with every daily capture and every new trade, forever.

## Evidence

- KTC Trade Database structure and its no-memory gap: `craft/how-the-category-shows-time.md`
  (browser study, 2026-08-09).
- Every past pick resolves: the league's four drafts (2023 startup, 2024–2026 rookie) are complete
  in `research/league_behavior/raw/2026-07-19/`; `slot_to_roster_id` maps a traded pick's original
  owner to the draft slot. **76/76 resolved, zero failures.**
- Pricing: FantasyCalc capture live to 2026-08-12 (players AND picks, incl. 2027/2028 rounds);
  model capture (DVS) to 2026-08-11.
- Fates replay from the ledger itself (cut / flipped / still rostered / now a free agent).

## Proposal

One page: the league's complete trade history, newest first, in KTC's familiar row shape — with
the column KTC cannot have. Every past pick wears the player it became (`2026 2.05 → Nicholas
Singleton`); every asset is priced at today's market value with position rank; blue DVS carries the
model's view per player, never summed; fate notes carry what happened to the asset afterward. Two
amber haul bars per trade on ONE page-wide scale; no verdict is rendered anywhere — the reader
sees the imbalance. Filters: All trades / Your trades. The 2023 startup slot swap is deliberately
outside the bar system (pricing two whole startup drafts as hauls is a category error) and renders
as a labeled, expandable exception.

The masthead states the honest limit as the accrual promise: all 39 trades predate the daily-price
window (began 2026-06-24), so the league's next trade is the first captured with its at-trade
price — the page starts remembering, and gets better every day it runs.

## Prototype

`proposals/021-trade-retrospective/index.html` + `data.js`, built by `tools/trade-retro-build.py`
(deterministic across runs — verified by hash, twice). Serve: `node tools/serve021.mjs 8791`.
Census (`tools/shot021.mjs`): 39/39 trades rendered, 165/165 asset names present, 0 page errors,
0 horizontal overflow, filter exact (12/12).

## Costs (honest)

- **Model lane is per-asset, not per-side.** The model publishes no additive market-comparable
  total; summing DVS would invent a scale. Side totals are market-only. If the model ever publishes
  rank-space values (the standing 001b ask), the second haul bar becomes possible.
- **Future picks are priced at FantasyCalc's round average** (slot unknown) — stated on-surface.
- **"Haul at today's value" measures how the deal aged, not roster management afterward** — a
  player cut later still counts at his current value. Methodology states this; the fate notes carry
  the second story.
- **Four players are unpriced** (Ekeler, Hopkins, M. Thomas, R. Wilson — out of today's market
  universe). Never counted as zero; sides with no priced assets read "unpriced".
- **At-trade prices do not exist for any current row.** The page says so at the top rather than
  approximating.

## Defects found and fixed before delivery

1. Same-timestamp add/drop pairs in the ledger broke location replay — rostered players (incl.
   Rome Odunze) read "now a free agent". Fixed (drops sort before adds); builder now asserts zero
   held-vs-location contradictions per run.
2. A side whose only asset is unpriced rendered total `0` — absence-as-zero. Now `unpriced`, no bar.
3. Methodology carried a transcribed count (76); now computed from the data.

## Open questions

- Is the chronological ledger the right default, or should "Your trades" open first?
- Per-trade at-trade pricing arrives with the next trade — should the row design reserve the space
  now (a second, dimmer bar) or add it when the first priced trade exists?
- Relay to engineering not yet authored: the ledger-is-unserved finding (R3-adjacent) and this
  surface concept would go together. Held until David reacts to the prototype.
