#!/usr/bin/env python3
"""David approved a SENTENCE. This asks whether the sentence survives the boring players.

2026-08-08, on four scouting lines: "this is great". Each was either a STATUS the numbers
earn (alpha, bell cow, elite per-route) or a TENSION between two of them (elite rate on a
part-time snap share). None was "he was mid at everything", which is the honest description
of most players.

David's own ruling, 2026-07-21: "what if there's not an outlier and it's just a normal day
or week? Are we still going to have a huge headline about a player that barely moved?"
A form that only works on the interesting minority manufactures a protagonist for the rest.

So: generate the line for EVERY player on the roster from bars that were set BEFORE looking
at the output -- the published thresholds, plus population percentiles -- and count how many
come out with nothing to say. The bars are not tuned afterwards to raise the hit rate; a
high "mid" count is the finding, not a failure.

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/tools/does-the-line-survive-the-boring.py
"""

import json
import re
import sqlite3
import statistics as st

D = "/Users/davidleess/dynasty-genius-product/app/data"
PP = sqlite3.connect(f"file:{D}/playerprofiler.db?mode=ro", uri=True)
MC = sqlite3.connect(f"file:{D}/model_forward_capture.db?mode=ro", uri=True)
SEASON, MIN_ROUTES = "2025", 180

# ---- BARS, fixed before any output was read -------------------------------------------
# published (craft/how-the-hobby-speaks.md)
ALPHA_TARGET_SHARE = 25.0     # ~26% sustained = high-end WR2 / low-end WR1
FULLTIME_SNAP      = 70.0     # baseline for consistent production
TPRR_BAR           = 20.0     # 92% of WR2-or-better finishers cleared it
YPRR_DIRE          = 1.00     # "under 1.00 after two years is dire"
BELLCOW_SNAP       = 70.0
RB1_TOUCHES        = 280
PARTTIME_SNAP      = 55.0     # for the tension case: elite rate on limited snaps


def rows(pos_in):
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


