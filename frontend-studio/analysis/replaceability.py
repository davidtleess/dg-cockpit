#!/usr/bin/env python3
"""
Replaceability — what a player would COST his owner to lose, vs what he'd ADD to David's lineup.
Studio, 2026-07-25. Derived from David's own refinement: the tradeable asset is not merely the one
they cannot start, it is the one they can AFFORD TO LOSE because they hold a satisfactory backfill.

Inputs (both are the FRESH on-disk artifacts, NOT what the running API serves — see relay 009 P1):
  app/data/league_runtime/runs/league-20260724T132000Z/{team_value_matrix,team_posture,snapshot}.json
  app/cache/fantasycalc/market_values.json                    (fetched 2026-07-24T19:59:08Z)
  frontend-studio/analysis/league-players-2026-07-24.json     (per-player DVS pulled from /api/players/)

Method:
  best legal lineup = QB, RB, RB, WR, WR, TE, FLEX, FLEX, SUPER_FLEX, filled greedily by market value.
  cost(player) = owner's best-legal-lineup value WITH him  minus WITHOUT him.   <- their drop-off
  gain(player) = David's best-legal-lineup value WITH him   minus WITHOUT him.  <- what he adds here

DO NOT fuse cost and gain into one score. `gain - cost` was tried and is DEGENERATE: it returns a
team-pair constant (910, 910, 910 ...) because it reduces to (their replacement level - mine) and
says nothing about the player. A ratio is worse still: cost can be exactly 0, so gain/cost is
unbounded (craft/metric-validity.md sec C). Rank on quality; show cost as a second dimension.
"""
import json, sys
from collections import defaultdict
BASE='/Users/davidleess/dynasty-genius-product/app/data/league_runtime/runs/league-20260724T132000Z/'
P=[x for x in json.load(open('/Users/davidleess/frontend-studio/analysis/league-players-2026-07-24.json'))
   if x['pos'] in ('QB','RB','WR','TE') and x['v']]
tvm=json.load(open(BASE+'team_value_matrix.json')); tpo=json.load(open(BASE+'team_posture.json'))
name={t['roster_id']:(t['owner'].get('team_name') or t['owner']['display_name']) for t in tvm['teams']}
post={t['roster_id']:t['posture']['label'] for t in tpo['teams']}
POS=['QB','RB','WR','TE']; ME=1
for p in POS:
    g=[x for x in P if x['pos']==p and x.get('dvs') is not None]
    for i,z in enumerate(sorted(g,key=lambda y:-y['v']),1): z['mr']=i
    for i,z in enumerate(sorted(g,key=lambda y:-y['dvs']),1): z['dr']=i
T=defaultdict(list)
for x in P: T[x['rid']].append(x)
SLOTS=[('QB',{'QB'},1),('RB',{'RB'},2),('WR',{'WR'},2),('TE',{'TE'},1),
       ('FLEX',{'RB','WR','TE'},2),('SF',{'QB','RB','WR','TE'},1)]
def lineup(ps):
    pool=sorted(ps,key=lambda z:-z['v']); used=set(); st=[]
    for nm,al,n in SLOTS:
        c=0
        for z in pool:
            if c>=n: break
            if id(z) in used or z['pos'] not in al: continue
            used.add(id(z)); st.append((nm,z)); c+=1
    return st,[z for z in pool if id(z) not in used]
def lv(ps): return sum(z['v'] for _,z in lineup(ps)[0])
mybase=lv(T[ME])
rows=[]
for rid in sorted(T):
    if rid==ME: continue
    base=lv(T[rid]); st,_=lineup(T[rid]); startIds={id(z) for _,z in st}
    order={p:sorted([y for y in T[rid] if y['pos']==p],key=lambda y:-y['v']) for p in POS}
    for z in T[rid]:
        if z.get('dr') is None: continue
        p=z['pos']; dep=[i for i,y in enumerate(order[p],1) if y is z][0]
        rows.append(dict(nm=z['nm'],pos=p,ours=z['dr'],mkt=z['mr'],age=z['age'],v=z['v'],
            owner=name[rid],posture=post[rid],depth=dep,starter=id(z) in startIds,
            cost=base-lv([y for y in T[rid] if y is not z]), gain=lv(T[ME]+[z])-mybase))
print(json.dumps(rows,indent=1))
