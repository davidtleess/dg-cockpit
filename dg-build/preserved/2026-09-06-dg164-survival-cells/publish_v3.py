import numpy as np, pandas as pd, json
from pathlib import Path
SP=Path("/private/tmp/claude-501/-Users-davidleess/a4d5049a-c405-4f8e-962a-cb0817a24bfd/scratchpad")
BAR={"QB":37,"RB":45,"WR":71,"TE":21}; MIN_N=12; MIN_DENOM=10.0; H=5
BMAP={0:0,1:0,2:0,3:1,4:1,5:2,6:3,7:4,8:5,9:6}
LBL={0:"m0 (deciles 0-2)",1:"m1 (d3-4)",2:"m2 (d5)",3:"m3 (d6)",4:"m4 (d7)",5:"m5 (d8)",6:"m6 (d9, top)"}
f=pd.read_parquet(SP/"followup_FIXED.parquet")
edges={p:[-np.inf]+list(np.quantile(f[f.position==p].margin,[.3,.5,.6,.7,.8,.9]))+[np.inf] for p in BAR}
rng=np.random.default_rng(20260905)
def Rv(s):
    d0=s.groupby("player_id").vor0.first().mean()
    return [float(s[s.k==k].vor_h.mean()/d0) if (s.k==k).any() and d0>0 else None for k in range(1,H+1)], float(d0)
cells=[];sup=[]
for pos in BAR:
    for a in f.ageb.cat.categories:
        for bi in range(7):
            s=f[(f.position==pos)&(f.ageb==a)&(f.mb==bi)]
            n=s[s.k==1].player_id.nunique()
            if n==0: continue
            e=edges[pos]
            base=dict(position=pos,ageband=str(a),margin_bin=LBL[bi],
                      edge_lo=(None if not np.isfinite(e[bi]) else round(float(e[bi]),6)),
                      edge_hi=(None if not np.isfinite(e[bi+1]) else round(float(e[bi+1]),6)),n=int(n))
            d0=float(s.groupby("player_id").vor0.first().mean())
            why=[]
            if n<MIN_N: why.append("n=%d < %d" % (n,MIN_N))
            if d0<MIN_DENOM: why.append("mean_VOR_at_0=%.2f < %.1f (ratio denominator too small)" % (d0,MIN_DENOM))
            if why:
                sup.append({**base,"mean_VOR_at_0":round(d0,2),"suppressed_because":"; ".join(why)}); continue
            r,_=Rv(s); pl=s.player_id.unique(); bs=[]
            for _ in range(400):
                pick=rng.choice(pl,size=len(pl),replace=True)
                idx=np.concatenate([np.flatnonzero(s.player_id.values==p) for p in pick])
                rr,_=Rv(s.iloc[idx]); bs.append([x if x is not None else np.nan for x in rr])
            bs=np.array(bs,dtype=float); lo=np.nanpercentile(bs,5,axis=0); hi=np.nanpercentile(bs,95,axis=0)
            cells.append({**base,"mean_VOR_at_0":round(d0,2),
                **{"R%d"%k:(round(r[k-1],4) if r[k-1] is not None else None) for k in range(1,H+1)},
                **{"R%d_lo"%k:(round(float(lo[k-1]),4) if r[k-1] is not None else None) for k in range(1,H+1)},
                **{"R%d_hi"%k:(round(float(hi[k-1]),4) if r[k-1] is not None else None) for k in range(1,H+1)}})
# ENFORCED, not documented
bad=[(c["position"],c["ageband"],c["margin_bin"],c["mean_VOR_at_0"]) for c in cells if c["mean_VOR_at_0"]<MIN_DENOM]
assert not bad, "RULE BREACH: %r" % (bad,)
assert all(c["n"]>=MIN_N for c in cells), "n rule breached"
SUPP=("a cell is suppressed if n < %d OR mean_VOR_at_0 < %.1f. The second is ENFORCED BY ASSERTION rather than "
      "documented: it was documented in an earlier build, silently dropped in a rewrite, and the claim 'zero "
      "fragile cells' was carried across the rewrite unchecked. Every suppressed entry carries "
      "suppressed_because." % (MIN_N,MIN_DENOM))
json.dump({"definition":{
 "quantity":"R(h) = mean(VOR at h, UNCONDITIONAL) / mean(VOR at 0). V = A(0) * sum_h d^h * R(h).",
 "lookup":"key on projection_2y / bar_ppg -- projection_2y IS E[points|plays], the conditional rate (pvo_assembler.py:457). No availability recovery needed.",
 "WARNING_double_count":"R is UNCONDITIONAL -- survival is ALREADY inside. Do NOT multiply by S(h).",
 "WARNING_zero_floor":"margin < 1.0 does NOT mean worth zero. Correct test: expected season points <= the bar player's season points.",
 "suppression":SUPP,
 "edges":"contiguous decile cut points forming a COMPLETE partition per position; suppressed entries carry them too.",
 "open_question_rate_vs_total":"margin is a RATE. CHOSEN, not derived: the replacement is the best you can field each week, so one player's season total is the wrong object. At QB, where the best available man plays about half the weeks, this rests on an UNMEASURED assumption about the other nine.",
 "bar_ranks":BAR,"horizons":H},
 "position_edges":{p:[None if not np.isfinite(x) else round(float(x),6) for x in e] for p,e in edges.items()},
 "cells":cells,"suppressed":sup},open(SP/"retention_R_v3.json","w"),indent=1)
print("published %d cells, %d suppressed" % (len(cells),len(sup)))
print("assertions passed: no cell with n<%d or denominator<%.1f" % (MIN_N,MIN_DENOM))
print("smallest surviving denominator: %.2f" % min(c["mean_VOR_at_0"] for c in cells))
newly=[s for s in sup if "denominator" in s.get("suppressed_because","")]
print("newly suppressed on the denominator rule: %d" % len(newly))
for s in newly: print("   %s %s %s  n=%d  %s" % (s["position"],s["ageband"],s["margin_bin"],s["n"],s["suppressed_because"]))
