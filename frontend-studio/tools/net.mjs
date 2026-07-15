import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage();
const urls = new Set();
page.on('request', r => { const u = r.url(); if (/png|jpg|jpeg|webp|avatar|headshot|img/i.test(u)) urls.add(u); });
await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
console.log([...urls].slice(0, 10).join('\n'));
await browser.close();
