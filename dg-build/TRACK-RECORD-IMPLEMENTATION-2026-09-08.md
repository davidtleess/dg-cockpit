# DG-205 — Us versus market track record implementation plan

> For actual parallel workers: execute the bounded tasks in this document in isolated ticket worktrees after implementation dispatch. David chose three actual Claude builders; internal subagents do not replace them. Root owns integration and publication gates.

**Goal:** Let David revisit a saved DG reading and see separately how its football forecasts performed against simple baselines and what happened to later FantasyCalc prices, without implying either establishes better dynasty decisions.

**Architecture:** Reuse the immutable DG189 archive. Add separate immutable evaluation enrollments, baseline inputs and grade artifacts referencing the original snapshot; never modify an archived declaration. Serve a typed track-record view through the existing Python API and a private, loopback-only local Lovable bridge. The established Lovable Track record route is the only destination.

**Tech stack:** Existing Python/FastAPI, stdlib and installed scientific packages; TanStack Start/React/TypeScript/Zod; existing pytest, Node tests, Playwright and axe. No added dependencies.

**Status:** READY_FOR_GATE — executable planning deliverable. Product implementation has not been dispatched. This document authorizes no publication or production changes.

## Authority and preserved state

David approved the recommended direction, then explicitly requested the plan, tickets and parallel roles, including the live agy Gemini session as a product brainstormer. Current task is planning and review, not product implementation. The existing Lovable adoption remains the interface direction.

Verified September8: `git ls-remote origin refs/heads/main` and DG204 HEAD both resolve to `4ad796c223d9b55bf18c3497cd3f69ba35cb7a6d`. DG200 is merged. DG204 has unrelated uncommitted CI/browser/hosting preparation; do not include or overwrite it. Shared trunk and all existing evidence remain untouched.

Relevant evidence inspected:
- DG204 `PRODUCT.md:1` — Lovable is primary interface.
- DG204 `app/config/workspace_evaluation_plan.json` — existing frozen production declaration, no registered market-movement grade.
- DG204 `src/dynasty_genius/capture/workspace_snapshot_store.py:638` — verified archived reading; loader/store/CLI and API already exist.
- DG204 `lovable/src/routes/track-record.tsx:24` — current placeholder, no evaluated outcome content.
- `WORKSPACE-TRACK-RECORD-REVIEW-2026-09-08.md` — DG189 merged; baseline formulas declared but baseline values never captured.
- DG204 `src/dynasty_genius/outcome_loop/model_vs_market_scorer.py:1` — a distinct August5 frozen experiment. Do not relabel or alter it for the current five-year ranking.

Do not change forecasts, replacement levels, valuation weights, model features or promotions. No new trade/pick pricing, decision logger, recommendation engine, historical performance study, scheduler installation, paid Lovable call, cloud data upload or deployment. No access to `/Users/davidleess/frontend-studio`. No dependency installs, shared data writes or public private-data fixtures.

## Product contract

The first screen answers: “What did we believe then, and what can we honestly assess now?”

1. Choose a saved reading. See when it was first saved, when the forecasts and market prices originated, and whether evaluation inputs were frozen then or reconstructed later.
2. See **Football forecasts** separately from **Market movement**. A football error is in points; a market move is a price change. No subtraction of FantasyCalc price from model value and no overall accuracy/edge score.
3. Before outcomes mature, see the scheduled assessment window and a useful plain-English pending reason. Missing inputs, unreadable archives and insufficient samples are different states.
4. Inspect included and excluded players, original/recovered/starting estimates, ties and misses. Frozen membership includes noncontributors; current search, roster or survivor status never selects the graded cohort.
5. Explicit **Save for tracking** stores the exact displayed sources and, when configured, the corresponding evaluation inputs. Duplicate sources retain their first save. If the snapshot saves but baseline enrollment fails, say exactly that; never report total failure or total success incorrectly.
6. Refresh the saved-reading list on explicit refresh and return to the page. A selected saved reading stays pinned by snapshot id; refreshing never substitutes today's numbers into yesterday's reading. Never call model producers from a browser refresh.
7. No outcome result is invented for the demo. Synthetic graded fixtures prove rendering only and never appear as David's live record.

## Plain-English completion preview

David opens Track record and selects his September 8 saved reading. The page shows the original September 6 forecasts and market dates; it does not rename them current. A football section explains how the forecasts will be compared with last year's points and the typical player at each position. A separate market section shows whether a new 90-day study has actually been enrolled. If its fresh capture or baseline is missing, it says that rather than displaying “Registered.” An unfavorable result uses the same layout as a favorable one. No new daily task is imposed on David in this milestone.

