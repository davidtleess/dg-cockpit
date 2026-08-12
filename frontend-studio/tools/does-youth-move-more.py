#!/usr/bin/env python3
"""Whose week-3 role reading lies the most — and is it his?

Two numbers are now on the table and they disagree in tone.  The population says a
week-3 role reading predicts weeks 13+ at rho ~0.70.  The replay of David's own 2025
roster says 12 of his 22 players with tape moved materially between week 3 and the late
season, five of them from no role at all to a full-time one.

Before that difference is put in front of anyone it has to be explained rather than
narrated.  The obvious candidate is the one this record says to check by name first
(DAVID.md, 2026-07-30: "before certifying any comparison as independent, walk this file's
recorded confounders by name — age first"): his roster is young, and a young player's
role is the one that has not been decided yet.

So: split the population by years of experience and measure the same thing in each bucket.
If experience carries it, the population's rho ~0.70 is an average over veterans whose
roles are settled and rookies whose roles are not, and quoting the average at HIS roster
would be the error.

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/tools/does-youth-move-more.py
"""

import glob
import json
import sqlite3
from collections import defaultdict

import numpy as np
from scipy import stats

D = "/Users/davidleess/dynasty-genius-product/app/data"
PP = sqlite3.connect(f"file:{D}/playerprofiler.db?mode=ro", uri=True)
UN = sqlite3.connect(f"file:{D}/nflverse_usage.db?mode=ro", uri=True)
MC = sqlite3.connect(f"file:{D}/model_forward_capture.db?mode=ro", uri=True)

LAST_REG = {2020: 17, 2021: 18, 2022: 18, 2023: 18, 2024: 17, 2025: 18}
SEASONS = sorted(LAST_REG)
CUT = 3
FIXED_FROM = 13
MIN_LATE = 4
ROLE_BAR = {"WR": 15.0, "TE": 15.0, "RB": 8.0}   # routes a game / touches a game


def num(v):
    if v in (None, ""):
        return None
    try:
        return float(v)
    except ValueError:
        return None


def experience_map():
    """Years of NFL experience by (player name, season), from nflverse rosters.

    pp_gamelog_week carries no experience field, so this comes from the snap-count table's
    seasons: a player's first season observed in 2016-2025 is treated as his rookie year
    when it is not 2016 (the left edge of the data, where experience is uncensorable).
    That is an approximation and it is stated; players first seen in 2016 are DROPPED
    rather than scored as rookies."""
    first = {}
    for name, season in UN.execute(
            "select distinct player, CAST(season AS INT) from player_snap_count "
            "where player is not null and player <> ''"):
        if name not in first or season < first[name]:
            first[name] = season
    return {k: v for k, v in first.items() if v > 2016}


def load(season):
    q = ("SELECT name, position, CAST(week AS INT), routes_run, total_touches "
         "FROM pp_gamelog_week WHERE season=? AND CAST(week AS INT)<=? "
         "AND position IN ('RB','WR','TE') AND name IS NOT NULL")
    rows, pos = defaultdict(list), {}
    for nm, p, wk, rr, tt in PP.execute(q, (str(season), LAST_REG[season])):
        rows[nm].append((wk, num(rr) or 0.0, num(tt) or 0.0))
        pos[nm] = p
    return rows, pos


def role(games, position):
    if not games:
        return 0.0
    idx = 2 if position == "RB" else 1
    return sum(g[idx] for g in games) / len(games)


BUCKETS = [("rookie", 0, 0), ("2nd-3rd yr", 1, 2), ("4th-7th yr", 3, 6), ("8th yr +", 7, 40)]


