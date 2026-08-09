#!/usr/bin/env python3
"""Generate data.js for proposal 018 — "The half that repeats".

Every number on the figure comes from here. Nothing is transcribed by hand, and every
population figure is recomputed on each run rather than carried in prose.

Absolute paths throughout: this script must never depend on the shell's working directory
(DAVID.md 2026-08-07 — a relative path in this lane wrote into the product repo).

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/proposals/018-what-repeats/build.py

Sources, all opened READ-ONLY:
  app/data/nflverse_usage.db        ff_opportunity — weekly expected + actual fantasy points
  app/data/model_forward_capture.db model lane, and the sleeper_id <-> dg_player_id bridge
  app/data/fc_forward_capture.db    market lane (FantasyCalc)
  app/data/playerprofiler.db        age, draft capital
  app/data/league_snapshots/*.json  roster ownership
"""

import glob
import json
import sqlite3
import numpy as np
from pathlib import Path

D = "/Users/davidleess/dynasty-genius-product/app/data"
OUT = Path("/Users/davidleess/frontend-studio/proposals/018-what-repeats/data.js")
RO = lambda p: sqlite3.connect(f"file:{D}/{p}?mode=ro", uri=True)
UN, FC, MC, PP = RO("nflverse_usage.db"), RO("fc_forward_capture.db"), \
    RO("model_forward_capture.db"), RO("playerprofiler.db")

SEASON, MIN_GAMES, POS = "2025", 10, ("RB", "WR", "TE")
STARTER_RANK = {"QB": 24, "RB": 24, "WR": 36, "TE": 12}   # 12-team superflex PPR
MIN_GAMES_FOR_CUT = 6


def season_totals(season):
    return {
        dg: dict(role=r, prod=p, fpoe=p - r, g=g, pos=pos, name=nm)
        for dg, pos, nm, g, r, p in UN.execute(
            """select dg_player_id, position, full_name, count(*),
                      sum(cast(total_fantasy_points_exp as real))/count(*),
                      sum(cast(total_fantasy_points as real))/count(*)
               from ff_opportunity where season=? and position in (?,?,?)
                 and cast(week as int) between 1 and 18 and dg_player_id!=''
               group by dg_player_id having count(*)>=?""",
            (season, *POS, MIN_GAMES))
    }


def repeatability():
    """The load-bearing population fact, recomputed every run across every season on disk."""
    seasons = [s for (s,) in UN.execute("select distinct season from ff_opportunity order by season")]
    tabs = {s: season_totals(s) for s in seasons}
    r0, r1, f0, f1 = [], [], [], []
    for a, b in zip(seasons, seasons[1:]):
        for p in sorted(set(tabs[a]) & set(tabs[b])):
            r0.append(tabs[a][p]["role"]); r1.append(tabs[b][p]["role"])
            f0.append(tabs[a][p]["fpoe"]); f1.append(tabs[b][p]["fpoe"])
    r0, r1, f0, f1 = map(np.array, (r0, r1, f0, f1))
    top, bot = f0 > np.percentile(f0, 80), f0 < np.percentile(f0, 20)
    return dict(
        seasons=[seasons[0], seasons[-1]], n=len(r0),
        roleR=round(float(np.corrcoef(r0, r1)[0, 1]), 3),
        effR=round(float(np.corrcoef(f0, f1)[0, 1]), 3),
        top=dict(n=int(top.sum()), was=round(float(f0[top].mean()), 2),
                 became=round(float(f1[top].mean()), 2),
                 shareFell=round(float(np.mean(f1[top] < f0[top])), 3)),
        bottom=dict(n=int(bot.sum()), was=round(float(f0[bot].mean()), 2),
                    became=round(float(f1[bot].mean()), 2),
                    shareRose=round(float(np.mean(f1[bot] > f0[bot])), 3)),
        # how much of a season's efficiency survives into the next one, as a shrink factor
        keep=round(float(np.polyfit(f0, f1, 1)[0]), 3),
        # Quintiles, so the mechanism can be DRAWN with five nameable bins rather than
        # 1,154 anonymous dots. A mark standing for one real entity must be able to name it
        # (CLAUDE.md principle 4); a mark standing for "the top fifth" can.
        quintiles=dict(
            role=_quintile_slopes(r0, r1),
            eff=_quintile_slopes(f0, f1),
        ),
    )


def _quintile_slopes(a, b):
    """Where each fifth of year N lands in year N+1, in the original unit."""
    cuts = np.percentile(a, [20, 40, 60, 80])
    out = []
    for i, (lo, hi) in enumerate(zip([-np.inf, *cuts], [*cuts, np.inf])):
        sel = (a >= lo) & (a < hi)
        out.append(dict(fifth=i + 1, n=int(sel.sum()),
                        was=round(float(a[sel].mean()), 2),
                        became=round(float(b[sel].mean()), 2)))
    return out


