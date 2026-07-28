# 011 — What is he, in words you'd actually say?

**Status:** built 2026-07-27, self-directed (strand 1). **v2 adds the second lane** at the
client's request ("both side by side, without an apples-to-oranges comparison; no arbitrary
tiering"). Not approved.
**Relay:** none authored yet — see *Why there is no relay brief* at the foot.
**Prototype:** `011-what-is-he/prototype.html` (self-contained; `ladder-data.js` beside it).

---

## Problem

The app expresses every player as a proprietary number — DVS, xVAR, a percentile, a
raw market value. None of those is a thing a dynasty manager says out loud. Asked what
a player is, a manager answers in slot language: *he's a low-end QB1*, *she'd price him
a high-end WR2*. That vocabulary is the category's shared coordinate system, and the
app does not speak it anywhere.

There is a second, sharper gap underneath it. The vernacular is generic — "WR2" means
the same thing in every 12-team league. But whether that slot is a **starting job**
depends entirely on the lineup the league actually runs, and this league runs an unusual
one.

The app does read `roster_positions` — `roster_cut_engine.py` counts active slots from
it, `team_value_matrix.py` feeds it to `optimize_best_legal_lineup`, and
`trade_lab/reconciler.py` uses it for the capacity penalty. What it does not derive from
it is a **per-position startable depth**: how many quarterbacks, receivers or tight ends
this lineup actually consumes each week, and therefore where replacement level falls at
each position. That number is what turns a generic rank into "good enough to start
*here*", and no surface carries it.

## Evidence

**The league.** `Redzone Champions League`, 12 teams, full PPR (`rec: 1.0`), no TE
premium. Lineup: **QB 1 · RB 2 · WR 2 · TE 1 · FLEX 2 · SUPER_FLEX 1 · BN 11** —
9 starters per team, 108 weekly starting slots league-wide.
(Source: `app/data/research/league_behavior/raw/2026-07-19/season_2026_1314363401744416768/league.json`.)

**Where "startable" actually ends.** Applying Harstad's generalized positional-baseline
formulas (Footballguys), parameterised by that lineup, PPR coefficients:

| pos | dedicated starts | incl. superflex | replacement level | naive vernacular tier 1 |
|---|---:|---:|---:|---:|
| QB | 12 | **21.0** | **QB33** | QB12 |
| RB | 24 | 24 | RB39 | RB12 |
| WR | 24 | 24 | **WR52** | WR12 |
| TE | 12 | 12 | **TE22** | TE12 |

The superflex slot converts QB2 into a starting job — roughly 21 quarterbacks hold a
weekly slot in this league, not 12. At the other end, TE is only ~22 deep before
replacement, while WR runs ~52 deep. Those four numbers are why "I have 14 receivers"
and "I have 3 tight ends" are not comparable statements.

**The vernacular's blocks are not the market's breaks.** Measured across the four
FantasyCalc superflex boards (399 priced players, captured 2026-07-26): of the 32
largest single-step value drops, **exactly one lands on a twelve-boundary**
(RB24→RB25, −8.9%, itself only the 6th-largest RB break). The real cliffs sit at
TE4→5 (−26.6%), RB2→3 (−26.1%), QB27→28 (−22.6%), WR3→4 (−18.0%).
So the tier *names* are a coordinate system and the *cliffs* are the structure —
two different objects, and the surface should show both rather than conflate them.

**The roster, placed on it.** 27 held, 26 priced by the market:

| pos | held | clear replacement | start-grade here | top-12 | must field |
|---|---:|---:|---:|---:|---:|
| QB | 5 | 3 | **2** | 1 | 2 |
| RB | 4 | 2 | 2 | 1 | 2 |
| WR | **14** | 5 | **3** | **0** | 2 |
| TE | 3 | 1 | 1 | 1 | 1 |

