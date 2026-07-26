# 009 — working notes, session 2026-07-25

Self-directed session under the standing licence. Strand 1 (outsider product thinking).
Nobody asked for this. Notes written as I go because conversation memory does not survive.

## The morning ritual (what I actually did first)

Ran the live app at 127.0.0.1:8000 and used it the way a manager would: default screen, roster
audit, league pulse, trade lab, roster capacity. Screenshots in
`assets/009-morning-2026-07-25/`.

The thing that stopped me: **League Pulse**. It is the app's only answer to "who do I trade with",
and it renders as a **43,634-pixel-tall raw JSON dump** — `partner_score 2.168`,
`complementarity_score 0.92`, `divergence_density_score 1.00`, label/value pairs stacked
vertically, eleven times, then twelve times, then twelve times again, then 31 opportunity cards
titled `ROSTER_SURPLUS_DEFICIT_MATCH` and `UNROSTERED_MODEL_MARKET_DIVERGENCE`.

That sent me into the data instead of into a chart (the 008 lesson: domain first).

## What I measured — league settings, read from the snapshot, not assumed

`league.roster_positions` = QB, RB, RB, WR, WR, TE, FLEX, FLEX, SUPER_FLEX + 11 BN = 20 active.
`settings.draft_rounds` = **3** (confirms the rookie draft is three rounds).
`scoring_settings`: rec 1.0 (full PPR), pass_td 4.0, pass_yd 0.04. 12 teams, superflex.
League name: Redzone Champions League.

## FINDING 1 — every league-snapshot surface is pinned to 2026-06-23; fresh data is on disk

`/api/league/pulse` → `source_artifacts.team_posture.captured_at` = **2026-06-23T13:17:30**,
`team_value_matrix.captured_at` = **2026-06-23T13:17:30**.
`/api/trade/assets?q=...` → `source_timestamp` = **2026-06-23T13:17:20**.
`/api/roster/capacity` → `sleeper_snapshot_captured_at` = **2026-06-23T13:17:20**.

Meanwhile `app/data/league_runtime/runs/` contains a **daily** run through
`league-20260724T132000Z`, each carrying `snapshot.json`, `team_posture.json` and
`team_value_matrix.json`. Today's `team_posture.json` reads `captured_at 2026-07-24T13:20:03`.

So 003's F1 (schedule the capture) landed and F2 (make the surfaces read it) did not. Four
surfaces, one root cause.

**Cost, measured:** 4 of 12 posture labels differ between what the API serves and what today's job
wrote — and they are the labels a rebuilder would use to pick a counterparty:

| team | served (Jun 23) | on disk (Jul 24) |
|---|---|---|
| MDEF | BALANCED | **CONTENDER** |
| Free Kelly | BALANCED | **CONTENDER** |
| Seidmans Sasquatches | ASCENDING | **REBUILDING** |
| Kissane's Team | CONTENDER | **BALANCED** |

David's own starter-weighted z also moved −2.258 → −1.404; his rebuild is measurably progressing
and the app is showing him a month-old picture of it.

## FINDING 2 — starter_xvar excludes IR and taxi, and he is the league's extreme outlier

`lineup_role` of `ir` or `taxi` removes a player from `lineup.starters`, so he contributes nothing
to `starter_xvar`. That number is 60% of the posture score and the base of every positional
z-score, the surplus/deficit labels, and the partner rankings.

Share of roster market value sitting in `ir`/`taxi` and therefore invisible:

| team | share | excluded top-100 assets |
|---|---|---|
| **Dleess** | **26.6%** | Garrett Wilson #43 (ir), Fernando Mendoza #44 (taxi), Tucker Kraft #61 (ir) |
| rzalika | 17.6% | Malik Nabers #17 (ir) |
| jspagnola | 5.2% | Daniel Jones #85 (ir) |
| jkazzz | 4.7% | — |
| Dseidman | 4.4% | — |
| MJLeess318 | 3.8% | — |
| MDEF | 3.4% | — |
| rkissane | 2.9% | — |
| jspringe88 | 1.7% | — |
| jlillian80 | 1.4% | — |
| jgil96, kgelardi | 0.0% | — |

