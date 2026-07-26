# 009 — Relay to engineering

Six items found on 2026-07-25 by using the running app and then measuring against its own artifacts.
Everything below is reproducible from a local checkout with the server running. Nothing here is a
taste argument. Ranked by severity.

| ID | Summary | Severity |
|---|---|---|
| P1 | League surfaces serve June-23 artifact, fresh one on disk | **Critical** |
| P2 | ACTIVE_B players return null value, stored as 0.0 | **Critical** |
| P3 | starter_xvar drops IR/taxi, hits one roster 7× harder | High |
| P4 | DVS saturates and is not cross-position comparable | High |
| P5 | surplus_label reads deficit at every position for roster 1 | Medium |
| P6 | League Pulse renders as a 43,634-pixel key/value dump | Medium |

---

## P1 — Every league-snapshot surface serves the 2026-06-23 artifact while a daily job writes a fresh one. (Critical)

**Reproduce**

```bash
curl -s localhost:8000/api/league/pulse | python3 -c \
  "import json,sys;print(json.load(sys.stdin)['source_artifacts'])"
# team_posture.captured_at      2026-06-23T13:17:30
# team_value_matrix.captured_at 2026-06-23T13:17:30

ls app/data/league_runtime/runs/ | tail -3
# league-20260722T132000Z  league-20260723T132001Z  league-20260724T132000Z

python3 -c "import json;print(json.load(open(
  'app/data/league_runtime/runs/league-20260724T132000Z/team_posture.json'))['captured_at'])"
# 2026-07-24T13:20:03.739984+00:00
```

**Observed** — the API serves an artifact captured 2026-06-23. **Expected** — it serves the newest
run, 2026-07-24. The daily job at 09:20 has been writing `snapshot.json`, `team_posture.json` and
`team_value_matrix.json` since at least 2026-07-17. Nothing reads them.

**Same root cause, two more surfaces:**

```bash
curl -s "localhost:8000/api/trade/assets?q=jean" | python3 -c \
  "import json,sys;print(json.load(sys.stdin)['source_timestamp'])"   # 2026-06-23T13:17:20
curl -s localhost:8000/api/roster/capacity | python3 -c \
  "import json,sys;print(json.load(sys.stdin)['sleeper_snapshot_captured_at'])"  # 2026-06-23T13:17:20
```

**Why the user pays.** Four of twelve posture labels are wrong on the surface a rebuilder would use
to choose a counterparty, and they are wrong in both directions:

| team | served (Jun 23) | on disk (Jul 24) |
|---|---|---|
| MDEF | BALANCED | **CONTENDER** |
| Free Kelly | BALANCED | **CONTENDER** |
| Seidmans Sasquatches | ASCENDING | **REBUILDING** |
| Kissane's Team | CONTENDER | **BALANCED** |

Two real contenders are hidden, a fellow rebuilder is shown as a buyer, and the team labelled
contender no longer is. Roster 1's own `starter_weighted_xvar_z` also moved −2.258 → −1.404: the
rebuild is measurably progressing and the app shows a month-old picture of it.

This is relay 003's F2. F1 (schedule the capture) landed and is working correctly — the capture is
not the problem, the read path is.

**Asked:** confirm, fix, or refute with a concrete technical reason.

---

## P2 — Fifteen players graded `ACTIVE_B` return null values, and the league layer stores the null as `0.0`. (Critical)

**Reproduce**

```bash
curl -s localhost:8000/api/players/8146 | python3 -m json.tool | head -22
# "model_status": "modeled"
# "model_grade": "ACTIVE_B"
# "dynasty_value_score": null
# "xvar": null
```

Then find the same player in `app/data/league_runtime/runs/league-20260724T132000Z/team_value_matrix.json`:
`"full_name": "Garrett Wilson" … "raw_xvar": 0.0`.

**Observed** — the model reports no value and the league layer records `0.0`.
**Expected** — a null propagates as null, or the player is excluded and counted as excluded.

