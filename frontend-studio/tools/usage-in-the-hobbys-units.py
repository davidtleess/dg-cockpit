#!/usr/bin/env python3
"""Speak the volume in the hobby's own units, and validate the instrument before quoting it.

David, 2026-08-08: "wtf is a JOB?? are you using any of your football context research??"
Studio had coined a noun for expected fantasy points. The hobby's actual currency, from its
own sources:

  target share      >20% correlates with WR1/WR2 outcomes; <10% rarely bankable;
                    ~26% sustained = high-end WR2 / low-end WR1
  snap share        70%+ is the baseline for consistent production
  route participation   share of team dropbacks a receiver ran a route on
  TPRR  targets per route run     >=20% -- 92% of WR2-or-better finishers since 2006
                                  cleared it; rookie-year average 18.8%
  YPRR  yards per route run       stabilises at 180+ routes / 11+ games; 1st-3rd round
                                  rookie year-1 avg 1.37, year-2 avg 1.59; under 1.00
                                  after two years is dire
  WOPR  1.5 x target share + 0.7 x air-yards share; >.700 elite

Backs are spoken about in different units entirely -- nobody quotes a back's YPRR:
  snap share        70-75%+ = "bell cow"; only ~4 backs a season clear 75%
  touches/game      20+ = workhorse, the weekly top-15 conversation
  season touches    280+ appeared in 8 of 12 RB1 seasons

And decisively: practitioners say these as a POSITIONAL RANK -- "WR2 volume", "RB1 touches"
-- not as points per game.

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/tools/usage-in-the-hobbys-units.py
"""

import json
import re
import sqlite3
import statistics as st

D = "/Users/davidleess/dynasty-genius-product/app/data"
PP = sqlite3.connect(f"file:{D}/playerprofiler.db?mode=ro", uri=True)
SEASON = "2025"
MIN_ROUTES = 180          # the Footballers' stabilisation floor for YPRR


