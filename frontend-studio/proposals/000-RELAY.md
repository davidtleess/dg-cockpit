# 000-RELAY — First-run audit findings, for the engineering team

From: Studio (independent front-end review, retained by David)
Basis: live app at `http://127.0.0.1:8000`, verified 2026-07-14 (morning captures current).
Environment: Chromium via Playwright, viewport 1440×900 (mobile checks at 390×844).
Evidence: screenshots in `~/frontend-studio/proposals/assets/000-first-run/` — referenced by number.
I have read no source code; every claim below is reproducible from the running product. Items are
ranked by severity. For each: confirm it, fix it, or refute it with a concrete technical reason.

---

## S1 — Player evidence card renders concatenated, undelimited field strings

**Claim.** The full player evidence card renders its model-lane and market-lane summaries as raw
concatenations with no separators, including an ISO timestamp with microseconds and caveat slugs
fused into one string.

**Repro.** `/?surface=trade-lab` → type `jeanty` in the asset search → click "Ashton Jeanty" →
in the Inspector aside, click "Open full evidence card".

**Observed.** Model lane: `ENGINE_BACTIVE_B75.331.3——11.822—`. Market lane:
`FantasyCalc7242Overall 13Position 32026-07-14T13:00:00.878123+00:00market_overlay_static_caveatsource_timestamp_is_fetch_time_not_publish_time`.
Screenshot `33-player-detail-full.png`.

**Expected.** Labeled, delimited fields: engine, grade, version, value, rank, human-readable
timestamp, caveats as discrete items.

**User cost.** This is the page that presents the product's core evidence for a single player; as
rendered, the numbers it exists to show cannot be read.

Confirm, fix, or refute.

## S2 — Trade comparison executes on empty input and returns a populated results panel

**Claim.** "Run comparison" with zero assets on both sides returns a full results panel with
plausible-looking values instead of rejecting the input.

**Repro.** Fresh browser profile (empty `localStorage`) → `/?surface=trade-lab` → click
"Run comparison" without adding any asset.

**Observed.** Model view: Sent 0, Received 0, Parity "within band", "Adjusted fairness delta range:
0 to 27.83", waiver-recovery copy naming a specific player ("Rasheen Ali"). Market snapshot: all
zeros plus "Roster rules conflict: transaction blocked." and flags `fantasycalc_uncovered`,
`market_overlay_display_only`, `fantasycalc_raw_scale_not_xvar`, others. Screenshot
`32-trade-result-full.png`.

**Expected.** An empty trade is not comparable: disable the run control or return an explicit
empty-input state. A nonzero fairness-delta range from zero assets suggests the panel is rendering
values unrelated to the submitted trade — worth checking where `0 to 27.83` and the Rasheen Ali
recovery line come from.

**User cost.** A results panel that renders confidently for an input that means nothing undermines
every result the panel renders for inputs that do.

Confirm, fix, or refute.

## S3 — No control exists to remove an asset from a trade side

**Claim.** Once an asset is added to "sends" or "receives", there is no UI path to remove it.

**Repro.** `/?surface=trade-lab` → search `jeanty` → click "Ashton Jeanty" (adds to active side) →
attempt to remove: click the asset chip, look for any control on or near it.

**Observed.** The chip is inert (click produces no action or affordance; probe found no handler).
The only recovery is clearing the persisted draft (`localStorage`) or starting over. Screenshots
`26-trade-built.png`, `30-trade-persisted.png`.

**Expected.** Per-asset remove control and/or a clear-side control.

**User cost.** Trade construction is iterative by nature — swap this player, try that pick; a
builder you can only add to has to be reset to be used.

Confirm, fix, or refute.

## S4 — Health endpoint 503 renders a permanent "Status unavailable" warning that contradicts on-page state

**Claim.** `GET /api/health` returns 503 (`{"error":"system_health_unavailable"}`) while every
feature endpoint returns 200, so the shell renders an amber "Status unavailable" pill on all screens
— directly above content stating `Status: Synced`, `Feed status: ok`, `Market feed: ok`, and
"21 consecutive days tracked".

**Repro.** `curl -i http://127.0.0.1:8000/api/health` → 503. Load `/` → amber pill top-right;
context rail on the same screen shows Synced/ok. Click the pill: "Data freshness unavailable —
update status unknown / system health configuration unavailable". Screenshots
`01-default-what-changed-viewport.png`, `29-status-strip.png`.

**Expected.** The health endpoint reflects the actual state of the feeds it summarizes; the shell
pill agrees with the page under it.

**User cost.** The first thing the user sees every morning is the app warning about itself over
data that is fine — that either erodes trust in the app or trains him to ignore the pill, which
makes the pill worthless on the day it matters.