## Delivery order and role boundaries

Root owns the shared data contract and integration. Workers first review their proposed interfaces with root; after the contract is frozen they can implement in parallel using the same synthetic fixtures. DG206 supplies verified evaluation inputs to DG207. DG208 consumes only the typed view, so it can start against fixtures while backend work continues. Root assembles routes/transport last, then checks the complete path with real archived sources and synthetic controlled outcomes.

| Ticket | Worker | Owns | Dependency |
|---|---|---|---|
| DG205 | Codex root | contract, API, local bridge, integration, actual-source replay, final QA and handoff | incorporates DG206/207/208 |
| DG206 | actual Claude54331 | baseline sources, immutable enrollment store and capture CLI | frozen contract; existing archive |
| DG207 | actual Claude54281 | versioned evaluation policy, pure scoring, grading CLI and immutable results | contract; DG206 input shape |
| DG208 | actual Claude54410 | Lovable Track record UI, typed client and focused browser checks | frozen response contract; fixtures first |
| DG209 | actual agy Gemini | bounded product challenge and final manager-language review | reads plan and preview; no product edits |

All implementation tickets remain reserved, with Lane unclaimed until `dg-work.sh` creates their worktree. This avoids the script's already-claimed refusal. No builder edits BOARD.md or another owner's files. Root resolves contract amendments and broadcasts them before dependent edits.

## Scientific contract

### Production: preserve the existing declaration

Read the original `evaluation-plan.json` from the selected archive, not the current checkout's replacement of it. Implement `workspace-production-2026-v1` unchanged: 2026 REG weeks1–17, exact archived research PPR target, unfloored annual expected points, prior-season same-target points and prior-season position median baselines. Use all prior-season verified participants to compute the median, not the current survivors or forecast-covered subset. Verified nonparticipation may yield zero; absence from a row table alone cannot. Missing baseline/outcome values remain missing with reasons.

Build the candidate population from the union of the archived original report and catalog, retaining original/recovered/starting-estimate provenance, unforecast players and noncontributors. Do not hardcode825 as enrollment membership. Resolve duplicate identities consistently; disagreeing source values refuse rather than last-write-wins. Report producer results separately and provenance strata separately; do not pool different producers into one validated model. Compare each baseline on identical players with numeric forecast, baseline and complete outcome, and publish all exclusion counts. A secondary both-baselines-complete table may aid comparison but cannot replace the declared primary populations.

Primary metric is equal-position forecast MAE minus baseline MAE. Negative favors the forecast. Per-position MAE/RMSE are descriptive. All four positions must be evaluable for the aggregate; this does NOT require all four position intervals to be significant. Bootstrap players within position,10,000 resamples, seed189, percentile95% interval, for each baseline separately. Print both baseline results. Preserve the declaration's one-season-only claim restriction. No full-season point forecast is graded against weeks elapsed or the post-save remainder.

Freeze eligibility uses verified schedule bytes and actual archive `saved_at`, forecast artifact creation times and available cutoff evidence. If any declared target game began before the demonstrable forecast freeze, show `cutoff_ineligible` for the full-season prospective grade. Missing schedule/cutoff evidence is `input_unavailable`; do not assume preseason because of the date or a source label. Legacy baselines constructed now remain labelled reconstructed relative to the original save, even if their underlying2025 facts predate it. Record source knowledge time, source revision time and actual baseline-capture time separately. If original cutoff-valid bytes cannot be proven, no contemporaneous-baseline claim is allowed; retrospective provenance remains visible on any otherwise valid comparison.

No actual 2026 outcome performance is queried during implementation. Test the grader with synthetic closed seasons and source contracts. Actual outcome grading is a later explicit run after the registered window closes, using the code and declarations frozen here. Future seasons and five-year value remain ungraded until their own targets close; this ticket does not turn2026 MAE into validation of five-year value.

### Market: new prospective registration, not an invented price forecast

Register `workspace-market-movement-90d-v1` separately; never modify the old archive's `not_registered_for_grading` declaration. Hypothesis: players DG ranks higher relative to FantasyCalc subsequently experience greater relative market-price increases. This is an ordinal hypothesis, not a forecast of a specific FantasyCalc value, trade return or lineup gain.

