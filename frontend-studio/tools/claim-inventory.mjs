#!/usr/bin/env node
/**
 * claim-inventory.mjs — enumerate the claims this product is in a position to make,
 * and test each one before any surface is designed around it.
 *
 * WHY THIS EXISTS. 2026-07-30 established that the only sentence worth surfacing is one
 * the product could be WRONG about — but that test was only ever run on finished pages.
 * Running it BEFORE building is the whole point, and it exposed that the test as written
 * is incomplete: "17 of your 23 agree" is falsifiable, could have come out otherwise, and
 * David rejected it flat ("not telling me anything"). What it lacks is a NAMED ENTITY.
 *
 * THE TEST, three parts, all required:
 *   1. WRONGABLE  — could the product turn out to be wrong about this? A count, a label,
 *                   a methodology note and a disclaimer all fail here.
 *   2. CONTINGENT — could it have come out otherwise? Measured, not asserted: recompute
 *                   the claim across all 12 teams (or all 4 rooms) and read the spread.
 *                   A quantity that is uniform by construction is not a claim about
 *                   anyone. (The 014 density-rail lesson, mechanised.)
 *   3. NAMED      — does it name a player, a room, or a team? Aggregate agreement
 *                   statistics fail here, and that is exactly the one he rejected.
 *
 * CALIBRATION IN BOTH DIRECTIONS. Two specimens with known verdicts are scored alongside
 * the candidates: KNOWN-GOOD "worst room in the league, three bodies" (David approved),
 * and KNOWN-BAD "17 of your 23 agree" (David rejected). If the battery ranks the known-bad
 * specimen well, the battery is wrong and nothing below it may be quoted.
 *
 * PROVENANCE is reported per claim but deliberately NOT scored — whether a claim needs
 * both lanes is an argument about uniqueness, not about whether the sentence is any good.
 *
 * Source: proposals/011-what-is-he/ladder-data.js — both boards ranked over ONLY the 337
 * players they share, which is mandatory before any model-vs-market comparison is drawn.
 *
 *   node tools/claim-inventory.mjs
 *   node tools/claim-inventory.mjs --json
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const g = { window: {} };
new Function('window', readFileSync(resolve(here, '../proposals/011-what-is-he/ladder-data.js'), 'utf8'))(g.window);
const L = g.window.LADDER;

const ORDER = ['QB', 'RB', 'WR', 'TE'];
const ME = 'Dleess';
const all = ORDER.flatMap((pos) => L.positions[pos].players.map((p) => ({ ...p, pos })));
const owners = [...new Set(all.map((p) => p.owner))].filter(Boolean);

/* THE SIGN CONVENTION, PINNED. gap = mrank - drank, so a NEGATIVE gap means the market's
   rank number is smaller — the market rates him BETTER and our board is LOWER on him.
   This was inverted in the first run of this file and produced a confident, wrong sentence
   about a real person's roster. It is asserted against a known specimen rather than
   commented, because a comment cannot fail. */
{
  const burden = all.find((p) => p.name === 'Luther Burden');
  if (!burden) throw new Error('sign-convention specimen missing — cannot trust any gap claim');
  if (burden.gap !== burden.mrank - burden.drank) throw new Error('gap is not mrank-drank; every claim below is suspect');
  if (!(burden.mrank < burden.drank && burden.gap < 0)) throw new Error('sign convention broken: negative gap must mean OUR BOARD LOWER');
}
const OURS_HIGHER = (g) => g > 0; // our rank number smaller than market's

/* ---------------------------------------------------------------- helpers */

/** Coefficient of variation across a set of values — the contingency measure.
 *  A claim recomputed across every team should VARY; if it does not, the claim is
 *  true of everyone and therefore about no one. Reported alongside min/max so a
 *  low spread can be read rather than merely scored. */
