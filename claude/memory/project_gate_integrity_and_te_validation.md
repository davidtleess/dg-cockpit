---
name: gate-integrity-and-te-validation
description: "2026-08-31 findings that bind future work: the land gate's verdict depends on which tree it runs in, TE is served as VALIDATED having never been tested, and 20 roster scores are silently dropped"
metadata: 
  node_type: memory
  type: project
  modified: 2026-08-31T15:33:00.645Z
  originSessionId: 4fc1a3c2-f5d3-43ff-91aa-2d474cab86ad
---

Found 2026-08-31 (Monday of what was freeze week). All verified from source by the "Bob" lane;
where another lane produced the finding it is attributed. See [[project_season_readiness_2026]].

## 1. THE LAND GATE'S VERDICT DEPENDS ON WHICH TREE IT RUNS IN — three instances, one defect

`bin/dg-land.sh:92` gates on `pytest` alone, in a fresh worktree at `~/dg-wt/DG-NNN` that carries
**tracked files only**. Consequences measured:

- **7 QB-1 contract tests SKIP on every land** — "F25 frozen product set absent (gitignored,
  backup-manifest-covered store)". The gitignored model pickles are not in a fresh worktree, so the
  frozen-boundary tests never run where landing happens.
- **The trunk collects untracked tests no clean checkout has.** `tests/contract/test_governed_cadence_inputs_red.py`
  (untracked, dated 2026-08-08, a deliberate RED slice) contributed **15 failures** to any trunk run.
  Moved to `~/dg-build/preserved/2026-08-31-untracked-red-slice/` on David's ruling — copied,
  sha-verified, then removed. NOT deleted.
- **`v2_manifest.json` is gitignored** (`.gitignore:60`), so the land tree cannot resolve which
  pickle is deployed for any position at all. (Found by the Greg lane.) **Open question nobody has
  answered: does any land-gate path load a model by manifest lookup?** If so it resolves against
  nothing there, and the failure is a silently different resolution rather than a visible skip.

**So neither tree gives a reproducible answer and the two disagree in opposite directions.**
DG-102 (gate is pytest-only, blind to frontend) is the same family and still open.

## 2. THE QB-1 FROZEN BOUNDARY HAD DRIFTED — fixed, but read the lesson

`app/config/model_registry.json` pinned `307200148e2c251e…`, actual `ad981800711a322e…`. The pin held
from 2026-07-02 through the **parent of `99c238d6`** = **DG-028, 2026-08-28**, which added 17 lines
custodially registering `engine_b:v1_fallback` (its own `approved_by` says "not a new approval").
Legitimate change; the pin was simply never updated with it. **Nothing published by QB-1 is
affected** — the study ran against the old pin; only a RE-RUN would have refused.
Re-pinned on David's word in **both** places (`scripts/run_qb1_study.py:82` and
`tests/contract/test_qb1_green_correction_contracts.py:1402`) — the double entry exists so a
unilateral change is impossible **and it worked**: editing the runner alone failed
`test_r3g4_f25_set_is_runner_owned_and_exactly_the_registered_five`. Commit `88451a1e`.

