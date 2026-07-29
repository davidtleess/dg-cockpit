#!/usr/bin/env node
/**
 * verify — test the kit's CHECKERS against labelled specimens, in both directions.
 *
 *   node kit/verify.mjs            # run the fixtures
 *   node kit/verify.mjs <file>     # also run every check over a real surface
 *
 * WHY THIS EXISTS, and it is the reason the kit is trustworthy in a way the
 * density gate was not.
 *
 * On 2026-07-28 the gate scored an APPROVED surface at 5 FAIL and a REJECTED one
 * at 1 FAIL — exactly backwards — because it had never been run against a case
 * whose verdict was already known. The same night it reported a check PASSING
 * that had failed all evening, because adding a gradient to a mark changed how it
 * was classified and the gate silently stopped counting it. A tool that narrows
 * its own population reports progress that did not happen, which is the most
 * dangerous failure an instrument has, because it flatters.
 *
 * So: every checker here must reproduce a known-good as good AND a known-bad as
 * bad. A checker that cannot convict its own bad specimen is reported as BROKEN
 * and its verdicts on real surfaces are suppressed.
 */

import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = resolve(HERE, 'fixtures.html');
const TOKENS = JSON.parse(readFileSync(resolve(HERE, 'studio-kit.tokens.json'), 'utf8'));
const TARGET = process.argv[2] ? (/^https?:/.test(process.argv[2]) ? process.argv[2] : resolve(process.argv[2])) : null;

/* ---------------------------------------------------------------- checkers --
 * Each runs in the page and returns {ok, detail}. They are deliberately small:
 * a checker complex enough to be interesting is complex enough to be wrong. */
const CHECKS = {
  /* Every interactive mark must present a >=24px target. The kit does this with
     an ::after; a hand-rolled mark does not, and must be convicted. */
  hit: (root) => {
    const els = [...root.querySelectorAll('button,[role="button"],a[href],input,select')];
    const bad = [];
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      const after = getComputedStyle(el, '::after');
      // read the pseudo-element's own box; `max(100%,24px)` resolves to a px value
      const aw = parseFloat(after.width) || 0;
      const ah = parseFloat(after.height) || 0;
      const w = Math.max(r.width, aw);
      const h = Math.max(r.height, ah);
      if (w < 24 || h < 24) bad.push({ w: +w.toFixed(1), h: +h.toFixed(1), cls: el.className });
    }
    return { ok: bad.length === 0, detail: `${els.length} targets, ${bad.length} under 24px`, bad: bad.slice(0, 4) };
  },

  /* The census must not lose a mark because it gained a gradient. Marks declare
     themselves with data-sk-role="data"; the checker counts declarations, so no
     paint change can alter the population. */
  census: (root) => {
    const declared = [...root.querySelectorAll('[data-sk-role="data"]')];
    const withGradient = declared.filter((e) => getComputedStyle(e).backgroundImage.includes('gradient'));
    // Falsifiable: the population is defined by DECLARATION, so a paint change
    // cannot remove a mark from it. The specimen deliberately paints its marks
    // with a gradient — if the count drops when paint changes, this fails.
    return {
      ok: declared.length > 0 && withGradient.length === declared.length,
      detail: `${declared.length} declared data marks, ${withGradient.length} of them gradient-painted and still counted`,
      count: declared.length,
    };
  },

  /* Chrome declared as chrome must be excluded from the data population. */
  chrome: (root) => {
    const data = root.querySelectorAll('[data-sk-role="data"]').length;
    const chrome = root.querySelectorAll('[data-sk-role="chrome"]').length;
    // what a NAIVE counter would have taken as the population — the density
    // gate's C6 did exactly this and convicted constant-width bands as data
    const naive = root.querySelectorAll('.lane > *').length;
    return {
      ok: data > 0 && chrome > 0 && naive > data && data + chrome === naive,
      detail: `${naive} elements in the lane; ${data} are data, ${chrome} are chrome and are excluded`,
    };
  },

  /* No CONTENT below the product's own smallest step. A label AT the floor is
     legitimate — the 009 conviction was for content, not for labels. */
  type: (root, cfg) => {
    const floor = cfg.floor;
    const bad = [];
    for (const el of root.querySelectorAll('*')) {
      const txt = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('');
      if (!txt) continue;
      if (el.closest('.sk-label,.sk-mono,[data-sk-role="label"]')) continue;
      const px = parseFloat(getComputedStyle(el).fontSize);
      if (px < floor) bad.push({ px, txt: txt.slice(0, 40) });
    }
    return { ok: bad.length === 0, detail: `${bad.length} content nodes below ${floor}px`, bad: bad.slice(0, 4) };
  },

  /* A key the reader re-applies is the failure Okabe & Ito name. */
  legend: (root) => {
    const legends = root.querySelectorAll('.sk-legend,[data-sk-role="legend"]');
    return { ok: legends.length === 0, detail: `${legends.length} legend blocks` };
  },

  /* The product renders zero gradients and zero elevation shadows. Hatch
     patterns are exempt: repeating-linear-gradient encodes missing data. */
  vocab: (root, cfg) => {
    const g = [], sh = [], rad = new Set();
    const allowed = new Set(cfg.radii.map((n) => `${n}px`));
    allowed.add('50%'); allowed.add('999px'); allowed.add('0px');
    for (const el of root.querySelectorAll('*')) {
      const c = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width < 3 || r.height < 3) continue;
      const bg = c.backgroundImage;
      if (bg.includes('gradient') && !bg.includes('repeating-linear-gradient')) g.push(el.className || el.tagName);
      // an inset shadow is a border drawn as a shadow; only elevation is convicted
      if (c.boxShadow !== 'none' && !c.boxShadow.includes('inset')) sh.push(c.boxShadow.slice(0, 40));
      const q = c.borderTopLeftRadius;
      if (q && !allowed.has(q)) rad.add(q);
    }
    return {
      ok: g.length === 0 && sh.length === 0 && rad.size === 0,
      detail: `${g.length} non-hatch gradients, ${sh.length} elevation shadows, off-scale radii [${[...rad].join(',')}]`,
    };
  },
};

