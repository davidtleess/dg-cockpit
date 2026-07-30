#!/usr/bin/env node
/**
 * gate-selftest — prove the craft-gate before quoting it.
 *
 *   node tools/gate-selftest.mjs            # run every specimen
 *   node tools/gate-selftest.mjs --write    # also regenerate the calibration
 *
 * WHY. On 2026-07-29 four runs of one unchanged file returned 84, 108, 93 and 96
 * marks, and a file that differed from its twin ONLY in paint reported 0 sub-24px
 * targets where its twin reported 72. Every density figure in the 012 record —
 * the "3.26 -> 2.74 -> 2.10" improvement trend — came out of that instrument. The
 * gate had never been run against a case whose answer was known.
 *
 * Two kinds of specimen, because they prove different things:
 *
 *   MECHANICAL — synthetic pairs where the correct answer is a property, not a
 *   number. paint-flat and paint-gradient differ in paint alone, so any
 *   difference in their census is a classifier bug by construction. never-settles
 *   has no fixed population, so the only correct behaviour is refusal.
 *
 *   LABELLED — two real surfaces DAVID ruled on: the 006 front door he approved
 *   and the 009 matrix he rejected as "extremely confusing". They are the only
 *   ground truth in this engagement about what density is too much, and the gate
 *   must order them correctly. It is the calibration, so it is measured here
 *   rather than typed into the thresholds — the same rule the token pipeline
 *   follows, for the same reason: a transcribed number goes stale in silence.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const WRITE = process.argv.includes('--write');

const gate = (rel) => JSON.parse(
  execFileSync('node', [resolve(HERE, 'craft-gate.mjs'), resolve(ROOT, rel), '--json'],
               { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));

const LABELLED = {
  approved: { file: 'proposals/006-state-of-franchise/frontdoor.html',
              note: 'David 2026-07-22: "this is awesome - great updates"' },
  rejected: { file: 'proposals/009-who-holds-what/matrix.html',
              note: 'David 2026-07-26: rejected, "extremely confusing"' },
};

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); };

/* --- mechanical: paint must not change the population --------------------- */
const flat = gate('kit/gate-fixtures/paint-flat.html');
const grad = gate('kit/gate-fixtures/paint-gradient.html');
check('paint-invariance/census',
  flat.report.censusHash === grad.report.censusHash,
  `flat ${flat.report.censusHash} vs gradient ${grad.report.censusHash}`);
check('paint-invariance/targets',
  flat.report.checks.C5.interactiveMarks === grad.report.checks.C5.interactiveMarks &&
  flat.report.checks.C5.underTarget === grad.report.checks.C5.underTarget,
  `flat ${flat.report.checks.C5.underTarget}/${flat.report.checks.C5.interactiveMarks} under target, ` +
  `gradient ${grad.report.checks.C5.underTarget}/${grad.report.checks.C5.interactiveMarks}`);
check('paint-invariance/convicts',
  flat.findings.find((f) => f.id === 'C5')?.level === 'FAIL',
  `C5 on the known-bad specimen: ${flat.findings.find((f) => f.id === 'C5')?.level} (72 marks of 13x16px must fail WCAG 2.5.8)`);

/* --- mechanical: declared chrome is not data ------------------------------ */
check('role/declared-chrome-excluded',
  flat.report.checks.C1.marksTotal === 72,
  `${flat.report.checks.C1.marksTotal} marks counted; 72 declared data + 48 declared chrome are present`);
check('role/data-mark-identified',
  flat.report.checks.C6?.mark === 'button' && flat.report.checks.C6?.channel === 'position',
  `C6 chose <${flat.report.checks.C6?.mark}> encoding by ${flat.report.checks.C6?.channel} on ${flat.report.checks.C6?.axis}`);

/* --- mechanical: a moving population is refused, not averaged ------------- */
const moving = gate('kit/gate-fixtures/never-settles.html');
const refusedIds = moving.findings.filter((f) => f.level === 'REFUSED').map((f) => f.id).sort();
check('refusal/fires',
  moving.report.settled === false && ['C1', 'C5', 'C6'].every((id) => refusedIds.includes(id)),
  `settled=${moving.report.settled}, refused [${refusedIds.join(',')}] over ${moving.report.settleTrace.length} samples`);
check('refusal/is-narrow',
  moving.findings.filter((f) => ['C2', 'C3', 'C4'].includes(f.id)).every((f) => f.level !== 'REFUSED'),
  'type, hue and legend checks do not depend on the mark population and still report');

/* --- mechanical: an empty population is never a pass ---------------------- */
const inert = gate('kit/gate-fixtures/inert-marks.html');
const c5inert = inert.findings.find((f) => f.id === 'C5');
check('empty-population/never-passes',
  c5inert?.level === 'SKIP',
  `C5 on marks that are not their own targets: ${c5inert?.level} (must be SKIP — "0 marks, none under 24px" is a claim about nothing)`);
check('empty-population/still-sees-controls',
  inert.report.checks.C5.pageControls > 0,
  `${inert.report.checks.C5.pageControls} page controls counted, ${inert.report.checks.C5.pageControlsUnder} under target — the page-wide sweep is not blind`);

/* --- labelled: the gate must order David's own verdicts correctly --------- */
const app = gate(LABELLED.approved.file);
const rej = gate(LABELLED.rejected.file);
const dApp = app.report.checks.C1.density, dRej = rej.report.checks.C1.density;
check('calibration/settles',
  app.report.settled && rej.report.settled,
  `approved settled=${app.report.settled}, rejected settled=${rej.report.settled}`);
check('calibration/orders-the-labels',
  dApp < dRej,
  `approved ${dApp} < rejected ${dRej} marks+text per 10k px²`);
check('calibration/separates-them',
  dRej / dApp >= 1.5,
  `rejected is ${(dRej / dApp).toFixed(2)}x the approved surface — a gap this small makes the threshold a coin toss`);

/* --- report ---------------------------------------------------------------- */
const pass = results.filter((r) => r.ok).length;
console.log('\ncraft-gate self-test — specimens with known answers\n' + '─'.repeat(84));
for (const r of results) {
  console.log(`[${r.ok ? ' ok ' : 'MISS'}] ${r.name.padEnd(34)} ${r.detail}`);
}
console.log('─'.repeat(84));
console.log(`${pass}/${results.length} specimens agree`);
console.log(`calibration measured now: approved ${dApp}, rejected ${dRej} marks+text per 10k px²`);
console.log(`  approved  ${LABELLED.approved.file}  — ${LABELLED.approved.note}`);
console.log(`  rejected  ${LABELLED.rejected.file}  — ${LABELLED.rejected.note}`);

if (WRITE) {
  const out = {
    _comment: 'GENERATED by tools/gate-selftest.mjs --write. Do not edit. ' +
              'Thresholds are measurements of two surfaces David ruled on, not taste. ' +
              'Two points is a weak fit — treat the number as a prompt to look, never as a verdict.',
    measured: '2026-07-29',
    warn: dApp, fail: dRej,
    approved: { ...LABELLED.approved, density: dApp },
    rejected: { ...LABELLED.rejected, density: dRej },
  };
  writeFileSync(resolve(ROOT, 'kit/gate-calibration.json'), JSON.stringify(out, null, 2) + '\n');
  console.log('\nwrote kit/gate-calibration.json');
}

if (pass < results.length) {
  console.log('\nThe gate is NOT trustworthy until every specimen agrees. Its numbers should not');
  console.log('be quoted in a proposal or to David while this is failing.');
}
process.exit(pass === results.length ? 0 : 1);
