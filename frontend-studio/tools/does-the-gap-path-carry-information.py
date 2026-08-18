#!/usr/bin/env python3
"""Does the two-lane gap have a PATH worth drawing, or only two endpoints?

Studio told David (2026-08-17) that the card's drift factor — "the market moved toward /
away from our board" — is the factor that compounds with the daily capture. That claim is
untested. Before any card is redesigned around it, three things get measured:

  Q1. Does OUR side move at all? If the model is frozen, "drift between two lanes" is a
      misnomer: it is one lane moving against a fixed reference, and the card must say so.
  Q2. Does the gap PATH carry information the two endpoints miss? (The 004-v3 failure
      condition, run forward: earn the time axis before drawing it.)
      Test A — within-player sd vs across-player sd.
      Test B — reversals: paths whose travel greatly exceeds their net displacement.
  Q3. Would a reader be misled by endpoints alone? Count players whose Aug-1→today sign
      disagrees with the direction of their largest sustained move.

Control, both directions: a synthetic monotonic series must report ZERO reversals and a
synthetic zig-zag must report a high reversal ratio. Printed before any real number.

Run twice; the report is deterministic (no wall clock, no sampling).
"""
import json, sqlite3, statistics as st
from pathlib import Path

P = Path("/Users/davidleess/dynasty-genius-product")
FC = sqlite3.connect(P / "app/data/fc_forward_capture.db")
MD = sqlite3.connect(P / "app/data/model_forward_capture.db")

# ── control specimens first: the instrument must convict and clear ────────────
def travel_ratio(xs):
    """total travel / |net displacement| — 1.0 = monotonic, high = reversing."""
    net = abs(xs[-1] - xs[0])
    trav = sum(abs(b - a) for a, b in zip(xs, xs[1:]))
    return float("inf") if net == 0 and trav > 0 else (trav / net if net else 1.0)

mono = [0, 1, 2, 3, 4, 5, 6, 7, 8]
zig = [0, 5, 0, 5, 0, 5, 0, 5, 8]
print("CONTROLS (run before any real number)")
print(f"  monotonic series travel ratio = {travel_ratio(mono):.2f}  (expect 1.00)")
print(f"  zig-zag   series travel ratio = {travel_ratio(zig):.2f}  (expect >> 1)")
assert abs(travel_ratio(mono) - 1.0) < 1e-9, "control failed: monotonic not clean"
assert travel_ratio(zig) > 4, "control failed: zig-zag not convicted"
print()

# ── roster ────────────────────────────────────────────────────────────────────
ART = json.load(open(P / "app/data/valuation/universe_market_divergence_latest.json"))
roster = {p["sleeper_player_id"]: (p.get("player") or {})
          for p in ART["players"] if (p.get("league_context") or {}).get("roster_id") == 1}

DATES = [r[0] for r in FC.execute(
    "SELECT DISTINCT snapshot_date FROM fc_forward_capture_joinable ORDER BY snapshot_date")]
MDATES = [r[0] for r in MD.execute(
    "SELECT DISTINCT capture_date FROM model_forward_capture_joinable ORDER BY capture_date")]
print(f"market capture days {len(DATES)} ({DATES[0]} → {DATES[-1]})")
print(f"model  capture days {len(MDATES)} ({MDATES[0]} → {MDATES[-1]})")
print()

# ── Q1. does our side move? ───────────────────────────────────────────────────
rows = MD.execute("""SELECT sleeper_id, capture_date, dynasty_value_score
                     FROM model_forward_capture_joinable
                     WHERE dynasty_value_score IS NOT NULL""").fetchall()
by_player = {}
for sid, d, v in rows: by_player.setdefault(sid, {})[d] = v
spans = [(max(s.values()) - min(s.values()), sid) for sid, s in by_player.items() if len(s) > 1]
spans.sort(reverse=True)
moved_any = [x for x in spans if x[0] > 0.5]
print("Q1 — DOES OUR SIDE MOVE? (whole capture window, all scored players)")
print(f"  players with >1 capture: {len(spans)}")
print(f"  moved > 0.5 DVS: {len(moved_any)}")
print(f"  largest single-player DVS span: {spans[0][0]:.2f}" if spans else "  no data")
# when did it last move?
last_change = None
for sid, s in by_player.items():
    ds = sorted(s)
    for a, b in zip(ds, ds[1:]):
        if abs(s[b] - s[a]) > 0.5:
            if last_change is None or b > last_change: last_change = b
