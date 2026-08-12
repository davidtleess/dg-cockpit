#!/usr/bin/env python3
"""Generate data.js for 020 — "When can I believe it".

Replays David's own 2025 roster week by week, so the surface can be read as it would have
read live rather than as the finished archive every other surface in this lane shows.

Every gate in here is a measured number, not a chosen one.  The reliability thresholds
come from `tools/how-many-routes-until-real.py` and the movement figures from
`tools/replay-his-2025.py` and `tools/survivorship-check.py`; nothing is transcribed by
hand except the published bars, which are cited to `craft/how-the-hobby-speaks.md`.

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/proposals/020-when-can-i-believe-it/build.py
"""

import glob
import json
import sqlite3
from collections import defaultdict

D = "/Users/davidleess/dynasty-genius-product/app/data"
OUT = "/Users/davidleess/frontend-studio/proposals/020-when-can-i-believe-it/data.js"

PP = sqlite3.connect(f"file:{D}/playerprofiler.db?mode=ro", uri=True)
MC = sqlite3.connect(f"file:{D}/model_forward_capture.db?mode=ro", uri=True)

SEASON = "2025"
LAST_REG = 18

# ── MEASURED GATES ───────────────────────────────────────────────────────────────────
# tools/how-many-routes-until-real.py, WR/TE 2020-2025, odd-vs-even split-half within the
# route window, Spearman-Brown corrected. Reliability at each threshold, in that output:
#   routes    150   180   240   300   400   500
#   YPRR     0.60  0.62  0.64  0.68  0.72  0.73
#   TPRR     0.71  0.73  0.77  0.80  0.83  0.85
# The hobby's published bar is 180 routes (Fantasy Footballers, via how-the-hobby-speaks).
# It measures 0.62 here — below 0.70 — so it is NOT used as a gate; it is drawn as the
# claim it is and the measured crossing is drawn beside it.
GATES = dict(tprr=150, yprr=400, published_yprr=180)

# tools/when-can-i-believe-it.py, reliability (A) by week, median across 2020-2025:
#   snap share    wk2 0.88   routes a game wk2 0.90   target share wk2 0.64 / wk3 0.75 / wk4 0.81
GAMES_FOR_ROLE = 2
GAMES_FOR_TARGET_SHARE = 3

# ── PUBLISHED BARS ───────────────────────────────────────────────────────────────────
# craft/how-the-hobby-speaks.md. Cited, not invented — the 2026-08-08 coined-word lesson.
BARS = dict(
    tprr=20.0,            # 92% of WR2-or-better finishers since 2006 cleared it
    tgtShare=20.0,        # >20% -> WR1/WR2 outcomes
    tgtShareThin=10.0,    # <10% rarely bankable
    fulltimeSnap=70.0,    # baseline for consistent production
    yprrDire=1.00,        # under 1.00 after two years is dire
    yprrMid=1.45,         # league median, measured in 019 across 2025 qualifiers
    bellcowSnap=70.0,     # 70-75%; only ~4 backs a season clear 75
    rb1Touches=20.0,      # 20+ a game is the weekly top-15 conversation
    qbFulltimeAtt=30.0,   # a full-time starter's volume
)


def num(v):
    if v in (None, ""):
        return 0.0
    try:
        return float(v)
    except ValueError:
        return 0.0


def roster():
    """Joined by ID. A name join lost Tre' Harris and Luther Burden III on 2026-08-09."""
    snap = json.load(open(sorted(glob.glob(f"{D}/league_snapshots/*.json"))[-1]))
    me = [r for r in snap["rosters"]
          if str(r["roster_id"]) == str(snap["david_roster_id"])][0]
    mine = {str(x) for x in me["players"]}
    bio = {str(m["sleeper_player_id"]): m["player"] for m in snap["players"]}
    md = MC.execute(
        "select max(capture_date) from model_forward_capture_joinable").fetchone()[0]
    out = {}
    for dg, sid in MC.execute(
            "select dg_player_id, sleeper_id from model_forward_capture_joinable "
            "where capture_date=?", (md,)):
        if dg and sid and str(sid) in mine:
            b = bio.get(str(sid), {})
            out[dg] = dict(sleeperId=str(sid), name=b.get("full_name") or b.get("name") or dg,
                           pos=b.get("position"), age=b.get("age"), exp=b.get("years_exp"),
                           team=b.get("team"))
    return out, mine, bio, snap["captured_at"]


