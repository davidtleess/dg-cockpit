# 018 — The half that repeats

**Self-directed.** Nothing about this was asked for. It began as an attempt to *extend* 017 and
ended by refuting 017's organising axis.

**Status: drafted, shown to David 2026-08-08. Not approved, nothing relayed.**

---

## The correction that has to come first

017 orders its whole table by **role change** — how much a player's job grew or shrank across
2025 — and marks the top and bottom of that ordering. David reacted to it on 2026-08-07 with the
strongest confirmation of a question this lane has had, and he restated the thesis back in his own
words: *"role plays a big factor in production — growth or decline in role is a legitimate signal."*

**I have now measured that and I cannot demonstrate it.** Five tests, all on the product's own
eight seasons of `ff_opportunity`, none of them weakened after seeing the result:

| # | test | result |
|---|---|---|
| 1 | Does the last-6-game role predict next season's role better than the season average? | **No.** r = 0.729 vs **0.767**. The finish is the *worse* forecast. |
| 2 | Does role change add anything the season average doesn't already carry? | **ΔR² = +0.003** (t = 3.07, n = 1,154). Significant, negligible. |
| 3 | Same, with survivorship fixed — carrying players who lost the job at role = 0 | **ΔR² = +0.009.** Matched pairs 54%, p = 0.042. Still tiny. |
| 4 | Does role change predict whether he keeps a job at all, holding role level and age fixed? | **No.** 32/54 matched pairs = 59%, **p = 0.22**. |
| 5 | Pre-specified: does it hold for the young players 017 is actually about (yrs 1–2)? | **ΔR² = +0.011** (t = 3.66) vs **0.000** for established players — a real difference between the groups, and still nothing you could act on. Assumption-free version: 136/265 = **51%, p = 0.71**. |

The raw attrition gap looked promising — players whose role grew lost the job next year 23% of the
time against 36% for those whose role fell — but it does not survive its obvious confound. A player
whose role grew *ends the season with a bigger role*, and big-role players keep jobs. Test 4 holds
role level and age fixed and the gap collapses to a coin flip.

**What this means for 017:** the question is right and David's restatement of it is right — role is
the thing to look at. What is not supported is treating the *trajectory* as the signal. The season's
role level is the better number, and 017's ordering implies otherwise. **017 should be re-ordered by
role level and the trajectory demoted to a per-row annotation.** That change is not made yet.

**Test 6 could not be run at all:** the mechanism hypothesis — that a role change caused by a real
change in circumstance (a mid-season trade) predicts where random wobble does not — has **24 cases in
eight seasons**. Untestable, therefore neither supported nor refuted. Recorded rather than quietly
dropped, because 017's own hero (Mitchell, traded to the Jets in week 11) is exactly that case.

---

## Problem

A fantasy season is two things fused into one number: **the job a player was given** — what his
targets and carries were worth at league-average efficiency — and **what he did with it**. Every
screen in this product, and every market price it overlays, reads the fused number. The two halves
behave completely differently, and nothing in the app separates them.

## Evidence

**1. One half repeats and the other does not. Measured in-house, not cited.** 017 sourced this to a
Fantasy Footballers article (74% of receivers give back their over-performance). Across the eight
seasons on disk, 1,154 player-seasons, every back / receiver / tight end with 10+ games in both years:

| | year-to-year r |
|---|---|
| **the job** (expected points per game) | **0.767** |
| **what he did with it** (points above or below the job) | **0.195** |

All seven season-pairs agree (role 0.745–0.804; conversion 0.116–0.241). My in-house "gave it back"
rate is **72%** against the published 74% — an independent replication.

**2. It reverts symmetrically, and the buy side is the stronger half.**

| starting fifth | was | became | share moving toward zero |
|---|---|---|---|
| top fifth by conversion | +2.15 /g | +0.55 /g | 82% fell |
| bottom fifth | −1.65 /g | −0.20 /g | **90% improved** (+1.45 /g) |

About **19%** of a season's conversion survives into the next one.

**3. The market pays a real premium for the half that does not repeat.** Log market value on role,
conversion, age and position, n = 203 (RB/WR/TE with 2025 tape, in both lanes):

| | β (SD of value per SD) | t |
|---|---|---|
| the job | **+0.762** | +10.3 |
| what he did with it | **+0.134** | +2.4 |
| age | −0.315 | −6.9 |

