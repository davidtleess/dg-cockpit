# 001-RELAY — The Morning Tape and the Grounded Analysis Layer, for the engineering team

**David's 60-second review**

| ID | Summary | Severity |
|----|---------|----------|
| G1 | Expanded row shows rank, tiers, names, percentiles | High |
| G2 | Two-lane prose tiers: market beside model | High |
| G3 | Weekly production bars against model expectation line | High |
| G4 | Data acquisitions: stats, crosswalk, engine-b surface | High |
| G5 | Percentile and tier computation needs backend ownership | Medium |
| T1 | Tape rows expand inline with analysis panel | High |
| T2 | Direction encoded in-lane: geometry plus lightness | Medium |
| T3 | Masthead count decomposed into four honest chips | Medium |
| T4 | Team name and posture promoted to masthead | Medium |
| T5 | Five context blocks collapse into one receipts panel | Medium |
| T6 | Quiet model days render one sentence | Low |
| T7 | Trend column label corrected to actual window | Low |
| T8 | Player pages get URLs via query-param scheme | Medium |

---

From: Studio. Companion to `proposals/001-morning-tape.md`. Working prototype:
`proposals/001-morning-tape/prototype.html` — open it in a browser, click Nico Collins in the
"Around the league" table, and you are looking at the whole proposal. All grounding data in it is
real (sources below); only the "Week 3 concept" toggle uses illustrative numbers, and it says so on
its face. This design has been through five review cycles with David on the live prototype; the
elements below marked *client-ruled* are his explicit decisions, not my preferences. For each item:
cost it, raise the feasibility concern, or refute with a concrete technical fact.

## G1 — The grounded analysis panel (expanded row)

**Change.** Clicking a tape row expands an analysis panel in place: rank line
(`#39 overall · WR13 of 154`), two prose tier chips (G2), "priced next to" value-adjacent names,
percentile bars (value, 2025 production, 30-day trend vs. the position group; DVS on its own 0–100
scale), a self-context line, and two charts (21-day market value; weekly production vs. expectation,
G3).

**Grounding.** Every element is computable today from data the system already has or can reach
(G4). Percentile population = position group within the valued universe (client-ruled). The
value-adjacent-names device is the KTC/FantasyCalc pattern (both ship it; primary-source research
on file).

**User cost of absence.** The client's own words about the current numbers: "without context…
it just becomes too abstract to provide any value."

Cost the panel as a component; the data plumbing is G4/G5.

## G2 — Two-lane prose tiers (client-ruled: prose is mandatory)

**Change.** Two chips: `market · high-end WR2` and `model · low-end WR1 (WR10)`. Ladder =
dozen-based buckets from position rank (12-team), high-end/mid/low-end by depth within bucket,
"Elite" atop bucket one. Market side from FantasyCalc position rank; model side from ranking
`predicted_avg_ppg_t1_t2` across the full Engine B population.

**Grounding.** Research on file: KTC/FantasyPros ship numbered tiers (the exact thing the client
rejects); the prose vocabulary is the hobby's lingua franca and no tool ships it. David has ruled
the prose ladder mandatory; the *statistical derivation* of bucket boundaries is open and is
yours to shape — proposal doc, open question 1.

**Two direct questions.** (a) Does `banned_vocabulary.json` apply to market-pricing tier labels
("Elite", "high-end WR2")? If specific words are blocked, propose survivors — the ladder's
vocabulary is negotiable, its existence is not (client ruling). (b) What boundary derivation would
you consider statistically sound while keeping prose labels?

## G3 — Weekly production vs. model expectation (client-endorsed explicitly)

**Change.** In the expanded panel: one bar per week (PPR points, snap share on hover) with a dashed
line at the model's `predicted_avg_ppg_t1_t2` — labeled "model expects 13.3". 2025 data now;
becomes the live Tuesday-morning read in-season.

**Grounding.** Both series are facts the system owns or can fetch: realized weekly points (Sleeper
stats API) and the model's own published prediction (engine-b payload). David, on the record: this
comparison is "exactly the kind of value" he wants, and the prediction's presence "is not a big
problem." If your read is that plotting them together crosses a line the separate facts don't,
bring that as a concrete harm; the client has pre-cleared the concept.

## G4 — Data acquisitions, itemized

