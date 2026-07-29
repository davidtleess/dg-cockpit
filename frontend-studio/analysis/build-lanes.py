#!/usr/bin/env python3
"""Per-manager trade lanes: every trade each manager has made, on one timeline.

Answers David's 2026-07-28 brief directly — "does a manager have a history of
trading a certain way?" — by giving each manager a lane across all four seasons
with one mark per trade, tagged with what HE received.

Also emits the league-level pattern panels and the honest negative result on the
playoff-timing question.

Output: analysis/lanes.json  (merged into league-activity.json)

Studio's own computation, unreviewed. n is small and travels with every figure.
"""

import json
import math
import pathlib
import statistics as st
from collections import Counter, defaultdict
from datetime import date, datetime

HERE = pathlib.Path(__file__).parent
RAW = HERE / "txn-raw"
OUT = HERE / "lanes.json"
SEASONS = [2023, 2024, 2025, 2026]
T0, T1 = date(2023, 7, 1), date(2026, 7, 28)   # the span the league has existed


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


def frac(d):
    return round((d - T0).days / (T1 - T0).days, 5)


def main():
    names = json.loads((HERE / "sleeper-name-map.json").read_text())
    tl = json.loads((HERE / "trade-log.json").read_text())
    trades = tl["trades"]
    YOU = tl["you"]
    tenure = tl["tenure"]

    label_by_owner = {}
    for s in SEASONS:
        for u in load(f"{s}-users.json") or []:
            nm = (u.get("metadata") or {}).get("team_name") or u.get("display_name")
            if nm:
                label_by_owner[u["user_id"]] = nm

    # every manager who currently holds a roster — the population of the board
    current = []
    for r in load("2026-rosters.json") or []:
        current.append({"roster_id": r["roster_id"], "team": label_by_owner.get(r.get("owner_id"))})

    # ---------------- lanes ----------------
    lane = defaultdict(list)
    for t in trades:
        if not t["date"]:
            continue
        d = datetime.strptime(t["date"], "%Y-%m-%d").date()
        for i, s in enumerate(t["sides"]):
            other = t["sides"][1 - i]["team"] if len(t["sides"]) == 2 else None
            got_players = len(s["players"])
            got_picks = len(s["picks"])
            lane[s["team"]].append({
                "id": t["id"], "date": t["date"], "x": frac(d), "season": t["season"],
                "startup": t.get("startup_era", False),
                "got_players": got_players, "got_picks": got_picks,
                # what this manager walked away with — the only framing he'd use
                "took": "picks" if got_picks and not got_players
                        else "players" if got_players and not got_picks
                        else "both" if got_players and got_picks else "nothing",
                "with": other,
                "summary": "; ".join(
                    f"{sd['team']} got " + (", ".join(
                        [p["name"] + " (" + p["pos"] + ")" for p in sd["players"]] +
                        [p["label"] for p in sd["picks"]]) or "nothing recorded")
                    for sd in t["sides"]),
            })

    # ---------------- per-manager profile ----------------
    profiles = []
    for c in current:
        team = c["team"]
        evs = [e for e in lane.get(team, []) if not e["startup"]]
        n = len(evs)
        picks_in = sum(e["got_picks"] for e in evs)
        players_in = sum(e["got_players"] for e in evs)
        # what he gave up = what the counterparty received
        picks_out = players_out = 0
        for t in trades:
            if t.get("startup_era") or len(t["sides"]) != 2:
                continue
            teams = [s["team"] for s in t["sides"]]
            if team in teams:
                other = t["sides"][1 - teams.index(team)]
                picks_out += len(other["picks"])
                players_out += len(other["players"])
        assets_in = picks_in + players_in
        in_season = sum(1 for e in evs
                        if datetime.strptime(e["date"], "%Y-%m-%d").month in (9, 10, 11, 12, 1))
        ten = tenure.get(team, {})
        profiles.append({
            "roster_id": c["roster_id"], "team": team, "is_you": team == YOU,
            # history follows the HUMAN, not the roster slot and not the team name:
            # three managers have left this league and their trades must never
            # attach to whoever inherited their roster.
            "joined": ten.get("first_season"),
            "seasons_in_league": len(ten.get("seasons") or []),
            "former_names": ten.get("former_names") or [],
            "trades": n,
            "trades_per_season": round(n / len(ten["seasons"]), 2)
                                 if ten.get("seasons") else None,
            "picks_in": picks_in, "picks_out": picks_out, "net_picks": picks_in - picks_out,
            "players_in": players_in, "players_out": players_out,
            "pick_appetite": round(picks_in / assets_in, 3) if assets_in else None,
            "in_season": in_season,
            "in_season_share": round(in_season / n, 3) if n else None,
            "last_trade": max((e["date"] for e in evs), default=None),
            "events": sorted(lane.get(team, []), key=lambda e: e["date"]),
        })
    profiles.sort(key=lambda p: (not p["is_you"], -p["trades"]))

    # ---------------- league-level patterns ----------------
    live = [t for t in trades if not t.get("startup_era")]

    pos_traded = Counter()
    for t in live:
        for s in t["sides"]:
            for p in s["players"]:
                pos_traded[p["pos"]] += 1
    n_moved = sum(pos_traded.values())
    rostered = Counter()
    for r in load("2026-rosters.json") or []:
        for pid in r.get("players") or []:
            m = names.get(str(pid))
            if m and m.get("p"):
                rostered[m["p"]] += 1
    n_rost = sum(rostered.values())
    positions = []
    for p in ["QB", "RB", "WR", "TE"]:
        k = pos_traded.get(p, 0)
        share, base = (k / n_moved if n_moved else 0), (rostered.get(p, 0) / n_rost if n_rost else 0)
        ci = wilson(k, n_moved)
        positions.append({
            "pos": p, "n": k, "share": round(share, 3), "ci95": ci,
            "roster_share": round(base, 3),
            # a difference is only claimed when the interval clears the baseline
            "separated": ci[0] > base or ci[1] < base,
        })

    shapes = Counter()
    for t in live:
        if len(t["sides"]) != 2:
            continue
        a, b = t["sides"]
        ap, bp, ak, bk = bool(a["players"]), bool(b["players"]), bool(a["picks"]), bool(b["picks"])
        if ap and bp and not (ak or bk):
            shapes["players for players"] += 1
        elif (ap and bk and not ak) or (bp and ak and not bk):
            shapes["players for picks"] += 1
        elif ak and bk and not (ap or bp):
            shapes["picks for picks"] += 1
        else:
            shapes["a bit of both"] += 1

    rounds, horizon = Counter(), Counter()
    for t in live:
        for s in t["sides"]:
            for p in s["picks"]:
                rounds[p["round"]] += 1
                try:
                    horizon[int(p["season"]) - t["season"]] += 1
                except (TypeError, ValueError):
                    pass

    # ---------------- the honest negative: playoff timing ----------------
    strength = {}
    for season in SEASONS[:-1]:
        playoff = set()
        for m in load(f"{season}-bracket.json") or []:
            for k in ("t1", "t2"):
                if isinstance(m.get(k), int):
                    playoff.add(m[k])
        for r in load(f"{season}-rosters.json") or []:
            strength[(season, r["roster_id"])] = r["roster_id"] in playoff
    rid_of = {}
    for season in SEASONS:
        for r in load(f"{season}-rosters.json") or []:
            rid_of[(season, label_by_owner.get(r.get("owner_id")))] = r["roster_id"]

    grp = {"made the playoffs": Counter(), "missed the playoffs": Counter()}
    tot = Counter()
    for t in live:
        if t["season"] == 2026 or not t["date"]:
            continue
        mo = datetime.strptime(t["date"], "%Y-%m-%d").month
        ph = ("in-season" if mo in (9, 10, 11) else "playoff weeks" if mo in (12, 1)
              else "rookie-draft season" if mo in (4, 5, 6) else "dead offseason")
        for s in t["sides"]:
            made = strength.get((t["season"], rid_of.get((t["season"], s["team"]))))
            if made is None:
                continue
            key = "made the playoffs" if made else "missed the playoffs"
            grp[key][ph] += 1
            tot[key] += 1
    playoff_test = {
        "n_per_group": dict(tot),
        "groups": {k: {p: {"n": v, "share": round(v / tot[k], 3), "ci95": wilson(v, tot[k])}
                       for p, v in grp[k].items()} for k in grp},
        "verdict": None,
    }
    # do ANY of the phase intervals separate between the two groups?
    sep = []
    for ph in set(list(grp["made the playoffs"]) + list(grp["missed the playoffs"])):
        a = wilson(grp["made the playoffs"].get(ph, 0), tot["made the playoffs"])
        b = wilson(grp["missed the playoffs"].get(ph, 0), tot["missed the playoffs"])
        if a[0] > b[1] or b[0] > a[1]:
            sep.append(ph)
    playoff_test["separated_phases"] = sep
    playoff_test["verdict"] = (
        "No phase separates: at this sample size the timing of a playoff team's trades is "
        "indistinguishable from a non-playoff team's. Every 95% interval overlaps."
        if not sep else "separates on: " + ", ".join(sep))

    tr = [p["trades"] for p in profiles]
    out = {
        "you": YOU,
        "tenure": tenure,
        "span": [T0.isoformat(), T1.isoformat()],
        "profiles": profiles,
        "patterns": {
            "positions": positions,
            "n_players_moved": n_moved,
            "shapes": dict(shapes),
            "pick_rounds": dict(sorted(rounds.items())),
            "pick_horizon": dict(sorted(horizon.items())),
            "trade_deadline_setting": (load("2026-league.json") or {}).get("settings", {}).get(
                "trade_deadline"),
        },
        "playoff_timing": playoff_test,
        "limits": {
            "trades_per_manager_median": st.median(tr),
            "trades_per_manager_min": min(tr),
            "trades_per_manager_max": max(tr),
            "dispersion": {
                k: {"min": min(v), "max": max(v), "sd": round(st.pstdev(v), 3)}
                for k, v in {
                    "pick_appetite": [p["pick_appetite"] for p in profiles
                                      if p["pick_appetite"] is not None],
                    "in_season_share": [p["in_season_share"] for p in profiles
                                        if p["in_season_share"] is not None],
                    "net_picks": [p["net_picks"] for p in profiles],
                }.items()
            },
        },
    }
    OUT.write_text(json.dumps(out, indent=1))
    print(f"wrote {OUT}")
    print(f"  profiles: {len(profiles)}  median trades/manager: {st.median(tr)}")
    print(f"  positions separated from roster share: "
          f"{[p['pos'] for p in positions if p['separated']]}")
    print(f"  shapes: {dict(shapes)}")
    print(f"  playoff verdict: {playoff_test['verdict']}")
    for p in profiles[:4]:
        print(f"  {p['team'][:24]:24} n={p['trades']:2} net{p['net_picks']:+3} "
              f"pick%={p['pick_appetite']} inseas={p['in_season_share']} evs={len(p['events'])}")


if __name__ == "__main__":
    main()
