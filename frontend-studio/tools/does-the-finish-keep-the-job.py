#!/usr/bin/env python3
"""The one claim still standing, put under the confounder it obviously has.

finish-predict-followups.py found that players whose role GREW kept a job the next season
23% of the time against 36% for those whose role fell. Before that can be said out loud:
a player whose role grew finishes the year with a bigger role, and big-role players keep
jobs. So the attrition gap may be nothing but role LEVEL wearing a trajectory costume —
which is the same shape as the age confound that killed two earlier threads in this lane
(DAVID.md 2026-07-22, 2026-07-30).

Tested by logistic regression with the level and age held fixed, and by matched pairs.

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/tools/does-the-finish-keep-the-job.py
"""

import sqlite3
import numpy as np
from scipy import optimize, stats

D = "/Users/davidleess/dynasty-genius-product/app/data"
UN = sqlite3.connect(f"file:{D}/nflverse_usage.db?mode=ro", uri=True)
PP = sqlite3.connect(f"file:{D}/playerprofiler.db?mode=ro", uri=True)
MIN_GAMES, TAIL, POS = 10, 6, ("RB", "WR", "TE")

ages = {}
for dg, season, age in PP.execute(
    "select dg_player_id, season, age from pp_player_season where age is not null"
):
    if dg and str(age).strip():
        ages[(dg, str(season))] = float(age)

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
        if len(v) < MIN_GAMES or (p, a) not in ages:
            continue
        first = sum(v[: len(v) // 2]) / len(v[: len(v) // 2])
        rows.append(dict(
            season=sum(v) / len(v), last6=sum(v[-TAIL:]) / TAIL,
            change=sum(v[-TAIL:]) / TAIL - first, age=ages[(p, a)],
            kept=1.0 if len(W[b].get(p, [])) >= MIN_GAMES else 0.0))

y = np.array([r["kept"] for r in rows])
lvl = np.array([r["season"] for r in rows])
chg = np.array([r["change"] for r in rows])
age = np.array([r["age"] for r in rows])
print(f"n = {len(rows)} player-seasons with age on file · kept a job next year: {y.mean():.0%}\n")

print("the confound, stated first")
print(f"  corr(role change, season role level) = {np.corrcoef(chg, lvl)[0,1]:+.3f}")
print(f"  corr(role change, END-of-year level) = {np.corrcoef(chg, [r['last6'] for r in rows])[0,1]:+.3f}"
      "   <- this is the one that could be doing the work")
print(f"  corr(role change, age)               = {np.corrcoef(chg, age)[0,1]:+.3f}\n")


def z(a):
    a = np.asarray(a, float)
    return (a - a.mean()) / a.std(ddof=0)


def logit(y, X, names):
    Xd = np.column_stack([np.ones(len(y))] + [z(c) for c in X])

    def nll(b):
        e = Xd @ b
        return np.sum(np.logaddexp(0, e) - y * e)

    r = optimize.minimize(nll, np.zeros(Xd.shape[1]), method="BFGS")
    p = 1 / (1 + np.exp(-Xd @ r.x))
    cov = np.linalg.pinv(Xd.T @ (Xd * (p * (1 - p))[:, None]))
    se = np.sqrt(np.diag(cov))
    return {n: (r.x[i + 1], r.x[i + 1] / se[i + 1]) for i, n in enumerate(names)}


print("keeps a job next season ~ role LEVEL + role CHANGE + age   (logistic, standardised)")
for k, (b, t) in logit(y, [lvl, chg, age], ["seasonRole", "roleChange", "age"]).items():
    star = "  <- survives" if abs(t) > 2 else "  <- not distinguishable from zero"
    print(f"  {k:11s} beta {b:+.3f}   z {t:+.2f}{star if k=='roleChange' else ''}")

print("\nand with the END-of-year level in as well — the hardest version of the test")
for k, (b, t) in logit(y, [lvl, np.array([r["last6"] for r in rows]), chg, age],
                       ["seasonRole", "last6Level", "roleChange", "age"]).items():
    print(f"  {k:11s} beta {b:+.3f}   z {t:+.2f}")

# Model-free: match on season role AND age, then split on trajectory.
idx = sorted(range(len(rows)), key=lambda i: (lvl[i], age[i]))
pairs = [(idx[i], idx[i + 1]) for i in range(0, len(idx) - 1, 2)]
pairs = [(a_, b_) for a_, b_ in pairs
         if abs(lvl[a_] - lvl[b_]) < 0.5 and abs(age[a_] - age[b_]) <= 1]
hi = [max(p, key=lambda i: chg[i]) for p in pairs]
lo = [min(p, key=lambda i: chg[i]) for p in pairs]
disc = [(h, l) for h, l in zip(hi, lo) if y[h] != y[l]]
w = sum(1 for h, l in disc if y[h] == 1)
print(f"\nmatched pairs — same season role (<0.5 pts/g) and same age (<=1yr), n={len(pairs)}")
print(f"  pairs where exactly one kept a job: {len(disc)}")
print(f"  the RISER is the one who kept it in {w}/{len(disc)} = {w/max(len(disc),1):.0%}")
print(f"  binomial two-sided p = {stats.binomtest(w, len(disc), 0.5).pvalue:.4f}")
print(f"\ndeterminism checksum: {len(rows)}/{len(pairs)}/{len(disc)}/{w}")
