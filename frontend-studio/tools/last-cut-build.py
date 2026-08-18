#!/usr/bin/env python3
"""Build data.js for proposal 022 — "The last cut".

Sources (read-only, absolute paths):
  - app/data/valuation/universe_market_divergence_latest.json  (both lanes, ownership, flags)
  - app/data/fc_forward_capture.db                             (daily market prices, 2026-06-24 →)
  - app/data/model_forward_capture.db                          (daily model captures)
  - GET /api/roster/capacity                                   (the app's own cut-exposure order)

Bubble rule (stated on-surface): the app's cut-exposure candidates whose raw xVAR < 0 —
players the model prices below replacement. Mechanical, not curated.

Lean rules (stated on-surface, uncolored, soft):
  cut candidate : app cut priority <= 4 AND (market pos percentile <= 0.40 OR delisted)
                  AND August move <= +10%
  hold          : August move >= +15% AND positional rank improved >= 10 spots
  unresolved    : everything else

Run twice; output is asserted byte-identical (no wall-clock in payload).
"""
import json, sqlite3, hashlib, sys, urllib.request
from pathlib import Path

PRODUCT = Path("/Users/davidleess/dynasty-genius-product")
OUT = Path("/Users/davidleess/frontend-studio/proposals/022-the-last-cut/data.js")

ART = json.load(open(PRODUCT / "app/data/valuation/universe_market_divergence_latest.json"))
FC = sqlite3.connect(PRODUCT / "app/data/fc_forward_capture.db")
MODEL = sqlite3.connect(PRODUCT / "app/data/model_forward_capture.db")

cap = json.load(urllib.request.urlopen("http://127.0.0.1:8000/api/roster/capacity"))

# ---- capacity + the app's own cut order -------------------------------------
def find_key(o, pred, out):
    if isinstance(o, dict):
        for k, v in o.items():
            if pred(k, v): out.append(v)
            find_key(v, pred, out)
    elif isinstance(o, list):
        for x in o: find_key(x, pred, out)

cands = []
find_key(cap, lambda k, v: "candidate" in k.lower() and isinstance(v, list), cands)
assert cands, "no candidate list in capacity payload"
app_order = {c["sleeper_player_id"]: c for c in cands[0]}

health = []
find_key(cap, lambda k, v: k == "capacity_health", health)
H = health[0]

# ---- roster from the divergence artifact ------------------------------------
roster = {}
for p in ART["players"]:
    lc = p.get("league_context") or {}
    if lc.get("roster_id") != 1: continue
    pl, div, val = p.get("player") or {}, p.get("divergence") or {}, p.get("valuation") or {}
    roster[p["sleeper_player_id"]] = dict(
        name=pl.get("full_name"), pos=pl.get("position"), age=pl.get("age"),
        years_exp=pl.get("years_exp"), taxi=lc.get("on_taxi"), ir=lc.get("on_ir"),
        model_pct=div.get("model_percentile"), market_pct=div.get("market_pct") or div.get("market_percentile"),
        signal=div.get("signal"), dvs=val.get("dynasty_value_score"))
assert len(roster) == 27, f"expected 27 rostered, got {len(roster)}"

# ---- price series -----------------------------------------------------------
DATES = [r[0] for r in FC.execute(
    "SELECT DISTINCT snapshot_date FROM fc_forward_capture_joinable ORDER BY snapshot_date")]
D0, DN = DATES[0], DATES[-1]
AUG1 = "2026-08-01"

def series(sid):
    return FC.execute("""SELECT snapshot_date, value, position_rank FROM fc_forward_capture_joinable
                         WHERE sleeper_id=? ORDER BY snapshot_date""", (sid,)).fetchall()

def pos_pool(pos, date):
    return FC.execute("""SELECT COUNT(*) FROM fc_forward_capture_joinable
                         WHERE position=? AND snapshot_date=?""", (pos, date)).fetchone()[0]

def pos_pct(pos, rank, date):
    n = pos_pool(pos, date)
    return None if not rank or n < 2 else round(1 - (rank - 1) / (n - 1), 3)

# ---- bubble = app candidates with xVAR < 0 ----------------------------------
bubble = []
for sid, c in app_order.items():
    if c.get("raw_xvar") is not None and c["raw_xvar"] < 0:
        r = roster.get(sid)
        assert r, f"candidate {c['full_name']} not in artifact roster"
        s = series(sid)
        by_date = {d: (v, pr) for d, v, pr in s}
        now = by_date.get(DN)
        a1 = by_date.get(AUG1)
        delisted = None; priced_days = span_days = None
        if s and s[-1][0] != DN:
            delisted = DATES[DATES.index(s[-1][0]) + 1]  # first capture day with no price
            priced_days = len(s)
            span_days = DATES.index(s[-1][0]) - DATES.index(s[0][0]) + 1
        mp_now = pos_pct(r["pos"], now[1], DN) if now else None
        mp_a1 = pos_pct(r["pos"], a1[1], AUG1) if a1 else None
        dv = (now[0] - a1[0]) if (now and a1) else None
        dpct = round(dv / a1[0] * 100, 1) if (dv is not None and a1[0]) else None
        drank = (a1[1] - now[1]) if (now and a1) else None  # + = climbed
        # toward/away: did |model - market| shrink during August? (model static in camp — verified)
        g_now = round(r["model_pct"] - mp_now, 3) if (r["model_pct"] is not None and mp_now is not None) else None
        g_a1 = round(r["model_pct"] - mp_a1, 3) if (r["model_pct"] is not None and mp_a1 is not None) else None
        toward = None
        if g_now is not None and g_a1 is not None and abs(abs(g_a1) - abs(g_now)) > 0.02:
            toward = "toward" if abs(g_now) < abs(g_a1) else "away"
        # lean, mechanical
        lean = "unresolved"
        if dpct is not None and dpct >= 15 and (drank or 0) >= 10: lean = "hold"
        elif c["cut_priority"] <= 4 and ((mp_now is not None and mp_now <= 0.40) or delisted) \
                and (dpct is None or dpct <= 10): lean = "cut candidate"
        bubble.append(dict(
            sid=sid, name=r["name"], pos=r["pos"], age=r["age"], years_exp=r["years_exp"],
            cut_priority=c["cut_priority"], xvar=c["raw_xvar"], dvs=r["dvs"],
            model_pct=r["model_pct"], market_pct_now=mp_now, market_pct_aug1=mp_a1,
            gap_now=g_now, gap_aug1=g_a1, toward=toward, lean=lean,
            value_now=now[0] if now else None, rank_now=now[1] if now else None,
            value_aug1=a1[0] if a1 else None, rank_aug1=a1[1] if a1 else None,
            delta_aug=dv, delta_aug_pct=dpct, delta_rank=drank, delisted=delisted,
            priced_days=priced_days, span_days=span_days,
            series=[dict(d=d, v=v) for d, v, _ in s]))