Confirm, fix, or refute.

## S5 — Rows on the default screen (Daily What-Changed) are not interactive

**Claim.** Player rows on the market-movement tape have no interaction: no navigation to the player
card, no inspector open, no handler at all.

**Repro.** Load `/` → click any player row (e.g., the top mover). DOM probe: walking ancestors of
the player-name node finds no `BUTTON`/`A`/`onclick` and `cursor: auto` throughout.

**Observed.** Nothing happens. Screenshot `01-default-what-changed-viewport.png`.

**Expected.** A row on a "what moved" surface leads to the evidence for that player (card or
inspector) — the same selection behavior that already exists for Trade Lab asset results.

**User cost.** The default screen poses the question "what moved?" and then blocks the immediate
follow-up ("why?") — the user has to leave, open Trade Lab, and search the same name to see the
player the tape just showed him.

Confirm, fix, or refute.

## S6 — League Pulse renders ~41,000 px tall as one-per-line key-value dumps

**Claim.** `/?surface=league-pulse` renders a page 40,897 px tall at 1440×900 (≈45 viewports).
Partner rankings and team data render as vertical snake_case key-value pairs
(`partner_score` / `2.168`, `complementarity_score` / `0.92`, one per line, per team, for 11 teams).

**Repro.** Load `/?surface=league-pulse`; full-page screenshot height is the measurement.
Screenshots `05-league-pulse-viewport.png`, `05-league-pulse-full.png`.

**Expected.** Scouting is a comparison task: a ranked table or card grid where 11 opponents fit in
one or two viewports; keys rendered as labels, not identifiers. (Also present: the surface title
renders twice.)

**User cost.** Comparing opponents across 45 screens of scroll is not slower — it is not possible;
the workflow this surface exists for cannot be performed on it.

Confirm, fix, or refute.

## S7 — Core content rendered at ghost opacity on Roster Capacity and Model Trust

**Claim.** The primary content of two surfaces renders at very low opacity (~20–30%): the entire
22-row cut-candidate table on Roster Capacity (including headers and the "Artifact status: ok"
line), and the gate matrix (G1–G4) plus model-card sections on Model Trust.

**Repro.** Load `/?surface=roster-capacity` and `/?surface=model-trust`. Screenshots
`04-roster-capacity-full.png`, `06-model-trust-viewport.png`.

**Expected.** If this is a stale/de-emphasis style, it is misfiring: it is applied to the page's
primary content while status reads `ok`. If intentional, the threshold is wrong — the content the
user came for is near-illegible on a dark background.

**User cost.** The user squints at the exact numbers the page exists to show.

Confirm, fix, or refute — if intentional, state the trigger condition so we can argue about the
threshold instead of the symptom.

## S8 — Internal identifiers render as user-facing copy across all surfaces

**Claim.** Enum values, feature names, artifact slugs, and flag strings from the API render
verbatim in user-facing positions. A non-exhaustive observed list:

- Roster Audit rows: `PRE_MODEL`, `PROSPECT_C`, `no_age_signal (5y)`, `approaching_cliff (2y)`
  (`02-roster-audit-viewport.png`); expanded row: "missing: aging_curve_value, games_t, ppg_t,
  ppg_t_minus_1, snap_share_t_minus_1, …" (`23-roster-row-expanded.png`).
- What-Changed context blocks: `captured_at_vs_report_generated_at — stale (age 504.5h)` repeated in
  five consecutive blocks; `UNROSTERED_MODEL_MARKET_DIVERGENCE: 4` (`01-default-what-changed-full.png`).
- Accuracy Tracker: `Reason: awaiting_first_finalized_week` (`07-accuracy-tracker-viewport.png`).
- Trade Lab results: `fantasycalc_raw_scale_not_xvar`, `cross_lane_manual_review_suppressed_market_coverage_incomplete`,
  `RB_waiver_range_unavailable_recovery_unverifiable` (`32-trade-result-full.png`).
- Model Trust: `decision_supported = false` as a standalone line (`06`).
- League Pulse: artifact version tags `team_posture.v1`, `team_value_matrix.v1` in the header (`05`).
- Inspector: the raw Sleeper ID (`7569`) as an unlabeled content line (`27-trade-result-full.png`).

**Expected.** A presentation-layer mapping from machine identifiers to plain-language labels at the
render boundary. This is one systematic fix, not dozens of copy edits — and it does not touch what
is claimed, only how it is spelled.

**User cost.** The user reads the app's internal variable names instead of his own language on
every screen, every day.

Confirm, fix, or refute.

## S9 — Trade Lab layout breaks when the Inspector opens; pick search returns an unordered wall

