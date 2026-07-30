# 016-RELAY — the quiet-day baseline is unreachable, and it is the feature built for the common case

**From:** Studio (independent front-end practice)
**Measured:** 2026-07-30 against the running app and the app's own capture databases.

## Summary

| ID | seven-word summary | severity |
|---|---|---|
| Q1 | Quiet-day baseline gated on condition never true | **high** |
| Q2 | Model region silent on 92% of mornings | high (context for Q1) |
| Q3 | Baseline rows ship hardcoded zero lane values | low |

---

## Q1 — HIGH. The quiet-day baseline can never render, because its gate also requires the market to be silent

**Where.** `frontend/src/what-changed/DailyWhatChanged.tsx`

```
:304  const moveCount =
        (daily.market.top_movers?.length ?? 0) +
        (daily.market.roster_deltas?.length ?? 0) +
        (daily.model.deltas?.length ?? 0);
:324  const quietDay = moveCount === 0;
:360  {quietDay && ( … <BaselineRosterRows rows={baselineRows} /> … )}
```

**Observed.** `BaselineRosterRows` — described in its own comment as *"Quiet-day baseline (spec v3
key-state 1): David's roster locked flat"* — renders only when **all three** lists are empty. Two of
those three are market lists.

Live today: `top_movers 25`, `roster_deltas 26`, `model.deltas 0` → **moveCount 51, quietDay false**.
The producer supplied all **27** baseline rows and none of them rendered.

**The gate requires the market to have moved nobody.** Measured across **36 overnight transitions**
(2026-06-24 → 2026-07-30) from `app/data/fc_forward_capture.db`, the market moved at least one player
on **36 of 36 mornings**, median **456 players**. It has never once been silent.

Meanwhile, from `app/data/model_forward_capture.db` over the same 36 transitions, the model moved
**nobody on 33 of them (92%)**; last change **2026-07-10**.

**So the feature built for "the model has nothing to say" is gated on "nothing at all has anything to
say", and the second condition has never occurred.** On the 92% of mornings the component exists to
serve, the model region instead renders one line — *"Projections held steady — no player movement on
this tape"* — measured live at **0 rows in 71px**, against the market region's **36 rows in 1,401px**.

**Expected.** The quiet-day baseline is presumably intended to fire when the *model* lane is empty —
`daily.model.deltas.length === 0` — independent of market activity. If the current behaviour is
deliberate, the component's own comment and the spec reference it cites do not say so.

**Why the user pays for it.** The product's stated thesis is our view beside the market's. On 92% of
mornings the model side of the opening screen is a single sentence, while a built, populated,
27-row representation of the roster sits unrendered in the payload. The user gets the market's opinion
and a line of prose where the app already has something better to show.

**Confirm, fix, or refute with a concrete technical reason.**

---

## Q2 — Context for Q1, not a separate defect

The 92% figure above is the load-bearing measurement and is reproducible:

```
# model lane — 33 of 36 transitions silent, median 0 players moved
sqlite3 app/data/model_forward_capture.db \
  "select capture_date, count(*) from model_forward_capture_joinable group by capture_date order by 1"

# market lane — 0 of 36 silent, median 456 players moved
sqlite3 app/data/fc_forward_capture.db \
  "select snapshot_date, count(*) from fc_forward_capture_joinable group by snapshot_date order by 1"
```

Studio's full per-day series and figure: `proposals/016-silent-lane/`.

**Stated against our own argument:** two of the three model changes (2026-06-26, 430 players;
2026-06-27, 79) fall in the first four days of capture and may be initialisation rather than genuine
revision. If so the true rate is **1 change in 36**, not 3. We quote the weaker figure.

**This is explicitly not a claim that the model is broken.** A dynasty valuation should be stable; one
that churned nightly would be the more troubling artifact. It is a claim about which quantity the
opening screen is keyed to.

---

## Q3 — LOW. `baseline_roster_rows` ships hardcoded zeros for both lanes

**Where.** `src/dynasty_genius/what_changed/report.py:_build_baseline_roster_rows`

```python
"model_lane_value": 0,
"market_lane_value": 0,
```

**Observed.** All **27** rows carry `model_lane_value == 0` and `market_lane_value == 0` in the live
payload, for players whose real market values are plainly non-zero (Ashton Jeanty, 7,182 on
FantasyCalc in the same response).

**Impact today: none user-facing** — and we checked before reporting. `BaselineRosterRows` does not
read either field; they are absent from its prop type and it renders `NEUTRAL_DASH` for both lanes.
This is raised only because a schema field that is uniformly zero is a trap for the next consumer, and
because it interacts with Q1: if the gate is fixed and the rows begin rendering, any future use of
those fields would render zeros for the whole roster.

**Confirm, fix, or refute with a concrete technical reason.**
