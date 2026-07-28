#!/usr/bin/env python3
"""Does the QB lane actually support a FINER tier ladder, or does it merely
avoid saturating at the top? Those are different claims.

A finer grain is only honest if our model RESOLVES players across the whole
range a finer tier would cut — not just at the ceiling. Measured, not assumed.
"""
import json, sqlite3, collections

MARKET = "/Users/davidleess/dynasty-genius-product/app/cache/fantasycalc/market_values.json"
MODELDB = "/Users/davidleess/dynasty-genius-product/app/data/model_forward_capture.db"

# ---- model lane: latest capture -------------------------------------------
con = sqlite3.connect(MODELDB)
cur = con.cursor()
cols = [r[1] for r in cur.execute("PRAGMA table_info(model_forward_capture_raw)")]
day = cur.execute("SELECT MAX(capture_date) FROM model_forward_capture_raw").fetchone()[0]
rows = cur.execute(
    "SELECT sleeper_id, position, dynasty_value_score FROM model_forward_capture_raw "
    "WHERE capture_date=? AND dynasty_value_score IS NOT NULL", (day,)).fetchall()
con.close()
print(f"model capture {day}: {len(rows)} rows with a DVS\n")

by_pos = collections.defaultdict(list)
for pid, pos, dvs in rows:
    if pos in ("QB", "RB", "WR", "TE"):
        by_pos[pos].append((pid, float(dvs)))

print(f"{'pos':<4}{'n':>5}{'distinct':>10}{'resolution':>12}{'at ceiling':>12}"
      f"{'ties in top24':>15}{'largest tie':>13}")
print("-" * 71)
summary = {}
for pos in ("QB", "RB", "WR", "TE"):
    vals = sorted((v for _, v in by_pos[pos]), reverse=True)
    n = len(vals)
    distinct = len(set(vals))
    ceiling = sum(1 for v in vals if v >= 100.0)
    top24 = vals[:24]
    tied_top24 = len(top24) - len(set(top24))
    counts = collections.Counter(vals)
    largest = max(counts.values())
    summary[pos] = dict(n=n, distinct=distinct, ceiling=ceiling,
                        tied_top24=tied_top24, largest=largest,
                        resolution=round(distinct / n, 3))
    print(f"{pos:<4}{n:>5}{distinct:>10}{distinct/n:>12.1%}{ceiling:>12}"
          f"{tied_top24:>15}{largest:>13}")

