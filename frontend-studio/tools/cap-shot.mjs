import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
const P = '/Users/davidleess/frontend-studio/proposals/008-draft-capital/prototype.html';
const A = '/Users/davidleess/frontend-studio/proposals/assets/008-capital';
import { mkdirSync } from 'fs';
mkdirSync(A, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const errs = [];
page.on('pageerror', e => errs.push('PAGE ERR: ' + e.message.slice(0, 250)));
page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text().slice(0, 200)); });
await page.goto('file://' + P, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);

await page.screenshot({ path: A + '/01-full.png', fullPage: true });
await page.screenshot({ path: A + '/02-fold.png' });

// open the top pick (your own 2027 1st)
const rows = page.locator('.prow');
console.log('rows:', await rows.count());
await rows.first().click();
await page.waitForTimeout(600);
await rows.first().scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
await page.screenshot({ path: A + '/03-expanded-own.png' });

// an acquired pick
await rows.nth(2).click();
await page.waitForTimeout(600);
await rows.nth(2).scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
await page.screenshot({ path: A + '/04-expanded-acquired.png' });

// a 3rd (round outside one)
await rows.nth(8).click();
await page.waitForTimeout(600);
await rows.nth(8).scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
await page.screenshot({ path: A + '/05-expanded-third.png' });

// overflow / geometry audit
const audit = await page.evaluate(() => {
  const de = document.documentElement;
  const out = { scrollW: de.scrollWidth, clientW: de.clientWidth, overflow: de.scrollWidth > de.clientWidth };
  out.wide = [...document.querySelectorAll('*')]
    .filter(n => n.getBoundingClientRect().right > de.clientWidth + 1)
    .slice(0, 8).map(n => n.className + ' | ' + Math.round(n.getBoundingClientRect().right));
  const texts = [...document.querySelectorAll('svg text')].map(t => {
    const b = t.getBoundingClientRect();
    return { t: t.textContent.slice(0, 26), x: Math.round(b.left), r: Math.round(b.right), y: Math.round(b.top) };
  });
  // crude collision check within same y band
  const coll = [];
  for (let i = 0; i < texts.length; i++)
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], b = texts[j];
      if (Math.abs(a.y - b.y) < 9 && a.x < b.r && b.x < a.r) coll.push(a.t + ' <> ' + b.t);
    }
  out.collisions = [...new Set(coll)].slice(0, 12);
  return out;
});
console.log(JSON.stringify(audit, null, 1));
console.log(errs.length ? errs.join('\n') : 'no page errors');

// mobile — measure the DOM, do not trust the picture (2026-07-24 lesson)
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await m.goto('file://' + P, { waitUntil: 'networkidle' });
await m.waitForTimeout(500);
const mo = await m.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
console.log('mobile scrollW/clientW:', mo);
await m.screenshot({ path: A + '/06-mobile.png', fullPage: true });

await browser.close();
