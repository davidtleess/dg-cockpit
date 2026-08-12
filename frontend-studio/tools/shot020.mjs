// Render proposal 020 and capture it, with the census that has actually caught things in
// this lane: BOTH edges for overflow (the right-edge-only version missed a label running
// 600px off the left), the 13px content floor, a label-to-mark attachment check (a name
// beside the wrong dot reads as a missing dot, twice now), and a region count so a
// silently empty section cannot pass as a clean run.
//
//   node /Users/davidleess/frontend-studio/tools/shot020.mjs [width] [--week N]
//        [--reduced] [--break]
//
// --break serves a data.js with a required field removed and asserts the FAILURE STATE
// fires. An error boundary that has never been made to fire is not an error boundary.
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/Users/davidleess/frontend-studio/proposals/020-when-can-i-believe-it';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
                '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg' };
const argv = process.argv.slice(2);
const width = Number(argv.find(a => /^\d+$/.test(a)) || 1440);
const weekArg = argv.includes('--week') ? Number(argv[argv.indexOf('--week') + 1]) : null;
const broken = argv.includes('--break');
const reduced = argv.includes('--reduced');

const server = http.createServer((req, res) => {
  const rel = (req.url === '/' ? '/index.html' : req.url).split('?')[0];
  const f = path.join(ROOT, decodeURIComponent(rel));
  fs.readFile(f, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('nope'); }
    let out = buf;
    if (broken && rel === '/data.js') out = Buffer.from(String(buf).replace(/"cuts":/g, '"XX":'));
    res.writeHead(200, {
      'content-type': TYPES[path.extname(f)] || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    res.end(out);
  });
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width, height: 1000 }, deviceScaleFactor: 2,
  reducedMotion: reduced ? 'reduce' : 'no-preference',
});
const page = await ctx.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
if (weekArg) {
  await page.fill('input[type=range]', String(weekArg));
  await page.dispatchEvent('input[type=range]', 'input');
  await page.waitForTimeout(120);
}

