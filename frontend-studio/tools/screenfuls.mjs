#!/usr/bin/env node
/**
 * screenfuls — captures a page the way a reader actually receives it: one
 * viewport at a time, in order, as separate images you can OPEN AND LOOK AT.
 *
 *   node tools/screenfuls.mjs <url|path> --out analysis/xyz [--width 1440] [--height 900] [--max 8]
 *
 * WHY THIS EXISTS
 * David rejected 014 with "im not really seeing anything here - not telling me
 * anything -- very long page". Studio has never measured, or even looked at,
 * what a reader gets per screenful. Every craft instrument here so far
 * (craft-gate, craft-profile, squint) censuses the WHOLE document at once —
 * which is precisely the frame that produced the defect, because no reader ever
 * sees the whole document at once.
 *
 * WHAT IT IS NOT
 * No verdict, no threshold. It reports extent (how many screens) and writes the
 * slices. The LOOKING is the measurement — 2026-07-30's most expensive lesson
 * was generating blurred renders and never opening them.
 *
 * DETERMINISM (CLAUDE.md principle 11)
 * Reduced motion emulated; scroll settles and the document height is polled
 * until it repeats before any slice is taken, so a lazy-loading page cannot be
 * sliced against a height that is still growing. REFUSES if it never settles.
 */

import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import { resolve, extname, dirname, join, normalize } from 'node:path';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';

const args = process.argv.slice(2);
const target = args[0];
if (!target) {
  console.error('usage: screenfuls.mjs <url|path> --out <dir> [--width N] [--height N] [--max N]');
  process.exit(2);
}
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i === -1 ? d : args[i + 1]; };
const num = (n, d) => Number(flag(n, d));
const WIDTH = num('width', 1440);
const HEIGHT = num('height', 900);
const MAX = num('max', 8);
const WAIT = num('wait', 3000);
const OUT = flag('out', null);
if (!OUT) { console.error('REFUSED: --out <dir> is required'); process.exit(2); }
mkdirSync(OUT, { recursive: true });

/* Serve local files over HTTP, never file:// — a module <script> is CORS-blocked
   there and the page renders NOTHING while every check reports clean.
   (kit/verify.mjs 2026-07-28; craft-gate re-learned it 2026-07-29.) */
const serveIfLocal = async (page) => {
  if (/^https?:/.test(target)) return target;
  const p = resolve(target);
  if (!existsSync(p)) { console.error(`REFUSED: no such file ${p}`); process.exit(2); }
  const root = dirname(p);
  const types = {
    '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2', '.png': 'image/png',
  };
  const srv = createServer((req, res) => {
    const rel = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    const f = join(root, rel === '/' ? '/' + p.split('/').pop() : rel);
    let body;
    try { body = readFileSync(f); } catch { res.writeHead(404).end('nf'); return; }
    res.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream' });
    res.end(body);
  });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  page.once('close', () => srv.close());
  return `http://127.0.0.1:${srv.address().port}/${p.split('/').pop()}`;
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  reducedMotion: 'reduce',
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
const url = await serveIfLocal(page);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
await page.waitForTimeout(WAIT);

/* Settle the document height before slicing against it. */
let h = null, settled = false;
for (let i = 0; i < 10; i++) {
  const cur = await page.evaluate(() => document.documentElement.scrollHeight);
  if (h === cur) { settled = true; break; }
  h = cur;
  await page.waitForTimeout(400);
}
if (!settled) {
  console.error('REFUSED: document height never settled — slices would not be reproducible.');
  await browser.close();
  process.exit(3);
}

const screens = h / HEIGHT;
const n = Math.min(Math.ceil(screens), MAX);

for (let i = 0; i < n; i++) {
  const y = i * HEIGHT;
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(350);
  await page.screenshot({ path: join(OUT, `screen-${String(i + 1).padStart(2, '0')}.png`) });
}
await page.evaluate(() => window.scrollTo(0, 0));
await browser.close();

const name = target.replace(/^https?:\/\//, '').replace(/[^\w.-]+/g, '_').slice(0, 60);
console.log(JSON.stringify({
  target, name, width: WIDTH, height: HEIGHT,
  scrollHeight: h,
  screens: Math.round(screens * 100) / 100,
  slicesWritten: n,
  truncated: Math.ceil(screens) > MAX,
  out: OUT,
}, null, 2));
