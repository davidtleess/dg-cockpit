#!/usr/bin/env node
/**
 * Builds data.js for 014 "What you hold".
 *
 * SOURCE: proposals/011-what-is-he/ladder-data.js — both lanes already ranked over
 * ONLY the 337 players they SHARE, which the 2026-07-26 finding makes mandatory
 * before any model-vs-market comparison is drawn. Nothing is re-ranked here.
 *
 * Every figure that reaches the surface is COMPUTED here and injected, never typed
 * into the HTML — the 2026-07-28 rule after a prose figure drifted out of sync
 * with its own dataset.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../011-what-is-he/ladder-data.js');
const g = { window: {} };
new Function('window', readFileSync(src, 'utf8'))(g.window);
const L = g.window.LADDER;

const ORDER = ['QB', 'RB', 'WR', 'TE'];

/* The league's own lineup, read from the source rather than assumed
   (2026-07-27: QB1 RB2 WR2 TE1 FLEX2 SUPER_FLEX1 BN11, 12 teams). */
const lineup = L.league.lineup;

const groups = ORDER.map((pos) => {
  const P = L.positions[pos];
  const pool = P.players;
  const mine = pool.filter((p) => p.mine).sort((a, b) => a.drank - b.drank);

  /* The pool's rank density, as an AGGREGATE band rather than countable marks:
     a mark standing for one real entity must be able to name it, so the
     background population is deliberately drawn as a continuous density and
     never as N anonymous ticks. */
  const bins = 60;
  const dens = new Array(bins).fill(0);
  for (const p of pool) {
    const i = Math.min(bins - 1, Math.floor(((p.drank - 1) / P.n) * bins));
    dens[i]++;
  }
  const maxDens = Math.max(...dens);

  /* Ties in OUR lane are real and must render as ties — DVS saturates at 100.0
     and 23 players league-wide sit exactly there (2026-07-27 capability fact). */
  const tieSpans = {};
  for (const p of mine) {
    if (p.tie > 1) {
      const same = pool.filter((q) => q.drank === p.drank);
      tieSpans[p.id] = { lo: p.drank, hi: p.drank + same.length - 1, n: p.tie };
    }
  }

  /* THE THESIS LAYER. A group header must carry an argument about HIS roster, not
     only the league's structure — "does it carry a thesis about the user's
     situation, or merely display his data?" (David, 2026-07-22). Everything here
     is computed and stable: an ORDERING rule, never prose that picks a new subject
     each day, which is the 2026-07-21 instrument-don't-editorialise line. */
  const best = mine.length ? mine.reduce((a, b) => (a.drank <= b.drank ? a : b)) : null;
  const aboveReplOurs = mine.filter((p) => p.drank <= P.replacement).length;
  const aboveReplMkt = mine.filter((p) => p.mrank <= P.replacement).length;
  /* "Startable" here means inside the number that actually start league-wide each
     week at this position — derived from THIS league's lineup, not the naive
     top-12 naming convention (2026-07-27). */
  const insideStartsOurs = mine.filter((p) => p.drank <= P.weekly_starts).length;
  const insideStartsMkt = mine.filter((p) => p.mrank <= P.weekly_starts).length;

  /* NAMED NEIGHBOURS. A rank is abstract; the players either side of it are not.
     David confirmed naming tier-mates as "a great call" (2026-07-15) and the
     standing bar on detail space is that it must let him conclude something the
     row did not — age and market value were already ON the row, so they were
     restatement dressed as depth. */
  const byOurs = [...pool].sort((a, b) => a.drank - b.drank);
  const byMkt = [...pool].sort((a, b) => a.mrank - b.mrank);
  const around = (arr, key, p) => {
    const i = arr.findIndex((q) => q.id === p.id);
    return [i - 1, i + 1]
      .filter((j) => j >= 0 && j < arr.length)
      .map((j) => ({ name: arr[j].name, rank: arr[j][key], above: j < i, mine: arr[j].mine }));
  };

  return {
    pos,
    n: P.n,
    held: mine.length,
    thesis: best && {
      bestName: best.name,
      bestOurs: best.drank,
      bestMkt: best.mrank,
      bestTied: best.tie > 1 ? best.tie : 0,
      aboveReplOurs, aboveReplMkt,
      insideStartsOurs, insideStartsMkt,
    },
    weeklyStarts: P.weekly_starts,
    replacement: P.replacement,
    ceilingTies: P.ceiling_ties,
    blocks: P.blocks,
    density: dens.map((d) => d / maxDens),
    players: mine.map((p) => ({
      id: p.id, name: p.name, age: p.age, value: p.value,
      drank: p.drank, mrank: p.mrank, dtier: p.dtier, mtier: p.mtier,
      dgrade: p.dgrade, mgrade: p.mgrade, dvs: p.dvs, tie: p.tie,
      trend30: p.trend30, gap: p.gap,
      tieSpan: tieSpans[p.id] || null,
      nbOurs: around(byOurs, 'drank', p),
      nbMkt: around(byMkt, 'mrank', p),
    })),
  };
});

/* Absence must render as MISSING, never as zero: the roster carries 27 players
   and only those present in BOTH lanes can be compared at all. */
const held = groups.reduce((s, x) => s + x.held, 0);

const out = {
  generated_from: L.generated_from,
  league: { teams: L.league.teams, lineup, starters: L.league.starters_per_team },
  shared: L.shared,
  marketOnly: L.market_only,
  modelOnly: L.model_only,
  rosterSize: 27,
  held,
  absent: 27 - held,
  groups,
};

writeFileSync(join(here, 'data.js'), 'window.HOLD = ' + JSON.stringify(out, null, 1) + ';\n');

console.log(`014 data built — ${held} of ${out.rosterSize} comparable, ${out.absent} absent`);
for (const g2 of groups)
  console.log(
    `  ${g2.pos}  held ${String(g2.held).padStart(2)}  pool ${String(g2.n).padStart(3)}` +
      `  starts ${g2.weeklyStarts}  replacement ${g2.replacement}  ceiling-ties ${g2.ceilingTies}`
  );