def main():
    firstseen = experience_map()
    print("=" * 96)
    print("DOES A YOUNG PLAYER'S ROLE MOVE MORE?")
    print(f"week-{CUT} role vs weeks {FIXED_FROM}+ role, by years of NFL experience")
    print(f"seasons {SEASONS[0]}-{SEASONS[-1]} · players above a real week-{CUT} role bar "
          f"(WR/TE {ROLE_BAR['WR']:g} routes a game, RB {ROLE_BAR['RB']:g} touches a game)")
    print("=" * 96)

    pooled = {b[0]: {"x": [], "y": [], "gone": 0, "n": 0, "ratio": []} for b in BUCKETS}
    for sn in SEASONS:
        rows, pos = load(sn)
        for nm, games in rows.items():
            p = pos[nm]
            fs = firstseen.get(nm)
            if fs is None or fs > sn:
                continue
            exp = sn - fs
            bucket = next((b[0] for b in BUCKETS if b[1] <= exp <= b[2]), None)
            if bucket is None:
                continue
            early = [g for g in games if g[0] <= CUT]
            late = [g for g in games if g[0] >= FIXED_FROM]
            e = role(early, p)
            if e < ROLE_BAR[p]:
                continue
            d = pooled[bucket]
            d["n"] += 1
            if len(late) < MIN_LATE:
                d["gone"] += 1
                d["x"].append(e)
                d["y"].append(0.0)
                d["ratio"].append(0.0)
                continue
            l = role(late, p)
            d["x"].append(e)
            d["y"].append(l)
            d["ratio"].append(l / e if e else 0.0)

    print()
    print(f"   {'experience':<14}{'n':<7}{'gone by wk13':<16}{'rho wk3→late':<15}"
          f"{'median late/early':<20}{'moved >40%':<12}")
    results = {}
    for label, _lo, _hi in BUCKETS:
        d = pooled[label]
        if d["n"] < 30:
            print(f"   {label:<14}{d['n']:<7}— too few to report")
            continue
        r = stats.spearmanr(d["x"], d["y"]).statistic
        med = float(np.median(d["ratio"]))
        moved = sum(1 for x in d["ratio"] if x < 0.6 or x > 1.4) / len(d["ratio"])
        results[label] = (d["n"], d["gone"] / d["n"], r, med, moved)
        print(f"   {label:<14}{d['n']:<7}{d['gone']} ({d['gone'] / d['n']:.0%}){'':<9}"
              f"{r:<15.2f}{med:<20.2f}{moved:<12.0%}")

    print()
    print("=" * 96)
    print("VERDICT")
    print("=" * 96)
    if "rookie" in results and "8th yr +" in results:
        rk, vt = results["rookie"], results["8th yr +"]
        print(f"   rookies:   rho {rk[2]:.2f} · {rk[4]:.0%} moved more than 40% · "
              f"{rk[1]:.0%} gone by week 13")
        print(f"   veterans:  rho {vt[2]:.2f} · {vt[4]:.0%} moved more than 40% · "
              f"{vt[1]:.0%} gone by week 13")
        gap = vt[2] - rk[2]
        print()
        if gap >= 0.10:
            print(f"   EXPERIENCE CARRIES IT — a veteran's week-{CUT} role predicts his late "
                  f"season {gap:.2f} better\n   than a rookie's. The population average is an "
                  f"average over two different populations,\n   and quoting it at a young "
                  f"roster understates how much that roster will move.")
        elif gap <= -0.10:
            print(f"   THE OPPOSITE — rookies' roles are MORE stable, by {-gap:.2f}. The "
                  f"youth explanation is refuted;\n   do not use it.")
        else:
            print(f"   NO — experience does not carry it (gap {gap:+.2f}). The young-roster "
                  f"explanation for why\n   12 of his 22 moved is REFUTED and must not be "
                  f"used. Look elsewhere, or report the\n   movement without a cause.")

    # ── his roster's own experience mix, so the comparison is against something real ──
    snap = json.load(open(sorted(glob.glob(f"{D}/league_snapshots/*.json"))[-1]))
    me = [r for r in snap["rosters"]
          if str(r["roster_id"]) == str(snap["david_roster_id"])][0]
    mine = {str(x) for x in me["players"]}
    bio = {str(m["sleeper_player_id"]): m["player"] for m in snap["players"]}
    exps = [bio[s].get("years_exp") for s in mine if s in bio
            and bio[s].get("years_exp") is not None]
    if exps:
        counts = {label: sum(1 for e in exps if lo <= e <= hi)
                  for label, lo, hi in BUCKETS}
        print()
        print(f"   HIS ROSTER ({len(exps)} players with an experience field): "
              + " · ".join(f"{k} {v}" for k, v in counts.items()))
        print(f"   median experience {int(np.median(exps))} years")


if __name__ == "__main__":
    main()
