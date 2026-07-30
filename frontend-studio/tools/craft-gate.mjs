#!/usr/bin/env node
/**
 * craft-gate — a pre-flight density and legibility gate for Studio prototypes.
 *
 *   node tools/craft-gate.mjs <path-to-html> [--unit <selector>] [--width 1400] [--json]
 *
 * WHY THIS EXISTS
 * The existing probes (collisions, clipping, overflow, console errors) all passed on
 * every surface David rejected for being unreadable. They measure whether the page is
 * BROKEN. They do not measure whether it is DENSE. This measures density and legibility,
 * against thresholds that come from cited sources rather than from taste.
 *
 * BEFORE QUOTING THIS GATE, RUN `node tools/gate-selftest.mjs`.
 * It measures labelled specimens whose answers are known: a pair differing only
 * in paint (the census must be identical), a page whose population never settles
 * (the gate must refuse), and the two real surfaces David approved and rejected
 * (they must be ordered correctly). Until 2026-07-29 none of that existed, and
 * the gate spent an evening printing a falling density number for a design that
 * was not getting less dense — it was sampling mid-animation and silently
 * dropping every mark that had gained a gradient.
 *
 * WHAT IT CANNOT SEE — printed on every run, deliberately.
 * It measures the drawing. The more expensive failures in this engagement (008, 010)
 * were wrong QUESTIONS, drawn well. A clean gate is not evidence a surface is worth
 * building. It is only evidence that, if the question is right, the drawing will not
 * be what sinks it.
 *
 * CHECKS, each traceable to a rejection and a source:
 *   C1 marks per repeating unit ....... 009 matrix v1, 5.5 marks/cell — T4-1 §7.5
 *   C2 legend re-application load ..... 009 matrix v1, 4 entries × 48 cells — Okabe & Ito
 *   C3 categorical hues in data ....... Healey 1996 ceiling of 5
 *   C4 type scale conformance ......... 009 matrix v1, 192 numbers at 11px — Carbon/Butterick
 *   C5 hit targets and crowding ....... 011, 153 dots at 3.2px spacing — WCAG 2.5.8
 *   C6 dynamic-range occupancy ........ 009 matrix v2, 4.3% ink — the 2026-07-26 skew ruling
 */

import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import { resolve, dirname, join, extname } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';

const argv = process.argv.slice(2);
if (!argv.length || argv[0].startsWith('--')) {
  console.error('usage: craft-gate.mjs <file.html> [--unit <selector>] [--width N] [--json]');
  process.exit(2);
}
const isUrl = /^https?:\/\//.test(argv[0]);
const FILE = isUrl ? argv[0] : resolve(argv[0]);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};
const UNIT_SEL = opt('unit', null);
const WIDTH = Number(opt('width', 1400));
const SCALE_OVERRIDE = opt('scale', null);
const AS_JSON = argv.includes('--json');

/* ---------------------------------------------------------------- thresholds
 * Every number here carries its source. A threshold without one is a taste call
 * wearing a lab coat, and this engagement has paid for enough of those.
 */
/* The density threshold is MEASURED, not typed.
 *
 * It used to read warn 1.75 / fail 3.0, "fitted to" the 006 front door at ~1.4
 * and the 009 matrix at ~3.6. Both of those figures were produced by this gate
 * while it was sampling mid-animation and losing gradient-painted marks; measured
 * on a settled page with the full population they are 2.13 and 3.95. The
 * constants were a transcription of a broken instrument's output, and a
 * transcribed number cannot fail loudly when the thing it copied changes.
 * `tools/gate-selftest.mjs --write` re-measures both of David's labelled surfaces
 * and regenerates the file below. */