def weekly(dgs):
    q = ("SELECT dg_player_id, CAST(week AS INT), routes_run, targets, receiving_yards, "
         "snap_share, target_share, total_touches, carries, snaps, fantasy_points, "
         "pass_attempts, passing_yards FROM pp_gamelog_week "
         "WHERE season=? AND CAST(week AS INT)<=? AND dg_player_id IS NOT NULL")
    rows = defaultdict(list)
    for r in PP.execute(q, (SEASON, LAST_REG)):
        if r[0] not in dgs:
            continue
        rows[r[0]].append(dict(
            wk=r[1], routes=num(r[2]), targets=num(r[3]), recyd=num(r[4]),
            snapshare=num(r[5]), tgtshare=num(r[6]), touches=num(r[7]),
            carries=num(r[8]), snaps=num(r[9]), fp=num(r[10]),
            att=num(r[11]), payd=num(r[12])))
    for k in rows:
        rows[k].sort(key=lambda g: g["wk"])
    return rows


def cumulative(games, upto):
    g = [x for x in games if x["wk"] <= upto]
    if not g:
        return None
    n = len(g)
    routes = sum(x["routes"] for x in g)
    snaps = sum(x["snaps"] for x in g)
    tg = sum(x["targets"] for x in g)
    return dict(
        games=n, weeks=upto, routes=routes, targets=tg,
        routesPg=routes / n,
        snapShare=(sum(x["snapshare"] * x["snaps"] for x in g) / snaps) if snaps else 0.0,
        tgtShare=(sum(x["tgtshare"] * x["routes"] for x in g) / routes) if routes else 0.0,
        tprr=(tg / routes * 100) if routes else None,
        yprr=(sum(x["recyd"] for x in g) / routes) if routes else None,
        touchesPg=sum(x["touches"] for x in g) / n,
        attPg=sum(x["att"] for x in g) / n,
        ppg=sum(x["fp"] for x in g) / n,
    )


# ── THE READ ─────────────────────────────────────────────────────────────────────────
# One sentence per player per week, generated from the same bar it names. Confirmed form
# (David, 2026-08-08, twice): a named player, real metrics in the hobby's units, and an
# interpretive clause that NAMES THE BAR it rests on. A clause whose number has not yet
# earned reliability is not deleted — it is stated with what it is still short of, which
# is craft principle 7 (absence renders as missing, never as zero) applied to confidence.

def clause(text, state, short=None):
    return dict(t=text, s=state, short=short)


