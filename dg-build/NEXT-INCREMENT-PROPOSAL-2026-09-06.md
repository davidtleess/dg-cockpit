# Next increment proposal — player comparisons and model evidence

Status: implementation released on 2026-09-06 after David replied "k everyone is idle" to the proposed three-track build. Root explicitly stated its interpretation: proceed with those three tracks. The earlier preparation-only hold is superseded by the concrete assignments in `PLAYER-COMPARISON-BUILD-2026-09-06.md`. Current forecasts remain frozen; no production promotion or model refit is included.

## Recommended direction

Make the accepted research board useful for inspecting any league player while building reproducible evidence for the next model improvements. Keep every current player forecast, selected reference, scoring preset and two-/five-year calculation unchanged in this increment.

Alternative A (recommended): comparison-board improvements plus two independent evidence tools. It delivers a usable page now without pretending that easier explanations improve forecast accuracy.

Alternative B: prioritize matching exact league scoring. This removes a known scoring mismatch but requires event attribution and reconciliation; it does not itself establish stronger player forecasts.

Alternative C: prioritize the rookie-to-veteran forecast transition. There is a measurable young-QB calibration concern worth testing, but no proposed correction has yet demonstrated improvement on the current target.

## Three bounded tracks after approval

### DG-178 — find and understand a player

The five-second answer is: "What does the model expect for this player, and why is his impact number different from another player's?"

- Add an in-page league-player search using the 274 players already in the accepted API payload. Preserve David's roster-first default and one focal value. No new market blend, ordinal ranks, fabricated tiers or expanded production navigation.
- Explain a zero surplus as an actual forecast that does not exceed the selected reference in the displayed seasons; it is not missing data, zero fantasy points or zero dynasty trade value.
- Show each year's player expected points alongside the selected reference inside the existing detail disclosure. Derive from full-precision signed margin plus reference only when both are known, and verify against producer rows. Keep absent values absent.
- Fix exact-equality and rounded-near-zero direction language. An exact tie is "equal to reference"; a small signed difference must not become misleading "0 below/above."
- Bind the reviewed dated census and league snapshot into a NEW immutable audit, with byte hashes and strict duplicate/identity checks. Show league-owned coverage separately from current listed players and historical database coverage.
- Distinguish fantasy ownership from verified NFL roster status. A missing NFL join is unknown, not proof that a player is unavailable in fantasy. Do not change who sets the reference in this increment.
- Desktop: existing table, compact search and player details. Phone: existing readable identity/focal-value layout with keyboard/touch-operable detail and contained wide evidence, not a full redesign. Existing tokens/components only.

Acceptance: search finds every league-owned player; zero/missing/equal states differ; all 825 values, reference identities and annual terms are unchanged; all 274 league rows and both horizon views retain parity. Missing/mismatched census evidence must not be represented as verified status. Fresh backend/frontend checks and real desktop/phone QA precede a new local preview pin. Reviewed `203007Z` remains preserved.

Confirmed code locations: `frontend/src/research/ResearchPreview.tsx`, `app/api/routes/research_preview.py`, `scripts/dg178/audit_roster_coverage.py`, `src/dynasty_genius/ranking/nfl_census.py`; tests include `tests/contract/test_research_preview_route.py` and `tests/ranking/test_nfl_census.py`.

### DG-177 — a 2025 scoring-component audit

Build a tested, reproducible player-week component ledger using retained weekly, play-by-play and Sleeper matchup records. Compare the research-PPR preset with the saved league rules and matched actual Sleeper player-week points. No full-history refit or automatic exact-scoring claim.

Preserve source hashes and event grain `(game_id, play_id, event slot, player_id)`. Test multi-fumble/recovery plays, own/opponent recovery, return plays, muffs, out-of-bounds events, nullified plays, duplicate credit, missing IDs and overlapping touchdown categories. Any unsupported applicable rule or ambiguous required attribution prevents exact-league qualification. Re-audit quarantine under the proposed component rules; a zero under one scoring formula is not necessarily irrelevant under another.

