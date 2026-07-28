#!/usr/bin/env python3
"""Emit ladder-data.js for the 011 prototype.

Market lane only, by design. The model lane is quarantined: the two lanes are
ranked over different populations, which moves average disagreement ~10.7
percentile points and takes the apparent systematic gap to zero once matched.
No cross-lane number is computed here; the model lane ships as an honest
pending state until the rebase lands.

Everything emitted is either MEASURED (from the market pull / the league config)
or DERIVED by a cited formula. Nothing is a prior.
"""

import json
from collections import Counter, defaultdict

MARKET = "/Users/davidleess/dynasty-genius-product/app/cache/fantasycalc/market_values.json"
SNAP = ("/Users/davidleess/dynasty-genius-product/app/data/league_runtime/runs/"
        "league-20260726T132000Z/snapshot.json")
OUT = "/Users/davidleess/frontend-studio/proposals/011-what-is-he/ladder-data.js"

POSITIONS = ["QB", "RB", "WR", "TE"]
N = 12


def vernacular(pos, rank):
    block = (rank - 1) // N + 1
    grade = ["high-end", "mid", "low-end"][((rank - 1) % N) // 4]
    return f"{pos}{block}", grade


def main():
    snap = json.load(open(SNAP))
    payload_counts = Counter(
        json.load(open("/Users/davidleess/dynasty-genius-product/app/data/research/"
                       "league_behavior/raw/2026-07-19/"
                       "season_2026_1314363401744416768/league.json"))
        ["payload"]["roster_positions"])
    S = {p: payload_counts.get(p, 0) for p in POSITIONS}
    F, SF = payload_counts.get("FLEX", 0), payload_counts.get("SUPER_FLEX", 0)

    # Harstad, "Calculating New Positional Baselines" (Footballguys), PPR coefficients.
    harstad = {
        "QB": N * (S["QB"] + 0.75 * SF) * 1.56,
        "RB": N * (S["RB"] + 0.30 * F + 0.08 * SF) * 1.22,
        "WR": N * (S["WR"] + 0.70 * F + 0.17 * SF) * 1.22,
        "TE": N * (S["TE"]) * 1.81,
    }
    # Exact structural demand: no estimate, pure league arithmetic.
    hard = {"QB": N * S["QB"], "RB": N * S["RB"], "WR": N * S["WR"], "TE": N * S["TE"]}
    qb_with_sf = N * (S["QB"] + 0.75 * SF)

    # ---- ownership -------------------------------------------------------
    owner_of, name_of = {}, {}
    for u in snap.get("users") or []:
        name_of[u.get("user_id")] = u.get("display_name") or "?"
    roster_owner, roster_of = {}, {}
    for r in snap["rosters"]:
        roster_owner[r["roster_id"]] = name_of.get(r.get("owner_id"), f"roster {r['roster_id']}")
        for sid in r.get("players") or []:
            roster_of[str(sid)] = r["roster_id"]
    mine = snap["david_roster_id"]

    ir_taxi = {}
    for rec in snap.get("players") or []:
        sid = str(rec.get("sleeper_player_id"))
        lc = rec.get("league_context") or {}
        if lc.get("on_ir"):
            ir_taxi[sid] = "IR"
        elif lc.get("on_taxi"):
            ir_taxi[sid] = "taxi"

    # ---- board -----------------------------------------------------------
    raw = json.load(open(MARKET))
    board = defaultdict(list)
    for r in raw["data"]:
        if r["player"]["position"] in POSITIONS:
            board[r["player"]["position"]].append(r)

    positions = {}
    for pos in POSITIONS:
        rows = sorted(board[pos], key=lambda r: -r["value"])
        top = rows[0]["value"]
        players = []
        for i, r in enumerate(rows):
            p, rank = r["player"], i + 1
            sid = str(p.get("sleeperId") or "")
            rid = roster_of.get(sid)
            slot, grade = vernacular(pos, rank)
            players.append({
                "rank": rank,
                "name": p["name"],
                "value": r["value"],
                "pct": round(100.0 * r["value"] / top, 2),
                "age": p.get("maybeAge"),
                "team": p.get("maybeTeam"),
                "slot": slot,
                "grade": grade,
                "label": f"{grade} {slot}",
                "trend30": r.get("trend30Day"),
                "owner": roster_owner.get(rid) if rid else None,
                "mine": rid == mine,
                "reserve": ir_taxi.get(sid),
            })

        # measured cliffs: single-step drops, scanned to 1.4x replacement depth
        horizon = min(len(players) - 1, int(harstad[pos] * 1.4))
        drops = []
        for i in range(horizon):
            a, b = players[i]["value"], players[i + 1]["value"]
            if a > 0:
                drops.append({"after": i + 1, "pct": round(100.0 * (a - b) / a, 1),
                              "from": players[i]["name"], "to": players[i + 1]["name"]})
        drops.sort(key=lambda d: -d["pct"])
        cliffs = sorted(drops[:5], key=lambda d: d["after"])

        blocks = []
        for b in range(1, (len(players) // N) + 2):
            lo, hi = (b - 1) * N + 1, min(b * N, len(players))
            if lo > len(players):
                break
            blocks.append({"name": f"{pos}{b}", "lo": lo, "hi": hi})

        positions[pos] = {
            "players": players,
            "n": len(players),
            "top_value": top,
            "blocks": blocks,
            "cliffs": cliffs,
            "hard_starts": hard[pos],
            "weekly_starts": round(qb_with_sf, 1) if pos == "QB" else hard[pos],
            "replacement": round(harstad[pos], 1),
            "held": sum(1 for p in players if p["mine"]),
        }

    out = {
        "generated_from": {
            "market": raw["fetched_at"],
            "snapshot": snap["captured_at"],
            "league": "Redzone Champions League",
        },
        "league": {
            "teams": N, "ppr": 1.0, "te_premium": False,
            "lineup": dict(payload_counts),
            "starters_per_team": sum(v for k, v in payload_counts.items() if k != "BN"),
        },
        "model_lane": {
            "state": "pending",
            "reason": ("Our rank is withheld here. The two lanes are ranked over "
                       "different player populations; matching them moves average "
                       "disagreement by ~10.7 percentile points and takes the "
                       "apparent systematic gap to zero. The lane fills in once "
                       "both boards are rebased onto the players they share."),
        },
        "positions": positions,
    }

    import os
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        f.write("// Generated by analysis/build-ladder-data.py — do not edit by hand.\n")
        f.write("// Market lane only; model lane pending the shared-population rebase.\n")
        f.write("window.LADDER = ")
        json.dump(out, f, indent=1)
        f.write(";\n")
    print(f"written {OUT}")
    for pos in POSITIONS:
        d = positions[pos]
        print(f"  {pos}: {d['n']} priced, {d['held']} held, "
              f"weekly starts {d['weekly_starts']}, replacement {d['replacement']}, "
              f"{len(d['cliffs'])} cliffs")


if __name__ == "__main__":
    main()
