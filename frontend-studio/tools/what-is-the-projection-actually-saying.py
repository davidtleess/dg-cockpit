#!/usr/bin/env python3
"""What is projection_2y actually saying — a forecast, or last season restated?

Joins the model's ENGINE_B projections to each player's REAL 2025 regular-season PPR points per
game (nflverse ff_opportunity, weeks 1-18 only; the table carries weeks 1-22 and postseason weeks
inflate per-game rates). Joined on gsis_id, never on name.

Run:  python3 tools/what-is-the-projection-actually-saying.py
"""
import collections, json, sqlite3, statistics, sys

ART = "/Users/davidleess/dynasty-genius-product/app/data/valuation_runtime/universe_pvo_runtime.json"
DB  = "/Users/davidleess/dynasty-genius-product/app/data/nflverse_usage.db"

def pearson(xs, ys):
    n = len(xs); mx = sum(xs)/n; my = sum(ys)/n
    num = sum((x-mx)*(y-my) for x, y in zip(xs, ys))
    dx = sum((x-mx)**2 for x in xs) ** 0.5
    dy = sum((y-my)**2 for y in ys) ** 0.5
    return num/(dx*dy) if dx and dy else float("nan")

def main():
    rows = json.load(open(ART))
    if isinstance(rows, dict):
        rows = next(v for v in rows.values() if isinstance(v, list) and v and isinstance(v[0], dict))

    model = {}
    no_gsis = 0
    for r in rows:
        v = r.get("valuation") or {}
        if v.get("engine_path") != "ENGINE_B":
            continue
        proj = r.get("projection_2y")
        if proj is None:
            continue
        # The gsis id lives in dg_player_id (format "00-0038564"); identity_ids.gsis_id is null
        # for all 503 ENGINE_B rows. Verified 2026-08-18.
        gsis = r.get("dg_player_id")
        if not gsis:
            no_gsis += 1
            continue
        p = r.get("player") or {}
        model[gsis] = (proj, p.get("full_name"), p.get("position"), p.get("age"))
    print(f"ENGINE_B rows with a projection: {len(model)+no_gsis}   joinable by gsis_id: {len(model)}   "
          f"no gsis_id: {no_gsis}")

    con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
    q = """SELECT player_id, SUM(total_fantasy_points), COUNT(*)
           FROM ff_opportunity
           WHERE season='2025' AND CAST(week AS INTEGER) BETWEEN 1 AND 18
           GROUP BY player_id"""
    actual = {}
    for pid, pts, games in con.execute(q):
        if games and pts is not None:
            actual[pid] = (pts/games, games)

    pairs = [(gsis, m, actual[gsis]) for gsis, m in model.items() if gsis in actual]
    print(f"players with BOTH a projection and 2025 regular-season tape: {len(pairs)}\n")

    for min_games in (1, 8):
        sub = [(m, a) for _, m, a in pairs if a[1] >= min_games]
        if len(sub) < 10:
            continue
        xs = [a[0] for _, a in sub]; ys = [m[0] for m, _ in sub]
        print(f"min {min_games} game(s): n={len(sub)}  corr(2025 actual PPG, projection_2y) = {pearson(xs, ys):.3f}")
        bypos = collections.defaultdict(list)
        for m, a in sub:
            bypos[m[2]].append((a[0], m[0]))
        for pos in ("QB", "RB", "WR", "TE"):
            v = bypos.get(pos, [])
            if len(v) > 8:
                print(f"    {pos}: n={len(v):3}  r={pearson([x for x,_ in v], [y for _,y in v]):.3f}  "
                      f"mean actual {statistics.mean([x for x,_ in v]):5.2f}  "
                      f"mean projected {statistics.mean([y for _,y in v]):5.2f}")

    # where does the model DISAGREE most with last season? Those are its actual opinions.
    sub = [(m, a) for _, m, a in pairs if a[1] >= 8]
    diffs = sorted(((m[0]-a[0], m[1], m[2], m[3], a[0], m[0]) for m, a in sub), reverse=True)
    print("\nThe model's biggest departures from 2025 production (>=8 games) — these are its OPINIONS:")
    print("  MOST OPTIMISTIC vs last season")
    for d, n, pos, age, act, proj in diffs[:6]:
        print(f"    {n:<22} {pos} age {str(age):<5} 2025 {act:5.2f} -> projects {proj:5.2f}  ({d:+.2f})")
    print("  MOST PESSIMISTIC vs last season")
    for d, n, pos, age, act, proj in diffs[-6:]:
        print(f"    {n:<22} {pos} age {str(age):<5} 2025 {act:5.2f} -> projects {proj:5.2f}  ({d:+.2f})")
    return 0