def starter_cuts():
    cuts = {}
    for pos, n in STARTER_RANK.items():
        vals = sorted((v for (v,) in UN.execute(
            """select sum(cast(total_fantasy_points_exp as real))/count(*)
               from ff_opportunity where season=? and position=?
                 and cast(week as int) between 1 and 18
               group by dg_player_id having count(*)>=?""",
            (SEASON, pos, MIN_GAMES_FOR_CUT))), reverse=True)
        cuts[pos] = round(vals[n - 1], 2)
    return cuts


def z(a):
    a = np.asarray(a, float)
    return (a - a.mean()) / a.std(ddof=0)


def main():
    fd = FC.execute("select max(snapshot_date) from fc_forward_capture_joinable").fetchone()[0]
    md = MC.execute("select max(capture_date) from model_forward_capture_joinable").fetchone()[0]

    bridge, dvs = {}, {}
    for dg, sid, d in MC.execute(
        """select dg_player_id, sleeper_id, dynasty_value_score
           from model_forward_capture_joinable where capture_date=?""", (md,)):
        if dg and sid:
            bridge[dg] = str(sid)
            dvs[str(sid)] = d
    market = {str(s): dict(val=float(v), prk=pr) for s, v, pr in FC.execute(
        """select sleeper_id, value, position_rank from fc_forward_capture_joinable
           where snapshot_date=?""", (fd,)) if s and v}
    ages = {}
    for dg, a, dy, dp in PP.execute(
        "select dg_player_id, age, draft_year, draft_pick from pp_player_season where season=?",
            (SEASON,)):
        if dg and str(a).strip():
            ages[dg] = (float(a), int(float(dy)) if str(dy).strip() else None,
                        int(float(dp)) if str(dp).strip() else None)

    tot = season_totals(SEASON)
    pop = [dict(dg=dg, sid=bridge[dg], **v, val=market[bridge[dg]]["val"], age=ages[dg][0])
           for dg, v in tot.items()
           if dg in bridge and bridge[dg] in market and dg in ages]

    # PARTIAL SEASONS. The population statistics need a stable sample, so they keep the
    # 10-game floor. His ROSTER does not get the same filter: on 017 the same threshold put
    # Tucker Kraft -- 8 games, the model's top-rated player on the roster -- in a block
    # captioned "no 2025 tape", which was simply false. A threshold chosen for a population
    # measurement must not silently become a claim about an individual.
    # Three tiers: full (>=10 games), partial (4-9, line is real, the season is not), none.
    partial = {
        dg: dict(role=r, prod=p, fpoe=p - r, g=g, pos=ps, name=nm)
        for dg, ps, nm, g, r, p in UN.execute(
            """select dg_player_id, position, full_name, count(*),
                      sum(cast(total_fantasy_points_exp as real))/count(*),
                      sum(cast(total_fantasy_points as real))/count(*)
               from ff_opportunity where season=? and position in (?,?,?)
                 and cast(week as int) between 1 and 18 and dg_player_id!=''
               group by dg_player_id having count(*) between 4 and ?""",
            (SEASON, *POS, MIN_GAMES - 1))}

    # What the market pays for a JOB — fitted on the whole population, so a player's
    # premium is a residual against the market's own behaviour, not against a guess.
    role = np.array([p["role"] for p in pop]); fpoe = np.array([p["fpoe"] for p in pop])
    age = np.array([p["age"] for p in pop]); val = np.log([p["val"] for p in pop])
    dwr = np.array([1.0 * (p["pos"] == "WR") for p in pop])
    dte = np.array([1.0 * (p["pos"] == "TE") for p in pop])
    X = np.column_stack([np.ones(len(pop)), z(role), z(age), dwr, dte])
    beta, *_ = np.linalg.lstsq(X, z(val), rcond=None)
    resid = z(val) - X @ beta
    Xf = np.column_stack([X, z(fpoe)])
    bf, *_ = np.linalg.lstsq(Xf, z(val), rcond=None)
    rf = z(val) - Xf @ bf
    se = np.sqrt(np.diag((rf @ rf / (len(pop) - Xf.shape[1])) * np.linalg.pinv(Xf.T @ Xf)))
    for i, p in enumerate(pop):
        p["premium"] = round(float(resid[i]), 3)

    # The premium again, in the unit the hobby actually speaks: RANK.
    # Both ranks are computed inside the SAME pool (this 203-player population, within
    # position) so they are comparable. Ranking a player's job against one pool and his
    # price against FantasyCalc's much larger one is the incomparable-pools error
    # (DAVID.md 2026-07-30) and would invent a gap out of the pool sizes alone.
    # Our model's lane belongs beside the market's on every surface (DAVID.md 2026-07-21,
    # restated after a miss). Ranked in the same pool as the other two.
    for p in pop:
        p["dvs"] = dvs.get(p["sid"])
    for pos_ in POS:
        grp = [p for p in pop if p["pos"] == pos_]
        for key, field in (("role", "jobRank"), ("val", "priceRank")):
            for r_, p in enumerate(sorted(grp, key=lambda x: -x[key]), start=1):
                p[field] = r_
        scored = [p for p in grp if p["dvs"] is not None]
        for r_, p in enumerate(sorted(scored, key=lambda x: -x["dvs"]), start=1):
            p["modelRank"] = r_
        for p in grp:
            p["poolSize"] = len(grp)
            p["modelPool"] = len(scored)
            p.setdefault("modelRank", None)   # unscored renders as missing, never as zero

    snap = json.load(open(sorted(glob.glob(f"{D}/league_snapshots/*.json"))[-1]))
    me = [r for r in snap["rosters"] if str(r["roster_id"]) == str(snap["david_roster_id"])][0]
    mine = {str(x) for x in me["players"]}
    names = {str(m["sleeper_player_id"]): m["player"] for m in snap["players"]}

    rep = repeatability()
    cuts = starter_cuts()

    # Where a conversion sits in the population — so "+1.84" is never read as "a lot"
    # without the reader being told what a lot is (DAVID.md 2026-07-15, grounding doctrine).
    all_fpoe = sorted(p["fpoe"] for p in pop)

    def fpoe_pctile(v):
        return round(sum(1 for x in all_fpoe if x < v) / len(all_fpoe), 3)

    def weeks_for(dg):
        return [dict(w=w, team=t, role=round(x, 2), prod=round(f, 2), tgt=round(tg or 0),
                     car=round(ru or 0))
                for w, t, x, f, tg, ru in UN.execute(
                    """select cast(week as int), posteam,
                              cast(total_fantasy_points_exp as real),
                              cast(total_fantasy_points as real),
                              cast(rec_attempt as real), cast(rush_attempt as real)
                       from ff_opportunity where dg_player_id=? and season=?
                         and cast(week as int) between 1 and 18 order by 1""", (dg, SEASON))]

    by_sid = {p["sid"]: p for p in pop}
    players = []
    for p in pop:
        if p["sid"] not in mine:
            continue
        meta_ = names.get(p["sid"], {})
        players.append(dict(
            tier="full", sleeperId=p["sid"], name=p["name"], pos=p["pos"],
            age=meta_.get("age", p["age"]), exp=meta_.get("years_exp"), team=meta_.get("team"),
            games=p["g"], role=round(p["role"], 2), prod=round(p["prod"], 2),
            fpoe=round(p["fpoe"], 2), fpoePctile=fpoe_pctile(p["fpoe"]),
            effNext=round(p["fpoe"] * rep["keep"], 2),
            starterCut=cuts.get(p["pos"]),
            mktValue=market[p["sid"]]["val"], mktPosRank=market[p["sid"]]["prk"],
            dvs=dvs.get(p["sid"]), premium=p["premium"], weeks=weeks_for(p["dg"]),
            jobRank=p["jobRank"], priceRank=p["priceRank"], poolSize=p["poolSize"],
            modelRank=p["modelRank"], modelPool=p["modelPool"]))

    for dg, v in partial.items():
        sid = bridge.get(dg)
        if not sid or sid not in mine or sid in {x["sleeperId"] for x in players}:
            continue
        meta_ = names.get(sid, {})
        players.append(dict(
            tier="partial", sleeperId=sid, name=v["name"], pos=v["pos"],
            age=meta_.get("age"), exp=meta_.get("years_exp"), team=meta_.get("team"),
            games=v["g"], role=round(v["role"], 2), prod=round(v["prod"], 2),
            fpoe=round(v["fpoe"], 2), fpoePctile=None, effNext=None,
            starterCut=cuts.get(v["pos"]),
            mktValue=market.get(sid, {}).get("val"), mktPosRank=market.get(sid, {}).get("prk"),
            dvs=dvs.get(sid), premium=None, weeks=weeks_for(dg),
            jobRank=None, priceRank=None, poolSize=None, modelRank=None, modelPool=None))

    # Only now, after both tiers are placed, is "no tape" a true statement about a player.
    seen = {x["sleeperId"] for x in players}
    noTape = [dict(sleeperId=s, name=names[s]["full_name"], pos=names[s]["position"],
                   age=names[s].get("age"), exp=names[s].get("years_exp"),
                   mktValue=market.get(s, {}).get("val"))
              for s in sorted(mine)
              if s in names and names[s]["position"] in POS and s not in seen]

    meta = dict(
        season=int(SEASON), marketCapture=fd, modelCapture=md, snapshot=snap["captured_at"],
        minGames=MIN_GAMES, positions=list(POS), starterCuts=cuts,
        populationN=len(pop), repeatability=rep,
        premiumBeta=round(float(bf[-1]), 3), premiumT=round(float(bf[-1] / se[-1]), 2),
        scoring="PPR, verified by magnitude against known 2025 totals",
    )
    OUT.write_text(
        "// GENERATED by proposals/018-what-repeats/build.py — do not hand-edit.\n"
        f"export const META = {json.dumps(meta, indent=1)};\n"
        f"export const PLAYERS = {json.dumps(sorted(players, key=lambda x: -x['fpoe']), indent=1)};\n"
        f"export const NO_TAPE = {json.dumps(noTape, indent=1)};\n")
    print(f"wrote {OUT}\n  {len(players)} with tape, {len(noTape)} without, population {len(pop)}")
    print(json.dumps(meta, indent=1))


if __name__ == "__main__":
    main()
