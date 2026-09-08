---
name: project_dg181_roster_comparison_frontend_2026-09-07
description: "DG-181 \"Compare players\" research tab built 2026-09-07 in ~/dg-wt/DG-181 (frontend only, not committed); where it lives, what root ruled on copy, and the three traps that cost time."
metadata: 
  node_type: memory
  type: project
  originSessionId: fa00374f-ec34-45ea-9ec0-926acc034407
  modified: 2026-09-07T10:09:34.835Z
---

**DG-181 (frontend of the roster-spot comparison) was built 2026-09-07 ~09:45–10:10Z** in worktree
`~/dg-wt/DG-181` (branch `ticket/DG-181` from accepted DG-178 `8960e0ec`), by this session (Claude54331)
under Codex-orchestrator dispatch that David authorized (his "yes" at 09:37Z in the Codex rollout log).
**Nothing committed**; root (Codex, DG-180) copies file snapshots and serves preview 8788. Handoff:
`/private/tmp/dg181-handoff.md`; status channel `/private/tmp/dg181-status.md` (Codex reads tmp files,
NOT SendMessage — "Codex orchestrator" is not a Claude peer name).

Files: `frontend/src/research/comparisonHelpers.ts` (+test), `RosterComparison.tsx/.css/.test.tsx/.fixtures.ts`,
`RosterComparison.plan.md`, minimal edits to `ResearchPreview.tsx` (third tab, `?tab=compare`, lifted
selection) and `AvailablePlayers.tsx` (`onCompare` → "Compare {name}"), plus one census row each in
`src/styles/rawCssAuditBaseline.json` / `visualCraftAuditBaseline.json`. Consumes DG-182's
`GET /api/research/comparison` (contract in `~/dg-build/ROSTER-SPOT-COMPARISON-2026-09-07.md`).

**Why:** root's copy rulings are product decisions, not mine — do not re-litigate: prose says the
ABSOLUTE magnitude ("lower by 41.3 points"), signed delta only in the Difference column; cross-position
= "raw point totals alone do not settle this roster choice"; one short caveat line ("Projected
production; your lineup and roster needs still matter."); sidecar classes read "draft-based starting
estimate" / "historical position average"; optional `taxi_or_reserve` → "Taxi / IR in saved roster".

**How to apply:** (1) any NEW `.css` under `frontend/src` fails two census tests until a row is added to
BOTH baseline JSONs — compute the counts with the tests' own regexes, never guess (the regex counts
`@media (max-width: 640px)` and `border-left: 3px` as "raw spacing"). (2) A `biome-ignore` for
`useSemanticElements` must sit on the line BEFORE the JSX element (`{/* … */}` inside JSX), not above the
attribute — above the attribute it is reported as an unused suppression. (3) zsh: `$pipestatus`
(lowercase); `${PIPESTATUS[0]}` prints empty. (4) Never print "FA" for a null NFL team — David ruled
"FA" = unowned in his league ([[project_dg145_landed_2026-09-04]]). Related: [[project_dg178_available_players_2026-09-07]].

**Phone finding 10:14Z → fixed 10:19Z:** at 390×844 the second card sat under the bottom nav because
two collapsed chooser rows + a four-line lede preceded the pair. Ruling applied: once both players are
chosen the choosers are NOT rendered; each card carries `Change {side}`; the lede is one sentence
("2026 is one season's forecast; 2027–2030 is four seasons added together."). **Vertical budget above the
fold is the phone constraint on this surface — measure from root's screenshots, not from jsdom.**

**CLOSED by root ~10:2xZ 09-07: COMPLETE / READY_FOR_GATE.** Final independent review PASS, phone issue
closed. Root handoff `~/dg-build/ROSTER-SPOT-COMPARISON-REVIEW-2026-09-07.md`; preview 8788 for David;
8787 preserved; nothing committed/merged/deployed. DG-181 tree retained as evidence — do not delete or
"clean up". Awaiting DAVID's gate, not any lane's.
