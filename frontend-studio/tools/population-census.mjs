#!/usr/bin/env node
/**
 * population-census — does every entity in the DATA reach the PAGE?
 *
 *   node tools/population-census.mjs <url> <data.js> <exportName> [--key name] [--filter pos=WR,TE]
 *
 * WHY THIS EXISTS
 * David, 2026-08-09: "sloppy work - missing player dots from my team". Kyle Williams was
 * silently dropped from a scatter by a 180-route floor that was correct for the league
 * population and wrong for the user's own roster. Studio had even said in the pane that he
 * would be named under the chart, and then did not build it.
 *
 * Every other instrument here measures the drawing: contrast, collisions, overflow, target
 * size, type scale, spatial weight. NOT ONE of them can see that a row present in the data
 * never became a mark. A page can be flawless on all six and still be missing a player.
 *
 * WHAT IT CHECKS
 *   1. every entity name in the named export appears SOMEWHERE the reader can reach it —
 *      rendered text, an accessible name, a title, or a tooltip payload;
 *   2. reports the ones that do not, which is the defect;
 *   3. counts marks so a figure that renders fewer marks than entities is flagged even when
 *      the names appear elsewhere on the page.
 *
 * It cannot tell whether an entity is MEANINGFULLY represented — only whether it is
 * reachable at all. Stated rather than implied.
 *
 * CALIBRATION NOTE. The first version searched the WHOLE PAGE for each name and therefore
 * could not convict its own known-bad specimen: Williams was missing from the figure while
 * still appearing in his card lower down, so the page-level search found him and the tool
 * reported PASS. A census must be scoped to the FIGURE it is auditing. Fixed by requiring a
 * --figure selector and counting marks inside it against the entity list.
 */
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import fs from 'node:fs';

const [url, dataPath, exportName] = process.argv.slice(2);
const keyArg = (process.argv.find(a => a.startsWith('--key=')) || '--key=name').split('=')[1];
const markSel = (process.argv.find(a => a.startsWith('--marks=')) || '--marks=').split('=')[1];
const figSel = (process.argv.find(a => a.startsWith('--figure=')) || '--figure=').split('=')[1];
if (!url || !dataPath || !exportName || !markSel || !figSel) {
  console.error('usage: population-census.mjs <url> <data.js> <exportName> --key=name '
    + '--figure=<selector> --marks=<selector>');
  process.exit(1);
}

// pull the export out of the generated data file without executing the page's module graph
const src = fs.readFileSync(dataPath, 'utf8');
const m = src.match(new RegExp(`export const ${exportName} = ([\\s\\S]*?);\\n(?:export|$)`));
if (!m) { console.error(`could not find export ${exportName} in ${dataPath}`); process.exit(1); }
const rows = JSON.parse(m[1]);
const expected = [...new Set(rows.map(r => r[keyArg]).filter(Boolean))];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

const found = await page.evaluate(({ names, markSel, figSel }) => {
  // Scoped to the FIGURE. A name printed elsewhere on the page is not representation inside
  // the figure — that conflation is exactly what let the first version pass a chart that was
  // missing a player, because his card lower down still carried his name.
  const fig = document.querySelector(figSel);
  if (!fig) return { error: 'figure selector matched nothing: ' + figSel };
  const hay = [fig.innerText || ''];
  for (const e of fig.querySelectorAll('[aria-label],[title],[alt]'))
    hay.push(e.getAttribute('aria-label') || '', e.getAttribute('title') || '', e.getAttribute('alt') || '');
  for (const t of fig.querySelectorAll('svg text, svg title')) hay.push(t.textContent);
  const blob = hay.join('  ');
  return { missing: names.filter(n => !blob.includes(n)), marks: fig.querySelectorAll(markSel).length };
}, { names: expected, markSel, figSel });
if (found.error) { console.error(found.error); await browser.close(); process.exit(2); }

// A second pass: entities reachable only by INTERACTION are legitimate, but they must be
// reachable. Drive the keyboard traversal if the page exposes one.
let viaKeyboard = [];
if (found.missing.length) {
  const svg = await page.$(`${figSel} svg[tabindex="0"]`);
  if (svg) {
    await svg.focus();
    await page.keyboard.press('Home');
    const seen = new Set();
    for (let i = 0; i < 400; i++) {
      const t = await page.evaluate((f) => ((document.querySelector(f) || document)
        .querySelector('.tip,[role="status"]') || {}).textContent || '', figSel);
      if (t) seen.add(t);
      await page.keyboard.press('ArrowRight');
    }
    const blob = [...seen].join(' ');
    viaKeyboard = found.missing.filter(n => blob.includes(n));
  }
}

const trulyMissing = found.missing.filter(n => !viaKeyboard.includes(n));
console.log(JSON.stringify({
  url, export: exportName, entities: expected.length,
  marksRendered: found.marks,
  markDeficit: found.marks !== null && found.marks < expected.length
    ? `${expected.length - found.marks} fewer marks than entities` : null,
  reachableOnlyByInteraction: viaKeyboard.length,
  MISSING: trulyMissing,
  verdict: trulyMissing.length === 0 ? 'PASS — every entity is reachable in the figure'
                                     : `FAIL — ${trulyMissing.length} entity/entities never reach the reader`,
}, null, 1));
await browser.close();
process.exit(trulyMissing.length ? 1 : 0);