## 3. ⛔ TE **AND RB** ARE SERVED "VALIDATED" HAVING FAILED THEIR OWN GATES
**Corrected by the 08-31 closeout audit: this is NOT TE-only.** RB is also served `VALIDATED` with
`g3_market_superiority_pass: false` and the justification "Promotion blocked by G3". QB passes
exactly as many gates and is served `PROVISIONAL`. Only WR earns the badge cleanly — **two of four
positions are over-badged and the badge is inconsistent across positions.**
Also corrected: the third TE artifact is **`20260516T164503Z`** (not `…155041Z`, which exists
nowhere on the machine); `backtest_result_TE.json`'s `model_artifact_hash e2ca15ed…` matches THAT
pickle, not the served `20260626T165649Z`. Every backtest carries `run_date 2026-05-31` — three
months stale. `model_card_source_TE.json` lists "Any trade decision" and "Dynasty value ranking" as
**out_of_scope_uses** while setting `is_experimental: false`. And **`v2_manifest.json` — the file
routing every TE score — is gitignored, has no git history, and no code path on the machine can
produce its non-null TE pointer** (`train_engine_b` sets `manifest[pos] = None` unless
`promotion_warranted` is truthy, and TE's is false/None). `tests/test_engine_b_contract.py:295` is a
GREEN test that enshrines the defect, so fixing this will look like a regression.

The live `/api/roster/audit` returns `model_status_by_position: {QB PROVISIONAL, RB VALIDATED,
TE VALIDATED, WR VALIDATED}`. For TE that claim is false, and the chain is:

- **The only TE run that ever ran the promotion gate FAILED it.** Run `20260513T012309Z`:
  TE train 589 / test 171 / **improvements 0 / promotion_warranted False**. Same run:
  QB 169/95, RB 387/186, WR 607/300 — all improvements 3, all True. TE is the one position that
  failed a fair test.
- **The served TE model is a different, ungated one** — `runs/20260626T165649Z/te_v3.pkl`:
  train_rows 492, **no `test_rows` key at all**, `promotion_warranted: null`.
- **The badge comes from a THIRD artifact** — the trust report references `runs/20260516T155041Z`.
- **The staleness guard cannot catch it:** `roster_audit_models.py:69` compares
  `result.model_version != manifest[pos]` — both are the literal string `"engine_b_v2"` for every
  position. It compares a label to itself.
- **The code forbids exactly this.** Above `ENGINE_B_EXPERIMENTAL_POSITIONS = frozenset()`:
  *"Cleared only when a promoted v2 artifact passes the ≥2/3 gate… No agent may remove a position
  without a passing validation report."* TE was removed in `623122aa` (2026-05-16) without one.

**ROOT CAUSE — a retrain alone will NOT fix it.** `scripts/train_engine_b.py` TE path (~:141-172)
fits on all rows, then `y_pred = model.predict(X)` on **the same X** (metrics are IN-SAMPLE), writes
no test_rows, and hardcodes `"promotion_warranted": None` — the gate is never called. QB/RB/WR hold
out 2022-2023 and actually run `_gate`. **Fix the training path first, then retrain.**

**David's ruling 2026-08-31: "Leave it, retrain TE first"** — he chose to fix the model rather than
relabel, accepting that the false badge stays on screen meanwhile. Handed to the model lane.
**Expect TE may fail again — that is the correct outcome if so. Do NOT tune until it passes.**

Related: `ENGINE_B_REPLACEMENT_DVS` is **TE 95.6** vs WR 60.6 / RB 46.4 / QB 64.2, so TE xVAR is on a
different scale — a TE at DVS 86.9 is BELOW replacement while a WR at 63.3 is ABOVE, rendered
interleaved in one column. **Do not touch that constant** (coupled family, DG-092 guards it).

## 4. ✅ THE ROSTER SCREEN THREW AWAY 20 SCORES — FIXED, LANDED, LIVE (`8695bab1`)

**SHIPPED 2026-08-31.** Live now: **24 of 27 scored, was 4 of 27.** The three remaining blanks are
correct — Garrett Wilson (7 games) and Braelon Allen (4) under `ENGINE_B_MIN_GAMES_T`, Tank Dell
(no 2025 season). Gate 6552 passed / 0 failed. Pushed; `origin/main` = `8695bab1`.
**The fix was to widen the universe index to ENGINE_B rows** (`roster_auditor.py`
`_load_rostered_universe_pvos`, keyed on `sleeper_player_id`), NOT to swap the join key — reading
the adjudicated row inherits the games-gate refusal instead of recomputing it. It also retired the
fake `signal_completeness` for free (real values 1.0 / 0.9412 / 0.8333, not 0.2353 for everyone),
so the "do not use for dynasty decisions" caveat does NOT ride under the restored scores.
⚠ Consequence now live: the top four by DVS are three TEs (Kraft 100.0 clamped, Barner 86.9,
Johnson 81.1) — see the TE scale inversion in §3. The screen is now honest about what the model
says and still misleading about what it means, until TE is resolved.

The diagnosis, kept because the failure shape recurs:

`app/services/roster_auditor.py:643-645`:
```
gsis_id = p.get("gsis_id")
score = engine_b_scores.get(gsis_id) if gsis_id else None
features: dict = {"age": p.get("age")}
```
Sleeper returns `gsis_id: null` for **all 27** of David's players, so 0 of 27 join. Same server, same
minute: `/api/players/12527` → 75.3 ACTIVE_B while `/api/roster/audit` → null PRE_MODEL.
`/api/engine-b/scores` serves 505 predictions that this route discards. Endpoint reports
`dropped_player_count: 0`. Born broken `56e57826` (2026-05-13), untouched since 2026-06-27 — **not a
sprint regression.** Green suite because the contract test fixture invents `"gsis_id": "gsis_rb_001"`.

Split of the 23 blanks: **20** dropped, **2** (Wilson 7 games, Allen 4) correctly under the 8-game
gate but blank for the WRONG reason, **1** (Tank Dell) correctly blank.

**DO NOT fix by swapping the join key alone** — the dead-window gate reads `games_t` from that same
empty features dict, so it evaluates False and would print Wilson **77.6** and Allen **31.2** as
invented numbers. The right shape: widen the existing `ENGINE_A`-only filter at
`roster_auditor.py:136-141`. Working key is in `app/data/identity_snapshots/` (27 of 27 resolve).

**Blast radius:** `morningRead.ts:392` makes a player a "Worth a look" candidate only if `xvar_pct`
or `dvs` is non-null, and `:674-678` PRINTS the number as the card's justification. So restoring
scores also makes 20 players newly recommendable, with the number as the stated reason.

**Ruling history — a live example of two lanes conflicting.** David ruled "hold the whole fix until
TE is resolved" (07:55, direct, my session), then REVERSED to **"Unblock the roster fix now, then
TE, then foundation"** (08:02, direct, Greg's session) after being shown the cost, then confirmed
**"we can make the roster and te fixes then get to the foundation."** Final order: **roster → TE →
foundation.** A peer lane asserted the first ruling had never been his and originated as a lane's
own recommendation; that was WRONG and was retracted — it was his, directly. **Provenance is a
lookup, not a deduction:** `python3 ~/dg-build/bin/rulings.py` sweeps all lanes' transcripts and
prints every ruling with the lane it was given in. Run it before treating any relay as authority.

## 5. `signal_completeness` — NARROWED, NOT RETIRED (corrected by the 08-31 closeout audit)
It was 4 ÷ per-position denominator (QB 4/18, WR/TE 4/17, RB 4/14) for EVERY player, because the
route passed only `age`. After `8695bab1` the served roster shows **seven distinct values**
(1.0, 0.9412, 0.9286, 0.8333, 0.8235, 0.7857, 0.2353) for 26 of 27 players.
**⚠ BUT THE CODE PATH IS UNCHANGED** — `roster_auditor.py:664` still reads
`features: dict = {"age": p.get("age")}`. Tank Dell still lands on it, still reads exactly
**0.2353**, and still displays *"Fewer than 50% of required signals present — do not use for dynasty
decisions"*. Both halves are true at once: the number is genuinely computed (`inputs_present` is a
real 4-element list) AND it comes from the unfixed path. Say both, or the next reader either
re-opens a closed defect or closes an open one. Fifth instance of the decorative-constants class
(after `activity_recency_score` 0.0, `divergence_density_score` 1.0, `feasibility_score`, `fit_score`).

