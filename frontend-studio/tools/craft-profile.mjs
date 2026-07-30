#!/usr/bin/env node
/**
 * craft-profile — measures a rendered page's CRAFT PROFILE on mechanisms.
 *
 *   node tools/craft-profile.mjs <url|path> [--width 1440] [--height 900] [--json] [--wait 2500]
 *
 * WHY THIS EXISTS
 * On 2026-07-29 two Studio surfaces in a row landed at "not awesome" while every
 * measurable check passed. `craft-gate.mjs` measures whether a drawing is too DENSE
 * or ILLEGIBLE — it cannot see whether a page has PRESENCE. The 2026-07-28 ruling
 * ("measure the surface against the live product on MECHANISMS — gradients, shadows,
 * radii, type families — not on how it feels") turned "feels different" into a table
 * once already. This generalises that table into an instrument and points it outward
 * at the category, so "our surfaces don't feel premium" becomes a measurement with a
 * named deficit rather than five competing hypotheses.
 *
 * WHAT IT IS NOT
 * It issues NO verdict. There is no pass/fail and no threshold, because no labelled
 * good/bad population exists for "presence" and inventing one would be exactly the
 * two-point fit already flagged as weak in the density gate. It reports a profile.
 * The comparison across pages is the finding; the instrument does not editorialise.
 *
 * WHAT IT MEASURES (all from computed style on VISIBLE, rendered nodes)
 *   TYPE   size distribution weighted by the text volume each size carries; the modal
 *          "body" size; the largest size carrying real content; SCALE CONTRAST
 *          (largest / body); weight set; family count.
 *   COLOUR distinct chromatic colours in text and in fills, hue count, chroma range.
 *   DEPTH  box-shadow count and depth, gradient count, distinct border-radii.
 *   SPACE  distinct padding/gap values and whether they share a base.
 *
 * DETERMINISM (CLAUDE.md principle 11, learned 2026-07-29 the expensive way)
 * The census runs repeatedly under emulated reduced-motion until two consecutive
 * runs are IDENTICAL, and REFUSES rather than reporting a frame of an animation.
 *
 * PROOF IT CAN SEE ANYTHING AT ALL (principle 11, population clause)
 * Refuses outright on a page with no rendered text. Run tools/profile-selftest.mjs
 * before quoting it: fixtures differing ONLY in scale contrast must be separated,
 * and a re-run of one fixture must be identical.
 */

import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import { resolve, extname } from 'node:path';
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const target = args[0];
if (!target) {
  console.error('usage: craft-profile.mjs <url|path> [--width N] [--json] [--wait MS]');
  process.exit(2);
}
const flag = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? dflt : Number(args[i + 1]);
};
const WIDTH = flag('width', 1440);
const HEIGHT = flag('height', 900);
const WAIT = flag('wait', 2500);
const JSON_OUT = args.includes('--json');

/* ---------------------------------------------------------------- the census */
/* Runs in the page. Returns a plain object; identical input must give an
   identical object, so everything is sorted and rounded deterministically. */