- T0 is the new enrollment's actual UTC time, never a legacy snapshot's saved date. The selected saved reading's complete FantasyCalc start capture must be at or before T0 and no more than24 hours old. Otherwise market enrollment is `input_unavailable`; require a fresh verified reading. Archive original forecast age visibly. Do not silently swap market rows inside an old saved reading.
- Freeze the declaration, snapshot reference, full initial cohort, capture configuration, start prices, tie-aware ranks and trailing momentum input together. First eligible enrollment of a forecast identity under this plan is primary; later saves/overlapping registrations are descriptive, never independent replications. Forecast identity includes report hash, target, producer bindings and per-season numeric values, not merely a changed market date.
- Primary endpoint: first complete compatible capture with source `as_of` in `[T0+90 days,T0+93 days]`. Descriptive endpoint: first such capture in `[T0+30 days,T0+33 days]`. Select by timestamp and stable content hash on exact timestamp ties; never by the resulting performance. If none exists, mark unavailable after the window; while it remains open, awaiting capture. No nearest outside-window fallback. Existing capture stores are read only; no scheduler or collection job is enabled here.
- Freeze the full initial common ranked cohort and all exclusions. Use rank midpoints for true rank intervals: `gap = midpoint(market_rank) - midpoint(our_rank)`. Keep zero-floor tied players; alphabetical order never breaks a tie. Positive means DG ranks the player higher. Compute ranks on the same eligible population and preserve the original league/market settings.
- For start priceP0>0 and numeric end priceP1>=0, raw movement is `P1/P0-1`. A published end zero is -100%; missing/absent price is unknown. Startzero is retained but excluded from percentage-return calculations with its own count. No arbitrary epsilon or logarithm ofzero.
- Market adjustment is the median raw movement of the frozen initial common cohort with valid start/end prices. Subtract it from each valid movement. Report this available-case denominator and all missing/delisted cases; it is not a survivor-free total market index. An absent row can be called absent from a complete capture, never proven career exit.
- Simple comparator: frozen trailing30-day price momentum, using the latest complete compatible capture at or before `T0-30 days`, at most3 days earlier. Price must be positive at both start points. If historical capture lineage is absent, keep gap-only association descriptive and mark the baseline comparison unavailable. Do not backfill it after the endpoint arrives and call it frozen.
- Primary statistic: equal-position mean Spearman correlation of gap versus adjusted90-day movement, minus equal-position mean Spearman correlation of trailing momentum versus that SAME outcome on the SAME players. Show both correlations and the paired difference. Minimum10 eligible players and nonconstant predictors/outcomes in each position; otherwise aggregate is insufficient, with valid position figures descriptive. All-same movement gives undefined correlation, not zero. A market-wide doubling gives zero adjusted movement and no rank evidence.
- Uncertainty: paired player bootstrap within position,10,000 resamples, fixed seed205; recompute correlations and their difference on each sample. Require at least9,500 valid resamples for a reported interval; otherwise insufficient evidence. Two-sided percentile95% intervals. A favorable association requires gap-correlation interval wholly abovezero; outperforming the specified momentum comparator additionally requires the paired-difference interval wholly abovezero. Display negative and inconclusive results under the same rules. One enrolled cohort is not a repeatable edge. Player-bootstrap intervals do not fully account for team-wide shocks; report that limitation. A higher standalone correlation than momentum is not proof of incremental predictive information conditional on momentum, causality or profitable trading.
- Missing endpoint sensitivity: separately assign missing/absent endpoint players a hypothetical endpricezero, keeping original status labelled missing and never modifying primary data; recompute for initial-cohort members whose baseline was available. Show sensitivity regardless of direction, never as observed losses. This is a declared scenario, not a bound on all possible missing outcomes. With incomplete capture-wide coverage, no primary grade is produced at all.

## Shared input and output interfaces (frozen before implementation)

All APIs below are NEW unless marked existing. Root owns canonical JSON examples; workers use exactly these names. Complete files are immutable and content-addressed; timestamp metadata never changes an existing record. Unknown fields/invalid versions, duplicate ids, booleans as counts, NaN/Infinity, corrupt hashes and inconsistent source references refuse.

