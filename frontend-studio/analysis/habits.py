#!/usr/bin/env python3
"""WHICH HABITS ARE REAL, AND WHICH ARE NOISE.

David, 2026-07-28: "people are creature's of habit, right? what kind of habits
can we track and use to our advantage??"

A habit is only worth putting on a surface if (1) managers actually differ on it,
(2) the difference survives its sample size, and (3) knowing it changes how David
would approach that manager. This scores every candidate on all three and prints
a verdict per habit. Flat or unsupported habits get reported in a sentence, not
plotted (DAVID.md 2026-07-21).

Studio's own computation, unreviewed.
"""

import json
import math
import pathlib
import statistics as st
from collections import Counter, defaultdict
from datetime import datetime

HERE = pathlib.Path(__file__).parent
RAW = HERE / "txn-raw"
OUT = HERE / "habits.json"
SEASONS = [2023, 2024, 2025, 2026]


def load(n):
    p = RAW / n
    return json.loads(p.read_text()) if p.exists() else None


def wilson(k, n, z=1.96):
    if n == 0:
        return [0.0, 1.0]
    p = k / n
    d = 1 + z * z / n
    c = p + z * z / (2 * n)
    r = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return [round((c - r) / d, 3), round((c + r) / d, 3)]


def separates(rows, key, ci_key):
    """How many manager-pairs have non-overlapping intervals on this habit?
    Zero pairs = the habit is not measurable at this sample size."""
    ok = [r for r in rows if r.get(ci_key)]
    pairs = sep = 0
    for i in range(len(ok)):
        for j in range(i + 1, len(ok)):
            pairs += 1
            a, b = ok[i][ci_key], ok[j][ci_key]
            if a[0] > b[1] or b[0] > a[1]:
                sep += 1
    return sep, pairs