const CENSUS = () => {
  const r2 = (n) => Math.round(n * 100) / 100;

  /* Parse any CSS colour the browser hands back (rgb/rgba only, post-compute)
     through a canvas rather than a regex — the 2026-07-28 lesson: a regex over
     getComputedStyle silently reads OKLCH as black. */
  const cv = document.createElement('canvas');
  cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const parse = (css) => {
    if (!css || css === 'none') return null;
    cx.clearRect(0, 0, 1, 1);
    cx.fillStyle = '#000';
    cx.fillStyle = css;
    cx.fillRect(0, 0, 1, 1);
    const [R, G, B, A] = cx.getImageData(0, 0, 1, 1).data;
    if (A === 0) return null;
    return { r: R, g: G, b: B, a: A / 255 };
  };
  /* sRGB -> OKLCH. Chroma and hue are what the design questions are asked in. */
  const oklch = ({ r, g, b }) => {
    const f = (u) => {
      u /= 255;
      return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4);
    };
    const [R, G, B] = [f(r), f(g), f(b)];
    const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
    const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
    const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    const C = Math.sqrt(A * A + Bb * Bb);
    let H = (Math.atan2(Bb, A) * 180) / Math.PI;
    if (H < 0) H += 360;
    return { L, C, H };
  };

  const vis = (el, cs, rect) =>
    rect.width > 0 &&
    rect.height > 0 &&
    cs.visibility !== 'hidden' &&
    cs.display !== 'none' &&
    Number(cs.opacity) > 0.05;

  const all = Array.from(document.querySelectorAll('body *'));

  /* ---- TYPE. Weighted by the number of CHARACTERS each size carries, so a
     48px logo used once cannot outvote the body text of the whole page. Only
     nodes with their OWN text are counted (a wrapper does not double-count). */
  const sizeChars = new Map();      // px -> chars
  const sizeSample = new Map();     // px -> a representative string
  const weights = new Set();
  const families = new Set();
  const tracking = new Set();
  let textNodes = 0;

  for (const el of all) {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if (!vis(el, cs, rect)) continue;
    let own = '';
    for (const n of el.childNodes) if (n.nodeType === 3) own += n.nodeValue;
    own = own.replace(/\s+/g, ' ').trim();
    if (!own) continue;
    textNodes++;
    const px = r2(parseFloat(cs.fontSize));
    sizeChars.set(px, (sizeChars.get(px) || 0) + own.length);
    if (!sizeSample.has(px) || own.length > sizeSample.get(px).length)
      sizeSample.set(px, own.slice(0, 46));
    weights.add(cs.fontWeight);
    families.add(cs.fontFamily.split(',')[0].replace(/["']/g, '').trim());
    const ls = cs.letterSpacing;
    if (ls && ls !== 'normal' && Math.abs(parseFloat(ls)) > 0.09) tracking.add(r2(parseFloat(ls)));
  }

  const sizes = [...sizeChars.entries()]
    .map(([px, chars]) => ({ px, chars, sample: sizeSample.get(px) }))
    .sort((a, b) => b.chars - a.chars);
  const totalChars = sizes.reduce((s, x) => s + x.chars, 0);
  /* BODY = the size carrying the most characters. Not the smallest, not the
     median — the size the page is actually written in. */
  const body = sizes.length ? sizes[0].px : null;
  /* The largest size carrying REAL CONTENT: at least 2 characters, and present
     on a node whose text is not a single decorative glyph. Reported with its
     sample so a nav logo can be told from a headline figure by eye. */
  const contentSizes = sizes.filter((s) => s.sample && s.sample.replace(/\s/g, '').length >= 2);
  const maxSize = contentSizes.length ? Math.max(...contentSizes.map((s) => s.px)) : null;
  const maxSample = contentSizes.find((s) => s.px === maxSize)?.sample ?? null;
  const minSize = contentSizes.length ? Math.min(...contentSizes.map((s) => s.px)) : null;

  /* ---- COLOUR. Chromatic = OKLCH chroma above 0.03; below that it is a grey
     and carries no hue argument. Counted separately for TEXT and for FILLS,
     because "the page has colour" usually means fills. */
  const textHues = new Map();
  const fillHues = new Map();
  let shadows = 0;
  const shadowDepths = new Set();
  let gradients = 0;
  const radii = new Set();
  const pads = new Set();
  const gaps = new Set();

  /* DENOMINATORS. Text colour is only meaningful on a node that HAS its own text,
     and fill is only meaningful on a node that paints an area. Counting either
     against "all visible elements" produced a 140% "share" on Sofascore — the
     reading that caught this. Each rate below divides by its own population. */
  let textBearing = 0;
  let areaBearing = 0;

  for (const el of all) {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if (!vis(el, cs, rect)) continue;
    const area = rect.width * rect.height;

    let ownTxt = '';
    for (const n of el.childNodes) if (n.nodeType === 3) ownTxt += n.nodeValue;
    const hasText = ownTxt.replace(/\s+/g, '').length > 0;
    if (hasText) textBearing++;
    if (area > 40) areaBearing++;

    const tc = parse(cs.color);
    if (hasText && tc && tc.a > 0.2) {
      const { L, C, H } = oklch(tc);
      if (C > 0.03) {
        const k = `${Math.round(H / 12) * 12}`;
        textHues.set(k, (textHues.get(k) || 0) + 1);
      }
    }
    const bg = parse(cs.backgroundColor);
    if (bg && bg.a > 0.2 && area > 40) {
      const { L, C, H } = oklch(bg);
      if (C > 0.03) {
        const k = `${Math.round(H / 12) * 12}`;
        fillHues.set(k, (fillHues.get(k) || 0) + 1);
      }
    }
    const bi = cs.backgroundImage;
    if (bi && bi !== 'none' && /gradient/.test(bi)) gradients++;
    const sh = cs.boxShadow;
    if (sh && sh !== 'none') {
      shadows++;
      /* blur radius = the 3rd length; a crude but stable depth signature */
      const nums = sh.match(/-?\d+(\.\d+)?px/g);
      if (nums && nums.length >= 3) shadowDepths.add(r2(parseFloat(nums[2])));
    }
    for (const c of ['borderTopLeftRadius', 'borderTopRightRadius']) {
      const v = parseFloat(cs[c]);
      if (v > 0) radii.add(v > 500 ? 999 : r2(v));
    }
    for (const c of ['paddingTop', 'paddingLeft']) {
      const v = parseFloat(cs[c]);
      if (v > 0) pads.add(r2(v));
    }
    const g = parseFloat(cs.gap);
    if (g > 0) gaps.add(r2(g));
  }

  const doc = document.documentElement;
  return {
    textNodes,
    totalChars,
    type: {
      body,
      minSize,
      maxSize,
      maxSample,
      scaleContrast: body && maxSize ? r2(maxSize / body) : null,
      distinctSizes: sizes.length,
      top: sizes.slice(0, 12).map((s) => ({ px: s.px, chars: s.chars, sample: s.sample })),
      weights: [...weights].sort((a, b) => Number(a) - Number(b)),
      families: [...families].slice(0, 8),
      trackingValues: [...tracking].sort((a, b) => a - b),
    },
    colour: {
      textHueBuckets: [...textHues.keys()].map(Number).sort((a, b) => a - b),
      fillHueBuckets: [...fillHues.keys()].map(Number).sort((a, b) => a - b),
      chromaticTextNodes: [...textHues.values()].reduce((s, x) => s + x, 0),
      chromaticFillNodes: [...fillHues.values()].reduce((s, x) => s + x, 0),
      /* the populations each of the two counts above is a share OF */
      textBearingNodes: textBearing,
      areaBearingNodes: areaBearing,
    },
    depth: {
      shadows,
      shadowBlurs: [...shadowDepths].sort((a, b) => a - b).slice(0, 10),
      gradients,
      radii: [...radii].sort((a, b) => a - b).slice(0, 12),
    },
    space: {
      paddings: [...pads].sort((a, b) => a - b).slice(0, 14),
      gaps: [...gaps].sort((a, b) => a - b).slice(0, 12),
    },
    page: { scrollHeight: doc.scrollHeight, scrollWidth: doc.scrollWidth },
  };
};

/* ---------------------------------------------------------------- the driver */
const sig = (o) =>
  JSON.stringify({
    t: o.type,
    c: o.colour,
    d: o.depth,
    s: o.space,
    n: o.textNodes,
    ch: o.totalChars,
  });

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  let url = target;
  if (!/^https?:/.test(target)) {
    const p = resolve(target);
    if (!existsSync(p)) {
      console.error(`REFUSED: no such file ${p}`);
      await browser.close();
      process.exit(2);
    }
    if (extname(p) !== '.html') {
      console.error(`REFUSED: not an html file ${p}`);
      await browser.close();
      process.exit(2);
    }
    /* Serve over HTTP, never file:// — a module <script> is CORS-blocked there
       and the page renders NOTHING while every check reports clean.
       (kit/verify.mjs 2026-07-28; craft-gate re-learned it 2026-07-29.) */
    const { createServer } = await import('node:http');
    const { readFileSync } = await import('node:fs');
    const { dirname, join, normalize } = await import('node:path');
    const root = dirname(p);
    const types = {
      '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
      '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
    };
    const srv = createServer((req, res) => {
      const rel = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
      const f = join(root, rel === '/' ? '/' + p.split('/').pop() : rel);
      /* Read BEFORE writing headers — otherwise a missing asset throws after the
         200 is already on the wire and the whole run dies with ERR_HTTP_HEADERS_SENT. */
      let body;
      try {
        body = readFileSync(f);
      } catch {
        res.writeHead(404).end('nf');
        return;
      }
      res.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream' });
      res.end(body);
    });
    await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
    url = `http://127.0.0.1:${srv.address().port}/${p.split('/').pop()}`;
    page.once('close', () => srv.close());
  }

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(WAIT);
  await page.evaluate(() => window.scrollTo(0, 0));

  /* Settle loop: re-run until two consecutive censuses are IDENTICAL.
     REFUSE rather than report a frame. */
  let prev = null, out = null, settled = false;
  for (let i = 0; i < 8; i++) {
    const c = await page.evaluate(CENSUS);
    if (prev && sig(prev) === sig(c)) { out = c; settled = true; break; }
    prev = c;
    await page.waitForTimeout(500);
  }
  await browser.close();

  if (!settled) {
    console.error('REFUSED: page never settled — census differs between consecutive runs.');
    process.exit(3);
  }
  if (!out.textNodes) {
    console.error('REFUSED: zero rendered text nodes — the instrument can see nothing.');
    process.exit(3);
  }
  return out;
};

const p = await run();

if (JSON_OUT) {
  console.log(JSON.stringify({ target, width: WIDTH, ...p }, null, 2));
} else {
  const t = p.type;
  console.log(`\n  ${target}   (${WIDTH}px viewport)\n`);
  console.log(`  TYPE`);
  console.log(`    body size ............ ${t.body}px   (the size carrying the most text)`);
  console.log(`    largest content ...... ${t.maxSize}px  "${t.maxSample}"`);
  console.log(`    smallest content ..... ${t.minSize}px`);
  console.log(`    SCALE CONTRAST ....... ${t.scaleContrast}x  (largest / body)`);
  console.log(`    distinct sizes ....... ${t.distinctSizes}`);
  console.log(`    weights .............. ${t.weights.join(' ')}`);
  console.log(`    families ............. ${t.families.join(' / ')}`);
  if (t.trackingValues.length) console.log(`    tracking ............. ${t.trackingValues.join(' ')}`);
  console.log(`    size distribution (by characters carried):`);
  for (const s of t.top)
    console.log(`      ${String(s.px).padStart(6)}px  ${String(s.chars).padStart(6)} chars   ${s.sample}`);
  console.log(`\n  COLOUR`);
  console.log(`    text hue buckets ..... ${p.colour.textHueBuckets.length}  [${p.colour.textHueBuckets.join(' ')}]`);
  console.log(`    fill hue buckets ..... ${p.colour.fillHueBuckets.length}  [${p.colour.fillHueBuckets.join(' ')}]`);
  console.log(`    chromatic nodes ...... text ${p.colour.chromaticTextNodes} / fill ${p.colour.chromaticFillNodes}`);
  console.log(`\n  DEPTH`);
  console.log(`    box-shadows .......... ${p.depth.shadows}   blurs [${p.depth.shadowBlurs.join(' ')}]`);
  console.log(`    gradients ............ ${p.depth.gradients}`);
  console.log(`    radii ................ [${p.depth.radii.join(' ')}]`);
  console.log(`\n  SPACE`);
  console.log(`    paddings ............. [${p.space.paddings.join(' ')}]`);
  console.log(`    gaps ................. [${p.space.gaps.join(' ')}]`);
  console.log(`\n  ${p.textNodes} text nodes, ${p.totalChars} chars, settled.\n`);
}