| Owner/module | Required callable interface | Result / side effect |
|---|---|---|
| DG206 `capture/track_record_inputs.py` | `build_evaluation_inputs(*, snapshot, artifacts, baseline_source, schedule_source, market_history_source, market_plan, captured_at)` | Validated enrollment document, per-stream readiness, and raw artifact bytes; no network or writes |
| DG206 `capture/track_record_store.py` | `save_record(root, *, kind, document, artifacts, recorded_at)` | Immutable enrollment or grade receipt; same-content duplicate returns original receipt |
| DG206 same store | `list_records(root, *, snapshot_id)` and `read_record(root, record_id)` | Validated records; corrupt content raises; no writes |
| DG207 `eval/workspace_track_record.py` | `grade_production(*, enrollment, outcome_source, evaluated_at)` | Production grade document or named unavailable/insufficient state |
| DG207 same module | `grade_market(*, enrollment, endpoint_source, evaluated_at, horizon_days=90)` | Market grade document or named pending/unavailable/insufficient state |
| Root `adapters/track_record_view.py` | `build_track_record_view(*, snapshots, enrollments, grades, selected_snapshot_id)` | Safe typed response; no mutation of original archive |

Each owner implements these interfaces completely and proves the behavior cases below. Root resolves any proposed schema amendment before dependent work starts.

Enrollment document `schema_version: track_record.enrollment.v1` contains `snapshot_id`, `forecast_identity`, actual `enrolled_at`, original source tuple, exact archived production-plan hash, new market-plan hash, source/target/league/scoring identities, original snapshot dates, per-stream readiness, frozen eligible IDs and position/provenance, per-player annual forecast and two numeric-or-missing production baselines, initial market ranks/prices/momentum, field-specific reasons, and all input-file hashes. Preserve raw source bytes separately. Include `captured_at`, `source_as_of`, `source_available_at` (nullable if unproven), `source_revision`, and `provenance_class` for each baseline source. Source as-of alone does not prove availability at a historical cutoff. Validate archived league configuration before arithmetic: recorded expectation is 12-team Superflex, full PPR, no TE premium, championship Week 17; actual snapshot settings are authoritative. FantasyCalc capture configuration must match across start/history/endpoint. Keep research scoring differences explicit; never silently rescore as exact Sleeper points.

For multiple records, the first eligible enrollment for a forecast identity/policy is primary. Exact duplicate grades return the same content identity; conflicting results for identical enrollment, policy and input hashes are corruption and refuse, never “take the best” or arbitrary latest. An outcome-source revision creates a new explicitly linked grade version; the UI must identify the source revision and cannot silently overwrite a prior result. Display actual market observation dates and elapsed days alongside the nominal30/90-day labels.

Baseline source adapter accepts explicit outcome manifest+CSV in existing `dg179_league_season_outcomes_v1` format and a source receipt containing source URLs, timestamps, identity and schedule/coverage evidence. Read once into buffers, hash those buffers and validate copies made from those same buffers; `OutcomeArtifact.load` by itself does not prove source completeness or a historical knowledge date. Require the prior season in admitted seasons and verified week/game coverage. Compare `TargetSpec` measurement fields with the forecast; `labels_through` is checked separately against cutoff and target season, not required equal to the prior-year baseline's metadata. Roster status without complete outcome evidence cannot supplyzero. A missing row remains missing. Use original archived producer identifiers, not newly looked-up roster positions.

Schedule input supplies per-season game id, REG flag, week, kickoff UTC, finalized status and source hash/receipt. Outcome grading input supplies the same-target per-player season totals plus complete underlying source artifacts/identity evidence and closed-window proof. No guessed provider filenames or hand-retyped scoring formulas; reuse the accepted aggregation target, or refuse if it cannot be reproduced. Market input supplies full player rows, capture id/as-of/known-at/configuration and completeness evidence. IDs are canonical Sleeper ids, identity bridges are frozen with the inputs.

Grade document `schema_version: track_record.grade.v1` references enrollment id, exact policy/source hashes, one claim (`football_production` or `market_movement`), actual evaluation time, target/horizon, eligible/scored/missing counts, producer/position/provenance summaries, baseline comparisons with metrics and intervals, per-player outcomes/exclusions, separate missing-data sensitivity and `decision_supported:false`. No edits to `snapshot.json`; legacy `evaluation_status:ungraded` remains true of the archive itself.

View response `schema_version: track_record.view.v1` has `status: available|not_configured|unavailable`, `snapshots` (existing safe receipt fields), `selected` (receipt ornull), `production` and `market` stream objects, and `save_capability`. Each stream uses `state: not_registered|awaiting_horizon|awaiting_capture|input_unavailable|cutoff_ineligible|insufficient_evidence|graded`, plain-English `reason`, target window, provenance class, counts and nullable result. `graded` never means positive; neutral, unfavorable and favorable results all render. No filesystem paths or secret/provider credentials in responses.

