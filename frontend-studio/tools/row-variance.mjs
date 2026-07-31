#!/usr/bin/env node
/**
 * row-variance — measures whether a page's REPEATED ROWS are distinguishable
 * from one another at a glance.
 *
 *   node tools/row-variance.mjs <url|path> [--width 1440] [--blur 5] [--json]
 *
 * WHY THIS EXISTS
 * David rejected 014 with "im not really seeing anything here". Extent did not
 * explain it (014 is 3.84 screens; the surface he called "awesome" is 4.64, and
 * Sofascore is 6.92). Column structure did not explain it (both his approved and
 * his rejected surface are a single column of repeated rows). What is left is
 * INSIDE the row: on 014 you must READ a row to tell it from its neighbour.
 *
 * WHAT IT MEASURES
 * Each repeated row is rasterised, blurred until type dissolves (the squint test,
 * craft/composition-and-hierarchy.md), downsampled to a coarse luminance grid, and
 * compared with every other row in its group. The score is the mean pairwise
 * distance, 0-100. LOW = the rows are interchangeable smears; the reader has
 * nothing to grab without reading. It is deliberately measured on BLURRED rows:
 * unblurred, two rows differ merely because the names are spelled differently,
 * which is not something a reader perceives at a glance.
 *
 * WHAT IT IS NOT
 * Not a verdict, and NOT a claim that more variance is better. Random noise per
 * row would score high and inform nobody. It answers exactly one question — can
 * these rows be told apart without reading — and the designer still owns whether
 * the thing doing the distinguishing carries information.
 *
 * CALIBRATION IS BORROWED, NOT INVENTED
 * The only labelled population here is David's own reactions. Both surfaces are
 * reported side by side rather than a threshold being fitted to two points.
 *
 * DETERMINISM + POPULATION (CLAUDE.md principle 11)
 * Reduced motion emulated; the row census is re-run until two consecutive passes
 * agree, and REFUSES rather than reporting a frame. REFUSES if it finds no
 * repeated group, so "clean" can never mean "saw nothing".
 * Both directions: tools/row-variance-selftest.mjs must separate a fixture whose
 * rows are identical from one whose rows are not.
 */

import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import { resolve, extname, dirname, join, normalize } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';

const args = process.argv.slice(2);
const target = args[0];
if (!target) { console.error('usage: row-variance.mjs <url|path> [--width N] [--blur N] [--json]'); process.exit(2); }
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i === -1 ? d : args[i + 1]; };
const num = (n, d) => Number(flag(n, d));
const WIDTH = num('width', 1440);
const HEIGHT = num('height', 900);
const BLUR = num('blur', 5);
const WAIT = num('wait', 3000);
const MIN_ROWS = num('min-rows', 4);
const JSON_OUT = args.includes('--json');

/* Serve local files over HTTP, never file:// (kit/verify.mjs 2026-07-28). */
const serveIfLocal = async (page) => {
  if (/^https?:/.test(target)) return target;
  const p = resolve(target);
  if (!existsSync(p)) { console.error(`REFUSED: no such file ${p}`); process.exit(2); }
  const root = dirname(p);
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
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

/* ---- find repeated row groups: siblings sharing a class signature ---------- */
const FIND_ROWS = (minRows) => {
  const sig = (el) => `${el.tagName}.${[...el.classList].sort().join('.')}`;
  const out = [];
  const seen = new Set();
  for (const parent of document.querySelectorAll('body *')) {
    const kids = [...parent.children].filter((k) => {
      const r = k.getBoundingClientRect();
      const cs = getComputedStyle(k);
      return r.height >= 20 && r.height <= 260 && r.width >= 220 &&
        cs.display !== 'none' && cs.visibility !== 'hidden';
    });
    if (kids.length < minRows) continue;
    const bySig = new Map();
    for (const k of kids) {
      const s = sig(k);
      if (!bySig.has(s)) bySig.set(s, []);
      bySig.get(s).push(k);
    }
    for (const [s, group] of bySig) {
      if (group.length < minRows) continue;
      const key = s + '|' + group.length + '|' + Math.round(group[0].getBoundingClientRect().width);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        sig: s,
        count: group.length,
        rects: group.map((k) => {
          const r = k.getBoundingClientRect();
          return {
            x: Math.round(r.x + window.scrollX), y: Math.round(r.y + window.scrollY),
            w: Math.round(r.width), h: Math.round(r.height),
          };
        }),
      });
    }
  }
  /* Keep the largest groups; a page's identity is its dominant repeat unit. */
  return out.sort((a, b) => b.count - a.count).slice(0, 6);
};

