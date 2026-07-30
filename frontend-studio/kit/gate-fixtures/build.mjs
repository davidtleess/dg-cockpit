#!/usr/bin/env node
/**
 * Generate the craft-gate's labelled specimens.
 *
 * GENERATED, NOT TRANSCRIBED — the same rule the token pipeline follows, and for
 * a sharper reason here. Two of these fixtures are a PAIR whose entire purpose is
 * that they differ in paint and in nothing else. Hand-maintained, they would
 * drift the first time one was edited, and a drifted pair reports a classifier
 * bug that is really a typo. Emitting both from one geometry makes the invariant
 * structural.
 *
 *   node kit/gate-fixtures/build.mjs
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

const LANES = 12;
const MARKS = 6;
const BANDS = 4;

/* One geometry, three paint jobs. Every fixture below draws EXACTLY this DOM. */
const lanes = () =>
  Array.from({ length: LANES }, (_, i) => {
    const bands = Array.from({ length: BANDS }, (_, b) =>
      `<div class="band" data-sk-role="chrome" aria-hidden="true" style="left:${b * 25}%"></div>`).join('');
    const marks = Array.from({ length: MARKS }, (_, m) =>
      `<button class="mark" data-sk-role="data" aria-label="trade ${i}-${m}" style="left:${6 + m * 15}%"></button>`).join('');
    return `<div class="lane"><span class="who">Manager ${i + 1}</span><div class="track">${bands}${marks}</div></div>`;
  }).join('\n');

const page = (title, extraCss, extraHead = '') => `<!doctype html>
<meta charset="utf-8"><title>${title}</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; padding: 16px; background: #0f1216; color: #e6e9ee;
         font: 15px/1.4 system-ui, sans-serif; }
  .lane { display: flex; align-items: center; gap: 12px; height: 34px; }
  .who { width: 120px; font-size: 13px; }
  .track { position: relative; width: 470px; height: 20px; }
  .band { position: absolute; top: 0; width: 25%; height: 20px;
          background-color: #171b21; }
  .mark { position: absolute; top: 2px; width: 13px; height: 16px;
          border: 0; padding: 0; cursor: pointer; border-radius: 3px; }
  ${extraCss}
</style>
${extraHead}
<body>${lanes()}</body>
`;

/* --- the invariance pair ---------------------------------------------------
 * Identical geometry, identical mark count, identical interactivity. The ONLY
 * difference is how the marks are painted. A census that changes between these
 * two is counting paint, not marks — the 2026-07-28 false pass, where adding a
 * gradient made 110 sub-24px targets vanish and C5 reported a clean sheet. */
const FLAT = page('gate fixture — flat paint',
  `.mark { background-color: #4a8fd4; }`);

const GRADIENT = page('gate fixture — gradient paint',
  `.mark { background-color: transparent;
           background-image: linear-gradient(180deg, #5a9fe4, #3a7fc4);
           box-shadow: 0 1px 2px rgba(0,0,0,.45); }`);

/* --- the never-settles specimen --------------------------------------------
 * A surface whose marks pulse forever AND ignore prefers-reduced-motion, so the
 * population genuinely has no fixed value. The gate must REFUSE, not average.
 * Deliberately no reduced-motion path: that is the failure being specified. */
const MOVING = page('gate fixture — never settles',
  `.mark { background-color: #4a8fd4; animation: flick 700ms infinite steps(1); }
   .mark:nth-child(odd) { animation-delay: 350ms; }
   @keyframes flick { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }`);

/* --- the empty-population specimen -----------------------------------------
 * Marks that are not their own targets: the row around them is the control, and
 * it clears 24px comfortably. The correct answer is "nothing in scope to
 * measure" — NOT a pass. A pass on an empty population is a claim about
 * something the checker never looked at, and C5 issued exactly that on ten
 * surfaces before 2026-07-29. */
const INERT = page('gate fixture — nothing in scope',
  `.mark { background-color: #4a8fd4; cursor: default; }
   .lane { cursor: pointer; }`)
  .replace(/<button class="mark"([^>]*)><\/button>/g, '<span class="mark"$1></span>')
  // the ROW is the control, as it is on the 006 front door — comfortably over
  // 24px, so the page is accessible and the mark-scoped check simply has no
  // population. Without this the fixture would have no controls at all, which
  // is a different specimen and would let the page-wide sweep pass by being blind.
  .replace(/<div class="lane">/g, '<div class="lane" role="button" tabindex="0" aria-label="open this manager">');

for (const [name, html] of Object.entries({
  'paint-flat.html': FLAT,
  'paint-gradient.html': GRADIENT,
  'never-settles.html': MOVING,
  'inert-marks.html': INERT,
})) {
  writeFileSync(resolve(HERE, name), html);
  console.log('wrote', name, `(${LANES} lanes x ${MARKS} marks + ${BANDS} chrome bands)`);
}