Existing backend archive endpoints remain `/api/research/snapshots` and `/api/research/snapshots/{snapshot_id}`. Root adds `GET /api/research/track-record?snapshot_id=<id>` and `POST /api/research/track-record/capture` with `{expected:{report_run,report_sha256,market_sha256,league_sha256,catalog_run,catalog_content_sha256}}`. POST independently reloads current server sources and refuses409 when expected differs. Never accept browser forecast/baseline values. Return exact archive and enrollment success separately, e.g. `snapshot_status:saved|already_saved`, `enrollment_status:saved|already_saved|input_unavailable`; return original save times. GET never captures. Root's existing-archive save logic must retain duplicate protection and first-record semantics.

Local Lovable bridge routes are `/api/private/track-record` and `/api/private/track-record/capture`. Root implements them in new route files and a server-only `track-record-bridge.server.ts`. It is opt-in, only for a Node preview actually bound to127.0.0.1, accepts an explicit loopback upstream, fixed paths/methods only, refuses redirects, rejects external Host/Origin and cross-site mutations, and never accepts an upstream URL/path from the browser. Hosted builds without the explicit local mode return unavailable; do not infer that same-origin is authentication. No CORS wildcard, public static archive, bearer secret in browser, tunnel or implicit backend port 8000 fallback. DG204 hosted privacy/authentication remains a separate dependency for a future hosted release.

## File ownership

### DG206 — baseline and immutable inputs
Create only:
- `src/dynasty_genius/capture/track_record_inputs.py`
- `src/dynasty_genius/capture/track_record_store.py`
- `scripts/capture_track_record_inputs.py`
- `tests/contract/test_track_record_inputs.py`
- `tests/contract/test_track_record_store.py`
- `tests/contract/test_capture_track_record_inputs_cli.py`
- `tests/fixtures/track_record/` synthetic input examples only; DG206 owns fixture edits and publishes contract changes through root.

CLI requires explicit `--archive-root --snapshot-id --evaluation-root --baseline-manifest --baseline-csv --baseline-receipt --schedule --market-plan`; optional `--market-history` means absent comparator is unavailable. Clock is actual UTC; no flag can assert an earlier capture time. No implicit shared output. Support dependency injection of a clock in tests. Safe paths and append-only atomic publication follow the existing store's proven rules; same-content duplicate returns original receipt, corrupt duplicate refuses. Grade storage is shared through this module, so DG207 never writes an independent incompatible store.

### DG207 — science and grading
Create only:
- `src/dynasty_genius/eval/workspace_track_record.py`
- `app/config/workspace_market_movement_90d_v1.json`
- `scripts/grade_workspace_track_record.py`
- `tests/contract/test_workspace_track_record.py`
- `tests/contract/test_grade_workspace_track_record_cli.py`

Do not edit the original `workspace_evaluation_plan.json`, existing DG018 scorer or outcome-loop schedule. CLI requires explicit `--evaluation-root --enrollment-id --claim --outcome-manifest --output-root`; market additionally uses `--horizon-days` restricted to30 or90 and complete capture inventory to enforce deterministic endpoint selection. It cannot scan arbitrary future data automatically. Write grade via DG206 store and immutable run-scoped diagnostics. Baseline/outcome identity mismatch refuses before metric computation. Record code identity honestly for dirty runs; include actual source-file hashes in addition to commit metadata.

### DG208 — Lovable product experience
Create/modify only:
- modify `lovable/src/routes/track-record.tsx`
- create `lovable/src/components/dg/TrackRecord.tsx`
- create `lovable/src/lib/dg/track-record.ts` (runtime validation, client requests and query options)
- create `lovable/tests/track-record.test.ts`
- create `scripts/check_track_record_browser.mjs`

Do not edit shared `queries.ts`, `backend.ts`, AppShell, original snapshot store or root bridge. Reuse existing navigation/identity components; no new design system. New client uses its own query keys. Raw hashes and internal boolean flags stay out of normal copy. Search/filter affects the detail table only, never aggregate grading membership. URL selection persists across reload and back/forward; failure cannot silently load a different snapshot. Save followed by refresh must reflect partial success and source changes correctly. Page-return refresh only refreshes list/status; selected snapshot and its forecast values stay pinned.

### DG205 — root integration and independent verification
Create/modify only after implementation dispatch:
- create `src/dynasty_genius/adapters/track_record_view.py`
- create `app/api/routes/workspace_track_record.py`; modify `app/main.py` to register it
- create `tests/contract/test_workspace_track_record_api.py`
- create `lovable/src/lib/dg/track-record-bridge.server.ts`
- create `lovable/src/routes/api/private/track-record/index.ts`
- create `lovable/src/routes/api/private/track-record/capture.ts`
- create `lovable/tests/track-record-bridge.test.ts`
- generated `lovable/src/routeTree.gen.ts` only if the existing build produces it
- isolated runtime configuration and new `runs/<UTC>/` evidence only.

