#!/usr/bin/env node
/**
 * composition-profile — measures SPATIAL WEIGHT, which craft-profile cannot see.
 *
 *   node tools/composition-profile.mjs <url|path> [--width 1440] [--label name]
 *
 * WHY THIS EXISTS
 * craft-profile measures the INGREDIENTS (type scale, chroma, shadows, radii) and on
 * 2026-07-30 it refuted the type-scale hypothesis: Sofascore runs a FLATTER scale than
 * this product and still reads hierarchically. That finding was recorded and never acted
 * on, because nothing here could measure the thing it implied — that hierarchy in the
 * category is carried by BLOCK MASS, IMAGERY and COLOUR AREA rather than by font size.
 * This measures those three.
 *
 * WHAT IT MEASURES, on the first screenful only (hierarchy is a first-impression property)
 *   MASS     areas of the page's visually-distinct blocks; the biggest as a share of the
 *            screen; the ratio of biggest to median. A page of identical table rows sits
 *            near 1.0; a bento or card layout is several times that.
 *   GROUND   how many distinct background colours are painted — figure/ground layering.
 *            A single flat surface with hairline rules scores 1.
 *   IMAGERY  img / svg-with-image / background-image / avatar nodes carrying identity.
 *   COLOUR   share of screen area painted with a chromatic (non-grey) fill.
 *   SHAPE    distinct border-radii actually rendered.
 *
 * NO VERDICT. It reports a profile; the comparison across pages is the finding.
 */
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';

const target = process.argv[2];
const width = Number((process.argv.find(a => a.startsWith('--width=')) || '').split('=')[1] || 1440);
const label = (process.argv.find(a => a.startsWith('--label=')) || '').split('=')[1] || target;
if (!target) { console.error('usage: composition-profile.mjs <url|path> [--width=N] [--label=x]'); process.exit(1); }
const url = /^https?:/.test(target) ? target : 'file://' + target;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width, height: 900 }, deviceScaleFactor: 1,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(3500);

