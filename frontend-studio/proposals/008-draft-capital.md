# 008 — Your draft capital: the missing position group

*Studio, 2026-07-24. Self-directed (standing licence, strand 1 — outsider product thinking).
Nobody asked for this.*

---


> **CLOSED 2026-07-24, did not land.** David: *"we dont have 4 rounds we only have 3 — lets stop
> here. you've tried but we need a fresh perspective."* His dynasty rookie draft is **three rounds**;
> every one of his sixteen picks is a 1st, 2nd or 3rd, and Studio's own first-pass table showed that
> before any of this was designed. Seven versions, five domain corrections, none landed.
>
> **Do not resume this framing.** Read the revision log at the foot before reusing anything — the
> craft got better every version while the underlying misunderstanding did not, which is the actual
> lesson. What survives is independent of the framing: the engineering findings in `008-RELAY.md`
> (still verifiable, still un-relayed), the measured +14–17% market premium on the 2027 class, and
> the self-derived draft-capital outcome dataset together with the two traps found in it.

## Problem

David is the 12th-of-12 team in a rebuild. He holds **16 future picks — more than any other team
in the league** (next-largest: 11; thinnest: 5). In the market's own units that is roughly **a
third of his entire franchise**.

The app renders that third as **a count**.

- The 006 front door's hero says "16 picks."
- "What you hold" is position groups QB → RB → WR → TE. **Picks have no home in it at all** — a
  structural gap in a skeleton David and I already approved.
- League Pulse carries the full pick list in its payload (`team_values[].future_picks`), origin
  team included, and renders none of it.
- Trade Lab is the only surface where a pick appears, and only if you already know to search for it.

That would be a modest omission if the sixteen were interchangeable. They are not:

> **The market prices his best pick at 6.4× his worst — and the biggest single driver is not the
> round. It is which team the pick came from.**

His own 2027 first, projecting **1.01**, is worth an estimated **5,769** — which would make it the
**second most valuable asset he owns**, behind Ashton Jeanty (7,166) and ahead of Jaxson Dart
(5,170). The 2027 first he acquired from Kissane's Team (currently 2nd of 12) projects **1.11** at
**1,989**. Same year, same round, **2.9× apart**, and the app shows both as the same number.

## Evidence

All of this is reproducible from the running app and the cache it already maintains.

**1. Our model prices every pick as one of exactly two numbers.**
Across all 12 teams and all 3 future drafts, `future_picks[].xvar` takes exactly two distinct
values:

| | round 1 | round 2 | round 3 |
|---|---|---|---|
| 2027 | 11.1553 | 0.1076 | 0.1076 |
| 2028 | 11.1553 | 0.1076 | 0.1076 |
| 2029 | 11.1553 | 0.1076 | 0.1076 |

No origin team, no year discount, and **no separation between a second and a third**. The payload
is candid about it — every pick carries `pick_value_resolution: "round_tier"` and the caveats
`generic_future_pick_round_only` and `pick_value_floored_at_replacement`.

**2. The market — the same market the app already displays — has all three.**
`POST /api/trade/reconcile/market` on a bare year+round returns FantasyCalc's generic price:

| | round 1 | round 2 | round 3 |
|---|---|---|---|
| 2027 | 2,907 | 1,510 | 1,048 |
| 2028 | 2,153 | 1,277 | 938 |
| 2029 | 1,865 | 1,228 | 953 |

- A first is **1.93×** a second. Our model says **103.7×**.
- A second is **1.44×** a third. Our model says **1.00×**.
- A 2029 first is **0.64×** a 2027 first. Our model says **1.00×**.

**3. FantasyCalc publishes slot-level prices, and the app already caches all of them.**
`app/cache/fantasycalc/market_values.json` contains 48 individual picks, **1.01 through 4.12**, for
the nearest draft. Within round one alone: **1.01 = 6,893 → 1.12 = 2,249, a 3.06× spread.** The
app's cache keeps them; no surface reads them.

**4. The flat model is not merely imprecise — it is biased against exactly David's team profile.**
Valuing his 16 picks slot-aware rather than round-generic raises the total from **25,747 to
33,359 — +29.6%**, because he is the worst team and owns 11 of his own picks. A contender's
portfolio would be over-counted by the same mechanism in reverse. The generic view systematically
**understates a rebuilder's war chest**, which is the one thing a rebuild is made of.

