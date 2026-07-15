// Retry trade run + removal attempt + tape clickability probe.
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';

const BASE = 'http://127.0.0.1:8000';
const OUT = '/Users/davidleess/frontend-studio/proposals/assets/000-first-run';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(8000);

// Trade lab: draft persisted in localStorage from last run
await page.goto(BASE + '/?surface=trade-lab', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/30-trade-persisted.png` });

// try removing an added asset by clicking its chip
try {
  await page.locator('text="Ashton Jeanty"').last().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/31-remove-attempt.png` });
} catch (e) { console.log('remove click failed: ' + e.message.split('\n')[0]); }

// run comparison, wait properly
try {
  const runBtn = page.getByRole('button', { name: /run comparison/i });
  await runBtn.click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${OUT}/32-trade-result-viewport.png` });
  await page.screenshot({ path: `${OUT}/32-trade-result-full.png`, fullPage: true });
  console.log('ok run');
} catch (e) { console.log('FAIL run: ' + e.message.split('\n')[0]); }

// Tape clickability probe
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
const name = page.getByText('Chris Bell').first();
const clickable = await name.evaluate((el) => {
  let n = el;
  while (n && n !== document.body) {
    const cs = getComputedStyle(n);
    if (n.tagName === 'BUTTON' || n.tagName === 'A' || n.onclick || cs.cursor === 'pointer') return n.tagName + '/' + cs.cursor;
    n = n.parentElement;
  }
  return 'none';
}).catch(e => 'eval-fail');
console.log('tape row clickable ancestor: ' + clickable);

await browser.close();
