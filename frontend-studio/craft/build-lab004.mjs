#!/usr/bin/env node
/* Builds craft/lab-004-the-claim-and-the-crossing.html from the real 014 data
   file. Numbers are COMPUTED here, never transcribed (CLAUDE.md principle 13). */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

global.window = {};
new Function(readFileSync(join(root, 'proposals/014-what-you-hold/data.js'), 'utf8'))
  .call(globalThis);
const HOLD = globalThis.window.HOLD;

const WR = HOLD.groups.find((g) => g.pos === 'WR');
const rows = (WR.players || WR.rows).map((p) => ({
  name: p.name, ours: p.drank, mkt: p.mrank, gap: p.gap,
  age: p.age, value: p.value, dtier: p.dtier, mtier: p.mtier,
  tieSpan: p.tieSpan,
}));
const N = WR.n;                       // 140 ranked receivers
const STARTS = WR.weeklyStarts;       // 24 start in a given week
const REPL = WR.replacement;          // replacement level

/* The highlight rule, computed and then STATED on the surface — the device the
   reference site uses that Studio has never used: say why a thing is highlighted. */
const NAMED = 3;
const byGap = [...rows].sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
const named = new Set(byGap.slice(0, NAMED).map((r) => r.name));

/* ---- geometry ---------------------------------------------------------
   VIEWBOX WIDTH IS THE DEFECT CONTROL. An SVG with width:100% scales its whole
   coordinate system, so a viewBox wider than the column silently shrinks every
   label below the type floor. 560 is the usable width of one panel at 1280
   (1280 - 64 page padding - 26 gap) / 2 - 36 panel padding. Keep them equal and
   the chart renders 1:1. This is the "all the visuals are very small" defect
   (David, 2026-07-23) and it is a geometry bug, not a taste call. */
const VB_W = 680;
const H = 560, PAD_T = 36, PAD_B = 30;
const plotH = H - PAD_T - PAD_B;
const y = (rank) => PAD_T + ((rank - 1) / (N - 1)) * plotH;
const LX = 232, RX = 486;              // the two shared scales

const maxGap = Math.max(...rows.map((r) => Math.abs(r.gap)));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---- the slope chart --------------------------------------------------- */
const slopeLines = rows.map((r) => {
  const y1 = y(r.ours), y2 = y(r.mkt);
  const hot = named.has(r.name);
  const w = 1 + (Math.abs(r.gap) / maxGap) * 2;           // length carries nothing; weight ranks
  const op = hot ? 0.95 : 0.3 + (Math.abs(r.gap) / maxGap) * 0.25;
  return `<line x1="${LX}" y1="${y1.toFixed(1)}" x2="${RX}" y2="${y2.toFixed(1)}"
      stroke="var(--line)" stroke-width="${w.toFixed(2)}" opacity="${op.toFixed(2)}"
      ${hot ? 'class="hot"' : ''} />`;
}).join('\n    ');

const slopeDots = rows.map((r) => {
  const y1 = y(r.ours), y2 = y(r.mkt);
  return `<circle cx="${LX}" cy="${y1.toFixed(1)}" r="4.5" fill="var(--model)" stroke="var(--bg)" stroke-width="2"/>
    <circle cx="${RX}" cy="${y2.toFixed(1)}" r="4.5" fill="var(--market)" stroke="var(--bg)" stroke-width="2"/>`;
}).join('\n    ');

/* Direct labels. Every player is named on the left — a mark standing for one real
   entity must be able to name that entity. A key the reader re-applies is never used. */
const placed = [];
const slopeLabels = rows.map((r) => {
  let ly = y(r.ours);
  while (placed.some((p) => Math.abs(p - ly) < 15)) ly += 15;   // de-collide downward
  placed.push(ly);
  const hot = named.has(r.name);
  return `<text x="${LX - 12}" y="${(ly + 4).toFixed(1)}" text-anchor="end"
      class="plabel${hot ? ' hotlabel' : ''}">${esc(r.name)}</text>`;
}).join('\n    ');

/* The magnitude of a named disagreement, at the line's midpoint, in the hue of
   the board that ranks him higher. An arrow beside the name would be ambiguous
   about WHICH board moved; the word is not. gap = market rank - our rank, so a
   negative gap means the market has him higher (a smaller rank number). */