function spread(values) {
  const v = values.filter((x) => Number.isFinite(x));
  if (v.length < 2) return { cv: 0, min: 0, max: 0, mean: 0, n: v.length };
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / v.length);
  return { cv: mean === 0 ? 0 : sd / Math.abs(mean), min: Math.min(...v), max: Math.max(...v), mean, n: v.length };
}

/** Players a given owner holds at a position. */
const roomOf = (owner, pos) => L.positions[pos].players.filter((p) => p.owner === owner);

/** How many of an owner's players at a position sit inside the number that actually
 *  start league-wide each week — this league's lineup, not the top-12 convention. */
const insideStarts = (owner, pos, lane) =>
  roomOf(owner, pos).filter((p) => p[lane] <= L.positions[pos].weekly_starts).length;

/** Rank of an owner's room among the 12, 1 = best. Ties share the better rank. */
function roomRank(pos, lane, scoreFn) {
  const scored = owners.map((o) => ({ o, s: scoreFn(o, pos, lane) }));
  scored.sort((a, b) => b.s - a.s);
  const out = {};
  let last = null, lastRank = 0;
  scored.forEach((row, i) => {
    if (row.s !== last) { lastRank = i + 1; last = row.s; }
    out[row.o] = lastRank;
  });
  return { rankOf: out, scored };
}

/** Total market value of an owner's shared-population players. */
const teamValue = (owner) => all.filter((p) => p.owner === owner).reduce((a, p) => a + (p.value || 0), 0);

/* A rank-space score for a room that does not lean on DVS. DVS saturates at 100 with
   large ties, so summing it invents precision the model does not make; rank does not
   have that problem. Score = sum over held players of (pool size - rank + 1), i.e.
   depth-weighted standing, on whichever lane is asked for. */
const roomScore = (owner, pos, lane) =>
  roomOf(owner, pos).reduce((a, p) => a + (L.positions[pos].n - p[lane] + 1), 0);

/* ---------------------------------------------------------------- candidates */

const claims = [];
const add = (c) => claims.push(c);

/* ---- CALIBRATION SPECIMENS (known verdicts) ---------------------------- */

{
  // KNOWN-GOOD. David approved this line on 006.
  const r = roomRank('TE', 'drank', roomScore);
  const mine = roomOf(ME, 'TE');
  add({
    id: 'CAL-GOOD',
    calibration: 'KNOWN-GOOD (David approved, 006)',
    rung: '1 where do I stand',
    text: `Your TE room is ${r.rankOf[ME]}th of 12 on our board — ${mine.length} bodies.`,
    wrongable: true,
    named: 'room (TE)',
    contingency: spread(r.scored.map((s) => s.s)),
    needs: 'our board + league ownership',
  });

  // KNOWN-BAD. David rejected this line on 014 the same evening: "not telling me anything".
  const comparable = all.filter((p) => p.owner === ME);
  const agree = comparable.filter((p) => Math.abs(p.gap) <= 5).length;
  add({
    id: 'CAL-BAD',
    calibration: 'KNOWN-BAD (David rejected, 014)',
    rung: '2 what do I hold',
    text: `${agree} of your ${comparable.length} players agree between the two boards.`,
    wrongable: true,
    named: null,
    contingency: spread(owners.map((o) => all.filter((p) => p.owner === o && Math.abs(p.gap) <= 5).length)),
    needs: 'both lanes',
  });
}

/* ---- RUNG 1 — where do I stand ---------------------------------------- */

