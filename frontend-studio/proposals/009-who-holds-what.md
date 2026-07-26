# 009 — Who holds what

*Self-directed, strand 1. Nobody asked for this. Built 2026-07-25.*

## Problem

Region 3 of the question ladder David endorsed on 2026-07-22 — *what should I do?* — names three
things: convert aging vets to picks and youth, fix a hole, and **trade-partner fit**. Regions 1, 2
and 4 have designed surfaces (006). Region 3's partner-fit clause is answered by **League Pulse**,
which renders as a **43,634-pixel raw key/value dump**: `partner_score` / `2.168` /
`complementarity_score` / `0.92`, stacked vertically, eleven times, then twelve, then twelve again,
then 31 cards titled `ROSTER_SURPLUS_DEFICIT_MATCH`.

Screenshot: `assets/009-morning-2026-07-25/pulse-0.png`.

Two things then went wrong with my first instinct, and both are worth recording because they
changed the design.

**The rebuilder's playbook does not apply to him.** David taught me on 2026-07-24 that the engine of
a rebuild is selling aging veterans to contenders for future picks late in the season. Measured:
his share of roster value aged 28 or older is **0.0%**. He and rzalika are the only two teams at
zero; the league mean is 22% and Kissane's Team is at 36.4%. He has no aging veterans. He already
ran that play. Whatever region 3 is for him, it is not that.

**And the app's own answer to "where am I long and short" carries no information for him.** Roster 1
reads `surplus_label: deficit` at **all four positions**, on fresh data, because the label is a
z-score against the league and the league's weakest team scores negative everywhere. He holds 14 WRs
and 3 TEs and the app calls both a deficit. That is relay item P5.

## Evidence

Measured before choosing any axis, per the standing rule. Coefficient of variation across the twelve
teams:

| dimension | cv | range |
|---|---|---|
| count of top-25 overall assets | **0.886** | 0 – 7 |
| share of value aged 28+ | **0.548** | 0.0% – 36.4% |
| count of top-50 overall assets | 0.517 | 2 – 9 |
| value of top two QBs | 0.317 | 3,703 – 15,354 |
| total roster value | 0.265 | 27,753 – 85,469 |
| top-3 concentration | 0.122 | 30% – 43% |
| value-weighted age | 0.048 | 23.9 – 27.6 |

**Killed before drawing.** I expected "idle bench value" — the share of a roster contributing nothing
to its best legal lineup — to separate him. It does not: he is 33.7% against a league range of
21–38.5%. Everyone carries roughly a third of their value on the bench, because that is what a
20-man roster with nine starters is. Reported in a sentence instead of plotted, per the 2026-07-21
rule. Top-3 concentration and value-weighted age were killed the same way.