| # | Need | Path | Ask |
|---|---|---|---|
| 1 | Full market universe in the UI (percentiles, neighbors) | FantasyCalc payload the app already caches | Expose full list, not movers-only |
| 2 | Model population with sleeper ids | `/api/engine-b/scores` (exists, uncalled) + GSIS→Sleeper crosswalk | Join server-side; I verified 503/503 match via DynastyProcess `db_playerids.csv` (already a permitted source) |
| 3 | Season + weekly stats | Sleeper public stats endpoints (`/v1/stats/nfl/regular/{yr}[/{wk}]`) — same host you already call | Add capture job + store |
| 4 | Depth-chart field | Already in Sleeper's player map; your normalizer drops it | Normalizer change |
| 5 | Target share | Public play-by-play (nflverse-class) | Acquisition decision — cost it |
| 6 | Routes / YPRR | PFF-class provider only | If no permitted source exists, say so and it dies honestly |

Items 1–3 unlock everything marked "real" in the prototype. Confirm each path or name the blocker.

## G5 — Grounding computation needs a backend home

**Change.** Percentiles, tier assignment, value-adjacency, and expectation joins should be computed
server-side under model-team ownership — a grounding endpoint or fields on the evidence payload —
not in UI code. The prototype computes client-side from embedded data as a demonstration, not a
recommendation.

**Ask.** Pick the shape: new endpoint, evidence-payload fields, or batch artifact. I'll design to
whichever contract you prefer.

## T1 — Tape rows expand inline (client-ruled pattern)

Click a row → panel opens in place, pushing rows down; Esc/re-click collapses; selected row keeps
an amber inset marker. This pattern won a three-round test against a right sidebar ("becomes the
only focal point") and a bottom tray ("still a space eater") — both rejected by the client on the
live prototype. Rows currently have no handler at all (000-S5, DOM-verified).

## T2 — Direction encoding, in-lane

Arrow + signed value; brightness split within the market hue (rose `#f9b64f` 10.16:1, fell
`#af8b59` 5.72:1 on your dark surface — both pass AA); sparkline baseline band at yesterday's value
with direction-toned endpoint dot. Meaning never rides on color alone (WCAG 1.4.1). No red/green
semantics introduced. Confirm against your color rules or name the specific rule and harm.

## T3 — Honest masthead counts

"Moves on the tape: 51" (which counts rendered rows, including one zero-delta player) becomes four
named chips: 25 of 26 roster repriced · 441 league-wide (top 25 shown) · 12 in / 12 out · 0 model
changes. All from the payload (`total_movers_count` is currently fetched and never shown). Standing
question: does 441 include universe churn?

## T4 — Identity in the masthead

"Woodbury Riders" (`david_team_name`, in the payload, never rendered) and "Rebuilding — posture
read Jun 23" replace the posture's current position at the bottom of the fifth context block as
`Posture: REBUILDING` under a raw staleness caveat.

## T5 — One receipts panel

The five telemetry blocks (each repeating `Status: ok` + disclaimer +
`captured_at_vs_report_generated_at — stale (age 504.5h)`) collapse into one plain-English panel
behind a "receipts" link; the descriptive-only notice appears once. Nothing dropped, everything
de-duplicated and translated. If per-section notices are a hard requirement, name the concrete user
harm the repetition prevents.

## T6 — Quiet model days

`model.deltas` empty + `baseline_holding` → one sentence in a model-blue strip instead of an empty
region. Copy plus a conditional.

## T7 — Trend label

The current header says "30-DAY"; the series has 21 points (Jun 24 → Jul 14). Label the real window
("Trend · 21 days") or the intent ("21 of 30 days"). State which.

## T8 — Player URLs

`?surface=player&id=<sleeper_id>` in the existing query-param scheme. Verified today: opening the
evidence card does not change the URL, so no player view is linkable and the expanded panel's CTA
would dead-end. G1's value is halved without this.

---

Open the prototype, click Collins, then Chris Bell (rookie state), then toggle "Week 3 concept"
(the in-season design with its data asks printed on the panel). The client has approved this
direction on the record; what's needed from you is costs, contracts (G4/G5), and the two G2
answers. Where I've misread a technical fact, show the repro and I'll retract without ceremony.

— Studio
