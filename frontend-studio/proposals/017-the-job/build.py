#!/usr/bin/env python3
"""Generate data.js for proposal 017 — "The job, not the season".

Run from the product repo root (READ-ONLY against it; writes only into the studio):
    cd ~/dynasty-genius-product && python3 ~/frontend-studio/proposals/017-the-job/build.py

Every number on the prototype comes from here. Nothing is transcribed by hand.

Sources, all opened read-only:
  app/data/nflverse_usage.db        ff_opportunity  — weekly expected fantasy points (PPR)
  app/data/model_forward_capture.db model lane      — DVS + the sleeper_id <-> dg_player_id bridge
  app/data/fc_forward_capture.db    market lane     — FantasyCalc value / position rank
  app/data/league_snapshots/*.json  roster ownership (roster_id 1 == David)

Scoring: ff_opportunity ships PPR. Verified by magnitude against known 2025 totals
(Amon-Ra St. Brown 117 rec / 324.0 FP; subtracting receptions lands on the standard
total). His league is 12-team superflex PPR, so the unit matches without conversion.
"""

import glob
import json
import sqlite3
import statistics as st
from pathlib import Path

OUT = Path(__file__).with_name("data.js")

# A "weekly starter's role" = the Nth-best player at the position by expected points
# per game, N chosen for a 12-team superflex PPR league. Computed from the FULL
# nflverse population each run, never hardcoded.
CUT_RANK = {"QB": 24, "RB": 24, "WR": 36, "TE": 12}
MIN_GAMES_FOR_CUT = 6
MIN_GAMES_FOR_TRAJECTORY = 10
TAIL = 6  # "how he finished" = last six games played

un = sqlite3.connect("file:app/data/nflverse_usage.db?mode=ro", uri=True)
mc = sqlite3.connect("file:app/data/model_forward_capture.db?mode=ro", uri=True)
fc = sqlite3.connect("file:app/data/fc_forward_capture.db?mode=ro", uri=True)


def starter_cuts():
    cuts = {}
    for pos, n in CUT_RANK.items():
        vals = [
            v
            for (v,) in un.execute(
                """select sum(cast(total_fantasy_points_exp as real))/count(*) r
                   from ff_opportunity
                   where season='2025' and position=? and cast(week as int) between 1 and 18
                   group by dg_player_id having count(*)>=? order by r desc""",
                (pos, MIN_GAMES_FOR_CUT),
            )
        ]
        cuts[pos] = round(vals[n - 1], 2)
    return cuts


def weekly(dg):
    """(week, team, expected pts, actual pts, targets, carries, air yards).

    The last three are what the expected number is MADE of — carried so the surface can
    show the arithmetic rather than assert an abstraction. David, 2026-08-07: "what are
    the numbers? targets?"
    """
    return un.execute(
        """select cast(week as int), posteam,
                  cast(total_fantasy_points_exp as real), cast(total_fantasy_points as real),
                  cast(rec_attempt as real), cast(rush_attempt as real), cast(rec_air_yards as real)
           from ff_opportunity
           where dg_player_id=? and season='2025' and cast(week as int) between 1 and 18
           order by 1""",
        (dg,),
    ).fetchall()


