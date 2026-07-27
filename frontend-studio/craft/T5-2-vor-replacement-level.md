# Value Over Replacement (VOR) and Replacement Level

A methodology reference. What the measure is, where it came from, the one parameter
nobody agrees on, how league shape determines that parameter, and the specific ways
hand-rolled implementations break.

Every factual claim is cited. Claims I could not verify against a live, non-paywalled
source are marked **UNVERIFIED** inline and collected in §12.

---

## 1. The problem it was invented to solve

Fantasy scoring is not comparable across positions. In most formats a quarterback
outscores a tight end by a wide margin every week, so ranking players by projected
points ranks the quarterbacks first and tells you nothing useful. But you can only
start one quarterback, and the *next* quarterback is nearly as good, whereas the
next tight end may not be.

The insight is that raw points measure production, and what a roster decision
actually consumes is a **lineup slot**. The right unit is therefore not "points"
but "points relative to what that slot would otherwise have produced."

Joe Bryant's original statement of the principle, still the canonical one:

> "The value of a player is determined not by the number of points he scores.
> His value is determined by how much he outscores his peers at his particular
> position."
>
> — Joe Bryant, *Principles of Value Based Drafting*, Footballguys
> <https://www.footballguys.com/article/bryant_vbd?article=bryant_vbd>

This converts an incomparable quantity (points) into a comparable one (points above
a positional reference). Everything else in this document is about the reference.

---

## 2. Lineage

### 2.1 Baseball: Woolner's VORP

The replacement-level idea in modern sports analytics is Keith Woolner's, developed
and popularized at Baseball Prospectus.

> "Value over replacement player (or VORP) is a statistic popularized by Keith
> Woolner that demonstrates how much a hitter, pitcher or outfielder contributes
> to their team in comparison to a replacement-level player who is an average
> fielder at that position and a below average hitter."
>
> — <https://en.wikipedia.org/wiki/Value_over_replacement_player>

The definition of "replacement level" that everything descends from:

> "the level of performance an average team can expect when trying to replace a
> player at minimal cost, also known as **'freely available talent.'**"
>
> — <https://en.wikipedia.org/wiki/Value_over_replacement_player>

Baseball Prospectus' own gloss:

> "A replacement player is a theoretical construct, representing roughly the lowest
> level of performance that a major-league team should get from a player on their
> active roster... the kind of fringe talent any ballclub could pick up by signing
> minor-league free agents or claiming guys off the waiver wire."
>
> — *Prospectus Toolbox: Value Over Replacement Player*, Baseball Prospectus
> <https://www.baseballprospectus.com/news/article/6231/prospectus-toolbox-value-over-replacement-player/>

**This is the load-bearing point for fantasy football.** Woolner did not define
replacement level as "the worst starter." He defined it as *the cost of the cheapest
available substitute*. In baseball that is a minor-league free agent. In fantasy
football the exact analogue is **the waiver wire**, not the last starting lineup slot.
Most fantasy implementations quietly substitute the latter for the former, and that
substitution is the origin of a large share of the disagreement in §4.

Woolner then had to make the construct operational, and the operationalization is
frankly arbitrary — a point his critics made immediately:

**Position players.** Replacement is set as a fixed fraction of positional average:

```
Replacement (non-catchers)  = 0.80 × league average production at that position
Replacement (catchers)      = 0.75 × positional average
Replacement (1B and DH)     = 0.85 × positional average
```

An alternative formulation sets it at 35 points of OBP and SLG below positional
average. — <https://tangotiger.net/wiki_archive/VORP.html>

**Pitchers.** Replacement level is a linear function of league run average:

```
Starters:  Replacement Level = 1.37 × LeagueRA − 0.66
Relievers: Replacement Level = 1.70 × LeagueRA − 2.27

VORP = IP × (Replacement Level − RA9) / 9
```

— <https://tangotiger.net/wiki_archive/VORP.html>,
<https://en.wikipedia.org/wiki/Value_over_replacement_player>

**And the standing criticism, from the beginning:**

> "Critics of VORP take issue with where the formula's arbitrary 'replacement level'
> is set."
>
> — <https://en.wikipedia.org/wiki/Value_over_replacement_player>

Thirty years later this criticism is still unresolved, in baseball and in football.
It is not a defect in anyone's implementation. It is a genuinely underdetermined
modeling choice, and §4 is about how to make it deliberately rather than by accident.

### 2.2 Football Outsiders: replacement level vs. average, as a deliberate fork

Football Outsiders built two parallel families of metrics, and the split between
them is precisely the average/replacement distinction:

- **VOA** — Value Over Average. Opponent-unadjusted.
- **DVOA** — Defense-adjusted Value Over Average. A *rate* stat, measured against
  league average.
- **YAR / DYAR** — (Defense-adjusted) Yards Above Replacement. A *total* stat,
  measured against replacement level, expressed in yards.

DYAR "compares the performance of each player, in terms of DVOA, to a
replacement-level baseline rather than the league average for that position, then
translates that total into yardage." Because it is a total rather than a rate, it
credits volume: "there is some value in a player who can give a team average
performance over a large volume of carries or pass targets."
— per Football Outsiders' own DYAR documentation, now offline; see §12.

Note the shape of that design decision, because it recurs everywhere in this
document: **average-based measures are natural for rates; replacement-based measures
are natural for totals.** DVOA answers "how good is he per play," DYAR answers "how
much did he contribute in total." Mixing the two — a replacement-based *rate*, or
an average-based *total* — is the failure mode in §8.4.

DVOA and DYAR moved from Football Outsiders to FTN Fantasy in August 2023.
<https://ftnfantasy.com/nfl/dvoa-explainer> (fetch returns HTTP 403; see §12)

### 2.3 Football: Bryant's Value Based Drafting

Joe Bryant introduced VBD at Footballguys in the mid-1990s. Sources conflict on the
exact year (1995 vs. 1996) — see §12.

The formula, which Bryant calls the "X number":

```
X = (Player's projected fantasy points) − (Baseline player's fantasy points)
```

Bryant's worked example:

| Player | Projected | Baseline | X |
|---|---|---|---|
| Eli Manning | 200 | 150 | **+50** |
| Matt Ryan (baseline) | 150 | 150 | **0** |
| Kirk Cousins | 100 | 150 | **−50** |

Critically, **Bryant did not use the worst starter.** He used a draft-position
baseline — the number of players at each position gone by the 100th pick. For a
12-team, 18-round league starting 1QB/2RB/3WR/1TE/1K/1DEF:

| Position | Players gone by pick 100 |
|---|---|
| QB | 15 |
| RB | 36 |
| WR | 38 |
| TE | 8 |
| DEF | 2 |
| K | 1 |

So the QB baseline is QB15 — not QB12. And:

> "Factors such as the specific number of teams, starting lineup requirements,
> frozen players, and scoring system for your league dramatically affect the
> values of each player."

— <https://www.footballguys.com/article/bryant_vbd?article=bryant_vbd>

