#!/usr/bin/env python3
"""What survived five tests, put under the same scrutiny that killed the others.

The trajectory axis is refuted (see does-the-finish-predict*.py). What is left standing is
the finding from the FIRST regression, which was not what was being looked for at the time:

    the market pays a real premium for last season's EFFICIENCY (beta +0.125, t 2.70),
    and efficiency repeats at r = 0.19 while role repeats at r = 0.77.

If both halves hold, then for two players with the same job, the market is more expensive on
the one whose edge is least likely to persist. That is an asymmetry no other product can
compute, because it needs weekly expected points, the market lane and league ownership in
one place.

This file tries to break it:
  1. is the premium real once role, age and position are held fixed, model-free?
  2. is it just touchdown luck, or name recognition proxied by draft capital?
  3. does the premium decay -- i.e. is the market later proven wrong?
  4. what does it say about HIS 27, named?

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/tools/the-premium-that-does-not-repeat.py
"""

import glob
import json
import sqlite3
import numpy as np
from scipy import stats

D = "/Users/davidleess/dynasty-genius-product/app/data"
RO = lambda p: sqlite3.connect(f"file:{D}/{p}?mode=ro", uri=True)
UN, FC, MC, PP = RO("nflverse_usage.db"), RO("fc_forward_capture.db"), \
    RO("model_forward_capture.db"), RO("playerprofiler.db")
SEASON, MIN_GAMES, POS = "2025", 10, ("RB", "WR", "TE")


def z(a):
    a = np.asarray(a, float)
    return (a - a.mean()) / a.std(ddof=0)


def ols(y, X, names):
    Xd = np.column_stack([np.ones(len(y))] + [z(c) for c in X])
    yz = z(y)
    b, *_ = np.linalg.lstsq(Xd, yz, rcond=None)
    r = yz - Xd @ b
    se = np.sqrt(np.diag((r @ r / (len(y) - Xd.shape[1])) * np.linalg.pinv(Xd.T @ Xd)))
    return {n: (b[i + 1], b[i + 1] / se[i + 1]) for i, n in enumerate(names)}, \
        1 - (r @ r) / (yz @ yz)


fd = FC.execute("select max(snapshot_date) from fc_forward_capture_joinable").fetchone()[0]
md = MC.execute("select max(capture_date) from model_forward_capture_joinable").fetchone()[0]
bridge = {dg: str(s) for dg, s in MC.execute(
    "select dg_player_id, sleeper_id from model_forward_capture_joinable where capture_date=?",
    (md,)) if dg and s}
market = {str(s): float(v) for s, v in FC.execute(
    "select sleeper_id, value from fc_forward_capture_joinable where snapshot_date=?", (fd,)) if s and v}
meta = {}
for dg, age, dp in PP.execute(
        "select dg_player_id, age, draft_pick from pp_player_season where season=?", (SEASON,)):
    if dg and str(age).strip():
        meta[dg] = (float(age), float(dp) if str(dp).strip() else None)

rows = []
for dg, pos, name, g, role, prod, td in UN.execute(
    """select dg_player_id, position, full_name, count(*),
              sum(cast(total_fantasy_points_exp as real))/count(*),
              sum(cast(total_fantasy_points as real))/count(*),
              sum(cast(rec_touchdown as real)+cast(rush_touchdown as real))
       from ff_opportunity where season=? and position in (?,?,?)
         and cast(week as int) between 1 and 18 and dg_player_id!=''
       group by dg_player_id having count(*)>=?""", (SEASON, *POS, MIN_GAMES)):
    sid = bridge.get(dg)
    if sid and sid in market and dg in meta:
        age, dp = meta[dg]
        rows.append(dict(dg=dg, sid=sid, name=name, pos=pos, role=role, prod=prod,
                         fpoe=prod - role, td=td / g, val=market[sid], age=age, dpick=dp))

role = np.array([r["role"] for r in rows]); fpoe = np.array([r["fpoe"] for r in rows])
age = np.array([r["age"] for r in rows]); val = np.log([r["val"] for r in rows])
td = np.array([r["td"] for r in rows])
dwr = np.array([1.0 * (r["pos"] == "WR") for r in rows])
dte = np.array([1.0 * (r["pos"] == "TE") for r in rows])
print(f"n = {len(rows)} · market {fd} · model {md}\n")

# 1 --------------------------------------------------------------- model-free
print("1. MODEL-FREE. Pairs matched on position, role (<0.5 pts/g) and age (<=1 yr).")
idx = sorted(range(len(rows)), key=lambda i: (rows[i]["pos"], role[i], age[i]))
pr = [(idx[i], idx[i + 1]) for i in range(0, len(idx) - 1, 2)]
pr = [(a, b) for a, b in pr if rows[a]["pos"] == rows[b]["pos"]
      and abs(role[a] - role[b]) < 0.5 and abs(age[a] - age[b]) <= 1]