for (const pos of ORDER) {
  const r = roomRank(pos, 'drank', roomScore);
  const rm = roomRank(pos, 'mrank', roomScore);
  /* HOW MUCH OF THE ROOM OUR BOARD ACTUALLY RESOLVES. DVS saturates, so ties compress our
     ranks and a room score built on them borrows precision the model does not have. TE is
     the exposed case (78%); it is disclosed per claim rather than averaged away. */
  const P = L.positions[pos];
  const resolution = new Set(P.players.map((p) => p.drank)).size / P.n;
  const tiedTop = r.scored.filter((s) => s.s === r.scored[0].s).length;
  add({
    id: `R1-ROOM-${pos}`,
    rung: '1 where do I stand',
    text: `Your ${pos} room ranks ${r.rankOf[ME]}/12 on our board and ${rm.rankOf[ME]}/12 on the market's.`,
    wrongable: true,
    named: `room (${pos})`,
    unique: tiedTop === 1,
    contingency: spread(r.scored.map((s) => s.s)),
    needs: 'our board + league ownership',
    detail: { ours: r.rankOf[ME], market: rm.rankOf[ME], held: roomOf(ME, pos).length, ourBoardResolves: `${(resolution * 100).toFixed(0)}%` },
    caveat: resolution < 0.9 ? `our board resolves only ${(resolution * 100).toFixed(0)}% of this room (DVS ties)` : null,
  });
}

{
  // Starters you can field today vs what you are building with — 006's approved verdict shape.
  const startersNow = ORDER.reduce((a, pos) => a + insideStarts(ME, pos, 'drank'), 0);
  const byOwner = owners.map((o) => ({
    o,
    now: ORDER.reduce((a, pos) => a + insideStarts(o, pos, 'drank'), 0),
    age: (() => {
      const mine = all.filter((p) => p.owner === o && Number.isFinite(p.age));
      return mine.length ? mine.reduce((a, p) => a + p.age, 0) / mine.length : NaN;
    })(),
  }));
  byOwner.sort((a, b) => b.now - a.now);
  const myRank = byOwner.findIndex((x) => x.o === ME) + 1;
  add({
    id: 'R1-PHASE',
    rung: '1 where do I stand',
    text: `You are ${myRank}/12 in players who start weekly on our board (${startersNow}).`,
    wrongable: true,
    named: 'your team',
    contingency: spread(byOwner.map((x) => x.now)),
    needs: 'our board + league ownership',
  });
}

/* ---- RUNG 2 — what do I hold ------------------------------------------ */

{
  // 014's surviving one-sentence top: the market starts players weekly that we do not.
  const split = all.filter((p) => p.owner === ME && p.mrank <= L.positions[p.pos].weekly_starts && p.drank > L.positions[p.pos].weekly_starts);
  add({
    id: 'R2-STARTSPLIT',
    rung: '2 what do I hold',
    text: `The market has ${split.length} of your players in a weekly starting slot that our model does not: ${split.map((p) => p.name.split(' ').slice(-1)).join(', ')}.`,
    wrongable: true,
    named: split.map((p) => p.name).join(', ') || null,
    contingency: spread(owners.map((o) => all.filter((p) => p.owner === o && p.mrank <= L.positions[p.pos].weekly_starts && p.drank > L.positions[p.pos].weekly_starts).length)),
    needs: 'both lanes',
  });

  // The single widest disagreement on his roster, named.
  const mine = all.filter((p) => p.owner === ME);
  const worst = [...mine].sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))[0];
  add({
    id: 'R2-WIDEST',
    rung: '2 what do I hold',
    text: `${worst.name}: market ${worst.pos}${worst.mrank}, our board ${worst.pos}${worst.drank} — ${Math.abs(worst.gap)} ranks apart, the widest split you hold.`,
    wrongable: true,
    named: worst.name,
    contingency: spread(mine.map((p) => Math.abs(p.gap))),
    needs: 'both lanes',
  });
}

/* ---- RUNG 3 — what should I do (trade fit) ---------------------------- */

