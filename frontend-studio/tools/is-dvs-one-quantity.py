#!/usr/bin/env python3
"""Is dynasty_value_score one quantity, or several wearing one scale?

Reads the producer artifact directly (not the API) and reports, per engine path:
how many rows carry a DVS, how many carry projection_2y, which dvs_p90_ref values
appear, and whether DVS reproduces projection_2y / P90 * 100.

Run:  python3 tools/is-dvs-one-quantity.py
"""
import collections, json, sys

ART = "/Users/davidleess/dynasty-genius-product/app/data/valuation_runtime/universe_pvo_runtime.json"
ENGINE_B_P90 = {"QB": 20.1, "RB": 15.7, "WR": 14.5, "TE": 9.4}   # engine_b_contract.py:24-29
TOL = 0.15

def main():
    rows = json.load(open(ART))
    if isinstance(rows, dict):
        rows = next(v for v in rows.values() if isinstance(v, list) and v and isinstance(v[0], dict))
    print(f"artifact rows: {len(rows)}")

    agg = collections.defaultdict(lambda: {"n": 0, "dvs": 0, "proj": 0, "p90": collections.Counter()})
    misses, clamped = [], collections.Counter()
    for r in rows:
        v = r.get("valuation") or {}
        ep = v.get("engine_path") or "NONE"
        pos = (r.get("player") or {}).get("position")
        dvs, proj = v.get("dynasty_value_score"), r.get("projection_2y")
        a = agg[ep]; a["n"] += 1
        a["dvs"] += dvs is not None
        a["proj"] += proj is not None
        if v.get("dvs_p90_ref") is not None:
            a["p90"][(pos, v["dvs_p90_ref"])] += 1
        if v.get("dvs_clamped"):
            clamped[(ep, pos)] += 1
        if ep == "ENGINE_B" and dvs is not None and proj is not None and pos in ENGINE_B_P90:
            expected = proj / ENGINE_B_P90[pos] * 100.0
            if abs(min(100.0, max(0.0, expected)) - dvs) > TOL:
                misses.append(((r.get("player") or {}).get("full_name"), pos, proj, dvs, round(expected, 1)))

    for ep in sorted(agg):
        a = agg[ep]
        if not a["dvs"] and not a["proj"]:
            print(f"\n{ep}: {a['n']} rows — no DVS, no projection")
            continue
        refs = {f"{p}": ref for (p, ref) in a["p90"]}
        print(f"\n{ep}: {a['n']} rows | with DVS {a['dvs']} | with projection_2y {a['proj']}")
        print(f"   dvs_p90_ref: {refs}")

    print(f"\nENGINE_B rows failing projection_2y / P90 * 100 (tol {TOL}): {len(misses)}")
    for m in misses:
        print(f"   {m}")
    print(f"\ndvs_clamped true: {sum(clamped.values())} rows -> {dict(clamped)}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
