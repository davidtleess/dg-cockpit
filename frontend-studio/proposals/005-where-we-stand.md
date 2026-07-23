# 005 — Where we stand

*Studio, 2026-07-22. Self-directed thread. Prototype: `005-where-we-stand/prototype.html`.*

---

## The one-line version

The product's stated mission is to show our rankings beside the market's. Measured against the
running app today: **our side of that comparison has not changed a number in 25 days, has no
published rank at all, and its two candidate ranking bases disagree with each other about 40% of
players by more than 50 places.** The comparison the product exists to make is not currently
well-defined. This proposal builds the surface that would make it, and reports what the data says
while we do not have one.

---

## Problem

### P1 — The default screen is named for a thing that cannot happen

Dynasty Genius opens on **Daily What-Changed**. It has a market region and a model region.

The model region is empty. Not "empty today" — empty by construction, for the whole life of the
capture record.

Verified three independent ways:

| Path | Result |
|---|---|
| `GET /api/league/what-changed` (live, 2026-07-22) | `daily_diff.model.deltas` → `[]` |
| `app/data/what_changed/what_changed_latest_report.json` | `status: "vintage_changed_no_score_delta"`, `vintage_changed: true` |
| `app/data/model_forward_capture.db`, all 29 days | last day-transition on which **any** `dynasty_value_score` changed: **2026-06-27** |

Across the full 29-day window (2026-06-24 → 2026-07-22) exactly two transitions moved a model
value, both in June. Between 2026-06-27 and today, **zero of 581** scores changed, and **zero of
12,200** `projection_2y` values changed. Model ranks shifted once more, on 2026-07-10, but only
because the population went 583 → 581 — no value moved.

Over the same window the market re-ranked **370 of 452** players overnight, and roughly 80% of the
board every single day.

So the daily screen has one lane that moves and one that cannot. That is precisely the shape David
ruled against on 2026-07-21: *"a market move alone is not actionable; the juxtaposition is the
product... any surface whose top-line finding is 'the market did something' is incomplete by
construction."* The app's **default** screen is that surface, every morning.

**This is not a claim that the model is broken.** A model built on prior-season production
*should* be flat in July; there are no new games. The defect is that the product's primary frame is
daily change while its own analytical lane is, correctly, a constant — and that the 09:30 job
restamps `semantic_output_hash` and `artifact_vintage` every morning, so provenance asserts a
freshness the numbers do not have.

### P2 — "Our rank" does not exist, and the two candidates disagree

The app publishes `dynasty_value_score` and `xvar`. It publishes no overall model rank; the only
overall percentile is `xvar_percentile_overall` (the coverage block calls it
`overall_percentile_internal_xvar_only`). To compare against the market I had to derive a rank.
Both available bases produce a board — and they are not the same board:

