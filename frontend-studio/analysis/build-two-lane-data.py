#!/usr/bin/env python3
"""Emit ladder-data.js with BOTH lanes on one ruler.

The three rules that keep this from being apples-to-oranges:

  ONE POPULATION. Both lanes are ranked over only the players they share (337).
  Ranking each lane over its own board is the broken comparison.

  ONE RULER. Tier boundaries come from the league's starting structure — twelve
  teams each fielding one starter at the position — not from either lane's value
  distribution. So the boundaries are identical for both lanes and belong to the
  position, not to the lane. Deriving them per-lane would make "our tier 2" and
  "market tier 2" different-sized objects, which is the deeper apples-to-oranges.

  TIES STAY TIES. Where our model gives several players the identical value it
  cannot rank them, and the surface says so rather than inventing an order.
"""

import json, sqlite3, collections

MARKET = "/Users/davidleess/dynasty-genius-product/app/cache/fantasycalc/market_values.json"
MODELDB = "/Users/davidleess/dynasty-genius-product/app/data/model_forward_capture.db"
SNAP = ("/Users/davidleess/dynasty-genius-product/app/data/league_runtime/runs/"
        "league-20260726T132000Z/snapshot.json")
LEAGUE = ("/Users/davidleess/dynasty-genius-product/app/data/research/league_behavior/"
          "raw/2026-07-19/season_2026_1314363401744416768/league.json")
OUT = "/Users/davidleess/frontend-studio/proposals/011-what-is-he/ladder-data.js"

POSITIONS = ["QB", "RB", "WR", "TE"]
N = 12


def block_name(pos, rank):
    return f"{pos}{(rank - 1) // N + 1}"


