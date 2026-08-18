#!/usr/bin/env python3
"""Where does the age cliff actually land, per position?

WHY. The product hard-codes age-cliff thresholds — RB 26, WR 28, TE 30, QB 33 — and the Layer-2
dynasty research returned a contradicting figure for backs (26 flat, 27 the real drop). A shipped
constant is not corrected on the strength of a web citation, so this measures it in-house against
the app's own eight seasons before anything is claimed.

METHOD
  production : app/data/nflverse_usage.db → ff_opportunity, weekly, 2018-2025
  age        : contracts.date_of_birth joined on gsis_id; age taken at Sept 1 of the season
  unit       : PPR fantasy points per game (total_fantasy_points), regular season only
  test       : same player, season N → N+1, keyed by his age in season N

TWO KNOWN TRAPS, BOTH HANDLED
  1. Postseason contamination. Weeks past the regular season inflate per-game rates for exactly
     the players on good teams (caught 2026-08-08 in how-the-hobby-speaks). Weeks are filtered.
  2. Survivorship. A player who is gone next season is the most severe decline there is, and
     dropping him biases every cliff toward flatness. Reported BOTH ways, always.

CONTROLS run before any real number, in both directions.
"""
import sqlite3, statistics as st
from datetime import date
from pathlib import Path

DB = Path("/Users/davidleess/dynasty-genius-product/app/data/nflverse_usage.db")
db = sqlite3.connect(DB)

# ── controls ────────────────────────────────────────────────────────────────
def pct_change(a, b): return None if not a else (b - a) / a * 100
print("CONTROLS")
assert pct_change(10, 5) == -50.0, "control failed: halving is not -50%"
assert pct_change(10, 20) == 100.0, "control failed: doubling is not +100%"
assert pct_change(0, 5) is None, "control failed: zero base not guarded"
print("  halving → -50% · doubling → +100% · zero base → None    pass")

weeks = db.execute("SELECT DISTINCT week FROM ff_opportunity ORDER BY CAST(week AS INTEGER)").fetchall()
wk = sorted(int(w[0]) for w in weeks)
print(f"  weeks present in source: {wk[0]}–{wk[-1]}  (regular season kept: 1–18)")

# scoring sanity: the 2025 leaders must be recognisable names, or the unit is wrong
top = db.execute("""SELECT full_name, position, ROUND(SUM(total_fantasy_points),1) pts
                    FROM ff_opportunity WHERE season='2025' AND CAST(week AS INTEGER)<=18
                    GROUP BY player_id ORDER BY pts DESC LIMIT 5""").fetchall()
print(f"  2025 scoring leaders (sanity): {', '.join(f'{n} {p}' for n,_,p in top)}\n")

# ── birth dates ─────────────────────────────────────────────────────────────
# The source stores "November 29, 1988", not ISO. The first draft assumed ISO, parsed nothing, and
# the study ran on an EMPTY POPULATION — which the tool reported as "no measurable transitions"
# rather than as a pass. That is craft principle 11 earning its keep: a pass on an empty population
# would have been a claim about something never examined.
from datetime import datetime
dob, unparsed = {}, 0
for gsis, d in db.execute("""SELECT gsis_id, MIN(date_of_birth) FROM contracts
                             WHERE gsis_id IS NOT NULL AND gsis_id <> ''
                               AND date_of_birth IS NOT NULL AND date_of_birth <> ''
                             GROUP BY gsis_id"""):
    parsed = None
    for fmt in ("%B %d, %Y", "%Y-%m-%d", "%m/%d/%Y"):
        try: parsed = datetime.strptime(str(d).strip(), fmt).date(); break
        except ValueError: continue
    if parsed: dob[gsis] = parsed
    else: unparsed += 1
assert dob, "birth-date parse produced an empty population — refusing to report on nothing"
print(f"birth dates resolved for {len(dob):,} players ({unparsed} unparseable)")
_spot = dob.get("00-0029263")
assert _spot and _spot.year == 1988, "known specimen (Russell Wilson, 1988) failed to parse"
print(f"  spot check — Russell Wilson d.o.b. {_spot}, age at 2025 season "
      f"{(date(2025, 9, 1) - _spot).days / 365.25:.1f}")

