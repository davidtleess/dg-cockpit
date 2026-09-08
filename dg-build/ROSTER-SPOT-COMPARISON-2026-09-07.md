# Roster-spot comparison — authorized build, 2026-09-07

David approved the prior recommendation with “yes”: select an available player and someone he owns, then compare their expected production in 2026 and future seasons, including missing information and weak estimates. Codex owns routine implementation and all builder coordination. This is a new local reviewable increment; no publication authorization.

## Authority and settled design

Direct conversation evidence (read user records plus the immediately preceding assistant recommendation only): `/Users/davidleess/.codex/sessions/2026/09/07/rollout-2026-09-07T05-28-23-01a07b32-8430-7e20-a1d0-e5a24eebd830.jsonl`. The initial user message explicitly authorizes Codex to coordinate actual Claude builders, own technical choices, proceed after goal agreement, and avoid repeated technical approvals. Latest user “yes” approves the roster-spot design. This source is available for direct verification, not merely a peer assertion. Skill workflow checkpoints must not reopen settled approval or ask David to select implementation tools. No commits are authorized.

Five-second answer: “How does this available player compare with the player whose roster spot I am considering?” The user selects both; do not nominate a drop or preselect a supposed weakest roster player. Show current production and future production separately. One 2026 season and four future seasons are different windows, never an apparent like-for-like trend.

Desktop: compact player selectors and two clear player identities; aligned 2026 and 2027–2030 metrics; concise same-position comparison, annual detail and evidence disclosure. Phone: both chosen identities and current/future numbers near the top; responsive paired rows/cards without horizontal panning. Keep evidence details collapsible and human-readable. Use existing tokens and components. Add “Compare players” within research tabs and a “Compare [name]” action beside available players. Direct entry `?surface=research-preview&tab=compare`; opening from a row selects that available player and leaves roster selection to David. Preserve comparison choices across research tabs in the mounted page. No persistence requirement for comparison choices, no watchlist format change.

Same-position comparison may say one forecast is higher/lower for the explicitly named period, with signed full-precision arithmetic and honest near-zero wording. An exact tie is a tie. Across positions, show both forecasts but suppress a headline points winner/difference and explain that position and lineup slots matter. Never say a points difference is lineup improvement, complete dynasty value, breakout probability, a trade edge, or an add/drop verdict. No contender/rebuilder assumption, changing reference policies, new forecast, new market feature or price blend. The phone comparison should be readable before long evidence explanations.

## Scope and ownership

Base for every code worktree: accepted DG178 `8960e0ecf97677b1a79d077f21f4e2a2d9d33138`. Accepted preview8787 remains intact. Root integrates reviewed file snapshots into DG180 and serves a new local preview8788 using read-only frozen DG178 runs.

- Codex / DG180: integration, source verification, independent behavioral/desktop/mobile QA, final review and handoff. Own BOARD top status and this brief. No shared trunk edits.
- Actual Claude54331 `fa00374f-ec34-45ea-9ec0-926acc034407` / DG181: frontend, component tests, responsive design. Own only new `frontend/src/research/RosterComparison*`, optional comparison helper/tests, and minimal edits to `ResearchPreview.tsx`, `AvailablePlayers.tsx`, their CSS/tests. Depend on DG182 payload below; realistic fixtures are tests only. Do not edit backend.
- Actual Claude54410 `245fd3a2-d8ac-4908-9aad-b156da509998` / DG182: read-only adapter/endpoint and backend tests. Own new `src/dynasty_genius/ranking/roster_comparison.py`, `tests/ranking/test_roster_comparison.py`, `tests/contract/test_research_comparison_route.py` and minimal route change in `app/api/routes/research_available.py`. No main.py registration required when using its router. Do not edit frontend.
- Actual Claude54281 `376f54b0-2909-46df-837c-ace5852eb144`: independent specification, scientific/source, then final code review. Read DG180/181/182 and accepted sources only. Write findings and independent audit scripts/results to unique `/private/tmp/dg180-review-*` paths, never owner files. No model experiment. No assigned implementation worktree; explicitly a read-only review role. Root handles actual browser QA independently; reviewer may inspect supplied screenshots and build evidence.

Each implementation owner writes a native exact test-first plan in its own worktree before product edits, observes expected RED, implements, observes GREEN, and reports exact changed paths plus tests and open issues. Continue bounded work through ordinary fixes; do not stop after planning. Own ticket updates only; no simultaneous BOARD writes. No internal subagents needed for this small increment.

## Contract agreed by root before dispatch

`GET /api/research/comparison?run=<optional report run>&catalog=<optional catalog run>` returns one source-bound pair of player collections. Default uses the accepted pinned research report and bound catalog, as current endpoints do. New route composes existing accepted data without fitting, writing, or querying mutable production stores. Unknown/malformed source request fails explicitly, no silent fallback.

Payload:
```
{
  source: { report_run: string, catalog_run: string, report_sha256: string,
            ownership_as_of: string|null, nfl_status_as_of: string|null },
  forecast_years: [2026,2027,2028,2029,2030], future_years: [2027,2028,2029,2030],
  scoring_note: string,
  available: ComparisonPlayer[], roster: ComparisonPlayer[]
}
ComparisonPlayer = {
  sleeper_id: string, name: string, position: string, team: string|null,
  population: string, status: string,
  now_points: number|null, future_points: number|null,
  seasons: {season:number, points:number|null, estimate_class:string|null}[],
  starting_estimate: boolean, missing_reason: string|null,
  evidence_note: string
}
```