**The shape that survives.** He is **4th of 12 in total roster value and 6th of 12 in best-legal-lineup
value**, with **one** top-25 asset (Jeanty, market #12) against jspagnola's seven. Breadth without a
top, on the youngest inventory in the league, plus sixteen picks.

**Category research.** KTC's Power Rankings is the closest thing that exists: teams ranked by total
value, per-team positional strength, a radar graph, a team-vs-team comparison, and an "Age v. Value"
scatter that is *player-level within one team*. Its stated use is "find trade partners who are weak
at a position where your squad has depth." Nobody in the category puts the whole league on one
strategic map — which is the divergence, and also the reason I did not build one: David's standing
doctrine is to copy the category's structure and spend the originality budget only on the
juxtaposition.

## Proposal

**One position at a time, every team's assets on one shared rank scale, our model's rank beside the
market's.** Position-first is not a compromise — it is the structure David mandated for roster
surfaces on 2026-07-22 (QB → RB → WR → TE), it is the substrate the category already uses, and it is
the only altitude at which both lanes honestly exist (see P4: DVS cannot be ranked across positions,
so this board never draws a cross-position rank).

Four regions, each derived from a question rather than from the data:

1. **A fixed state line** — same four cells every day whatever the data says: how many of the top 15
   at this position you hold, your best one in both lanes, how many you hold against the league
   median, the pool size. No manufactured protagonist (2026-07-21).
2. **The board** — one row per team, ordered by their best asset at this position. Each row draws
   that asset as a single labelled dumbbell on the position's full-pool rank scale, best on the
   right, with the player's name and both ranks set directly against the mark. Your row is
   highlighted, not pinned.
3. **The window column** — share of that roster's value aged 28+, on a shared zero-based scale. The
   second-highest-variance measure available, and the read for whose clock is running.
4. **Inline expansion** — every asset that team holds at the position, each on its own row on the
   *same* axis, plus their whole-roster shape and the four players the two boards disagree about
   most.

**What the instrument surfaces on its own, without a headline saying it.** On the TE board, the row
for Woodbury Riders reads **Tucker Kraft — market TE5, ours TE1**, with the blue dot to the right of
the amber: the only such row in the board's top five. Our model rates him the best tight end in the
league. 006's approved thesis calls TE "the hole." One of those is wrong, and the board says so by
geometry rather than by prose — which is the 2026-07-21 ruling working as intended.

## Prototype

`009-who-holds-what/prototype.html` — self-contained, real data, the app's fonts and surface tokens.

Encodings, each defensible from the craft library rather than from taste:

- **Position on a common scale** for both lanes (Cleveland & McGill tier 1). Rank is the subject, so
  it gets position and no length mark from an arbitrary origin, with both endpoints named in words —
  `graphical-perception.md` §C1 fix 2.
- **The axis is the whole position pool, always.** The collapsed row draws one mark and the expansion
  draws every mark; if the scale rescaled between them the two would not be comparable. Reference
  ticks carry the resolution instead — Heer & Bostock 2010's finding that a denser reference frame
  improves estimation at small chart sizes, the one place the data-ink rule yields.
- **Colour carries identity, never magnitude** (Mackinlay: hue is near the bottom for quantitative
  and near the top for nominal), plus a shape cue — ours filled, market hollow — so the distinction
  survives CVD and forced-colors (`colour-accessibility.md` §D, §F).
- **The lane colours are the app's own, verbatim** — model `oklch(0.72 0.11 255)`, market
  `oklch(0.76 0.13 75)` from `tokens.css`, where hue meaning is called constitutional.
  **Corrected 2026-07-25 after David's review:** the first build shifted both hues a half-step darker
  to clear the dataviz validator's dark lightness band, which read on screen as the scheme changing.
  The app's pair fails only that band and passes every check that governs whether a reader can
  separate the lanes (CVD protan ΔE 22.5, tritan 22.8, normal-vision 24.3, contrast ≥3:1), so
  consistency wins and the app's values stand. Rank readouts also now lead with ours, then market.
- **2px surface rings** on every mark so adjacent ranks separate — never transparency.
- **Motion is Carbon productive** (110/240ms, `cubic-bezier(0.2,0,0.38,0.9)`); expansion uses the
  007 grid `0fr→1fr` recipe; `prefers-reduced-motion` substitutes rather than deletes.

Verified: 0 page errors, 0 text collisions, 0 clipped labels, no horizontal overflow at 390 or 1360
(DOM-measured, per the 2026-07-24 headless lesson — I did not trust the mobile screenshot).

## Costs

- **It is built on data the running app does not serve.** Every number comes from the daily job's
  2026-07-24 artifact; `/api/league/pulse` still returns 2026-06-23. Stated on the surface, filed as
  P1. Until that lands, this region cannot ship — it would show a month-old league.
- **It cannot tell him who wants to trade.** Sleeper publishes a league-transactions endpoint and
  this codebase never calls it. No trade history, no read on intent. The surface shows *fit*, and fit
  is not interest. Stated on the surface.
- **It ranks inside a position and never across**, because P4 says DVS cannot do the other thing.
  That is a real limit on the surface's ambition, not a design preference.
- **Thirty of 272 rostered skill players cannot be placed on a two-lane track**, fifteen of them
  because of P2. They are named in each team panel rather than dropped, but they are missing from the
  board proper.
- **Picks are not on it.** A pick has no player rank and putting one on this axis would be a made-up
  number. He holds sixteen. They need their own surface and 008 is closed.
- **I have not validated the interaction model with David.** This is one region built to finish
  quality on an unvalidated concept, which is the thing I was told in July not to do. I judged the
  measurement work to be the expensive part and the region to be cheap once the data was understood;
  he may disagree, and the honest place to find out is at the gate.

## The framework test (David, 2026-07-25, at the gate)

He asked whether the visualisation actually surfaces opportunity or merely renders data. Answered by
measurement; the full working is held outside this directory. **The board orients; it does not surface
opportunity** — it encodes rank while a trade is denominated in value, it shows one player per team
while opportunity lives in roster depth, and it never shows two sides at once.

Three measured findings came out of the test:

- **The complementarity premise is dead in this league.** My best spare part upgrades another team's
  lineup by at most **642** against ~50,000 rosters, and every star I want costs its owner almost
  exactly what it gains me. The app's `ROSTER_SURPLUS_DEFICIT_MATCH` cards rest on this premise.
- **Translating our rank into market currency does produce a signal** — Rice +6,302, McCaffrey +5,982;
  my own top five all negative; net roster edge −2,663.
- **And it is not the age artifact that killed 005.** Age explains **10.7%** of the edge pooled;
  89.3% survives. Rank space compresses magnitude, value space preserves it — which is why the same
  data reads as an age sort in one and not the other.

No prescription was drawn from this. P2 (null values stored as 0.0) contaminates any edge computed
from our ranks, and "the market overpays for what he holds" has a live alternative explanation in
004's open N0 position skew.

## Open questions

1. Does a counterparty-facing surface earn a place at all in the off-season, or is this a
   September-onward tool? The window column and the posture labels only really move when rosters do.
2. Ordering rows by their best asset at the position is a stable rule with no protagonist, but it
   buries him mid-board on three of the four positions. Is finding himself by highlight enough?
3. The expansion shows the four players the two boards disagree about most *across that team's whole
   roster*, not just at the filtered position. That is more useful and less consistent. Which wins?
