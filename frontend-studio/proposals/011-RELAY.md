# 011 — RELAY

| ID | Summary | Severity |
|---|---|---|
| R1 | DVS saturates at 100.0; 23 players clipped | Critical |
| R2 | Model values unchanged for 17 consecutive days | High |
| R3 | xVAR absent from every row of the daily model capture | Medium |
| R4 | Lane coverage figures, per position, for the rebase already in flight | Info |

All four are reproducible from artifacts in the repo. Nothing here depends on a
prototype or a design opinion.

---

## R1 — DVS saturates at a ceiling of 100.0, and the tie is a clip rather than a cluster (Critical)

**Repro.**
```
sqlite3 app/data/model_forward_capture.db "
  select position, dynasty_value_score, count(*), group_concat(player_name, ' | ')
  from model_forward_capture_joinable
  where capture_date = (select max(capture_date) from model_forward_capture_joinable)
    and dynasty_value_score = 100.0
  group by position;"
```

**Observed.** 23 players hold exactly `100.0` on the 2026-07-27 capture.

| pos | tied at 100.0 | next distinct value below | gap |
|---|---:|---:|---:|
| RB | 6 | 92.3 | **7.7** |
| WR | 6 | 98.3 | 1.7 |
| TE | **11** | 99.5 | 0.5 |
| QB | 0 (max 99.0, held by one) | 95.0 | — |

The RB gap is the diagnostic one: six players share the maximum and the seventh-best
sits 7.7 points below it. That is the signature of a scale topping out, not of six
genuinely indistinguishable backs.

**Expected.** Distinct players receive distinct scores, or — if the ceiling is
deliberate — the payload marks the value as censored so consumers can tell "our best
estimate is 100.0" apart from "our estimate is ≥100.0 and we cannot say more."

**Why the user pays for it.** The tied players are not close in the market's view:

- **TE, 11 tied, priced 1,467 → 7,730 — a 5.3× spread collapsed onto one number.**
  It rates **Brock Bowers (age 23, market 7,730) exactly level with Travis Kelce
  (age 37, market 1,628)** and with Dallas Goedert (1,467).
- WR, 6 tied, priced 3,497 → 9,873 (2.8×): Ja'Marr Chase level with Rashee Rice.
- RB, 6 tied, priced 4,198 → 10,164 (2.4×): Bijan Robinson level with Christian McCaffrey.

The concrete consequence: **at the top of three positions our model cannot be ranked at
all**, so any surface placing our rank beside the market's has nothing to place. This is
the direct blocker on the standing "publish rankings comparable to market rankings" ask —
the ceiling, not the ranking method, is what stops it.

**Ask:** confirm whether 100.0 is a deliberate cap; if so, expose a censored flag or an
uncapped underlying score. If not, treat as a scaling defect. Or refute with a concrete
technical reason.

---

## R2 — The model lane has not changed in 17 consecutive days (High)

**Repro.**
```
sqlite3 app/data/model_forward_capture.db "
  select capture_date, count(*), sum(dynasty_value_score)
  from model_forward_capture_joinable group by capture_date order by capture_date;"
```
then diff the per-player values day to day.

**Observed.** 34 capture days, 2026-06-24 → 2026-07-27. Per-player DVS changed on
**3 of 33 day-transitions**:

| date | players whose value changed |
|---|---:|
| 2026-06-26 | 430 |
| 2026-06-27 | 79 |
| 2026-07-10 | 5 |

**Last change: 2026-07-10. Seventeen consecutive captures since are byte-identical in
value terms.**

**Expected.** Either the values move as inputs move, or the surface states that the
model lane is a fixed vintage so a reader does not attribute staleness to the market.

**Why the user pays for it.** Every model-vs-market comparison in the product is
today's market against a month-old model opinion. Divergence therefore grows
mechanically as the market moves, and reads as an emerging edge when it is an artifact
of one lane standing still. Note this is the same condition reported in 005 (then: 25
days, last change 2026-06-27); it has persisted and the last-change date has moved only
once since.

**Ask:** confirm the intended refresh cadence for DVS, and whether 2026-07-10 → now
represents a stalled job or expected behaviour. Or refute with a concrete technical reason.

---

## R3 — xVAR is null on every row of the daily model capture (Medium)

**Repro.**
```
sqlite3 app/data/model_forward_capture.db "
  select count(*) total, count(xvar) with_xvar
  from model_forward_capture_joinable
  where capture_date = (select max(capture_date) from model_forward_capture_joinable);"
```

**Observed.** 581 rows for 2026-07-27, 468 carrying a DVS, and **0 carrying an xVAR** —
the column is present and uniformly null. Same for `dvs_pct`.

**Expected.** xVAR populated, or the column dropped from the joinable capture so
consumers do not read it as available-but-empty.

**Why the user pays for it.** xVAR is the model's cross-position quantity and the one
with more resolution than DVS. With it absent, DVS is the only rankable model output,
which is precisely the quantity that saturates under R1. The two defects compound: the
lane that could rank the top of TE is empty, and the lane that is populated cannot.

**Ask:** confirm whether xVAR is expected in this capture. Or refute with a concrete
technical reason.

---

## R4 — Per-position lane coverage, supplied for the rebase already in flight (Info)

Not a new finding — the population mismatch between the two lanes is understood and a
correction is being worked. These are the per-position figures, in case they are useful
for scoping and for verifying the fix.

Market lane = FantasyCalc superflex cache, 2026-07-27. Model lane = today's
`model_forward_capture_joinable` rows carrying a DVS.

| pos | market | model | shared | market-only | model-only |
|---|---:|---:|---:|---:|---:|
| QB | 67 | 47 | 45 | 22 | 2 |
| RB | 110 | 111 | 89 | 21 | 22 |
| WR | 156 | 199 | 140 | 16 | 59 |
| TE | 66 | 111 | 63 | 3 | 48 |
| **all** | **399** | **468** | **337** | **62** | **131** |

Rebasing the market lane onto the shared population shifts its within-position ranks a
**median of 2 places, mean 4.4, max 20**.

**No ask** — recorded so the fix can be checked against per-position numbers.