**Tank Dell is NOT a games-threshold case.** Wilson (`games_t=7`) and Allen (`games_t=4`) are the
governed `ENGINE_B_MIN_GAMES_T=8` refusal (`engine_b_contract.py:143`). Dell has **zero rows in
`engine_b_features_runtime.csv` in any season** — an identity/coverage failure, a different class.
Grouping all three as "the three remaining blanks" hides it.

## 6. ⛔ CORRECTION: `launchctl` `runs` RESETS AT LABEL LOAD, NOT JUST AT BOOT
The recorded fix for the structurally-blind Tuesday check — "require `runs >= 1` AND exit 0" — is
**itself insufficient**. The counter resets on reboot AND on `bootout`+`bootstrap`. Proven
2026-08-31: after the 05:47 reboot, `dynasty-daily-chain` and `dynasty-nflverse-usage-capture` both
read `runs = 0` despite running daily all week. **Use the receipt a run writes (embedded
`finished_at`/`run_id`), never a counter and never a process name.**

## 7. ⛔ `model − market` IS NOT A MISPRICING SIGNAL — it is a horizon mismatch

The buy/sell divergence surface rests on subtracting a model percentile from a market percentile.
**Those two numbers answer different questions, so the subtraction is not defined.**

Measured (Greg lane), partial correlations residualised on `ppg_t`, n=271:
- market percentile vs age = **−0.4217** · model percentile vs age = **−0.2121**
- true age effect on realised 2-year-forward PPG, 2,236 labelled rows = **−0.1383**

So the model is well calibrated to the two-year window it was actually trained on; the MARKET is
pricing career length, which lies entirely outside the model's target. The model cannot represent
it and is not "wrong." The visible symptom: BUY list mean age **27.41**, SELL list **23.84**,
gap +3.57 years, `corr(age, model_minus_market_delta)` = **+0.3921** over n=333 — **reproduced
independently THREE times by three lanes, identical to four decimals.** In a dynasty format that is
the product recommending you buy old and sell young.