const CAL = (() => {
  try { return JSON.parse(readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../kit/gate-calibration.json'), 'utf8')); }
  catch { return null; }
})();
const T = {
  // Marks+text per 10,000px² of unit area. Two points is a weak fit; treat the
  // number as a prompt to look, never as a verdict. The MECHANISM is cited —
  // T4-1 §7.5, emphasis is zero-sum within a feature map.
  marksPerUnit:   { warn: CAL?.warn ?? 2.13, fail: CAL?.fail ?? 3.95,
                    src: CAL
                      ? `Measured ${CAL.measured} on two surfaces David ruled on — approved ${CAL.approved.file.split('/').pop()} ${CAL.warn}, rejected ${CAL.rejected.file.split('/').pop()} ${CAL.fail}. Mechanism: T4-1 §7.5 — emphasis is zero-sum within a feature map`
                      : 'UNCALIBRATED — run tools/gate-selftest.mjs --write. Mechanism: T4-1 §7.5' },
  legendLoad:     { max: 0,               src: 'colour-accessibility.md §D (Okabe & Ito) — label directly on the graphic; a legend forces a hue match, the channel that fails' },
  hues:           { max: 5,               src: 'Healey 1996 — detection "rapid and accurate" at 3 and 5 colours, "mixed" at 7 and 9 (T4-1 §7.3)' },
  /* THE RULER COMES FROM THE PRODUCT, NOT FROM CARBON.
   * The first version of this gate used Carbon's ramp (12/14/16/18…) and duly
   * convicted the live app for using 13px and 15px — which are the product's OWN
   * tokens. That is the 2026-07-25 lane-colour violation repeating in the type
   * channel: an internal craft heuristic overruling the product's contract.
   * Verified in dynasty-genius-product/frontend/src/styles/tokens.css:50-52 —
   *   --dg-text-sm 0.8125rem = 13px | --dg-text-base 0.9375rem = 15px
   *   --dg-text-lg 1.125rem = 18px  (no rem-base override, so 1rem = 16px)
   * Override with --scale 13,15,18 if the product's tokens ever change. */
  typeFloor:      { px: 13,               src: "The product's own smallest type token (--dg-text-sm = 13px, tokens.css:50). Content below it is smaller than anything the app ships" },
  typeScale:      { steps: [13, 15, 18],  src: "The product ships exactly three type tokens (tokens.css:50-52). Sizes off them are ad-hoc — the app itself has ~11, which is the 'no scale' signal, not a per-surface bug" },
  hitTarget:      { px: 24,               src: 'WCAG 2.2 SC 2.5.8 Target Size (Minimum), 24×24 CSS px' },
  occupancy:      { min: 0.25,            src: 'Ruling 2026-07-26 — compute the IQR span as a share of the axis before reaching for a filter; the fix is often the scale' },
};

if (SCALE_OVERRIDE) {
  T.typeScale.steps = SCALE_OVERRIDE.split(',').map(Number).filter((n) => n > 0).sort((a, b) => a - b);
  T.typeFloor.px = T.typeScale.steps[0];
  T.typeScale.src = `--scale override: ${T.typeScale.steps.join(', ')}px`;
  T.typeFloor.src = `--scale override: floor is the smallest given step (${T.typeFloor.px}px)`;
}

/* ------------------------------------------------------------ browser probe */
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: 1000 } });
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message.slice(0, 160)));
page.on('console', (m) => { if (m.type() === 'error') pageErrors.push(m.text().slice(0, 160)); });
/* Measure the END STATE, not a frame of the entrance.
 *
 * On 2026-07-29 four runs of one unchanged file returned 84, 108, 93 and 96
 * marks — density 3.44 to 5.63 — because `visible()` requires opacity > 0.02
 * and the gate sampled 400ms after load while a staggered entrance was still
 * fading marks in. Every density figure this gate has ever printed was drawn
 * mid-animation, including the "3.26 -> 2.74 -> 2.10" improvement trend in the
 * 012 record, which is therefore an artifact of when the screenshot happened to
 * be taken rather than a measurement of the design.
 *
 * Asking for reduced motion is the right fix rather than a longer sleep: a
 * surface built to the kit's rule already SUBSTITUTES its entrance with the
 * final frame, so this measures the state a reader ends up looking at. The
 * settle loop below is the guard for surfaces that do not. */
/* Serve, never file://.
 *
 * A module <script> is blocked over file:// by CORS, so a page that uses one
 * renders NOTHING and every check reports clean on an empty document. Run over
 * kit/fixtures.html this gate reported "0 controls, C5 SKIP" — a verdict about a
 * page that never executed. verify.mjs already learned this on 2026-07-28 and
 * the gate did not, which is what a lesson living in one file rather than in the
 * tooling looks like. */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
               '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
               '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const SERVE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const server = isUrl ? null : createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = join(SERVE_ROOT, rel);
  if (!file.startsWith(SERVE_ROOT) || !existsSync(file)) { res.writeHead(404); return res.end('no'); }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
if (server) await new Promise((r) => server.listen(0, '127.0.0.1', r));
const TARGET_URL = isUrl ? FILE
  : `http://127.0.0.1:${server.address().port}/${FILE.startsWith(SERVE_ROOT) ? FILE.slice(SERVE_ROOT.length + 1) : FILE}`;

await page.emulateMedia({ reducedMotion: 'reduce' });
await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);

