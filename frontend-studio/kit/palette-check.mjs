#!/usr/bin/env node
/**
 * palette-check — validate the PRODUCT'S OWN colour tokens, from source, every run.
 *
 *   node kit/palette-check.mjs            # check shipped tokens + the proposed set
 *   node kit/palette-check.mjs --json
 *
 * WHY THIS IS A TOOL AND NOT A NOTE.
 * On 2026-07-29 Studio ran the dataviz validator against the four position hues the
 * product ships and found they FAIL — TE↔WR ΔE 4.0 for deuteranopes, and TE↔RB
 * ΔE 8.0 in NORMAL vision against a floor of 15. That finding is the entire
 * argument for re-stepping them. Written in a markdown file it decays silently the
 * first time someone edits tokens.css. Written here it either passes or fails
 * loudly, which is the difference between a fact and a claim about a fact.
 *
 * It reads the hues OUT OF the product's stylesheet rather than carrying copies.
 * Transcription is the defect (kit/build-tokens.mjs exists for the same reason).
 */
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';

const TOKENS = '/Users/davidleess/dynasty-genius-product/frontend/src/styles/tokens.css';
const VALIDATOR = '/private/tmp/claude-501/bundled-skills/2.1.220/bb5cb2a9a4f3a8b313c3d31e392ede5e/dataviz/scripts/validate_palette.js';
const AS_JSON = process.argv.includes('--json');

/* ---- the sets that are CATEGORICAL, i.e. the ones this check applies to -----
 * A categorical set is one where the reader must tell members apart by identity.
 * The two lanes are a fixed PAIR inside a metric, not a category, and they are
 * deliberately brighter than the categorical band — so they are checked as a pair
 * against each other and against the categorical set, never scored for the
 * lightness band. Getting that distinction wrong makes the tool cry wolf, which
 * costs exactly what a false pass costs. */
const CATEGORICAL = {
  'position hues (shipped)': ['--dg-pos-qb', '--dg-pos-rb', '--dg-pos-wr', '--dg-pos-te'],
};
const PROPOSED = {
  'position hues (proposed 2026-07-29)': [
    'oklch(0.60 0.15 300)',   // QB — keeps the product's shipped violet
    'oklch(0.64 0.15 130)',   // RB
    'oklch(0.52 0.15 5)',     // WR
    'oklch(0.58 0.13 200)',   // TE — off the cyan that collided with RB and blue
  ],
};

if (!existsSync(TOKENS)) {
  console.error(`cannot read ${TOKENS} — is the product checked out?`);
  process.exit(2);
}
const css = readFileSync(TOKENS, 'utf8');
const readVar = (name) => {
  // last definition wins, so the dark-theme block is what a dark surface gets
  const hits = [...css.matchAll(new RegExp(`${name}\\s*:\\s*([^;]+);`, 'g'))].map((m) => m[1].trim());
  return hits.length ? hits[hits.length - 1] : null;
};
const surfaceRaw = readVar('--dg-surface');

const browser = await chromium.launch();
const page = await browser.newPage();
const toHex = (list) => page.evaluate((l) => {
  const c = document.createElement('canvas'); c.width = c.height = 1;
  const x = c.getContext('2d');
  return l.map((v) => {
    x.fillStyle = '#000'; x.fillStyle = v; x.fillRect(0, 0, 1, 1);
    const d = x.getImageData(0, 0, 1, 1).data;
    return '#' + [d[0], d[1], d[2]].map((n) => n.toString(16).padStart(2, '0')).join('');
  });
}, list);

const validate = (hex, surface) => {
  let out;
  try {
    out = execFileSync('node', [VALIDATOR, hex.join(','), '--mode', 'dark', '--surface', surface, '--pairs', 'all'],
                       { encoding: 'utf8' });
  } catch (e) { out = e.stdout || String(e); }
  const cvd = /CVD separation\s+worst all-pairs (\S+) ΔE ([\d.]+) \((\w+)\) · tritan ([\d.]+)/.exec(out);
  const norm = /Normal-vision floor\s+worst all-pairs (\S+) ΔE ([\d.]+)/.exec(out);
  return {
    pass: !/FAILED/.test(out),
    cvd: cvd ? { pair: cvd[1], deltaE: +cvd[2], kind: cvd[3], tritan: +cvd[4] } : null,
    normal: norm ? { pair: norm[1], deltaE: +norm[2] } : null,
    raw: out.trim(),
  };
};

const results = [];
const surfaceHex = (await toHex([surfaceRaw]))[0];

for (const [label, vars] of Object.entries(CATEGORICAL)) {
  const raws = vars.map(readVar);
  const missing = vars.filter((v, i) => !raws[i]);
  if (missing.length) { results.push({ label, error: `missing from tokens.css: ${missing.join(', ')}` }); continue; }
  const hex = await toHex(raws);
  results.push({ label, source: 'tokens.css', vars, hex, ...validate(hex, surfaceHex) });
}
for (const [label, raws] of Object.entries(PROPOSED)) {
  const hex = await toHex(raws);
  results.push({ label, source: 'proposal', hex, ...validate(hex, surfaceHex) });
}

await browser.close();

if (AS_JSON) { console.log(JSON.stringify({ surface: surfaceHex, results }, null, 2)); process.exit(0); }

console.log(`\npalette-check — the product's own categorical hues, read from tokens.css`);
console.log(`surface ${surfaceRaw} → ${surfaceHex}`);
console.log('─'.repeat(90));
let failed = 0;
for (const r of results) {
  if (r.error) { console.log(`[ERR ] ${r.label}\n       ${r.error}`); failed++; continue; }
  const mark = r.pass ? ' ok ' : 'FAIL';
  if (!r.pass) failed++;
  console.log(`[${mark}] ${r.label}  (${r.source})`);
  console.log(`       ${r.hex.join('  ')}`);
  if (r.cvd) console.log(`       worst CVD pair ${r.cvd.pair} ΔE ${r.cvd.deltaE} (${r.cvd.kind}) · tritan ${r.cvd.tritan}   [target ≥8, floor 6]`);
  if (r.normal) console.log(`       worst NORMAL-vision pair ${r.normal.pair} ΔE ${r.normal.deltaE}   [floor 15]`);
}
console.log('─'.repeat(90));
if (failed) {
  console.log(`${failed} set(s) FAIL. A categorical hue set below the floors cannot carry identity —`);
  console.log(`fix the values, or carry identity on a second channel (a label, a shape, a gap) and say so.`);
  console.log(`Reasoning and the proposed replacement: craft/colour-encoding-system.md`);
} else {
  console.log('all categorical sets clear the floors.');
}
console.log(`\nThis checks SEPARABILITY, not meaning. It cannot tell whether a hue is assigned to`);
console.log(`something worth encoding — that is the scarcity rule, and it is a judgement.\n`);
process.exit(failed ? 1 : 0);
