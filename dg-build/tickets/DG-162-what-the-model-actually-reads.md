# DG-162 — What the model actually reads, and what we hold that it never sees

**Layer:** 3 · **State:** MEASURED (no code changed) · **Lane:** Bob · **DG 3.0** · **data usage · model honesty**
**Source:** David's instruction, carried by Greg 2026-09-04: make the model robust, and address *"the usage of the
data we have at our fingertips and the pipelines that we will be ingesting data from"*. Every ticket that landed on
09-04 was scale or display; nobody had looked at the data half. Measured 2026-09-04 20:30–21:00 ET by Bob.
Read-only in trunk; nothing was retrained, promoted or deleted.

---

## ⛔ THE REPRODUCTION TRAPS — four of them, read before measuring anything

1. **The served models are NOT `app/data/models/*.pkl`.** Those four files are a different, older set. The served
   Engine B models are named by `app/data/models/engine_b/v2_manifest.json` → `runs/20260831T204458Z/{qb,rb,wr,te}_v2.pkl`.
2. **The 39 GB warehouse is not the model's input path.** `scripts/assemble_engine_b_dataset.py` pulls
   `player_stats`, `rosters`, `snap_counts`, `pbp` and `participation` **live from `nflreadpy`** at assembly time.
   The warehouse (`app/data/nflverse_usage.db`) reaches the feature build through exactly one function,
   `load_nextgen_from_export`, and contributes **six NGS columns and nothing else**. Auditing the warehouse as if it
   were the feature pipeline will produce a wrong answer in either direction.
3. **The training CSV and the runtime store are not the same shape.** `engine_b_features_v2.csv` has 40 columns;
   `features_runtime/engine_b_features_runtime.csv` has 44. The four extra are the 09-01 games lags (§5).
4. **Ridge coefficients are not importances here.** Alphas run 10 → 1000 across the four models and the inputs are
   collinear, so raw coefficients rank badly. Everything below uses a **drop test** instead: replace one column with
   the model's own imputer median, rescore the live population, and report how far the served DVS moves.

---

## 1. THE HEADLINE

**The product reads three columns.** Points per game in the feature season, games played, and age. Everything else
in the four models is, at best, a rounding adjustment — and for two of the four positions it is measurably worth
nothing at all.

Leak-free walk-forward (expanding window by season, training seasons ≤ *s*−3 so no training row shares an outcome
season with the test row — the DG-027 rule), full shipped feature set vs. `ppg_t + games_t + age` alone, paired and
bootstrapped 2,000× clustered on player:

| pos | features | n | Δr² vs 3 columns | 90% CI | Δ Spearman | 90% CI | detectable? |
|---|---:|---:|---:|---|---:|---|---|
| **QB** | 17 | 95 | +0.030 | [−0.027, +0.088] | +0.002 | [−0.039, +0.043] | **no — both span zero** |
| **RB** | 13 | 284 | −0.000 | [−0.012, +0.011] | −0.001 | [−0.009, +0.006] | **no — both span zero** |
| **WR** | 16 | 456 | +0.010 | [+0.001, +0.019] | +0.009 | [+0.003, +0.015] | yes, and tiny |
| **TE** | 16 | 244 | +0.008 | [+0.000, +0.017] | +0.013 | [+0.006, +0.021] | yes, and tiny |

For **QB and RB the entire feature apparatus beyond three columns buys nothing we can detect.** RB's point estimate
is *negative* on both metrics. For WR and TE the gain is real and excludes zero, and it is about one hundredth of r².

`ppg_t` alone reaches r² 0.320 / 0.572 / 0.623 / 0.588 (QB/RB/WR/TE) against the shipped 0.383 / 0.600 / 0.661 / 0.605.
The obvious objection — that the other features are handicapped by a missing scaler rather than genuinely idle —
is the right objection, and §2b tests it. It is false.

## 2. THE DROP TEST — 24 of 62 feature slots cannot move a displayed number