Nine of the fourteen receivers do not clear replacement level in this league. The
14-WR "surplus" is three startable receivers and eleven that clear no bar — which is a
materially different statement from a count. At QB he holds exactly the two start-grade
arms the lineup demands, with no third.

## Proposal

One instrument, four panels, same shape every day.

Per position: the market's real value curve over the **entire priced population**
(69 QB / 109 RB / 153 WR / 68 TE — nobody filtered out), **x = positional rank with
best on the right**, **y = value as a share of that position's #1**. Beneath the curve,
the vernacular twelve-blocks as recessed bands, named. Cut through it, two labelled
reference rules — how many start weekly here, and where replacement falls. The
largest measured cliffs marked where they actually are. His own players drawn bright
over the dimmed league, direct-labelled where they are start-grade.

Below the panels, one queryable list of every priced player — four **named views**
(each stating its question, never a bare axis control), sortable columns, inline row
expansion.

**Why y is a share of the position's #1, specifically.** FantasyCalc's superflex board
is its one-QB board times a fixed per-position constant. A within-position ratio
**cancels that constant exactly**, so this axis is invariant to the ×1.8711 QB
adjustment and all four panels can honestly share one scale.

## Prototype

`011-what-is-he/prototype.html` — real data throughout, app tokens and typefaces
verbatim, self-contained.

Encoding decisions and their grounding:
- **Position/length over area or saturation** (Cleveland–McGill, Mackinlay) — rank is
  spatial position, value is height; nothing is encoded in a colour ramp.
- **Direct labels, no legend** (Okabe & Ito) — every reference line is labelled on the
  graphic where it sits; dodged labels get leader lines so a label never becomes a
  floating word.
- **Square-root value axis, disclosed on the surface with its reason.** Measured: on a
  linear axis ~45% of every position piles into the bottom tenth of the height, and the
  middle half of the field occupies 15–31% of it. Sqrt roughly doubles that (RB
  15%→25%, WR 18%→28.5%, TE 19%→30%, QB 31%→42%) and removes nobody.
- **Crosshair scrubber, not per-dot hit targets.** 153 WRs across 488px sit ~3.2px
  apart; 9px hit circles overlap six deep and the last-drawn one swallows its
  neighbours, making most players unreachable. One scrubber with a nearest-rank lookup
  reaches every player at every density, and supports arrow-key traversal.
- **Lane hues taken verbatim from `tokens.css`.** The pair fails only the dataviz
  validator's glare-oriented lightness band and passes every legibility check
  (CVD protan ΔE 22.5, tritan 22.8, normal-vision 24.3, contrast ≥3:1).

Verified: 0 page errors, 0 SVG text overlaps (measured pairwise across every label),
0 clipped labels, no overflow at 390px or 1360px (DOM-measured), crosshair reaches 8
distinct players across 8 probes, keyboard traversal works, all four views and the
sort and the row expansion function.

## Costs — honest

1. **Where "startable" fades out is an estimate applied to the wrong kind of ordering,
   and it leans against young players — the opposite of what I first wrote.** The
   weekly-starts number is exact league arithmetic (QB's 21 excepted: it assumes ~3 in 4
   superflex slots hold a quarterback). Harstad's replacement level was derived for
   *seasonal points*; read against a *dynasty value* ordering it conflates who is good
   now with who is valuable later. The direction matters: a 22-year-old priced for his
   future ranks above his current production, so the surface **overstates** his present
   startability and **understates** an older player still producing. This is the weakest
   joint in the surface.

   **It cannot be validated in-app.** I checked whether FantasyCalc's
   `redraftDynastyValuePercDifference` could recover a redraft ordering to test it
   against: it survives in the raw cache on all 475 rows, but it is **unsigned and
   saturates at 100** (its extremes are all sub-$40 players where a tiny denominator
   blows the ratio up; correlation with age is only −0.193). Without a sign there is no
   redraft ordering to recover, and §4 rules out production data entirely. So the
   estimate stands unvalidated, and the surface says so.

   **What changed because of it:** the fade is drawn as a gradient with no far edge
   rather than a second crisp rule. A hard line asserts a sharp startable/not-startable
   cutoff the data does not contain — the binary within/without heuristic in Correll &
   Gleicher, *Error Bars Considered Harmful*, whose tested replacement is a gradient.
   The mark's form now carries its epistemic status: crisp where the fact is exact,
   fading where it is estimated.