const measure = () => page.evaluate(({ UNIT_SEL, T }) => {
  const MARK_TAGS = new Set(['rect', 'circle', 'line', 'path', 'polygon', 'polyline', 'ellipse']);
  const px = (v) => parseFloat(v) || 0;
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    const s = getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none' && px(s.opacity) > 0.02;
  };

  /* --- colour: normalise to HSL so hue families can be counted ---------
   * Via a 1×1 canvas rather than a regex, because the app's tokens are OKLCH
   * and Chrome serialises computed colour in its authored space. A regex over
   * rgb() silently reads every lane colour as null — which is exactly the bug
   * this comment exists to stop coming back.
   */
  const _cv = document.createElement('canvas'); _cv.width = _cv.height = 1;
  const _cx = _cv.getContext('2d', { willReadFrequently: true });
  _cx.globalCompositeOperation = 'copy';
  const _memo = new Map();
  const toHsl = (css) => {
    if (!css || css === 'none' || css === 'transparent') return null;
    if (_memo.has(css)) return _memo.get(css);
    let r, g, b, a;
    try {
      _cx.fillStyle = '#000';
      _cx.fillStyle = css;                       // invalid strings leave the previous value
      _cx.fillRect(0, 0, 1, 1);
      const d = _cx.getImageData(0, 0, 1, 1).data;
      r = d[0] / 255; g = d[1] / 255; b = d[2] / 255; a = d[3] / 255;
    } catch { _memo.set(css, null); return null; }
    if (a < 0.05) { _memo.set(css, null); return null; }
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    const l = (mx + mn) / 2;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    let h = 0;
    if (d !== 0) {
      if (mx === r) h = 60 * (((g - b) / d) % 6);
      else if (mx === g) h = 60 * ((b - r) / d + 2);
      else h = 60 * ((r - g) / d + 4);
    }
    const out = { h: (h + 360) % 360, s, l, a };
    _memo.set(css, out);
    return out;
  };

  /* --- is this element a data mark? ------------------------------------
   * Two populations: SVG geometry, and CSS marks (a childless, textless
   * element carrying its own painted background — the bar-as-a-div idiom
   * every Studio prototype uses). Text nodes are counted separately, because
   * a number is a different perceptual load from a mark.
   */
  const isCssMark = (el) => {
    if (el.children.length || el.textContent.trim()) return false;
    const s = getComputedStyle(el);
    const bg = toHsl(s.backgroundColor);
    const bd = px(s.borderTopWidth) + px(s.borderLeftWidth);
    /* A gradient IS paint. Requiring an opaque background-COLOR is what made 110
     * sub-24px targets vanish from C5 on 2026-07-28 the moment they were painted
     * with a gradient, turning a standing failure into a clean sheet. Reproduced
     * on demand by kit/gate-fixtures/paint-{flat,gradient}.html, which differ in
     * this and nothing else. */
    const img = s.backgroundImage && s.backgroundImage !== 'none';
    return Boolean(bg) || bd > 0 || img;
  };
  /* Role is DECLARED, never inferred from geometry.
   *
   * The gate spent 2026-07-28 trying to tell data from chrome by variance, and it
   * is not derivable: a season band and a trade mark can have identical geometry
   * and opposite meanings. Left to the heuristic it inverted BOTH roles on the
   * fixture — calling 72 real marks chrome and reporting on 48 declared-chrome
   * bands. An author who knows the answer can say so; where nobody says, the
   * heuristic still runs but its verdict is provisional. */
  const declaredRole = (el) =>
    el.getAttribute('data-sk-role') ||
    (el.getAttribute('aria-hidden') === 'true' ? 'chrome' : null);
  const marksIn = (root) => {
    const out = [];
    const rr = root.getBoundingClientRect();
    const rootArea = rr.width * rr.height;
    for (const el of root.querySelectorAll('*')) {
      if (!visible(el)) continue;
      const role = declaredRole(el);
      if (role === 'chrome' || (el.closest('[data-sk-role="chrome"],[aria-hidden="true"]') && role !== 'data')) continue;
      if (role === 'data') { out.push({ el, kind: 'declared', tag: el.tagName.toLowerCase() }); continue; }
      // A backdrop is not a datum. A rect covering most of its container is a
      // plot ground or a recessed band — counting it inflates density and, worse,
      // makes C6 read a constant background as "the mark that encodes nothing".
      const r = el.getBoundingClientRect();
      if (rootArea > 0 && r.width * r.height >= 0.6 * rootArea) continue;
      const tag = el.tagName.toLowerCase();
      if (MARK_TAGS.has(tag)) {
        const s = getComputedStyle(el);
        const painted = toHsl(s.fill) || (toHsl(s.stroke) && px(s.strokeWidth) > 0);
        if (painted) out.push({ el, kind: 'svg', tag });
      } else if (el.namespaceURI !== 'http://www.w3.org/2000/svg' && isCssMark(el)) {
        out.push({ el, kind: 'css', tag });
      }
    }
    return out;
  };
  const textLeaves = (root) => {
    const out = [];
    for (const el of root.querySelectorAll('*')) {
      if (!visible(el)) continue;
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
      if (own) out.push({ el, text: own });
    }
    return out;
  };

  /* --- find the repeating unit ------------------------------------------
   * The unit is the innermost element signature that repeats often enough to
   * be a grid/list and that carries marks. That is the thing the reader must
   * decode N times, so it is the thing whose budget matters.
   */
  const sig = (el) => el.tagName.toLowerCase() + '.' + [...el.classList].sort().join('.');
  let unitEls = [];
  let unitName = UNIT_SEL || null;
  if (UNIT_SEL) {
    unitEls = [...document.querySelectorAll(UNIT_SEL)].filter(visible);
  } else {
    const groups = new Map();
    for (const el of document.querySelectorAll('*')) {
      if (!visible(el) || !el.classList.length) continue;
      const k = sig(el);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(el);
    }
    /* A unit is the repeated CONTAINER a reader decodes, not the mark inside it.
     * Qualify on "holds at least two marks" — a single-mark element is the mark.
     * Rank by how many times the reader must do the decode; where two nested
     * containers repeat equally often, the outer one carries the whole load. */
    const cands = [];
    for (const [k, els] of groups) {
      if (els.length < 6) continue;
      const sample = els.slice(0, Math.min(8, els.length));
      const marks = sample.map((e) => marksIn(e).length).sort((a, b) => a - b);
      const medMarks = marks[marks.length >> 1];
      if (medMarks < 2) continue;
      cands.push({ k, els, medMarks, subtree: els[0].querySelectorAll('*').length });
    }
    cands.sort((a, b) => (b.els.length - a.els.length) || (b.subtree - a.subtree));
    if (cands.length) { unitEls = cands[0].els; unitName = cands[0].k; }
    var considered = cands.slice(0, 4).map((c) => `${c.k}×${c.els.length}(${c.medMarks}m)`);
  }

  const R = { unit: unitName, unitCount: unitEls.length, considered: typeof considered === 'undefined' ? [] : considered, checks: {} };

  /* --- C1 marks and numbers per unit ----------------------------------- */
  const perUnit = unitEls.map((u) => {
    const m = marksIn(u);
    const t = textLeaves(u);
    const nums = t.filter((x) => /^[\d.,%+\-#/×x ]+$/.test(x.text)).length;
    return { marks: m.length, texts: t.length, numbers: nums };
  });
  const med = (a) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); const i = s.length >> 1; return s.length % 2 ? s[i] : (s[i - 1] + s[i]) / 2; };
  /* Density is marks per unit AREA, not marks per unit. A 214×65px matrix cell
   * carrying five marks is a puzzle; a 1090×40px table row carrying six is not.
   * Comparing the raw counts convicts the wrong one. */
  const unitArea = med(unitEls.map((u) => { const r = u.getBoundingClientRect(); return r.width * r.height; })) || 1;
  R.checks.C1 = {
    unitsCount: unitEls.length,
    unitPx: unitEls.length ? `${Math.round(unitEls[0].getBoundingClientRect().width)}×${Math.round(unitEls[0].getBoundingClientRect().height)}` : null,
    marksMedian: med(perUnit.map((p) => p.marks)),
    marksMax: Math.max(0, ...perUnit.map((p) => p.marks)),
    marksTotal: perUnit.reduce((a, p) => a + p.marks, 0),
    numbersTotal: perUnit.reduce((a, p) => a + p.numbers, 0),
    textTotal: perUnit.reduce((a, p) => a + p.texts, 0),
    density: Math.round(((med(perUnit.map((p) => p.marks + p.texts)) / unitArea) * 10000) * 100) / 100,
  };

  /* --- C2 legend load ---------------------------------------------------
   * A legend is a lookup the reader re-applies once per unit. Cost is
   * entries × units, not entries.
   */
  const legendRoots = [...document.querySelectorAll('[class*="legend" i],[class*="key" i],[id*="legend" i]')].filter(visible);
  let legendEntries = 0;
  for (const lr of legendRoots) legendEntries += Math.max(marksIn(lr).length, 0);
  R.checks.C2 = {
    legends: legendRoots.length,
    entries: legendEntries,
    reapplications: legendEntries * unitEls.length,
    where: legendRoots.slice(0, 3).map((e) => sig(e)),
  };

  /* --- C3 categorical hues in the data region -------------------------- */
  const dataMarks = unitEls.flatMap((u) => marksIn(u));
  /* Fingerprint the population by WHICH marks are visible and where, not how
   * many. The never-settles fixture flickers alternating halves: 36 marks are
   * visible at every instant, but never the same 36. A count-only signature
   * called that settled — the guard passing its own known-bad specimen, which is
   * the failure this whole file exists to catch, one level up. */
  R.censusHash = (() => {
    const s = dataMarks
      .map(({ el }) => { const r = el.getBoundingClientRect(); return `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)}`; })
      .sort().join('|');
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
    return `${dataMarks.length}:${(h >>> 0).toString(16)}`;
  })();
  const hueBins = new Map();
  for (const { el, kind } of dataMarks) {
    const s = getComputedStyle(el);
    // `fill` is defined on every element and computes to opaque black on HTML
    // nodes, so it may only be consulted for SVG geometry. Reading it on a div
    // paints the whole surface grey and silently passes C3.
    const c = kind === 'svg'
      ? (toHsl(s.fill !== 'none' ? s.fill : null) || toHsl(s.stroke))
      : (toHsl(s.backgroundColor) || toHsl(s.borderTopColor));
    if (!c || c.s < 0.15) continue;            // near-grey is structure, not identity
    const bin = Math.round(c.h / 30) * 30 % 360;
    hueBins.set(bin, (hueBins.get(bin) || 0) + 1);
  }
  R.checks.C3 = {
    hueFamilies: hueBins.size,
    bins: [...hueBins.entries()].sort((a, b) => b[1] - a[1]).map(([h, n]) => `${h}°×${n}`),
    greyMarks: dataMarks.length - [...hueBins.values()].reduce((a, b) => a + b, 0),
  };

  /* --- C4 type scale conformance --------------------------------------- */
  /* The source makes a distinction this check must make too: the 009 matrix was
   * convicted for setting CONTENT (player names, counts) at 11px 192 times, not
   * for eyebrow labels. Content = anything inside a repeating unit (per-entity
   * data the reader must actually read) or prose over 24 characters. A short
   * string outside the repeated region is a label, and 10px is a label size. */
  const inUnit = new Set();
  for (const u of unitEls) for (const t of textLeaves(u)) inUnit.add(t.el);
  const sizes = new Map();
  const smallContent = [];
  const smallLabels = [];
  for (const { el, text } of textLeaves(document.body)) {
    const fs = Math.round(px(getComputedStyle(el).fontSize) * 10) / 10;
    sizes.set(fs, (sizes.get(fs) || 0) + 1);
    if (fs >= T.typeFloor.px || text.replace(/\s/g, '').length <= 2) continue;
    // Content is per-entity data the reader decodes repeatedly — i.e. text inside
    // a repeating unit. A page eyebrow, section caption or footnote is a label,
    // and a label size is what 10–11px is for. Only the first kind convicted 009.
    const isContent = inUnit.has(el);
    (isContent ? smallContent : smallLabels).push({ fs, text: text.slice(0, 28) });
  }
  const offScale = [...sizes.keys()].filter((s) => !T.typeScale.steps.includes(Math.round(s)));
  R.checks.C4 = {
    distinctSizes: sizes.size,
    sizes: [...sizes.entries()].sort((a, b) => a[0] - b[0]).map(([s, n]) => `${s}px×${n}`),
    offScale: offScale.sort((a, b) => a - b),
    belowFloor: smallContent.length,
    belowFloorSamples: smallContent.slice(0, 5),
    smallLabels: smallLabels.length,
  };

  /* --- C5 hit targets and crowding -------------------------------------
   * Scope: marks that behave as controls — a pointer cursor, a title, an
   * aria-label, or a tabindex. A purely decorative mark is out of scope for
   * WCAG 2.5.8 and is reported separately as crowding only.
   */
  /* WCAG 2.5.8 scopes to the TARGET, not to every mark drawn inside one. A dot
   * inside a 40px clickable row is not itself a 24px target requirement — the
   * row is the target. So a mark qualifies only when interactivity is its OWN:
   * its own hover/focus affordance, not one inherited from an ancestor. */
  /* An aria-label NAMES a thing; it does not make it pressable, and a title
   * attribute is a tooltip. Both were treated as evidence of interactivity, so
   * a labelled-but-inert mark was convicted under a target-size rule that does
   * not apply to it. Real interactivity is a real control, or a pointer cursor
   * the element owns rather than inherits from a clickable ancestor. */
  const interactive = dataMarks.filter(({ el }) => {
    if (el.matches?.('button,a[href],input,select,[role="button"]') || el.hasAttribute('tabindex')) return true;
    const s = getComputedStyle(el);
    if (s.cursor !== 'pointer') return false;
    const parent = el.parentElement;
    return !parent || getComputedStyle(parent).cursor !== 'pointer';   // inherited pointer ⇒ ancestor is the target
  });
  const boxes = dataMarks.map(({ el }) => el.getBoundingClientRect());
  const small = interactive.filter(({ el }) => {
    const r = el.getBoundingClientRect();
    return Math.min(r.width, r.height) < T.hitTarget.px;
  }).length;
  // crowding: nearest-neighbour centre distance among marks inside one unit
  let nnAll = [];
  for (const u of unitEls.slice(0, 40)) {
    const rs = marksIn(u).map(({ el }) => el.getBoundingClientRect());
    for (let i = 0; i < rs.length; i++) {
      let best = Infinity;
      for (let j = 0; j < rs.length; j++) {
        if (i === j) continue;
        const dx = (rs[i].x + rs[i].width / 2) - (rs[j].x + rs[j].width / 2);
        const dy = (rs[i].y + rs[i].height / 2) - (rs[j].y + rs[j].height / 2);
        best = Math.min(best, Math.hypot(dx, dy));
      }
      if (Number.isFinite(best)) nnAll.push(best);
    }
  }
  /* The whole page's controls, not just the marks inside the repeating unit.
   * C5 scoped itself to marks, so a small control that was not a "mark" — a
   * chip, a close button, an icon-only toggle — could never be convicted by it.
   * A checker that can only see one shape of failure reports clean on the
   * others, which is how "C5 PASS" came to mean nothing on ten surfaces. */
  const allControls = [...document.querySelectorAll('button,a[href],input,select,[role="button"],[tabindex]')]
    .filter(visible);
  /* SC 2.5.8 exempts a target "in a sentence, or whose size is otherwise
   * constrained by the line-height of non-target text". A link inside prose is
   * not a design defect and convicting it would make the check cry wolf — the
   * mirror image of the false passes fixed this morning, and just as corrosive
   * to whether anyone acts on the output. A standalone control is not exempt
   * however small the type around it. */
  const inlineExempt = (el) => {
    if (!/^inline/.test(getComputedStyle(el).display)) return false;
    const p = el.parentElement;
    if (!p) return false;
    return [...p.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
  };
  const underAll = allControls
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => Math.min(r.width, r.height) < T.hitTarget.px);
  const controlsUnder = underAll.filter(({ el }) => !inlineExempt(el));
  const controlsUnderInline = underAll.length - controlsUnder.length;
  R.checks.C5 = {
    interactiveMarks: interactive.length,
    underTarget: small,
    nnMedian: Math.round(med(nnAll) * 10) / 10,
    nnMin: nnAll.length ? Math.round(Math.min(...nnAll) * 10) / 10 : null,
    marksUnder9px: boxes.filter((r) => Math.min(r.width, r.height) < 9).length,
    pageControls: allControls.length,
    pageControlsUnder: controlsUnder.length,
    pageControlsUnderInlineExempt: controlsUnderInline,
    pageControlSamples: controlsUnder.slice(0, 4).map(({ el, r }) =>
      ({ tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().split(' ')[0],
         w: Math.round(r.width), h: Math.round(r.height) })),
  };

  /* --- C6 dynamic-range occupancy --------------------------------------
   * For the dominant repeated mark, how much of the available length does
   * the middle half of the data actually occupy? A low number means the
   * reader is being shown a scale, not a distribution.
   */
  const byTag = new Map();
  for (const { el, tag } of dataMarks) {
    if (!byTag.has(tag)) byTag.set(tag, []);
    byTag.get(tag).push(el);
  }
  /* Walk candidate mark types most-numerous first, skipping any that is pure
   * chrome — constant in both size and offset across every unit. A plot frame or
   * a tick rail is drawn n times and encodes nothing BY DESIGN; convicting it for
   * "not varying" is the gate blaming the scaffolding for the building.
   *
   * Which channel a mark encodes with decides what "occupancy" even means.
   * A bar encodes with LENGTH — measure the spread of its lengths. A dot of
   * fixed radius encodes with POSITION — measuring its length is a category
   * error, so measure the spread of its offsets inside the unit instead.
   * Classify by which varies: coefficient of variation across instances. */
  const ranked = [...byTag.entries()].filter(([, els]) => els.length >= 8).sort((a, b) => b[1].length - a[1].length);
  const chrome = [];
  let occ = null;
  for (const [tag, els] of ranked) {
    const dominant = { tag, els };
    const rects = dominant.els.map((e) => e.getBoundingClientRect());
    const cv = (a) => { const m = a.reduce((x, y) => x + y, 0) / a.length; if (!m) return 0; const v = a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length; return Math.sqrt(v) / m; };
    /* LENGTH runs along the mark's long side; POSITION runs along whichever axis
     * the marks actually spread on. Those are different questions and the gate
     * used the mark's aspect ratio to answer both — so a 13x16px trade mark laid
     * out left-to-right was measured on its Y axis, where every mark sits at the
     * same top, read as "does not vary", and dismissed as chrome. That is how all
     * 72 real marks on 012 disappeared from C6 while the season bands were kept.
     * Measure both axes and let the data say which one carries the position. */
    const lenHoriz = med(rects.map((r) => r.width)) >= med(rects.map((r) => r.height));
    const lens = rects.map((r) => (lenHoriz ? r.width : r.height));
    // offset of each mark's centre within its own unit, normalised 0..1, per axis
    const offsBy = { x: [], y: [] };
    for (const el of dominant.els) {
      const u = unitEls.find((x) => x.contains(el)) || el.parentElement;
      if (!u) continue;
      const ur = u.getBoundingClientRect(), r = el.getBoundingClientRect();
      if (ur.width > 0) offsBy.x.push(Math.max(0, Math.min(1, (r.x + r.width / 2 - ur.x) / ur.width)));
      if (ur.height > 0) offsBy.y.push(Math.max(0, Math.min(1, (r.y + r.height / 2 - ur.y) / ur.height)));
    }
    const posHoriz = cv(offsBy.x) >= cv(offsBy.y);
    const offs = posHoriz ? offsBy.x : offsBy.y;
    const lenCV = cv(lens), offCV = cv(offs);
    /* Inferring the channel from variance alone is fooled twice over, so guard both:
     *  - A filled dot and a hollow ring are two SIZES but one categorical style, not
     *    a magnitude encoding. Few distinct sizes ⇒ the mark encodes by position.
     *  - One tag serving several roles (band + bar + tick) is a mixed population, and
     *    an IQR over a mixed population means nothing. Decline the verdict instead of
     *    issuing a confident wrong one.
     * An explicit data-encodes="length|position" on the mark overrides all of this. */
    const declared = dominant.els[0].getAttribute?.('data-encodes');
    const distinctSizes = new Set(lens.map((l) => Math.round(l))).size;
    let channel;
    if (declared === 'length' || declared === 'position') channel = declared;
    else if (distinctSizes <= 3) channel = offCV >= 0.05 ? 'position' : 'constant';
    else if (lenCV > 1.0) channel = 'mixed';
    else channel = lenCV >= 0.15 ? 'length' : (offCV >= 0.05 ? 'position' : 'constant');
    const series = (channel === 'position' || channel === 'constant') ? offs : lens;
    // the axis the REPORTED channel runs along — position and length can differ
    const horiz = (channel === 'position' || channel === 'constant') ? posHoriz : lenHoriz;
    const spanOf = () => med(unitEls.map((u) => { const r = u.getBoundingClientRect(); return horiz ? r.width : r.height; })) || 1;
    const avail = (channel === 'position' || channel === 'constant') ? 1 : spanOf();
    const s = [...series].sort((a, b) => a - b);
    const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
    const inkArea = rects.reduce((a, r) => a + r.width * r.height, 0);
    const unitArea = unitEls.reduce((a, u) => { const r = u.getBoundingClientRect(); return a + r.width * r.height; }, 0) || 1;
    occ = {
      mark: dominant.tag, n: s.length, channel, axis: horiz ? 'x' : 'y',
      lenCV: Math.round(lenCV * 100) / 100, offCV: Math.round(offCV * 100) / 100,
      availablePx: channel === 'position' ? Math.round(spanOf()) : Math.round(avail),
      iqrShare: Math.round(((q(0.75) - q(0.25)) / avail) * 1000) / 1000,
      medianShare: Math.round((q(0.5) / avail) * 1000) / 1000,
      inkShare: Math.round((inkArea / unitArea) * 1000) / 1000,
    };
    if (channel === 'constant') { chrome.push(`${tag}×${els.length}`); occ = null; continue; }
    break;                                   // first genuinely-encoding mark wins
  }
  R.checks.C6 = occ;
  R.checks.C6chrome = chrome;

  return R;
}, { UNIT_SEL, T });

