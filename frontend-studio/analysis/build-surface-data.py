#!/usr/bin/env python3
"""Emit surface-data.js for the trade-target prototype. Extends need-and-targets.py with
the owner-side depth chart behind each target (the evidence for WHY the cost is what it is)
and David's own out-of-lineup surplus (the currency he would pay with)."""
import json
from collections import defaultdict
import importlib.util

spec = importlib.util.spec_from_file_location(
    'nt', '/Users/davidleess/frontend-studio/analysis/need-and-targets.py')
nt = importlib.util.module_from_spec(spec)
spec.loader.exec_module(nt)

players, name, post, fetched = nt.load()
for p in nt.POS:
    g = [x for x in players if x['pos'] == p]
    for i, z in enumerate(sorted(g, key=lambda y: -y['v']), 1):
        z['mkt'] = i
    gm = [x for x in g if x.get('dvs') is not None]
    for i, z in enumerate(sorted(gm, key=lambda y: -y['dvs']), 1):
        z['ours'] = i
    for z in g:
        z['pool'] = len(g)
        z['poolOurs'] = len(gm)

T = defaultdict(list)
for x in players:
    T[x['rid']].append(x)

# ---- region 1: his starting nine against the league ----
per_slot = defaultdict(list)
for rid in sorted(T):
    for key, z in nt.slot_keys(nt.lineup(T[rid])[0]):
        per_slot[key].append(dict(v=z['v'], rid=rid, nm=z['nm'], pos=z['pos']))
ORDER = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'FLEX1', 'FLEX2', 'SF']
need = []
for key in ORDER:
    vals = sorted(per_slot[key], key=lambda d: -d['v'])
    mine = next(i for i, d in enumerate(vals, 1) if d['rid'] == nt.ME)
    me = next(d for d in vals if d['rid'] == nt.ME)
    med = sorted(d['v'] for d in vals)[len(vals) // 2]
    need.append(dict(slot=key, rank=mine, who=me['nm'], pos=me['pos'], mine=round(me['v']),
                     median=round(med), gap=round(me['v'] - med),
                     league=[dict(v=round(d['v']), nm=d['nm'], pos=d['pos'],
                                  team=name[d['rid']], me=(d['rid'] == nt.ME))
                             for d in vals]))

# Sleeper's REAL lineups, for honesty about the starter/bench question. 92% of slots are set
# league-wide, and they contradict a greedy market-value optimiser in 10 places -- Free Kelly bench
# Josh Allen (10,232) and start Dak Prescott (3,970). NEITHER source is authoritative in July: ours
# is inferred, theirs may not have been touched since last season. So starter/bench is recorded and
# never used as a filter or a claim. The drop-off to the replacement does not depend on it.
snap = json.load(open(nt.RUN + 'snapshot.json'))
real_start, stash = {}, {}
for r in snap['rosters']:
    s = [x for x in r['starters'] if x not in ('0', 0, None, '')]
    real_start[r['roster_id']] = dict(ids=set(s), complete=len(s) >= 9)
    stash[r['roster_id']] = dict(ir=set(r.get('reserve') or []), taxi=set(r.get('taxi') or []))
by_sid = {str(x.get('sid', x.get('sleeper_id', ''))): x for x in players}

# ---- region 2: EVERY player at each position, never a pre-filtered short list ----
mybase = nt.lv(T[nt.ME])
targets = []
for rid in sorted(T):
    base = nt.lv(T[rid])
    st, _ = nt.lineup(T[rid])
    inferred = {id(z) for _, z in st}
    rs = real_start[rid]
    for p in nt.POS:
        room = sorted([y for y in T[rid] if y['pos'] == p], key=lambda y: -y['v'])
        for d, z in enumerate(room, 1):
            without = [y for y in T[rid] if y is not z]
            # who actually enters their lineup when he leaves -- "do they have a good replacement"
            entered = ({id(y) for _, y in nt.lineup(without)[0]} - inferred)
            repl = next((y for y in without if id(y) in entered), None)
            zsid = str(z.get('sid', z.get('sleeper_id', '')))
            targets.append(dict(
                mine=(rid == nt.ME),
                nm=z['nm'], pos=p, ours=z.get('ours'), mkt=z['mkt'], pool=z['pool'],
                poolOurs=z['poolOurs'], age=z['age'], v=round(z['v']),
                owner=name[rid], posture=post[rid].title(), depth=d, held=len(room),
                inferredStart=id(z) in inferred,
                realStart=(zsid in rs['ids']) if rs['complete'] else None,
                slot=('ir' if zsid in stash[rid]['ir'] else
                      'taxi' if zsid in stash[rid]['taxi'] else 'active'),
                cost=round(base - nt.lv(without)),
                gain=(0 if rid == nt.ME else round(nt.lv(T[nt.ME] + [z]) - mybase)),
                repl=(dict(nm=repl['nm'], v=round(repl['v']), pos=repl['pos']) if repl else None),
                room=[dict(nm=y['nm'], v=round(y['v']), me=(y is z)) for y in room[:6]]))

# stable default order: quality, best first -- rank is the standing default lens, and an ordering
# rule is stable in a way that prose about a given day is not
targets.sort(key=lambda r: (r['pos'], r['mkt']))

struct = {}
for p in nt.POS:
    g = [r for r in targets if r['pos'] == p]
    others = [r for r in g if not r['mine']]
    mism = sum(1 for r in others if r['realStart'] is not None
               and r['realStart'] != r['inferredStart'])
    ownd = [r for r in g if r['mine']]
    best = min(ownd, key=lambda r: r['mkt']) if ownd else None
    struct[p] = dict(held=len(others), teams=len({r['owner'] for r in others}),
                     helps=sum(1 for r in others if r['gain'] > 0), lineupMismatch=mism,
                     iHold=len(ownd),
                     # the reference line: his own best at this position, both lanes
                     mineNm=best['nm'] if best else None,
                     mineMkt=best['mkt'] if best else None,
                     mineOurs=best['ours'] if best else None,
                     mineV=best['v'] if best else None)

# ---- his currency: everything not in his own best lineup ----
_, bench = nt.lineup(T[nt.ME])
surplus = [dict(nm=z['nm'], pos=z['pos'], v=round(z['v']), age=z['age'],
                ours=z.get('ours'), mkt=z['mkt']) for z in sorted(bench, key=lambda z: -z['v'])]

# one shared value scale per position, so a depth chart is comparable across teams rather than
# auto-scaled to its own room (the 004 N4 lesson: auto-scaling makes rows incomparable)
posMax = {p: round(max(x['v'] for x in players if x['pos'] == p)) for p in nt.POS}

out = dict(fetched=fetched, need=need, targets=targets, struct=struct, posMax=posMax,
           surplus=surplus, surplusTotal=round(sum(s['v'] for s in surplus)),
           maxSlotV=max(max(d['v'] for d in n['league']) for n in need))
open('/Users/davidleess/frontend-studio/proposals/010-who-can-i-get/surface-data.js', 'w').write(
    'window.DATA=' + json.dumps(out, separators=(',', ':')) + ';')
print(f"fetched {fetched}")
print(f"need rows {len(need)}  players shown {len(targets)}  surplus {len(surplus)}")
for k, v in struct.items():
    print(f"  {k}: {v['held']} held across {v['teams']} teams — {v['helps']} would improve him, "
          f"{v['lineupMismatch']} where Sleeper's own lineup disagrees with the optimiser")
