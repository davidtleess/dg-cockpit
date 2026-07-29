#!/usr/bin/env python3
"""Does what managers ACTUALLY DID agree with the posture the app infers from
their roster snapshot?

The app's posture (src/dynasty_genius/team_posture.py) is derived from four
roster-shape signals: 60% starter value, 20% age, 15% draft picks, 5% taxi.
It never observes a single transaction.

This compares it against revealed preference from Sleeper's transaction log:
- picks acquired vs. picks spent (the rebuild/contend tell)
- total activity (is this manager even reachable?)

Studio's own computation, unreviewed.
"""

import json
import pathlib
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone

HERE = pathlib.Path(__file__).parent
RAW = HERE / "txn-raw"
OUT = HERE / "txn-vs-posture.json"
API = "http://127.0.0.1:8000/api"


def load(name):
    p = RAW / name
    return json.loads(p.read_text()) if p.exists() else None


def api(path):
    with urllib.request.urlopen(f"{API}{path}", timeout=30) as r:
        return json.loads(r.read())


def day(ms):
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).strftime("%Y-%m-%d") if ms else None


def main():
    users = load("2026-users.json")
    rosters = load("2026-rosters.json")
    name_by_owner = {
        u["user_id"]: ((u.get("metadata") or {}).get("team_name") or u.get("display_name"))
        for u in users
    }
    team_by_roster = {r["roster_id"]: name_by_owner.get(r.get("owner_id"), f"roster{r['roster_id']}") for r in rosters}

    txns = []
    for rnd in range(1, 19):
        for t in load(f"2026-txn-{rnd}.json") or []:
            if t.get("status") == "complete":
                txns.append(t)
    txns.sort(key=lambda t: t.get("status_updated") or t.get("created") or 0)

    # --- revealed signals, 2026 only ---
    picks_in, picks_out, moves, trades, last_move = Counter(), Counter(), Counter(), Counter(), {}
    for t in txns:
        stamp = day(t.get("status_updated") or t.get("created"))
        for rid in t.get("roster_ids") or []:
            moves[rid] += 1
            if stamp and (rid not in last_move or stamp > last_move[rid]):
                last_move[rid] = stamp
        if t.get("type") == "trade":
            for rid in t.get("roster_ids") or []:
                trades[rid] += 1
            for dp in t.get("draft_picks") or []:
                picks_in[dp.get("owner_id")] += 1
                picks_out[dp.get("previous_owner_id")] += 1

    # --- the app's inferred posture, live ---
    pulse = api("/league/pulse")
    postures = {int(t["roster_id"]): t.get("posture_label") for t in pulse["team_postures"]}
    partner_score = {
        int(p["counterparty_roster_id"]): p["partner_score"] for p in pulse["partner_rankings"]
    }
    partner_rank = {
        rid: i + 1
        for i, rid in enumerate(
            sorted(partner_score, key=lambda r: -partner_score[r])
        )
    }

    rows = []
    for rid in sorted(team_by_roster):
        net_picks = picks_in.get(rid, 0) - picks_out.get(rid, 0)
        rows.append(
            {
                "roster_id": rid,
                "team": team_by_roster[rid],
                "app_posture": postures.get(rid),
                "app_partner_rank": partner_rank.get(rid),
                "app_partner_score": partner_score.get(rid),
                "moves_2026": moves.get(rid, 0),
                "trades_2026": trades.get(rid, 0),
                "picks_acquired": picks_in.get(rid, 0),
                "picks_spent": picks_out.get(rid, 0),
                "net_picks": net_picks,
                "last_move": last_move.get(rid),
            }
        )

    print(
        f"{'':2} {'team':26} {'app posture':12} {'app rank':>8} "
        f"{'moves':>6} {'trades':>7} {'netpk':>6} {'last move':>12}"
    )
    for r in sorted(rows, key=lambda x: (x["app_partner_rank"] or 99)):
        print(
            f"{r['roster_id']:2} {str(r['team'])[:26]:26} {str(r['app_posture'])[:12]:12} "
            f"{str(r['app_partner_rank']):>8} "
            f"{r['moves_2026']:6} {r['trades_2026']:7} {r['net_picks']:+6} {str(r['last_move']):>12}"
        )

    # --- the 2026 trade log, in plain language ---
    players = json.loads((HERE / "league-players-2026-07-24.json").read_text()) if (
        HERE / "league-players-2026-07-24.json"
    ).exists() else {}

    print("\n=== 2026 trades, newest first ===")
    trade_log = []
    for t in reversed([t for t in txns if t.get("type") == "trade"]):
        stamp = day(t.get("status_updated") or t.get("created"))
        parties = [team_by_roster.get(r, r) for r in t.get("roster_ids") or []]
        adds = t.get("adds") or {}
        picks = [
            f"{dp.get('season')} R{dp.get('round')} ({team_by_roster.get(dp.get('roster_id'),'?')}) "
            f"{team_by_roster.get(dp.get('previous_owner_id'),'?')}→{team_by_roster.get(dp.get('owner_id'),'?')}"
            for dp in t.get("draft_picks") or []
        ]
        entry = {
            "date": stamp,
            "parties": parties,
            "player_ids_moved": list(adds.keys()),
            "picks_moved": picks,
        }
        trade_log.append(entry)
        print(f"  {stamp}  {' <-> '.join(str(p) for p in parties)}")
        print(f"      players: {len(adds)}  picks: {len(picks)}")
        for p in picks:
            print(f"        {p}")

    OUT.write_text(json.dumps({"rows": rows, "trade_log": trade_log}, indent=1))
    print(f"\nwrote {OUT}")


if __name__ == "__main__":
    main()
