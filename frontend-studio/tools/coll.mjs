import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:1280,height:1000}});
await p.goto('file:///Users/davidleess/frontend-studio/proposals/008-draft-capital/prototype.html',{waitUntil:'networkidle'});
await p.waitForTimeout(400);
// open EVERY row so all expansions are measured for real
await p.evaluate(()=>document.querySelectorAll('.prow').forEach(b=>b.setAttribute('aria-expanded','true')));
await p.waitForTimeout(800);
const out = await p.evaluate(()=>{
  const res=[];
  document.querySelectorAll('svg').forEach((svg,si)=>{
    const ts=[...svg.querySelectorAll('text')].map(t=>{const r=t.getBoundingClientRect();
      return {t:t.textContent.slice(0,30),l:r.left,r:r.right,tp:r.top,bt:r.bottom};});
    for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){
      const a=ts[i],c=ts[j];
      if(a.l<c.r&&c.l<a.r&&a.tp<c.bt&&c.tp<a.bt) res.push(si+': "'+a.t+'" <> "'+c.t+'"');
    }
  });
  const clip=[];
  document.querySelectorAll('svg').forEach((svg,si)=>{
    const sb=svg.getBoundingClientRect();
    svg.querySelectorAll('text').forEach(t=>{const r=t.getBoundingClientRect();
      if(r.left<sb.left-1||r.right>sb.right+1) clip.push(si+': "'+t.textContent.slice(0,26)+'" out of svg box');});
  });
  return {overlaps:[...new Set(res)], clipped:[...new Set(clip)]};
});
console.log(JSON.stringify(out,null,1));
await p.screenshot({path:'/Users/davidleess/frontend-studio/proposals/assets/008-capital/07-all-open.png',fullPage:true});
await b.close();