**Scope, measured across all 269 rostered skill players:** 15 have `model_status: "modeled"` and
`model_grade: "ACTIVE_B"` with `dynasty_value_score` and `xvar` both null. **All 15** are stored as
exactly `raw_xvar: 0.0`. They carry **31,550** of FantasyCalc value between them:

| player | market overall | market value |
|---|---|---|
| Jayden Daniels | #9 | 7,369 |
| Malik Nabers | #17 | 6,625 |
| Garrett Wilson | #43 | 4,010 |
| Kyler Murray | #80 | 2,818 |
| Malik Willis | #90 | 2,428 |
| Jayden Reed, Jalen McMillan, Braelon Allen, Tyreek Hill, Jaydon Blue, Trey Benson, DJ Giddens, Riley Leonard, Gardner Minshew, Kendre Miller | #134–#332 | 8,300 combined |

**Why the user pays.** A zero is not a low opinion, but once it is ranked alongside real values it
reads as one. Rank those 0.0s inside their position and the market's third-best QB comes out near
the bottom of our QB board — not because the model disagrees with the market, but because it has no
view at all. Every divergence readout, every "we rate him lower" line, and every model-vs-market
comparison in the product inherits this. It is also a plausible contributor to relay 004's N0
position-skew pattern, which the team confirmed as real with the cause still open.

The grade is the part I would fix first: a player the model cannot value should not carry the
model's top grade.

**Asked:** confirm, fix, or refute with a concrete technical reason.

---

## P3 — `starter_xvar` excludes IR and taxi, and the exclusion lands almost entirely on one roster. (High)

**Reproduce** — in today's `team_value_matrix.json`, any player with `lineup_role` of `ir` or `taxi`
is absent from `lineup.starters` and contributes nothing to `lineup.starter_xvar`.

**Observed, for roster 1** — our own best legal lineup starts **AJ Barner at `raw_xvar: -5.64`** at
TE while **Tucker Kraft** (`raw_xvar 2.85`, and our **TE1** by DVS across the whole league) is `ir`;
and it fills **SUPER_FLEX with Tank Dell at `0.0`** while **Fernando Mendoza** (`raw_xvar 10.31`,
market QB14) is `taxi` — in a superflex league, where a second quarterback in that slot is the most
valuable structural thing a roster can do.

**Share of each roster's market value sitting in `ir`/`taxi`, and therefore invisible:**

| roster | share | excluded top-100 assets |
|---|---|---|
| **1 (Dleess)** | **26.6%** | Garrett Wilson #43, Fernando Mendoza #44, Tucker Kraft #61 |
| 5 (rzalika) | 17.6% | Malik Nabers #17 |
| 7 (jspagnola) | 5.2% | Daniel Jones #85 |
| 11, 9, 4, 3, 10, 8, 12 | 4.7% → 1.4% | none |
| 2, 6 | 0.0% | none |

League median 3.4%. Roster 1 is **7× the median** and the only roster with three excluded top-100
assets.

**Why the user pays.** `starter_xvar` is 60% of the posture score and the base of every positional
z-score, every `surplus_label`, and the partner rankings. It is July: there are no lineups to field,
and taxi is rookies-only by league rule — it is the slot that exists to hold valuable rookies. So a
this-week lineup-legality filter is deciding a dynasty-asset comparison, and it is blindest to
exactly the roster profile the app's only user has.

I am not claiming the exclusion is wrong for an in-season "can I field this" question. I am claiming
it is the wrong basis for an off-season league comparison, and that the two uses currently share one
number.

**Asked:** confirm, fix, or refute with a concrete technical reason.

---

## P4 — DVS saturates at 100 and is not comparable across positions. (High)

**Reproduce** — pull `dynasty_value_score` from `/api/players/{id}` for every rostered player
(242 of 269 return one).

**Observed:**