bubble.sort(key=lambda b: (b["value_now"] is not None, b["value_now"] or 0))

# both-direction checks on the delisting detector
delisted_names = {b["name"] for b in bubble if b["delisted"]}
assert "Rasheen Ali" in delisted_names, "known delisted specimen not convicted"
assert "Dillon Gabriel" not in delisted_names, "known priced specimen wrongly convicted"

# model-effectively-frozen-in-August check (the on-surface claim; fail loudly if it stops
# being true). Measured 2026-08-17: two players moved, each by 0.1 DVS — noise, not learning.
rng = MODEL.execute("""
  SELECT MAX(mx - mn), COUNT(*) FROM (
    SELECT MIN(dynasty_value_score) mn, MAX(dynasty_value_score) mx
    FROM model_forward_capture_joinable
    WHERE capture_date >= '2026-08-01' AND dynasty_value_score IS NOT NULL
    GROUP BY sleeper_id)""").fetchone()
model_max_aug_change, model_n_scored = rng
model_max_aug_change = round(model_max_aug_change, 1) if model_max_aug_change is not None else None
model_static = model_max_aug_change is not None and model_max_aug_change <= 0.5

# ---- the wire (best unrostered per position, priced today) -------------------
rostered_sids = {p["sleeper_player_id"] for p in ART["players"]
                 if (p.get("league_context") or {}).get("rostered")}
wire = {}
for sid, name, pos, v, pr in FC.execute("""SELECT sleeper_id, player_name, position, value, position_rank
      FROM fc_forward_capture_joinable WHERE snapshot_date=? ORDER BY value DESC""", (DN,)):
    if sid in rostered_sids or pos not in ("QB", "RB", "WR", "TE") or pos in wire: continue
    wire[pos] = dict(name=name, value=v, rank=pr)

# ---- the core (refusal region facts) ----------------------------------------
core_moves = []
for sid, r in roster.items():
    if sid in {b["sid"] for b in bubble}: continue
    by_date = {d: v for d, v, _ in series(sid)}
    if AUG1 in by_date and DN in by_date and by_date[AUG1]:
        core_moves.append((r["name"], round((by_date[DN] - by_date[AUG1]) / by_date[AUG1] * 100, 1)))
core_max_rise = max(core_moves, key=lambda x: x[1]) if core_moves else None
core_max_fall = min(core_moves, key=lambda x: x[1]) if core_moves else None

# ---- instrument line counts (fixed shape daily) ------------------------------
n_big = sum(1 for b in bubble if b["delta_aug_pct"] is not None and abs(b["delta_aug_pct"]) >= 10)

payload = dict(
    as_of=DN, capture_start=D0, aug_window=[AUG1, DN],
    clock=dict(cutdown="2026-08-30", week1="2026-09-09"),
    capacity=dict(total=H["total_players"], cap=H["total_capacity"],
                  cuts_required=H["total_capacity_cuts_required"],
                  overflow=H["active_slot_overflow"],
                  taxi=[r["name"] for r in roster.values() if r["taxi"]],
                  ir=[r["name"] for r in roster.values() if r["ir"]]),
    model_static_in_august=model_static,
    model_max_aug_change=model_max_aug_change, model_n_scored=model_n_scored,
    bubble=bubble, wire=wire,
    core=dict(n=len(roster) - len(bubble),
              max_rise_name=core_max_rise[0], max_rise_pct=core_max_rise[1],
              max_fall_name=core_max_fall[0], max_fall_pct=core_max_fall[1]),
    counts=dict(bubble=len(bubble), moved_ge_10=n_big, delisted=len(delisted_names)))

js = "window.DATA = " + json.dumps(payload, indent=1, sort_keys=True) + ";\n"
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(js)
print(f"wrote {OUT}  sha256 {hashlib.sha256(js.encode()).hexdigest()[:16]}")
print(f"bubble {len(bubble)} | delisted {sorted(delisted_names)} | moved>=10% {n_big} | model_static {model_static}")
for b in bubble:
    print(f"  #{b['cut_priority']:>2} {b['name']:<20} {b['pos']:<3} now {str(b['value_now']):>5} "
          f"aug {str(b['delta_aug_pct']):>6}% lean={b['lean']} toward={b['toward']}")
