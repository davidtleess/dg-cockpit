---
name: project-dg165-rookie-capital-candidate-2026-09-06
description: "DG-165 draft-capital rookie forecast (davidleess-a3, ~/dg-wt/DG-165, ticket/DG-165): canonical run 20260906T195904Z fitted on the DG-179 common outcome artifact (championship window through Week 17), Codex review PASSED, guards hardened e5151cda, joined into DG-178's Week-17 candidate board 203007Z with every check passing 2026-09-06 16:31 EDT. Research candidate: NOT served, NOT merged, default page still pinned to 171037Z."
metadata: 
  node_type: memory
  type: project
  originSessionId: b80e4907-2b8e-494e-987a-b2e7a5ee6cd2
  modified: 2026-09-06T13:32:23.235Z
---

**State (2026-09-06 ~12:05 ET, after ROUND2):** canonical run `runs/20260906T154033Z` (commit `5056fed1`): three-state chain (qualification ⊆ appearance by arithmetic, runner-enforced), policy declared ex ante (inner_menu over plain/trend/trend_qb_r1), plain = exploratory paired comparison, identifiers + pairing block, QB/R1 calibration assessment (no correction). Cross-review of DG-178 found their universe builder misses all 45 rostered 2026 draftees and their audit still loads the v1 rookie file. Earlier state follows.

**State (2026-09-06 ~11:00 ET, after REVIEW-2026-09-06-ROUND1):** DG-165 candidate exists on `ticket/DG-165` (worktree `~/dg-wt/DG-165`,
base origin/main `ecc260ef`). Research only: nothing served, promoted, merged, nothing written under
`app/data`. Codex orchestrates (ORCHESTRATION-2026-09-06.md); Codex is NOT reachable by session message —
the DG-165 ticket file is the channel.

**What it is:** `src/dynasty_genius/rookie/` — per drafted QB/RB/WR/TE and horizon h=1..5:
`P(played_h)`, `P(Q_h)` (qualifying = availability bar QB37/RB45/WR71/TE21, REG PPR totals, N-th largest,
same as canonical DG-164 cells), `E[N_h]` = Σ_j P(qualifies in season j), in SEASONS and already
unconditional. Inputs: pick, round, age at draft, position (log-pick, position × log-pick). Cohort = nflverse
draft picks 1999–2026 (2,237 rows; 80 in 2026 incl. Mendoza 1 / Love 3 / Simpson 13 / Sadiq 16 / Price 32).
Cutoff rule asserted: class c trains at horizon h for forecast year T only if c ≤ T − h.

**Canonical run:** `runs/20260906T151705Z/dg165_rookie_capital/` (commit `7bfc2e4f`; 144444Z superseded because its evaluation described the plain arm while the class was trend-scored — lane 25057 caught it). Season-1 E[points] bias ≈ −3 (QB ≈ −11 residual). Earlier canonical `133904Z` is SUPERSEDED (review found: NaN games called washouts; decreasing cumulative paths; test-prevalence comparator; hand-typed REPORT numbers; unsupported composition claims). Now: identities resolved via players/rosters (63 of 108), 45 unresolved kept as NaN with sensitivity arm; hazard construction (a_j, rho_j, q_j, r_j); one `fit_at_forecast_year()`; annual target = appearance + E[points|appear] + E[games|appear] + unconditional pair (accepted by lane 25057); class-year trend term adopted (5/6 metrics, season-1 bias −11.7→−3.2 pts). Old text follows for history:

**Old canonical run:** `runs/20260906T133904Z/dg165_rookie_capital/` (REPORT.md, EVALUATION.md, manifest with
sha256s + `definitions`/`units` blocks for the DG-178 adapter, `rookie_scores_2026.csv`). Adds season 6 and the
LEVEL `e_ppg_given_qual_year_j` (ridge on qualifiers only) — level beats position-mean by 2–6% RMSE and
under-predicts 0.6–1.1 ppg out of time (comparator has the same bias: scoring trend). Five earlier runs carry
SUPERSEDED.md. Pushed: `ticket/DG-165` at 9a6a7a4b. DG-178 adapter reads it (`4e9baf2b`).
Out-of-time AUC 0.842 (h=1) → 0.818 (h=5), Brier beats no-model at every h; h=5 graded on classes
2005–2021 (n=1,354). Reproduction of the preserved study was byte-identical (`runs/20260906T131535Z`).

**Known misses to carry, not hide:** mid-round QBs (R4–5) over-predicted 0.32 vs 0.16; rookie-year
contribution rising over eras and the model lags it (h=1 by era 0.17/0.16 → 0.25/0.21); TE R7 0.07 vs 0.
Young QB/TE (≤23, R1–2) well calibrated. Undrafted rookies NOT modelled (no population table).

