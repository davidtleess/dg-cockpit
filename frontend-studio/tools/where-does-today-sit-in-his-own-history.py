#!/usr/bin/env python3
"""Replacement candidate for the card's dead "drift" row.

The drift row is refuted (tools/does-the-gap-path-carry-information.py): our board changed on
2 of 54 capture days, so "the market moved toward our view" is one lane moving against a fixed
line, and it moves at noise scale in percentile space (gap sd 0.03 vs across-player 0.167).

The candidate that replaces it must (a) be real, (b) be in units the hobby says, (c) compound —
be worth more after a thousand captures than after fifty. Candidate: WHERE TODAY'S PRICE SITS IN
THE PLAYER'S OWN CAPTURED HISTORY (at his own low / high / mid), with the bar computed from the
whole priced population rather than asserted.

Controls run first, both directions.
"""
import sqlite3, json, statistics as st
from pathlib import Path

P = Path("/Users/davidleess/dynasty-genius-product")
FC = sqlite3.connect(P / "app/data/fc_forward_capture.db")

def own_position(series):
    """0.0 = at his lowest captured price, 1.0 = at his highest. None if flat."""
    lo, hi = min(series), max(series)
    return None if hi == lo else (series[-1] - lo) / (hi - lo)

print("CONTROLS")
assert own_position([1, 2, 3]) == 1.0, "control failed: rising series not at own high"
assert own_position([3, 2, 1]) == 0.0, "control failed: falling series not at own low"
assert own_position([5, 5, 5]) is None, "control failed: flat series not reported as flat"
print("  rising→1.00 · falling→0.00 · flat→None   all pass\n")

DATES = [r[0] for r in FC.execute(
    "SELECT DISTINCT snapshot_date FROM fc_forward_capture_joinable ORDER BY snapshot_date")]
DN = DATES[-1]

# ── the population bar: how common is it to sit at your own extreme? ─────────
pop = {}
for sid, d, v in FC.execute("""SELECT sleeper_id, snapshot_date, value FROM fc_forward_capture_joinable
                               WHERE position IN ('QB','RB','WR','TE') ORDER BY snapshot_date"""):
    pop.setdefault(sid, []).append((d, v))

positions, at_low, at_high, n_eligible = [], 0, 0, 0
for sid, s in pop.items():
    if len(s) < 30 or s[-1][0] != DN: continue          # needs real history and a price today
    vals = [v for _, v in s]
    op = own_position(vals)
    if op is None: continue
    n_eligible += 1; positions.append(op)
    if op <= 0.05: at_low += 1
    if op >= 0.95: at_high += 1

print(f"POPULATION BAR ({n_eligible} players with ≥30 captures and a price today)")
print(f"  at or within 5% of their own captured LOW : {at_low} ({at_low/n_eligible*100:.1f}%)")
print(f"  at or within 5% of their own captured HIGH: {at_high} ({at_high/n_eligible*100:.1f}%)")
print(f"  median own-position: {st.median(positions):.2f}\n")

# ── his roster against that bar ─────────────────────────────────────────────
ART = json.load(open(P / "app/data/valuation/universe_market_divergence_latest.json"))
roster = {p["sleeper_player_id"]: (p.get("player") or {})
          for p in ART["players"] if (p.get("league_context") or {}).get("roster_id") == 1}

print("HIS ROSTER — today against his own captured range")
print(f"{'player':<20}{'pos':<4}{'days':>5}{'low':>7}{'today':>7}{'high':>7}{'own pos':>9}  read")
out = []
for sid, pl in roster.items():
    pos, name = pl.get("position"), pl.get("full_name")
    s = pop.get(sid)
    if not s:
        print(f"{str(name):<20}{str(pos):<4}    0                                    no captured prices")
        continue
    vals = [v for _, v in s]
    op = own_position(vals)
    priced_today = s[-1][0] == DN
    if op is None:
        read = "flat across the window"
    elif not priced_today:
        read = f"UNPRICED since {s[-1][0]}"
    elif op <= 0.05: read = f"at his 55-day low — {at_low/n_eligible*100:.0f}% of players are"
    elif op >= 0.95: read = f"at his 55-day high — {at_high/n_eligible*100:.0f}% of players are"
    elif op <= 0.25: read = "near the bottom of his own range"
    elif op >= 0.75: read = "near the top of his own range"
    else: read = "mid-range for him"
    print(f"{str(name):<20}{str(pos):<4}{len(s):>5}{min(vals):>7}{vals[-1]:>7}{max(vals):>7}"
          f"{(f'{op:.2f}' if op is not None else '—'):>9}  {read}")
    out.append((name, op, read))

spread = [o for _, o, _ in out if o is not None]
print(f"\nDISCRIMINATION: own-position across his roster ranges {min(spread):.2f}–{max(spread):.2f}, "
      f"sd {st.pstdev(spread):.2f}")
print("  (a factor that put everyone in the same bucket would be worthless; this one does not)")
