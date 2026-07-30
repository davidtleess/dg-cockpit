#!/usr/bin/env node
/* Serve + screenshot 014. Serves over HTTP, never file:// (kit/verify.mjs rule). */
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = '/Users/davidleess/frontend-studio/proposals/014-what-you-hold';
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css' };
const srv = createServer((req,res)=>{
  const f = join(root, req.url === '/' ? '/prototype.html' : req.url.split('?')[0]);
  let b; try { b = readFileSync(f); } catch { res.writeHead(404).end('nf'); return; }
  res.writeHead(200,{'content-type':types[extname(f)]||'application/octet-stream'});
  res.end(b);
});
await new Promise(ok=>srv.listen(0,'127.0.0.1',ok));
const url = `http://127.0.0.1:${srv.address().port}/`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport:{width:1440,height:1000}, deviceScaleFactor:2 });
const errs = [];
page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
page.on('pageerror', e => errs.push('PAGEERROR '+e.message));
await page.goto(url, { waitUntil:'networkidle' });
await page.waitForTimeout(700);

const arg = process.argv[2];
if (arg === 'open') {
  await page.locator('.row').nth(1).click();
  await page.waitForTimeout(500);
}
await page.screenshot({ path:`/Users/davidleess/frontend-studio/analysis/014-${arg||'top'}.png`, fullPage: arg!=='view' });

/* Overflow + smallest-content probes, measured on the DOM rather than eyeballed. */
const probe = await page.evaluate(()=>{
  const d=document.documentElement;
  const small=[];
  for (const el of document.querySelectorAll('body *')){
    const cs=getComputedStyle(el); let own='';
    for (const n of el.childNodes) if(n.nodeType===3) own+=n.nodeValue;
    if(!own.trim()) continue;
    const px=parseFloat(cs.fontSize);
    if(px<13) small.push({px,txt:own.trim().slice(0,32)});
  }
  const targets=[...document.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height)}});
  return { overflow:d.scrollWidth>d.clientWidth, sw:d.scrollWidth, cw:d.clientWidth,
    small: small.slice(0,14), smallN: small.length,
    tooSmall: targets.filter(t=>t.h<24).length, nBtn: targets.length };
});
console.log('console errors:', errs.length, errs.slice(0,4));
console.log('horizontal overflow:', probe.overflow, `(${probe.sw} vs ${probe.cw})`);
console.log('buttons:', probe.nBtn, '| under 24px tall:', probe.tooSmall);
console.log('content below 13px floor:', probe.smallN);
for (const s of probe.small) console.log('   ', s.px+'px', JSON.stringify(s.txt));
await browser.close(); srv.close();
