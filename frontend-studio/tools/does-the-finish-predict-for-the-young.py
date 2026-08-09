#!/usr/bin/env python3
"""The last defence of the trajectory axis, PRE-SPECIFIED before the numbers were seen.

Three tests have now failed to show that a player's role TRAJECTORY predicts anything:
next-season role (adds R^2 0.003-0.009), and job retention (59% of matched pairs, p=0.22).
All three were run on every RB/WR/TE with 10+ games.

But 017 is not about that population. Its stated premise is a roster where 22 of 27 players
have two years of NFL experience or fewer, and where "the question that decides everything
is whether the player has a job yet". An established player's role wobbling is noise around
a settled job. A second-year player's role climbing may be the job being won. Those are
different processes and the pooled test cannot tell them apart.

So: the same test, split by experience. If the trajectory carries for young players it is a
real finding about the population the surface actually serves. If it does not, the axis is
refuted and that goes to David as it stands.

Pre-specified: experience = season - draft_year, split at <=2 years vs 3+. Two subgroups,
one test each, no other cuts explored.

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/tools/does-the-finish-predict-for-the-young.py
"""

import sqlite3
import numpy as np
from scipy import stats

D = "/Users/davidleess/dynasty-genius-product/app/data"
UN = sqlite3.connect(f"file:{D}/nflverse_usage.db?mode=ro", uri=True)
PP = sqlite3.connect(f"file:{D}/playerprofiler.db?mode=ro", uri=True)
MIN_GAMES, TAIL, POS = 10, 6, ("RB", "WR", "TE")

draft = {}
for dg, dy in PP.execute("select dg_player_id, draft_year from pp_player_season"):
    if dg and str(dy).strip():
        draft[dg] = int(float(dy))

seasons = [s for (s,) in UN.execute("select distinct season from ff_opportunity order by season")]
W = {}
for s in seasons:
    cur = {}
    for dg, v in UN.execute(
        """select dg_player_id, cast(total_fantasy_points_exp as real) from ff_opportunity
           where season=? and position in (?,?,?) and cast(week as int) between 1 and 18
             and dg_player_id!='' order by dg_player_id, cast(week as int)""", (s, *POS)):
        cur.setdefault(dg, []).append(v)
    W[s] = cur

rows = []
for a, b in zip(seasons, seasons[1:]):
    for p, v in W[a].items():
        if len(v) < MIN_GAMES or p not in draft:
            continue
        exp = int(a) - draft[p]
        if exp < 0:
            continue
        first = sum(v[: len(v) // 2]) / len(v[: len(v) // 2])
        last = sum(v[-TAIL:]) / TAIL
        nv = W[b].get(p, [])
        rows.append(dict(exp=exp, season=sum(v) / len(v), last6=last, change=last - first,
                         nxt=(sum(nv) / len(nv)) if len(nv) >= MIN_GAMES else None))


def z(a):
    a = np.asarray(a, float)
    return (a - a.mean()) / a.std(ddof=0)


def ols(y, X, names):
    Xd = np.column_stack([np.ones(len(y))] + [z(c) for c in X])
    yz = z(y)
    beta, *_ = np.linalg.lstsq(Xd, yz, rcond=None)
    r = yz - Xd @ beta
    se = np.sqrt(np.diag((r @ r / (len(y) - Xd.shape[1])) * np.linalg.pinv(Xd.T @ Xd)))
    return ({n: (beta[i + 1], beta[i + 1] / se[i + 1]) for i, n in enumerate(names)},
            1 - (r @ r) / (yz @ yz))


print(f"{len(rows)} player-seasons with a draft year on file\n")
print(f"{'group':<26}{'n':>6}{'seasonAvg r':>13}{'last6 r':>10}{'chg beta':>11}{'t':>7}{'dR2':>8}")
print("-" * 81)

for lbl, sel in [("years 1-2 (the young)", lambda r: r["exp"] <= 2),
                 ("years 3+  (established)", lambda r: r["exp"] >= 3)]:
    g = [r for r in rows if sel(r) and r["nxt"] is not None]
    s = np.array([r["season"] for r in g]); l6 = np.array([r["last6"] for r in g])
    c = np.array([r["change"] for r in g]); n_ = np.array([r["nxt"] for r in g])
    b, r2 = ols(n_, [s, c], ["seasonRole", "roleChange"])
    _, r20 = ols(n_, [s], ["seasonRole"])
    print(f"{lbl:<26}{len(g):>6}{np.corrcoef(s,n_)[0,1]:>13.3f}{np.corrcoef(l6,n_)[0,1]:>10.3f}"
          f"{b['roleChange'][0]:>11.3f}{b['roleChange'][1]:>7.2f}{r2-r20:>8.3f}")

print("-" * 81)
print("last6 r > seasonAvg r would mean the finish is the better forecast for that group\n")

# model-free, matched on season role WITHIN the young group
g = [r for r in rows if r["exp"] <= 2 and r["nxt"] is not None]
s = np.array([r["season"] for r in g]); c = np.array([r["change"] for r in g])
n_ = np.array([r["nxt"] for r in g])
o = np.argsort(s)
pairs = [(o[i], o[i + 1]) for i in range(0, len(o) - 1, 2)]
pairs = [(x, y) for x, y in pairs if abs(s[x] - s[y]) < 0.5]
ag = sum(1 for x, y in pairs if (c[x] - c[y]) * (n_[x] - n_[y]) > 0)
print(f"young players, matched on season role within 0.5 pts/g (n={len(pairs)})")
print(f"  the one who FINISHED higher has the bigger role next year: {ag}/{len(pairs)}"
      f" = {ag/len(pairs):.0%},  p = {stats.binomtest(ag, len(pairs), 0.5).pvalue:.3f}")
print(f"\ndeterminism checksum: {len(rows)}/{len(g)}/{len(pairs)}/{ag}")