2. **Curve shape at QB is borrowed from a format this league does not play.** Ordering
   and the y-axis are safe (a positive constant cannot reorder, and the ratio cancels
   it), but the *steepness* of the QB curve is a one-QB shape. The QB27→28 cliff must
   not be read as evidence about superflex scarcity.
3. **It is market-only, which is not the standard.** Our rank is withheld deliberately:
   the two lanes are ranked over different populations, and matching them moves average
   disagreement ~10.7 percentile points and takes the apparent systematic gap to zero.
   The surface ships a labelled pending lane instead of a number that would be wrong.
   This is the single biggest thing missing and it is missing on purpose.
4. **The twelve-block split into thirds** (high-end / mid / low-end = 4 players each) is
   a clean formalisation of loose usage, not a measured boundary. It is presented as a
   coordinate system, not as structure — but it is still a convention I chose.
5. **Depth-ruler lengths are not comparable across panels, and the design invites the
   comparison it cannot support.** Each panel's rank axis is normalized to its own pool
   (69 QB / 109 RB / 153 WR / 68 TE), so WR's 52-deep ruler and TE's 22-deep ruler render
   at 33.6% and 31.3% of panel width — near-identical lengths for a 2.4× difference. The
   depth spread is the surface's most useful cross-position finding and it is carried in
   **numbers, stated explicitly in the copy**, not in the bar lengths. The alternative —
   one shared rank axis across all four panels — would make the lengths honest but would
   leave the QB and TE panels 55% empty and halve the resolution where it matters most.
   I chose resolution and labelled the limit; it is a defensible call rather than an
   obviously right one.

6. **One rostered player is unpriced** (Rasheen Ali), so no tier can be assigned to him.
7. Uses the league snapshot at `league_runtime/runs/`, which is fresher than what the
   API serves on several surfaces.

## Open questions

1. Does the vernacular ladder carry enough on its own, or does it only become useful
   once our rank sits beside the market's in the same words ("market prices him a
   high-end WR2, we see a mid WR1")?
2. Is the replacement line worth its estimation risk, or should the surface show only
   the exact weekly-starts number and drop the Harstad line entirely?
3. Should the cliffs be promoted — currently they are quiet dotted marks, and they are
   arguably the truest structure on the board.

## Grain settled: COARSE, and the reason changed (2026-07-28)

The ladder stays coarse — blocks of twelve, with a tie bar wherever the model cannot
separate players. The surface does not change; the *justification* does, and it is now
much stronger.

**The old reason covered 23 players.** DVS saturates at 100.0 — 11 TEs, 6 WRs, 6 RBs tied
at the ceiling — so a finer sub-tier there would assert an order the number does not
contain. That argument is real but narrow, and it left **QB as an apparent exception**: QB
does not saturate at all (47 players, **46 distinct values, 97.9% resolution**, zero ties in
the top 24), and **none of the 11 finer cuts at QB falls inside a tie.** Superflex makes QB
the decisive position in this league, so that exception mattered.

**Measured, the exception is refuted.** A finer boundary sits on a gap of **0.50 points at
QB** (0.23 WR, 0.60 RB, 0.81 TE) on a 0–100 score. When the model actually revises a player
it moves him a median of **7.50 points** (10.6 WR, 9.4 RB, 9.9 TE). **The boundary is 12–46×
narrower than the model's own movement.** In directly interpretable terms, across the
revisions on record, finer sub-tier churn exceeds coarse-tier churn at every position —
**QB 34% against 19%**, nearly double.