print(f"  most recent day any score changed by >0.5 DVS: {last_change}")
print()

# ── build daily positional percentiles for both lanes ─────────────────────────
def market_pct_series(sid, pos):
    out = {}
    for d, rank in FC.execute("""SELECT snapshot_date, position_rank FROM fc_forward_capture_joinable
                                 WHERE sleeper_id=?""", (sid,)):
        n = FC.execute("""SELECT COUNT(*) FROM fc_forward_capture_joinable
                          WHERE position=? AND snapshot_date=?""", (pos, d)).fetchone()[0]
        if rank and n > 1: out[d] = 1 - (rank - 1) / (n - 1)
    return out

def model_pct_series(sid, pos):
    out = {}
    for d, dvs in MD.execute("""SELECT capture_date, dynasty_value_score FROM model_forward_capture_joinable
                                WHERE sleeper_id=? AND dynasty_value_score IS NOT NULL""", (sid,)):
        n, below = MD.execute("""SELECT COUNT(*), SUM(CASE WHEN dynasty_value_score < ? THEN 1 ELSE 0 END)
                                 FROM model_forward_capture_joinable
                                 WHERE position=? AND capture_date=? AND dynasty_value_score IS NOT NULL""",
                              (dvs, pos, d)).fetchone()
        if n and n > 1: out[d] = (below or 0) / (n - 1)
    return out

print("Q2/Q3 — THE GAP PATH, per rostered player")
print(f"{'player':<20}{'pos':<4}{'days':>5}{'our sd':>8}{'mkt sd':>8}{'gap sd':>8}{'travel':>8}  endpoint-vs-path")
within_sds, endpoint_deltas, misleads, rows_out = [], [], [], []
for sid, pl in sorted(roster.items(), key=lambda kv: str(kv[1].get("full_name"))):
    pos, name = pl.get("position"), pl.get("full_name")
    if pos not in ("QB", "RB", "WR", "TE"): continue
    mk, md = market_pct_series(sid, pos), model_pct_series(sid, pos)
    shared = sorted(set(mk) & set(md))
    if len(shared) < 10:
        print(f"{str(name):<20}{pos:<4}{len(shared):>5}   — too few shared days")
        continue
    ours = [md[d] for d in shared]; mkt = [mk[d] for d in shared]
    gap = [a - b for a, b in zip(ours, mkt)]
    tr = travel_ratio(gap)
    net = gap[-1] - gap[0]
    # does the endpoint sign disagree with the biggest sustained excursion?
    peak = max(gap, key=lambda g: abs(g - gap[0]))
    mislead = (peak - gap[0]) * net < 0 and abs(peak - gap[0]) > 2 * abs(net)
    if mislead: misleads.append(name)
    within_sds.append(st.pstdev(gap)); endpoint_deltas.append(net)
    rows_out.append((name, gap))
    print(f"{str(name):<20}{pos:<4}{len(shared):>5}{st.pstdev(ours):>8.3f}{st.pstdev(mkt):>8.3f}"
          f"{st.pstdev(gap):>8.3f}{tr:>8.2f}  {'MISLEADS' if mislead else ''}")

print()
print("VERDICT")
mean_within = st.mean(within_sds)
across = st.pstdev([g[-1] for _, g in rows_out])
print(f"  mean within-player gap sd (over time) : {mean_within:.3f}")
print(f"  across-player gap sd (today)          : {across:.3f}")
print(f"  ratio within/across                   : {mean_within/across:.2f}"
      f"   {'— time axis EARNED' if mean_within/across > 0.5 else '— time axis NOT earned; endpoints suffice'}")
print(f"  players whose endpoints mislead about the path: {len(misleads)} {misleads}")
