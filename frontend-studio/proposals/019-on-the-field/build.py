#!/usr/bin/env python3
"""Generate data.js for 019 — "Your roster on the field".

Every metric is in the units the hobby actually uses (craft/how-the-hobby-speaks.md), and
every READ is generated here from a published bar rather than written by hand — David,
2026-08-08, endorsed the interpretive clause twice, and the clause is only trustworthy if
it is computed from the same threshold it names.

Two rules the generation obeys, both learned the hard way today:
  1. A read must NAME the bar it rests on. "past the 280-touch marker", "under the 1.00
     mark analysts stop defending at" — the four clauses David picked all do this.
  2. No categorical noun on a continuous quantity without a near-miss band. A 20.0-touch
     cutoff called Ashton Jeanty a committee back at 19.9; a 25% cutoff called Rome Odunze
     nothing at 23.6%. Anything within 10% of a bar reads as "just under", never as the
     opposite category.

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/proposals/019-on-the-field/build.py
"""

import glob
import json
import sqlite3
import statistics as st
from pathlib import Path

D = "/Users/davidleess/dynasty-genius-product/app/data"
OUT = Path("/Users/davidleess/frontend-studio/proposals/019-on-the-field/data.js")
RO = lambda p: sqlite3.connect(f"file:{D}/{p}?mode=ro", uri=True)
PP, MC, FC = RO("playerprofiler.db"), RO("model_forward_capture.db"), RO("fc_forward_capture.db")

SEASON = "2025"
UN = RO("nflverse_usage.db")
MIN_ROUTES = 180        # YPRR stabilises here (Fantasy Footballers)
BARS = dict(
    tprr=20.0,          # 92% of WR2-or-better finishers since 2006 cleared it
    alphaTargetShare=25.0,   # ~26% sustained = high-end WR2 / low-end WR1
    fulltimeSnap=70.0,       # baseline for consistent production
    parttimeSnap=55.0,
    yprrDire=1.00,           # under 1.00 after two years is dire
    bellcowSnap=70.0,        # 70-75%; only ~4 backs a season clear 75
    rb1Touches=280,          # appeared in 8 of 12 RB1 seasons
    workhorseTouchesPerGame=20,
)
NEAR = 0.10             # within 10% of a bar is "just under", never the far side


def weekly(pos_in):
    q = ",".join("?" * len(pos_in))
    return PP.execute(
        f"""select dg_player_id, name, position, count(*),
                   sum(cast(nullif(trim(routes_run),'') as real)),
                   sum(cast(nullif(trim(targets),'') as real)),
                   sum(cast(nullif(trim(receiving_yards),'') as real)),
                   avg(cast(nullif(trim(target_share),'') as real)),
                   avg(cast(nullif(trim(snap_share),'') as real)),
                   sum(cast(nullif(trim(total_touches),'') as real))
            from pp_gamelog_week
            where season=? and cast(week as int) between 1 and 18 and dg_player_id!=''
              and position in ({q})
            group by dg_player_id, name, position""", (SEASON, *pos_in)).fetchall()


def team_target_leaders():
    """team -> (leading target share, second-highest). "Alpha" is being the clear No.1 in
    your own offence, which is how the word is actually used — not clearing a fixed %."""
    by_team = {}
    for team, name, tshare in PP.execute(
        """select team, name, avg(cast(nullif(trim(target_share),'') as real))
           from pp_gamelog_week
           where season=? and cast(week as int) between 1 and 18 and position in ('WR','TE')
             and team is not null and trim(team)!=''
           group by team, name""", (SEASON,)):
        if tshare:
            by_team.setdefault(team, []).append((tshare, name))
    return {t: sorted(v, reverse=True) for t, v in by_team.items()}