Per feature: set it to the imputer median, rescore all 505 players in the live inference partition, convert to DVS
points (`Δppg / P90 × 100`). A feature whose **maximum** movement across the whole population is under 0.5 DVS
cannot change a number on any card, for anyone, today.

| position | features | dead (max < 0.5 DVS) | the dead ones (max DVS shift) |
|---|---:|---:|---|
| QB | 17 | **10** | is_dual_threat .24 · ppg_t−2_available .18 · snap_share_t−1_available .11 · **snap_share .09** · ppg_t−1_available .08 · **ngs_avg_time_to_throw .04** · **aging_curve_value .03** · **epa_per_dropback .02** · **dakota .01** · snap_share_t−1 .007 |
| RB | 13 | **6** | ppg_t−2_available .33 · ppg_t−1_available .21 · snap_share_t−1_available .13 · **aging_curve_value .06** · snap_share_t−1 .03 · **snap_share .003** |
| WR | 16 | **5** | **weighted_opportunity .32** · snap_share_t−1 .30 · **snap_share .23** · **aging_curve_value .06** · **tprr .02** |
| TE | 16 | **3** | **aging_curve_value .49** · snap_share_t−1_available .20 · **tprr .05** |

Four findings worth saying out loud:

- **`snap_share` — the flagship usage feature — moves nothing.** Max 0.09 DVS for QB, **0.003** for RB, 0.23 for WR.
  Only TE uses it (max 4.43), and there its coefficient is **−0.886**: more snaps, lower score.
- **Three of the four QB efficiency signals are dead.** `epa_per_dropback` 0.02, `dakota` 0.01,
  `ngs_avg_time_to_throw` 0.04. Only `cpoe` survives (max 10.26) — and `ngs_completion_percentage_above_expectation`,
  which duplicates it at r = 0.852, contributes 0.54.
- **`aging_curve_value` is dead in all four models** (.03/.06/.06/.49) while raw `age` is a top-five driver in every
  one of them (max 6.3/11.0/16.1/12.3). We fit an aging curve and the model prefers the raw number.
- **`tprr` is dead in both positions that carry it** while `yprr` earns its place (WR 2.98, TE 2.76).

NGS, in contrast, is alive where it was placed on 07-31, except at QB: RB 1.65/0.95, WR 1.04/0.59, and **TE
7.27/6.91 — genuinely strong.** The old *"premium data reaches zero coefficients"* claim is correctly superseded.

## 2b. IT IS NOT THE MISSING SCALER — the deciding test, and it comes back negative

**Engine B v2 has no `StandardScaler`.** It is a bare `RidgeCV` on an imputer's output. Ridge penalises by *raw*
coefficient magnitude, so a feature on a 0–1 range needs a large coefficient to matter and is shrunk hardest. The
dead list in §2 sorts almost perfectly by standard deviation — alive: ppg_t 5.35, games_t 4.06, age 2.84; dead:
snap_share 0.27, weighted_opportunity 0.20, aging_curve_value 0.17, tprr 0.055. `models/availability.py` names this
mechanism in its own docstring, and DG-017's falsifier already measured the consequence: under a scaled+tuned fit
usage weight rises 9→30% (QB), 0.3→12% (RB), 3→32% (WR), 1→35% (TE).

So the obvious hypothesis is that the features are not dead, only handicapped. **Tested today. It is false.**
Same leak-free folds, same alpha grid, StandardScaler inserted between the imputer and the ridge, all arms measured
against a scaled three-column model, bootstrapped 1,500× clustered on player:

| pos | FULL unscaled (shipped) r² | FULL **scaled** r² | 3-col scaled r² | scaled full − 3-col | 90% CI |
|---|---:|---:|---:|---:|---|
| QB | 0.383 | 0.351 | 0.352 | **−0.001** | [−0.077, +0.067] |
| RB | 0.600 | 0.598 | 0.591 | +0.006 | [−0.014, +0.023] |
| WR | 0.661 | 0.659 | 0.651 | +0.008 | [−0.010, +0.028] |
| TE | 0.605 | 0.607 | 0.592 | +0.015 | [−0.008, +0.040] |

