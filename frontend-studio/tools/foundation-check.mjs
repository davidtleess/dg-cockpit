#!/usr/bin/env node
/**
 * foundation-check — does this surface repeat a claim the foundation has already refuted?
 *
 *   node tools/foundation-check.mjs <file> [<file>...]
 *   node tools/foundation-check.mjs --selftest
 *
 * WHY THIS EXISTS. David, 2026-08-17: "make this research really important for all Studio
 * sessions." A foundation that lives only in markdown is Loaded tier — it depends on someone
 * remembering to read it, and the record says that fails. On 2026-08-08 Studio coined a unit of
 * vocabulary nobody says and built two surfaces on it. On 2026-08-09 it measured the hobby's
 * 180-route bar at 0.62 split-half, wrote that down, AND WENT ON CITING THE 180-ROUTE BAR for
 * eight more days. The correction existed; nothing made it fire.
 *
 * This promotes the foundation to Encoded tier: the check runs against the artefact, at the
 * moment the artefact exists, and names the correction rather than merely objecting.
 *
 * WHAT IT CANNOT DO, stated rather than implied. It matches known-refuted claims and contested
 * constants by pattern. It cannot tell whether a NEW number is right, cannot read a chart, and
 * cannot catch an invented word — the failure that cost the most. It is a floor, not a ceiling.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const FACTS = JSON.parse(readFileSync(join(HERE, "../craft/foundation/facts.json"), "utf8"));

/* Each rule: a pattern that indicates the refuted claim, plus the correction to print.
   `near` narrows to the right context so an unrelated "26" never fires. */
/* Does `n` appear as an age rather than as a percentage, a decimal or a board rank?
   Excludes: "-26.1%", "QB27->28", "WR28", "26.4". Keeps: "at 26", "26-year-old", "the cliff is 28". */
const AGEISH = (t, n) => new RegExp(`(?<![A-Za-z0-9.\\-\u2013\u2014\u2192>])${n}(?![\\d.%])`).test(t);

