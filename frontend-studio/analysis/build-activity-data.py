#!/usr/bin/env python3
"""Build the single dataset behind the league-activity sketch.

Sources, all live:
  - Sleeper /league/{id}/transactions/{1..18} for four seasons (analysis/txn-raw/)
  - Sleeper /league/{id}/{users,rosters}
  - Sleeper /players/nfl name map (analysis/sleeper-name-map.json)
  - the running app: /api/league/pulse  (posture + partner rankings)

Output: analysis/league-activity.json

Every figure is Studio's own computation, unreviewed.
"""

import json
import math
import pathlib
import urllib.request
from collections import Counter
from datetime import datetime, timezone

HERE = pathlib.Path(__file__).parent
RAW = HERE / "txn-raw"
OUT = HERE / "league-activity.json"
SEASONS = [2023, 2024, 2025, 2026]
TODAY = "2026-07-28"
MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()


def load(n):
    p = RAW / n
    return json.loads(p.read_text()) if p.exists() else None


def dt(ms):
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc) if ms else None


def wilson(k, n, z=1.96):
    """Wilson score interval — honest small-n bounds (Correll & Gleicher: show it)."""
    if n == 0:
        return [0.0, 0.0]
    p = k / n
    d = 1 + z * z / n
    c = p + z * z / (2 * n)
    r = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return [round((c - r) / d, 3), round((c + r) / d, 3)]


