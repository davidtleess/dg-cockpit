#!/usr/bin/env python3
"""Build data.js for proposal 023 — the player card as a standard unit.

WHY THIS EXISTS, AND WHAT IT RETRACTS
David kept the card form from 022 ("the player cards are cool") and killed its calendar.
Carrying the card forward meant testing its factors rather than reusing them, and one failed:

  RETRACTED — "August drift: the market moved toward / away from our board's view."
  Measured (tools/does-the-gap-path-carry-information.py): our board changed on 2 of 54
  capture days (2026-06-26, then a 0.1-DVS twitch on 08-14). So it is not two lanes drifting;
  it is one lane moving against a fixed line. And in percentile space the gap moves at noise
  scale — mean within-player sd 0.030 against 0.167 across players (ratio 0.18: the time axis
  is NOT earned, the same test that killed 004 v3).

  REPLACED BY — the player's own captured band. Where today's price sits inside the range the
  app itself has recorded, drawn so the BAND'S WIDTH is visible rather than normalised away.
  That correction matters: "at his 55-day low" is true of Garrett Wilson (7% band — the market
  has barely moved him) and of Mac Jones (43% band — a collapse), and a mark that renders them
  identically is the collapse-an-asset-into-one-number error of 2026-07-24.

The band is drawn on a shared axis of percent-of-own-high, so rows are comparable (the 004 N4
auto-scale defect), and every read names the population bar it rests on, computed here.
"""
import json, sqlite3, hashlib, statistics as st
from pathlib import Path

P = Path("/Users/davidleess/dynasty-genius-product")
OUT = Path("/Users/davidleess/frontend-studio/proposals/023-the-player-card/data.js")

FC = sqlite3.connect(P / "app/data/fc_forward_capture.db")
MD = sqlite3.connect(P / "app/data/model_forward_capture.db")
ART = json.load(open(P / "app/data/valuation/universe_market_divergence_latest.json"))

DATES = [r[0] for r in FC.execute(
    "SELECT DISTINCT snapshot_date FROM fc_forward_capture_joinable ORDER BY snapshot_date")]
DN = DATES[-1]

# ── the population bars, computed (never asserted on-surface) ────────────────
pop = {}
for sid, d, v, pos in FC.execute("""SELECT sleeper_id, snapshot_date, value, position
      FROM fc_forward_capture_joinable WHERE position IN ('QB','RB','WR','TE') ORDER BY snapshot_date"""):
    pop.setdefault(sid, []).append((d, v))

bands, at_low, at_high, n_pop = [], 0, 0, 0
for sid, s in pop.items():
    if len(s) < 30 or s[-1][0] != DN: continue
    vals = [v for _, v in s]; lo, hi = min(vals), max(vals)
    if hi == lo or hi == 0: continue
    n_pop += 1; bands.append((hi - lo) / hi)
    op = (vals[-1] - lo) / (hi - lo)
    if op <= 0.05: at_low += 1
    if op >= 0.95: at_high += 1
qs = st.quantiles(bands, n=100)
POP = dict(n=n_pop, at_low_pct=round(at_low / n_pop * 100, 1), at_high_pct=round(at_high / n_pop * 100, 1),
           band_p10=round(qs[9] * 100, 1), band_p50=round(qs[49] * 100, 1), band_p90=round(qs[89] * 100, 1))

# ── our board's movement, so the card can state it honestly ─────────────────
mrows = MD.execute("""SELECT sleeper_id, capture_date, dynasty_value_score
                      FROM model_forward_capture_joinable WHERE dynasty_value_score IS NOT NULL""").fetchall()
mby = {}
for sid, d, v in mrows: mby.setdefault(sid, {})[d] = v
change_days = sorted({b for s in mby.values() for a, b in zip(sorted(s), sorted(s)[1:]) if abs(s[b] - s[a]) > 0.0})
MODEL = dict(capture_days=len({d for _, d, _ in mrows}), change_days=change_days,
             last_material_change=max((b for s in mby.values() for a, b in zip(sorted(s), sorted(s)[1:])
                                       if abs(s[b] - s[a]) > 0.5), default=None))

# ── roster + the wire ───────────────────────────────────────────────────────
roster, rostered_sids = {}, set()
for p in ART["players"]:
    lc = p.get("league_context") or {}
    if lc.get("rostered"): rostered_sids.add(p["sleeper_player_id"])
    if lc.get("roster_id") != 1: continue
    pl, div, val = p.get("player") or {}, p.get("divergence") or {}, p.get("valuation") or {}
    roster[p["sleeper_player_id"]] = dict(
        name=pl.get("full_name"), pos=pl.get("position"), age=pl.get("age"),
        model_pct=div.get("model_percentile"), dvs=val.get("dynasty_value_score"),
        # DVS is projection_2y x a per-position constant, clipped [0,100] (measured 2026-08-17,
        # craft/foundation/facts.json). The projection is the SAME quantity in the hobby's own
        # unit, so the surface speaks points per game and keeps DVS as a parenthetical at most.
        ppg_2y=p.get("projection_2y"),
        on_ir=lc.get("on_ir"), on_taxi=lc.get("on_taxi"))

