# DG-127 — `games` has no lag while `ppg` has two, so the gate judges durability on one season

**Layer:** 3 · **State:** done · **Lane:** Davids-MacBook-Pro-26544 · **DG 3.0** · **backend / model · ENABLER FOR DG-128**
**Source:** 2026-09-01, Bob lane, verified on the served pickle `runs/20260831T204458Z/wr_v2.pkl`.

**Problem:** the 39-column Engine B feature table lags `ppg` TWICE (`ppg_t_minus_1`,
`ppg_t_minus_2`), lags `snap_share` ONCE (`snap_share_t_minus_1`), and lags `games` **ZERO**
times. There is no `games_t_minus_1` or `games_t_minus_2` anywhere in it.

`ENGINE_B_MIN_GAMES_T = 8` gates on `games_t` — **one season**. So the pipeline demonstrably
knows how to build lagged features, it built three of them, and the single durability signal
the gate actually depends on is the one left un-lagged. **The gate asks "is this player
durable?" and is handed exactly one season to answer with.**

Garrett Wilson (`00-0037740`): 2022 `games_t`=17, 2023 `games_t`=17, 2025 `games_t`=7. A
four-year professional with two full seasons on file is refused a score, and the dead-window
path then reaches OUTWARD for an Engine A college/draft prior while `ppg_t_minus_1`=14.82 sits
in the row being refused.

**Do:** add `games_t_minus_1` / `games_t_minus_2` to the feature assembly the same way the ppg
lags are built, and expose them so DG-128 can taper on evidence rather than cliff on one season.

**⛔ ANTI-SCOPE — read before planning.** Do NOT backfill 2024 feature ROWS as the fix. The gate
reads `games_t` off the 2025 row; a 2024 row cannot change it, and 2024 is ALREADY live as
`ppg_t_minus_1` for every player (provable: Wilson's 2025 `ppg_t_minus_2` = 12.541 equals his
2023 `ppg_t` exactly, so t−1 is 2024). The missing 2024 row is the DG-029 partition — deliberate,
pinned by `tests/contract/test_inference_partition_seasons.py`, and self-healing when the window
reaches 2026. Backfilling it is a plausible, expensive week that moves coverage by zero.

**Done:** `games_t_minus_1`/`_minus_2` are populated in the feature table with the same
availability-flag convention the ppg lags use, and a test pins that a player with a full prior
season is distinguishable from a true rookie at the same `games_t`.


---

## LANDED 2026-09-01 — what was actually done, and two corrections to this ticket

**Design: CARRIED, NOT CONSUMED.** The four columns are registered in `ENGINE_B_OUTPUT_COLUMNS`
(`scripts/assemble_engine_b_dataset.py`) and built at `feature_assembly.py` step 7. They are
deliberately NOT added to `ENGINE_B_ALLOWED_FEATURES`, `ENGINE_B_BASE_FEATURES`, any per-position
set, `availability.FEATURES`, or `_BOUNDED_UNIT_COLUMNS`. Reasons, each measured:
- `FEATURES_UNIFIED` (`scripts/train_engine_b.py:148`) is DERIVED from `ENGINE_B_ALLOWED_FEATURES`,
  so adding them there would have put them into a trained model matrix.
- Adding them to `ENGINE_B_BASE_FEATURES` moves `feature_completeness` for 229 of 505 scored
  players, changes the displayed value for 227, and renders the raw string "games t minus 1" into
  David's caveat copy (`frontend/src/lib/copy.ts` has no `INPUT_NAMES` entry for the lags).
- 15 columns already sit in the output table without being allowed model features
  (`outcome_returned`, `total_points_t`, `route_participation`, …). This follows that precedent, and
  the precedent the NGS work set at `engine_b_contract.py:254-261`.

**The step-7 renames were converted from POSITIONAL to BY-NAME.** `df_t1.columns = [...]` relabels by
order; adding a fifth column to `trend_base` without matching the list writes a game count into
`ppg_t_minus_1` and a PPG into `snap_share_t_minus_1` — both REQUIRED features for all four
positions, so every published value moves while the name-only guards at
`scripts/assemble_engine_b_dataset.py:269-275` still pass. `.rename` cannot express that mistake.
This removed the failure class rather than avoiding it.

**CORRECTION 1 — the table is 40 columns, not 39** as stated above. `(3384, 40)`. 44 after this
ticket.

**CORRECTION 2 — the columns are LEFT-CENSORED at `MIN_GAMES_THRESHOLD` (4).** Step 2
(`feature_assembly.py:178`) drops sub-4-game player-seasons BEFORE the step-7 join, so a 1-3 game
prior season is indistinguishable from a true rookie. Verified on real data: min observed
`games_t_minus_2` = 5.0. This ticket's Done criterion (full prior season vs true rookie) IS met;
short-prior-season vs rookie is NOT, and cannot be without moving `MIN_GAMES_THRESHOLD`, which
would change every feature value. Pinned by a test so DG-128 cannot assume otherwise.

**Evidence.** Full suite `6606 passed, 32 skipped` in the DG-127 worktree; 0 QB-1/frozen-pickle
skips and `v2_manifest.json` resolving the served `20260831T204458Z` bundles, so the gate ran
against the real models. Both new tests verified failing (`KeyError: 'games_t_minus_1'`) with the
implementation stashed. On real data: `games_t_minus_2` populates 300/505 for 2025 — identical to
`ppg_t_minus_2`; Garrett Wilson `games_t = 7`, `games_t_minus_2 = 17`.

**⚠ Its ARRIVAL IS DECOUPLED FROM ITS LAND.** `compute_source_hash`
(`feature_refresh_runner.py:44-58`) covers loader frames, seasons window, package version,
builder_config, TE rubric and identity inputs — **not the assembly code or
`ENGINE_B_OUTPUT_COLUMNS`** — so this change does not trigger its own rebuild. It rides the next
DATA-triggered refresh, which in season is the next morning. Measured on the precedent:
`outcome_returned` entered the tuple 08-31 (seed 16:56:44) and reached the served runtime at
**09-01 09:00:43, ~16 hours later**. So expect `games_t_minus_*` in the served runtime at the first
09:00 run after landing, and note it will appear on a morning with no commit to explain it.
Changes no served value either way (carried, not consumed). See `docs/agent-ledger/2026-09-01.md` §1
— **an earlier version of this note said "kickoff 09-10" and was wrong**, drawn from a runtime
reading that a producer run had already overtaken.