Only **333 of 12,226** players carry any divergence signal at all (11,892 UNAVAILABLE), and the
served PVO artifact carries **no market_overlay on any row** — the divergence lives in a side
artifact (`app/data/valuation/universe_market_divergence_latest.json`) never merged into the
served object.

**No model improvement fixes this.** It needs a longevity/survival term so the number prices the
same horizon the market prices — there is none in either engine, and `projection_1y`/`projection_3y`
are schema fields permanently `None`. The cheap honest mitigation is to stop presenting
model-minus-market as a verdict. **Neither is built; both need David's word.**
⚠ The causal explanation was being stress-tested when this was written — the open attack is whether
the age effect survives controlling for games played, snap share and draft capital, since the only
control was `ppg_t`. The MEASUREMENT is settled; the EXPLANATION was not yet.
Belongs with [[project_ranking_diagnosis_2026-08-31]].

## 7b. ⛔ WRITING THROUGH A SYMLINK DESTROYED TRUNK FILES — the day's one real data loss
Building the gate fix, a loop did `mkdir -p "$WT/$(dirname $rel)"; rm -rf "$WT/$rel"; ln -s "$TRUNK/$rel" "$WT/$rel"`
over a path list. An EARLIER step had already symlinked `$WT/app/data/models/head_a` → the TRUNK's
head_a. So the next iteration's `rm -rf` and `ln -s` **followed that symlink into the real trunk**
and replaced `head_a/{v3_manifest.json,runs}` with symlinks pointing at THEMSELVES. Originals gone.
Symptom: the 09:00 chain's `run_pvo_refresh` aborted `[Errno 62] Too many levels of symbolic links`.
**Recovered** from `gs://dynasty-genius-backup-dtl/dynasty-genius/runs/20260830T141500Z/` and verified
by sha256 against `model_registry.json` (`9e1b0b7f…`), not by eye. Product was never affected —
serving reads the engine_b manifest, not head_a.
**RULE: never `ln -s` into a tree you have already symlinked. Check `-L`/`islink` on every ancestor
first, or build link sets bottom-up.** `ln -s X DIR` when DIR exists also silently creates `DIR/X`.

## 7c. ✅ GATE FIXES LANDED — dg-build `11021d9` + `10562f9`
- **Land worktrees were scoring with `engine_b_v1`.** `v2_manifest.json` and every served run dir are
  gitignored; the v1 pickles are TRACKED. So `_load_v2_bundles()` failed the manifest read, logged an
  error nobody reads, returned `{}`, and `engine_b_service.py:137`
  (`self._v2_bundles.get(position) or self._v1_bundle`) silently downgraded EVERY position. Measured
  same-commit: worktree v2 bundles **NONE** vs trunk QB/RB/WR `engine_b_v2_*` + TE `engine_b_v3_te`.
  Fixed by adding `app/data/models` to `SHARE_PATHS` in `dg-work.sh` — `share_path` already handles
  the mixed tracked/ignored tree, so no run-id list and it survives retrains.
  Proven: **177 passed/7 skipped → 184 passed/0 skipped.**
  ⚠ **`engine_b_service.py:137` still FAILS OPEN** — a missing manifest silently downgrades to a
  superseded model. David's call; NOT fixed. (Line 137 is pre-existing, `762e50cb` 2026-05-12 — one
  place where the check-WHEN rule was actually applied.)
  ⛔ **THE FIX IS NOT RETROACTIVE, AND IT WIDENED A HAZARD.** `dg-work.sh` shares at worktree
  CREATION; `dg-land.sh` never re-shares. Worktrees made before 08:46 (`~/dg-wt/DG-014`,
  `~/dg-wt/DG-017`) still have no `v2_manifest.json` and no `head_a`, so landing either still
  validates `engine_b_v1` and still skips the seven F25 tests. **No backfill, nothing detects it —
  re-run `dg-work.sh` before landing an old worktree.** And `WRITABLE=()` is empty by default, so
  `share_path` ends at `dst.symlink_to(src)`: the gitignored model children become **symlinks into
  the trunk's LIVE model store**. `11021d9` landed 90 seconds after the head_a destruction and
  extended that same write-through exposure from head_a alone to the whole deployed model tree.
