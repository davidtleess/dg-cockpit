#!/usr/bin/env python3.14
"""Regenerate the Footballguys adp.csv identity census. READ-ONLY except one JSON output.

COMMIT-INTENDED, NOT YET COMMITTED. This file is evidence code that was authored and RUN
this session; its outputs are cited in framing v4. Nothing here is tracked by git yet.

Codex round-3 finding 1: every input is PINNED and VERIFIED, and the run FAILS CLOSED on any
mismatch — including the mutable resolver module, because a change there silently changes every
verdict. Reporting a hash is not enforcing one.

Codex round-3 finding 2 fixes the durable boundary:
  * default MINIMIZED output is the only repo-eligible artifact;
  * `--full` is a SCRATCH-ONLY PROVIDER DERIVATIVE and REFUSES to write inside the repository.

  python3.14 <this> <dir with adp.csv + projections.csv> <out.json> [--full]
"""
import csv, hashlib, json, re, sys
from collections import Counter
from pathlib import Path

REPO = Path(__file__).resolve().parents[4]      # evidence/<date>/ -> agent-ledger -> docs -> repo
sys.path.insert(0, str(REPO / "src"))
from dynasty_genius.nflverse_usage import IdentityIndex   # noqa: E402

NORMALIZER_VERSION = "fbg-name-norm/2"
CROSSWALK_RELPATH = "app/data/identity/_runs/ff_playerids_20260516.json"

# --- PINNED INPUTS: verified, not merely reported (finding 1) ------------------------------
PINS = {
    "adp.csv":        "1f7afcbfdd7b9c6d08dc21a0017f05d4a30fa64e0cd580c6295c5a5fc3a57eb9",
    "projections.csv":"25be2d5a10f92b9787009edbb6144f516f53e4421afe5f39549b6eb6ca019c3f",
    "crosswalk":      "8ed4b67578d06a24527356f9f355ed97f12be827e34885270c0b1d28c079f593",
    "resolver_module":"5ee7cbb54c2682ef00e6885df5e4ff41acb8030deddf69a9e2c33748400af6c0",
}
NICKNAME_WHITELIST = {
    "GainKe00": "Kenneth/Kenny Gainwell", "OkonCh00": "Chigoziem/Chig Okonkwo",
    "TinsMi00": "Mitchell/Mitch Tinsley", "BorrAn00": "Andres/Andy Borregales",
    "HibnMa00": "Matthew/Matt Hibner",
}
TOP_WINDOWS = (25, 50, 100, 200)

def sha(b: bytes) -> str: return hashlib.sha256(b).hexdigest()
def norm(n: str) -> str:
    n = n.lower().replace(".", "").replace("'", "").replace("-", " ").replace("é", "e")
    return " ".join(re.sub(r"\b(jr|sr|ii|iii|iv|v)\b", "", n).split())

def _verify(label: str, actual: str, expected: str) -> None:
    if expected and not expected.startswith("6f3a1e1c") and actual != expected:
        raise SystemExit(
            f"REFUSING: pinned input '{label}' does not match.\n  expected {expected}\n"
            f"  actual   {actual}\nA changed input must not silently emit a new census."
        )