def f(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def bridge():
    """dg_player_id -> sleeper_id. Joining on NAME dropped Tre' Harris, whose roster name
    carries no apostrophe — a silent under-report of exactly the kind that keeps recurring
    when a tool is allowed to pick its own population."""
    MC = sqlite3.connect(f"file:{D}/model_forward_capture.db?mode=ro", uri=True)
    md = MC.execute("select max(capture_date) from model_forward_capture_joinable").fetchone()[0]
    return {dg: str(sid) for dg, sid in MC.execute(
        "select dg_player_id, sleeper_id from model_forward_capture_joinable where capture_date=?",
        (md,)) if dg and sid}


def back_usage():
    """Backs, in the units backs are discussed in."""
    rows = {}
    for dg, name, g, touches, snap, tgt, routes in PP.execute(
        """select dg_player_id, name, count(*),
                  sum(cast(nullif(trim(total_touches),'') as real)),
                  avg(cast(nullif(trim(snap_share),'') as real)),
                  sum(cast(nullif(trim(targets),'') as real)),
                  sum(cast(nullif(trim(routes_run),'') as real))
           from pp_gamelog_week
           where season=? and position='RB' and cast(week as int) between 1 and 18
             and dg_player_id!='' group by dg_player_id, name""",
        (SEASON,)):
        if not g:
            continue
        rows[dg] = dict(name=name, pos='RB', g=g, touches=touches or 0, snap=snap or 0,
                        tgt=tgt or 0, routes=routes or 0, tpg=(touches or 0) / g)
    return rows


def season_usage(positions=("WR", "TE")):
    """Per player: routes, targets, receiving yards, and the derived rates."""
    rows = {}
    for dg, name, pos, routes, tgt, ryds, tshare, snap, touches in PP.execute(
        """select dg_player_id, name, position,
                  sum(cast(nullif(trim(routes_run),'') as real)),
                  sum(cast(nullif(trim(targets),'') as real)),
                  sum(cast(nullif(trim(receiving_yards),'') as real)),
                  avg(cast(nullif(trim(target_share),'') as real)),
                  avg(cast(nullif(trim(snap_share),'') as real)),
                  sum(cast(nullif(trim(total_touches),'') as real))
           from pp_gamelog_week
           where season=? and cast(week as int) between 1 and 18 and dg_player_id!=''
           group by dg_player_id, name, position""",
        (SEASON,),
    ):
        if not routes or pos not in positions:
            continue
        rows[dg] = dict(name=name, pos=pos, routes=routes, targets=tgt or 0,
                        ryds=ryds or 0, tshare=tshare, snap=snap, touches=touches or 0,
                        tprr=(tgt or 0) / routes, yprr=(ryds or 0) / routes)
    return rows


def main():
    u = season_usage()
    qual = {k: v for k, v in u.items() if v["routes"] >= MIN_ROUTES}
    print(f"{len(u)} pass-catchers with routes in {SEASON}; "
          f"{len(qual)} cleared the {MIN_ROUTES}-route stabilisation floor\n")

    # ---- INSTRUMENT CHECK. If these leaderboards are not names a football person would
    # recognise, nothing below is worth reading. Both directions: the top must be elite,
    # and the sub-1.00 YPRR group must be players nobody would defend.
    print("VALIDATION — 2025 YPRR leaders (>=180 routes). Must read as elite receivers:")
    for dg, v in sorted(qual.items(), key=lambda x: -x[1]["yprr"])[:8]:
        print(f"   {v['name']:<24}{v['pos']:<4} {v['yprr']:.2f} YPRR  "
              f"{v['tprr']*100:4.1f}% TPRR  {int(v['routes'])} routes")
    print("\nVALIDATION — TPRR leaders. Must read as target hogs:")
    for dg, v in sorted(qual.items(), key=lambda x: -x[1]["tprr"])[:8]:
        print(f"   {v['name']:<24}{v['pos']:<4} {v['tprr']*100:4.1f}% TPRR  {v['yprr']:.2f} YPRR")

    yprrs = sorted(v["yprr"] for v in qual.values())
    tprrs = sorted(v["tprr"] for v in qual.values())
    print(f"\nPOPULATION, {len(qual)} qualifiers")
    print(f"   YPRR  median {st.median(yprrs):.2f}   "
          f"p25 {yprrs[len(yprrs)//4]:.2f}   p75 {yprrs[3*len(yprrs)//4]:.2f}")
    print(f"   TPRR  median {st.median(tprrs)*100:.1f}%   "
          f"share clearing the 20% bar: {sum(1 for t in tprrs if t>=0.20)/len(tprrs):.0%}")

    # ---- his roster, in these units. Joined on ID, never on name.
    s = open('/Users/davidleess/frontend-studio/proposals/018-what-repeats/data.js').read()
    mine = json.loads(re.search(r'PLAYERS = (\[.*?\]);\nexport const NO_TAPE', s, re.S).group(1))
    sids = {p["sleeperId"] for p in mine}
    br = bridge()
    ours = {dg for dg, sid in br.items() if sid in sids}

    print(f"\nHIS PASS-CATCHERS, in the units the hobby speaks")
    print(f"   {'player':<22}{'routes':>7}{'TPRR':>8}{'YPRR':>7}{'tgt sh':>8}{'snap':>7}   reads as")
    hit = []
    for dg, v in sorted(u.items(), key=lambda x: -x[1]["routes"]):
        if dg not in ours:
            continue
        hit.append(v["name"])
        stable = v["routes"] >= MIN_ROUTES
        tag = []
        tag.append("TPRR clears 20%" if v["tprr"] >= 0.20 else "under the 20% TPRR bar")
        if stable:
            tag.append("YPRR " + ("elite" if v["yprr"] >= 2.0 else
                                  "solid" if v["yprr"] >= 1.6 else
                                  "ok" if v["yprr"] >= 1.2 else "poor"))
        else:
            tag.append(f"only {int(v['routes'])} routes — YPRR not stable")
        print(f"   {v['name']:<22}{int(v['routes']):>7}{v['tprr']*100:>7.1f}%{v['yprr']:>7.2f}"
              f"{(v['tshare'] or 0):>7.1f}%{(v['snap'] or 0):>6.0f}%   {', '.join(tag)}")
    b = back_usage()
    print(f"\nHIS BACKS, in the units backs are discussed in")
    print(f"   {'player':<22}{'games':>6}{'touches':>9}{'per game':>10}{'snap':>7}{'routes':>8}   reads as")
    for dg, v in sorted(b.items(), key=lambda x: -x[1]["tpg"]):
        if dg not in ours:
            continue
        hit.append(v["name"])
        parts = []
        parts.append(f"{'at' if 70 <= v['snap'] < 76 else 'above' if v['snap'] >= 76 else 'under'}"
                     f" the 70-75% bell-cow snap line")
        if v["touches"] >= 280:
            parts.append("280+ touches, the RB1 marker")
        elif v["tpg"] >= 18:
            parts.append(f"{v['tpg']:.0f}/g, near the 20-touch workhorse line")
        parts.append(f"{int(v['routes'])} routes" if v["routes"] >= 200 else "little pass work")
        print(f"   {v['name']:<22}{v['g']:>6}{int(v['touches']):>9}{v['tpg']:>10.1f}"
              f"{v['snap']:>6.0f}%{int(v['routes']):>8}   {'; '.join(parts)}")
    bell = [x for x in b.values() if x["snap"] >= 75 and x["g"] >= 8]
    print(f"\n   league check: {len(bell)} backs at a 75%+ snap share over 8+ games "
          f"— published expectation is ~4 a season")
    seen_dg = ours & (set(u) | set(b))
    missing = sorted(p["name"] for p in mine if br.get_id_missing(p) if False) if False else \
        sorted(p["name"] for p in mine
               if not any(br.get(dg) == p["sleeperId"] for dg in seen_dg))
    if missing:
        print(f"\n   no 2025 regular-season route or touch data: {', '.join(missing)}")


if __name__ == "__main__":
    main()