/* ------------------------------------------------- checkers that need the driver
 * `semantics` cannot run inside page.evaluate: the aria tree is built by the
 * browser driver, not by the page. It is a DIFFERENT SENSE from `hit` — `hit`
 * asks whether a target can be pressed, `semantics` asks whether pressing it
 * means anything to someone who cannot see it. Studio has been measuring pixels
 * and DOM boxes all along and had no reading of this kind until 2026-07-28.
 * Adopted from Playwright MCP's own technique (structured accessibility trees
 * instead of screenshots) without installing anything — locator.ariaSnapshot()
 * ships in the Playwright already vendored by the product. */
const DRIVER_CHECKS = {
  semantics: async (page, sel) => {
    const yaml = await page.locator(sel).ariaSnapshot();
    const lines = yaml.split('\n').filter(Boolean);
    const interactive = lines.filter((l) => /- (button|link|combobox|checkbox|textbox|option)\b/.test(l));
    const unnamed = interactive.filter((l) => !/"/.test(l));
    const dom = await page.locator(sel).evaluate((root) => {
      const els = [...root.querySelectorAll('button,a[href],input,select,[tabindex]')];
      return {
        total: els.length,
        unreachable: els.filter((e) => e.tabIndex < 0).length,
      };
    });
    return {
      ok: interactive.length > 0 && unnamed.length === 0 && dom.unreachable === 0,
      detail: `${interactive.length} interactive nodes in the aria tree, ` +
              `${unnamed.length} with no accessible name, ${dom.unreachable} keyboard-unreachable`,
      bad: unnamed.slice(0, 3).map((l) => l.trim().slice(0, 60)),
    };
  },
};

/* ---------------------------------------------------------- static server --
 * A module <script> is blocked over file:// by CORS, so the fixture page's own
 * script silently does not run and every mark-counting checker sees an empty
 * page — which is exactly the "instrument narrowed its own population" failure
 * this file exists to prevent, arriving through the transport layer. Serve. */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json' };
const ROOT = resolve(HERE, '..');
const server = createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = join(ROOT, rel);
  if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404); return res.end('no'); }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

/* ------------------------------------------------------------------- runner */
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });

await page.goto(`${ORIGIN}/kit/fixtures.html`, { waitUntil: 'load' });
await page.waitForTimeout(500);

const floor = TOKENS.enforced.type_floor_px;
const cfgRadii = TOKENS.enforced.product_radii_px;
const results = await page.evaluate(
  ({ src, cfg }) => {
    const CHECKS = eval(`(${src})`);
    const out = [];
    for (const spec of document.querySelectorAll('.spec')) {
      const name = spec.dataset.check;
      const expect = spec.dataset.expect;
      const fn = CHECKS[name];
      // driver-side checks (the aria tree) are run by the runner, not in the
      // page — skip them here rather than reporting them as missing
      if (!fn) { if (!cfg.driverChecks.includes(name)) {
        out.push({ name, expect, got: 'MISSING', agrees: false, detail: 'no such checker',
                   title: spec.querySelector('h4').textContent.trim() }); } continue; }
      const r = fn(spec, cfg);
      out.push({
        name, expect, got: r.ok ? 'pass' : 'fail',
        agrees: (r.ok ? 'pass' : 'fail') === expect,
        detail: r.detail, bad: r.bad,
        title: spec.querySelector('h4').textContent.trim(),
      });
    }
    return out;
  },
  { src: serialise(CHECKS), cfg: { floor, radii: TOKENS.enforced.product_radii_px,
      driverChecks: Object.keys(DRIVER_CHECKS) } }
);