{
  /* Surplus and need, measured in the same unit for every team: players inside the weekly
     starting cut, minus the slots this league actually starts at that position. A team
     with more startable bodies than slots has tradeable surplus; fewer, a hole. Our board
     decides who is startable — which is the whole juxtaposition. */
  const slots = { QB: L.league.lineup.QB, RB: L.league.lineup.RB, WR: L.league.lineup.WR, TE: L.league.lineup.TE };
  const shape = {};
  for (const o of owners) shape[o] = Object.fromEntries(ORDER.map((pos) => [pos, insideStarts(o, pos, 'drank') - slots[pos]]));

  const myShape = shape[ME];
  const myNeeds = ORDER.filter((p) => myShape[p] < 0);
  const mySurplus = ORDER.filter((p) => myShape[p] > 0);

  // Complementarity: a partner whose surplus covers your need AND whose need your surplus covers.
  const fits = owners.filter((o) => o !== ME).map((o) => {
    const covers = myNeeds.filter((p) => shape[o][p] > 0);
    const wants = mySurplus.filter((p) => shape[o][p] < 0);
    return { o, covers, wants, score: covers.length + wants.length };
  }).sort((a, b) => b.score - a.score);

  /* A TIE MUST RENDER AS A TIE. The first run of this file printed "MJLeess318 is your
     cleanest fit" when three teams scored identically and array order chose the winner —
     false precision in the most authoritative cell, the same defect caught on 014 and
     rendered there as "1-11". Uniqueness is now measured and reported. */
  const topScore = fits.length ? fits[0].score : 0;
  const tiedTop = fits.filter((f) => f.score === topScore);
  add({
    id: 'R3-FIT',
    rung: '3 what should I do',
    text: !topScore
      ? `No team in this league has a surplus matching your need.`
      : tiedTop.length === 1
        ? `${tiedTop[0].o} is your cleanest fit: surplus at ${tiedTop[0].covers.join('/') || '—'} where you are short.`
        : `${tiedTop.length} teams tie as your cleanest fit (${tiedTop.map((f) => f.o).join(', ')}) — this measure does not separate them.`,
    wrongable: true,
    named: topScore ? tiedTop.map((f) => f.o).join(', ') : null,
    unique: tiedTop.length === 1,
    contingency: spread(fits.map((f) => f.score)),
    needs: 'our board + league ownership',
    detail: { myNeeds, mySurplus, tiedAtTop: tiedTop.length, scores: fits.map((f) => `${f.o}:${f.score}`) },
  });

  /* THE UNASKED ONE. Apply the two-lane comparison to ROSTERS rather than players:
     whose team does our board price differently from the market's? No other product can
     ask this — KTC and FantasyCalc rank players and have no second board to disagree with. */
  /* Sorted DESCENDING so index 0 is the team our board is HIGHEST on — see the pinned
     sign convention at the head of this file. The first run had this backwards. */
  const teamDiv = owners.map((o) => {
    const held = all.filter((p) => p.owner === o);
    /* Gaps are pool-normalised before being averaged across positions: 36 ranks among 45
       QBs and 36 among 140 WRs are not the same magnitude, and using raw ranks reordered
       the teams (Spearman 0.83 against the normalised order — kgelardi moved 1st to 5th).
       Per-player prose still speaks raw positional rank, which is the hobby's unit. */
    const meanGap = held.length ? held.reduce((a, p) => a + (100 * p.gap) / L.positions[p.pos].n, 0) / held.length : 0;
    const aged = held.filter((p) => Number.isFinite(p.age));
    return {
      o, meanGap, n: held.length,
      val: held.reduce((a, p) => a + (p.value || 0), 0),
      age: aged.length ? aged.reduce((a, p) => a + p.age, 0) / aged.length : NaN,
    };
  }).sort((a, b) => b.meanGap - a.meanGap);
  const hi = teamDiv[0], lo = teamDiv[teamDiv.length - 1];
  if (!OURS_HIGHER(hi.meanGap) && OURS_HIGHER(lo.meanGap)) throw new Error('team divergence ordering contradicts the pinned sign convention');

  /* THE ARTIFACT TEST THAT MATTERS HERE. Tonight's rank-boundary finding killed a
     disagreement gradient that was really a proxy for player value, so this quantity is
     checked against the obvious confounders before it is allowed to speak: if team mean
     gap merely tracks how good or how large a roster is, it is not a second opinion. */
  const corr = (a, b) => {
    const ma = a.reduce((x, y) => x + y, 0) / a.length, mb = b.reduce((x, y) => x + y, 0) / b.length;
    const num = a.map((x, i) => (x - ma) * (b[i] - mb)).reduce((x, y) => x + y, 0);
    const den = Math.sqrt(a.map((x) => (x - ma) ** 2).reduce((x, y) => x + y, 0) * b.map((x) => (x - mb) ** 2).reduce((x, y) => x + y, 0));
    return den === 0 ? 0 : num / den;
  };
  /* THE CONFOUNDER LIST IS NOT MINE TO INVENT. The first run of this file tested team
     value (0.008) and roster size (-0.074), pronounced the claim independent, and never
     tested AGE — which is the confounder David established on 2026-07-22 ("a raw
     model-vs-market gap sort is mostly an age sort; our buy-low list came out as
     30-35-year-olds"). It reads 0.771 at team level and the claim did not survive it.
     Every confounder this engagement has already paid to learn is checked here by name. */
  const gaps = teamDiv.map((t) => t.meanGap);
  const confounds = {
    vsTeamValue: corr(gaps, teamDiv.map((t) => t.val)),
    vsRosterSize: corr(gaps, teamDiv.map((t) => t.n)),
    vsTeamAge: corr(gaps, teamDiv.map((t) => t.age)),   // DAVID.md 2026-07-22
  };
  const independent = Math.max(...Object.values(confounds).map(Math.abs)) < 0.3;
  const worstConfound = Object.entries(confounds).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];

  add({
    id: 'R3-TEAMDIV',
    rung: '3 what should I do',
    text: independent
      ? `Our board is highest on ${hi.o}'s roster relative to the market (mean ${hi.meanGap > 0 ? '+' : ''}${hi.meanGap.toFixed(1)}% of pool) and lowest on ${lo.o}'s (${lo.meanGap.toFixed(1)}%).`
      : `NO CLAIM AVAILABLE — team divergence tracks ${worstConfound[0]} at r=${worstConfound[1].toFixed(2)}; it restates a fact available without this product.`,
    wrongable: independent,
    named: independent ? `${hi.o} / ${lo.o}` : null,
    unique: true,
    independent,
    contingency: spread(gaps),
    needs: 'both lanes + league ownership',
    detail: { confounds: Object.fromEntries(Object.entries(confounds).map(([k, v]) => [k, +v.toFixed(3)])), order: teamDiv.map((t) => `${t.o}:${t.meanGap > 0 ? '+' : ''}${t.meanGap.toFixed(1)}`) },
  });
}

