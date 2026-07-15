import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
const P = '/Users/davidleess/frontend-studio/proposals/001-morning-tape/prototype.html';
const A = '/Users/davidleess/frontend-studio/proposals/assets/001-proto';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', e => console.log('PAGE ERR:', e.message.slice(0, 200)));
await page.goto('file://' + P, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await page.locator('.row').first().click();     // Chris Bell — modeled, divergence inside band
await page.waitForTimeout(600);
await page.screenshot({ path: A + '/p7-tray-bell.png' });
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
// a league mover with different divergence
await page.locator('#league-tape .row').nth(3).click();  // Tyquan Thornton
await page.waitForTimeout(600);
await page.screenshot({ path: A + '/p8-tray-league.png' });
console.log('done');
await browser.close();
