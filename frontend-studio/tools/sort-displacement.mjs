#!/usr/bin/env node
/**
 * sort-displacement — how far does a row travel when the list re-sorts?
 *
 *   node tools/sort-displacement.mjs
 *
 * WHY. CLAUDE.md #10: measure where the variance lives BEFORE choosing an axis —
 * here, before deciding whether a re-sort deserves motion at all. The literature
 * (Heer & Robertson, InfoVis 2007) finds animated transitions help a viewer track
 * objects across a change; it does NOT say every change is worth animating. If a
 * sort moves the median row one slot, animating it is decoration and the honest
 * answer is to say so and stop (#20: a failed search is a finding).
 *
 * Runs on 014's real roster — 23 held players in four position groups, both lanes
 * rebased onto the 337 shared players. Displacement is reported in ROWS and in PX,
 * because a reader's ability to track a row is a physical question about how far it
 * moved on screen, not an abstract one about ordinal positions.
 *
 * ROW_PX is measured from the built prototype, not assumed — see --measure.
 */

import { readFileSync } from 'node:fs';

const ROW_PX = Number(process.argv.includes('--row-px')
  ? process.argv[process.argv.indexOf('--row-px') + 1] : 44);

global.window = {};
new Function(readFileSync('proposals/014-what-you-hold/data.js', 'utf8'))();
const H = global.window.HOLD;

/* The sorts a "what you hold" list plausibly offers. Every one is a column the
   surface already prints, per the standing rule that views are filter+sort states
   over one list rather than separate widgets. */
const SORTS = {
  'our rank':     (p) => p.drank,
  'market rank':  (p) => p.mrank,
  'disagreement': (p) => -Math.abs(p.gap),
  'age':          (p) => p.age,
  'value':        (p) => -p.value,
  '30-day trend': (p) => -p.trend30,
};

const order = (players, key) =>
  [...players].sort((a, b) => (SORTS[key](a) - SORTS[key](b)) || a.name.localeCompare(b.name))
    .map((p) => p.name);

const median = (a) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const keys = Object.keys(SORTS);
const rows = [];

console.log(`\nSORT DISPLACEMENT — 014 roster, ${H.rosterSize} players in ${H.groups.length} position groups`);
console.log(`market ${H.generated_from.market.slice(0, 10)} · model ${H.generated_from.model} · row height ${ROW_PX}px\n`);

console.log('Per position group, from the surface\'s default order (our rank):');
console.log('-'.repeat(74));
console.log('group  n   sort            moved   median   max      max px');
console.log('-'.repeat(74));

const allDisp = [];
for (const g of H.groups) {
  const base = order(g.players, 'our rank');
  if (base.length < 2) { console.log(`${g.pos.padEnd(6)} ${String(g.players.length).padEnd(3)} — only ${g.players.length} row(s), no re-order possible`); continue; }
  for (const k of keys) {
    if (k === 'our rank') continue;
    const next = order(g.players, k);
    const disp = base.map((n) => Math.abs(next.indexOf(n) - base.indexOf(n)));
    allDisp.push(...disp);
    const moved = disp.filter((d) => d > 0).length;
    const max = Math.max(...disp);
    rows.push({ pos: g.pos, n: base.length, sort: k, moved, med: median(disp.filter((d) => d > 0)), max });
    console.log(
      `${g.pos.padEnd(6)} ${String(base.length).padEnd(3)} ${k.padEnd(15)} ` +
      `${String(`${moved}/${base.length}`).padEnd(7)} ${String(median(disp.filter((d) => d > 0))).padEnd(8)} ` +
      `${String(max).padEnd(8)} ${max * ROW_PX}px`,
    );
  }
}

const moved = allDisp.filter((d) => d > 0);
console.log('-'.repeat(74));
console.log(`\nPOOLED across every group and every sort (${allDisp.length} row-transitions):`);
console.log(`  rows that change position : ${moved.length}/${allDisp.length}  (${Math.round(100 * moved.length / allDisp.length)}%)`);
console.log(`  median travel, of those   : ${median(moved)} rows  = ${median(moved) * ROW_PX}px`);
console.log(`  mean travel, of those     : ${(moved.reduce((a, b) => a + b, 0) / moved.length).toFixed(1)} rows`);
console.log(`  worst travel              : ${Math.max(...allDisp)} rows = ${Math.max(...allDisp) * ROW_PX}px`);
console.log(`  rows travelling >3 rows   : ${allDisp.filter((d) => d > 3).length} (${Math.round(100 * allDisp.filter((d) => d > 3).length / allDisp.length)}%)`);

/* The honest counter-test. If the biggest group's rows mostly travel less than one
   row height, motion is decoration here regardless of what the literature says about
   re-sorts in general. State the threshold before reading the answer. */
const THRESHOLD_ROWS = 2;
const frac = moved.filter((d) => d >= THRESHOLD_ROWS).length / allDisp.length;
console.log(`\nDECISION RULE, stated before the reading: motion is load-bearing only if a`);
console.log(`substantial share of rows travel >= ${THRESHOLD_ROWS} rows (past a reader's ability to`);
console.log(`track by adjacency alone). Measured: ${(100 * frac).toFixed(0)}% of row-transitions.`);
console.log(frac >= 0.4
  ? `  -> LOAD-BEARING. A re-sort scatters the list; tracking a named player across it\n     is the reader problem animated transitions exist to solve.`
  : `  -> DECORATION. Rows barely move; animating the re-sort would add time and no\n     information. Say so and do not build it.`);
