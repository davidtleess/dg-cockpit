# DG-042 — David's "all games" PPG ruling is honoured by accident, not enforced

**Layer:** 3  ·  **State:** done  ·  **Lane:** ClaudeOpus5-DG042-20260825  ·  **DG 3.0**
**Source:** SR-21 in `docs/strategies/2026-08-20-dg-SEASON-BUILD-SPEC.md:1226` (filed 2026-08-20 on
David's word: *"agreed ... file a ticket"*). Board ticket opened 2026-08-25 so the sprint item can
run through `dg-work.sh` / `dg-land.sh`, which require a `DG-NNN` id.

**Problem:** David ruled 2026-08-19 that PPG counts **all games, postseason included** (DG-024).
`fetch_and_agg_stats` honours that ruling only because nflverse does not publish preseason in
`load_player_stats` — nothing in this repo enforces it. If nflverse ever adds `PRE`, PPG silently
absorbs it, every valuation shifts, and it presents as a real decline rather than a definition
change, in a compounding archive whose rows are permanent.

**This ticket does not touch the ruling.** It makes the ruling enforced instead of assumed.

**How we know** — all measured 2026-08-25, this session:
```
scripts/assemble_engine_b_dataset.py:158  fetch_and_agg_stats
  :167   stats_weekly[stats_weekly["position"].isin([...])]   ← position ONLY
  grep -rn "season_type" --include="*.py" scripts/ src/       ← no hit in the PPG path

.venv/bin/python3.14 -c "... nfl.load_player_stats([2025]) ... groupby('season_type')['week']"
  POST   882 rows  weeks 19–22
  REG  18540 rows  weeks  1–18          ← the column EXISTS and is populated

season_type present with exactly {REG, POST} for 2016, 2018, 2021, 2024, 2025

app/data/training/engine_b_features_v2.csv   2741 rows, games_t max 21, p99 20
```

**Two findings that refine SR-21's plan (measured, not inherited):**

1. **The `games_t <= 21` tripwire is strictly secondary, not a symmetric second check.**
   `games_t` is `week: nunique` (`:178`). POST *continues* the regular-season numbering (19–22), so
   it raises `games_t`. A hypothetical `PRE` numbered 1–3 would **collide with REG weeks 1–3 and not
   raise `games_t` at all** — while still diluting `ppg_t`, which is a `mean` over weekly rows
   (`:171`) and therefore drops on every extra row regardless of week number. SR-21 describes the
   two checks as catching the same drift "from the other direction"; measurement says the
   `season_type` assertion is load-bearing and `games_t` only catches the range-extending case.
   Both are worth having. Only one is a guarantee.

2. **This guard runs inside the daily producer, not only the offline dataset build.**
   `scripts/run_feature_refresh.py:28,410` → `feature_assembly.py:139`
   `fetch_and_agg_stats(seasons_window, weekly=read_fns["player_stats"])`. So the assertion is on the
   live feature-refresh path and can fail a scheduled run. That is the intent — but it must not fail
   on a fact indistinguishable from healthy. **Checked:** `season_type` is present for every vintage
   2016–2025, so the missing-column branch cannot fire against today's nflreadpy, and an
   earlier-season step-back (DG-041) cannot trip it.

**Done looks like:** a synthetic `PRE` row raises and **names the offending value**, rather than being
averaged into PPG. The ruled set `{"REG", "POST"}` is defined once and imported at its definition
sites, with David's 2026-08-19 ruling cited so a future agent does not "fix" the deliberately absent
filter — that exact misreading has already happened once (DG-024's own Notes).

**Explicitly NOT in scope:** no filtering (a silent filter would overturn the ruling — the guard
raises and asks David instead), no backfill, no re-derivation, no retraining cascade. DG-024 forbade
that cascade and this ticket keeps it forbidden.

**Depends on:** nothing. **Related:** DG-024 (the ruling this enforces), SR-13 (guards the coupled
constants; this guards the coupled *definition*), DG-041 (adjacent in the feature-refresh path — no
file overlap, interaction checked above).

---

**Notes**
`src/dynasty_genius/eval/qb_validation/qb_ppg_labels.py:815-825` is the third PPG definition site.
Its predicate gates on whether a QB played at all (`attempts | sacks_suffered | carries >= 1`) and is
orthogonal to season type — confirmed by reading it. It needs a comment, not a filter.

---

**CLOSED 2026-08-25, merge `c2b11f0a` on `main`.** Lane ClaudeOpus5-DG042-20260825.

**What shipped**
- `engine_b_contract.py`: `PPG_RULED_SEASON_TYPES = {"REG", "POST"}`, `PPG_MAX_GAMES_T = 21`, and
  `validate_ppg_season_types` — the ruled set defined ONCE, with David's 2026-08-19 ruling cited.
- `assemble_engine_b_dataset.py` `fetch_and_agg_stats`: grades the rows that feed the PPG mean,
  **after** the position filter (a preseason kicker row is not a threat to the ruling, so it is not
  an alarm). Raises and names the offender; **never filters** — a silent filter would reinterpret
  the ruling, a loud failure escalates it to David. Absent `season_type` fails the same way. Empty
  frame is not graded: nothing feeds PPG, so the ruling has no opinion.
- Secondary `games_t > 21` tripwire, documented as the weaker check.
- `qb_ppg_labels.py`: comment only, as scoped — its predicate is orthogonal to season type.
- `test_feature_engineering_extraction.py`: the shared fixture's player-stats frame now carries
  `season_type`. It was modelling a frame nflverse cannot produce; 7 tests exposed it.

**Acceptance**
```
pytest -q                        → 6084 passed, 38 skipped, 0 failed   (rebased on DG-041)
ruff check <5 changed files>     → All checks passed!
real nflverse 2024-2025 frame    → 1205 player-seasons accepted, games_t max 21,
                                   postseason still counted (ruling intact)
```

**Mutation tests — every one caught, so no test here is decorative:**

| mutation | result |
|---|---|
| remove the season-type guard call | 2 failed |
| silently FILTER instead of raising | 2 failed |
| treat an absent `season_type` as clean | 1 failed |
| narrow the ruled set to `{REG}` (overturn the ruling) | 5 failed |
| disarm the games tripwire (`PPG_MAX_GAMES_T = 999`) | 3 failed |
| drop the empty-frame skip | 1 failed |
| restore | 14 passed |

**Coordination.** DG-041 landed (`b797ee1f`) mid-flight from a parallel lane. Zero file overlap;
the rebase was clean and the full suite passed on the rebased tree before the merge. The one
interaction checked in advance — this guard sits in the daily `feature_refresh` path, and DG-041
changes that producer's season windows — is safe because `season_type` is present for every
vintage 2016-2025, so an earlier-season step-back cannot trip the absent-column branch.

**Closes SR-21** in `docs/strategies/2026-08-20-dg-SEASON-BUILD-SPEC.md:1226`.
