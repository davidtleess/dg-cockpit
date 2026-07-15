import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
const OUT = '/Users/davidleess/frontend-studio/proposals/assets/000-first-run/..';
const P = '/Users/davidleess/frontend-studio/proposals/001-morning-tape/prototype.html';
const A = '/Users/davidleess/frontend-studio/proposals/assets/001-proto';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERR:', m.text().slice(0, 200)); });
page.on('pageerror', e => console.log('PAGE ERR:', e.message.slice(0, 300)));
await page.goto('file://' + P, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: A + '/p1-top.png' });
await page.screenshot({ path: A + '/p1-full.png', fullPage: true });
// open receipts
await page.getByRole('button', { name: 'receipts' }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: A + '/p2-receipts.png' });
// open drawer on top mover
await page.locator('.row').first().click();
await page.waitForTimeout(500);
await page.mouse.move(1100, 500);
await page.waitForTimeout(300);
await page.screenshot({ path: A + '/p3-drawer.png' });
console.log('done');
await browser.close();