const gapPlaced = [];
const gapLabels = byGap.slice(0, NAMED).map((r) => {
  /* Two of the three widest happen to share a midpoint, which rendered as text
     on text. Overlapping labels are the mush defect caught on 2026-07-30; they
     get de-collided the same way the names do, and paint-order puts a surface
     stroke under the glyphs so a label never reads as fused with a line. */
  let my = (y(r.ours) + y(r.mkt)) / 2 - 6;
  while (gapPlaced.some((p) => Math.abs(p - my) < 20)) my += 20;
  gapPlaced.push(my);
  const higher = r.gap < 0 ? 'market' : 'ours';
  const hue = r.gap < 0 ? 'var(--market)' : 'var(--model)';
  return `<text x="${((LX + RX) / 2).toFixed(0)}" y="${my.toFixed(1)}" text-anchor="middle"
      class="gapnum" fill="${hue}">${higher} +${Math.abs(r.gap)}</text>`;
}).join('\n    ');

const refLines = [
  { at: STARTS, label: `WR${STARTS} · last weekly starter` },
  { at: REPL, label: `WR${Math.round(REPL)} · replacement level` },
].map((l) => `<line x1="${LX}" y1="${y(l.at).toFixed(1)}" x2="${RX}" y2="${y(l.at).toFixed(1)}"
      stroke="var(--rule)" stroke-width="1" stroke-dasharray="2 4"/>
    <text x="${RX + 12}" y="${(y(l.at) + 4).toFixed(1)}" class="reflabel">${esc(l.label)}</text>`).join('\n    ');

/* ---- the dumbbell panel (the form that shipped, for comparison) --------- */
const TRACK = 172;
const dumbbells = rows.map((r) => {
  const px = (rk) => ((N - rk) / (N - 1)) * TRACK;          // best = RIGHT (2026-07-23)
  const a = px(r.ours), b = px(r.mkt);
  return `<div class="drow">
      <span class="drank">${r.ours}</span>
      <span class="dname">${esc(r.name)}</span>
      <span class="dtrack">
        <span class="dline" style="left:${Math.min(a, b).toFixed(1)}px;width:${Math.abs(a - b).toFixed(1)}px"></span>
        <span class="ddot dm" style="left:${a.toFixed(1)}px"></span>
        <span class="ddot dk" style="left:${b.toFixed(1)}px"></span>
      </span>
      <span class="dtier"><b>ours</b> ${r.dtier}<br><b>market</b> ${r.mtier}</span>
    </div>`;
}).join('\n    ');

/* ---- the three headers ------------------------------------------------- */
const insideOursCount = rows.filter((r) => r.ours <= STARTS).length;
const insideMktCount = rows.filter((r) => r.mkt <= STARTS).length;
const widest = byGap[0];
const marketHigher = rows.filter((r) => r.gap < 0).length;

const HEADERS = {
  metric: {
    tag: 'A metric label',
    title: 'Model rank vs. market rank — WR',
    body: '',
  },
  method: {
    tag: 'Methodology — what 014 actually led with',
    title: 'Where the two boards agree',
    body: `${HOLD.held} of your ${HOLD.rosterSize} players can be compared at all. Both boards are ranked over only the ${HOLD.shared} players they share, because a rank from a list of 468 and a rank from a list of 399 are not the same measurement. Of the ${rows.length} receivers you hold, ${insideOursCount} are inside that starting ${STARTS} on our board and ${insideMktCount} on the market's.`,
  },
  claim: {
    tag: 'A claim — the pattern the reference site uses on every figure',
    title: 'The market is paying for your receivers. We are not.',
    body: `On ${marketHigher} of your ${rows.length} receivers the market ranks the player higher than we do, and the three widest splits are all in that direction — ${esc(widest.name)} by ${Math.abs(widest.gap)} places. Either the model is missing something the market can see, or this room is your cheapest trade ammunition. It cannot be neither.`,
    decoder: `Each line joins one player's two ranks. Left · our board. Right · the market's. A line that runs down to the right means the market is higher on him than we are. Named with a number: the ${NAMED} widest disagreements.`,
  },
};

