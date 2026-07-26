import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1280,height:1000}});
await p.goto('file:///Users/davidleess/frontend-studio/proposals/008-draft-capital/prototype.html',{waitUntil:'networkidle'});
await p.waitForTimeout(500);
await p.locator('#years').scrollIntoViewIfNeeded();
await p.waitForTimeout(300);
await p.screenshot({path:'/Users/davidleess/frontend-studio/proposals/assets/008-capital/08-years.png'});
await b.close();