function serialise(obj) {
  return '{' + Object.entries(obj).map(([k, f]) => `${k}:${f.toString()}`).join(',') + '}';
}

// driver-side checks, one specimen at a time
for (const [name, fn] of Object.entries(DRIVER_CHECKS)) {
  const specs = await page.$$eval('.spec', (els, n) =>
    els.map((e, i) => ({ i, check: e.dataset.check, expect: e.dataset.expect,
                         title: e.querySelector('h4').textContent.trim() }))
       .filter((s) => s.check === n), name);
  for (const spec of specs) {
    const r = await fn(page, `.spec:nth-of-type(${spec.i + 1})`);
    results.push({
      name, expect: spec.expect, got: r.ok ? 'pass' : 'fail',
      agrees: (r.ok ? 'pass' : 'fail') === spec.expect,
      detail: r.detail, bad: r.bad, title: spec.title,
    });
  }
}

let broken = 0, agreed = 0;
console.log('\nstudio-kit verify — checkers against labelled specimens\n' + '─'.repeat(78));
for (const r of results) {
  const mark = r.agrees ? ' ok ' : 'MISS';
  if (r.agrees) agreed++; else broken++;
  console.log(`[${mark}] ${r.name.padEnd(7)} expected ${r.expect.padEnd(4)} got ${String(r.got).padEnd(4)}  ${r.title}`);
  console.log(`         ${r.detail}`);
  if (!r.agrees && r.bad) console.log(`         e.g. ${JSON.stringify(r.bad)}`);
}

// which checkers proved themselves in BOTH directions?
const byName = {};
for (const r of results) (byName[r.name] ||= []).push(r);
const trusted = Object.entries(byName)
  .filter(([, rs]) => rs.every((r) => r.agrees) && new Set(rs.map((r) => r.expect)).size === 2)
  .map(([n]) => n);
const oneSided = Object.entries(byName)
  .filter(([, rs]) => rs.every((r) => r.agrees) && new Set(rs.map((r) => r.expect)).size === 1)
  .map(([n]) => n);

console.log('─'.repeat(78));
console.log(`${agreed} agreed, ${broken} disagreed, ${errs.length} page errors`);
console.log(`TRUSTED (convicted a known-bad AND cleared a known-good): ${trusted.join(', ') || 'none'}`);
console.log(`ONE-SIDED (no bad specimen yet — verdicts are provisional): ${oneSided.join(', ') || 'none'}`);
if (errs.length) console.log('page errors:\n  ' + errs.join('\n  '));

/* --------------------------------------------------- run over a real surface */
if (TARGET) {
  const p2 = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  await p2.goto(/^https?:/.test(TARGET) ? TARGET : `${ORIGIN}/${TARGET.replace(ROOT + '/', '')}`, { waitUntil: 'load' });
  await p2.waitForTimeout(1000);
  const real = await p2.evaluate(
    ({ src, cfg, only }) => {
      const CHECKS = eval(`(${src})`);
      const out = {};
      for (const name of only) { if (CHECKS[name]) out[name] = CHECKS[name](document.body, cfg); }
      return out;
    },
    { src: serialise(CHECKS), cfg: { floor, radii: cfgRadii }, only: [...trusted, ...oneSided] }
  );
  console.log(`\nover ${TARGET}\n` + '─'.repeat(78));
  for (const [name, r] of Object.entries(real)) {
    const tag = trusted.includes(name) ? '' : '  (provisional — one-sided checker)';
    console.log(`[${r.ok ? ' ok ' : 'FAIL'}] ${name.padEnd(9)} ${r.detail}${tag}`);
    if (!r.ok && r.bad) console.log(`         e.g. ${JSON.stringify(r.bad)}`);
  }
  for (const [name, fn] of Object.entries(DRIVER_CHECKS)) {
    if (!trusted.includes(name) && !oneSided.includes(name)) continue;
    const r = await fn(p2, 'body');
    const tag = trusted.includes(name) ? '' : '  (provisional — one-sided checker)';
    console.log(`[${r.ok ? ' ok ' : 'FAIL'}] ${name.padEnd(9)} ${r.detail}${tag}`);
    if (!r.ok && r.bad?.length) console.log(`         e.g. ${JSON.stringify(r.bad)}`);
  }
  const suppressed = [...Object.keys(CHECKS), ...Object.keys(DRIVER_CHECKS)]
    .filter((n) => !trusted.includes(n) && !oneSided.includes(n));
  if (suppressed.length) console.log(`\nSUPPRESSED (checker failed its own specimen): ${suppressed.join(', ')}`);
  await p2.close();
}

await browser.close();
server.close();
process.exit(broken ? 1 : 0);
