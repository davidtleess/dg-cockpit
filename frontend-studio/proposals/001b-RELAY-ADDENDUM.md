# 001b-RELAY — Addendum to 001: rank-first defaults and the normalization challenge

**David's 60-second review**

| ID | Summary | Severity |
|----|---------|----------|
| N1 | Normalize model outputs into market-comparable rank-space | High |
| N2 | Rank is the default sort and left column | High |
| N3 | Rank change chips use green-up red-down idiom | Medium |
| N4 | All tape columns sortable | Low |
| N5 | Panel leads with model-rank vs market-rank story | High |
| N6 | Universe list: one filterable table, KTC anatomy | High |
| N7 | Live rosters call replaces stale ownership artifact | High |
| N8 | Model-rank column joined across full universe | High |

---

From: Studio. Extends 001 (already with you) after two further client review cycles on the live
prototype; the updated `proposals/001-morning-tape/prototype.html` shows everything below working.
These carry direct client rulings — noted per item.

## N1 — The normalization challenge (client-directed)

**The problem, in the client's framing:** the product's job is (1) rank players with a deeply
analytical model, and (2) display *our* rankings in comparison to the market — and the model's
outputs don't currently speak a comparable language. DVS is 0–100, xVAR is its own scale, values
are FantasyCalc's scale; a panel mixing them reads as noise ("we're all over the place").

**The ask:** publish the model's view **in rank-space as a first-class output** — a full positional
and overall ranking of the modeled population, refreshed with the model, served where the UI can
join it to market ranks. My prototype derives this today by ranking `predicted_avg_ppg_t1_t2` from
`/api/engine-b/scores` (503 players, joined to sleeper ids via DynastyProcess's crosswalk, 503/503).
If that derivation is wrong — if ranking by predicted PPG misrepresents what the model believes —
then say what the correct ranking basis is and publish that. The requirement is client-ruled:
model output must be digestible *in comparison to the market*, in the hobby's units (ranks, prose
tiers). Secondary (open): whether a market-scale value equivalent is also derivable, so "model
value vs market value" can be one chart someday.

## N2 — Rank-first defaults (client-ruled)

Both tapes default-sort by overall rank, best first. The far-left column is the rank number
(`#13`), replacing the list-index that previously collided with rank (a row labeled "23" whose
panel opened with "#13 overall"). Position rank (`RB3`) is the far-right column.

## N3 — Rank-change chips (client-specified)

Rank movement renders beside the rank as `▲2` (green) / `▼3` (red) — the fantasy-standard idiom the
client explicitly specified. Flag: if your color rules treat rank-movement arrows as within the
red/green prohibition, this is a direct client instruction — escalate the conflict to David rather
than rejecting it; he has already chosen the idiom with full knowledge of the palette discipline.

## N4 — Sortable columns

Rank, Δ 1 day, value, position rank — click to sort, click again to reverse. Client-ruled
("all columns should be sortable").

## N5 — The panel leads with the rank comparison

Expanded-row reading order is now: `RB3 market · RB17 model` headline → "The model has him **14
spots lower** than the market" → prose tier chips → value neighbors and gap structure → three
percentile bars (all market-lane, one consistent scale) → today's move → one model-detail line
(divergence sentence, DVS, xVAR — detail, not headline). The DVS bar is gone from the main read:
model facts appear only as ranks and prose (N1's consumption side).

## N6 — "Around the league" becomes one filterable universe list (client-ruled: filters/sorts, not tabs)

One table over the full valued universe (398 players with sleeper ids), KTC column anatomy
(rank · player/pos/age · 30-day trend · value · pos rank) plus our juxtaposition column (N8).
Filter chips: availability (Available / Rostered / Whole universe) + position; all headers sortable.
"Top movers" is the trend sort; "free agents" is the availability filter; the full rankings view is
the unfiltered state. Prototype section rebuilt and working.

## N7 — Ownership must come from a live rosters read

The availability flag currently derives from the trade-assets artifact stamped **June 23** — three
weeks stale. The fix is the Sleeper `GET /league/{id}/rosters` call the app already makes live for
Roster Audit: same endpoint, second consumer. Concrete stake: the stale data shows Bo Nix
(#32 overall, QB12 market / **QB4 by the model's own ranking**) unrostered in a Superflex league —
either a headline insight or three weeks out of date; only a live read can say which. Cost this.

## N8 — Model rank joined across the full universe

The N1 normalization demand, demonstrated: ranking `predicted_avg_ppg_t1_t2` across the Engine B
population and joining via the DynastyProcess crosswalk covers 305 of 398 universe players today.
The UI shows model rank beside market rank and highlights large disagreements — the "opportunities"
column. The 93 unjoined players and the ranking-basis question are yours per N1.

---

N1 is the item that matters; N2–N5 are UI mechanics you can cost in minutes. On N1, the client's
words to me were to challenge you "to figure out a way to normalize the way we digest their
modeling so that it makes sense in comparison to the rest of the market" — treat the rank-space
output as the requirement and my predicted-PPG derivation as the strawman to improve on.

— Studio

---

## Disposition (engineering response, 2026-07-15 — see docs/studio-relays/2026-07-15-001b-RESPONSE-draft.md)

All eight items accepted/confirmed/resolved. Corrections Studio adopts: **N1** rank basis is xVAR
over the server-owned valued cohort (469 model-backed incl. 80 rookies), not predicted PPG over the
raw scores endpoint — prototype-era join figures (305/398/93) are void, not a contract. Cross-lane
"N spots lower" copy requires equal populations; otherwise per-lane denominators or percentiles.
**N3** client ruled: green/red legal for rank-movement arrows ONLY, never worth/gap/tier hues.
**N5** prose tiers gated on calibrated definitions — the ladder remains client-mandated; boundary
derivation is Studio's next analytical task. **N8** "opportunities" column renamed "gap"
(descriptive). Prototype rework to the corrected basis: in progress on Studio's side.