Root may factor the existing archive route's validated capture helper into a reusable function if needed, with its tests rerun; existing archive behavior/schema must remain unchanged. This narrow root-owned amendment prevents duplicating its safeguards. No broad API refactor.

DG209 owns only its product review document under `dg-build/reviews/`; actual Gemini performs no builder edits. It reviews the final desktop and phone experience once, after root verifies the data.

## Test-first work sequence

### 0. Establish isolation and lock the contract — root
- [ ] Verify live session identities/activity again before implementation dispatch. Stop if a new user assignment occupies a seat; reassign by role, never by stale nickname.
- [ ] Verify current remote main. Base all four implementation worktrees on one pinned commit. If remote changed from4ad796c2, root reviews the diff and updates this base before workers start.
- [ ] Create DG205/206/207/208 serially through `dg-work.sh` while Lane is unclaimed, then claim each. Do not copy DG204 uncommitted work.

```bash
DG_SESSION=Codex-DG205 DG_REPO=/Users/davidleess/dg-wt/DG-200 /Users/davidleess/dg-build/bin/dg-work.sh DG-205 --from 4ad796c223d9b55bf18c3497cd3f69ba35cb7a6d
DG_SESSION=Claude54331 DG_REPO=/Users/davidleess/dg-wt/DG-200 /Users/davidleess/dg-build/bin/dg-work.sh DG-206 --from 4ad796c223d9b55bf18c3497cd3f69ba35cb7a6d
DG_SESSION=Claude54281 DG_REPO=/Users/davidleess/dg-wt/DG-200 /Users/davidleess/dg-build/bin/dg-work.sh DG-207 --from 4ad796c223d9b55bf18c3497cd3f69ba35cb7a6d
DG_SESSION=Claude54410 DG_REPO=/Users/davidleess/dg-wt/DG-200 /Users/davidleess/dg-build/bin/dg-work.sh DG-208 --from 4ad796c223d9b55bf18c3497cd3f69ba35cb7a6d
```
Expected: distinct `ticket/DG-NNN` branches at the pinned base; prior worktree contents unchanged. Use existing isolated dependency copies if needed; never run install into symlinked dependencies. Root publishes synthetic JSON examples from the contract before parallel implementation. Worker fixture disagreements return to root, not silent divergent schemas.

### 1. DG206 red → green: baseline sources and enrollment
- [ ] Add named tests: `test_prior_median_uses_full_prior_population`, `test_absent_row_is_missing_not_zero`, `test_reconstructed_baseline_keeps_actual_capture_time`, `test_target_mismatch_refuses`, `test_hash_mismatch_refuses`, `test_cutoff_evidence_required`, `test_save_duplicate_keeps_original_time`, `test_archive_bytes_unchanged`, `test_partial_market_readiness_does_not_erase_production_inputs`, `test_corrupt_record_refuses`.
- [ ] Run the focused suite before implementation: expect failures for missing new functions; after minimal implementation rerun to all pass. Include a source of prior points0,10,100 with only the100 player surviving in the current forecast set: median must remain10, not100. A missing player's absent row must staynull.

```python
# Exact arithmetic contract example; wrapper fixtures are built by DG206.
assert median_of_verified_prior_participants == 10.0  # from [0.0, 10.0, 100.0]
assert missing_player_baseline is None
assert first_receipt['recorded_at'] == duplicate_receipt['recorded_at']
assert archived_bytes_before == archived_bytes_after
```

```bash
PYTHONDONTWRITEBYTECODE=1 .venv/bin/python -m pytest tests/contract/test_track_record_inputs.py tests/contract/test_track_record_store.py tests/contract/test_capture_track_record_inputs_cli.py -q
```
- [ ] Exercise CLI with explicit synthetic source files in a new run; occupied/corrupt destinations, future source times, unsafe paths and unavailable metadata refuse without modifying old records. Deliver exact changed paths, source mapping table, test output and input schema to root/DG207.

