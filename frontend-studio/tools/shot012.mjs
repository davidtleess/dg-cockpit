import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';

const P = '/Users/davidleess/frontend-studio/proposals/012-league-pulse/prototype.html';
const A = '/Users/davidleess/frontend-studio/proposals/assets/012-proto';
mkdirSync(A, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text().slice(0, 200)); });
page.on('pageerror', e => errs.push('PAGEERR: ' + e.message.slice(0, 300)));

await page.goto('file://' + P, { waitUntil: 'load' });
await page.waitForTimeout(700);

await page.screenshot({ path: A + '/01-top.png' });
await page.screenshot({ path: A + '/00-full.png', fullPage: true });

// scroll to each region
for (const [i, sel] of [['02-calendar', '.cal'], ['03-board', '.board'], ['035-habits', '.habits'], ['036-panels', '.panels'], ['04-log', '.log']]) {
  const el = page.locator(sel).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${A}/${i}.png` });
}

// hover a trade square and a timeline dot
await page.locator('.tr').nth(20).hover();
await page.waitForTimeout(250);
await page.screenshot({ path: A + '/05-hover-trade.png' });

await page.locator('.tl-mark').first().scrollIntoViewIfNeeded();
await page.locator('.tl-mark').first().hover();
await page.waitForTimeout(250);
await page.screenshot({ path: A + '/06-hover-dot.png' });

// structural probes
const probe = await page.evaluate(() => {
  const out = { squares: document.querySelectorAll('.tr').length,
                rows: document.querySelectorAll('#boardBody tr').length,
                cards: document.querySelectorAll('.tradecard').length,
                overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
                scrollW: document.documentElement.scrollWidth,
                clientW: document.documentElement.clientWidth,
                tiny: [], clipped: [] };
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    const px = parseFloat(cs.fontSize);
    const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
    if (txt && px < 13) out.tiny.push({ px, cls: el.className, txt: txt.slice(0, 40) });
    if (el.scrollWidth > el.clientWidth + 2 && cs.overflow === 'visible' && el.clientWidth > 0)
      out.clipped.push({ cls: String(el.className).slice(0, 40), sw: el.scrollWidth, cw: el.clientWidth });
  }
  return out;
});
console.log(JSON.stringify(probe, null, 1).slice(0, 2500));

// mobile
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
await page.screenshot({ path: A + '/07-mobile.png', fullPage: true });
const mob = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
}));
console.log('mobile', JSON.stringify(mob));
console.log(errs.length ? errs.join('\n') : 'no console/page errors');
await browser.close();
