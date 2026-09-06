# DG-164 — How long does production last? The survival curve, measured

**Layer:** 3 · **State:** MEASURED — design + evidence, **no feature built** · **Lane:** Bob · **DG 3.0** · **dynasty asset number**
**Source:** David's dynasty-asset ruling 2026-09-05, relayed by Greg. The number is *what a player produces × how
long that lasts × how scarce that tier is.* This ticket is the middle term — the one the product has never had in
any form. Measured 2026-09-05 by Bob. **No code changed, nothing fitted to market price.**

---

## 0. FEASIBILITY GATE — asked first, and it passes decisively

Greg's instruction was to establish the panel reaches far enough before building on it, and to report it as the
answer if it does not. It does.

| | |
|---|---:|
| panel | **1999–2025**, 27 seasons, from `nflreadpy.load_player_stats` |
| player-seasons (QB/RB/WR/TE, REG) | **14,776** |
| age coverage (from roster `birth_date`) | **100%** |
| startable player-seasons | 3,348 |
| **cohort-year observations** | **14,880** across **925 distinct players** |
| cohorts with a full 5-year follow-up | **1999–2020** (22 cohort years) |
| observations at the hardest horizon (k=5) | **2,728** |

**Contrast with DG-162's ceiling.** The per-position feature models are fit on 264–910 rows and that is why more
features cannot help them. Survival is not built that way: every player-season in the panel is an observation of
*"was he still producing N years later"*, pooled across positions with position as a term. **2,728 observations at
k=5 against 264 for the QB model.** Fred's instinct was right — this is the one question in the product where the
data is genuinely sufficient, and it should be sourced from the panel, never from the model tables.

## 1. THE DEFINITIONS — each stated so it can be argued with

**STARTABLE** = finished in the **top N at his position by total regular-season PPR points**, with
N = **QB 25 / RB 33 / WR 53 / TE 13** (`ENGINE_B_VAR_THRESHOLDS` — the 12-team superflex full-PPR lineup
arithmetic David ruled as an order statistic, 08-31 ruling 3).

- **Not circular:** it references no model output, only the finish table. ✅ trap 2
- **Not the availability event:** deliberately not the ≥4-games label (77% base rate) that DG-163 measured as too
  coarse to carry a dynasty horizon. ✅ trap 2
- **Total points, not PPG:** a dynasty asset has to be available *and* good. The rate-conditional version is
  measured separately in §3 so the exit and the decline never get confused. ✅ trap 3
- ⚠ **REGULAR SEASON ONLY, and this differs in scope from DG-024.** David's "all games, postseason included" ruling
  governs Engine B's `ppg_t`, a model *feature*. This is a different quantity — *did he finish as a startable
  fantasy asset* — and fantasy leagues play the regular season. **Flagged for David rather than assumed.**

**COHORT** = everyone startable in season *s*, followed forward 1–5 years. **A player absent from the panel in
*s+k* is counted NOT startable, never dropped.** That is the guard against the 638-deleted-seasons defect that
created the original age bias. Years beyond 2025 are *excluded as unobservable*, never scored as a failure. ✅ trap 1

**NO MARKET PRICE ANYWHERE.** No valuation, ADP, KTC or FantasyCalc field was read. Nothing is tuned toward a known
answer. ✅ trap 4

## 2. THE EXIT CURVE — P(still startable in year k)

Pooled baseline across all positions and ages: **62.7% → 51.4% → 41.8% → 33.9% → 26.6%.** A startable player has
roughly a **one-in-four** chance of still being startable in five years. Split by position and age at the cohort
season, as **expected startable seasons in the next five** (the sum of the survival curve — the natural scalar for
"how long does it last"), cluster-bootstrapped on player, 90% intervals:

| age at t | QB | RB | WR | TE |
|---|---:|---:|---:|---:|
| ≤23 | 2.81 [2.36, 3.27] | 2.73 [2.38, 3.07] | **3.39 [3.12, 3.66]** | 2.55 [1.98, 3.12] |
| 24–25 | 2.88 [2.49, 3.24] | 2.23 [2.02, 2.46] | 2.67 [2.45, 2.88] | 2.05 [1.65, 2.41] |
| 26–27 | **3.21 [2.84, 3.54]** | 1.83 [1.58, 2.07] | 2.19 [1.96, 2.41] | 1.59 [1.20, 1.98] |
| 28–29 | 2.73 [2.32, 3.10] | 1.49 [1.23, 1.75] | 2.15 [1.88, 2.39] | 1.69 [1.17, 2.19] |
| 30–31 | 2.72 [2.35, 3.08] | 1.19 [0.92, 1.47] | 1.96 [1.70, 2.20] | 1.65 [1.10, 2.23] |
| 32+ | 2.08 [1.65, 2.42] | **0.50 [0.26, 0.70]** | 1.25 [1.04, 1.42] | 1.63 [1.01, 2.05] |

**Position is not a modifier on the age curve — it is a different curve.** A QB at 30–31 (2.72) has *more*
remaining horizon than an RB at 24–25 (2.23). A 32+ RB has **half a season** left, with a 5-year survival of
**0%** observed. The product currently expresses all of this through a single age coefficient on this season's
projection — and DG-162 measured that `aging_curve_value` is inert in all four served models anyway.

## 3. THE DECLINE IS NOT THE EXIT — and the decline is nearly flat

Of the players who *remain* startable, mean PPG as a share of their own cohort-season PPG:

| | y1 | y3 | y5 |
|---|---:|---:|---:|
| QB 30–31 | 100% | 103% | 103% |
| RB 30–31 | 99% | 89% | 74% |
| WR 30–31 | 101% | 91% | 89% |
| WR ≤23 | 116% | 116% | 114% |

**Conditional on still being startable, players produce at 74–117% of their old rate at every age.** Ageing in
fantasy football is overwhelmingly an **exit** process, not a fading process. The asset does not gently decay; it
works and then it stops. **This is the single most product-shaping thing in the ticket** — a value term built as
"multiply this year's points by a decay factor" would model the wrong mechanism entirely. The right shape is
*this year's production × the probability he is still there*, not *× a shrinking fraction of what he does*.

## 4. ELITE STATUS BUYS HORIZON — and it is worth years of age

Tier = finish rank as a fraction of the positional bar (elite = top 20% of the startable pool). Cells with n < 12
suppressed rather than reported:

| pos | age | elite (top 20%) | mid | fringe |
|---|---|---:|---:|---:|
| WR | 24–25 | **3.84** (n=41) | 3.12 (n=86) | 2.09 (n=146) |
| WR | 28–29 | **3.77** (n=40) | 2.44 (n=72) | 1.12 (n=99) |
| WR | 32+ | 2.24 (n=23) | 1.56 (n=38) | 0.69 (n=65) |
| RB | ≤23 | **4.39** (n=18) | 3.25 (n=32) | 1.82 (n=49) |
| RB | 26–27 | 2.56 (n=40) | 2.53 (n=55) | 1.04 (n=92) |
| QB | 28–29 | 3.77 (n=19) | 3.49 (n=26) | 2.02 (n=50) |
| QB | 32+ | 2.82 (n=15) | 2.74 (n=28) | 1.35 (n=49) |

**An elite 28–29 WR (3.77) outlasts a fringe 24–25 WR (2.09) by more than a season and a half.** Being good today
is worth more remaining horizon than being four years younger. There is no tier × age interaction anywhere in the
product today.

## 5. DAVID'S PROBE — both of his named complaints are resolved by this term alone

Using each player's **actual 2025 finish tier**, not the band average:

| player | pos | age | 2025 finish | tier | **E[startable seasons]** | 90% CI | n |
|---|---|---:|---|---|---:|---|---:|
| Jahmyr Gibbs | RB | 24 | RB3 | elite | **3.33** | [2.96, 3.70] | 37 |
| Bijan Robinson | RB | 24 | RB2 | elite | **3.33** | [2.99, 3.71] | 37 |
| Josh Allen | QB | 30 | QB1 | elite | **3.12** | [2.38, 3.78] | 15 |
| Breece Hall | RB | 25 | RB19 | fringe | 1.66 | [1.36, 1.94] | 110 |
| Christian McCaffrey | RB | 30 | RB1 | elite | **1.48** | [0.93, 2.00] | 9 |
| Derrick Henry | RB | 32 | RB8 | mid | **0.67** | [0.25, 1.00] | 7 |