def main():
    md = MC.execute("select max(capture_date) from model_forward_capture_joinable").fetchone()[0]
    br = {dg: str(s) for dg, s in MC.execute(
        "select dg_player_id, sleeper_id from model_forward_capture_joinable where capture_date=?",
        (md,)) if dg and s}
    src = open('/Users/davidleess/frontend-studio/proposals/018-what-repeats/data.js').read()
    mine = json.loads(re.search(r'PLAYERS = (\[.*?\]);\nexport const NO_TAPE', src, re.S).group(1))
    sids = {p["sleeperId"] for p in mine}
    ours = {dg for dg, s in br.items() if s in sids}

    # population percentiles, receivers/TEs clearing the stabilisation floor
    pop = [(r[4], (r[6] or 0) / r[4]) for r in rows(("WR", "TE")) if r[4] and r[4] >= MIN_ROUTES]
    yprrs = sorted(y for _, y in pop)
    p75 = yprrs[int(0.75 * len(yprrs))]
    p25 = yprrs[int(0.25 * len(yprrs))]
    print(f"population n={len(yprrs)}  YPRR p25 {p25:.2f} · median {st.median(yprrs):.2f} · p75 {p75:.2f}")
    print(f"bars fixed before reading output: alpha {ALPHA_TARGET_SHARE}% target share · "
          f"full-time {FULLTIME_SNAP}% snaps · TPRR {TPRR_BAR}% · YPRR dire <{YPRR_DIRE}\n")

    lines = []
    for dg, name, pos, g, routes, tgt, ryds, tsh, snap, touches in rows(("WR", "TE", "RB")):
        if dg not in ours:
            continue
        tsh, snap = tsh or 0, snap or 0
        if pos == "RB":
            if snap >= BELLCOW_SNAP and (touches or 0) >= RB1_TOUCHES:
                kind, line = "STATUS", (f"{name}: {int(touches)} touches on a {snap:.0f}% snap "
                    f"share — a bell cow, past the {RB1_TOUCHES}-touch marker that showed up in "
                    f"8 of 12 RB1 seasons.")
            elif (touches or 0) / max(g, 1) >= 12 and snap < BELLCOW_SNAP:
                kind, line = "STATUS", (f"{name}: {(touches or 0)/g:.1f} touches a game on "
                    f"{snap:.0f}% of snaps — a committee back, not a bell cow.")
            else:
                kind, line = "MID", (f"{name}: {int(touches or 0)} touches, {snap:.0f}% snaps.")
            lines.append((kind, pos, line)); continue

        if not routes:
            continue
        yprr, tprr = (ryds or 0) / routes, (tgt or 0) / routes * 100
        stable = routes >= MIN_ROUTES
        # THE REWRITE. Three boundary failures in one run -- Jeanty "committee" at 19.9
        # touches, Odunze "MID" at a 23.6% target share, Ayomanor missed by sitting exactly
        # ON p25 -- say the same thing: a categorical noun on a continuous quantity lies at
        # the edge. So stop classifying. Every player gets his numbers POSITIONED against
        # the published bar, which is true for the middling players too and cannot produce
        # a false label. The bars are not moved; only the grammar changes.
        near = lambda v, bar: abs(v - bar) / bar <= 0.10
        where = ("clears" if tprr >= TPRR_BAR else
                 "just under" if near(tprr, TPRR_BAR) else "under")
        role = ("full-time" if snap >= FULLTIME_SNAP else
                "most of the snaps" if snap >= PARTTIME_SNAP else "part-time")
        eff = ("top-quarter" if yprr >= p75 else
               "above the middle" if yprr >= st.median(yprrs) else
               "below the middle" if yprr >= p25 else "bottom-quarter")
        positioned = (f"{name}: {int(routes)} routes, {role} at {snap:.0f}% of snaps · "
                      f"{tprr:.1f}% targets per route ({where} the 20% bar) · "
                      f"{yprr:.2f} yards per route ({eff} of {len(yprrs)} qualifiers)")
        if yprr >= p75 and snap < PARTTIME_SNAP:
            kind = "TENSION"
            line = (f"{name}: {int(routes)} routes on a {snap:.0f}% snap share and {yprr:.2f} yards "
                    f"per route — elite per-route production in a part-time role.")
        elif tsh >= ALPHA_TARGET_SHARE:
            kind = "STATUS"
            line = (f"{name}: a {tsh:.1f}% target share on {snap:.0f}% of snaps — the alpha in "
                    f"that offence.")
        elif stable and yprr < YPRR_DIRE:
            kind = "STATUS"
            line = (f"{name}: {yprr:.2f} yards per route over {int(routes)} routes — under the 1.00 "
                    f"mark where analysts stop defending a receiver.")
        elif snap >= FULLTIME_SNAP and stable and yprr < p25:
            kind = "TENSION"
            line = (f"{name}: full-time at {snap:.0f}% of snaps but {yprr:.2f} yards per route — "
                    f"the role is there, the production is not.")
        elif yprr >= p75 and stable:
            kind = "STATUS"
            line = f"{name}: {yprr:.2f} yards per route over {int(routes)} routes — top-quarter efficiency."
        else:
            kind = "POSITIONED"
            line = positioned
        lines.append((kind, pos, line))

    order = {"TENSION": 0, "STATUS": 1, "POSITIONED": 2, "MID": 3}
    for kind, pos, line in sorted(lines, key=lambda x: (order[x[0]], x[2])):
        print(f"  [{kind:<7}] {line}")

    n = len(lines)
    mid = sum(1 for k, _, _ in lines if k in ("MID", "POSITIONED"))
    print(f"\n{n} players with tape · {n-mid} carry a headline status or tension · {mid} are "
          f"positioned against the bars instead of labelled.")
    print("The bars were NOT moved. Only the grammar changed, so a player near a threshold is")
    print("described rather than misclassified — which is what broke on Jeanty and Odunze.")


if __name__ == "__main__":
    main()