**So the honest statement is not "the ceiling blocks a finer grain at the top of three
positions." It is that no sub-tier boundary at any position is wider than the noise in the
estimate it divides.** And **QB is the worst place to go finer, not the safest**: it fails
*invisibly*, with no tie bar to warn the reader, where TE at least draws its constraint.

**Limits on this measurement, which are not small.** Only 2 of 34 capture transitions show
any change, both are early population-build events, and the lane has been static since
2026-06-27. **The absolute churn rates are not projectable to a future model run and no such
claim is made here.** What is robust is the relative coarse-versus-fine comparison and the
order-of-magnitude gap between boundary width and revision magnitude — neither of which
depends on the churn rates. Working: `analysis/qb-grain.py`.

**Studio's own error, recorded.** I measured "97.9% distinct" first and came close to
reporting it as support for a finer QB ladder. **Resolution of the encoding says nothing
about resolution of the estimate.** Decimals produced by arithmetic are not precision.

## Why there is no relay brief

011 is a design proposal, and the measured facts inside it are either already relayed
(the market cache's unretained fields, 004/008) or are not defects.

I had flagged one candidate item — "no surface reads `roster_positions`" — and then
checked it rather than asserting it. **It is false and I have retracted it above:** the
field is read in three modules. What remains is a *capability gap* (no per-position
startable depth is derived from the lineup), which is a design proposal, not an
engineering defect, and it is already stated as such in the Problem section. Nothing
here warrants an engineer's time yet.


---

## v2 — both lanes on one ruler (2026-07-27)

The client asked for our rank beside the market's, without an apples-to-oranges comparison
and without arbitrary tiering. Those are two different risks and they needed two fixes.

**Risk 1 — different populations.** The lanes rank different players. Fixed by ranking both
over only the **337 they share** (62 market-only, 131 model-only). Rebasing shifts market
ranks a median of **2 places** (mean 4.4, max 20).

**Risk 2 — different rulers.** If each lane's tiers came from its own value distribution,
"our WR2" and "the market's WR2" would be different-sized objects — the deeper
apples-to-oranges. Fixed by taking the boundaries from **the league's starting structure**
(twelve teams, each fielding one starter at the position). They are a rule, not a taste
call, and they are identical for both lanes.

**And the measurement that decided how fine the ladder can be.** Our model's DVS saturates:

| pos | n | distinct DVS | tied at the ceiling |
|---|---:|---:|---:|
| QB | 47 | 46 | 1 |
| RB | 111 | 103 | **6** |
| WR | 199 | 182 | **6** |
| TE | 111 | 93 | **11** |

**Our model cannot rank its top 11 tight ends** — identical value, 100.0. xVAR is absent
from today's capture entirely, so DVS is the only rankable model quantity. A four-player
sub-tier like *high-end WR2* is therefore not merely a convention I picked; **at the top of
three positions it is undefined**, because there is nothing to sort by. So the ladder is
coarse by necessity, and ties are drawn as a **bar spanning the ranks the model cannot
separate** rather than given an invented order.

**Also measured:** across the last 30 daily captures our lane produced only **2 distinct
sets of values**. The market lane is today's; ours is effectively a month-old opinion. That
is defensible for dynasty value but it means the disagreement shown is structural, not news.
Extends the 005 frozen-model finding rather than contradicting it.

**New costs v2 introduces, on-surface:**
- Rebasing removes 62 + 131 players, **including four of his 27**, who have no comparison at
  all and are named at the foot.
- Tier names drift from the full market board by the median-2-places figure above.
- The disagreement view's top row is Keenan Allen (34.3, market WR107 / ours WR67, +40) —
  our lane liking old cheap players is the 005 age artifact showing through, not an edge.

**Open question this raises:** whether a coarse ladder that is honest about ties is more
useful than a fine one that is invented — or whether the ceiling saturation is itself the
finding, and belongs in a relay rather than a user surface.