### 2. DG207 red → green: separate evaluations
- [ ] Production cases: before-first-kickoff versus mid-week freeze; full-window versus partial outcomes; positive/negative forecast errors; every baseline on paired same players; zero versus unknown; per-producer and estimate strata; missing one position suppresses aggregate; deterministic95% intervals; changed policy/hash refuses. Use errors [2,4] versus [4,8] in each position: forecast MAE3, baseline MAE6, difference-3. An unfloored negative forecast remains negative.
- [ ] Market cases: ties reordered give same result; uniform doubling is undefined rank association, not a win; true end zero gives-100%; absent price isnull; frozen momentum missing means no baseline-comparison claim; first valid endpoint in fixed window wins regardless of later more flattering capture; duplicate ids refuse; one missing position suppresses aggregate; fixed seed reproducibility; repeated forecast identity cannot create independent primary enrollment; missing endpoint sensitivity separate from primary.

```python
assert ((110.0 / 100.0) - 1.0) > 0.099999
assert ((0.0 / 100.0) - 1.0) == -1.0
assert primary_missing_endpoint is None
assert market_constant_result['state'] == 'insufficient_evidence'
assert grade['decision_supported'] is False
```

```bash
PYTHONDONTWRITEBYTECODE=1 .venv/bin/python -m pytest tests/contract/test_workspace_track_record.py tests/contract/test_grade_workspace_track_record_cli.py -q
```
- [ ] Run red before implementing metrics, then all cases green. Grade only synthetic fixtures. Produce one unfavorable and one inconclusive result; no privileged success-only path. Hand root the new immutable registration and pure scorer. No existing performance claim is changed.

### 3. DG208 red → green: useful Lovable states
- [ ] Runtime-schema/client tests reject malformed results, wrong selected id, NaN, misleading `graded` without outcome binding, and old-schema fallback. Browser tests exercise unavailable, empty, saved-unregistered, waiting, missing baseline, cutoff-ineligible, insufficient, unfavorable/inconclusive/favorable graded fixtures and partial-save success.
- [ ] Implement the page and pinned selection using the agreed client. One readable primary narrative, separate claim blocks; numeric diagnostics only in details. Show reconstructed baseline status adjacent to its comparison and all exclusion counts accessible by keyboard/touch.

```bash
cd lovable
npm test
npm run typecheck
npm run lint
npm run build
npm run build:local
```
Expected: existing and new tests pass; both existing Cloudflare and localNode builds succeed. Browser script uses already installed Playwright/axe. It renders the real application with intercepted synthetic API fixtures; it must not expose the real archive as a public asset. No actual-source access from a browser fixture.

### 4. DG205 root integration red → green
- [ ] API tests: absent config, reachable empty, corrupt archive503, unknownid404, stale browser409/no write, exact duplicate, successful save/enroll, archive-saved/enrollment-failed response, history list never writes, graded result bound to selected snapshot/policy. Bridge tests: disabledmode, hostedmode, external Host/Origin, cross-site POST, arbitrary upstream/path, upstream redirect, timeout, valid explicit loopback.
- [ ] Integrate owner patches by explicit file lists into DG205, preserving original workers and evidence. Check line-by-line math and source correspondence independently; DG207 cannot be sole certifier of its scorer, and DG208's prior archive authorship is disclosed rather than treated as independent archive review.

```bash
PYTHONDONTWRITEBYTECODE=1 .venv/bin/python -m pytest tests/contract/test_workspace_track_record_api.py tests/contract/test_workspace_snapshots_api.py tests/contract/test_workspace_snapshot_sources.py tests/contract/test_workspace_snapshot_store.py tests/contract/test_capture_workspace_snapshot_cli.py -q
```
- [ ] Copy the verified original archive to a new private DG205run, never operate writes against the original. Root validates it with `list_snapshots`/`read_snapshot`; compare every raw/derived byte to the original. Present its original September8 first save/September6 forecastdate unchanged. The preserved input is:
`/Users/davidleess/dg-wt/DG-189/runs/20260908T014624Z/archive/f67ae44e44fd51f0534f92c875a01d2bfc1b8a720bfc96025fc6115d45220dc0`.
- [ ] Start dedicated loopback Python API and LovableNode preview on unused ports chosen after checking listeners. Bind archive/evaluation roots to private realrun directories; missing input configuration renders unavailable honestly. No production process restart, no old preview stop. No hardcoded port assumption in tests.
- [ ] Real desktop 1440px and phone 390px, plus320px overflowcheck: list → selectedsavedreading → baseline details → save → duplicate → reload → tabreturn. Inspect rendered source dates, pinning, partial failures, keyboardfocus, accessible names and contrast. Record screenshots, zero axe violations/overflow/consoleerrors and expected networkpaths. Include deliberate stale-source change and malformed-grade injection once to prove they are caught.
- [ ] After focused checks pass, run the required backend suite and applicable legacyfrontend gate in the isolated root with private runtime copies, then the Lovable tests/types/lint/both builds. Do not repeat passed full gates without changes. Baseline: hostedCI has21 pre-existing failures; compare identities if reproduced, never weakenchecks or describe them asnew. Real private assets/dependencies stay ignored.