- **DG-102 closed**: `dg-land.sh` now runs `npm run gate` (typecheck·lint·vitest·banned-language·build,
  5.6s) always-on, and **REFUSES the land if npm cannot be resolved** rather than skipping. npm is
  nvm-managed and absent from a minimal PATH. Harness 21 → **32 checks** proving fire, pass and the
  npm-absent refusal.

## 7d. ✅ TIE-AWARE MIDRANKS — `8cc44eef`
`compute_dvs_pct_batch` enumerated by sort position, so identically-scored players got different
percentiles. **23 tie groups, 64 players.** The clamp pins 11 of 89 TEs at exactly DVS 100.0 and they
received ELEVEN different percentiles (Kelce 90.9 *below* Fannin 92.0). Fixed with average rank; the
correct pattern already existed at `market_overlay_service.py:46-53`. Untied populations unchanged.
⚠ **NAMING TRAP that nearly produced a false "not observable" report:** this value reaches the
artifact and API as **`valuation.xvar_percentile_position`**, NOT `dvs_pct` (`universe_pvo_batch.py:99`).
Grepping a served payload for `dvs_pct` returns nothing and looks like a dead field.

## 7a2. ⛔ SECOND SELF-INFLICTED INCIDENT — a "sandboxed" run published LIVE artifacts
At 09:06 a verification run of `run_pvo_refresh.py` with FIVE artifact-path flags redirected
(`--pvo-artifact-path`, `--coverage-artifact-path`, `--report-path`, `--capture-db-path`,
`--capture-report-path`) **overwrote all three live serving artifacts** in
`app/data/valuation_runtime/`. The decisive flag is **`--runtime-dir`, which defaults to
`app/data/valuation_runtime`** — production. The flags were never broken; the wrong ones were set.
Caught only by an mtime snapshot taken before/after. Output happened to be valid, so nothing was
lost — luck, not design. **The artifact served for the rest of the day was the one that run
published**, so any measurement taken from it inherits that provenance.
Guards since landed by the Fred lane: `1495144d` (refuses the incoherent sandbox-looking
combination) and `40b6de69` (preflight declares what it will WRITE and whether it is live).
**ALWAYS `--preflight` first and read EVERY resolved path, not only the ones you set.**

## 7e. `--preflight` — and the correction I owe the record
I claimed `run_pvo_refresh.py`'s artifact-path flags "do not redirect". **WRONG.** They redirect
fine; the decisive flag is **`--runtime-dir`, which defaults to `app/data/valuation_runtime`**, and
I missed it after my own grep showed unidentified args. `--preflight` already existed there and
would have shown me. Added the same to `run_market_divergence_refresh.py` (`5f06a4a8`), the only one
of four chain runners lacking it, with FIVE publish-defaulting paths.
**ALWAYS run `--preflight` before any "sandboxed" run, and read every path, not just the ones you set.**

## 7f. THE DETECTION LAYER WORKS — DELIVERY IS WHAT FAILS
`~/DG-CAPTURE-ALERTS.txt` was right and specific three days running: vintage-sync never firing
(08-30), a pvo retry refusal (08-29), and my own head_a destruction (today, naming the exact failing
step of six). **All three reached a human only because somebody opened a text file.**
Also verified GOOD BY DESIGN and worth not "fixing": `inspect_backup_marker`
(`system_capture_health_models.py:1077-1116`) treats an absent sentinel as benign ON PURPOSE, with
the 26-hour `finished_at` law as the real guard — a sentinel can only ADD a reason, never suppress
one, and every healthy run violates sentinel-vs-marker for its whole duration. Predicted and
confirmed live: a backup in flight at 10:30 produced **zero** backup lines, and `grep -ci backup`
over the whole file's history is **0**.

## 8. THE DAY'S RECURRING SHAPE — a reading taken without checking its conditions
Every false signal on 2026-08-31 had this form: `launchctl runs = 0` after a reboot (looked like
"never ran"); a receipt accurate about 13:08Z Aug 30 and silent about the 38 files added since;
`(years_exp or 9) <= 1` turning a rookie's `0` into `9` and biasing a finding toward the null; a
gate whose verdict depends on which tree it runs in; a trust badge comparing `"engine_b_v2"` to
`"engine_b_v2"`. **Every artifact has an as-of, and the as-of is part of the claim.**

Related: [[project_season_readiness_2026]], [[david_rulings_dg3]], [[project_dynasty_genius]],
[[project_ranking_diagnosis_2026-08-31]], [[david_rulings_ranking_2026-08-31]]