# ── player-seasons ──────────────────────────────────────────────────────────
rows = db.execute("""SELECT player_id, full_name, position, season,
                            COUNT(*) g, SUM(total_fantasy_points) pts
                     FROM ff_opportunity
                     WHERE CAST(week AS INTEGER) <= 18 AND position IN ('QB','RB','WR','TE')
                     GROUP BY player_id, season""").fetchall()
ps = {}
for pid, name, pos, season, g, pts in rows:
    if pid not in dob or not g: continue
    s = int(season); b = dob[pid]
    age = (date(s, 9, 1) - b).days / 365.25
    ps[(pid, s)] = dict(name=name, pos=pos, g=g, ppg=(pts or 0) / g, age=age)
print(f"player-seasons with age and production: {len(ps):,}\n")

MIN_G = 8          # a season thin enough to be noise is not evidence of a cliff
SEASONS = range(2018, 2025)

# ── THE CONFOUND, measured before the table is read ─────────────────────────
# Conditioning on "played >=8 games" selects players having a good season, so the NEXT season
# regresses toward the mean regardless of age. If every bucket declines by a similar amount, the
# decline is that selection effect and not ageing. The baseline makes the ageing signal the
# DIFFERENCE from it rather than the raw number.
base = []
for (pid, s), a in ps.items():
    if s not in SEASONS or a["g"] < MIN_G: continue
    nxt = ps.get((pid, s + 1))
    if nxt and nxt["g"] >= 1:
        c = pct_change(a["ppg"], nxt["ppg"])
        if c is not None: base.append(c)
BASELINE = st.median(base)
print(f"REGRESSION BASELINE — median year-over-year change for ALL qualifying player-seasons,")
print(f"every position and age pooled: {BASELINE:+.1f}%  (n={len(base):,})")
print("Read every row below against this, not against zero.\n")

print(f"AGE TRANSITIONS — same player, season N → N+1, ≥{MIN_G} games in season N")
print(f"{'pos':<4}{'age N':>6}{'n':>5}{'played':>7}{'median':>9}{'vs base':>9}{'%decl':>7}"
      f"{'gone':>6}{'incl.gone':>11}")
findings = {}
for pos in ("RB", "WR", "TE", "QB"):
    for age_bucket in range(22, 33):
        survived, all_incl, gone = [], [], 0
        for (pid, s), a in ps.items():
            if a["pos"] != pos or s not in SEASONS or a["g"] < MIN_G: continue
            if not (age_bucket <= a["age"] < age_bucket + 1): continue
            nxt = ps.get((pid, s + 1))
            if nxt and nxt["g"] >= 1:
                ch = pct_change(a["ppg"], nxt["ppg"])
                if ch is not None: survived.append(ch); all_incl.append(ch)
            else:
                gone += 1; all_incl.append(-100.0)      # gone is a total loss, not a missing row
        if len(all_incl) < 12: continue
        med = st.median(survived) if survived else float("nan")
        dec = sum(1 for c in survived if c < 0) / len(survived) * 100 if survived else float("nan")
        med_all = st.median(all_incl)
        findings[(pos, age_bucket)] = (len(all_incl), med, dec, gone, med_all)
        flag = "  <<<" if (med - BASELINE) <= -10 else ""
        print(f"{pos:<4}{age_bucket:>6}{len(all_incl):>5}{len(survived):>7}{med:>8.1f}%{med-BASELINE:>+9.1f}"
              f"{dec:>6.0f}%{gone:>6}{med_all:>10.1f}%{flag}")
    print()

print("WHERE THE CODE PUTS THE CLIFF vs WHERE THE DATA PUTS IT")
CODE = {"RB": 26, "WR": 28, "TE": 30, "QB": 33}
for pos, coded in CODE.items():
    rowsp = [(a, v) for (p, a), v in findings.items() if p == pos]
    if not rowsp: print(f"  {pos}: no measurable transitions"); continue
    rowsp.sort()
    # the cliff = the first age at which the median surviving player loses ground materially
    cliff = next((a for a, v in rowsp if v[1] == v[1] and (v[1] - BASELINE) <= -10), None)
    at_coded = dict(rowsp).get(coded)
    print(f"  {pos}: code says {coded}. "
          f"at {coded}: {'no sample' if not at_coded else f'median {at_coded[1]:+.1f}%, {at_coded[2]:.0f}% declining (n={at_coded[0]})'}"
          f" · first age ≥10 points WORSE than the regression baseline: {cliff if cliff else 'none in range'}")