const hdr = (k) => {
  const h = HEADERS[k];
  return `<div class="hdr" data-h="${k}" ${k === 'claim' ? '' : 'hidden'}>
      <div class="kicker">${esc(h.tag)}</div>
      <h3 class="htitle">${esc(h.title)}</h3>
      ${h.body ? `<p class="hbody">${h.body}</p>` : ''}
      ${h.decoder ? `<p class="hdecoder">${h.decoder}</p>` : ''}
    </div>`;
};

/* ---- page -------------------------------------------------------------- */
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lab 004 — the claim and the crossing</title>
<style>
:root{
  --bg:oklch(0.16 0.01 250); --surface:oklch(0.2 0.012 250);
  --border:oklch(0.32 0.012 250); --rule:oklch(0.38 0.012 250);
  --text:oklch(0.92 0.005 250); --muted:oklch(0.68 0.008 250);
  --model:oklch(0.72 0.11 255); --market:oklch(0.76 0.13 75);
  --line:oklch(0.72 0.01 250);
  --sm:13px; --base:15px; --lg:18px;
  --sans:"IBM Plex Sans",system-ui,-apple-system,sans-serif;
  --mono:"IBM Plex Mono",ui-monospace,monospace;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:var(--base)/1.55 var(--sans);
  -webkit-font-smoothing:antialiased}
.wrap{max-width:1280px;margin:0 auto;padding:40px 32px 72px}
.kicker{font:600 11px/1.4 var(--mono);letter-spacing:.09em;text-transform:uppercase;
  color:var(--muted)}
/* 24px is a DECLARED extension: the product ships 13/15/18 and no display scale. */
h1{font:600 24px/1.25 var(--sans);margin:6px 0 10px}
h2{font:600 var(--lg)/1.3 var(--sans);margin:0 0 6px}
h3.htitle{font:600 var(--lg)/1.32 var(--sans);margin:4px 0 8px}
p{margin:0 0 10px;max-width:74ch}
.lede{color:var(--muted);font-size:var(--sm);max-width:82ch}
section{margin-top:44px;border-top:1px solid var(--border);padding-top:26px}
.hbody,.hdecoder{font-size:var(--sm);color:var(--muted)}
.hdecoder{border-left:2px solid var(--border);padding-left:10px}
.controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:14px 0 20px}
button{font:500 var(--sm)/1 var(--sans);color:var(--text);background:var(--surface);
  border:1px solid var(--border);border-radius:4px;padding:9px 12px;cursor:pointer;min-height:32px}
button[aria-pressed="true"]{border-color:var(--model);color:var(--model)}
button:focus-visible{outline:2px solid var(--model);outline-offset:2px}
.panels{display:grid;grid-template-columns:470px 1fr;gap:26px;align-items:start}
.panel{background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:18px}
.panel h2 span{font-weight:400;color:var(--muted);font-size:var(--sm)}
.squint .figure{filter:blur(5px)}
.figure{transition:filter .18s ease}
@media (prefers-reduced-motion:reduce){.figure{transition:none}}
/* slope */
svg{display:block;width:100%;max-width:680px;height:auto;overflow:visible}
.plabel{font:400 13px var(--sans);fill:var(--muted);paint-order:stroke;stroke:var(--surface);stroke-width:3px;stroke-linejoin:round}
.hotlabel{fill:var(--text);font-weight:600}
.gapnum{font:500 12px var(--mono);paint-order:stroke;stroke:var(--surface);stroke-width:3px;stroke-linejoin:round}
.reflabel{font:400 12px var(--mono);fill:var(--muted)}
.axcap{font:600 12px var(--mono);letter-spacing:.08em;fill:var(--muted)}
/* dumbbell */
.drow{display:flex;align-items:center;gap:10px;padding:9px 4px;border-bottom:1px solid var(--rule)}
.drank{width:34px;text-align:right;font:400 var(--sm) var(--mono);color:var(--model)}
.dname{width:128px;font-size:var(--sm);white-space:nowrap}
.dtrack{position:relative;width:${TRACK}px;height:14px;flex:none}
.dtrack::before{content:"";position:absolute;left:0;right:0;top:6px;height:1px;background:var(--rule)}
.dline{position:absolute;top:6px;height:2px;background:var(--line);opacity:.6}
.ddot{position:absolute;top:2px;width:10px;height:10px;border-radius:50%;
  margin-left:-5px;border:2px solid var(--surface)}
