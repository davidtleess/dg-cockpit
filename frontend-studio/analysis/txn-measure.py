#!/usr/bin/env python3
"""What is actually in the transactions endpoint the product never calls.

Reads analysis/txn-raw/*.json (pulled by curl from api.sleeper.app) and reports
volume, type mix, per-manager activity, and pick flow.

Everything here is Studio's own computation, unreviewed.
"""

import json
import pathlib
from collections import Counter, defaultdict
from datetime import datetime, timezone

RAW = pathlib.Path(__file__).parent / "txn-raw"
OUT = pathlib.Path(__file__).parent / "transactions-measured.json"
SEASONS = [2023, 2024, 2025, 2026]
DAVID_ROSTER_ID = 1


def load(name):
    p = RAW / name
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text())
    except Exception:
        return None


def ts(ms):
    if not ms:
        return None
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).strftime("%Y-%m-%d")


def main():
    report = {"seasons": {}, "totals": {}}
    all_txns = []

    for season in SEASONS:
        league = load(f"{season}-league.json")
        users = load(f"{season}-users.json") or []
        rosters = load(f"{season}-rosters.json") or []
        if not isinstance(league, dict) or "league_id" not in league:
            report["seasons"][str(season)] = {"error": "league fetch failed", "raw": league}
            continue

        owner_by_roster = {}
        name_by_owner = {}
        for u in users:
            name_by_owner[u["user_id"]] = (u.get("metadata") or {}).get("team_name") or u.get(
                "display_name"
            )
        for r in rosters:
            owner_by_roster[r["roster_id"]] = name_by_owner.get(r.get("owner_id"), f"roster{r['roster_id']}")

        txns = []
        for rnd in range(1, 19):
            block = load(f"{season}-txn-{rnd}.json") or []
            for t in block:
                t["_season"] = season
                t["_round"] = rnd
                txns.append(t)

        complete = [t for t in txns if t.get("status") == "complete"]
        types = Counter(t.get("type") for t in complete)
        trades = [t for t in complete if t.get("type") == "trade"]

        # per-manager activity
        per_roster = Counter()
        per_roster_trades = Counter()
        for t in complete:
            for rid in t.get("roster_ids") or []:
                per_roster[rid] += 1
                if t.get("type") == "trade":
                    per_roster_trades[rid] += 1

        # pick flow: who accumulated picks, who spent them
        picks_in = Counter()
        picks_out = Counter()
        for t in trades:
            for dp in t.get("draft_picks") or []:
                picks_in[dp.get("owner_id")] += 1
                picks_out[dp.get("previous_owner_id")] += 1

        dates = [ts(t.get("status_updated") or t.get("created")) for t in complete]
        dates = sorted(d for d in dates if d)

        report["seasons"][str(season)] = {
            "league_id": league["league_id"],
            "league_name": league.get("name"),
            "status": league.get("status"),
            "raw_rows": len(txns),
            "complete": len(complete),
            "by_type": dict(types),
            "by_status": dict(Counter(t.get("status") for t in txns)),
            "trades": len(trades),
            "date_span": [dates[0], dates[-1]] if dates else None,
            "activity_per_manager": {
                owner_by_roster.get(rid, str(rid)): {
                    "moves": per_roster[rid],
                    "trades": per_roster_trades[rid],
                    "picks_acquired": picks_in.get(rid, 0),
                    "picks_traded_away": picks_out.get(rid, 0),
                }
                for rid in sorted(per_roster, key=lambda x: -per_roster[x])
            },
            "owner_by_roster": owner_by_roster,
        }
        all_txns.extend(complete)

    report["totals"] = {
        "complete_transactions_all_seasons": len(all_txns),
        "trades_all_seasons": sum(1 for t in all_txns if t.get("type") == "trade"),
        "by_type": dict(Counter(t.get("type") for t in all_txns)),
    }

    OUT.write_text(json.dumps(report, indent=1))

    # human-readable
    for season, blk in report["seasons"].items():
        if "error" in blk:
            print(f"{season}: ERROR {blk['error']}")
            continue
        print(f"\n=== {season}  {blk['league_name']}  ({blk['status']}) ===")
        print(f"  complete: {blk['complete']}  raw: {blk['raw_rows']}  span: {blk['date_span']}")
        print(f"  by_type: {blk['by_type']}")
        print(f"  by_status: {blk['by_status']}")
        print("  per-manager (moves / trades / picks in / picks out):")
        for name, a in blk["activity_per_manager"].items():
            print(
                f"    {name[:32]:34} {a['moves']:4}  {a['trades']:3}  "
                f"{a['picks_acquired']:3}  {a['picks_traded_away']:3}"
            )
    print("\nTOTALS:", json.dumps(report["totals"]))
    print(f"\nwrote {OUT}")


if __name__ == "__main__":
    main()