def split(vals):
    """Role at the start of the year vs how it finished. First half vs last six played."""
    return sum(vals[: len(vals) // 2]) / len(vals[: len(vals) // 2]), sum(vals[-TAIL:]) / TAIL


def population_role_change():
    """Every skill player with >=10 games in 2025 — the baseline any roster claim is measured against."""
    out = []
    for (dg,) in un.execute(
        """select dg_player_id from ff_opportunity
           where season='2025' and position in ('QB','RB','WR','TE')
             and cast(week as int) between 1 and 18 and dg_player_id!=''
           group by dg_player_id having count(*)>=?""",
        (MIN_GAMES_FOR_TRAJECTORY,),
    ):
        v = [r[2] for r in weekly(dg)]
        first, last = split(v)
        out.append(last - first)
    return sorted(out)


def main():
    cuts = starter_cuts()
    popd = population_role_change()

    def pctile(v):
        return sum(1 for x in popd if x < v) / len(popd)

    md = mc.execute("select max(capture_date) from model_forward_capture_joinable").fetchone()[0]
    fd = fc.execute("select max(snapshot_date) from fc_forward_capture_joinable").fetchone()[0]
    model = {
        str(s): dict(dg=dg, dvs=dvs)
        for s, dg, dvs in mc.execute(
            "select sleeper_id,dg_player_id,dynasty_value_score from model_forward_capture_joinable where capture_date=?",
            (md,),
        )
        if s
    }
    mkt = {
        str(s): dict(val=v, prk=pr, t30=t)
        for s, v, pr, t in fc.execute(
            "select sleeper_id,value,position_rank,trend_30day from fc_forward_capture_joinable where snapshot_date=?",
            (fd,),
        )
        if s
    }

    snap = json.load(open(sorted(glob.glob("app/data/league_snapshots/*.json"))[-1]))
    roster = [x for x in snap["rosters"] if str(x["roster_id"]) == str(snap["david_roster_id"])][0]
    ids = {str(p) for p in roster["players"]}
    mine = {str(m["sleeper_player_id"]): m["player"] for m in snap["players"] if str(m["sleeper_player_id"]) in ids}

    players = []
    for sid, p in mine.items():
        m, k = model.get(sid), mkt.get(sid)
        rows = weekly(m["dg"]) if m and m["dg"] else []
        rec = dict(
            sleeperId=sid, name=p["full_name"], pos=p["position"], team=p["team"],
            age=p["age"], exp=p["years_exp"],
            dvs=(m or {}).get("dvs"), mktValue=(k or {}).get("val"),
            mktPosRank=(k or {}).get("prk"), mktTrend30=(k or {}).get("t30"),
            starterCut=cuts.get(p["position"]),
            weeks=[dict(w=w, team=t, role=round(x, 2), prod=round(f, 2),
                        tgt=round(tg or 0), car=round(ru or 0), air=round(ay or 0))
                   for w, t, x, f, tg, ru, ay in rows],
        )
        if len(rows) >= MIN_GAMES_FOR_TRAJECTORY:
            v = [r[2] for r in rows]
            first, last = split(v)
            rec.update(
                roleFirst=round(first, 2), roleLast6=round(last, 2),
                roleChange=round(last - first, 2), roleChangePctile=round(pctile(last - first), 3),
                roleSeason=round(sum(v) / len(v), 2),
                prodSeason=round(sum(r[3] for r in rows) / len(rows), 2),
                fpoe=round(sum(r[3] for r in rows) - sum(v), 1),
                teams2025=sorted({r[1] for r in rows}),
            )
            if len(rec["teams2025"]) > 1:
                rec["byTeam"] = {
                    t: dict(
                        g=len([1 for r in rows if r[1] == t]),
                        role=round(
                            sum(r[2] for r in rows if r[1] == t)
                            / len([1 for r in rows if r[1] == t]), 2,
                        ),
                        weeks=[r[0] for r in rows if r[1] == t],
                    )
                    for t in rec["teams2025"]
                }
        players.append(rec)

    # median role by position — used to justify keeping QBs off a shared scale.
    medians = {}
    for pos in CUT_RANK:
        vals = [
            v
            for (v,) in un.execute(
                """select sum(cast(total_fantasy_points_exp as real))/count(*)
                   from ff_opportunity
                   where season='2025' and position=? and cast(week as int) between 1 and 18
                   group by dg_player_id having count(*)>=?""",
                (pos, MIN_GAMES_FOR_CUT),
            )
        ]
        medians[pos] = round(st.median(vals), 2)

    # A named comparable sitting AT each starter cut. David's grounding doctrine
    # (2026-07-15): a tier must carry names that make it concrete. "11.3 points" means
    # nothing on its own; "the role Alec Pierce had" is a thing he can picture.
    anchors = {}
    for pos, cut in cuts.items():
        rows_ = un.execute(
            """select full_name,
                      sum(cast(total_fantasy_points_exp as real))/count(*) r,
                      sum(cast(rec_attempt as real)+cast(rush_attempt as real))/count(*) t
               from ff_opportunity
               where season='2025' and position=? and cast(week as int) between 1 and 18
               group by dg_player_id, full_name having count(*)>=10""",
            (pos,),
        ).fetchall()
        n, r, t = min(rows_, key=lambda x: abs(x[1] - cut))
        anchors[pos] = dict(name=n, role=round(r, 2), touches=round(t, 1))

    meta = dict(
        season=2025, modelCapture=md, marketCapture=fd, snapshot=snap["captured_at"],
        scoring="PPR (verified by magnitude against known 2025 totals)",
        starterCuts=cuts, starterCutRanks=CUT_RANK, medianRole=medians, starterAnchor=anchors, tailGames=TAIL,
        minGamesForTrajectory=MIN_GAMES_FOR_TRAJECTORY,
        populationN=len(popd),
        populationRoleChange=dict(
            p10=round(popd[int(0.10 * len(popd))], 2), median=round(st.median(popd), 2),
            p75=round(popd[int(0.75 * len(popd))], 2), p90=round(popd[int(0.90 * len(popd))], 2),
            max=round(popd[-1], 2),
        ),
    )
    OUT.write_text(
        "// GENERATED by proposals/017-the-job/build.py — do not hand-edit.\n"
        f"export const META = {json.dumps(meta, indent=1)};\n"
        f"export const PLAYERS = {json.dumps(players, indent=1)};\n"
    )
    print(f"wrote {OUT}  ({len(players)} players, population n={len(popd)})")
    print(json.dumps(meta, indent=1))


if __name__ == "__main__":
    main()