def main():
    names = json.loads((HERE / "sleeper-name-map.json").read_text())

    # ---------- per-season transaction events ----------
    events = []
    career_moves, career_trades, seasons_present = Counter(), Counter(), Counter()
    for season in SEASONS:
        rosters = load(f"{season}-rosters.json") or []
        owner_of = {r["roster_id"]: r.get("owner_id") for r in rosters}
        for oid in owner_of.values():
            if oid:
                seasons_present[oid] += 1
        for rnd in range(1, 19):
            for t in load(f"{season}-txn-{rnd}.json") or []:
                if t.get("status") != "complete":
                    continue
                # David, 2026-07-28: drop the startup draft. Its pick swap moved
                # rounds far deeper than this league's three-round rookie draft,
                # it happened once, and it will never happen again.
                if max((dp.get("round") or 0) for dp in (t.get("draft_picks") or [])) > 3 \
                        if t.get("draft_picks") else False:
                    continue
                when = dt(t.get("status_updated") or t.get("created"))
                if not when:
                    continue
                events.append(
                    {
                        "season": season,
                        "type": t.get("type"),
                        "date": when.strftime("%Y-%m-%d"),
                        "month": when.month,
                        "roster_ids": t.get("roster_ids") or [],
                        "picks": len(t.get("draft_picks") or []),
                        "players": len(t.get("adds") or {}),
                    }
                )
                for rid in t.get("roster_ids") or []:
                    oid = owner_of.get(rid)
                    if oid:
                        career_moves[oid] += 1
                        if t.get("type") == "trade":
                            career_trades[oid] += 1

    trades = [e for e in events if e["type"] == "trade"]
    n_tr = len(trades)

    calendar = []
    for m in range(1, 13):
        tr = sum(1 for e in trades if e["month"] == m)
        calendar.append(
            {
                "month": MONTHS[m - 1],
                "trades": tr,
                "share": round(tr / n_tr, 3),
                "ci95": wilson(tr, n_tr),
                "all_moves": sum(1 for e in events if e["month"] == m),
                "picks_moved": sum(e["picks"] for e in trades if e["month"] == m),
                "by_season": {
                    str(s): sum(1 for e in trades if e["month"] == m and e["season"] == s)
                    for s in SEASONS
                },
            }
        )

    inseason = sum(c["trades"] for c in calendar if c["month"] in ("Sep", "Oct", "Nov", "Dec"))

    # ---------- 2026 identities and activity ----------
    users = load("2026-users.json")
    rosters26 = load("2026-rosters.json")
    name_by_owner = {
        u["user_id"]: ((u.get("metadata") or {}).get("team_name") or u.get("display_name"))
        for u in users
    }
    owner_by_roster = {r["roster_id"]: r.get("owner_id") for r in rosters26}

    moves26, trades26, picks_in, picks_out, last_move = (
        Counter(),
        Counter(),
        Counter(),
        Counter(),
        {},
    )
    trade_log = []
    for rnd in range(1, 19):
        for t in load(f"2026-txn-{rnd}.json") or []:
            if t.get("status") != "complete":
                continue
            when = dt(t.get("status_updated") or t.get("created"))
            stamp = when.strftime("%Y-%m-%d") if when else None
            for rid in t.get("roster_ids") or []:
                moves26[rid] += 1
                if stamp and stamp > last_move.get(rid, ""):
                    last_move[rid] = stamp
            if t.get("type") != "trade":
                continue
            for rid in t.get("roster_ids") or []:
                trades26[rid] += 1
            for dp in t.get("draft_picks") or []:
                picks_in[dp.get("owner_id")] += 1
                picks_out[dp.get("previous_owner_id")] += 1
            trade_log.append(
                {
                    "date": stamp,
                    "parties": [name_by_owner.get(owner_by_roster.get(r)) for r in t["roster_ids"]],
                    "players": [
                        {
                            "name": (names.get(pid) or {}).get("n", pid),
                            "pos": (names.get(pid) or {}).get("p"),
                            "to": name_by_owner.get(owner_by_roster.get(rid)),
                        }
                        for pid, rid in (t.get("adds") or {}).items()
                    ],
                    "picks": [
                        {
                            "season": dp.get("season"),
                            "round": dp.get("round"),
                            "origin": name_by_owner.get(owner_by_roster.get(dp.get("roster_id"))),
                            "from": name_by_owner.get(owner_by_roster.get(dp.get("previous_owner_id"))),
                            "to": name_by_owner.get(owner_by_roster.get(dp.get("owner_id"))),
                        }
                        for dp in t.get("draft_picks") or []
                    ],
                }
            )
    trade_log.sort(key=lambda e: e["date"] or "", reverse=True)

    # ---------- what the app currently believes ----------
    with urllib.request.urlopen("http://127.0.0.1:8000/api/league/pulse", timeout=30) as r:
        pulse = json.loads(r.read())
    posture = {int(t["roster_id"]): t.get("posture_label") for t in pulse["team_postures"]}
    pscore = {int(p["counterparty_roster_id"]): p["partner_score"] for p in pulse["partner_rankings"]}
    pcomp = {
        int(p["counterparty_roster_id"]): p["score_components"] for p in pulse["partner_rankings"]
    }
    prank = {rid: i + 1 for i, rid in enumerate(sorted(pscore, key=lambda x: -pscore[x]))}

    managers = []
    for r in sorted(rosters26, key=lambda x: x["roster_id"]):
        rid = r["roster_id"]
        oid = r.get("owner_id")
        managers.append(
            {
                "roster_id": rid,
                "team": name_by_owner.get(oid) or f"roster {rid}",
                "is_you": rid == 1,
                "app_posture": posture.get(rid),
                "app_partner_rank": prank.get(rid),
                "app_partner_score": pscore.get(rid),
                "app_score_components": pcomp.get(rid),
                "moves_2026": moves26.get(rid, 0),
                "trades_2026": trades26.get(rid, 0),
                "picks_acquired_2026": picks_in.get(rid, 0),
                "picks_spent_2026": picks_out.get(rid, 0),
                "net_picks_2026": picks_in.get(rid, 0) - picks_out.get(rid, 0),
                "last_move": last_move.get(rid),
                "days_since_last_move": (
                    (
                        datetime.strptime(TODAY, "%Y-%m-%d")
                        - datetime.strptime(last_move[rid], "%Y-%m-%d")
                    ).days
                    if rid in last_move
                    else None
                ),
                "career_moves": career_moves.get(oid, 0),
                "career_trades": career_trades.get(oid, 0),
                "seasons_in_league": seasons_present.get(oid, 0),
            }
        )

    # ---------- every trade in league history, resolved to names ----------
    tl = json.loads((HERE / "trade-log.json").read_text())
    all_trades = tl["trades"]
    for t in all_trades:
        # 2023 was the league's first season, so its pre-season pick swap is a
        # STARTUP draft — a different animal from every rookie draft since, and
        # it never recurs. Flagged so the surface can say so rather than letting
        # one square imply July is a trading month.
        deepest = max((p["round"] for s in t["sides"] for p in s["picks"]), default=0)
        t["startup_era"] = deepest > 3
    # index trades by (season, month) so a calendar square can name itself
    by_cell = {}
    for t in all_trades:
        by_cell.setdefault(f"{t['season']}-{t['month']}", []).append(t["id"])

    lanes = json.loads((HERE / "lanes.json").read_text())
    habits = json.loads((HERE / "habits.json").read_text())
    by_team = {r["team"]: r for r in habits["rows"]}
    for p in lanes["profiles"]:
        p["habit"] = by_team.get(p["team"], {})
    lanes["habit_verdicts"] = habits["verdicts"]

    out = {
        "all_trades": all_trades,
        "trades_by_cell": by_cell,
        "lanes": lanes,
        "measured_at": TODAY,
        "source": "Sleeper /league/{id}/transactions/{1..18}, four seasons; app /api/league/pulse",
        "league": "Redzone Champions League (12-team superflex dynasty)",
        "you": "Woodbury Riders (roster 1)",
        "totals": {
            "complete_transactions_4_seasons": len(events),
            "trades_4_seasons": n_tr,
            "trades_2026": sum(1 for e in trades if e["season"] == 2026),
            "by_type": dict(Counter(e["type"] for e in events)),
            "trades_with_at_least_one_pick": sum(1 for e in trades if e["picks"] > 0),
        },
        "calendar": calendar,
        "calendar_summary": {
            "inseason_sep_dec_trades": inseason,
            "inseason_share": round(inseason / n_tr, 3),
            "inseason_ci95": wilson(inseason, n_tr),
            "zero_trade_months": [c["month"] for c in calendar if c["trades"] == 0],
        },
        "managers": managers,
        "trade_log_2026": trade_log,
        "app_state": {
            "team_posture_artifact_captured": pulse["source_artifacts"]["team_posture"]["captured_at"],
            "league_opportunity_artifact_captured": pulse["source_artifacts"]["league_opportunity"][
                "captured_at"
            ],
            "pulse_status": pulse["status"],
            "activity_recency_distinct_values": sorted(
                {c["activity_recency_score"] for c in pcomp.values()}
            ),
            "divergence_density_distinct_values": sorted(
                {c["divergence_density_score"] for c in pcomp.values()}
            ),
        },
        "caveats": [
            "n=39 trades over four seasons; monthly shares carry wide intervals (Wilson 95% given).",
            "Transaction timestamps are Sleeper's status_updated (fallback created), in UTC.",
            "Manager identity is joined on Sleeper user_id, so a manager who changed team name "
            "or roster slot between seasons is still tracked; two of the twelve have fewer than "
            "four seasons in this league.",
            "Sleeper's log records completed transactions only in this measurement; failed waiver "
            "claims (53/48/74/6 per season) are excluded.",
        ],
    }
    OUT.write_text(json.dumps(out, indent=1))
    print(f"wrote {OUT} ({OUT.stat().st_size:,} bytes)")
    print(json.dumps(out["totals"], indent=1))
    print(json.dumps(out["calendar_summary"], indent=1))
    print(json.dumps(out["app_state"], indent=1))


if __name__ == "__main__":
    main()
