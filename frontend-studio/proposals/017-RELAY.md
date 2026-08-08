# RELAY 017 — usage data is captured and unserved; two defects in the model capture

| ID | summary | severity |
|---|---|---|
| **R1** | Unscored rows localise to the 1-7 game Bayesian band | **in flight — David** |
| **R2** | Rostered player Tank Dell absent from model capture entirely | **high** |
| **R3** | Eight seasons of usage data captured, zero API routes read it | medium |
| **R4** | Daily depth-chart feed stopped 2026-03-14, still ingesting | medium |
| **R5** | Endpoint shape requested for a weekly-role surface | request |

All figures reproducible with the commands given. Captures referenced are `2026-08-07`.

---

## R1 — The unscored rows are not spread across the model. They are one code path. **In flight.**

**David is already filling these in (2026-08-07), so this is not an ask — it is the localisation,
offered because it may save a search.** My first read of this called it "113 rows falsely claiming an
active model." That framing was wrong and is withdrawn: the rows are not lying about their grade,
they are landing in one band and coming back empty.

**Repro**
```bash
# unscored rate by 2025 games played, today's capture
python3 - <<'EOF'
import sqlite3
from collections import defaultdict
mc=sqlite3.connect('file:app/data/model_forward_capture.db?mode=ro',uri=True)
un=sqlite3.connect('file:app/data/nflverse_usage.db?mode=ro',uri=True)
d=mc.execute("select max(capture_date) from model_forward_capture_joinable").fetchone()[0]
b=defaultdict(lambda:[0,0])
for dg,dvs in mc.execute("select dg_player_id,dynasty_value_score from model_forward_capture_joinable where capture_date=?",(d,)):
    n=un.execute("select count(*) from ff_opportunity where dg_player_id=? and season='2025' and cast(week as int) between 1 and 18",(dg,)).fetchone()[0] if dg else 0
    b['0' if n==0 else ('1-7' if n<=7 else '8+')][0 if dvs is None else 1]+=1
print(dict(b))
EOF
```

**Observed**

| 2025 games played | unscored | scored | unscored rate |
|---|---|---|---|
| 0 games | 5 | 84 | 6% |
| **1–7 games** | **108** | **56** | **66%** |
| 8+ games | 0 | 328 | **0%** |

**No unscored row has more than 7 games.** Players with a full sample score every time; players with
no sample score almost every time (prior/draft-capital path); the band in between is where two-thirds
come back empty. Product briefing §5 states *"a Bayesian blend covers players with 1–7 games"* — the
failure sits inside that band exactly, and nowhere else. Stable at **113/581 across eight consecutive
daily captures** (2026-07-31 → 2026-08-07), so it is a code path, not a data race.

**User cost** Garrett Wilson (7 games, FantasyCalc 4,100, the highest-priced receiver on the roster)
and Braelon Allen (4 games) both render blank in the model lane while carrying a market price.

**Asked** Nothing — David is on it. Flagged only in case the 1–7 localisation is useful.

## R2 — A rostered, market-priced player has no row in the model capture at all. **High.**

**Repro**
```sql
sqlite3 "file:app/data/model_forward_capture.db?mode=ro" \
 "select count(*) from model_forward_capture_joinable where capture_date='2026-08-07' and sleeper_id='9502';"
sqlite3 "file:app/data/fc_forward_capture.db?mode=ro" \
 "select player_name,value,position_rank from fc_forward_capture_joinable where snapshot_date='2026-08-07' and sleeper_id='9502';"
```

**Observed** Model capture returns `0`. Market capture returns `Tank Dell|1232|72`. Sleeper id 9502 is
on roster 1 in the current league snapshot.

**Expected** Every rostered player appears in the model capture in some state, even if that state is
"no model." Absence from the table is indistinguishable from a join failure.

**User cost** Tank Dell is on the user's roster. He is invisible to every model-lane surface and to
the sleeper_id ↔ dg_player_id bridge, so he cannot be joined to any other data source either. This is
distinct from R1: R1 is a null score, R2 is a missing row.

**Asked** Confirm, fix, or refute with a concrete technical reason.

---

## R3 — Eight seasons of weekly usage data are captured and no route serves any of it. Medium.

**Repro**
```bash
sqlite3 "file:app/data/nflverse_usage.db?mode=ro" ".tables"
grep -rl "nflverse\|ff_opportunity\|depth_chart\|ngs_\|playerprofiler\|league_transaction" app/api/routes/
```