Footballguys co-owner David Dodds is credited with refining the pick-100 approach
and with a formula estimating position counts at pick 100 from scoring criteria,
team count, required starters, round count, and flex positions. I could not fetch
Dodds' primary article (`apps.footballguys.com` no longer resolves) — **UNVERIFIED**,
see §12.

---

## 3. The core formula, and where all the argument lives

For player *i* at position *p*:

```
VOR(i) = Points(i) − Points( Baseline(p) )

where  Baseline(p) = the player ranked k_p at position p,
       ranked by the same projection source, same scoring system.
```

That is the whole measure. It has exactly **one free parameter per position**: the
baseline index `k_p`.

Two consequences worth internalizing before going further:

1. **VOR is a shifted version of the projection, not new information.** Within a
   position, `VOR` is `Points` minus a constant. It cannot reorder players at the
   same position — ever. If your implementation changes the *within-position* order,
   you have a bug.

2. **All of VOR's content is cross-positional, and all of it is in `k`.** The only
   thing VOR does is set the relative offset between positions. So the choice of
   `k_p` is not a detail of the method — it *is* the method.

A useful sanity identity: for positions `p` and `q`,

```
VOR(i) > VOR(j)   ⟺   Points(i) − Points(j) > Points(Base_p) − Points(Base_q)
```

Only the *difference between baselines* matters for cross-position ranking. Adding
a constant to every baseline changes nothing. This is why "how many points is the
baseline" is the wrong question and "how far apart are the baselines" is the right
one.

---

## 4. The central unsolved question: what is replacement level?

Practitioners disagree, publicly and durably. Below are the live definitions, each
with its index formula and its tradeoff. Notation throughout:

```
N  = number of teams
S  = dedicated weekly starters at the position (excluding flex)
F  = number of FLEX slots (RB/WR/TE eligible)
SF = number of SUPERFLEX slots (QB/RB/WR/TE eligible)
```

### 4.1 Last starter — VOLS (Value Over Last Starter)

```
k_p = N × S_p          (before flex allocation)
```

12-team, 1QB → QB12. 12-team, 2RB → RB24.

The most common choice, and the one most hand-rolled implementations land on:

> "The most common approach is to use the 'worst starter' as the baseline, using
> the projected points of the last starter at a position. So, in a 12-team league
> that starts one quarterback, the worst starter would be the number 12 quarterback
> based on projections."
>
> — Fantasy Football Analytics
> <https://fantasyfootballanalytics.net/2024/08/winning-fantasy-football-with-projections-value-over-replacement-and-value-based-drafting.html>

**Tradeoffs.** Simple, transparent, requires nothing but league settings. But it is
*not* Woolner's replacement level — it is the marginal starter, which is a strictly
higher bar than freely available talent. It systematically compresses value at
positions where the starter/waiver gap is large.

Subvertadown's characterization of what it does to behavior:

> "Inflates prices for top players in auctions; minimal bench budget... Prioritizes
> earlier picks for replaceable positions in snake drafts... Increased exposure if
> starters underperform; requires strong waiver-wire access."
>
> — <https://subvertadown.com/article/guide-to-understanding-the-different-baselines-in-value-based-drafting-vbd-vols-vs-vorp-vs-man-games-and-beer->

### 4.2 Waiver-wire baseline — VORP proper

The definition faithful to Woolner:

> "A 'replacement player' is the best player at a given position that one can expect
> to be on the waiver wire."
>
> — FantasyPros
> <https://www.fantasypros.com/2025/06/fantasy-football-draft-strategy-value-based-drafting-vorp-vols-vona/>

```
k_p = N × (total rostered at p, starters + bench)  ≈  the first undrafted player
```

In practice this requires a model of how many of each position get *rostered*, not
just started — which is why FantasyPros sets it "based on league size, roster
requirements and a pick prediction algorithm."

Their published 2025 half-PPR baselines, which show how far this sits from VOLS:

| Position | VORP baseline | VOLS baseline (12-tm) |
|---|---|---|
| WR | **WR65** (114.2 pts) | WR36 (157.3 pts) |
| QB | **QB13** (244.4 pts) | QB12 (286.2 pts) |

And the resulting divergence for two real players:

| Player | Projection | VORP | VOLS |
|---|---|---|---|
| Ja'Marr Chase (WR) | 283.3 | **169.1** | 126.0 |
| Lamar Jackson (QB) | 371.1 | **126.7** | 85.0 |

— <https://www.fantasypros.com/2025/06/fantasy-football-draft-strategy-value-based-drafting-vorp-vols-vona/>

Note the QB13-vs-QB12 gap of a single rank against WR65-vs-WR36 gap of 29 ranks.
That asymmetry is the entire mechanism by which baseline choice reweights positions.

**Tradeoffs.** Theoretically correct in Woolner's sense. But it pushes the baseline
deep into the noisy tail of projections, where projection error is large relative to
the spread between adjacent players, and it rewards bench hoarding:

> "Prioritizes bench backups before filling starting positions in snake drafts...
> More risk-averse; emphasizes bench depth. Less useful for fantasy football;
> better suited for Best Ball or highly competitive waiver leagues."
>
> — <https://subvertadown.com/article/guide-to-understanding-the-different-baselines-in-value-based-drafting-vbd-vols-vs-vorp-vs-man-games-and-beer->

### 4.3 First player off the board after the starters

A middle position: the baseline is the first *bench* player, i.e. `k_p = N × S_p + 1`,
or equivalently the best player at the position not needed as a starter anywhere.

> "the worst starter or first bench player, giving a straightforward comparison to
> a replacement-level player"
>
> — <https://fantasyfootballanalytics.net/2024/08/winning-fantasy-football-with-projections-value-over-replacement-and-value-based-drafting.html>

**Tradeoffs.** Nearly identical to VOLS numerically (one rank apart), and shares its
properties. Mostly a definitional preference rather than a substantive third method.

### 4.4 Draft-position / pick-100 baseline

Bryant's and Dodds' approach, and the one Isaac Petersen recommends: set the baseline
at the positional rank equal to how many at that position are typically gone by a
fixed draft pick.

> "the player whose position rank is equal to the number of players at that position
> who are taken (on average) by pick 100"
>
> — Isaac Petersen, Fantasy Football Analytics
> <https://fantasyfootballanalytics.net/2013/04/win-your-snake-draft-calculating-value.html>

Petersen's 10-team standard baselines: **QB17, RB35, WR35, TE13.**
Bryant's 12-team baselines: **QB15, RB36, WR38, TE8.**