Sources already found locally: DG-165 prepared source `runs/20260906T194454Z/source_preparation/identified_weekly.parquet`; shared read-only `app/data/backtest/qb_validation/raw/pbp/pbp_2025.parquet`; historical Sleeper matchup files in `app/data/research/league_behavior/raw/2026-07-19/season_2025_1183088915091423232/`. Historical league scoring matches the current saved settings, according to the independent read-only review. Do not rerun shared QB ingestion producers.

Primary definitions rechecked by root: [individual versus team special teams](https://support.sleeper.com/en/articles/3278982-special-teams-scoring-options), [all-play fumble losses](https://support.sleeper.com/en/articles/4056849-why-did-my-player-lose-points-for-a-special-teams-fumble), [two-way player scoring](https://support.sleeper.com/en/articles/11166252-travis-hunter-s-dual-position-eligibility-what-you-need-to-know). Individual ST rules and team-defense rules must remain separate. No IDP setting is inferred from a DST key.

### DG-165 — a reproducible rookie-to-veteran transition audit

Compare matched forecasts on the same realized target while acknowledging that the veteran prediction is made a year later with more information. Record NFL experience, player/draft identity, appearance, point errors and omitted cohorts. Do not silently discard drafted players who had no rookie stat line.

The audit is not a model correction. In particular, an observed QB underprediction must not be converted into a fixed boost, arbitrary blend, extra age discount or claim that draft position causes the error. A later candidate experiment needs a frozen comparison, training-only fitting/selection, closed outer seasons and separate reporting for common-cohort accuracy and newly covered players. Existing QB prior work addresses another target; it cannot validate this target by name alone. Broader veteran draft-capital scope remains unapproved.

## Findings motivating the proposal

- Root code inspection confirms the page renders David's roster plus `view.top.slice(0, 40)`, despite the API carrying all 274 league-owned players. Search can use existing data without a new external request.
- The route currently gives all comparable rows the same generic status sentence and hardcodes a superseded "no 2025 stat line" explanation for missing veterans. Exact zero margins fall through to "below reference."
- The current census is built but not consumed by the audit/page. An independent join finds 274/274 league-owned covered, 656/784 listed-or-owned covered, and 349/433 unowned verified active/reserve/practice-squad/exempt-class players covered. The 84 gaps in that last denominator are 20 active, 50 practice-squad and 14 injured-reserve. Retain 141 unmatched NFL skill records separately; do not add them blindly to either denominator. These are distinct populations, not competing coverage percentages.
- Kareem Hunt remains the selected unowned forecast reference. The page says "Active" from Sleeper, while the reviewed NFL census records no verified join. Correct the certainty of the status, not the reference selection.
- Independent source inspection finds additional lost-fumble events beyond the three offensive splits and recovery touchdowns absent from the saved research-PPR formula. Some zero-PPR quarantined rows have other nonzero components. Component attribution requires examination before exact scoring can be claimed.
- Independent exploratory transition analysis found 885 matched first-post-rookie comparisons with identical realized labels. The later veteran forecast improves MAE at each position on the matched cohort, so "NFL evidence generally worsens forecasts" is unsupported. A recent young-QB mean underprediction around 41 points warrants a registered test, not an automatic uplift. The diagnostic also found omitted no-rookie-appearance players; cohort accounting is part of the experiment, not optional cleanup.

## Preserved constraints

No live changes, market inputs in the player models, altered replacement scenario, new contender/rebuilder posture, dependency install, paid-data upload, shared-store write or edits under `frontend-studio`. Keep existing isolated lane ownership and all immutable runs. Native test-first implementation plans follow approval; root handles engineering details and independent review.

## Design workflow checklist

- [x] Inspect current project, accepted evidence and dirty state.
- [x] Reopen the three real Claude lanes for read-only preparation.
- [x] Compare bounded approaches and present the recommended football-level direction.
- [x] Ask one next-step/design question asynchronously; do not assume the preselected answer was submitted.
- [x] Record a scoped proposal and source-backed findings; no code edits.
- [x] Receive David's direction and release the bounded three-track design; each lane writes its exact native test-first plan before product edits.
- [ ] Implement test-first, independently review and verify the real local surface.

The user need not review technical file paths or choose implementation tools. No further user choice is needed for this bounded implementation.
