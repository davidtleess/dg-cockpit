# L3 — Advanced Statistics

**Foundation layer 3 of 4.** The analytics layer that separates a serious fantasy product from a
scoreboard. Written 2026-08-17.

> **The whole file in one paragraph.**
> Opportunity repeats, efficiency does not — WR **target share YoY >0.70** vs **YPRR 0.51** vs
> **RB RYOE R² ≈0.01**. The stabilisation points that govern every rate on a surface are
> **TPRR 184 routes · YPRR 351 routes · YPT 205 targets · TDPRR 882 routes**, and "stabilised" means
> *half signal*, not trustworthy. The shrinkage rule
> `(obs×N + league_avg×S) / (N+S)` turns every one of those into a drawable second value. The naive
> baseline you must beat is **FP/game at 0.68**. And the worst number in common use is
> **yards per carry, 0.16**.



## 0. How this extends `craft/how-the-hobby-speaks.md`, and one correction it forces

Layer 1 (`how-the-hobby-speaks.md`) answered **how practitioners SAY a quantity** — the nouns, the
vernacular, the published bars. It is a vocabulary file. This file answers three questions it did
not ask:

| L1 asked | L3 asks |
|---|---|
| What is this metric called, and what bar do people quote? | **Does the metric predict anything, or only describe?** |
| Is it in our data? | **How much of it do we need before the number means anything?** |
| — | **How do you draw it so a non-analyst reads it correctly?** |

**Where this file extends L1, explicitly:**

1. **L1's YPRR stabilisation threshold is wrong and should be corrected.** L1 states YPRR
   "stabilises at **180+ routes / 11+ games**." The primary reliability research says **YPRR
   stabilises at 351 routes / 14 games**. The ~185-route figure belongs to **TPRR (184 routes)** and
   **receptions per route run (188 routes)** — the two metrics that stabilise fastest. The
   180-route number appears to have migrated from the TPRR result onto YPRR somewhere in the
   secondary-source chain. Source: Danny Tuccitto, *Intentional Rounding*, split-half analysis of
   PFF 2007–2013 (§4.1 below). **The practical consequence is large:** L1's own instrument run used
   a 180-route floor and reported 174 qualifying receivers. At the correct YPRR floor, roughly half
   of those receivers' YPRR figures are still more noise than skill.
2. **L1 lists bars; L3 supplies the shrinkage rule that replaces most bars.** A hard bar
   ("20% TPRR") produces the exact defect L1 caught with Ashton Jeanty. The reliability literature
   supplies a continuous alternative — regress toward the league mean by
   `stabilisation_point / (observations + stabilisation_point)` — which never lies at a boundary.
   That formula is the single most designer-relevant result in this file.
3. **L1 does not separate predictive from descriptive metrics.** It lists TPRR and YPRR in the same
   table with the same standing. They are not the same kind of claim. §1 vs §2 here draw that line
   and cite the correlations.
4. **L1's defect #2 (postseason contamination) generalises.** It is one instance of a family — §8.
5. **L1 does not cover QBs, expected points, or presentation at all.** §3, §5, §7.

**What L1 got right and this file does not repeat:** the vernacular, the positional-rank unit
("WR2 volume", not "11.31 points a game"), and the rule that a coined term is a defect even when the
maths is correct. All of that stands. Read it first.

**Source quality — read the citations with this in mind.** Three tiers are mixed below, deliberately
labelled rather than blended:

- **Primary research** (methodology published, numbers reproducible): Intentional Rounding's
  split-half work, 4for4's correlation studies, SumerSports, nfelo, PFF's own methodology posts, the
  nflverse data dictionaries. **Every stability and correlation figure in this file comes from these.**
- **Vendor documentation** (authoritative for definitions, silent on validity): nflreadr dictionaries,
  NGS field descriptions, PlayerProfiler's glossary.
- **Convention sources** (widely repeated, no published study behind them): the threshold values for
  WOPR tiers, target-share bars, snap-share bars, aDOT bands. These are **conventions the hobby
  agrees on**, not findings. They are legitimate as drawn reference lines and illegitimate as
  computed verdicts. §4.4 audits which ones survive contact with the research.

**One section is weaker than the rest, and says so. §7 (presentation) is NOT at the standard of
§§1–6 and 8.** A commissioned research pass on presentation conventions never returned, and an
earlier draft of §7 wrote up its expected findings as though it had — inventing specifics about
rbsdm.com, PFF and PlayerProfiler that no source in this session supports. Those have been removed
and every remaining claim is tagged **[VERIFIED]** or **[UNVERIFIED]**. Read §7's header note before
using anything in it. §§1–6 and 8 are unaffected: every number in them traces to a fetch recorded
here.

---

## 1. The opportunity metrics — the ones that repeat year to year

