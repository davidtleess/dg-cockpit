import { chromium } from "../../frontend/node_modules/playwright/index.mjs";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://127.0.0.1:8122/", { waitUntil: "domcontentloaded" });
await page.getByRole("button", { name: "Trade Lab" }).click();
await page
  .getByRole("searchbox", { name: "Search tradeable assets" })
  .fill("Tank Dell");
await page.getByRole("button", { name: "Tank Dell", exact: true }).click();
const inspector = page.getByRole("complementary", { name: "Player inspector" });
await inspector.getByRole("button", { name: "Open full evidence card" }).click();
await page.getByRole("article", { name: "Player detail for Tank Dell" }).waitFor();

const offenders = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (r.width > window.innerWidth + 1 || r.right > window.innerWidth + 1) {
      out.push({
        tag: el.tagName,
        cls: String(el.className).slice(0, 80),
        w: Math.round(r.width),
        right: Math.round(r.right),
        children: el.children.length,
      });
    }
  }
  return out.slice(0, 40);
});
console.log(JSON.stringify(offenders, null, 1));
await browser.close();