**Claim.** Two rendering defects in Trade Lab. (a) With the Inspector open, the app header
("Dynasty Genius") renders mid-page inside the content column and the status pill is displaced into
the Inspector column. (b) Searching `2027` returns ~36 visually identical unstyled buttons
("2027 round 1 (via 11)", …) in non-obvious order (via-numbers interleaved: 10, 11, 12, 2, 3, …).

**Repro.** `/?surface=trade-lab` → search `jeanty` → click result (opens Inspector) → search `2027`.
Screenshots `27-trade-result-full.png` (layout), `25-trade-pick-search.png` / `26-trade-built.png`
(pick wall).

**Expected.** (a) Shell chrome stays in the shell regardless of aside state. (b) Picks grouped by
round, ordered by origin slot, visually distinct from player results.

**User cost.** (a) reads as the app breaking mid-task; (b) makes selecting one pick from 36
near-identical strings an eyesight test.

Confirm, fix, or refute.

## S10 — Data-absence states enumerate absences instead of summarizing them

**Claim.** Three surfaces foreground what does not exist over what does. (a) Roster Capacity ends
with ~30 lines of `<POS> range unavailable` covering positions that cannot roster in this league
(ATH, CB, ILB, LS, P, …). (b) Roster Audit ships a "Model status" column reading `n/a` in 100% of
rows while DVS is a dash in most. (c) The Movement-history slot says the line "begins once enough
days are on the books" on the same page that reports 21/21 capture days complete — no threshold is
stated anywhere.

**Repro.** `/?surface=roster-capacity` (bottom of page); `/?surface=roster-audit` (table);
`/` (Movement history card vs. context rail). Screenshots `04`, `02`, `01-full`.

**Expected.** (a) Suppress or summarize non-applicable positions (one line, expandable). (b) A
column that is `n/a` for every row in the current state should not render as a column. (c) State
the threshold ("line begins at N days; 21 of N") or start drawing at the data you have.

**User cost.** Every absence rendered at full volume pushes the data that does exist below the fold
and reads as the product apologizing rather than informing.

Confirm, fix, or refute — for (c), a one-line answer on what the threshold actually is settles it.

## S11 — Sparkline direction is unreadable at a glance; the tape's headline count disagrees with its sections

**Claim.** (a) Every 30-day sparkline on the What-Changed tape renders in the same single color with
no baseline reference, so gainers and losers are visually identical until the user reads each signed
delta (e.g., Ty Simpson −115 renders indistinguishably from Jordan James +114). (b) The masthead
says "Moves on the tape: 51" while the model-output section on the same page says nothing moved —
the count silently aggregates market movement and universe entries/exits.

**Repro.** Load `/`; compare rows 7–8 of "Around the league"; compare masthead count to section
contents. Screenshot `01-default-what-changed-full.png`.

**Expected.** (a) Direction encoded in the mark itself (the app already avoids red/green semantics
elsewhere; any two-hue or baseline treatment consistent with that works). (b) The count decomposed
("0 model · 42 market · 9 entered/exited") or per-section counts.

**User cost.** The tape's one job is scannability, and today the scan requires reading every number
and reconciling a headline that doesn't match its own page.

Confirm, fix, or refute.

## S12 — Chrome and reachability defects, grouped

**Claim.** Individually small, collectively the perceived-quality floor:

- Native unstyled white form controls on the dark theme (Trade Lab inputs/buttons, Roster Audit
  selects). Screenshots `03`, `02`.
- Accuracy Tracker: heading rendered twice ("Accuracy Tracker" / "ACCURACY TRACKER"), inactive-state
  card in full-white background on the dark theme. Screenshot `07`.
- Command-palette options do not respond to mouse clicks (keyboard Enter only). Screenshot `28`.
- The full player evidence card does not change the URL when opened (verified: URL remains
  `/?surface=trade-lab`), so no player view is linkable or bookmarkable, and the only path I found
  to any player card is through Trade Lab search → Inspector → button.
- Phone-width (390px): nav wraps and stacks acceptably, but tape rows overflow the viewport.
  Screenshot `40-mobile-default.png`.

**Expected.** Themed controls; single heading; palette items clickable; player card addressable by
URL (the existing query-param scheme extends naturally); rows that fit or scroll intentionally.

**User cost.** Each is minor friction daily; together they set the product's feel well below the
quality of the data underneath it.

Confirm, fix, or refute per bullet.

---

That is the full set from the first-run audit. Items S1, S2, S4, S7, S9(a) look like plain defects;
the rest are design gaps I will follow with concrete proposals and working prototypes. Where I have
misread behavior, say so with the repro that shows it — I will retract on facts without ceremony.

— Studio
