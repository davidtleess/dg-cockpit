#!/usr/bin/env python3
"""In week N of a season, which usage numbers can I already believe?

David, 2026-08-09: "we want to build surfaces not just for the data we have now but the
shape of the data that will continue to be refreshed during the season."  Every surface
this lane has built reads a FINISHED season.  In week 3 the same numbers exist and mean
something different, and nothing in the product or the category marks the difference —
Sleeper, KTC and FantasyCalc render a week-2 rate with exactly the authority of a
week-17 rate.

The question, in one line: for each metric a scouting line uses, how many weeks must be
on the books before the number is worth saying out loud?

That turns out to be TWO questions, and conflating them is the mistake the hobby makes.

  (A) RELIABILITY — is this number measuring a real property of the player, or is it the
      arithmetic of a small sample?  Split the weeks so far into odd and even, compute
      the metric on each half, correlate, and Spearman-Brown up to full length.  This
      asks nothing about the future.  A number can be perfectly reliable and tell you
      nothing about next week.

  (B) PREDICTIVENESS — does what I have seen tell me what is coming?  Two forms, because
      the obvious one has a hole:
        B1  weeks 1..N against weeks N+1..end.  The manager's literal question, but the
            target SHRINKS as N grows, so a flat curve could be a rising signal being
            eaten by a noisier and noisier target.  On its own it cannot support
            "more weeks do not help."
        B2  weeks 1..N against a FIXED target of weeks 13..end.  Same target at every
            cutoff, so the only thing changing is how much input there is.  This is the
            one that can carry a claim about sample size.

Spearman rank correlation throughout: the hobby reads ranks, and it survives the long
right tail on every counting stat here.

Nothing is pooled across seasons before it is shown per season.

CONTROLS, both directions (craft principle 11).  The instrument must convict as well as
clear.  Positive: snap share is a role, assigned by a coach, and must settle early.
Negative: yards per carry and touchdowns per game are the canonical non-repeating
quantities in this hobby and must NOT settle.  If TDs per game stabilise in week 2 the
instrument is wrong and no reading from it may be quoted.

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/tools/when-can-i-believe-it.py
"""

import sqlite3
import sys
from collections import defaultdict

import numpy as np
from scipy import stats

PP = sqlite3.connect(
    "file:/Users/davidleess/dynasty-genius-product/app/data/playerprofiler.db?mode=ro",
    uri=True,
)

# Regular season only.  The 2026-08-08 lesson: this gamelog carries the postseason, and
# every per-game rate silently mixed playoff football into it until weeks 19-22 were cut.
LAST_REG = {2020: 17, 2021: 18, 2022: 18, 2023: 18, 2024: 17, 2025: 18}
SEASONS = sorted(LAST_REG)

# `opportunity_share` is 100% NULL in 2021-2025 and 44% NULL in 2020 — measured, not
# assumed.  It is excluded rather than silently scored as zero, which is what an earlier
# run of this tool did (it returned nan and would have read as "no signal").
FIELDS = [
    "routes_run", "targets", "receptions", "receiving_yards", "receiving_touchdowns",
    "snap_share", "target_share", "total_touches", "carries", "rushing_yards",
    "rushing_touchdowns", "fantasy_points", "snaps",
]

CUTS = list(range(1, 13))
FIXED_TARGET_FROM = 13
MIN_LATE_GAMES = 4
MIN_PAIRS = 30


def num(v):
    if v is None or v == "":
        return None
    try:
        return float(v)
    except ValueError:
        return None


def load(season):
    cols = ", ".join(FIELDS)
    q = (
        f"SELECT dg_player_id, name, position, CAST(week AS INT) AS wk, {cols} "
        "FROM pp_gamelog_week WHERE season = ? AND CAST(week AS INT) <= ? "
        "AND position IN ('QB','RB','WR','TE') AND dg_player_id IS NOT NULL "
        "AND dg_player_id <> ''"
    )
    rows, meta = defaultdict(list), {}
    for r in PP.execute(q, (str(season), LAST_REG[season])):
        pid, name, pos, wk = r[0], r[1], r[2], r[3]
        vals = {f: num(v) for f, v in zip(FIELDS, r[4:])}
        vals["wk"] = wk
        rows[pid].append(vals)
        meta[pid] = (name, pos)
    return rows, meta


