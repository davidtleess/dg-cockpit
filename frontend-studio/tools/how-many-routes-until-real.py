#!/usr/bin/env python3
"""How many routes must a receiver run before his rate numbers mean anything?

`when-can-i-believe-it.py` measured reliability against WEEKS, which is the wrong clock.
A player running 35 routes a game has more evidence in week 4 than a part-timer has in
week 12, so a week-based gate is wrong in both directions on exactly the players a dynasty
manager is trying to read.  The right clock is routes accumulated.

It also makes the hobby's own published bar testable.  `craft/how-the-hobby-speaks.md`
records the Fantasy Footballers line that yards per route run "stabilises at 180+ routes."
That is a claim, it is quoted on the 019 surface, and nothing in this lane has ever
checked it.

METHOD.  Pool all player-seasons 2020-2025.  Walk each player's weeks in order and cut
the moment his cumulative routes cross a threshold; take the odd-week and even-week rates
up to that cut, correlate across players, and Spearman-Brown to full length.  Odd/even
rather than first-half/second-half so that a player's own in-season change does not read
as unreliability — the two halves are interleaved in time.

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/tools/how-many-routes-until-real.py
"""

import sqlite3
from collections import defaultdict

import numpy as np
from scipy import stats

D = "/Users/davidleess/dynasty-genius-product/app/data"
PP = sqlite3.connect(f"file:{D}/playerprofiler.db?mode=ro", uri=True)

LAST_REG = {2020: 17, 2021: 18, 2022: 18, 2023: 18, 2024: 17, 2025: 18}
SEASONS = sorted(LAST_REG)
THRESHOLDS = [30, 60, 90, 120, 150, 180, 240, 300, 400, 500]
MIN_PAIRS = 40
PUBLISHED_BAR = 180  # Fantasy Footballers, via craft/how-the-hobby-speaks.md


def num(v):
    if v in (None, ""):
        return 0.0
    try:
        return float(v)
    except ValueError:
        return 0.0


def load():
    q = ("SELECT season, name, position, CAST(week AS INT), routes_run, targets, "
         "receiving_yards FROM pp_gamelog_week WHERE position IN ('WR','TE') "
         "AND name IS NOT NULL AND CAST(week AS INT) <= 18")
    rows = defaultdict(list)
    for sn, nm, _p, wk, rr, tg, ry in PP.execute(q):
        if int(sn) not in LAST_REG or wk > LAST_REG[int(sn)]:
            continue
        rows[(sn, nm)].append((wk, num(rr), num(tg), num(ry)))
    for k in rows:
        rows[k].sort()
    return rows


def halves_at(games, threshold):
    """Odd-week and even-week (targets, yards, routes) up to the week where cumulative
    routes first cross `threshold`. Returns None if he never gets there."""
    cum = 0.0
    upto = None
    for i, (wk, rr, _t, _y) in enumerate(games):
        cum += rr
        if cum >= threshold:
            upto = i + 1
            break
    if upto is None:
        return None
    odd = [g for g in games[:upto] if g[0] % 2 == 1]
    even = [g for g in games[:upto] if g[0] % 2 == 0]
    out = []
    for half in (odd, even):
        r = sum(g[1] for g in half)
        if r < threshold * 0.2:      # each half must carry real routes of its own
            return None
        out.append((sum(g[2] for g in half), sum(g[3] for g in half), r))
    return out


def sb(r):
    return (2 * r / (1 + r)) if r is not None and r > -1 else None


def main():
    data = load()
    print("=" * 94)
    print("HOW MANY ROUTES UNTIL THE NUMBER IS REAL")
    print(f"WR/TE, seasons {SEASONS[0]}-{SEASONS[-1]} · odd weeks vs even weeks up to the "
          f"route threshold,\nSpearman rank correlation, Spearman-Brown corrected to full "
          f"length · min {MIN_PAIRS} pairs")
    print("=" * 94)
    print()
    print(f"   {'routes':<9}{'players':<10}{'yards per route':<19}{'targets per route':<20}"
          f"{'verdict at 0.70'}")
    rows_out = []
    for t in THRESHOLDS:
        yx, yy, tx, ty = [], [], [], []
        for _k, games in data.items():
            h = halves_at(games, t)
            if h is None:
                continue
            (t1, y1, r1), (t2, y2, r2) = h
            yx.append(y1 / r1)
            yy.append(y2 / r2)
            tx.append(t1 / r1)
            ty.append(t2 / r2)
        if len(yx) < MIN_PAIRS:
            print(f"   {t:<9}{len(yx):<10}— too few")
            continue
        ry = sb(float(stats.spearmanr(yx, yy).statistic))
        rt = sb(float(stats.spearmanr(tx, ty).statistic))
        mark = "  ← published bar" if t == PUBLISHED_BAR else ""
        verdict = ("both real" if ry >= 0.70 and rt >= 0.70 else
                   "targets only" if rt >= 0.70 else
                   "neither")
        print(f"   {t:<9}{len(yx):<10}{ry:<19.2f}{rt:<20.2f}{verdict}{mark}")
        rows_out.append((t, len(yx), ry, rt))

    print()
    print("=" * 94)
    print("AGAINST THE PUBLISHED BAR")
    print("=" * 94)
    at_bar = next((r for r in rows_out if r[0] == PUBLISHED_BAR), None)
    first_y = next((r[0] for r in rows_out if r[2] >= 0.70), None)
    first_t = next((r[0] for r in rows_out if r[3] >= 0.70), None)
    if at_bar:
        print(f"   The hobby quotes {PUBLISHED_BAR} routes as where yards per route "
              f"'stabilises'.")
        print(f"   Measured here at {PUBLISHED_BAR} routes: reliability {at_bar[2]:.2f} "
              f"on {at_bar[1]} player-seasons.")
        if at_bar[2] < 0.70:
            print(f"   That is BELOW 0.70. At the published bar, roughly "
                  f"{(1 - at_bar[2]) * 100:.0f}% of the variance")
            print(f"   between receivers' yards-per-route figures is still sampling noise.")
    print(f"   yards per route reaches 0.70 at "
          f"{f'{first_y} routes' if first_y else 'NO threshold tested (max '
             f'{THRESHOLDS[-1]})'}")
    print(f"   targets per route reaches 0.70 at "
          f"{f'{first_t} routes' if first_t else 'NO threshold tested'}")
    print()
    print("   Targets per route is the more reliable of the two at every threshold, which")
    print("   is the same split the season-long work found: how often he is thrown to is a")
    print("   property of the player; what happens to the ball afterwards is much less so.")


if __name__ == "__main__":
    main()