**Composition rule handed to DG-178:** Engine A's rate is conditional on ≥8 games → composes with
`P(played)`, never `P(Q)`; `E[N_h]` must not be multiplied by a survival curve.

Related: [[feedback_the_join_key_is_survivorship_selected]], [[feedback_a_filters_correctness_depends_on_the_estimand]],
[[project_dg164_survival_curve_2026-09-05]].

**Sleeper eligibility capture (2026-09-06 ~12:50 ET, commit c6102c00):** `runs/20260906T164442Z/eligibility_capture/`
(raw public payload in run 164107Z, gitignored, sha256 97b15239da27…). `fantasy_positions` is the placement authority;
missing stays unknown; flags classify never suppress. Bredeson = RB (draft TE), Nowakowski = TE (nflverse FB), Hunter =
DB|WR (WR-eligible; DG-178 excluded him as DB), Dell = WR/Inactive/rostered. 80/80 rookies matched. Preview QA first
pass recorded in the ticket: 3 pass, 1 gap (placement of the two position-change rookies), 1 pending (evidence wording).

**Common-outcomes increment (Codex/DG-179, 2026-09-06 ~15:30 ET, commit 1ed74c16):** David confirmed the championship
ends NFL Week 17. Full unfiltered nflverse weekly source captured ONCE at `runs/20260906T191723Z/weekly_source_capture/`
(27 files 1999–2025, 476,159 rows, 150 cols, per-file URL/etag/sha256; REG weeks 1–17 ≤2020, 1–18 ≥2021; 530 id-less
placeholder rows counted, 6 with points; raw gitignored). Outcome target = REG weeks 1–16 through 2020, 1–17 from 2021,
nflverse-default PPR (NOT David's exact rules — fumble/ST attribution pending), one mask for points/games/appeared.
Codex builds the common player-season CSV; my adapter `rookie/outcomes.py` (fail-closed loader, draft-role positions
for cohort players) is ready; refit of the annual 1–6 policy waits on that artifact. Never fabricate missing as zero.

**Common-artifact refit (2026-09-06 ~16:45 ET, commit 2dd86992):** canonical run is now
`runs/20260906T195904Z/dg165_rookie_capital/` — labels ONLY from DG-179 `runs/20260906T194819Z/league_season_outcomes`
(outcomes.csv 199a48be…, target_identity 049d2229…, preset nflverse_default_ppr_championship_window_v1,
league_scoring_exact false, coverage qualified_research_game_complete_identified_rows), cohort restricted explicitly to
classes ≥ 2001, labels outside 2001–2025 unknown, evaluation 2008–2025 (≥ 4 training classes at the inner cutoff).
Season-1 P(qualifies) AUC 0.849, E[points] bias −2.0; P(Q_5) AUC 0.824; 80 scored. My source preparation
(`runs/20260906T194454Z/source_preparation`, schema dg179_source_preparation_v1) feeds the artifact; the old-target
run 154706Z is superseded as canonical. Old-target metrics are NOT validation of new labels.

**Codex review of the common-target run PASSED (2026-09-06 ~16:30 EDT): 16 hashes, 5 identities, 80 keys, 8,670 checks,
18 folds reproduced to 2.8e-14 → no refit.** Guards hardened test-first (commit e5151cda): identities recomputed with the
canonical recipe, row-level refusals (fractional/negative games, missing/infinite points, mask parity, blank ids),
capture bytes verified before positions. Effective-cohort companion beside run 195904Z (2,238 captured vs 2,083 fitted,
155 dropped) — no run file modified. ⚠ Use `date` before stamping times: I wrote 16:45 for a 16:00 finish.

**Integration state (2026-09-06 16:31 EDT, `date`-checked):** DG-178's Week-17 candidate audit `20260906T203007Z`
(commit `26ba557d`) binds my run `195904Z` (csv `db96647d…`, arm `inner_menu:trend`, graded arm `inner_menu`) and the
common target `049d2229…`. My read-only join check PASSED on both views: 80 rookies once by player id and Sleeper id,
placement == Sleeper `fantasy_positions` 80/80 (Bredeson RB is the only draft-position change; Nowakowski TE and Jam
Miller RB differ from nflverse roster position by the placement rule), readiness 80/80 comparable, composition 825/0.
Page values h2/h5: Mendoza 229.4/699.8, Cooper 42.7/131.3, Bell 0.0/0.0, Black 43.0/188.6. Two open notes for lane cb:
rows read `estimate_class = candidate` (their message said "research"); the report carries no draft-key join count of
its own. ⚠ I re-derived the check on 203007Z instead of carrying 202257Z over — the row blocks were identical, the
producer blocks were not (new `source_sha256`). Default page stays pinned to `171037Z` until Codex authorizes the pin.
Codex still unreachable by session message; the DG-165 ticket file is the channel.

**CYCLE CLOSED 2026-09-06 16:51 EDT (Codex handoff `~/dg-build/CHAMPIONSHIP-WINDOW-REVIEW-2026-09-06.md`):** the default
research preview on 8787 now serves `203007Z` pinned (verified read-only from this lane). Root accepted both lane
cross-checks; DG-179 terminal READY_FOR_GATE; David gets the preview link with football-level limitations. Still NOT
merged, not production. ⚠ Nonblocking follow-up for the NEXT rookie run, not fixed and not to be claimed fixed: the
manifest's legacy `definitions` prose still says full REG; `outcomes` and `units` are authoritative (championship
window) and the writer prose must follow them. No new cycle was started on this note.

