---
name: project_dg187_workspace_frame_compare_2026-09-07
description: "DG-187 WorkspaceFrame + WorkspaceCompare built 2026-09-07 in ~/dg-wt/DG-187 — David's Claude Design import, what was deliberately NOT copied from the design, and the reusable landed helpers."
metadata: 
  node_type: memory
  type: project
  originSessionId: fa00374f-ec34-45ea-9ec0-926acc034407
  modified: 2026-09-07T14:32:37.189Z
---

**DG-187 built 2026-09-07 ~14:21–14:31Z** in `~/dg-wt/DG-187` (branch `ticket/DG-187` from
**`2a4bcb8e`**, the merge David's "commit push merge" produced at 12:05Z). Handoff
`/private/tmp/dg187-handoff.md`, status `/private/tmp/dg187-status.md`. **Not committed**; root
(Codex, DG-186) integrates and owns preview 8790. DG-188 owns Board/PlayerPanel in parallel.

**⭐ AUTHORIZATION:** David's own message, rollout line **2490, 14:07:02Z** — import Claude Design
project `be3e0bfc-352f-4d88-a150-b49a96f8890a` and *"Implement: `Dynasty Genius Workspace.dc.html`"*.
Source files were imported to `/private/tmp/dg-design-import-20260907/` (workspace HTML, Board,
PlayerPanel, PhoneScreen, support.js).

**Why this matters beyond one ticket:** the design file is a REVIEW DECK, and most of what looks
like product in it is sample data. What must never be copied: the sample team name "Woodbury
Riders", the sample league name "Redzone Champions", sample dates/percentages/ages/prices, the
activity lines, and the design-review chrome (mode toggles, phone mock frame, "values are sample
data" note). **And one substantive correction: the design labels the current-season figure "ppg";
our forecasts are season TOTALS.** Labels come from `periodsFor`, never a literal.

**How to apply (landed helpers on `2a4bcb8e`, reuse these — do NOT rebuild them):**
- `market-ranks/MarketRanks.tsx` exports `rankText(interval)` → `#15` / `#230–388` / `—`, and
  `comparisonText(comparison)` → "We rank him at least 110 places higher". Root RENAMED my DG-184
  files during integration: the landed layout is `MarketRanks.tsx` / `MarketRanksContext.tsx`, not
  the `marketRanks.ts` / `RosterRanks.tsx` I wrote. **Check what actually landed before importing.**
- `research/comparisonHelpers.ts` (my DG-181 module, landed unchanged) exports `periodsFor`,
  `compareForecasts` (same-position only; refuses across positions), `classWord`, `CAVEAT`,
  `humanizeDate`. `research/availableHelpers.ts` exports `formatAvailablePoints`.
- Generated types now carry `MarketRanksAvailable` / `MarketRankPlayer` / `RankInterval` /
  `RankComparison` in `lib/api`.

**Traps this cost time on again:** (1) a new `.css` under `src` needs a row in BOTH CSS census
baselines or two audit tests fail — compute with each audit's own regexes; (2) `<span>Label</span>
<span>{count}</span>` with no space renders the accessible name "Roster27" — put a real `{" "}`
between them; (3) a shared read-only contract file can be reformatted by root mid-build, so re-copy
and re-hash before the final gate; (4) `{ id: over.id, ...over }` is TS2783 — spread only.

Related: [[project_dg184_market_ranks_frontend_2026-09-07]],
[[project_dg181_roster_comparison_frontend_2026-09-07]].

**CLOSED by root 09-07:** the six files were imported into DG-186 and **root owns the integrated
copies; `~/dg-wt/DG-187` is FROZEN and diverges from what ships.** Contract answers, durable for the
whole DG-186 program: (1) **the parent Workspace owns the `h1`** — a view component must NOT render
one, so root strips the `<h1>Compare</h1>`; (2) the compare pools are `ownership` "available" and
"roster" only, excluding league/outside/unknown — confirmed correct; (3) the fixed verified league
settings line is acceptable while the configured rank endpoint validates them.
⚠ My single estimate label was a simplification: per the actual source the **seven starting
estimates use 2026 draft capital for the current season and a historical positional baseline for the
future years**, so a per-season class is needed, not one label for the row. Root is correcting that.
