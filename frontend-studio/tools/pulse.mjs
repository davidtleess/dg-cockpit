import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
const A = '/Users/davidleess/frontend-studio/proposals/assets/009-morning-2026-07-25';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1100 } });
await p.goto('http://127.0.0.1:8000/?surface=league-pulse', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
const h = await p.evaluate(() => document.body.scrollHeight);
console.log('page height', h);
for (let i = 0; i < 4; i++) {
  await p.evaluate(y => window.scrollTo(0, y), i * 1050);
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${A}/pulse-${i}.png` });
}
// section headings
const heads = await p.evaluate(() => [...document.querySelectorAll('h1,h2,h3,h4')].map(e=>e.tagName+': '+e.textContent.trim().slice(0,90)));
console.log(heads.join('\n'));
await b.close();
