#!/usr/bin/env node
/**
 * motion-census — what does this product actually animate?
 *
 *   node tools/motion-census.mjs [--base http://127.0.0.1:8000] [--json]
 *
 * WHY. CLAUDE.md #18: measure what already exists before proposing a replacement.
 * craft/motion-easing.md is curated research that has never been checked against the
 * running app. Before arguing for a motion contract, establish the baseline: how many
 * elements transition, how many DISTINCT durations and curves are in play, and whether
 * one curve is doing three jobs (the file's own load-bearing claim about why a UI reads
 * as slow).
 *
 * POPULATION DISCIPLINE (CLAUDE.md #11). Three traps this tool is built against, all of
 * them recorded as having bitten Studio before:
 *   1. Measuring the loading screen. A fixed wait measured Roster Audit's spinner on
 *      2026-07-30 and reported lane counts for 23 elements that were not the surface.
 *      Fixed: poll the element count until it repeats N times, then census.
 *   2. Counting shell chrome as surface content. The nav rail and status pill are on
 *      every screen. Fixed: the census records whether a node is inside the app shell
 *      and reports both totals.
 *   3. Reporting a clean run when nothing was measured. Fixed: a surface whose settled
 *      element count is below MIN_NODES is reported REFUSED, never 0.
 *
 * DETERMINISM (CLAUDE.md #11). Run it twice with --json and diff. The census is of the
 * settled end state, so two runs must agree.
 */

import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const BASE = flag('--base', 'http://127.0.0.1:8000');
const AS_JSON = args.includes('--json');
const REDUCED = args.includes('--reduced');

const SURFACES = [
  '', 'roster-audit', 'roster-capacity', 'model-trust', 'trade-lab',
  'waiver-radar', 'rookie-board', 'league-pulse', 'accuracy-tracker',
  'research-assistant',
];

const MIN_NODES = 60;      // below this the surface did not render
const SETTLE_REPEATS = 3;  // identical counts required in a row
const SETTLE_STEP = 400;
const SETTLE_MAX = 24;

/** Poll until the element census stops moving, or refuse. */
async function settle(page) {
  let last = -1, same = 0;
  for (let i = 0; i < SETTLE_MAX; i++) {
    const n = await page.evaluate(() => document.querySelectorAll('*').length);
    if (n === last) { same++; if (same >= SETTLE_REPEATS) return { ok: true, nodes: n }; }
    else { same = 0; last = n; }
    await page.waitForTimeout(SETTLE_STEP);
  }
  return { ok: false, nodes: last };
}

const censusFn = () => {
  /* The app shell: chrome that repeats on every surface, recorded separately so a
     constant is never tabulated as per-surface content.
     CORRECTED 2026-07-30 after tools/motion-probe.mjs convicted the first version.
     The original matched on class SUBSTRINGS — `[class*="shell"]` matched the app's
     `main.dg-shell__main`, i.e. the ENTIRE content area, so all four of the front
     door's real content animations were filed as chrome and the surface reported
     zero. Same failure family as the nav-rail and loading-screen errors: the
     instrument choosing its own population. Now structural, and `main` always wins
     over an ancestor banner. */
  const inShell = (el) => {
    if (el.closest('main, [role="main"]')) return false;
    return !!el.closest('nav, header, aside, [role="navigation"], [role="banner"], [role="complementary"]');
  };

  const out = { transitions: [], animations: [], total: 0, shellTotal: 0 };
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    out.total++;
    const shell = inShell(el);
    if (shell) out.shellTotal++;

    const tp = cs.transitionProperty;
    const tdur = cs.transitionDuration;
    if (tp && tp !== 'none' && tp !== 'all 0s ease 0s') {
      const durs = tdur.split(',').map((s) => s.trim());
      // a declared transition with 0s duration animates nothing
      if (durs.some((d) => d !== '0s')) {
        out.transitions.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.getAttribute('class') || '').slice(0, 60),
          prop: tp,
          dur: tdur,
          ease: cs.transitionTimingFunction,
          delay: cs.transitionDelay,
          shell,
        });
      }
    }
    const an = cs.animationName;
    if (an && an !== 'none') {
      out.animations.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute('class') || '').slice(0, 60),
        name: an,
        dur: cs.animationDuration,
        ease: cs.animationTimingFunction,
        iter: cs.animationIterationCount,
        shell,
      });
    }
  }
  return out;
};

const tally = (arr, key) => {
  const m = new Map();
  for (const x of arr) for (const v of String(x[key]).split(',').map((s) => s.trim())) {
    m.set(v, (m.get(v) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

const results = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: REDUCED ? 'reduce' : 'no-preference',
});
const page = await ctx.newPage();

for (const s of SURFACES) {
  const url = s ? `${BASE}/?surface=${s}` : `${BASE}/`;
  const name = s || '(front door)';
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch {
    results.push({ name, status: 'REFUSED', reason: 'navigation timeout' });
    continue;
  }
  const st = await settle(page);
  if (!st.ok) { results.push({ name, status: 'REFUSED', reason: `never settled (${st.nodes} nodes)` }); continue; }
  if (st.nodes < MIN_NODES) { results.push({ name, status: 'REFUSED', reason: `only ${st.nodes} nodes — did not render` }); continue; }

  const c = await page.evaluate(censusFn);
  results.push({ name, status: 'ok', nodes: st.nodes, ...c });
}

await browser.close();

if (AS_JSON) { console.log(JSON.stringify(results, null, 2)); process.exit(0); }

const W = (s, n) => String(s).padEnd(n);
console.log(`\nMOTION CENSUS — ${BASE}${REDUCED ? '  [prefers-reduced-motion: reduce]' : ''}`);
console.log('='.repeat(78));
console.log(W('surface', 20), W('visible', 8), W('transitions', 12), W('animations', 12), 'shell');
console.log('-'.repeat(78));

const allT = [], allA = [];
for (const r of results) {
  if (r.status !== 'ok') { console.log(W(r.name, 20), `REFUSED — ${r.reason}`); continue; }
  const t = r.transitions.filter((x) => !x.shell), a = r.animations.filter((x) => !x.shell);
  const ts = r.transitions.filter((x) => x.shell), as = r.animations.filter((x) => x.shell);
  allT.push(...t); allA.push(...a);
  console.log(W(r.name, 20), W(r.nodes, 8), W(t.length, 12), W(a.length, 12), `${ts.length}t/${as.length}a`);
}

console.log('\n--- CONTENT transitions (shell excluded), pooled across surfaces ---');
console.log(`total elements carrying a live transition: ${allT.length}`);
console.log('\ndistinct DURATIONS:');
for (const [v, n] of tally(allT, 'dur')) console.log(`  ${W(v, 12)} ${n}`);
console.log('\ndistinct TIMING FUNCTIONS:');
for (const [v, n] of tally(allT, 'ease')) console.log(`  ${W(v, 42)} ${n}`);
console.log('\ndistinct PROPERTIES:');
for (const [v, n] of tally(allT, 'prop').slice(0, 16)) console.log(`  ${W(v, 28)} ${n}`);

console.log(`\n--- CONTENT keyframe animations: ${allA.length} ---`);
for (const [v, n] of tally(allA, 'name')) console.log(`  ${W(v, 28)} ${n}`);