# ── appended 2026-08-18: is the projection anything MORE than shrunk 2025 PPG? ──
def residual_battery():
    """Regress the model's departure from 2025 PPG on the obvious explanations.
    If shrinkage + age explain it, the model is a baseline, not a view."""
    import json as _j, sqlite3 as _s, statistics as _st
    rows = _j.load(open(ART))
    if isinstance(rows, dict):
        rows = next(v for v in rows.values() if isinstance(v, list) and v and isinstance(v[0], dict))
    con = _s.connect(f"file:{DB}?mode=ro", uri=True)
    act = {}
    for pid, pts, g in con.execute(
        "SELECT dg_player_id, SUM(total_fantasy_points), COUNT(*) FROM ff_opportunity "
        "WHERE season='2025' AND CAST(week AS INTEGER) BETWEEN 1 AND 18 AND dg_player_id IS NOT NULL "
        "GROUP BY dg_player_id"):
        if g >= 8 and pts is not None:
            act[pid] = pts / g
    data = []
    for r in rows:
        v = r.get("valuation") or {}
        if v.get("engine_path") != "ENGINE_B":
            continue
        pid, proj = r.get("dg_player_id"), r.get("projection_2y")
        p = r.get("player") or {}
        if pid in act and proj is not None and p.get("age"):
            data.append((act[pid], proj, p["age"], p.get("position"), p.get("full_name")))
    a = [d[0] for d in data]; pr = [d[1] for d in data]; ag = [d[2] for d in data]
    res = [x - y for y, x in zip(a, pr)]          # projection - actual
    print(f"\n{'='*74}\nRESIDUAL BATTERY (projection - 2025 actual PPG), n={len(data)}, >=8 games")
    print(f"  corr(residual, 2025 actual PPG) = {pearson(res, a):+.3f}   <- shrinkage")
    print(f"  corr(residual, age)             = {pearson(res, ag):+.3f}   <- age term")
    # how much of the projection does a plain shrink of last year explain?
    mean_a = sum(a) / len(a)
    best = None
    for k in [i / 100 for i in range(50, 101)]:
        pred = [mean_a + k * (x - mean_a) for x in a]
        sse = sum((p2 - p1) ** 2 for p1, p2 in zip(pred, pr))
        if best is None or sse < best[1]:
            best = (k, sse)
    k = best[0]
    pred = [mean_a + k * (x - mean_a) for x in a]
    ss_res = sum((p1 - p2) ** 2 for p1, p2 in zip(pr, pred))
    ss_tot = sum((p1 - sum(pr) / len(pr)) ** 2 for p1 in pr)
    print(f"\n  BEST PLAIN SHRINK of 2025 PPG toward the mean: projection ~ mean + {k:.2f}*(actual - mean)")
    print(f"  That one-parameter rule explains R^2 = {1 - ss_res/ss_tot:.3f} of the model's projection.")
    print(f"  Residual scatter around it: sd {_st.pstdev([p1-p2 for p1,p2 in zip(pr,pred)]):.2f} PPG")
    off = sorted(((p1 - p2, n, pos, round(y,2), round(p1,2)) for (y,p1,agev,pos,n), p2 in zip(data, pred)), reverse=True)
    print("\n  Players the shrink rule does NOT explain (the model's only independent opinions):")
    for d, n, pos, y, p1 in off[:5]:
        print(f"    +{d:5.2f}  {n:<22} {pos}  2025 {y:5.2f} -> projects {p1:5.2f}")
    for d, n, pos, y, p1 in off[-5:]:
        print(f"    {d:6.2f}  {n:<22} {pos}  2025 {y:5.2f} -> projects {p1:5.2f}")

residual_battery()


def per_position_shrink():
    """Does the one-parameter shrink explain the model equally everywhere?"""
    import json as _j, sqlite3 as _s, statistics as _st, collections as _c
    rows = _j.load(open(ART))
    if isinstance(rows, dict):
        rows = next(v for v in rows.values() if isinstance(v, list) and v and isinstance(v[0], dict))
    con = _s.connect(f"file:{DB}?mode=ro", uri=True)
    act = {}
    for pid, pts, g in con.execute(
        "SELECT dg_player_id, SUM(total_fantasy_points), COUNT(*) FROM ff_opportunity "
        "WHERE season='2025' AND CAST(week AS INTEGER) BETWEEN 1 AND 18 AND dg_player_id IS NOT NULL "
        "GROUP BY dg_player_id"):
        if g >= 8 and pts is not None:
            act[pid] = pts / g
    byp = _c.defaultdict(list)
    for r in rows:
        v = r.get("valuation") or {}
        if v.get("engine_path") != "ENGINE_B":
            continue
        pid, proj = r.get("dg_player_id"), r.get("projection_2y")
        p = r.get("player") or {}
        if pid in act and proj is not None:
            byp[p.get("position")].append((act[pid], proj))
    print(f"\n{'='*74}\nPER-POSITION: how much of the model is a plain shrink of last season?")
    for pos in ("QB", "RB", "WR", "TE"):
        v = byp.get(pos, [])
        if len(v) < 15:
            continue
        a = [x for x, _ in v]; pr = [y for _, y in v]
        m = sum(a) / len(a)
        best = min(((k / 100, sum((m + (k/100)*(x-m) - y)**2 for x, y in v)) for k in range(30, 121)),
                   key=lambda t: t[1])
        k = best[0]
        pred = [m + k*(x-m) for x in a]
        ss_res = sum((p1-p2)**2 for p1, p2 in zip(pr, pred))
        ss_tot = sum((p1 - sum(pr)/len(pr))**2 for p1 in pr)
        print(f"  {pos}: n={len(v):3}  best shrink k={k:.2f}  R^2={1-ss_res/ss_tot:.3f}  "
              f"unexplained sd={_st.pstdev([p1-p2 for p1,p2 in zip(pr,pred)]):.2f} PPG")

if __name__ == "__main__":
    main()
    residual_battery()
    per_position_shrink()