Bootstrapped over 4,000 resamples: **+0.125, 95% CI [+0.049, +0.205]**, 100% of resamples above
zero. Robust to adding touchdown rate (β −0.03, t −0.3) and draft capital (conversion rises to
+0.147, t +3.1). Model-free, over 2,000 random matched pairings on position + role + age: the more
efficient player is the more expensive one in **62% of pairs, 95% of pairings falling in 53–71%**.

**4. What was killed on the way, because a surviving claim is only worth what the dead ones cost.**
My opening hypothesis was that *the market is blind to role and prices only production*. It is the
reverse: the market prices role almost completely (β +0.76) and conversion only slightly. That
hypothesis died in the first regression and the surface was built on what replaced it.

**5. Two of my own instruments disagreed and neither was quoted until it was resolved.** A
matched-pair test reported 65% supporting and 25% refuting on the same data. Both used adjacent
pairs after an arbitrary sort. Replaced with 2,000 random maximal matchings, which is stable at 62%
(53–71%) across three tolerance settings. The 25% was an artifact of the pairing, not a finding.

**6. No room-level claim survives.** Four of his 14 full-season players sit in the league's bottom
fifth for conversion against 20% expected — p ≈ 0.30. **So the surface names players and refuses to
characterise a room**, which is the same refusal 017 arrived at independently.

## Proposal

Split the fused number wherever the product shows a player's season, and draw the split:

- **The mechanism, once, at the top** — the league in fifths, followed into the next season, for
  each half. The job's fifths stay apart; the conversion's fifths collapse onto each other. That
  collapse is the entire argument and it is a shape, not a statistic.
- **Per player** — one shared PPR-points-per-game axis, a filled mark for the job, an open mark for
  what he scored, the bar between them as the non-repeating half, and the position's weekly-starter
  role as a dashed reference.
- **Three ranks in the margin** — the job (from the tape), ours, and the market's — all ranked
  inside the *same* pool, because ranking a job against one population and a price against another
  manufactures a gap out of the pool sizes alone.
- **Position groups QB → RB → WR → TE**, with quarterbacks deliberately excluded from the axis
  (a QB's weekly-starter job is worth 14.55 a game against a receiver's 11.31; putting them on it
  compresses everything else).

The sharpest thing on his roster: **Rome Odunze had the equal-biggest receiving job on the team —
14.4 points a game, tied 12th of 93 — and converted it worse than 97% of the league.** Nine of ten
players in that position improved the following season. That is decision support: it says which half
of his 2025 line to believe, not what to do about it.

## Prototype

`proposals/018-what-repeats/index.html` — data from `build.py`, nothing transcribed.
Serve it (never `python3 -m http.server`, which caches and put a blank page in front of the client
on 2026-08-07):

```
node /Users/davidleess/frontend-studio/tools/serve018.mjs
node /Users/davidleess/frontend-studio/tools/shot018.mjs 1440        # render + audit
node /Users/davidleess/frontend-studio/tools/shot018.mjs --break     # assert the failure state
```

Verified at 1440 / 1024 / 390: no page overflow, no text under the 13px floor **as rendered**, no
console errors, 18 tracks, 21 rows. Failure state fires on broken data (465 visible characters
saying so) and clears when restored.

## Costs

- **It re-opens 017**, which David reacted well to, and the re-ordering is not done. Iterating by
  addition is the failure mode he named on 2026-07-30; this is a subtraction (an axis comes out)
  but it is still churn on a surface that had landed.
- **The population effect is modest and individual players are not explained by it.** Burden is
  priced 14th of 93 on a job that ranked 65th — a 51-rank premium that conversion cannot begin to
  account for. That is draft capital and age, and the surface says so in as many words rather than
  implying a mispricing. **This figure cannot tell him anyone is overpriced**, and it says that.
- **It is 2025 tape in August 2026.** A player's job can be reassigned in camp, and the app's
  depth-chart feed has been static since 2026-03-14 (relay 017 R4), so the surface cannot see it.
- **The roster snapshot is 46 days old** (2026-06-23). Stated on the surface. Still relay 003.
- **No charting library exists in the product** — four runtime dependencies, no viz layer — so
  everything here is hand-rolled SVG that is not directly liftable into the React codebase.

## Open questions

1. Does the split earn its place, or is "what his job was worth vs what he scored" one abstraction
   too many for a daily read?
2. Should 017 be re-ordered by role level now, or left alone until this direction is settled?
3. The mechanism hypothesis (test 6) needs a bigger sample than eight seasons of one league's worth
   of mid-season trades. Is it worth pursuing at league-wide scale, or parked?