def read_catcher(c, team):
    """state: 'firm' = measured reliable at this sample · 'thin' = number shown, sample
    named · 'wait' = not enough games for even the role reading."""
    out = []
    if c["games"] < GAMES_FOR_ROLE:
        out.append(clause(f"{c['games']} game on the books — too little to say anything, "
                          f"including about his role.", "wait"))
        return out

    # The role clause is written from the SHAPE of the role, not from one threshold, so
    # fourteen receivers do not produce fourteen copies of one sentence. 019's open
    # question 2 was that three of eleven reads sounded alike; this is the answer to it.
    s, rp = c["snapShare"], c["routesPg"]
    if s >= BARS["fulltimeSnap"] and rp >= 25:
        role = (f"Full-time: {rp:.0f} routes a game on {s:.0f}% of the snaps, past the 70% "
                f"snap bar.")
    elif s >= BARS["fulltimeSnap"]:
        role = (f"On the field for {s:.0f}% of the snaps but running only {rp:.0f} routes a "
                f"game — an in-line share of the job, not a receiving one.")
    elif s >= 45:
        role = (f"Rotational: {rp:.0f} routes a game on {s:.0f}% of the snaps, "
                f"{BARS['fulltimeSnap'] - s:.0f} points under the 70% full-time bar.")
    else:
        role = (f"A bit part: {rp:.0f} routes a game on {s:.0f}% of the snaps — barely half "
                f"the 70% bar a full-time receiver lives above.")
    out.append(clause(role, "firm"))

    if c["games"] >= GAMES_FOR_TARGET_SHARE:
        ts = c["tgtShare"]
        out.append(clause(
            f"{ts:.1f}% of {team}'s targets — "
            + ("past the 20% bar where WR1/WR2 seasons live." if ts >= BARS["tgtShare"]
               else "under 10%, which is rarely bankable." if ts < BARS["tgtShareThin"]
               else "between the 10% floor and the 20% bar."),
            "firm"))
    else:
        out.append(clause(
            f"Target share {c['tgtShare']:.1f}% so far — over two games that is mostly which "
            f"games got played.", "thin",
            short=f"{GAMES_FOR_TARGET_SHARE - c['games']} more game"))

    r, tp, yp = c["routes"], c["tprr"], c["yprr"]
    if tp is not None:
        if r >= GATES["tprr"]:
            out.append(clause(
                f"{tp:.1f}% targets per route — "
                + ("clears the 20% bar that 92% of WR2-or-better finishers cleared."
                   if tp >= BARS["tprr"] else "under that 20% bar."),
                "firm"))
        else:
            out.append(clause(
                f"Targets per route reads {tp:.1f}%, on {r:.0f} routes.", "thin",
                short=f"{GATES['tprr'] - r:.0f} more routes"))
    if yp is not None:
        if r >= GATES["yprr"]:
            out.append(clause(
                f"{yp:.2f} yards per route — "
                + ("under 1.00, where analysts stop defending a receiver."
                   if yp < BARS["yprrDire"] else
                   f"above the {BARS['yprrMid']:.2f} league middle."
                   if yp >= BARS["yprrMid"] else
                   f"between the 1.00 floor and the {BARS['yprrMid']:.2f} league middle."),
                "firm"))
        else:
            out.append(clause(
                f"Yards per route reads {yp:.2f}, on {r:.0f} routes.", "thin",
                short=f"{GATES['yprr'] - r:.0f} more routes"))
    return out


def read_back(c):
    out = []
    if c["games"] < GAMES_FOR_ROLE:
        out.append(clause(f"{c['games']} game on the books — too little to say anything.",
                          "wait"))
        return out
    t = c["touchesPg"]
    out.append(clause(
        f"{t:.1f} touches a game on {c['snapShare']:.0f}% of the snaps — "
        + ("past both the 20-touch weekly marker and the 70% bell-cow snap line."
           if t >= BARS["rb1Touches"] and c["snapShare"] >= BARS["bellcowSnap"] else
           f"past the 20-touch weekly marker, {BARS['bellcowSnap'] - c['snapShare']:.0f} "
           f"points under the 70% bell-cow snap line."
           if t >= BARS["rb1Touches"] else
           f"on the bell-cow side of 70% snaps, under the 20-touch marker."
           if c["snapShare"] >= BARS["bellcowSnap"] else
           f"{BARS['rb1Touches'] - t:.1f} touches under the 20-a-game marker."),
        "firm"))
    out.append(clause(f"{c['routesPg']:.0f} routes a game — the passing-down half of the "
                      f"job, which is what separates a two-down back from an every-down one.",
                      "firm"))
    return out


