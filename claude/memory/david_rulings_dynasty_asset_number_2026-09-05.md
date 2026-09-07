---
name: david_rulings_dynasty_asset_number_2026-09-05
description: "David's 2026-09-05 rulings that redefined the product: build the DYNASTY ASSET number (production x how long it lasts x scarcity), the scale is irrelevant and only relative accuracy matters, replacement = the next player ACTUALLY AVAILABLE, the bar moves on availability shocks, NFL postseason excluded."
metadata:
  node_type: memory
  type: feedback
---

**The day the product was re-pointed.** David asked whether all three lanes had drifted from the point, then gave
the sharpest test anyone has put to this model and ruled four times off it.

## ⭐ THE FRAMING RULING — typed, not selected, so these ARE his words

> *"I don't care about the points of the value; they can be on a scale from 1 to a million or one to a hundred…
> All I care about is that they are accurate with respect to how much value each player gets relative to the
> other players."*

He said it **three separate times** and a lane kept answering in points anyway. **Stop reporting movement in
points.** Report ORDER, and report which CARDS CHANGE WHAT THEY SAY. His own probe, typed:
**Josh Allen, Jahmyr Gibbs, Bijan Robinson as the top dynasty assets in superflex — "probably Josh Allen" first.**
If the model disagrees that is explicitly fine; it has to be defensibly accurate.

**HOW HE WANTS TO USE IT (typed, and it is the product spec):** a cardinal value so trades add up
(*"a player is worth 1222 … the player available in a trade is worth 1300"*), a positional rank so it is legible
(*"we're ranking the player the 22nd wide receiver … they're trading for the fourth overall wide receiver"*), and
**the MARKET'S rank shown beside ours**, because the other manager may believe something different. The gap
between the two is the decision. This is his 08-30 *"both prices, plainly"* ruling restated.
⚠ **The market data for this ALREADY EXISTS** — `universe_market_divergence_latest.json` carries `market_value`,
`overall_rank` and `position_rank` from FantasyCalc for **27 of his 27** players and 269 of 274 league-rostered.
**It reaches 0 of 12,227 rows of the served runtime.** The comparison he described is a wiring job, not a build.

## RULING 1 — BUILD THE DYNASTY ASSET NUMBER (option selected)

Shown both orderings the one-season model supports, he took **neither**: *"Both boards answer a one-season
question."* The stated reason: **both put McCaffrey (30) in the top four and Henry (32) above Hall (25).**
The number is **what he produces × how long that lasts × how scarce that tier is**. This IS his 08-31 Phase 2,
and the contend/rebuild toggle falls out as the discount rate — it was never a separate feature.

## RULING 2 — REPLACEMENT = "THE NEXT WHO IS ACTUALLY AVAILABLE" (typed)

He rejected two framings first, and both objections were right:
1. *"You have to find an exact player… I feel like that might be wrong."* Correct — replacement is a **line on the
   production curve**, read off at a rank. The player at that rank is a measuring stick, not a substitute.
2. *"Wouldn't the replacement player just be the next player on the list at that position?"* Refuted on his own
   board: Smith-Njigba sits barely above Chase, Chase comfortably above St. Brown, so gap-to-next-man makes Chase
   worth several times the player ranked ABOVE him. **The deeper reason he accepted: the next player on the list
   is already owned.** Trade Chase and you do not receive St. Brown.
3. *"But the availability will change — FAs change all the time in Sleeper."* **Measured and refuted: ZERO
   movement.** Across 51 daily snapshots 07-16 → 09-04 the best available player never changed at any position —
   Spencer Rattler / Audric Estime / Marvin Mims / Colby Parkinson, every single day, while rostered counts churned.
   ⛔ **Greg's "use a structural rank instead" was WRONG and must not be revived** — the league does not roster in
   our model's order (Rattler is our QB37, unowned), so it prices a different player and quietly stops meaning
   what he ruled. **Build the literal ruling off the live pool.**

## RULING 3 — THE BAR MOVES ON AN AVAILABILITY SHOCK, NO SMOOTHING

A routine waiver pickup is a non-event (≤0.68 ppg). A genuine top-20 cut moves the line **QB +4.62 · RB +4.74 ·
WR +3.68 · TE +0.22** and reprices **5 / 5 / 13 / 3** of his players. He took it **knowing his board can shift
because one manager rage-dropped somebody.** When it fires in-season, say it is the ruling working — do not
explain it after he asks. ⚠ TE barely responds; its line already sits high relative to what TEs produce.

## RULING 4 — NFL POSTSEASON EXCLUDED from the startable-season count

⚠ His fantasy playoffs are weeks 15-17 and were **already counted**. This only ever concerned weeks 19-22, which
no league scores: 255 of 3,348 seasons (7.6%), **non-directional** (128 in, 127 out). Scope differs from DG-024's
all-games ruling, which governs a model FEATURE, not a finish table. Both stand.

## ⭐ RULING 5 — THIS SEASON COUNTS ("build it", 2026-09-05 ~08:3x EDT)

A drift audit found the shipped formula summed **h=1..5 only** — valuing 2027-2031, with the season starting
Thursday entering **only as a scaling factor, not as a season you get.** Nobody chose that: Fred added an h=0
term, computed it wrongly as `served/proj` (broken on clamped rows), was told to remove it, and removing it took
this season out with it.