League median 3.4%. **He is 7× the median and the only team with three excluded top-100 assets.**
Consequence: our model starts **AJ Barner at −5.64 xVAR** at TE (Tucker Kraft, market TE#61, is
`ir`) and puts **Tank Dell at 0.00 xVAR in the SUPER_FLEX slot** of a superflex league (Fernando
Mendoza, market QB#44, xVAR 10.31, is `taxi`).

It is July. Taxi is rookies-only by rule — it is where you are *supposed* to put valuable rookies.
So the metric is blindest to exactly the roster profile the app's user has. Same shape as the 008
finding about the flat pick model.

## FINDING 3 — the league layer compares a current-season measure to a dynasty price

`team_value_matrix` carries `raw_xvar` per player; `dynasty_value_score` is null throughout.
But `/api/players/{id}` **does** return a DVS per player (Jeanty 75.3, Josh Allen 99.0,
Justin Jefferson 81.6, Parker Washington 73.8).

xVAR is value-above-replacement (roughly current-season). FantasyCalc's value is a discounted
future price. Ranking both and calling the difference "divergence" fails the same-definition test
(`craft/metric-validity.md` §A.2). The tell, measured within position so age cannot hide in the
position mix:

- "we like far more than the market": Deebo Samuel 30.5, Jauan Jennings 29.1, Courtland Sutton
  30.8, Stefon Diggs 32.7, Austin Ekeler 31.2, Joe Mixon 30.0, James Conner 31.2, Davante Adams
  33.6 — eight of the top fourteen are 29+.
- "market likes far more than we do": Nabers 23.0, Tuten 23.5, Golden 23.0, Singleton 22.6,
  Bigsby 23.9.

This reproduces 005's age-artifact finding *even with the within-position control David asked for*,
which means the control does not fix it — the two lanes are measuring different quantities.

## Where the variance actually lives (measured BEFORE choosing any axis)

Coefficient of variation across the 12 teams:

| dimension | cv | range |
|---|---|---|
| count of top-25 overall assets | **0.886** | 0 – 7 |
| share of value aged 28+ | **0.548** | 0.0% – 36.4% |
| count of top-50 overall assets | 0.517 | 2 – 9 |
| value of top two QBs | 0.317 | 3,703 – 15,354 |
| total roster value | 0.265 | 27,753 – 85,469 |
| top-3 concentration | 0.122 | 30% – 43% |
| value-weighted age | 0.048 | 23.9 – 27.6 |

**Killed before drawing:** "idle bench value" (share of roster value contributing nothing to the
best legal lineup). I expected it to separate him. It does not — he is 33.7% against a league
range of 21–38.5%. Everyone carries a third of their value on the bench because that is what a
20-man roster with 9 starters *is*. Recorded here instead of plotted, per the standing rule.

Also killed: top-3 concentration and value-weighted age — both nearly flat. Note the pair:
value-weighted **age** barely varies (cv 0.048) while share of value in the **28+ tail** varies a
lot (cv 0.548). The mean hides what the tail shows (`craft/uncertainty-viz.md` §A).

## The two things that actually separate him

- **Top-end talent: he has one top-25 asset** (Jeanty #12). jspagnola has seven. League mean 2.1.
- **Age tail: 0.0% of his value is aged 28+.** League mean 22%, max 36.4%. Only he and rzalika
  are at zero.

He is 4th of 12 in total roster value and 6th of 12 in best-legal-lineup value (market lane).
So the shape is **breadth without a top**, on the youngest inventory in the league, plus 16 picks.

The consequence that matters: the classic rebuilder's play David himself taught me — sell aging
veterans to contenders for picks — **is not available to him.** He has no aging veterans. He has
already run that play. Whatever region 3 of the ladder ("what should I do?") is for him, it is not
that.

## Category research

KTC Power Rankings is the closest thing in the category: a ranked list of teams by total value,
per-team positional strength, a radar graph, a team-vs-team comparison, and an **"Age v. Value"**
scatter that is *player-level within one team* (age on x, value on y). Its stated use case is
"find trade partners who are weak at a position where your squad has depth."

Nobody in the category puts the whole league on one strategic map. That is the divergence — and it
is also the risk, because David's standing doctrine is to copy the category's structure and spend
the originality budget only on the juxtaposition.

Sources: keeptradecut.com/dynasty/power-rankings; dynastynerds.com "Dynasty Trade Secrets — Roster
Construction" and "2-3 Year Window"; playerprofiler.com "Dynasty Roster Construction".

## Open — decide before building

Region 3 of the approved ladder ("what should I do?") is the only region with no designed surface,
and its trade-partner-fit clause is the part the app answers with a JSON dump. But three cautions
apply and I am holding them in view:

1. A counterparty surface is prescription-adjacent. The 2026-07-23 bar: assemble the case, soft
   earned lean, never a verdict.
2. **Willingness is unobservable.** Sleeper's transactions endpoint is not called anywhere in the
   codebase (§4), so there is no trade history and no read on intent. Any such surface shows *fit*,
   never *interest*, and must say so on its face.
3. Anything I build on the league snapshot inherits Finding 1. The relay is a prerequisite for the
   design, not a side quest.


---

# Session 2026-07-25 — the framework test (David's question at the gate)

David, after reacting well to the board: *"is the visualization helping me? what is it helping me do…
what are we visualizing that will surface opportunity or confirm strategy? does the layout and viz
have the framework so that when the data is signaling an actual opportunity the visual layout and
slices will show it to me?"*

Answered by measurement, not argument. **Verdict: the board orients, it does not surface opportunity.**
Three provable reasons:

1. **It encodes rank; a trade is denominated in value.** You cannot size a deal on a rank axis. My own
   footnote said "rank is not value" — and that footnote invalidates the surface for the job David is
   asking about. (The 2026-07-24 rule: read your own caveats as design criticism.)
2. **It shows one player per team by default.** A buy-low is somebody's WR3, not their WR1, so the
   collapsed view structurally hides the candidate set.
3. **It never shows two sides at once.** A trade is two-sided; the board is always one side.

## FINDING A — the complementarity premise is empirically dead in this league

The app's `ROSTER_SURPLUS_DEFICIT_MATCH` cards, and KTC's advertised use case ("find partners weak at
a position where you're deep"), both rest on gains-from-trade through lineup complementarity.
Measured against best-legal-lineup value:

- My best idle asset (Omar Cooper Jr., 1,993) upgrades another team's starting lineup by at most
  **642** — and by 5 to 236 for most teams — against rosters worth ~50,000.
- Every star I would want costs its owner almost exactly what it gains me: Bijan Robinson **+8,206 to
  me / −8,344 to them**; Ja'Marr Chase **+7,883 / −8,258**; Jahmyr Gibbs **+7,860 / −7,017**.

In a 12-team superflex with 20 active slots, everyone's lineup is already filled by their best
players and a bench piece is a bench piece everywhere. There is no free lunch on this axis. This is a
measured refutation of the premise, not a design opinion.

## FINDING B — translating our rank into market currency DOES produce a concentrated signal

Construction: for each position, take the market's price curve by rank. Our model ranks a player
*n*-th; the market pays `curve[n]` for the player it ranks *n*-th. **Implied − actual = the edge**,
denominated in the market's own currency. This is exactly the normalisation David asked engineering
for on 2026-07-15 ("normalize model outputs into market-comparable space").

Held by others: Rashee Rice **+6,302**, Christian McCaffrey **+5,982**, George Kittle **+4,245**,
Matthew Stafford **+3,246**. League-wide absolute edge 189,304 across 242 players, median |edge| 434 —
so it is concentrated in a short head, not smeared.

**Mine are all negative at the top:** Jeanty **−4,018**, Burden **−1,976**, Henderson **−1,916**,
Dart **−1,722**, Odunze **−1,443**. Net roster edge **−2,663**.

## FINDING C — and this time it is NOT the age artifact that killed 005

Regressing edge on age within each position:

| pos | n | slope (value per year) | R² of age alone |
|---|---|---|---|
| RB | 69 | +209.8 | 0.174 |
| TE | 40 | +196.5 | 0.206 |
| QB | 39 | +43.6 | 0.018 |
| WR | 94 | +47.3 | 0.014 |

**Pooled, age explains 10.7% of the edge; 89.3% survives as residual.** The head of the list barely
moves: Rice's residual is **+6,263** at age 26.3 — mid-range, not an old-player story.

Why this differs from the rank-space measurement earlier the same day (r(age,gap) +0.22 to +0.31):
**rank space compresses magnitude, value space preserves it.** The age effect is real but small in
absolute value; it dominates a rank ordering and does not dominate a dollar ordering. That is a
methodological correction to 005's framing and to my own from this morning, and it means the
model-vs-market comparison is **not** mostly an age re-pricing.

## What I did NOT do, deliberately

I did not put "buy Rice, sell Jeanty" on a surface. That is a price claim about specific players and
it carries the 2026-07-23 bar — the Garrett Wilson error in a new costume otherwise. Two things must
resolve first:

- **P2 poisons this measure.** Fifteen ACTIVE_B players return null and are stored as 0.0; ranked,
  they read as strong negative opinions. Any edge computed from our ranks inherits that.
- **The alternative explanation is live.** "Our model thinks the market overpays for exactly what he
  holds" is either a genuine strategic read (his conversion window is now) or a systematic model bias
  against young unproven players — and that is precisely what relay 004's confirmed N0 position-skew
  is still open on. I cannot tell which yet, and saying it either way would be a shallow prescription.

## The framework fix, if the thread resumes

The opportunity instrument is **the same board, denominated in market currency instead of rank**: one
row per player, position-filtered, bar length = edge in market dollars from a zero baseline, both
sides of a candidate deal visible at once, and the depth of every roster shown rather than each
team's best. That is a different surface from the one built today; today's board is the orientation
layer under it, and David's reaction was to the orientation layer only.

**Not started. Not authorised. Parked here so the next session inherits the measurement, not the idea.**