wire = {}
for sid, name, pos, v, pr in FC.execute("""SELECT sleeper_id, player_name, position, value, position_rank
      FROM fc_forward_capture_joinable WHERE snapshot_date=? ORDER BY value DESC""", (DN,)):
    if sid in rostered_sids or pos not in ("QB", "RB", "WR", "TE") or pos in wire: continue
    wire[pos] = dict(name=name, value=v, rank=pr)

def pos_pct(pos, rank, date):
    n = FC.execute("SELECT COUNT(*) FROM fc_forward_capture_joinable WHERE position=? AND snapshot_date=?",
                   (pos, date)).fetchone()[0]
    return None if not rank or n < 2 else round(1 - (rank - 1) / (n - 1), 3)

def card(sid):
    r = roster[sid]; s = pop.get(sid, [])
    vals = [v for _, v in s]
    priced_today = bool(s) and s[-1][0] == DN
    lo, hi = (min(vals), max(vals)) if vals else (None, None)
    band = round((hi - lo) / hi * 100, 1) if hi else None
    op = round((vals[-1] - lo) / (hi - lo), 3) if (vals and hi != lo) else None
    below_high = round((hi - vals[-1]) / hi * 100, 1) if hi else None
    rank_row = FC.execute("""SELECT position_rank FROM fc_forward_capture_joinable
                             WHERE sleeper_id=? AND snapshot_date=?""", (sid, DN)).fetchone()
    rank_now = rank_row[0] if rank_row else None
    band_vs_pop = None
    if band is not None:
        band_vs_pop = ("narrower than 9 in 10 players" if band <= POP["band_p10"] else
                       "wider than 9 in 10 players" if band >= POP["band_p90"] else
                       "narrow — most players' bands are wider" if band < POP["band_p50"] else
                       "wider than the typical player's")
    return dict(sid=sid, name=r["name"], pos=r["pos"], age=r["age"], dvs=r["dvs"], ppg_2y=r["ppg_2y"],
                on_ir=r["on_ir"], on_taxi=r["on_taxi"],
                model_pct=r["model_pct"], market_pct=pos_pct(r["pos"], rank_now, DN),
                rank_now=rank_now, value_now=vals[-1] if vals else None,
                low=lo, high=hi, band_pct=band, own_pos=op, below_high=below_high,
                band_vs_pop=band_vs_pop, priced_today=priced_today,
                last_priced=s[-1][0] if s else None, priced_days=len(s),
                wire=wire.get(r["pos"]),
                series=[dict(d=d, v=v) for d, v in s])

CASES = {
    "Mac Jones":        "the cut",
    "Dillon Gabriel":   "the collapse",
    "Rasheen Ali":      "the absence",
    "Garrett Wilson":   "the non-event",
    "Rome Odunze":      "the event",
    "Pat Bryant":       "the riser",
}
by_name = {r["name"]: sid for sid, r in roster.items()}
cards = [dict(card(by_name[n]), case=CASES[n]) for n in CASES if n in by_name]
assert len(cards) == len(CASES), f"missing case players: {set(CASES) - set(by_name)}"

# both-direction assertions on the band mark's discrimination
w = next(c for c in cards if c["name"] == "Garrett Wilson")
m = next(c for c in cards if c["name"] == "Mac Jones")
assert w["own_pos"] == 0.0 and m["own_pos"] == 0.0, "specimens no longer share an own-position"
assert w["band_pct"] < 10 and m["band_pct"] > 40, \
    "the band must separate two players the normalised figure renders identically"

payload = dict(as_of=DN, capture_start=DATES[0], capture_days=len(DATES),
               population=POP, model=MODEL, cards=cards,
               roster_n=len(roster), wire=wire)
js = "window.DATA = " + json.dumps(payload, indent=1, sort_keys=True) + ";\n"
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(js)
print(f"wrote {OUT}  sha256 {hashlib.sha256(js.encode()).hexdigest()[:16]}")
print(f"population n={POP['n']} · band p10/p50/p90 = {POP['band_p10']}/{POP['band_p50']}/{POP['band_p90']}%"
      f" · at own low {POP['at_low_pct']}% · at own high {POP['at_high_pct']}%")
print(f"our board changed on {len(MODEL['change_days'])} of {MODEL['capture_days']} capture days: {MODEL['change_days']}")
for c in cards:
    print(f"  {c['case']:<14} {c['name']:<18} band {str(c['band_pct']):>5}% · own-pos {str(c['own_pos']):>5}"
          f" · {'priced' if c['priced_today'] else 'UNPRICED since ' + str(c['last_priced'])}")
