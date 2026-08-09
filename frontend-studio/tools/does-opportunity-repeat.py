#!/usr/bin/env python3
"""Does opportunity repeat year over year, and does efficiency not?

017 leans its whole argument on that sentence and currently sources it to a Fantasy
Footballers article (74% of receivers give back points-over-expected the next year).
A citation is a claim about a fact; this measures it in-house on the eight seasons of
ff_opportunity sitting in the product's own data directory, so the surface can stand on
a number anyone here can re-run.

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/tools/does-opportunity-repeat.py
"""

import sqlite3
import numpy as np
from scipy import stats

UN = sqlite3.connect(
    "file:/Users/davidleess/dynasty-genius-product/app/data/nflverse_usage.db?mode=ro", uri=True
)
MIN_GAMES = 10
POS = ("RB", "WR", "TE")


def season_table(season):
    """player -> (role per game, production per game, fpoe per game) for one season."""
    return {
        dg: (role, prod, prod - role)
        for dg, role, prod in UN.execute(
            """select dg_player_id,
                      sum(cast(total_fantasy_points_exp as real))/count(*),
                      sum(cast(total_fantasy_points as real))/count(*)
               from ff_opportunity
               where season=? and position in (?,?,?) and cast(week as int) between 1 and 18
                 and dg_player_id != ''
               group by dg_player_id having count(*) >= ?""",
            (season, *POS, MIN_GAMES),
        )
    }


def main():
    seasons = [s for (s,) in UN.execute(
        "select distinct season from ff_opportunity order by season")]
    print(f"seasons on disk: {', '.join(seasons)}\n")

    tables = {s: season_table(s) for s in seasons}
    pairs = [(a, b) for a, b in zip(seasons, seasons[1:])]

    print(f"year-over-year repeatability, {'/'.join(POS)}, >={MIN_GAMES} games in BOTH seasons")
    print(f"{'pair':<12}{'n':>5}{'role r':>10}{'fpoe r':>10}{'gave it back':>15}")
    print("-" * 52)

    all_role, all_fpoe, gave_back_n, gave_back_d = [], [], 0, 0
    for a, b in pairs:
        common = sorted(set(tables[a]) & set(tables[b]))
        if len(common) < 30:
            continue
        r0 = np.array([tables[a][p][0] for p in common])
        r1 = np.array([tables[b][p][0] for p in common])
        f0 = np.array([tables[a][p][2] for p in common])
        f1 = np.array([tables[b][p][2] for p in common])
        # "gave it back" = beat your role one year, regressed toward it the next.
        beat = f0 > 0
        back = int(np.sum(beat & (f1 < f0)))
        gave_back_n += back
        gave_back_d += int(np.sum(beat))
        all_role.append(np.corrcoef(r0, r1)[0, 1])
        all_fpoe.append(np.corrcoef(f0, f1)[0, 1])
        print(f"{a}→{b}{len(common):>7}{all_role[-1]:>10.3f}{all_fpoe[-1]:>10.3f}"
              f"{back/max(np.sum(beat),1):>14.0%}")

    print("-" * 52)
    print(f"{'mean':<12}{'':>5}{np.mean(all_role):>10.3f}{np.mean(all_fpoe):>10.3f}"
          f"{gave_back_n/gave_back_d:>14.0%}")

    # Pooled, and a formal test that the two correlations differ (Fisher z on independent-ish
    # pooled samples; stated as approximate because player-seasons repeat across pairs).
    zr, zf = np.arctanh(np.mean(all_role)), np.arctanh(np.mean(all_fpoe))
    n_eff = gave_back_d
    se = np.sqrt(2 / max(n_eff - 3, 1))
    print(f"\nrole repeats at r={np.mean(all_role):.3f}, efficiency at r={np.mean(all_fpoe):.3f}")
    print(f"Fisher z difference {zr - zf:+.3f}, approx se {se:.3f}, "
          f"z = {(zr - zf)/se:+.1f}, p = {2*(1-stats.norm.cdf(abs((zr-zf)/se))):.2e}")
    print("\n(approximate: player-seasons recur across adjacent pairs, so the pairs are not\n"
          " fully independent. The gap is large enough that the dependence does not decide it.)")


if __name__ == "__main__":
    main()
