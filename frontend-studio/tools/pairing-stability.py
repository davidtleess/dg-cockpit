#!/usr/bin/env python3
"""Two of Studio's own instruments disagreed, so neither gets quoted until this runs.

the-premium-that-does-not-repeat.py matched players on position + role + age and reported
the more efficient player was the more expensive one in 5/20 pairs (25%).
does-market-pay-for-role.py matched on position + role only and reported 26/40 (65%).
Same data, same season, opposite directions.

Both used the same lazy device: sort the population, take ADJACENT pairs. That makes the
answer depend on the sort key and on which arbitrary partner each player was handed. This
script replaces it with 2,000 random valid pairings and reports the distribution. If the
distribution straddles 50%, the matched-pair test is uninformative at this sample size and
must be dropped from the argument rather than reported in whichever direction is convenient.

The regression coefficient is bootstrapped in the same run, because that is the number the
argument would then have to rest on.

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/tools/pairing-stability.py
"""

import sqlite3
import numpy as np

D = "/Users/davidleess/dynasty-genius-product/app/data"
RO = lambda p: sqlite3.connect(f"file:{D}/{p}?mode=ro", uri=True)
UN, FC, MC, PP = RO("nflverse_usage.db"), RO("fc_forward_capture.db"), \
    RO("model_forward_capture.db"), RO("playerprofiler.db")
SEASON, MIN_GAMES, POS, SEED = "2025", 10, ("RB", "WR", "TE"), 20260808

fd = FC.execute("select max(snapshot_date) from fc_forward_capture_joinable").fetchone()[0]
md = MC.execute("select max(capture_date) from model_forward_capture_joinable").fetchone()[0]
bridge = {dg: str(s) for dg, s in MC.execute(
    "select dg_player_id,sleeper_id from model_forward_capture_joinable where capture_date=?",
    (md,)) if dg and s}
market = {str(s): float(v) for s, v in FC.execute(
    "select sleeper_id,value from fc_forward_capture_joinable where snapshot_date=?", (fd,)) if s and v}
ages = {dg: float(a) for dg, a in PP.execute(
    "select dg_player_id,age from pp_player_season where season=?", (SEASON,))
    if dg and str(a).strip()}

R = []
for dg, pos, name, role, prod in UN.execute(
    """select dg_player_id, position, full_name,
              sum(cast(total_fantasy_points_exp as real))/count(*),
              sum(cast(total_fantasy_points as real))/count(*)
       from ff_opportunity where season=? and position in (?,?,?)
         and cast(week as int) between 1 and 18 and dg_player_id!=''
       group by dg_player_id having count(*)>=?""", (SEASON, *POS, MIN_GAMES)):
    sid = bridge.get(dg)
    if sid in market and dg in ages:
        R.append((name, pos, role, prod - role, np.log(market[sid]), ages[dg]))

pos = np.array([r[1] for r in R]); role = np.array([r[2] for r in R])
fpoe = np.array([r[3] for r in R]); val = np.array([r[4] for r in R])
age = np.array([r[5] for r in R])
n = len(R)
print(f"n = {n}\n")

rng = np.random.default_rng(SEED)


def pairing_run(role_tol, age_tol, trials=2000):
    """Random maximal matching under the tolerance, repeated. Returns the share of trials'
    agreement rates, so the spread of the ARBITRARY CHOICE is visible."""
    ok = [(i, j) for i in range(n) for j in range(i + 1, n)
          if pos[i] == pos[j] and abs(role[i] - role[j]) < role_tol
          and (age_tol is None or abs(age[i] - age[j]) <= age_tol)]
    rates, sizes = [], []
    for _ in range(trials):
        order = rng.permutation(len(ok))
        used, chosen = set(), []
        for k in order:
            i, j = ok[k]
            if i not in used and j not in used:
                used |= {i, j}
                chosen.append((i, j))
        if len(chosen) < 5:
            continue
        w = sum(1 for i, j in chosen if (fpoe[i] - fpoe[j]) * (val[i] - val[j]) > 0)
        rates.append(w / len(chosen)); sizes.append(len(chosen))
    return np.array(rates), np.mean(sizes), len(ok)


for lbl, rt, at in [("role<0.5, any age", 0.5, None),
                    ("role<0.5, age<=1", 0.5, 1),
                    ("role<1.0, age<=2", 1.0, 2)]:
    rates, msz, npair = pairing_run(rt, at)
    lo, hi = np.percentile(rates, [2.5, 97.5])
    print(f"{lbl:<20} eligible pairs {npair:>5} · mean matching size {msz:5.1f}")
    print(f"{'':<20} agreement rate: median {np.median(rates):.0%}"
          f"   95% of pairings fall in {lo:.0%}-{hi:.0%}"
          f"   {'STRADDLES 50% — uninformative' if lo < 0.5 < hi else 'consistent'}\n")

# The number the argument must then rest on instead.
def z(a):
    a = np.asarray(a, float)
    return (a - a.mean()) / a.std(ddof=0)


def beta_fpoe(idx):
    X = np.column_stack([np.ones(len(idx)), z(role[idx]), z(fpoe[idx]), z(age[idx]),
                         1.0 * (pos[idx] == "WR"), 1.0 * (pos[idx] == "TE")])
    b, *_ = np.linalg.lstsq(X, z(val[idx]), rcond=None)
    return b[2]


boot = np.array([beta_fpoe(rng.integers(0, n, n)) for _ in range(4000)])
lo, hi = np.percentile(boot, [2.5, 97.5])
print(f"bootstrapped market premium on efficiency (4,000 resamples)")
print(f"  point estimate {beta_fpoe(np.arange(n)):+.3f} SD of value per SD of efficiency")
print(f"  95% CI {lo:+.3f} to {hi:+.3f}"
      f"   {'excludes zero' if lo > 0 else 'INCLUDES ZERO — no claim'}")
print(f"  share of resamples above zero: {np.mean(boot > 0):.1%}")
print(f"\ndeterminism checksum: {n}/{round(float(np.median(boot)),6)}")
