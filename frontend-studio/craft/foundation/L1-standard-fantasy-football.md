# L1 — Standard (Redraft) Fantasy Football

**The baseline every fantasy manager already knows, and every product in the category assumes.**

Compiled 2026-08-17. Season referenced: **2026 NFL season — Week 1 kicks off Wednesday, Sept 9, 2026** (§6).
Written for a designer-engineer who must build a screen tomorrow and must not invent terminology.

**How to read this.** Section 7 (vocabulary) and section 8 (category conventions) are the two you will
reach for most often while laying out a screen. Sections 1–3 are the model underneath the numbers you
will be displaying. Section 9 is the failure list.

**A note on scope.** This is *redraft* — one season, fresh draft every August, everything resets. Dynasty
is a superset: it inherits every rule, every unit and every word below and adds multi-year asset value on
top. Nothing here is dynasty-specific, and nothing here stops being true in dynasty.

---

## 0. The one-paragraph mental model

A fantasy manager owns a **team** of real NFL players. Each week his team plays **head-to-head** against
one other team in his **league** (usually 10 or 12 teams). Before each week he chooses a **starting
lineup** from his roster — a fixed set of **slots** (1 QB, 2 RB, 2 WR, 1 TE, 1 FLEX, 1 K, 1 D/ST is the
canonical shape). Only players in those slots score. Those players' real-world statistics convert to
**fantasy points** by the league's **scoring settings**. Highest total wins the week. Fourteen weeks of
this produces a record and a seeding; the top teams enter a single-elimination **fantasy playoff** in
Weeks 15–17, and one manager wins the league. Between weeks he adds players from the **waiver wire**,
drops others, and negotiates **trades**. Everything a fantasy product shows exists to serve one of four
questions: *who do I start this week*, *who do I add*, *is this trade good*, and *am I going to make the
playoffs*.

---

## 1. Scoring systems

### 1.1 The three reception formats

The only thing that separates the three named formats is **what a catch is worth**. Everything else is
usually identical.

| Format | Points per reception | Common name in the wild |
|---|---|---|
| Standard | 0.0 | "standard", "non-PPR", "0 PPR" |
| Half-PPR | 0.5 | "half", "half-point PPR", "0.5 PPR" |
| Full PPR | 1.0 | "PPR", "full PPR", "PPR" |