/* --- settle, or refuse ------------------------------------------------------
 * The census is re-run until it repeats itself. Re-running the WHOLE measurement
 * rather than a cheap proxy count is deliberate: a proxy can agree that the page
 * has settled while the real population is still moving, which is the same class
 * of failure — an instrument reporting on a population it is not actually
 * counting. If it never repeats, the numbers are not reported at all. A gate that
 * refuses is worth more than one that prints a plausible figure from a moving
 * page, because a plausible figure gets quoted. */
const sig = (r) => JSON.stringify([r.unitCount, r.censusHash, r.checks.C1.textTotal,
                                   r.checks.C5.interactiveMarks, r.checks.C6?.mark ?? null, r.checks.C6?.n ?? null]);
let report = await measure();
const trace = [sig(report)];
let stable = 1;
for (let i = 0; i < 12 && stable < 3; i++) {
  await page.waitForTimeout(200);
  const next = await measure();
  stable = sig(next) === sig(report) ? stable + 1 : 1;
  report = next;
  trace.push(sig(report));
}
report.settled = stable >= 3;
report.settleTrace = trace;

/* An instrument that reports clean must first prove it can see anything at all.
 * A page that rendered nothing is a failed load, not a tidy surface. */
report.rendered = await page.evaluate(() => ({
  elements: document.body ? document.body.querySelectorAll('*').length : 0,
  text: (document.body?.innerText || '').trim().length,
}));
report.blank = report.rendered.elements < 5 && report.rendered.text < 20;

