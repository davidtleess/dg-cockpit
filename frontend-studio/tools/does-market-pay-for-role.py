#!/usr/bin/env python3
"""Does the dynasty market price the JOB, or only the PRODUCTION?

The question this answers, and why it decides whether 017 gets a second half:
017 draws a player's ROLE (expected fantasy points — what his targets and carries were
worth at league-average efficiency) and deliberately leaves PRODUCTION out. The published
research says the two halves behave differently — opportunity repeats year over year,
efficiency mostly does not. If the market already prices role as well as it prices
production, then drawing the gap between them teaches nothing and the second half should
not ship. If the market is anchored to production and blind to role, the gap is
information no other product on the market can show, because it needs weekly xFP, the
market lane and our model in one place.

Every path is absolute. Every source is opened read-only. Nothing is written outside
~/frontend-studio.

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/tools/does-market-pay-for-role.py
"""

import sqlite3
import numpy as np

PROD = "/Users/davidleess/dynasty-genius-product/app/data"
RO = lambda p: sqlite3.connect(f"file:{PROD}/{p}?mode=ro", uri=True)

SEASON = "2025"
MIN_GAMES = 10
POS = ("RB", "WR", "TE")  # QB kept out: its role scale is ~2x (017 meta), different market too
SEED = 20260808  # fixed — this script must return the same numbers on every run


def load():
    un, fc, pp = RO("nflverse_usage.db"), RO("fc_forward_capture.db"), RO("playerprofiler.db")

    fd = fc.execute("select max(snapshot_date) from fc_forward_capture_joinable").fetchone()[0]
    md = RO("model_forward_capture.db").execute(
        "select max(capture_date) from model_forward_capture_joinable"
    ).fetchone()[0]

    # dg_player_id -> market value, via the model capture's sleeper bridge
    bridge = {
        dg: sid
        for dg, sid in RO("model_forward_capture.db").execute(
            "select dg_player_id, sleeper_id from model_forward_capture_joinable where capture_date=?",
            (md,),
        )
        if dg and sid
    }
    market = {
        str(sid): v
        for sid, v in fc.execute(
            "select sleeper_id, value from fc_forward_capture_joinable where snapshot_date=?", (fd,)
        )
        if sid and v
    }
    ages = {
        dg: a
        for dg, a in pp.execute(
            "select dg_player_id, age from pp_player_season where season=? and age is not null", (SEASON,)
        )
        if dg
    }

    rows = un.execute(
        """select dg_player_id, position, full_name,
                  count(*) g,
                  sum(cast(total_fantasy_points_exp as real))/count(*) role,
                  sum(cast(total_fantasy_points as real))/count(*)     prod
           from ff_opportunity
           where season=? and position in (?,?,?) and cast(week as int) between 1 and 18
             and dg_player_id != ''
           group by dg_player_id having count(*) >= ?""",
        (SEASON, *POS, MIN_GAMES),
    ).fetchall()

    out = []
    for dg, pos, name, g, role, prod in rows:
        sid = bridge.get(dg)
        val, age = market.get(str(sid)) if sid else None, ages.get(dg)
        if val and age:
            out.append(dict(dg=dg, name=name, pos=pos, g=g, role=role, prod=prod,
                            fpoe=prod - role, val=float(val), age=float(age)))
    return out, fd, md


def z(a):
    a = np.asarray(a, float)
    return (a - a.mean()) / a.std(ddof=0)


def ols(y, X, names):
    """Standardised OLS. Returns betas, t-stats, R^2. X columns are z-scored, y is z-scored,
    so each beta is the SD change in y per 1 SD of that predictor, others held fixed."""
    Xd = np.column_stack([np.ones(len(y))] + [z(c) for c in X])
    yz = z(y)
    beta, *_ = np.linalg.lstsq(Xd, yz, rcond=None)
    resid = yz - Xd @ beta
    dof = len(y) - Xd.shape[1]
    s2 = resid @ resid / dof
    se = np.sqrt(np.diag(s2 * np.linalg.pinv(Xd.T @ Xd)))
    r2 = 1 - (resid @ resid) / (yz @ yz)
    return dict(zip(names, zip(beta[1:], beta[1:] / se[1:]))), r2