def main():
    names = json.loads((HERE / "sleeper-name-map.json").read_text())
    tl = json.loads((HERE / "trade-log.json").read_text())
    trades = [t for t in tl["trades"] if not t.get("startup_era")]
    YOU = tl["you"]

    label_by_owner = {}
    for s in SEASONS:
        for u in load(f"{s}-users.json") or []:
            nm = (u.get("metadata") or {}).get("team_name") or u.get("display_name")
            if nm:
                label_by_owner[u["user_id"]] = nm

    teams = []
    owner_of_2026 = {}
    for r in load("2026-rosters.json") or []:
        t = label_by_owner.get(r.get("owner_id"))
        teams.append(t)
        owner_of_2026[r["roster_id"]] = r.get("owner_id")

    H = {t: {
        "team": t, "is_you": t == YOU,
        "trades": 0, "picks_in": 0, "players_in": 0, "picks_out": 0, "players_out": 0,
        "assets_per_trade": [], "years_out": [], "in_season": 0,
        "pos_in": Counter(), "pos_out": Counter(),
        "roster_moves": 0, "faab": 0, "seasons": 0,
    } for t in teams}

    for t in trades:
        if len(t["sides"]) != 2:
            continue
        for i, s in enumerate(t["sides"]):
            other = t["sides"][1 - i]
            g = H.get(s["team"])
            if not g:
                continue
            g["trades"] += 1
            g["picks_in"] += len(s["picks"])
            g["players_in"] += len(s["players"])
            g["picks_out"] += len(other["picks"])
            g["players_out"] += len(other["players"])
            g["assets_per_trade"].append(len(s["players"]) + len(s["picks"]))
            for p in s["players"]:
                g["pos_in"][p["pos"]] += 1
            for p in other["players"]:
                g["pos_out"][p["pos"]] += 1
            for p in s["picks"]:
                try:
                    g["years_out"].append(int(p["season"]) - t["season"])
                except (TypeError, ValueError):
                    pass
            if t["date"] and datetime.strptime(t["date"], "%Y-%m-%d").month in (9,10,11,12,1):
                g["in_season"] += 1

    # engagement: waivers + free agents + FAAB, a much bigger sample than trades
    for season in SEASONS:
        rosters = load(f"{season}-rosters.json") or []
        owner_of = {r["roster_id"]: r.get("owner_id") for r in rosters}
        for r in rosters:
            t = label_by_owner.get(r.get("owner_id"))
            if t in H:
                H[t]["seasons"] += 1
                H[t]["faab"] += (r.get("settings") or {}).get("waiver_budget_used", 0) or 0
        for rnd in range(1, 19):
            for tx in load(f"{season}-txn-{rnd}.json") or []:
                if tx.get("status") != "complete" or tx.get("type") == "trade":
                    continue
                for rid in tx.get("roster_ids") or []:
                    t = label_by_owner.get(owner_of.get(rid))
                    if t in H:
                        H[t]["roster_moves"] += 1

    rows = []
    for t, g in H.items():
        assets_in = g["picks_in"] + g["players_in"]
        n = g["trades"]
        rows.append({
            "team": t, "is_you": g["is_you"], "trades": n, "seasons": g["seasons"],
            # H1 — does he pay in picks?
            "pick_appetite": round(g["picks_in"] / assets_in, 3) if assets_in else None,
            "pick_appetite_n": assets_in,
            "pick_appetite_ci": wilson(g["picks_in"], assets_in) if assets_in else None,
            "pays_picks": round(g["picks_out"] / (g["picks_out"] + g["players_out"]), 3)
                          if (g["picks_out"] + g["players_out"]) else None,
            "pays_picks_n": g["picks_out"] + g["players_out"],
            "pays_picks_ci": wilson(g["picks_out"], g["picks_out"] + g["players_out"])
                             if (g["picks_out"] + g["players_out"]) else None,
            # H2 — when will he deal?
            "in_season_share": round(g["in_season"] / n, 3) if n else None,
            "in_season_ci": wilson(g["in_season"], n) if n else None,
            # H3 — how big a package?
            "assets_per_trade": round(st.mean(g["assets_per_trade"]), 2) if g["assets_per_trade"] else None,
            "assets_max": max(g["assets_per_trade"], default=0),
            # H4 — how far out will he take a pick?
            "max_years_out": max(g["years_out"], default=None),
            "mean_years_out": round(st.mean(g["years_out"]), 2) if g["years_out"] else None,
            "picks_taken": len(g["years_out"]),
            # H5 — is he even engaged? (the big-sample signal)
            "roster_moves": g["roster_moves"],
            "moves_per_season": round(g["roster_moves"] / g["seasons"], 1) if g["seasons"] else None,
            "faab": g["faab"],
            # H6 — does he collect a position?
            "pos_in": dict(g["pos_in"]), "pos_out": dict(g["pos_out"]),
            "top_pos_in": g["pos_in"].most_common(1)[0] if g["pos_in"] else None,
            "players_seen": sum(g["pos_in"].values()),
        })
    rows.sort(key=lambda r: -r["trades"])

    print("HABIT CANDIDATES — per manager\n")
    print(f"{'manager':26} {'tr':>3} {'takes':>6} {'pays':>6} {'inseas':>7} "
          f"{'pkg':>5} {'yrsout':>7} {'moves/s':>8} {'faab':>5}")
    for r in rows:
        f = lambda v, d=2: "—" if v is None else f"{v:.{d}f}"
        print(f"{r['team'][:26]:26} {r['trades']:>3} {f(r['pick_appetite']):>6} "
              f"{f(r['pays_picks']):>6} {f(r['in_season_share']):>7} "
              f"{f(r['assets_per_trade'],1):>5} {str(r['max_years_out']):>7} "
              f"{str(r['moves_per_season']):>8} {r['faab']:>5}")

    print("\nVERDICTS — does the habit separate ANY pair of managers at 95%?\n")
    verdicts = {}
    for name, key, ci in [
        ("H1a takes picks (what he accepts)", "pick_appetite", "pick_appetite_ci"),
        ("H1b pays in picks (what he sends)", "pays_picks", "pays_picks_ci"),
        ("H2  trades in-season", "in_season_share", "in_season_ci"),
    ]:
        sep, pairs = separates(rows, key, ci)
        vals = [r[key] for r in rows if r[key] is not None]
        verdicts[key] = {
            "habit": name, "separating_pairs": sep, "pairs": pairs,
            "range": [min(vals), max(vals)] if vals else None,
            "usable": sep > 0,
        }
        print(f"  {name:38} {sep:>3}/{pairs} pairs separate   range "
              f"{min(vals) if vals else '—'}–{max(vals) if vals else '—'}   "
              f"{'USABLE' if sep else 'NOT MEASURABLE at this n'}")

    # engagement uses a far bigger sample — report its spread directly
    mv = [r["moves_per_season"] for r in rows if r["moves_per_season"] is not None]
    print(f"\n  H5  roster moves per season          range {min(mv)}–{max(mv)}, "
          f"sd {st.pstdev(mv):.1f} over {sum(r['roster_moves'] for r in rows)} total moves "
          f"— {'USABLE (largest sample here)' if max(mv)/max(min(mv),0.1) > 2 else 'flat'}")

    # position lean: how many players has each manager even been seen acquiring?
    ps = [r["players_seen"] for r in rows]
    print(f"  H6  position lean                    players observed per manager: "
          f"median {st.median(ps):.0f}, max {max(ps)} — "
          f"{'TOO THIN to claim a lean' if st.median(ps) < 10 else 'possible'}")

    yo = [r["max_years_out"] for r in rows if r["max_years_out"] is not None]
    print(f"  H4  furthest-out pick accepted       values {sorted(set(yo))} — "
          f"{'no spread, drop it' if len(set(yo)) < 2 else 'some spread'}")

    ap = [r["assets_per_trade"] for r in rows if r["assets_per_trade"] is not None]
    print(f"  H3  package size                     range {min(ap)}–{max(ap)}, "
          f"sd {st.pstdev(ap):.2f}")

    json.dump({"rows": rows, "verdicts": verdicts}, open(OUT, "w"), indent=1)
    print(f"\nwrote {OUT}")


if __name__ == "__main__":
    main()
