#!/usr/bin/env python3
"""THE KEYSTONE. Does where a player's role FINISHED predict next season's role, over and
above his season average?

The chain 017 wants to assert has three links:
  1. opportunity repeats, efficiency does not          -- measured, does-opportunity-repeat.py
  2. the market prices the season's average role and   -- measured, does-market-pay-for-role.py
     not the finish (beta +0.07, n.s.)
  3. the finish predicts next year better than the     -- THIS FILE. Untested until now.
     average does

If link 3 fails, links 1 and 2 describe the market ignoring something that does not matter,
and the trajectory framing on 017 loses its foundation. This test is written to be able to
fail, and the bar is not moved after seeing the answer.

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/tools/does-the-finish-predict.py
"""

import sqlite3
import numpy as np

UN = sqlite3.connect(
    "file:/Users/davidleess/dynasty-genius-product/app/data/nflverse_usage.db?mode=ro", uri=True
)
MIN_GAMES = 10
TAIL = 6
POS = ("RB", "WR", "TE")


def weekly_roles(season):
    """player -> [expected pts per game, week by week]"""
    out = {}
    for dg, wk, v in UN.execute(
        """select dg_player_id, cast(week as int), cast(total_fantasy_points_exp as real)
           from ff_opportunity
           where season=? and position in (?,?,?) and cast(week as int) between 1 and 18
             and dg_player_id != '' order by dg_player_id, cast(week as int)""",
        (season, *POS),
    ):
        out.setdefault(dg, []).append(v)
    return {k: v for k, v in out.items() if len(v) >= MIN_GAMES}


def z(a):
    a = np.asarray(a, float)
    return (a - a.mean()) / a.std(ddof=0)


def ols(y, X, names):
    Xd = np.column_stack([np.ones(len(y))] + [z(c) for c in X])
    yz = z(y)
    beta, *_ = np.linalg.lstsq(Xd, yz, rcond=None)
    resid = yz - Xd @ beta
    se = np.sqrt(np.diag((resid @ resid / (len(y) - Xd.shape[1])) * np.linalg.pinv(Xd.T @ Xd)))
    r2 = 1 - (resid @ resid) / (yz @ yz)
    return dict(zip(names, zip(beta[1:], beta[1:] / se[1:]))), r2


def main():
    seasons = [s for (s,) in UN.execute("select distinct season from ff_opportunity order by season")]
    tables = {s: weekly_roles(s) for s in seasons}

    rows = []
    for a, b in zip(seasons, seasons[1:]):
        for p in sorted(set(tables[a]) & set(tables[b])):
            v = tables[a][p]
            first = sum(v[: len(v) // 2]) / len(v[: len(v) // 2])
            last = sum(v[-TAIL:]) / TAIL
            rows.append((sum(v) / len(v), last, last - first,
                         sum(tables[b][p]) / len(tables[b][p]), f"{a}→{b}"))

    season_role = np.array([r[0] for r in rows])
    last6 = np.array([r[1] for r in rows])
    change = np.array([r[2] for r in rows])
    nxt = np.array([r[3] for r in rows])
    print(f"n = {len(rows)} player-season pairs, {seasons[0]}→{seasons[-1]}\n")

    print("head to head — which single number predicts next season's role better?")
    ca = np.corrcoef(season_role, nxt)[0, 1]
    cb = np.corrcoef(last6, nxt)[0, 1]
    print(f"  season average role  r = {ca:+.3f}")
    print(f"  last {TAIL} games role     r = {cb:+.3f}")
    print(f"  difference           {cb - ca:+.3f}"
          f"   <- positive means the finish is the better predictor\n")

    print("THE TEST — does the finish add anything the season average does not already carry?")
    b, r2 = ols(nxt, [season_role, change], ["seasonRole", "roleChange"])
    for k, (bb, tt) in b.items():
        print(f"  {k:11s} beta {bb:+.3f}   t {tt:+.2f}")
    print(f"  R2 = {r2:.3f}")
    b0, r20 = ols(nxt, [season_role], ["seasonRole"])
    print(f"  season average alone: R2 = {r20:.3f}   ->  the finish adds {r2 - r20:+.3f}\n")

    # Same thing without a model: split on role change, holding the season average fixed by
    # matching. Answers "if two players had the same job on average, does the one who was
    # gaining ground end up with the bigger job next year?"
    o = np.argsort(season_role)
    pairs = [(o[i], o[i + 1]) for i in range(0, len(o) - 1, 2)]
    pairs = [(x, y) for x, y in pairs if abs(season_role[x] - season_role[y]) < 0.5]
    agree = sum(1 for x, y in pairs if (change[x] - change[y]) * (nxt[x] - nxt[y]) > 0)
    from scipy import stats
    print(f"matched pairs, same season role within 0.5 pts/g (n={len(pairs)})")
    print(f"  the player who FINISHED higher has the bigger role next year in "
          f"{agree}/{len(pairs)} = {agree/len(pairs):.0%}")
    print(f"  binomial two-sided p = {stats.binomtest(agree, len(pairs), 0.5).pvalue:.2e}")

    # And the size of it, in the unit a manager actually reads.
    hi = change > np.percentile(change, 90)
    lo = change < np.percentile(change, 10)
    print(f"\nin points per game, next season:")
    print(f"  top 10% by role growth  (n={hi.sum():3d}): season role {season_role[hi].mean():.1f}"
          f"  ->  next year {nxt[hi].mean():.1f}   {nxt[hi].mean()-season_role[hi].mean():+.1f}")
    print(f"  bottom 10%              (n={lo.sum():3d}): season role {season_role[lo].mean():.1f}"
          f"  ->  next year {nxt[lo].mean():.1f}   {nxt[lo].mean()-season_role[lo].mean():+.1f}")

    # Determinism: this script must give the same answer twice (CLAUDE.md principle 11).
    print(f"\nchecksum for determinism: {hash((round(float(ca),9), round(float(cb),9), len(rows)))}")


if __name__ == "__main__":
    main()
