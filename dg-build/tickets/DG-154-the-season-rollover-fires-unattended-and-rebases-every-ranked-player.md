# DG-154 — The season rollover fires unattended around 2026-09-15 and silently rebases every ranked player from a 17-game measurement to a 4-game one

**Layer:** 2 (+3) · **State:** done · **Lane:** Davids-MacBook-Pro-69536 · **DG 3.0** · **model robustness / season safety · URGENT, fires by itself**
**Source:** found independently by TWO of three planning lenses in the ranking-quality workflow, 2026-09-04, each ranking
it #1 of everything on the board; the served path re-verified by Greg (`davidleess-eb [a78c76]`) before filing.
Filed 2026-09-04 14:0x ET.

**Problem:** the daily chain runs `run_feature_refresh.py` with **no `--season-end`**
(`scripts/run_daily_chain.py:59-60` — argv is the interpreter and the script path, nothing else), so
`run_feature_refresh.py:381-386` derives `season_end = int(player_stats["season"].max())` from the live feed and
`:400` sets `inference_season = season_end`. **The moment nflverse publishes the first 2026 `player_stats` row —
roughly 2026-09-15 — `inference_season` flips 2025 → 2026 with nobody in the loop.** Then
`feature_assembly.py:107,127` keeps only `(feature_season < inference_season - 1) | (feature_season ==
inference_season)`, dropping the COMPLETED 2025 rows, and `assemble_engine_b_dataset.py:59,178` filters every season
to `games_t >= 4`.

**Two consequences, in order.** (a) For roughly three weeks the 2026 partition is empty, candidate validation fails
"no rows for inference season 2026", and the publish is BLOCKED fail-closed — correct behaviour, but it exits 1 every
morning for a right reason, which masks a genuine feed failure. (b) Then, as players cross four games, the board
returns **rebased**: `ppg_t` silently stops meaning "a 17-game season" and starts meaning "the four games he has
played so far". `ppg_t` carries the largest coefficient at every position (QB 0.262 in the published fold vs
`ppg_t_minus_1` 0.120), so this is not a small drift.

**Sized by the workflow (treat as measured-once, re-derive before acting):** information loss on `ppg_t` roughly one
third pooled and roughly three quarters at QB; ranked players roughly 505 → 291 during the transition. Both figures
want re-measuring in the fix.

**⛔ THIS IS DAVID'S DECISION, NOT A MODELLING DETAIL.** The question is what the board is FOR during a season:
- **(A) Stay on 2025 for the season.** The ranking keeps meaning "based on his last complete season". Correct for a
  two-year dynasty horizon and stable all year — but the board does not react to 2026 football at all, and **David
  must be told, or he will read a frozen board as a broken one.**
- **(B) Advance to 2026 at a threshold he sets** (e.g. once a player has N games, or after week N), so the board
  starts reflecting this season on a date he chose rather than the day a feed happened to publish.
- **(C) Carry both** — rank on the complete season, show current-season form as its own signal.
Pinning wrongly is worse than the default, because then we own it. Do not choose for him.

**Done looks like:** the rollover cannot happen unattended — the season basis is explicit in the served path, not
derived from whatever the feed last published; a test proves that publishing a 2026 row does NOT silently change the
basis; the fail-closed window is distinguishable from a real feed failure in the alert (per DG-136, a refusal must not
read the same as a break); and whatever David rules is stated on his screen when it takes effect.