**Observed** The store holds `ff_opportunity` (47,282 rows, 2018–2025, weekly), `depth_charts`
(812,074), `ftn_charting` (185,215), `contracts` (48,511), `pfr_rec` (35,724), `nflverse_injury_report`
(45,337), `ngs_passing/receiving/rushing`, `player_snap_count`. Alongside it, `playerprofiler.db`
(`pp_pbp_slot` 949,041 rows, `pp_roster_week` 230,394, `pp_gamelog_week` 44,462) and
`league_transactions.db` (937 rows). The grep returns exactly one file:
`app/api/routes/system_capture_health_models.py`.

Identity resolution is good: `ff_opportunity` is 93.2% `canonical_resolved` (44,061 of 47,282);
`pp_player_season` is 98.3%.

**Expected** No expectation asserted — this may be deliberate sequencing and I have no visibility into
the plan. Reporting it because the product briefing this lane works from (§4, dated 2026-07-14) states
that usage and stat lines are *not obtainable*, and that is now false. Several design constraints in
this lane were derived from it.

**User cost** Two parked screens are parked on this exact grounds. Waiver Radar's card says it "needs
in-season usage signals (routes, snaps) that only accrue while games are played" — `player_snap_count`
and `ff_opportunity` are on disk for eight seasons. Depth-chart movement was raised as an engineering
ask on 2026-07-15 and `depth_charts` now carries it weekly back to 2018.

**Asked** Confirm whether these stores are intended to be served, so this lane stops designing around
a constraint that no longer holds.

---

## R4 — The daily depth-chart feed stopped five months ago and is still being ingested. Medium.

**Repro**
```sql
sqlite3 "file:app/data/nflverse_usage.db?mode=ro" \
 "select source_era, max(substr(dt,1,10)), count(*) from depth_charts group by source_era;"
sqlite3 "file:app/data/nflverse_usage.db?mode=ro" \
 "select stream, observed_at, rows_total from nflverse_snapshot_capture order by rowid desc limit 1;"
```

**Observed** `daily` rows stop at **2026-03-14** (554,215 rows). The capture pipeline itself ran
**2026-08-08T02:31Z** — tonight. So ingestion is live while this particular upstream has been static
for ~5 months.

**Expected** Either the source is seasonal and expected to be stale in August (likely — nflverse
publishes depth charts in-season), in which case a freshness caveat should distinguish "seasonally
dormant" from "broken"; or it is broken.

**User cost** Indirect today, since nothing renders it. It becomes user-facing the moment anything
does, and "last updated 2026-03-14" reads as a fault unless the surface says otherwise.

**Asked** Confirm which it is.

---

## R5 — Endpoint shape for a weekly-role surface. Request, not a defect.

Proposal 017 (`proposals/017-the-job/index.html`) builds against a shape that does not exist. What it
needs, per rostered player:

```
GET /api/players/{sleeper_id}/usage?season=2025
{
  "weeks": [ { "week": 1, "team": "IND",
               "expected_points": 3.5, "actual_points": 4.1 }, ... ],   // weeks NOT played are ABSENT,
                                                                        // never present with 0
  "starter_role_cut": 11.31,        // Nth-best at the position by expected pts/game
  "population": { "n": 281, "median_role_change": -0.41 }
}
```

Three properties the prototype depends on:

1. **Missing weeks must be absent from the array, not zero-filled.** A bye and a healthy scratch and a
   0-target game are three different facts and only the third is a zero.
2. **The starter cut must be computed, not stored.** It is the 36th WR / 24th RB / 24th QB / 12th TE by
   expected points per game among players with 6+ games — it moves with the season and with league
   settings.
3. **`ff_opportunity` appears to be PPR.** Verified only by magnitude (Amon-Ra St. Brown 117 receptions
   / 324.0 points; subtracting receptions lands on the standard total). The league is 12-team superflex
   PPR so no conversion is needed — but please confirm rather than rely on my inference, because every
   number on the prototype rests on it.

The join path is verified end-to-end: `sleeper_id` → `dg_player_id` via
`model_forward_capture_joinable` → `ff_opportunity.dg_player_id`. It resolves 22 of the user's 27
players; the 5 misses are 4 players who entered the league in 2026 (correctly absent) and Tank Dell
(**R2**).

**Asked** Confirm the shape is workable, or propose the shape you would rather serve.
