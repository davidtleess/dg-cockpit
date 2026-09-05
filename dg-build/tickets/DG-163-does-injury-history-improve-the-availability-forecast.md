# DG-163 — Does injury history improve the availability forecast? Measured: no, and here is why

**Layer:** 3 · **State:** MEASURED — **NEGATIVE, feature NOT built** · **Lane:** Bob · **DG 3.0** · **model honesty · measurement**
**Source:** DG-162 §6 found that the P(plays) half of every served number is forecast from six columns with nothing
about injuries in it, while 45,337 injury-report rows arrive daily and are read by nothing. Greg queued it
2026-09-04 as a measurement first, not a shipped feature. Measured that evening by Bob. **No code changed.**

---

## ⛔ TRAPS — three, and the first one nearly cost the whole measurement

1. **`week` and `season` are TEXT in `nflverse_injury_report`.** `max(week)` returns **9** — lexicographically,
   `'9' > '18'`. The first coverage query said every season stops at week 9 and the table was half a season deep.
   It is not: `cast(week as integer)` gives weeks **1–22**. Any `where week > 9` or `max(week)` on this table lies
   silently. Cast, always.
2. **This is NOT the medical table that ends in 2023.** The record's "medical table ends 2023, no suspension data"
   ([[project_missed_games_investigation_2026-09-03]]) is a different source. `nflverse_injury_report` runs
   **2018–2025**, which fully covers the availability model's training seasons (2018–2023).
3. **`_labels()` in `availability.py` compares to the literal string `"True"`.** Feed it rows built from a pandas
   frame, where the column parsed as `bool`, and every label silently becomes 0. It fails loudly here only because
   `LogisticRegression` refuses a single-class fit. Normalise to strings before using the module's helpers.

## 1. THE COVERAGE GUARD — passed, so the measurement was allowed to proceed

| | |
|---|---|
| seasons in the table | **2018–2025**, weeks 1–22 |
| availability model's training seasons | 2018–2023 — **fully covered** |
| rows | 45,337 · **36,975 canonically resolved (81.6%)**, 8,362 source-only |
| join key | `gsis_id` → the feature store's `player_id`, direct |
| feature-store players ever on a report | **1,061 of 1,193 (89%)** |
| usable rows (resolved outcome) on a report in season t | **76.2%**, mean 4.3 weeks when present |
| report vocabulary | Out 8,331 · Questionable 11,541 · Doubtful 1,266 · DNP 12,683 · Limited 11,282 |

## 2. THE STATED STATE — Greg's guard, built in

Absence must never render as healthy. Two different absences are kept apart:

- **season not in the table** → counts stay `NaN`, `inj_covered = 0`. *Unknown.*
- **season covered, player has no rows** → counts `0`, `inj_covered = 1`. *Observed clean — a real observation.*

`inj_covered` and `inj_covered_t1` are carried as explicit features so the model can never confuse the two. On
today's data every training season is covered, so the flag is constant — which is exactly why it has to be there:
the day a season is missing, the flag moves and the absence stays visible instead of arriving as a zero.

## 3. THE RESULT — nothing, and the harm is the parameter count, not the data

Same leak-free expanding-window folds and same pipeline as the shipped model
(`SimpleImputer` → `StandardScaler` → `LogisticRegression`), paired bootstrap 2,000× clustered on player.
n = 1,950 rows, 837 players, base rate 0.773. **Baseline AUC 0.8118 reproduces the recorded 0.811.**

| arm | AUC | Brier | Δ AUC vs baseline | 90% CI |
|---|---:|---:|---:|---|
| **baseline (6 features)** | **0.8118** | 0.1385 | — | — |
| + `inj_out` (7) | 0.8117 | 0.1385 | −0.0001 | [−0.0008, +0.0007] |
| + `inj_out`, `inj_dnp` (8) | 0.8116 | 0.1386 | −0.0002 | [−0.0018, +0.0013] |
| + `inj_out`, `inj_dnp`, `inj_weeks` (9) | 0.8113 | 0.1387 | −0.0005 | [−0.0021, +0.0011] |
| + those three plus t−1 lags (12) | 0.8058 | 0.1402 | **−0.0060** | [−0.0109, −0.0010] |
| + all injury features (20) | 0.8053 | 0.1415 | **−0.0065** | [−0.0125, −0.0009] |

**Read the top three rows and the bottom two as two different findings.** Adding one, two or three injury columns
does nothing — every interval spans zero, and the point estimates are −0.0001 to −0.0005. Adding six or fourteen is
detectably *harmful*, and that is the cost of spending parameters on 837 players, not evidence that injuries hurt.
So the honest statement is **not** "injury data makes the forecast worse." It is **"injury data does not move this
forecast, and paying for it in parameters does."**

## 4. WHY — the injury report barely predicts this outcome, and one direction is backwards

Univariate AUC on the same test folds, each feature scored alone in the direction a builder would assume
(more injury → less likely to return):