**5. Why this matters in the category.** Every serious dynasty tool prices picks by slot, not by
round. KeepTradeCut and FantasyCalc both publish 1.01–4.12 ladders precisely because "a first" is
not a unit of value. The whole rebuild trade — aging veteran out, young pick in — is denominated in
picks. A tool that cannot tell a 1.01 from a 1.12 cannot price the transaction its user's entire
season is about.

## The question ladder

*Rebuilt 2026-07-24 after David rejected the first two regions: "the first two boards make hardly
any sense to me… what questions do I ask, why do I ask those questions, what do the answers help me
do." He was right, and the post-mortem is at the foot of this file.*

| # | What he asks | Why he asks it | What the answer lets him do |
|---|---|---|---|
| **1** | **When does this capital actually arrive — and will my team still be good when it does?** | The rebuild is a bet on timing. Accumulating capital that matures after your core has aged out is how a team rebuilds forever. | Decide whether to keep hoarding future picks or start converting them — and **which years' picks are the ones to spend**. |
| **2** | **What is each one actually worth?** | Sixteen picks is not sixteen of anything. A 1.01 and a 1.12 are different assets, and he is about to negotiate with both. | Know what he is holding before someone offers him "a first." |
| **3** | **What could all of it buy?** | Picks are only worth what they convert into. This is the trade question. | Judge whether a consolidation move is even reachable. |

Two questions I considered and **cut**, because I could not answer "what does it let him do":

- *"Am I first in the league in picks?"* — a leaderboard. Knowing he is first changes nothing he
  does. It was the old region A.
- *"Where does our model disagree with the market on pick value?"* — a real and important finding,
  but it is a **critique of our model, not a tool for him**. It belongs in the engineering brief,
  not on his screen. It was the old region B.

## Proposal

Give draft capital a first-class region built around questions 1–3, in that order.

1. **"When does it land?"** — one time axis, 2026→2035. Above: the share of the value he holds today
   that is inside its position's peak age band, season by season — his roster's window (2028–2032).
   Below: one row per pick class, marking when it drafts and when those rookies are in their own
   prime. A single recessed band spans both panels, so **overlap reads as geometry**. The finding:
   the overlap shrinks with every class — 3 seasons for 2027, 2 for 2028, 1 for 2029. None of them
   is early. He is buying his second team while the first one is peaking, which is the argument for
   spending the furthest-out picks rather than collecting more.
2. **"What is each one worth?"** — *the region David validated, unchanged.* All 16 on one shared
   value axis, grouped by draft year, each with the range across a ±3-place finish, and **his own
   players drawn as vertical rules for scale**. Click any pick → it expands in place to its full
   12-slot value curve, our model's number, and the player it sits beside in the market.
3. **"What could it buy?"** — two sentences, not a chart. All 16 picks ≈ 33,359, roughly his top
   nine players combined. The three 2027 firsts ≈ 10,903, just under Jeanty plus Dart at 12,336.
   One fact each; prose is the right form.

Part 2 is still the piece I care most about: it is the first time in this app that **a pick and a
player appear on the same axis**. "Is this pick worth more than Dart?" is a question David can only
answer today by opening two surfaces and doing arithmetic in his head.

## Prototype

`008-draft-capital/prototype.html` — self-contained, real data throughout, app tokens and typefaces,
inline row expansion using the 007 disclosure recipe, no verdicts, no red/green.

**Encodings, and where they come from:**
- Magnitude is carried by **position** everywhere (Mackinlay / Cleveland–McGill: the most accurately
  read channel). No area, no saturation-for-value.
- Overplotting is resolved by **stacking, never transparency** — and a stack is only labelled "at
  exactly this price" when the values are genuinely identical, never when it is a proximity dodge.
  (David, 2026-07-21: overplotting is a failure, not a texture.)
- The ±3 band is **recessed ground** with no border (uncertainty-shading practice), so it never
  competes with the point estimate.
- The board's 16 rows share **one fixed value→pixel scale**, so the player rules line up into a
  continuous ruler and any two rows are directly comparable — the same shared-scale fix as the
  confirmed 004 N4 and the deepened card's value-now mark.
- Slot curves are **zero-based and labelled "0"**, so a near-flat third-round curve reads as "slot
  barely matters in round three" rather than as a truncated axis.
