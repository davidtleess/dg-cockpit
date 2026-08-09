#!/usr/bin/env python3
"""Two PRE-SPECIFIED follow-ups to the keystone failure. Both were named before the numbers
were seen, and the primary result stands regardless of how these land.

A. SURVIVORSHIP. does-the-finish-predict.py required >=10 games in BOTH seasons, which
   silently drops every player whose role collapsed so far that he lost the job entirely.
   That is the instrument choosing its own population (CLAUDE.md principle 11), and it
   removes exactly the cases where a declining role should matter most. Fixed by carrying
   players forward at their true next-season role including zero.

B. MECHANISM. The pooled test treats a role change caused by a mid-season TRADE the same
   as random week-to-week wobble. 017's own hero is the traded case — Mitchell to the Jets
   in week 11 — and the byTeam split already exists in its build. If the finish predicts
   anything, it should predict where the circumstance actually changed.

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/tools/finish-predict-followups.py
"""

import sqlite3
import numpy as np
from scipy import stats

UN = sqlite3.connect(
    "file:/Users/davidleess/dynasty-genius-product/app/data/nflverse_usage.db?mode=ro", uri=True
)
MIN_GAMES, TAIL, POS = 10, 6, ("RB", "WR", "TE")


def weekly(season):
    out = {}
    for dg, wk, v, team in UN.execute(
        """select dg_player_id, cast(week as int), cast(total_fantasy_points_exp as real), posteam
           from ff_opportunity
           where season=? and position in (?,?,?) and cast(week as int) between 1 and 18
             and dg_player_id != '' order by dg_player_id, cast(week as int)""",
        (season, *POS),
    ):
        out.setdefault(dg, []).append((v, team))
    return out


def z(a):
    a = np.asarray(a, float)
    return (a - a.mean()) / (a.std(ddof=0) or 1)


def ols(y, X, names):
    Xd = np.column_stack([np.ones(len(y))] + [z(c) for c in X])
    yz = z(y)
    beta, *_ = np.linalg.lstsq(Xd, yz, rcond=None)
    resid = yz - Xd @ beta
    se = np.sqrt(np.diag((resid @ resid / (len(y) - Xd.shape[1])) * np.linalg.pinv(Xd.T @ Xd)))
    return dict(zip(names, zip(beta[1:], beta[1:] / se[1:]))), 1 - (resid @ resid) / (yz @ yz)


seasons = [s for (s,) in UN.execute("select distinct season from ff_opportunity order by season")]
W = {s: weekly(s) for s in seasons}

rows = []
for a, b in zip(seasons, seasons[1:]):
    for p, v in W[a].items():
        if len(v) < MIN_GAMES:
            continue
        vals = [x[0] for x in v]
        teams = [x[1] for x in v]
        first = sum(vals[: len(vals) // 2]) / len(vals[: len(vals) // 2])
        last = sum(vals[-TAIL:]) / TAIL
        nv = [x[0] for x in W[b].get(p, [])]
        rows.append(dict(
            season=sum(vals) / len(vals), last6=last, change=last - first,
            nxt_survivor=(sum(nv) / len(nv)) if len(nv) >= MIN_GAMES else None,
            nxt_all=(sum(nv) / len(nv)) if nv else 0.0,
            nxt_games=len(nv),
            traded=len(set(teams)) > 1,
            tail_team_switch=len(set(teams[-TAIL:])) == 1 and teams[0] != teams[-1],
        ))

print(f"{len(rows)} player-seasons with a following season on disk\n")

# ---------------------------------------------------------------- A. survivorship
print("=" * 74)
print("A. SURVIVORSHIP — what the >=10-games-next-year filter was hiding")
print("=" * 74)
surv = [r for r in rows if r["nxt_survivor"] is not None]
print(f"  survivors: {len(surv)} of {len(rows)}  "
      f"({len(rows)-len(surv)} dropped, {(len(rows)-len(surv))/len(rows):.0%})")
lo = np.percentile([r["change"] for r in rows], 10)
hi = np.percentile([r["change"] for r in rows], 90)
for lbl, sel in [("role grew most (top 10%)", lambda r: r["change"] >= hi),
                 ("role fell most (bottom 10%)", lambda r: r["change"] <= lo),
                 ("everyone else", lambda r: lo < r["change"] < hi)]:
    g = [r for r in rows if sel(r)]
    drop = sum(1 for r in g if r["nxt_games"] < MIN_GAMES)
    print(f"  {lbl:28s} n={len(g):4d}   lost the job next year: {drop/len(g):.0%}"
          f"   mean next-year role (0 for the gone) {np.mean([r['nxt_all'] for r in g]):.2f}")

y = np.array([r["nxt_all"] for r in rows])
b, r2 = ols(y, [np.array([r["season"] for r in rows]), np.array([r["change"] for r in rows])],
            ["seasonRole", "roleChange"])
_, r20 = ols(y, [np.array([r["season"] for r in rows])], ["seasonRole"])
print(f"\n  next-year role INCLUDING players who lost the job (role = 0):")
for k, (bb, tt) in b.items():
    print(f"    {k:11s} beta {bb:+.3f}   t {tt:+.2f}")
print(f"    R2 {r2:.3f} vs {r20:.3f} season-average-only  ->  the finish adds {r2-r20:+.3f}")

ch = np.array([r["change"] for r in rows])
o = np.argsort([r["season"] for r in rows])
pairs = [(o[i], o[i + 1]) for i in range(0, len(o) - 1, 2)]
pairs = [(x, w) for x, w in pairs if abs(rows[x]["season"] - rows[w]["season"]) < 0.5]
ag = sum(1 for x, w in pairs if (ch[x] - ch[w]) * (y[x] - y[w]) > 0)
print(f"    matched pairs (n={len(pairs)}): finish-higher player bigger next year "
      f"{ag}/{len(pairs)} = {ag/len(pairs):.0%}, p = {stats.binomtest(ag, len(pairs), .5).pvalue:.2e}")

# ---------------------------------------------------------------- B. mechanism
print("\n" + "=" * 74)
print("B. MECHANISM — does the finish predict where the CIRCUMSTANCE actually changed?")
print("=" * 74)
for lbl, sel in [("changed teams mid-season", lambda r: r["traded"]),
                 ("stayed put all season", lambda r: not r["traded"])]:
    g = [r for r in surv if sel(r)]
    if len(g) < 25:
        print(f"  {lbl:26s} n={len(g)} — too few to read")
        continue
    s = np.array([r["season"] for r in g]); l6 = np.array([r["last6"] for r in g])
    n_ = np.array([r["nxt_survivor"] for r in g])
    ca, cb = np.corrcoef(s, n_)[0, 1], np.corrcoef(l6, n_)[0, 1]
    print(f"  {lbl:26s} n={len(g):4d}   season avg r={ca:+.3f}   last{TAIL} r={cb:+.3f}"
          f"   diff {cb-ca:+.3f}")

print("\n  (positive diff = the finish is the better predictor for that subgroup)")
print(f"\ndeterminism checksum: {len(rows)}/{len(surv)}/{len(pairs)}")