await browser.close();
if (server) server.close();

/* --------------------------------------------------------------- verdicts */
const findings = [];
const add = (id, level, msg, src) => findings.push({ id, level, msg, src });

/* Every population-dependent check is silenced when the page never settled.
 * C2/C3/C4 read type, hue and legends, which do not depend on how many marks
 * have finished animating, so they still speak. */
if (report.blank) {
  console.error(`\ncraft-gate REFUSES: ${FILE}\nThe page rendered ${report.rendered.elements} elements and ${report.rendered.text} characters — it is blank.\nNo verdict is meaningful on an empty document. Check the page actually loads (a module\n<script> needs an HTTP origin; this gate serves one, an external harness may not).\n`);
  process.exit(3);
}

const MOVING = !report.settled;
const refuse = (id) => add(id, 'REFUSED', `The mark population never stopped changing across ${report.settleTrace.length} samples, so this check has no fixed population to measure. Samples: ${[...new Set(report.settleTrace)].length} distinct. Give the surface a reduced-motion path that renders the final frame, or pass a settled page.`, null);

const c1 = report.checks.C1;
if (MOVING) refuse('C1');
else if (c1.unitsCount) {
  const c1msg = `density ${c1.density} marks+text per 10k px² in a ${c1.unitPx}px unit — ${c1.marksMedian} marks/unit (median, max ${c1.marksMax}) over ${c1.unitsCount} units; ${c1.marksTotal} marks and ${c1.numbersTotal} numbers in the repeated region.`;
  if (c1.density > T.marksPerUnit.fail) add('C1', 'FAIL', c1msg, T.marksPerUnit.src);
  else if (c1.density > T.marksPerUnit.warn) add('C1', 'WARN', c1msg, T.marksPerUnit.src);
  else add('C1', 'PASS', c1msg, null);
} else add('C1', 'SKIP', 'No repeating unit found — pass --unit <selector> if the surface has one.', null);