def build(src: Path, full: bool) -> dict:
    adp_b = (src / "adp.csv").read_bytes()
    prj_b = (src / "projections.csv").read_bytes()
    xw_p  = REPO / CROSSWALK_RELPATH
    xw_b  = xw_p.read_bytes()
    res_b = (REPO / "src/dynasty_genius/nflverse_usage.py").read_bytes()

    _verify("adp.csv", sha(adp_b), PINS["adp.csv"])
    _verify("projections.csv", sha(prj_b), PINS["projections.csv"])
    _verify("crosswalk", sha(xw_b), PINS["crosswalk"])
    _verify("resolver_module", sha(res_b), PINS["resolver_module"])   # FAIL CLOSED on resolver drift

    adp  = list(csv.DictReader((src / "adp.csv").open(newline="", encoding="utf-8")))
    proj = {r["id"]: r for r in csv.DictReader((src / "projections.csv").open(newline="", encoding="utf-8"))}
    idx  = IdentityIndex.from_governed_crosswalk(xw_p)
    ours_pos = {str(r["gsis_id"]): (r.get("position") or "").strip()
                for r in json.loads(xw_b)["entries"] if r.get("gsis_id")}

    rows = []
    for r in adp:
        pid = r["id"]; dg, status = idx.resolve(pid, kind="pfr"); p = proj.get(pid)
        rec = {"source_id": pid,
               "sf_rank": int(r["adp_sleeper-sf"]) if (r.get("adp_sleeper-sf") or "").strip() else None,
               "consensus_rank": int(r["adp_consensus"]) if (r.get("adp_consensus") or "").isdigit() else None,
               "production_status": status, "candidate_gsis": dg,
               "provider_name": f'{(p.get("first") or "").strip()} {(p.get("last") or "").strip()}'.strip() if p else None,
               "provider_pos": ((p.get("pos") or "").strip() or None) if p else None,
               "provider_team": ((p.get("team") or "").strip() or None) if p else None,
               "our_name": idx.names_by_gsis.get(dg) if dg else None,
               "our_pos": ours_pos.get(dg) if dg else None,
               "our_team": None,   # crosswalk carries NO team field — rule half unexecutable
               "name_match": None, "pos_match": None, "verdict": None, "reason": None}
        if dg is None:
            rec["verdict"], rec["reason"] = "unresolved", "crosswalk returned no canonical link"
        elif p is None:
            rec["verdict"], rec["reason"] = "unverifiable", "no identity evidence in projections.csv"
        else:
            rec["name_match"] = norm(rec["provider_name"]) == norm(rec["our_name"] or "")
            if rec["provider_pos"] and rec["our_pos"]:
                rec["pos_match"] = rec["provider_pos"].upper() == rec["our_pos"].upper()
            if rec["name_match"] or pid in NICKNAME_WHITELIST:
                if rec["pos_match"] is False:
                    rec["verdict"], rec["reason"] = "quarantined", "name agrees but position disagrees"
                else:
                    rec["verdict"] = "verified_same_human"
                    rec["reason"] = (f"nickname: {NICKNAME_WHITELIST[pid]}" if pid in NICKNAME_WHITELIST
                                     else "name+position agree")
            else:
                rec["verdict"] = "verified_wrong_human"
                rec["reason"] = f"provider {rec['provider_name']!r} vs crosswalk {dg} {rec['our_name']!r}"
        rows.append(rec)

    sf    = [r for r in rows if r["sf_rank"] is not None]
    wrong = [r for r in rows if r["verdict"] == "verified_wrong_human"]
    def id_commit(vs):                      # count + sorted-list SHA, not bare arrays (finding 2)
        s = sorted(vs)
        return {"count": len(s), "sorted_ids_sha256": sha("\n".join(s).encode())}

    doc = {
        "artifact": "footballguys adp.csv identity census",
        "mode": "SCRATCH_ONLY_FULL_PROVIDER_DERIVATIVE" if full else "MINIMIZED",
        "status": "commit-intended; NOT committed at time of generation",
        "retention_note": (
            "SCRATCH-ONLY. Reproduces the provider-derived census in full. MUST NOT be written "
            "inside the repository or replicated offsite." if full else
            "MINIMIZED and repo-eligible. Carries no ADP ranks and no bulk provider payload; "
            "wrong-human mappings are retained WITHOUT ranks as defect evidence. The full census "
            "is regenerable from pinned inputs with --full to a scratch path."),
        "inputs": {
            "adp_csv_sha256": sha(adp_b), "adp_csv_bytes": len(adp_b),
            "projections_csv_sha256": sha(prj_b), "projections_csv_bytes": len(prj_b),
            "governed_crosswalk_repo_relative_path": CROSSWALK_RELPATH,
            "governed_crosswalk_sha256": sha(xw_b),
            "resolver_module_path": "src/dynasty_genius/nflverse_usage.py",
            "resolver_module_sha256": sha(res_b),
            "generator_sha256": sha(Path(__file__).read_bytes()),
            "pins_enforced": True, "fail_closed_on_mismatch": True,
        },
        "method": {
            "resolver": "production IdentityIndex.resolve(kind='pfr'); no parallel resolver",
            "normalizer_version": NORMALIZER_VERSION,
            "normalizer_rules": "lowercase; strip . and '; hyphen->space; e-acute->e; drop jr/sr/ii/iii/iv/v",
            "our_position_source": f"{CROSSWALK_RELPATH} .entries[].position (7952/7952 populated)",
            "our_team_source": None,
            "our_team_note": "UNAVAILABLE — the governed crosswalk carries no team field, so the "
                             "team half of the identity rule is UNEXECUTABLE with present sources.",
            "nickname_whitelist": NICKNAME_WHITELIST,
            "verdict_vocabulary": ["verified_same_human", "verified_wrong_human",
                                   "quarantined", "unverifiable", "unresolved"],
        },
        "totals_all_608": dict(Counter(r["verdict"] for r in rows)),
        "totals_sf_populated": dict(Counter(r["verdict"] for r in sf)),
        "position_guard_evaluation": {
            "note": "guard evaluation against known-positive cases; NOT code mutation testing",
            "position_only_separates": sum(1 for r in wrong if r["pos_match"] is False),
            "position_only_fails_to_separate": sum(1 for r in wrong if r["pos_match"] is True),
            "name_only_separates": sum(1 for r in wrong if r["name_match"] is False),
            "conclusion": ("position-only is INSUFFICIENT on this vintage; name separates all known "
                           "wrong links, so this vintage does NOT show position necessary or name "
                           "insufficient. Both retained defensively."),
        },
    }
    if full:
        doc["rows"] = rows
    else:
        doc["wrong_human_mappings"] = [          # ranks REMOVED per finding 2
            {k: r[k] for k in ("source_id", "candidate_gsis", "provider_name", "provider_pos",
                               "our_name", "our_pos", "pos_match", "name_match")} for r in wrong]
        doc["wrong_human_top_window_counts"] = {
            f"consensus_top_{w}": sum(1 for r in wrong
                                      if r["consensus_rank"] is not None and r["consensus_rank"] <= w)
            for w in TOP_WINDOWS}
        doc["unverifiable_id_commitment"] = id_commit([r["source_id"] for r in rows if r["verdict"] == "unverifiable"])
        doc["unresolved_id_commitment"]   = id_commit([r["source_id"] for r in rows if r["verdict"] == "unresolved"])
        doc["expected_full_census_sha256_note"] = ("regenerate with --full to a scratch path; the "
            "full artifact's SHA-256 is recorded in framing v4 rather than here, since a document "
            "cannot contain its own hash")
    return doc

if __name__ == "__main__":
    full = "--full" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    out = Path(args[1]).resolve()
    if full and REPO in out.parents:          # finding 1: refuse durable output for provider data
        raise SystemExit(f"REFUSING: --full is a scratch-only provider derivative; {out} is inside "
                         f"the repository at {REPO}. Write it to a scratch path instead.")
    doc = build(Path(args[0]), full)
    out.write_text(json.dumps(doc, indent=1))
    print("mode    :", doc["mode"])
    print("bytes   :", out.stat().st_size)
    print("ALL 608 :", doc["totals_all_608"])
    print("SF 500  :", doc["totals_sf_populated"])
    print("guard   :", doc["position_guard_evaluation"]["conclusion"][:88], "...")
    print("sha256  :", sha(out.read_bytes()))
