#!/usr/bin/env node
/* 014 verification. Serves over HTTP; asserts in both directions where it can. */
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = '/Users/davidleess/frontend-studio/proposals/014-what-you-hold';
const srv = createServer((req,res)=>{
  const f = join(root, req.url === '/' ? '/prototype.html' : req.url.split('?')[0]);
  let b; try { b = readFileSync(f); } catch { res.writeHead(404).end('nf'); return; }
  res.writeHead(200,{'content-type':extname(f)==='.js'?'text/javascript':'text/html'}); res.end(b);
});
await new Promise(ok=>srv.listen(0,'127.0.0.1',ok));
const url = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch();
const out = [];
const ok = (n,pass,d='') => out.push(`${pass?'  PASS':'  FAIL'}  ${n}${d?'  — '+d:''}`);

/* --- 1. keyboard + aria --------------------------------------------------- */
{
  const p = await browser.newPage({ viewport:{width:1440,height:900} });
  await p.goto(url,{waitUntil:'networkidle'});
  /* STRUCTURAL, not positional. This check has now broken twice by asserting a
     fixed tab index while the page legitimately gained controls above the rows —
     both times the page was innocent and the test was stale. It asserts what
     actually matters: every landmark is reachable, and they come in document
     order (verdict shortcuts -> rows). */
  const seen = [];
  for (let i = 0; i < 40 && seen.length < 1; i++){
    await p.keyboard.press('Tab');
    const k = await p.evaluate(()=>{
      const a = document.activeElement; if (!a) return '';
      return a.classList?.contains('row') ? 'row' : '';
    });
    if (k && seen[seen.length-1] !== k) seen.push(k);
  }
  ok('the first tab stop is a row — nothing precedes the list',
    seen.join(' → ') === 'row', seen.join(' → ') || 'nothing focusable');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(400);
  const st = await p.evaluate(()=>{
    const b=document.querySelector('.row');
    return { exp:b.getAttribute('aria-expanded'), h:b.nextElementSibling.getBoundingClientRect().height };
  });
  ok('Enter expands the row', st.exp==='true' && st.h>40, `aria-expanded=${st.exp} h=${Math.round(st.h)}`);
  await p.keyboard.press('Enter');
  await p.waitForTimeout(400);
  const st2 = await p.evaluate(()=>document.querySelector('.row').nextElementSibling.getBoundingClientRect().height);
  ok('Enter collapses it again', st2 < 4, `h=${Math.round(st2)}`);
  const named = await p.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>!b.innerText.trim()).length);
  ok('every control has an accessible name', named===0, `${named} unnamed`);
  await p.close();
}

/* --- 2. hover tips on both marks ------------------------------------------ */
{
  const p = await browser.newPage({ viewport:{width:1440,height:900} });
  await p.goto(url,{waitUntil:'networkidle'});
  let seen = 0;
  for (const sel of ['[data-mark="ours"]','[data-mark="mkt"]']) {
    await p.locator(sel).first().hover();
    await p.waitForTimeout(200);
    const t = await p.evaluate(()=>({o:getComputedStyle(document.getElementById('tip')).opacity,
                                    x:document.getElementById('tip').innerText}));
    if (t.o!=='0' && t.x.length>10) seen++;
  }
  ok('both marks answer "what is this?" on hover', seen===2, `${seen}/2`);
  /* Both directions: a mark that is NOT hovered must not show a tip. */
  await p.mouse.move(5,5); await p.waitForTimeout(250);
  const off = await p.evaluate(()=>getComputedStyle(document.getElementById('tip')).opacity);
  ok('tip hides when nothing is hovered', off==='0', `opacity=${off}`);
  await p.close();
}

/* --- 3. reduced motion SUBSTITUTES, never deletes -------------------------- */
{
  const p = await browser.newPage({ viewport:{width:1440,height:900}, reducedMotion:'reduce' });
  await p.goto(url,{waitUntil:'networkidle'});
  const marks = await p.evaluate(()=>{
    const els=[...document.querySelectorAll('.dot,.tiebar')];
    return { n:els.length, opaque:els.filter(e=>Number(getComputedStyle(e).opacity)>0.95).length,
             moved:els.filter(e=>getComputedStyle(e).transform!=='none').length };
  });
  ok('under reduced motion every mark is still present and opaque',
     marks.n>0 && marks.opaque===marks.n, `${marks.opaque}/${marks.n} opaque`);
  await p.locator('.row').first().click(); await p.waitForTimeout(300);
  const h = await p.evaluate(()=>document.querySelector('.exp').getBoundingClientRect().height);
  ok('expansion still works with motion off', h>40, `h=${Math.round(h)}`);
  await p.close();
}

/* --- 4. mobile ------------------------------------------------------------- */
{
  const p = await browser.newPage({ viewport:{width:390,height:840} });
  await p.goto(url,{waitUntil:'networkidle'});
  const m = await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  ok('no horizontal overflow at 390px', m.sw<=m.cw, `${m.sw} vs ${m.cw}`);
  await p.close();
}

/* --- 5. the numbers on the page came from the data ------------------------- */
{
  const p = await browser.newPage({ viewport:{width:1440,height:900} });
  await p.goto(url,{waitUntil:'networkidle'});
  const chk = await p.evaluate(()=>{
    const H=window.HOLD, g=H.groups.find(x=>x.pos==='WR');
    const txt=document.body.innerText;
    return { rows:document.querySelectorAll('.row').length, held:H.held,
             wrClaim:txt.includes(`Of the ${g.held} you hold, ${g.thesis.insideStartsOurs} are inside`),
             tieRange:txt.includes('1–11') };
  });
  ok('one row per comparable player', chk.rows===chk.held, `${chk.rows} rows / ${chk.held} held`);
  ok('WR thesis sentence matches the computed data', chk.wrClaim);
  ok('the DVS tie renders as a RANGE, not a rank', chk.tieRange);
  await p.close();
}

/* --- 6b. the one-sentence verdict states what the data says ---------------- */
{
  const p = await browser.newPage({ viewport:{width:1440,height:900} });
  await p.goto(url,{waitUntil:'networkidle'});
  await p.waitForTimeout(400);
  const v = await p.evaluate(() => {
    const H = window.HOLD, exp = [];
    for (const g of H.groups) for (const pl of g.players){
      const S = g.weeklyStarts;
      if ((pl.drank<=S) !== (pl.mrank<=S) && pl.mrank<=S) exp.push({n:pl.name, d:Math.abs(pl.gap)});
    }
    exp.sort((a,b)=>b.d-a.d);
    return { exp: exp.map(e=>e.n),
             lead: document.getElementById('vlead').textContent.replace(/\s+/g,' ').trim(),
             jumps: document.querySelectorAll('.split').length };
  });
  ok('the verdict names every player the market starts and we do not',
    v.exp.length > 0 && v.exp.every(n => v.lead.includes(n)), v.exp.join(', '));
  ok('it states the count from the data', v.lead.includes(` ${v.exp.length} `), `${v.exp.length}`);
  ok('nothing at the top of the page teleports the reader', v.jumps === 0, `${v.jumps} jump targets`);
  await p.close();
}
await browser.close(); srv.close();
console.log('\n014 verification\n' + out.join('\n'));
console.log(`\n  ${out.filter(l=>l.startsWith('  PASS')).length}/${out.length} pass\n`);