def read_for_catcher(name, routes, tprr, yprr, tshare, snap, stable, pct, alpha_rank,
                     games=None):
    """Returns (kind, read). kind drives how much MASS the row gets, and it is earned by a
    named bar — so on a roster where nobody clears one, nothing is drawn large."""
    near = lambda v, bar: abs(v - bar) / bar <= NEAR
    if yprr >= pct["p75"] and snap < BARS["parttimeSnap"]:
        return "headline", (f"Elite per-route production in a part-time role — {yprr:.2f} yards "
                            f"per route on {snap:.0f}% of the snaps.")
    if alpha_rank == 1 and tshare >= BARS["tprr"]:
        # Verified against the team board before this sentence was allowed to exist: Odunze
        # does lead Chicago (23.6% to DJ Moore's 16.2%), which is why the literature's flat
        # 25% bar was the wrong test and David's "alpha" was the right word.
        # keyed off GAMES, not route stability: Wilson clears the 180-route floor
        # (225 routes) while having played only 7 games, so the routes test was blind
        # to exactly the caveat a target-share claim needs.
        games_note = f" On {games} games." if (games or 99) < 10 else ""
        return "headline", (f"The alpha in that offence — the No.1 target share on his own team "
                            f"at {tshare:.1f}%, on {snap:.0f}% of snaps.{games_note}")
    if stable and yprr < BARS["yprrDire"]:
        return "headline", (f"{yprr:.2f} yards per route over {int(routes)} routes — under the "
                            f"1.00 mark where analysts stop defending a receiver.")
    if snap >= BARS["fulltimeSnap"] and stable and yprr < pct["p25"]:
        return "headline", (f"Full-time at {snap:.0f}% of snaps and bottom-quarter per route — "
                            f"the role is there, the production is not.")
    if yprr >= pct["p75"] and stable:
        return "headline", (f"Top-quarter per-route production — {yprr:.2f} yards per route over "
                            f"{int(routes)} routes.")
    # Everyone else still gets a READ, not a shrug. It names its bars the same way.
    full = snap >= BARS["fulltimeSnap"]
    clears = tprr >= BARS["tprr"]
    justunder = not clears and near(tprr, BARS["tprr"])
    good = yprr >= pct["median"]
    tail = "" if stable else f" Only {int(routes)} routes — too few for the rate to settle."
    if full and not clears and not good:
        r = (f"The snaps without the targets — on the field for {snap:.0f}% of them, but "
             f"{'just under' if justunder else 'under'} the 20% per-route bar at {tprr:.1f}% "
             f"and {yprr:.2f} yards a route.")
    elif full and (clears or good):
        r = (f"A real full-time role at {snap:.0f}% of snaps, "
             f"{'clearing' if clears else 'just under'} the 20% per-route bar at {tprr:.1f}%, "
             f"{yprr:.2f} yards a route.")
    elif not full and clears:
        r = (f"A small role he is earning — {snap:.0f}% of snaps, but past the 20% per-route "
             f"bar at {tprr:.1f}% and {yprr:.2f} yards a route.")
    elif justunder:
        r = (f"On the edge of it — {snap:.0f}% of snaps and {tprr:.1f}% per route, a whisker "
             f"under the 20% bar, at {yprr:.2f} yards a route.")
    else:
        r = (f"Neither the role nor the rate yet — {snap:.0f}% of snaps, {tprr:.1f}% per route "
             f"against a 20% bar, {yprr:.2f} yards a route.")
    return "positioned", r + tail


