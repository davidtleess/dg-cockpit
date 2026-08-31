# DG-109 — The copy dictionary: no raw pipeline key may reach the screen

**Layer:** 6  ·  **State:** done  ·  **Lane:** Davids-MacBook-Pro-79920  ·  **DG 3.0**  ·  **frontend-only · DG-091 phase 2A**
**Source:** David's 2026-08-29 ruling (verbatim in [[david_rulings_dg3]] and DG091-DESIGN-BRIEF.md):
*"prose and layman's language… Not a data science, data engineering visualization."* This ticket
implements the Studio spec's §1 engineering requirement — it is a direct consequence of his words,
not a new design opinion, so it builds without waiting on the phase-2B design answers.

**Problem — observed on David's live screen 2026-08-30:** the player card renders
`age_not_near_position_cliff`, `no_market_overlay`, `no_internal_value_signal`,
`engine_b_not_decision_grade`, and `Signal completeness 83% — missing: ppg_t_minus_1,
ppg_t_minus_2, snap_share_t_minus_1`; the front page renders `vintage_changed_no_score_delta`,
`fantasycalc_overlay`, `captured_at_vs_report_generated_at — fresh (age 0h)`; the inspector
renders the raw sleeper id `12508` under the player's name as if it were information.

**Build:** ONE shared copy module (extend `frontend/src/lib/copy.ts`, consolidating the four
drifting partial maps: `describeStatusToken`, SystemHealthCard's display-name maps,
`SIGNAL_DISPLAY`, and the title-attr convention). **Render rule, enforced by test: no string
containing an underscore or an ALL_CAPS token may reach the DOM.** Unmapped key fallback:
humanize, render ONLY inside a receipt/"where this comes from" surface, never in body copy, and
warn in console so the crew adds the mapping. Seed content = the Studio spec's §6 voice guide.

**Honesty law (binding):** every mapped string must preserve its fact. `age_not_near_position_cliff`
→ "Age is on his side — years away from the typical QB decline." Absence renders NOTHING
("No counter-argument available" / "No risk flags available" disappear — absence is not content).
A caveat may never soften into permission.

**Done looks like:** a test asserting the no-underscore/no-ALL_CAPS render rule over the rendered
DOM of the front page, player card, and league surfaces; every string above replaced by prose;
vitest green; verified in a real browser at 1440 and 390.
