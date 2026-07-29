#!/usr/bin/env python3
"""MEASUREMENT PASS — before drawing anything.

David, 2026-07-28: "the data could be used to spot manager trends - are there
patterns we can vizualize? do teams in the playoffs trade a lot at a certain
time? what do they normally give up? does a manager have a history of trading a
certain way? are their positions that get traded the most?"

The standing rule (DAVID.md 2026-07-21) is to measure where the variance lives
BEFORE choosing an axis, and to report a flat dimension in one honest sentence
rather than plotting it repeatedly. This script scores every candidate axis and
says which ones carry signal at this sample size.

Studio's own computation, unreviewed. n is small and is printed everywhere.
"""

import json
import math
import pathlib
import statistics as st
from collections import Counter, defaultdict
from datetime import datetime, timezone

HERE = pathlib.Path(__file__).parent
RAW = HERE / "txn-raw"
OUT = HERE / "trade-patterns.json"
SEASONS = [2023, 2024, 2025, 2026]


def load(n):
    p = RAW / n
    return json.loads(p.read_text()) if p.exists() else None


def wilson(k, n, z=1.96):
    if n == 0:
        return [0.0, 0.0]
    p = k / n
    d = 1 + z * z / n
    c = p + z * z / (2 * n)
    r = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return [round((c - r) / d, 3), round((c + r) / d, 3)]


def gini(xs):
    """Concentration of a nonneg vector, 0 = perfectly even, 1 = all in one."""
    xs = sorted(x for x in xs if x >= 0)
    n = len(xs)
    s = sum(xs)
    if n == 0 or s == 0:
        return 0.0
    cum = sum((i + 1) * x for i, x in enumerate(xs))
    return round((2 * cum) / (n * s) - (n + 1) / n, 3)