def partial(y, x, controls):
    """corr(y, x) with `controls` projected out of both. The honest 'does x add anything'."""
    C = np.column_stack([np.ones(len(y))] + [z(c) for c in controls])
    ry = z(y) - C @ np.linalg.lstsq(C, z(y), rcond=None)[0]
    rx = z(x) - C @ np.linalg.lstsq(C, z(x), rcond=None)[0]
    return float(np.corrcoef(ry, rx)[0, 1])


def main():
    d, fd, md = load()
    print(f"population n={len(d)}  ({'/'.join(POS)}, {SEASON}, >={MIN_GAMES} games, in both lanes)")
    print(f"market snapshot {fd} · model capture {md}\n")

    role = np.array([r["role"] for r in d])
    prod = np.array([r["prod"] for r in d])
    fpoe = np.array([r["fpoe"] for r in d])
    age = np.array([r["age"] for r in d])
    val = np.log(np.array([r["val"] for r in d]))  # dynasty values are heavily right-skewed
    rng = np.random.default_rng(SEED)
    noise = rng.normal(size=len(d))

    # ---- INSTRUMENT CHECK, BOTH DIRECTIONS, before any number is quoted ----------------
    # known-good specimen: in a DYNASTY market, age must carry a clearly negative sign.
    # known-bad specimen: a seeded noise column must come back at ~0.
    chk, _ = ols(val, [age, noise], ["age", "noise"])
    print("instrument check (both directions)")
    print(f"  age   beta {chk['age'][0]:+.3f}  t {chk['age'][1]:+.2f}   <- must be clearly negative")
    print(f"  noise beta {chk['noise'][0]:+.3f}  t {chk['noise'][1]:+.2f}   <- must be ~0")
    ok = chk["age"][0] < -0.15 and abs(chk["noise"][1]) < 2
    print(f"  verdict: {'PASS' if ok else 'FAIL — do not read anything below'}\n")
    if not ok:
        return

    print("raw correlations with log(market value)")
    for lbl, v in [("role  (expected pts/g)", role), ("production (actual pts/g)", prod),
                   ("fpoe  (prod - role)", fpoe), ("age", age)]:
        print(f"  {lbl:28s} r = {np.corrcoef(v, val)[0,1]:+.3f}")
    print(f"\n  role vs production r = {np.corrcoef(role, prod)[0,1]:+.3f}"
          f"   (they are NOT independent — that is why the regression below exists)")

    # ---- THE TEST ---------------------------------------------------------------------
    # Market value on role and fpoe together, age controlled, position controlled.
    # role + fpoe == production exactly, so this decomposes 'what he scored' into
    # 'the job he had' and 'what he did with it', and asks what the market pays for each.
    dwr = np.array([1.0 if r["pos"] == "WR" else 0.0 for r in d])
    dte = np.array([1.0 if r["pos"] == "TE" else 0.0 for r in d])
    b, r2 = ols(val, [role, fpoe, age, dwr, dte], ["role", "fpoe", "age", "is_WR", "is_TE"])
    print(f"\nlog(market value) ~ role + fpoe + age + position     R2 = {r2:.3f}")
    for k, (bb, tt) in b.items():
        print(f"  {k:8s} beta {bb:+.3f}   t {tt:+.2f}")

    print("\npartial correlations with log(market value), age + position held fixed")
    print(f"  role : {partial(val, role, [age, dwr, dte]):+.3f}")
    print(f"  fpoe : {partial(val, fpoe, [age, dwr, dte]):+.3f}")
    print(f"  fpoe, ALSO holding role fixed : {partial(val, fpoe, [role, age, dwr, dte]):+.3f}")
    print(f"  role, ALSO holding fpoe fixed : {partial(val, role, [fpoe, age, dwr, dte]):+.3f}")

    # ---- The same question asked without any model: matched pairs -----------------------
    # Among players whose ROLE was nearly identical, does the market separate them by fpoe?
    order = np.argsort(role)
    pairs = [(order[i], order[i + 1]) for i in range(0, len(order) - 1, 2)]
    pairs = [(a, b_) for a, b_ in pairs if abs(role[a] - role[b_]) < 0.5 and d[a]["pos"] == d[b_]["pos"]]
    agree = sum(1 for a, b_ in pairs if (fpoe[a] - fpoe[b_]) * (val[a] - val[b_]) > 0)
    print(f"\nmatched pairs, same position and role within 0.5 pts/g  (n={len(pairs)})")
    print(f"  the higher-fpoe player is the more valuable one in {agree}/{len(pairs)}"
          f" = {agree/len(pairs):.0%} of pairs   (coin flip = 50%)")

    # ---- THE SECOND TEST, and it is the one that matters ------------------------------
    # The first test used SEASON TOTALS, which is the exact unit 017 argues is wrong for a
    # young player. So: holding the season's average role fixed, does the market pay any
    # attention to where the role FINISHED? Same split 017 draws — first half vs last six.
    print("\n" + "=" * 74)
    print("SECOND TEST — does the market price the FINISH, or only the season average?")
    print("=" * 74)

    un = RO("nflverse_usage.db")
    keep, chg, last6 = [], [], []
    for i, r in enumerate(d):
        v = [x for (x,) in un.execute(
            """select cast(total_fantasy_points_exp as real) from ff_opportunity
               where dg_player_id=? and season=? and cast(week as int) between 1 and 18
               order by cast(week as int)""", (r["dg"], SEASON))]
        if len(v) < MIN_GAMES:
            continue
        first = sum(v[: len(v) // 2]) / len(v[: len(v) // 2])
        lst = sum(v[-6:]) / 6
        keep.append(i); chg.append(lst - first); last6.append(lst)
    keep = np.array(keep); chg = np.array(chg); last6 = np.array(last6)
    print(f"n={len(keep)} of {len(d)} carried the weekly split\n")

    print("is the finish just restating something already on the page?")
    print(f"  corr(role change, season role) = {np.corrcoef(chg, role[keep])[0,1]:+.3f}")
    print(f"  corr(role change, age)         = {np.corrcoef(chg, age[keep])[0,1]:+.3f}"
          f"   <- the confounder that killed two prior threads (DAVID.md 2026-07-22)")
    print(f"  corr(role change, fpoe)        = {np.corrcoef(chg, fpoe[keep])[0,1]:+.3f}")

    b2, r22 = ols(val[keep], [role[keep], chg[keep], age[keep], dwr[keep], dte[keep]],
                  ["seasonRole", "roleChange", "age", "is_WR", "is_TE"])
    print(f"\nlog(market value) ~ season role + role CHANGE + age + position   R2 = {r22:.3f}")
    for k, (bb, tt) in b2.items():
        print(f"  {k:11s} beta {bb:+.3f}   t {tt:+.2f}")
    print(f"\n  partial corr(market, role change | season role, age, pos)"
          f" = {partial(val[keep], chg[keep], [role[keep], age[keep], dwr[keep], dte[keep]]):+.3f}")

    # Matched pairs again, model-free: same position, same SEASON role — does the market
    # separate the player whose role grew from the one whose role shrank?
    o = np.argsort(role[keep])
    pr = [(o[i], o[i + 1]) for i in range(0, len(o) - 1, 2)]
    pr = [(a, c) for a, c in pr
          if abs(role[keep][a] - role[keep][c]) < 0.5 and d[keep[a]]["pos"] == d[keep[c]]["pos"]]
    ag = sum(1 for a, c in pr if (chg[a] - chg[c]) * (val[keep][a] - val[keep][c]) > 0)
    print(f"\nmatched pairs, same position and same season role within 0.5 pts/g (n={len(pr)})")
    print(f"  the player who FINISHED higher is the more valuable one in {ag}/{len(pr)}"
          f" = {ag/len(pr):.0%}   (coin flip = 50%)")
    from scipy import stats
    print(f"  binomial two-sided p = {stats.binomtest(ag, len(pr), 0.5).pvalue:.3f}")

    return d


if __name__ == "__main__":
    main()


if __name__ == "__main__":
    main()