.dm{background:var(--model)}.dk{background:var(--market)}
.dtier{font:400 11px/1.35 var(--mono);color:var(--muted);width:92px}
.dtier b{font-weight:400;color:var(--muted);opacity:.7;display:inline-block;width:44px}
.legend{display:flex;gap:16px;font-size:var(--sm);color:var(--muted);margin:2px 0 14px;flex-wrap:wrap}
.legend i{width:9px;height:9px;border-radius:50%;display:inline-block;margin-right:5px}
.note{font-size:var(--sm);color:var(--muted);border-left:2px solid var(--border);
  padding-left:12px;margin-top:16px;max-width:74ch}
table.census{border-collapse:collapse;font-size:var(--sm);margin-top:10px}
table.census td,table.census th{border-bottom:1px solid var(--rule);padding:6px 16px 6px 0;text-align:left;font-weight:400}
table.census th{color:var(--muted);font:600 11px var(--mono);letter-spacing:.06em;text-transform:uppercase}
table.census td.n{font-family:var(--mono);text-align:right}
.verdict{color:var(--text)}
@media (max-width:980px){.panels{grid-template-columns:1fr}}
</style></head>
<body>
<div class="wrap">
  <div class="kicker">Studio craft lab 004</div>
  <h1>The claim and the crossing</h1>
  <p class="lede">Three hypotheses for why the last surfaces missed died tonight, each to its own
  measurement. What was left was not how the pages were drawn. This lab holds the two things that
  survived: a form that lets a disagreement be seen across a whole group, and a header that commits
  to something.</p>

  <section>
    <div class="kicker">01 · The form</div>
    <h2>Same twelve receivers, same two rankings, drawn two ways</h2>
    <p class="lede">The left panel is the form that shipped: one private track per player. The right
    is a slope chart — both boards on one shared scale, every player a line between them.
    Press <b>Squint</b> to blur both until type dissolves; whatever still carries the argument is
    the one that works at a glance.</p>
    <div class="controls">
      <button id="squint" aria-pressed="false">Squint</button>
      <span class="lede" id="squintnote">The blur is the same test <span style="font-family:var(--mono)">tools/squint.mjs</span> runs.</span>
    </div>
    <div class="panels" id="panels">
      <div class="panel">
        <h2>Per-player tracks <span>— what shipped</span></h2>
        <div class="legend">
          <span><i style="background:var(--model)"></i>our rank</span>
          <span><i style="background:var(--market)"></i>market rank</span>
          <span>best is to the right</span>
        </div>
        <div class="figure">
    ${dumbbells}
        </div>
      </div>
      <div class="panel">
        <h2>One shared scale <span>— the slope chart</span></h2>
        <div class="legend">
          <span><i style="background:var(--model)"></i>our board</span>
          <span><i style="background:var(--market)"></i>the market's board</span>
          <span>WR1 at the top of both</span>
        </div>
        <div class="figure">
        <svg viewBox="0 0 ${VB_W} ${H}" role="img"
          aria-label="Slope chart: each of twelve receivers drawn as a line between our rank and the market's rank on a shared 1 to ${N} scale.">
    <text x="${LX}" y="16" text-anchor="middle" class="axcap">OURS</text>
    <text x="${RX}" y="16" text-anchor="middle" class="axcap">MARKET</text>
    ${refLines}
    ${slopeLines}
    ${slopeDots}
    ${slopeLabels}
    ${gapLabels}
        </svg>
        </div>
      </div>
    </div>
    <p class="note"><b>The honest cost.</b> The slope chart drops what the row carried — age,
    value, tier, the named neighbours. It answers a group question and cannot answer a player
    question, so it does not replace the row; it is what belongs above it. It also only works
    because both boards rank the same ${HOLD.shared} shared players; on any other pair of lists
    the two scales would not be the same measurement.</p>
  </section>

  <section>
    <div class="kicker">02 · The words</div>
    <h2>The same figure, headed three ways</h2>
    <p class="lede">Nothing below changes except the text above the chart.</p>
    <div class="controls">
      <button data-set="metric" aria-pressed="false">A metric label</button>
      <button data-set="method" aria-pressed="false">Methodology</button>
      <button data-set="claim" aria-pressed="true">A claim</button>
    </div>
    <div class="panel" style="max-width:820px">
      ${hdr('metric')}
      ${hdr('method')}
      ${hdr('claim')}
    </div>
    <p class="note"><b>The test that separates them.</b> Ask of each sentence: <i>could the product
    be wrong about this?</i> The metric label cannot be wrong — it names an axis. The
    methodology cannot be wrong — it counts things that are what they are. The claim can be
    wrong, and that is the whole of its value: it is the only one that spends the model's opinion,
    which is the only thing here that no other product has.</p>
  </section>

  <section>
    <div class="kicker">03 · The evidence</div>
    <h2>Why the first two hypotheses were dropped</h2>
    <table class="census">
      <tr><th>surface</th><th>David's reaction</th><th>screens</th><th>row variance</th></tr>
      <tr><td>006 front door</td><td class="verdict">"this is awesome"</td><td class="n">4.64</td><td class="n">0.36</td></tr>
      <tr><td>014 what you hold</td><td class="verdict">"not telling me anything"</td><td class="n">3.84</td><td class="n">0.34</td></tr>
      <tr><td>013 who do I call</td><td class="verdict">"not bad, not awesome"</td><td class="n">2.41</td><td class="n">0.41</td></tr>
      <tr><td>012 league pulse</td><td class="verdict">"missing the mark"</td><td class="n">10.74</td><td class="n">0.38</td></tr>
      <tr><td>Sofascore</td><td>—</td><td class="n">6.92</td><td class="n">—</td></tr>
      <tr><td>the app's own front door</td><td>—</td><td class="n">3.22</td><td class="n">—</td></tr>
    </table>
    <p class="note">The page called <i>very long</i> is shorter than the one called <i>awesome</i>,
    and shorter than every category leader measured. Rows on the approved surface and the rejected
    one are equally distinguishable at a glance. Neither extent nor drawing separates them.
    Reproduce: <span style="font-family:var(--mono)">node tools/screenfuls.mjs &lt;page&gt; --out
    &lt;dir&gt;</span> and <span style="font-family:var(--mono)">node tools/row-variance.mjs
    &lt;page&gt;</span>.</p>
  </section>

  <p class="note" style="margin-top:40px">Data: market ${HOLD.generated_from.market.slice(0, 10)},
  model ${HOLD.generated_from.model}, snapshot ${HOLD.generated_from.snapshot.slice(0, 10)} —
  three days old, reused so both lanes sit on the ${HOLD.shared} shared players.
  Built by <span style="font-family:var(--mono)">craft/build-lab004.mjs</span>.</p>