**The organising fact.** Opportunity is what a player is *given*; efficiency is what he *does with
it*. Across every study cited below, opportunity metrics carry the predictive load and efficiency
metrics carry almost none. 4for4's 2024 WR study (2017–2023, WRs with 30+ targets in consecutive
seasons) ranks 23 rate stats by correlation to **next-season** fantasy points; the top of the board
is volume, and the bottom is efficiency, with almost no interleaving.
([4for4 WR](https://www.4for4.com/2024/preseason/most-predictable-wide-receiver-stats))

### 1.1 The table

| metric | definition | unit | predictive? | practitioner threshold | source |
|---|---|---|---|---|---|
| **Target share** | Player's share of his team's receiving targets. nflverse computes it per game; **PlayerProfiler computes it only over games "he was involved in the passing attack"** — different number, same name. | % (0–100) | **Yes — top tier.** >0.70 year-to-year correlation *and* >0.70 correlation to fantasy points | **>20%** → WR1/WR2 outcomes; **25%+** with 15+ PPR/g over 12+ games = "alpha" season. 2025 alphas: JSN 32.6%, Chase 30.2%, Nacua 28.8%, St. Brown 28.5% | [nflreadr dict](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_playerstats.csv) · [PlayerProfiler glossary](https://www.playerprofiler.com/terms-glossary/) · [Fantasy Classroom sticky stats](https://fantasyclassroom.org/Blogs/sticky-stats/wr-sticky-season-totals) · [Fantasy Strategy Guide](https://fantasystrategyguide.com/target-share-analysis/) |
| **Snap share** | Share of team offensive plays the player was on the field for. | % | **Yes for RB; weak for WR.** Snap share correlates strongly with RB fantasy points, weakly with WR — 2024–25 top WRs cluster anywhere in 60–80% | **70%+** the working baseline for consistent production. RB bell-cow line **70–75%+**; only ~4 backs a season clear 75% | [PlayerProfiler glossary](https://www.playerprofiler.com/terms-glossary/) · [FantasyData snap trends](https://fantasydata.com/fantasy-football-beneath-the-surface-snap-share-trends) |
| **Route participation** (route rate) | Share of team pass plays on which the player ran a route, in games he was active. | % | **Descriptive of role, near-zero as a rate predictor.** 4for4 puts "route rate" at **−0.05** to next-season FP — because it is a *precondition*, not a differentiator among qualified starters | Full-time ≈ **80%+** | [PlayerProfiler glossary](https://www.playerprofiler.com/terms-glossary/) · [4for4 WR](https://www.4for4.com/2024/preseason/most-predictable-wide-receiver-stats) |
| **Routes run** | Count of routes. **The denominator that makes every per-route metric work.** | count | It is a sample-size variable, not a skill variable | See §4 — 184 / 351 / 882 routes for TPRR / YPRR / TDPRR | [Intentional Rounding](https://intentionalrounding.com/when-do-yards-per-route-run-targets-per-route-run-and-yards-per-target-stabilize/) |
| **TPRR** — targets per route run | Targets ÷ routes run. | % | **Yes.** 0.53 to next-season FP; **the stickiest receiving rate there is** (split-half r reaches 0.89 at 36 games) | **≥20%.** League average **19.9%** (WR, PFF 2007–13); TE average **18.1%** | [4for4 WR](https://www.4for4.com/2024/preseason/most-predictable-wide-receiver-stats) · [Intentional Rounding](https://intentionalrounding.com/when-do-yards-per-route-run-targets-per-route-run-and-yards-per-target-stabilize/) |
| **First downs per route run** (1D/RR) | First downs generated ÷ routes run. | rate | **Yes — 0.57, second only to YPRR among efficiency-flavoured stats.** Underrated; it strips TD luck out of production | Ryan Heath (Fantasy Points): rookie **1D/RR below 0.085** → historically a **9% year-2 hit rate**. *(Threshold reported via search index; the article itself is paywalled and could not be fetched — verify before quoting on a surface.)* | [4for4 WR](https://www.4for4.com/2024/preseason/most-predictable-wide-receiver-stats) · [Fantasy Points, Heath](https://www.fantasypoints.com/nfl/articles/season/2026/ryan-heaths-rookie-wr-rankings) |
| **Air yards** | "Distance in yards perpendicular to the line of scrimmage at where the targeted receiver either caught or didn't catch the ball" — accrues on **all** targets, caught or not. Pioneered by Josh Hermsmeyer (airyards.com, later FiveThirtyEight). | yards | **Yes, as a share.** Air yards share sits with target share and WOPR in the >0.70 club. Raw air yards is a measure of **QB/coach intent**, which is why it leads production | — (use the share, not the raw total) | [nflreadr pbp dict](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_pbp.csv) · [airyards.com](https://airyards.com/) · [Fantasy Classroom](https://fantasyclassroom.org/Blogs/sticky-stats/wr-sticky-season-totals) |
| **Air yards share** | Player's air yards ÷ team air yards. NGS publishes the same idea as `percent_share_of_intended_air_yards`. | % | **Yes — top tier**, >0.70 both ways | — | [nflreadr NGS dict](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_nextgenstats.csv) |
| **aDOT** — average depth of target | Air yards ÷ targets. | yards | **No, as a production predictor: 0.07.** But it is **stable year to year** and it is the *interpretive key* to catch rate, YAC and RACR — it explains other metrics rather than predicting points | Slot/possession ≈ 6–9; perimeter starter ≈ 10–13; deep threat 14+. No study-backed hard bar exists — these are descriptive bands | [4for4 WR](https://www.4for4.com/2024/preseason/most-predictable-wide-receiver-stats) · [4for4 air yards](https://www.4for4.com/2018/preseason/air-yards-explained) · [Action Network](https://www.actionnetwork.com/education/average-depth-of-target-adot) |
| **WOPR** — weighted opportunity rating | `1.5 × target share + 0.7 × air yards share`. Hermsmeyer. Weights chosen to fit fantasy points. | index (~0–1.5) | **Yes — the single best one-number opportunity summary.** >0.70 correlation to FP and to itself | **0.5+** = starter usage; **0.7+** = elite | [nflreadr playerstats dict](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_playerstats.csv) · [Action Network](https://www.actionnetwork.com/education/weighted-opportunity-rating-definition-how-find-boosted-receiver-production-with-this-stat) · [Fantasy Classroom](https://fantasyclassroom.org/Blogs/sticky-stats/wr-sticky-season-totals) |
| **RACR** — receiver air conversion ratio | Receiving yards ÷ air yards. Hermsmeyer. **Listed here because the hobby files it under opportunity; it is not.** | ratio | **No — efficiency wearing opportunity's clothes.** Structurally inflated for short-aDOT receivers | ~1.0 is roughly par. **Do not tier it.** Jarvis Landry: 6.5 aDOT → RACR 1.33, highest on his list purely from depth | [nflreadr playerstats dict](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_playerstats.csv) · [FantasyPros](https://www.fantasypros.com/2021/01/air-yardage-differential-wide-receiver-efficiency-2021-fantasy-football/) |
| **Red-zone touches / targets** | Carries + targets inside the opponent's 20. | count | **Volume repeats; the TD conversion off it does not.** Treat as opportunity, never as a scoring projection | — | [PFF green zone](https://www.pff.com/news/fantasy-football-the-fantasy-impact-of-carries-in-the-green-zone) |
| **Green-zone touches** | Inside the opponent's **5**. Coined by Jeff Ratcliffe at PFF from a 2012 Tom Coughlin quote ("green is go, red is stop"). | count | **The highest-leverage countable opportunity in fantasy.** RBs score on **~42% of green-zone touches** | Any green-zone role is material; there is no meaningful "enough" bar because the counts are tiny | [PFF green zone](https://www.pff.com/news/fantasy-football-the-fantasy-impact-of-carries-in-the-green-zone) · [PFF green-zone targets](https://www.pff.com/news/fantasy-impact-of-green-zone-targets-on-wr-and-te-production) |
| **Opportunity share** (RB) | Player's carries + targets ÷ team RB carries + targets. | % | **Yes** — it is the RB analogue of target share | — (paired with touches below) | [PlayerProfiler glossary](https://www.playerprofiler.com/terms-glossary/) |
| **Weighted opportunities** (RB) | Opportunities recalibrated by discounting carries and up-weighting targets, per the average fantasy points each touch type generates. | index | **Yes** — strictly better than raw touches in PPR, because a target is worth ~2–2.5× a carry | — | [PlayerProfiler glossary](https://www.playerprofiler.com/terms-glossary/) |
| **Touches** (RB) | Carries + receptions. | count | **Yes.** Touches/game 0.62 to next-season FP; **targets/game 0.70 and receptions/game 0.70 are higher** — the receiving half of an RB's job is the more predictable half | **20+/game** = workhorse; **280+ season** appeared in 8 of 12 RB1 seasons | [4for4 RB](https://www.4for4.com/2023/preseason/most-predictable-running-back-stats) · L1 |
| **Dominator rating** | College market share of team's offensive production (yards + TDs). | % | Prospect metric; predicts NFL breakout, not next-season points | — | [PlayerProfiler glossary](https://www.playerprofiler.com/terms-glossary/) |
| **Breakout age** | Age at first college season clearing the dominator threshold. | years | Prospect metric | **20%** dominator for WR; **15%** for RB/TE | [PlayerProfiler glossary](https://www.playerprofiler.com/terms-glossary/) |

### 1.2 The two rankings a designer should have memorised

**WR — correlation to NEXT season's fantasy points** (4for4, 2017–2023, 30+ targets in consecutive
seasons). ([source](https://www.4for4.com/2024/preseason/most-predictable-wide-receiver-stats))

```
FP/game            0.68   ← the naive baseline beats every clever metric
Yards/game         0.67
Targets/game       0.62
Receptions/game    0.61
YPRR               0.59   ← best "advanced" metric, still below raw volume
1D per route run   0.57
TPRR               0.53
Points earned/rt   0.47
Open Score (ESPN)  0.44
Catch Score        0.31
EPA per target     0.28
YAC Score          0.17
Yards/reception    0.15
TD rate            0.13
Contested catch %  0.12
aDOC               0.10
Broken tkl/rec     0.10
aDOT               0.07
YAC/reception      0.05
On-target catch %  0.05
Route rate        -0.05
Drop rate         -0.09
Slot rate         -0.12
```

**RB — year-to-year correlation** (4for4, 2012–2022, 100+ touches in consecutive seasons, n=249).
([source](https://www.4for4.com/2023/preseason/most-predictable-running-back-stats))

```
Targets/game       0.70
Receptions/game    0.70
Rush attempts/g    0.65
Rush yards/game    0.62
Touches/game       0.62
Total yards/game   0.58
Half-PPR pts/game  0.56
Rush TD/game       0.39
Yards per touch    0.38
Total TD/game      0.37
Receiving TD/game  0.31
Yards per carry    0.16   ← the number everyone quotes is the worst one on the board
```

**The design consequence.** A surface that gives yards-per-carry the same visual weight as
targets-per-game is telling the user a lie about which number to act on. Ranking by predictive load
is a legitimate — arguably obligatory — organising principle for an advanced-stats panel.

---

## 2. The efficiency metrics — the ones that mostly do NOT repeat

**The organising fact.** Efficiency in football is overwhelmingly a property of the *situation* —
scheme, blocking, defensive attention, QB — attributed to the player standing nearest the ball.
SumerSports built an **expected YPRR** model from personnel, down and distance alone; its
year-to-year stability is **0.67**, higher than actual YPRR's **0.51**. *The situation is more stable
than the player.* ([SumerSports](https://sumersports.com/the-zone/revisiting-yards-per-route-run/))

### 2.1 The table

| metric | definition | unit | predictive? | practitioner threshold | source |
|---|---|---|---|---|---|
| **YPRR** — yards per route run | Receiving yards ÷ routes run. | yds/route | **Partially — the best of a weak class.** YoY stability **0.51**; **0.43** correlation to next-season receiving FP (PFF, 565 WR-seasons with 50+ targets back-to-back); 0.59 in 4for4's rate-only frame. Top-20 YPRR receivers scored **154% more** fantasy points the next season than bottom-20 | League average **1.47** (SumerSports, modern) / **1.64** (PFF 2007–13). L1's practical bands hold: **under 1.00** after two years is dire; 2.0+ is a genuine alpha signal | [PFF metrics that matter](https://www.pff.com/news/fantasy-football-metrics-that-matter-yards-per-route-run) · [SumerSports](https://sumersports.com/the-zone/revisiting-yards-per-route-run/) · [4for4](https://www.4for4.com/2024/preseason/most-predictable-wide-receiver-stats) |
| **Yards per target** (YPT) | Receiving yards ÷ targets. | yds/tgt | **No. 0.18** to next-season FP. Needs **205 targets / ~1,027 routes** to be half signal — nearly 3× YPRR | League average **8.25** (WR), **7.64** (TE) | [PFF](https://www.pff.com/news/fantasy-football-metrics-that-matter-yards-per-route-run) · [Intentional Rounding](https://intentionalrounding.com/when-do-yards-per-route-run-targets-per-route-run-and-yards-per-target-stabilize/) |
| **Yards after catch** (YAC) / YAC per reception | Yards gained past the catch point. | yards | **No. 0.05** per reception. Among the least predictive receiving stats measured | — | [4for4](https://www.4for4.com/2024/preseason/most-predictable-wide-receiver-stats) |
| **YAC over expected** (YACOE) | Actual YAC − expected YAC from an NGS tracking model (nearest defender, catch depth, defenders between receiver and end zone, receiver speed). NGS field: `avg_yac_above_expectation`. | yards | **Weakly.** WR YACOE 1-season R² **≈0.15**; needs **two** seasons to match QB CPOE's one-season signal. Model-dependent — **never compare across vendors** | — | [nflreadr NGS dict](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_nextgenstats.csv) · [nfelo](https://www.nfeloapp.com/analysis/over-expected-explained-what-are-cpoe-ryoe-and-yacoe/) · [nflanalytic](https://nflanalytic.com/explainer-yac-over-expected.html) |
| **Catch rate over expected** (CROE) | Actual catch rate − **xCatch**, NGS's per-target catch probability from separation, target depth and speed. Example: 64% actual − 57% expected = +7% CROE. | pp | **Descriptive.** Catch rate itself regresses hard, and CROE inherits that. Reads best as "makes contested grabs", not "will score" | — | [NFL NGS CROE](https://www.nfl.com/news/next-gen-stats-top-10-pass-catchers-by-croe-of-2022-surprise-at-no-1) |
| **Catch rate** (raw) | Receptions ÷ targets. | % | **No — and structurally confounded by aDOT.** A 6-yard-aDOT slot receiver and a 15-yard-aDOT X will never have comparable catch rates | — | [4for4 air yards](https://www.4for4.com/2018/preseason/air-yards-explained) |
| **Contested catch rate** | Receptions ÷ contested targets. | % | **No — 0.12.** Small denominators, charting-dependent | — | [4for4](https://www.4for4.com/2024/preseason/most-predictable-wide-receiver-stats) |
| **Drop rate** | Drops ÷ catchable targets. | % | **No — −0.09.** *Negatively* correlated to next-season points, i.e. worse than nothing as a predictor | — | [4for4](https://www.4for4.com/2024/preseason/most-predictable-wide-receiver-stats) |
| **Breakaway run rate** | Share of carries becoming a breakaway (long) run. PlayerProfiler. | % | **No.** Explosive-run frequency is close to a coin flip season to season; it is the RB cousin of TD rate | — | [PlayerProfiler](https://www.playerprofiler.com/article/playerprofilers-guide-to-advanced-stats-metrics-vol-1-running-backs-draft/) |
| **Juke rate** | Evaded tackles ÷ total touches (carries + receptions). "Evaded tackle" = any broken/missed/avoided tackle where the runner keeps gaining. PlayerProfiler. | % | **Descriptive of style.** Charted, so vendor-specific. 4for4's equivalent (broken tackles/reception) scores **0.10** | — | [PlayerProfiler](https://www.playerprofiler.com/article/running-backs-advanced-stats-metrics-analytics-profiles/) · [glossary](https://www.playerprofiler.com/terms-glossary/) |
| **True yards per carry** | YPC with all runs over 10 yards discounted, to reward consistency. PlayerProfiler. | yds/att | An explicit *de-noising* of a metric (YPC, 0.16) that barely survives. Better than YPC; still weak | — | [PlayerProfiler](https://www.playerprofiler.com/article/meet-the-metric-true-yards-per-carry/) |
| **Yards created** | Yards accrued after the RB's first evaded tackle — "beyond what was blocked". PlayerProfiler, hand-charted. | yards | Charted, small sample, no published stability. Treat as scouting, not stats | — | [PlayerProfiler](https://www.playerprofiler.com/article/jk-dobbins-fantasy-football-ranking-stats-profile-meet-the-metric-yards-created/) |
| **EPA per play** | Change in the offense's expected points from before to after the play. nflfastR's public model is trained on play-by-play back to 1999; minimum inputs are down, distance, yard line, time remaining, play outcome. | points/play | **Team-level: strong and interpretable. Player-level: attribution is the problem** — EPA is credited to whoever touched the ball. WR "EPA per target" scores **0.28** | — | [nflreadr pbp dict](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_pbp.csv) · [4for4](https://www.4for4.com/2024/preseason/most-predictable-wide-receiver-stats) |
| **Success rate** | **Two incompatible definitions in circulation.** (a) nflfastR: `success` = "Binary indicator whether epa > 0 in the given play." (b) Football Outsiders lineage: ≥40% of needed yards on 1st down, 60% on 2nd, 100% on 3rd/4th. | % | Consistency, not magnitude. Pairs with EPA/play (impact) | — | [nflreadr pbp dict](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_pbp.csv) · [Arrowhead Pride glossary](https://www.arrowheadpride.com/2019/8/31/20939826/common-terms-in-modern-statistics) |
| **CPOE** | nflfastR: "For a single pass play this is `1 − cp` when the pass was completed or `0 − cp` when incomplete… an indicator for the passer how much over or under expectation his completion percentage was." | pp | **Yes — the stickiest QB metric.** See §5 | — | [nflreadr pbp dict](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_pbp.csv) |
| **DAKOTA** | nflfastR, verbatim: *"Adjusted EPA + CPOE composite based on coefficients which best predict adjusted EPA/play in the following year."* Named by Ben Baldwin for Dak Prescott. | index | **Explicitly built to be predictive** — the weights are fitted to next-year EPA. If you show one QB number, this is the defensible one | — | [nflreadr playerstats dict](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_playerstats.csv) |

### 2.2 The line, stated plainly

**Predictive (act on it):** target share, air yards share, WOPR, snap share (RB), routes run,
targets/receptions per game, opportunity share, weighted opportunities, TPRR, 1D/RR, CPOE, DAKOTA.

**Descriptive (explains what happened; do not forecast with it):** YPRR (partial — the best of the
descriptive class, and the only efficiency metric worth prominent placement), YPT, YAC, YACOE, CROE,
catch rate, contested catch rate, drop rate, RACR, breakaway rate, juke rate, RYOE, aDOT, separation,
cushion.

**Actively misleading if tiered:** RACR, catch rate, YPC, drop rate, separation, cushion. Fantasy
Classroom's finding is blunt: *"Cushion and separation have extraordinarily poor correlation with
fantasy points"* and are *"extremely poor indicators."*
([Fantasy Classroom](https://fantasyclassroom.org/Blogs/sticky-stats/wr-sticky-season-totals))

---

## 3. Expected fantasy points, and points over expectation

### 3.1 What an expected-points model is

An expected fantasy points (xFP / EFP) model answers: **given exactly this set of opportunities, how
many fantasy points would a league-average player at this position have scored?** It is built by
assigning every individual opportunity — each carry, each target — an expected point value from the
historical distribution of outcomes in that situation, then summing.

Typical inputs: down, distance, yard line / field position, air yards or target depth, target
location, and personnel context.

**What one actually looks like inside — ffopportunity, read from source.** It is not one model. It
is **six XGBoost sub-models chained together**
([`ep_predict.R`](https://github.com/ffverse/ffopportunity/blob/main/R/ep_predict.R)):

- rush side: `rushing_yards` → `rushing_td` → `rushing_fd` (first down)
- pass side: `pass_completion` → `yards_after_catch` → `pass_touchdown`

and the pass chain **composes**: expected yard line after the play is computed as
`yardline_100 − air_yards − yards_after_catch_exp`, and the touchdown model then predicts from *that
estimate*. **Errors compound down the chain**, which is the honest reason expected-TD numbers are the
softest part of any xFP figure.

The feature set is richer than most secondary descriptions suggest
([`ep_preprocess.R`](https://github.com/ffverse/ffopportunity/blob/main/R/ep_preprocess.R)): yard
line, down, yards to go, goal-to-go, quarter, seconds remaining, score differential, shotgun,
no-huddle, run location and gap, **surface, roof, wind, temperature**, `xpass` (dropback probability),
`vegas_wp`, implied team total, and an `era` flag splitting pre-2018 from post-2018. Kneels and
aborted snaps are special-cased out.

### 3.2 Who publishes one

| publisher | how built | access |
|---|---|---|
| **ffopportunity** (ffverse, part of nflverse) | **XGBoost via tidymodels**, trained on public nflverse play-by-play **2006–2020**. Emits weekly and play-level tables; 218 documented fields including `rec_fantasy_points_exp`, `rush_fantasy_points_exp`, `total_fantasy_points_exp`, and `total_fantasy_points_diff` — the last documented as *"Difference between actual and expected number of total_fantasy_points — often interpreted as efficiency for a given play/game."* Package lifecycle is **experimental** | **Free**, R/Python | [GitHub](https://github.com/ffverse/ffopportunity) · [docs](https://ffopportunity.ffverse.com/) · [dictionary](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_ffopps.csv) |
| **Fantasy Points Data (XFP)** | Proprietary, volume/location/depth-weighted; paired with their own alignment-based route charting (wide/slot/inline/backfield) | Paid | [data.fantasypoints.com](https://data.fantasypoints.com/nfl/tools) |
| **PlayerProfiler** | "Controls for down, distance, field position to calculate likely production with league-average execution" | Paid tiers | [glossary](https://www.playerprofiler.com/terms-glossary/) |
| **FTN** | Public xFP tables | Freemium | [ftnfantasy.com](https://ftnfantasy.com/fantasy/nfl/expected-fantasy-points) |
| **Establish The Run**, **Sharp Football**, **statrankings** | Editorial/derived xFP-vs-actual boards | Mixed | [ETR](https://establishtherun.com/expected-vs-actual-fantasy-points/) · [Sharp](https://www.sharpfootballanalysis.com/fantasy/expected-fantasy-points/) |

### 3.3 What it is good for — and the limits

**Good for, in order of strength:**

1. **Converting messy usage into one honest number in the domain's own unit.** This is the real
   contribution: it collapses carries at the 3, targets at 14 air yards, and checkdowns into a single
   points figure that is directly comparable to what the manager's league actually scores.
2. **Separating role from luck.** xFP is the role; actual − xFP is what happened on top of it.
3. **Flagging regression candidates in both directions.**

**Limits, honestly:**

- **Actual − xFP is not "skill" and is not stable.** It is the residual, and residuals in football
  are dominated by touchdown variance. It is a *narrative* about the past, not a forecast.
- **Positional TD models dominate the output.** Most of the gap between two RBs' xFP is
  goal-line opportunity, which is coach-assigned and can vanish in a week.
- **Model-dependent and non-comparable across vendors.** ffopportunity's number and Fantasy Points'
  XFP are not the same quantity. Do not blend them or put them on one axis.
- **The training window ages.** ffopportunity's public model is trained on 2006–2020 — a window that
  predates the current pass-rate and motion environment.
- **L1's ruling stands and constrains presentation:** the hobby does **not** speak volume in points.
  xFP is a legitimate quantity but "his job was worth 6.7 points a game" is not a sentence a dynasty
  manager says. Present xFP as a *comparison* (actual vs expected, or a rank) rather than as the
  primary noun for a player's role.

---

## 4. Sample size and stability — the section that governs everything above

### 4.1 The primary reliability research

**Danny Tuccitto, *Intentional Rounding*.** Split-half reliability on PFF's charted database
**2007–2013**. Method, verbatim from the source: collect all WRs with at least *N* games **for the
same team** (to control team effects); randomly split into two equal sets of games; compute the
metric in each; correlate; **repeat 25 iterations until r converges**; then solve for the number of
observations at which R² = 0.50 using `(Observations/2) × [(1−r)/r]`; weight across game-count groups
by group size. *(Site currently returns HTTP 500; retrieved via Internet Archive snapshots
20220914021325 / 20220307132815 / 20220108021015.)*
([YPRR/TPRR/YPT](https://intentionalrounding.com/when-do-yards-per-route-run-targets-per-route-run-and-yards-per-target-stabilize/) ·
[RPRR/TDPRR](https://intentionalrounding.com/when-do-receptions-and-touchdowns-per-route-run-stabilize/) ·
[tight ends](https://intentionalrounding.com/when-do-yprr-tprr-and-ypt-stabilize-for-tight-ends/))

**"Stabilises" here means exactly one thing: the point at which the metric is half true skill and
half randomness.** It is not the point at which the number becomes trustworthy. It is the point at
which it becomes *half* trustworthy.

**Wide receivers — the summary table, reproduced verbatim from the source:**

| stat | unit of obs | stabilisation point | % regression to mean after 200 obs |
|---|---|---|---|
| **TPRR** | routes run | **184** | 47.9% |
| **RPRR** (receptions/route) | routes run | **188** | 48.5% |
| **YPRR** | routes run | **351** | 63.7% |
| **TDPRR** (TDs/route) | routes run | **882** | 81.5% |
| **YPT** | targets | **205** (≈1,027 routes) | 50.6% (83.7%) |

In games, weighted across groups: TPRR **7**, RPRR **7**, YPRR **14**, TDPRR **33**, YPT **39**.

**Tight ends** (same method): YPRR **17 games / 318 routes**; TPRR **13 games / 228 routes**; YPT
**52 games / 172 targets ≈ 943 routes**. TEs run ~18.2 routes/game vs WRs' ~26.1, so a TE needs *more
games* for the same number of routes. **A metric's stabilisation point is not a property of the
metric alone — it is a property of the metric and the position's route volume together.**

**The author's own red flag, worth carrying:** for TE YPT the split-half r *did not increase
monotonically* with sample, and across the 25 iterations in the 56+ game group r ranged from **.086
to .730**. That is an instrument that is not measuring anything reliably at all — and it is exactly
the kind of finding L1's principle 11 ("run it twice before quoting it once") is designed to catch.

### 4.2 The shrinkage formula — the most useful thing in this file

```
true_estimate = (observed × N + league_average × S) / (N + S)
regression_%  = S / (N + S)
```
where `N` = observations to date, `S` = the stabilisation point above.

Worked, from the source: a WR at **2.00 YPRR after 16 games** has a true YPRR of **1.87**. A WR at
**25.0% TPRR after 12 games** has a true TPRR of **23.4%**. A WR at **1.50% TDPRR after 33 games**
has a true TDPRR of **1.27%**.

**Why this matters to a designer more than any threshold does:** it converts "do I trust this number
yet?" from a binary gate into a **continuous, drawable quantity**. The shrunk estimate and the raw
estimate can both be drawn, and the distance between them *is* the uncertainty. That is L1's craft
principle 6 — uncertainty is drawn, not footnoted — with an actual formula behind it.

### 4.3 Other stability figures worth holding

| metric | figure | source |
|---|---|---|
| YPRR, year to year | **0.51** | [SumerSports](https://sumersports.com/the-zone/revisiting-yards-per-route-run/) |
| **Expected** YPRR, year to year | **0.67** (0.49 when the receiver changes teams) | [SumerSports](https://sumersports.com/the-zone/revisiting-yards-per-route-run/) |
| Target share / air yards share / WOPR, year to year AND to fantasy points | **>0.70** each | [Fantasy Classroom](https://fantasyclassroom.org/Blogs/sticky-stats/wr-sticky-season-totals) |
| QB CPOE, 1-season R² | **0.226** (2 seasons ≈0.28, 3 ≈0.32) | [nfelo](https://www.nfeloapp.com/analysis/over-expected-explained-what-are-cpoe-ryoe-and-yacoe/) |
| QB CPOE, r, 2022→2023, min 150 att | **0.46** raw → **0.51** after removing drops, throwaways, spikes, screens, laterals, Hail Marys, prevent-D and trick plays (20% of plays) | [SumerSports](https://sumersports.com/the-zone/cutting-through-noise-to-increase-cpoe-stability/) |
| WR YACOE, 1-season R² | **≈0.15** (needs 2 seasons to match CPOE's 1) | [nfelo](https://www.nfeloapp.com/analysis/over-expected-explained-what-are-cpoe-ryoe-and-yacoe/) |
| **RB RYOE, 1-season R²** | **≈0.01** — "essentially a coinflip." Needs **4 seasons** to reach CPOE's 1-season signal | [nfelo](https://www.nfeloapp.com/analysis/over-expected-explained-what-are-cpoe-ryoe-and-yacoe/) |
| PFF's RYOE model | explains **22%** of variance in actual rushing yards; year-to-year r **0.21** | [PFF](https://www.pff.com/news/nfl-plays-over-expectation-pff-research-stats-grades) |
| RYOE vs plain YPC | **>70% correlated** across multi-season samples — the extra machinery buys little | [nfelo](https://www.nfeloapp.com/analysis/over-expected-explained-what-are-cpoe-ryoe-and-yacoe/) |
| Caused pressure rate (offense), year to year | **0.48** (2024↔2023), **0.55** (2023↔2022); *uncaused* pressure **−0.17** | [FTN](https://ftnfantasy.com/nfl/caused-pressure-rates-2024-line-vs-qbs) |
| PFF college receiving grade → NFL, stability | slot WR **0.37**, TE **0.32**; **0.44** for the 106 players who stayed at position | [PFF](https://www.pff.com/news/draft-pff-receiving-grades-predicting-ncaa-to-nfl) |

### 4.4 Where the hobby's quoted thresholds actually come from, and whether they hold

| commonly quoted | actual provenance | does it hold? |
|---|---|---|
| "YPRR stabilises around 180 routes / 11 games" | **Misattribution.** 184/188 routes is TPRR/RPRR. YPRR is **351 routes / 14 games** | **No.** Correct it. This is the error carried in L1 |
| "TPRR ≥ 20%" | Fantasy Footballers, from the observation that ~92% of WR2-or-better finishers since 2006 cleared it | **Holds, with a caveat.** League average TPRR is 19.9% — so this bar is "at or above average," not "elite." L1's own instrument run found 42% of receivers clearing it. It is a **filter**, not a distinction |
| "Target share >20% = WR1" | Repeated across PFF- and Sharp-lineage receiver profiling; no single canonical study | **Directionally holds** (target share is a >0.70 metric), but the bar is soft and the interesting population is 25%+ |
| "WOPR 0.7 = elite" | Hermsmeyer's construction, thresholds set by convention in secondary sources | **Holds as a convention.** Treat as a labelled reference line, never as a computed verdict |
| "70% snap share" | Widely repeated baseline | **Holds for RBs; weak for WRs** — 2024–25 top-12 WRs are scattered across 60–80% |
| "Green zone = 42% TD rate on RB touches" | PFF, Jeff Ratcliffe, 5-year window | **Holds**, but counts are tiny — a single-season green-zone rate is nearly meaningless |
| "3–4 weeks of elevated usage before you believe it" | Practitioner folklore | **Roughly consistent** with TPRR's 7-game half-signal point — i.e. folklore is about 2× too optimistic |

---

## 5. QB-specific analytics

| metric | definition | unit | predictive? | note | source |
|---|---|---|---|---|---|
| **EPA per play / qb_epa** | `qb_epa` "gives QB credit for EPA up to the point where a receiver lost a fumble after a completed catch and makes EPA work more like passing yards on plays with fumbles." `passing_epa` in nflverse player stats is built from it | pts/play | **Descriptive-strong, predictive-moderate.** Less sticky than CPOE | The default QB efficiency currency; the one thing everyone plots | [nflreadr dicts](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_pbp.csv) |
| **CPOE** | Actual completion % minus expected, per play. NGS publishes `expected_completion_percentage` and `completion_percentage_above_expectation`; nflfastR computes its own from `cp` | pp | **Yes — the stickiest.** 1-season R² 0.226; r 0.46→0.51 with noise plays removed. Explicitly "stickier year to year than EPA" | Two independent implementations (NGS tracking-based, nflfastR play-based) that do **not** produce identical numbers | [NGS dict](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_nextgenstats.csv) · [nfelo](https://www.nfeloapp.com/analysis/over-expected-explained-what-are-cpoe-ryoe-and-yacoe/) |
| **DAKOTA** | "Adjusted EPA + CPOE composite based on coefficients which best predict adjusted EPA/play in the following year" | index | **Yes, by construction** | The honest single-number QB stat. Its weakness: no rushing component | [nflreadr](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_playerstats.csv) |
| **Pressure rate** | Share of dropbacks under pressure. FTN splits **caused** (QB-created, e.g. holding the ball) from **uncaused** (line-created) | % | **Caused pressure: yes** (r 0.48–0.55). **Uncaused: no** (−0.17, driven by QB changes) | The split is the whole point — an undifferentiated "pressure rate" mixes a stable QB trait with an unstable line trait | [FTN](https://ftnfantasy.com/nfl/caused-pressure-rates-2024-line-vs-qbs) |
| **Sack rate / pressure-to-sack rate** | Sacks ÷ dropbacks; sacks ÷ pressures | % | **Yes — among the stickiest QB numbers.** Consensus: **the line allows pressure, the QB turns pressure into sacks** | Sack rate is more stable for the passer than for the blockers | [Opta Analyst](https://theanalyst.com/articles/what-is-pressure-rate-and-adjusted-sack-rate) · [NBC](https://www.nbcsports.com/fantasy/football/news/pressure-to-sack-rate-what-is-it-and-how-can-it-be-applied) |
| **Time to throw** | NGS, verbatim: "Average time elapsed from the time of snap to throw on every pass attempt for a passer (sacks excluded)" | seconds | **Style, not quality.** Stable, but a fast TTT can mean a great quick game or a scared QB | Always read against aDOT and pressure rate; alone it is uninterpretable | [NGS dict](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_nextgenstats.csv) |
| **Aggressiveness (AGG%)** | NGS: share of attempts into tight coverage (defender within 1 yard at the catch point) | % | Descriptive | — | [NGS dict](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_nextgenstats.csv) |
| **Air yards to sticks** | NGS: average air yards ahead of/behind the first-down marker | yards | Descriptive of aggression/scheme | — | [NGS dict](https://github.com/nflverse/nflreadr/blob/main/data-raw/dictionary_nextgenstats.csv) |

### 5.1 Rushing contribution — the single biggest QB fantasy fact

**Fantasy scoring is asymmetric by design.** Standard scoring gives a QB **0.04 points per passing
yard** but **0.1 points per rushing yard** — a rushing yard is worth **2.5×** a passing yard, and a
rushing TD typically 6 points against a passing TD's 4.
([Gridiron Heroics](https://gridironheroics.com/why-are-rushing-quarterbacks-so-valuable/))

- QBs rushing for **40+ yards** in a game averaged **21.92** fantasy points in 2025, vs **15.53** in
  sub-40-yard games. ([ParlaySavant](https://www.parlaysavant.com/insights/why-rushing-qbs-essential-fantasy-football-dominance-2025))
- Since 2019, **every** overall QB1 has recorded **≥4 rushing TDs and ≥350 rushing yards**.
  ([DraftSharks](https://www.draftsharks.com/article/fantasy-football-draft-preview-quarterbacks))

**The design consequence, and it is severe:** every headline QB analytic in the table above —
EPA/play, CPOE, DAKOTA, time to throw — is a **passing** metric. A QB page built from those metrics
alone will rank a pocket passer above a rushing QB who will outscore him by four points a week. **A
fantasy QB surface that shows DAKOTA without showing rushing volume is measuring the wrong sport.**

---

## 6. The data sources

| source | uniquely provides | cost (2025/26) | API? | licence |
|---|---|---|---|---|
| **nflverse / nflfastR / nflreadr / nflreadpy** | Play-by-play **1999+** with built-in EPA/WP/CPOE; snap counts (PFR, 2012+); participation (NGS pre-2023, FTN 2023+); NGS mirrors; rosters/depth charts 2002+; `ff_opportunity` expected fantasy points; ~372 documented pbp fields | **Free** | Yes — R/Python packages + CSV/parquet GitHub releases | Code **MIT**; data **CC-BY 4.0**, FTN-sourced portions **CC-BY-SA 4.0** |
| **NFL Next Gen Stats** | Tracking-derived: separation, cushion, xYAC/YACOE, xCatch/CROE, completion probability/CPOE, time to throw, aggressiveness, air yards to sticks, expected rush yards/RYOE, defenders-in-box% | **Free to view** | **No official API** — mirrored by nflverse | NFL proprietary. **Raw tracking data is never public** except time-boxed Big Data Bowl Kaggle releases |
| **PFF** | 0–100 human film grades, WAR, pass-rush/run-stop win rate, coverage snaps, slot/wide alignment, route grades, Premium Stats 2.0 situational splits | PFF+ **$24.99/mo** or **~$80–120/yr** | Enterprise only — and **PFF's enterprise/B2B business was acquired by Teamworks in March 2026**; consumer PFF+ stays independent | Proprietary, closed methodology |
| **PlayerProfiler** | Dominator Rating, Breakout Age, Production Premium, Target Premium, Weighted Opportunities, Juke Rate, True YPC, Yards Created, Best Comparable Player, Speed/Burst/Agility Score, Catch Radius, SPARQ-x | **$135/season** all-in; **$45/season** per module | No public API | Proprietary |
| **FTN Data / FTN Fantasy** | Charting: broken tackles, blitz, motion, play-action, drops, coverage scheme, caused vs uncaused pressure. **DVOA/DYAR** (exclusive since Aug 2023; Aaron Schatz is FTN's CAO) | Free into nflverse; direct dev access **CSV $599**, **API from $69.99/yr**, enterprise custom | Yes, tiered | **CC-BY-SA 4.0** via nflverse (share-alike — this constrains derivative products) |
| **Sports Info Solutions** | Full charting + **Total Points** (EPA attributed across all 22 players, 2016+) | DataHub **$99.99/mo / $749.99/yr** (NFL); $199.99/mo NFL+NCAA | Yes, enterprise-leaning | Proprietary |
| **Fantasy Points Data** | **Alignment-split route charting** (wide/slot/inline/backfield), pass rate over expectation, proprietary **XFP** | Bundled "All-In"; exact price not verifiable programmatically | Data Suite dashboard | Proprietary |
| **SportsDataIO** | Commercial multi-sport REST: projections, DFS salaries, odds, images | Quote-based (~$25–200+/mo per aggregators) | Yes | Commercial licence |
| **Sleeper API** | League/roster/draft/matchup data | Free, no auth | Yes, REST | **Non-commercial**; commercial needs a negotiated licence |
| **Yahoo Fantasy API** | Yahoo league data | Free | Yes, official OAuth dev programme | Yahoo API Access and Use Agreement |
| **ESPN Fantasy API** | ESPN league data | Free | **Unofficial/undocumented**, unstable | None — reverse-engineered |

**Sources:** [nflfastR](https://github.com/nflverse/nflfastR) · [nflreadpy](https://github.com/nflverse/nflreadpy) ·
[nflverse-data releases](https://github.com/nflverse/nflverse-data/releases) ·
[ffopportunity](https://github.com/ffverse/ffopportunity) ·
[NGS](https://nextgenstats.nfl.com/) · [NGS expected rushing yards](https://www.nfl.com/news/next-gen-stats-intro-to-expected-rushing-yards) ·
[NGS completion probability](https://www.nfl.com/news/next-gen-stats-introduction-to-completion-probability-0ap3000000964655) ·
[Big Data Bowl 2026](https://www.kaggle.com/competitions/nfl-big-data-bowl-2026-prediction/data) ·
[PFF subscribe](https://www.pff.com/subscribe) · [Teamworks acquires PFF Enterprise](https://teamworks.com/blog/teamworks-acquires-pff-enterprise/) ·
[PlayerProfiler membership](https://www.playerprofiler.com/membership-account/membership-levels/) ·
[FTN charting dictionary](https://nflreadr.nflverse.com/articles/dictionary_ftn_charting.html) ·
[FTN DVOA](https://ftnfantasy.com/learn-more-about-dvoa) ·
[SIS Total Points primer](https://www.sportsinfosolutions.com/2020/12/01/a-primer-on-total-points/) ·
[SIS store](https://store.sportsinfosolutions.com/) ·
[Fantasy Points Data Suite](https://data.fantasypoints.com/nfl/tools) ·
[SportsDataIO](https://sportsdata.io/nfl-api) · [Sleeper docs](https://docs.sleeper.com/) ·
[Yahoo developer](https://sports.yahoo.com/developer/access/)

**Three practical facts a builder should not learn the hard way:**

1. **Raw tracking data is not obtainable.** Every "over expected" metric you can compute yourself is
   a re-derivation from published aggregates, not from tracking. NGS's own outputs are the only
   route to tracking-derived numbers, and only as aggregates.
2. **FTN-sourced nflverse data is CC-BY-**SA**.** Share-alike propagates. Anything built on FTN
   charting inherits an obligation the rest of nflverse does not carry.
3. **Sleeper's free API is non-commercial.** The open access is explicitly personal use.

---

## 7. How advanced stats are PRESENTED well

> **Provenance warning — read this before using this section.** §§1–6 and 8 are built on sources I
> fetched and can quote. **This section is not, and an earlier draft of it overstated its evidence.**
> A parallel research pass on presentation conventions was commissioned and **never returned**;
> several specifics were then written up as though it had. They have been removed. What remains is
> split explicitly into **[VERIFIED]** — read out of a page I actually fetched, with the command that
> did it — and **[UNVERIFIED]** — design knowledge I hold but did not confirm this session.
> **Do not cite an [UNVERIFIED] line in a proposal or a relay brief without re-checking it first.**
> This is L1 principle 11 applied to myself: an instrument does not get to speak until it has been
> checked, and that includes me.

### 7.1 Baseball Savant — what the page's own source actually shows

**[VERIFIED]** — `curl` of
[the Aaron Judge player page](https://baseballsavant.mlb.com/savant-player/aaron-judge-592450)
(3.2 MB of HTML, 2026-08-17), parsing the embedded JSON and container markup. The module itself is
JS-rendered, so these are **data-model and markup facts, not observations of rendered pixels**:

- The module's heading text is **"MLB Percentile Rankings"**. Its container is
  `<div class="chart-container" id="percentile-sliders">` and the graphic is
  `<svg id="percentile-slider-viz">`. **"Slider" is Savant's own word for the form.** A separate
  in-page section anchors at `#percent_rank` with a `statcast_percentile_rankings` divider, and the
  site nav links to standalone `/leaderboard/percentile-rankings` boards for batters and pitchers.
- The player-season record carries **105 distinct `percent_rank_*` fields**, most in **both a rounded
  and an `_unrounded` variant** (`percent_rank_xwoba` / `percent_rank_xwoba_unrounded`). **Percentile
  is stored at full float precision and rounded only for display.**
- **Every percentile field has a raw-value sibling in the same record** — `whiff_percent` beside
  `percent_rank_whiff_percent`, `exit_velocity_avg` beside `percent_rank_exit_velocity_avg`, and so
  on across the set. **The raw/percentile pairing is 1:1 in the data model**, not a presentation
  flourish bolted on at render time.
- Each record carries a boolean **`is_qualified`**. In records where **`is_qualified: 0`, every
  `percent_rank_*` field is `null`** — including the `_unrounded` ones. **Savant does not compute a
  percentile for an unqualified sample at all.** The refusal is in the data, not merely in the CSS.
- Sample size is exposed as a **user-facing control**: the rolling-average chart has a
  `<select class="rolling-chart">` labelled **"Min PA/BIP"** with options **10 / 25 / 50 / 75 / 100 /
  200, defaulting to 50.** The reader is handed the sample-size dial rather than shielded from it.
- Other modules present on the page: hits spray chart, infield slice chart, rolling xwOBA, Statcast
  batting tables, batted-ball profile, quality of contact, run value by pitch type. A footer glossary
  block defines **Batted Ball Event (BBE)** in place.

**[VERIFIED] the design conclusions that follow directly from the above:**

1. **Raw value and percentile are maintained as two separate quantities for every metric.** One
   number per question — *what did he do* and *how does that compare* — which is L1 principle 3
   (never two numbers for the same thing) satisfied at the schema level.
2. **Small samples are refused, not attenuated.** A null is not a faded bar. Whatever the rendered
   treatment looks like, there is no percentile to draw.
3. **Percentile is a derived, population-relative quantity that Savant recomputes and stores per
   season** — it is not a static property of the player.

**[UNVERIFIED] — my prior knowledge of the rendered appearance, NOT confirmed this session.** I could
not read these from the HTML (they are drawn client-side), the WebFetch summariser explicitly
reported it could not find them, and `mlb.com/glossary/statcast/percentile-rankings` returned
**HTTP 406**:

- that each row renders as a horizontal track with a filled bar and a pill carrying the percentile
  number, with the raw value right-aligned at the row's end;
- that the colour ramp is red↔blue diverging, keyed to percentile with a neutral midpoint;
- that the ramp's orientation is normalised so the "good" pole is consistent even for metrics where
  low is better (Whiff%, K%);
- the exact wording of the scale's end labels.

**The normalisation point is worth stating as a principle regardless of whether Savant does it**,
because it is independently sound: **if colour encodes quality, it must be keyed to the percentile,
not the raw value — otherwise a metric where low is good silently inverts the meaning of your
palette.** That argument stands on its own; the attribution to Savant does not.

### 7.2 PlayerProfiler

**[VERIFIED]** — WebFetch of the [glossary](https://www.playerprofiler.com/terms-glossary/). The
definitions quoted in §1 and §2 of this file are from that fetch and are sound. Relevant here:
**"Best Comparable Player"** is a real, defined module — it aggregates *"physical attributes, college
production, workout metrics, and NFL data"* to name a single most-similar peer. **A named analogue is
a legitimate way to make a high-dimensional profile legible, and unlike a tier label it is
falsifiable.**

**[UNVERIFIED]** — everything about PlayerProfiler's *rendered* player pages: the `raw (percentile)`
display convention, rank-against-multiple-populations, colour-coded tier chips, radar charts. **I did
not fetch a player page this session.** My general recollection is that they lead with rank and use
coloured tier chips, and that the chips are the part worth *not* copying (see §8.7) — but treat that
as a hypothesis to check, not a finding.

### 7.3 PFF

**[UNVERIFIED IN FULL.] I did not fetch `pff.com/grades` this session.** An earlier draft asserted a
specific grading mechanism (per-play −2 to +2 in 0.5 increments, normalised to 0–100) and a set of
named colour bands. **Both have been removed as unsourced.**

What survives is an argument that does not depend on PFF's internals: **a 0–100 graded scale and a
0–100 percentile are different objects, and drawing one in the other's visual idiom is a category
error.** If a product shows a PFF grade, it must not sit on a percentile track. Verify PFF's actual
scale construction and band thresholds before publishing anything that quotes them.

### 7.4 EPA scatter plots

**[UNVERIFIED — REMOVED.]** An earlier draft described [rbsdm.com](https://rbsdm.com/stats/stats/)
in specific detail: helmet logos as marks, an inverted defensive axis, dashed zero-lines, a
garbage-time win-probability filter, a paired ranked table. **I never fetched that site.** Every one
of those specifics has been deleted.

The general convention — that team/QB efficiency is conventionally shown as a two-axis scatter with
league-average reference lines, and that using team logos as marks satisfies L1 principle 4 by
letting every mark name its own entity without a legend — is **[UNVERIFIED] but low-risk and easy to
confirm.** Fetch the site before relying on any detail of it.

### 7.5 Cleaning the Glass, SumerSports, Fantasy Points Data, Sofascore, Opta, StatsBomb

**Not reached.** Recorded honestly, including the reasons:

- **Cleaning the Glass** — `cleaningtheglass.com/stats/guide/faq` and `/stats_intro` both returned
  **HTTP 500**.
- **Fantasy Points Data** — `fantasypoints.com` was **blocked by a domain-safety check on my side**,
  not by a paywall. An earlier draft claimed "HTTP 402"; that was wrong and is corrected here.
- **SumerSports, Sofascore, Opta, StatsBomb** — not attempted; the web-search budget (200 calls) was
  exhausted earlier in the session.

**Leads to verify, explicitly not findings.** Cleaning the Glass is widely credited with two
conventions that would matter a great deal here: **excluding garbage time from every number by
default as a stated editorial commitment**, and **computing percentiles within position rather than
league-wide**. Both map directly onto §8.4 (postseason and Week-18 contamination) and §8.6
(percentile without a population). **I could not confirm either. Verify before citing.**

### 7.6 The conventions, synthesised — separated by evidence

**[VERIFIED] — supported by the Savant source read and the PlayerProfiler glossary:**

1. **Keep raw value and comparative context as two distinct stored quantities**, one per question.
   Savant maintains a 1:1 raw↔percentile pairing across 105 metrics.
2. **Refuse to compute a comparative statistic on an unqualified sample.** Savant nulls the
   percentile rather than deriving a weak one. This is the strongest single finding in the section
   and it is a *data* decision before it is a *visual* one.
3. **Store percentile unrounded; round only at display.**
4. **Expose the sample-size threshold as something the reader can see and change**, rather than
   burying it (Savant's "Min PA/BIP" selector).
5. **A single named comparable is a legitimate legibility device** and, unlike a tier band, is
   falsifiable (PlayerProfiler's Best Comparable Player).

**[UNVERIFIED but independently defensible] — arguments that stand on their own logic and on L1's
already-established craft principles, regardless of who does them:**

6. **Carry magnitude with position or length; let colour be redundant.** (Cleveland & McGill; L1
   principle 5.)
7. **If colour encodes quality, key it to the percentile and normalise orientation** so "good" is
   always the same pole — otherwise low-is-better metrics invert your palette.
8. **Direct-label the graphic; never a legend for magnitude.** (L1 principle 2 and 4.)
9. **Draw league average on the graphic** rather than stating it in prose. (L1 principle 8.)
10. **Name the population and its n.** A percentile is meaningless without one. (§8.6.)
11. **Label a scale in the reader's language**, not in statistician's units. (L1 principle 14 —
    speak the domain's own units.)

**The open question a designer must resolve per-product, and which this session did NOT settle:**
**percentile or rank?** The trade is real — percentile is better when the population is large and its
shape matters; rank is better when the population is small enough to enumerate. For fantasy football
this cuts sharply, because ~32 starting QBs and ~90 relevant receivers are very different
populations. **I have no verified evidence on how the reference products resolve it.** Settle it with
a fetch, not from memory.

---

## 8. The traps

### 8.1 Ratio-of-ratios and unstable denominators

`YPT = YPRR ÷ TPRR`. A receiver's yards-per-target can rise because he got better (YPRR up) *or*
because he got targeted less on the same routes (TPRR down). **The metric cannot distinguish an
improvement from a demotion.** This is precisely why YPT needs 205 targets to stabilise while its two
components need 184–351 routes.

`RACR = receiving yards ÷ air yards`. The denominator is a *choice made by the offense*, not by the
player. A short-aDOT receiver is handed a small denominator and posts a big ratio for free — Jarvis
Landry, 6.5-yard average target depth, RACR 1.33, top of his cohort, entirely from depth.
([FantasyPros](https://www.fantasypros.com/2021/01/air-yardage-differential-wide-receiver-efficiency-2021-fantasy-football/))
**Never rank RACR without conditioning on aDOT, and preferably never rank it at all.**

### 8.2 Efficiency is a claim about the offense, dressed as a claim about the player

SumerSports' expected-YPRR model — built from **personnel, down and distance only, with no player
identity** — is *more* stable year to year (0.67) than actual YPRR (0.51). And nfelo finds RYOE and
plain yards-per-carry are **>70% correlated** over multi-season samples, meaning the whole
expected-yards apparatus recovers mostly what YPC already told you. When a surface says "he is
efficient," it is usually saying "his offense puts him in good positions."

### 8.3 Survivorship in every rate leaderboard

A per-route or per-target leaderboard with a minimum qualifier is **conditioned on the player having
kept his job**. Every receiver whose role collapsed in Week 4 is deleted from the board. This
systematically inflates the apparent reliability of rate metrics and hides exactly the outcome a
dynasty manager most needs to see. **The fix is not a better minimum — it is showing the population,
including the players who fell out of it.** (L1 principle 8.)

### 8.4 Postseason and Week-18 contamination

L1 caught this once already: the gamelog includes weeks 19–22, with row counts shrinking as teams are
eliminated, and filtering to weeks 1–18 moved Luther Burden's YPRR from 2.44 to 2.79. **It
generalises in two directions:**

- **Postseason inclusion** silently reweights a season's rates toward the players on good teams.
- **Week 18** is structurally corrupted in the opposite way: playoff-bound teams rest starters. In
  the 2025 season the Packers, Chargers and Eagles all confirmed rested starters, benching Hurts,
  Barkley, A.J. Brown, DeVonta Smith, Goedert, Herbert, McConkey and Hampton among others.
  ([ESPN](https://www.espn.com/fantasy/football/story/_/id/47483868/nfl-fantasy-football-espn-injured-inactives-watchlist-week-18-2026-january-4) ·
  [PFN](https://www.profootballnetwork.com/fantasy-football/nfl-teams-resting-players-week-18-2025/))
  A Week-18 snap share is not measuring the same thing a Week-8 snap share measures.
- **Fantasy playoff weeks (15–17) are not an NFL concept.** Any "playoff performance" cut is a
  league-settings artefact, not a football one.

### 8.5 Per-game vs per-snap vs per-route vs per-target — four different players

The same receiver is a different player under each denominator. Burden in L1's own run: **39% snap
share** (marginal by snaps), **234 routes** (part-time by routes), **2.79 YPRR** (elite by routes),
**13.1% target share** (unremarkable by targets). All four are true. **A surface that shows one
denominator is asserting that denominator is the right question**, and it should say which one it
picked. TE stabilisation makes the point structurally: TEs run 18.2 routes/game vs WRs' 26.1, so
"games" and "routes" are not interchangeable units across positions.

### 8.6 Percentile without a stated population

A percentile is a function of the comparison set. 90th percentile among *qualified* TEs (perhaps 20
players) is a different claim from 90th percentile among all 90 receivers with a route. And a
percentile computed on a survivorship-filtered population (§8.3) is doubly conditioned. **Print the
n.**

### 8.7 Categorical labels applied to continuous quantities

L1's third defect, and the one most likely to recur: a 20.0-touch cutoff labelled **Ashton Jeanty a
"committee" back at 19.9 touches/game** on a 79% snap share and 339 touches. Every tiering scheme —
PlayerProfiler's chips, PFF's grade bands, "WR1/WR2/WR3" — lies at its boundaries, and the boundary
is where the interesting players live. **State the number against the published marker; let the
reader do the categorising.** The shrinkage formula in §4.2 is the principled alternative: it gives a
continuous, defensible estimate that never has a cliff.

### 8.8 Cross-vendor comparison of "over expected" metrics

CPOE from NGS (tracking-based, uses separation) and CPOE from nflfastR (play-based) are **different
numbers with the same name**. Likewise RYOE from NGS vs PFF (whose model's most important input is
*graded blocks*). YACOE is explicitly documented as model-dependent. **Never place two vendors'
over-expected numbers on the same axis, and never let a user think they are the same metric.**

### 8.9 The same name meaning different things

- **Success rate**: nflfastR = `epa > 0`; Football Outsiders lineage = 40/60/100% of needed yards.
  These disagree on real plays.
- **Target share**: nflverse computes per game played; PlayerProfiler computes "in games that
  receiver was involved in the passing attack." A player who was active but held to zero targets is
  in one denominator and out of the other.

### 8.10 Touchdown regression, drawn too small

TDPRR needs **882 routes / 33 games** to be half signal — the slowest-stabilising receiving metric
measured, over twice YPRR's requirement. Every TD-driven number a fantasy surface shows is the least
reliable number on the page, and it is usually the one in the biggest type.

### 8.11 The naive baseline beats the clever metric

**Fantasy points per game correlates 0.68 to next season's fantasy points — higher than any advanced
metric measured.** An advanced-stats surface that cannot beat "what he scored last year" has to earn
its place by explaining *why*, not by claiming to predict better. Honest framing: the advanced
metrics tell you which of two similar scorers has the sturdier foundation. They do not replace the
scoreboard.

---

## 9. What a designer must never get wrong about advanced stats

1. **Opportunity predicts; efficiency describes. Rank the layout by that.** Target share, air yards
   share, WOPR and snap share sit above YPRR, YPC, RACR and YAC — not because they are more
   interesting, but because they are the only ones that survive to next season. Giving yards-per-carry
   (0.16) equal weight with targets-per-game (0.70) is a design lie.

2. **A rate without its denominator is not a statistic.** Routes, snaps, targets and attempts must
   travel with the number in the same visual unit, always. 2.79 YPRR on 234 routes and 2.79 YPRR on
   700 routes are different claims and must not look alike.

3. **Know the actual stabilisation point, and do not inherit folklore.** TPRR 184 routes, RPRR 188,
   **YPRR 351**, YPT 205 targets, TDPRR 882 routes — and *"stabilises" means half signal, not
   trustworthy.* The widely repeated "YPRR at 180 routes" is a misattributed TPRR result and it is
   currently wrong in `how-the-hobby-speaks.md`.

4. **Draw uncertainty; never footnote it.** The shrinkage formula
   `(observed × N + league_avg × S) / (N + S)` gives a drawable second value. The gap between raw
   and shrunk *is* the uncertainty, in the metric's own unit, with no error-bar vocabulary required.

5. **Refuse the comparative statistic on a small sample; do not attenuate it.** Baseball Savant's
   discipline, verified in its own page data: an unqualified player-season has **`is_qualified: 0`
   and every one of its 105 `percent_rank_*` fields set to `null`.** The refusal happens in the data
   model, before any question of rendering. A faded bar is still read as a bar; an absent percentile
   cannot be misread. (L1 principle 7: absence renders as missing, never as zero.)

6. **Percentile, raw value and population, together or not at all.** Percentile without a raw value
   hides what happened; raw without percentile hides whether it is good; either without a stated
   population is unfalsifiable. Percentile within position, never across positions — and print the n.
   Savant maintains raw and percentile as a **1:1 pairing across every metric it publishes**, which
   is the structural version of this rule.

7. **Carry magnitude with position or length; keep colour redundant — and if colour encodes quality,
   key it to the percentile, not the raw value.** Normalise the orientation so the "good" pole is
   always the same one; otherwise a metric where low is better (drop rate, whiff rate) silently
   inverts your palette. Colour alone for magnitude fails the exact perceptual channel most likely to
   break (Cleveland & McGill; Okabe & Ito).

8. **Never band a continuous quantity into a named tier — and never draw a designed scale as a
   percentile.** 19.9 touches is not "committee"; a 0–100 PFF grade is not the 78th percentile. Label
   the ends of the axis in the reader's own language, draw the reference marker, and let the reader
   categorise. Keep the geometry oriented so "better" is always the same direction on every axis.

9. **The same metric name from two vendors is two metrics, and filtering is part of the definition.**
   CPOE, RYOE, YACOE, expected fantasy points, target share and success rate all have multiple
   incompatible definitions in circulation. Name the source. And filter the season before computing
   anything: exclude the postseason, treat Week 18 as structurally different, remember fantasy
   playoff weeks are a league setting rather than a football fact — then **say on the surface that
   you did**. L1 already paid for this lesson once.

10. **For quarterbacks, rushing is not a footnote — and the scoreboard is a strong baseline.** A
    rushing yard is worth 2.5× a passing yard, yet every marquee QB analytic (EPA/play, CPOE, DAKOTA,
    time to throw) is passing-only; a QB surface built from them alone ranks the wrong players. More
    broadly, FP/game at **0.68** outpredicts every advanced metric in this file. The job of an
    advanced-stats surface is to explain the *shape* of production — where the volume comes from, how
    sturdy it is, what would have to change — not to claim it forecasts better than the obvious
    number.