/* ---- RUNG 4 — what is changing ---------------------------------------- */

{
  /* The model is silent on 92% of mornings (016), so over 30 days our rank is very nearly
     constant and 30-day MARKET movement is, to that approximation, movement in the
     disagreement itself. That is the juxtaposition David requires of a change surface,
     and it is available only because the model is static — stated as the assumption it is. */
  const isToward = (p) => (p.gap > 0 && p.trend30 < 0) || (p.gap < 0 && p.trend30 > 0);
  const mine = all.filter((p) => p.owner === ME && Number.isFinite(p.trend30));
  const toward = mine.filter(isToward);

  /* THE CHANCE TEST. "The market is coming round to our view" is the most seductive
     sentence this product could say, so it gets the hardest test: what does chance alone
     predict, and does the league-wide population beat it? Measured across every shared
     player, not only the 23 on his roster, because n=23 cannot separate 61% from a coin. */
  const pop = all.filter((p) => Number.isFinite(p.trend30) && p.gap !== 0 && p.trend30 !== 0);
  const popToward = pop.filter(isToward).length;
  const popRate = popToward / pop.length;
  const sd = Math.sqrt(0.25 / pop.length);
  const z = (popRate - 0.5) / sd;
  const beatsChance = z > 2;

  const biggest = [...mine].sort((a, b) => Math.abs(b.trend30) - Math.abs(a.trend30))[0];
  add({
    id: 'R4-CONVERGE',
    rung: '4 what is changing',
    text: beatsChance
      ? `The market moved toward our view on ${(popRate * 100).toFixed(0)}% of players in 30 days.`
      : `NO CLAIM AVAILABLE — the market moved toward our view on ${(popRate * 100).toFixed(1)}% of ${pop.length} players, which is not distinguishable from chance (z=${z.toFixed(2)}).`,
    wrongable: beatsChance,
    named: beatsChance ? biggest.name : null,
    unique: true,
    beatsChance,
    contingency: spread(mine.map((p) => p.trend30)),
    needs: 'both lanes + 30d market history',
    detail: { rosterToward: `${toward.length}/${mine.length}`, leagueToward: `${popToward}/${pop.length}`, z: +z.toFixed(2) },
  });
}