def grade(rank):
    return ["high-end", "mid", "low-end"][((rank - 1) % N) // 4]


def main():
    payload = json.load(open(LEAGUE))["payload"]
    counts = collections.Counter(payload["roster_positions"])
    S = {p: counts.get(p, 0) for p in POSITIONS}
    F, SF = counts.get("FLEX", 0), counts.get("SUPER_FLEX", 0)
    harstad = {
        "QB": N * (S["QB"] + 0.75 * SF) * 1.56,
        "RB": N * (S["RB"] + 0.30 * F + 0.08 * SF) * 1.22,
        "WR": N * (S["WR"] + 0.70 * F + 0.17 * SF) * 1.22,
        "TE": N * (S["TE"]) * 1.81,
    }
    weekly = {"QB": round(N * (S["QB"] + 0.75 * SF), 1), "RB": N * S["RB"],
              "WR": N * S["WR"], "TE": N * S["TE"]}

    # ---- lanes -----------------------------------------------------------
    raw = json.load(open(MARKET))
    mkt = {}
    for r in raw["data"]:
        p = r["player"]
        sid = p.get("sleeperId")
        if p["position"] in POSITIONS and sid:
            mkt[str(sid)] = {"pos": p["position"], "name": p["name"], "value": r["value"],
                             "age": p.get("maybeAge"), "trend30": r.get("trend30Day")}

    c = sqlite3.connect(MODELDB)
    mday = c.execute("select max(capture_date) from model_forward_capture_joinable").fetchone()[0]
    mdl = {}
    for sid, name, pos, dvs, gradec in c.execute(
            "select sleeper_id, player_name, position, dynasty_value_score, model_grade "
            "from model_forward_capture_joinable where capture_date=?", (mday,)):
        if pos in POSITIONS and sid and dvs is not None:
            mdl[str(sid)] = {"pos": pos, "name": name, "dvs": dvs, "grade": gradec}

    shared = sorted(set(mkt) & set(mdl))

    # ---- ownership -------------------------------------------------------
    snap = json.load(open(SNAP))
    users = {u.get("user_id"): (u.get("display_name") or "?") for u in snap.get("users") or []}
    owner, roster_of = {}, {}
    for r in snap["rosters"]:
        owner[r["roster_id"]] = users.get(r.get("owner_id"), f"roster {r['roster_id']}")
        for sid in r.get("players") or []:
            roster_of[str(sid)] = r["roster_id"]
    mine_id = snap["david_roster_id"]
    reserve = {}
    for rec in snap.get("players") or []:
        sid, lc = str(rec.get("sleeper_player_id")), (rec.get("league_context") or {})
        if lc.get("on_ir"):
            reserve[sid] = "IR"
        elif lc.get("on_taxi"):
            reserve[sid] = "taxi"

    positions = {}
    for pos in POSITIONS:
        ids = [s for s in shared if mkt[s]["pos"] == pos]

        # rank both lanes over the SAME ids
        by_mkt = sorted(ids, key=lambda s: -mkt[s]["value"])
        by_mdl = sorted(ids, key=lambda s: -mdl[s]["dvs"])
        mrank = {s: i + 1 for i, s in enumerate(by_mkt)}
        # competition ranking so equal DVS shares a rank rather than inventing order
        drank, tie_of = {}, {}
        dvs_counts = collections.Counter(mdl[s]["dvs"] for s in ids)
        i = 0
        while i < len(by_mdl):
            v = mdl[by_mdl[i]]["dvs"]
            grp = [s for s in by_mdl[i:] if mdl[s]["dvs"] == v]
            for s in grp:
                drank[s] = i + 1
                tie_of[s] = len(grp)
            i += len(grp)

        top = mkt[by_mkt[0]]["value"]
        players = []
        for s in by_mkt:
            rid = roster_of.get(s)
            mr, dr = mrank[s], drank[s]
            players.append({
                "id": s,
                "name": mkt[s]["name"],
                "age": mkt[s]["age"],
                "value": mkt[s]["value"],
                "pct": round(100.0 * mkt[s]["value"] / top, 2),
                "trend30": mkt[s]["trend30"],
                "mrank": mr, "mtier": block_name(pos, mr), "mgrade": grade(mr),
                "drank": dr, "dtier": block_name(pos, dr), "dgrade": grade(dr),
                "dvs": mdl[s]["dvs"],
                "tie": tie_of[s],                       # >1 => our lane cannot separate
                "gap": mr - dr,                         # + => we are higher on him
                "owner": owner.get(rid) if rid else None,
                "mine": rid == mine_id,
                "reserve": reserve.get(s),
            })

        blocks = []
        for b in range(1, (len(players) // N) + 2):
            lo, hi = (b - 1) * N + 1, min(b * N, len(players))
            if lo > len(players):
                break
            blocks.append({"name": f"{pos}{b}", "lo": lo, "hi": hi})

        # only inside the startable region: drops between near-worthless tail
        # players are large in percentage terms and mean nothing
        horizon = min(len(players) - 1, int(harstad[pos]))
        drops = []
        for i in range(horizon):
            a, bb = players[i]["value"], players[i + 1]["value"]
            if a > 0:
                drops.append({"after": i + 1, "pct": round(100.0 * (a - bb) / a, 1)})
        drops.sort(key=lambda x: -x["pct"])

        ceiling = max(mdl[s]["dvs"] for s in ids)
        positions[pos] = {
            "players": players, "n": len(players), "blocks": blocks,
            "cliffs": sorted(drops[:5], key=lambda x: x["after"]),
            "weekly_starts": weekly[pos], "replacement": round(harstad[pos], 1),
            "held": sum(1 for p in players if p["mine"]),
            "ceiling": ceiling,
            "ceiling_ties": sum(1 for s in ids if mdl[s]["dvs"] == ceiling),
            "market_only": sum(1 for s in mkt if mkt[s]["pos"] == pos and s not in mdl),
            "model_only": sum(1 for s in mdl if mdl[s]["pos"] == pos and s not in mkt),
        }

    out = {
        "generated_from": {"market": raw["fetched_at"], "model": mday,
                           "snapshot": snap["captured_at"]},
        "league": {"teams": N, "lineup": dict(counts),
                   "starters_per_team": sum(v for k, v in counts.items() if k != "BN")},
        "shared": len(shared),
        "market_only": len(set(mkt) - set(mdl)),
        "model_only": len(set(mdl) - set(mkt)),
        "positions": positions,
    }
    with open(OUT, "w") as f:
        f.write("// Generated by analysis/build-two-lane-data.py — do not edit by hand.\n")
        f.write("// Both lanes ranked over the 337 players they SHARE; tier boundaries from\n")
        f.write("// the league's starting structure, identical for both lanes.\n")
        f.write("window.LADDER = ")
        json.dump(out, f, indent=1)
        f.write(";\n")
    print(f"written {OUT}")
    print(f"shared {len(shared)} | market-only {out['market_only']} | model-only {out['model_only']}")
    for pos in POSITIONS:
        d = positions[pos]
        print(f"  {pos}: {d['n']} on the shared board, {d['held']} held, "
              f"ceiling {d['ceiling']} shared by {d['ceiling_ties']}")


if __name__ == "__main__":
    main()