def read_qb(c):
    out = []
    if c["games"] < GAMES_FOR_ROLE:
        out.append(clause(f"{c['games']} game on the books — too little to say anything.",
                          "wait"))
        return out
    a = c["attPg"]
    out.append(clause(
        f"{a:.0f} pass attempts a game across {c['games']} games — "
        + ("a full-time starter's volume, past the 30-attempt line."
           if a >= BARS["qbFulltimeAtt"] else
           f"{BARS['qbFulltimeAtt'] - a:.0f} under the 30-attempt line a full-time starter "
           f"runs at."),
        "firm"))
    return out


def main():
    ros, mine, bio, captured = roster()
    wk = weekly(set(ros))

    players, absent = [], []
    for dg, p in sorted(ros.items(), key=lambda kv: kv[1]["name"]):
        games = wk.get(dg)
        if not games:
            absent.append(dict(name=p["name"], pos=p["pos"], sleeperId=p["sleeperId"],
                               age=p["age"], exp=p["exp"]))
            continue
        pos = p["pos"]
        grp = "QB" if pos == "QB" else "RB" if pos == "RB" else "REC"
        cuts = []
        prev = None
        for w in range(1, LAST_REG + 1):
            c = cumulative(games, w)
            if c is None:
                cuts.append(None)
                continue
            role = (c["attPg"] if grp == "QB" else
                    c["touchesPg"] if grp == "RB" else c["routesPg"])
            c["role"] = role
            c["roleDelta"] = (role - prev) if prev is not None else None
            c["played"] = any(g["wk"] == w for g in games)
            c["reads"] = (read_qb(c) if grp == "QB" else
                          read_back(c) if grp == "RB" else read_catcher(c, p["team"] or "his team"))
            cuts.append({k: (round(v, 3) if isinstance(v, float) else v)
                         for k, v in c.items()})
            prev = role
        players.append(dict(
            id=dg, sleeperId=p["sleeperId"], name=p["name"], pos=pos, grp=grp,
            team=p["team"], age=p["age"], exp=p["exp"],
            lastWeek=max(g["wk"] for g in games), gamesTotal=len(games), cuts=cuts))

    meta = dict(
        season=SEASON, lastReg=LAST_REG, snapshot=captured, rostered=len(mine),
        resolved=len(ros), withTape=len(players), gates=GATES, bars=BARS,
        gamesForRole=GAMES_FOR_ROLE, gamesForTargetShare=GAMES_FOR_TARGET_SHARE,
        # every figure below is printed by the named tool; none is typed by hand
        reliability=dict(
            routeCurve=[[30, 0.29, 0.40], [60, 0.40, 0.55], [90, 0.46, 0.63],
                        [120, 0.53, 0.67], [150, 0.60, 0.71], [180, 0.62, 0.73],
                        [240, 0.64, 0.77], [300, 0.68, 0.80], [400, 0.72, 0.83],
                        [500, 0.73, 0.85]],
            source="tools/how-many-routes-until-real.py"),
        movement=dict(gone=0.22, movedOver40=0.41, rhoWk3=0.45,
                      source="tools/survivorship-check.py + tools/does-youth-move-more.py"),
        dispersion=dict(acrossSd=7.31, withinSd=8.08,
                        source="within-vs-across dispersion, WR/TE 2020-2025"),
    )

    with open(OUT, "w") as f:
        f.write("// generated by build.py — do not edit\n")
        f.write(f"export const META = {json.dumps(meta, indent=1)};\n")
        f.write(f"export const PLAYERS = {json.dumps(players, indent=1)};\n")
        f.write(f"export const ABSENT = {json.dumps(absent, indent=1)};\n")

    grp_counts = defaultdict(int)
    for p in players:
        grp_counts[p["grp"]] += 1
    print(f"wrote {OUT}")
    print(f"  {len(mine)} rostered · {len(ros)} resolved to a model id · "
          f"{len(players)} with {SEASON} tape · {len(absent)} without")
    print(f"  groups: " + " · ".join(f"{k} {v}" for k, v in sorted(grp_counts.items())))


if __name__ == "__main__":
    main()
