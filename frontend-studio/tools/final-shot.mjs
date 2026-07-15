import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
const P = '/Users/davidleess/frontend-studio/proposals/001-morning-tape/prototype.html';
const A = '/Users/davidleess/frontend-studio/proposals/assets/001-proto';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', e => console.log('PAGE ERR:', e.message.slice(0, 250)));
await page.goto('file://' + P, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await page.locator('.row').first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: A + '/p11-bell-prose.png' });
await page.keyboard.press('Escape');
await page.locator('#league-tape .row').nth(1).click();  // Nico Collins
await page.waitForTimeout(400);
await page.screenshot({ path: A + '/p12-collins-prose.png' });
console.log('done');
await browser.close();
