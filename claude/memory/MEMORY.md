# Memory Index

## 🚨 READ BEFORE CLAIMING ANY SEAT
- [**Cockpit session identity**](cockpit_session_identity.md) — loading this memory does NOT make you Tower; verify your tty first. A helper session wrongly assumed the seat 2026-08-13→15.

## ⭐ READ FIRST — Tower's role
- [**Tower role v2 — product steward**](tower_role_v2.md) — **David-authorized 2026-08-08, SUPERSEDES all earlier descriptions.** Data fresh · models honest · truth when he sits down. **NOT an orchestrator, gate or approval seat.** Governance near zero since 08-18; substance stands: never claim something exists that does not, cite what you ran.

## 🖥 THE MACHINE — 2026-08-22
- [**MacBook Pro M5 (migrated from INTEL Air)**](machine_macbook_pro_m5_migration.md) — no Rosetta, migrated binaries cannot exec; zsh `log` shadow, launchd penalty box, gcloud/Gatekeeper traps.

## Project state — current
- [**⭐ STATE 2026-09-03 09:00 — DG-139/140 LIVE, DG-142 landed-not-live, DG-143 HELD**](project_state_2026-09-03_morning.md) — age + age-verdict fixes verified on the morning artifact (97->0, 16->0); **DO NOT land DG-143 without David's percentile ruling**; his 6 rulings incl. "no 'partial season' lang" and remove-the-range (unbuilt). LANDING IS NOT LIVE — nothing pulls trunk.
- [**Missed games as a signal — measured and mostly refuted**](project_missed_games_investigation_2026-09-03.md) — the market's 23% discount on returners is REAL but EARNED (buying lost every year); no suspension data, medical table ends 2023; the byproducts (played-vs-produced gap -0.449 vs games_t +0.028; durability lags in runtime but not training) are worth more.
- [**⭐ Review verdicts 2026-09-03**](project_review_verdicts_2026-09-03.md) — **THE BAND ON SCREEN IS A PER-POSITION CONSTANT (QB 44.8/RB 45.6/WR 40.0/TE 47.2 = 2×sigma); it says NOTHING about the player; the blend form fires on 0 of 12,227 rows.** TE band is 10.75× its whole replacement→best range — only the coupled constants can fix TE, no feature work. **`served_model_alignment.py` EXISTS, returns aligned=False for all four, wired into trust_surface but NOT roster_audit_models (half-landed).** ⛔ Never argue "rank everyone" from the 3.28-vs-3.19 RMSE — it dies to survivorship + variance; argue David's ruling. ⛔ Multi-market capture is mostly ToS-prohibited by our own registry. ⛔ More features cannot help: QB has 4.2 players per feature.
- [**Ranking diagnosis + the hurdle**](project_ranking_diagnosis_2026-08-31.md) — **⛔ COVERAGE IS STILL BROKEN: 468 of 12,227 ranked; David's roster shows 3 blanks; "rank everyone always" UNSATISFIED.** `games_t` is ONE SEASON, not the player — ppg has TWO lags, snap_share ONE, games ZERO. Of 115 gated, 72 carry a prior season in the row being refused. ⛔ DO NOT backfill 2024 (gate reads the 2025 row; 2024 is already `ppg_t_minus_1`). ⚠ SUPERSEDED here: "premium data reaches zero coefficients" (NGS is now in all four pickles) and the old TE 16.6/RB 2.5/WR 4.2 shares (do not reproduce; retired).
- [**⭐ Hurdle live 2026-09-01**](project_ranking_diagnosis_2026-08-31.md) — served value = `P(plays) × E[points|plays]` (`ee57d802`); AUC 0.811; age effect −0.2593→−0.4028 (market −0.3855). **⚠ ALIGNMENT WITH THE MARKET, NOT PROOF OF PROFIT — nothing here has EVER graded a prediction. Do not quote as an edge.** ⚠ `score_rows` refits at SCORING TIME from the training CSV. ⛔ Never divide P by the base rate (tripled the ceiling 18→58).
- [**Gate integrity + TE validation**](project_gate_integrity_and_te_validation.md) — the land gate's verdict depends on WHICH TREE it runs in. ✅ TE training path repaired + gated `58d3b20c`. ⛔ STILL OPEN: the served trust BADGE was never recomputed — all four describe retired models.
- [**DG-142 LANDED main `1812a5c8` 09-03 08:08 — NOT live (trunk unpulled)**](project_dg142_built_2026-09-03.md) — roster badge now checks the served BYTES, not a version string that was identical on both sides; ⛔ "a backtest re-run restores the badges" is FALSE (the published surface is pinned by `PINNED_RUN_IDS` in another lane's `publish_trust_surface.py`), and alignment ≠ a good badge.
- [**DG-134 live 09-03**](project_dg134_landed_2026-09-03.md) — capture cutoff reads `feature_season` and refuses rather than nulling; ⛔ the "one spurious vintage_changed" claim was FALSE for DG-134 and DG-139.
- [**DG-136 live 09-02**](project_dg136_built_2026-09-02.md) — a capture refusal now exits 1; first scheduled execution is the 09-03 09:00 chain, and a GREEN run exercises nothing (it only changes behaviour on a refusal morning).
- [**DG-135 live · DG-139 live 09-03 · DG-140 LANDED `6f517027` (⚠ NOT live — trunk `32ceb8fb`, behind 2)**](project_dg135_landed_dg130_scoped_2026-09-02.md) — correct age now served while the card's age VERDICT still computes at the STALE age: 97 contradicted rows, 46 rostered, Wilson among them. David owes 4 DG-130 decisions.
- [**DG-128 range-only live 09-02**](project_dg128_landed_2026-09-02.md) — 468 bands live; **NOBODY NEW RANKED** — the fill is held on `ticket/DG-128-fill-held` (`fde9a5ca`, pushed), covering 76 of 115 blanks incl. Wilson and Allen.
- [**DG-133 partition fix live**](project_dg133_partition_fix_landed.md) — inference partition selects by season, not the training flag. ⚠ Read `capture_report.status` + today's row count, never the chain's green.
- [**DG-137 served-team fix live**](project_dg137_served_team_landed.md) — served≠Sleeper team 142→0 across all rows. Refresh ≠ restart: the audit route reads the artifact per request.
- [**Lou audit — what survived**](project_lou_audit_verified_2026-09-02.md) — Dell REFUTED as an identity failure (0 games in 2025 → no row; no threshold fixes him).
- [**David's DG-128 rulings 09-01**](david_rulings_dg128_2026-09-01.md) — no slot · pre-committed taper · band ships with the number · gate reaches 115 not 498.
- [**David's ranking rulings 08-31**](david_rulings_ranking_2026-08-31.md) — rank everyone always (width, never absence); edge = market blind spots; replacement level as an order statistic; one number + contend/rebuild toggle.
- [**David's rulings — DG 3.0**](david_rulings_dg3.md) — **prose not data-science viz; frontend GREEN-LIT to state recommendations ("call a spade a spade")**; land on main; PPG = ALL GAMES; governance near zero.
- [**Season readiness sprint 2026**](project_season_readiness_2026.md) — **kickoff 09-10; the 09-04 freeze is SOFT (David 09-02: "im not so worried about freezing on 9.4 if the product isnt ready") — readiness outranks the date.** DG-091 frontend program: 15 tickets live, acceptance = David's word on a season morning, NOT YET GIVEN. ⚠ Monitor state/receipts, never process names. ⛔ DO NOT edit XVAR_LAMBDA_ENGINE_B (DG-092 guards it).
- [**DG 3.0 build system**](project_dg3_build_system.md) — `~/dg-build/`: ticket board, parallel-work protocol, worktree tooling. COUNT tickets with `ls ~/dg-build/tickets | wc -l`, never from memory. Backed up to a private GitHub remote.
- [Dynasty Genius project state](project_dynasty_genius.md) · [Manager identity tracking](project_manager_identity_tracking.md) · [Grounding-layer plan](project_grounding_layer.md) (gate CLOSED, not a live commitment) · [Loop-control build](project_loop_control.md) · [Architecture review 08-19](project_architecture_review_2026-08-19.md) (⚠ its antigravity doc REVERSES the "all games" ruling)
- [Frontend Studio outsider agent](project_frontend_studio.md) — Tower's only structural monopoly; other lanes may not read or touch `~/frontend-studio`.

## Traps that have already cost a session
- [**Trunk's frontend bundle is a MANUAL build**](reference_trunk_frontend_bundle_is_a_manual_build.md) — landing + kickstart shows NOTHING new: pull → build → restart → refresh → reload.
- [**te_v3_metadata.json is UNRECOVERABLE**](reference_te_v3_metadata_unrecoverable.md) — in no backup, never in git; you cannot derive bytes from a hash. Don't re-run `promote_head_a_te_v3.py`.
- [**Symlink write-through**](reference_symlink_write_through.md) — writing inside an already-symlinked directory FOLLOWS the link into the real tree; deleted two trunk model files 08-31.
- [**Constitution v1.1.0 is in pushed history**](reference_constitution_v110_location.md) — David deleted it himself; the "one command from gone" claim was false.
- [OpenAPI regen trap](reference_openapi_regen_trap.md) — a dirty `frontend/openapi.json` silently REVERTS landed commits; always regenerate.
- [nflverse "unchanged" trap](reference_nflverse_unchanged_trap.md) — a stale mtime means a HEALTHY idempotent capture, not lost data.
- [Sleep catch-up guard](reference_sleep_catchup_guard.md) — macOS drops slept-through launchd runs; verify only via `pmset -g sched`.
- [Backup architecture](reference_backup_architecture.md) — code→GitHub, data→GCS, cockpit→dg-cockpit. **⚠ `~/dg-wt` worktrees are in NO copy — an unpushed ticket branch is unbacked work.**

## About David — how to work with him
- [**Greg = David's plain-language seat; Fred/Bob route questions through Greg (09-03 evening)**](david_ruling_greg_translator_2026-09-03.md) — seat map verified that evening (a78c76 / d4e70e / 08); names drift on /clear.
- [Push not pull](feedback_david_workflow.md) — **tell him in sentences, never point him at a file.**
- [**Synthesis is the weak layer**](feedback_synthesis_is_the_weak_layer.md) — verified figures, wrong paragraph. NEVER hand him a summary unaudited; audit the narrative, not just the numbers.
- [**Check WHEN, not just WHAT**](feedback_check_when_not_just_what.md) — the most repeated error shape; `git log -S` / `stat` settles it in five seconds.
- [**My conventions are not David's rules**](feedback_my_conventions_are_not_davids_rules.md) — cite him, never recall him.
- [**Relay authority drift**](feedback_relay_authority_drift.md) — READ THE TRANSCRIPT; provenance is a lookup, not a deduction. **Never treat a relay as his approval.**
- [**Mid-turn messages are invisible**](reference_midturn_messages_invisible.md) — a message typed while a session works never becomes a `user` record; read `queue-operation` enqueues.
- [**A peer assumes your context**](reference_peer_assumes_your_context.md) — check your own transcript length before accepting a peer's premise, and check its clock separately from its quotes.
- [**Lane names are not addresses**](reference_lane_names_are_not_addresses.md) — ask which `davidleess-xx`; never infer from a transcript's "I'm Greg".
- [**`git add <file>` does not isolate lanes**](feedback_git_add_by_name_does_not_isolate_lanes.md) — it still stages the other session's edits to that file. `git diff` it, or `git add -p`.
- [**Workflows die on the spend limit**](feedback_workflows_die_on_spend_limit.md) — list the lenses that never ran; verify the decisive questions inline.
- [Parallel-session coordination](feedback_parallel_session_coordination.md) · [David's profile](user_profile.md) · [Research register](david_research_register.md) · [Python env](feedback_python39_syntax.md) (3.14 now; avoid `round` as a param name)

## Other projects
- [**Shayla's learning games**](project_shayla_games.md) — no-fail / one-input / drag-never-required. **David 09-03: difficulty IS allowed to rise for her — the no-fail rule protects her, not gentle numbers.** Lemonade curve rebuilt, 6 ingredients, bounded at day 6.
- [**Verifying the single-file HTML games**](reference_verify_single_file_html_games.md) — Playwright IS installed (npx cache, invisible to `npm root -g`); walkers spawn off-screen, synthetic PointerEvents die on `setPointerCapture`, the cup never goes "stable".
- [BMW search project](project_bmw_search.md) — awaiting David's car list.
- [Frontier brainstorm handoff](project_frontier_brainstorm.md) — doc on Desktop.

## HISTORICAL — orchestrator era. Context only; do NOT act on these duties.
- [Cockpit handoff](cockpit_handoff.md) — **INHERITED CLAIM, never a source.**
- [Tower operating method](feedback_tower_situational_awareness.md) — know state from source, never from your own prior messages. Survives as Rule 2.
- [Ghost text in panes](feedback_ghost_text.md) — verify with `-e`; dim `\e[2m` = ghost.
- [David's rulings 2026-07-25](david_rulings_2026-07-25_dg2.md) — DG 2.0 ruling set.
