// Studio first-run tour — read-only browser drive of Dynasty Genius.
// Screenshots land in ~/frontend-studio/proposals/assets/000-first-run/
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';

const BASE = 'http://127.0.0.1:8000';
const OUT = '/Users/davidleess/frontend-studio/proposals/assets/000-first-run';

const surfaces = [
  ['01-default-what-changed', '/'],
  ['02-roster-audit', '/?surface=roster-audit'],
  ['03-trade-lab', '/?surface=trade-lab'],
  ['04-roster-capacity', '/?surface=roster-capacity'],
  ['05-league-pulse', '/?surface=league-pulse'],
  ['06-model-trust', '/?surface=model-trust'],
  ['07-accuracy-tracker', '/?surface=accuracy-tracker'],
  ['08-rookie-board', '/?surface=rookie-board'],
  ['09-waiver-radar', '/?surface=waiver-radar'],
  ['10-research-assistant', '/?surface=research-assistant'],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(15000);

for (const [name, path] of surfaces) {
  try {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/${name}-viewport.png` });
    await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true });
    console.log(`ok ${name}`);
  } catch (e) {
    console.log(`FAIL ${name}: ${e.message.split('\n')[0]}`);
  }
}

await browser.close();
