#!/usr/bin/env node
/**
 * verify-lab003 — checks the motion lab, including its own central claim.
 *
 *   node tools/verify-lab003.mjs
 *
 * The page ASSERTS that panel B (cross-fade) has no frame in which a reader can
 * follow a player, and that panel C does. That is a measurable property of the DOM
 * at mid-transition, so it is measured rather than believed — a prose claim on a
 * page Studio wrote is exactly the kind of thing that goes unchecked.
 */

import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, extname, dirname, resolve } from 'node:path';

const FILE = resolve('craft/lab-003-motion.html');
const root = dirname(FILE);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = createServer((req, res) => {
  const p = join(root, decodeURIComponent(req.url.split('?')[0]));
  try {
    const body = readFileSync(p);                       // read BEFORE writing headers
    res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('nf'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const URL_ = `http://127.0.0.1:${server.address().port}/lab-003-motion.html`;

let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => {
  (cond ? pass++ : fail++);
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const browser = await chromium.launch();

/* ---------------------------------------------------- 1. normal motion */
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(URL_, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

console.log('\nLAB 003 — verification');
console.log('='.repeat(70));

const counts = await page.evaluate(() => ({
  a: document.querySelectorAll('#stage-a .r').length,
  b: document.querySelectorAll('#stage-b .r').length,
  c: document.querySelectorAll('#stage-c .r').length,
  dots: document.querySelectorAll('.tk .d').length,
}));
ok('all three panels render 12 rows', counts.a === 12 && counts.b === 12 && counts.c === 12,
  `${counts.a}/${counts.b}/${counts.c}`);
ok('dumbbells render (2 marks x 12 rows x 3 panels)', counts.dots === 72, `${counts.dots}`);

/* Drive a re-sort, then scrub to the midpoint and measure. */
await page.selectOption('#sort', 'gap');
await page.waitForTimeout(500);
await page.selectOption('#sort', 't30');
await page.waitForTimeout(600);
await page.fill('#p', '500');
await page.dispatchEvent('#p', 'input');
await page.waitForTimeout(120);

const mid = await page.evaluate(() => {
  const read = (sel) => Array.from(document.querySelectorAll(`${sel} .r`)).map((r) => ({
    name: r.querySelector('.nm').textContent,
    op: Number(getComputedStyle(r).opacity),
    y: new DOMMatrix(getComputedStyle(r).transform).m42,
  }));
  return { a: read('#stage-a'), b: read('#stage-b'), c: read('#stage-c') };
});

const maxOpB = Math.max(...mid.b.map((r) => r.op));
ok('panel B: every row is invisible at the midpoint (the claim)', maxOpB <= 0.02,
  `brightest row opacity ${maxOpB.toFixed(3)}`);
const minOpC = Math.min(...mid.c.map((r) => r.op));
ok('panel C: every row is fully visible at the midpoint', minOpC >= 0.99,
  `dimmest row opacity ${minOpC.toFixed(3)}`);

/* C must be genuinely mid-flight: its row positions must not coincide with either
   endpoint, which is what distinguishes travel from a teleport placed at 50%. */
const offGrid = mid.c.filter((r) => Math.abs(r.y % 38) > 1).length;
ok('panel C rows are between slots, not on them', offGrid >= 6,
  `${offGrid}/12 rows off the row grid`);
const aOnGrid = mid.a.every((r) => Math.abs(r.y % 38) < 0.5);
ok('panel A rows are always on a slot (teleport, never in transit)', aOnGrid);

/* The refusal demo must actually print a rank that is not an endpoint. */
const badText = await page.textContent('#bad-read');
ok('refusal demo names the invented value', /our (2[5-9]|3\d|40)\b/.test(badText),
  badText.replace(/<[^>]*>/g, '').slice(0, 68));

/* Controls: named, and big enough. */
const ctlAudit = await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll('button, select, input'));
  return els.map((e) => {
    const r = e.getBoundingClientRect();
    const lab = e.getAttribute('aria-label')
      || (e.labels && e.labels[0] && e.labels[0].textContent.trim())
      || e.textContent.trim();
    return { tag: e.tagName.toLowerCase(), w: Math.round(r.width), h: Math.round(r.height), lab };
  });
});
ok('every control is named', ctlAudit.every((c) => c.lab && c.lab.length),
  `${ctlAudit.length} controls`);
const small = ctlAudit.filter((c) => c.h < 24);
ok('every control is at least 24px tall (WCAG 2.5.8)', small.length === 0,
  small.map((c) => `${c.tag} ${c.w}x${c.h}`).join(', ') || 'none');

/* Keyboard — the WHOLE tab order, not one step.
   The first version pressed Tab once and asserted the result was a control. It
   failed reporting `body`, and the page was innocent: the test had just called
   page.fill('#p'), so focus already sat on the LAST control and one Tab left the
   document. Walking the order is both the correct test and a stronger one. */
await page.evaluate(() => { document.activeElement.blur(); document.body.focus(); });
const order = [];
for (let i = 0; i < 7 && order.length < 5; i++) {
  await page.keyboard.press('Tab');
  const a = await page.evaluate(() => `${document.activeElement.tagName.toLowerCase()}#${document.activeElement.id}`);
  if (a !== 'body#') order.push(a);   // body is focusable once, having just been focused to reset
}
ok('tab order reaches every control, in document order',
  order.join(' ') === 'select#sort select#track select#mode button#go input#p', order.join(' → '));

/* FRAME COST. A janky transition is worse than a teleport, so the proposal has to
   survive its own performance claim. Sample rAF deltas across a real 400ms re-sort
   and count frames that missed the 60Hz budget. Measured, not assumed from the fact
   that transforms are "usually" compositor-only. */
await page.selectOption('#sort', 'dr');
await page.waitForTimeout(500);
const frames = await page.evaluate(async () => {
  const deltas = [];
  let last = performance.now(), stop = false;
  const tick = (now) => { deltas.push(now - last); last = now; if (!stop) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  document.getElementById('sort').value = 't30';
  document.getElementById('sort').dispatchEvent(new Event('change'));
  await new Promise((r) => setTimeout(r, 700));
  stop = true;
  return deltas.slice(2);   // drop the priming frames
});
const dropped = frames.filter((d) => d > 20).length;
const worst = Math.max(...frames).toFixed(1);
ok('re-sort holds frame budget (no frame over 20ms)', dropped === 0,
  `${frames.length} frames, worst ${worst}ms, ${dropped} over budget`);

/* Overflow. */
for (const w of [1440, 390]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(250);
  const of = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(`no horizontal overflow at ${w}px`, of <= 0, `${of}px`);
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.waitForTimeout(200);
await page.screenshot({ path: 'analysis/lab003-1440.png', fullPage: true });

/* ------------------------------------------- 2. reduced motion substitute */
const rctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const rpage = await rctx.newPage();
rpage.on('pageerror', (e) => errors.push(`[reduced] ${e}`));
await rpage.goto(URL_, { waitUntil: 'networkidle' });
await rpage.waitForTimeout(400);
await rpage.selectOption('#sort', 't30');
await rpage.waitForTimeout(400);
const red = await rpage.evaluate(() => ({
  marks: document.querySelectorAll('#stage-c .moved').length,
  settled: Array.from(document.querySelectorAll('#stage-c .r'))
    .every((r) => Math.abs(new DOMMatrix(getComputedStyle(r).transform).m42 % 38) < 0.5),
  prog: document.getElementById('pct').textContent,
}));
ok('reduced motion: rows are placed instantly, no travel', red.settled && red.prog === 'done');
ok('reduced motion: SUBSTITUTES rather than deletes (movement markers rendered)',
  red.marks > 0, `${red.marks} rows marked with how far they moved`);
await rpage.screenshot({ path: 'analysis/lab003-reduced.png', fullPage: true });

ok('zero console errors', errors.length === 0, errors.slice(0, 3).join(' | ') || 'none');

await browser.close();
server.close();
console.log('-'.repeat(70));
console.log(`  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