```bash
PYTHONDONTWRITEBYTECODE=1 .venv/bin/python -m pytest -q
npm --prefix frontend run gate
npm --prefix lovable test
npm --prefix lovable run typecheck
npm --prefix lovable run lint
npm --prefix lovable run build
npm --prefix lovable run build:local
git diff --check
```

### 5. Independent review and handoff
- [ ] Root recomputes representative production and market fixtures with separate small arithmetic/oracle code, including both baselines, ties, truezeros and missing endpoints. Verify manifest/source bytes against the rendered selectedreading.
- [ ] Actual Claude54331 reviews DG207 metric/input binding after its capture task; actual Claude54281 reviews root/DG206 lineage and API refusals after its scoring task. Neither certifies its own work. DG208 reviews final display against the contract; root owns actual browser acceptance. Request one bounded review each after an integratedcandidate exists.
- [ ] Gemini reviews the actual final screen for the5second football question, understandable baselines and absence of misleading claims. Root adjudicates all suggestions; brainstorm output is not evidence of scientific correctness.
- [ ] Stop only new temporarytest servers; preserve reviewable preview and immutable evidence. Report changedfiles, tests, current source, model and as-of dates, limitations and exact remaining gate. No commit/push/merge/deploy within this planning authorization.

## Completion criteria and later work

Local milestone complete means: David can browse the real preserved archive through Lovable, deliberately save a source-matched reading, see baseline enrollment or its precise missing-input state, and the separate graders pass independent synthetic closed-window checks. All raw records remain replayable and unchanged; new results are joined by immutable reference. Actual source gaps must be reported as gaps, not passed off as a populated prospective study. A prospectively enrolled market study is complete only when a fresh compatible startcapture AND trailingbaseline exist and are frozen before future outcomes.

Outcome maturity is not an implementation blocker: pending is expected. Missing source access, unsupported runtime transport or an unresolved contract contradiction IS a delivery limitation with a named owner. The local track record implementation does not require Lovable credits. Hosted release DOES depend on DG204 credits plus explicitly approved private/authenticated data delivery. Existing global privacy question does not block localplanning or localimplementation; no approval is inferred for cloud data.

Deferred: daily capture scheduling, production deployment, new price forecast model, earlier-history reconstruction studies, point/pickprice conversion, horizon/replacement sensitivity studies, and recording actualtrade/waiverdecisions. They need separate bounded scopes; workers must not start them to stay busy.

## Planning review dispositions

All three actual Claude sessions contributed source/planning reviews; the actual agy Gemini session contributed product options. Root accepts the separation of claims, existing-store reuse, honest waitingstates, cutoff checks and simple baseline visibility.

Root corrections override conflicting suggestions in raw reviews (including remaining mistakes in their addenda):
- A preserved real archive DOES exist and passes the merged store's verifier. An unset shell environment variable never proved otherwise. It contains825originalforecasts,388pairedranks,27 roster and433relevantavailable; those are specificreceiptcounts, not universal cohortconstants.
- Do not backdate a new marketregistration to that oldsave. Do not discard floor-tied players or break ties alphabetically. Handle publishedzero mathematically; undefinedcorrelation is not zero.
- DG018 grades a different experiment. Neither its results nor any one-season score validates five-year value or decisions.
- Original snapshot evaluationstatus remains unchanged; new resultstatus comes from separatelyverifiedrecords. Correct six-source-field tuple includes catalog_content_sha256.
- No claim that outcomes are already frozen, no 60-day horizon, and no “registered” label before successful enrollment. The simple opening question controls over Gemini’s suggested unverified kickoff/consensus-success language.
- No public static archive and no assumption that a same-origin route is authenticated. No raw decision_supported property or implementation vocabulary in product copy.
- Gemini's discountedlegacyDVS description, blanket825 cohort, all positions-individually-significant rule and unverified preseasoncounts were rejected. Equal-weight acceptedvalue and the archived productiondeclaration control.

Planning reviews are preserved under `reviews/DG205-20260908/`; they are attributed inputs, not final instructions. This plan and its tickets are the reconciled contract.

