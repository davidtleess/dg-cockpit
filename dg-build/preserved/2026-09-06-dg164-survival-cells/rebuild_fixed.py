"""REBUILD with a TIE-ROBUST bar.

DEFECT FOUND 2026-09-05: the bar was located with `rank == N` under method='min'.
When two players tie at rank N-1, rank N is SKIPPED and the lookup returns nothing ->
bar = NaN -> every margin that season = NaN -> qcut drops those rows SILENTLY.
Hit WR 2024: 284 cohort-year observations, 71 players, 3.3% of the WR sample, gone
with no error. Fixed by taking the N-th largest value, which always exists.
"""
import numpy as np, pandas as pd, json
from pathlib import Path
SP=Path("/private/tmp/claude-501/-Users-davidleess/a4d5049a-c405-4f8e-962a-cb0817a24bfd/scratchpad")
BAR={"QB":37,"RB":45,"WR":71,"TE":21}; MIN_N=12; H=5
BMAP={0:0,1:0,2:0,3:1,4:1,5:2,6:3,7:4,8:5,9:6}
LBL={0:"m0 (deciles 0-2)",1:"m1 (d3-4)",2:"m2 (d5)",3:"m3 (d6)",4:"m4 (d7)",5:"m5 (d8)",6:"m6 (d9, top)"}
d=pd.read_parquet(SP/"panel.parquet")
d["birth_date"]=pd.to_datetime(d.birth_date,errors="coerce")
d["age"]=(pd.to_datetime(dict(year=d.season,month=9,day=1))-d.birth_date).dt.days/365.25
d=d[d.age.notna()&d.age.between(19,45)]
d["rank"]=d.groupby(["season","position"])["points"].rank(ascending=False,method="min")
# TIE-ROBUST: the N-th largest, which exists whenever the group has >= N rows.
def nth(g,col,n): 
    v=g[col].nlargest(n)
    return v.iloc[-1] if len(v)>=n else np.nan
bars=[]
for (s,p),g in d.groupby(["season","position"]):
    if p not in BAR: continue
    n=BAR[p]
    bars.append(dict(season=s,position=p,bar_pts=nth(g,"points",n),
                     bar_ppg=g.nlargest(n,"points").ppg.iloc[-1] if len(g)>=n else np.nan))
b=pd.DataFrame(bars)
miss=b[b.bar_pts.isna()]
print(f"season/position groups lacking {list(BAR.values())} players: {len(miss)}"
      + (f"  -> {miss[['season','position']].values.tolist()}" if len(miss) else "  (none)"))
d=d.merge(b,on=["season","position"],how="inner")
d["margin"]=d.ppg/d.bar_ppg; d["vor"]=d.points-d.bar_pts
d["ok"]=d.apply(lambda r:r["rank"]<=BAR[r.position],axis=1)
print(f"NaN margins after fix: {d.margin.isna().sum()}  (was 284)")
ok=set(zip(d.loc[d.ok,"player_id"],d.loc[d.ok,"season"]))
vor=dict(zip(zip(d.player_id,d.season),d.vor)); MAXS=d.season.max()
rows=[]
for _,r in d[d.ok].iterrows():
    for k in range(1,H+1):
        if r.season+k>MAXS: continue
        rows.append(dict(player_id=r.player_id,position=r.position,age=r.age,margin=r.margin,
                         vor0=r.vor,k=k,ok_k=(r.player_id,r.season+k) in ok,
                         vor_k=vor.get((r.player_id,r.season+k),np.nan)))
f=pd.DataFrame(rows)
assert f.margin.notna().all(), "margin still has NaN"
f["md"]=f.groupby("position")["margin"].transform(lambda s: pd.qcut(s,10,labels=False,duplicates="drop"))
assert f.md.notna().all(), "decile assignment dropped rows"
f["mb"]=f.md.map(BMAP)
f["ageb"]=pd.cut(f.age,[19,23,25,27,29,31,45],labels=["<=23","24-25","26-27","28-29","30-31","32+"])
f["vor_h"]=np.where(f.ok_k,f.vor_k.fillna(0).clip(lower=0),0.0)
f.to_parquet(SP/"followup_FIXED.parquet")
print(f"cohort-year observations {len(f)} (was 20885)  players {f.player_id.nunique()} (was 1232)")
edges={p:[-np.inf]+list(np.quantile(f[f.position==p].margin,[.3,.5,.6,.7,.8,.9]))+[np.inf] for p in BAR}
rng=np.random.default_rng(20260905)
def Rv(s):
    d0=s.groupby("player_id").vor0.first().mean()
    return [float(s[s.k==k].vor_h.mean()/d0) if (s.k==k).any() and d0>0 else None for k in range(1,H+1)], float(d0)