def read_for_back(name, g, touches, snap, routes):
    near = lambda v, bar: abs(v - bar) / bar <= NEAR
    tpg = touches / max(g, 1)
    if snap >= BARS["bellcowSnap"] and touches >= BARS["rb1Touches"]:
        return "headline", (f"A bell cow — {int(touches)} touches on a {snap:.0f}% snap share, "
                            f"past the 280-touch marker that showed up in 8 of 12 RB1 seasons.")
    if touches >= BARS["rb1Touches"] or near(snap, BARS["bellcowSnap"]) and tpg >= 15:
        return "headline", (f"{int(touches)} touches at a {snap:.0f}% snap share — just under the "
                            f"70–75% bell-cow line, with the workload of one.")
    if tpg >= 10:
        return "positioned", (f"A committee back — {tpg:.1f} touches a game on {snap:.0f}% of "
                              f"snaps, short of the 20-a-game workhorse line."
                              + (f" {int(routes)} routes, so real pass work." if routes >= 200 else ""))
    return "positioned", (f"Rotational — {int(touches)} touches across {g} games on {snap:.0f}% "
                          f"of snaps." + (f" Only {g} games, so the rate means little."
                                          if g < 8 else ""))


# ── THE EXPANSION ─────────────────────────────────────────────────────────────────────
# PlayerProfiler's spine — Opportunity / Productivity / Efficiency — plus the dynasty
# profile. Each metric ships a raw value and a PERCENTILE WITHIN POSITION. Deliberately
# NOT a rank as well: David, 2026-07-22, rejected the version carrying a percentile number
# AND a rank AND a bar — "a value gets one visual and one number, never two numbers for the
# same thing". So the bar is the population context and the number is the football value.
DESCRIPTIVE = {"slot_rate", "average_target_distance"}   # no good direction; no ladder

SEASON_FIELDS = {
    "WR": [("routeParticipation", "route_participation", "route participation", "%", 1),
           ("slotRate",        "slot_rate",               "slot rate",            "%", 1),
           ("aDOT",            "average_target_distance", "average target depth", " yd", 1),
           ("airYardsShare",   "air_yards_share",         "air yards share",      "%", 1),
           ("rzTargets",       "red_zone_targets",        "red zone targets",     "",  0),
           ("rzTargetShare",   "red_zone_target_share",   "red zone target share","%", 1),
           ("yardsPerTarget",  "yards_per_target",        "yards per target",     "",  1),
           ("targetSeparation","target_separation",       "target separation",    " yd",1),
           ("catchRate",       "catch_rate",              "catch rate",           "%", 1),
           ("productionPremium","production_premium",     "production premium",   "",  1)],
    "RB": [("snapShareS",      "snap_share",              "snap share",           "%", 1),
           ("rzCarries",       "red_zone_carries",        "red zone carries",     "",  0),
           ("goalLine",        "goal_line_carries",       "goal line carries",    "",  0),
           ("ypc",             "yards_per_carry",         "yards per carry",      "",  2),
           ("evaded",          "evaded_tackles",          "evaded tackles",       "",  0),
           ("targetsRB",       "targets",                 "targets",              "",  0),
           ("yprrRB",          "yards_per_route_run",      "yards per route",     "",  2)],
}
SEASON_FIELDS["TE"] = SEASON_FIELDS["WR"]
PROFILE = [("draftPick", "draft_pick"), ("breakoutAge", "breakout_age"),
           ("collegeDominator", "college_dominator_rating"), ("speedScore", "speed_score"),
           ("heightIn", "height_in"), ("weightLb", "weight_lb"), ("college", "college"),
           ("comparable", "best_comparable_players")]


def num(v):
    try:
        f = float(v)
        return f
    except (TypeError, ValueError):
        return None


def qualifying_ids():
    """Players with a real 2025 sample. Without this the ladder reads elite catch rate = 100%,
    set by someone with two targets."""
    ok = set()
    for dg, routes, touches in PP.execute(
        """select dg_player_id, sum(cast(nullif(trim(routes_run),'') as real)),
                  sum(cast(nullif(trim(total_touches),'') as real))
           from pp_gamelog_week where season=? and cast(week as int) between 1 and 18
             and dg_player_id!='' group by dg_player_id""", (SEASON,)):
        if (routes or 0) >= MIN_ROUTES or (touches or 0) >= 100:
            ok.add(dg)
    return ok