- Both lanes present, comparison leading (standing doctrine, 2026-07-21).

Palette re-validated on this dark surface: model/market ΔE 25.1 protan, 22.7 tritan, all six checks
pass.

## Costs — honest

- **The projected slot is an inference, and I have said so on-surface three times.** It comes from
  each origin team's *current roster value rank*, not from standings — no games have been played.
  The ±3-place band is a **stated display assumption**, not a modelled confidence interval. If
  engineering considers even a banded inference too strong a claim, the fallback is the honest
  generic price, which loses the entire finding.
- **The slot ladder is borrowed across years.** FantasyCalc publishes slot prices only for the
  nearest draft. I take the *slot shape* from the 2026 board and the *year level* from FantasyCalc's
  own generic year+round price. Nothing is invented, but the shape of the 2027 ladder is assumed to
  match 2026's.
- **The league snapshot is 31 days old** (2026-06-23). Pick ownership and every origin team's
  standing come from it. Any trade since then is invisible here. This is the same freshness defect
  already relayed as 003; it now has a second surface depending on it.
- **This adds a region to a front door that is already long.** I think picks earn it for a
  rebuilder specifically; for a contender with four picks it would deserve much less space. The
  region should probably scale with the size of the portfolio.
- **Our lane is genuinely weak here and the surface says so plainly.** That is uncomfortable to put
  in front of the user, and I still think it is right — showing 11.1553 sixteen times is more
  honest than hiding it.

## Open questions

1. Is the ±3-place finish band the right honesty device, or should the surface show the **full
   12-slot range** for every pick and refuse to pick an expected slot at all? The second is more
   honest and much less useful.
2. Should this be a region of the front door, or its own surface reached from it? I have built it as
   a region because the rebuild thesis is incomplete without it, but it is the longest region by far.
3. Does the market's generic year+round price already embed an *average* slot assumption? If it
   does, my slot-aware total is not strictly additive with it, and the +29.6% figure needs
   restating. **I could not determine this from the app; it is a question for the market source.**

---

## v4 — the research David ordered, and three things I had wrong

David, on v3: *"that's not really how it works in dynasty fantasy football… do some research about
dynasty rookie drafts and 1st round picks in dynasty rookie drafts — then come back to the league
here and my roster here and try again."* He also corrected a terminology error: every draft after
the **startup** is a **dynasty rookie draft** — rookies only, the class that just came off the NFL
board. Different thing entirely, and one of my searches was contaminated by startup-draft material.

### What I had wrong

**1. I never checked the roster rules.** The league is **20 active (9 starters + 11 bench) + 4 IR +
2 taxi = 26**, and taxi is **rookies-only, one year** — a slot type that exists specifically to
absorb rookie picks. He is one over in an offseason where being over is legal, with until Week 1 to
resolve it. My "you must shed ten players" was wrong on the rule and on the timing.

**2. Room was never the constraint, and the market says so.** His **bottom ten players are worth
8,033 combined — less than his top three picks (13,743)**. Nine of the ten are NFL third- and
fourth-rounders. Dropping a bubble player for a rookie first is not a cost; it is an upgrade.
David's argument — *"I will likely not have a problem dropping players in favor of my first round
draft picks"* — is straightforwardly correct on the measured numbers.

**3. I said the round boundary was nearly meaningless. That is the opposite of true.** I read
adjacent market prices — a 1.12 (2,249) is only 5% above a 2.01 (2,134) — and mistook *price
continuity between two adjacent picks* for *value continuity across rounds*. They are different
things, and the published outcome data is emphatic:

| rookie-draft round | hit rate | market price | cost per startable player |
|---|---|---|---|
| 1st | **47.6%** | 2,907 | 6,107 |
| 2nd | **31.0%** | 1,510 | **4,871** |
| 3rd and later | **7.0%** | 1,048 | **14,971** |

Source: NBC Sports / Rotoworld, **504 rookie picks, 2010–17**, 12-team PPR six-round dynasty rookie
drafts; a "hit" is at least one season as a top-12 QB/TE or top-24 RB/WR. Corroborated
independently by Advanced Sports Logic: **29 of the top 42 dynasty assets came from the top 15
rookie-draft picks**, against only six from 2.04–3.12.

### v5 — the chart that contradicted its own footnote

