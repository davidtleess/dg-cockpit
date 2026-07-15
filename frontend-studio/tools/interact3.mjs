// Open full player evidence card via trade-lab inspector.
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';

const BASE = 'http://127.0.0.1:8000';
const OUT = '/Users/davidleess/frontend-studio/proposals/assets/000-first-run';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(8000);

await page.goto(BASE + '/?surface=trade-lab', { waitUntil: 'networkidle' });
const search = page.locator('input[type="text"], input[type="search"]').first();
await search.fill('jeanty');
await page.waitForTimeout(900);
await page.getByText('Ashton Jeanty').first().click();
await page.waitForTimeout(600);
await page.getByRole('button', { name: /open full evidence card/i }).click();
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/33-player-detail-viewport.png` });
await page.screenshot({ path: `${OUT}/33-player-detail-full.png`, fullPage: true });
console.log('url: ' + page.url());
await browser.close();