`available` contains unowned rows from the catalog, including missing, starting and recovered forecasts and explicit cut/retired/unknown statuses. Default selector scope is population=default (433); if opening from another available-table status, retain and label the user's selected row without asserting pickup eligibility. Owned/identity-unresolved watch entries must not masquerade as available choices. `roster` contains exactly David's roster from the accepted five-year report view, including missing estimates if any; join status/identity by stable Sleeper ID. Do not substitute all274 league players. Both selectors offer name search or a native accessible chooser; 433 option scrolling alone is insufficient for available discovery, row entry and searching must work.

Five-year roster expected points come from accepted annual player forecasts, not the impact number. A legitimate reconstruction is full-precision signed margin + reference points only when both are known and parity against original producer is verified; never derive from clipped advantage. Current route already exposes `player_expected_points`. Available values come directly from accepted catalog annual e_points. A complete future total includes every named2027–2030 term exactly once. Missing year makes total null, known0 stays0, negatives survive, NaN/infinity/overflow/duplicate seasons must fail, not become0. Duplicate/conflicting player IDs, divergent years/window/scoring/source hashes or incompatible snapshot must be refused. No added rounding in the API. Validate date/source alignment of the two collections and immutable report/catalog binding. Read/hash/parse same buffers for new loaders; avoid new verify-then-reread gaps. Existing frozen-source advisory need not expand into unrelated refactoring.

Evidence note concise and specific: accepted forecast vs starting estimate; current draft candidate versus future historical position baseline for seven starting estimates; research PPR is not exact league scoring; no invented player confidence or appearance-as-breakout label. Missing reason should be human readable in UI. Operational IDs and hashes belong in evidence, never the headline. Date humanization is frontend formatting only.

## Acceptance

1. Select any of433 default available players and any of27 David players; starting7, recovered4, missing73 remain usable and honestly distinct. Selection changes never leave prior player's numbers under a new name. Default shows neither a nominated pickup nor nominated drop.
2. Current/future and per-year values exactly reconcile to catalog013635Z/report214512Z; original825/report sha19e032a4067dff1759199a84720c0f879bb61f792fd3b2703808b55485a7af37 and catalog JSON shad08e89087c5038439d81421cfacba186ebedd4619be9d0015a9c42b74938597e preserved. No producer refit.
3. Meaningful tests: h5 roster membership, source mismatch, missing/nonfinite/duplicate/overflow values, negative starting estimate, zero versus missing, incomplete future, exact/near-zero ties, same-position and cross-position presentation, loading/error/empty/search states, row-entry and tab-state persistence, watchlist regressions.
4. Root independently verifies numeric values and identities against frozen actual inputs, not just owner receipts or mirrored fixtures. Recheck the saved league rules for context; do not perform lineup eligibility or exact scoring calculations in this scope.
5. Relevant backend/frontend suites, TypeScript/Biome/Ruff, build pass. Fresh real desktop/390px phone inspection of entry, both chosen players, changed selections, starting/missing cases, expanded details and keyboard; no document overflow, clipped explanation, JS errors, unsupported automatic action.
6. Preserve all prior work/evidence/shared data; no installs, commits, pushes, merges, production restart, deployment, transaction, market/model promotion, or frontend-studio access. Local preview8788 only; no re-pin8787. Root hands David the working link with evidence limits.

## Root dispositions after independent spec review (2026-09-07)

Review: /private/tmp/dg180-spec-review.md. No new product direction or user question is needed.
- F1: API matches report reconstruction exactly; producer parity tolerates only floating addition noise (root oracle abs1e-10/rel1e-12, observed worst2.84e-14). Exact UI tie means equal served floats; tiny difference is described as under one point, never actionable precision. Frontend never re-sums source totals.
- F2/F10: use resolved h5 board, require declared five-year window and correct union-reference quantity/length. Per-year references indexed by the declared global year order, not player-row order. A valid missing player-specific year becomes null; no zip truncation or substituting the2026 scalar.
- F3: both players' team/status from the catalog's Sleeper-ID join, dated to the same NFL status capture. Preserve names from each respective forecast view; use IDs, never names, to join.
- F4: approved small necessary context addition: `ComparisonPlayer.taxi_or_reserve?: boolean|null`, roster-only factual label sourced from report.davids_best_lineup_served_h0.excluded_taxi_or_reserve (six Sleeper IDs11576,12486,13269,13276,9484,9502). Validate list entries belong to David's roster; do not infer which storage type or ability to free an active spot. If source list absent, value null, not false. Available rows null or field absent. True gets concise “Taxi / IR in saved roster” by identity. This is a label, not lineup eligibility or a transaction recommendation.
- F5/F6: missing forecasts generic where source is generic; no invented no-history reason. Exact ties, incomplete future and missing roster estimates are synthetic tests; actual-source cases include Rourke negative starting, Burton known0 recovered, Dell/Westbrook-Ikhine near tie. Distinguish them in evidence.
- F7/F8/F9/F11: real timestamps normalized for display; seven starting estimates label future years as historical position averages; no appearance probability in this comparison. Non-default/unknown identity choices remain explicit and outside default433, no verified availability claim. Technical conflicts can be summarized honestly as unverified identity, without dumping IDs.