- **McCaffrey, whom Fred showed survives every scarcity treatment at #2, falls decisively** — 1.48 against 3.33 for
  the two 24-year-olds. Two and a quarter times less remaining production. That is the defect David named, and the
  horizon term fixes it without touching scarcity.
- **Henry (0.67) drops below Breece Hall (1.66)** — David's other named complaint, also resolved.
- ⚠ **The horizon term does NOT put Allen first, and it cannot.** 3.12 [2.38, 3.78] against Gibbs 3.33
  [2.96, 3.70] — the intervals overlap almost completely, and Allen's cell is n=15. **This term separates all three
  from McCaffrey decisively and cannot separate them from each other.** If Allen belongs first it will be because a
  superflex QB1 season is worth more than an RB1 season — Fred's per-season value and scarcity terms, not mine.
  Anyone reading my table as a ranking is misreading it: **E[seasons] is a duration, not a value, and durations are
  not comparable across positions.**

## 5b. S(h) PUBLISHED, AND THE ELITE FINDING STRESS-TESTED

**Fred needs the vector, not the mean.** The discount rate is the contend/rebuild toggle: contend weights S(1) far
above S(4), and that weighting cannot be applied to an expectation after the fact. **59 cells at n ≥ 12 are
published to `survival_curves.json`**, keyed (position, ageband, tier), carrying S1…S5 and E. Cells below n=12 are
**suppressed, not smoothed** — for RB 30–31 elite and most of TE there is no honest cell, and a consumer must treat
those as missing rather than fall back to the band average.

**THE STRESS TEST.** The obvious objection to §4 is that it is mechanical: an elite player starts further above the
bar, so of course he takes longer to fall below it. Tested by replacing tier with a continuous **margin** — his
points that season over the points of the last startable player at his position. P(startable) averaged over k=1..5:

| margin over the bar | ≤23 | 24–25 | 26–27 | 28–29 | 30–31 | 32+ |
|---|---:|---:|---:|---:|---:|---:|
| 1.0–1.3× | 45% | 33% | 20% | 19% | 21% | 13% |
| 1.3–1.7× | 57% | 44% | 33% | 33% | 35% | 26% |
| 1.7–2.3× | 71% | 58% | 51% | 47% | 42% | 38% |
| 2.3×+ | 77% | 72% | 69% | 64% | 56% | 47% |

**Both effects are large and neither collapses.** Distance from the bar is worth 30+ points of survival at every
age; age still hurts at every margin. The strong form survives: **2.3×+ at 28–29 (64%) nearly doubles marginal at
24–25 (33%)**. The sharpest defensible sentence: **being far above the bar at 32+ (47%) is worth about as much
remaining production as being barely startable at 23 (45%)** — nine years of age, cancelled by being good.

⚠ **State it precisely.** Part of the tier effect IS definitional — the outcome is "stays above a fixed bar", so
starting further above mechanically helps. That is the mechanism a dynasty price should capture, not a flaw, but
the supportable claim is *"how far above the bar you are today predicts longevity as strongly as age does"* and
**NOT** *"elite players age better."* The second is a claim about ageing **rate** and this design cannot separate
it from a floor effect.

## 5c. ⚠ PUKA NACUA — the product does NOT return David's top three

| | |
|---|---|
| Puka Nacua, WR, age 25, 2025 finish **WR1**, **3.21× the bar**, elite | |
| S(h) | 90%, 87%, 79%, 67%, 62% |
| **E[startable seasons]** | **3.84, 90% CI [3.47, 4.20]**, n=41 |

**The highest duration of any player measured** at the time — above Gibbs and Bijan (3.33) and Allen (3.12).
⛔ **CORRECTED 2026-09-05 (Fred, self-caught): "Nacua is first on both terms" is NO LONGER TRUE** on the current
assembly — he is **5th this season and 49th on the career multiplier**, and Smith-Njigba is 9th and 41st. They
reach 1st and 2nd **by being good on both, not first on either.** That is a weaker claim and a more interesting
one: it says the product is doing something neither term does alone, which is the whole argument for building it.
The sentence was carried across three rebuilds unchecked — see §5aa.

This must be reported as the model's honest disagreement, not omitted. A disagreement the model can defend on both
terms independently is the "find where the market is wrong" edge David asked for (08-31 ruling 2). Omitting him
would make the apparent agreement an artifact of which players we happened to measure.

## 5d. THE REG-ONLY CHOICE, MEASURED — and a conflation corrected before it reached David

Fred flagged that a REG-only outcome would systematically underrate *"a player whose value is concentrated in
playoff weeks"*, with the errors compounding across both terms. **That conflates two different things, and the
literal version is not true.**

- **Fantasy playoff weeks are NFL weeks 15–17. They are INSIDE the regular season and are already fully counted.**
- What my definition excludes is the **NFL postseason, weeks 19–22** — which no fantasy league scores at all.

Measured across 1999–2025, both questions:

| definition | startable player-seasons | change vs REG-only |
|---|---:|---|
| **REG only** (mine) | 3,348 | — |
| REG + POST | 3,349 | **255 differ (7.6%) — 128 added, 127 dropped** |
| ranked on **weeks 15–17 only** | 3,353 | 1,731 differ (51.7%) — 868 in, 863 out |

**On (a): the choice is real but small and NOT directional.** 128 in against 127 dropped is as close to a wash as
the data can give. There is no systematic under-rating to compound, so the "errors compound rather than cancel"
concern does not hold for this choice — though the ruling is still David's, and 7.6% is not zero.

**On (b): the 51.7% churn is a three-week sample being noisy, not a signal we are missing.** Ranking dynasty assets
on a 3-game window would be mostly luck. It is not an argument for changing the outcome; if anything it is an
argument against it.

## 5e. THE TOGGLE IS NOT INERT — Fred's mechanism is right, his conclusion is a property of his probe

Fred measured the contend/rebuild discount across his six probe players, found **one swap across the whole range**,
and concluded the toggle is nearly a no-op. **His mechanism is exactly right — a discount only reorders two players
when their survival curves CROSS — and the conclusion does not follow.** Tested across all 59 published cells,
1,711 pairs, rebuild d=1.00 against hard contend d=0.55:

- **66 pairs reorder (3.9%).**
- **Maximum relative repricing the toggle can produce between two players: 1.74×** (most back-loaded cell
  RB ≤23 elite, V(1)/V(.55) = 4.22; most front-loaded RB 32+ fringe, 2.43).

Representative flips: `WR 32+ mid` over `WR 24-25 fringe` (0.747 → 1.031) · `RB 28-29 elite` over `WR ≤23 fringe`
(0.849 → 1.075) · `WR 32+ elite` over `QB 24-25 fringe` (0.953 → 1.247).

**Why his probe showed nothing: it contains no front-loaded player.** Nacua, Maye, Gibbs, Robinson, Hall are young
or prime, and Allen is a QB — the one position whose curve does not collapse. The archetype that crosses is the old
producer with high S(1) and collapsing S(4)–S(5), and **`RB 28-29 elite` is exactly that shape and IS published**
(n=23, S = 90/63/57/38/12, E=2.61). The archetype is not missing; it was missing from the six players he chose.

## 5f. HENRY IS NOW PRICEABLE. McCAFFREY IS NOT — and that is the finding, not a gap

Fred named three acceptable repairs and ruled out borrowing a neighbouring cell. Taking the two that are honest —
**a continuous margin instead of the tier**, and **a pooled 30+ tail band**:

| pos | age | margin | n | S(1..5) | E |
|---|---|---|---:|---|---:|
| RB | 28–29 | 2.3×+ | 15 | 86/71/65/37/11 | 2.70 |
| **RB** | **30+** | **1.7–2.3×** | **24** | **52/45/24/14/5** | **1.40** |
| RB | 30+ | 2.3×+ | **8** | 80/33/11/0/11 | *(suppressed)* |
| WR | 28–29 | 2.3×+ | 16 | 100/90/80/83/62 | 4.16 |
| WR | 30+ | 2.3×+ | 16 | 88/81/56/42/21 | 2.88 |

**Derrick Henry is solved.** 2025 margin **1.99× the bar** → `RB 30+, 1.7–2.3×`, **n=24**, **E = 1.40**. Above the
publishing bar, no borrowing required.

**Christian McCaffrey is not, and I am not going to invent him.** 2025 margin **2.97×** → `RB 30+, 2.3×+`, **n=8**.
The cell's own numbers give it away — S(4)=0% followed by S(5)=11% is noise, not football.

