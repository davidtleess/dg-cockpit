import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
const A = '/Users/davidleess/frontend-studio/proposals/assets/009-morning-2026-07-25';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errs = [];
page.on('pageerror', e => errs.push('PAGE ERR: ' + e.message.slice(0,200)));
page.on('console', m => { if (m.type()==='error') errs.push('CONSOLE: ' + m.text().slice(0,160)); });

const surfaces = ['', 'roster-audit', 'league-pulse', 'trade-lab', 'roster-capacity'];
for (const s of surfaces) {
  const url = 'http://127.0.0.1:8000/' + (s ? '?surface=' + s : '');
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${A}/${s || 'default'}.png`, fullPage: true });
  console.log('shot', s || 'default');
}
console.log('errors:', errs.length ? errs.slice(0,8) : 'none');
await browser.close();
