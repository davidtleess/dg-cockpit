#!/usr/bin/env node
/**
 * Measures lane encoding on the two remaining surfaces that genuinely carry BOTH
 * lanes — Player Detail and Trade Lab — which squint-app.mjs could not reach:
 * the detail page needs a player selected, and Trade Lab renders an EMPTY STATE
 * (9 painted elements) until a comparison is actually run.
 *
 * The narrowing matters. Roster Audit, Roster Capacity and Model Trust are
 * model-only surfaces by construction, so zero market hue on them is CORRECT and
 * counting it as a deficit would be a false conviction.
 */
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';

const OUT = '/Users/davidleess/frontend-studio/analysis';
const LANES = () => {
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
  const scope=document.querySelector('main')||document.body;
  let model=0,market=0,total=0;
  for(const el of scope.querySelectorAll('*')){
    const r=el.getBoundingClientRect(); if(r.width<=0||r.height<=0) continue;
    const cs=getComputedStyle(el); if(cs.visibility==='hidden'||Number(cs.opacity)<0.05) continue;
    let own=''; for(const n of el.childNodes) if(n.nodeType===3) own+=n.nodeValue;
    if(!(own.trim().length>0 || (parse(cs.backgroundColor)&&r.width*r.height>40))) continue;
    total++;
    for(const c of [cs.color,cs.backgroundColor,cs.borderTopColor]){
      const p=parse(c); if(!p) continue; const {C,H}=ok(p); if(C<=0.04) continue;
      if(H>225&&H<285){model++;break} if(H>45&&H<105){market++;break} break;
    }
  }
  /* Does the surface SAY "model" and "market"? If the words are there and the hues
     are not, the comparison is textual rather than encoded — which is the precise
     claim, and a different one from "the comparison is missing". */
  const txt=(scope.innerText||'').toLowerCase();
  return {model,market,total,saysModel:/model/.test(txt),saysMarket:/market|fantasycalc/.test(txt)};
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport:{width:1440,height:1000}, reducedMotion:'reduce' });
const out = [];

/* ---- Player Detail: reachable only by selecting a player then opening the card. */
await page.goto('http://127.0.0.1:8000/', { waitUntil:'networkidle' });
await page.waitForTimeout(1500);
const chip = page.locator('button', { hasText: /^⌗/ }).first();
if (await chip.count()) {
  await chip.click(); await page.waitForTimeout(900);
  const open = page.getByRole('button', { name: /open full evidence|evidence card/i }).first();
  if (await open.count()) {
    await open.click(); await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/app-player-detail-sharp.png` });
    await page.evaluate(()=>{document.documentElement.style.filter='blur(7px)'});
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${OUT}/app-player-detail-blur.png` });
    await page.evaluate(()=>{document.documentElement.style.filter='none'});
    out.push({ label:'Player Detail', url:new URL(page.url()).search, ...await page.evaluate(LANES) });
  } else out.push({ label:'Player Detail', url:'could not open evidence card' });
} else out.push({ label:'Player Detail', url:'no player chip found' });

/* ---- Trade Lab: must actually build and run a comparison. */
await page.goto('http://127.0.0.1:8000/?surface=trade-lab', { waitUntil:'networkidle' });
await page.waitForTimeout(1500);
const search = page.locator('input[type=search], input[type=text]').first();
let ran = false;
if (await search.count()) {
  await search.fill('Jeanty');
  await page.waitForTimeout(1800);
  const hit = page.locator('main button', { hasText: /jeanty/i }).first();
  if (await hit.count()) {
    await hit.click(); await page.waitForTimeout(700);
    const run = page.getByRole('button', { name: /run comparison/i }).first();
    if (await run.count()) { await run.click(); await page.waitForTimeout(4000); ran = true; }
  }
}
await page.screenshot({ path: `${OUT}/app-trade-lab-sharp.png` });
await page.evaluate(()=>{document.documentElement.style.filter='blur(7px)'});
await page.waitForTimeout(200);
await page.screenshot({ path: `${OUT}/app-trade-lab-blur.png` });
await page.evaluate(()=>{document.documentElement.style.filter='none'});
out.push({ label:`Trade Lab${ran?' (comparison run)':' (COULD NOT RUN — reading is of a partial state)'}`,
           url:'?surface=trade-lab', ...await page.evaluate(LANES) });

await browser.close();
console.log('\n  BOTH-LANE surfaces — is the comparison ENCODED or only WRITTEN?\n');
console.log(`  ${'surface'.padEnd(46)}${'model'.padStart(7)}${'market'.padStart(8)}${'painted'.padStart(9)}   words`);
for (const r of out)
  console.log(`  ${r.label.padEnd(46)}${String(r.model??'-').padStart(7)}${String(r.market??'-').padStart(8)}` +
              `${String(r.total??'-').padStart(9)}   ${r.saysModel?'model ':''}${r.saysMarket?'market':''}${r.url&&!r.total?'  '+r.url:''}`);
console.log('');
