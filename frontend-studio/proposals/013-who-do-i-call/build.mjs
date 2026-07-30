#!/usr/bin/env node
/**
 * Build the 013 call sheet from the measured league-activity dataset.
 *
 *   node proposals/013-who-do-i-call/build.mjs
 *
 * GENERATED, NEVER TRANSCRIBED. Every figure on the surface is computed here from
 * analysis/league-activity.json, so a prose number cannot drift away from the data
 * behind it — the defect that put three wrong figures on 012 before they were
 * caught.
 *
 * WHAT IS DELIBERATELY NOT HERE: a composite "call score". Ranking partners by one
 * blended number is the failure David named on 2026-07-24 — an option cannot be
 * represented by its average, and every attempt collapsed the thing that mattered.
 * Partners are grouped by a CATEGORICAL truth (what they historically pay in) and
 * ordered inside each band by a single real observable (deals per season). The
 * reader does the weighing; the sheet does the assembling.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const D = JSON.parse(readFileSync(resolve(ROOT, 'analysis/league-activity.json'), 'utf8'));

/* Two different dates, and conflating them is a defect. CAPTURED is when the
 * league data was pulled; TODAY is when the reader is looking. The first draft
 * printed "It is Jul 28" from the capture date, which quietly told the reader the
 * wrong day and hid the artifact's age — the thing David called a defect rather
 * than a caveat on 2026-07-15. */
const CAPTURED = D.measured_at.slice(0, 10);
const TODAY = new Date().toISOString().slice(0, 10);
const days = (iso) => Math.round((new Date(TODAY) - new Date(iso)) / 864e5);

const profiles = D.lanes.profiles;
const me = profiles.find((p) => p.is_you);
const mgr = new Map(D.managers.map((m) => [m.roster_id, m]));

/* --- the timing verdict ---------------------------------------------------- */
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const cal = monthNames.map((name, i) => {
  const row = D.calendar[i] || {};
  return { name, trades: row.trades ?? row.count ?? 0 };
});
const thisMonth = new Date(TODAY).getMonth();
const dead = D.calendar_summary.zero_trade_months;
const openMonth = 8;                                  // September, the season window
const nextOpen = `${new Date(TODAY).getFullYear()}-09-05`;

/* --- what each partner pays in -------------------------------------------- */
/* pick_appetite is the share of what a manager RECEIVED that was picks. Low means
 * he takes players and hands over picks — which is precisely what a rebuilder
 * accumulating picks needs on the other end of the phone. It is a proportion, so
 * a thin denominator is a real limit: n is carried onto the surface and marks
 * built on fewer than 4 deals are drawn as provisional rather than quietly
 * treated as equal evidence. */
const BAND = (p) => {
  if (!p.trades || p.trades === 0) return 'silent';
  if (days(p.last_trade) > 400) return 'silent';
  if (p.pick_appetite === null) return 'silent';
  if (p.pick_appetite < 0.4) return 'pays_picks';
  return 'wants_picks';
};

const partners = profiles.filter((p) => !p.is_you).map((p) => {
  const m = mgr.get(p.roster_id) || {};
  const withYou = (p.events || []).filter((e) => /Woodbury/.test(e.with || '')).length;
  const lastWithYou = (p.events || []).filter((e) => /Woodbury/.test(e.with || '')).slice(-1)[0] || null;
  return {
    team: p.team,
    former: (p.former_names || []).map((s) => s.trim()).filter(Boolean),
    joined: p.joined,
    seasons: p.seasons_in_league,
    trades: p.trades,
    perSeason: p.trades_per_season,
    appetite: p.pick_appetite,
    netPicks: p.net_picks,
    picksIn: p.picks_in,
    picksOut: p.picks_out,
    inSeasonShare: p.in_season_share,
    lastTrade: p.last_trade,
    lastTradeDays: p.last_trade ? days(p.last_trade) : null,
    withYou,
    lastWithYou: lastWithYou ? { date: lastWithYou.date, summary: lastWithYou.summary } : null,
    appRank: m.app_partner_rank ?? null,
    appPosture: m.app_posture ?? null,
    moves2026: m.moves_2026 ?? null,
    band: BAND(p),
    thin: (p.trades || 0) < 4,
    recent: (p.events || []).slice(-3).reverse().map((e) => ({ date: e.date, summary: e.summary, took: e.took })),
  };
});

const order = { pays_picks: 0, wants_picks: 1, silent: 2 };
partners.sort((a, b) => (order[a.band] - order[b.band]) || (b.perSeason - a.perSeason));

/* --- the disagreement with the app's own ranking --------------------------- */
/* This is the surface's juxtaposition: ours-versus-the-app, in rank space. The
 * app publishes a trade-partner ranking; the transaction record disagrees with it
 * in named, checkable places. */
const disagreements = partners
  .filter((p) => p.appRank !== null)
  .map((p) => ({ team: p.team, appRank: p.appRank, band: p.band, trades: p.trades, lastTradeDays: p.lastTradeDays }))
  .filter((p) => (p.band === 'silent' && p.appRank <= 5) || (p.band === 'pays_picks' && p.appRank >= 9));

const payload = {
  today: TODAY,
  captured: CAPTURED,
  captureAgeDays: days(CAPTURED),
  you: {
    team: me.team, appetite: me.pick_appetite, netPicks: me.net_picks,
    picksIn: me.picks_in, picksOut: me.picks_out,
    playersOut: me.players_out, playersIn: me.players_in,
    trades: me.trades, perSeason: me.trades_per_season,
  },
  calendar: cal,
  thisMonth,
  openMonth,
  deadMonths: dead,
  nextOpen,
  daysToOpen: Math.max(0, -days(nextOpen)),
  inseasonShare: D.calendar_summary.inseason_share,
  inseasonCI: D.calendar_summary.inseason_ci95,
  totalTrades: D.totals.trades_4_seasons,
  partners,
  disagreements,
  caveats: D.caveats || null,
};

const tpl = readFileSync(resolve(HERE, 'template.html'), 'utf8');
const MARK = '/*__DATA__*/null';
if (!tpl.includes(MARK)) throw new Error(`marker ${MARK} missing from template`);
const out = resolve(HERE, 'prototype.html');
writeFileSync(out, tpl.replace(MARK, JSON.stringify(payload)));

console.log(`wrote ${out}`);
console.log(`  today ${TODAY} · ${payload.daysToOpen} days to the September window`);
console.log(`  bands: ${['pays_picks', 'wants_picks', 'silent'].map((b) =>
  `${b} ${partners.filter((p) => p.band === b).length}`).join(' · ')}`);
console.log(`  app-ranking disagreements: ${disagreements.length ? disagreements.map((d) =>
  `${d.team} #${d.appRank}`).join(', ') : 'none'}`);