def s(g, f):
    v = g.get(f)
    return 0.0 if v is None else v


# key, label, positions, numerator, denominator, mindenom, note
METRICS = [
    ("snap_share", "snap share", ("WR", "TE"),
     lambda w: sum(s(g, "snap_share") * s(g, "snaps") for g in w),
     lambda w: sum(s(g, "snaps") for g in w), 20,
     "POSITIVE CONTROL — a role, must settle early"),
    ("routes_pg", "routes a game", ("WR", "TE"),
     lambda w: sum(s(g, "routes_run") for g in w), lambda w: float(len(w)), 1, ""),
    ("target_share", "target share", ("WR", "TE"),
     lambda w: sum(s(g, "target_share") * s(g, "routes_run") for g in w),
     lambda w: sum(s(g, "routes_run") for g in w), 20, ""),
    ("tprr", "targets per route run", ("WR", "TE"),
     lambda w: sum(s(g, "targets") for g in w),
     lambda w: sum(s(g, "routes_run") for g in w), 20, ""),
    ("yprr", "yards per route run", ("WR", "TE"),
     lambda w: sum(s(g, "receiving_yards") for g in w),
     lambda w: sum(s(g, "routes_run") for g in w), 20, ""),
    ("ypt", "yards per target", ("WR", "TE"),
     lambda w: sum(s(g, "receiving_yards") for g in w),
     lambda w: sum(s(g, "targets") for g in w), 5, "efficiency — expected weak"),
    ("rec_td_pg", "receiving TDs a game", ("WR", "TE"),
     lambda w: sum(s(g, "receiving_touchdowns") for g in w),
     lambda w: float(len(w)), 1, "NEGATIVE CONTROL — must NOT settle"),
    ("ppg_wr", "fantasy points a game", ("WR", "TE"),
     lambda w: sum(s(g, "fantasy_points") for g in w), lambda w: float(len(w)), 1,
     "what everyone actually looks at"),

    ("rb_snap_share", "snap share", ("RB",),
     lambda w: sum(s(g, "snap_share") * s(g, "snaps") for g in w),
     lambda w: sum(s(g, "snaps") for g in w), 20,
     "POSITIVE CONTROL — a role, must settle early"),
    ("touches_pg", "touches a game", ("RB",),
     lambda w: sum(s(g, "total_touches") for g in w), lambda w: float(len(w)), 1, ""),
    ("ypc", "yards per carry", ("RB",),
     lambda w: sum(s(g, "rushing_yards") for g in w),
     lambda w: sum(s(g, "carries") for g in w), 10, "NEGATIVE CONTROL — must NOT settle"),
    ("rush_td_pg", "rushing TDs a game", ("RB",),
     lambda w: sum(s(g, "rushing_touchdowns") for g in w),
     lambda w: float(len(w)), 1, "NEGATIVE CONTROL — must NOT settle"),
    ("ppg_rb", "fantasy points a game", ("RB",),
     lambda w: sum(s(g, "fantasy_points") for g in w), lambda w: float(len(w)), 1,
     "what everyone actually looks at"),
]


def wval(games, numf, denf, mindenom):
    if not games:
        return None
    d = denf(games)
    if d is None or d < mindenom or d <= 0:
        return None
    return numf(games) / d


def rho(a, b):
    """Spearman, refusing to report on too few pairs or a constant input."""
    if len(a) < MIN_PAIRS:
        return None
    if len(set(a)) < 3 or len(set(b)) < 3:
        return None
    r = stats.spearmanr(a, b).statistic
    return None if r is None or np.isnan(r) else float(r)


