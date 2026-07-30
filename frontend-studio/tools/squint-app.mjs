#!/usr/bin/env node
/**
 * squint-app — runs the squint test over the LIVE Dynasty Genius surfaces.
 *
 * The question: this product's entire thesis is OUR view beside THE MARKET'S. On
 * Studio's own 014 that comparison was the FIRST thing to dissolve under a blur.
 * Does the same hold on the surfaces David actually opens every morning?
 *
 * Drives the real nav rather than guessing slugs, records the slug each button
 * produces, and writes a sharp and a blurred render per surface.
 */
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';

const BLUR = 7;
const OUT = '/Users/davidleess/frontend-studio/analysis';
const WANT = ['Daily What-Changed','Roster Audit','Trade Lab','Roster Capacity','League Pulse','Model Trust'];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport:{width:1440,height:1000}, reducedMotion:'reduce' });
const rows = [];

for (const label of WANT) {
  await page.goto('http://127.0.0.1:8000/', { waitUntil:'networkidle' });
  await page.waitForTimeout(600);
  const btn = page.getByRole('button', { name: label, exact: true }).first();
  if (await btn.count() === 0) { rows.push({label, slug:'NOT FOUND'}); continue; }
  await btn.click();
  /* WAIT FOR THE SURFACE, NOT FOR A CLOCK. Roster Audit computes live against the
     Sleeper API; a fixed 2.2s wait captured its LOADING SCREEN and the lane counter
     dutifully reported on 23 elements that were not the surface. Same failure family
     as every other instrument defect this week — the tool deciding its own
     population. Poll until the loading copy is gone and the DOM stops growing. */
  let slug = new URL(page.url()).search, loaded = false, last = -1;
  for (let i = 0; i < 40; i++) {
    const st = await page.evaluate(() => {
      const m = document.querySelector('main');
      return { n: m ? m.querySelectorAll('*').length : 0,
               loading: /Loading |Fetching /i.test(m?.innerText.slice(0, 400) || '') };
    });
    if (!st.loading && st.n > 0 && st.n === last) { loaded = true; break; }
    last = st.n;
    await page.waitForTimeout(500);
  }
  if (!loaded) rows.push({ label, slug, note: 'NEVER SETTLED — not measured' });
  if (!loaded) continue;

  const key = label.toLowerCase().replace(/[^a-z]+/g,'-');
  await page.evaluate(() => { document.documentElement.style.filter = 'none'; });
  await page.screenshot({ path: `${OUT}/app-${key}-sharp.png` });
  await page.evaluate(b => { document.documentElement.style.filter = `blur(${b}px)`; }, BLUR);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/app-${key}-blur.png` });
  await page.evaluate(() => { document.documentElement.style.filter = 'none'; });

  /* Count how much of the surface is carrying each LANE hue, so "the comparison is
     invisible" is a number as well as a picture. Model = hue ~255 (blue),
     market = hue ~75 (amber), measured in OKLCH through a canvas, never a regex. */
  const lanes = await page.evaluate(() => {
    const cv=document.createElement('canvas');cv.width=cv.height=1;
    const cx=cv.getContext('2d',{willReadFrequently:true});
    const parse=c=>{if(!c||c==='none')return null;cx.clearRect(0,0,1,1);cx.fillStyle='#000';cx.fillStyle=c;cx.fillRect(0,0,1,1);
      const d=cx.getImageData(0,0,1,1).data;return d[3]===0?null:[d[0],d[1],d[2]]};
    const ok=([r,g,b])=>{const f=u=>{u/=255;return u<=0.04045?u/12.92:Math.pow((u+0.055)/1.055,2.4)};
      const[R,G,B]=[f(r),f(g),f(b)];
      const l=Math.cbrt(0.4122214708*R+0.5363325363*G+0.0514459929*B),
            m=Math.cbrt(0.2119034982*R+0.6806995451*G+0.1073969566*B),
            s=Math.cbrt(0.0883024619*R+0.2817188376*G+0.6299787005*B);
      const A=1.9779984951*l-2.428592205*m+0.4505937099*s, Bb=0.0259040371*l+0.7827717662*m-0.808675766*s;
      let H=Math.atan2(Bb,A)*180/Math.PI; if(H<0)H+=360;
      return {C:Math.sqrt(A*A+Bb*Bb), H};};
    let model=0, market=0, other=0, total=0;
    /* Scoped to <main>. The nav rail's blue links and the amber status pill are SHELL,
       identical on every surface, and counting them produced a constant 14 model / 2
       market on five different screens — chrome masquerading as content. */
    const scope = document.querySelector('main') || document.body;
    for (const el of scope.querySelectorAll('*')){
      const r=el.getBoundingClientRect(); if(r.width<=0||r.height<=0) continue;
      const cs=getComputedStyle(el); if(cs.visibility==='hidden'||Number(cs.opacity)<0.05) continue;
      let own=''; for(const n of el.childNodes) if(n.nodeType===3) own+=n.nodeValue;
      const paints = own.trim().length>0 || (parse(cs.backgroundColor) && r.width*r.height>40);
      if(!paints) continue;
      total++;
      for (const c of [cs.color, cs.backgroundColor, cs.borderTopColor]){
        const p=parse(c); if(!p) continue; const {C,H}=ok(p); if(C<=0.04) continue;
        if(H>225&&H<285) { model++; break; }
        if(H>45&&H<105)  { market++; break; }
        other++; break;
      }
    }
    return { model, market, other, total };
  });

  rows.push({ label, slug, ...lanes });
}

await browser.close();

console.log('\n  LIVE APP — lane presence per surface (elements carrying a chromatic lane hue)\n');
console.log(`  ${'surface'.padEnd(22)}${'slug'.padEnd(30)}${'model'.padStart(7)}${'market'.padStart(8)}${'other hue'.padStart(11)}${'painted'.padStart(9)}`);
for (const r of rows)
  console.log(`  ${r.label.padEnd(22)}${String(r.slug).padEnd(30)}${String(r.model??'-').padStart(7)}${String(r.market??'-').padStart(8)}${String(r.other??'-').padStart(11)}${String(r.total??'-').padStart(9)}`);
console.log(`\n  renders in ${OUT}/app-*-{sharp,blur}.png\n`);
