# 008 — Your draft capital: the missing position group

*Studio, 2026-07-24. Self-directed (standing licence, strand 1 — outsider product thinking).
Nobody asked for this.*

---

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