- Median distance between a player's xVAR-rank and his DVS-rank: **26 places**
- Players more than 50 places apart on our own two numbers: **135 of 340 (40%)**
- Largest single disagreement: **144 places** (Kenyon Sadiq, TE, 21 — xVAR #193, DVS #49)

The eight largest internal disagreements are all tight ends aged 21–23.

### P3 — Neither of our boards has the shape of a Superflex board

Position mix of the top 25, same 340 players, three boards:

| Board | QB | RB | WR | TE |
|---|---|---|---|---|
| Ours, ranked by xVAR | 3 | **15** | 7 | **0** |
| Ours, ranked by DVS | 1 | 6 | 6 | **12** |
| The market | **9** | 7 | 7 | 2 |

The xVAR board's top ten is **nine running backs**; it contains no tight end in the top 50. The DVS
board floods the top 25 with tight ends. Both carry 1–3 quarterbacks where the market carries 9.

Our #1 overall is a 29-year-old running back the market ranks 38th. The market's #1 — Josh Allen,
in a league where you start two quarterbacks — is our #8 on one basis and outside our top 25 on the
other.

The likely root cause is not a modelling error but a missing input: **the market board is priced
for this league and ours is not.** FantasyCalc is fetched at `numQbs=2&numTeams=12&ppr=1`. The
model has no league-settings input at all — by design, since market fields cannot be model
features. So an overall-rank comparison sets a league-specific list against a league-agnostic one,
and the QB column is where that shows up hardest.

**This supersedes my own 004 N0.** I relayed the QB/TE position skew as possible evidence of a
Superflex *scaling artifact in the market*. Two corrections. First, the direction: 004 measured the
gap in percentile space, where our population is 23.7% TE and the market-matched population is
18.2% TE — that composition difference inflates TE percentiles on our side. Re-measured in matched
rank space, **the TE sign flips** (004 reported TE +13.6; matched rank space gives −27.5). The QB
sign holds. Second, the cause: the asymmetry is better explained by our board having no league
settings than by the market's board being distorted by them. The market is configured correctly for
this league. We are the ones with no configuration. N0 as relayed was measured in a contaminated
space and should be withdrawn and replaced.

### P4 — Where we do disagree with the market, it is one axis: age

This is the finding worth designing around, and it survives every control I could apply.

Rank gap = market rank − our rank; positive means our board is higher on him.

Within **Engine B alone** (removing the prospect model entirely), by age band:

| 20–23 | 23–25 | 25–27 | 27–29 | 29+ |
|---|---|---|---|---|
| −22.0 | −2.5 | +3.0 | +15.0 | +28.0 |

Monotone. And it holds inside every position independently:

| | under 24 | 24–27 | 28+ |
|---|---|---|---|
| QB | −44 | −18 | +3.5 |
| RB | −1 | +44 | **+67** |
| WR | −12 | +4 | +28 |
| TE | −55 | −29 | +18 |

Every position, same direction: the market is higher on the young, we are higher on the old.
Steepest at running back, which is also where dynasty's own aging-cliff convention is sharpest
(the app's code already encodes RB cliff 26).

It holds at roster level too. Across the 12 teams, Spearman between a roster's median age and its
median rank gap is **0.643**. David's roster is the youngest in the league (median 23.0) and sits
at −28.5 — the market prices his players about 28 places above where our board puts them. For a
rebuilding team holding young assets, that is the single most consequential structural fact in the
data, and no screen currently says it.

Overall agreement is nonetheless high: Spearman 0.853 between the xVAR board and the market.
The disagreement is not noise; it is one clean axis.

**What that axis actually means — corrected after research (see References).** My first framing of
this was that we and the market disagree about age. That is too flattering to us. The dynasty
market applies a large, monotone, per-year age discount *on top of* current production, and it can
be measured: regressing FantasyCalc's own dynasty value against its own redraft value plus age —
which holds this-season production constant by the market's own reckoning — gives a discount of
**−6.6%/year for RB, −6.1% WR, −5.8% TE, −3.0% QB** (superflex, n=124, stable across four value
cutoffs). The ordering is the same one the production literature finds: RB steepest, QB flattest.

That reorders the inference. **A production-based model meeting a dynasty market will produce a
residual that is positive for old players and negative for young ones, by construction.** Our age
gradient is the expected signature of what we built, not a discovered edge and not a defect. It is
also not novel in the category: FantasyCalc already ships `Dynasty Value` / `Adj Dynasty Value` /
`Adj Dynasty Diff` as adjacent columns on its research page.

And the market's premium has a defensible mechanism behind it, which we should not talk past.
Harstad's mortality-table work argues that aging is not gradual decline but a rising annual hazard
of catastrophic loss — among 100 retired elite RBs and WRs, a ~50% decline rate in final seasons,
with survivors nearly flat across ages. If that is the true shape, a young asset is worth more not
because he will score more next year but because he is far less likely to be worth *zero* in year
three — and a model projecting central tendency systematically under-prices that. Add opportunity
churn a production model cannot see (NFL clubs have halved the number of RBs paid $12m+/yr) and
the option value of an unresolved outcome.

The honest position: the *direction* of the market's age discount is well justified; its
*magnitude* is genuinely contested — first-round rookie picks hit at only 47.6%, and Footballguys'
own trade-value analyst has written that the youth pendulum has swung too far. That contested
magnitude is exactly the space where a model-vs-market view earns its keep. But we should present
the gradient as *our model's known signature*, not as a finding about the market.

---

## Proposal

Stop framing the analytical surface around *change*, which only one lane can supply, and frame it
around *standing*: our board against the market's, with the market as the thing in motion and our
board as the fixed reference it moves against.

Concretely, the surface the app does not have and every product in the category leads with — **the
rankings list** — with our lane and the market's lane side by side in rank space, and nothing else
on the page measured in any other unit.

Three parts:

**1. Two boards, stated plainly.** A fixed-shape strip: each board's size, how much it moved
overnight, and the position mix of its top 25. It renders identically every day. On a quiet day it
says so with numbers rather than with an absence. The mix line is where P3 becomes visible without
a word of editorial — the reader sees `0 TE` and `15 RB` against `9 QB` and draws his own
conclusion.

**2. The age axis, as an instrument.** Four position panels, every player drawn, age on x, rank gap
on y, median line per age. Same shape every day; the only thing that moves it is the market. Roster
solid, league hollow.

**3. The board.** All 340 shared players. Our overall rank and positional rank against the
market's, a fixed-scale gap track on every row, the market's 29-day rank line, filters for
position / who holds him / age, every column sortable, and inline row expansion carrying the
two-lane readout, the internal xVAR-vs-DVS disagreement where it is large, and the players he sits
beside on *each* board by name.

Two deliberate encoding decisions:

- **One colour encoding on the entire page**, and it is not good/bad — it is *which board is
  higher*. Model blue, market amber, the app's constitutional hues at hue 255 and 75, lightness
  stepped to 0.65 so the pair passes the CVD and lightness-band checks (validator: all pass,
  ΔE 25.1 protan / 26.1 normal on the dark surface). Green/red appears only on rank-movement
  arrows, inside David's 2026-07-15 ruling.
- **Our rank carries no movement indicator, ever** — a dim en-dash where the market's arrow would
  be. The frozen-model fact is then learned by scanning 340 rows, not by being told once in prose.
  Instrument, not headline.

---

## Prototype

`005-where-we-stand/prototype.html` — self-contained, real data, the app's own typefaces and
tokens, headshots served from the running app with initials fallback. 340 players from today's
`universe_pvo_runtime.json` (13:30 UTC) joined to today's FantasyCalc capture, with 29 days of
market rank history per player. `data.js` is generated, not hand-written; the build script is
reproducible from the two artifacts.

---

## Costs — honest

1. **The surface needs an engineering change to exist for real.** It requires a published overall
   model rank comparable to the market's. That was already asked and accepted as 001b N-series; this
   proposal raises the stakes on it, because P2 shows the choice of basis is not cosmetic — it
   changes the top of the board completely.
2. **My ranks are derived, not authoritative.** I rank by xVAR over the 340 shared players because
   that is what the app's own overall percentile uses. If engineering names a different basis, every
   number on this page moves. I have shown the DVS alternative rather than hiding it.
3. **Absolute rank gap compresses at the top of the board.** "Consensus #1 is our #8" is a 7-rank
   gap and reads as small on the track, while a 7-rank gap at #200 is noise. The positional ranks in
   each row and the neighbour lists in the expansion are the partial fix; a scale-free gap encoding
   is unsolved and I am not going to pretend otherwise.
4. **Overall-rank comparison is contaminated by league settings** (P3). The within-position
   comparison is clean; the overall one is the number David asked for. I have shipped both and said
   which is which on the page itself.
5. **It replaces a daily habit with a standing one.** If the model does begin moving in season —
   and it should, once games accrue — a change-led screen becomes defensible again. This surface
   does not become wrong then, but it stops being the whole answer.
6. **I withdrew one of my own previously-relayed findings** (004 N0). That is a cost to my
   credibility and I would rather pay it now than have engineering find it.
7. **I had to correct my own framing of P4 after research.** I first wrote the age gradient as a
   disagreement between us and the market. It is better read as the known signature of a production
   model priced against a market that discounts age. The measurement did not change; what it means
   did. Noted rather than quietly rewritten.

---

## Open questions

1. Which number is "our rank"? Until that is answered the flagship comparison has no denominator.
2. Should the model receive league settings as an input? It cannot take market *values* as
   features, but "12 teams, Superflex, PPR" is a league configuration, not a market price. If that
   distinction holds, the QB gap in P3 is fixable; if it doesn't, overall-rank comparison should be
   retired in favour of within-position comparison and the product should say so.
3. Is a daily surface the right cadence at all in the off-season? 004 asked this twice and it is
   now answered by measurement rather than opinion: with one lane frozen for 25 days, daily is the
   wrong unit until games start.
4. Does the age gradient in P4 represent an edge, or the model failing to price career length?
   Research says the null hypothesis is the second one — the gradient is the expected signature of a
   production model meeting a market that discounts age 3–7%/year. Distinguishing edge from
   signature needs the realized-outcome loop that switches on in September. Until then the surface
   should describe the gradient, not claim it.
5. Should the page carry a named tier ladder? Dynasty Nerds already ships one in exactly the prose
   form David mandated — *Elite Dynasty Assets · Core Dynasty Pieces · Strong Starters · Solid
   Contributors · Depth / Upside · Roster Fringe* — as banded rows, not a per-row label. That is a
   researched, real-world ladder rather than an invented one, and it is the obvious next iteration.
   Held out of v1 deliberately: tier boundaries need calibration and I would rather ship rank-space
   clean than add a second scale before the first is agreed.

---

## References

**Category structure.** FantasyCalc research grid ships market value, model value and a signed
difference as adjacent columns (`Dynasty Value` / `Adj Dynasty Value` / `Adj Dynasty Diff`) —
fantasycalc.com/research. DLF ships six ranker columns plus per-ranker freshness dates and
availability filters (My Team / Rostered / Free Agent) — dynastyleaguefootball.com. Dynasty Nerds
ships named tier bands, sortable headers, a per-row σ "Spread" disagreement bar, and an inline
per-source breakdown — dynastynerds.com/dynasty-rankings. KeepTradeCut ships numbered tiers and a
30-day trend caret — keeptradecut.com/dynasty-rankings. **Nobody in the category filters or sorts
by age**, which is why the age instrument here is the part with no precedent.

**Aging curves.** Apex Fantasy Leagues, RB peak age 25.46 (n=343 qualifying seasons, 2000–2025) and
QB peak 28.5 split 30.7 pocket / 26.1 dual-threat (n=158) — apexfantasyleagues.com. Fantasy Points
(Ryan Heath), career-year indexing, RB Years 2–6 flat peak and Year 7 first below baseline; TE
sophomore breakout; WR peak Year 5 — fantasypoints.com. 4for4 production curves by position. PFF
aging curves (Barrett 2018, n=87 WR). Footballguys RB shelf life (2000–2021).

**Youth premium.** Measured for this proposal from FantasyCalc's paired dynasty/redraft books
(api.fantasycalc.com, 2026-07-22): −6.6% RB / −6.1% WR / −5.8% TE / −3.0% QB per year of age with
production held constant. No published, methodologically transparent study of the dynasty age
discount was found — this appears to be thin ground in the literature.

**Counter-argument.** Harstad's mortality tables (footballguys.com) — aging as rising hazard rather
than gradual decline. DynastyProcess concedes its own values are `10500·e^(ECR·−0.0235)`, a pure
transform of human ECR, and names age handling as inherited rather than modeled
(dynastyprocess.com/values). Rookie first-round hit rate 47.6% (NBC Sports).

**Terminology caution:** "RB dead zone" is a redraft ADP term for rounds 3–6, not an age concept.
Not used here.

---

## Revision log

- **v2 (2026-07-22)** — reframed from data-first to usage-first after David's review of v1. His
  reaction: the top module's value was unclear and the age-scatter panels were unreadable ("who are
  the players in blue vs orange? who is the filled dot?") — the anonymous-marks failure my own
  2026-07-21 note warns against. Root cause: v1 was built from where the *variance* lived (age), not
  from David's *daily question ladder*. The decisive finding forcing the reframe: the universe-wide
  model-vs-market "buy low" list is a nursing home (Kareem Hunt 30, Keenan Allen 33, Zach Ertz 35,
  Darren Waller 33) — because the raw gap is mostly just the age premium, so sorting by it re-sorts
  by age. A naive juxtaposition is therefore an artifact, not a signal, for a rebuilder.
  **The v2 surface:** a named, roster-first daily board — his players, our positional rank vs the
  market's (positional is age-neutral *within* a position, so it isn't a hidden age sort), a gap bar
  with a hollow tick at last week's gap so state and drift live in one mark, and a toward-you /
  pulling-away drift tag as the only daily signal. The anonymous age scatter is cut from the daily
  view; the full 340-player board is demoted to a scouting section that names the age caveat in its
  own subhead. Answers "what should I analyze every morning": the market's overnight verdict on the
  assets you hold, against your model's standing view.
- **v1 (2026-07-22)** — first draft. Measurement-led: variance was computed across time, position,
  age, engine, ownership and value quartile *before* any axis was chosen, per the method rule
  self-imposed on 2026-07-21. Age won (42-rank spread of group medians, monotone); time lost
  decisively (one lane frozen 25 days) and was removed from the design rather than plotted flat.
  Correction made mid-build: an initial "12 days frozen" figure was rank-based; re-measured against
  values, the correct figure is 25 days, and the 10 July rank shift was purely compositional.
