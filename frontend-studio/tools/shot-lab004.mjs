#!/usr/bin/env node
/* Serve + screenshot lab-004. HTTP, never file:// (kit/verify.mjs rule, and the
   2026-07-29 lesson that a second tool must learn what the first one did).
   Port 0, closed with the page — no leftover server, which is the 8h11m defect. */
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = '/Users/davidleess/frontend-studio/craft';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const srv = createServer((req, res) => {
  const f = join(root, req.url === '/' ? '/lab-004-the-claim-and-the-crossing.html' : req.url.split('?')[0]);
  let b; try { b = readFileSync(f); } catch { res.writeHead(404).end('nf'); return; }
  res.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream' });
  res.end(b);
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const url = `http://127.0.0.1:${srv.address().port}/`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
const errs = [];
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

await page.screenshot({ path: '/Users/davidleess/frontend-studio/analysis/lab004-full.png', fullPage: true });
const fig = page.locator('svg').first();
await fig.screenshot({ path: '/Users/davidleess/frontend-studio/analysis/lab004-figure.png' });

/* Overflow + label-collision census, measured in the DOM rather than eyeballed from
   a screenshot — the 2026-07-24 lesson after a phantom mobile-overflow chase. */
const m = await page.evaluate(() => {
  const body = document.body;
  const texts = [...document.querySelectorAll('svg text')].map((t) => {
    const b = t.getBoundingClientRect();
    return { s: t.textContent.trim(), x: b.x, y: b.y, w: b.width, h: b.height, cls: t.getAttribute('class') || '' };
  });
  let collisions = 0; const pairs = [];
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    const a = texts[i], b = texts[j];
    if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) {
      collisions++; if (pairs.length < 6) pairs.push(`"${a.s}" x "${b.s}"`);
    }
  }
  const small = texts.filter((t) => {
    const fs = parseFloat(getComputedStyle(document.querySelector(`svg text`)).fontSize);
    return false; // measured separately below
  });
  return {
    overflowX: body.scrollWidth > body.clientWidth,
    scrollW: body.scrollWidth, clientW: body.clientWidth,
    textCount: texts.length, collisions, pairs,
  };
});
console.log('console errors :', errs.length ? errs : 'none');
console.log('horizontal overflow:', m.overflowX, `(${m.scrollW} vs ${m.clientW})`);
console.log('svg text nodes :', m.textCount);
console.log('label collisions:', m.collisions, m.pairs.length ? m.pairs : '');

await browser.close();
await new Promise((ok) => srv.close(ok));
console.log('server closed.');
