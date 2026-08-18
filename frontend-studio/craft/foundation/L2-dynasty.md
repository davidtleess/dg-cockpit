# L2 — DYNASTY: what changes when the roster is permanent

**Scope.** This is Layer 2 of a four-layer foundation. Layer 1 (redraft fantasy — scoring, lineups,
waivers, start/sit) is assumed. Everything here is the **delta**: the machinery that only exists
because rosters carry over forever.

**Weighting.** The product serves one manager in a **12-team Superflex PPR dynasty, currently
rebuilding**. Sections 3, 4, 5 and 6 are weighted for him. The rest is general foundation.

**Dating.** Written 2026-08-17. The 2026 NFL season starts 2026-09-09; the 2026 NFL Draft and the
2026 dynasty rookie drafts have already happened. Every market number below is a **measurement with
a date**, not a constant — they move daily and some move hourly. Reproduction commands are given so
they can be re-run rather than trusted.

**Primary data pulled for this document** (all public, no auth):

```bash
# FantasyCalc — model values, superflex and 1QB, 12-team, full PPR, dynasty
curl -s "https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=2&numTeams=12&ppr=1" > fc_sf.json
curl -s "https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=1&numTeams=12&ppr=1" > fc_1qb.json

# KeepTradeCut — crowdsourced values; the full 500-row array is inline in the page JS
curl -s -A "Mozilla/5.0" "https://keeptradecut.com/dynasty-rankings" > ktc.html
#   then: json.loads(re.search(r'var playersArray = (\[.*?\]);', html, re.S).group(1))

# DynastyProcess — ECR-derived values, weekly, in git
curl -s "https://raw.githubusercontent.com/dynastyprocess/data/master/files/values.csv"
curl -s "https://raw.githubusercontent.com/dynastyprocess/data/master/files/values-picks.csv"
```

---

## 1. What dynasty is, and how it differs from redraft

### 1.1 The one structural change everything else follows from