def curves_for(rows, meta, metric):
    """Returns {mode: {N: (rho, n)}} for modes A (reliability), B1, B2."""
    _k, _l, positions, numf, denf, mindenom, _n = metric
    out = {m: {} for m in ("A", "B1", "B2")}

    for n in CUTS:
        a_x, a_y = [], []
        b1_x, b1_y = [], []
        b2_x, b2_y = [], []
        for pid, games in rows.items():
            if meta[pid][1] not in positions:
                continue
            early = [g for g in games if g["wk"] <= n]
            rest = [g for g in games if g["wk"] > n]
            fixed = [g for g in games if g["wk"] >= FIXED_TARGET_FROM]

            ev = wval(early, numf, denf, mindenom)

            # (A) reliability: odd vs even weeks inside the window seen so far.
            if n >= 2:
                odd = [g for g in early if g["wk"] % 2 == 1]
                even = [g for g in early if g["wk"] % 2 == 0]
                ov, vv = (wval(odd, numf, denf, mindenom / 2),
                          wval(even, numf, denf, mindenom / 2))
                if ov is not None and vv is not None:
                    a_x.append(ov)
                    a_y.append(vv)

            # (B1) shrinking target.
            if ev is not None and len(rest) >= MIN_LATE_GAMES:
                lv = wval(rest, numf, denf, mindenom)
                if lv is not None:
                    b1_x.append(ev)
                    b1_y.append(lv)

            # (B2) fixed target, weeks 13..end.
            if ev is not None and len(fixed) >= MIN_LATE_GAMES:
                fv = wval(fixed, numf, denf, mindenom)
                if fv is not None:
                    b2_x.append(ev)
                    b2_y.append(fv)

        # Spearman-Brown: a half-length correlation understates the full window.
        r_half = rho(a_x, a_y)
        out["A"][n] = ((2 * r_half / (1 + r_half)) if r_half is not None and r_half > -1
                       else None, len(a_x))
        out["B1"][n] = (rho(b1_x, b1_y), len(b1_x))
        out["B2"][n] = (rho(b2_x, b2_y), len(b2_x))
    return out


def pool(per_season, mode):
    """Median across seasons at each cutoff. Median so one odd season cannot name the
    answer on its own."""
    p = {}
    for n in CUTS:
        vals = [per_season[sn][mode][n][0] for sn in SEASONS
                if per_season[sn][mode][n][0] is not None]
        ns = [per_season[sn][mode][n][1] for sn in SEASONS
              if per_season[sn][mode][n][0] is not None]
        p[n] = (float(np.median(vals)) if vals else None,
                int(np.median(ns)) if ns else 0, len(vals))
    return p


def first_at(curve, bar):
    """First cutoff clearing `bar` where the rest of the curve also clears it, allowing a
    0.01 sag so a single rounding-width dip does not push the answer to week 12."""
    for n in CUTS:
        r = curve[n][0]
        if r is None or r < bar:
            continue
        rest = [curve[m][0] for m in CUTS if m > n and curve[m][0] is not None]
        if all(x >= bar - 0.01 for x in rest):
            return n
    return None


def plateau(curve):
    """Week at which the curve is within 0.03 of its own maximum and stays there.
    Answers 'when does waiting longer stop buying anything', separately from 'is it any
    good' — a metric can plateau in week 2 at rho 0.18."""
    vals = [curve[n][0] for n in CUTS if curve[n][0] is not None]
    if not vals:
        return None, None
    top = max(vals)
    for n in CUTS:
        r = curve[n][0]
        if r is None or r < top - 0.03:
            continue
        rest = [curve[m][0] for m in CUTS if m > n and curve[m][0] is not None]
        if all(x >= top - 0.03 for x in rest):
            return n, top
    return None, top


def line(label, curve, lo=1):
    cells = []
    for n in CUTS:
        r = curve[n][0]
        cells.append("     ·" if (r is None or n < lo) else f"{r:>6.2f}")
    return f"   {label:<7}" + "".join(cells)


