// Render proposal 017 and capture it. Serves the directory on an ephemeral port so
// the ES-module import of data.js works, then closes both browser and server.
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/Users/davidleess/frontend-studio/proposals/017-the-job';
const OUT = '/Users/davidleess/frontend-studio/proposals/017-the-job';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

const server = http.createServer((req, res) => {
  const f = path.join(ROOT, (req.url === '/' ? '/index.html' : req.url).split('?')[0]);
  fs.readFile(f, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('nope'); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
    res.end(buf);
  });
});

await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const width = Number(process.argv[2] || 1440);
const reduced = process.argv.includes('--reduced');

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width, height: 900 },
  deviceScaleFactor: 2,
  reducedMotion: reduced ? 'reduce' : 'no-preference',
});
const errors = [];
page.on('console', m => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', e => errors.push(String(e)));

await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

const suffix = reduced ? `-${width}-reduced` : `-${width}`;
await page.screenshot({ path: `${OUT}/capture${suffix}.png`, fullPage: true });

// geometry census: horizontal overflow, text below the 13px content floor, empty regions
const audit = await page.evaluate(() => {
  const docW = document.documentElement.scrollWidth;
  // Content inside a deliberate overflow-x container is not a page overflow — it is the
  // point of the container. Excluding those descendants, or every wide table reads as a bug.
  const inScroller = e => !!e.closest('[style*="overflow-x"], .tscroll');
  // BOTH edges. Checking only the right edge missed an SVG label anchored 'end' that ran
  // 600px off the LEFT of its viewBox and was clipped by the card — invisible to this audit
  // until the render was looked at. David, 2026-08-07.
  const over = [...document.querySelectorAll('*')]
    .filter(e => { if (inScroller(e)) return false;
                   const r = e.getBoundingClientRect();
                   return r.right > docW + 1 || r.left < -1; })
    .map(e => e.tagName + '.' + (typeof e.className === 'string' ? e.className : e.className.baseVal));
  const small = [...document.querySelectorAll('body *')]
    .filter(e => e.children.length === 0 && e.textContent.trim())
    .map(e => ({ t: e.textContent.trim().slice(0, 30), px: parseFloat(getComputedStyle(e).fontSize), tag: e.tagName }))
    .filter(x => x.px < 13 && x.tag !== 'text');
  return {
    docW, scrollH: document.documentElement.scrollHeight, over, small,
    rows: document.querySelectorAll('#tbl tbody tr').length,
    sparks: document.querySelectorAll('td.spark svg').length,
    heroPaths: document.querySelectorAll('#hero svg path').length,
    absentChips: document.querySelectorAll('.absent li').length,
    headline: document.querySelector('#headline').textContent.trim(),
  };
});

console.log(JSON.stringify({ port, width, reduced, errors, ...audit }, null, 1));
await browser.close();
server.close();