const c2 = report.checks.C2;
// Two entries is the constitutional model/market pair, learned once across every
// surface; the 009 conviction was a FOUR-entry key re-applied 48 times. Severity
// therefore scales with entries, not with the mere presence of a legend.
if (c2.entries >= 3) add('C2', 'FAIL', `${c2.entries}-entry legend re-applied across ${report.unitCount} units = ${c2.reapplications} hue matches. Direct-label instead.`, T.legendLoad.src);
else if (c2.entries > 0) add('C2', 'WARN', `${c2.entries}-entry legend × ${report.unitCount} units = ${c2.reapplications} lookups. Tolerable only because the lane pair is constant across surfaces; direct-label if it grows.`, T.legendLoad.src);
else add('C2', 'PASS', 'No legend found — identity is direct-labelled or single-series.', null);

const c3 = report.checks.C3;
if (c3.hueFamilies > T.hues.max) add('C3', 'FAIL', `${c3.hueFamilies} hue families in the data region (${c3.bins.join(', ')}).`, T.hues.src);
else add('C3', 'PASS', `${c3.hueFamilies} hue families in the data region${c3.bins.length ? ` (${c3.bins.join(', ')})` : ''}; ${c3.greyMarks} structural/grey marks.`, null);

const c4 = report.checks.C4;
// The content/label split is "is it inside a repeating unit". With no unit found
// there is no basis for the split and everything falls to "label", which
// understates the finding. Say so rather than report a quiet warn.
const c4blind = report.unitCount === 0 && c4.smallLabels > 0;
const c4tail = c4blind
  ? `(${c4.smallLabels} sub-${T.typeFloor.px}px nodes ALL classified label — no repeating unit, so the content/label split is unreliable here; inspect by eye)`
  : `(${c4.smallLabels} sub-${T.typeFloor.px}px LABELS not counted — label sizes are legitimate)`;