**Scaling redistributes the weight and does not improve the forecast.** Every scaled arm is within noise of the
shipped one, and once scaled, *no position* beats three columns detectably — including WR and TE, whose small
advantage in §1 does not survive the wider intervals of the scaled fit. For QB scaling slightly hurt.

This answers **DG-025** ("ablate usage features under a scaled, tuned fit — the deciding test"), which has sat as
`todo` since the board opened: **the usage features do not earn their place even with the scale handicap removed.**
It also completes DG-017 — that ticket showed the weight moves and reported accuracy "within noise"; this adds the
comparison it did not make, against three columns rather than against itself.

⚠ What this does *not* license: "add the scaler". It changes what the model says about itself without changing what
it predicts, and it would move every published number. That is a DG-058/059 promotion decision, not a cleanup.

## 3. THE FEATURE STORE IS WELL GOVERNED — this is the part that is fine

44 runtime columns: **24 read by at least one model**, 9 metadata/outcome, **11 computed and read by none.**

Seven of those eleven are **deliberately excluded with a written reason** in `engine_b_contract.py`:
`route_participation` (r = 0.785 with snap_share), `total_points_t`, `dropback_count`, `pass_attempts` (all
redundant), `air_yards_share` and `target_share_nfl` (r = 0.95–0.98 collinear — keeping all three inverts Ridge),
and `te_role_is_risk_profile` (dropped 06-26, contamination artifact). That is governance working, not slack.

## 4. THE WAREHOUSE: 411 columns held, 6 reach a model

`app/data/nflverse_usage.db` — 13 tables, **2,718,461 rows, 411 substantive columns**, recaptured daily at 10:15
by `com.davidleess.dynasty-nflverse-usage-capture`. What reaches a model:

| table | rows | substantive cols | cols reaching a model |
|---|---:|---:|---:|
| ngs_passing | 5,933 | 25 | 2 |
| ngs_receiving | 14,731 | 19 | 2 |
| ngs_rushing | 6,059 | 18 | 2 |
| player_snap_count | 253,106 | 14 | 0 *(snap_share is built from nflreadpy, not from here)* |
| nflverse_injury_report | 45,337 | 17 | **0** |
| ff_opportunity | 47,282 | **158** | **0** |
| ftn_charting | 185,215 | 29 | **0** |
| depth_charts | 1,306,598 | 26 | **0** |
| contracts | 732,246 | 27 | **0** |
| pfr_pass / pfr_rush / pfr_rec / pfr_def | 121,954 | 78 | **0** |
| **total** | **2,718,461** | **411** | **6** |

Of those six, five move a score somewhere; `ngs_avg_time_to_throw` does not (§2).

The one non-model consumer: `scripts/run_realized_outcome_scoring.py` reads `player_snap_count`. **That harness has
never graded anything** — no week has finalised (verified 09-04) — so it is a real consumer that has not yet fired.

## 5. ⛔ RETRACTED — the four "orphaned" columns are a DELIBERATE CARRY, and David ruled on it

**This section originally read "the four columns built three days ago that nothing reads" and called it the one
unambiguously unfinished item in the inventory. That was wrong, and it was wrong by deduction rather than by
measurement.** Retracted 2026-09-04 by the same lane that wrote it, before anyone built on it.

The four observable facts were all correct: `games_t_minus_1`, `games_t_minus_2` and their `_available` flags are
written to the runtime store every morning, are absent from `engine_b_features_v2.csv`, are not in
`ENGINE_B_ALLOWED_FEATURES`, and are read by nothing. **The inference from those facts was not.** I read the commit
*subject* — *"lag games so the durability gate can see more than one season"* — saw no consumer, and concluded the
consumer half had been forgotten. The commit **body** says the opposite, in capitals:

> Adds games_t_minus_1/_minus_2 and their _available flags, **CARRIED NOT CONSUMED**: registered in
> ENGINE_B_OUTPUT_COLUMNS and built at feature_assembly step 7, but added to no model feature set. **Deliberate, and
> each reason measured** […] Adding to ENGINE_B_BASE_FEATURES moves feature_completeness for 229 of 505 scored
> players, changes the displayed value for 227, and renders the raw string "games t minus 1" into user-facing
> caveat copy.

That last clause is a DG-109/DG-117 render-rule violation — a raw pipeline key on a card. The carry is not an
oversight; it is the correct handling of a column that cannot be consumed without a display fix and a promotion.

It is also **not an open item.** DG-127 is `done` (`c941d785`, 09-01), the board row already says CARRIED NOT
CONSUMED, and **David ruled on it personally on 09-01: "wait, do not force."** It was built by this same lane four
days ago, in a session this one no longer holds.

**And the defect that motivated it can no longer occur.** DG-127's case was Garrett Wilson, refused at `games_t = 7`
by `ENGINE_B_MIN_GAMES_T = 8` while `games_t_minus_2 = 17` sat in the row being refused. **DG-143 moved that gate
from 8 to 4 on David's 09-03 ruling**, admitting all **115** players the old gate refused — Wilson among them
(verified today: `games_t 7`, `games_t_minus_1 17`, `games_t_minus_2 17`, and 0 of 505 rows now fall under 4). The
gate no longer judges durability on one season because it barely judges durability at all.

**So "finish it or delete it" is the wrong frame and neither half is available to a lane.** Finishing overturns
David's "wait, do not force" and changes 227 displayed numbers; deleting overturns the same ruling in the other
direction and discards a closed ticket's deliberate output. **The genuinely open question, and it is for whoever
owns DG-127:** the carry was justified by a gate that has since been relaxed by ruling, so does it still have a
purpose, or is it now inventory? That is a question for David, not a build.

**The lesson, and it is mine:** I deduced intent from the absence of a consumer instead of reading the commit body
and the board row that were both one command away. `git log -1 --format=%B <sha>` would have settled it in five
seconds. See [[feedback_relay_authority_drift]] — provenance is a lookup, not a deduction — which I have been
applying to peers' claims about David and failed to apply to a commit.

## 6. WHAT WE HOLD THAT NOTHING READS — the inverse half

Ranked by how interesting the gap is, **not** by expected value. None of these has been tested; §8 says why that
matters.

1. **The injury report — 45,337 rows, read by nothing.** The model that predicts *whether a player will play again*
   (`models/availability.py`, the P(plays) half of the served value) reads six columns: age, games_t, ppg_t,
   snap_share, and two ppg lags. **We forecast availability without looking at the injury report we capture daily.**
2. **`ff_opportunity` — 158 columns, 47,282 rows.** Expected fantasy points from opportunity, and the diff against
   actual. The models' only opportunity-quality features are WOPR, yprr and tprr — and WOPR is dead for WR, tprr is
   dead everywhere.
3. **`pfr_rush` — yards before/after contact, broken tackles.** RB is the weakest position and ran on base features
   alone until NGS arrived; contact-adjusted rushing sits unread.
4. **`pfr_pass` — pressures, hurries, bad-throw rate, drops.** Unread, while three of four QB efficiency features
   are dead.
5. **`ftn_charting` — 185,215 charted plays.** Play-action, screen, RPO, motion, blitzers, contested ball, created
   reception.
6. **`contracts` — 732,246 rows.** Carries `date_of_birth` (an independent age source, relevant to DG-161),
   `draft_round`/`draft_overall`, and `apy`/`guaranteed`. ⚠ **Governance first, not a recommendation:** draft
   capital is already in `ENGINE_A_PROHIBITED_IN_B`, and contract value is arguably a market price under
   `MARKET_PROHIBITED`. This one needs a ruling before it is a candidate.
7. **`depth_charts` — 1,306,598 rows.** The store keeps only the modal `depth_chart_position`, and then no model
   reads even that, and no card displays it.