def main():
    names = json.loads((HERE / "sleeper-name-map.json").read_text())
    tl = json.loads((HERE / "trade-log.json").read_text())
    trades = tl["trades"]
    YOU = tl["you"]

    label_by_owner = {}
    for season in SEASONS:
        for u in load(f"{season}-users.json") or []:
            nm = (u.get("metadata") or {}).get("team_name") or u.get("display_name")
            if nm:
                label_by_owner[u["user_id"]] = nm

    report = {"n_trades": len(trades), "n_trade_sides": sum(len(t["sides"]) for t in trades)}
    print(f"POPULATION: {len(trades)} trades, {report['n_trade_sides']} trade-sides, "
          f"4 seasons, 12 managers\n")

    # ================= A. positions traded =================
    pos_traded = Counter()
    for t in trades:
        for s in t["sides"]:
            for p in s["players"]:
                pos_traded[p["pos"]] += 1
    n_players_moved = sum(pos_traded.values())

    # baseline: position mix of currently rostered players in this league
    rostered = Counter()
    for r in load("2026-rosters.json") or []:
        for pid in r.get("players") or []:
            meta = names.get(str(pid))
            if meta and meta.get("p"):
                rostered[meta["p"]] += 1
    n_rostered = sum(rostered.values())

    POS = ["QB", "RB", "WR", "TE"]
    a_rows = []
    for p in POS:
        share = pos_traded.get(p, 0) / n_players_moved if n_players_moved else 0
        base = rostered.get(p, 0) / n_rostered if n_rostered else 0
        a_rows.append({
            "pos": p, "traded": pos_traded.get(p, 0), "traded_share": round(share, 3),
            "traded_ci95": wilson(pos_traded.get(p, 0), n_players_moved),
            "rostered_share": round(base, 3),
            "lift": round(share / base, 2) if base else None,
        })
    report["A_positions"] = {"n_players_moved": n_players_moved, "rows": a_rows,
                            "other_positions": {k: v for k, v in pos_traded.items() if k not in POS}}
    print("A. POSITIONS TRADED  (vs their share of currently-rostered players)")
    print(f"   {'pos':4} {'traded':>7} {'share':>7} {'95% CI':>16} {'rostered':>9} {'lift':>6}")
    for r in a_rows:
        ci = f"[{r['traded_ci95'][0]:.2f},{r['traded_ci95'][1]:.2f}]"
        print(f"   {r['pos']:4} {r['traded']:>7} {r['traded_share']:>7.3f} {ci:>16} "
              f"{r['rostered_share']:>9.3f} {str(r['lift']):>6}")
    lifts = [r["lift"] for r in a_rows if r["lift"]]
    print(f"   -> spread of lift across positions: {min(lifts):.2f}–{max(lifts):.2f}\n")

    # ================= B. team strength vs trade timing =================
    # winners_bracket gives the playoff field; roster settings give the record
    strength = {}   # (season, roster_id) -> dict
    for season in SEASONS[:-1]:      # 2026 has not been played
        bracket = load(f"{season}-bracket.json") or []
        playoff_rids = set()
        for m in bracket:
            for k in ("t1", "t2"):
                if isinstance(m.get(k), int):
                    playoff_rids.add(m[k])
        rosters = load(f"{season}-rosters.json") or []
        recs = []
        for r in rosters:
            s = r.get("settings") or {}
            recs.append((r["roster_id"], s.get("wins", 0), s.get("losses", 0), s.get("fpts", 0)))
        for rid, w, l, f in recs:
            strength[(season, rid)] = {
                "wins": w, "losses": l, "pct": round(w / (w + l), 3) if (w + l) else None,
                "fpts": f, "playoffs": rid in playoff_rids,
            }

    # trade timing by strength, using the SEASON PHASE not the calendar month
    # (playoff_week_start 15; this league's trade_deadline setting is 99 = none)
    def phase(date_str, season):
        d = datetime.strptime(date_str, "%Y-%m-%d").date()
        # NFL regular season ~Sep 5 -> late Dec; playoffs from league week 15 (~mid Dec)
        if d.month in (9, 10, 11) or (d.month == 12 and d.day < 12):
            return "in-season"
        if d.month == 12 or d.month == 1:
            return "playoffs"
        if d.month in (4, 5, 6):
            return "draft-season"
        return "dead-offseason"

    b_counts = {"playoffs_team": Counter(), "missed_team": Counter()}
    b_n = {"playoffs_team": 0, "missed_team": 0}
    rid_of = {}
    for season in SEASONS:
        for r in load(f"{season}-rosters.json") or []:
            rid_of[(season, label_by_owner.get(r.get("owner_id")))] = r["roster_id"]

    for t in trades:
        if t["season"] == 2026 or not t["date"]:
            continue
        ph = phase(t["date"], t["season"])
        for s in t["sides"]:
            rid = rid_of.get((t["season"], s["team"]))
            info = strength.get((t["season"], rid))
            if not info:
                continue
            key = "playoffs_team" if info["playoffs"] else "missed_team"
            b_counts[key][ph] += 1
            b_n[key] += 1

    report["B_phase_by_strength"] = {
        k: {"n": b_n[k], "by_phase": dict(b_counts[k]),
            "shares": {p: round(v / b_n[k], 3) for p, v in b_counts[k].items()} if b_n[k] else {}}
        for k in b_counts
    }
    print("B. WHEN THEY TRADE, BY WHETHER THAT TEAM MADE THE PLAYOFFS THAT SEASON")
    phases = ["dead-offseason", "draft-season", "in-season", "playoffs"]
    print(f"   {'group':16} {'n':>4} " + " ".join(f"{p:>16}" for p in phases))
    for k in ("playoffs_team", "missed_team"):
        n = b_n[k]
        cells = " ".join(
            f"{b_counts[k].get(p,0):>4} ({b_counts[k].get(p,0)/n*100 if n else 0:>4.0f}%)"
            for p in phases)
        print(f"   {k:16} {n:>4} {cells}")
    print()

    # ================= C. manager signatures =================
    sig = defaultdict(lambda: {
        "trades": 0, "players_in": 0, "players_out": 0, "picks_in": 0, "picks_out": 0,
        "in_season": 0, "offseason": 0, "partners": Counter(), "pos_in": Counter(),
        "pos_out": Counter(), "seasons": set(),
    })
    for t in trades:
        if t.get("startup_era"):
            continue                      # the one-off startup swap is not behaviour
        teams = [s["team"] for s in t["sides"]]
        for s in t["sides"]:
            g = sig[s["team"]]
            g["trades"] += 1
            g["seasons"].add(t["season"])
            g["players_in"] += len(s["players"])
            g["picks_in"] += len(s["picks"])
            for p in s["players"]:
                g["pos_in"][p["pos"]] += 1
            for other in teams:
                if other != s["team"]:
                    g["partners"][other] += 1
            ph = phase(t["date"], t["season"]) if t["date"] else "dead-offseason"
            if ph in ("in-season", "playoffs"):
                g["in_season"] += 1
            else:
                g["offseason"] += 1
        # what each side GAVE UP is what the other side received
        if len(t["sides"]) == 2:
            a, b = t["sides"]
            sig[a["team"]]["players_out"] += len(b["players"])
            sig[a["team"]]["picks_out"] += len(b["picks"])
            sig[b["team"]]["players_out"] += len(a["players"])
            sig[b["team"]]["picks_out"] += len(a["picks"])
            for p in b["players"]:
                sig[a["team"]]["pos_out"][p["pos"]] += 1
            for p in a["players"]:
                sig[b["team"]]["pos_out"][p["pos"]] += 1

    c_rows = []
    for team, g in sig.items():
        tot_assets_in = g["players_in"] + g["picks_in"]
        c_rows.append({
            "team": team, "trades": g["trades"], "seasons": len(g["seasons"]),
            "net_picks": g["picks_in"] - g["picks_out"],
            "pick_appetite": round(g["picks_in"] / tot_assets_in, 3) if tot_assets_in else None,
            "in_season_share": round(g["in_season"] / g["trades"], 3) if g["trades"] else None,
            "distinct_partners": len(g["partners"]),
            "partner_concentration": gini(list(g["partners"].values())),
            "top_partner": g["partners"].most_common(1)[0] if g["partners"] else None,
            "pos_in": dict(g["pos_in"]), "pos_out": dict(g["pos_out"]),
        })
    c_rows.sort(key=lambda r: -r["trades"])
    report["C_manager_signatures"] = c_rows

    print("C. MANAGER SIGNATURES  (startup swap excluded)")
    print(f"   {'manager':26} {'trades':>6} {'seas':>4} {'netpk':>6} {'pick%':>6} "
          f"{'inseas%':>8} {'partners':>9} {'conc':>6}")
    for r in c_rows:
        print(f"   {r['team'][:26]:26} {r['trades']:>6} {r['seasons']:>4} {r['net_picks']:>+6} "
              f"{(r['pick_appetite'] or 0):>6.2f} {(r['in_season_share'] or 0):>8.2f} "
              f"{r['distinct_partners']:>9} {r['partner_concentration']:>6.2f}")

    # DISPERSION: is there real between-manager variance, or is everyone the same?
    def disp(key):
        vals = [r[key] for r in c_rows if r[key] is not None]
        if len(vals) < 3:
            return None
        m = st.mean(vals)
        return {"n": len(vals), "min": round(min(vals), 3), "max": round(max(vals), 3),
                "mean": round(m, 3), "sd": round(st.pstdev(vals), 3),
                "cv": round(st.pstdev(vals) / m, 3) if m else None}

    report["C_dispersion"] = {k: disp(k) for k in
                              ("trades", "net_picks", "pick_appetite", "in_season_share",
                               "distinct_partners", "partner_concentration")}
    print("\n   dispersion across the 12 managers (does the axis actually vary?):")
    for k, v in report["C_dispersion"].items():
        if v:
            print(f"     {k:24} min {v['min']:>7} max {v['max']:>7} mean {v['mean']:>7} "
                  f"sd {v['sd']:>6} cv {v['cv']}")

    # how many trades does the median manager have? — the honest limit on "history"
    tr = [r["trades"] for r in c_rows]
    print(f"\n   trades per manager: median {st.median(tr):.1f}, min {min(tr)}, max {max(tr)} "
          f"— any 'this manager always...' claim rests on this many observations.")

    # ================= D. what gets given up: picks vs players =================
    pick_rounds = Counter()
    pick_horizon = Counter()
    for t in trades:
        if t.get("startup_era"):
            continue
        for s in t["sides"]:
            for p in s["picks"]:
                pick_rounds[p["round"]] += 1
                try:
                    pick_horizon[int(p["season"]) - t["season"]] += 1
                except (TypeError, ValueError):
                    pass
    report["D_picks"] = {"by_round": dict(pick_rounds), "by_years_out": dict(pick_horizon)}
    print(f"\nD. PICKS THAT MOVE (startup excluded): by round {dict(sorted(pick_rounds.items()))}")
    print(f"   by years into the future {dict(sorted(pick_horizon.items()))}")

    # asset mix per trade: players-for-picks vs players-for-players
    kinds = Counter()
    for t in trades:
        if t.get("startup_era") or len(t["sides"]) != 2:
            continue
        a, b = t["sides"]
        ap, bp = bool(a["players"]), bool(b["players"])
        ak, bk = bool(a["picks"]), bool(b["picks"])
        if ap and bp and not (ak or bk):
            kinds["players for players"] += 1
        elif (ap and bk and not ak) or (bp and ak and not bk):
            kinds["players for picks"] += 1
        elif ak and bk and not (ap or bp):
            kinds["picks for picks"] += 1
        else:
            kinds["mixed"] += 1
    report["D_trade_kinds"] = dict(kinds)
    print(f"   trade shapes: {dict(kinds)}")

    # ================= E. is season-phase a better axis than calendar month? =================
    ph_counts = Counter()
    for t in trades:
        if t["date"] and not t.get("startup_era"):
            ph_counts[phase(t["date"], t["season"])] += 1
    report["E_phase"] = dict(ph_counts)
    n_ph = sum(ph_counts.values())
    print(f"\nE. SEASON PHASE (n={n_ph}): " +
          ", ".join(f"{k} {v} ({v/n_ph*100:.0f}%)" for k, v in ph_counts.most_common()))
    print(f"   league trade_deadline setting = "
          f"{(load('2026-league.json') or {}).get('settings', {}).get('trade_deadline')} "
          f"(99 = no deadline), playoff_week_start = "
          f"{(load('2026-league.json') or {}).get('settings', {}).get('playoff_week_start')}")

    OUT.write_text(json.dumps(report, indent=1, default=str))
    print(f"\nwrote {OUT}")


if __name__ == "__main__":
    main()