const report = await page.evaluate(() => {
  const vis = el => {
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
  };
  // 1. failure state
  const fault = document.getElementById('fault');
  const faulted = fault && getComputedStyle(fault).display !== 'none';
  // 2. regions — a silently empty section must not read as clean
  const regions = [...document.querySelectorAll('section.grp')].map(s => ({
    title: s.querySelector('h2')?.textContent,
    cards: s.querySelectorAll('.p').length,
    svgs: s.querySelectorAll('svg').length,
    lines: s.querySelectorAll('polyline').length,
  }));
  // 3. type floor — 13px, as rendered, on visible text
  const small = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!vis(el)) continue;
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < 13) small.push({ px: fs, t: el.textContent.trim().slice(0, 44) });
  }
  for (const t of document.querySelectorAll('svg text')) {
    const fs = parseFloat(getComputedStyle(t).fontSize);
    if (fs < 13) small.push({ px: fs, t: t.textContent.slice(0, 44) });
  }
  // 4. overflow, BOTH edges — the right-edge-only version missed a 600px left clip
  const de = document.documentElement;
  const pageOver = { right: de.scrollWidth - de.clientWidth, left: 0 };
  const clipped = [];
  for (const svg of document.querySelectorAll('svg')) {
    const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
    if (vb.length !== 4) continue;
    for (const t of svg.querySelectorAll('text')) {
      const b = t.getBBox();
      if (b.x < vb[0] - 1 || b.x + b.width > vb[0] + vb[2] + 1 ||
          b.y < vb[1] - 1 || b.y + b.height > vb[1] + vb[3] + 1) {
        clipped.push({ t: t.textContent.slice(0, 34), x: Math.round(b.x),
                       right: Math.round(b.x + b.width), vbw: vb[2] });
      }
    }
  }
  // 5. label attachment — every trajectory end label must have a leader reaching it
  const attach = [];
  for (const svg of document.querySelectorAll('.fig svg')) {
    const labels = [...svg.querySelectorAll('text')].filter(t => {
      const x = t.getBBox().x; return x > svg.viewBox.baseVal.width - 140;
    });
    const leaders = [...svg.querySelectorAll('line')];
    for (const l of labels) {
      const b = l.getBBox();
      const hit = leaders.some(ln =>
        Math.abs(Number(ln.getAttribute('x2')) - b.x) < 8 &&
        Math.abs(Number(ln.getAttribute('y2')) - (b.y + b.height / 2)) < 8);
      if (!hit) attach.push(l.textContent.slice(0, 28));
    }
  }
  // 6. text-on-text census inside figures
  const boxes = [];
  for (const svg of document.querySelectorAll('svg')) {
    for (const t of svg.querySelectorAll('text')) {
      const r = t.getBoundingClientRect();
      if (r.width && r.height) boxes.push({ r, t: t.textContent.slice(0, 22) });
    }
  }
  // A count alone makes the next step a guess. Naming the pair is what turns this from a
  // number into a diagnosis.
  let collisions = 0; const collidingPairs = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i].r, b = boxes[j].r;
    if (a.left < b.right - 1 && b.left < a.right - 1 &&
        a.top < b.bottom - 1 && b.top < a.bottom - 1) {
      collisions++;
      if (collidingPairs.length < 6) collidingPairs.push(`${boxes[i].t} ⟂ ${boxes[j].t}`);
    }
  }
  // 7. keyboard reachability of the clock
  const focusables = document.querySelectorAll(
    'a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])').length;
  return {
    faulted, regions, small, pageOver, clipped, attach, collisions, collidingPairs, focusables,
    visibleChars: document.body.innerText.replace(/\s+/g, ' ').trim().length,
    thesis: document.querySelector('.thesis')?.textContent.trim().slice(0, 190),
    week: document.querySelector('.clock label')?.textContent,
  };
});

const tag = `${width}${weekArg ? '-wk' + weekArg : ''}${reduced ? '-reduced' : ''}` +
            `${broken ? '-BROKEN' : ''}`;
await page.screenshot({ path: `${ROOT}/capture-${tag}.png`, fullPage: true });

console.log('─'.repeat(80));
console.log(`020 @ ${width}px  ${report.week || ''}${broken ? '   [--break]' : ''}`);
console.log('─'.repeat(80));
console.log(`failure state showing : ${report.faulted}`);
console.log(`visible characters    : ${report.visibleChars}`);
console.log(`focusable controls    : ${report.focusables}`);
console.log(`console errors        : ${errors.length}` +
            (errors.length ? '\n  ' + errors.slice(0, 4).join('\n  ') : ''));
if (!broken) {
  console.log(`regions               :`);
  for (const r of report.regions) {
    console.log(`   ${String(r.title).padEnd(28)} cards ${String(r.cards).padStart(2)}` +
                `  svgs ${String(r.svgs).padStart(2)}  lines ${String(r.lines).padStart(2)}`);
  }
  console.log(`text under 13px       : ${report.small.length}` +
              (report.small.length ? '  ' + JSON.stringify(report.small.slice(0, 4)) : ''));
  console.log(`page overflow right   : ${report.pageOver.right}px`);
  console.log(`clipped svg text      : ${report.clipped.length}` +
              (report.clipped.length ? '  ' + JSON.stringify(report.clipped.slice(0, 4)) : ''));
  console.log(`labels with no leader : ${report.attach.length}` +
              (report.attach.length ? '  ' + JSON.stringify(report.attach) : ''));
  console.log(`text-on-text overlaps : ${report.collisions}` + (report.collisions ? '\n  ' + report.collidingPairs.join('\n  ') : ''));
  console.log(`thesis                : ${report.thesis}`);
}
console.log(`screenshot            : capture-${tag}.png`);

await browser.close();
server.close();