In redraft every team starts from zero each August. In dynasty **you keep your entire roster
forever**; the only new supply each year is the incoming rookie class and free agency
([League Tycoon](https://leaguetycoon.com/learn/what-is-dynasty-fantasy-football/),
[Fantasy Footballers, Dynasty 101](https://www.thefantasyfootballers.com/dynasty/dynasty-101-a-different-kind-of-fantasy-football-league/)).

Consequences that a designer must internalise:

| Redraft assumption | Dynasty reality |
|---|---|
| A player's value = his rest-of-season points | Value = a stream of future seasons, discounted for age and risk |
| The season is the unit | The **asset lifecycle** is the unit; seasons are episodes in it |
| Everyone is trying to win this year | At any moment ~a third of the league is trying to *lose* this year |
| Draft = one event per year, same for all | **Two different drafts exist** and they are not the same thing |
| Bad team = bad manager | Bad team may be a correctly executing rebuilder |
| Trades are player-for-player | Trades routinely include picks two and three years out |

### 1.2 Startup draft vs rookie draft — the distinction that matters most

These are two entirely different events and conflating them is the single most common way a fantasy
UI reveals it was built by someone who has only played redraft.

| | **Startup draft** | **Rookie draft** |
|---|---|---|
| Frequency | **Once, ever** — at league creation | **Every year, forever** |
| Player pool | Every NFL player, veterans and rookies | **Only the incoming rookie class** |
| Rounds | ~20–30, to fill entire rosters | Typically **3–5** ([Fantasy Footballers](https://www.thefantasyfootballers.com/dynasty/dynasty-101-a-different-kind-of-fantasy-football-league/)) |
| Order | Random / auction / snake | **Reverse order of last year's standings**, usually **linear** (not snake) — the last-place team picks first *in every round* ([RotoBaller](https://www.rotoballer.com/intro-to-dynasty-fantasy-football/1153923), [Footballguys forum](https://forums.footballguys.com/threads/dynasty-rookie-drafts-snake-or-straight.757153/)) |
| Timing | Any time; May recommended if it includes rookies | Days-to-weeks after the **NFL Draft** (so: May) |
| Its picks are tradeable | Rarely relevant after year 1 | **Yes, years in advance — this is the core currency of dynasty** |

Two variants worth knowing because they appear in league settings and in ADP data:
- **3RR (third-round reversal)** — startup rounds 1–2 snake, round 3 flips so the 1.01 holder picks
  last, snake thereafter. Compensates the top of the startup ([DLF forum](https://forum.dynastyleaguefootball.com/viewtopic.php?t=180210)).
- **Dispersal draft** — when a league absorbs an abandoned ("orphan") roster, its assets are
  redrafted ([Commission Impossible](https://commissionimpossible.substack.com/p/dynasty-dispersal-drafts-explained)).

**Design implication.** "Draft" is not one noun in this product. A rookie-draft board shows ~36–60
prospects and pick ownership across 12 teams; a startup board shows 300+. They need different
surfaces. A UI that says "Draft" and means one of them will be wrong half the year.

### 1.3 Taxi squad

A holding area for developmental players who do not count against the active roster.

- **Purpose:** stash a rookie you cannot start yet without paying a bench spot for him.
- **Eligibility:** normally **rookies only**; some leagues extend to 2nd-year or all players.
  Sleeper exposes this as an experience cap of **1–4 years or "No Max"**, plus an "allow non-rookies"
  toggle ([Sleeper support](https://support.sleeper.com/en/articles/3640482-how-do-taxi-squads-work)).
- **Slots:** Sleeper allows **0 to 10**; most leagues run **2–5**
  ([Sleeper support](https://support.sleeper.com/en/articles/3640482-how-do-taxi-squads-work), [Bleacher Nation](https://www.bleachernation.com/fantasy-football/2025/07/28/taxi-squad-fantasy-football/)).
- **Hard rules that generate UI states:** a player **cannot go straight from waivers to taxi** — he
  must land on the active roster or bench first. Years of experience **flip at the end of the NFL
  season, not weekly**. There is a **lock deadline**: after it, a player can be promoted off taxi
  but can **never go back** ([Sleeper support](https://support.sleeper.com/en/articles/3640482-how-do-taxi-squads-work)).
- A taxi player **cannot be started**. Some platforms/leagues permit "taxi raiding"; Sleeper does not.
- **Aging out is a real, dated event.** If taxi years = 3, a rookie must be promoted in year 4 or the
  manager is **locked out of lineup changes and adds** ([Sleeper support](https://support.sleeper.com/en/articles/3640482-how-do-taxi-squads-work)).
  That is a deadline a product should surface and almost none do.

### 1.4 Roster size and IR

- Redraft: ~13–16 total spots. **Dynasty: 20–30**
  ([PlayerProfiler](https://www.playerprofiler.com/article/what-is-a-dynasty-league/)); Footballguys
  calls 25–30 typical ([Footballguys](https://www.footballguys.com/article/2023-dynasty-introduction)).
- A frequently cited 12-team configuration: **24 active + 2 taxi + 2 IR**
  ([DLF forum](https://forum.dynastyleaguefootball.com/viewtopic.php?t=193747)).
- Rule of thumb: bench ≈ 1.5–2× starters ([DLF forum](https://forum.dynastyleaguefootball.com/viewtopic.php?t=230117)).
- **IR slots exist to hold injured assets you would never cut.** In redraft you drop an injured
  player; in dynasty you cannot, because he is an owned asset with future value. IR is therefore
  load-bearing, not a convenience.

**Design implication.** A dynasty roster surface is a **~30-row table with four distinct
compartments** (starters / bench / taxi / IR), not a 15-row lineup card. Anything that treats the
roster as "your lineup plus a few spares" is the wrong shape.

---

## 2. Rookie draft picks as assets

### 2.1 Notation

`R.PP` — round dot pick. **1.01** = first pick of round 1 (first overall). **2.05** = fifth pick of
round two ([RotoBaller](https://www.rotoballer.com/dynasty-primer-1-how-to-value-dynasty-draft-picks/1343067),
[Dynasty Nerds](https://www.dynastynerds.com/dynasty/dynasty-trade-secrets-understanding-draft-pick-values/)).
Always zero-padded to two digits on the right. In a 12-team league the round rolls at 12, so 1.12 is
immediately followed by 2.01.

**Before the order is known**, picks trade by *year + round + tier*: `2027 1st`, `2027 Early 1st`,
`2028 Mid 2nd`. KeepTradeCut publishes exactly this vocabulary — Early / Mid / Late × round × year —
and its Power Rankings default all unknown future picks to **"Mid"**
([KTC FAQ](https://keeptradecut.com/frequently-asked-questions)). FantasyCalc publishes both the
numbered form (`2026 Pick 1.01`) and the tiered form (`2027 1st (Early)`).

**Design implication.** Pick identity is a **compound key** (year, round, slot-or-tier, original
owner) and its display name changes as the season resolves: `2027 1st (Mid)` → `2027 1.05` → spent.
The original owner never stops mattering — a rebuilding team's 2027 1st and a contender's 2027 1st
are different assets with the same label.

### 2.2 The value curve is steep, convex, and front-loaded

Measured 2026-08-17, FantasyCalc superflex, 12-team PPR, current-year picks as % of the 1.01:

| Pick | 1.01 | 1.04 | 1.08 | 1.12 | 2.01 | 2.04 | 2.08 | 2.12 | 3.01 | 3.08 | 3.12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| % of 1.01 | 100% | 55% | 38% | 31% | 30% | 26% | 22% | 19% | 18% | 15% | 13% |

The 1.01 is worth **1.49× the 1.02** and **3.18× the 1.12**. Community framing agrees: "the two picks
with far more value than any other are the 1.01 and 1.02"
([Advanced Sports Logic](https://advancedsportslogic.com/nfl/4312-dynasty-rookie-draft-picks-value-analysis)).

### 2.3 Round boundaries — the honest version

The folk claim is that round boundaries are cliffs. **The market does not price them that way.**
Measured on the same FantasyCalc pull:

- 1.12 → 2.01: **−5.3%**
- 2.12 → 3.01: **−3.3%**

Adjacent picks across a round boundary are priced almost continuously. What *is* step-shaped is the
**outcome distribution**, and the two do not line up:

| Round | Hit rate | Source |
|---|---|---|
| Round 1 | **47.6%** ever produce a hit season; **~30%** when one-season flukes are removed | [NBC Sports / Rotoworld, 504 picks, 2010–2017](https://www.nbcsports.com/fantasy/football/news/article-numbers-dynasty-rookie-pick-hit-rates) |
| Round 2 | **~31%** produce at least one countable season | same |
| Round 3+ | **24 of 336 = 7%** | same |
| Any round, *rookie* year | **30 of 504 = 6%** | same |

Definition of "hit" in that study: **at least one season as a top-12 QB/TE or top-24 RB/WR**, in
six-round 12-team PPR drafts. Round 3 in dynasty is close to a lottery ticket; a corroborating
narrower cut puts **third-round WRs below a 17% hit rate since 2015**
([Fantasy Footballers](https://www.thefantasyfootballers.com/dynasty/dynasty-trade-windows-timing-the-market-fantasy-football/)).

A second study using a different frame reaches the same shape from a different angle: **29 of the top
42 dynasty-relevant players were taken with the top 15 picks (i.e. through ~2.03), versus 6 taken
from 2.04 through 3.12** ([Advanced Sports Logic](https://advancedsportslogic.com/nfl/4312-dynasty-rookie-draft-picks-value-analysis)).
A live explorer with 2017–2025 classes and configurable top-12/24/36 thresholds is at
[StatChasers](https://statchasers.com/nfl/rookie-hit-rates/).

**So why do round boundaries matter?** Three reasons, none of them price discontinuity:
1. **Before the order is set**, "a 2027 1st" is the tradeable unit. Rounds are the *only* granularity
   available until standings resolve, so the negotiation vocabulary is round-shaped.
2. **Ownership is round-shaped.** You own "their 2nd", not "pick 19".
3. **Outcomes are round-shaped even when prices are not** — which means a market that prices 1.12 and
   2.01 within 5% of each other is a market a designer can point at and question.

**Design implication.** This is a genuinely good thing to *show*: overlay the smooth price curve on
the step-shaped hit-rate curve. It is the kind of disagreement between two published series that a
picture settles instantly and prose never does.

### 2.4 The recency premium — and the exception, which is live right now

The convention: **nearer picks are worth more**, because uncertainty compounds and because a player
acquired with a 2026 pick contributes two years before one acquired with a 2028 pick. Published
discount schedules cluster around **15–20% per year of distance**
([War Room](https://dynastytradegenerator.com/guides/dynasty-draft-pick-values)), with one framing
of "~10% at 12 months, 25–30% at 24 months, half-price or worse at three years"
([Dynasty Blueprint](https://dynastyblueprint.gg/learn/how-to-value-dynasty-draft-picks)).

Measured, FantasyCalc superflex generic firsts, 2026-08-17:

| | 2026 1st | 2027 1st | 2028 1st | 2029 1st |
|---|---|---|---|---|
| Value | 3130 | 2851 | 2071 | 1855 |
| vs prior year | — | ×0.91 | ×0.73 | ×0.90 |

**But the exception is not rare, and it is active today.** KeepTradeCut, same day:

| KTC superflex | 2026 | 2027 | 2028 |
|---|---|---|---|
| Early 1st | 5574 | **6957** | 5217 |
| Mid 1st | 4730 | **5472** | 4588 |

**2027 firsts outprice 2026 firsts.** Two forces, both real:
1. **Class strength.** The 2026 class is widely called "weak and top-heavy"; the 2027 class is
   anticipated as strong, and managers are actively hoarding 2027 capital
   ([Fantasy Life](https://www.fantasylife.com/articles/dynasty/how-to-value-the-101-in-2026-dynasty-rookie-drafts-sell-high),
   [PlayerProfiler](https://www.playerprofiler.com/article/dynasty-strategizing-a-rebuild-post-2026-nfl-draft/)).
2. **Calendar.** It is August 2026; the 2026 rookie draft is spent. A "2026 pick" is a near-dead
   asset in most leagues, while a 2027 pick is at the start of its appreciation run.

**Design implication.** Never hard-code "sooner = more". Recency is a *default that the market
overrides*, and when it overrides it, that inversion is itself the signal a rebuilder wants to see.
A pick-value surface that cannot render "2027 > 2026" is broken by construction.

### 2.5 Other pick-value modifiers a product will meet

- **Whose pick it is.** "The most overlooked factor" — a first from a 1-6 team is not the same asset
  as a first from a 6-1 team ([War Room](https://dynastytradegenerator.com/guides/dynasty-draft-pick-values)).
- **Protections.** A top-3-protected first trades at roughly **20–30% below** an unprotected one (same source).
- **Format.** Superflex lifts first-round picks; TE-premium lifts TE prospects; deeper leagues lift
  2nds and 3rds (same source).
- **Uncertainty is publishable.** DynastyProcess's `values-picks.csv` ships `ecr_high` / `ecr_low`
  alongside the consensus — e.g. 2026 Pick 1.01 in superflex: ECR 10.03, high 0.70, low 38.03. That
  is an interval wide enough that drawing it changes what a manager concludes.

---

## 3. Contend vs rebuild

### 3.1 The diagnosis

There are three states, and the third is a trap.

| State | What it means | What it does |
|---|---|---|
| **Contend** | Realistic title shot **this** season | Convert future assets into present production |
| **Rebuild** | No realistic shot for 2+ seasons | Convert present production into future assets |
| **Purgatory / "the middle"** | Good enough to miss top-3 picks, not good enough to win | Nothing — and pays for it every year |

Purgatory is the named villain of dynasty strategy: *"the absolute worst spot in a dynasty league"* —
good enough to avoid premium rookie picks, not good enough to threaten for a title
([DraftSharks](https://www.draftsharks.com/article/escape-fantasy-purgatory-with-this-dynasty-strategy),
[CBS Sports](https://www.cbssports.com/fantasy/football/news/dynasty-fantasy-football-mailbag-trade-etiquette-escaping-the-middle-and-deebo-samuels-trade-value/)).
The mechanism: half-measures accumulate. You never sell, because selling feels like quitting; you
never buy hard, because buying feels reckless. Both timelines rot.

**The decision has a deadline.** The standing advice is that **by roughly Week 5–6 you should know
which you are**, and that the honest answer is usually visible earlier than managers admit
([DraftSharks](https://www.draftsharks.com/article/escape-fantasy-purgatory-with-this-dynasty-strategy)).
"If you're not contending by Week 6-8..." is how the sell advice is phrased
([Dynasty Dealmaker](https://www.dynastydealmaker.com/blog/dynasty-calendar)).

### 3.2 "Retooling" — the legitimate middle

Retooling is *not* purgatory. The difference is direction and speed:

- **Rebuild:** tear down, accept 2–3 bad years, accumulate picks and 22-year-olds.
- **Retool:** stay competitive while swapping the aging core out — sell a 28-year-old producer for a
  24-year-old producer plus a pick, without ever bottoming out.
- **Purgatory:** neither, by default rather than by choice.

The tell is whether the manager can name the target year. A retooler says "2027". A purgatory team
says "we'll see."

### 3.3 What a rebuilder does — the operating manual

**Sell:**
- Productive veterans, especially **RB 27+ and WR 29+**, and sell them **in-season while they are
  scoring** ([Dynasty Dealmaker](https://www.dynastydealmaker.com/blog/dynasty-calendar)).
- Sell *slightly under* perceived value rather than hold — "once playoffs start, the buying market
  vanishes and their trade leverage evaporates" (same source).
- Sell the current-year 1.01 in a weak class. Live example: in 2026 the 1.01 was argued to fetch
  "a top-six pick this season **and** a future 2027 1st" — and taking that is called a no-brainer for
  a rebuilder ([PlayerProfiler](https://www.playerprofiler.com/article/dynasty-strategizing-a-rebuild-post-2026-nfl-draft/)).

**Buy:**
- **Future picks, in the discounted year.** The specific rebuilder's edge available right now: while
  the whole league bids up 2027 capital, **2028 picks are cheap** — and a contender's projected late
  2027 1st can become an early 2028 1st as their roster ages
  ([PlayerProfiler](https://www.playerprofiler.com/article/dynasty-strategizing-a-rebuild-post-2026-nfl-draft/)).
- **Injured and sidelined players**, whose value is at a floor and whose timeline matches yours
  ([Dynasty Nerds](https://www.dynastynerds.com/dynasty/week-10-fantasy-football-trade-advice-buy-low-sell-high/)).
- Young WRs over young RBs, because the WR window is longer (§5).
- The honest caveat: the obvious young blue-chippers are **not** rebuild bargains — "everyone else
  wants them, because their redraft value is nearly equal to their dynasty value"
  ([PlayerProfiler](https://www.playerprofiler.com/article/dynasty-strategizing-a-rebuild-post-2026-nfl-draft/)).
  A rebuilder's real edge is in assets whose *redraft* value is depressed.

**Timeline:** "a rebuild can be done in a year if you are incredible at trades and drafting, but most
of the time it'll take two to three years"
([King Fantasy Sports](https://www.kingfantasysports.com/when-and-how-to-tear-it-down-and-enter-a-rebuild-in-dynasty/)).

**Failure mode:** *"Playing it safe in a rebuild is a really effective way to get stuck in the middle
again"* — the rebuild must take concentrated risk, not diversify into mediocrity (same source).

**The etiquette line.** Deliberately fielding a weak lineup to secure the 1.01 has a polite name —
**"productive struggle"** ([Footballguys](https://www.footballguys.com/article/2023-dynasty-introduction)) —
and an impolite one, tanking. It is contested in most leagues. A product that appears to *coach*
tanking will be read as taking a side; a product that simply reports "your realistic 2027 pick range
is 1.02–1.05" is reporting.

**Design implication.** Contend/rebuild is not a preference toggle buried in settings — it is **the
axis every other number should be read against**. FantasyCalc already treats it as first-class with
contender/rebuilder modes that reweight age and picks. The stronger move is that the app should be
able to *tell* the manager which he is, from his own roster's age curve and pick holdings, rather
than asking him.

---

## 4. The trade calendar

Dynasty value is seasonal in a way redraft value is not, and it repeats *"like clockwork each year"*
([Dynasty Dealmaker](https://www.dynastydealmaker.com/blog/dynasty-calendar)).

| Window | Picks / youth | Veterans | Rebuilder's move |
|---|---|---|---|
| **Jan (playoffs)** | Rookie pick value *"drops off a cliff"* briefly, then hype restarts | Temporary bump | Start acquiring next-year picks |
| **Feb (combine, coaching hires)** | Rising; ~90% of peak by March | Falling | Sell picks into rising hype |
| **Mar (free agency)** | Rising | Landing-spot winners bump | Sell picks; buy displaced vets cheap |
| **Apr (NFL Draft)** | **Peak — "maybe 120%"** of baseline | Trough; *"veterans become undervalued"* | **Sell picks. Buy veterans.** |
| **May (rookie drafts, landing spots)** | Rookie RB/WR spike on situation | Depth vets fall | Sell rookie hype immediately |
| **Jun–Jul (dead period)** | 2nd/3rd-year breakout candidates rise | Camp-risk vets fall | Quiet accumulation |
| **Aug (camp/preseason)** | Preseason standouts spike | Injured/fading vets crater | Buy the injured |
| **Sep–Oct (season)** | **Picks go cheap — "out of sight, out of mind"** | Producers spike as contenders panic | **Buy picks. Sell producers.** |
| **Nov (trade deadline, ~Wk 8–12)** | Picks at their annual discount | **Veteran peak — contenders pay playoff premiums** | **The single best selling window for aging vets** |
| **Dec (fantasy playoffs)** | Illiquid | Eliminated teams' vets dumped | Buy from the eliminated |

Key numbers and quotes:
- Peak pick value in April, *"sometimes inflated by 120%+ of their offseason baseline"*
  ([Dynasty Dealmaker](https://www.dynastydealmaker.com/blog/dynasty-calendar));
  corroborated as *"Highest Value… maybe 120%"*
  ([Fantasy Footballers](https://www.thefantasyfootballers.com/dynasty/dynasty-trade-windows-timing-the-market-fantasy-football/)).
- Buy picks **September–November**; sell picks **February–April**
  ([Dynasty Dealmaker](https://www.dynastydealmaker.com/blog/dynasty-calendar)).
- Most leagues close trades around **Week 13–14** ([Dynasty Nerds](https://www.dynastynerds.com/dynasty/week-10-fantasy-football-trade-advice-buy-low-sell-high/)).
- *"Rookie fever"* — around rookie drafts, managers cut useful veterans to clear roster space for
  unproven prospects, producing genuine free-agent bargains
  ([Fantasy Life](https://www.fantasylife.com/articles/dynasty/dynasty-fantasy-football-startup-league-strategy-beware-of-rooki)).

**Why late-season vet-selling works.** It is not that the veteran got better. It is that in November
the *buyer pool* changes: four or five managers with live title odds are competing for the same
finite supply of proven production, and their alternative — a pick that pays off in 2028 — is
worthless to them. The rebuilder is selling into a demand spike he does not share.

**Design implication.** The calendar is **the most under-served surface in every dynasty product I
looked at.** All of them price assets *now*. None of them says "this asset is 8 weeks from its annual
peak." For a rebuilder, whose entire edge is timing rather than evaluation, a value chart without a
seasonal overlay is missing the axis he actually trades on.

---

## 5. Aging curves and windows

### 5.1 Peak and decline by position

| Position | Peak | Decline | Sources |
|---|---|---|---|
| **RB** | ~24–26; mean peak age **25.5** | Sharpest; *"peaks earlier, spikes higher, collapses faster"* | [The Dynasty Edge, EPA 2014–2024](https://thedynastyedge.com/2025/06/21/nfl-age-curve-study-epa-trends-by-position-rb-wr-te-qb-fantasy-football-analysis-2014-2024/) |
| **WR** | ~25–28; mean peak age **27.0**; top-24 PPR WRs average **26.8** | Broad plateau 26–30, value into early 30s | [Dynasty Edge](https://thedynastyedge.com/2025/06/21/nfl-age-curve-study-epa-trends-by-position-rb-wr-te-qb-fantasy-football-analysis-2014-2024/), [PFF, 12 yrs / 85 WRs](https://www.pff.com/news/fantasy-football-dynasty-age-tendencies-of-the-top-wide-receivers) |
| **TE** | Late breakout; best receiving EPA at **27–30** | Holds to 32–33; older TEs have *increased* production over 20 yrs | [Dynasty Edge](https://thedynastyedge.com/2025/06/21/nfl-age-curve-study-epa-trends-by-position-rb-wr-te-qb-fantasy-football-analysis-2014-2024/), [FTN](https://ftnfantasy.com/nfl/the-aging-curve-how-to-approach-over-30-options-in-fantasy-football) |
| **QB** | Rises from ~25, peaks **28–33**; windows commonly **27–34** | Slowest of all; the longest asset life in the game | [Dynasty Edge](https://thedynastyedge.com/2025/06/21/nfl-age-curve-study-epa-trends-by-position-rb-wr-te-qb-fantasy-football-analysis-2014-2024/), [unanswered.io](https://unanswered.io/guide/nfl-player-peak-performance-age) |

**WR breakout timing is the sharpest single fact for a rebuilder:** of first-time top-24 WRs,
**73% got there by age 25 and 93% by age 27**; only 6 of 85 debuted at 28+
([PFF](https://www.pff.com/news/fantasy-football-dynasty-age-tendencies-of-the-top-wide-receivers)).
Buying a 28-year-old WR "about to break out" is buying into a 7% base rate.

### 5.2 The "age cliff" convention — and how contested it is

The folk rule is **"cash out on RBs at 26."** A 2015–2025 study of same-player year-over-year PPG
change (nflverse, min. 8 games in both seasons) says the rule is off by a year:

| RB age in year one | n | Median PPG change next year | Share declining |
|---|---|---|---|
| 22 | 55 | +3.9% | 45.5% |
| 23 | 87 | −2.3% | 50.6% |
| 24 | 97 | −2.7% | 51.5% |
| 25 | 93 | −7.1% | 63.4% |
| **26** | 62 | **+0.4%** | 50.0% |
| **27** | 52 | **−22.3%** | **71.2%** |
| 28 | 43 | −16.1% | 60.5% |
| 30 | 17 | −30.4% | 70.6% |
| 31 | 10 | −29.8% | 90.0% |

Source: [Fantasy Football Blueprint](https://www.fantasyfootballblueprint.com/2026/08/10/32-the-running-back-age-cliff/).
Conclusion: *"The real break is the 27-to-28 transition"*; age 26 sits **inside the flat part of the
curve**. Note that even at the cliff, ~29% of RBs *improve* — the cliff is a distribution shift, not
a switch.

**The convention is real as market behaviour even where it is wrong as prediction.** Cornerstone
frameworks routinely encode hard age gates — under 26 for WR/RB, 28 for TE, 30 for QB
([Football Scout 365](https://www.footballscout365.com/post/2026-dynasty-superflex-rankings-full-tiered-breakdown-by-age-production-trade-values)) —
and sell triggers at "RB 27+, WR 29+" ([Dynasty Dealmaker](https://www.dynastydealmaker.com/blog/dynasty-calendar)).
A manager trades against other managers who believe the cliff, so the cliff prices assets whether or
not it predicts them.

### 5.3 Measured: what the market's age discount actually looks like

FantasyCalc publishes a dynasty value *and* a redraft value for the same player on the same day.
Ranking the same population both ways isolates the pure age effect, scale-free. Population: players
in the top 120 by **redraft** value (so, all currently productive), 12-team superflex PPR, 2026-08-17.

**Median (redraft rank − dynasty rank); positive = the dynasty market ranks him *higher* than his
current production alone justifies:**

| Age | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 |
|---|---|---|---|---|---|---|---|---|---|
| Spots | **+18** | +12 | +2 | 0 | −2 | −10 | **−21** | −18 | **−23** |
| n | 9 | 9 | 16 | 15 | 19 | 16 | 7 | 10 | 6 |

By position (n≥3 only):

| Pos | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 |
|---|---|---|---|---|---|---|---|---|---|
| RB | +15 | +5 | 0 | −2 | −11 | −18 | −27 | −28 | — |
| WR | +30 | +16 | +15 | 0 | −1 | −2 | — | — | −24 |
| QB | — | — | +2 | — | −5 | — | — | −11 | — |

Reproduce: rank the `fc_sf.json` population by `value` and by `redraftValue`, subtract, group by
`player.maybeAge`, median.

Read it: the dynasty premium **crosses zero at ~24–25 for RBs and ~25–26 for WRs**, and the RB
penalty deepens roughly twice as fast thereafter. That is the aging-curve literature reproduced
directly out of live market prices, and it is monotonic — unlike the raw dynasty/redraft *value
ratio*, which I also computed and discarded: the two scales are normalised independently, so the
ratio is confounded and non-monotonic. Ranks are the comparable instrument here; values are not.

### 5.4 Why the *manager's* timeline outranks the player's absolute value

This is the point the whole layer turns on. A 27-year-old RB has a value. A **rebuilder targeting
2028 has no use for it at any price**, because the asset's productive window closes before his
contention window opens. Conversely a 21-year-old rookie is worth *more* to him than his market price
implies, and a contender should not want him at market.

So a single global value number is **not a decision**. The same asset carries a different value to
each of the twelve teams depending on their target year, which is exactly why trades happen at all.
Any product showing one number per player is showing the *midpoint of a distribution it has the
information to split*.

---

## 6. Superflex specifically

### 6.1 What it is

A flex slot that additionally accepts a QB. Because QBs outscore every other position, ~every team
starts two. Demand for QBs roughly doubles; **supply does not change** (32 starters, ~24 of them
useful). That scarcity, not any scoring change, is the entire effect.

### 6.2 The magnitude — measured three ways, with an important disagreement

Same day (2026-08-17), three ecosystems, top-24 QBs:

| Source | How values are made | Median QB value ratio SF ÷ 1QB | Median non-QB ratio SF ÷ 1QB |
|---|---|---|---|
| **KeepTradeCut** | Crowdsourced, **two independent databases** | **×1.17** | **×0.82** (WR .82, RB .82, TE .84) |
| **FantasyCalc** | Model over real trades | **×1.88 — identical for every QB** | ~×0.9 |
| **DynastyProcess** | Derived from FantasyPros ECR | **×2.79** | ×0.76 |

Three published "QB premiums" spanning **1.17× to 2.79×**. They are not measuring the same thing:
KTC's scale saturates at 9999 (its top four players are 9974–9999), which compresses ratios at the
top; FantasyCalc's exactly-constant 1.88 is a **positional multiplier applied by the model**, not a
re-derived market. Only KTC re-crowdsources superflex from scratch, which is why only KTC shows the
mirror effect: **in superflex every non-QB is worth ~18% less**, because value is a share of a fixed pie.

**Now the instrument check.** Convert to rank displacement, which is scale-free:

| Source | Median overall-rank gain for a top-24 QB moving 1QB → superflex |
|---|---|
| FantasyCalc | **+42 spots** (range +17 to +58) |
| KeepTradeCut | **+40 spots** (range +7 to +53) |
| DynastyProcess / FP ECR | **+45 spots** (range +4 to +79) |

**The three sources that disagree by 2.4× on value agree within 5 spots on rank.** That is the single
most useful methodological finding in this document: *dynasty values are not comparable across
sources; dynasty ranks largely are.*

Concrete: Josh Allen is **QB1 and overall #1–3 in superflex, and roughly overall #10–18 in 1QB**
across sources. Justin Herbert: **#21 SF vs #58–63 in 1QB**.

### 6.3 How it reshapes the board

Positional mix of the top N assets (players only, picks excluded), 2026-08-17:

| | Top 12 | Top 24 | Top 36 |
|---|---|---|---|
| **FantasyCalc SF** | QB 5, RB 2, WR 4, TE 1 | QB 7, RB 7, WR 8, TE 2 | QB 12, RB 9, WR 11, TE 4 |
| **FantasyCalc 1QB** | QB 0, RB 5, WR 6, TE 1 | QB 1, RB 11, WR 9, TE 3 | QB 3, RB 14, WR 15, TE 4 |
| **KTC SF** | QB 4, RB 3, WR 4, TE 1 | QB 7, RB 7, WR 8, TE 2 | QB 12, RB 8, WR 12, TE 4 |
| **KTC 1QB** | QB 1, RB 4, WR 6, TE 1 | QB 2, RB 8, WR 11, TE 3 | QB 3, RB 11, WR 18, TE 4 |

In a 12-team superflex, **24 QB roster spots must be filled from ~32 NFL starters.** Startup drafts
reflect it: reported mocks have **nine QBs in round 1 and thirteen in the first two rounds**
([CBS Sports](https://www.cbssports.com/fantasy/football/news/dynasty-fantasy-football-superflex-startup-mock-draft/)),
and the standing advice is that if you miss the elite QB tier in round 1 you **will** overpay later
([DLF](https://dynastyleaguefootball.com/2026/08/08/2026-startup-dynasty-draft-superflex-1-2-combo-strategy/)).
Auction evidence points the same way: elite QB1s at **$42–65 in 12-team superflex half-PPR vs $14–22
in 1QB**, a 2.5–3× premium ([Draft Expert Pro](https://draftexpertpro.com/guides/superflex-auction-values)).

### 6.4 What it means for a rebuilder specifically

QBs have the **longest window of any position** (peak 28–33) and the **slowest decay**. So the usual
"sell the old guys" rebuild reflex is wrong at QB: a 27-year-old QB is still inside his prime when a
2028-target rebuild matures. Conversely, elite young QBs are the most expensive assets in the game
and the hardest to buy at a discount — which is why the pattern for rebuilders is to acquire QBs
through **rookie picks and 2nd-tier veterans**, not by bidding on the top tier.

**Design implication.** Superflex is not a settings checkbox. It reorders the entire board, changes
which position "scarce" applies to, and — because sources disagree on QB values by up to 2.4× —
determines whether a trade reads as fair or as robbery depending purely on which source the app
happens to use. **The value source must be visible on any superflex trade surface.**

---

## 7. The dynasty value ecosystem

| Product | Method | Format defaults | Scale | Cadence | Distinctive |
|---|---|---|---|---|---|
| **[KeepTradeCut](https://keeptradecut.com/)** | **Crowdsourced** — users rank 3 players Keep/Trade/Cut; adapted **ELO** consolidates | **Superflex, .5 PPR, 12-team**; separate 1QB DB; TE-premium tiers Off/TE+/TE++/TE+++ | ~0–9999, **saturating at the top** | **Continuous** — "updated 9 minutes ago"; 26,563,782 data points | Liquidity score, trade database, live KTC feed, league sync |
| **[FantasyCalc](https://fantasycalc.com/)** | **Model** over real trades (~1–2M) run through an optimisation algorithm | Configurable: 1QB/SF, PPR, 8–16 teams, TEP, **contender/rebuilder modes** | Uncapped (top asset 10411 on 2026-08-17) | Every ~3 hours in season | Publishes **redraft and dynasty values side by side**; free JSON API |
| **[DynastyProcess](https://dynastyprocess.com/)** | **Derived** from FantasyPros **ECR** | 1QB and 2QB/SF columns; 6–32 teams | ~0–10000 | Weekly, via GitHub Actions | Fully **open data in git**; publishes ECR **high/low dispersion**; Valuation Factor and Rookie Pick Optimism (perfect-knowledge vs hit-rate) sliders |
| **[Dynasty Nerds](https://www.dynastynerds.com/)** | **Expert consensus** — 4 rankers, 300+ players | PPR / standard / superflex / TE-premium; separate rookie ranks | Value + tier | Weekly | DynastyGM app: league sync (Sleeper/ESPN/MFL/Fleaflicker/FFPC), Trade Finder, League Analyzer, Rookie Guide |
| **[DLF](https://dynastyleaguefootball.com/)** | **Expert analysts** + **community mock-draft ADP** | 1QB and superflex ADP series, monthly | Rank/ADP | Monthly ADP, rolling rankings | The **ADP** series — what picks actually cost in live drafts, not what experts say they're worth. Rookies enter rankings only **after the NFL Draft**; rookie ranks start in **January** |
| **[Footballguys](https://www.footballguys.com/)** | Expert, essay-led | 1QB and SF | Rank | Weekly-ish | Long-form dynasty theory; the source of much of the standard vocabulary |

### 7.1 Crowdsourced vs model-produced — the distinction to hold

**Crowdsourced (KTC).** Aggregates *stated preference*: "which of these three would you keep?" from
tens of millions of forced-choice comparisons, resolved by ELO
([KTC FAQ](https://keeptradecut.com/frequently-asked-questions)). KTC even runs planted
quality-control questions — *"you failed a test KTC"* — to filter random answers.

- **Strengths:** reflects what your leaguemates actually believe *today*; updates within minutes of
  news; captures sentiment, hype and narrative, which is what you trade against.
- **Weaknesses:** it is a **popularity measure, not a projection**. It can be circular (people submit
  answers after checking KTC). Scale saturates at the top. And because 1QB and superflex are two
  independent databases, **non-QBs get slightly different values in the two formats for no
  substantive reason** — KTC says so itself.

**Model-produced (FantasyCalc, DynastyProcess).** Infers *revealed* or *expert* preference:
FantasyCalc from ~2M completed trades run through an optimiser; DynastyProcess from expert consensus
rankings converted to a value curve.

- **Strengths:** reproducible; auditable; FantasyCalc's are grounded in trades people actually
  accepted rather than hypotheticals; DynastyProcess ships its whole dataset in git.
- **Weaknesses:** derived assumptions propagate silently. FantasyCalc's superflex QB premium is a
  **flat ×1.88 on every QB** — that is a modelling choice, not a market observation, and no interface
  reveals it. DynastyProcess inherits every bias in FantasyPros' expert panel.

**The rule for a designer.** Crowdsourced answers *"what will my leaguemate accept?"* Model-produced
answers *"what should it be worth?"* These are different questions and a rebuilder needs both — he
sells at the crowdsourced price and buys at the modelled one. **Never present a value without its
source**, and never mix scales in one view: 9999 (KTC), 10411 (FantasyCalc) and 10256 (DynastyProcess)
are three different currencies that happen to have similar-sized numbers.

---

## 8. Dynasty tier language — how managers actually talk

**Player tiers, roughly descending:**

- **Cornerstone / foundational** — untouchable. Usually gated by age: under 26 for WR/RB, 28 for TE,
  30 for QB ([Football Scout 365](https://www.footballscout365.com/post/2026-dynasty-superflex-rankings-full-tiered-breakdown-by-age-production-trade-values), [DLF Cornerstone Rankings](https://dynastyleaguefootball.com/dynasty-cornerstone-rankings/)).
- **Elite foundation / blue-chip / franchise** — top tier; "trade up for it if contending, hold it if
  rebuilding."
- **High-end starter / ascending star** — starts every week, still climbing.
- **Solid contributor / stable veteran** — a redraft asset with limited dynasty upside.
- **Upside swing / dart throw / lottery ticket** — late-round rookie or unproven backup.
- **Deep stash / taxi stash** — years away, if ever.
- **Aging out / declining asset / win-now piece** — production now, no residual value.

Named framework in circulation: **Elite Foundations → High-End Starters → Solid Contributors →
Upside Swings → Late-Round Darts → Deep Stashes** ([Football Scout 365](https://www.footballscout365.com/post/2026-dynasty-superflex-rankings-full-tiered-breakdown-by-age-production-trade-values)).

**Pick tiers:** `1.01/1.02` (spoken as "the one-oh-one") · **early 1st** (1.01–1.04) · **mid 1st**
(1.05–1.08) · **late 1st** (1.09–1.12) · same for 2nds and 3rds. Beyond round 3, picks are talked
about as throwaway sweeteners.

**Transaction and state vocabulary:**

| Term | Meaning |
|---|---|
| **Buy low / sell high** | Trade at a temporary trough / peak in a player's perceived value |
| **Hold** | Value unsettled; a decision deferred, deliberately |
| **Contender / rebuilder** | The two declared postures |
| **Purgatory / stuck in the middle / mushy middle** | Neither, by drift |
| **Retool** | Refresh the core without bottoming out |
| **Productive struggle** | The polite name for tanking for the 1.01 ([Footballguys](https://www.footballguys.com/article/2023-dynasty-introduction)) |
| **Rookie fever** | The annual spring mania that makes managers cut good vets for prospects ([Fantasy Life](https://www.fantasylife.com/articles/dynasty/dynasty-fantasy-football-startup-league-strategy-beware-of-rooki)) |
| **Orphan** | A roster abandoned mid-league, offered to a new manager |
| **Dispersal draft** | Redistribution of a folded/absorbed team's assets |
| **Post-hype** | A former prospect whose hype died — the canonical rebuild buy |
| **Value trap** | Looks cheap on the value chart, but the timeline or role says no |
| **League winner** | An asset whose upside single-handedly decides a title |
| **Taxi / stash / call up** | Taxi squad verbs |
| **Handcuff** | The backup RB whose value is contingent on an injury ahead of him |
| **Devy** | College players owned before they enter the NFL (separate KTC ranking set) |

**Design implication.** These words are load-bearing, not flavour. "Sell high" is a *timing* claim,
"buy low" a *valuation* claim, "hold" an explicit non-action. A dynasty UI that only offers "trade"
has flattened a vocabulary its users already think in.

---

## 9. How dynasty products actually present this

### 9.1 Rankings pages — the invariant columns

Across KTC, Dynasty Nerds, DLF, FantasyCalc, the columns that are **always** present:

1. **Rank** (overall)
2. **Player** — name, **position**, **NFL team**
3. **AGE** — dynasty's signature column; never omitted, always to one decimal (24.4, not 24)
4. **Value** — the single scalar
5. **Positional rank** (QB1, WR12) — often merged into the position cell
6. **Trend** — a signed change over a window (KTC: overall and positional trend, 7-day; FantasyCalc: `trend30Day`)
7. **Tier** — both overall tier and positional tier

Always-present **controls**: a **Superflex on/off** toggle (globally sticky, in the KTC header on
every page), a **TE-premium** selector, position filters, and a rookie/devy scope switch.

Ordering convention: identity → age → value → movement. **Age sits before value**, which is the
format announcing what it thinks matters.

### 9.2 A dynasty player page — KTC's, scraped 2026-08-17

Contents in order: name, "crowdsourced from 26,563,782 data points" · position, team, jersey ·
**Dynasty Value (9995) / Overall Rank (2) / Positional Rank (QB1) / Liquidity** as four hero stats ·
**Age 30.2 y.o., Born 5/21/1996**, height, weight, **Drafted Rd.1 Pick 7, Draft Class 2018, Yrs. Exp.
8**, college · **Tier 1 Overall / Tier 1 Quarterback** · a **value history chart with 1mo / 3mo / 6mo
/ 1yr / All Time** ranges and separate **Overall Rank** and **Positional Rank** history charts ·
**Liquidity** (overall and positional) explained as: *"Using the latest 25,000 real trades… the most
liquid player has a score of 99, a player that appeared half as frequently would be at 50"* ·
**Recent Trades** he appeared in · **Value Adjacent** — the seven players immediately above and below
him overall, and the seven adjacent QBs · **Recent KTCs** — a live feed of individual crowdsourced
votes with timestamps ("Josh Allen K, Jahmyr Gibbs T, Jaxon Smith-Njigba C — 4 minutes ago") ·
**Badges** (Weekly Top 5 Riser/Faller) · **Screenshot Mode**.

Two things worth stealing and one worth questioning:
- **Steal: "Value Adjacent."** A value is meaningless in isolation; showing the ±7 neighbours converts
  a number into a position in a queue, which is how trades are actually reasoned about.
- **Steal: Liquidity.** "How often does this player appear in real trades" is a genuinely different
  axis from value, and it answers the rebuilder's real question — *can I actually move him?*
- **Question: no uncertainty anywhere.** Every number is a point estimate. Allen's value moved from
  9988 to 9995 between two scrapes eleven minutes apart, and the page presents both as facts.
  DynastyProcess is the only source of the six that publishes dispersion at all.

### 9.3 Trade calculators — KTC's, scraped 2026-08-17

Layout: **two symmetric columns** ("Team 1 gets…" / "Team 2 gets…"), each with a player/pick
autocomplete, a running **Total** and **Pieces** count. Global controls in the header: **Superflex
On/Off**, **TE Premium (Off / TE+ / TE++ / TE+++)**. Under "More Options": **Acceptable Variance**,
**Future Pick Adjustment**, **Startup Mode On/Off**, **League Size**.

Below the fold, the parts most calculators skip:
- **Total Absolute Value Exchanged** — how *big* the trade is, separate from who wins it
- **6 Month Player Trends** per side
- **Quick Facts** — a side-by-side stat table (average **age**, average **rank**), footnoted
  *"Age doesn't include picks, Rank doesn't include numbered picks"*
- **Value Dispersion** and **6 Month Value Span** — is this one stud for five scrubs, or even?
- **Recent Trades** from the real trade database, as precedent
- **Insights** — biggest 30-day riser and faller

FantasyCalc's differentiator is **contender/rebuilder modes** that reweight age and picks — the only
mainstream calculator that admits the same trade has two different answers depending on who you are.
Dynasty Nerds' **Trade Finder** inverts the interaction entirely: instead of evaluating a trade you
composed, it syncs your league and *proposes* trades from roster mismatches
([Dynasty Nerds](https://www.dynastynerds.com/dynasty-tools/trade-calculator/)).

**The near-universal weakness:** the verdict is a value delta, sometimes with a fairness bar. Almost
none of them say *"this is a fair trade and you should still refuse it, because both pieces mature
after your window closes."*

### 9.4 League-level surfaces

KTC Power Rankings takes a **public league ID from Sleeper, MFL, FFPC, Fleaflicker or Fantrax** and
renders: every roster valued, **every draft pick on every roster**, positional strength per team,
head-to-head team comparison, "which teams are overweight at one position, needy at another, or
hoarding picks", top free agents ordered by dynasty value, and commissioner tooling for orphan and
dispersal labelling ([KTC Power Rankings](https://keeptradecut.com/dynasty/power-rankings)).

**Sleeper** is the platform layer rather than the analysis layer: dynasty/keeper formats, taxi squad
and IR configuration, **future draft-pick trading** (picks alone or bundled with players; the
draftboard updates to show who owns each selection), a **Trade Block** for signalling availability,
and a Trade Center for composing offers
([Sleeper support](https://support.sleeper.com/en/articles/3974639-can-i-trade-draft-picks), [Sleeper](https://sleeper.com/fantasy-football)).
Nearly every dynasty tool in the ecosystem exists because Sleeper stores the state and publishes it.

### 9.5 What no product in this survey does well

1. **Time.** Everything is priced *now*. Nothing shows where in the annual cycle an asset sits, though
   the cycle is documented, repeating, and the single biggest lever a rebuilder has.
2. **Whose value.** One number per player, when the whole game is that the same asset is worth
   different amounts to a contender and a rebuilder. FantasyCalc's mode toggle is the closest anyone gets.
3. **Uncertainty.** Point estimates everywhere, from sources that disagree with each other by 2.4× on
   QBs.
4. **Deadlines.** Taxi lock dates, taxi aging-out, trade deadlines, rookie-draft dates — all real,
   all dated, all absent from the value surfaces.
5. **The hit-rate/price disagreement.** Every product prices picks. None shows what picks
   historically *return*, next to that price.

---

## What a designer must never get wrong about dynasty

1. **The startup draft and the rookie draft are not the same event.** One happens once and includes
   everybody; the other happens every May and includes only rookies. Any surface labelled "Draft"
   that does not know which it is, is wrong for half the year.

2. **A draft pick is a first-class asset with a compound identity** — year, round, slot-or-tier, and
   original owner — and its display name mutates as the season resolves. Picks are not a footnote on
   the trade screen; for a rebuilder they are the majority of the portfolio.

3. **Age is not metadata.** It is the second column, it carries a decimal, and it is the variable the
   whole format is organised around. The market's own prices prove it: the dynasty premium crosses
   zero at ~24–25 for RBs and ~25–26 for WRs, and a top-120 30-year-old is ranked 23 spots *worse* in
   dynasty than his current production justifies.

4. **The manager's target year outranks any player's absolute value.** A correct trade for a
   contender is a wrong trade for a rebuilder at the identical price. A product that shows one value
   per player is showing the midpoint of a distribution it has enough information to split.

5. **Losing can be the plan.** A rebuilding roster is not a broken roster and must never be rendered
   as one. Red-flagging a rebuilder's weak lineup is the interface failing to understand the format.

6. **Values are not comparable across sources; ranks largely are.** KTC, FantasyCalc and
   DynastyProcess disagree by up to **2.4× on the superflex QB premium** but agree within **5 spots**
   on where a QB ranks. Show the source next to the number, never mix scales in one view, and prefer
   rank when comparing across sources.

7. **Superflex is not a checkbox.** It moves a top-24 QB up ~**40 ranks**, puts **7 QBs in the top 24
   and 12 in the top 36**, and discounts every non-QB by roughly **18%**. A 1QB default silently
   shown to a superflex manager is not a small error — it is a different game.

8. **Dynasty value is seasonal, and the season is documented.** Picks peak in April (~120% of
   baseline) and bottom in September–November; veterans peak in November when contenders panic. A
   value with no position in that cycle is missing the axis the user trades on.

9. **The two folk laws of pick pricing are defaults, not laws.** (a) Round boundaries are a
   *vocabulary*, not a price cliff — the market prices 1.12 and 2.01 within **5%** of each other while
   hit rates fall **48% → 31% → 7%** across rounds 1, 2 and 3+; don't draw a cliff the prices don't
   have, but do draw the outcome curve that does. (b) "Sooner is worth more" gets overridden: on
   2026-08-17 KTC prices a **2027 Early 1st above a 2026 Early 1st**, because the 2026 class is weak
   and the calendar has passed it by. A pick model that cannot render that inversion is broken.

10. **Dynasty has hard-dated deadlines redraft does not** — taxi lock, taxi aging-out (which can lock
    a manager out of his own roster), rookie-draft day, trade deadline. They are knowable in advance
    and essentially nobody surfaces them.
