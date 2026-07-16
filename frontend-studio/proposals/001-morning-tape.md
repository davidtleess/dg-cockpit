# 001 — The Morning Tape and the Grounded Analysis Layer

**Studio · July 15, 2026.** Second major revision, memorializing five design-review cycles with
David on the live prototype. What began as a polish of the default screen produced two things:
a finished morning tape, and — the larger outcome — **the product's analysis layer**: a grounding
pattern for every number the app shows. David has approved the direction ("exactly the kind of
comparison that creates value for me"); iteration continues from this baseline.

**Status of client rulings (recorded 2026-07-15):** inline row expansion is the confirmed detail
pattern (sidebar and tray both rejected as focus-stealers/space-eaters); the prose tier ladder is
**mandatory**; the model-expectation-vs-production comparison is explicitly endorsed by the client;
percentile population = position group, confirmed.

---

## Problem

Two distinct problems, one screen.

**The morning tape problem (original):** the default screen shows fresh, well-provenanced movement
data and stops one step short of usefulness — rows aren't interactive, direction is unreadable at a
glance, the headline count ("51 moves") counts table rows rather than moves, and the bottom half is
raw telemetry (all documented with screenshots in the 000 audit).

**The abstraction problem (surfaced during review):** the app's proprietary numbers — DVS, xVAR,
dynasty values — render without any comparison population. The client's words: "without context —
something to compare it against — it just becomes too abstract to provide any value." A DVS of 62.5
means nothing until it stands next to a rank, a tier, a set of names, and a production record.

## Evidence

- **Shneiderman's mantra** (overview → zoom/filter → details on demand) for the tape's
  row-expansion; **NN/g progressive disclosure** for the receipts consolidation; **Tufte sparkline
  canon + WCAG 1.4.1** for the direction encoding (arrows + signed values + baseline geometry;
  lightness variation within the market hue; measured 10.16:1 / 5.72:1 contrast on the app surface).
- **Baseball Savant** (client-supplied reference): every advanced stat rendered three ways — raw
  value, percentile vs. league, visual bar position. Translated here minus Savant's red/blue
  "POOR/GREAT" poles, which are verdict framing this product doesn't do; bar length carries the
  encoding, lane hue (market amber / model blue) carries the source.
- **Tier research (primary sources, July 2026):** KTC renders numbered "Tier 8" labels (~21
  gap-derived tiers; the client's exact complaint about numbered tiers, confirmed in the wild);
  Boris Chen's tiers are GMM clusters shown as color bands (8–12/position); FantasyPros dynasty
  uses 16 numbered tiers; FantasyCalc ships **no tiers**, grounding players instead by value-adjacent
  neighbor names. The dozen-based prose vocabulary ("low-end WR1," "mid WR2") is the lingua franca
  of dynasty discourse (RotoWire/ESPN glossaries; DLF and Dynasty Nerds usage) **and appears in no
  tool's UI** — formalizing it is a genuine differentiator.
- **Competitor movement-feed research (primary sources):** clickable riser/faller rows are the
  domain idiom (KTC, FantasyCalc); nobody in dynasty ships a true daily window — the app's verified
  day-over-day capture is a category differentiator the current UI does not exploit.

## Proposal

### A. The Morning Tape (shell and rows)

1. **Honest masthead:** date + team identity ("Woodbury Riders · Rebuilding — posture read Jun 23")
   + four decomposed count chips (25 of 26 roster repriced · 441 movers league-wide, top 25 shown ·
   12 in / 12 out of the valued universe · 0 model changes) replacing the aggregate "51".
   "Edition No. 21 — one per verified capture day" turns the capture streak into masthead identity.
2. **Receipts:** the five stacked telemetry blocks collapse to one collapsed panel in plain English;
   the descriptive-only notice appears once.
3. **Quiet model days** render one sentence in a model-blue strip, not an empty region.
4. **Direction-legible rows:** arrow + signed delta; brightness split inside the market hue (rose
   bright / fell dim); sparkline baseline band at yesterday's value with a direction-toned endpoint
   dot; honest column label ("Trend · 21 days" — the current "30-DAY" label doesn't match its data).
5. **Rows expand inline** (client-confirmed pattern after sidebar and tray were tested and
   rejected): click a row → the analysis panel opens in place, pushing rows down; Esc or re-click
   collapses; selected row carries an amber inset marker.

### B. The Grounded Analysis Layer (the expanded panel)

Reading order per the client's ladder — rank, tier, names, percentiles, production:

6. **Rank line:** `#39 overall · WR13 of 154` — position rank with population size.
7. **Two-lane prose tiers (mandatory):** `market · high-end WR2` (amber chip) beside
   `model · low-end WR1 (WR10)` (blue chip). The ladder is the dozen-based vocabulary the hobby
   speaks, derived from position rank (12-team buckets; high-end/mid/low-end by depth within
   bucket; "Elite" for the top of bucket one). The model's tier comes from ranking the full
   Engine B population (503 players, `predicted_avg_ppg_t1_t2`) — served today by
   `/api/engine-b/scores`, an endpoint no screen calls. **Open design task:** make the ladder
   statistically sound (bucket boundaries validated against value/score distributions) while
   keeping it prose — the prose requirement is a client ruling.
8. **Value-adjacent names:** "priced next to Carnell Tate · Garrett Wilson · A.J. Brown" — the
   KTC/FantasyCalc neighbor pattern; the single most intuitive grounding device we tested.
9. **Percentile bars** (Savant-translated): value among position (66th), 2025 production PPG vs.
   position players with ≥6 games (92nd), 30-day trend (45th), DVS on its own 0–100 scale in
   model-lane blue. Population named under the bars.
10. **Week-by-week production vs. expectation** (client-endorsed): one bar per 2025 week (PPR),
    snap share on hover, and a blue dashed line at the model's predicted PPG — "model expects
    13.3." In-season this becomes the Tuesday-morning read: last week's bar lands against the
    model's line. Rookies state it in words: "no NFL production yet — 2026 rookie class."
11. **Self-referential context line:** "▲ +143 today — his largest one-day move in 21 days · −73
    (−2%) since Jun 24," plus the divergence sentence ("Model and market agree · xVAR +30.8").
12. **Evidence-card CTA** with a real deep link (`?surface=player&id=…` — players need URLs).

### C. In-season concept (data-gated, design demonstrated)

The prototype's "Week 3 concept" toggle shows the same panel during a live season: usage lenses
(target share trend, snap share, routes, YPRR, depth-chart movement) with production-vs-expectation
as the headline. Illustrative data, loudly labeled, with per-metric sourcing stated on the panel.

## Data acquisitions this design needs (itemized for engineering)

| Need | Source | Status |
|---|---|---|
| Market universe (percentiles, neighbors, tiers) | FantasyCalc full payload | Already the app's source; the UI needs access to the full list, not just movers |
| Model population (model tiers, expectation line) | `/api/engine-b/scores` | Exists, currently uncalled; needs sleeper-id join |
| ID crosswalk (GSIS → Sleeper) | DynastyProcess `db_playerids.csv` | DP is already a permitted source; 503/503 matched in testing |
| Season + weekly stats (production bars, snap share) | Sleeper public stats API (`/v1/stats/nfl/regular/{yr}[/{wk}]`) | Same host the app already calls; new endpoints |
| Depth-chart movement | Sleeper player map field | Exists today; the app's normalizer discards it (code change, not new source) |
| Target share | Play-by-play (nflverse-class public data) | New acquisition decision |
| Routes / YPRR | PFF-class provider | No permitted source today — may be genuinely out of reach |

## Prototype

`proposals/001-morning-tape/prototype.html` + `tape-data.js` — self-contained (fonts embedded from
the app's build; headshots progressive from the running app). **All grounding data is real**: the
July 14 what-changed payload, per-player evidence from `/api/players/{id}` (48 players), the full
FantasyCalc universe (462 players), Engine B's 503-player model population, and Sleeper's actual
2025 season and 18 weekly stat files. The only illustrative numbers in the entire artifact are in
the clearly-bannered "Week 3 concept" toggle. Key screenshots in `assets/001-proto/`:
`p12-collins-prose.png` (the approved analysis panel), `p4-final-full.png` (the tape),
`p5-final-receipts.png`, `p9-inline-today.png` (evolution states).

## Costs — honest

- **The prose ladder must clear the banned-vocabulary check.** Words like "Elite" describe market
  pricing, not our advice — but the check doesn't know that. The client has ruled prose tiers
  mandatory; if the check blocks specific words, the ladder's vocabulary is negotiable, its
  existence is not.
- **The expectation line invites comparison by design.** It renders the model's own published
  number (predicted PPG) as a reference over realized production. The client explicitly endorses
  it. It will read to the team as decision-adjacent; the honest framing is that it's two facts on
  one chart.
- **The dozen-bucket ladder is rank-derived, not gap-derived** — statistically naive v1. Making it
  "statistically sound and representative" (client's words) without losing prose is open design
  work (candidate: gap/cluster-validated boundaries labeled with the prose vocabulary).
- **Percentile/tier computation is an editorial act** that should live in the backend with the
  model team's ownership, not in UI code. The prototype computes client-side from embedded data.
- **Weekly bars are last season** until 2026 games begin; the panel must age gracefully into
  September (the concept toggle shows how).
- **Engine B's endpoint is marked experimental** with its own caveats; surfacing it to the UI
  changes its blast radius. The engineers should say what stability contract it can carry.
- Inline expansion re-renders on "Show all" wipe open panels; mobile hides the sparkline column;
  name truncation at 390px is aggressive. Known, minor, listed.

## Open questions

1. What statistical validation makes the prose ladder "sound" — value-gap boundaries per position,
   or rank buckets with confidence bands from expert-rank spread (the FantasyPros `rank_std`
   pattern)?
2. Does the banned-vocabulary check apply to market-tier labels, and if so, which words survive?
3. Where should grounding computation live — a new `/api/players/{id}/grounding` endpoint, fields
   on the existing evidence payload, or a batch artifact?
4. What is `/api/engine-b/scores`' stability contract for UI consumption?
5. Player URLs (`?surface=player&id=…`): in scope this cycle?
6. In-season, what window does "recent production" mean — last 4 weeks, or season-to-date with a
   recency-weighted bar?

## Review log

- **2026-07-15 (morning review, David live):** The state-first restructure — roster shown as one
  rank-ordered table with position cards and movement annotated onto it, movers demoted to a
  change-view — reviewed on screen and **approved**: "looks better… yes I think this is logical."
  David also approved moving forward with the 001b addendum (relay to engineering pending Tower's
  acknowledgment). This screen's structure is now David-confirmed; iteration continues from it.

— Studio