if (c4.belowFloor > 0) add('C4', 'FAIL', `${c4.belowFloor} CONTENT nodes below ${T.typeFloor.px}px, e.g. ${c4.belowFloorSamples.map((s) => `${s.fs}px "${s.text}"`).slice(0, 3).join('; ')} ${c4tail}.`, T.typeFloor.src);
else if (c4.offScale.length) add('C4', 'WARN', `${c4.distinctSizes} distinct sizes, ${c4.offScale.length} off the ramp: ${c4.offScale.join(', ')}px ${c4tail}.`, T.typeScale.src);
else add('C4', 'PASS', `${c4.distinctSizes} distinct sizes, all on the ramp, no content below ${T.typeFloor.px}px ${c4tail}.`, null);

const c5 = report.checks.C5;
if (MOVING) refuse('C5');
else if (c5.underTarget > 0) add('C5', 'FAIL', `${c5.underTarget} of ${c5.interactiveMarks} interactive marks are under ${T.hitTarget.px}px; nearest-neighbour median ${c5.nnMedian}px, min ${c5.nnMin}px.`, T.hitTarget.src);
// a small control that is not a "mark" was invisible to the mark-scoped check
else if (c5.pageControlsUnder > 0) add('C5', 'FAIL', `${c5.pageControlsUnder} of ${c5.pageControls} controls on the page are under ${T.hitTarget.px}px, e.g. ${c5.pageControlSamples.map((s) => `<${s.tag}>.${s.cls} ${s.w}×${s.h}`).join('; ')}. None is a data mark, which is why the mark-scoped check missed them${c5.pageControlsUnderInlineExempt ? `; a further ${c5.pageControlsUnderInlineExempt} are exempt as inline targets in prose` : ''}.`, T.hitTarget.src);
// NEVER pass an empty population. "0 marks, none under 24px" is a vacuous pass,
// and it is what this check reported on ten surfaces before 2026-07-29.
else if (c5.interactiveMarks === 0) add('C5', 'SKIP', `No mark on this surface is its own target — where marks are clickable the row or card around them is the target, which is the correct WCAG 2.5.8 scope. Nothing for this check to measure. Separately verified: all ${c5.pageControls} controls on the page are at least ${T.hitTarget.px}px.`, null);
else if (c5.marksUnder9px > 0 && c5.nnMedian !== null && c5.nnMedian < 9) add('C5', 'WARN', `${c5.marksUnder9px} marks under 9px with a ${c5.nnMedian}px nearest-neighbour median — crowded even if not interactive.`, T.hitTarget.src);
else add('C5', 'PASS', `${c5.interactiveMarks} interactive marks, none under ${T.hitTarget.px}px (and all ${c5.pageControls} page controls clear it); nearest-neighbour median ${c5.nnMedian}px.`, null);