</div>
<script>
(function(){
  var sq=document.getElementById('squint'),panels=document.getElementById('panels');
  sq.addEventListener('click',function(){
    var on=sq.getAttribute('aria-pressed')==='true';
    sq.setAttribute('aria-pressed',String(!on));
    panels.classList.toggle('squint',!on);
  });
  var btns=document.querySelectorAll('[data-set]');
  btns.forEach(function(b){
    b.addEventListener('click',function(){
      btns.forEach(function(o){o.setAttribute('aria-pressed','false')});
      b.setAttribute('aria-pressed','true');
      document.querySelectorAll('.hdr').forEach(function(h){
        h.hidden = h.getAttribute('data-h')!==b.getAttribute('data-set');
      });
    });
  });
})();
</script>
</body></html>`;

writeFileSync(join(root, 'craft/lab-004-the-claim-and-the-crossing.html'), html);
console.log(JSON.stringify({
  wrote: 'craft/lab-004-the-claim-and-the-crossing.html',
  receivers: rows.length, pool: N, weeklyStarts: STARTS, replacement: REPL,
  named: [...named], widest: { name: widest.name, gap: widest.gap },
  marketHigherOn: marketHigher, insideStartsOurs: insideOursCount, insideStartsMkt: insideMktCount,
}, null, 2));
