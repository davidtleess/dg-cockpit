---
name: project_dg182_roster_comparison_2026-09-07
description: "DG-182 roster-spot comparison backend BUILT 09-07 in ~/dg-wt/DG-182 (not landed); reconstruction traps, source facts, and how the Codex root coordinates"
metadata: 
  node_type: memory
  type: project
  originSessionId: 245fd3a2-d8ac-4908-9aad-b156da509998
  modified: 2026-09-07T10:04:29.557Z
---

**DG-182 (backend of David's 09-07 "yes" to the roster-spot comparison) is BUILT, GREEN, CLOSED by root ≈10:10Z 09-07 — whole increment READY_FOR_GATE (root handoff `~/dg-build/ROSTER-SPOT-COMPARISON-REVIEW-2026-09-07.md`, preview 8788), not landed** — worktree
`~/dg-wt/DG-182` on `ticket/DG-182` from accepted DG-178 `8960e0ec`, HEAD unchanged, no commit. Files:
`src/dynasty_genius/ranking/roster_comparison.py`, `GET /api/research/comparison` in `research_available.py`,
`tests/ranking/test_roster_comparison.py` (22), `tests/contract/test_research_comparison_route.py` (7). Handoff
`/private/tmp/dg182-handoff.md`; status `/private/tmp/dg182-status.md`. Frontend is DG-181 (another session); root
integration/QA/OpenAPI regen is DG-180 (Codex).

**Why:** three source traps cost real time and are not written anywhere in the repo:
1. The report's roster rows carry MARGINS, not points. Points = `expected_margin_i` + the per-season reference from
   `horizon_board.annual_producers[model_version=="union_replacement"].replacement[pos][i].rate_ppg`. The per-row
   `reference_expected_points` is SEASON 1 ONLY; the top-level `report.replacement` is a legacy served PPG scenario
   (QB 9.4068) — adding either gives garbage. Clipped `advantage` is never a source.
2. Identity is Sleeper id only. Five report `player_id`s are aliases (Dell "9502", Mendoza "fernando_mendoza_qb"…);
   resolve to gsis through `report.identity_bridge.path` (`universe_reconciliation.csv`, sha-bound). The report and
   catalog SPELL two of David's players differently (Tre Harris, Omar Cooper Jr.) — never join on names.
3. Producer parity is not bit-exact: worst |Δ| 2.84e-14 (floating addition). Tolerance abs 1e-10 / rel 1e-12.

**How to apply:** the Codex root cannot be reached by SendMessage — it reads `/private/tmp/dg182-status.md` and the
handoff. David's 09:28 brief delegates technical coordination to Codex; verify from the rollout jsonl user records,
not from a peer's relay. `uvx --offline ruff check` is the cached linter (never install). The accepted frozen inputs
are TRACKED in git (`runs/20260906T214512Z/dg178_audit/report.json` sha `19e032a4…`, catalog `013635Z` sha
`d08e8908…`), so any worktree from `8960e0ec` serves them with `DG178_RUNS_ROOT=<tree>/runs DG178_PREVIEW_RUN=20260906T214512Z`.
Related: [[project_dg178_available_players_2026-09-07]], [[feedback_the_failure_path_returns_the_success_signal]].