const c6 = report.checks.C6;
const chromeNote = report.checks.C6chrome?.length ? ` [chrome skipped: ${report.checks.C6chrome.join(', ')}]` : '';
if (MOVING) refuse('C6');
else if (!c6) add('C6', 'SKIP', `No repeated mark with n≥8 that actually encodes — occupancy not measurable.${chromeNote}`, null);
else {
  const where = `<${c6.mark}> n=${c6.n}, encodes by ${c6.channel} on ${c6.axis} (length CV ${c6.lenCV}, offset CV ${c6.offCV})${chromeNote}`;
  if (c6.channel === 'mixed') add('C6', 'SKIP', `${where} — one tag serving several roles; an IQR over a mixed population is meaningless, so no verdict. Tag the data marks with data-encodes to measure this.`, null);
  else if (c6.iqrShare < T.occupancy.min) add('C6', 'FAIL', `${where}: middle half of the data spans ${(c6.iqrShare * 100).toFixed(1)}% of the ${c6.availablePx}px available; ink ${(c6.inkShare * 100).toFixed(1)}%.`, T.occupancy.src);
  else add('C6', 'PASS', `${where}: IQR occupies ${(c6.iqrShare * 100).toFixed(1)}% of ${c6.availablePx}px; ink ${(c6.inkShare * 100).toFixed(1)}%.`, null);
}

if (AS_JSON) {
  console.log(JSON.stringify({ file: FILE, report, findings, pageErrors }, null, 2));
} else {
  const mark = { PASS: '  ok  ', WARN: ' warn ', FAIL: ' FAIL ', SKIP: ' skip ', REFUSED: 'REFUSE' };
  console.log(`\ncraft-gate — ${(isUrl ? FILE : FILE.split('/').slice(-2).join('/'))}  @${WIDTH}px`);
  console.log(`repeating unit: ${report.unit || '(none found)'} × ${report.unitCount}`);
  console.log(report.settled
    ? `population settled after ${report.settleTrace.length} samples (reduced-motion emulated)`
    : `POPULATION NEVER SETTLED across ${report.settleTrace.length} samples — density and target checks refused`);
  if (report.considered.length > 1) console.log(`also considered: ${report.considered.slice(1).join('  ')}`);
  console.log('─'.repeat(96));
  for (const f of findings) {
    console.log(`[${mark[f.level]}] ${f.id}  ${f.msg}`);
    if (f.src && f.level !== 'PASS') console.log(`          ↳ ${f.src}`);
  }
  console.log('─'.repeat(96));
  const fails = findings.filter((f) => f.level === 'FAIL').length;
  const warns = findings.filter((f) => f.level === 'WARN').length;
  const refused = findings.filter((f) => f.level === 'REFUSED').length;
  console.log(`${fails} fail, ${warns} warn, ${findings.filter((f) => f.level === 'PASS').length} pass${refused ? `, ${refused} REFUSED` : ''}, ${pageErrors.length} page errors`);
  console.log('\nThis gate measures the DRAWING. It cannot see whether the question is worth');
  console.log('asking — which is what actually sank 008 and 010. A clean gate is not a reason');
  console.log('to build; it is only a reason the drawing will not be what sinks it.\n');
}
process.exit(0);