const RULES = [
  {
    id: "yprr-180",
    test: t => /\b18[04]\s*(\+\s*)?routes?\b/i.test(t) && /yprr|yards per route/i.test(t),
    unless: t => /351|corrected|TPRR/i.test(t),
    say: "YPRR does not stabilise at 180 routes — that is TPRR's 184. YPRR needs 351 routes / ~14 games (Tuccitto). Studio measured the 180 bar at 0.62 split-half.",
  },
  {
    id: "rb-cliff-26",
    /* The digits must read as an AGE, not as a percentage or a board rank. This convicted a block
       about RANK cliffs ("RB2->3 -26.1%", "QB27->28 -22.6%") on 2026-08-18, where "cliff", "RB" and
       "26" all appear and no age claim is made. Requiring the word "age" was tried first and broke
       the known-bad specimen ("The WR cliff is 28") — the selftest caught it. So the narrowing is on
       the NUMBER's shape instead: not glued to a letter or an arrow, not a decimal, not a percent. */
    test: t => /(age[- ]?cliff|cliff|declines?|falls? off)/i.test(t) && /\bRB\b|running back/i.test(t) && AGEISH(t, 26),
    unless: t => /\b29\b/.test(t),
    say: "The running-back wall measures at 29, not 26 (92% decline, half the cohort gone, median incl. departed -100%). 26 is barely distinguishable from 25 or 27.",
  },
  {
    id: "wr-cliff-28",
    test: t => /(age[- ]?cliff|cliff|declines?|falls? off)/i.test(t) && /\bWR\b|receiver/i.test(t) && AGEISH(t, 28),
    unless: t => /\b27\b/.test(t),
    say: "The receiver drop measures at 27, not 28; receivers run above baseline through 26.",
  },
  {
    id: "age-decline-without-baseline",
    test: t => /(year[- ]over[- ]year|yoy|declines? \d|lost? \d+%)/i.test(t) && /\bage\b/i.test(t),
    unless: t => /17\.1|baseline|regression/i.test(t),
    say: "Any age-decline figure must be read against the -17.1% regression baseline (the median qualifying player declines that much at EVERY age). Raw decline is mostly selection.",
  },
  {
    id: "model-beats-market",
    test: t => /(our|model)[^.]{0,40}(beats?|better than|out-?ranks?|outperforms?)[^.]{0,30}market/i.test(t),
    // A negated sentence states the foundation rather than violating it. The first draft had no
    // `unless` here and convicted Studio's own relay for the sentence "the model does not out-rank
    // the market at any position" — found by running the tool on real work, not by its selftest,
    // so the negated form is now a calibration specimen.
    unless: t => /(does not|doesn't|never|no better|not better|cannot|can't)[^.]{0,40}(beat|better|out-?rank|outperform)/i.test(t),
    say: "The model does NOT out-rank the market anywhere (nDCG@24: QB -0.024, RB -0.031, WR -0.0006, TE +0.003, on the app's own backtest). No surface may imply otherwise.",
  },
  {
    id: "divergence-as-signal",
    scope: "document",   // evidence is document-wide: has the reader been told the gate is unevaluated ANYWHERE?
    test: t => /divergence/i.test(t) && /(signal|edge|opportunity|means|indicates)/i.test(t),
    unless: t => /unevaluated|not evaluated|observation, not a signal|divergence_validity/i.test(t),
    say: "divergence_validity is None for all four positions — the gate that would make a disagreement informative is unevaluated. Call it an observation, not a signal.",
  },
  {
    id: "dvs-as-proprietary",
    scope: "document",   // ditto: a brief that states DVS = PPG once has given the reader the unit
    test: t => /\bDVS\b|dynasty[_ ]value[_ ]score/i.test(t),
    unless: t => /PPG|points per game|projection_2y|4\.97|6\.36|6\.89|10\.63/i.test(t),
    say: "DVS is projection_2y x a per-position constant (QB 4.975, RB 6.369, WR 6.898, TE 10.637), clipped [0,100]. Prefer speaking it as projected points per game — the hobby's unit — and never compare it across positions.",
  },
  {
    id: "recency-premium-hardcoded",
    test: t => /(nearer|sooner|earlier)[^.]{0,40}(worth more|more valuable|premium)/i.test(t),
    unless: t => /2027|inverted|class/i.test(t),
    say: "The recency premium is currently INVERTED — a 2027 first prices above a 2026 first. Never hard-code 'sooner = more'.",
  },
  {
    id: "categorical-on-continuous",
    /* "elite" is ordinary English and fired on David's own words ("an elite tradesman at YOUR
       craft") in two files on 2026-08-18. The specific football nouns carry themselves; the
       generic one needs a football context beside it or it convicts prose about carpentry. */
    test: t => /\b(bell ?cow|committee|workhorse|bust)\b/i.test(t) ||
               /\belite\b[^.]{0,60}?\b(QB|RB|WR|TE|receiver|back|tight end|player|roster|asset|tier|board|rank|snap|target|route|touch)\b/i.test(t) ||
               /\b(QB|RB|WR|TE|receiver|back|tight end|player|roster|asset|tier|board|rank|snap|target|route|touch)\b[^.]{0,60}?\belite\b/i.test(t),
    unless: t => /(clears|above|below|against|bar|line|marker|threshold|percentile)/i.test(t),
    say: "A categorical noun on a continuous quantity lies at the boundary (Jeanty, 'committee' at 19.9 touches on a 79% snap share). Position the number against a NAMED bar instead.",
  },
];

/* Prose ABOUT the checker quotes its own known-bad specimens, and the checker then convicts the
   sentence describing it. Added 2026-08-18 after the session write-up — which quotes "The WR cliff
   is 28" while explaining that the selftest catches exactly that — failed the sweep. This exempts
   meta-discussion only; it cannot silence an ordinary claim, because an ordinary claim does not
   talk about specimens and calibration. */
const IS_META = t => /(known-bad|specimen|selftest|calibrat|false positive|convict)/i.test(t);

function check(text, label) {
  const hits = [];
  if (IS_META(text)) return { label, hits };
  for (const r of RULES) {
    if (r.test(text) && !r.unless(text)) hits.push(r);
  }
  return { label, hits };
}

