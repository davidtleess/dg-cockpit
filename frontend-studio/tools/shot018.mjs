// Render proposal 018 and capture it, with the geometry census that has actually caught
// things: BOTH edges for overflow (the right-edge-only version missed a label running
// 600px off the left), the 13px content floor, and a count of every region so a silently
// empty one cannot pass as a clean run.
//
//   node /Users/davidleess/frontend-studio/tools/shot018.mjs [width] [--reduced] [--break]
//
// --break deletes a field from data.js in memory and asserts the FAILURE STATE fires.
// An error boundary that has never been made to fire is not an error boundary.
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/Users/davidleess/frontend-studio/proposals/018-what-repeats';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
const broken = process.argv.includes('--break');

const server = http.createServer((req, res) => {
  const rel = (req.url === '/' ? '/index.html' : req.url).split('?')[0];
  const f = path.join(ROOT, rel);
  fs.readFile(f, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('nope'); }
    let body = buf;
    if (broken && rel === '/data.js') {
      // remove the repeatability block the render depends on
      body = Buffer.from(String(buf).replace(/"repeatability": \{[\s\S]*?\n \},\n/, ''));
    }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(f)] || 'application/octet-stream',
      'cache-control': 'no-store, no-cache, must-revalidate',
    });
    res.end(body);
  });
});

await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const width = Number(process.argv.find(a => /^\d+$/.test(a)) || 1440);
const reduced = process.argv.includes('--reduced');

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width, height: 900 },
  deviceScaleFactor: 2,
  reducedMotion: reduced ? 'reduce' : 'no-preference',
});
const errors = [];
page.on('console', m => m.type() === 'error' && errors.push(m.text().slice(0, 160)));
page.on('pageerror', e => errors.push(String(e).slice(0, 160)));

await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);

if (!broken) {
  const suffix = reduced ? `-${width}-reduced` : `-${width}`;
  await page.screenshot({ path: `${ROOT}/capture${suffix}.png`, fullPage: true });
}

const audit = await page.evaluate(() => {
  const docW = document.documentElement.scrollWidth;
  // The page itself overflowing the VIEWPORT is the defect this audit exists to catch, and
  // the earlier version could not: it measured every element against scrollWidth, which
  // already grows to contain the overflow. Same family as the right-edge-only bug.
  const viewW = window.innerWidth;
  const pageOverflows = docW > viewW + 1 ? { docW, viewW } : null;
  const inScroller = e => !!e.closest('[style*="overflow-x"], .tscroll');
  const over = [...document.querySelectorAll('*')]
    .filter(e => { if (inScroller(e)) return false;
                   const r = e.getBoundingClientRect();
                   return r.right > docW + 1 || r.left < -1; })
    .map(e => e.tagName + '.' + (typeof e.className === 'string' ? e.className : e.className.baseVal))
    .slice(0, 12);
  // RENDERED type size inside SVG. getComputedStyle reports the AUTHORED font-size and is
  // blind to the viewBox transform, so a 13px label inside a 560-wide viewBox squeezed into
  // a 518px column reports 13 and draws 12. Measure the actual CTM scale instead.
  const svgSmall = [...document.querySelectorAll('svg')].flatMap(svg => {
    const vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect();
    const k = (vb && vb.width) ? r.width / vb.width : 1;
    return [...svg.querySelectorAll('text')].map(t => ({
      t: t.textContent.trim().slice(0, 22),
      authored: parseFloat(getComputedStyle(t).fontSize),
      rendered: +(parseFloat(getComputedStyle(t).fontSize) * k).toFixed(2),
    })).filter(x => x.rendered < 13);
  });
  const small = [...document.querySelectorAll('body *')]
    .filter(e => e.children.length === 0 && e.textContent.trim())
    .map(e => ({ t: e.textContent.trim().slice(0, 26), px: parseFloat(getComputedStyle(e).fontSize), tag: e.tagName }))
    .filter(x => x.px < 13);
  return {
    docW, viewW, pageOverflows, scrollH: document.documentElement.scrollHeight, over, small, svgSmall,
    visibleChars: document.body.innerText.replace(/\s+/g, ' ').trim().length,
    faultShown: getComputedStyle(document.getElementById('fault')).display !== 'none',
    panels: document.querySelectorAll('.panel svg').length,
    rows: document.querySelectorAll('tbody tr').length,
    groupHeads: document.querySelectorAll('tr.grouphead').length,
    tracks: document.querySelectorAll('td.track svg').length,
    partials: document.querySelectorAll('tr.partial').length,
    noTapeChips: document.querySelectorAll('.chip').length,
    h1: (document.querySelector('h1') || {}).textContent,
  };
});

console.log(JSON.stringify({ mode: broken ? 'BROKEN-DATA' : 'healthy', width, reduced, errors, ...audit }, null, 1));
await browser.close();
server.close();