**REOPENED 2026-09-06 17:08 EDT ("please continue building", via Codex): read-only preflight for a rookie→veteran
TRANSITION experiment is in the ticket.** Facts measured from the frozen runs: after one season DG-177 prices a
draftee from `ppg_t, games_t, age, seasons_played=1`, no lag, NO draft capital; 885 second-year rows (2011–2024) grade
on both producers against identical labels; DG-177 after one season beats DG-165's stale draft-time year-2 at every
position (RMSE 62.3 vs 71.4), so the transition is a LEVEL jump (corr 0.6), not an accuracy loss; the untested
question is draft capital CONDITIONAL on one season (nested arm A1 = DG-177 recipe + log_pick/round/undrafted, paired
bootstrap on the k=1 stratum, harm check on all rows). Separate finding: 19% of draftees (210/1,102) who miss their
rookie season vanish from the board — a coverage rule, not a model. ⚠ DG-177 `seasons_played` is left-censored at
2005: derive experience from `draft_season`. Prose fix lives at `scripts/dg165/run_rookie_capital.py:359–366`.
Waiting on Codex's implementation scope; no code touched.

**TRANSITION-AUDIT TOOL BUILT 2026-09-06 (build released by David "please continue building"; ticket/DG-165 at
`f5588c51`, pushed):** `src/dynasty_genius/rookie/transition_audit.py` + `scripts/dg165/audit_rookie_transition.py`
+ 26 contract tests; plan `docs/superpowers/plans/2026-09-06-rookie-veteran-transition-audit.md`. Immutable run
`runs/20260906T215655Z/dg165_transition_audit` (214212Z and 215024Z superseded, numbers identical) on frozen 195904Z × DG-177 195728Z: 885/976/915 pairs at experience
1/2/3, identical labels asserted; veteran after one season beats the draft-time rookie forecast at every draft
position (k=1 MAE QB 76.3→67.9, RB 57.5→48.9, TE 34.8→30.3, WR 52.5→39.8; abs-err diff −9.6 [−11.6, −7.6]); QB bias
−36 → −39 on BOTH sides (an audit finding, not a correction). Ledger denominator = 2,083-row modelling cohort; 210
draftees with no rookie-window appearance have no veteran row. Root's spec/probe findings folded in: label_basis is
a SOURCE name (only "unresolved" is unknown); absence from the draft table = `no_draft_record`, never "undrafted";
pre-2001 skill draftees = outside cohort coverage; NaN games_t / predictions / out-of-range probabilities refuse.
Prose fix landed (`rookie/definitions.py`), writer not run, frozen run untouched. Cross-check of DG-178 candidate
213858Z: 315/315 rookie season values equal at full precision. ⚠ Repo import convention in tests/scripts is
`from src.dynasty_genius...` with `PYTHONPATH=.`; ruff lives at `~/.cache/pre-commit/repocesie9_t/py_env-python3.14/bin/ruff`.

**Root review 2 (17:52 EDT, `b82806f4`/`3b1b04d9`):** integral keys checked BEFORE cast (2016.25 refused, not truncated);
ledger has explicit `label_unknown` (any-NaN label), `rookie_forecast_missing`, `no_veteran_row_appearance_unknown`;
duplicate/empty experiences and draws<1 refuse (CLI exits 2 before any run dir). ⚠ NARRATIVE: the k=1/2/3 strata are
SEPARATE samples (885/976/915) — "the veteran advantage grows with experience" is between samples, not a within-person
trend; never state it as an NFL-information effect. Canonical numbers unchanged; lane suite 94 green.

**Peer cross-checks absorbed 17:57 EDT (`b1d0e3f1`/`3cb51062`):** 626 paired rows (112/249/265) are player-seasons the
DG-179 artifact does not contain — both producers label them 0/0/not-appeared by the shared convention; now tagged
`label_source = convention_zero` (vs `artifact`) on every paired row and counted; an absent pair with a non-zero label
refuses. ⚠ Veteran target of record = the corrected companion `<run>.manifest.corrected.json` beside the run dir, not
`manifest.json`; the loader reads it when present and requires identical outputs_sha256.

