#!/usr/bin/env python3
"""Replay 2025 for David's own roster, week by week, as the surface would have read live.

The measurement in `when-can-i-believe-it.py` says a role is well measured by week 3 and an
efficiency rate never is; `survivorship-check.py` says one in five players holding a real
role in week 3 has lost it by week 13.  Both are facts about a population.  This asks the
only question that matters for a surface: on HIS roster, in HIS 2025, did that actually
happen to anybody?

If the answer is no, there is a mechanism and no story, and the honest move is to say so
rather than build a page around a risk that never landed on him.

    /Users/davidleess/dynasty-genius-product/.venv/bin/python3.14 \
      /Users/davidleess/frontend-studio/tools/replay-his-2025.py
"""

import glob
import json
import sqlite3
from collections import defaultdict

D = "/Users/davidleess/dynasty-genius-product/app/data"
PP = sqlite3.connect(f"file:{D}/playerprofiler.db?mode=ro", uri=True)
MC = sqlite3.connect(f"file:{D}/model_forward_capture.db?mode=ro", uri=True)

LAST_REG = 18
CUTS = [3, 6, 9, 13, 18]


def num(v):
    if v in (None, ""):
        return None
    try:
        return float(v)
    except ValueError:
        return None


def roster():
    """Joined by ID, never by name. The 2026-08-09 lesson: a name join silently lost
    Tre' Harris and Luther Burden III and produced two false 'missing player' reports."""
    snap = json.load(open(sorted(glob.glob(f"{D}/league_snapshots/*.json"))[-1]))
    me = [r for r in snap["rosters"]
          if str(r["roster_id"]) == str(snap["david_roster_id"])][0]
    mine = {str(x) for x in me["players"]}
    bio = {str(m["sleeper_player_id"]): m["player"] for m in snap["players"]}

    md = MC.execute("select max(capture_date) from model_forward_capture_joinable").fetchone()[0]
    out = {}
    for dg, sid in MC.execute(
            "select dg_player_id, sleeper_id from model_forward_capture_joinable "
            "where capture_date=?", (md,)):
        if dg and sid and str(sid) in mine:
            b = bio.get(str(sid), {})
            out[dg] = (b.get("full_name") or b.get("name") or dg, b.get("position"),
                       b.get("age"), b.get("years_exp"))
    return out, mine, snap["captured_at"]


def weekly():
    q = ("SELECT dg_player_id, position, CAST(week AS INT), routes_run, targets, "
         "receiving_yards, snap_share, target_share, total_touches, carries, snaps, "
         "fantasy_points FROM pp_gamelog_week WHERE season='2025' AND CAST(week AS INT)<=? "
         "AND position IN ('QB','RB','WR','TE') AND dg_player_id IS NOT NULL")
    rows = defaultdict(list)
    for r in PP.execute(q, (LAST_REG,)):
        key = r[0]
        rows[key].append(dict(
            pos=r[1], wk=r[2], routes=num(r[3]) or 0, targets=num(r[4]) or 0,
            recyd=num(r[5]) or 0, snapshare=num(r[6]) or 0, tgtshare=num(r[7]) or 0,
            touches=num(r[8]) or 0, carries=num(r[9]) or 0, snaps=num(r[10]) or 0,
            fp=num(r[11]) or 0))
    return rows


def window(games):
    if not games:
        return None
    n = len(games)
    routes = sum(g["routes"] for g in games)
    snaps = sum(g["snaps"] for g in games)
    return dict(
        games=n,
        routes_pg=routes / n,
        snapshare=(sum(g["snapshare"] * g["snaps"] for g in games) / snaps) if snaps else 0.0,
        tgtshare=(sum(g["tgtshare"] * g["routes"] for g in games) / routes) if routes else 0.0,
        tprr=(sum(g["targets"] for g in games) / routes * 100) if routes >= 20 else None,
        yprr=(sum(g["recyd"] for g in games) / routes) if routes >= 20 else None,
        touches_pg=sum(g["touches"] for g in games) / n,
        ppg=sum(g["fp"] for g in games) / n,
    )