The first v4 hero plotted **cost per startable player** (market price ÷ hit rate): 1st 6,107, 2nd
4,871, 3rd 14,971, captioned *"shorter is better."* David: *"your saying shorter is better which is
weird and then the 2nds are shorter than the firsts?? wtf man."*

Two failures, one of them serious:

1. **The encoding was inverted.** Length meant *worse*. Longer should mean more.
2. **The metric was invalid, and I had already written the reason down.** The chart's own footnote
   read: *"a hit is binary — it counts a league-winning 1.01 and a flex-only 2.10 the same, which
   understates the firsts."* Dividing price by a binary hit rate treats a league-winner and a flex
   body as one unit, so cheap picks win by construction. **I noted the flaw in the caveat and then
   made it the headline.**

The underlying habit is the one worth keeping: **I kept collapsing a pick into a single number so I
could draw a bar** — cost per hit, expected hits, value per pick. Every one of those averages away
the only thing that makes a first-round pick valuable. A rookie pick is an option with a fat right
tail; the 1.01 is not worth 3× the 1.12 because it hits more often, but because the top of its
outcome range contains a league-winner and the 1.12's does not. **An option cannot be represented by
its average.**

**v5 hero:** one bar per pick, length = the chance that pick returns at least one startable season,
**longer is better**, zero baseline, grouped by round, his own picks marked. Deliberately **one
source** for the bars rather than fusing studies with different definitions and eras into a stacked
mark. The within-round-1 slot premium — **1.01–1.03 ≈ 42% "stud" rate against ≈ 21% for 1.04–1.06**,
reported by Dynasty League Football — stays in **prose, unfused**, with the honest note that the
primary is paywalled and the figure is cited as reported. Three of his picks project into that top
band.

### v7 — the fat tail, derived instead of borrowed

The thread David greenlit: the tail was stranded in prose because two outside studies with
different definitions could not honestly be fused into one mark. The fix was not a cleverer chart —
it was **a dataset I could compute on myself**. The app already had one:
`app/data/training/prospects_with_outcomes_v3.csv`, every drafted QB/RB/WR/TE with NFL draft slot
and realized fantasy points.

**Two traps caught before drawing anything.**

1. **Round-dependent survivor bias.** The file's `best3of4_ppg` is only populated for complete
   four-year arcs — 358 of 874. Filtering to those would have kept **94% of round 1 and 50% of round
   4+**, and the 195 excluded mature-class players have a **median career total of 0 points**. They
   are washouts, not "too recent." Using `total_points` (seasons 2–4, populated for all) over the
   full mature population keeps them in. Restricted to classes **2015–2021**, every one of which has
   had four seasons — per `craft/metric-validity.md` §D, mixing unresolved recent classes with
   resolved old ones is the musician-mortality error.
2. **A position-mix confound, caught by the validity gate's check 6.** My first cut used an absolute
   points threshold pooled across positions and read **25% / 9% / 1% / 1%** — a 25× gap between
   rounds one and three. But **round one is 35% quarterbacks** against 8–13% elsewhere, and only
   quarterbacks clear a high absolute points bar — **no tight end in eleven draft classes did**. The
   metric was substantially a QB detector. Cutting **within position** (top 15% of your own
   position) removes it.

**The corrected result, n = 553:**

| | top-15% players | rate | 95% interval |
|---|---|---|---|
| Round 1 | 34 of 72 | 47% | 36–59% |
| Round 2 | 22 of 65 | 34% | 22–45% |
| Round 3 | 19 of 79 | 24% | 15–33% |
| Round 4+ | 10 of 337 | 3% | 1–5% |

**The real cliff is between round three and round four, not between the first and the third.** Rounds
one to three are a gradient; everything after is a different asset class. Both the naive and the
controlled numbers are left on the surface rather than one quietly replacing the other.

**The mark**, per `craft/uncertainty-viz.md` §A/§D: a **countable unit chart** — one dot per real
player, tail dots leading so they can be counted from a fixed anchor, highlighted by size, ring and
lightness rather than colour alone, with the **frequency sentence** ("34 of 72") beside each row and
a 95% interval. Not a proportion bar, because a proportion bar cannot be counted; not a summary
statistic, because the whole failure of this proposal was summary statistics.

**The gap that remains, stated on-surface:** this is **NFL** draft capital, not dynasty
rookie-draft position. They are different boards. An early rookie pick is how you buy *access* to
the early-NFL-capital tier, and that link is what the chart rests on.

