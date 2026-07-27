#!/usr/bin/env python3
"""
Need-and-targets — the two halves of David's CONFIRMED question (2026-07-25):

  "who holds a player at my position of need that they can AFFORD TO LOSE —
   because the drop-off to their backfill is small?"

`replaceability.py` (2026-07-25) built only the second half. This adds the first half,
which is where the question actually begins: WHERE IS HIS HOLE, measured.

Inputs — freshest on-disk artifacts, NOT what the running API serves (relay 009 P1):
  app/data/league_runtime/runs/league-20260725T132000Z/{team_value_matrix,team_posture,snapshot}.json
  app/cache/fantasycalc/market_values.json                 (fetched_at read from the file)
  frontend-studio/analysis/league-players-2026-07-24.json  (per-player DVS; rosters verified
                                                            unchanged 07-24 -> 07-25)

Method:
  best legal lineup = QB, RB, RB, WR, WR, TE, FLEX, FLEX, SUPER_FLEX, filled greedily by market value.
  need(slot)   = David's filler value at that slot vs the same slot across all 12 teams.
  cost(player) = owner's best-legal-lineup value WITH him minus WITHOUT him.  <- their drop-off
  gain(player) = David's best-legal-lineup value WITH him minus WITHOUT him.  <- what he adds here

HONEST LIMITS, stated wherever these numbers are shown:
  * Cross-position lineup value is computed in MARKET units only. Our model's DVS cannot be
    ranked across positions (relay 009 P4: 12 players tie at exactly 100.0), so a DVS-based
    lineup optimiser would be invalid by construction. Our lane is honest WITHIN a position,
    and that is the only place this script uses it.
  * Relay 009 P2: 15 rostered ACTIVE_B players return null DVS stored as 0.0. They are EXCLUDED
    from our-lane ranks here, so our ranks run over the modelled population only. Garrett Wilson
    -- David's own market-best WR -- is one of them: we have no model view of him at all.
  * DO NOT fuse cost and gain. `gain - cost` is degenerate (a team-pair constant); `gain/cost`
    is unbounded because cost is exactly 0 for any bench player. Rank on one; show both.
"""
import json
from collections import defaultdict

RUN = '/Users/davidleess/dynasty-genius-product/app/data/league_runtime/runs/league-20260725T132000Z/'
MKT = '/Users/davidleess/dynasty-genius-product/app/cache/fantasycalc/market_values.json'
DVS = '/Users/davidleess/frontend-studio/analysis/league-players-2026-07-24.json'
ME = 1
POS = ['QB', 'RB', 'WR', 'TE']
SLOTS = [('QB', {'QB'}, 1), ('RB', {'RB'}, 2), ('WR', {'WR'}, 2), ('TE', {'TE'}, 1),
         ('FLEX', {'RB', 'WR', 'TE'}, 2), ('SF', {'QB', 'RB', 'WR', 'TE'}, 1)]


def load():
    mk = json.load(open(MKT))
    price = {}
    for row in mk['data']:
        sid = row['player'].get('sleeperId')
        if sid:
            price[str(sid)] = row['value']
    players = [x for x in json.load(open(DVS)) if x['pos'] in POS]
    for x in players:                       # refresh market value to the newer capture
        x['v'] = price.get(str(x.get('sid', x.get('sleeper_id', ''))), x['v'])
    players = [x for x in players if x['v']]
    tvm = json.load(open(RUN + 'team_value_matrix.json'))
    tpo = json.load(open(RUN + 'team_posture.json'))
    name = {t['roster_id']: (t['owner'].get('team_name') or t['owner']['display_name'])
            for t in tvm['teams']}
    post = {t['roster_id']: t['posture']['label'] for t in tpo['teams']}
    return players, name, post, mk['fetched_at']


def lineup(ps):
    pool = sorted(ps, key=lambda z: -z['v'])
    used, st = set(), []
    for nm, allowed, n in SLOTS:
        c = 0
        for z in pool:
            if c >= n:
                break
            if id(z) in used or z['pos'] not in allowed:
                continue
            used.add(id(z)); st.append((nm, z)); c += 1
    return st, [z for z in pool if id(z) not in used]


def lv(ps):
    return sum(z['v'] for _, z in lineup(ps)[0])


def slot_keys(st):
    ctr, out = defaultdict(int), []
    for nm, z in st:
        ctr[nm] += 1
        out.append((f"{nm}{ctr[nm]}" if nm in ('RB', 'WR', 'FLEX') else nm, z))
    return out


def main():
    players, name, post, fetched = load()
    for p in POS:                            # within-position ranks, both lanes
        g = [x for x in players if x['pos'] == p]
        for i, z in enumerate(sorted(g, key=lambda y: -y['v']), 1):
            z['mkt'] = i
        gm = [x for x in g if x.get('dvs') is not None]
        for i, z in enumerate(sorted(gm, key=lambda y: -y['dvs']), 1):
            z['ours'] = i

    T = defaultdict(list)
    for x in players:
        T[x['rid']].append(x)

    # ---- half one: where is his hole ----
    per_slot = defaultdict(list)
    for rid in sorted(T):
        for key, z in slot_keys(lineup(T[rid])[0]):
            per_slot[key].append((z['v'], rid, z['nm']))
    need = []
    for key, vals in per_slot.items():
        vals.sort(key=lambda t: -t[0])
        mine = next(i for i, (v, r, n) in enumerate(vals, 1) if r == ME)
        myv, mynm = next((v, n) for v, r, n in vals if r == ME)
        med = sorted(v for v, _, _ in vals)[len(vals) // 2]
        need.append(dict(slot=key, rank=mine, mine=myv, who=mynm, median=med,
                         best=vals[0][0], gap=myv - med))

    # ---- half two: who is available, and what does he cost his owner ----
    mybase = lv(T[ME])
    rows = []
    for rid in sorted(T):
        if rid == ME:
            continue
        base = lv(T[rid])
        st, _ = lineup(T[rid])
        starters = {id(z) for _, z in st}
        order = {p: sorted([y for y in T[rid] if y['pos'] == p], key=lambda y: -y['v'])
                 for p in POS}
        for z in T[rid]:
            depth = next(i for i, y in enumerate(order[z['pos']], 1) if y is z)
            rows.append(dict(nm=z['nm'], pos=z['pos'], ours=z.get('ours'), mkt=z['mkt'],
                             age=z['age'], v=z['v'], owner=name[rid], posture=post[rid],
                             depth=depth, starter=id(z) in starters,
                             cost=round(base - lv([y for y in T[rid] if y is not z])),
                             gain=round(lv(T[ME] + [z]) - mybase)))
    return dict(fetched_at=fetched, need=sorted(need, key=lambda d: d['gap']), targets=rows)


if __name__ == '__main__':
    out = main()
    json.dump(out, open('/Users/davidleess/frontend-studio/analysis/need-and-targets.json', 'w'), indent=1)
    print(f"market fetched_at {out['fetched_at']}   targets {len(out['targets'])}\n")
    print("HIS LINEUP SLOTS, weakest first (market units):")
    for d in out['need']:
        print(f"  {d['slot']:6} {d['rank']:2}/12  {d['who']:22} {d['mine']:6.0f}"
              f"  median {d['median']:6.0f}  gap {d['gap']:+7.0f}  best-in-league {d['best']:6.0f}")