- **Twelve rostered players sit at exactly `100.0`**, spanning the market's #3 (Ja'Marr Chase) to its
  #137 (Travis Kelce). Also at 100.0: Tucker Kraft (#61), George Kittle (#95), Harold Fannin (#69).
- Distribution by position — TE median **81.4** with p75 = **100.0**; QB median 74.1; WR 66.5;
  RB **56.8**.
- Take the top 50 by DVS and the position mix is **19 TE / 14 WR / 9 RB / 8 QB**. The market's top 50
  is **16 QB / 15 RB / 15 WR / 4 TE**.

**Why the user pays.** David's standing ask (2026-07-15) is that the model publish rankings
comparable to the market's. DVS is the natural candidate and it cannot do the job as-is: a scale on
which Chase and Kelce are identical is not a ranking scale, and a cross-position sort of it returns
a board that is 38% tight ends. Every surface that wants "our overall rank beside the market's
overall rank" is blocked on this, including the one attached to this relay — it ranks inside a
position only, and says so on its face, because that is the strongest honest thing available.

Two separate defects in one number: a **ceiling that clips** and a **per-position calibration** that
was never normalised across positions.

**Asked:** confirm, fix, or refute with a concrete technical reason.

---

## P5 — `surplus_label` returns "deficit" at all four positions for roster 1, on fresh data. (Medium)

**Reproduce** — `positional_summary` for roster 1 in today's `team_value_matrix.json`:
QB z −0.821, RB −0.799, TE −1.268, WR −1.187 → `surplus_label` **deficit, deficit, deficit,
deficit**. On the served June artifact the same four read deficit at −1.91 / −1.46 / −1.74 / −2.72.

**Observed** — a positional shape label that assigns the same value to all four positions.
**Expected** — a label that distinguishes among a roster's own positions.

**Why the user pays.** The z-score is computed against the league, so for the league's weakest team
every position scores negative and the label saturates. It carries no information about *shape* —
which is the only thing it is used for: it drives the `ROSTER_SURPLUS_DEFICIT_MATCH` opportunity
cards, of which League Pulse currently renders nine. Roster 1 holds **14 WRs and 3 TEs**; the app
calls both a deficit. Normalising within the roster before labelling, or labelling on rank-within-own-roster
rather than z-against-league, would make the label mean what its name says.

**Asked:** confirm, fix, or refute with a concrete technical reason.

---

## P6 — League Pulse renders as a 43,634-pixel key/value dump. (Medium)

**Reproduce** — open `http://127.0.0.1:8000/?surface=league-pulse` and measure
`document.body.scrollHeight`: **43,634px** at 1440 wide.

**Observed** — partner rankings render as stacked label/value pairs (`partner_score` / `2.168` /
`complementarity_score` / `0.92` / `divergence_density_score` / `1.00` …) repeated for 11
counterparties, then 12 team postures, then 12 team-value blocks, then 31 opportunity cards titled
`ROSTER_SURPLUS_DEFICIT_MATCH` and `UNROSTERED_MODEL_MARKET_DIVERGENCE`. Header carries an
EXPERIMENTAL banner and `status` is always `degraded`.

**Why the user pays.** This is the app's only answer to "who should I trade with", and it is a
serialized payload rather than a surface. I am not asking for a redesign in this brief — P1 and P2
have to land before any counterparty view is worth building, because it would be reading the June
artifact and ranking coerced zeros. Flagging it so it is on the record with the others.

**Asked:** confirm the raw-render state is known and unowned, or point me at where it sits.

---

## Note on what I did not claim

I looked hard at whether the model-vs-market gap is mostly an age artifact, because relay 005 found
that it was. Measured on today's data, within position: Pearson r(age, gap) is **+0.313** using the
xVAR lane and **+0.218** using the DVS lane. Both are modest. The DVS lane is materially the better
match to a dynasty price and the league layer does not use it — but I am not claiming age explains
the divergence, only that it contaminates it, and less than 005's framing implied. P2 is the larger
contaminant and it is mechanical.