### v6 — the year axis I had measured on day one and then dropped

David: *"there is a recency bias — draft picks that are closer to real time hold a higher value
because they have more demand on the trade market and more certainty… there are exceptions i.e. the
2027 draft is 'loaded' and that's been the expert consensus for 2 years."*

I had measured this in the first hour of the engagement — it is in the relay as "no year decay" —
and then built three successive surfaces around round and slot while dropping year entirely. The v5
chart showed all five firsts at an identical 48%, which silently claims a 2029 first equals a 2027
first. It does not.

**The discount, measured** (FantasyCalc generic year+round, read live 2026-07-24):

| | 2027 | 2028 | 2029 | 27→28 | 28→29 |
|---|---|---|---|---|---|
| 1st | 2,907 | 2,153 | 1,865 | **−25.9%** | **−13.4%** |
| 2nd | 1,510 | 1,277 | 1,228 | −15.4% | −3.8% |
| 3rd | 1,048 | 938 | 953 | −10.5% | **+1.6%** |

The discount is steep in round one, mild in round two, and has **stopped working entirely by round
three** — a 2029 third prices *above* a 2028 third, because a third is already near the floor and
has little certainty left to lose. That nuance is on the surface.

**The 2027 exception, and it validates independently three times.** Take the 2028→2029 gap as the
ordinary one-year step and carry it back: a 2027 first *should* cost 2,485. It costs **2,907 — 17%
above trend**. The same premium appears in round two (**+14%**) and round three (**+14%**). Three
rounds agreeing within three points is not noise — **the market is pricing the 2027 class above its
own trend, exactly as the consensus David describes says it should.**

**And that is where his capital sits:** **9 of 16 picks in 2027 — 64% of the portfolio by market
value**, concentrated in the premium year. Which cuts both ways, and is his call: the picks most
worth keeping if the class delivers, and the picks that fetch the most today if he would rather
convert them.

**v6 hero:** three small multiples, one per round, **on a single shared price scale** — within a
panel you read the year discount, across panels the round cliff. One constructed mark on the whole
chart: a dashed tick at what 2027 would cost on the ordinary one-year step, so the premium is
something you see rather than something I assert. Stated as a counterfactual, not a forecast. The
app cannot verify "loaded class" itself; it can only show the market pricing 2027 above its own
trend.

### What that means for this roster

- **Five firsts carry 57% of the portfolio's value and 55% of its expected starters.** The six
  thirds are 19% of the value and project to **0.4 of a startable player between them**. Across all
  sixteen picks he is buying roughly **4.3** startable players.
- **A startable player is cheapest through a second (4,871), not a first.** Thirds cost **3.1×** as
  much per starter as seconds — that is where the trade filler is.
- **His own roster is the mechanism, measured:** **9 NFL first-rounders carry 53% of his roster's
  market value** (Jeanty, Dart, Garrett Wilson, Mendoza, Odunze…), against 17.7% / 16.2% / 9.5% /
  3.7% for rounds 2/3/4/6. Draft capital is exactly why rookie picks are worth holding.

### The calendar, which he described and the literature confirms

Published dynasty trade-window guidance matches David's own account: rookie picks bottom out
**September–November** (contenders discount future capital to chase a title) and peak
**February–April** as draft coverage builds; productive veterans peak **November–December** when
contenders pay for playoff-ready assets. The rebuilder's documented play is to sell aging veterans
into that November peak and buy picks in the autumn trough — the trade he said he makes.

The app's own capture corroborates the direction: his sixteen picks are **down 1.6% over 30 days**
(26,167 → 25,747). The seasonal percentages are other people's claims; the drift is measured.

**Honest limits on all of the above:** the hit rates are 12-team PPR, **not superflex** — his league
is superflex, which raises QB value and probably lifts early firsts above these rates. A "hit" is
binary: it counts a league-winning 1.01 and a flex-only 2.10 identically, which understates firsts.
And the market history in this app reaches back only 29 days, so it cannot verify the annual cycle
itself.

## The audit that should have come first (v3, 2026-07-24)

David, after v2: *"take a step back and re-think what you should be visualizing here — and what data
should be visualized."* So I sorted every mark on the surface by **how far it sits from a measured
number**:

| On screen | Status | Source |
|---|---|---|
| pick ownership + origin team | **measured** | Sleeper traded-picks reconstruction |
| slot ladder 1.01–4.12 | **measured** | FantasyCalc, 48 prices, cached daily |
| generic year+round price, 30-day trend | **measured** | FantasyCalc |
| our model's pick xVAR | **measured** | the app (and flat) |
| roster capacity 27 / 26 | **measured** | `/api/roster/capacity`, live |
| player market values | **measured** | FantasyCalc |
| projected finishing slot | inferred | from team roster value — one step, market-standard |
| the ±3-place band | assumed | an arbitrary display choice |
| peak age bands QB/RB/WR/TE | prior | aging-curve literature, not this roster |
| "a rookie is 22, prime +3…+6y" | assumed | crude — early for a QB, late for an RB |
| "your roster in its prime" curve | **constructed** | three assumptions stacked, projected ten years out |

The pattern is exact: **everything David rejected was built from the bottom of that table;
everything he kept was built from the top.** The timing curve was four assumptions producing one
smooth, confident-looking line — the same error as the flat window bar he made me concede on in the
evidence cards, in a new costume. It has been **deleted from the prototype**, not demoted.

### What the measured data actually says

Three findings, each straight off a live endpoint or the cache, none projected:

1. **He cannot roster what he owns.** 27 players against a 26-man cap — *one cut is already
   required, today, before any pick arrives*. Nine picks land in the 2027 draft alone; to keep all
   nine he would have to shed ten players. **These picks are not inventory. They are currency he is
   obliged to spend.** This is arithmetic from two live endpoints and zero assumptions, and no
   surface in the app puts the two numbers next to each other.
2. **It is three picks and a tail.** The top 3 of 16 hold **41%** of the portfolio's value; the
   bottom 8 hold 28%. All three of the top ones are his **own** firsts — the ones that are only that
   valuable while he stays bad.
3. **"A first-round pick" is not a unit of value.** The market's ladder falls **34% from 1.01 to
   1.02**. A 1.12 (2,249) is worth **5%** more than a 2.01 (2,134) — the round boundary everyone
   negotiates around is nearly meaningless, while the gap *inside* round one is 3.06×.

Finding 1 is, I think, the thesis — it reframes the portfolio from "a nice war chest" to "which
three am I keeping, and what am I turning the other thirteen into?" It is also the only one of the
three that changes what he does this month.

**v3 state:** the constructed region is gone. What remains on the surface is the three measured
facts as prose, and the board — the region he validated. I have deliberately **not** built a third
chart before he confirms the thesis; I have guessed wrong twice and the cheap step is to check the
reading first.

## Revision log

**v1 → v2, 2026-07-24.** David, on v1: *"the first two boards make hardly any sense to me. please go
back to the drawing board — like we did when we rebuilt the opening surface — what questions do I
ask, why do I ask those questions, what do the answers help me do. the bottom section makes more
sense to me."*

He was right on both counts, and the two failures were different:

- **Region A (league capital standing) was a leaderboard with no consequence.** It answered "am I
  first in picks?" — a question whose answer changes nothing he does. Worse, it ranked teams by a
  number the rest of the surface argues is wrong. **Cut entirely.**
- **Region B (two boards, market spread vs our model's two towers) was a critic finding dressed as a
  user module.** It is a chart about *our model's weakness*. He cannot act on it. This is the exact
  error named in DAVID.md on 2026-07-22 — *"Studio keeps smuggling critic findings into the user
  surface"* — and I shipped it again anyway. **Moved to the engineering brief (P1), where it was
  always supposed to live.**

Both failures share one root cause: I designed A and B **from what I had found** rather than from a
question he would ask. The bottom section survived precisely because it started from a real question
("what is each of these actually worth?"). The v2 top region starts from the question underneath the
whole rebuild — *when does this arrive, and will I still be good?* — which turned out to be
answerable from data the app already has, and to have a non-obvious answer.

One thing v2 caught in self-review that v1's habits would have shipped: the first draft of the new
region asserted *"only the 2027 class reaches its prime inside your window."* The 2028 class overlaps
it by two seasons. The copy now **counts** the overlap instead of asserting it, and the finding is
better for being a gradient rather than a binary.

---

*Companion engineering brief: `008-RELAY.md`.*