**He was shown the choice and ruled "build it" — count this season.** The football argument he was given: if you
trade for a player this morning you get him this year too, and leaving it out systematically punishes exactly the
FRONT-LOADED players he complained about (McCaffrey, Henry). The alternative offered and declined was to keep it
a pure look-ahead and rethink the toggle instead.

    V = (served − bar_served) × [ 1.0 + Σ over h=1..5 of d^h · R(h) ]

⛔ **h=0 enters at weight 1.0 — NOT a computed availability term.** `R(0) = 1.0` by the cell file's own
definition, confirmed independently by the reproduction adjudicator. **Availability is already inside `served`
and must not enter twice.**

⭐ **AND THIS IS WHAT MAKES THE CONTEND/REBUILD TOGGLE REAL.** Contending means caring about THIS season; with no
h=0 term there was nothing for the toggle to weight up. Every board anyone saw before this ruling was `d=1.0`,
**the rebuild extreme** — a contend view had never been computed for any player. Gaps 1 and 2 close together.

⚠ **THE ZERO AND THE BLANK ARE DIFFERENT SENTENCES.** 351 of 490 priced players read exactly `0.0` — correct by
definition, since the bar is the best player he could sign for nothing and most of the database sits below it
(on HIS league it is 9 of 273, down from 76 before the zero-floor fix). **Zero = "not worth a roster spot over
free agency." Blank = "we cannot price him."** They must not render alike.

⚠ **CORRECTION TO WHAT HE WAS TOLD:** the number is TWO moving parts, not three. Greg described it as
production × longevity × preference; Bob's correction folded survival into the trajectory term, and preference
sits at a default. Greg reported survival dropping out without reporting that consequence.

## ⭐⭐ RULING 6 — A THIRD-PARTY PROJECTION IS A MARKET PRICE (2026-09-06, TYPED — his words)

> ***"market price is 3rd party points projection or ranking of a player — projection and price are very similar
> its a main variable in price. you have to replace those points and or value."***

**This EXTENDS 08-31 ruling 8 rather than restating it.** The question was put to him because all four sources he
sent blend third-party projection providers (Dynasty Nerds a median of five; FantasyFootballAnalytics named as
most accurate in a r/fantasyfootball thread; the Reddit dynasty author uses Sleeper per-stat projections). **Greg
argued a projection is a football forecast rather than a price and RECOMMENDED ALLOWING IT. David refused.**

His reasoning is the ruling: a projection is *a main variable in price* — trade a player away and you must replace
those points, so projection and price are the same object from two sides.

⛔ **CONSEQUENCE: we do not get to buy our way out of DG-162.** The model reads three columns and a free consensus
beats it; the remedy is a better model on football data, not a borrowed forecast. **Do not re-propose ensembling
external projections.** Tracked as DG-173: the existing `PROHIBITED_COLUMNS` ban four named value/rank columns and
would NOT catch `sleeper_projection` or `fantasypros_ecr` — ban the CLASS and assert it.
⚠ Translating market values into his league settings on the COMPARISON lane remains allowed (DG-169).

## ⭐ THE FOUR SOURCES HE SENT, 2026-09-06 — what they settled

**⛔ NOBODY IN THE FIELD MODELS CAREER LENGTH FROM DATA.** Dynasty Nerds: *"I am unaware of any data source that
projects past the current year"* — he substitutes FantasyPros consensus and a fixed cliff age per position (RB 28,
WR 30, TE 30, QB 34, eyeballed from Pro Bowl appearances). The Reddit author borrows crowd trade values and does
not model longevity at all. **Our measured survival curves are the one thing here nobody else has.**

⭐ **THE PROVENANCE OF THE UNSOURCED CONSTANTS IS SOLVED.** The Reddit post's "Standard League" table — 12-team
SuperFlex **0.5 PPR**, 0 TEP, **THREE starting WRs** — reads **QB 25 · WR 53 · RB 33 · TE 13**, which is our old
shipped `ENGINE_B_VAR_THRESHOLDS` exactly, all four. Somebody took that row. **His league is FULL PPR with TWO
starting WRs** (verified 09-06 from Sleeper: `rec: 1.0`, no TEP, `[QB,RB,RB,WR,WR,TE,FLEX,FLEX,SUPER_FLEX]`).
Fred's independent re-derivation (QB 25 · RB 29 · WR 45 · TE 13) lands within a rank or two of the post's own
full-PPR row once TEP is removed — strong outside corroboration. See DG-166, DG-169.

⚠ **THE BASELINE DEPTH QUESTION IS OPEN IN THE FIELD, NOT SETTLED AGAINST US.** Four published discussions, no
resolution; a commenter raises David's exact deep-bench objection and is never answered. Our bar sits BETWEEN
Dynasty Nerds' starter and reserve lines. Resolution filed as DG-171: compute both.

**How to apply:** he answered "go with your recommendations" on 3 and 4 only after being shown the cost in his own
currency. That is the pattern that works — recommendation plus the concrete cost, never a menu. He rejected two
`AskUserQuestion` screens in a row when they carried point values.
See [[david_rulings_thresholds_and_anchor_2026-09-04]], [[david_rulings_ranking_2026-08-31]].