def main():
    ros, mine, captured = roster()
    wk = weekly()
    print("=" * 104)
    print("HIS 2025, REPLAYED — what each week's cut would have said, and whether it held")
    print(f"roster snapshot {captured[:10]} · {len(mine)} rostered · {len(ros)} resolved to a "
          f"model id · regular season only")
    print("=" * 104)

    matched, unmatched, stories = [], [], []
    for key, (nm, pos, age, exp) in sorted(ros.items(), key=lambda kv: kv[1][0]):
        games = wk.get(key)
        if not games:
            unmatched.append(nm)
            continue
        matched.append(nm)
        games.sort(key=lambda g: g["wk"])
        cuts = {}
        for c in CUTS:
            cuts[c] = window([g for g in games if g["wk"] <= c])
        late = window([g for g in games if g["wk"] >= 13])
        w3 = cuts[3]
        if not w3 or w3["games"] == 0:
            continue

        is_rb = pos == "RB"
        early_role = w3["touches_pg"] if is_rb else w3["routes_pg"]
        late_role = (late["touches_pg"] if is_rb else late["routes_pg"]) if late else 0.0
        late_games = late["games"] if late else 0
        bar = 8.0 if is_rb else 15.0
        unit = "touches a game" if is_rb else "routes a game"

        print()
        print(f"── {nm}  {pos}  age {age}  exp {exp}   [{len(games)} games]")
        print(f"   {'through wk':<13}" + "".join(f"{f'wk{c}':>9}" for c in CUTS))
        for lab, k, fmt in (("routes/g", "routes_pg", "{:.1f}"),
                            ("touches/g", "touches_pg", "{:.1f}"),
                            ("snap %", "snapshare", "{:.0f}"),
                            ("target %", "tgtshare", "{:.1f}"),
                            ("YPRR", "yprr", "{:.2f}"),
                            ("TPRR %", "tprr", "{:.1f}"),
                            ("PPG", "ppg", "{:.1f}")):
            if is_rb and k in ("yprr", "tprr", "tgtshare"):
                continue
            if not is_rb and k == "touches_pg":
                continue
            cells = ""
            for c in CUTS:
                v = cuts[c][k] if cuts[c] else None
                cells += f"{fmt.format(v):>9}" if v is not None else f"{'·':>9}"
            print(f"   {lab:<13}{cells}")

        if early_role >= bar:
            if late_games < 4:
                verdict = (f"HELD A ROLE IN WEEK 3 AND DISAPPEARED — {early_role:.1f} "
                           f"{unit} through week 3, then {late_games} games from week 13")
                stories.append((nm, pos, "vanished", early_role, late_role, unit, late_games))
            elif late_role < early_role * 0.6:
                verdict = (f"ROLE COLLAPSED — {early_role:.1f} → {late_role:.1f} {unit}")
                stories.append((nm, pos, "collapsed", early_role, late_role, unit, late_games))
            elif late_role > early_role * 1.4:
                verdict = (f"ROLE GREW — {early_role:.1f} → {late_role:.1f} {unit}")
                stories.append((nm, pos, "grew", early_role, late_role, unit, late_games))
            else:
                verdict = f"role held — {early_role:.1f} → {late_role:.1f} {unit}"
        else:
            if late_role >= bar:
                verdict = (f"NO ROLE IN WEEK 3, HAD ONE BY WEEK 13 — {early_role:.1f} → "
                           f"{late_role:.1f} {unit}")
                stories.append((nm, pos, "emerged", early_role, late_role, unit, late_games))
            else:
                verdict = f"never held a {unit} role ({early_role:.1f} → {late_role:.1f})"
        print(f"   → {verdict}")

    print()
    print("=" * 104)
    print(f"MATCHED {len(matched)} of {len(ros)} rostered players to 2025 tape.")
    if unmatched:
        print(f"NO 2025 TAPE ({len(unmatched)}): " + ", ".join(unmatched))
    print()
    if not stories:
        print("NO STORY ON HIS ROSTER. Every player who held a role in week 3 still held it")
        print("in week 13. The population risk is real and it did not land on him in 2025 —")
        print("say that rather than build a page around it.")
    else:
        print(f"{len(stories)} of his players moved between the week-3 reading and the late "
              f"season:")
        for nm, pos, kind, e, l, unit, lg in stories:
            print(f"   {kind.upper():<10} {nm} ({pos}) — {e:.1f} → {l:.1f} {unit}"
                  + (f", only {lg} late games" if lg < 4 else ""))


if __name__ == "__main__":
    main()
