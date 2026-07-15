import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
const P = '/Users/davidleess/frontend-studio/proposals/001-morning-tape/prototype.html';
const A = '/Users/davidleess/frontend-studio/proposals/assets/001-proto';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', e => console.log('PAGE ERR:', e.message.slice(0, 250)));
await page.goto('file://' + P, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
// Jeanty — the cliff case. He's in roster tape after Show all
await page.locator('#roster-tape .show-more').click();
await page.waitForTimeout(400);
await page.getByText('Ashton Jeanty').first().click();
await page.waitForTimeout(400);
const detail = page.locator('.row-detail');
await detail.scrollIntoViewIfNeeded();
await page.screenshot({ path: A + '/p13-jeanty-structure.png' });
console.log('done');
await browser.close();
