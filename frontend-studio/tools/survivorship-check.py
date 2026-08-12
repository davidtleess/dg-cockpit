#!/usr/bin/env python3
"""Does survivorship carry the "role is knowable by week 3" finding?

`when-can-i-believe-it.py` requires 4+ games in the late window for a player to enter the
correlation.  Every player who lost his role, got hurt, or was cut between week 3 and
week 13 is therefore EXCLUDED — and he is exactly the case where a week-3 role reading
turns out to have been wrong.  If the finding only holds among players who kept playing,
it is close to circular.

Two measurements:

  1. HOW BIG IS THE HOLE.  Of players carrying a real role in weeks 1-3, what share are
     missing from weeks 13+?

  2. DOES THE FINDING SURVIVE FILLING IT.  For the VOLUME metrics — routes a game, snap
     share, touches a game — zero is a meaningful late value: a player who is not on the
     field ran zero routes.  So the dropped players can be readmitted at 0 rather than
     excluded, and the correlation recomputed.  This cannot be done for rate metrics
     (yards per route run is undefined on zero routes), which is stated rather than
     papered over.

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/tools/survivorship-check.py
"""

import sqlite3
from collections import defaultdict

import numpy as np
from scipy import stats

PP = sqlite3.connect(
    "file:/Users/davidleess/dynasty-genius-product/app/data/playerprofiler.db?mode=ro",
    uri=True,
)

LAST_REG = {2020: 17, 2021: 18, 2022: 18, 2023: 18, 2024: 17, 2025: 18}
SEASONS = sorted(LAST_REG)
FIXED_FROM = 13
MIN_LATE = 4
CUTS = [2, 3, 4, 6, 8]


def num(v):
    if v in (None, ""):
        return None
    try:
        return float(v)
    except ValueError:
        return None


def load(season):
    q = ("SELECT dg_player_id, position, CAST(week AS INT), routes_run, snap_share, "
         "snaps, total_touches FROM pp_gamelog_week WHERE season=? AND CAST(week AS INT)<=? "
         "AND position IN ('RB','WR','TE') AND dg_player_id IS NOT NULL AND dg_player_id<>''")
    rows, pos = defaultdict(list), {}
    for pid, p, wk, rr, ss, sn, tt in PP.execute(q, (str(season), LAST_REG[season])):
        rows[pid].append({"wk": wk, "routes_run": num(rr) or 0.0,
                          "snap_share": num(ss) or 0.0, "snaps": num(sn) or 0.0,
                          "total_touches": num(tt) or 0.0})
        pos[pid] = p
    return rows, pos


VOLUME = [
    ("routes a game", ("WR", "TE"),
     lambda w: sum(g["routes_run"] for g in w) / max(len(w), 1)),
    ("snap share", ("WR", "TE"),
     lambda w: (sum(g["snap_share"] * g["snaps"] for g in w) / sum(g["snaps"] for g in w))
     if sum(g["snaps"] for g in w) > 0 else 0.0),
    ("touches a game", ("RB",),
     lambda w: sum(g["total_touches"] for g in w) / max(len(w), 1)),
]

# "A real role in the early window" — set before any result was read, from the published
# bars in craft/how-the-hobby-speaks.md rather than from this data.
ROLE_BAR = {"routes a game": 15.0, "snap share": 40.0, "touches a game": 8.0}


def main():
    data = {sn: load(sn) for sn in SEASONS}
    print("=" * 92)
    print("SURVIVORSHIP CHECK — does the role finding hold once the disappeared are counted?")
    print(f"seasons {SEASONS[0]}-{SEASONS[-1]} · a player is 'gone' if he has fewer than "
          f"{MIN_LATE} games from week {FIXED_FROM}")
    print("=" * 92)

    for label, positions, fn in VOLUME:
        bar = ROLE_BAR[label]
        print()
        print(f"── {label}  [{'/'.join(positions)}]   role bar: {bar:g}")
        print(f"   {'cut':<6}{'qualified':<11}{'gone by wk13':<15}{'rho excluding':<16}"
              f"{'rho counting':<15}{'shift':<8}")
        print(f"   {'':<6}{'early':<11}{'':<15}{'the gone':<16}{'them at 0':<15}")
        for n in CUTS:
            per_season = []
            for sn in SEASONS:
                rows, pos = data[sn]
                excl_x, excl_y, all_x, all_y = [], [], [], []
                qual = gone = 0
                for pid, games in rows.items():
                    if pos[pid] not in positions:
                        continue
                    early = [g for g in games if g["wk"] <= n]
                    late = [g for g in games if g["wk"] >= FIXED_FROM]
                    if not early:
                        continue
                    ev = fn(early)
                    if ev < bar:
                        continue
                    qual += 1
                    if len(late) >= MIN_LATE:
                        lv = fn(late)
                        excl_x.append(ev)
                        excl_y.append(lv)
                        all_x.append(ev)
                        all_y.append(lv)
                    else:
                        gone += 1
                        # He was not on the field. That is a real zero, not a missing value.
                        all_x.append(ev)
                        all_y.append(fn(late) * len(late) / MIN_LATE if late else 0.0)
                if len(excl_x) < 25 or len(set(excl_y)) < 3:
                    continue
                per_season.append((
                    qual, gone,
                    stats.spearmanr(excl_x, excl_y).statistic,
                    stats.spearmanr(all_x, all_y).statistic,
                ))
            if not per_season:
                print(f"   wk{n:<4}{'— too few':<11}")
                continue
            q = int(np.median([p[0] for p in per_season]))
            g = int(np.median([p[1] for p in per_season]))
            re = float(np.median([p[2] for p in per_season]))
            ra = float(np.median([p[3] for p in per_season]))
            print(f"   wk{n:<4}{q:<11}{g} ({g / q:.0%}){'':<8}{re:<16.2f}{ra:<15.2f}"
                  f"{ra - re:+.2f}")

    print()
    print("=" * 92)
    print("HOW TO READ IT")
    print("=" * 92)
    print("   'rho counting them at 0' is the honest number: it asks whether a week-3 role")
    print("   reading predicts the late season across everyone who HAD a role in week 3,")
    print("   including the ones who no longer had one. If it collapses, the finding was")
    print("   an artefact of only measuring players who kept playing.")
    print()
    print("   NOT TESTABLE THIS WAY: yards per route run, targets per route run, yards per")
    print("   target. A rate is undefined on zero routes, so the disappeared cannot be")
    print("   readmitted at 0. Those metrics' readings remain conditional on surviving —")
    print("   which makes them, if anything, MORE flattering than the truth, and they")
    print("   already fail their bar.")


if __name__ == "__main__":
    main()