def main():
    data = {sn: load(sn) for sn in SEASONS}
    for sn in SEASONS:
        if not data[sn][0]:
            sys.exit(f"FATAL: no rows for {sn}")

    print("=" * 96)
    print("WHEN CAN I BELIEVE IT")
    print(f"seasons {SEASONS[0]}-{SEASONS[-1]} · regular season only · Spearman rho, median "
          f"across seasons · min {MIN_PAIRS} pairs")
    print("  A   reliability      odd weeks vs even weeks within weeks 1..N, "
          "Spearman-Brown corrected")
    print("  B1  predicts rest    weeks 1..N vs weeks N+1..end   (target shrinks as N grows)")
    print(f"  B2  predicts late    weeks 1..N vs weeks {FIXED_TARGET_FROM}..end   "
          "(same target at every N — the one that can speak about sample size)")
    print("=" * 96)

    summary = []
    for metric in METRICS:
        key, label, positions, _, _, _, note = metric
        per_season = {sn: curves_for(data[sn][0], data[sn][1], metric) for sn in SEASONS}
        A, B1, B2 = (pool(per_season, m) for m in ("A", "B1", "B2"))

        real_wk = first_at(A, 0.70)
        pl_wk, pl_top = plateau(B2)
        summary.append((key, label, "/".join(positions), real_wk, pl_wk, pl_top,
                        B2[12][0], A, B1, B2))

        print()
        print(f"── {label}  [{'/'.join(positions)}]" + (f"   ← {note}" if note else ""))
        print("   week   " + "".join(f"{n:>6}" for n in CUTS))
        print(line("A", A, lo=2))
        print(line("B1", B1))
        print(line("B2", B2))
        print("   n      " + "".join(f"{B2[n][1]:>6}" for n in CUTS))
        sp = []
        for n in (3, 6, 12):
            vals = [per_season[sn]["B2"][n][0] for sn in SEASONS
                    if per_season[sn]["B2"][n][0] is not None]
            if vals:
                sp.append(f"wk{n} {min(vals):.2f}-{max(vals):.2f} ({len(vals)} seasons)")
        print("   B2 across seasons: " + " · ".join(sp))
        print(f"   → measures something real (A≥0.70) from week "
              f"{real_wk if real_wk else '— not within 12'}"
              f" · predicting later weeks stops improving at week "
              f"{pl_wk if pl_wk else '—'}, ceiling rho "
              f"{pl_top:.2f}" if pl_top is not None else "   → no reading")

    print()
    print("=" * 96)
    print("CONTROL CHECK — the instrument must convict, not only clear")
    print("=" * 96)
    byk = {r[0]: r for r in summary}
    ok = True

    def check(cond, msg):
        nonlocal ok
        if not cond:
            ok = False
        print(f"   [{'PASS' if cond else 'FAIL'}] {msg}")

    for k, nm in (("snap_share", "WR/TE"), ("rb_snap_share", "RB")):
        b2 = byk[k][9]
        check(b2[3][0] is not None and b2[3][0] >= 0.60,
              f"positive control: {nm} snap share predicts weeks 13+ at rho>=0.60 by week 3 "
              f"(got {b2[3][0]:.2f})" if b2[3][0] is not None else
              f"positive control: {nm} snap share — NO READING")
    for k, nm in (("rec_td_pg", "receiving TDs a game"), ("ypc", "yards per carry"),
                  ("rush_td_pg", "rushing TDs a game")):
        top = byk[k][5]
        check(top is not None and top < 0.70,
              f"negative control: {nm} never reaches rho 0.70 against weeks 13+ "
              f"(ceiling {top:.2f})" if top is not None else
              f"negative control: {nm} — NO READING")
    b1_yprr = byk["yprr"][8]
    b2_yprr = byk["yprr"][9]
    check(b1_yprr[12][0] is not None and b2_yprr[12][0] is not None,
          "hole check: B1 and B2 both report for yards per route run, so the shrinking-target "
          "artefact can be compared against a fixed target")

    print()
    if not ok:
        print("   >>> A CONTROL FAILED. No reading above may be quoted. <<<")
        sys.exit(1)
    print("   All controls hold. The readings above are quotable.")

    print()
    print("=" * 96)
    print("THE ANSWER — two independent facts about every number, and they come apart")
    print("=" * 96)
    print(f"   {'metric':<24}{'pos':<7}{'real from':<12}{'more weeks stop':<18}"
          f"{'ceiling vs':<12}")
    print(f"   {'':<24}{'':<7}{'(A>=0.70)':<12}{'helping at':<18}{'weeks 13+':<12}")
    for key, label, pos, real_wk, pl_wk, pl_top, _b12, *_ in sorted(
            summary, key=lambda r: -(r[5] or 0)):
        a = f"week {real_wk}" if real_wk else "never in 12"
        b = f"week {pl_wk}" if pl_wk else "—"
        c = f"{pl_top:.2f}" if pl_top is not None else "—"
        print(f"   {label:<24}{pos:<7}{a:<12}{b:<18}{c:<12}")
    print()
    print("   Read the last two columns together. A number whose ceiling is low does not")
    print("   become trustworthy by waiting — the ceiling is a property of the quantity,")
    print("   not of the sample.")


if __name__ == "__main__":
    main()
