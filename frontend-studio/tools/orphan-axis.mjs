/**
 * orphan-axis — does every set of numbers on a figure have a WORD attached to it?
 *
 *   node tools/orphan-axis.mjs <path-or-url> [--width 1440] [--json]
 *
 * WHY THIS EXISTS. On 2026-08-07 David looked at proposal 017 and said:
 *   "it says 'week' on the bottom axis and nothing on the left axis"
 * The y-axis tick numbers were rendering perfectly. What was missing was a LABEL
 * ATTACHED TO THEM. Studio had written one — but placed it as a horizontal line of
 * prose above the plot, where it read as another sentence in the paragraph. The craft
 * gate, the palette validator, the squint test, the keyboard pass, the collision census
 * and the geometry audit all passed that page. Every one of them measures marks,
 * contrast, targets or overlap. NONE of them can see an unlabelled axis.
 *
 * The rule this encodes: a group of numbers is a claim about a quantity, and the
 * reader must be able to name that quantity WITHOUT leaving the figure. Presence of
 * an explanation somewhere on the page is not attachment. Distance is the test.
 *
 * It is the same family as CLAUDE.md principle 4 — "a mark standing for one real entity
 * must be able to name that entity" — applied one level up, to the axis rather than the mark.
 *
 * WHAT IT CANNOT DO. It tests attachment, not comprehension. A label reading
 * "xVAR_pct_norm" attached to its ticks passes here and is still unreadable. Naming the
 * quantity well is a judgement; having a name at all is mechanical, and this does the
 * mechanical half.
 */
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ATTACH_PX = 46;   // calibrated below — see tools/orphan-axis-calibration.md
const MIN_TICKS = 3;    // fewer than 3 aligned numbers is not an axis
const ALIGN_TOL = 6;    // px tolerance for "sharing an axis"

const target = process.argv[2];
const width = Number((process.argv.find(a => a.startsWith('--width=')) || '').split('=')[1] || 1440);
const asJson = process.argv.includes('--json');
if (!target) { console.error('usage: node tools/orphan-axis.mjs <path-or-url> [--width=1440] [--json]'); process.exit(2); }

let url = target, server = null;
if (!/^https?:/.test(target)) {
  const abs = path.resolve(target);
  const root = path.dirname(abs);
  const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
  server = http.createServer((req, res) => {
    const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    fs.readFile(f, (e, b) => {
      if (e) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(b);
    });
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${server.address().port}/${path.basename(abs)}`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);

const report = await page.evaluate(({ ATTACH_PX, MIN_TICKS, ALIGN_TOL }) => {
  const NUMERIC = /^[+\-−]?[\d][\d.,]*\s*[%$kKmM]?$/;
  const nodes = [];
  document.querySelectorAll('svg').forEach((svg, si) => {
    svg.querySelectorAll('text, tspan').forEach(t => {
      if (t.children.length) return;                       // take leaves only
      const s = (t.textContent || '').trim();
      if (!s) return;
      const r = t.getBoundingClientRect();
      if (!r.width || !r.height) return;
      nodes.push({ svg: si, s, numeric: NUMERIC.test(s), wordy: /[a-zA-Z]{3,}/.test(s),
                   cx: r.left + r.width / 2, cy: r.top + r.height / 2,
                   l: r.left, r: r.right, t: r.top, b: r.bottom });
    });
  });

  // group aligned numeric labels into candidate axes
  const groups = [];
  const claim = new Set();
  const nums = nodes.filter(n => n.numeric);
  for (const seed of nums) {
    if (claim.has(seed)) continue;
    for (const [axis, key] of [['y', 'r'], ['x', 'cy']]) {
      // y-axis ticks share a right edge; x-axis ticks share a vertical centre
      const members = nums.filter(n => !claim.has(n) && n.svg === seed.svg &&
                                       Math.abs(n[key] - seed[key]) <= ALIGN_TOL);
      if (members.length >= MIN_TICKS) {
        members.forEach(m => claim.add(m));
        groups.push({ axis, members });
        break;
      }
    }
  }

  const words = nodes.filter(n => n.wordy);
  const out = groups.map(g => {
    const box = {
      l: Math.min(...g.members.map(m => m.l)), r: Math.max(...g.members.map(m => m.r)),
      t: Math.min(...g.members.map(m => m.t)), b: Math.max(...g.members.map(m => m.b)),
    };
    let best = null;
    for (const w of words) {
      const dx = Math.max(box.l - w.r, w.l - box.r, 0);
      const dy = Math.max(box.t - w.b, w.t - box.b, 0);
      const d = Math.hypot(dx, dy);
      if (!best || d < best.d) best = { d, s: w.s };
    }
    return {
      axis: g.axis, ticks: g.members.length,
      sample: g.members.map(m => m.s).slice(0, 6).join(' '),
      nearestLabel: best ? best.s.slice(0, 60) : null,
      distancePx: best ? Math.round(best.d) : null,
      attached: !!best && best.d <= ATTACH_PX,
    };
  });
  return { groups: out, svgCount: document.querySelectorAll('svg').length, textCount: nodes.length };
}, { ATTACH_PX, MIN_TICKS, ALIGN_TOL });

await browser.close();
if (server) server.close();

const orphans = report.groups.filter(g => !g.attached);
if (asJson) {
  console.log(JSON.stringify({ ...report, orphans: orphans.length }, null, 1));
} else {
  console.log(`\norphan-axis — ${target} @${width}px`);
  console.log(`${report.svgCount} svg, ${report.textCount} text nodes, ${report.groups.length} axis-like number groups\n`);
  if (!report.groups.length) {
    console.log('[ skip ] No group of >=3 aligned numbers found. Nothing for this check to measure —');
    console.log('         which is NOT a pass. A figure with no axis cannot clear an axis check.');
  }
  for (const g of report.groups) {
    const tag = g.attached ? '[  ok  ]' : '[ FAIL ]';
    console.log(`${tag} ${g.axis}-axis · ${g.ticks} ticks · ${g.sample}`);
    console.log(`         nearest word "${g.nearestLabel}" at ${g.distancePx}px ` +
                `(attached if <= ${ATTACH_PX}px)`);
  }
  console.log(`\n${orphans.length} orphaned, ${report.groups.length - orphans.length} labelled.`);
  console.log('\nThis tests ATTACHMENT, not comprehension. A well-placed label that names the');
  console.log('quantity badly passes here. Having a name at all is mechanical; naming it well is not.');
}
process.exit(orphans.length ? 1 : 0);