8. **`pfr_def` — 62,345 rows, 27 defensive columns.** Honestly irrelevant to an offense-only fantasy product.

## 7. THE ARCHIVE — 23 GB of the 38 GB is one unread table

`app/data/nflverse_usage/raw/` is 38 GB. **Contracts is 23 GB of it across 19 snapshots** — 61% of the archive, for
the table in §6 item 6. Next largest: depth_charts 5.7 GB, ff_opportunity 3.5 GB, ftn_charting 2.5 GB. All three NGS
streams together are 362 MB.

⚠ **The archive is NOT waste and must not be reported as slack.** `ROADMAP-LAYERS.md` records it as the
point-in-time archive that fuels the 2027 rebuild, and holes in it are *"permanently unbackfillable"*. The size is a
ruled investment.

Two observations inside it that are worth a look and are not rulings:
- The 08-26, 08-27 and 08-28 contract snapshots are **byte-identical in length** (1,708,298,988 each) with
  *different* content hashes. Sampling their first and last 4 MB shows they genuinely differ, so this is not a
  simple duplicate — **but how much of the 1.7 GB actually differs was not measured.**
- On **09-02 the daily contracts snapshot fell from 1.71 GB to 228 MB** — 7.5× smaller — while its row count *rose*
  (48,783 → 49,241), with no commit to `nflverse_usage.py` in that window. Unexplained.

## 8. WHAT THIS MEASUREMENT DOES NOT SUPPORT

- **Not "the extra features are useless."** In the shipped unscaled fit the WR and TE gain over three columns
  excludes zero. It is about one hundredth of r², and under the scaled fit (§2b) even that stops being detectable.
  "Small and probably real for WR/TE, undetectable for QB/RB" is the whole of it.
- **Not "we should ingest less."** §7. The archive's purpose is 2027, not today's score.
- **Not "adding the unread data would help."** Nothing in §6 was tested, and the evidence cuts against it. The
  models train on **264 / 577 / 910 / 490 rows** — a 17-feature model on 264 QB rows is already thin. The measured
  return on features 4-through-17 is zero for QB and RB, and §2b shows that is not a fixable scaling artifact.
  Fourteen more columns behaved like noise; there is no reason to expect the fifteenth to behave differently until
  something changes about the sample size or the outcome being predicted.
- **Not a verdict on Engine A.** Only the four Engine B models were measured.
- **Not "the model is bad."** r² 0.60–0.66 on two-year-forward PPG for RB/WR/TE is respectable. The finding is about
  *where that performance comes from*, and it comes from three columns.

## 9. THE SENTENCE FOR DAVID

Your product reads three things about a player: what he scored per game last season, how many games he played, and
how old he is. Everything else — the snap counts, the efficiency metrics, the aging curve, the opportunity share —
either duplicates those three or moves the score by less than a point. Next Gen Stats are the exception, and they
work, especially for tight ends.

We checked the obvious excuse. There is a known flaw in how the model weighs features on small scales, and fixing
it does give the usage data much more weight — but it does not make the forecast any better. So this is not a
plumbing problem we can tighten. We hold 411 columns of NFL data, the model reads six of them, and each position's
model is trained on only a few hundred players. A model that small cannot absorb much more than it already has.

The one thing that looks plainly wrong: we forecast whether a player will play again without ever looking at the
injury reports we download every morning. (An earlier draft of this ticket also flagged four columns we compute
and never read — that one is retracted, §5: it is deliberate, it is a closed ticket, and you ruled on it yourself
on 09-01.)

---

## Reproduce

    cd ~/dynasty-genius-product
    # §1 walk-forward + bootstrap, §2 drop test — scripts preserved at
    # /private/tmp/claude-501/-Users-davidleess/<session>/scratchpad/{earn,boot,drop}.py
    .venv/bin/python -c "import sqlite3;c=sqlite3.connect('app/data/nflverse_usage.db');print([r[0] for r in c.execute(\"select name from sqlite_master where type='table'\")])"
    du -sh app/data/nflverse_usage/raw