⭐ **But the n=8 IS the answer, and it is a better one than a number would be.** Since 1999 there have been **eight
running-back seasons** at age 30+ producing at 2.3× replacement. Eight, in twenty-seven years. **We cannot price
McCaffrey's horizon because there is almost no precedent for what he currently is** — and telling David that is
more honest and more useful than a curve fitted to eight players. It is also, separately, a reason to be cautious
about him that no fitted number would convey.

**Also visible here:** `WR 28-29 at 2.3×+` (E=4.16) beats `WR 24-25 at 1.7–2.3×` (E=3.68). The §5b result again,
on a cell structure that never saw the tier definition.

## 5g. THE MARGIN CELLS, PUBLISHED — independent confirmation, with one comparison downgraded

`survival_curves_margin.json` — **58 cells at n ≥ 12, 20 suppressed with their n listed** so a consumer can see
what is missing rather than infer it. Carries S1..S5, E, and a bootstrapped 90% interval on E. The header states
the definitions; suppressed cells **must not be backfilled from a neighbour**.

This structure never saw the tier cut, so it is a genuine second look at §4:

| cell | n | E | 90% CI |
|---|---:|---:|---|
| WR 28–29 · 2.3×+ | 16 | **4.16** | [3.75, 4.50] |
| WR 24–25 · 1.7–2.3× | 61 | 3.68 | [3.36, 3.98] |
| WR 24–25 · 1.0–1.3× | 103 | **1.81** | [1.53, 2.08] |
| WR 30+ · 2.3×+ | 16 | **2.88** | [2.30, 3.37] |
| WR ≤23 · 1.0–1.3× | 49 | **2.85** | [2.44, 3.23] |
| RB 28–29 · 2.3×+ | 15 | 2.70 | [2.01, 3.25] |
| RB 24–25 · 1.0–1.3× | 79 | 1.52 | [1.19, 1.86] |

**Two forms of the claim, and they are not equally strong — I stated them as one and should not have.**

- ✅ **STRONG, intervals fully separated:** an elite 28–29 WR (4.16 [3.75, 4.50]) against a *marginal* 24–25 WR
  (1.81 [1.53, 2.08]). Same at RB: 2.70 [2.01, 3.25] against 1.52 [1.19, 1.86].
- ✅ **STRONG, and the sentence for David — now stated as a BOUNDED EQUIVALENCE, not an absence of evidence.**
  "Statistically indistinguishable" is a *failure to reject*, not a finding of equality: with n=16 a real gap could
  hide inside the interval, and a reviewer would rightly say we had shown we cannot tell. **Bound the difference
  instead.** Direct bootstrap — players resampled once from the union of both cells, both cells recomputed inside
  each replicate, so any player appearing in both is handled:

  | comparison | overlap | difference | 90% CI |
  |---|---:|---:|---|
  | **WR 30+ 2.3×+ − WR ≤23 1.0–1.3×** | **0 players** | **+0.03** | **[−0.70, +0.69]** |
  | WR 28–29 2.3×+ − WR 24–25 1.7–2.3× | 7 | +0.48 | [−0.05, +0.96] |
  | WR 28–29 2.3×+ − WR 24–25 1.0–1.3× | 6 | +2.35 | [+1.86, +2.82] |
  | RB 28–29 2.3×+ − RB 24–25 1.0–1.3× | 4 | +1.18 | [+0.38, +1.88] |

  **THE SENTENCE: being excellent at 30-plus buys the same remaining production as being barely startable at 23 —
  to within seven-tenths of a season either way.** Against an E of ~2.85 that bound is about a quarter, small
  enough to mean something. This is a positive claim that survives "how do you know they are equal rather than
  merely unmeasured"; the earlier phrasing did not.

  *(Fred derived the same bounds independently by recovering standard errors from the marginal intervals and
  combining in quadrature: +0.03 [−0.64, +0.70], +0.48 [−0.01, +0.97], +2.35 [+1.88, +2.81], RB +1.18
  [+0.48, +1.89]. Every bound within 0.06 of the direct computation, and his independence assumption is exactly
  right on the load-bearing row, which has **zero** player overlap.)*

  ⚠ **The approximation's error has a direction and it is the unsafe one.** Shared players inflate the apparent
  precision of a difference built from two independent bootstraps, so quadrature **fails toward false
  confidence** — on the RB pair its lower bound is **+0.48 against the direct +0.38**. Harmless there; it fails
  hardest on comparisons sitting near zero, which is exactly the middle row we are not claiming. Quadrature is a
  sanity check and must never decide whether something separates.
- ⚠ **WEAKER than §4 implied:** elite 28–29 (4.16 [3.75, 4.50]) against *solid* 24–25 (3.68 [3.36, 3.98]) — the
  intervals **overlap**. Directionally right, not separated. §4's "an elite 28–29 WR outlasts a fringe 24–25 WR by
  more than a season and a half" is the fringe comparison and stands; **do not extend it to the solid comparison.**

## 5h. ⛔ THE FLAT-DECLINE FINDING IS TRUE OF PPG AND FALSE OF THE QUANTITY FRED MULTIPLIES

**This corrects §3, which is my own headline finding, and it changes Fred's arithmetic.**

§3 measured the decline in **points per game** and found it flat (pooled drift 3 points). Fred's term is
**value above replacement**, and VOR is a *difference* — so it is levered. A player at 15 ppg against a 10 ppg bar
has VOR 5; drop him 4% to 14.4 and his VOR falls 12%. Re-measured on the quantity that actually enters the product,
median VOR retention among players who are **still qualifying**:

| age at t | y1 | y2 | y3 | y4 | y5 | drift |
|---|---:|---:|---:|---:|---:|---:|
| ≤25 | 109% | 101% | 106% | 102% | 103% | −6p |
| 26–29 | 94% | 86% | 75% | 73% | **72%** | **−22p** |
| 30+ | 87% | 75% | 83% | 70% | **72%** | −15p |
| **pooled** | 95% | 88% | 86% | 84% | **84%** | **−11p** |

**So A is NOT constant across the surviving seasons, and `V = A × E[seasons]` overstates.** It overstates *most*
for players aged 26+, whose VOR retention falls to ~72% by year five while the under-25s hold at ~103%.

- ✅ **The direction is safe.** Correcting it pushes older players *further* down, which strengthens the McCaffrey
  and Henry conclusions rather than threatening them.
- ⛔ **The magnitude is not.** The collapse needs a measured retention vector, not a constant: `V = Σ_h dᵸ · S(h) ·
  A(0) · rel(h)`. Still computable and still explainable — *how long he lasts, and how much of his edge he keeps* —
  but it is no longer a two-factor product.
- **This is bar-independent** (pooled drift −11 under the lineup bar, −12 under the deep bar), so choosing a bar
  does not fix it.

## 5i. THE BAR QUESTION — recommendation, with the cost stated

David ruled replacement = *"the next who is actually available"* (Fred measures QB45 / RB82 / WR108 / TE42). Does
it govern the survival outcome too?

**Recommendation: yes, adopt the deep bar for S(h) — because mixing them double-counts the exit.** A back who is
RB40 in year three is counted *gone* by the lineup bar while Fred's term would still credit him positive value over
RB82. Multiplying a value measured against one line by a duration measured against another understates, and the
understatement lands on exactly the mid-tier players.

Measured effect of switching: pooled survival rises 63/51/42/34/27% → **70/57/47/37/29%**, and the VOR-retention
property is unchanged (§5h). **The published S(h) cells therefore all change** and must be regenerated at the deep
bar before Fred consumes them.

⛔ **THE COST, and Greg was right to ask.** The **McCaffrey rarity finding does not survive the switch.** At the
deep bar his margin is **14.03×** rather than 2.97×, and "RB aged 30+ at ≥2.3× the bar" goes from **7 seasons to
151**. The sentence is a property of the *starter* bar specifically.

**It is saved by labelling, not by choosing the bar for its sake:** keep it as a descriptive statement, explicitly
against the starter bar, outside the value formula. **Corrected count — I said eight and it is seven:**

> Since 1999, **seven** times has a running back aged 30 or older produced at 2.3× what the last startable back
> produced: Emmitt Smith 1999, Ricky Watters 1999 and 2000, Charlie Garner 2002, Curtis Martin 2004, Tiki Barber
> 2005, **Derrick Henry 2024**. McCaffrey is attempting the eighth. Between Barber and Henry there was a
> **nineteen-year gap.**