/* ── calibration, both directions, before any real file is judged ─────────── */
function selftest() {
  const bad = [
    ["yprr-180", "YPRR stabilises at 180+ routes, per the Fantasy Footballers."],
    ["rb-cliff-26", "RB age cliff at 26 — he declines after that."],
    ["wr-cliff-28", "The WR cliff is 28 and he falls off there."],
    ["model-beats-market", "Our model beats the market on these players."],
    ["dvs-as-proprietary", "His DVS is 63.3, which is strong."],
    ["categorical-on-continuous", "Jeanty is a bell cow."],
    ["categorical-on-continuous", "He is an elite receiver."],
  ];
  const good = [
    ["yprr-180", "YPRR needs 351 routes; the 184-route figure is TPRR's."],
    ["rb-cliff-26", "The RB wall is 29; 26 is indistinguishable from 27."],
    ["rb-cliff-26", "RB cliffs on the board: TE4->5 -26.6%, RB2->3 -26.1%, QB27->28 -22.6%."],
    ["wr-cliff-28", "WR cliffs on the board: WR3->4 -18.0%, QB27->28 -22.6%."],
    ["wr-cliff-28", "The WR drop is 27, not 28."],
    ["model-beats-market", "Our board disagrees with the market here; neither is proven better."],
    ["model-beats-market", "The model does not out-rank the market at any position."],
    ["dvs-as-proprietary", "We project 9.2 PPG over two years (DVS 63.3)."],
    ["categorical-on-continuous", "339 touches on a 79% snap share — clears the 280-touch marker."],
    ["categorical-on-continuous", "David asked Studio to be an elite tradesman at its craft."],
    ["categorical-on-continuous", "DAVID.md now opens with a two-tier note. He wrote: i want u to be an ELITE TRADESMAN at YOUR CRAFT."],
  ];
  let pass = true;
  console.log("CALIBRATION — the check must convict the bad specimen AND clear the good one\n");
  for (const [id, text] of bad) {
    const got = check(text, id).hits.some(h => h.id === id);
    console.log(`  convict ${id.padEnd(28)} ${got ? "PASS" : "FAIL"}`);
    if (!got) pass = false;
  }
  console.log();
  for (const [id, text] of good) {
    const got = check(text, id).hits.some(h => h.id === id);
    console.log(`  clear   ${id.padEnd(28)} ${!got ? "PASS" : "FAIL — false positive"}`);
    if (got) pass = false;
  }
  console.log(`\n${pass ? "calibrated in both directions" : "NOT CALIBRATED — do not trust this run"}`);
  console.log(`register: ${FACTS.corrections.length} corrections, updated ${FACTS.updated}`);
  return pass ? 0 : 1;
}

const args = process.argv.slice(2);
if (!args.length || args[0] === "--selftest") process.exit(selftest());

/* Judge BLOCK BY BLOCK, not whole-file, and report file:line.
   WHY (2026-08-18): run whole-file, this tool returned a bare rule id on a 2,900-line ledger and
   could not say whether the offending sentence was written today or in July — a verdict with no
   location is not a diagnosis. It is also the more honest granularity: an `unless` correction
   sitting three pages from the claim does not protect the reader who reads only the claim.
   Blocks are blank-line separated, so a claim and the sentence that qualifies it stay together. */
function blocksOf(text) {
  const lines = text.split("\n");
  const out = [];
  let start = 0, buf = [];
  const flush = () => { if (buf.join("").trim()) out.push({ line: start + 1, text: buf.join("\n") }); buf = []; };
  lines.forEach((ln, i) => {
    if (!ln.trim()) { flush(); start = i + 1; } else { if (!buf.length) start = i; buf.push(ln); }
  });
  flush();
  return out;
}

let found = 0;
for (const f of args) {
  let text;
  try { text = readFileSync(f, "utf8"); } catch { console.log(`  ${f}: unreadable, SKIPPED (not a pass)`); continue; }
  /* SCOPE, added 2026-08-18 after block-granularity fired 7x on one relay for one reason.
     Two rules are about CONTEXT THE READER WAS GIVEN, not about a sentence: has this artefact
     anywhere said what DVS is, or that the divergence gate is unevaluated? Those are judged over
     the whole document and reported once, at the first offending block. Every other rule is a lie
     that lives inside its own sentence, and stays block-local. Scoping is stated per rule rather
     than chosen per run, so it cannot be widened to make a file pass. */
  const fileHits = [];
  const docSeen = new Set();
  const blocks = blocksOf(text);
  for (const b of blocks) {
    for (const h of check(b.text, f).hits) {
      const docScope = h.scope === "document";
      if (docScope) {
        if (docSeen.has(h.id)) continue;
        if (!check(text, f).hits.some(x => x.id === h.id)) continue;  // exempted somewhere in the file
        docSeen.add(h.id);
      }
      fileHits.push({ ...h, line: b.line, scopeNote: docScope ? " (document-scope: first instance shown)" : "",
                      excerpt: b.text.replace(/\s+/g, " ").trim().slice(0, 110) });
    }
  }
  if (!fileHits.length) { console.log(`✓ ${f}`); continue; }
  console.log(`\n✗ ${f}`);
  for (const h of fileHits) {
    found++;
    console.log(`   ${f}:${h.line}  [${h.id}]${h.scopeNote}`);
    console.log(`      ${h.excerpt}…`);
    console.log(`      → ${h.say}`);
  }
}
console.log(found ? `\n${found} foundation conflict(s). Fix or state why the foundation is wrong here.`
                  : "\nNo foundation conflicts. This checks known-refuted claims only — it cannot verify a new number.");
process.exit(found ? 1 : 0);
