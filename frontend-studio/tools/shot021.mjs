// screenshot + census for proposal 021.
// Census rule: audit the RENDER against the SOURCE ledger, never a derived array.
import { chromium } from "/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs";
import { readFileSync, mkdirSync } from "node:fs";

const URL_ = process.argv[2] || "http://127.0.0.1:8791/";
const OUT = new URL("../proposals/021-trade-retrospective/shots/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const data = JSON.parse(
  readFileSync(new URL("../proposals/021-trade-retrospective/data.js", import.meta.url).pathname, "utf8")
    .replace("window.DATA = ", "").trim().replace(/;$/, "")
);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.goto(URL_, { waitUntil: "networkidle" });

// ---- census: served title, every trade, every asset name, fault state
const title = await page.title();
const cards = await page.locator("article.trade").count();
const fault = await page.locator(".fault:not([hidden])").count();

// expand the swap so its assets exist in the DOM for the census
const expand = page.locator("button.expand");
if (await expand.count()) await expand.first().click();

let missing = [];
for (const t of data.trades) {
  for (const s of t.sides) {
    for (const a of s.assets) {
      const label = a.kind === "player" ? a.name
        : a.kind === "pick_resolved" ? a.became.name
        : `${a.pick.season}`;
      const hit = await page.getByText(label, { exact: false }).count();
      if (!hit) missing.push(`${t.date} ${s.manager}: ${label}`);
    }
  }
}

const expectTrades = data.trades.length;
console.log(`title: ${title}`);
console.log(`cards rendered: ${cards} / ${expectTrades} trades`);
console.log(`fault visible: ${fault}`);
console.log(`asset names missing from render: ${missing.length}`);
missing.slice(0, 10).forEach((m) => console.log("  MISSING", m));
console.log(`page errors: ${errors.length}`); errors.slice(0, 5).forEach((e) => console.log("  ERR", e));

// overflow both edges
const over = await page.evaluate(() => {
  const d = document.documentElement;
  return { scrollW: d.scrollWidth, clientW: d.clientWidth };
});
console.log(`horizontal overflow: ${over.scrollW > over.clientW ? `YES ${over.scrollW}>${over.clientW}` : "none"}`);

// shots: top, a mid trade, the swap, footer
await page.locator("button.expand").first().click(); // collapse swap again for the visual
await page.screenshot({ path: OUT + "01-top.png" });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
await page.screenshot({ path: OUT + "02-mid.png" });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.screenshot({ path: OUT + "03-footer.png" });
// mine filter
await page.click("#chipMine");
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: OUT + "04-mine.png" });
const mineCards = await page.locator("article.trade").count();
console.log(`your-trades filter: ${mineCards} cards (expect ${data.meta.david_trades})`);
const shotHeight = await page.evaluate(() => document.body.scrollHeight);
console.log(`page height (all trades view was earlier): mine=${shotHeight}px`);

await browser.close();
