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
import { resolve } from 'node:path';

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
const T = {
  // CALIBRATED, NOT CITED. Marks+text per 10,000px² of unit area, fitted to two
  // labelled examples from this engagement: the 009 matrix cell (214×65px, ~3.6)
  // which David rejected as "extremely confusing", and the 006 front-door row
  // (1090×40px, ~1.4) which he approved. Two points is a weak fit; treat the
  // number as a prompt to look, never as a verdict. The MECHANISM is cited —
  // T4-1 §7.5, emphasis is zero-sum within a feature map.
  marksPerUnit:   { warn: 1.75, fail: 3.0, src: 'Calibrated on 2 labelled Studio examples (009 matrix rejected ≈3.6/10k px²; 006 front door approved ≈1.4). Mechanism: T4-1 §7.5 — emphasis is zero-sum within a feature map' },
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
await page.goto(isUrl ? FILE : 'file://' + FILE, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);

const report = await page.evaluate(({ UNIT_SEL, T }) => {
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
    return Boolean(bg) || bd > 0;
  };
  const marksIn = (root) => {
    const out = [];
    const rr = root.getBoundingClientRect();
    const rootArea = rr.width * rr.height;
    for (const el of root.querySelectorAll('*')) {
      if (!visible(el)) continue;
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
  const interactive = dataMarks.filter(({ el }) => {
    if (el.hasAttribute('tabindex') || el.hasAttribute('aria-label') || el.querySelector?.('title')) return true;
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
  R.checks.C5 = {
    interactiveMarks: interactive.length,
    underTarget: small,
    nnMedian: Math.round(med(nnAll) * 10) / 10,
    nnMin: nnAll.length ? Math.round(Math.min(...nnAll) * 10) / 10 : null,
    marksUnder9px: boxes.filter((r) => Math.min(r.width, r.height) < 9).length,
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
    const horiz = med(rects.map((r) => r.width)) >= med(rects.map((r) => r.height));
    const cv = (a) => { const m = a.reduce((x, y) => x + y, 0) / a.length; if (!m) return 0; const v = a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length; return Math.sqrt(v) / m; };
    const lens = rects.map((r) => (horiz ? r.width : r.height));
    // offset of each mark's centre within its own unit, normalised 0..1
    const offs = [];
    for (const el of dominant.els) {
      const u = unitEls.find((x) => x.contains(el)) || el.parentElement;
      if (!u) continue;
      const ur = u.getBoundingClientRect(), r = el.getBoundingClientRect();
      const span = horiz ? ur.width : ur.height;
      if (span <= 0) continue;
      const c = horiz ? (r.x + r.width / 2 - ur.x) : (r.y + r.height / 2 - ur.y);
      offs.push(Math.max(0, Math.min(1, c / span)));
    }
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
    const avail = (channel === 'position' || channel === 'constant') ? 1
      : (med(unitEls.map((u) => { const r = u.getBoundingClientRect(); return horiz ? r.width : r.height; })) || 1);
    const s = [...series].sort((a, b) => a - b);
    const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
    const inkArea = rects.reduce((a, r) => a + r.width * r.height, 0);
    const unitArea = unitEls.reduce((a, u) => { const r = u.getBoundingClientRect(); return a + r.width * r.height; }, 0) || 1;
    occ = {
      mark: dominant.tag, n: s.length, channel, axis: horiz ? 'x' : 'y',
      lenCV: Math.round(lenCV * 100) / 100, offCV: Math.round(offCV * 100) / 100,
      availablePx: channel === 'position' ? Math.round(med(unitEls.map((u) => { const r = u.getBoundingClientRect(); return horiz ? r.width : r.height; }))) : Math.round(avail),
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

await browser.close();

/* --------------------------------------------------------------- verdicts */
const findings = [];
const add = (id, level, msg, src) => findings.push({ id, level, msg, src });

const c1 = report.checks.C1;
if (c1.unitsCount) {
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
if (c5.underTarget > 0) add('C5', 'FAIL', `${c5.underTarget} of ${c5.interactiveMarks} interactive marks are under ${T.hitTarget.px}px; nearest-neighbour median ${c5.nnMedian}px, min ${c5.nnMin}px.`, T.hitTarget.src);
else if (c5.marksUnder9px > 0 && c5.nnMedian !== null && c5.nnMedian < 9) add('C5', 'WARN', `${c5.marksUnder9px} marks under 9px with a ${c5.nnMedian}px nearest-neighbour median — crowded even if not interactive.`, T.hitTarget.src);
else add('C5', 'PASS', `${c5.interactiveMarks} interactive marks, none under ${T.hitTarget.px}px; nearest-neighbour median ${c5.nnMedian}px.`, null);

const c6 = report.checks.C6;
const chromeNote = report.checks.C6chrome?.length ? ` [chrome skipped: ${report.checks.C6chrome.join(', ')}]` : '';
if (!c6) add('C6', 'SKIP', `No repeated mark with n≥8 that actually encodes — occupancy not measurable.${chromeNote}`, null);
else {
  const where = `<${c6.mark}> n=${c6.n}, encodes by ${c6.channel} on ${c6.axis} (length CV ${c6.lenCV}, offset CV ${c6.offCV})${chromeNote}`;
  if (c6.channel === 'mixed') add('C6', 'SKIP', `${where} — one tag serving several roles; an IQR over a mixed population is meaningless, so no verdict. Tag the data marks with data-encodes to measure this.`, null);
  else if (c6.iqrShare < T.occupancy.min) add('C6', 'FAIL', `${where}: middle half of the data spans ${(c6.iqrShare * 100).toFixed(1)}% of the ${c6.availablePx}px available; ink ${(c6.inkShare * 100).toFixed(1)}%.`, T.occupancy.src);
  else add('C6', 'PASS', `${where}: IQR occupies ${(c6.iqrShare * 100).toFixed(1)}% of ${c6.availablePx}px; ink ${(c6.inkShare * 100).toFixed(1)}%.`, null);
}

if (AS_JSON) {
  console.log(JSON.stringify({ file: FILE, report, findings, pageErrors }, null, 2));
} else {
  const mark = { PASS: '  ok  ', WARN: ' warn ', FAIL: ' FAIL ', SKIP: ' skip ' };
  console.log(`\ncraft-gate — ${(isUrl ? FILE : FILE.split('/').slice(-2).join('/'))}  @${WIDTH}px`);
  console.log(`repeating unit: ${report.unit || '(none found)'} × ${report.unitCount}`);
  if (report.considered.length > 1) console.log(`also considered: ${report.considered.slice(1).join('  ')}`);
  console.log('─'.repeat(96));
  for (const f of findings) {
    console.log(`[${mark[f.level]}] ${f.id}  ${f.msg}`);
    if (f.src && f.level !== 'PASS') console.log(`          ↳ ${f.src}`);
  }
  console.log('─'.repeat(96));
  const fails = findings.filter((f) => f.level === 'FAIL').length;
  const warns = findings.filter((f) => f.level === 'WARN').length;
  console.log(`${fails} fail, ${warns} warn, ${findings.filter((f) => f.level === 'PASS').length} pass, ${pageErrors.length} page errors`);
  console.log('\nThis gate measures the DRAWING. It cannot see whether the question is worth');
  console.log('asking — which is what actually sank 008 and 010. A clean gate is not a reason');
  console.log('to build; it is only a reason the drawing will not be what sinks it.\n');
}
process.exit(0);