/* ---- compare rows from a full-page raster, blurred, in a canvas ------------ */
const COMPARE = async ({ dataUrl, groups, blurPx, gw, gh }) => {
  const img = new Image();
  await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = dataUrl; });

  const cv = document.createElement('canvas');
  const cx = cv.getContext('2d', { willReadFrequently: true });

  /* Downsample one rect to a gw x gh luminance grid, blurred first so that
     differences in SPELLING do not register as differences in appearance. */
  const grid = (r) => {
    cv.width = gw; cv.height = gh;
    cx.clearRect(0, 0, gw, gh);
    cx.filter = `blur(${blurPx}px)`;
    cx.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, gw, gh);
    cx.filter = 'none';
    const d = cx.getImageData(0, 0, gw, gh).data;
    const g = new Float64Array(gw * gh);
    for (let i = 0; i < gw * gh; i++) {
      g[i] = 0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2];
    }
    return g;
  };

  const res = [];
  for (const grp of groups) {
    const gs = grp.rects.map(grid);
    let sum = 0, n = 0, worst = Infinity, best = 0;
    for (let i = 0; i < gs.length; i++) {
      for (let j = i + 1; j < gs.length; j++) {
        let d = 0;
        for (let k = 0; k < gs[i].length; k++) d += Math.abs(gs[i][k] - gs[j][k]);
        d /= gs[i].length;
        sum += d; n++;
        if (d < worst) worst = d;
        if (d > best) best = d;
      }
    }
    /* Scale to 0-100 against the full 0-255 luminance range. */
    const to100 = (v) => Math.round((v / 255) * 100 * 100) / 100;
    res.push({
      sig: grp.sig, rows: grp.count,
      meanDistance: to100(sum / n),
      mostAlikePair: to100(worst),
      mostDifferentPair: to100(best),
      rowHeight: grp.rects[0].h, rowWidth: grp.rects[0].w,
    });
  }
  return res;
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT }, reducedMotion: 'reduce', deviceScaleFactor: 1,
});
const page = await ctx.newPage();
const url = await serveIfLocal(page);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
await page.waitForTimeout(WAIT);

/* Settle: the row census must repeat before anything is rasterised. */
let prev = null, groups = null, settled = false;
for (let i = 0; i < 8; i++) {
  const g = await page.evaluate(FIND_ROWS, MIN_ROWS);
  if (prev && JSON.stringify(prev) === JSON.stringify(g)) { groups = g; settled = true; break; }
  prev = g;
  await page.waitForTimeout(450);
}
if (!settled) { console.error('REFUSED: row census never settled.'); await browser.close(); process.exit(3); }
if (!groups.length) {
  console.error(`REFUSED: no repeated group of >=${MIN_ROWS} rows found — the instrument can see nothing to compare.`);
  await browser.close(); process.exit(3);
}

const shot = await page.screenshot({ fullPage: true });
const dataUrl = `data:image/png;base64,${shot.toString('base64')}`;
const out = await page.evaluate(COMPARE, { dataUrl, groups, blurPx: BLUR, gw: 64, gh: 8 });
await browser.close();

if (JSON_OUT) {
  console.log(JSON.stringify({ target, width: WIDTH, blur: BLUR, groups: out }, null, 2));
} else {
  console.log(`\n  ${target}   (${WIDTH}px, blur ${BLUR}px, rows compared as 64x8 luminance grids)\n`);
  console.log(`  ${'rows'.padStart(5)}  ${'glance'.padStart(7)}  ${'closest'.padStart(8)}  ${'farthest'.padStart(8)}   repeat unit`);
  for (const g of out) {
    console.log(`  ${String(g.rows).padStart(5)}  ${String(g.meanDistance).padStart(7)}  ${String(g.mostAlikePair).padStart(8)}  ${String(g.mostDifferentPair).padStart(8)}   ${g.sig.slice(0, 54)}`);
  }
  console.log(`\n  "glance" = mean pairwise difference between blurred rows, 0-100.`);
  console.log(`  LOW means the rows are interchangeable without reading them.\n`);
}