# ---- the real test: can a FINER cut be placed inside each 12-block? --------
# The coarse ladder cuts every 12 (the league's starting structure). A finer
# ladder would cut every 4 ("high-end / mid / low-end" within a block). So the
# question is: at each 4-boundary, is there a real value gap, or a tie?
print("\nFINER-CUT FEASIBILITY — at each sub-block boundary (every 4 ranks),")
print("is there a genuine value break, or would the cut fall inside a tie?\n")
print(f"{'pos':<4}{'cuts tested':>13}{'cut inside a tie':>19}{'median gap at cut':>20}")
print("-" * 56)
for pos in ("QB", "RB", "WR", "TE"):
    vals = sorted((v for _, v in by_pos[pos]), reverse=True)
    gaps, inside_tie, tested = [], 0, 0
    for k in range(4, min(len(vals), 48), 4):        # top 48 = the ranks a tier ladder names
        tested += 1
        above, below = vals[k - 1], vals[k]
        if above == below:
            inside_tie += 1
        gaps.append(above - below)
    gaps.sort()
    med = gaps[len(gaps) // 2] if gaps else 0
    print(f"{pos:<4}{tested:>13}{inside_tie:>19}{med:>20.2f}")
    summary[pos]["cuts_tested"] = tested
    summary[pos]["cuts_inside_tie"] = inside_tie
    summary[pos]["median_gap_at_cut"] = round(med, 3)

json.dump({"capture": day, "positions": summary},
          open("analysis/qb-grain.json", "w"), indent=1)
print("\nwritten: analysis/qb-grain.json")

# ---------------------------------------------------------------------------
# THE DECISIVE TEST. A cut is only honest if the gap it sits on is larger than
# the model's own noise. "Distinct values" is not "resolved players": two QBs
# 0.23 points apart on a 0-100 score are distinct in the float and identical in
# any meaningful sense. So: when this model DOES move a player, how far does it
# move him? If a typical move exceeds the gap at a cut, a finer tier is a
# coin-flip that will reshuffle the next time the model runs.
print("\n" + "=" * 71)
print("NOISE FLOOR — magnitude of real DVS movement, across the capture history")
print("=" * 71)
con = sqlite3.connect(MODELDB)
cur = con.cursor()
days = [r[0] for r in cur.execute(
    "SELECT DISTINCT capture_date FROM model_forward_capture_raw ORDER BY capture_date")]
series = {}
for d in days:
    series[d] = {sid: float(v) for sid, pos, v in cur.execute(
        "SELECT sleeper_id, position, dynasty_value_score FROM model_forward_capture_raw "
        "WHERE capture_date=? AND dynasty_value_score IS NOT NULL", (d,))}
con.close()

moves_by_pos = collections.defaultdict(list)
pos_of = {sid: pos for sid, pos, _ in [(r[0], r[1], r[2]) for r in []]}
# rebuild position lookup from the latest capture
con = sqlite3.connect(MODELDB)
pos_of = {sid: pos for sid, pos in con.execute(
    "SELECT sleeper_id, position FROM model_forward_capture_raw WHERE capture_date=?", (day,))}
con.close()

changed_days = 0
for a, b in zip(days, days[1:]):
    moved = [(sid, abs(series[b][sid] - series[a][sid]))
             for sid in series[a].keys() & series[b].keys()
             if series[b][sid] != series[a][sid]]
    if moved:
        changed_days += 1
        for sid, m in moved:
            p = pos_of.get(sid)
            if p in ("QB", "RB", "WR", "TE"):
                moves_by_pos[p].append(m)

print(f"{len(days)} captures, {len(days)-1} transitions, {changed_days} with any change\n")
print(f"{'pos':<4}{'moves':>8}{'median |Δ|':>13}{'p90 |Δ|':>10}"
      f"{'median gap at cut':>20}{'verdict':>26}")
print("-" * 81)
for pos in ("QB", "RB", "WR", "TE"):
    ms = sorted(moves_by_pos[pos])
    if not ms:
        print(f"{pos:<4}{0:>8}{'—':>13}{'—':>10}")
        continue
    med_move = ms[len(ms)//2]
    p90 = ms[int(len(ms)*0.9)]
    gap = summary[pos]["median_gap_at_cut"]
    ratio = med_move / gap if gap else float("inf")
    verdict = ("gap SURVIVES the noise" if ratio < 1
               else f"noise is {ratio:.0f}x the gap")
    summary[pos].update(median_move=round(med_move,3), p90_move=round(p90,3),
                        noise_to_gap=round(ratio,2))
    print(f"{pos:<4}{len(ms):>8}{med_move:>13.2f}{p90:>10.2f}{gap:>20.2f}{verdict:>26}")

json.dump({"capture": day, "positions": summary},
          open("analysis/qb-grain.json", "w"), indent=1)

# ---------------------------------------------------------------------------
# The directly interpretable form: across a real model revision, how many
# players change their COARSE tier (blocks of 12) versus their FINER sub-tier
# (blocks of 4)? A ladder whose labels churn on every model run is not a
# description of the player; it is a description of the run.
print("\n" + "=" * 71)
print("TIER STABILITY ACROSS REAL MODEL REVISIONS  (rank within position)")
print("=" * 71)
def tiers(vals_by_sid, pos_of, pos, block):
    ranked = sorted(((v, s) for s, v in vals_by_sid.items() if pos_of.get(s) == pos),
                    key=lambda t: -t[0])
    return {s: (i // block) for i, (v, s) in enumerate(ranked)}

print(f"{'pos':<4}{'revision':>24}{'n':>6}{'coarse (12) churn':>20}{'fine (4) churn':>17}")
print("-" * 71)
agg = collections.defaultdict(lambda: [0, 0, 0])
for a, b in zip(days, days[1:]):
    if all(series[a].get(s) == series[b].get(s) for s in series[a].keys() & series[b].keys()):
        continue
    for pos in ("QB", "RB", "WR", "TE"):
        ca, cb = tiers(series[a], pos_of, pos, 12), tiers(series[b], pos_of, pos, 12)
        fa, fb = tiers(series[a], pos_of, pos, 4), tiers(series[b], pos_of, pos, 4)
        shared = ca.keys() & cb.keys()
        if not shared: continue
        coarse = sum(1 for s in shared if ca[s] != cb[s])
        fine = sum(1 for s in shared if fa[s] != fb[s])
        print(f"{pos:<4}{a[5:]+'→'+b[5:]:>24}{len(shared):>6}"
              f"{coarse:>13} ({coarse/len(shared):>4.0%}){fine:>10} ({fine/len(shared):>4.0%})")
        agg[pos][0] += coarse; agg[pos][1] += fine; agg[pos][2] += len(shared)

print("-" * 71)
for pos in ("QB", "RB", "WR", "TE"):
    c, f, n = agg[pos]
    if not n: continue
    summary[pos].update(coarse_churn=round(c/n, 3), fine_churn=round(f/n, 3))
    print(f"{pos:<4}{'POOLED':>24}{n:>6}{c:>13} ({c/n:>4.0%}){f:>10} ({f/n:>4.0%})")

json.dump({"capture": day, "revisions_observed": changed_days,
           "positions": summary}, open("analysis/qb-grain.json", "w"), indent=1)
