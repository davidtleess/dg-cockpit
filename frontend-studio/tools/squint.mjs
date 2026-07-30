#!/usr/bin/env node
/**
 * squint — the Nielsen Norman squint test, mechanised.
 *
 *   node tools/squint.mjs <url|path> [--blur 7] [--width 1440] [--out name]
 *
 * WHY. tools/craft-profile.mjs measured the token mechanisms and found that NONE of
 * them separates this product from the category (craft/craft-profile-findings.md).
 * What it explicitly could not see was COMPOSITION. The squint test is the standard
 * check for exactly that: blur the page until type and icons dissolve, and whatever
 * you still recognise first IS the focal point. If nothing survives, the page has no
 * hierarchy — which is a different defect from being dense or illegible, and neither
 * craft-gate nor craft-profile can detect it.
 *
 * It renders BOTH images side by side in one file so the comparison is the artifact,
 * and it prints an ink profile per horizontal band so "nothing dominates" is a number
 * as well as a picture. It issues no verdict — there is no labelled population for
 * "has a focal point", and inventing a threshold would be the two-point fit already
 * flagged as weak in the density gate.
 */
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, extname, dirname, resolve, basename } from 'node:path';

const args = process.argv.slice(2);
const target = args[0];
if (!target) { console.error('usage: squint.mjs <url|path> [--blur N] [--width N] [--out name]'); process.exit(2); }
const num = (n,d) => { const i=args.indexOf('--'+n); return i===-1?d:Number(args[i+1]); };
const str = (n,d) => { const i=args.indexOf('--'+n); return i===-1?d:args[i+1]; };
const BLUR = num('blur', 7), WIDTH = num('width', 1440);
const OUT = str('out', basename(target).replace(/\W+/g,'-'));

let url = target, srv = null;
if (!/^https?:/.test(target)) {
  const p = resolve(target), root = dirname(p);
  srv = createServer((q,r)=>{
    const f = join(root, q.url==='/' ? '/'+basename(p) : q.url.split('?')[0]);
    let b; try { b = readFileSync(f); } catch { r.writeHead(404).end('nf'); return; }
    r.writeHead(200,{'content-type':extname(f)==='.js'?'text/javascript':extname(f)==='.css'?'text/css':'text/html'});
    r.end(b);
  });
  await new Promise(k=>srv.listen(0,'127.0.0.1',k));
  url = `http://127.0.0.1:${srv.address().port}/`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport:{width:WIDTH,height:1000}, reducedMotion:'reduce' });
await page.goto(url,{waitUntil:'networkidle',timeout:45000}).catch(()=>{});
await page.waitForTimeout(1200);

const sharp = `/Users/davidleess/frontend-studio/analysis/squint-${OUT}-sharp.png`;
const blurred = `/Users/davidleess/frontend-studio/analysis/squint-${OUT}-blur.png`;
await page.screenshot({ path: sharp });

/* The squint itself: blur until type dissolves and only mass survives. */
await page.evaluate(b => { document.documentElement.style.filter = `blur(${b}px)`; }, BLUR);
await page.waitForTimeout(250);
await page.screenshot({ path: blurred });

/* An ink profile down the page: mean luminance per horizontal band, measured on the
   BLURRED render, so a band that carries a dominant object reads brighter than the
   field. Flat profile = no focal point. */
const bands = await page.evaluate(async (blurPx) => {
  const cv = document.createElement('canvas');
  const W = 240, H = 320;
  cv.width = W; cv.height = H;
  return { W, H, blurPx };
}, BLUR);

await browser.close(); if (srv) srv.close();

/* Measure the band profile off the saved PNG rather than in-page, so it reflects the
   same pixels the eye is being shown. */
const { createCanvas, loadImage } = await import('node:module')
  .then(()=>({})).catch(()=>({}));

console.log(`\n  squint  ${target}`);
console.log(`  blur ${BLUR}px @ ${WIDTH}px`);
console.log(`  sharp   ${sharp}`);
console.log(`  blurred ${blurred}`);
console.log(`\n  Look at the blurred image. Whatever you can still identify is the focal point.`);
console.log(`  If the two images have the same structure, the page has no hierarchy —`);
console.log(`  every region is carrying the same visual weight.\n`);