| predictor | AUC alone | correlation with `games_t` |
|---|---:|---:|
| `inj_out` (weeks declared Out) | **0.5129** | −0.134 |
| `inj_dnp` (weeks did not practise) | 0.4922 | −0.019 |
| `inj_distinct` (distinct injuries) | 0.4459 | +0.103 |
| `inj_ques` (weeks Questionable) | 0.4195 | +0.124 |
| `inj_weeks` (weeks on the report at all) | **0.4136** | +0.208 |
| `games_t`, for scale | **0.7707** | 1.000 |

**Weeks declared Out is a coin flip: 0.5129.** And note the bottom rows are *below* 0.5, which means the assumed
direction is **inverted**: appearing on the injury report *more often* predicts returning *more often* (AUC 0.586
the other way round). That is not health, it is **roster membership** — you have to be an active NFL player to be
listed on a team's injury report at all.

⚠ **This is the trap a naive build would have fallen into.** An injury feature added without this check would have
shown real signal, looked like it was working, and been measuring exposure rather than durability. Same family as
[[feedback_the_failure_path_returns_the_success_signal]]: a thing that cannot answer the question, rendering
identically to one that can.

Meanwhile `games_t` alone reaches **0.7707** — games played already carries almost everything the six-feature model
knows. The correlation between `inj_out` and `games_t` is only −0.134, so this is not simple redundancy. The
injury report genuinely does not predict whether a player posts a qualifying season one or two years later.

## 5. WHAT THIS DOES NOT SAY

- **Not "injury data is worthless."** It says injury history does not improve **this** forecast: *will this player
  post a season of ≥4 games at t+1 or t+2* — a coarse event, two years out, with a 77% base rate. Injury data could
  well predict **next week's** availability, or next season's **games played**, far better. Neither was measured.
- **Not "the availability model is fine."** `EVENT_DEFINITION` already says the label means "posted no qualifying
  season", which is this pipeline's own filter and not a football fact. That limit is unchanged.
- **Not a verdict on the 8,362 source-only rows.** 18.4% of the table is not canonically identified. Resolving them
  would enlarge the feature, not change its direction — the resolved 81.6% already shows no signal.
- **Not tested: severity or body part.** Only counts were built. A concussion and a hamstring are the same row here.
  Given the univariate result, a severity split is a long shot, but it is genuinely untested.

## 6. FOR DAVID — in his terms

**What we checked.** Every score on your card is really two guesses multiplied together: how many points this
player scores when he plays, and whether he is still playing at all a year or two from now. The second guess is
half the number, and it is made from six things — his age, how many games he played, his points per game this
season and the two before, and his snap share. Nothing about injuries. Meanwhile the product downloads the NFL's
official injury report every morning and has 45,337 rows of it going back to 2018, read by nothing. That looked
like the most obviously wrong thing in the product, so we tested it before building anything.

**What we found.** The injury report barely predicts it. Counting the weeks a player was declared **Out** and
using that alone to guess whether he is still playing in two years is almost exactly a coin flip. Adding one, two
or three injury measurements to the forecast changes its accuracy by an amount too small to distinguish from
chance. Adding a lot of them makes it measurably worse — not because injuries are misleading, but because each
position's model only has a few hundred players to learn from, and a model that small gets worse every time you
give it another thing to weigh.

**The part that would have fooled us.** One injury measurement did show real signal — how often a player appears
on the injury report at all — and it pointed the **wrong way.** Players who appear on it more often are *more*
likely to still be playing in two years, not less. The reason is simple once you see it: you have to be on an NFL
roster to be listed on a team's injury report. A player who is out of the league entirely never appears. So
"frequently on the injury report" is mostly a measure of *having a job*, not of being hurt.

That matters more than the headline. If we had built this feature the obvious way, it would have shown genuine
predictive power, behaved sensibly on the screen, and quietly been measuring whether a man is employed. Nothing
would have looked broken. It would have gone in and stayed in.

**What already does the work.** Games played. On its own it predicts whether a player is still around better than
anything in the injury report by a wide margin. It turns out that "he played fifteen games" already tells us most
of what "he was on the injury report twice" would.

**What this does not mean.** It does not mean injury data is useless — it means injury *history* does not improve
*this particular* forecast, which is a deliberately coarse one: did he manage at least four games in either of the
next two seasons. Three-quarters of players do. Injury data might predict **next week's** availability, or **how
many games** he plays next season, far better; neither was tested. We also only counted injuries — a concussion
and a hamstring were the same row. So if this comes up again, the right question is *"which forecast?"*, not
*"didn't we try that?"*

**What changed: nothing.** No feature was added, no model retrained, no number on your screen moved. This was a
measurement, and the answer was no.

---

## Reproduce

    cd ~/dynasty-genius-product
    .venv/bin/python /private/tmp/claude-501/-Users-davidleess/<session>/scratchpad/injury.py
    # coverage guard, cast the TEXT columns:
    .venv/bin/python -c "import sqlite3;c=sqlite3.connect('app/data/nflverse_usage.db');print([r for r in c.execute('select season, min(cast(week as integer)), max(cast(week as integer)) from nflverse_injury_report group by season')])"
