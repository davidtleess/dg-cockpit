#!/usr/bin/env python3
"""Can our tier sit beside the market's without being apples-to-oranges?

Three things have to be true, and each is tested here rather than assumed:

  1. SHARED POPULATION. Both lanes must be ranked over the same players.
     Measure the overlap and what rebasing onto it actually changes.
  2. RESOLUTION. Our lane must be able to tell players apart. A tier ladder
     needs the model to separate the players a boundary would fall between;
     ties at a saturated ceiling make the top tier one undifferentiated blob.
  3. FRESHNESS. Both lanes must describe the same day.

Market lane: FantasyCalc superflex cache.
Model lane:  model_forward_capture.db (fresher than universe_pvo_latest.json).
"""

import json, sqlite3, collections, statistics

MARKET = "/Users/davidleess/dynasty-genius-product/app/cache/fantasycalc/market_values.json"
MODELDB = "/Users/davidleess/dynasty-genius-product/app/data/model_forward_capture.db"
POSITIONS = ["QB", "RB", "WR", "TE"]


def market_lane():
    raw = json.load(open(MARKET))
    out = {}
    for r in raw["data"]:
        p = r["player"]
        sid = p.get("sleeperId")
        if p["position"] in POSITIONS and sid:
            out[str(sid)] = {"pos": p["position"], "name": p["name"], "value": r["value"]}
    return raw["fetched_at"], out


def model_lane():
    c = sqlite3.connect(MODELDB)
    day = c.execute("select max(capture_date) from model_forward_capture_joinable").fetchone()[0]
    rows = c.execute(
        "select sleeper_id, player_name, position, dynasty_value_score, xvar, model_grade "
        "from model_forward_capture_joinable where capture_date=?", (day,)).fetchall()
    out = {}
    for sid, name, pos, dvs, xvar, grade in rows:
        if pos in POSITIONS and sid:
            out[str(sid)] = {"pos": pos, "name": name, "dvs": dvs, "xvar": xvar, "grade": grade}
    return day, out


def rank(d, key, positions_of):
    """Dense-rank within position, best first. Returns {sid: rank}."""
    out = {}
    for pos in POSITIONS:
        items = [(sid, v) for sid, v in d.items()
                 if positions_of(v) == pos and v.get(key) is not None]
        items.sort(key=lambda kv: -kv[1][key])
        for i, (sid, _) in enumerate(items):
            out[sid] = i + 1
    return out


def main():
    mday, mkt = market_lane()
    dday, mdl = model_lane()

    print("=" * 78)
    print("3. FRESHNESS")
    print("=" * 78)
    print(f"  market lane captured  {mday[:10]}")
    print(f"  model  lane captured  {dday}")
    print(f"  -> {'SAME DAY' if mday[:10] == dday else 'DIFFERENT DAYS'}")

    # has our lane moved at all?
    c = sqlite3.connect(MODELDB)
    days = [r[0] for r in c.execute(
        "select distinct capture_date from model_forward_capture_joinable "
        "order by capture_date desc limit 30")]
    sig = {}
    for d in days:
        vals = c.execute("select sleeper_id, dynasty_value_score from "
                         "model_forward_capture_joinable where capture_date=?", (d,)).fetchall()
        sig[d] = hash(tuple(sorted((s, v) for s, v in vals if v is not None)))
    distinct = len(set(sig.values()))
    print(f"  our lane over the last {len(days)} captures: {distinct} distinct value sets")
    if distinct == 1:
        print("  -> OUR LANE HAS NOT MOVED AT ALL over that window.")

    print()
    print("=" * 78)
    print("2. RESOLUTION — can our lane tell players apart?")
    print("=" * 78)
    withdvs = {s: v for s, v in mdl.items() if v["dvs"] is not None}
    print(f"  model rows today: {len(mdl)}, with a DVS: {len(withdvs)}")
    for P in POSITIONS:
        vals = [v["dvs"] for v in withdvs.values() if v["pos"] == P]
        if not vals:
            continue
        cnt = collections.Counter(vals)
        ceil = max(vals)
        at_ceiling = cnt[ceil]
        big = cnt.most_common(1)[0]
        xv = [v["xvar"] for v in withdvs.values() if v["pos"] == P and v["xvar"] is not None]
        xdist = len(set(xv))
        print(f"  {P}: n={len(vals):>3}  distinct DVS={len(cnt):>3}  "
              f"ceiling={ceil} held by {at_ceiling:>2}  largest tie={big[1]:>2}@{big[0]}  "
              f"| xVAR present {len(xv):>3} distinct {xdist:>3}")

    print()
    print("=" * 78)
    print("1. SHARED POPULATION")
    print("=" * 78)
    ms, ds = set(mkt), set(withdvs)
    shared = ms & ds
    print(f"  market only: {len(ms - ds):>4}   shared: {len(shared):>4}   model only: {len(ds - ms):>4}")
    for P in POSITIONS:
        m = {s for s in ms if mkt[s]["pos"] == P}
        d = {s for s in ds if withdvs[s]["pos"] == P}
        sh = m & d
        cov_m = 100 * len(sh) / len(m) if m else 0
        cov_d = 100 * len(sh) / len(d) if d else 0
        print(f"  {P}: market {len(m):>3}  model {len(d):>3}  shared {len(sh):>3}  "
              f"({cov_m:.0f}% of market, {cov_d:.0f}% of model)")

    # what rebasing changes
    print()
    print("  Effect of rebasing onto the shared population (market lane):")
    full_rank = rank(mkt, "value", lambda v: v["pos"])
    sub = {s: mkt[s] for s in shared}
    sub_rank = rank(sub, "value", lambda v: v["pos"])
    deltas = [abs(full_rank[s] - sub_rank[s]) for s in shared if s in full_rank]
    if deltas:
        print(f"    median rank shift {statistics.median(deltas):.0f} places, "
              f"max {max(deltas)}, mean {statistics.mean(deltas):.1f}")

    print()
    print("=" * 78)
    print("VERDICT INPUTS")
    print("=" * 78)
    te_ceiling = collections.Counter(
        v["dvs"] for v in withdvs.values() if v["pos"] == "TE")
    if te_ceiling:
        ceil = max(te_ceiling)
        print(f"  Top TE tier under our lane would contain {te_ceiling[ceil]} players "
              f"tied at exactly {ceil} — indistinguishable.")
    out = {
        "market_day": mday[:10], "model_day": dday,
        "model_distinct_value_sets_last_30_captures": distinct,
        "shared": len(shared), "market_only": len(ms - ds), "model_only": len(ds - ms),
    }
    json.dump(out, open("/Users/davidleess/frontend-studio/analysis/two-lane-feasibility.json", "w"), indent=1)


if __name__ == "__main__":
    main()
