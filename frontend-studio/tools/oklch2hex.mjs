import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
const tokens = {
  bg: 'oklch(0.16 0.01 250)', surface: 'oklch(0.2 0.012 250)', raised: 'oklch(0.24 0.014 250)',
  border: 'oklch(0.32 0.012 250)', borderStrong: 'oklch(0.48 0.014 250)',
  text: 'oklch(0.92 0.005 250)', textMuted: 'oklch(0.68 0.008 250)',
  model: 'oklch(0.72 0.11 255)', modelEmph: 'oklch(0.8 0.13 255)', modelMuted: 'oklch(0.62 0.07 255)',
  market: 'oklch(0.76 0.13 75)', marketEmph: 'oklch(0.82 0.14 75)', marketMuted: 'oklch(0.66 0.08 75)',
  caveat: 'oklch(0.72 0.14 72)', focus: 'oklch(0.72 0.14 255)', cliff: 'oklch(0.74 0.15 70)',
  posQB: 'oklch(0.6 0.14 300)', posRB: 'oklch(0.62 0.13 170)', posWR: 'oklch(0.6 0.15 340)', posTE: 'oklch(0.64 0.12 205)',
};
const browser = await chromium.launch();
const page = await browser.newPage();
const out = await page.evaluate((tokens) => {
  const c = document.createElement('canvas'); c.width = c.height = 1;
  const ctx = c.getContext('2d');
  const res = {};
  for (const [k, v] of Object.entries(tokens)) {
    ctx.fillStyle = v; ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    res[k] = '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('');
  }
  return res;
}, tokens);
console.log(JSON.stringify(out, null, 1));
await browser.close();