**Root final review 18:01 EDT (`9aef598d` fix, `0d175350` checkpoint, pushed):** empty join raised on `~np.array([])`
(float dtype) — explicit `dtype=bool`; regression pinned. Run `215655Z` unchanged, replayed byte-for-byte by the fixed
tool, checkpoint note committed beside it. Lane suite 100 green. Lane idle, waiting on root; ticket/DG-165 head `0d175350`.

**Root provenance guards 18:04 EDT (`2ae4d819` tool, `a6c69abe` checkpoint, `d625923b` test fix; head `d625923b`):**
the artifact's VALUES are retained and compared strictly before any label is called artifact-backed (two producers
agreeing is not evidence); duplicate artifact keys refuse; a PRESENT corrected companion must carry a complete outcome
block (absent companion keeps the manifest.json fallback). Run 215655Z unchanged, replayed byte-for-byte. 103 lane
tests green. Lane idle, waiting on root's recheck.

**READY_FOR_GATE 2026-09-06 18:09 EDT (root's final coordinated acceptance, record
`~/dg-build/PLAYER-COMPARISON-REVIEW-2026-09-06.md`):** DG-165 accepted at `d625923b` with unchanged audit run
`215655Z` (manifest `85e7202c…`, metrics `4ddd0f2e…` — verified equal from this lane). Three-track build (DG-178
comparison board pinned locally on 8787, DG-177 scoring audit, DG-165 transition audit) is at the HUMAN GATE: David has
not ruled; nothing merged or in production. Next session: do not restart tests, emit artifacts, merge or refit; wait
for David's/root's instruction. Ticket branch `ticket/DG-165` head `d625923b`, pushed.

**AVAILABLE-PLAYERS BUILD (David "ok go", 2026-09-06 evening) — DG-165 missing-player starting estimates, head `1394ac97`+run:**
plan `docs/superpowers/plans/2026-09-06-unowned-cold-start-forecasts.md`. Coverage tool `rookie/cold_start.py` + CLI → run
`runs/20260907T010020Z/dg165_cold_start_coverage` (84-player ledger reconciled against the accepted report; routes; three-source
draft evidence, never "UDFA"; recovery sidecar of 4 identity-join failures copied from DG-177 rows). Candidate
`rookie/cold_start_model.py` + CLI → run `runs/20260907T012231Z/dg165_cold_start_candidate` (011503Z superseded, numerics identical): root-FROZEN population = 424 drafted
skill players 2001–2025 with no full-REG record through the draft season (from the hash-verified raw captures; the roster-listing
population was REJECTED as end-of-season survivor selection), origin = draft+1, walk-forward 2012–2025. Result: h=1 draft-capital
hurdle beats the position mean (Brier −0.018 [−0.031, −0.004]; RMSE −3.7 [−6.5, −0.5]) → `cold_start_candidate`; h=2–5 intervals
span zero → `baseline_research_candidate`. Seven 2025 draftees exported; 73 unresolved with next experiments. ⚠ Selection on this
evaluation is retrospective; not conditioned on remaining on a roster. Awaiting root's review before DG-178 consumes.

**ROOT ACCEPTED the cold-start results 2026-09-06 ~21:20 EDT** (947 paired rows, all intervals, seven paths replayed) and authorized
DG-178 to consume sidecar `93bc11aa…`; code gate closed at tool `0e2db9e1` (final run `012231Z`, byte-identical numerics; head
`d7c2344b`+). Year 1 = draft-capital candidate; years 2–5 = baseline research candidate. Partition 7 / 73 / 4 of the 84. Lane idle,
awaiting root's final replay. ⚠ Report wording once said "77 unresolved" — the truth is 73 unresolved + 4 recovered; state partitions
explicitly, never a raw row count.

**ROOT FINAL ACCEPTANCE GREEN 2026-09-06 21:37 EDT — available-players build closed for DG-165:** final run `012231Z` replayed
byte-for-byte by root's own CLI run; DG-178 consumes the sidecar. Lane idle by root's instruction. ⚠ Open advisory for any FUTURE
reuse of `cold_start_model.py` on a mutable source: `first_full_reg_season` re-reads parquet bytes after `verify_capture` hashed
them (verify-then-reread gap) and the manifest is read twice — hash and parse the same buffer, one manifest snapshot, as the
transition-audit loaders do. Not fixed now (no authorization); fix first if the tool is ever reused live.
Consumed by DG-178 catalog `runs/20260907T013635Z/dg178_available_catalog` (21:41 EDT): 433 default = 349 original accepted + 4 recovered (= 353 frozen) + 7
starting estimates = 360 with a forecast, + 73 without; 825 accepted rows byte-unchanged; per-year classes shown as "starting estimate" with the h1 evidence.