def season_field_pool():
    """Raw values for every player, so a percentile has a population.

    Built as ONE pool over the UNION of every position's columns. The first version built a
    WR pool and an RB pool, each selecting all players, and dict.update() then overwrote
    every WR entry with the RB column set — so all fourteen receivers silently shipped with
    zero metrics while the profile and weekly blocks looked fine."""
    cols = {c for spec in SEASON_FIELDS.values() for _, c, _, _, _ in spec}
    q = ",".join(f'"{c}"' for c in cols)
    out = {}
    qual = qualifying_ids()
    for row in PP.execute(
        f"""select dg_player_id, position, {q} from pp_player_season
            where season=? and dg_player_id!=''""", (SEASON,)):
        dg, pos = row[0], row[1]
        if dg not in qual:
            continue
        out[dg] = dict(pos=pos, **{c: num(v) for c, v in zip(cols, row[2:])})
    return out


# The dozen-based ladder the hobby speaks (proposals/001): twelve-team buckets, "elite" for
# the top of bucket one, and the starter line at THIS league's own cut — WR36 / RB24 / TE12,
# the same cuts used for the starter bars elsewhere on the surface.
# Labelled as what it literally is ("a top-12 number at the position"), never as a claim that
# a good separation number makes a man a WR1.
LADDER_RANKS = {"WR": [("elite", 12), ("top 24", 24), ("starter line", 36)],
                "TE": [("elite", 12), ("starter line", 12)],
                "RB": [("elite", 12), ("starter line", 24)]}


def ladder(values, pos):
    """The raw value sitting at each rung, higher-is-better assumed."""
    v = sorted(values, reverse=True)
    out = []
    for label, n in LADDER_RANKS.get(pos, []):
        if len(v) >= n:
            out.append(dict(label=label, rank=n, value=round(v[n - 1], 2)))
    # de-duplicate rungs that land on the same number (TE elite == TE starter line)
    seen, keep = set(), []
    for r in out:
        if r["value"] in seen:
            continue
        seen.add(r["value"]); keep.append(r)
    return keep


def pctile(values, v):
    if v is None or not values:
        return None
    return round(sum(1 for x in values if x < v) / len(values), 3)


def build_expansions(players, pool):
    """Attach the expansion to each player: opportunity/efficiency metrics with population
    percentiles, the weekly share lines, and the dynasty profile."""
    # population per position, only players with a real sample
    by_pos = {}
    for dg, rec in pool.items():
        by_pos.setdefault(rec["pos"], []).append(rec)

    prof = {}
    q2 = ",".join(f'"{c}"' for _, c in PROFILE)
    for row in PP.execute(
        f"""select dg_player_id, {q2} from pp_player_season where season=? and dg_player_id!=''""",
            (SEASON,)):
        prof[row[0]] = dict(zip([k for k, _ in PROFILE], row[1:]))

    for p in players:
        dg = p.pop("_dg", None)
        if not dg:
            continue
        spec = SEASON_FIELDS.get(p["pos"], [])
        rec = pool.get(dg, {})
        peers = [r for r in by_pos.get(p["pos"], []) if r]
        metrics = []
        for key, col, label, unit, dp in spec:
            v = rec.get(col)
            if v is None:
                continue
            vals = [r[col] for r in peers if r.get(col) is not None]
            desc = col in DESCRIPTIVE
            rungs = [] if desc else ladder(vals, p["pos"])
            metrics.append(dict(key=key, label=label, unit=unit, descriptive=desc,
                                value=round(v, dp) if dp else int(v),
                                pctile=None if desc else pctile(vals, v), n=len(vals),
                                median=round(st.median(vals), 2) if vals else None,
                                ladder=[dict(label=r["label"], value=r["value"],
                                             pctile=pctile(vals, r["value"])) for r in rungs]))
        pr = prof.get(dg, {})
        comp = pr.get("comparable") or ""
        # PlayerProfiler repeats names in this field ("Jeremy Maclin, Jeremy Maclin").
        seen_c, comps = set(), []
        for c in [x.strip() for x in str(comp).split(",") if x.strip()]:
            if c.lower() not in seen_c:
                seen_c.add(c.lower()); comps.append(c)
        p["expansion"] = dict(
            metrics=metrics,
            profile=dict(draftPick=pr.get("draftPick") or None,
                         breakoutAge=num(pr.get("breakoutAge")),
                         collegeDominator=num(pr.get("collegeDominator")),
                         speedScore=num(pr.get("speedScore")),
                         heightIn=num(pr.get("heightIn")), weightLb=num(pr.get("weightLb")),
                         college=pr.get("college") or None,
                         comparables=comps[:3]),
            weekly=[dict(w=int(w), snap=num(sn), tgt=num(ts))
                    for w, sn, ts in PP.execute(
                        """select week, snap_share, target_share from pp_gamelog_week
                           where season=? and dg_player_id=? and cast(week as int) between 1 and 18
                           order by cast(week as int)""", (SEASON, dg))])


