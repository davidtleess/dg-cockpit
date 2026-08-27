import AxeBuilder from "../../frontend/node_modules/@axe-core/playwright";
import { expect, test } from "../../frontend/node_modules/@playwright/test";
import { writeFileSync } from "node:fs";

// Post-rebase re-run of the WIP's real-surface QA (2026-08-25). One change of
// substance vs the 08-19 spec: coverage counts are read from the LIVE API at
// test time instead of pinned to an 08-19 roster measurement ("221 of 274"),
// because "current rostered skill players" moves with live rosters. The
// assertion is the stronger one: the card must say exactly what the API says.

async function assertNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(metrics.body).toBeLessThanOrEqual(metrics.viewport);
  expect(metrics.document).toBeLessThanOrEqual(metrics.viewport);
}

async function openTankDellDetail(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Trade Lab" }).click();
  await page
    .getByRole("searchbox", { name: "Search tradeable assets" })
    .fill("Tank Dell");
  await page.getByRole("button", { name: "Tank Dell", exact: true }).click();
  const inspector = page.getByRole("complementary", { name: "Player inspector" });
  await expect(inspector).toBeVisible();
  await inspector
    .getByRole("button", { name: "Open full evidence card" })
    .click();
  return page.getByRole("article", { name: "Player detail for Tank Dell" });
}

test("DG-022 real Tank Dell surface is truthful on desktop and mobile", async ({
  page,
}) => {
  const detail = await (
    await page.request.get("http://127.0.0.1:8122/api/players/9502")
  ).json();
  const fp = detail.frozen_prediction;
  expect(fp.status).toBe("not_in_frozen_prediction_cohort");
  expect(fp.basis).toBe("non_model_route_at_freeze");
  expect(fp.decision_supported).toBe(false);
  const cov = fp.coverage;
  const coverageText = `${cov.current_rostered_skill_in_frozen_prediction_cohort_count} of ${cov.current_rostered_skill_player_count} current rostered skill players were included.`;

  await page.setViewportSize({ width: 1440, height: 960 });
  let card = await openTankDellDetail(page);
  await expect(card).toBeVisible();
  await expect(card.getByText("Experimental", { exact: true })).toBeVisible();
  await expect(card.getByText("Not in 2026 model snapshot")).toBeVisible();
  await expect(card.getByText(fp.message)).toBeVisible();
  await expect(card.getByText(coverageText)).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await page.screenshot({ path: "dg022-tank-desktop.png", fullPage: true });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.45));
  await page.screenshot({ path: "dg022-tank-desktop-mid-scroll.png" });

  // Whole-main axe is recorded as evidence; the PASS gate is scoped to the
  // surface THIS ticket added. The two whole-main violations measured
  // 2026-08-25 (.dg-two-lane__divergence contrast, dl.dg-two-lane__facts
  // markup) predate this branch — ValuationTwoLane landed with surface3 T8
  // and this WIP adds no two-lane rules. Filed separately as DG-043.
  const axeMain = await new AxeBuilder({ page }).include("main").analyze();
  writeFileSync("dg022-axe-main.json", JSON.stringify(axeMain.violations, null, 2));
  const axe = await new AxeBuilder({ page })
    .include(".dg-frozen-prediction")
    .analyze();
  writeFileSync("dg022-axe.json", JSON.stringify(axe.violations, null, 2));
  expect(axe.violations).toEqual([]);

  await page.setViewportSize({ width: 390, height: 844 });
  card = await openTankDellDetail(page);
  await expect(card).toBeVisible();
  await expect(card.getByText("Not in 2026 model snapshot")).toBeVisible();
  await expect(card.getByText(coverageText)).toBeVisible();
  // At 390px the PAGE overflows (body 776px) with or without DG-022's
  // elements — probed 2026-08-25 by hiding .dg-frozen-prediction entirely:
  // the offenders are all pre-existing .dg-two-lane__* furniture. Filed as
  // DG-043 with the two axe violations. THIS ticket's gate: its own
  // elements introduce no overflow of their own.
  const overflow = await page.evaluate(() => {
    const out = { body: document.body.scrollWidth, viewport: window.innerWidth, dg022: [] };
    for (const el of document.querySelectorAll(".dg-frozen-prediction")) {
      const r = el.getBoundingClientRect();
      out.dg022.push({ w: Math.round(r.width), right: Math.round(r.right) });
    }
    return out;
  });
  writeFileSync("dg022-mobile-overflow.json", JSON.stringify(overflow, null, 2));
  for (const box of overflow.dg022) {
    expect(box.right).toBeLessThanOrEqual(390);
    expect(box.w).toBeLessThanOrEqual(390);
  }
  await page.screenshot({ path: "dg022-tank-mobile.png", fullPage: true });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.45));
  await page.screenshot({ path: "dg022-tank-mobile-mid-scroll.png" });
});