w = sum(1 for a, b in pr if (fpoe[a] - fpoe[b]) * (val[a] - val[b]) > 0)
print(f"   the more EFFICIENT player is the more expensive one: {w}/{len(pr)} = {w/len(pr):.0%}"
      f"   p = {stats.binomtest(w, len(pr), 0.5).pvalue:.3f}")
d_ = [abs(val[a] - val[b]) for a, b in pr]
print(f"   median price gap inside a matched pair: {np.exp(np.median(d_)):.2f}x\n")

# 2 --------------------------------------------------------------- confounders
print("2. IS IT SOMETHING ELSE? touchdown rate and draft capital, added by name.")
b, r2 = ols(val, [role, fpoe, age, td, dwr, dte], ["role", "fpoe", "age", "tdPerGame", "isWR", "isTE"])
for k in ("role", "fpoe", "age", "tdPerGame"):
    print(f"   {k:10s} beta {b[k][0]:+.3f}  t {b[k][1]:+.2f}")
have = [i for i, r in enumerate(rows) if r["dpick"]]
if len(have) > 60:
    hv = np.array(have)
    b2, _ = ols(val[hv], [role[hv], fpoe[hv], age[hv], np.log(np.array([rows[i]["dpick"] for i in hv])),
                          dwr[hv], dte[hv]], ["role", "fpoe", "age", "log_draft_pick", "isWR", "isTE"])
    print(f"   with draft capital in (n={len(hv)}):")
    for k in ("role", "fpoe", "log_draft_pick"):
        print(f"   {k:16s} beta {b2[k][0]:+.3f}  t {b2[k][1]:+.2f}")

# 3 --------------------------------------------------------------- does it persist
print("\n3. DOES THE THING BEING PAID FOR PERSIST? year-over-year, all 8 seasons.")
seasons = [s for (s,) in UN.execute("select distinct season from ff_opportunity order by season")]
tab = {}
for s in seasons:
    tab[s] = {dg: (r_, p_ - r_) for dg, r_, p_ in UN.execute(
        """select dg_player_id, sum(cast(total_fantasy_points_exp as real))/count(*),
                  sum(cast(total_fantasy_points as real))/count(*)
           from ff_opportunity where season=? and position in (?,?,?)
             and cast(week as int) between 1 and 18 and dg_player_id!=''
           group by dg_player_id having count(*)>=?""", (s, *POS, MIN_GAMES))}
rr, ff = [], []
for a, b_ in zip(seasons, seasons[1:]):
    c = sorted(set(tab[a]) & set(tab[b_]))
    rr += [(tab[a][p][0], tab[b_][p][0]) for p in c]
    ff += [(tab[a][p][1], tab[b_][p][1]) for p in c]
rr, ff = np.array(rr), np.array(ff)
print(f"   role       year to year: r = {np.corrcoef(rr[:,0], rr[:,1])[0,1]:+.3f}   (n={len(rr)})")
print(f"   efficiency year to year: r = {np.corrcoef(ff[:,0], ff[:,1])[0,1]:+.3f}")
top = ff[:, 0] > np.percentile(ff[:, 0], 80)
print(f"   of the top fifth by efficiency, {np.mean(ff[top,1] < ff[top,0]):.0%} were lower the next year;"
      f" mean {ff[top,0].mean():+.2f} -> {ff[top,1].mean():+.2f} pts/g")

# 4 --------------------------------------------------------------- his roster
print("\n4. HIS 27 — where price and the durable half disagree.")
snap = json.load(open(sorted(glob.glob(f"{D}/league_snapshots/*.json"))[-1]))
me = [x for x in snap["rosters"] if str(x["roster_id"]) == str(snap["david_roster_id"])][0]
mine = {str(p) for p in me["players"]}
resid = z(val) - np.column_stack([np.ones(len(val)), z(role), z(age), z(dwr), z(dte)]) @ \
    np.linalg.lstsq(np.column_stack([np.ones(len(val)), z(role), z(age), z(dwr), z(dte)]), z(val),
                    rcond=None)[0]
his = [(rows[i]["name"], rows[i]["pos"], rows[i]["role"], rows[i]["fpoe"], rows[i]["val"], resid[i])
       for i in range(len(rows)) if rows[i]["sid"] in mine]
print(f"   {len(his)} of his players are in this population (RB/WR/TE, 10+ games, both lanes)\n")
print(f"   {'player':<22}{'pos':>4}{'role':>7}{'eff':>8}{'market':>9}{'priced vs role':>16}")
for n, p, r_, f_, v, e in sorted(his, key=lambda x: -x[3]):
    print(f"   {n:<22}{p:>4}{r_:>7.1f}{f_:>+8.2f}{v:>9.0f}{e:>+16.2f}")
print(f"\n   'eff' = pts per game above/below what his role was worth."
      f"\n   'priced vs role' = SDs of market value above/below what his role, age and position predict.")
print(f"\ndeterminism checksum: {len(rows)}/{len(pr)}/{w}/{len(rr)}")