/* ---------------------------------------------------------------- scoring */

const CV_FLOOR = 0.15; // below this, the quantity barely varies across the population

/* The fourth gate is not part of the original three-part test — it was added after the
   first run passed 11 of 11 candidates, which is a battery that is not discriminating.
   SOUND = every artifact test this particular claim was subjected to came back clean.
   A claim that was never subjected to one is not credited for passing it. */
for (const c of claims) {
  const artifacts = ['unique', 'beatsChance', 'independent'].filter((k) => k in c);
  c.artifactsRun = artifacts;
  c.pass = {
    wrongable: !!c.wrongable,
    contingent: c.contingency.cv >= CV_FLOOR,
    named: !!c.named,
    sound: artifacts.every((k) => c[k] !== false),
  };
  c.score = Object.values(c.pass).filter(Boolean).length;
}

/* ---------------------------------------------------------------- report */

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(claims, null, 2));
} else {
  const good = claims.find((c) => c.id === 'CAL-GOOD');
  const bad = claims.find((c) => c.id === 'CAL-BAD');
  console.log('\n=== CALIBRATION — read this before anything below it ===');
  console.log(`  KNOWN-GOOD (approved)  ${good.score}/4  ${JSON.stringify(good.pass)}`);
  console.log(`  KNOWN-BAD  (rejected)  ${bad.score}/4  ${JSON.stringify(bad.pass)}`);
  const valid = good.score > bad.score;
  console.log(`  battery separates them: ${valid ? 'YES' : 'NO — DO NOT QUOTE ANYTHING BELOW'}`);
  const perfect = claims.filter((c) => c.score === 4).length;
  console.log(`  candidates at full marks: ${perfect}/${claims.length}` +
    (perfect === claims.length ? '  <-- A BATTERY THAT PASSES EVERYTHING IS NOT A TEST' : '') + '\n');

  console.log('=== CLAIM INVENTORY ===\n');
  for (const c of [...claims].sort((a, b) => b.score - a.score)) {
    const f = [];
    if (!c.pass.wrongable) f.push('not-wrongable');
    if (!c.pass.contingent) f.push(`flat(cv=${c.contingency.cv.toFixed(2)})`);
    if (!c.pass.named) f.push('unnamed');
    if (!c.pass.sound) f.push(`artifact:${['unique', 'beatsChance', 'independent'].filter((k) => c[k] === false).join('/')}`);
    console.log(`[${c.score}/4] ${c.id}  (${c.rung})${c.calibration ? '  << ' + c.calibration : ''}`);
    console.log(`      "${c.text}"`);
    console.log(`      cv=${c.contingency.cv.toFixed(2)} range=${c.contingency.min.toFixed(1)}..${c.contingency.max.toFixed(1)} | needs: ${c.needs}`);
    console.log(`      artifact tests run: ${c.artifactsRun.length ? c.artifactsRun.join(', ') : 'NONE — untested, not credited'}${f.length ? ' | FAILS: ' + f.join(', ') : ''}`);
    if (c.caveat) console.log(`      CAVEAT: ${c.caveat}`);
    if (c.detail) console.log(`      detail: ${JSON.stringify(c.detail)}`);
    console.log();
  }
}
