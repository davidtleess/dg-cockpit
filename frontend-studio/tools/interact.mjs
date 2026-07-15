// Studio first-run interactive drive: player card, roster expand, trade build, palette.
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';

const BASE = 'http://127.0.0.1:8000';
const OUT = '/Users/davidleess/frontend-studio/proposals/assets/000-first-run';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(10000);
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });

// 1) What-Changed: click the top mover -> inspector
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
try {
  await page.getByText('Chris Bell').first().click();
  await page.waitForTimeout(600);
  await shot('20-inspector-open');
  // open full evidence card
  const btn = page.getByRole('button', { name: /evidence card/i }).first();
  await btn.click();
  await page.waitForTimeout(1200);
  await shot('21-player-detail');
  await page.screenshot({ path: `${OUT}/21-player-detail-full.png`, fullPage: true });
  console.log('ok inspector+detail');
} catch (e) { console.log('FAIL inspector: ' + e.message.split('\n')[0]); }

// 2) Roster audit: expand first row
await page.goto(BASE + '/?surface=roster-audit', { waitUntil: 'networkidle' });
try {
  await page.getByText('Ashton Jeanty').first().click();
  await page.waitForTimeout(700);
  await shot('22-roster-row-clicked');
  // look for an expand control on the row
  const expandBtns = page.locator('button:has-text("Expand"), [aria-expanded]');
  if (await expandBtns.count()) { await expandBtns.first().click(); await page.waitForTimeout(600); }
  await shot('23-roster-row-expanded');
  console.log('ok roster expand attempt');
} catch (e) { console.log('FAIL roster: ' + e.message.split('\n')[0]); }

// 3) Trade Lab: build a 2-for-1
await page.goto(BASE + '/?surface=trade-lab', { waitUntil: 'networkidle' });
try {
  const search = page.locator('input[type="text"], input[type="search"]').first();
  await search.fill('jeanty');
  await page.waitForTimeout(900);
  await shot('24-trade-search-results');
  // click first result
  await page.getByText('Ashton Jeanty').first().click();
  await page.waitForTimeout(500);
  // switch to receives side
  await page.getByRole('button', { name: /receives/i }).first().click();
  await search.fill('nico collins');
  await page.waitForTimeout(900);
  await page.getByText('Nico Collins').first().click();
  await page.waitForTimeout(300);
  await search.fill('2027');
  await page.waitForTimeout(900);
  await shot('25-trade-pick-search');
  const pick = page.getByText(/2027/).nth(1);
  await pick.click().catch(() => {});
  await page.waitForTimeout(400);
  await shot('26-trade-built');
  await page.getByRole('button', { name: /run comparison/i }).click();
  await page.waitForTimeout(2500);
  await shot('27-trade-result-viewport');
  await page.screenshot({ path: `${OUT}/27-trade-result-full.png`, fullPage: true });
  console.log('ok trade');
} catch (e) { console.log('FAIL trade: ' + e.message.split('\n')[0]); }

// 4) Command palette
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
try {
  await page.keyboard.press('Meta+k');
  await page.waitForTimeout(500);
  await shot('28-command-palette');
  console.log('ok palette');
} catch (e) { console.log('FAIL palette: ' + e.message.split('\n')[0]); }

// 5) Status pill expand
try {
  await page.keyboard.press('Escape');
  await page.getByText('Status unavailable').first().click();
  await page.waitForTimeout(600);
  await shot('29-status-strip');
  console.log('ok status');
} catch (e) { console.log('FAIL status: ' + e.message.split('\n')[0]); }

await browser.close();