⚠ Also correcting: **whether McCaffrey is priceable depends on the cell structure.** Margin cells suppress him
(n=8 at 30+ / 2.3×+). Tier cells with a pooled 30+ band do price him: **E = 1.13, 13th percentile of RBs.** I
reported "not priceable" from the margin structure without saying that the tier structure prices him. Both are
honest; they must not be quoted interchangeably.

## 5j. NACUA WITHOUT A CROSS-POSITION DURATION CLAIM — use percentiles

Greg is right that E[seasons] cannot be compared across positions (WR53 and QB25 are different bars).
**Percentile of E within a player's own position is unitless and therefore cross-position safe.** Of the 2025
startable players whose cells clear n=12:

| player | pos | age | E | percentile within position |
|---|---|---:|---:|---|
| **Puka Nacua** | WR | 25 | 3.84 | **97th** of 50 WRs |
| Jahmyr Gibbs | RB | 24 | 3.33 | **97th** of 31 RBs |
| Bijan Robinson | RB | 24 | 3.33 | **97th** of 31 RBs |
| Josh Allen | QB | 30 | 2.91 | **58th** of 25 QBs |
| Derrick Henry | RB | 32 | 1.26 | 35th of 31 RBs |
| Christian McCaffrey | RB | 30 | 1.13 | **13th** of 31 RBs |

**The statement for David, with no cross-position duration in it:** *Nacua, Gibbs and Bijan all sit at the 97th
percentile of remaining career for their own position. Allen is at the 58th — a slightly-above-average horizon for
a quarterback. McCaffrey is at the 13th percentile for a running back.*

**And this reframes Allen honestly.** His horizon is unremarkable *for a QB*; what makes him valuable is that
quarterbacks last longer in general and a superflex QB1 season is worth more. **Both of those belong in Fred's
term, not mine** — which is the cleanest statement yet of where the two halves divide.

⚠ Nacua's 3.84 comes from the **tier** cell (n=41). The **margin** cell for his band is n=9 and suppressed. His
number is honest but rests on the looser of the two cuts, and that must travel with it.

## 5k. REGENERATED AT DAVID'S BAR — and the deep bar broke something I had to repair

Both 2026-09-05 rulings applied: **NFL postseason excluded** (already what §1 did — no change) and **replacement =
the next who is actually available**, QB45 / RB82 / WR108 / TE42.

**`survival_curves_deepbar_decile.json` — 205 cells at n ≥ 12, 35 suppressed with their n.** Supersedes all three
earlier files. The deeper bar more than doubles the cohort population: **33,240 cohort-year observations across
1,854 players**, against 14,880 / 925 at the starter bar. Pooled survival 70/57/47/37/29%.

⛔ **THE DEEP BAR COSTS DISCRIMINATION AT THE TOP, and quartiles hid it.** Against a bar that deep every startable
player sits far above the line, so a quartile of margin is enormously wide: **the RB Q4 bucket spanned 7.0× to
12.5×** and put **Breece Hall in the same cell as Gibbs and Bijan** — all three returning an identical E = 3.90,
when at the starter bar Hall was 1.66 against their 3.33. **The bar that makes the value term correct makes the
duration term blunt, and it goes blunt on exactly the elite players David cares most about.**

**Repaired with deciles**, which the larger population easily supports — 205 publishable cells against 79:

| RB cell | margin range | n | E |
|---|---|---:|---:|
| 24–25 · d7 | 5.2–6.5× | 60 | 3.32 |
| 24–25 · d8 | 6.5–8.7× | 51 | **3.68** ← Breece Hall (6.99×) |
| 24–25 · d9 | 8.9–18.7× | 42 | **4.24** ← Gibbs (12.35×), Bijan (12.48×) |
| 30–31 · d8 | 6.5–8.4× | 25 | 2.41 |
| 30–31 · d9 | 8.7–15.5× | 18 | 2.53 |

**The toggle also gets stronger at the deep bar with this resolution: 1,108 of 20,910 pairs reorder (5.3%) and the
maximum repricing rises to 2.52×**, against 3.9% and 1.74× at the starter bar. David's ruling made the
contend/rebuild control more useful, not less.

## 5l. ARE FIVE HORIZONS HONEST? YES — and the premise behind the doubt does not apply here

Greg asked twice for three-versus-five on the grounds that years four and five rested on an aging curve DG-162
measured as inert. **That premise is not true of this term.** Observations behind each horizon at the deep bar:

| | S(1) | S(2) | S(3) | S(4) | S(5) |
|---|---:|---:|---:|---:|---:|
| observations | 7,202 | 6,925 | 6,648 | 6,371 | **6,094** |
| distinct players | 1,854 | 1,802 | 1,731 | 1,673 | **1,611** |

**Every S(h) is directly observed from 1999–2020 cohorts. Nothing is projected, extrapolated, or fitted**, and
**this term reads no aging curve at all** — `aging_curve_value` being inert in the served models has no bearing on
it. S(5) rests on 6,094 observations across 1,611 players, which is more than S(1) had at the starter bar.

**So five horizons are honest for the survival half.** The retention vector rel(h) in §5h is likewise measured
through h=5. If the horizon is cut to three it should be for a product reason — what David wants to reason about —
not because the fourth and fifth years are unsupported. They are the best-supported thing in the ticket.

## 5m. THE TWO BARS WERE DIFFERENT QUANTITIES — Fred's cause is right, his fix is knife-edge

Fred found our margins disagree by ~4.6× on the same players (his Gibbs 2.66×, mine 12.35×) and traced it to two
independent differences. **Both are real; his diagnosis of the cause is correct and his proposed repair is not
robust.**

**(a) CONFIRMED — rank-82 on season TOTALS is a near-zero bar.** Measured, median across seasons:

| pos | rank | bar points | bar **games** | bar ppg |
|---|---:|---:|---:|---:|
| QB | 45 | 33.4 | **4.0** | 7.50 |
| RB | 82 | 31.1 | **8.5** | 4.01 |
| WR | 108 | 50.2 | 12.0 | 4.10 |
| TE | 42 | 53.3 | 12.0 | 4.01 |

The RB82 player is an **8.5-game** player scoring 31 points. Fred is right: season totals at that depth are
dominated by games played, so the bar is close to nothing and everything startable sits 10–18× above it.

**(b) ACCEPTED ON ITS MERITS — the margin should be a RATE, the outcome should stay on TOTALS.** His reasoning is
better than his prediction: totals **conflate good with healthy**, so as a conditioning variable standing in for
*"how good is he"* a rate is the cleaner quantity, while the survival *outcome* keeps totals because staying
available genuinely is part of lasting. Adopted.

**(c) REFUTED — a rate margin does NOT restore quartile sufficiency.** His prediction was that switching to a rate
would largely dissolve the resolution problem. It does not:

- The **top-quartile span is wider on rate, not narrower** — RB 4.6× against 3.9× on totals; WR 2.8× against 2.6×.
  The stretch at the top is a property of talent being heavy-tailed, not of the bar being near-zero.
- The concrete case that motivated deciles, tested both ways:

| bar | 2025 bar | Gibbs | Bijan | Hall | McCaffrey | Henry |
|---|---|---|---|---|---|---|
| RB82, rate | 3.35 ppg | Q4 | Q4 | **Q3** | Q4 | Q4 |
| RB60, rate *(Fred's literal reading)* | 5.84 ppg | Q4 | Q4 | **Q4** | Q4 | Q4 |

At RB82 the rate margin does separate Hall — **by 0.14× of margin**, with the Q4 edge at 4.01 and Hall at 3.87. At
RB60 **all five collapse into one bucket.** So quartile sufficiency is a knife-edge that depends on where the cut
happens to fall relative to the players in question.

**Deciles stay** — not because quartiles never work, but because whether they work is a property of the boundary's
accidental position, and that is not something to rely on. No single decile boundary is load-bearing.

⛔ **THE BAR DEPTH IS UNRESOLVED AND IS NOT MINE TO CHOOSE.** RB82 (structural) against RB~60 (the literal "best
genuinely unowned player") change the answers materially. I built at RB82 because it reached me through a relay;
Fred now recommends the literal reading and has sent that to Greg. **I am not regenerating a third time on an
unsettled spec.** The cells stand at RB82 and are labelled as such; when the depth is ruled, one regeneration.

## 5n. COVERAGE OF A TOP-30 BOARD — 7 blanks, in TWO categories that need different sentences

Checked the 30 highest-DVS players against the deep-bar decile cells. **7 come back blank, and lumping them
together would be a mistake — they fail for unrelated reasons.**

**Category A — no NFL season at all (3): Jeremiyah Love (RB 21), Harold Fannin (TE 22), Jadarian Price (RB 22).**
Not a sample-size problem and no threshold fixes it. They have no 2025 panel row, therefore no production, therefore
no margin, therefore no cell. ⭐ **This is a product-level gap, not a cell gap: the survival term cannot price a
rookie at all, and rookies are a core dynasty asset class.** Engine A exists precisely for players with no NFL
production; the horizon term has no equivalent and would need a college-to-NFL survival panel to get one. Worth its
own ticket rather than a footnote.

**Category B — cell suppressed (4), and three of the four are tight ends:**

| player | pos | age | cell | n |
|---|---|---:|---|---:|
| Brock Bowers | TE | 23 | ≤23 / d7 | 7 |
| Colston Loveland | TE | 22 | ≤23 / d6 | 7 |
| George Kittle | TE | 32 | 32+ / d6 | 8 |
| **Drake Maye** | QB | 24 | 24–25 / d7 | **11** |

TE thinness has been flagged since §6 and this is where it lands on names David reads. **Maye is one player short
of the threshold** — worth stating as "eleven comparable players, one below our publishing bar" rather than as a
blank, because that is what it is.

**The sentence beside a Category B blank should follow the McCaffrey model** — say how rare the player's situation
is, which is the actual content of the suppression. For Bowers and Loveland: *only seven tight ends since 1999 have
produced at this level by 23.* That is a statement about them, not about us.

## 5o. INVARIANTS THAT MUST HOLD IF THE ASSEMBLY IS CORRECT — checkable without rebuilding Fred's half

Greg asked whether a property exists that would catch an assembly defect in a top-20 board. **Yes — five, and two
of them are strong.** All need only a three-column list from Fred: *(player, cell, duration factor)*.

1. ⭐ **CELL DETERMINISM.** The duration factor must be a pure function of (position, age band, margin decile).
   **Any two players sharing a cell must have identical duration factors**, and any player's factor must equal my
   published `E` for his cell at d=1. **This is the check that would have caught the totals-vs-rate mismatch
   instantly** — Fred's Gibbs at 2.66× and mine at 12.35× land in different deciles, so the cell assignment itself
   disagrees before any arithmetic runs.
2. ⭐ **THE LIMIT TEST, and it ties the new number to a VERIFIED artifact.** Codex reproduced the one-season board
   to the decimal. As the discount → 0, `V → d·S(1)·A(0)`, so **the asset ordering must converge to the ordering of
   S(1) × (the verified one-season value)**. S(1) is one published column of mine and A(0) is the artifact Codex
   checked, so this is computable entirely from verified inputs. If a small-d board does not match it, the
   assembly is wrong and neither half has to be rebuilt to find out.
3. **BOUND.** With three horizons and d ≤ 1, every duration factor lies in **[0, 3]**. Anything above 3 is a
   summation or lookup bug.
4. **MONOTONICITY.** At a fixed position and age band, a higher margin decile must give a duration factor no
   smaller. My published cells satisfy this; a violation on the board that is not in my cells is assembly.
5. **THE CROSSING TEST.** Within a position, the only pairs whose order may change between two discount settings
   are pairs whose survival curves cross — and I can enumerate exactly which cell-pairs those are (§5e/§5k).
   **Any reordering on the board that does not correspond to an enumerated crossing pair is a defect.**

⚠ **What these do NOT cover:** they check that the assembly used my cells correctly. They cannot check that Fred's
value term is right, and they cannot check the bar-depth question. **Independent reproduction is still worth doing
for the value half** — my invariants only retire the assembly risk, which is one of the three.

## 5p. THE BAR-PROXY QUESTION — measured, and it is much cheaper than it looks (except at TE)

Fred surfaced that David's ruling is a fact about **today's** league while the panel is **1999–2025**, so the
historical bar must be a *proxy* the ruling does not choose between:
**(a)** today's measured availability ranks frozen and applied historically (QB37 / RB60 / WR71), or
**(b)** structural depth, rostered-count-plus-one (QB45 / RB82 / WR108) — what the cells currently use.
He proposed escalating it to David. **Measured first, and it mostly should not be escalated.**

Built both, three horizons, deciles, everything else held:

| | QB / RB / WR only |
|---|---|
| cells in common | 146 · median \|ΔE\| **0.179**, 90th 0.433, max 0.726 *(scale 0–3)* |
| top-25 names priceable under both | 20 |
| **Spearman between the two proxies** | **0.872** |
| moves > 2 places | 9 of 20 · max move 6 — and the biggest movers (Taylor, Cook, Kyren Williams) sit at **identical E values**, so their "6 places" is tie-breaking, not reordering |

**On the three positions Fred actually measured, the two proxies substantially agree.** The choice is a labelling
decision, not a finding. Escalating it would spend David's attention on a distinction his board barely sees.

⛔ **BUT WE CANNOT ANSWER IT FOR TIGHT END, AND I NEARLY REPORTED THAT WE COULD.** Fred measured QB37 / RB60 / WR71
and **no TE rank**. My first run filled the gap with **TE=34, which I invented**, and it produced **Spearman 0.274**
with the four largest movers all tight ends — Tyler Warren 16th→2nd, Trey McBride 10th→1st. I was one step from
reporting "the proxies disagree materially, escalate to David" on the strength of a number nobody measured. I
caught it only because every large mover was the same position.

**TE is where the proxy genuinely could matter**, and for a structural reason: it is the shallowest position, so
eight ranks is a quarter of the pool rather than a tenth. **The actionable item is not a ruling — it is measuring
the TE availability rank in David's league.** If TE then lands near 0.87 like the others, the whole question is
academic and either proxy ships with a label.

**The lesson is the one this ticket keeps relearning, this time against myself:** a gap filled with a plausible
invention does not announce itself — it comes back as a headline. See
[[feedback_a_null_needs_a_sample_that_spans_the_effect]] and §5m.

## 5q. ⛔ REVERSING §5p — with all four ranks measured, the proxies DISAGREE, and one of them is simply wrong

§5p said "do not escalate, Spearman 0.872". **That was computed with RB60 — Fred's own acknowledged guess — and it
does not survive the measured numbers.** Two lanes independently measured the live artifact and agree:
**QB37 / RB45 / WR71 / TE21** (Greg on two bases, Fred from the league; RB45 on both, so the RB60 in §5p is retired).

Re-run with all four correct:

| | Spearman (a) vs (b) | median \|ΔE\| |
|---|---:|---:|
| **all four positions** | **0.282** | — |
| WR | 1.000 | 0.103 |
| QB (n=2) | — | 0.129 |
| **RB** | **0.000** | **1.505** |
| **TE** | 0.500 | **1.014** |

Jonathan Taylor moves 3rd → 17th, Gibbs and Bijan 4th → 10th, Tucker Kraft 14th → 4th. **This is not a labelling
choice. It reorders the board.**

⭐ **BUT THE ESCALATION IS STILL UNNECESSARY, BECAUSE ONE PROXY IS DEFECTIVE RATHER THAN DIFFERENT.** What kind of
player does each bar actually describe, median 1999–2025?

| pos | (a) availability | | (b) structural | |
|---|---|---|---|---|
| RB | **RB45** — 102.2 pts, **14.0 games**, 7.11 ppg | a real starter-adjacent back | RB82 — 31.1 pts, **8.5 games** | **a fragment of a season** |
| TE | **TE21** — 101.7 pts, **14.0 games**, 6.89 ppg | a real player | TE42 — 53.3 pts, 12 games | a part-season player |
| WR | **WR71** — 100.5 pts, 13.0 games, 7.63 ppg | a real player | WR108 — 50.2 pts, 12 games | a part-season player |
| QB | QB37 — 63.9 pts, 8.0 games | weak | QB45 — 33.4 pts, **4.0 games** | **a fragment of a season** |

**Look at the internal consistency of (a): RB45, TE21 and WR71 all land at ~100–102 season points across 13–14
games.** Three different positions, three different ranks, the same *kind of player*. That is what a replacement
level should look like. **(b) lands on 31–53 points and, at RB and QB, on players who appeared in half a season or
less.** Nobody signs an 8.5-game back who scored 31 points as their replacement for McCaffrey.

**So (b) is not a legitimate alternative reading of David's ruling — it does not describe a gettable player at all.
The bar is (a), and no ruling is required to say so.** Fred's underlying question (whether 2026 manager behaviour
should be assumed in 2003, or only league size) is real and remains open, but it is second-order beside this.

⚠ **THIS IS MY SECOND REVERSAL ON THE SAME QUESTION IN ONE MORNING.** First I nearly escalated on a TE rank **I**
invented; then I said don't escalate on an RB rank **Fred** invented; now, with all four measured, the answer is
different again. **Both recommendations were confidently given on inputs containing a fabricated number, and in
neither case did the fabrication announce itself** — it arrived as a plausible integer inside an otherwise sound
analysis. The rule that would have caught both, on the first pass: **before recommending anything, list every input
and mark which were measured and by whom.** Four ranks, four provenances. It takes one line.

## 5r. THE CONFIRMED RUN, AND WHAT IT COST — plus retention keyed, and an age boundary

**`survival_curves_FINAL.json`** — spec restated by Fred and amended to **five horizons** before running.
Ranks QB37/RB45/WR71/TE21, qualifying on totals with postseason excluded, **margin on rate**, deciles, suppress
below n=12. 20,885 cohort-year observations, 1,232 players, pooled S(1..5) = 66/54/44/35/28%.

⛔ **THE CORRECT BAR COSTS CELL QUALITY, and the suppression count understates it.** The availability ranks admit
far fewer players than the structural ones (20,885 against 33,240), so suppression rose 35 → **74 cells** — and
Fred measured that **the surviving cells are noisier too**, not merely fewer. **Survival rising, which a cohort
cannot do, appears in 16.7% of steps** (Fred counts *cells containing any rise* and gets 35%; both are right,
different denominators — his is the one to use, since a cell with one impossible step is indefensible).
Suppression was also **scattered rather than systematic** — QB 30-31 publishes deciles 2,4,5,6,7,9 and holes 0,1,3,8,
so priceability depended on which slice a player landed in with priced neighbours either side.

**REPAIRED BY ASYMMETRIC BINS — resolution where the board reads, pooling where it does not:**

| cut | cells | suppressed | median n | survival rises (steps) |
|---|---:|---:|---:|---:|
| uniform deciles (delivered) | 166 | 74 (31%) | 19 | 16.7% |
| A: d0–4 pooled, d5..d9 | 108 | 36 | 23 | 13.7% |
| **B: d0–2, d3–4, then d5..d9** | **129** | **39 (23%)** | **24** | **13.6%** |
| C: d0–3, d4–5, then d6..d9 | 110 | 34 | 27 | 14.1% |

**B taken.** ✅ **Hall still separates**: d6 at 2.03× against Gibbs 3.37× and Bijan 3.41× at d9 — three bins apart
under B. The fix that motivated deciles survives the coarsening.

## 5s. RETENTION KEYING — (position, quality), and the age boundary that scopes it

Fred asked whether retention differs by position and by quality. **Both, and the quality effect is large.**

- **Position:** QB retains ~94% of VOR at year five; RB/WR/TE fall to 76–81%. **An 18-point spread landing on the
  position David's probe turns on.** A pooled vector would have quarterbacks fading like receivers when they do not
  fade at all.
- **Quality:** top half of margin 66% at year five, bottom half 116% — a 50-point gap.
  ⚠ **Mostly REGRESSION TO THE MEAN. The sentence is "an exceptional season is partly luck, and next year looks
  more ordinary" — NOT "elite players fade faster,"** which is a football claim this design cannot support.
- ⭐ **It compounds in the bad direction:** elite players survive *longer* and retain *less*, so a single pooled
  vector gives them long survival × average retention and **overstates them twice**, at the top of the board where
  every reader looks.

**Does age still bite once quality is controlled? Only outside the top half.**

| median VOR retained | y1 | y3 | y5 |
|---|---:|---:|---:|
| **top** ≤25 / 26–29 / 30+ | 82 / 86 / 72% | 80 / 70 / 70% | **71 / 64 / 62%** |
| **bottom** ≤25 / 26–29 / 30+ | 135 / 113 / 102% | 135 / 107 / 92% | **138 / 95 / 80%** |
| spread across age — top | 13 pts | 10 | **9** |
| spread across age — bottom | 33 pts | 44 | **58** |

**In the top half age nearly vanishes once quality is controlled** — 9 points at year five against a 50-point
quality gap. Fred's hypothesis, confirmed: an old player still in the top half is a survivor with less left to give
back. **In the bottom half age is decisive** — a young marginal player has real upside (138%), an old marginal
player is finished (80%). Opposite futures; pooling them is indefensible.

⭐ **So (position, quality) is sufficient WHERE THE BOARD LIVES and wrong outside it.** A top-20 asset list reads
only top-half cells. **The vector must be published with that boundary stated — valid in the top half of margin;
below it, age is required** — rather than as a general-purpose retention curve. A clean vector with an honest edge
beats a three-way cross that is mostly suppressed.

## 5t. ⛔ "SURVIVAL CANNOT RISE" IS FALSE — it is recovery, and we nearly gated on it

Both lanes spent hours treating a rising cell as **impossible for a cohort** and using its frequency as a quality
gate — Fred at 35%, then 47% on the option-B cells; me at 13.6% of steps. **The premise is wrong.**

**S(h) here is a PREVALENCE curve, not a survival curve.** It asks *is he qualifying in year h*, not *has he not
yet failed*. Nothing stops a back finishing RB50 and then RB30. Measured on the panel:

| | y1→y2 | y2→y3 | y3→y4 | y4→y5 |
|---|---:|---:|---:|---:|
| of those NOT qualifying, share qualifying again next year | **21%** | 16% | 9% | 9% |

**Overall 305 of 2,364 out-of-the-money player-years return the next year — 13% — and 25% of players go out and
come back at least once inside five years.**

⭐ **So a rising cell can be correctly capturing football.** The gate would have rejected cells that are right, and
**had either of us "repaired" it with isotonic smoothing we would have deleted a real phenomenon** — one that
matters more to a dynasty owner than almost anything else in the product, because it is exactly the question
*"do I sell a good player having a bad year?"*

**The defensible gate is cell size and interval width on E**, which measures what we genuinely cannot stand behind.
Monotonicity is retained only as a *noise indicator*, never as a validity criterion. Option B still stands, on
its own merits rather than on the reason originally given.

⚠ **And it qualifies the ticket's own headline.** §3's *"ageing is an exit process, not a fading one"* survives, but
it needs the second clause: **and 13% of exits reverse within a year.** A dynasty owner selling a 27-year-old after
one bad season is acting on the wrong half of that sentence.

**The shape of the error is worth naming:** two lanes independently agreed on a plausible constraint, measured
against it, disagreed only about the metric, reconciled the metric — and never checked whether the constraint was
real. **Agreement between two measurers is not evidence about the world.**

## 5u. POSITION BITES IN THE BOTTOM HALF, HARDER THAN AT THE TOP

Fred asked whether position could be collapsed below the quality median — nobody had looked. It cannot:

| bottom half, VOR retained | y1 | y3 | y5 |
|---|---:|---:|---:|
| QB | 108% | 104% | 112% |
| RB | 110% | 126% | 131% |
| WR | 121% | 116% | 112% |
| **TE** | **152%** | **145%** | **155%** |
| **position spread, bottom half** | **44 pts** | 40 | **43** |
| position spread, top half (for scale) | 17 pts | 21 | 35 |

**43 points at year five, larger than the 35 at the top**, and the outlier is **tight end**, not quarterback. So
the bottom half needs **(age, position)**, not age alone — collapsing position there would repeat the error just
corrected at the top. Bottom-half cells run 102–328 players and should support the 3×4 cross.

**Published vectors** (`survival_FINAL_B.json`, 129 survival cells / 39 suppressed / option-B bins / five horizons):
top half by position — QB 88/89/81/84/85 · RB 77/70/60/57/51 · WR 79/76/72/68/65 · TE 71/75/70/61/59;
bottom half by age — ≤25 135/142/135/146/138 · 26–29 113/103/107/110/95 · 30+ 102/92/92/91/80.

## 5v. ⛔ THE RETENTION VECTOR WAS WRONG IN BOTH HALVES — a near-zero denominator manufactured it

Fred challenged the bottom-half figures as a small-denominator artifact: retention is a ratio of value-over-
replacement, and near the bar the denominator is tiny by construction. **He was right, and it was worse than he
estimated — the top half was wrong too.**

| | y1 | y2 | y3 | y4 | y5 |
|---|---:|---:|---:|---:|---:|
| **top half** (i) median of *individual* ratios *(what I published)* | 85% | 79% | 75% | 72% | **69%** |
| **top half** (ii) ratio of *cell means* | 72% | 61% | 50% | 40% | **31%** |
| **bottom half** (i) *(what I published)* | 126% | 129% | 124% | 133% | **126%** |
| **bottom half** (ii) ratio of cell means | 90% | 71% | 58% | 49% | **38%** |

Median individual VOR₀ is **105** in the top half and **32.5** in the bottom. Nobody in the bottom half was gaining
value; a near-zero denominator manufactured the appearance. **And my top-half number — the one I told Fred to key
the top of the board on — overstated elite players by more than a factor of two at year five (69% against 31%),
which is a larger error than the double-counting I was correcting for when I flagged it.**

⭐ **THE CONSEQUENCE THAT MATTERS MOST: (ii) AND (iii) ARE UNCONDITIONAL — SURVIVAL IS ALREADY INSIDE THEM.**
(i) conditioned on still qualifying, which is why it read high and why it needed multiplying by S(h). A
non-qualifying player contributes **zero** to (ii) and (iii). **Multiplying either by S(h) counts the exit twice.**
So the formula collapses rather than gets patched:

    V = A(0) × Σ dʰ · (ii)(h)     ratio of cell means — scales to the player, S(h) is INSIDE   ← recommended
    V = Σ dʰ · (iii)(h)           pure levels — no denominator, but does NOT scale to the player

**(iii) is unconditionally right and loses the individual**: every player in a cell gets the same trajectory
regardless of where he sits within it. Seven margin bins make that tolerable, not free. **(ii) keeps A(0) doing the
per-player work.**

**Bottom-half 3×4 on levels — all twelve cells clear n=12**, so the cross Fred asked for is supportable. The
extremes state the position asset-class difference rawly: a **30+ RB** in the bottom half is worth **1.1 points of
VOR by year four**; a **30+ QB** is worth **26.5**.

**The lesson, and it is a general one: a ratio whose denominator can approach zero will manufacture effects, and a
median does not protect you** — the median guards against outliers in the numerator, not against a denominator
that is small by design. **Check the scale of the denominator before publishing any ratio.**

## 5w. `retention_R_FINAL.json` — the ONE quantity, and S(h) drops out of the formula

**`R(h) = mean(VOR at h, unconditional) / mean(VOR at 0)`, per cell. 129 cells, 39 suppressed (23%), keyed
identically to the survival cells** so the join is one lookup. **Zero cells flagged fragile** — the smallest cell
denominator is well clear of the instability threshold, so the artifact that killed the per-player ratio does not
recur at cell level.

    V = A(0) × Σ dʰ · R(h)

⛔ **SURVIVAL IS INSIDE R AND THE 129 SURVIVAL CELLS ARE NO LONGER A FORMULA INPUT.** A non-qualifier contributes
zero, so `mean(VOR_h) = P(qualify) × E[VOR_h | qualify]`. Multiplying by S(h) double-counts the exit. The file
carries that warning in its own definition block.

**(iii) — pure levels — was rejected for a reason worth recording: it reintroduces the defect David opened the
program with.** Under levels every player in a bin gets an identical trajectory, so the top RB bin returns the same
asset value for McCaffrey, Gibbs, Bijan, Taylor and Achane — five backs spanning 9.73 to 11.96 of edge, all tied.
**That is five backs at 58.05 again by a different route.** (Fred's catch.)

⭐ **AND THE TOP-BIN NUMBERS ARE THE CLEANEST ANSWER TO DAVID'S SUPERFLEX QUESTION THE PROGRAM HAS PRODUCED:**

| top margin bin | n | R1 | R2 | R3 | R4 | R5 |
|---|---:|---:|---:|---:|---:|---:|
| **QB 30–31** | 13 | 59% | 90% | 76% | 59% | **61%** |
| WR 30–31 | 26 | 57% | 59% | 45% | 31% | 15% |
| **RB 30–31** | 12 | 43% | 28% | 7% | 3% | **0%** |
| QB 24–25 | 14 | 77% | 55% | 61% | 62% | 41% |
| RB 24–25 | 27 | 70% | 62% | 57% | 48% | 21% |
| WR 24–25 | 30 | 81% | 75% | 69% | 50% | 53% |

**An elite 30-year-old quarterback keeps 61% of his edge at year five. An elite 30-year-old running back keeps
zero.** Same age, same tier, opposite asset classes — measured, not asserted. That is the sentence for David.

⚠ Note QB 30–31 shows R2 (90%) above R1 (59%) — **that is the recovery phenomenon from §5t, and we now know not to
"fix" it.** Had the monotonicity gate survived, this cell would have been rejected or smoothed.

**Void as a consequence, flagged by Fred:** his permutation null and probe orderings were computed against the
retracted retention vector and are void as to magnitude; he is re-running the null on R and the limit test in its
corrected form (V → A(0)·R(1) as the discount → 0, still tying to the board Codex reproduced).

## 5x. ⛔ A TIE SKIPPED THE BAR RANK AND SILENTLY DELETED 284 ROWS — my defect, found by printing

**`retention_R_FIXED.json` supersedes `retention_R_FINAL.json`.** Three changes: a complete contiguous partition, a
corrected zero-floor warning, and a real defect in my own delivered data.

**THE DEFECT.** The bar was located with `rank == N` under `method="min"`. **When two players tie at rank N−1,
rank N is skipped entirely**, the lookup returns nothing, the bar is `NaN`, every margin that season becomes `NaN`,
and `pd.qcut` **drops those rows with no error**. It hit **WR 2024: 284 cohort-year observations across 71 distinct
players — 3.3% of the WR sample — excluded from every published WR cell.** Fixed by taking the **N-th largest
value**, which always exists. Verified: **0 NaN margins**, and `assert f.md.notna().all()` now guards the
decile assignment so a future recurrence fails loudly instead of shrinking the sample.

⭐ **This was found by PRINTING the edges, not by a test.** The WR row came back `-inf | +inf | +inf …` — all
unbounded — which is obviously wrong on sight and invisible in any aggregate. Every cell count, every R value and
every interval still looked entirely reasonable with 3.3% of receivers missing. **The whole-file statistics cannot
see a silently dropped subgroup; only looking at the object can.**

**THE PARTITION.** `edge_lo`/`edge_hi` are now the **decile cut points**, not observed min/max, so bin *k*'s
`edge_hi` **is** bin *k+1*'s `edge_lo` exactly and the outermost are unbounded. **Suppressed entries carry edges
too.** Every possible margin therefore lands in exactly one named bin — published or suppressed — and Fred's seven
"rounding crack" blanks (Jefferson, Higgins, Purdy, Barkley, Harrison, LaPorta, Montgomery) disappear at source.
**No gap-width threshold is needed**, which was the point: he had been forced to separate real holes from rounding
artefacts with a tuned 0.05, and a tuned threshold is what we have spent the day refusing.

**THE ZERO-FLOOR — Fred's assembly correction needs a correction.** He floored players with `margin < 1.0` at zero,
reasoning they are below replacement. **Margin is a RATE ratio; qualifying is on season TOTALS**, and a player can
be below the bar per game and above it for the season by playing more. Measured on the panel: **226 qualifying
player-seasons have margin < 1.0 and 100% of them have POSITIVE VOR** — median 18.6 points, and at QB a median of
44 with a maximum of 227. **The correct worth-zero test is projected season points ≤ the bar player's projected
season points, not margin < 1.0.** The warning is in the file's own definition block.

## 5y. THE FIFTH ONE-WORD-TWO-QUANTITIES — "margin", and the proposed fix was wrong too

Fred found that his margins and mine disagree by up to 2.5× on the same players and traced it to his served PPG
carrying availability while my bar player's rate does not. **The mismatch is real. His proposed repair is not, and
he had merged two separate issues.**

**⛔ `served_ppg × 17` IS NOT EXPECTED SEASON POINTS.** `apply_availability` returns `projection × availability`,
and `availability` is *"the probability he posts a qualifying season at all"* — where the qualifying event
(DG-163, `availability.py`) is **≥4 games at t+1 OR t+2: a TWO-YEAR event with a 77% base rate.** Multiplying a
per-game conditional rate by a two-year survival probability and then by 17 produces a quantity with no clean
interpretation — not an expectation over games, not expected season points.

**✅ The fix runs the other way: divide the availability out.** The cells key on the **conditional rate** (both
sides total ÷ games for men who played), so the lookup quantity is `served_ppg / availability`.

⚠ **`availability` is NOT stored in the served artifact** — walked every nesting level of a player record; the
`valuation` block carries `dvs_band_*`, `xvar`, `model_grade` and no probability, and there is no top-level field.
**It is recoverable via `score_rows`**, at the cost of that function's own stated simplification (it refits at
scoring time from the training CSV, so the value depends on that file).

**THE TWO ISSUES, separated:**

| | |
|---|---|
| **1. His lookup is broken** | availability-adjusted numerator against an unadjusted denominator. Real. Mine to have specified. Fixed by dividing P out. |
| **2. Rate margin ≠ season-total margin** | differ by the bar player's games. **Not a defect** — the quantity choice made deliberately in §5m on his own argument that *totals conflate good with healthy*. |

His table measures (2) and attributes it to (1). **Quarterbacks moving six bins under a season-total margin is not
evidence that season totals are right; it is the two quantities differing, which is what choosing one means.**

⭐ **And the rate is right at quarterback for a football reason.** The QB bar player is an 8-game backup at 7.99
a game. **Those 8 games are an artifact of being a backup, not a forecast of what you would get if you signed him**
— as a starter he plays a full season. A season-total comparison treats his 8 games as a property of the player and
inflates Allen's edge from **3.0× to 6.4×**. The rate asks the right question: how much better per game is Allen
than the man David could actually sign.

**Fifth instance today of one word carrying two quantities** (after the bar depth, the totals/rate margin, the
conditional/unconditional retention, and the prevalence/survival curve). The pattern is not sloppiness — both
lanes confirmed the spec in writing each time. **What is missing is that a spec names a quantity without naming its
UNITS and its CONDITIONING.** That is the field to add.

## 5z. THE LOOKUP QUANTITY IS ALREADY STORED — and two things logged as chosen, not derived

**`projection_2y` IS the conditional rate.** `pvo_assembler.py:457`, in the code's own words: *"projection_2y is
E[points | plays]; availability is P(plays)"*, and line 491 computes DVS from
`apply_availability(projection_2y, availability_p)`. **The PRE-availability rate is what gets stored; the POST
value is what gets normalised into the score.** So the cell lookup is simply **`projection_2y / bar_ppg`** — no
availability to recover, no `score_rows` refit, no dependence on the training CSV.

Fred's algebraic route (`P = served / projection_2y`, then `served / P`) is correct and returns the field it
started from. **It also dissolves the clamped-row gap he was about to carry as blanks:** clamping bounds DVS, not
`projection_2y`. Measured live — **582 players with a DVS, 502 (86.3%) carrying `projection_2y`, including 17 of
the 18 clamped.** The 80 without one are rookies (DG-165), a different gap.

**The honest size of the availability defect, from his recovery:** a **1.14–1.28** uplift, largest at TE, spread
across positions only **1.13×**. Real, small, nearly uniform — a bin here and there, never six. **My flag was worth
less than either of us treated it as, and he corrected his own overstatement to David before I could.**

### Two questions logged as CHOSEN, not derived

**1. Rate versus season totals — settled on Fred's reason, not mine.** I argued the QB bar player's 8 games are an
artifact of being a backup who would play a full season as a starter. **That is wrong: rostering a backup does not
make him an NFL starter; he plays 8 games because that is what his club gives him.** I asserted a football fact I
had not measured. **Fred's reason is correct and is the one on record: the replacement is not one man's season, it
is the best you can field each week**, so a single player's season total is the wrong object regardless of games.
⚠ **And the choice is not a derivation.** Where the best available man plays most weeks, rate and total converge;
at QB, where he plays half, the choice rests on **an assumption about what David does in the other nine weeks, and
that assumption has never been measured.** Live alternative, not settled.

**2. Two people defending one choice with different arguments is not agreement.** It is a coincidence that will not
survive a new case. Both of these are logged so the next person knows which parts of the definition block are
measured and which are chosen.

## 5aa. ⛔ I DELETED MY OWN FRAGILITY RULE IN A REWRITE AND KEPT QUOTING ITS RESULT

Fred found **TE ≤23 m0 with `mean_VOR_at_0 = 7.09` and R1 = 7.22** — a 722% "retention", the small-denominator
artifact we spent an hour killing at player level, alive in the smallest cell and pricing seven live tight ends.
My definition block said flag below 10. I had reported **zero fragile cells.**

**Greg framed it as a rule that exists and does not fire. It is worse: `grep -c FRAGILE` returns 2 in the first
publish script and 0 in the rebuild.** When I rewrote to fix the tie defect, the check and its documentation both
vanished — **and I carried the sentence "zero cells flagged fragile" across the rewrite into my message to Fred.
The claim was true of a file that no longer existed.**

⭐ **The identical error to Fred's "Nacua is first on both terms", carried across three rebuilds, in the same hour.**
General form: **a rebuild invalidates every claim derived from the old build, including the ones you are proud of.**
A rewrite is not an edit; nothing said about the previous artifact survives it automatically.

**FIXED BY ASSERTION, NOT BY DOCUMENTING IT AGAIN** (`retention_R_v3.json`):

    published 128 cells, 40 suppressed
    assertions passed: no cell with n<12 or denominator<10.0
    smallest surviving denominator: 11.04
    newly suppressed: TE <=23 m0 — n=12, mean_VOR_at_0=7.09

Suppression is now `n < 12 OR mean_VOR_at_0 < 10`; every suppressed entry carries a `suppressed_because` naming
which rule caught it; **a future rewrite that drops the check now fails loudly instead of publishing.**
**A documented threshold is exactly as good as a deleted one. An assertion is not.**

⚠ **And Fred leaving it rather than patching it was right** — had he fixed the cell, I would have learned that one
number changed and never that the check was gone.

## 6. WHAT IS KNOWABLE VS WHAT WE WOULD BE INVENTING

**Measured, and I would defend it:** the exit curves by position × age (every cell n ≥ 33 except TE); the flatness
of the decline; the tier effect for QB/RB/WR; the pooled baseline; David's three probe players against McCaffrey
and Henry.

**Thin — reported with n, do not build on it:** all of **TE** (most cells n = 4–20; TE's apparent flatness with age
is very likely small-sample, and 32+ TEs surviving *better* than 26–27 TEs is not credible as football);
**RB elite at 30–31 (n=9) and 32+ (n=4)**; **QB ≤23 elite (n=6)**; McCaffrey's own cell is n=9 with a CI spanning
0.93–2.00. The ordering against Gibbs survives the whole interval, but the point estimate should not be quoted alone.

**Would be inventing:**
- **Anything past 5 years.** The panel supports 5. A 10-year horizon would be extrapolation.
- **Any individual deviation from his cell.** This says what happens to *elite 24-year-old RBs*, not what happens
  to Bijan. DG-163 already measured that injury history does not predict the 2-year availability event; whether it
  predicts *this* one is untested.
- **Causality.** Elite players may last because they are good, or because teams keep handing them opportunity.
  The curve is descriptive and must be described that way.
- **A parametric survival model.** Cell rates are what the data supports today. Fitting Cox or Weibull would smooth
  the thin cells — and smoothing is exactly where invention enters. If a fitted form is wanted, the elite/fringe
  gap and the QB/RB divergence are the two effects it must reproduce or be rejected.

⚠ **The stop rule, taken from Fred verbatim:** if any term starts needing a free parameter aimed at a known answer,
that is the signal to stop. Nothing here has one. The cells are counts.

---

## Reproduce

    cd ~/dynasty-genius-product
    SP=/private/tmp/claude-501/-Users-davidleess/<session>/scratchpad
    .venv/bin/python $SP/panel.py      # 1999-2025 panel, cached
    .venv/bin/python $SP/survival.py   # cohorts + forward follow-up
    .venv/bin/python $SP/curves.py     # exit and decline curves
    .venv/bin/python $SP/tier.py       # tier interaction + David's probe
