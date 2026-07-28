#!/usr/bin/env python3
"""Place David's roster on the derived ladder, and test whether the ladder speaks.

Three coordinates per player, all in the hobby's own language:
  - the vernacular slot name  (WR2, QB1 ...) - the 12-block coordinate system
  - the nearest measured cliff - where the market actually breaks
  - the league's own startable depth (Harstad) - whether the slot is a job here

Market lane only. Model lane quarantined pending the population-rebase fix.
"""

import json
from collections import defaultdict

MARKET = "/Users/davidleess/dynasty-genius-product/app/cache/fantasycalc/market_values.json"
SNAP = ("/Users/davidleess/dynasty-genius-product/app/data/league_runtime/runs/"
        "league-20260726T132000Z/snapshot.json")
MEAS = "/Users/davidleess/frontend-studio/analysis/tier-ladder-measurements.json"

POSITIONS = ["QB", "RB", "WR", "TE"]
N = 12  # teams -> the vernacular block size


def vernacular(pos, rank):
    """WR13 -> ('WR2', 'high-end'). The hobby's coordinate system: 12-blocks,
    each split into thirds. 'high-end WR2' == WR13-16 exactly."""
    block = (rank - 1) // N + 1
    within = (rank - 1) % N
    grade = ["high-end", "mid", "low-end"][within // 4]
    return f"{pos}{block}", grade


def main():
    meas = json.load(open(MEAS))
    repl = meas["harstad_replacement"]

    raw = json.load(open(MARKET))
    by_id, board = {}, defaultdict(list)
    for r in raw["data"]:
        p = r["player"]
        if p["position"] not in POSITIONS:
            continue
        board[p["position"]].append(r)
    for pos in POSITIONS:
        board[pos].sort(key=lambda r: -r["value"])
        for i, r in enumerate(board[pos]):
            sid = r["player"].get("sleeperId")
            if sid:
                by_id[sid] = {"rank": i + 1, "pos": pos, "value": r["value"],
                              "name": r["player"]["name"],
                              "age": r["player"].get("maybeAge")}

    snap = json.load(open(SNAP))
    my_id = snap["david_roster_id"]
    mine = next(r for r in snap["rosters"] if r["roster_id"] == my_id)
    players = {}
    for rec in snap.get("players") or []:
        pl = rec.get("player") or {}
        sid = rec.get("sleeper_player_id")
        if sid:
            players[str(sid)] = pl

    rows, unpriced = [], []
    for sid in mine["players"]:
        if sid in by_id:
            rows.append(by_id[sid])
        else:
            meta = players.get(sid) or {}
            unpriced.append((sid, meta.get("full_name", "?"), meta.get("position", "?")))

    print("=" * 78)
    print(f"ROSTER {my_id} on the ladder   |  snapshot {snap['captured_at'][:10]}"
          f"  |  market {raw['fetched_at'][:10]}")
    print(f"  {len(mine['players'])} players held, {len(rows)} priced by the market, "
          f"{len(unpriced)} unpriced")
    print("=" * 78)

    for pos in POSITIONS:
        group = sorted([r for r in rows if r["pos"] == pos], key=lambda r: r["rank"])
        depth = repl[pos]
        starts = 21.0 if pos == "QB" else (N * 2 if pos in ("RB", "WR") else N)
        print(f"\n{pos}  - you hold {len(group)}"
              f"   |  league starts ~{starts:.0f} weekly"
              f"   |  startable ends ~{pos}{depth:.0f} (Harstad)")
        if not group:
            print("     (none priced)")
            continue
        for r in group:
            slot, grade = vernacular(pos, r["rank"])
            startable = "startable" if r["rank"] <= depth else "below replacement"
            weekly = "STARTS weekly" if r["rank"] <= starts else ""
            age = f"{r['age']:.1f}" if r["age"] else "  ? "
            print(f"     {pos}{r['rank']:<4}{r['name']:<24}{age:>5}"
                  f"   {grade + ' ' + slot:<18}{r['value']:>7}"
                  f"   {startable:<18}{weekly}")

    if unpriced:
        print(f"\nUNPRICED by the market ({len(unpriced)}) - no tier can be assigned:")
        for sid, name, pos in unpriced:
            print(f"     {pos:<4}{name}  ({sid})")

    # the shape question the ladder should answer without prose
    print("\n" + "=" * 78)
    print("WHAT THE LADDER SAYS ABOUT ROSTER SHAPE")
    print("=" * 78)
    for pos in POSITIONS:
        group = [r for r in rows if r["pos"] == pos]
        depth, starts = repl[pos], (21.0 if pos == "QB" else (N * 2 if pos in ("RB", "WR") else N))
        startable = [r for r in group if r["rank"] <= depth]
        weekly = [r for r in group if r["rank"] <= starts]
        top12 = [r for r in group if r["rank"] <= N]
        need = {"QB": 2, "RB": 2, "WR": 2, "TE": 1}[pos]
        print(f"  {pos}: hold {len(group):>2}"
              f" | {len(startable):>2} clear replacement"
              f" | {len(weekly):>2} good enough to start in this league"
              f" | {len(top12):>2} are top-12"
              f" | you must field {need}")


if __name__ == "__main__":
    main()
