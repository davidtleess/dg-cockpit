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
await page.waitForTimeout(500);

// --- every square must resolve to a named trade on hover ---
const squares = page.locator('.tr');
const n = await squares.count();
let hoverFails = 0, sample = null;
for (let i = 0; i < n; i++) {
  const sq = squares.nth(i);
  await sq.scrollIntoViewIfNeeded();
  await sq.hover();
  await page.waitForTimeout(60);
  const t = await page.evaluate(() => ({
    vis: getComputedStyle(document.querySelector('#tip')).opacity,
    txt: document.querySelector('#tip').innerText.trim(),
  }));
  if (t.vis === '0' || !/got/.test(t.txt)) hoverFails++;
  if (i === 30) sample = t.txt;
}
console.log(`squares: ${n}  hover-resolves: ${n - hoverFails}/${n}`);
console.log('sample tip:\n' + sample);

// screenshot a hovered square
await squares.nth(3).scrollIntoViewIfNeeded();
await squares.nth(3).hover();
await page.waitForTimeout(200);
await page.screenshot({ path: A + '/10-square-hover.png' });

// --- click a square: does the right trade open below? ---
const target = squares.nth(0);
const id = await target.getAttribute('data-trade');
await target.click();
await page.waitForTimeout(1500);
const sel = await page.evaluate((id) => {
  const card = document.getElementById('trade-' + id);
  return {
    cardExists: !!card,
    cardSelected: card ? card.classList.contains('sel') : false,
    squareSelected: document.querySelectorAll('.tr.sel').length,
    inView: card ? (() => { const r = card.getBoundingClientRect();
      return r.top > -10 && r.bottom < innerHeight + 10; })() : false,
    text: card ? card.innerText.replace(/\n/g, ' | ').slice(0, 160) : null,
  };
}, id);
console.log('click →', JSON.stringify(sel, null, 1));
await page.screenshot({ path: A + '/11-after-click.png' });

// --- filters ---
await page.getByRole('button', { name: 'only mine' }).scrollIntoViewIfNeeded();
await page.getByRole('button', { name: 'only mine' }).click();
await page.waitForTimeout(250);
const mine = await page.evaluate(() => ({
  count: document.querySelectorAll('.tradecard').length,
  label: document.querySelector('#filterCount').textContent,
}));
console.log('only mine →', JSON.stringify(mine));
await page.screenshot({ path: A + '/12-filter-mine.png' });

// a square outside the filter must still open (filter widens)
await page.locator('.tr').nth(35).scrollIntoViewIfNeeded();
await page.locator('.tr').nth(35).click();
await page.waitForTimeout(600);
const widened = await page.evaluate(() => ({
  count: document.querySelectorAll('.tradecard').length,
  minePressed: document.querySelector('.chip[aria-pressed="true"]')?.textContent,
  selected: document.querySelectorAll('.tradecard.sel').length,
}));
console.log('click outside filter →', JSON.stringify(widened));

// season filter
await page.getByRole('button', { name: '2023', exact: true }).scrollIntoViewIfNeeded();
await page.getByRole('button', { name: '2023', exact: true }).click();
await page.waitForTimeout(250);
console.log('2023 →', await page.evaluate(() => document.querySelector('#filterCount').textContent));
await page.screenshot({ path: A + '/13-filter-2023.png' });

await page.screenshot({ path: A + '/00-full.png', fullPage: true });
console.log(errs.length ? errs.join('\n') : 'no console/page errors');
await browser.close();