const out = await page.evaluate(() => {
  const VW = window.innerWidth, VH = window.innerHeight, SCREEN = VW * VH;
  const vis = (e) => {
    const cs = getComputedStyle(e), r = e.getBoundingClientRect();
    return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05
      && r.width > 1 && r.height > 1 && r.top < VH && r.bottom > 0 && r.left < VW && r.right > 0;
  };
  const onScreenArea = (e) => {
    const r = e.getBoundingClientRect();
    return Math.max(0, Math.min(r.right, VW) - Math.max(r.left, 0))
         * Math.max(0, Math.min(r.bottom, VH) - Math.max(r.top, 0));
  };
  // Resolve ANY colour syntax to rgba via canvas. The first version regex-matched rgb()
  // only, so every oklch() background -- i.e. every token this product ships -- parsed as
  // transparent, and Studio's own pages measured 0 ground layers and 0 chroma while the
  // rgb-based reference sites measured correctly. The instrument was choosing its own
  // population through the colour syntax, which is CLAUDE.md principle 11 in a new costume.
  const _cv = document.createElement('canvas'); _cv.width = _cv.height = 1;
  const _cx = _cv.getContext('2d', { willReadFrequently: true });
  const _memo = new Map();
  const rgba = (c) => {
    if (!c) return [0, 0, 0, 0];
    if (_memo.has(c)) return _memo.get(c);
    _cx.clearRect(0, 0, 1, 1);
    _cx.fillStyle = '#000';                 // sentinel: unparseable strings stay black/opaque
    _cx.fillStyle = c;
    _cx.clearRect(0, 0, 1, 1);
    _cx.fillStyle = c;
    _cx.fillRect(0, 0, 1, 1);
    const d = _cx.getImageData(0, 0, 1, 1).data;
    const out = [d[0], d[1], d[2], d[3] / 255];
    _memo.set(c, out); return out;
  };
  const isChromatic = (c) => {
    const [r, g, b, a] = rgba(c);
    if (a < 0.15) return false;
    return Math.max(r, g, b) - Math.min(r, g, b) > 14;
  };
  const painted = (e) => {
    const cs = getComputedStyle(e);
    return rgba(cs.backgroundColor)[3] > 0.02 || cs.backgroundImage !== 'none';
  };

  const all = [...document.querySelectorAll('body *')].filter(vis);

  // ---- MASS: blocks = painted containers, or containers separated by a border/shadow.
  // A "block" is something a reader perceives as one object. Approximated as an element
  // that paints its own background (or carries a border/shadow) and is not merely wrapping
  // a single painted child of nearly the same size.
  const blocky = all.filter(e => {
    const cs = getComputedStyle(e), r = e.getBoundingClientRect();
    if (r.width < 40 || r.height < 24) return false;
    const own = painted(e) || cs.boxShadow !== 'none'
      || parseFloat(cs.borderTopWidth) + parseFloat(cs.borderLeftWidth) > 0;
    if (!own) return false;
    const a = onScreenArea(e);
    return a > SCREEN * 0.004;             // ignore chips and micro-tokens
  }).map(e => ({ e, a: onScreenArea(e) }));
  // drop wrappers that are within 6% of the area of a blocky descendant
  const kept = blocky.filter(({ e, a }) =>
    !blocky.some(o => o.e !== e && e.contains(o.e) && o.a > a * 0.94));
  const areas = kept.map(x => x.a).sort((x, y) => y - x);
  const median = areas.length ? areas[Math.floor(areas.length / 2)] : 0;

  // ---- GROUND: distinct painted background colours over meaningful area
  const bgArea = new Map();
  for (const e of all) {
    if (!painted(e)) continue;
    const c = rgba(getComputedStyle(e).backgroundColor).join(',');
    bgArea.set(c, (bgArea.get(c) || 0) + onScreenArea(e));
  }
  const grounds = [...bgArea.entries()].filter(([, a]) => a > SCREEN * 0.02)
    .sort((a, b) => b[1] - a[1]);

  // ---- IMAGERY
  const imgs = all.filter(e => {
    const cs = getComputedStyle(e);
    if (e.tagName === 'IMG' || e.tagName === 'PICTURE') return true;
    if (/url\(/.test(cs.backgroundImage)) return true;
    if (e.tagName === 'svg' && e.querySelector('image')) return true;
    return false;
  });

  // ---- COLOUR AREA
  let chromatic = 0;
  for (const e of all) {
    const cs = getComputedStyle(e);
    if (painted(e) && isChromatic(cs.backgroundColor)) chromatic += onScreenArea(e);
  }

  // ---- SHAPE
  const radii = new Set();
  for (const e of all) {
    const r = parseFloat(getComputedStyle(e).borderTopLeftRadius);
    if (r > 0.5) radii.add(Math.round(r));
  }

  // ---- TYPE, for the comparison the 2026-07-30 finding rests on
  const sizes = new Map();
  for (const e of all) {
    if (e.children.length || !e.textContent.trim()) continue;
    const px = Math.round(parseFloat(getComputedStyle(e).fontSize));
    sizes.set(px, (sizes.get(px) || 0) + e.textContent.trim().length);
  }
  const bySize = [...sizes.entries()].sort((a, b) => b[1] - a[1]);
  const body = bySize.length ? bySize[0][0] : null;
  const maxPx = Math.max(...[...sizes.keys()], 0);

  return {
    screen: `${VW}x${VH}`,
    blocks: kept.length,
    biggestBlockShareOfScreen: +(areas[0] / SCREEN || 0).toFixed(3),
    biggestOverMedianBlock: +(areas[0] / (median || 1)).toFixed(2),
    groundLayers: grounds.length,
    groundSample: grounds.slice(0, 4).map(([c, a]) => `${c} ${(a / SCREEN * 100).toFixed(0)}%`),
    imageryNodes: imgs.length,
    chromaticAreaShare: +(chromatic / SCREEN).toFixed(3),
    radii: [...radii].sort((a, b) => a - b).slice(0, 8),
    bodyPx: body, maxPx, typeScaleContrast: body ? +(maxPx / body).toFixed(2) : null,
  };
});

console.log(JSON.stringify({ label, ...out }));
await browser.close();
