# Superflex / 2QB Positional Value in Dynasty Fantasy Football

**A reference on what actually happens to QB scarcity and QB value in a 12-team superflex league, and how much of it is structural.**

Compiled 2026-07-26. All market data retrieved 2026-07-24 to 2026-07-26 unless otherwise dated.

---

## Executive summary

**The squeeze is real, it is mostly structural, and its size is about 2x — not the 3–5x the format's rhetoric implies.**

The eight findings that matter, with their evidence class:

1. **A 12-team superflex league demands 24 of the NFL's 32 starting QBs every week — 75%, against 37.5% in 1QB.** Demand doubles; supply is fixed. No market data required. **[DERIVED]** §1.1
2. **A 14-team superflex league is arithmetically infeasible in the peak bye week** — 28 QB-capable slots against 26 NFL starters playing. The squeeze is not linear in league size; it crosses a hard boundary between 12 and 14 teams. **[DERIVED]** §1.1
3. **QBs go from 12–13% of dynasty board value in 1QB to 25–30% in superflex.** Three sources built three different ways agree. Roughly a doubling of the position's market share. **[MEASURED]** §2.1
4. **The QB cohort moves up ~55–59 draft picks.** The superflex QB12 goes at pick 39–42; in 1QB he goes at 94–101. Two independent ADP datasets from different eras agree within 7%. **[MEASURED / SOURCED]** §2.3
5. **The squeeze lives at QB25–48, not at the top.** QB1–24 are universally rostered in *both* formats. The format's real signature is that QB37–48 are rostered in 84% of superflex leagues against 43% of 1QB leagues. **[MEASURED]** §3.1
6. **"Every startable QB is someone's starter" is false as stated.** A 12-team superflex league rosters ~53.7 QBs against 32 NFL starting jobs. The correct version is narrower and more useful. **[MEASURED]** §3.3
7. **Roughly half of elite dynasty QB value sits with players aged 28+; at WR the figure is ~3%.** Independently replicated across two sources to within four points. This, not weekly scoring, is the real dynasty-specific case for QBs. **[MEASURED]** §5.1
8. **Two of the three major value sources say rookie picks get *cheaper* in superflex** — the opposite of community consensus. **[MEASURED]** §5.4

**The most important methodological caveat, and the one most likely to catch out a first-principles derivation:** FantasyCalc's superflex QB values are a flat ×1.872 scalar on its 1QB values, invariant to league size. Its superflex curve shape is therefore *identical to its 1QB curve by construction*, and its model structurally cannot represent finding #2. Any curve-shape or league-size conclusion drawn from FantasyCalc superflex data is an artifact. §4.1, §8.1

**What a first-principles "QB squeeze" argument most often gets wrong:** it assumes the superflex slot is filled with a QB 100% of the time (unmeasured — §1.3); it conflates the 32 nominal / 26 peak-bye / 63 season-churn supply denominators (§1.1); it assumes the QB *curve* is steeper when only its *altitude* is higher (QB and WR decay at near-identical relative rates — §4.3); and it typically overstates the elite-QB premium by anchoring on a source whose 1QB baseline is the outlier (§2.1).

---

## 0. How to read this document

The core question — *in a 12-team superflex league, what actually happens to QB scarcity and QB value, and how much of it is structural?* — has a short answer and a long one.

**Short answer.** Roughly half the effect is structural arithmetic that can be derived and is not in dispute. The other half is market pricing, and the market pricing is measurable but the public sources disagree with each other by a wide margin — wider than most people who cite them realise. Several of the most-repeated claims in the community turn out to be either unmeasured or artifacts of how a particular value source is built.

**Evidence marks used throughout:**

| Mark | Meaning |
|---|---|
| **[DERIVED]** | Arithmetic from league structure. Not an empirical claim; check the algebra, not a source. |
| **[MEASURED]** | Computed directly from a public dataset. The retrieval method is stated so it can be reproduced. |
| **[SOURCED]** | Asserted by a named public source, with URL and date. The source's own rigour varies — noted where relevant. |
| **[FOLKLORE]** | Widely repeated in the community with no measurement behind it that could be located. Not necessarily false. Not evidence. |
| **[UNVERIFIED]** | Could not be confirmed from a public non-paywalled source. |

**A note on reproducing the [MEASURED] figures.** Two of the three market datasets used here are openly queryable:

- FantasyCalc values: `https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=2&numTeams=12&ppr=1` (`numQbs=1` for 1QB). Undocumented but public and unauthenticated.
- DynastyProcess values: `https://raw.githubusercontent.com/dynastyprocess/data/master/files/values.csv` — ships `value_1qb` and `value_2qb` side by side in one file, which is what makes the format comparison clean.
- KeepTradeCut values were read off the public rankings pages (`https://keeptradecut.com/dynasty-rankings/qb-rankings`, `?format=1` for the 1QB database).

Because each source normalises its scale differently, **raw cross-source ratio comparisons are invalid.** Where this document compares sources it uses normalisation-invariant metrics — overall board rank, QB-share of top-N value, and QB1/WR1 — and says so.

---

## 1. The arithmetic of the squeeze [DERIVED]

This is the part that is genuinely structural, and it is the part the rest of the argument rests on.

A superflex league has one lineup slot that may be filled by a QB, RB, WR or TE. Nothing forces a manager to put a QB there. But because QB is the highest-scoring position in nearly all common scoring systems, the assumption in practice is that the slot is a QB slot. That assumption is examined in §1.3 — it is weaker than it is usually treated.

### 1.1 QB-capable slots vs. NFL supply

Taking the upper bound (every superflex slot started with a QB), an N-team league has **2N** QB-capable starting slots.

The supply side has three different denominators, and conflating them is the most common error in this argument:

- **32** — nominal NFL starting jobs. One per team.
- **26** — the effective weekly floor. The 2026 NFL schedule puts a maximum of six teams on bye in a single week (Week 11); most bye weeks are two or four teams ([NFL.com, 2026-05-15](https://www.nfl.com/news/2026-nfl-schedule-release-every-team-bye-week)). [SOURCED]
- **63** — the number of different QBs who actually started a game across the 2025 NFL season including playoffs ([NFL.com, Nick Shook, 2026-02-11](https://www.nfl.com/news/ranking-all-63-starting-quarterbacks-from-the-2025-nfl-season)). Injury and benching churn roughly doubles the nominal pool over a full season. A second source counts 62 for the regular season alone ([FanSided](https://fansided.com/nfl/all-62-starting-qbs-from-the-2025-nfl-season-ranked)); the difference is playoff inclusion. [SOURCED]

| Format | QB slots | SF slots | Total QB-capable | % of 32 nominal | % of 26 (peak bye week) |
|---|---:|---:|---:|---:|---:|
| 10-team 1QB | 10 | 0 | 10 | 31.2% | 38.5% |
| **10-team superflex** | 10 | 10 | **20** | **62.5%** | **76.9%** |
| 12-team 1QB | 12 | 0 | 12 | 37.5% | 46.2% |
| **12-team superflex** | 12 | 12 | **24** | **75.0%** | **92.3%** |
| 14-team 1QB | 14 | 0 | 14 | 43.8% | 53.8% |
| **14-team superflex** | 14 | 14 | **28** | **87.5%** | **107.7%** |
| 16-team superflex | 16 | 16 | 32 | 100.0% | 123.1% |

**The three results worth carrying away:**

1. **A 12-team superflex league demands 24 of the NFL's 32 starting QBs in a normal week — 75%.** The equivalent 1QB league demands 12, or 37.5%. The demand doubles; the supply does not move at all. This is the entire squeeze in one line, and it requires no market data to establish.

2. **In the peak bye week, a 12-team superflex league has two spare starting QBs across all twelve rosters combined** (24 needed of 26 playing). Slack is essentially zero.

3. **A 14-team superflex league is structurally short in the peak bye week — 28 slots against 26 playing starters, 107.7%.** It is arithmetically impossible for every superflex slot in that league to contain a starting NFL QB that week. This is the sharpest available form of the argument and it is pure algebra. The squeeze is not linear in league size; it crosses a hard feasibility boundary somewhere between 12 and 14 teams.

### 1.2 The 1QB contrast

The same table read the other way: a 12-team 1QB league leaves **20 of 32** NFL starting QBs unneeded in any given week. The position is in structural surplus. This is why QB is cheap in 1QB dynasty and why the two formats are not the same game with a dial turned — they sit on opposite sides of the supply/demand line.

### 1.3 The load-bearing assumption, and it is weaker than usually treated

Everything above takes **2N** as the QB-capable demand. That is an upper bound assuming every manager plays a QB in the superflex slot every week.

The community treats this as effectively 100%. Sleeper's own explainer says managers "are under no obligation" to start two QBs while calling it best practice ([Sleeper](https://sleeper.com/blog/superflex-fantasy-football/)). Others assert "virtually every team starts two QBs." **No public source could be found that measures the actual rate at which superflex slots are filled with a QB.** [UNVERIFIED]

This matters more than it looks. Sleeper, MyFantasyLeague and ESPN all hold the lineup data that would settle it; none publishes it. Every figure in the table above should therefore be read as a ceiling, and the true demand is 2N minus however often managers punt the slot to a RB/WR — which is likely small but is genuinely unmeasured. **A senior reader deriving this from first principles should not silently assume 100% here.**

---

## 2. Empirical QB value inflation: superflex vs 1QB [MEASURED]

Three public sources, same week, same question: how much more is a QB worth in superflex?

### 2.1 The headline comparison

Because each source normalises its board differently, the honest comparison is **QB1 as a fraction of WR1** and **QB share of top-120 value**.

| Source | Format | QB1/WR1 | QB12/WR1 | QB share of top-120 value |
|---|---|---:|---:|---:|
| FantasyCalc (12tm, PPR, dynasty) | 1QB | 0.57 | 0.26 | 11.9% |
| FantasyCalc | **Superflex** | **1.07** | **0.49** | **25.7%** |
| DynastyProcess (2026-07-24) | 1QB | 0.67 | 0.21 | 11.7% |
| DynastyProcess | **2QB** | **1.12** | **0.62** | **29.9%** |
| KeepTradeCut (2026-07-26) | 1QB | 0.77 | 0.49 | 13.5% |
| KeepTradeCut | **Superflex** | **1.00** | **0.60** | **24.8%** |

**What converges.** On the metric least sensitive to normalisation — QB share of total top-120 value — all three sources agree closely: **QBs go from 12–13% of dynasty board value in 1QB to 25–30% in superflex**, roughly a doubling of the position's aggregate share of the market. The superflex figures cluster tightly (24.8%, 25.7%, 29.9%) despite three entirely different construction methods — completed trades, crowdsourced votes, expert ranks. This is the strongest single result in the document.

**Stated for a non-specialist:** superflex does not make quarterbacks somewhat more valuable. It moves the position from owning about one-eighth of the tradeable market to owning about one-quarter of it. QB goes from a minor line item on the dynasty board to its largest single position.

**What does not converge.** The implied QB1 premium ranges from **+30% (KTC)** to **+88% (FantasyCalc)**. The spread comes almost entirely from the *1QB* baseline, not the superflex number — all three sources put QB1 at roughly parity with WR1 in superflex (1.00–1.12), but they disagree sharply about what QB1 is worth in 1QB (0.57 vs 0.67 vs 0.77). **KTC's 1QB quarterback values are materially higher than the trade-derived sources'**, which compresses its apparent superflex premium. See §8.2.

*Caveat on the KTC figure:* KTC normalises each database so the top asset sits near 9999. In superflex, QB1 (Josh Allen, 9992) and WR1 (Ja'Marr Chase, 9996) are both at that ceiling, so the 1.00 ratio is partly a scaling artifact and should be read as "both are at the top of the board," not as a precise measurement.

### 2.2 QB density on the board [MEASURED]

A cleaner, fully normalisation-invariant view — how many QBs appear in the overall top N:

| Source / format | top 12 | top 24 | top 30 | top 50 |
|---|---:|---:|---:|---:|
| FantasyCalc 1QB | 0 | 2 | 2 | 6 |
| **FantasyCalc superflex** | **4** | **8** | **11** | **16** |
| DynastyProcess 1QB | 0 | 1 | 2 | 5 |
| **DynastyProcess 2QB** | **6** | **11** | **14** | **16** |
| KeepTradeCut 1QB | 1 | 1 | 2 | 6 |
| **KeepTradeCut superflex** | **4** | **7** | **10** | **15** |
| **PFF superflex (analyst-ranked)** | **4** | **8** | **9** | n/a |

PFF row from [Nathan Jahnke, PFF, 2026-02-23](https://www.pff.com/news/fantasy-football-superflex-dynasty-rankings-top-200) (free article). Its top 30 opens with four straight QBs — Allen, Maye, Burrow, Hurts — then no QB until Lamar Jackson at 13.

**Zero to one QB in the top 12 in 1QB; four to six in superflex. By the top 50, roughly one pick in three is a QB.** All four sources — two trade/vote-derived, one expert-derived, one analyst-written — land in the same band despite completely different construction. This is the most robust result in the document.

### 2.3 The draft-market corroboration [SOURCED]

Value charts are opinion aggregates. Draft position is behaviour. Since 2015:

- QB12 average draft position in **1QB**: **101.2**
- QB12 average draft position in **superflex/2QB**: **42.3**
- QB24 average draft position in **superflex**: **100.0**

([Kyle Soppe, Pro Football Network, 2024-01-15](https://www.profootballnetwork.com/superflex-2qb-strategy-fantasy-football/))

The clean way to state this: **the QB24 in superflex is drafted at almost exactly the pick where the QB12 goes in 1QB.** The entire QB cohort shifts up roughly 59 picks — one full round-12-equivalent of draft capital — and the depth requirement shifts down twelve players. This is an independent behavioural confirmation of the value-chart result and it is the single most useful number in this section, because ADP cannot be gamed by a valuation methodology.

Related scoring-density figure from the same article: in 2023, **16 qualified QBs averaged over 17 PPR points per game, against 15 qualified RB/WR combined.** [SOURCED]

*Note:* a widely circulating claim that "the QB24 scores as many points per game as the RB6 and more than the WR5" is frequently attributed to this article. **It does not appear in it.** The article's actual comparison is the 16-vs-15 figure above. Treat the RB6/WR5 version as [UNVERIFIED].

**Independent replication, two years later.** [MEASURED] KeepTradeCut publishes crowdsourced startup ADP separately for each format. Sorting QBs by ADP within each:

| | QB1 | QB6 | QB12 | QB18 | QB24 |
|---|---:|---:|---:|---:|---:|
| Superflex startup ADP | pick 2 | 15 | **39** | 51 | 74 |
| 1QB startup ADP | pick 22 | 63 | **94** | 108 | 123 |

KTC's 2026 superflex QB12 goes at pick **39**; Pro Football Network's 2015–2023 average was **42.3**. KTC's 1QB QB12 goes at **94**; PFN's was **101.2**. **Two independently constructed ADP datasets, different eras, agree within about 7%.** The mean startup-ADP shift across KTC's top-24 superflex QBs is **+55.5 picks** (median +58.5). Individual movements are large: Jordan Love 124 → 41, Trevor Lawrence 125 → 44, Justin Herbert 105 → 26.

### 2.4 Trade liquidity — QBs change hands far more often [MEASURED]

KTC's embedded dataset carries a per-player `tradeCount` for each format. Median trade counts, same players in both:

| Position | Superflex | 1QB | Ratio | QB-specific excess |
|---|---:|---:|---:|---:|
| **QB** (n=53) | 132 | 15 | **8.80x** | **~2.5x** |
| RB (n=108) | 90 | 28 | 3.23x | baseline |
| WR (n=149) | 77 | 22 | 3.50x | baseline |
| TE (n=59) | 68 | 18 | 3.78x | baseline |

The ~3.2–3.8x ratio at RB/WR/TE is the *format popularity baseline* — superflex is simply the more played format on KTC, so everything is traded more there. **Against that baseline, QBs are traded roughly 2.5x more than positional parity would predict.** Superflex does not just make QBs more expensive; it makes them the market's primary trading instrument. This is a genuinely under-discussed structural consequence and it has direct implications for price discovery: QB values in superflex rest on far more transactions than any other position's.

---

## 3. Do QBs actually sit on benches in superflex? [MEASURED]

This is where the folklore is testable, and where it partly fails.

FantasyCalc publishes a `rosterPercent` field per player — the share of connected leagues in its database in which the player is rostered — and it is computed separately for the 1QB and superflex settings. This is real roster-composition data, and it is the best public answer to the question.

### 3.1 Rostered rate by QB rank

| QB rank band | Rostered %, superflex | Rostered %, 1QB |
|---|---:|---:|
| QB1–12 | 100.0% | 99.5% |
| QB13–24 | 99.7% | 96.2% |
| QB25–36 | **96.7%** | 69.5% |
| QB37–48 | **84.1%** | 42.9% |

Depth at which rostered rate first falls below a threshold:

| Threshold | Superflex | 1QB |
|---|---|---|
| < 95% of leagues | QB26 | QB18 |
| < 90% | QB35 | QB25 |
| < 75% | QB45 | QB26 |
| < 50% | QB53 | QB33 |

**The squeeze is real and it is large — but it lives in the QB25–48 band, not at the top.** QB1–24 are universally rostered in *both* formats; that is not a superflex effect. The format's actual signature is that **QB37–48 are rostered in 84% of superflex leagues against 43% of 1QB leagues** — roughly double. Superflex does not change who owns the elite QBs. It changes whether the 40th-best QB in football is a rosterable asset. He is.

### 3.2 League-level composition

Summing rostered-rate across all QBs on the board gives the expected number of rostered QBs per league:

| Format | Rostered QBs per league | Per team (12-team) |
|---|---:|---:|
| Superflex | **53.7** | **4.47** |
| 1QB | 39.6 | 3.30 |

*Caveats:* FantasyCalc reports its average dynasty league as 11.3 teams and 26.7 roster spots, so "per team" is approximate; dynasty rosters include taxi/developmental spots, which inflates both columns; and these are leagues connected to FantasyCalc, not a random sample of all leagues.

### 3.3 Verdict on "every startable QB is someone's starter"

**[FOLKLORE] — and as literally stated, false.**

A 12-team superflex league rosters approximately **53.7 QBs**. There are 32 NFL starting jobs. **The league rosters roughly 22 more QBs than the NFL has starters.** So the pool is not exhausted at the starter line — leagues carry a deep bench of backups, handcuffs and developmental arms well past it.

The claim survives only in a narrower form, and this is the form worth using:

> **In a 12-team superflex league, essentially every NFL starting QB is rostered, and roughly 24 of the 32 are in a starting lineup in a given week. The bench QBs are not startable QBs being hoarded — they are non-starters being stockpiled against the 63-QBs-started-per-season churn rate.**

That version is supported by §1.1 and §3.1 together. The original version is not, and the distinction matters: the second version explains *why* backup QBs have real dynasty value (they are lottery tickets on a starting job), whereas the folklore version implies a hoarding dynamic that the data does not show.

The churn premise is independently evidenced: **nearly 40 top-10 weekly fantasy finishes in 2025 came from players who began the season as backups** ([DraftSharks, 2026-07-03](https://www.draftsharks.com/kb/best-superflex-draft-strategy)), against 63 different QBs starting a game that season. Rostering 4.47 QBs per team is a rational response to that churn rate, not evidence of a scarcity panic.

No origin could be found for the folklore phrasing; it appears to be an oral-tradition compression of the correct arithmetic. [UNVERIFIED]

---

## 4. The shape of the curve, and where it flattens

### 4.1 A methodological warning that has to come first

**FantasyCalc cannot be used to study the shape of the superflex QB curve.** [MEASURED]

Comparing FantasyCalc's superflex and 1QB values player-by-player produces a **constant multiplier within each position**:

| Position | Superflex ÷ 1QB value | Range across all players |
|---|---:|---|
| **QB** | **×1.872** | 1.8707 – 1.8744 |
| RB | ×0.918 | 0.9159 – 0.9204 |
| WR | ×1.001 | 1.0000 – 1.0048 |
| TE | ×1.095 | 1.0935 – 1.0991 |
| Picks | ×1.05 (median) | 1.002 – 1.125 |

The residual spread is integer-rounding. **Every QB in FantasyCalc's superflex database is exactly 1.872 times his 1QB value.** The multiplier is also **invariant to league size** — it is 1.873 / 1.872 / 1.873 at 10, 12 and 14 teams respectively, even though the underlying values do change with team count.

Consequences:

- The *shape* of FantasyCalc's superflex QB curve is identical to its 1QB curve by construction. Any "superflex tier break" read off FantasyCalc is inherited from the 1QB board, not a superflex phenomenon.
- FantasyCalc's model contains **no interaction between superflex and league size.** It structurally cannot express "the squeeze is worse in a 14-team league" — the exact claim §1.1 shows to be true and important. Its own documentation confirms the mechanism: *"We use regression techniques to adjust for league settings including Superflex, TE Premium, PPR settings, and the number of teams"* (FantasyCalc FAQ, retrieved 2026-07-26 — see §8.1 on why this page requires source inspection to read).

This is not a claim that FantasyCalc is wrong about the *level* of QB value; ×1.872 is close to the other sources' aggregate answer. It is a claim that it is the wrong instrument for curve-shape questions.

### 4.2 Curve shape from a source that derives the two formats separately

KeepTradeCut maintains genuinely separate databases, so its two curves can differ in shape — and they do, modestly.

**QBn as a percentage of QB1** ([KTC](https://keeptradecut.com/dynasty-rankings), full embedded dataset, retrieved 2026-07-26):

| | QB3 | QB6 | QB9 | QB12 | QB18 | QB24 |
|---|---:|---:|---:|---:|---:|---:|
| Superflex | 78.8% | 73.8% | 63.9% | **60.0%** | 48.5% | **39.8%** |
| 1QB | 81.7% | 74.5% | 70.6% | **64.5%** | 52.8% | **48.1%** |

KTC's per-player superflex/1QB ratio spans **0.94 to 1.57** (median 1.18) across 49 QBs — varying, as separate derivation implies, and in sharp contrast to FantasyCalc's flat constant. Note that some QBs are worth *less* in superflex than 1QB on KTC's scale (ratio below 1.00), which a scaling approach cannot produce at all.

**The superflex curve is steeper, but the effect is modest until deep in the position** — about 4–7 percentage points more decay through QB18, widening to **8.3 points by QB24** (39.8% vs 48.1%). The gap grows with depth, which is consistent with the squeeze biting hardest at the back of the starter pool rather than at the top. The often-asserted claim that superflex QB value falls off a cliff relative to 1QB is not supported at the magnitude usually implied.

### 4.3 Is the QB curve steeper than other positions? Mostly no [MEASURED]

FantasyCalc superflex, value as % of the positional #1:

| | #3 | #6 | #12 | #18 | #24 |
|---|---:|---:|---:|---:|---:|
| QB | 71% | 65% | 46% | 33% | 26% |
| RB | 72% | 56% | 39% | 31% | 24% |
| WR | 89% | 67% | 46% | 38% | 34% |
| TE | 67% | 42% | 27% | 21% | 18% |

**QB and WR decay at almost identical relative rates** (both 46% of #1 by rank 12). The QB curve is not unusually steep in shape. What is different is the *absolute* altitude: the QB curve sits far higher, so the same percentage decay represents much more surrendered value. **"The QB curve is steep" is a statement about the level, not the shape** — and conflating the two is a common error.

### 4.4 The "QB dead zone" and where breaks actually sit

Largest single-step drops in the FantasyCalc superflex QB curve (12-team, PPR, 2026-07-26):

| Break | Drop |
|---|---:|
| QB1 → QB2 | 13.9% |
| QB2 → QB3 | 17.7% |
| QB6 → QB7 | 12.0% |
| QB13 → QB14 | 10.2% |
| QB17 → QB18 | 11.7% |
| QB21 → QB22 | 12.6% |
| QB24 → QB25 | 9.3% |
| **QB27 → QB28** | **21.3%** |

The largest cliff on the entire board sits at **QB27→QB28**, just past the 24-slot structural demand line, with a secondary break at QB24→QB25 exactly on it.

**This is suggestive, not proof.** Two honest confounds: (a) per §4.1 this shape is inherited from the 1QB curve, so it cannot be a superflex-specific effect in this dataset; (b) the break may simply reflect where the market stops believing a player will hold an NFL starting job — which is *correlated with* the 24-slot line for obvious reasons but is not caused by league structure. Presenting this as the market "pricing the squeeze" would be overreach. [MEASURED, with confounds]

---

## 5. Dynasty-specific: age, career length, and the contend/rebuild implication

### 5.1 The longevity gap, quantified [MEASURED]

The cleanest available quantification, computed over each position's top 24 by FantasyCalc superflex dynasty value (2026-07-26):

| Position | Players 28+ in top 24 | % of top-24 value held by 28+ | Players 30+ | % of value held by 30+ | Oldest player in top 24 |
|---|---:|---:|---:|---:|---:|
| **QB** | **12** | **49.6%** | **6** | **24.1%** | **38.5** |
| RB | 4 | 12.5% | 2 | 6.4% | 32.6 |
| WR | 1 | 3.2% | 0 | 0.0% | 29.1 |
| TE | 5 | 12.8% | 4 | 10.6% | 36.8 |

**Independently replicated on KeepTradeCut's superflex data** (different source, different methodology, same day):

| Position | % of top-24 value held by 28+ | % held by 30+ |
|---|---:|---:|
| **QB** | **46.0%** | 21.0% |
| RB | 13.2% | 6.6% |
| WR | 3.3% | 0.0% |
| TE | 14.8% | 12.0% |

**The two sources agree to within four percentage points at every position.** A trade-derived market and a crowdsourced vote market independently produce the same age structure, which makes this one of the better-established facts in the document.

**Roughly half of all elite dynasty QB value is held by players aged 28 or older. At wide receiver the figure is about 3%.** That is a ~14x difference and it is the single most striking positional asymmetry in dynasty football. Not one WR aged 30+ appears in either source's top 24; five to six QBs do.

*Caveat:* this measures the current market's age distribution, not a causal aging curve. It reflects both real longevity and the market's *belief* about longevity, and the two are not separable from this data. It is nonetheless the right number for a dynasty asset-allocation question, because what a manager can actually sell an asset for is a market fact regardless of whether the market is correct.

### 5.2 The aging-curve literature [SOURCED]

Adam Harstad's mortality-table analysis (Footballguys, 2015-09-06, free) covers 30 NFL seasons (1985–2014) and models "second-contract" QBs to limit survivorship bias. Its central move is to reject smooth decline in favour of a hazard model — players "remain productive until one day when they're not."

- A 25-year-old quality QB has approximately **9.46 expected years of fantasy relevance remaining.**
- Annual probability of catastrophic decline: **5.0% at age 30, 18.6% at 35, 69.2% at 40, 100% at 42.**

[https://www.footballguys.com/article/HarstadDiP19?article=HarstadDiP19](https://www.footballguys.com/article/HarstadDiP19?article=HarstadDiP19)

Contrast at the other positions:

- RBs peak roughly **1.5 years earlier** than WRs and have about **half the career longevity at the top level**; RBs decline ~15% annually in their prime against ~10% for WRs. High-end WRs show no statistically significant PPG drop until age 30 and hold peak trade value **3.5–4 years longer** than RBs. ([PFF, dynasty age tendencies](https://www.pff.com/news/fantasy-football-dynasty-age-tendencies-of-the-top-wide-receivers); [Footballguys, Parsons](https://www.footballguys.com/article/parsonsthenewreality7)) [SOURCED]
- **14% of qualifying QB seasons occur at age 35+, roughly 10x the rate at tight end.** [SOURCED]

**An important qualifier the community frequently drops:** the aging advantage is *archetype-dependent*. For dual-threat QBs the curve reportedly resembles a running back's more than a pocket passer's, because the rushing production that drives their fantasy edge is the first thing to decay. Given that the modern elite superflex QB tier is disproportionately rushing QBs, **the "QBs age well" premise may be weakest precisely where the money is.** This is a live and under-examined tension rather than a settled finding. [SOURCED, contested]

### 5.3 What this means for contend vs. rebuild

Combining §5.1 and §5.2, the structural conclusion is: **QB is the position where the contend/rebuild axis collapses.** An asset that is universally rostered (§3.1), holds half its positional value past 28 (§5.1), and carries a 9.5-year expected relevance horizon at 25 (§5.2) does not depreciate on a rebuild timeline the way a RB does. A rebuilding team that sells a 29-year-old elite QB is selling into the position's flattest depreciation window — the opposite of the RB logic that the sell-early heuristic was built on.

This is a reasoning chain from the cited evidence, not a claim any single source makes in this form. Treat it as an inference, not a citation.

### 5.4 Rookie picks in superflex — the common claim is probably backwards [MEASURED]

The community consensus is that rookie picks are worth *more* in superflex, because picks are lottery tickets on franchise QBs. **Two of the three major sources say the opposite.**

Rookie pick 1.01 (or earliest-1st equivalent) by **overall board rank** — normalisation-invariant, all retrieved the same week:

| Source | Rank in 1QB | Rank in superflex/2QB | Direction |
|---|---:|---:|---|
| **FantasyCalc** (2026-07-26) | 11 | **15** | Picks fall — **relatively cheaper** |
| **KeepTradeCut** (2026-07-26) | 33 | **40** | Picks fall — **relatively cheaper** |
| **DynastyProcess** (2026-07-24) | 17 | **6** | Picks rise sharply — **more valuable** |

KTC's effect is systematic across the whole pick board, not a single-asset artifact. Every early-round pick loses ground in superflex:

| Pick | 1QB rank | SF rank | Move |
|---|---:|---:|---:|
| 2027 Early 1st | 17 | 21 | −4 |
| 2026 Early 1st | 33 | 40 | −7 |
| 2027 Late 1st | 59 | 69 | −10 |
| 2026 Mid 1st | 71 | 80 | −9 |
| 2028 Mid 1st | 72 | 84 | −12 |
| 2026 Late 1st | 90 | 97 | −7 |
| 2026 Early 2nd | 125 | 137 | −12 |

**Reading.** The logic behind the community claim is sound in isolation — a pick that might return a franchise QB is worth more when QBs are worth more. But it omits the competing effect: in superflex, the pick must also out-compete an *inflated QB cohort* for the same board position. Twenty-odd quarterbacks jump ahead of it. Both effects are real; two of three sources say the second one wins.

DynastyProcess is the outlier, and §8.3 explains why its pick values behave differently: it derives its 2QB board from a separate expert consensus that prices picks on the lottery-ticket logic directly, rather than from transactions in which picks compete against QBs for scarce roster capital.

**Status: contested, leaning against the consensus.** The two sources grounded in actual market behaviour (FantasyCalc trades, KTC votes and trade counts) agree that picks lose relative ground in superflex; the expert-opinion source disagrees. That pattern — behaviour saying one thing and expert opinion the other — is itself the interesting finding, and it is the kind of split that should be reported rather than averaged away.

---

## 6. The strategic literature

### 6.1 The "konami code" — the term, and what actually backs it

**Origin.** The term was coined by **Rich Hribar**, then at numberFire, in **2013**, describing rushing quarterbacks as a cheat code — a reference to the Konami button sequence from 1980s games. The attribution is documented at [Football Absurdity (Jeff Krisko, 2021-02-08)](https://footballabsurdity.com/2021/02/08/fantasy-football-konami-code-quarterbacks-are-no-longer-a-luxury/), which links to Hribar's original 2013 piece. [SOURCED — secondary attribution; the primary 2013 article was not directly retrieved. Treat the *attribution* as well-established and the exact 2013 wording as [UNVERIFIED].]

**The quantified case** ([Shane Hallam, DraftSharks, 2025-07-28](https://www.draftsharks.com/article/fantasy-football-draft-preview-quarterbacks), free):

- *"Since 2019, the overall QB1 has scored at least 4 rushing TDs and run for at least 350 yards every year."*
- *"Over the past five seasons, top-12 QBs have averaged 360 rushing yards and 4.2 rushing TDs."*
- *"Among the 15 top-3 QBs over the past five seasons, nine hit at least 4 rushing TDs. Eight of them hit at least 350 rushing yards."*

Corroborating single-season detail ([Kevin English, DraftSharks, 2026-07-03](https://www.draftsharks.com/kb/best-superflex-draft-strategy), free): Josh Allen led with 579 rushing yards and 14 rushing TDs; **eight of the top ten QBs recorded at least 2 rushing TDs and seven gained 200+ rushing yards.**

**Honest reading.** These are *descriptive* statistics about who finished at the top, not predictive tests. "Nine of fifteen top-3 QBs had 4+ rushing TDs" establishes that rushing is common among elite finishers; it does not establish rushing as a *drafting edge*, because it does not report the base rate — how many rushing QBs *failed* to finish top-3. **No public non-paywalled source could be found that tests konami-code selection against a proper control group.** [UNVERIFIED] The concept is well-evidenced as a description and under-evidenced as a strategy. This distinction matters especially in dynasty, where §5.2's archetype caveat cuts the other way: the rushing production driving the edge is the first thing age takes.

### 6.2 Early-QB vs late-QB: an unresolved debate with weak data on both sides

This is the format's central strategic argument, and **the striking finding of this research pass is that no rigorous public win-rate study resolving it could be located.** [UNVERIFIED] Both camps argue from mock drafts, ADP and reasoning rather than outcome data.

**The early-QB case.** Rests on §1.1 arithmetic and §2.3 ADP: 24 of 32 starters are consumed weekly, and the cost of entry rises ~55 picks. Commonly stated as one QB in rounds 1–2 and a second in rounds 4–6. The strongest version is not "QBs score more" but "the replacement level is brutal" — the QB24 is your *second starter* in superflex, not a bench asset.

**The late-QB case, which has better data than it is usually given credit for.** [Kevin English, DraftSharks, 2026-07-03](https://www.draftsharks.com/kb/best-superflex-draft-strategy) argues from a top-24 QB scoring distribution over 2017–2023 that the position "flattens out," so early QB picks carry diminishing returns against elite talent elsewhere. He explicitly advises against opening QB-QB. Supporting churn evidence from the same piece: Jacoby Brissett averaged 20.2 PPG across his starts (QB15 overall), Tyler Shough posted four top-12 finishes after Week 9, and **nearly 40 top-10 weekly fantasy finishes in 2025 came from players who were Week 1 backups.**

That last figure is the quantitative core of the late-QB position and it connects directly to §1.1: with 63 different QBs starting a game in 2025, the starting pool is far more fluid within a season than the static 32-slot arithmetic suggests. **The structural squeeze is real at the season level and considerably leakier at the weekly level.**

PFF's analyst position sits with the late-QB camp on the margin ([Nathan Jahnke, 2026-02-23](https://www.pff.com/news/fantasy-football-superflex-dynasty-rankings-top-200)): *"When weighing a top-tier wide receiver, running back or tight end against a cluster of similarly valued quarterbacks in this range, the better strategic move is often to prioritize the non-quarterback."*

**Verdict: genuinely unsettled.** Anyone presenting either side as established consensus is overreaching. The honest summary is that the *arithmetic* favours securing QBs and the *scoring distribution* favours waiting, and no public study adjudicates between them on outcomes.

### 6.3 How many QBs to roster

Prescriptive advice converges on **four QBs in a 12-team superflex** ([DraftSharks, 2026-07-03](https://www.draftsharks.com/kb/best-superflex-draft-strategy)), for bye weeks and matchup flexibility.

**This matches measured behaviour closely.** §3.2 finds an average of **4.47 rostered QBs per team** in FantasyCalc's superflex leagues. A prescriptive heuristic and an independent behavioural measurement landing within half a roster spot is a reasonable indication that the advice reflects actual practice rather than aspiration.

### 6.4 The "QB dead zone"

The term is used loosely and inconsistently, and **no canonical definition or originating article could be located.** [UNVERIFIED] In circulation it refers to a middle band of QBs — roughly QB10–20 — priced like starters while offering production close to what is freely available later, making them the worst value on the board.

Two observations from the data in this document:

- The concept describes a *flat tier*, and KTC's curve (§4.2) does show the shallowest decay of the whole board between QB3 and QB6 (78.8% → 73.8%), with another flat stretch through QB12–18.
- However, the largest actual cliffs in the FantasyCalc superflex curve sit at **QB27→28 (21.3%)** and **QB2→3 (17.7%)** — not in the QB10–20 band (§4.4).

**Treat "QB dead zone" as a useful heuristic label rather than a measured phenomenon.** [FOLKLORE] It has not been operationalised precisely enough in public writing to test.

---

## 7. Where the community is wrong or unsettled

The genuinely contested claims, separated from the settled ones. Several of these are contested *without the community realising it*, because the disagreement lives inside the tools rather than in the discourse.

### 7.1 Contested: rookie picks in superflex — consensus may be backwards

**Claim:** "Rookie picks are worth more in superflex because they're QB lottery tickets."

**Status:** Two of three major sources say the opposite (§5.4). FantasyCalc and KeepTradeCut both show early picks losing 4–12 places of overall board rank in superflex; only DynastyProcess shows them gaining. The behaviour-derived sources disagree with the opinion-derived one. **The consensus statement should not be repeated without this caveat.**

### 7.2 Contested: the size of the elite-QB premium depends entirely on which source you anchor to

**Claim:** "QB1 is worth roughly Nx more in superflex."

**Status:** N ranges from **1.30 to 1.88** across the three sources (§2.1), and the disagreement is driven almost entirely by the *1QB baseline*, not the superflex figure. KTC prices 1QB quarterbacks well above both trade-derived sources (QB1/WR1 of 0.77 vs 0.57 and 0.67).

**Which one is wrong is genuinely unresolved.** A plausible reading is that KTC's forced-choice voting format inflates QB values in 1QB because voters answer with format-agnostic instincts about player quality; an equally plausible reading is that FantasyCalc's trade sample under-prices 1QB QBs because QBs are traded rarely there (median trade count 15, per §2.4) and thin markets are noisy. **No public analysis adjudicating this could be found.** [UNVERIFIED] Anyone quoting a specific multiplier should name the source and the baseline.

### 7.3 Wrong as stated: "every startable QB is someone's starter"

Addressed in §3.3. A 12-team superflex league rosters ~53.7 QBs against 32 NFL starting jobs. **[FOLKLORE]** The defensible version is narrower: essentially every NFL starting QB is rostered, ~24 of 32 are in weekly lineups, and the remainder of the rostered pool is churn insurance against a season in which 63 different QBs start a game.

### 7.4 Wrong as stated: "the superflex QB curve is much steeper"

Addressed in §4.3. QB and WR decay at **near-identical relative rates** (both 46% of positional #1 by rank 12). The QB curve is higher, not sharper. **The statement conflates altitude with gradient.** KTC's separately-derived data does show the superflex QB curve steeper than its own 1QB curve, but by 4–8 percentage points (§4.2) — a real effect, an order of magnitude smaller than the rhetoric.

### 7.5 Unmeasured, and load-bearing: how often is the superflex slot actually a QB?

Addressed in §1.3. Every version of the squeeze arithmetic assumes ~100%. **No public source measures it.** [UNVERIFIED] The platforms hold the data; none publishes it. This is the single largest unmeasured input to the entire argument, and it is rarely flagged.

### 7.6 A tool problem the community treats as a market fact

**FantasyCalc's superflex QB values are a flat ×1.872 scalar with no league-size interaction (§4.1).** Its superflex curve shape is its 1QB curve shape. This is not widely known, and it means a large body of community analysis citing FantasyCalc for superflex curve shape, tier breaks, or league-size effects is reporting an artifact. **DynastyProcess's published methodology no longer matches its shipped data (§8.3).** Neither of these is a scandal — both are reasonable engineering choices with stale docs — but both are invisible unless you check, and neither appears in the community discourse that leans on these tools.

### 7.7 Under-examined tension: the aging argument is weakest where the money is

Addressed in §5.2. The dynasty case for QBs rests on longevity (§5.1: ~half of elite QB value is held by players 28+). But the aging advantage is archetype-dependent — dual-threat QBs reportedly age closer to running backs, because rushing production decays first. **The modern elite superflex QB tier is disproportionately rushing QBs** (§6.1). The community applies pocket-passer longevity data to a rushing-QB-dominated asset class. **[SOURCED, contested]** — this tension is acknowledged in the aging literature but is largely absent from superflex valuation discussion.

### 7.8 Where consensus genuinely does not exist

To be explicit rather than manufacturing agreement:

- **Early-QB vs late-QB in superflex startups.** No public outcome study. Both camps argue from reasoning and mocks. (§6.2)
- **Whether elite superflex QBs are currently overpriced.** Argued in both directions; no measured resolution located. [UNVERIFIED]
- **Whether the "QB dead zone" is a real pricing inefficiency or a slogan.** Never operationalised precisely enough to test. (§6.4)
- **Whether konami-code selection is a predictive edge or a descriptive pattern.** No control-group test found. (§6.1)

---

## 8. How the major value sources handle superflex

This section is the practical takeaway for anyone consuming these numbers: **the three major public sources answer the superflex question by three genuinely different mechanisms, and the differences are large enough to change conclusions.**

### 8.1 FantasyCalc — market-derived base, regression-adjusted for format

- **Mechanism:** Values are inferred from real completed trades — **6,589,799** as of 2026-07-26 (live count: `https://api.fantasycalc.com/trades/count`). Outlier trades with large value gaps between sides are discarded; remaining implied values are averaged with recency weighting. Format is then applied on top: *"We use regression techniques to adjust for league settings including Superflex, TE Premium, PPR settings, and the number of teams."*
- **Superflex is SCALED, not separately derived.** [MEASURED] — a flat per-position constant (QB ×1.872), invariant to league size. See §4.1.
- **Strength:** the largest genuine trade sample in public. Behavioural, not opinion-based.
- **Limitation:** cannot express superflex × league-size interaction; cannot be used for curve-shape analysis; mechanically distorts pick values relative to QBs (§5.4).
- *Reading their FAQ requires inspecting the JS bundle — the site is client-rendered and returns an empty document shell to fetchers. The methodology text quoted above was read from the application source at `fantasycalc.com/chunk-JVVAHE45.js`. Noted because "the FAQ says X" is not casually verifiable here.*

### 8.2 KeepTradeCut — crowdsourced, genuinely separate databases

- **Mechanism:** Users answer forced-choice "Keep / Trade / Cut" prompts on player triples; an **adapted ELO algorithm** converts these into values. Baseline format is 12-team, 0.5 PPR. ([KTC FAQ](https://keeptradecut.com/frequently-asked-questions))
- **Superflex is SEPARATELY DERIVED.** In KTC's own words: *"We essentially keep two totally separate databases of values running in parallel for Superflex and 1QB"* — each fed by its own input votes, so even non-QB positions can diverge between formats. [SOURCED, and corroborated [MEASURED] by the 0.94–1.57 per-player ratio spread in §4.2 — including QBs valued *lower* in superflex, which no scaling scheme can produce.]
- **Strength:** the only major source whose superflex curve shape is independently meaningful. Its dataset is also far richer than the rendered pages suggest — the full 500-player array, carrying both formats' values, ranks, ages, startup ADP, trade counts and liquidity, is embedded in the page source as `playersArray` on `https://keeptradecut.com/dynasty-rankings`. Most of the novel measurements in §2.3, §2.4 and §5.1 come from it.
- **Limitation:** it measures *stated preference*, not completed trades. Its 1QB QB values run materially above both trade-derived sources (QB1/WR1 of 0.77 vs 0.57 and 0.67), which is the main driver of cross-source disagreement in §2.1 — and the direction of that bias is what §7 flags as contested. It also does not adjust for league size, scoring or roster configuration at all, and its top-of-board values saturate near 9999, compressing comparisons among elite assets.

### 8.3 DynastyProcess — expert-consensus-derived (and its published methodology is out of date)

- **Mechanism:** Converts FantasyPros dynasty expert consensus rankings (ECR) into values via a published exponential decay curve, shipping `ecr_1qb`, `ecr_2qb`, `value_1qb` and `value_2qb` in one open CSV. [Data](https://github.com/dynastyprocess/data) | [methodology](https://dynastyprocess.com/values/)
- **The value formula is exactly** `Value = 10500 * e^(ECR * -0.0235)`. [SOURCED — and [MEASURED]: this reproduces the shipped `value_1qb` column to the integer for every player checked. A rare case of a public fantasy source publishing a formula that actually verifies.]
- **On superflex, the documentation and the data disagree.** The site describes the 2QB conversion as *"a LOESS regression analysis comparing 1QB and 2QB overall ADP (borrowing the latter from DLF via Mizelle) to figure out an algorithm to convert FantasyPros 1QB overall rankings to a 2QB equivalent"* — i.e. a deterministic rank-space transform of the 1QB input, used because FantasyPros did not aggregate 2QB consensus.

  **The shipped data cannot have been produced that way.** [MEASURED] A monotone transform of `ecr_1qb` cannot reorder players, yet the file contains **99 QB pairs whose 2QB ordering reverses their 1QB ordering by more than three ranks.** The clearest example: Drake Maye is ranked *ahead* of Lamar Jackson in 1QB ECR (26.5 vs 33.1) but far *behind* him in 2QB ECR (21.0 vs 6.5). Per-player QB value ratios span **1.14 to 6.04**, which no scalar or monotone remap can generate.

  FantasyPros now publishes a distinct [dynasty superflex/2QB consensus ranking](https://www.fantasypros.com/nfl/rankings/dynasty-superflex.php). The most likely explanation is that DynastyProcess switched to that genuine 2QB ECR input while the methodology page still documents the legacy LOESS approach. **Treated as: superflex is separately derived in the current data, with the caveat that the public documentation no longer describes what the file contains.** [MEASURED + inference]
- **Strength:** fully open data, both formats in one file, published and verifiable value formula, longest reproducible history.
- **Limitation:** expert opinion, not market behaviour. Highly sensitive to disagreement between two separate FantasyPros panels. It also normalises differently — non-QBs are *deflated* to ~0.76 in the 2QB board rather than QBs being inflated — which produces spurious conclusions if raw values are compared across formats without rebasing. And its documentation should not be cited without checking it against the data.

### 8.4 Summary

| | FantasyCalc | KeepTradeCut | DynastyProcess |
|---|---|---|---|
| Input | ~6.59M real trades | Crowdsourced KTC votes (ELO) | FantasyPros expert consensus |
| Evidence type | Revealed preference (behaviour) | Stated preference (votes) | Expert opinion |
| Superflex handling | **Scaled** — flat ×1.872 on QBs | **Separately derived** — parallel vote DBs | **Separately derived** in data; docs say otherwise |
| Varies with league size? | Values yes; **SF premium no** | No | No |
| Usable for curve shape? | **No** | Yes | Yes |
| Open data? | Yes (undocumented API) | No (page scrape) | **Yes (CSV on GitHub)** |
| Documentation reliable? | Yes, but buried in JS bundle | Yes | **No — describes a superseded method** |

**Practical guidance:** use FantasyCalc for *level* and market realism, KTC or DynastyProcess for *shape*, and never compare raw values across sources without rebasing to a normalisation-invariant metric.

---

## 9. Source list

All sources below are free and non-paywalled as accessed. Retrieval dates 2026-07-24 to 2026-07-26.

**Primary datasets (reproducible)**

| Source | URL | Notes |
|---|---|---|
| FantasyCalc values API | `https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=2&numTeams=12&ppr=1` | Undocumented, unauthenticated. `numQbs=1` for 1QB. Carries `maybeRosterPercent`, `maybeAge`, `maybeTradeFrequency`. |
| FantasyCalc trade count | `https://api.fantasycalc.com/trades/count` | Live integer; 6,589,799 at retrieval. |
| DynastyProcess values | [github.com/dynastyprocess/data → `files/values.csv`](https://github.com/dynastyprocess/data) | Ships `ecr_1qb`, `ecr_2qb`, `value_1qb`, `value_2qb`, `age`. Scrape date 2026-07-24. |
| KeepTradeCut full dataset | [keeptradecut.com/dynasty-rankings](https://keeptradecut.com/dynasty-rankings) | 500-player `playersArray` embedded in page source; both formats, plus age, startup ADP, trade counts, liquidity. |
| KTC rankings pages | [QB](https://keeptradecut.com/dynasty-rankings/qb-rankings) · [WR](https://keeptradecut.com/dynasty-rankings/wr-rankings) | Append `?format=1` for the 1QB database. |

**Methodology statements**

- KeepTradeCut FAQ — [keeptradecut.com/frequently-asked-questions](https://keeptradecut.com/frequently-asked-questions) — ELO algorithm; "two totally separate databases" for superflex and 1QB; 12-team 0.5 PPR baseline.
- FantasyCalc FAQ — [fantasycalc.com/frequently-asked-questions](https://fantasycalc.com/frequently-asked-questions) — client-rendered; methodology text readable only from the JS bundle (`fantasycalc.com/chunk-JVVAHE45.js`). Source of the "regression techniques to adjust for league settings including Superflex" wording and the 11.3-team / 26.7-roster-spot average.
- DynastyProcess methodology — [dynastyprocess.com/values](https://dynastyprocess.com/values/) — `Value = 10500 * e^(ECR * -0.0235)`; LOESS 1QB→2QB description (superseded by the shipped data — see §8.3).
- FantasyPros dynasty superflex ECR — [fantasypros.com/nfl/rankings/dynasty-superflex.php](https://www.fantasypros.com/nfl/rankings/dynasty-superflex.php)

**NFL supply data**

- 2026 bye weeks, max six teams in Week 11 — [NFL.com, 2026-05-15](https://www.nfl.com/news/2026-nfl-schedule-release-every-team-bye-week)
- 63 different QBs started a game in 2025 (incl. playoffs) — [Nick Shook, NFL.com, 2026-02-11](https://www.nfl.com/news/ranking-all-63-starting-quarterbacks-from-the-2025-nfl-season)
- 62 starting QBs, regular season — [FanSided](https://fansided.com/nfl/all-62-starting-qbs-from-the-2025-nfl-season-ranked)

**Strategy and analysis**

- QB12/QB24 ADP in 1QB vs superflex since 2015 — [Kyle Soppe, Pro Football Network, 2024-01-15](https://www.profootballnetwork.com/superflex-2qb-strategy-fantasy-football/)
- Superflex draft strategy, four-QB recommendation, QB scoring flatness, 2025 backup finishes — [Kevin English, DraftSharks, 2026-07-03](https://www.draftsharks.com/kb/best-superflex-draft-strategy)
- Konami-code rushing statistics — [Shane Hallam, DraftSharks, 2025-07-28](https://www.draftsharks.com/article/fantasy-football-draft-preview-quarterbacks)
- Konami-code term attribution to Rich Hribar (2013) — [Jeff Krisko, Football Absurdity, 2021-02-08](https://footballabsurdity.com/2021/02/08/fantasy-football-konami-code-quarterbacks-are-no-longer-a-luxury/)
- Superflex dynasty top-200 and the prioritise-the-non-QB argument — [Nathan Jahnke, PFF, 2026-02-23](https://www.pff.com/news/fantasy-football-superflex-dynasty-rankings-top-200)
- Early superflex QB-value analysis (dated; 2016 data) — [Jeff Tefertiller, Footballguys, 2017-07-09](https://www.footballguys.com/article/17OffseasonTefertiller_Assessing_Quarterback_Value_in_Superflex_Leagues)
- Superflex format definition and the no-obligation point — [Sleeper](https://sleeper.com/blog/superflex-fantasy-football/)

**Aging and career length**

- QB mortality tables, 1985–2014; 9.46 expected years at 25; decline rates by age — [Adam Harstad, Footballguys, 2015-09-06](https://www.footballguys.com/article/HarstadDiP19?article=HarstadDiP19)
- WR age tendencies; no significant PPG drop before 30 — [PFF](https://www.pff.com/news/fantasy-football-dynasty-age-tendencies-of-the-top-wide-receivers)
- WR age decline and dynasty startup implications — [Footballguys, Parsons](https://www.footballguys.com/article/parsonsthenewreality7)
- Production curves and positional falloff by age — [4for4](https://www.4for4.com/2025/preseason/production-curves-positional-breakouts-prime-years-and-falloffs-age)

**Sources sought and unavailable**

- FTN Fantasy superflex draft strategy — HTTP 403.
- Dynasty League Football startup articles — HTTP 403.
- KTC rookie-pick rankings page — HTTP 500 (data recovered instead from the embedded array above).
- Any platform-published data on how often the superflex slot is filled with a QB — does not appear to exist publicly (§1.3, §7.5).
- Any outcome/win-rate study on early-QB vs late-QB in superflex — none located (§6.2, §7.8).

---

## Appendix: what would settle the open questions

For anyone extending this work, the four highest-value missing measurements, in order:

1. **Superflex slot composition.** What fraction of superflex slots contain a QB, by week and by league competitiveness? Requires platform lineup data. Would convert §1.1 from an upper bound into a measurement and is the single biggest gap.
2. **Outcome data on QB draft timing.** Final standings against startup QB draft capital, across a large league sample. Would settle §6.2, the format's central strategic debate.
3. **Longitudinal superflex QB value.** Both FantasyCalc and KTC hold value history; a multi-year series of the QB share-of-board metric in §2.1 would establish whether the premium is inflating, deflating or stable — currently asserted in both directions with no data.
4. **A konami-code control test.** Rushing-QB selection against a matched non-rushing control, measured on subsequent finish rather than on the finishers. Would convert §6.1 from description to strategy.
