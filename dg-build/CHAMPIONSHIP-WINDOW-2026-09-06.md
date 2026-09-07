# Championship-window increment — completed to local research gate

**Closeout:** [Full reviewed handoff](CHAMPIONSHIP-WINDOW-REVIEW-2026-09-06.md). The default isolated preview now serves reviewed run `20260906T203007Z`; root verified it on desktop and phone at 20:34:46Z. All three Claude lanes completed implementation and cross-review. The assignments below describe this completed cycle, not a new queue. Nothing merged or promoted.

David confirmed that his championship finishes in NFL Week 17. Modern projected fantasy-season points therefore use REG weeks 1–17, equal weekly weighting. Historical ability features still use ALL NFL games under DG-024. Old preview `171037Z` remains preserved; the new targets have freshly fitted and evaluated producers.

## Current ownership

- Codex DG-179: shared versioned outcome transformation, strict source checks, immutable artifact, independent review and coordination. Worktree `/Users/davidleess/dg-wt/DG-179`; native implementation plan under `docs/superpowers/plans/2026-09-06-shared-league-season-outcomes.md`.
- Claude23481 DG-177: historical offensive-role fallback and freshly fitted/evaluated veteran1–5year forecasts consuming common outcomes.
- Claude24974 DG-165: full unfiltered weekly source1999–2025 capture, then rookie1–6year forecast adapter/refit and evidence.
- Claude25057 DG-178: dated2026 current-NFL roster census, strict target compatibility, updated composition and local preview QA.

All three sessions received their new bounded assignments and were observed busy; veteran/rookie first-action acknowledgements are visible. Each retains ownership of its implementation files. Root owns BOARD and orchestration notes. No new root commit, push, merge, shared-data write or production restart is authorized.

## Scoring boundary

The new research target is explicitly `nflverse_default_ppr_championship_window_v1`, not an exact reproduction of David's scoring. Saved PPR does not establish equivalence for all-unit fumble losses, recovery touchdowns and individual special-teams forced-fumble/recovery bonuses. Exact-league mode must refuse incomplete component attribution; research mode must name its preset explicitly, not silently fall back.

Sleeper explicitly permits special-teams bonuses for individual offensive players; lack of IDP slots is not grounds to ignore `st_ff` or `st_fum_rec`. Team-defense settings must not be misapplied to Hunter's defensive production. Sources: [individual/DST scoring](https://support.sleeper.com/en/articles/3278982-special-teams-scoring-options), [scoring categories](https://support.sleeper.com/en/articles/3998131-what-scoring-options-are-available), [fumble-loss rule](https://support.sleeper.com/en/articles/4056849-why-did-my-player-lose-points-for-a-special-teams-fumble), [Hunter eligibility/scoring](https://support.sleeper.com/en/articles/11166252-travis-hunter-s-dual-position-eligibility-what-you-need-to-know).

The [current nflfastR generator](https://github.com/nflverse/nflfastR/blob/master/R/calculate_stats.R) provides fuller fumble components than its preset PPR formula. Current master is not proof of the generator revision used for a historical release. Full exact-league reconstruction would additionally need validated play-stat/special-teams attribution and rare-play reconciliation; it is not silently assumed by this increment.

## Review gates

One identified player-season grain; points/games/appearance share a window. Validate full calendar before dropping finalweek; preserve negatives, unknown identities and exact quarantine rows. No post-hoc10point unidentified-row tolerance. Actual nflverse2001 calendar is normalized1–17, so historical<=16 rule is correct. Exact schedule comparison admits2001–2025;1999/2000 excluded for three missing completedgames. Six nonzero unidentified lines and zero-ID placeholders are retained in an exact research-only quarantine, with attribution limitations; no fabricated player identity or zero. The canceled2022BUF-CIN game is explicitly not an appearance.

Both models must bind the same actual outcome artifact, target/scoring/window identities and closure. No old-label accuracy evidence validates new labels. Current roster census must not treat stale Sleeper active/team flags as currentNFL fact; preserve IR/reserves/practice-squad and all league-owned records. Added identity does not itself justify a forecast. Two/fiveyear views retain identical prefix terms/reference and honest research-only caveats.