**Anti-scope:** no model retrain, no promotion (David's word, via DG-058/059 which are unbuilt); no change to
`MIN_GAMES_THRESHOLD`; nothing under `.oa3`.

**Depends on:** nothing. **Blocks:** everything that grades the board this season, including DG-018 and DG-152 —
they would grade a board this event corrupts.

---

**Notes**

---

**GUARD LANDED main `6b0a9f90` 2026-09-04 14:2x ET (Fred, davidleess-eb d4e70e) — NOT live until the next trunk pull. David's A/B/C ruling is STILL OPEN and this ticket does not close it.** Gate 6929 passed / 33 skipped, frontend 93 / 649. 22 tests, all red first. Two panels' worth of correction: a 4-lens adversarial review (64 agents, none died) returned 20 findings, 12 stood, one BLOCKER.

**What landed:** `src/dynasty_genius/features/season_basis.py` + the guard wired into `run_feature_refresh.py` before `publish_fn` is built. It compares the season the feed offers against the season the live runtime says it was built on, and REFUSES if they differ unless a declaration carrying an author and a date names exactly that season. **It decides nothing** — A, B and C are all still available and all still David's.

**No-op today, verified not argued:** the live marker reads `inference_season 2025` and the feed's newest season is 2025, so the guard returns at its first branch. Confirmed against the live artifact and by 77 passing pre-existing feature-refresh contract tests.

⛔ **MECHANISM, re-verified line by line rather than relayed:** `run_daily_chain.py` argv is the interpreter and the script path, nothing else → `run_feature_refresh.py` sets `season_end = int(ps["season"].max())` then `inference_season = season_end` → `feature_assembly.py:107,127` keeps `(fs < inference_season - 1) | (fs == inference_season)` → `MIN_GAMES_THRESHOLD = 4`. **Nothing pinned the season.** The only existing check is `feature_validation` "no rows for inference season", which fail-closes the empty window and then passes again the moment four games exist. Independent confirmation that the rule is real: the live runtime holds 2018-2023 and 2025 but **no 2024 rows at all**.

⛔ **THE SIZED CLAIMS IN THE FILING WERE BOTH WRONG. Do not repeat them.** Re-derived on 2,658 player-seasons (2018-2025, local `ff_opportunity` weekly, no network), and independently reproduced by the review to 4 decimal places:
* A four-game mean carries **77% of a full season's variance pooled → 23% lost**, NOT one third. By position: QB 35%, TE 33%, RB 26%, WR 26%.
* The "**three quarters at QB**" figure is a DIFFERENT measure (inverse-variance sampling precision, 4/15 games) and it gives **69-73% at EVERY position** — it is not a QB finding. Quoting one third pooled beside three quarters at QB implies one consistent measure; there is not one.
* **505 is exact** (all with `games_t >= 4`; WR 207 / RB 127 / TE 109 / QB 62). **291 is not a stable state** — it is a point the refill passes around week 6-7. Refill on one consistent week window: ~199 by week 4, 248 by week 5, 282 by week 6, 328 by week 8, 446 by week 18.
* ⚠ The like-for-like end state is the runtime's OWN completed seasons: **457-501 rows, mean 480** vs today's 505. An earlier draft said "never returns to 505" from a cross-population comparison; **withdrawn**.
* ⚠ The rollover is **not purely destructive**: under a 2026 basis the 2024 season becomes training-eligible, which today's basis excludes. The damage is on the INFERENCE side.
* ✅ Scoring basis checked: `ff_opportunity.total_fantasy_points` is full PPR (mean |diff| 0.010 vs PPR, 1.525 half, 3.041 standard) and matches `ppg_t`. Re-running over all weeks including postseason (David's all-games ruling) leaves every conclusion unchanged.

⛔ **THE BLOCKER THE REVIEW CAUGHT, recorded because it is the third instance of a shape this repo keeps producing:** the first cut wrote a NEW sidecar and the commit message claimed that made a refusal distinguishable from a broken feed. **Nothing read it** — one reference in the whole repo, the line that wrote it. The refusal was byte-identical to a feed break in every channel that exists, and the pin contract I cited is a SUPPRESSION rule, not a classification rule. Fixed by writing the refusal into `feature_refresh_latest_report.json`, which `app/config/report_freshness.json` registers for this producer with `failure_reason_field: blocked_reason`. It also cannot go quiet: `feature_refresh_runner` refuses to no-op from a prior `blocked` state.

Also fixed from the same review: the guard **failed OPEN** when a runtime was published but its ready-marker was missing or corrupt (now refuses, since only a directory with no runtime at all is a genuine first publish); the proceed branch wrote `status: ok` BEFORE assembly and publish (now `authorised`, with the real published season, `basis_changed`, and `finished_at` on both branches); and the wiring was pinned by SOURCE GREPS, so the guard could have been deleted without a test going red — there is now an end-to-end test driving `main()` across the real event, asserting exit 1, a blocked report, and an **untouched runtime CSV** so the board keeps serving the season it was built on.

**STILL OPEN — David's, and not startable without him:** (1) the A/B/C ruling itself; (2) his third requirement, that whatever he rules is visible on his screen when it takes effect, which needs the ruling first. Filing those is the natural follow-up once he answers.