A receiver with 8 catches for 80 yards scores **8.0 / 12.0 / 16.0** in standard / half / full PPR
([Bleacher Nation](https://www.bleachernation.com/fantasy-football/2026/08/12/ppr-vs-half-ppr/)).

**What changes about player value:**

- **PPR pushes value toward pass-catchers.** WRs, receiving TEs, and pass-catching RBs rise; pure
  early-down runners fall. In standard, rushing touchdowns carry proportionally more of the scoring, so
  RBs go earlier
  ([RotoWire](https://www.rotowire.com/football/article/ppr-vs-standard-scoring-explained-94844)).
- **PPR raises the floor, not just the ceiling.** A reception is a near-guaranteed point; a 6-catch,
  45-yard game is 10.5 PPR points and 4.5 standard points. This is why "PPR makes production more
  consistent and widens the pool of usable players"
  ([Strategy Fantasy Football](https://www.strategyfantasyfootball.com/articles/ppr-scoring-explained-player-value-differences/)).
- **The archetype that moves most is the pass-catching committee back** — the player with 8 carries and
  6 catches. Near-worthless in standard, a weekly starter in full PPR.
- **Half-PPR is the modern default** at the serious end of the hobby and is Yahoo's platform default;
  ESPN's default is full PPR.

**Design consequence:** *never show a fantasy point total without the scoring format it was computed
under.* A points column is meaningless unless the reader knows whether receptions are in it. Every serious
product either labels the format globally (header chip, league settings) or per-column.

### 1.2 Typical scoring values per stat

These are the values that appear in the overwhelming majority of leagues. Where platforms differ, the
difference is noted.

**Offense**

| Stat | Points | Notes |
|---|---|---|
| Passing yards | 1 per 25 | i.e. 0.04/yd; 300 yds = 12.0 |
| Passing TD | 4 | 6 in a minority of leagues; always check |
| Interception thrown | −2 | FantasyPros' own default is −1 |
| Rushing yards | 1 per 10 | 0.1/yd |
| Rushing TD | 6 | |
| Receiving yards | 1 per 10 | 0.1/yd |
| Receiving TD | 6 | |
| Reception | 0 / 0.5 / 1.0 | the format switch |
| 2-point conversion (any) | 2 | |
| Fumble lost | −2 | |
| Fumble recovered for TD | 6 | |

Sources: [SportsDataIO NFL fantasy scoring](https://sportsdata.io/developers/fantasy-scoring-system/nfl),
[FantasyPros scoring settings](https://www.fantasypros.com/scoring-settings/).

**"Fractional" vs "threshold" scoring.** Nearly every modern league uses *fractional* yardage — 47
receiving yards is 4.7 points, not 4. ESPN calls this setting "PPR Fractional" and it is their default
([ESPN Fantasy Football 101: Settings](https://www.espn.com/fantasy/football/story/_/id/19540805/fantasy-football-101-settings)).
Legacy threshold scoring (points only at each full 10 yards) still exists but is rare and reads as
old-fashioned. **Display consequence: one decimal place is the category standard.** 17.4, not 17 and not
17.42.

**Kicker**

| FG distance | Points |
|---|---|
| 0–39 yds | 3 |
| 40–49 yds | 4 |
| 50+ yds | 5 |
| Extra point made | 1 |
| Missed FG | −1 (often 0) |
| Missed XP | −1 |

([FantasyPros](https://www.fantasypros.com/scoring-settings/); SportsDataIO uses a simpler 0–49 = 3,
50+ = 5.)

**Defense / Special Teams (D/ST)** — the one place platforms genuinely diverge.

Per-event values are consistent across ESPN and Yahoo: sack +1, interception +2, fumble recovery +2,
safety +2, blocked kick +2, defensive or return TD +6.

The **points-allowed ladder** is not consistent:

| Points allowed | ESPN | Yahoo |
|---|---|---|
| 0 (shutout) | +5 | +10 |
| 1–6 | +4 | +7 |
| 7–13 | +3 | +4 |
| 14–17 | +1 | +1 (14–20) |
| 18–21 | 0 | +1 (14–20) |
| 21–27 | 0 | 0 |
| 28–34 | −1 | −1 |
| 35–45 | −3 | −4 (35+) |
| 46+ | −5 | −4 (35+) |

ESPN additionally applies a **yards-allowed** ladder (0–99 = +5 down to 550+ = −7) that Yahoo does not
meaningfully use
([Drafty Sports comparison](https://draftysports.com/articles/you-deserve-better-defense-scoring);
Yahoo tiers confirmed at [ProFootballNetwork](https://www.profootballnetwork.com/how-does-defense-score-in-fantasy-football/)).

**Design consequence:** D/ST is the position where a hardcoded scoring assumption will visibly lie to the
user. The same defensive performance is worth 10 points on Yahoo and 5 on ESPN.

**IDP (Individual Defensive Player)** leagues replace team D/ST with real defenders — solo tackle 1,
assist 0.5, sack 2, INT 3, forced fumble 3, TD 6 is a common baseline
([SportsDataIO](https://sportsdata.io/developers/fantasy-scoring-system/nfl)). IDP is a minority format
but a vocal one; if your product doesn't support it, say so rather than silently mis-scoring.

### 1.3 Superflex and 2QB

A **Superflex** slot accepts QB/RB/WR/TE. A **2QB** slot forces a second QB. Both make a manager start
two quarterbacks; Superflex merely lets him fall back to a skill player if he doesn't have one, so
Superflex is the softer version and the far more common one.

The effect is enormous and it is a supply effect, not a talent effect. In a 12-team league there are 32
starting NFL quarterbacks and up to 24 QB starting slots. Replacement level at QB collapses.

**Measured, same week, same site, 12-team drafts, Aug 2026**
([FantasyFootballCalculator PPR ADP](https://fantasyfootballcalculator.com/adp/ppr) vs
[2QB ADP](https://fantasyfootballcalculator.com/adp/2qb)):

| | 1QB PPR | 2QB |
|---|---|---|
| QBs in the top 24 picks | 0 | **11** |
| First QB off the board | Josh Allen, pick **32** | Josh Allen, pick **1.5** |
| Second QB | Drake Maye, pick 50 | Drake Maye, pick 6.0 |
| Third QB | Lamar Jackson, pick 55 | Lamar Jackson, pick 7.0 |

That is the single cleanest number in this document for explaining positional value to a designer: **the
same player, same week, same scoring, moves from pick 32 to pick 1.5 because one lineup slot changed.**

Auction pricing tells the same story: elite QBs go for $14–22 of a $200 budget in 1QB and $42–65 in
Superflex, roughly a 2.5–3× premium
([DraftExpertPro](https://draftexpertpro.com/guides/superflex-auction-values)).

**Design consequence:** any ranking, value, or trade screen that does not know whether the league is
Superflex is showing wrong numbers for half the player pool. Format is not a preference toggle buried in
settings — it is a first-class input to every valuation surface.

### 1.4 TE premium

**TE premium** gives tight ends more per reception than other positions. The canonical implementation is
the FFPC's **1.5 PPR for TEs** (RB/WR stay at 1.0)
([4for4](https://www.4for4.com/2024/preseason/understanding-tight-end-value-te-premium-fantasy-leagues-ffpc)).
Yahoo added a TE-premium option as a first-class league setting
([Yahoo Sports](https://sports.yahoo.com/fantasy/article/tight-end-premium-is-here-one-of-your-most-requested-formats-now-on-yahoo-fantasy-125635476.html)).
A softer 1.5-in-half-PPR variant (0.5 for RB/WR, 1.0 or 1.5 for TE) also circulates.

Effect: TEs get drafted meaningfully earlier and more of them become startable, which matters because
FFPC's roster also uses a dual flex that permits up to three TEs in a lineup
([RotoBaller](https://www.rotoballer.com/tight-end-premium-fantasy-football-draft-rankings-ffpc-2026/1905150)).

### 1.5 What a "good" weekly score is, by position

This is the number a designer most often needs and most often gets wrong. **Full-PPR, 2025 season, real
finishing data** ([FantasyPros 2025 stats: QB](https://www.fantasypros.com/nfl/stats/qb.php?scoring=PPR),
[RB](https://www.fantasypros.com/nfl/stats/rb.php?scoring=PPR),
[WR](https://www.fantasypros.com/nfl/stats/wr.php?scoring=PPR),
[TE](https://www.fantasypros.com/nfl/stats/te.php?scoring=PPR)):

| | Elite (positional #1) | Solid weekly starter | Startable / flex | Droppable |
|---|---|---|---|---|
| **QB** | 22+ | 18–21 | 15–17 | under 14 |
| **RB** | 20+ | 15–19 | 11–14 | under 10 |
| **WR** | 19+ | 14–18 | 10–13 | under 9 |
| **TE** | 16+ | 11–14 | 8–10 | under 7 |

Anchors from the 2025 season, points per game, PPR:

- **QB**: Josh Allen 22.0 (QB1 overall, 374.5 total). QB12 Baker Mayfield 16.6. QB18 Aaron Rodgers 14.6.
- **RB**: Christian McCaffrey 24.5 (416.6 total). RB12 Javonte Williams 15.2. RB24 Zach Charbonnet 11.3.
  RB36 Jordan Mason 8.1.
- **WR**: Puka Nacua 23.4 (375.0 total). WR12 Jameson Williams 12.9. WR24 Jaylen Waddle 12.1. WR36
  Khalil Shakir 10.4. WR48 Luther Burden III 8.5.
- **TE**: Trey McBride 18.6 (315.9 total) — and then a cliff: TE2 Kyle Pitts 12.4, TE6 11.7, TE12 10.3.

**Independent corroboration.** FantasyPros' Boom/Bust report defines its thresholds the same way — not as
fixed point totals but as *the average weekly score of a rank slot at that position*: QB "boom" = 27.3+
(avg QB3), QB "bust" = 14.9 or fewer (avg QB18); RB "boom" = 19.4+ (avg RB6), RB "bust" = 4.4 or fewer
(avg RB40). See §8.4. **Adopt that construction rather than hardcoding thresholds** — it is
position-relative, self-labelling, and it survives a scoring-format change.

**Reference points for a whole team's weekly score:** in a 10-team standard league, ~110 points wins
roughly 80% of weekly matchups, and the 70–110 band is where nearly every matchup is decided — every
point in that band is worth about 1.5% of win probability
([Fantasy Outliers](https://medium.com/fantasy-outliers/how-many-points-are-enough-e3ef4a7d2411)). Full
PPR shifts that band up roughly 15–25 points depending on lineup size; a 12-team PPR league typically
lives around 110–135.

---

## 2. Roster and lineup construction

### 2.1 The canonical starting lineup

| Slot | Abbrev in the wild | Eligible |
|---|---|---|
| Quarterback | **QB** | QB |
| Running back ×2 | **RB** | RB |
| Wide receiver ×2 | **WR** | WR |
| Tight end | **TE** | TE |
| Flex | **FLEX** (ESPN writes **FLX**) | RB/WR/TE |
| Team defense | **D/ST** (ESPN, Sleeper) / **DEF** (Yahoo) | team |
| Kicker | **K** | K |

That is 9 starters, and it is the default on ESPN
([ESPN 101: Settings](https://www.espn.com/fantasy/football/story/_/id/19540805/fantasy-football-101-settings))
and Yahoo
([Yahoo default league settings](https://help.yahoo.com/kb/default-league-settings-fantasy-football-sln6489.html)).

**Common variants, all of which you will meet:**

| Variant | What it does |
|---|---|
| 3 WR | 3 WR / 2 RB / 1 TE — the most common "modern" tweak |
| 2 FLEX | second RB/WR/TE flex; 4for4's recommended 2026 setup |
| SUPERFLEX / SF / OP | QB/RB/WR/TE; often labeled **SFLEX** or **OP** ("offensive player") |
| WRT / W-R-T | an explicit RB/WR/TE flex label, older ESPN convention |
| No K, no D/ST | increasingly common in enthusiast leagues |
| IDP | DL/LB/DB slots replacing D/ST |

### 2.2 Bench, IR, roster size

| Platform | League size default | Starters | Bench | IR | Total |
|---|---|---|---|---|---|
| ESPN | 10 | 9 | 7 | configurable | 16 + IR |
| Yahoo | 10 | 9 | 6 | 2 | 15 + 2 IR |

([ESPN](https://www.espn.com/fantasy/football/story/_/id/19540805/fantasy-football-101-settings);
[Yahoo](https://help.yahoo.com/kb/default-league-settings-fantasy-football-sln6489.html))

4for4's 2026 recommended setup: 12 teams, 1QB/2RB/2WR/1TE/2FLEX/1K/1DST, 6 bench, 1–2 IR
([4for4](https://www.4for4.com/2026/preseason/best-fantasy-football-league-settings-2026)).

**IR** is a roster slot that holds a player who does not count against roster size, gated on his real NFL
designation. Platforms differ on which designations qualify — some allow only IR/PUP/NFI/Suspended, some
allow "Out". A player who is *upgraded* off IR must be moved back to an active slot or the lineup is
illegal. **Design consequence: IR eligibility is a per-platform rule, and the "your IR player is no longer
eligible" state is a real, frequent, and usually badly-handled UI moment.**

### 2.3 League size and what changes with it

| Size | Character | What actually changes |
|---|---|---|
| **8–10** | shallow | Everyone has a superteam. Startable WR3s sit on waivers. Streaming QB/TE/DST is trivial. Bench spots are for upside, not insurance. |
| **12** | the standard | The reference size for nearly all published rankings, ADP, and tier language. Balanced: stars, sleepers, and a real waiver wire. |
| **14+** | deep | The talent pool empties fast. Waiver work becomes a weekly grind. Handcuffs and backup QBs become genuinely rosterable. Replacement level drops sharply, which is what raises the value of every starter you own. |

([FantasyPros deep-league strategy](https://www.fantasypros.com/2019/05/general-strategies-for-deep-leagues-fantasy-football/);
[Fantasy Strategy Guide](https://fantasystrategyguide.com/league-settings-strategy))

**12 teams is the canonical assumption.** If your product must pick one default, pick 12 — it is what
FantasyFootballCalculator, FantasyPros, and essentially every published tier list assume.

### 2.4 Why "starter" is the load-bearing word

A player's value is not his points. It is his points **relative to the worst player you could legally
start instead**. This is the whole of positional value and it falls directly out of the lineup slots:

- Slots × teams = the number of players at that position who *must* be started league-wide.
- 12 teams × 1 QB = 12 starting QBs. 12 × 2 RB = 24 (plus flex). 12 × 2 WR = 24 (plus flex).
- Everyone below that line is **replacement level** — freely available, roughly interchangeable, worth
  nothing to acquire.

Change the slots and you move the line. That is the entire mechanism behind §1.3's pick-32-to-pick-1.5
result. **Nothing about quarterbacks changed; the line moved.**

---

## 3. Positional value and scarcity

### 3.1 Replacement level, VOR/VORP, in plain terms

> **VOR = a player's projected points − the projected points of the worst player you'd still be starting
> at his position.**

Also written **VORP** (Value Over Replacement Player) and used interchangeably with **VBD** (Value-Based
Drafting), which is the draft strategy built on it
([YAFSB](https://yafsb.com/content/vor-value-over-replacement-fantasy-football/);
[Fantasy Football Analytics](https://fantasyfootballanalytics.net/2024/08/winning-fantasy-football-with-projections-value-over-replacement-and-value-based-drafting.html)).

Its whole job is **cross-positional comparison**. Raw points can't tell you whether a 280-point QB is
better than a 240-point RB, because the positions score on different scales. VOR can, because it measures
each against its own floor.

**Baselines.** The baseline is a choice, and reasonable people disagree:

| Method | Baseline in a 12-team, 1QB/2RB/2WR/1TE/1FLEX league |
|---|---|
| Worst starter | QB12, RB24, WR24, TE12 (+ flex absorbed proportionally) |
| Worst starter + flex | QB12, ~RB30, ~WR30, TE12 |
| First bench / "VOLS" | one slot past the last starter |
| Man-games / "BEER" | derived from how many players it takes to fill a season of starts at that position |

([Subvertadown on VBD baselines](https://subvertadown.com/article/guide-to-understanding-the-different-baselines-in-value-based-drafting-vbd-vols-vs-vorp-vs-man-games);
[Footballguys forums on flex baselines](https://forums.footballguys.com/threads/vbd-baselines-with-flex-rosters.684124/))

**Design consequence:** if you display a VOR-like number, the baseline is not an implementation detail —
it is the definition of the number. Two products can report a different VOR for the same player and both
be right. Say which baseline you used, in the interface.

### 3.2 Why RB and WR values differ

- **RB compresses fast and breaks.** The elite tier is thin, workload is concentrated in a handful of
  bell cows, and injury attrition is brutal — which means replacement-level RB play arrives *sooner* and
  is *worse* than at any other skill position. That is why the top RBs carry the highest VOR in the draft
  and why the position is treated as fragile ([PFF on replacement level](https://www.pff.com/news/the-value-of-replacement-level)).
- **WR is deep and durable.** More players, more startable weeks, flatter curve. In PPR the WR curve
  flattens further because receptions supply a floor.
- **The empirical consequence — the "RB dead zone."** Running backs drafted in Rounds 3–6 have
  underperformed their ADP for six consecutive seasons while WRs in the same range have outperformed;
  Round 5 WRs have been the best value over that span
  ([Establish The Run](https://establishtherun.com/miller-the-running-back-dead-zone/)). Establish The Run
  has since published a partial retraction — recent seasons show the gap narrowing
  ([The Death of the Running Back Dead Zone](https://establishtherun.com/the-death-of-the-running-back-dead-zone/)) —
  which is itself worth knowing, because managers argue about it out loud.
- **QB and TE are "onesie" positions** — one starter each, so the marginal value of the #2 at the
  position is small in 1QB leagues. This is why "late-round QB" is a named strategy, and why Superflex
  destroys the logic entirely.

### 3.3 Where the cliffs actually are (2025, PPR, points per game)

| | #1 | #6 | #12 | #24 | #36 | Cliff to name |
|---|---|---|---|---|---|---|
| QB | 22.0 | — | 16.6 | (injury-distorted) | — | shallow; the QB1–QB12 gap is only ~5.4 ppg |
| RB | 24.5 | — | 15.2 | 11.3 | 8.1 | **steep**: −9.3 from RB1 to RB12 |
| WR | 23.4 | — | 12.9 | 12.1 | 10.4 | steep at the very top, then almost **flat** WR12→WR36 (−2.5) |
| TE | 18.6 | 11.7 | 10.3 | — | — | **the sharpest cliff in fantasy**: TE1 → TE2 is −6.2 ppg |

Read that TE row carefully. In 2025 the difference between the TE1 and the TE6 was larger than the
difference between the WR12 and the WR48. That is what "positional scarcity" means in practice, and it is
why elite TEs are drafted in the second round while TE12 is a Round-13 afterthought.

Note also the WR row: the *WR12-to-WR36 gap is 2.5 points per game*. This is the single most useful fact
for explaining why managers stream and churn wide receivers and refuse to trade for mid-tier ones.

### 3.4 Tier language: what "RB1 / WR3 / QB1" actually means

Two things get called the same thing, and confusing them marks a product as amateur.

**(a) Positional finish tiers — the dominant meaning.** Blocks of 12, indexed off a 12-team league:

| Label | Rank range | Sentence a manager actually says |
|---|---|---|
| RB1 / WR1 / QB1 / TE1 | 1–12 | "He's a locked-in RB1." |
| RB2 / WR2 | 13–24 | "I'd start him as an RB2, not more." |
| RB3 / WR3 | 25–36 | "He's my WR3, I flex him in good matchups." |
| WR4 / WR5 | 37–48 / 49–60 | "Deep-league WR5, bench stash." |

([RotoWire glossary](https://www.rotowire.com/fantasy/football/glossary);
[DraftSharks tiers](https://www.draftsharks.com/article/fantasy-football-tiers))

**The catch:** ESPN's own glossary defines these in blocks of **10**, because ESPN's default league is 10
teams ([ESPN glossary](https://www.espn.com/fantasy/football/story/_/id/19541777/fantasy-football-101-glossary-how-play)).
Some WR-heavy analysts use blocks of 18. **Blocks of 12 is the safe default and the majority usage.**
If your product computes these, expose the league size that produced them.

**(b) Depth-chart role — the NFL meaning.** "He's the RB1 in Denver" means he is the lead back on that
team's depth chart, not that he's a top-12 fantasy RB. Context disambiguates: a team name next to it means
depth chart; a bare "he's an RB1" means the fantasy tier. **Both usages are correct and both are common.**

**(c) Draft tiers.** A separate idea: analysts group players with *similar projected value* into numbered
**Tiers** ("Tier 1 RB", "Tier 3 WR") with the explicit purpose of telling you when it's safe to wait. The
gap between tiers is the point — DraftSharks quantifies a 14.1-point cliff between its Tier 1 and Tier 2
([DraftSharks](https://www.draftsharks.com/article/fantasy-football-tiers)). Tiers are drawn by cluster
analysis or by hand, and every good rankings UI draws a visible rule between them.

---

## 4. ADP, rankings, and tiers

### 4.1 ADP

**ADP = Average Draft Position** — the mean pick number at which a player has been selected across a
sample of real or mock drafts. It is the market price. Managers use it three ways: to know what a player
*costs*, to spot **value** (a player available well after his ADP), and to spot a **reach** (taking a
player well before it).

**Who publishes it, and why they differ:**

| Source | What it samples | Character |
|---|---|---|
| [FantasyFootballCalculator](https://fantasyfootballcalculator.com/adp/ppr) | its own mock drafts (6,665 drafts, Aug 10–17 2026) | free, high volume, fast-moving, 12-team default |
| [FantasyPros consensus ADP](https://www.fantasypros.com/nfl/adp/ppr-overall.php) | aggregates ESPN, CBS, RTSports, Fantrax, Sleeper | consensus across real platform drafts |
| [RotoWire](https://www.rotowire.com/football/adp.php) | Fantrax, Sleeper, ESPN, MFL, NFFC, Yahoo, plus Superflex and Main Event splits | broadest source breakdown |
| **NFFC** ([nfc.shgn.com/adp/football](https://nfc.shgn.com/adp/football)) | high-stakes real-money drafts | the sharpest sample; what analysts quote |
| **Underdog** | best-ball drafts | skewed toward upside; not a redraft price |
| **FFPC** | TE-premium, 20-round | only comparable to other FFPC drafts |

**Design consequence:** ADP is *format-specific and sample-specific*. An ADP number without its format
(PPR/half/SF/TEP), its league size, and its date window is not a number. FantasyFootballCalculator prints
all three above the table; copy that.

**The canonical ADP table columns**, straight off FantasyFootballCalculator:

`# · Name · Pos · Team · Bye · Overall (ADP) · Std. Dev · High · Low · Times Drafted · Graph`

Two things there are worth stealing. **Std. Dev is a first-class column** — it is how the reader sees
consensus vs. controversy. And **High/Low are printed in round.pick notation** (`1.01`, `2.09`), which is
the notation a drafter thinks in.

**Live 2026 example** (12-team PPR, 6,665 drafts, Aug 10–17 2026, same source):

| # | Player | Pos | Team | Bye | ADP | Std Dev | High | Low |
|---|---|---|---|---|---|---|---|---|
| 1 | Bijan Robinson | RB | ATL | 11 | 1.7 | 0.7 | 1.01 | 1.04 |
| 2 | Jahmyr Gibbs | RB | DET | 6 | 1.8 | 0.8 | 1.01 | 1.04 |
| 3 | Puka Nacua | WR | LAR | 11 | 3.1 | 0.7 | 1.01 | 1.05 |
| 4 | Ja'Marr Chase | WR | CIN | 6 | 3.9 | 1.0 | 1.01 | 1.08 |
| 5 | Jaxon Smith-Njigba | WR | SEA | 11 | 5.4 | 1.1 | 1.01 | 1.09 |
| 6 | Christian McCaffrey | RB | SF | 8 | 6.4 | 1.6 | 1.01 | 2.01 |
| 12 | Justin Jefferson | WR | MIN | 6 | 13.0 | 2.9 | 1.05 | 2.10 |
| 20 | Saquon Barkley | RB | PHI | 10 | 20.1 | 3.6 | 1.06 | 3.09 |

Positional anchors from that same board: **first QB at pick 32** (Josh Allen), **first TE at pick 33**
(Trey McBride), **first D/ST at pick 92** (Denver), **first K at pick 135** (Brandon Aubrey). Those four
numbers tell you everything about how the category weights the positions.

### 4.2 Rankings and ECR

**Rankings** are one analyst's ordered list. **ECR (Expert Consensus Rankings)** is FantasyPros'
aggregation of 100+ analysts into a single list — and it is the de facto industry reference
([FantasyPros ECR](https://support.fantasypros.com/hc/en-us/articles/115001219327-What-is-ECR-Expert-Consensus-Rankings-and-how-do-you-calculate-it)).

Mechanically it is **not** a mean of ranks. FantasyPros assigns **Rank Points** per ranked position and
sums them, specifically because averaging forces you to invent ranks for unranked players
([methodology](https://www.fantasypros.com/about/faq/football-draft-accuracy-methodology/)). Weekly
start/sit ECR typically draws on 80–120+ analysts.

The columns that come with it, and what each is for:

- **ECR** — the consensus rank.
- **Best / Worst** — the most optimistic and most pessimistic single expert rank
  ([FantasyPros](https://support.fantasypros.com/hc/en-us/articles/115001363408-What-is-Best-and-Worst-Rank)).
- **Avg** and **Std Dev** — the spread. A WR18 with SD 2.1 is settled; a WR18 with SD 11.4 is a coin flip
  wearing a consensus label.
- **vs. ADP** — the difference between consensus rank and market price. This is the column that finds
  value, and it is the reason FantasyPros publishes dedicated
  [ECR-vs-ADP pages per platform](https://www.fantasypros.com/nfl/rankings/consensus-rankings-yahoo-adp.php).

**ECR vs ADP is the most important derived number in the whole category.** Rank is what the experts think.
ADP is what the room will pay. The gap is the edge.

### 4.3 How managers talk about price

These are the actual sentences. A product that can't render the concepts behind them isn't speaking the
language.

- "He's going in the **fourth**." (round, not pick number — rounds are how drafters think)
- "He's a **round-3 pick** on a **round-6 price**."
- "I'm not paying that." / "That's a **reach**." / "That's **free**."
- "He **fell** to me." / "He was still there at 4.08."
- "His ADP is **rising** / he's **going up boards**."
- "**Where's the value?**" — meaning: who is cheap relative to rank.
- "I'm **out at cost**." — I like him, not at that price. (This is the sentence a value screen has to
  make computable.)

---

## 5. The in-season rhythm

The season has a **weekly heartbeat**, and it is the single most important thing a fantasy product's
information architecture has to respect. The manager's week is not uniform: it has a hot phase, a
decision phase, and a dead phase.

| Day | What the manager is doing | What he needs on screen |
|---|---|---|
| **Sun afternoon/night** | Watching. Live scoring. Yelling. | Live matchup, players yet to play, projected final |
| **Mon night** | Last game. Matchup resolves. | Same, plus "what do I need from my MNF player" |
| **Tue** | Reading the wire. Setting waiver claims / FAAB bids. Injury news lands. | Waiver targets, FAAB budgets, add/drop |
| **Wed ~3am ET** | **Waivers process.** Winners and losers announced. | Transaction results, remaining FAAB |
| **Wed–Thu** | Free agency is open (first-come-first-served). Trade talks. | Free agent list, trade block |
| **Thu ~8:20pm ET** | **TNF locks.** First lineup decisions are irreversible. | Start/sit for TNF players only |
| **Fri–Sat** | Practice reports. Q/D/O designations firm up. | Injury designations, weather |
| **Sun ~1pm ET** | **Main lock.** Lineup is final. | Start/sit, projections, matchup |

### 5.1 Waivers

When a player is dropped, he goes on **waivers** for a holding period rather than becoming immediately
available. Claims are collected during that period and resolved all at once. Four models exist:

| System | Order determined by | After a successful claim | Who uses it |
|---|---|---|---|
| **Continual / rolling list** | Reverse draft order initially; **never resets** | Claimant drops to the **bottom** | **Yahoo default** |
| **Reverse order of standings** | Reset weekly by record — worst team gets #1 | Yahoo: unchanged. ESPN: claimant to lowest | ESPN's traditional default |
| **FAAB** | Blind sealed-bid auction | Budget debited | The enthusiast default |
| **None** | First-come, first-served | — | Rewards insomnia |

([Yahoo waivers](https://help.yahoo.com/kb/SLN6427.html);
[ESPN rules](https://www.espn.com/fantasy/football/ffl/story?page=fflruleswaiverwalk);
[Sleeper](https://support.sleeper.com/en/articles/3978868-waivers-for-regular-season-playoffs))

**Processing time.** "Wednesday morning ET" is the correct cross-platform mental model, but each platform
gets there differently. Yahoo: claims close 11:59 PM PT Tuesday, process early Wednesday. Sleeper's
recommended default clears 12:05 AM PT Wednesday. ESPN processes daily ~3:00 AM ET except Mon/Tue, and
**ESPN's own documentation is internally inconsistent** about whether the default hold is 1 day or 48
hours. If you build a "waivers clear in X" countdown, do not hardcode it.

**Reverse-standings waiver order stops updating during the fantasy playoffs**, because standings stop
updating. This surprises people every single December.

### 5.2 FAAB

**FAAB = Free Agent Acquisition Budget.** Every manager gets an identical season-long budget and bids
blind on waiver players. Highest bid wins; the bid is debited; the budget **never replenishes** during the
season.

**All three major platforms default to a $100 budget** — ESPN, Yahoo, and Sleeper
([ESPN FAB](https://support.espn.com/hc/en-us/articles/360000066231-Free-Agent-Budget-FAB);
[Yahoo](https://help.yahoo.com/kb/SLN6427.html);
[Sleeper](https://support.sleeper.com/en/articles/1876040-how-does-faab-bidding-work)).
That matters for display: **`$` and whole dollars is the vernacular**, and because the budget is $100,
managers speak fluently in *percent and dollars interchangeably* — "I'd go 30 on him" means 30% and $30
and they are the same sentence.

**Tiebreakers differ.** ESPN uses a separate tiebreaker order and moves the winner to the bottom of it.
Yahoo makes the commissioner nominate one of the other three waiver systems as the tiebreak. Sleeper uses
waiver priority, which then behaves as a rolling list. **$0 bids are legal on Sleeper** (and common — it's
how you claim a player nobody else wants without spending).

**What people actually spend.** 4for4 measured winning bids across 2021–2022 as a percentage of budget:

| Position | Avg winning bid | Observed ceiling |
|---|---|---|
| QB | ~1% | up to $10 |
| RB | **8.1%** | up to $26 |
| WR | **9.1%** | up to $12 |
| TE | 5.7% | up to $11 |

([4for4 FAAB strategy](https://www.4for4.com/waiver-wire-faab-strategy))

**What advice columns recommend** is meaningfully higher: FantasyPros suggests **30–40% of budget** for a
player you genuinely like *early*, on the depreciation argument — "your FAAB is like a new car; it
depreciates as the season progresses," because a Week 2 add helps for 15 weeks and a Week 10 add for five
([FantasyPros 2025](https://www.fantasypros.com/2025/08/fantasy-football-strategy-faab-waiver-wire-advice/)).
The gap between the observed 8% and the recommended 35% is a live argument in the hobby, not a settled
fact. Two conventions worth knowing because they show up in UI:

- **Percentage advice usually means percent of *remaining* budget**, not the original $100.
- **Odd-number bidding** — bid $17 rather than $15 — is standard cheap tie-break insurance
  ([FantasyPros](https://www.fantasypros.com/2022/08/fantasy-football-faab-guide-strategy-2022/)).

### 5.3 The start/sit decision

The single most repeated action in the hobby. The inputs, in the order managers actually weight them:

1. **Is he playing?** Injury designation, practice participation, snap-count trend. This dominates.
2. **Role / opportunity** — snap share, route participation, target share, red-zone usage. The operative
   principle: *opportunity is more repeatable than a touchdown*. A TE who ran routes on most dropbacks
   with 5 catches is a better bet next week than one who caught a 40-yard TD on 12 snaps.
3. **Matchup** — "fantasy points allowed to the position" (also **DVP**, Defense vs. Position) is the
   simple version and is published everywhere
   ([FantasyPros points allowed](https://www.fantasypros.com/nfl/points-allowed.php)). Its known flaw is
   schedule bias: a defense looks tough at WR partly because of *who it faced*. Opponent-adjusted versions
   (DVOA-based) exist for exactly that reason
   ([FTN DVOA-adjusted points against](https://ftnfantasy.com/nfl/dvoa-points-against)).
4. **Game environment** — Vegas implied team total, spread, pace, weather, dome/outdoor. High implied
   totals mean more scoring opportunities; a big favorite means positive game script for RBs; a big
   underdog means volume for WRs.
5. **Projections** — a model's point estimate for the week. Their honest role is *tiebreaker*, not oracle;
   experienced managers use them as a prior and override on 1–4.

**The tell of a product built by someone who plays: the start/sit surface compares two specific players
against each other, not one player against an abstract threshold.** The question is never "is 11.2 good,"
it is "him or him."

### 5.4 Bye weeks

Every NFL team gets exactly one bye. In 2026 they run **Weeks 5–14, in nine distinct weeks — there are no
Week 12 byes** (Thanksgiving weekend runs all 32 teams). Between **2 and 6 teams** are on bye per week;
the mode is 4.

| Wk | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
|---|---|---|---|---|---|---|---|---|---|---|
| **Teams** | CAR, KC | CIN, DET, MIA, MIN | BUF, JAX, LAC, WAS | HOU, NO, NYG, SF | PIT, TEN | CHI, DEN, PHI, TB | ATL, CLE, GB, LAR, NE, SEA | — | BAL, IND, LV, NYJ | ARI, DAL |
| **Count** | 2 | 4 | 4 | 4 | 2 | 4 | **6** | **0** | 4 | 2 |

([NFL.com — every team's 2026 bye week](https://www.nfl.com/news/2026-nfl-schedule-release-every-team-bye-week))

**Week 11 2026 is the crisis week.** Six teams out, and it strips roughly **20.3% of all projected
draft-day value** from the league — RB −20%, WR −24%, TE −18% — the only week that leads in both RB and
WR ([Fantasy Life](https://www.fantasylife.com/articles/fantasy/2026-nfl-bye-weeks-for-fantasy-football-welcome-to-week-11-byema)).
Bijan Robinson, Puka Nacua, Jaxon Smith-Njigba, Drake London and Drake Maye are all on bye that week.

**Design consequence: bye week is a permanent, always-visible attribute of a player**, right next to his
team. Every product in the category prints it. A roster screen that doesn't warn you three weeks out that
your RB1 and RB2 share a bye is failing at its job.

### 5.5 Trades and the deadline

Leagues set a **trade deadline** after which no trades process — to stop a team eliminated from contention
from shipping its stars to a friend. The practical band is **Weeks 10–12**
([SI](https://www.si.com/fantasy/when-is-the-fantasy-football-trade-deadline-01jbwdbwqag8)). Yahoo's 2026
public default is **Sat Nov 28, 2026** (inside Game Week 12)
([Yahoo 2026 game dates](https://football.fantasysports.yahoo.com/f1/gamedates)). Sleeper has no platform
default; the commissioner picks, typically Weeks 9–14.

**A 2026-specific fact worth surfacing:** the **NFL** trade deadline is **Tue Nov 10, 2026, 4:00 PM ET**
([NFL Football Operations](https://operations.nfl.com/calendar-events/nfl-important-dates/)) — roughly
2.5 weeks *before* most fantasy deadlines. So real-world roster shocks (a traded RB1, a WR landing in a
new offense) hit while fantasy trading is still open. That gap is where informed managers act, and a
product that shows both dates on one timeline is doing something genuinely useful.

Most platforms also impose a **review period** (Yahoo default: 2 days) during which the league or the
commissioner can veto.

### 5.6 Streaming

**Streaming** = declining to commit to a season-long starter at a position and instead cycling short-term
options off the waiver wire by matchup. Applied almost exclusively to **D/ST, QB, TE and K** — the
"onesie" positions where you only start one.

- **D/ST streaming** is near-universal among good managers. Matchup-chasing "can be just as advantageous
  as having one of the top-5 season-long scoring DSTs"
  ([RotoWire](https://www.rotowire.com/football/article/fantasy-football-defense-streaming-strategy-tips-95749)).
  The practical rule: draft a D/ST in the last round or two, or skip it entirely.
- **QB streaming** — either roster two cheap QBs on *different bye weeks* and platoon by matchup, or run
  one roster spot and re-add weekly
  ([FantasyPros](https://www.fantasypros.com/2026/06/quarterback-streaming-fantasy-football-draft-strategy-targets-2026/)).
- **TE streaming** — prioritize route participation and targets over touchdown history.

**Two constraints that make or break it:** streaming needs a league without tight transaction limits, and
it **burns FAAB every week**, which is why the guidance is ~1% bids or free agency rather than waivers.

### 5.7 The playoffs

Fantasy playoffs are single-elimination, seeded by regular-season record with points-for as the standard
tiebreaker.

| Bracket | Rounds | Byes |
|---|---|---|
| 4 teams | 2 (semi, final) | none |
| **6 teams** | 3 | **seeds 1–2 get a first-round bye** |
| 8 teams | 3 | none |

**Weeks 15–17 is the practitioner standard**, championship in Week 17. Week 18 is deliberately excluded
because seeding is settled by then and starters rest — Sleeper's own explainer says Week 18 "often winds
up having the unpredictability of preseason"
([Sleeper](https://sleeper.com/blog/how-do-fantasy-playoffs-work/)). Platform defaults do vary: Yahoo's
2026 public default is a **2-week bracket, Weeks 16–17, 4 playoff teams plus a 4-team consolation
bracket** ([Yahoo](https://football.fantasysports.yahoo.com/f1/gamedates),
[Yahoo defaults](https://help.yahoo.com/kb/SLN6489.html)); ESPN's public leagues run a fixed 14-week
regular season with playoffs from Week 15.

**Consolation bracket vs. Toilet Bowl are not synonyms.** In a consolation bracket the *winner* advances
to a consolation championship. In a **Toilet Bowl** the *loser* advances, until one team is crowned last
place — Sleeper literally titles it the "💩 King"
([Sleeper](https://support.sleeper.com/en/articles/2203534-consolation-bracket-vs-toilet-bowl)). Last-place
punishment is a strong cultural convention layered on top and is a real part of the hobby's emotional
stakes.

---

## 6. The 2026 season calendar

### 6.1 Preseason and cutdowns

| Event | Date (2026) |
|---|---|
| Hall of Fame Game (Panthers v Cardinals, Canton) | Thu **Aug 6** |
| Preseason Week 1 | Aug 13–15 |
| Preseason Week 2 | Aug 20–23 |
| Preseason Week 3 | Aug 27–29 |
| **90 → 53 roster cutdown, 6:00 PM ET** | **Sun Aug 30** |
| Cutdown waiver claims expire 1:00 PM ET; practice squads form | Mon Aug 31 |

([NFL Football Operations](https://operations.nfl.com/calendar-events/nfl-important-dates/);
[FOX Sports preseason schedule](https://www.foxsports.com/stories/nfl/2026-nfl-preseason-schedule-complete-dates-tv-channels-how-watch-streaming))

**Two 2026 deviations from habit:** cutdown moved to a **Sunday** and landed **two days earlier** than
recent norms, because the season opens Wednesday. Consequence for the hobby: most redraft drafts happen
*after* the 53-man rosters are settled, which is a change.

### 6.2 The regular season

**The 2026 opener is Wednesday, September 9 — not Thursday.** Only the second Wednesday opener in NFL
history. Labor Day falls late, which puts the opening Friday inside the Sports Broadcasting Act's Friday
blackout window; the league moved the opener up rather than back
([Sky Sports](https://www.skysports.com/nfl/news/12118/13524432/seattle-seahawks-to-open-2026-nfl-season-on-wednesday-ahead-of-historic-australia-game-between-san-francisco-49ers-and-los-angeles-rams);
[CBS Sports](https://www.cbssports.com/nfl/news/2026-nfl-schedule-seahawks-wednesday-australia/)).

| Week 1 game | When (ET) |
|---|---|
| **Patriots at Seahawks** (Kickoff Game, NBC) | **Wed Sep 9, 8:20 PM** |
| 49ers at Rams, Melbourne Cricket Ground (Netflix) | Thu Sep 10, 8:35 PM ET |
| Main Sunday slate (13 games) | Sun Sep 13 |
| MNF — Broncos at Chiefs | Mon Sep 14, 8:15 PM |

([NFL.com Week 1](https://www.nfl.com/schedules/2026/by-week/week-1))

Structure: **18 weeks, 17 games, one bye per team.** Regular season **Sep 9, 2026 → Jan 10, 2027**.
Nine international games, a record. Super Bowl LXI: **Sun Feb 14, 2027**, SoFi Stadium — the latest Super
Bowl ever ([Wikipedia — 2026 NFL season](https://en.wikipedia.org/wiki/2026_NFL_season)).

**Week-window map.** Weeks 1, 12, 15, 16, 17, 18 are verified against NFL.com; **Weeks 2–11 and 13–14 are
inferred from the Sunday cadence** and may shift for Thursday/Saturday/international variations.

| Wk | Window | Wk | Window |
|---|---|---|---|
| 1 | **Wed Sep 9 – Mon Sep 14** ✓ | 10 | Nov 12 – 16 *(inferred)* |
| 2 | Sep 17 – 21 *(inferred)* | 11 | Nov 19 – 23 *(inferred)* |
| 3 | Sep 24 – 28 *(inferred)* | 12 | **Wed Nov 25 – Mon Nov 30** ✓ |
| 4 | Oct 1 – 5 *(inferred)* | 13 | Dec 3 – 7 *(inferred)* |
| 5 | Oct 8 – 12 *(inferred)* | 14 | Dec 10 – 14 *(inferred)* |
| 6 | Oct 15 – 19 *(inferred)* | 15 | **Dec 17 – 21** ✓ |
| 7 | Oct 22 – 26 *(inferred)* | 16 | **Dec 24 – 28** ✓ |
| 8 | Oct 29 – Nov 2 *(inferred)* | 17 | **Dec 31 – Mon Jan 4, 2027** ✓ |
| 9 | Nov 5 – 9 *(inferred)* | 18 | **Jan 9 – 10, 2027** ✓ |

### 6.3 The dates a fantasy product must know

| Date (2026) | Event | Why it matters |
|---|---|---|
| Sun **Aug 30** | 53-man cutdown | Biggest roster-churn event before drafts |
| **Wed Sep 9, 8:20 PM ET** | **Week 1 lock (NE/SEA)** | Earliest Week 1 lock in history |
| Weeks 5–14 | Bye weeks (none in Wk 12) | Wk 11 = 6 teams; see §5.4 |
| **Tue Nov 10, 4:00 PM ET** | **NFL trade deadline** | Real-world roster shocks land here |
| **Wed Nov 25, 8:00 PM ET** | Packers–Rams, first Wednesday Thanksgiving-week game | Locks the same day waivers clear |
| **Thu Nov 26** | **Thanksgiving** — CHI@DET 1:00, PHI@DAL 4:30, KC@BUF 8:20 | 5 games lock before Sunday; zero byes |
| Fri Nov 27, 3:00 PM | Broncos at Steelers | |
| ~**Sat Nov 28** | Typical fantasy trade deadline (Yahoo 2026 default) | |
| **Dec 17–21** | **Fantasy Week 15** — quarterfinal / seeds 1–2 bye | |
| **Dec 24–28** | **Fantasy Week 16** — semifinal | Contains the **Christmas Friday triple-header** |
| **Fri Dec 25** | Christmas: GB@CHI 1:00 (Netflix), BUF@DEN 4:30 (Netflix), LAR@SEA 8:15 (FOX) | Lands inside most leagues' semifinal |
| **Dec 31 – Mon Jan 4, 2027** | **Fantasy Week 17 — CHAMPIONSHIP** | Spans New Year; later than most managers expect |
| Jan 9–10, 2027 | NFL Week 18 | Deliberately excluded from fantasy |

Sources: [NFL.com Week 12](https://www.nfl.com/schedules/2026/by-week/week-12),
[Week 16](https://www.nfl.com/schedules/2026/by-week/week-16),
[Week 17](https://www.nfl.com/schedules/2026/by-week/week-17),
[NFL Ops important dates](https://operations.nfl.com/calendar-events/nfl-important-dates/),
[Yahoo 2026 game dates](https://football.fantasysports.yahoo.com/f1/gamedates).

**Known gaps / verify before relying on:** ESPN's 2026 default fantasy trade deadline and exact public
playoff weeks are not published in an accessible place (its support site is Cloudflare-gated, and its
legacy rules page still describes the pre-2021 17-week structure). Sleeper publishes no platform default
for playoff start week or trade deadline — both are commissioner-set.

---

## 7. The vocabulary a manager actually says

Grouped by where it shows up. These are the words, in the register practitioners use them. Where a term
has a competing meaning, both are given.

### Roles and archetypes

| Term | What it means |
|---|---|
| **Bell cow** | A back who gets essentially all of a team's carries *and* backfield targets — the undisputed workhorse. |
| **Workhorse** | Same idea, slightly weaker; a back with a high, dependable carry volume. |
| **Committee / RBBC** | A backfield split between two or more backs, capping anyone's weekly ceiling. Said with contempt. |
| **Alpha** | The unquestioned #1 option in a passing game — the guy the offense runs through. |
| **Target hog** | A receiver who commands enormous target volume even in a mediocre offense. Volume is the point. |
| **Handcuff** | The direct backup to a starting RB — you roster him to protect your investment if the starter goes down. |
| **Insurance** | Same concept, generalized to any position. |
| **Gadget / gadget player** | A player used in schemed touches rather than a defined role. |
| **Onesie** | A position you only start one of — QB, TE, K, D/ST. Used to argue for spending nothing there. |
| **Zero-week / zombie** | A rostered player whose role has evaporated. |

### Value and price

| Term | What it means |
|---|---|
| **ADP** | Average Draft Position — the market price of a player, in picks. |
| **ECR** | Expert Consensus Ranking — FantasyPros' aggregation of 100+ analysts. |
| **Value** | A player available meaningfully later than his rank says he should be. |
| **Reach** | Taking a player meaningfully earlier than his ADP. |
| **Sleeper** | A player you expect to substantially outperform his draft cost. |
| **Bust** | A player who badly underperforms his cost. |
| **Breakout** | A player making a genuine leap in production, usually year 2–3. |
| **Dart throw / flier / lottery ticket** | A late-round pick with a small chance of enormous payoff. |
| **Stud** | An elite, week-winning player. Used unironically. |
| **League winner** | A player who was cheap and then produced elite points down the stretch and through the fantasy playoffs. The highest compliment in the hobby, and always retrospective. |
| **Buy low** | Trading *for* an underperforming player at a discount, betting on recovery. |
| **Sell high** | Trading *away* an overperforming player before regression arrives. |
| **Out at cost** | "I like him, not at that price." The most useful sentence in a draft. |

### Weekly decisions

| Term | What it means |
|---|---|
| **Start/sit** | The weekly decision of who fills each lineup slot. |
| **Floor** | The realistic low end of a player's weekly outcome. High floor = consistent. |
| **Ceiling** | The realistic high end. High ceiling = capable of winning you the week. |
| **Boom/bust** | High ceiling, low floor, unpredictable week to week — usually a big-play player without volume. |
| **Smash spot / smash start** | A matchup so favorable the start is automatic. |
| **Spike week** | A single enormous week from an otherwise unremarkable player. |
| **Streaming** | Cycling a position (QB/TE/D/ST/K) weekly off the wire by matchup rather than rostering one. |
| **Streamer** | The player you picked up for exactly one week's matchup. |
| **Flex-worthy** | Good enough for the FLEX slot but not for a dedicated RB/WR slot. |
| **Must-start** | You start him regardless of matchup. |
| **Fade** | To deliberately avoid a player others are high on. |
| **Chalk** | The consensus, obvious play. |
| **Game script** | How the score flow shapes usage. Positive script (leading) feeds RBs; negative script (trailing) feeds WRs and QBs. |
| **Funnel defense** | A defense that is strong against one phase and weak against the other, funneling opposing volume into the weak one. |

### Volume and usage (the analytics vocabulary)

| Term | What it means |
|---|---|
| **Targets** | Passes thrown at a player. The base unit of receiver opportunity. |
| **Target share** | A player's share of his team's targets, as a %. The most quoted receiver metric. |
| **Snap share** | % of his team's offensive snaps a player was on the field for. |
| **Route participation / routes run** | % of dropbacks on which he actually ran a route — sharper than snap share for pass-catchers. |
| **Opportunity share** | % of a team's total carries *and* targets going to one player. |
| **Air yards** | Total distance the ball travels in the air on passes aimed at a player — measures intended, not realized, usage. |
| **aDOT** | Average depth of target. Low aDOT + high volume = PPR floor; high aDOT = boom/bust. |
| **YPRR / TPRR** | Yards (or targets) per route run — efficiency independent of playing time. |
| **Red zone touches / looks** | Carries and targets inside the opponent's 20 — where touchdowns come from. |
| **Touches** | Carries + receptions. The blunt volume number for a back. |
| **xFP / expected fantasy points** | What a player's usage *should* have produced, ignoring efficiency luck. Used to argue regression. |
| **TD regression** | The expectation that an abnormal touchdown rate reverts. Applied in both directions. |
| **DVOA** | Defense-adjusted Value Over Average — opponent-adjusted efficiency. |
| **DVP / points allowed to position** | How generous a defense has been to QB/RB/WR/TE. The simple matchup metric. |
| **Implied team total** | The points Vegas expects a team to score. The cleanest single game-environment input. |

([FantasyPros deep-stat glossary](https://www.fantasypros.com/fantasy-football-deep-stat-analysis-glossary-guide/);
[SnapCount glossary](https://snapcountff.com/glossary))

### League mechanics

| Term | What it means |
|---|---|
| **Waivers** | The holding period a dropped player sits in before becoming a free agent, plus the claim process. |
| **FAAB** | Free Agent Acquisition Budget — blind-bid auction against a fixed season budget (usually $100). |
| **Priority** | Your position in the waiver order. |
| **The wire** | The waiver wire / free agent pool. "He's on the wire." |
| **Stash** | Rostering a player for future value, not this week. |
| **Cut / drop / release** | Removing a player. Interchangeable. |
| **Trade block** | The list of players you've publicly offered. |
| **Veto** | League or commissioner rejection of a trade. |
| **Commish** | The commissioner — league administrator. |
| **Bye week** | The week a player's NFL team doesn't play. He scores zero and cannot be started. |
| **Lock** | The moment a lineup slot becomes uneditable — usually that player's kickoff. |
| **Toilet bowl** | The loser's bracket, where the loser advances, crowning a last-place finisher. |
| **Consolation bracket** | The non-playoff bracket where the *winner* advances. Not the same thing. |

### Formats and strategy

| Term | What it means |
|---|---|
| **Redraft** | One season, fresh draft every year, no carryover. The default. |
| **Keeper** | Carry a small fixed number of players year to year. |
| **Dynasty** | Carry essentially the whole roster year to year; rookie drafts each spring. |
| **Best ball** | Draft and walk away — your optimal lineup is scored automatically, no start/sit, no waivers. |
| **Snake draft** | Order reverses each round: 1–12, then 12–1. |
| **Auction / salary cap draft** | Every manager has a budget (commonly $200) and bids on every player. |
| **Third-round reversal (3RR)** | A snake variant where round 3 repeats round 2's order, to soften the 1.01 advantage. |
| **Superflex / SF / OP** | A lineup slot that accepts a QB. Doubles QB demand. |
| **Zero RB** | Deliberately skipping RB early to load up on WR/TE/QB, then attacking RB late and on waivers. |
| **Hero RB** | One elite RB early, then fade the position for many rounds. |
| **Robust RB** | Multiple RBs in the first few rounds. |
| **Late-round QB** | Wait on QB entirely, take one in the last few rounds, stream if needed. |
| **RB dead zone** | Rounds 3–6, where RBs have historically underperformed ADP while WRs outperformed. |
| **Stacking** | Starting multiple players from the same NFL offense, so one good game pays twice. |
| **Guillotine league** | The lowest-scoring team is eliminated each week and its roster hits the wire. |

Glossary sources: [RotoWire](https://www.rotowire.com/fantasy/football/glossary),
[ESPN Fantasy Football 101: Glossary](https://www.espn.com/fantasy/football/story/_/id/19541777/fantasy-football-101-glossary-how-play),
[Athlon](https://athlonsports.com/fantasy/fantasy-football-glossary-key-terms),
[Establish The Run on the RB dead zone](https://establishtherun.com/miller-the-running-back-dead-zone/),
[FantasyPros Zero RB](https://www.fantasypros.com/2026/07/zero-rb-draft-strategy-roster-construction-2026-fantasy-football/).

### Injury and status codes — the abbreviations, exactly

These appear as a badge next to a player's name on every screen in the category. Getting them wrong is an
instant tell.

| Code | Meaning |
|---|---|
| **Q** | Questionable — roughly a coin flip |
| **D** | Doubtful — unlikely to play |
| **O** | Out — will not play |
| **IR** | Injured Reserve |
| **PUP** | Physically Unable to Perform |
| **NFI** | Non-Football Injury |
| **SUSP** | Suspended |
| **DTD** | Day-to-day |
| **BYE** | His team isn't playing this week |


---

## 8. How the category presents this

Four products define the conventions: **ESPN Fantasy** and **Yahoo Fantasy** (the mass-market incumbents),
**Sleeper** (the modern, mobile-first, enthusiast platform), and **FantasyPros** (not a league host — an
aggregation and tools layer that syncs *to* your league). A designer working in this space is working
inside conventions all four share. Divergence from them is a cost you must be able to justify.

> **Confidence note — read this before quoting anything below.**
> **Highest confidence (§8.3, §8.4): FantasyPros.** Column sets, hex values, tier-banner CSS, the ECR JSON
> record, boom/bust thresholds and expert counts were read off server-rendered HTML and embedded JSON
> config (`ecrData`, the Reports table specs), not screenshots. Treat these as spec.
> **High confidence:** the FantasyFootballCalculator ADP columns and ESPN's roster tab set and
> %ST/%ROST definitions, read off live pages and cited.
> **Category convention, stated from familiarity:** the lineup-slot abbreviations, player-row anatomy,
> status colours, matchup layout and draft-board grid. Consistent enough across the four products to
> design against, but not a citable spec — **verify any specific abbreviation against the platform you
> are integrating with before shipping a data mapping.**
> Anything gated behind auth or a paywall is flagged inline as unverified rather than guessed.

### 8.1 The team / roster screen ("My Team")

**Vertical order, universal across all three hosts:**

1. Team identity + this week's **matchup header** (my score vs opponent score, both projected finals)
2. **Starting lineup**, one row per slot, in fixed positional order
3. **Bench** ("BE" on ESPN, "BN" on Yahoo, "Bench" on Sleeper)
4. **IR** (if the league has IR slots)
5. Roster actions — Add Player, Drop, Propose Trade

**The slot column is the leftmost column and it never moves.** It is a fixed vertical list, in canonical
order: QB, RB, RB, WR, WR, TE, FLEX, D/ST, K, then bench, then IR. The rows *are* the slots, and a player
occupies a slot — this is the structural insight the screen is built on. Editing a lineup means moving a
player between slot rows, not reordering a list.

**Exact slot abbreviations by platform** — get these wrong and it reads instantly as an outsider's product:

| Concept | ESPN | Yahoo | Sleeper |
|---|---|---|---|
| Flex (RB/WR/TE) | **FLEX** | **W/R/T** | **FLEX** |
| Team defense | **D/ST** | **DEF** | **DEF** |
| Bench | **Bench** | **BN** | **BN** |
| Injured reserve | **IR** | **IR** | **IR** |
| Superflex | **OP** (offensive player) | **Q/W/R/T** | **SUPER_FLEX** / SF |

Yahoo's `W/R/T` and `Q/W/R/T` notation is distinctive and old; ESPN's `OP` for superflex is equally
distinctive. Sleeper uses plain FLEX/SF. Note also that **ESPN abbreviates Washington as WSH** while most
data sources use WAS, and Jacksonville appears as both JAX and JAC — a real integration hazard.

**Column order to the right of the player, on a weekly view.** ESPN's own documentation names the set:
the roster Overview tab shows *"the projection for that week's game, the percentage of ESPN leagues in
which the player is started (%ST) and rostered (%ROST)"*, and the Stats tab shows *"each player's opponent
and start time for that week's game, as well as a full statistical breakdown"*
([ESPN 101: League and team pages](https://www.espn.com/fantasy/football/story/_/id/19541264/league-team-pages)).

The canonical column order, left to right:

`SLOT · PLAYER · OPP · STATUS/GAME TIME · PROJ · PTS · (%ST) · (%ROST) · ACTION`

- **OPP** — the opponent, written as `@DAL` or `vs DAL`. The `@` / `vs` distinction is load-bearing and
  never dropped.
- **PROJ** vs **PTS** — projected points and actual points sit side by side. Before kickoff PTS is blank
  or `--`; during the game it fills in live. **These are two different quantities and both are always
  shown**; a product that shows only one is failing.
- **%ROST** — the share of all leagues on the platform where the player is rostered. **%ST** — the share
  of *eligible* leagues where he is being started. They are different denominators and both are
  published. %ROST is the popularity signal; %ST is the "does the crowd trust him this week" signal.
- The **+/-** delta on %ROST over the last week is what identifies a rising or falling player.

**Anatomy of a player row.** Every product composes it the same way:

```
[headshot] Name Surname   TEAM POS   [status badge]   Q · BYE 11
```

- Small circular or squared **headshot** (team-colored fallback for D/ST; team logo for defenses)
- **Name** as primary, at the largest weight in the row
- **TEAM POS** on a second line or immediately after, in a muted, smaller, uppercase treatment — `DET RB`
- **Injury/status badge** inline with the name, as a short colored token: `Q` `D` `O` `IR` `SUS`
- **Bye week** shown either as the opponent cell (`BYE`) or as a persistent `BYE 11` attribute

**Status colour convention** (consistent enough across the category to be a de facto standard):
Questionable = amber/yellow, Doubtful = orange, Out / IR / Suspended = red, healthy = no badge at all.
**Absence of a badge is the healthy state** — nobody prints a green "OK." That is a real design rule: the
default carries no ink.

**Locked / played state.** Once a player's game has kicked off, his row becomes non-interactive and is
visually de-emphasised (a lock glyph, or simply the removal of the move affordance). Once his game is
final, his PTS becomes authoritative and the row is often dimmed. **Three states, not two: editable,
locked-in-progress, final.**

**Team projected score** sits in the matchup header at the top, alongside the opponent's — never buried
at the bottom of the roster table.

### 8.2 The player page / player card

**Above the fold**, in order:

1. Headshot, name, team, position, jersey number, **bye week**, height/weight/age
2. **Status line** — injury designation with the practice-report detail behind it
3. **This week**: opponent, game time, **projection**, and the positional matchup rating
4. **Season line**: total points, points per game, **positional rank** (`RB7`), %ROST / %ST
5. **The action** — Add / Drop / Trade For / Start

**Tabs**, essentially universal: **Overview · Game Log · News · Splits (or Advanced) · Outlook /
Projections**. FantasyPros adds a **Rankings** tab showing where each individual expert has the player.

**The stat table columns differ by position, and this is the thing outsiders get wrong most often.** A
single generic stat table for all positions is an immediate tell.

| Position | Game-log columns, in order |
|---|---|
| **QB** | `WK · OPP · RESULT · CMP/ATT · PASS YD · PASS TD · INT · RUSH ATT · RUSH YD · RUSH TD · FPTS` |
| **RB** | `WK · OPP · RESULT · ATT · RUSH YD · Y/A · RUSH TD · TGT · REC · REC YD · REC TD · FPTS` |
| **WR / TE** | `WK · OPP · RESULT · TGT · REC · REC YD · Y/R · REC TD · RUSH ATT · RUSH YD · FPTS` |
| **K** | `WK · OPP · FGM/FGA · LONG · 0-39 · 40-49 · 50+ · XPM/XPA · FPTS` |
| **D/ST** | `WK · OPP · PA · YDS ALLOWED · SACK · INT · FR · TD · SFTY · FPTS` |

Two rules inside those: **targets come before receptions for WR/TE** (opportunity before outcome), and
**FPTS is always the rightmost column** — the row reads as "here is what happened, and here is what it was
worth."

**The news feed** is a reverse-chronological list of short, dated, sourced blurbs — headline, timestamp,
one-paragraph body, and crucially a **"Fantasy Impact" / analyst spin** paragraph separate from the factual
report. That separation of *what happened* from *what it means* is a genuine category convention and is
worth preserving.

### 8.3 The rankings / player-list screen

**FantasyPros is the reference implementation** and the one to study. The following was verified against
the page's server-rendered HTML and embedded JSON config (`ecrData`, the Reports table specs) rather than
the rendered view, which is why it corrects the naive reading.

**There is no single column order — there is a `View:` selector with five column sets**, and the default
is not the one most people describe:

| View | Columns, left → right |
|---|---|
| **`overview`** (default) | `RK · WSID · PLAYER NAME · POS · BYE WEEK · UPSIDE · BUST · SOS SEASON · ECR VS. ADP` (Upside/Bust under a `CONSENSUS SENTIMENT` group header) |
| **`ranks`** | `RK · WSID · PLAYER NAME · POS · BEST · WORST · AVG. · STD.DEV · ECR VS. ADP` |
| **`notes`** | `RK · WSID · PLAYER NAME · POS · BYE WEEK · NOTES` |
| **`stats-avg`** | `RK · WSID · PLAYER NAME · FANTASYPTS ·` then `PASSING`(YDS,TDS) `RECEIVING`(REC,YDS,TDS) `RUSHING`(ATT,YDS,TDS) group headers |

**Things that are conspicuously absent from every view:** there is **no `TEAM` column** (team folds into
the player cell as `(CIN)`), **no `ADP` column** (ADP survives only as the derived `ECR VS. ADP` delta),
and no `%ROST` or `PROJ. FPTS` on draft boards. The payload *carries* `player_owned_avg` (99.6) and
`player_ecr_delta` — **neither is surfaced on the table.** Roster % appears only on the player page, as
prose: `Rostered In ~65% of leagues`.

**Weekly boards are a different table from draft boards**, and the checkbox column renames itself to the
decision in play: **`WSID`** ("who should I draft") on draft boards, **`WSIS`** ("who should I start") on
weekly ones. Same component, different question. Weekly adds `OPP` (`vs. TB` / `at HOU`), `MATCHUP`,
**`START/SIT` as a letter grade** (`A+`, `A`, `A-`, `B+`…), and `PROJ. FPTS`.

Above the table sit two filter rows: **scoring format** (Half PPR / PPR / STD) and **ranking type**
(Draft / Weekly / Rest of Season / Dynasty / Rookies / Waiver / Sleepers / Devy). Both are format
switches, not preferences — they change every number below.

**The ECR record behind a row:**

```json
{"player_name":"Ja'Marr Chase","player_team_id":"CIN","player_bye_week":"6",
 "player_owned_avg":99.6, "player_ecr_delta":null,
 "rank_ecr":1, "rank_min":"1", "rank_max":"4", "rank_ave":"1.57", "rank_std":"0.91",
 "pos_rank":"WR1", "tier":1}
```

`AVG.` and `STD.DEV` are **stored to 2dp, displayed to 1dp.** Live 2026 rows: Chase `1 | 1 | 4 | 1.6 | 0.9` ·
Gibbs `2 | 1 | 7 | 2.9 | 1.6` · Nacua `3 | 1 | 9 | 3.4 | 1.5` · Bijan `4 | 1 | 5 | 3.6 | 1.5`.

**`ECR VS. ADP` carries no colour at all** — `rgb(22,25,29)` for both `+5` and `-4`. All the meaning lives
in the tooltip: *"Ja'Marr Chase's ECR is 2 ranks better than his ADP."* Positive = value, negative = reach.

#### The consensus is not one size — and it varies by an order of magnitude

| Page | Experts included | Available |
|---|---|---|
| Draft PPR | **88** | 148 |
| Draft (QB) | 87 | — |
| **Dynasty** | **32** | — |
| **Weekly (Wk 1, QB)** | **8** | 10 |
| Rest-of-season PPR | 9 | — |

**A weekly ranking is a consensus of eight people; a draft ranking is a consensus of eighty-eight.** Both
are called "ECR" and rendered identically. FantasyPros discloses this honestly in a sub-header on every
page — `Consensus of 88 Experts (148 available) - Aug 17, 2026` — and the gap between *included* and
*available* is the premium hook: **`Pick Experts`** lets a subscriber recompose the consensus from a
chosen subset.

**Craft finding worth acting on: uncertainty is shown as four separate printed numbers and is never
drawn.** No whiskers, no interval bars, nowhere on the site. The scatter/dot-plot tier chart with error
bars that people associate with fantasy tiers is **borischen.co, not FantasyPros**. In a product this
otherwise disciplined, that is a real gap and the strongest available argument for drawing the interval
instead of tabulating it.

#### Tiers — exact spec

Not a column and not a row tint: a **full-width solid-blue pill interleaved into the `tbody`.**

| Property | Value |
|---|---|
| Background | `rgb(3,116,231)` — **#0374E7** |
| Text | `#FFFFFF`, 1rem, weight 400, `white-space: nowrap` |
| Corners | `border-radius: 6px` on first and last `<td>` — reads as a pill inset from the row edges |
| Right end | `Customize Tiers` link, `position: sticky; right: 0` below 480px |

Tier sizes on the live 2026 PPR board: **6, 5, 12, 12, 14, 20, 25, 33, 29, 42, 46, 58, 39, 64, 69, 25.**
Tiers widen monotonically as consensus decays — **that progression is itself the visual argument the
banner makes.** Steal it.

#### Where the tier idea actually earns its keep: the draft room

On the rankings page tiers are just banded rows. In the **Draft Wizard cheat-sheet board** they become
**parallel position columns**, each tier header showing `TIER n`, a **`remaining/total`** count, and a
plain-English line (`3 PLAYERS OF 7 REMAINING`) — and **the band's fill colour tracks depletion**:

| State | Class | Fill | Label treatment |
|---|---|---|---|
| Untouched | `--full` | `#F3F5F9` | normal |
| Draining | `--not-full` | `#FEC195` orange | normal |
| Nearly gone | `--low` | `#FD9891` salmon | normal |
| Exhausted | `--cleared` | `#F9FAFC` | **line-through**, `#525A67` |

**Drafted players are struck through and left in place**, so the manager watches a tier drain rather than
seeing rows vanish. Paired with **Pick Predictor** — a right-aligned percentage per row giving the
probability the player is gone before your next turn, coloured by urgency: `--alert` **#C9372C** (94%, 76%)
· `--warning` **#BF5000** (52%) · `--low` **#1C8157** (17%, 5%). Red = act now, green = wait.

**Both answer the question a ranking cannot: not "who is best" but "who will still be here."**

**Two non-overlapping colour systems coexist on that screen, and the discipline is the lesson.** Position
identity uses pastel hues — QB `#C8A1FF` · RB `#83DCEF` · WR `#85DE9E` · TE `#FF8AA2` · K `#FDB97C` ·
DST `#BDC3CD` · IDP `#F6E5AB` — all on **one dark ink `#16191D`**, so contrast never varies with hue.
Urgency uses a separate semantic red/orange/green ramp. **Identity never borrows the urgency ramp.**

**ADP table columns** (FantasyFootballCalculator, the free reference):

`# · NAME · POS · TEAM · BYE · ADP · STD DEV · HIGH · LOW · TIMES DRAFTED · GRAPH`

Two conventions to steal: **High/Low printed in `round.pick` notation** (`1.01`, `2.09`) because that is
how drafters think; and the sample stated above the table ("6,665 mock drafts between August 10, 2026 and
August 17, 2026, 12 teams"), which makes the number falsifiable.

**Position rank is printed as a suffix on the position, not a separate column** — `RB7`, `WR23`, `QB4`.
This is universal and non-negotiable vocabulary.

### 8.4 FantasyPros' decision surfaces — where the real information design lives

These are the screens that answer questions a ranking cannot, and they are the closest thing the category
has to state of the art.

**Boom / Bust — thresholds are rank-slot-relative, not fixed points.** This is the most transferable idea
on the site. The columns differ *by position*, and each header carries its own definition:

| QB | threshold | | RB | threshold |
|---|---|---|---|---|
| **Boom** (`top_3`) | 27.3+ — *avg QB3 weekly score* | | **Boom** (`top_6`) | 19.4+ — *avg RB6 weekly score* |
| Top 6 | 23.9+ (avg QB6) | | Top 12 | 14.5+ (avg RB12) |
| Top 12 | 19.5+ (avg QB12) | | Top 24 | 8.9+ (avg RB24) |
| — | | | Top 36 | 5.4+ (avg RB36) |
| **Bust** | 14.9 or fewer (avg QB18) | | **Bust** | 4.4 or fewer (avg RB40) |
| Other | between 14.9 and 19.5 | | Other | between 4.4 and 5.4 |

**"Boom" is not a number — it is the average weekly score of a rank slot at that position.** So the
columns are position-relative and self-labelling, and QB gets three tiers (compressed scoring) while RB
gets five (long tail). A `View` toggle switches all of them between **Percentages** and **Games**. Note
how closely those thresholds track the independent §1.5 table — that is two methods agreeing.

Rendering: a plain sortable numeric table. **No bars, no meters, no heat shading.** Logged out you see 8
rows, then a paywall fence.

**Start/Sit — the verdict is vote share, rendered as a donut, with no verdict word.** Two circular donut
gauges flank the centre: the winner's ring is **green at 100%**, the loser's **grey at 0%**, with
`7 of 7 experts` printed beneath. There is no "START" or "SIT" label anywhere — **the vote share is the
verdict.**

Below it, a **three-column mirrored comparison** — `[left value] [centred label] [right value]` — grouped
into cards: **Matchup** (opponent, matchup rating as 5 stars), **Odds** (game total O/U, receiving yards
O/U, rushing yards O/U), **Fantasy Points** (season total, season avg, projection avg, prior-year avg),
**Misc** (injury status, **weather**), plus gated Past-Performance-vs-Projection and Red Zone.

Two things there are genuinely excellent and almost nobody copies:

- **`Most Accurate Experts`** filter — `Top Overall Experts / Top WR,RB Experts / Top Player Experts`.
  *What would only the experts who are demonstrably good at this specific decision say?*
- **`Expert Ranks`** list — one row per expert, his rank for each player side by side, his outlet, and
  **how stale that ranking is** (`5 h`, `13 h`, `1 d`, `6 d`, `2 w`), sortable by
  `Last Updated / Overall Accuracy / Position Accuracy / Player Accuracy`. **Staleness is a first-class,
  visible attribute.** That is the single most honest detail on the site and the one most worth stealing.

There is also a `Can't decide? Spin the Wheel` — a deliberate coin-flip escape hatch, which is a real
acknowledgement that some decisions are genuinely 50/50.

**The expert accuracy leaderboard — they grade their own suppliers, in public.** At `/nfl/accuracy/`:
`RANK · EXPERT NAME · QB · RB · WR · TE · K · DST · IDP`, every cell being that expert's rank *within*
that position, all sortable, each name linking out to his own site, blanks where he doesn't rank a
position.

The methodology is unusually rigorous for a consumer product: rankings are snapshotted at TNF kickoff and
again 1pm Sunday; the graded player pool is the **union of Top-N in ECR and Top-N in actual points**, so
surprise studs *and* busts both count; each ranked slot converts to the historical average points for
that slot, and the **"Accuracy Gap"** is `|predicted slot points − actual points|` summed across the pool;
weekly gaps convert to **z-scores** so every week aggregates with equal weight; **each expert's worst week
is dropped** from Week 8 onward; Overall excludes K and DST as too noisy.

**And it feeds back into the interface** — the Start/Sit "Most Accurate Experts" card and the accuracy
sort options are driven by it. That closed loop is the aggregator's entire moat: it is the only party
positioned to grade everyone.

**Two craft patterns worth naming, because they generalise:**

- **Three-layer disclosure on every number, and no legends anywhere.** Nearly every mark is (i) a bare
  figure, (ii) an `sr-only` / `aria-valuetext` full sentence, and (iii) a `data-tooltip` full sentence:
  *"Ja'Marr Chase's ECR is 2 ranks better than his ADP"* · *"This is a good schedule for Ja'Marr Chase"* ·
  *"Weeks with 27.3+ points (avg QB3 weekly score)."* **The meaning travels with the mark.** There is no
  key the reader has to re-apply.
- **The meter's fill is keyed to good-for-the-user, not to the metric's direction.** A five-segment
  `role="meter"` with `aria-valuetext="4 out of 5"`, coloured `is-good` **#2ABB7F** / `is-average`
  **#868B95** / `is-bad` **#E2483D**. A *low* Bust score fills **green**; a *high* Bust score fills
  **red** — **the identical component, inverted by semantics rather than by value.** One meter, two
  opposite-polarity metrics, no legend, no reader arithmetic.

**What could not be verified** (auth- or paywall-gated — do not assume these exist in a given form): the
Trade Analyzer's verdict output (the first-party copy is only *"Know if you're winning the deal"*; the
Start/Sit donut is the likely vocabulary), and the synced Waiver Wire and Start/Sit assistants. Two brand
names in common circulation do **not** resolve: `/beat-the-consensus/` **404s**, and there is no
standalone Consistency report — it was absorbed into Boom or Bust.

### 8.5 The matchup / scoreboard screen

The most emotionally loaded screen in the product. Layout is a **mirrored two-column head-to-head**:

```
        MY TEAM              vs              OPPONENT
        104.6                                 97.2      ← live actual
        proj 121.4                        proj 118.9    ← projected final
        3 yet to play                     5 yet to play
   ───────────────────────────────────────────────────
   QB   J. Allen  @NYJ  24.6  |  QB   D. Maye  vs MIA  18.2
   RB   ...                   |  RB   ...
```

Slot-by-slot, **the two lineups are aligned on the same slot rows**, so the reader compares QB to QB and
RB to RB by eye. That alignment is the whole design.

The four elements that must be present:

1. **Live actual score** — big, the primary number
2. **Projected final** — smaller, directly beneath, and it *updates live* as games progress
3. **Players yet to play** — a count per side. This is the single most-checked number on the screen late
   on a Sunday, because it is what makes a deficit survivable or not
4. **Win probability** — a percentage, updated live. ESPN publishes it; Yahoo and Sleeper both show live
   projections. It is the number that gets screenshotted and posted in league chat

Beneath the head-to-head, a **league-wide scoreboard** listing every other matchup, so a manager can track
the standings race in the same view.

### 8.6 Draft room conventions

- **The draft board**: a grid, **teams as columns, rounds as rows**, filled left-to-right then
  right-to-left to reflect the snake. Picks appear as small cards with position color-coding. This grid is
  the canonical picture of a fantasy draft and every product renders it.
- **Position colour-coding** is a hard convention in draft rooms: each position gets a fixed hue used
  consistently across board, queue and player list. (Specific hues vary by product; the *practice* does
  not.)
- **Best available list**, sortable and filterable by position, with **ADP shown next to every player** so
  the drafter can see cost against the clock.
- **The queue** — a personal ordered shortlist the drafter maintains during the draft, with auto-draft
  fallback if the clock expires.
- **The pick clock** — a prominent countdown, plus "on the clock" and "you're up in N picks" states.
- **My Team panel** — the drafter's roster-so-far with unfilled slots visible, because the whole point is
  knowing what he still needs.

### 8.7 What each product does that the others don't

| Product | Distinctive |
|---|---|
| **Sleeper** | Mobile-first and **chat-first** — league chat, reactions and a social feed are the spine of the app, not a buried tab. Deepest format flexibility (dynasty, superflex, taxi squads, custom scoring, best ball). Cleanest visual language in the category. |
| **ESPN** | Editorial integration — analyst content, projections and news are first-class and appear inline on player rows. Publishes **%ROST / %ST** and their week-over-week deltas. FantasyCast for cross-league live viewing. |
| **Yahoo** | The most mature commissioner tooling and settings surface; distinctive `W/R/T` slot notation; half-PPR platform default; TE-premium now a first-class league setting. |
| **FantasyPros** | Not a host — an **aggregation and decision layer.** Syncs to your ESPN/Yahoo/Sleeper league and answers questions against your actual roster: Start/Sit assistant, Draft Wizard, My Playbook, waiver assistant, trade analyzer. Its real moat is not ECR — it is **publicly grading its own suppliers** (the expert accuracy leaderboard) and then feeding those grades back into the recommendations. Only the aggregator can do that. |

**The strategic read for a designer:** the hosts own the *transaction* (roster, lineup, scoring) and are
conservative because they serve tens of millions of casual users. FantasyPros owns the *decision* and is
where the interesting information design lives. Anything ambitious in this category competes with
FantasyPros, not with ESPN.

---

## 9. What a designer must never get wrong

The ten things that mark a product as built by someone who does not play. Every one of these is a mistake
a competent designer makes by default, because the correct answer is domain knowledge, not craft.

**1. Showing a fantasy point total without its scoring format.**
17.4 points means nothing until the reader knows whether receptions were counted, and at what rate. The
same player-week is 8.0 / 12.0 / 16.0 in standard / half / full PPR. Format is not a setting — it is part
of the number's definition. **Label it, globally or per-column, always.**

**2. Treating Superflex as a minor variant.**
The same quarterback moves from **pick 32 to pick 1.5** when one lineup slot changes. A valuation surface
that doesn't know the league's format is wrong for the entire QB position and for every trade involving
one. Format is a first-class input, not a preference.

**3. Using a generic stat table for all positions.**
QBs need completions/attempts, passing yards, TDs, INTs. RBs need carries and *targets*. WRs need targets
before receptions. Kickers need FG buckets by distance. One table for all of them is the fastest possible
way to signal you've never looked at a box score.

**4. Rounding fantasy points to whole numbers — or to two decimals.**
**One decimal place.** 17.4. Fractional scoring is universal, matchups are routinely decided by 0.3, and
"you lost by 0.42" is a real sentence people say. Rounding to integers destroys the outcome; two decimals
reads as a spreadsheet, not a scoreboard.

**5. Dropping the `@` / `vs` in the opponent cell.**
`@DAL` and `vs DAL` are different pieces of information and no product in the category omits the
distinction. Same for `BYE` — the opponent cell is where bye weeks live, and a blank cell reads as missing
data, not as a bye.

**6. Confusing %ROST with %ST, or inventing your own ownership metric.**
%ROST = rostered across all leagues. %ST = started, among *eligible* leagues. Different denominators,
different meanings, both published, both used. And the week-over-week **delta** on %ROST is what makes them
actionable — a static 47% tells you nothing that 47% (+22) doesn't tell you better.

**7. Getting "RB1" wrong.**
It means two things and both are correct. "He's an RB1" = a top-12 positional finisher. "He's the RB1 in
Denver" = the lead back on that depth chart. If your product computes the tier version, it must expose the
league size that produced it — ESPN's 10-team default makes RB1 the top 10, and the enthusiast standard of
12 makes it the top 12. Silently picking one and never saying which is how you lose credibility with the
only user who matters.

**8. Hiding the bye week.**
Bye is a permanent attribute of a player, displayed next to his team on every screen in the category. A
roster screen that doesn't warn a manager that his RB1 and RB2 share Week 11 — a week that removes 20% of
all draft-day value in 2026 — has failed at the one job a roster screen has.

**9. Building start/sit as a threshold rather than a comparison.**
The manager never asks "is 11.2 points good." He asks "him or him." Any surface that answers the first
question is answering a question nobody has. The same applies to trade evaluation: the question is not
"what is this player worth," it is "does this specific trade make my specific lineup better."

**10. Designing the week as uniform.**
It isn't. Tuesday is waiver-bid day, Wednesday ~3am is when they process, Thursday night locks a slice of
the roster irreversibly, Sunday 1pm locks the rest, Sunday afternoon is live scoring. The product's
information priority should change across those phases. A dashboard that shows the same thing on Tuesday
morning and Sunday at 4pm is showing the wrong thing at least once.

**Two more that are nearly as bad:**

**11. Using green/red verdict colour on projections or point totals.**
Fantasy points are not good or bad in isolation, and the category reserves green/red for *movement*
(rank up / rank down) and for *win/loss*. Colouring a projection green because it's high is inventing a
verdict the data doesn't support.

**12. Treating the absence of an injury badge as missing data.**
Healthy is the default state and it carries no ink. Nobody prints a green "OK" chip. If your empty state
looks like an error state, the 90% of rows that are fine will look broken.

**13. Printing a "consensus" without its sample size.**
On FantasyPros a **draft ranking is a consensus of 88 experts and a weekly ranking is a consensus of 8** —
both called ECR, both rendered identically. FantasyPros discloses the count in a sub-header on every page
(`Consensus of 88 Experts (148 available)`). A consensus number whose n is hidden is a confidence claim you
haven't earned, and hiding it is the difference between an aggregator and a wrapper.

**14. Showing a ranking or projection without its freshness.**
FantasyPros prints how stale each individual expert's rank is, per row, in the units people think in
(`5 h`, `13 h`, `1 d`, `6 d`, `2 w`), and lets you sort by it. In a domain where a Friday practice report
invalidates a Tuesday ranking, **a timestamp is not metadata — it is part of the value of the number.**

---

## Sources

**Scoring and formats**
[SportsDataIO NFL fantasy scoring](https://sportsdata.io/developers/fantasy-scoring-system/nfl) ·
[FantasyPros scoring settings](https://www.fantasypros.com/scoring-settings/) ·
[ESPN Fantasy Football 101: Settings](https://www.espn.com/fantasy/football/story/_/id/19540805/fantasy-football-101-settings) ·
[Yahoo default league settings](https://help.yahoo.com/kb/default-league-settings-fantasy-football-sln6489.html) ·
[Yahoo scoring overview](https://help.yahoo.com/kb/fantasy-football/overview-scoring-yahoo-fantasy-sln6868.html) ·
[Drafty Sports D/ST scoring comparison](https://draftysports.com/articles/you-deserve-better-defense-scoring) ·
[ProFootballNetwork on defensive scoring](https://www.profootballnetwork.com/how-does-defense-score-in-fantasy-football/) ·
[RotoWire PPR vs standard](https://www.rotowire.com/football/article/ppr-vs-standard-scoring-explained-94844) ·
[Bleacher Nation PPR vs half-PPR](https://www.bleachernation.com/fantasy-football/2026/08/12/ppr-vs-half-ppr/) ·
[4for4 on TE premium](https://www.4for4.com/2024/preseason/understanding-tight-end-value-te-premium-fantasy-leagues-ffpc) ·
[Yahoo TE premium launch](https://sports.yahoo.com/fantasy/article/tight-end-premium-is-here-one-of-your-most-requested-formats-now-on-yahoo-fantasy-125635476.html) ·
[DraftExpertPro superflex auction values](https://draftexpertpro.com/guides/superflex-auction-values)

**Positional value**
[FantasyPros 2025 stats — QB](https://www.fantasypros.com/nfl/stats/qb.php?scoring=PPR) ·
[RB](https://www.fantasypros.com/nfl/stats/rb.php?scoring=PPR) ·
[WR](https://www.fantasypros.com/nfl/stats/wr.php?scoring=PPR) ·
[TE](https://www.fantasypros.com/nfl/stats/te.php?scoring=PPR) ·
[YAFSB on VOR](https://yafsb.com/content/vor-value-over-replacement-fantasy-football/) ·
[Fantasy Football Analytics on VBD](https://fantasyfootballanalytics.net/2024/08/winning-fantasy-football-with-projections-value-over-replacement-and-value-based-drafting.html) ·
[Subvertadown on VBD baselines](https://subvertadown.com/article/guide-to-understanding-the-different-baselines-in-value-based-drafting-vbd-vols-vs-vorp-vs-man-games) ·
[PFF on replacement level](https://www.pff.com/news/the-value-of-replacement-level) ·
[Establish The Run — the RB dead zone](https://establishtherun.com/miller-the-running-back-dead-zone/) ·
[ETR — the death of the RB dead zone](https://establishtherun.com/the-death-of-the-running-back-dead-zone/) ·
[DraftSharks on tiers](https://www.draftsharks.com/article/fantasy-football-tiers) ·
[Fantasy Outliers — how many points are enough](https://medium.com/fantasy-outliers/how-many-points-are-enough-e3ef4a7d2411)

**ADP, rankings, tiers**
[FantasyFootballCalculator PPR ADP](https://fantasyfootballcalculator.com/adp/ppr) ·
[FFC 2QB ADP](https://fantasyfootballcalculator.com/adp/2qb) ·
[FantasyPros consensus ADP](https://www.fantasypros.com/nfl/adp/ppr-overall.php) ·
[FantasyPros 2026 draft rankings](https://www.fantasypros.com/nfl/rankings/) ·
[RotoWire ADP](https://www.rotowire.com/football/adp.php) ·
[NFFC ADP](https://nfc.shgn.com/adp/football) ·
[What is ECR](https://support.fantasypros.com/hc/en-us/articles/115001219327-What-is-ECR-Expert-Consensus-Rankings-and-how-do-you-calculate-it) ·
[Best and Worst rank](https://support.fantasypros.com/hc/en-us/articles/115001363408-What-is-Best-and-Worst-Rank) ·
[Draft accuracy methodology](https://www.fantasypros.com/about/faq/football-draft-accuracy-methodology/)

**In-season mechanics**
[Yahoo waivers](https://help.yahoo.com/kb/SLN6427.html) ·
[Yahoo playoff settings](https://help.yahoo.com/kb/SLN6528.html) ·
[ESPN waiver rules](https://www.espn.com/fantasy/football/ffl/story?page=fflruleswaiverwalk) ·
[ESPN playoff rules](https://www.espn.com/fantasy/football/ffl/story?page=fflrulesplayoffs) ·
[Sleeper waivers](https://support.sleeper.com/en/articles/3978868-waivers-for-regular-season-playoffs) ·
[Sleeper FAAB](https://support.sleeper.com/en/articles/1876040-how-does-faab-bidding-work) ·
[Sleeper consolation vs toilet bowl](https://support.sleeper.com/en/articles/2203534-consolation-bracket-vs-toilet-bowl) ·
[Sleeper — how fantasy playoffs work](https://sleeper.com/blog/how-do-fantasy-playoffs-work/) ·
[4for4 FAAB strategy](https://www.4for4.com/waiver-wire-faab-strategy) ·
[FantasyPros FAAB advice 2025](https://www.fantasypros.com/2025/08/fantasy-football-strategy-faab-waiver-wire-advice/) ·
[FantasyPros FAAB guide](https://www.fantasypros.com/2022/08/fantasy-football-faab-guide-strategy-2022/) ·
[FantasyPros streaming defenses 2026](https://www.fantasypros.com/2026/06/fantasy-football-draft-strategy-streaming-defenses-2026/) ·
[FantasyPros QB streaming 2026](https://www.fantasypros.com/2026/06/quarterback-streaming-fantasy-football-draft-strategy-targets-2026/) ·
[RotoWire DST streaming](https://www.rotowire.com/football/article/fantasy-football-defense-streaming-strategy-tips-95749) ·
[FantasyPros points allowed](https://www.fantasypros.com/nfl/points-allowed.php) ·
[FTN DVOA-adjusted points against](https://ftnfantasy.com/nfl/dvoa-points-against) ·
[SI on trade deadlines](https://www.si.com/fantasy/when-is-the-fantasy-football-trade-deadline-01jbwdbwqag8)

**2026 calendar**
[NFL.com Week 1](https://www.nfl.com/schedules/2026/by-week/week-1) ·
[Week 12](https://www.nfl.com/schedules/2026/by-week/week-12) ·
[Week 16](https://www.nfl.com/schedules/2026/by-week/week-16) ·
[Week 17](https://www.nfl.com/schedules/2026/by-week/week-17) ·
[NFL.com — every team's 2026 bye week](https://www.nfl.com/news/2026-nfl-schedule-release-every-team-bye-week) ·
[NFL Football Operations — 2026 important dates](https://operations.nfl.com/calendar-events/nfl-important-dates/) ·
[Wikipedia — 2026 NFL season](https://en.wikipedia.org/wiki/2026_NFL_season) ·
[FOX Sports — 2026 preseason schedule](https://www.foxsports.com/stories/nfl/2026-nfl-preseason-schedule-complete-dates-tv-channels-how-watch-streaming) ·
[Yahoo — 2026 fantasy game dates](https://football.fantasysports.yahoo.com/f1/gamedates) ·
[ESPN — 2026 bye week impact](https://www.espn.com/fantasy/football/story/_/id/48778888/fantasy-football-bye-week-scarcity-meter-weighing-impact-the-nine-bye-weeks-2026) ·
[Fantasy Life — Week 11 Byemageddon](https://www.fantasylife.com/articles/fantasy/2026-nfl-bye-weeks-for-fantasy-football-welcome-to-week-11-byema)

**Vocabulary**
[RotoWire glossary](https://www.rotowire.com/fantasy/football/glossary) ·
[ESPN Fantasy Football 101: Glossary](https://www.espn.com/fantasy/football/story/_/id/19541777/fantasy-football-101-glossary-how-play) ·
[Athlon glossary](https://athlonsports.com/fantasy/fantasy-football-glossary-key-terms) ·
[FantasyPros deep-stat glossary](https://www.fantasypros.com/fantasy-football-deep-stat-analysis-glossary-guide/) ·
[SnapCount glossary](https://snapcountff.com/glossary) ·
[Athlon on streaming](https://athlonsports.com/fantasy/fantasy-football-streaming-strategy-advice)

**Product conventions**
[ESPN 101: League and team pages](https://www.espn.com/fantasy/football/story/_/id/19541264/league-team-pages) ·
[FantasyPros rankings](https://www.fantasypros.com/nfl/rankings/) ·
[FantasyFootballCalculator ADP](https://fantasyfootballcalculator.com/adp/ppr) ·
[4for4 best 2026 league settings](https://www.4for4.com/2026/preseason/best-fantasy-football-league-settings-2026)