Conventionally pick 100 for a 10-team league and pick 120 for a 12-team league
(<https://fantasyfootballanalytics.net/2024/08/winning-fantasy-football-with-projections-value-over-replacement-and-value-based-drafting.html>).

Petersen also recommends *smoothing* the baseline rather than using a single
projection — he "averaged the number of points from this player at each position
with the player of the same position who was ranked 1 above and 1 below." This is a
small, cheap robustness win and worth copying (see §8.7).

His stated reason for preferring league-specific empirics over a universal formula:

> "There are ways to estimate this with a formula, but I decided to use prior draft
> information from my league (because each league has different settings)."
>
> — <https://fantasyfootballanalytics.net/2013/04/win-your-snake-draft-calculating-value.html>

**Tradeoffs.** Empirically grounded in what actually happens rather than in a
theoretical roster construction, and it naturally absorbs scoring-system effects.
But it is **circular**: it derives value from market behavior (ADP), so it will
reproduce the market's positional biases rather than correct them. If the market
systematically overdrafts running backs, a pick-100 baseline bakes that in. It also
requires ADP data, which does not exist for a novel format.

### 4.5 Games-started-weighted / man-games

The most methodologically serious critique of all the above. Adam Harstad's argument:
a season does not require *N × S starters*, it requires *N × S × 17 starts*. Byes and
injuries mean the marginal start is made by a player far below the notional worst
starter.

> "instead of counting the number of 'starting quarterbacks' in a league, count the
> number of 'quarterback starts'"
>
> — Adam Harstad, *A Better Way to Determine VBD Baselines*, Footballguys
> <https://www.footballguys.com/article/HarstadVBDBaselines>

```
Starts required at p = N × S_p × (weeks in fantasy regular season)
k_p = the rank at which cumulative expected starts ≥ starts required
```

Harstad measured this empirically across 12 real MFL leagues with standardized
scoring:

| Position | Measured baseline | ≈ Weekly equivalent |
|---|---|---|
| QB | 330th-best start | **QB19–QB21** |
| RB | 541st-best start | **RB34** |
| WR | 866th-best start | **WR54** |
| TE | 350th-best start | **TE21–TE22** |

Against a 12-team notional baseline of QB12 / RB24 / WR36 / TE12, every position's
real baseline is far deeper. His conclusion:

> "commonly accepted 'worst starter' baselines in use are hopelessly optimistic."

He identifies three reasons the naive baseline fails:

1. It "assumes perfect talent distribution" — in reality some teams cluster stars.
2. It "assumes perfect foresight" — owners could not have predicted breakouts.
3. It ignores matchup optimization — streaming against weak defenses beats average.

The same idea appears as **BEER** (Best Ever Evaluation of Replacement) in
Subvertadown's taxonomy, which counts games each drafted player will actually play,
accounting for byes, injuries, and trades — e.g. a top QB ≈ 15 of 17 games, a top
RB ≈ 13, an RB40–50 ≈ 11.
<https://subvertadown.com/article/guide-to-understanding-the-different-baselines-in-value-based-drafting-vbd-vols-vs-vorp-vs-man-games-and-beer->

**Tradeoffs.** Closest to the real decision structure, and the only method that
handles availability natively. Costs: it needs per-player games-played estimates,
which are themselves uncertain; and it can push auction prices for elite players
unrealistically low — "Auction prices seem unfairly low to starters, especially
top-tier" (Subvertadown, community feedback).

### 4.6 Average starter — VOAS / EVoS

Baseline at the *mean* of all starters at the position rather than the worst.

Harstad's argument for why worst-starter can be flatly wrong, via a constructed
10-team example:

> "The top ten running backs in the NFL average 10.0, 9.9, 9.8, 9.7, 9.6, 9.5, 9.4,
> 9.3, 9.2, and 5.0 points per game. The top ten wide receivers average 10.0, 5.8,
> 5.7, 5.6, 5.5, 5.4, 5.3, 5.2, 5.1, and 5.0 points per game."
>
> — Adam Harstad, *Rethinking VBD*, Footballguys
> <https://www.footballguys.com/subscribers/apps/article.php?article=HarstadValueOverBaseline>

Both RB1 and WR1 score 10.0, and both worst starters score 5.0, so **worst-starter
VBD makes RB1 and WR1 exactly equally valuable (+5.0 each)**. But RB1 beats the
*average* starting RB by ~1.0 PPG while WR1 beats the average starting WR by ~4.6
PPG. The receiver is obviously the scarcer asset and the worst-starter baseline
cannot see it, because it looks only at the tail of the distribution and ignores its
shape.

Harstad names the two metrics:

- **EVoB** (Estimated Value over Baseline) — per-game, worst-starter baseline.
- **EVoS** (Estimated Value over Starters) — compares a player "against the average
  of all starters at his position, minus the player himself."

The self-exclusion ("minus the player himself") is not cosmetic — without it, a
dominant player drags his own baseline upward and understates his own value.

**Where EVoS breaks:** at the bottom of the rankings. Harstad's own example —
Martavis Bryant at 10.41 PPG over 10 games ranked above DeSean Jackson at 10.24 PPG
over 15 games, which he calls an unrealistic preference.

**Tradeoffs.** Sensitive to distribution *shape*, not just its tail — a real
advantage. But "value above average" is not a coherent replacement concept: a player
at exactly average starter level has zero value under EVoS, which is plainly false,
since he is much better than what you could get free. Best used as a *complement* to
a replacement baseline, at the top of the board, not as a substitute. Harstad's own
conclusion is that "both methods offer merit depending on ranking tier examined."

### 4.7 Blended / positional-scarcity baselines

Because VOLS overweights starters and waiver/man-games baselines overweight depth,
several practitioners blend them. Subvertadown's **BEER+** is the documented example:

```
Redistribution ratio = (VOLS players) / (BEER players + VOLS players)
                     ≈ 40% VOLS / 60% BEER, varying with roster composition
```

BEER+ adds two further adjustments: a risk adjustment via a Sharpe-ratio-style
estimate based on positional certainty, and a QB-streaming adjustment calibrated on
11 years of data assuming league-mates own 2 QBs and ≤25 total QBs are owned
league-wide.

Their own caveat, which matters here: BEER+ is **"Not recommended for 2QB/Superflex
leagues with 12+ teams"** — exactly the case in §6 where the QB baseline runs off the
end of the viable player pool.
<https://subvertadown.com/article/guide-to-understanding-the-different-baselines-in-value-based-drafting-vbd-vols-vs-vorp-vs-man-games-and-beer->

**Tradeoffs.** Usually produces the most defensible board. But the blend weight is a
second free parameter with no principled derivation, so you have traded one arbitrary
choice for two.

### 4.8 VONA — Value Over Next Available (dynamic)

Not a replacement-level definition at all, but the honest answer to the decision VOR
is usually used for:

> "How many more points you expect a given player to score than the best player you
> expect to be available at that position at your next draft slot."
>
> — <https://www.fantasypros.com/2025/06/fantasy-football-draft-strategy-value-based-drafting-vorp-vols-vona/>

FantasyPros' worked example at pick 1.02: Justin Jefferson's VONA is 39.4 while
Saquon Barkley's is 68.4, because better WRs than RBs remain available at the turn —
so VONA says take the RB even if season-long VOR says otherwise.

**Tradeoffs.** It is the correct opportunity cost for a snake draft. But it
"cannot be calculated before your draft" — it needs live board state and a model of
what survives to your next pick, which makes it useless for producing a static
ranking and unusable for cross-league comparison.

### 4.9 Why they disagree — the substance

The disagreement is not sloppiness. It is that "replacement level" is being asked to
answer three different questions at once:

| Question | Correct baseline |
|---|---|
| What does this roster slot cost me in opportunity? | VONA / next-available |
| What could I get for free if I lose this player? | Waiver / man-games |
| What does a marginal lineup slot produce? | Last starter |

These have different answers, and no amount of care in implementation collapses
them. **Choose based on which question your artifact is actually answering, and say
which one in the artifact.** An interface that shows a single "VOR" column without
disclosing the baseline is withholding the parameter that determines the number.

---

## 5. How league settings determine the baseline index

The arithmetic that turns league shape into `k_p`. The most complete published
version is Harstad's generalized formulas, which handle flex and superflex explicitly.

### 5.1 The formulas

> Let "N" = number of teams, "S" = weekly starters at position (excluding flexes),
> "F" = number of flex positions, "SF" = number of superflex positions.

**Standard scoring (weekly baseline):**
```
QB = N × (S + 0.75×SF) × 1.56
RB = N × (S + 0.80×F + 0.20×SF) × 1.22
WR = N × (S + 0.20×F + 0.05×SF) × 1.22
TE = N × S × 1.81
```

**PPR scoring:**
```
QB = N × (S + 0.75×SF) × 1.56
RB = N × (S + 0.30×F + 0.08×SF) × 1.22
WR = N × (S + 0.70×F + 0.17×SF) × 1.22
TE = N × S × 1.81
```

**TE-premium scoring:**
```
QB = N × (S + 0.75×SF) × 1.56
RB = N × (S + 0.24×F + 0.06×SF) × 1.22
WR = N × (S + 0.56×F + 0.14×SF) × 1.22
TE = N × (S + 0.20×F + 0.05×SF) × 1.81
```

Then: "Multiply by 16 to get the 'worst start' baseline for the whole season."

— Adam Harstad, *Calculating New Positional Baselines*, Footballguys
<https://www.footballguys.com/article/HarstadGeneralizingBaselines?article=HarstadGeneralizingBaselines>

### 5.2 Reading the structure

The formula decomposes into three independent pieces, and it is worth separating them
because a hand-rolled version usually gets one or two of them and misses the rest:

**(a) Dedicated starters: `N × S`.** Uncontroversial.

**(b) Flex allocation: the `F` and `SF` coefficients.** These distribute each flex
slot across the eligible positions according to how often each position actually
fills it. Harstad's derivation:

> "Based on per-game averages from last season, we can estimate that in PPR leagues,
> about 30% of flex starters will be running backs and about 70% will be wide
> receivers."

and for non-PPR, "about 80% of flex starters will be running backs and the remaining
20% should be wide receivers."

**Note the coefficients sum to 1.0 across flex-eligible positions** (PPR:
0.30 + 0.70; standard: 0.80 + 0.20; TE-premium: 0.24 + 0.56 + 0.20 = 1.00). This is
the constraint that prevents the FLEX double-count in §8.6. One flex slot creates
exactly one start, distributed — not one extra start at *each* eligible position.

**(c) Real-world inefficiency multipliers: 1.56 (QB), 1.22 (RB/WR), 1.81 (TE).**
These are not fudge factors — they are the games-started correction from §4.5,
folded in as a constant. Harstad derives them from his measured data: the real QB
baseline "was around 300 starts, which is about 56% more" than theoretical, TE was
"81% more starts than the theoretical baseline," and RB/WR showed "22%
inefficiency."

So `1.56`, `1.22`, `1.81` are literally `1 + the measured inefficiency` at each
position. The TE multiplier being highest and RB/WR lowest reflects that deep TE
and QB replacements are far worse relative to their starters than deep RB/WR
replacements are.

Harstad's own caveat, which should be carried forward:

> "Yes, this means we're stepping back out of the world of actual results and back
> into the world of theory and estimation."

### 5.3 Worked baseline computation

12-team PPR, starting 1QB / 2RB / 3WR / 1TE / 1FLEX (N=12, F=1, SF=0):

```
QB = 12 × (1 + 0.75×0)            × 1.56 = 12 × 1.00 × 1.56 = 18.72  → QB19
RB = 12 × (2 + 0.30×1 + 0.08×0)   × 1.22 = 12 × 2.30 × 1.22 = 33.67  → RB34
WR = 12 × (3 + 0.70×1 + 0.17×0)   × 1.22 = 12 × 3.70 × 1.22 = 54.17  → WR54
TE = 12 × 1                       × 1.81 = 12 × 1.00 × 1.81 = 21.72  → TE22
```

**These reproduce Harstad's independently measured empirical baselines from §4.5
almost exactly** — measured QB19–21, RB34, WR54, TE21–22, against computed QB19,
RB34, WR54, TE22. The theoretical formula and the empirical measurement agree. That
is the strongest single piece of validation available for any baseline method
surveyed here, and it is a good argument for using this family as a default.

*(Arithmetic computed by me from Harstad's published formulas; the agreement with his
measured table is my observation, not his claim.)*

Verification against Harstad's own published worked example — 10-team TE-premium,
1/2/3/1 starters, 1 flex, 1 superflex:

```
QB: 10 × (1 + 0.75)        × 1.56 = 27.30   ✓ matches his published 27.30
RB: 10 × (2 + 0.24 + 0.06) × 1.22 = 28.06   ✓
WR: 10 × (3 + 0.56 + 0.14) × 1.22 = 45.14   ✓
TE: 10 × (1 + 0.20 + 0.05) × 1.81 = 22.63   ✓
```

---

## 6. Superflex / 2QB: the case that breaks naive implementations

Superflex is where baseline choice stops being a modeling nicety and starts producing
grossly wrong boards.

### 6.1 The supply constraint

> "With only 32 quarterbacks in starting roles at any given moment, a 12-teamer's
> demand for 24 fantasy starters and 12 fantasy backups can't be met."
>
> — 4for4, *An Introduction to 2QB and Superflex Leagues*
> <https://www.4for4.com/2023/preseason/introduction-2qb-and-superflex-leagues>

Superflex doubles QB demand without adding a single QB to the pool. The pool is
hard-capped at 32 by the structure of the NFL.

### 6.2 The arithmetic

**Naive VOLS.** 12 teams × 2 effective QB slots → `k_QB = 24`. QB12 → QB24.

**Harstad's formula.** 12-team PPR superflex, 1QB + 1FLEX + 1SF:

```
QB = 12 × (1 + 0.75×1) × 1.56 = 12 × 1.75 × 1.56 = 32.76  → QB33
RB = 12 × (2 + 0.30×1 + 0.08×1) × 1.22 = 34.84            → RB35
WR = 12 × (3 + 0.70×1 + 0.17×1) × 1.22 = 56.66            → WR57
```

The QB baseline moves **QB19 → QB33** — fourteen ranks — from one lineup slot. RB and
WR barely move (RB34→35, WR54→57), because the superflex coefficients for them are
tiny (0.08, 0.17): the slot is almost always filled by a QB.

The `0.75` coefficient is Harstad's estimate that "only 75% of the time will starting
a quarterback in the flex position be feasible," because of byes and QB stockpiling.

### 6.3 The thing to notice

**QB33 exceeds the number of NFL starting quarterbacks.** The baseline has run off
the end of the viable player pool. This is not a bug in the formula — it is the
formula correctly reporting that in a 12-team superflex league, replacement-level
quarterback is *worse than any starting NFL QB*, i.e. it is a backup. That is exactly
why elite QBs are priced the way they are in superflex, and exactly what a naive
QB24 baseline fails to capture.

Practical consequence for any implementation: **your baseline index can exceed your
player pool.** Code that indexes `sorted_players[k]` will either throw or silently
clamp to the last row. Both are wrong. You need an explicit extrapolation policy
(e.g. extend the projection curve, or floor the baseline at a defined value) and it
should be visible to the user.

### 6.4 The dissenting approach: a combined starter baseline

4for4's position is that per-position baselines are conceptually wrong for the
superflex slot itself, because the slot is position-agnostic: what matters is total
points, so a combined QB/RB/WR/TE starter baseline is the right comparison for the
flexible slot. **UNVERIFIED** — this is from search-result summary of 4for4 material
I could not fetch in full; see §12. It is worth knowing the argument exists, since it
implies a structurally different implementation (one baseline for flexible slots,
per-position baselines for dedicated slots) rather than a coefficient tweak.

---

## 7. Worked numeric example

**All projections below are synthetic** — constructed to have realistic shape so the
arithmetic is fully auditable. Do not use these numbers as projections. Format:
12-team half-PPR, 1QB / 2RB / 3WR / 1TE / 1FLEX.

### 7.1 Projection set (excerpt)

| Rank | QB pts | RB pts |
|---|---|---|
| 1 | 380 | 301 |
| 2 | 356 | 284 |
| 3 | 341 | 271 |
| 5 | 315 | 254 |
| 8 | 290 | 234 |
| 10 | 278 | 222 |
| 12 | **268** | 212 |
| 13 | 262 | 207 |
| 15 | 249 | 197 |
| 19 | **224** | 180 |
| 20 | 218 | 176 |
| 24 | 190 | **160** |
| 33 | 118 | 129 |
| 34 | 110 | **126** |
| 36 | 94 | **120** |

### 7.2 QB VOR under four baselines

| Player | Proj | VOLS (QB12=268) | FP-waiver (QB13=262) | Pick-100 (QB15=249) | Man-games (QB19=224) |
|---|---|---|---|---|---|
| QB1 | 380 | +112 | +118 | +131 | **+156** |
| QB2 | 356 | +88 | +94 | +107 | +132 |
| QB3 | 341 | +73 | +79 | +92 | +117 |
| QB5 | 315 | +47 | +53 | +66 | +91 |
| QB8 | 290 | +22 | +28 | +41 | +66 |
| QB12 | 268 | **0** | +6 | +19 | +44 |
| QB19 | 224 | −44 | −38 | −25 | **0** |

QB1's VOR ranges from **+112 to +156** — a 39% swing — purely from baseline choice.
Nothing about the projection changed.

### 7.3 RB VOR under three baselines

| Player | Proj | VOLS (RB24=160) | Man-games (RB34=126) | Pick-100 (RB36=120) |
|---|---|---|---|---|
| RB1 | 301 | +141 | +175 | +181 |
| RB2 | 284 | +124 | +158 | +164 |
| RB3 | 271 | +111 | +145 | +151 |
| RB5 | 254 | +94 | +128 | +134 |
| RB10 | 222 | +62 | +96 | +102 |
| RB24 | 160 | **0** | +34 | +40 |
| RB34 | 126 | −34 | **0** | +6 |

### 7.4 The ranking actually flips

Cross-position board, matched baselines (both from the man-games family: QB19 / RB34)
vs. a mismatched pair (QB from VOLS, RB from man-games: QB12 / RB34) — the exact
mistake described in §8.2:

| # | Matched (QB19 / RB34) | Mismatched (QB12 / RB34) |
|---|---|---|
| 1 | RB1 (175) | RB1 (175) |
| 2 | RB2 (158) | RB2 (158) |
| 3 | **QB1 (156)** | RB3 (145) |
| 4 | RB3 (145) | RB5 (128) |
| 5 | QB2 (132) | **QB1 (112)** |
| 6 | RB5 (128) | RB10 (96) |
| 7 | QB3 (117) | QB2 (88) |
| 8 | RB10 (96) | QB3 (73) |
| 9 | QB5 (91) | QB5 (47) |
| 10 | QB8 (66) | QB8 (22) |

QB1 moves from **3rd overall to 5th overall**, and QB2 from 5th to 7th. In a real
draft this is the difference between taking the elite QB in the first round and
waiting. The *only* thing that changed is which baseline the QB column used.

### 7.5 Superflex, same projections

| Baseline | QB1 VOR | QB12 VOR | QB19 VOR |
|---|---|---|---|
| 1QB, man-games (QB19 = 224) | +156 | +44 | 0 |
| Superflex, naive VOLS (QB24 = 190) | +190 | +78 | +34 |
| Superflex, Harstad (QB33 = 118) | **+262** | **+150** | **+106** |

Under the correct superflex baseline, **QB12 alone is worth +150** — nearly what QB1
was worth in the 1QB league. That is the entire superflex thesis, and the naive VOLS
baseline captures roughly half of it.

---

## 8. Known failure modes

The specific ways hand-rolled replaceability measures break.

### 8.1 Baseline drift as the player pool changes

The baseline is defined by *rank*, so it moves whenever the underlying set moves.
Injuries, retirements, projection updates, and — during a draft — players being
removed from the pool all shift which player occupies rank `k`.

Two distinct sub-failures:

- **Stale baseline.** Baseline computed once at load, projections refreshed later.
  Every VOR is now offset by a stale constant, differently per position.
- **Silently mutating baseline.** Baseline recomputed against the *undrafted* pool
  mid-draft. This is sometimes what you want (it's close to VONA), but it means VOR
  values are not comparable across two moments in time, and any cached or exported
  number is wrong.

**Fix:** decide explicitly whether the baseline is computed over the *full* pool
(static, comparable, exportable) or the *available* pool (dynamic, decision-relevant,
not comparable). Store the baseline player and index alongside every VOR value, and
show it. If both modes are useful, they are two columns, not one.

### 8.2 Comparing VOR across positions computed on different baselines

The most damaging failure, and the hardest to see, because nothing errors — you just
get a board that is subtly wrong in a consistent direction. §7.4 shows a two-rank
move at the top of the first round from exactly this.

It happens in practice through:
- Different baseline *rules* per position (QB on last-starter, WR on waiver).
- Different projection *sources* per position, so the baselines are drawn from
  differently-calibrated distributions.
- Positions whose baseline rule was never updated after a settings change (adding a
  FLEX moves RB/WR but not QB/TE — if only some were updated, they are now mismatched).
- Kickers and defenses left on a default while skill positions moved.

**Fix:** derive every position's baseline from a *single parameterized rule* applied
to *one* projection source. If a rule can't express a position (K/DST), exclude those
positions from the cross-position board entirely rather than mixing methods. Recall
from §3 that only baseline *differences* matter cross-positionally, so a mismatch in
rule is a direct, uncorrected bias in the board order.

### 8.3 Bench and depth players scoring nonsensically

Below the baseline, VOR goes negative and then arbitrarily large negative. This is
meaningless: a player you would never start has no negative value — you simply don't
start him. Yet naive implementations will rank QB40 as −200 and let that number
propagate into sums, averages, auction normalizations, and team-total comparisons.

Chase Stuart's handling in *Expected VBD* is the standard correction — negative
outcomes floor at zero because underperformers get benched:

> "If Wilson scores 425 points, he'll produce 125 points of VBD. If he scores only
> 325 points, he'll be worth +25, and if he scores only 225 points, he's going to
> have −125 points of VBD."

with the effective calculation becoming "(125+25+0)/3, or 50."
— <https://www.footballguys.com/article/stuart_expected_vbd_by_adp>

**Fix:** `VOR_display = max(0, VOR)` for any aggregate, ranking, or dollar conversion.
Keep the signed value only as a diagnostic. Be aware this makes VOR non-additive
below the baseline, which is correct but means "sum of team VOR" is a lossy summary.

### 8.4 Treating a rate as a total, or a total as a rate

The §2.2 DVOA/DYAR distinction, and Harstad's central critique of classic VBD:

> "VBD is calculated on a per-season basis, while start decisions are made on a
> per-game basis."

His case:

| Player | Year | Games | Points | PPG |
|---|---|---|---|---|
| Brent Celek | 2013 | 16 | 84.2 | 5.26 |
| Rob Gronkowski | 2013 | 7 | 83.2 | **11.89** |

Season-total VBD makes Celek marginally *more* valuable. Nobody believes that. His
revision:

```
VBD = (PPG − Baseline PPG) × (games played)
```

giving Gronkowski `7 × 6.63 = 46.4`.
— <https://www.footballguys.com/subscribers/apps/article.php?article=HarstadValueOverBaseline>

**Fix:** pick a unit and enforce it through the whole pipeline. If the baseline is a
season total, the player value must be a season total *from the same projection
horizon*. Mixing a 17-game baseline with a 14-game player projection is the same bug
in a different costume. Label every column with its unit.

### 8.5 Ignoring games played and availability

Distinct from 8.4. Even with consistent units, a season-total projection embeds an
implicit availability assumption, and different sources embed different ones. Some
project 17 games for everyone; some haircut for injury risk; some project a
"per-game rate × expected games."

Symptoms: durable low-ceiling players systematically outrank fragile high-ceiling
ones, or vice versa, with no visible cause. Two projection sources disagree far more
than their per-game numbers do.

This is also the entire justification for the man-games baseline (§4.5): the
*baseline itself* should reflect that you will need more than `N × S` players to
cover a season.

**Fix:** carry `expected_games` as an explicit field. Compute VOR as
`(PPG − Baseline_PPG) × expected_games`. Never infer games from a total.

### 8.6 The FLEX double-count

A FLEX slot is RB/WR/TE-eligible. The tempting implementation adds the flex to *every*
eligible position's starter count:

```
WRONG:  RB baseline = N × (2 + 1) = 36
        WR baseline = N × (3 + 1) = 48
        TE baseline = N × (1 + 1) = 24
        → 12 flex slots have created 36 starts
```

One flex slot per team creates **one** start, not three. The correct treatment
distributes it with coefficients summing to 1.0 across eligible positions, as in
Harstad's formulas (§5.2b):

```
RIGHT (PPR): RB = N × (2 + 0.30) = 27.6   [before the 1.22 multiplier]
             WR = N × (3 + 0.70) = 44.4
             TE = N × (1 + 0.00) = 12.0
             → 12 flex slots create 0.30×12 + 0.70×12 = 12 starts ✓
```

**Fix:** make the flex allocation an explicit vector that you *assert* sums to 1.0 per
flex slot. This is a one-line invariant check and it catches the entire class. The
same invariant applies to superflex (0.75 QB + 0.08 RB + 0.17 WR = 1.00 in PPR).

The allocation weights are themselves scoring-dependent — PPR is 30/70 RB/WR, standard
is 80/20 — so a settings change that alters scoring must invalidate the weights, not
just the counts.

### 8.7 The baseline is a *level*, not a *player*

Using a single player's projection as the baseline imports that one player's
projection error directly into every VOR at the position, as a constant bias. At deep
baselines (WR54, QB33) you are sampling from the noisiest part of the projection
distribution.

**Fix:** smooth. Petersen's approach — average the baseline rank with the ranks
immediately above and below — is minimal and effective:

> "averaged the number of points from this player at each position with the player
> of the same position who was ranked 1 above and 1 below"
>
> — <https://fantasyfootballanalytics.net/2013/04/win-your-snake-draft-calculating-value.html>

A wider window (±2 or ±3) or a fitted curve is better still at deep baselines. Also
note `k` is generally **fractional** (18.72, 33.67, 54.17) — interpolate between
adjacent ranks rather than rounding, or at minimum document the rounding rule.

### 8.8 Baseline index outside the player pool

Covered in §6.3 but it generalizes: deep leagues, superflex, and TE-premium can all
push `k` past the end of your projection table. Silent clamping to the last row makes
the baseline arbitrarily dependent on how many players your projection source happens
to publish — a 300-row source and a 500-row source will give different answers.

**Fix:** fit and extrapolate the tail of the positional curve, or floor the baseline
explicitly. Either way, surface when extrapolation is in effect.

### 8.9 Kickers, defenses, and positions with no meaningful spread

Stuart's regression of Expected VBD against ADP found a dropoff coefficient of
**−32.5 for running backs** vs **−2.5 for defenses**:

> "Unlike at the other positions, the top projected kickers and defenses aren't much
> better than the bottom ones."
>
> — <https://www.footballguys.com/article/stuart_expected_vbd_by_adp>

VOR is technically computable for K/DST but the signal is within projection noise.
Including them in a unified board lends them false precision.

**Fix:** exclude from the cross-position board, or show them separately with an
explicit low-confidence treatment.

---

## 9. Adjacent measures and how VOR relates to them

### 9.1 Points above average

Baseline = positional mean rather than positional replacement. This is DVOA/VOA's
family (§2.2) and Harstad's EVoS (§4.6).

**Relation:** `PAA(i) = VOR(i) − (Mean_p − Baseline_p)`. Within a position it is
another constant shift; across positions it reweights by how far each position's mean
sits above its replacement level.

**When it's better:** detecting distribution *shape* — see the RB/WR example in §4.6
where worst-starter VOR is blind to a scarcity difference that PAA sees immediately.

**When it's wrong:** as a valuation. An exactly-average starter has PAA = 0, implying
he is worth nothing, which is false. Average is not a cost you can actually pay;
replacement is.

**Practical:** use PAA as a diagnostic overlay on VOR, not a substitute. Harstad
publishes both (EVoB and EVoS) rather than choosing.

### 9.2 Market / ADP-implied value

VOR is a *model* of value; ADP is the *market's* revealed value. The interesting
quantity is the residual.

Stuart's *Expected VBD* is the bridge — it models VBD as an expectation over outcomes
(with negatives floored at zero, §8.3) and regresses it against ADP slot, producing
per-position dropoff coefficients (RB −32.5, DST −2.5). This explains draft behavior
that raw VBD does not: positions with steep expected-value dropoffs get drafted early
regardless of where their raw VBD ranks.
<https://www.footballguys.com/article/stuart_expected_vbd_by_adp>

**Watch the circularity.** Any pick-100 or ADP-derived baseline (§4.4) makes VOR
partly a function of ADP. If you then compare VOR against ADP to find "value," you
are comparing the market to a lightly-transformed copy of itself. Keep model
baselines and market baselines in separate lineages if the artifact's job is to
surface market inefficiency.

### 9.3 Auction dollar conversion

VOR's most natural downstream use: dollars are cardinal, and VOR is the only common
cardinal scale across positions. The standard conversion:

```
1.  Total money        = N × budget_per_team
2.  Discretionary money = Total money − (N × roster_slots × min_bid)
3.  Total VOR pool      = Σ max(0, VOR(i)) over the players who will be rostered
4.  $ per VOR point     = Discretionary money / Total VOR pool
5.  Auction value(i)    = min_bid + max(0, VOR(i)) × ($ per VOR point)
```

Illustrative: 12 teams × $100 = $1200; 12 × 7 slots × $1 = $84 minimum; discretionary
= $1116. If the rostered pool sums to 2400 VOR points, $1116 / 2400 = **$0.465 per
VOR point**.
— formula and worked figures per the conventional treatment; see
<https://www.fantasypros.com/nfl/auction-values/calculator.php> for an implementation.
The specific derivation as stated is **UNVERIFIED** against a single authored,
non-paywalled source; see §12.

Three properties worth knowing:

- **Step 3 makes auction values baseline-dependent in two ways at once** — through
  each player's VOR *and* through the size of the total pool, which changes the
  dollars-per-point rate. A deeper baseline raises every VOR *and* inflates the
  denominator, so the effects partly cancel. This is why auction values are more
  robust to baseline choice than raw VOR rankings are, and why baseline critiques
  that cite auction prices (§4.5's "prices seem unfairly low to starters") are
  reporting a second-order effect.
- **Step 3 requires deciding who "will be rostered."** That is itself a
  replacement-level decision, recursively.
- **Dynamic re-solve.** Recomputing steps 2–4 over remaining money and remaining
  players mid-auction is standard and turns the static value into an inflation-adjusted
  one.

---

## 10. Dynasty-specific complications

Single-season VOR does not transfer to dynasty, and the reasons are structural rather
than a matter of tuning.

### 10.1 Why VBD is worth preserving

Harstad's three properties, which are what you are trying not to lose:

> "VBD is precise" — it reveals exact gap sizes rather than just ordering.
> "VBD is directly comparable across positions."
> "VBD is universally applicable" across league settings and scoring systems.
>
> — Adam Harstad, *Dynasty, in Practice: How to Value Players in Dynasty*, Footballguys
> <https://www.footballguys.com/subscribers/apps/article.php?article=HarstadDiP21>

### 10.2 Why it does not extend

**The projection problem.** VOR needs a projection for every player at every position.
For one season that is hard; for five it is not attempted seriously by anyone.
Harstad: "Predicting precisely what's going to happen in 2019, though? Forget about
it. It's a non-starter."

**The heterogeneous-objective problem.** Redraft leagues share one objective. Dynasty
leagues do not:

> "not only do teams play under different scoring systems and lineup requirements,
> but they also play with different windows and goals"

A contender and a rebuilder correctly assign different values to the same player.
There is no single dynasty VOR number, and an artifact presenting one is asserting a
time preference on the user's behalf.

**The moving-baseline problem.** In redraft, replacement level is fixed for the
season. In dynasty it is a *sequence* of baselines — and each future year's baseline
depends on rookie classes, retirements, and league-wide roster construction that
have not happened yet. Replacement level three years out is not merely unknown; it is
partly endogenous to the league's own future behavior.

**The roster-constraint problem.** Dynasty rosters and taxi squads are far deeper than
redraft, so the free-agent pool — the thing Woolner's definition actually points at —
is much thinner and much worse. A waiver-wire baseline computed on redraft assumptions
is badly wrong in dynasty in the direction of being too generous.

### 10.3 The established workaround

Harstad's restructuring replaces per-season projections with two estimated quantities:

> "estimating future value didn't require specific projections at all. Instead, it
> was simply a matter of estimating a player's 'true production level' and his
> estimated time remaining!"

conceptually:

```
Dynasty value ≈ Σ over future years y of:
      (true production level, in points-above-baseline terms)
    × P(still producing in year y)
    × (time discount)^y
```

**Mortality tables, not aging curves.** Harstad's structure uses "a mortality table"
where performance "stays relatively stable until suddenly declining into fantasy
irrelevance," rather than a smooth decline curve — because aging curves are
population-level artifacts that "don't work reliably at individual player levels."
This is a real methodological claim and it matters: a smooth curve says a 29-year-old
RB is 85% of a 26-year-old; a mortality table says he is ~100% with a materially
higher chance of being ~0%. Those imply very different risk profiles for the same
expected value.

**Explicit time discount.**

> "With a 10% time discount, I valued 2016 production at 90% of 2015 production,
> 2017 production as 81% of 2015 production, 2018 production as 73%."

i.e. `weight(y) = (1 − d)^y`, with `d` a user parameter. This is what makes the model
serve both owner types — the difference between contenders and rebuilders is exactly
"time preference — how each values the current season relative to future seasons."

**Design implication:** in a dynasty artifact, the discount rate should be a visible
user control, not a hidden constant. It is the single parameter that encodes "am I
contending or rebuilding," and it is the dynasty analogue of the baseline choice in
§4 — an underdetermined modeling parameter that the user, not the model, should set.

### 10.4 A contrasting production approach: market-derived values

DynastyProcess derives values from consensus rankings rather than from projections at
all:

```
Value = 10500 × e^(FP_ECR × −0.0235)
```

with the exponent as a tuning parameter: −0.0220 "would value depth more highly,"
−0.0250 "values studs more highly." For 2QB they use "a LOESS regression analysis
comparing 1QB and 2QB overall ADP" to convert 1QB rankings to 2QB equivalents.

Their stated assumption and caveats: the method "assumes FantasyPros Expert Consensus
Rankings are an accurate way to determine how players are valued long-term," is
calibrated for "a typical 12 team PPR league," and age adjustments are **not** built
into the standard model.
— <https://dynastyprocess.com/values/>

This is worth contrasting deliberately with Harstad's: it is a *market* model, not a
*value* model. It tells you what a player trades for, not what he is worth, and it
therefore cannot identify market mispricing. The exponential-decay-on-rank shape is
also a substantively different claim from a VOR-derived curve — it imposes a smooth
functional form on the value distribution rather than deriving it from projected
points and a baseline. Comparing the two is a reasonable way to surface disagreement
between model and market.

---

## 11. Sources

Primary, non-paywalled, fetched and verified:

| Source | URL |
|---|---|
| Joe Bryant, *Principles of Value Based Drafting* | <https://www.footballguys.com/article/bryant_vbd?article=bryant_vbd> |
| Footballguys, *Value-Based Drafting: The One Strategy Behind Every Strategy* (2026) | <https://www.footballguys.com/article/2026-value-based-drafting-one-strategy-behind-every-strategy> |
| Adam Harstad, *Rethinking VBD* | <https://www.footballguys.com/subscribers/apps/article.php?article=HarstadValueOverBaseline> |
| Adam Harstad, *A Better Way to Determine VBD Baselines* | <https://www.footballguys.com/article/HarstadVBDBaselines> |
| Adam Harstad, *Calculating New Positional Baselines* | <https://www.footballguys.com/article/HarstadGeneralizingBaselines?article=HarstadGeneralizingBaselines> |
| Adam Harstad, *Dynasty, in Practice: How to Value Players in Dynasty* | <https://www.footballguys.com/subscribers/apps/article.php?article=HarstadDiP21> |
| Chase Stuart, *Expected VBD: Explaining How and Why We Draft* | <https://www.footballguys.com/article/stuart_expected_vbd_by_adp> |
| FantasyPros, *Value-Based Drafting (VORP, VOLS, VONA)* (2025) | <https://www.fantasypros.com/2025/06/fantasy-football-draft-strategy-value-based-drafting-vorp-vols-vona/> |
| FantasyPros, *What is Value Based Drafting?* (2017) | <https://www.fantasypros.com/2017/06/what-is-value-based-drafting/> |
| Isaac Petersen, *Win Your Snake Draft: Calculating VOR using R* | <https://fantasyfootballanalytics.net/2013/04/win-your-snake-draft-calculating-value.html> |
| Fantasy Football Analytics, *Winning Fantasy Football with Projections, VOR, and VBD* (2024) | <https://fantasyfootballanalytics.net/2024/08/winning-fantasy-football-with-projections-value-over-replacement-and-value-based-drafting.html> |
| Isaac Petersen, *Fantasy Football Analytics* textbook — Player Evaluation (§6.12.2.2) | <https://isaactpetersen.github.io/Fantasy-Football-Analytics-Textbook/player-evaluation.html> |
| Isaac Petersen, *Fantasy Football Analytics* textbook — The Fantasy Draft | <https://isaactpetersen.github.io/Fantasy-Football-Analytics-Textbook/draft.html> |
| Subvertadown, *Guide to understanding the different baselines in VBD* | <https://subvertadown.com/article/guide-to-understanding-the-different-baselines-in-value-based-drafting-vbd-vols-vs-vorp-vs-man-games-and-beer-> |
| 4for4, *An Introduction to 2QB and Superflex Leagues* | <https://www.4for4.com/2023/preseason/introduction-2qb-and-superflex-leagues> |
| Fantasy Football Data Pros, *A Value-Based Draft Model* | <https://www.fantasyfootballdatapros.com/blog/intermediate/5> |
| DynastyProcess, *Market Values* methodology | <https://dynastyprocess.com/values/> |
| Baseball Prospectus, *Prospectus Toolbox: Value Over Replacement Player* | <https://www.baseballprospectus.com/news/article/6231/prospectus-toolbox-value-over-replacement-player/> |
| Tangotiger wiki, *VORP* (Woolner formulas) | <https://tangotiger.net/wiki_archive/VORP.html> |
| Wikipedia, *Value over replacement player* | <https://en.wikipedia.org/wiki/Value_over_replacement_player> |

Woolner's original publications, referenced but not fetched (see §12):
*Introduction to VORP: Value Over Replacement Player*, Stathead.com (2001) and
*VORP: Measuring the Value of a Baseball Player's Performance*, Stathead.com (2002).

Consulted and found **paywalled** — not used as sources:

- RotoViz, *Using MFL10 Data to Empirically Derive Value Based Drafting Baselines*
  <https://www.rotoviz.com/2014/01/using-mfl10-data-to-empirically-derive-value-based-drafting-baselines/>
- RotoViz, *Zero RB, Antifragility, and the Myth of Value-Based Drafting*
  <https://www.rotoviz.com/2013/11/zero-rb-antifragility-and-the-myth-of-value-based-drafting/>

Both are frequently cited in this literature. The RotoViz line of criticism —
Shawn Siegele's argument that VBD's reliance on point projections is its weak link —
is relevant to §8 but I could not read it, so it is not represented here beyond this
note.

---

## 12. UNVERIFIED — explicitly flagged

Items I could not confirm against a live, non-paywalled primary source. Treat as
plausible but unconfirmed.

1. **Date of Bryant's original VBD article.** Sources say "1995," "1996," and
   "almost 30 years ago." I could not find a dated original. Stated in §2.3 as
   "mid-1990s."

2. **David Dodds' baseline formula.** Search results attribute the pick-100 refinement
   and a settings-driven estimation formula to Dodds, and report that Footballguys
   "settled on using 100 players for most leagues" after ~14 years. His primary
   article is at `apps.footballguys.com`, which no longer resolves (DNS failure). The
   pick-100 *method* is verified via Bryant's article; the *attribution to Dodds and
   the formula's contents* are not.

3. **Football Outsiders' exact replacement-level derivation.** `footballoutsiders.com`
   no longer resolves. The reported method — splitting out "the final 10 percent of
   passes or runs" as replacement players and comparing them to the other 90 percent,
   with replacement level moving year to year as of DVOA v7.0 — comes from search-result
   summaries of the now-offline `/info/methods`, `/help/article/dyar`, and
   `/dvoa-ratings/2012/introducing-dvoa-v70`. The FTN successor page
   <https://ftnfantasy.com/nfl/dvoa-explainer> returns HTTP 403 to automated fetch.
   The VOA/DVOA/DYAR *definitions* in §2.2 are well corroborated across multiple
   secondary sources; the *specific 10-percent derivation* is not directly verified.

4. **4for4's combined-starter-baseline argument for superflex (§6.4).** From a
   search-result summary of 4for4 material I could not fetch in full. The *supply*
   quote in §6.1 is verified from the fetched 4for4 article; the combined-baseline
   *argument* is not.

5. **The auction dollar conversion derivation (§9.3).** The formula is standard and is
   an arithmetic identity given the budget constraint, and it appears consistently
   across multiple secondary discussions, but I could not verify it against a single
   authored, non-paywalled primary article. The FantasyPros auction calculator is
   cited as an implementation, not as a documented derivation.

6. **All projection numbers in §7 are synthetic**, constructed by me to have realistic
   shape. They are not projections and should not be used as such. The *arithmetic*
   performed on them is exact and reproducible. Real verified projection figures
   appear only in §4.2 (FantasyPros 2025) and §4.6 / §8.4 (Harstad's published data).

7. **The observation in §5.3** that Harstad's theoretical formulas reproduce his own
   empirically measured baselines is my computation and my inference, not a claim he
   makes. The formulas and the measured table are both his and both cited; the
   comparison between them is mine.
