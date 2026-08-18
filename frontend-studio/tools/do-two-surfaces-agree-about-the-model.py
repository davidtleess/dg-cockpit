#!/usr/bin/env python3
"""Do the shipped surfaces agree about whether the model has scored a player?

Compares, for every player on David's roster, what three live endpoints say on the
same day about the SAME quantity:

  /api/roster/audit      -> model_grade, model_status_applies, dynasty_value_score
  /api/roster/capacity   -> dvs, median_projection_2y
  /api/players/{id}      -> engine_path, model_grade, dynasty_value_score, projection_2y

Run:  python3 tools/do-two-surfaces-agree-about-the-model.py
Requires the app running at 127.0.0.1:8000.
"""
import json, sys, urllib.request

BASE = "http://127.0.0.1:8000"

def get(p):
    return json.load(urllib.request.urlopen(BASE + p))

def main():
    audit = get("/api/roster/audit")
    cap = {c["full_name"]: c for c in get("/api/roster/capacity").get("candidates", [])}
    rows = audit["players"]

    print(f"model_status_by_position (audit header): {audit['model_status_by_position']}")
    print(f"roster rows: {len(rows)}\n")

    hdr = f"{'player':<22} {'pos':<3} {'audit grade':<12} {'audit DVS':>9} {'player-ep grade':<12} {'player-ep DVS':>13} {'PPG 2y':>7}"
    print(hdr); print("-" * len(hdr))

    contradictions, dnu, ppg_available = [], [], 0
    for r in sorted(rows, key=lambda x: x["full_name"]):
        pe = get(f"/api/players/{r['sleeper_id']}")
        m = pe.get("model") or {}
        a_dvs, p_dvs = r.get("dynasty_value_score"), m.get("dynasty_value_score")
        ppg = m.get("projection_2y")
        print(f"{r['full_name']:<22} {r['position']:<3} {str(r.get('model_grade')):<12} "
              f"{str(a_dvs):>9} {str(m.get('model_grade')):<12} {str(p_dvs):>13} {str(ppg):>7}")
        if a_dvs is None and p_dvs is not None:
            contradictions.append((r["full_name"], r["position"], r.get("model_grade"),
                                   m.get("model_grade"), p_dvs, ppg))
        if any("do not use for dynasty decisions" in c for c in (r.get("caveats") or [])):
            dnu.append(r["full_name"])
        if ppg is not None:
            ppg_available += 1

    print(f"\nCONTRADICTIONS — audit says no model score, player endpoint has one: "
          f"{len(contradictions)} of {len(rows)}")
    for n, pos, ag, pg, dvs, ppg in contradictions:
        print(f"   {n:<22} {pos:<3} audit={ag:<10} player={pg:<9} DVS {dvs:<6} = {ppg} PPG")

    print(f"\nRows carrying 'do not use for dynasty decisions': {len(dnu)} of {len(rows)}")
    print(f"Players with a 2-year PPG projection available from the API: {ppg_available} of {len(rows)}")

    # the audit's own caveat text vs its own header
    sample = next((r for r in rows if r.get("model_grade") == "PRE_MODEL"
                   and any("not yet validated" in c for c in (r.get("caveats") or []))), None)
    if sample:
        cav = next(c for c in sample["caveats"] if "not yet validated" in c)
        hdr_status = audit["model_status_by_position"].get(sample["position"])
        print(f"\nSELF-CONTRADICTION inside one response:")
        print(f"   header says {sample['position']} = {hdr_status}")
        print(f"   row {sample['full_name']!r} caveat: {cav!r}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
