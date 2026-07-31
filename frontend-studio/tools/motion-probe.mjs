#!/usr/bin/env node
/**
 * motion-probe — the both-directions check for motion-census.mjs.
 *
 *   node tools/motion-probe.mjs
 *
 * motion-census reported ZERO live transitions across ten surfaces. A zero from a
 * probe is indistinguishable from a broken probe (CLAUDE.md #11), so this does three
 * things the census cannot do for itself:
 *
 *   1. POSITIVE CONTROL. Runs the same census function over a page Studio built and
 *      knows animates (014's prototype). If that also reads zero, the instrument is
 *      broken and the app finding is void.
 *   2. NAMES THE CLASSES DIRECTLY. Counts elements carrying each `dg-motion-*` class
 *      the app's own motion.css defines. This is independent of computed style, so a
 *      bug in the census cannot produce the same answer twice.
 *   3. CHECKS THE CENSUS'S SHELL CLASSIFIER. The census reported 4 "shell" animations
 *      on the front door. An over-broad shell selector would hide real content, which
 *      is the same class of error as counting the nav rail as per-surface content.
 */

import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, extname, dirname, resolve } from 'node:path';

const BASE = 'http://127.0.0.1:8000';
const PROTO = resolve('proposals/014-what-you-hold/prototype.html');

/* Serve the prototype — never file://, which CORS-blocks module scripts and renders
   a blank page that every check then reports as clean (kit/verify.mjs, 2026-07-28). */
const root = dirname(PROTO);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = createServer((req, res) => {
  const p = join(root, decodeURIComponent(req.url.split('?')[0]));
  try {
    const body = readFileSync(p);
    res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('nf'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const protoUrl = `http://127.0.0.1:${server.address().port}/prototype.html`;

const countMotion = () => {
  let n = 0;
  const detail = [];
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const live = cs.transitionProperty !== 'none'
      && cs.transitionDuration.split(',').some((d) => d.trim() !== '0s');
    if (live) { n++; if (detail.length < 5) detail.push(`${el.tagName.toLowerCase()}.${(el.getAttribute('class') || '').slice(0, 40)} :: ${cs.transitionProperty} ${cs.transitionDuration}`); }
  }
  return { n, detail };
};

const MOTION_CLASSES = [
  'dg-motion-feedback', 'dg-motion-receipt', 'dg-motion-drawer',
  'dg-motion-row-settle', 'dg-motion-daily-open', 'dg-motion-chart-stage',
];

const classAudit = (classes) => {
  const out = {};
  for (const c of classes) out[c] = document.getElementsByClassName(c).length;
  // Anything at all with a dg-motion prefix, in case the list is stale
  out['* any dg-motion-*'] = Array.from(document.querySelectorAll('[class*="dg-motion-"]')).length;
  // Every element actually running a keyframe animation, with who its ancestors are
  out['__running'] = Array.from(document.querySelectorAll('*'))
    .filter((el) => getComputedStyle(el).animationName !== 'none')
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute('class') || '').slice(0, 50),
      name: getComputedStyle(el).animationName,
      // the census's shell test, reproduced verbatim so its verdict can be judged
      matchedShell: !!el.closest('nav, header, [class*="nav"], [class*="Nav"], [class*="shell"], [class*="Shell"]'),
      shellAncestor: (() => {
        const a = el.closest('nav, header, [class*="nav"], [class*="Nav"], [class*="shell"], [class*="Shell"]');
        return a ? `${a.tagName.toLowerCase()}.${(a.getAttribute('class') || '').slice(0, 40)}` : null;
      })(),
    }));
  return out;
};

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

console.log('\n=== 1. POSITIVE CONTROL — 014 prototype (known to animate) ===');
await page.goto(protoUrl, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const pc = await page.evaluate(countMotion);
console.log(`elements with a live transition: ${pc.n}`);
pc.detail.forEach((d) => console.log(`  ${d}`));
console.log(pc.n > 0
  ? '  → INSTRUMENT CAN SEE. A zero elsewhere is a finding, not a bug.'
  : '  → INSTRUMENT IS BLIND. Every zero it reported is void.');

console.log('\n=== 2. THE APP — does anything carry a dg-motion-* class? ===');
for (const s of ['', 'roster-audit', 'league-pulse', 'model-trust', 'trade-lab']) {
  await page.goto(s ? `${BASE}/?surface=${s}` : `${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const a = await page.evaluate(classAudit, MOTION_CLASSES);
  const running = a.__running; delete a.__running;
  const named = Object.entries(a).filter(([, v]) => v > 0);
  console.log(`\n  ${s || '(front door)'}`);
  console.log(`    dg-motion-* classes present: ${named.length ? named.map(([k, v]) => `${k}=${v}`).join(', ') : 'NONE'}`);
  console.log(`    elements running a keyframe animation: ${running.length}`);
  for (const r of running) {
    console.log(`      <${r.tag} class="${r.cls}"> anim=${r.name}`);
    console.log(`        census would call this ${r.matchedShell ? 'SHELL' : 'CONTENT'}${r.shellAncestor ? ` (matched: ${r.shellAncestor})` : ''}`);
  }
}

await browser.close();
server.close();