cells=[];sup=[]
for pos in BAR:
    for a in f.ageb.cat.categories:
        for bidx in range(7):
            s=f[(f.position==pos)&(f.ageb==a)&(f.mb==bidx)]
            n=s[s.k==1].player_id.nunique()
            e=edges[pos]
            base=dict(position=pos,ageband=str(a),margin_bin=LBL[bidx],
                      edge_lo=(None if not np.isfinite(e[bidx]) else round(float(e[bidx]),6)),
                      edge_hi=(None if not np.isfinite(e[bidx+1]) else round(float(e[bidx+1]),6)),n=int(n))
            if n<MIN_N: sup.append(base); continue
            r,d0=Rv(s); pl=s.player_id.unique(); bs=[]
            for _ in range(400):
                pick=rng.choice(pl,size=len(pl),replace=True)
                idx=np.concatenate([np.flatnonzero(s.player_id.values==p) for p in pick])
                rr,_=Rv(s.iloc[idx]); bs.append([x if x is not None else np.nan for x in rr])
            bs=np.array(bs,dtype=float); lo=np.nanpercentile(bs,5,axis=0); hi=np.nanpercentile(bs,95,axis=0)
            S=[float(s[s.k==k].ok_k.mean()) if (s.k==k).any() else None for k in range(1,H+1)]
            cells.append({**base,"mean_VOR_at_0":round(d0,2),
                **{f"R{k}":(round(r[k-1],4) if r[k-1] is not None else None) for k in range(1,H+1)},
                **{f"R{k}_lo":(round(float(lo[k-1]),4) if r[k-1] is not None else None) for k in range(1,H+1)},
                **{f"R{k}_hi":(round(float(hi[k-1]),4) if r[k-1] is not None else None) for k in range(1,H+1)},
                **{f"S{k}":(round(S[k-1],4) if S[k-1] is not None else None) for k in range(1,H+1)}})
json.dump({"definition":{
 "quantity":"R(h) = mean(VOR at h, UNCONDITIONAL) / mean(VOR at 0). V = A(0) * sum_h d^h * R(h).",
 "WARNING_double_count":"R is UNCONDITIONAL - survival is ALREADY inside. Do NOT multiply by S(h). S is published per cell for diagnostics only.",
 "WARNING_zero_floor":"margin < 1.0 does NOT mean worth zero. Margin is a RATE ratio; qualifying is on season TOTALS. 100% of qualifying player-seasons with margin < 1.0 have POSITIVE VOR (median 18.6 pts; QB median 44, max 227). Correct worth-zero test: projected season points <= the bar player's projected season points.",
 "DEFECT_FIXED":"the bar was previously located with rank==N under method='min'; ties can SKIP rank N, giving a NaN bar and silently dropping every row that season (hit WR 2024: 284 observations / 71 players). Now taken as the N-th largest, which always exists.",
 "edges":"edge_lo/edge_hi are contiguous decile cut points forming a COMPLETE partition per position; outermost null = unbounded. Suppressed entries carry edges too, so a blank names WHICH cohort is missing.",
 "bar_ranks":BAR,"horizons":H,"min_n_published":MIN_N},
 "position_edges":{p:[None if not np.isfinite(x) else round(float(x),6) for x in e] for p,e in edges.items()},
 "cells":cells,"suppressed":sup},open(SP/"retention_R_FIXED.json","w"),indent=1)
print(f"published {len(cells)} cells, {len(sup)} suppressed")
print("edges (null = unbounded):")
for p,e in edges.items():
    print(f"  {p}: "+" | ".join("-inf" if x==-np.inf else "+inf" if x==np.inf else f"{x:.3f}" for x in e))