def main():
    md = MC.execute("select max(capture_date) from model_forward_capture_joinable").fetchone()[0]
    fd = FC.execute("select max(snapshot_date) from fc_forward_capture_joinable").fetchone()[0]
    br, dvs = {}, {}
    for dg, sid, d in MC.execute(
        """select dg_player_id, sleeper_id, dynasty_value_score
           from model_forward_capture_joinable where capture_date=?""", (md,)):
        if dg and sid:
            br[dg] = str(sid); dvs[str(sid)] = d
    mkt = {str(s): dict(val=float(v), rank=r) for s, v, r in FC.execute(
        """select sleeper_id, value, position_rank from fc_forward_capture_joinable
           where snapshot_date=?""", (fd,)) if s and v}

    snap_json = json.load(open(sorted(glob.glob(f"{D}/league_snapshots/*.json"))[-1]))
    me = [r for r in snap_json["rosters"]
          if str(r["roster_id"]) == str(snap_json["david_roster_id"])][0]
    mine = {str(x) for x in me["players"]}
    bio = {str(m["sleeper_player_id"]): m["player"] for m in snap_json["players"]}
    ours = {dg for dg, s in br.items() if s in mine}

    leaders = team_target_leaders()
    catchers = weekly(("WR", "TE"))
    yprrs = sorted((r[6] or 0) / r[4] for r in catchers if r[4] and r[4] >= MIN_ROUTES)
    pct = dict(n=len(yprrs), p25=yprrs[len(yprrs) // 4], median=st.median(yprrs),
               p75=yprrs[3 * len(yprrs) // 4])

    players, seen = [], set()
    for dg, name, pos, g, routes, tgt, ryds, tshare, snap, touches in catchers + weekly(("RB",)):
        if dg not in ours:
            continue
        sid = br[dg]; seen.add(sid); b = bio.get(sid, {})
        tshare, snap = tshare or 0, snap or 0
        rec = dict(_dg=dg, sleeperId=sid, name=name, pos=pos, team=b.get("team"), age=b.get("age"),
                   exp=b.get("years_exp"), games=g,
                   mktValue=mkt.get(sid, {}).get("val"), mktRank=mkt.get(sid, {}).get("rank"),
                   dvs=dvs.get(sid))
        if pos == "RB":
            rec.update(touches=int(touches or 0), touchesPerGame=round((touches or 0) / max(g, 1), 1),
                       snapShare=round(snap, 1), routes=int(routes or 0))
            rec["kind"], rec["read"] = read_for_back(name, g, touches or 0, snap, routes or 0)
        else:
            if not routes:
                continue
            yprr, tprr = (ryds or 0) / routes, (tgt or 0) / routes * 100
            rec.update(routes=int(routes), targets=int(tgt or 0), recYards=int(ryds or 0),
                       targetShare=round(tshare, 1), snapShare=round(snap, 1),
                       tprr=round(tprr, 1), yprr=round(yprr, 2),
                       stable=routes >= MIN_ROUTES)
            team_list = leaders.get(b.get("team"), [])
            rank = next((i + 1 for i, (_, n) in enumerate(team_list) if n == name), None)
            rec["teamTargetRank"] = rank
            rec["kind"], rec["read"] = read_for_catcher(
                name, routes, tprr, yprr, tshare, snap, routes >= MIN_ROUTES, pct, rank, g)
        players.append(rec)


    # ── THE LEAGUE POPULATION, for the roster map ────────────────────────────────────
    # David, 2026-08-09: show every receiver in the league, greyed if not mine, a different
    # shade if on waivers. Ownership is dimension 8 in the colour system and it gets
    # LIGHTNESS, never hue — which is exactly what he asked for.
    # HONEST LIMIT: the snapshot has league_context.rostered and a roster_id, and NO waiver
    # state — "free_agent" appears zero times in it and the nine "waiver" mentions are league
    # settings. So a dropped player sitting on waivers and a long-term free agent are the
    # same thing here, and the surface says so rather than inventing the distinction.
    own = {}
    for m in snap_json["players"]:
        sid2 = str(m["sleeper_player_id"])
        lc = m.get("league_context") or {}
        own[sid2] = dict(rostered=bool(lc.get("rostered")), rosterId=lc.get("roster_id"),
                         owner=lc.get("owner_display_name"))
    league = []
    for dg, nm, pos_, g_, routes_, tgt_, ryds_, tsh_, snap_, tch_ in catchers:
        if not routes_:
            continue
        sid2 = br.get(dg)
        o = own.get(sid2 or "", {})
        mine_ = bool(sid2 and sid2 in mine)
        # the floor filters the LEAGUE, never his own roster
        if routes_ < MIN_ROUTES and not mine_:
            continue
        league.append(dict(name=nm, pos=pos_, snapShare=round(snap_ or 0, 1),
                           yprr=round((ryds_ or 0) / routes_, 2), routes=int(routes_),
                           ownership=("mine" if mine_ else
                                      "rostered" if o.get("rostered") else "open"),
                           owner=(None if mine_ else o.get("owner")),
                           thin=bool(routes_ < MIN_ROUTES), sleeperId=sid2))
    backs = []
    for dg, nm, pos_, g_, routes_, tgt_, ryds_, tsh_, snap_, tch_ in weekly(("RB",)):
        if not g_ or not tch_:
            continue
        sid2 = br.get(dg)
        o = own.get(sid2 or "", {})
        mine_ = bool(sid2 and sid2 in mine)
        if (tch_ or 0) < 40 and not mine_:      # the league floor; never applied to his own
            continue
        backs.append(dict(name=nm, pos="RB", snapShare=round(snap_ or 0, 1),
                          touchesPerGame=round((tch_ or 0) / g_, 1), touches=int(tch_ or 0),
                          games=g_, routes=int(routes_ or 0),
                          ownership=("mine" if mine_ else
                                     "rostered" if o.get("rostered") else "open"),
                          owner=(None if mine_ else o.get("owner")),
                          thin=bool((tch_ or 0) < 40), sleeperId=sid2))

    # QUARTERBACKS. Five of his 27 players were on no panel and in no caption — the single
    # biggest hole, and it survived two rounds of "missing dots" because the surface never
    # mentioned the position at all. Their units are their own: attempts per game for the
    # role, expected points per game for what it was worth.
    qbs = []
    for dg, nm, g_, xfp, att in UN.execute(
        """select dg_player_id, full_name, count(*),
                  sum(cast(total_fantasy_points_exp as real))/count(*),
                  sum(cast(pass_attempt as real))/count(*)
           from ff_opportunity where season=? and position='QB'
             and cast(week as int) between 1 and 18 and dg_player_id!=''
           group by dg_player_id, full_name having count(*)>=4""", (SEASON,)):
        sid2 = br.get(dg)
        o = own.get(sid2 or "", {})
        mine_ = bool(sid2 and sid2 in mine)
        qbs.append(dict(name=nm, pos="QB", attPerGame=round(att or 0, 1),
                        xfpPerGame=round(xfp or 0, 1), games=g_,
                        ownership=("mine" if mine_ else
                                   "rostered" if o.get("rostered") else "open"),
                        owner=(None if mine_ else o.get("owner")),
                        thin=bool(g_ < 8), sleeperId=sid2))

    counts = {}
    for x in league:
        counts[x["ownership"]] = counts.get(x["ownership"], 0) + 1


    # "No tape" is only true once every position has been processed — computing it
    # before the quarterback block is what left five QBs in neither a panel nor a caption.
    no_tape = [dict(sleeperId=s, name=bio[s]["full_name"], pos=bio[s]["position"],
                    age=bio[s].get("age"), exp=bio[s].get("years_exp"),
                    mktValue=mkt.get(s, {}).get("val"))
               for s in sorted(mine)
               if s in bio and bio[s]["position"] in ("RB", "WR", "TE", "QB")
               and s not in seen
               and not any(q["name"] == bio[s]["full_name"] for q in qbs)]

    # the weekly-starter cut per position, computed from the full nflverse population —
    # referenced by the QB panel and never hardcoded
    starter_cuts = {}
    for pos_, n_ in (("QB", 24), ("RB", 24), ("WR", 36), ("TE", 12)):
        vals = sorted((v for (v,) in UN.execute(
            """select sum(cast(total_fantasy_points_exp as real))/count(*)
               from ff_opportunity where season=? and position=?
                 and cast(week as int) between 1 and 18
               group by dg_player_id having count(*)>=6""", (SEASON, pos_))), reverse=True)
        if len(vals) >= n_:
            starter_cuts[pos_] = round(vals[n_ - 1], 2)

    meta = dict(season=int(SEASON), starterCuts=starter_cuts, weeks="regular season only, weeks 1–18",
                marketCapture=fd, modelCapture=md, snapshot=snap_json["captured_at"],
                bars=BARS, minRoutes=MIN_ROUTES,
                population=dict(n=pct["n"], p25=round(pct["p25"], 2),
                                median=round(pct["median"], 2), p75=round(pct["p75"], 2)),
                sources="Fantasy Footballers dynasty WR thresholds; FantasyPros deep-stat "
                        "glossary; Fantasy Points bell-cow work; PlayerProfiler weekly gamelogs",
                leagueCounts=counts,
                ownershipCaveat="the league snapshot records whether a player is rostered and "
                                "by whom; it carries no waiver state, so a player on waivers "
                                "and a long-term free agent are both shown as unrostered")
    build_expansions(players, season_field_pool())

    order = {"RB": 0, "WR": 1, "TE": 2}
    players.sort(key=lambda p: (order[p["pos"]], -(p.get("routes") or p.get("touches") or 0)))
    OUT.write_text("// GENERATED by proposals/019-on-the-field/build.py — do not hand-edit.\n"
                   f"export const META = {json.dumps(meta, indent=1)};\n"
                   f"export const PLAYERS = {json.dumps(players, indent=1)};\n"
                   f"export const NO_TAPE = {json.dumps(no_tape, indent=1)};\n"
                   f"export const LEAGUE = {json.dumps(league, indent=1)};\n"
                   f"export const BACKS = {json.dumps(backs, indent=1)};\n"
                   f"export const QBS = {json.dumps(qbs, indent=1)};\n")
    head = sum(1 for p in players if p["kind"] == "headline")
    print(f"wrote {OUT}\n  {len(players)} with tape ({head} headline, {len(players)-head} "
          f"positioned), {len(no_tape)} without · YPRR qualifiers {pct['n']} · "
          f"map: {len(league)} pass-catchers, {len(backs)} backs, {len(qbs)} QBs")


if __name__ == "__main__":
    main()
