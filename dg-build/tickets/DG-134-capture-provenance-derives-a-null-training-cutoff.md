# DG-134 — The forward capture's provenance records `training_cutoff: null` every morning because it reads a `season` column the runtime table does not have

**Layer:** 2 · **State:** LIVE on trunk 2026-09-03 05:30 (main `32ceb8fb`, API pid 50754) · **Lane:** Davids-MacBook-Pro-77417 · **DG 3.0** · **backend / capture provenance · cosmetic today, a lie tomorrow**
**Source:** DG-133 follow-up (filed 2026-09-01 in its LANDED section; ticketed 2026-09-02 06:05 by Tower).

**Problem:** `src/dynasty_genius/capture/model_forward_capture_driver.py:116-129`
`_derived_training_cutoff` walks the feature CSV bytes and, for every `training_eligible == true`
row, reads `record["season"]`. The live table (`app/data/features_runtime/engine_b_features_runtime.csv`,
40 columns) has no `season` column — the season is `feature_season` (column 19). The `KeyError`
is swallowed by `except (KeyError, ValueError): continue`, so `seasons` stays empty and the
function returns `None`. The capture's provenance-hash subset therefore records the training
cutoff as `null` and labels it "derived" — a value that reads as "unknown" when the truth is
"2023, every morning".

**Why it matters:** the provenance record is the capture's promise about what the model was
trained through. `null` is not a refusal, it is a silent blank in a hashed field — the next
person who reads it will not know whether the cutoff was unavailable or the code was wrong.
It does not change the capture's row count (12,226) or any served value — cosmetic today. It
becomes a lie the day someone compares provenance across vintages and reads `null == null`
as "same cutoff".

**Fix shape (small):** read the season through the assembler's own column name
(`feature_assembly.SEASON_COLUMN` / the same constant `inference_partition.py` uses), never a
bare literal; and make an all-`None` result on a non-empty eligible set FAIL CLOSED with a bare
token (`capture_training_cutoff_underivable`) rather than return `None` — the driver already has
the `abort(...)` path DG-133 wired. Contract test: a CSV with `feature_season` and eligible rows
derives the cutoff; a CSV missing the season column aborts with the token; a CSV with the old
`season` spelling also derives (or is refused — pick one and pin it).

**Anti-scope:** no assembler change, no CSV regeneration, no change to which rows are captured,
no `provenance_hash` algorithm change beyond the value now being real (note: the hash WILL
change once the cutoff is real — say so in the closeout so nobody reads it as drift).

**Verify:** run the driver read-only against the runtime CSV into a scratch DB; provenance shows
`training_cutoff: 2023`, `derived: true`; row count unchanged at 12,226.

**Addendum 2026-09-02 06:15 (rehearsal reader, verified line refs):** the null is hashed into `provenance_hash` (`driver.py:182-185, :507`) and is stable day-over-day, so it does NOT perturb `vintage_changed` today — but the fix (reading `feature_season`, value 2023 on the current table) changes the hashed subset and will produce exactly ONE spurious `vintage_changed: true` on its first capture. Say so in the landing note so nobody reads that morning as a model change. Confirmed present in the real record `app/data/ops/dg131-capture-20260901T193159Z/report.json` (`engine_b_derived_training_cutoff: {status: derived, value: null}`, `feature_csv.max_training_season: null`).

---

## Closeout — built 2026-09-02 21:47–21:58 (Fred), audited 22:00–22:22, commit `e2fa691b` on `ticket/DG-134`

Rebased onto `c62783b1` (Greg's DG-139) at 22:23 — clean, no conflicts.

**Root cause, confirmed at the source.** `_derived_training_cutoff` read `record["season"]`;
the live runtime table spells it `feature_season`. The `KeyError` was swallowed by
`except (KeyError, ValueError): continue`, so the eligible-season list stayed empty and the
function returned `None` — written as `{"value": null, "status": "derived"}` and hashed into
`provenance_hash` on every captured row. The driver's own test fixture carried BOTH spellings,
which is why no test ever noticed.

**Fix.** The derivation now uses the shared inference-partition module — its `SEASON_COLUMN` /
`ELIGIBLE_COLUMN` names and its `season_of` / `is_training_eligible` normalisers, promoted from
private to public so one module owns what the feature table's columns are called and how a flag
reads (a `1`/`0`-typed writer no longer reads as "no eligible rows"). A table that cannot answer
the question is **refused, not silently nulled**: no season column, no eligibility column, or an
eligible row whose season is blank or non-integer raises `TrainingCutoffUnderivable` carrying the
bare token `capture_training_cutoff_underivable`. The driver turns that into its own aborted
report before anything is appended (`decision_supported: false`); the legacy in-place refresh
restores the pair and aborts at both hash sites. In production the refusal reaches the chain
through DG-136 — a capture-stage refusal exits 1.

**Paired measurement — trunk's LIVE runtime pair, same inputs, same code path, scratch DB.**
`app/data/features_runtime/engine_b_features_runtime.csv` + `universe_pvo_runtime.json` +
`universe_pvo_coverage_runtime.json`, read-only; the only writes were a scratch DB and report in
a run-scoped scratchpad dir (never the symlinked live 1.4 GB store).

| | HEAD (`a1f1023f`) | DG-134 |
|---|---|---|
| `engine_b_derived_training_cutoff` | `{"value": null, "status": "derived"}` | `{"value": 2023, "status": "derived"}` |
| `feature_csv.max_training_season` | `null` | `2023` |
| `provenance_hash` | `9b8fd7bfaed1552e…` | `166f36ea5f7665e4…` |
| rows: raw / snapshot / joinable | 12227 / 12227 / 583 | 12227 / 12227 / 583 |

Diffed field-by-field and row-by-row: those three fields plus the hash they feed are the **entire**
difference. Every other report field and every other column of all four capture tables is
byte-identical. **The HEAD rehearsal reproduced today's real capture exactly** — `9b8fd7bfaed1552e…`
is the `provenance_hash` sitting on all 24,454 of 2026-09-02's live rows, so this is a measurement
of the production path, not of a fixture.

**Corrections to this ticket, all measured today:**
- The runtime table has **44 columns, not 40**. `feature_season` is column 19, `training_eligible`
  column 31 (values `"True"`/`"False"`). 40 is the **seed** table's column count
  (`app/data/training/engine_b_features_v2.csv`) — an easy pair to cross, and the seed spells the
  season `feature_season` too, so the diagnosis was right either way.
- **`feature_assembly.SEASON_COLUMN` does not exist.** The only shared constant is
  `inference_partition.SEASON_COLUMN`; that is what the fix uses.
- Today's row count is **12,227**, not 12,226 (12,226 was 09-01's). Unchanged by this ticket
  either way — that was the point of the row-level diff.
- **The addendum's "exactly ONE spurious `vintage_changed: true`" is wrong — and it is wrong for
  DG-139 too.** The vintage is the **pair** `(semantic_output_hash, provenance_hash)`
  (`model_forward_capture_driver.py:588-593`, `what_changed/daily_diff.py:273-275`), and both
  halves already move every capture. Measured on the live store over the last 10 capture dates:
  14 distinct `semantic_output_hash`, 12 distinct `provenance_hash`, 14 distinct vintage pairs —
  and **`vintage_changed` was true on 9 of 9 consecutive date pairs.** A new vintage every morning
  is the status quo, not an event. Tomorrow's 09:00 will flip it again, as it has every day since
  at least 08-23; DG-134 and DG-139 add two more reasons to a flag that was already going to be
  true. **The honest landing note is therefore not "expect one spurious flip" but "this flag flips
  every morning".**

  **Mechanism, found by `davidleess-0b` after reproducing the measurement and verified here at the
  source — now filed as DG-141.** It is sharper than "the feature CSV hash moves daily":
  `resolve_provenance_subset` hashes `source_snapshot_captured_at` **directly**
  (`model_forward_capture_driver.py:158`), and that value is a microsecond-precision timestamp —
  today's live PVO carries `2026-09-02T13:00:45.174963+00:00`. It differs on every league run by
  construction, so `provenance_hash` **cannot** repeat across days regardless of what the model
  does. The same function's docstring, seventeen lines above at :139-141, states the subset
  "EXCLUDES git_sha / artifact_sha256 / **dates** / row_lineage (those are kept out of the vintage
  hash)". The code contradicts its own contract.

  **Correction to my own first wording above:** I wrote that the flag "cannot distinguish a model
  change from a rerun". That is true of the *pair*, but too broad — the **semantic half works**, and
  the store holds the proof. On 2026-09-02 two captures share `provenance_hash 9b8fd7bfae…` while
  their `semantic_output_hash` differs (`d15b41b1a0…` → `f87cb30e5b…`): that is DG-137's 14:50 rerun
  changing 142 team labels, caught cleanly, because a same-day rerun holds the snapshot timestamp
  constant. So `semantic_output_hash` is a working content signal; it is the provenance half that is
  poisoned, and it poisons the pair. DG-141 states the remedy as a choice for David — drop the
  timestamp from the hashed subset (smaller, and matches the stated design), or keep it and report
  the two halves separately — and is not decided.

**Decisions pinned (David or Tower may overrule any of these):**
- The **old `season` spelling is refused**, not accepted as a fallback. A fallback spelling is
  precisely the leniency that hid this for months. One fixture in `test_pvo_refresh_runner.py`
  used `season,training_eligible` — a shape the product has never had — and moves to the live
  spelling.
- **A table with an eligibility column but no eligible row still derives `None`.** There is
  genuinely nothing to derive from, so that null is honest rather than a swallowed error.
- **One bare token carries no sub-cause.** A refusal says `capture_training_cutoff_underivable`
  whether the season column is missing, the eligibility column is missing, or one row is
  unreadable. That is a deliberate trade for a stable machine token; splitting it into three is
  a small follow-up if the distinction ever matters at 09:00.

**Tests.** 17 new contract tests in `tests/contract/test_dg134_training_cutoff_reads_feature_season.py`,
**proven red against the old derivation first (15 of 17 failed** — the other 2 pin invariants that
already held). They cover: max over eligible rows only; the column names coming from the partition
module rather than bare literals (source-scanned); the four eligibility spellings; the five refusal
cases; both honest-`None` cases; the driver recording 2023 in both provenance places on a fixture
with ONLY the live spelling; the hashed subset carrying it; and the driver aborting with nothing
appended to any table.

An **18th test was added after the audit** (see below). The legacy refresh has two hash sites, and
the first test only ever reached the pre-refresh one — which raises *before* `refresh_fn` runs, so
its "the pair is byte-identical" assertions had nothing to restore and proved only "nothing was
touched". The new test drives the **post-refresh** site: the refresh publishes a mutated pair AND a
feature table with no season column, so the refusal lands with the dirty pair on disk. A line trace
through `scripts/run_pvo_refresh.py` confirms it: pre-refresh handler 0 hits, `refresh_fn` 1 hit,
post-refresh handler and both restore writes 1 hit each — **a handler no test in this repo had ever
executed.** The first test was renamed to say what it actually proves.

Full suite on the rebased tree (DG-139 underneath): **6804 passed / 33 skipped**, and 6786 with
this file ignored — a delta of exactly 18. `ruff check` clean; pre-commit passed.

**Two follow-up checks, run because the refusal is new behaviour that can turn a green morning red:**
- **Neither feature table can trip a refusal today.** Runtime and seed both carry `feature_season`
  and `training_eligible`, both have 2,241 eligible rows, both derive **2023**, and **neither has a
  single eligible row with a blank or non-integer season** (0 of 2,241 in each). Whichever source
  resolves, the answer is 2023 and the capture proceeds.
- **The verification was re-run with no shim at all.** The first run pinned the feature source by
  hand; the second passed `feature_source=None` from `cwd=` trunk so the driver resolved it itself,
  exactly as production does. It resolved to `app/data/features_runtime/engine_b_features_runtime.csv`
  and produced the **same** `166f36ea5f7665e4…`, same 12,227 / 583 rows. The measurement is not a
  friendlier path than production's.

**Anti-scope held.** No assembler change, no CSV regeneration, no change to which rows are captured,
no change to the `provenance_hash` algorithm — only the value inside it becoming real.

**One ambiguity worth knowing, inherited not introduced.** "The last season the model was trained
through" is ambiguous between the feature season and the outcome season. The deployed Engine B
pickles are fit on feature seasons 2018–2021 (`HOLDOUT_SEASONS = [2022, 2023]`,
`scripts/train_engine_b.py:158`), but the target column is `avg_ppg_t1_t2` — the player's production
in feature_season+1 and +2 — so those fits are labelled with **2022 and 2023 fantasy points**. An
auditor verified this empirically: for all 381 training-eligible 2021 rows, `avg_ppg_t1_t2`
reconstructs exactly as the mean of that player's `ppg_t` in the 2022 and 2023 rows (381/381). So
2023 is the conservative, correct answer to "what football has this model already seen", and it is
the same definition the code always had — DG-134 changed only the column name it reads. Note for
later: `max(eligible feature_season) == max(outcome season in the fit) == 2023` only because
`HOLDOUT_SEASONS` happens to be the last two eligible seasons. Once 2024 becomes eligible those two
readings diverge, and this field will need a decision about which one it means.

**Audit before David read this.** 18 independent agents over 6 lenses (numbers, code, tests, blast
radius, prose, free skeptic), each finding then handed to a separate agent briefed to refute it.
**12 findings raised, 11 refuted with independent evidence, 1 survived** — the legacy-refresh test
claim above, which is fixed rather than reworded. No lens died on the spend limit; all 6 ran to
completion. The most useful refuted finding is recorded above as the "trained through" note: a
skeptic argued the true cutoff is 2021, and the refutation is what established the outcome-column
reasoning. Nothing in the audit touched trunk or the worktree.

**Going live.** DG-134 touches no `frontend/` file, so **no `npm run build`**. Both launchers run
trunk's script from disk, so DG-134 alone needs only a `git pull --ff-only`; the API does not read
the derivation. **But DG-139 is now underneath it**, and Greg's ticket needs an API restart — so a
pull that brings both must be followed by a `launchctl kickstart -k` of the API label, still with no
npm build. The first capture to write a real cutoff is the next scheduled run after the pull.


---

## Landed — main `32ceb8fb`, 2026-09-03 05:23:10 (David ran `dg-land.sh DG-134` himself)

`c62783b1..32ceb8fb`. The land gate's own output, read rather than trusting its ✔:
**6804 passed / 33 skipped** (the exact number measured in the worktree), frontend suites 90 and
629 passed, and zero occurrences of "failed", "error" or "abort" anywhere in the 35KB log. The
worktree `~/dg-wt/DG-134` and the branch were removed by the lander.

**NOT LIVE.** Trunk `~/dynasty-genius-product` is still at `a1f1023f`, behind 4. Until someone
pulls it, the 09:00 chain runs the old script and writes `training_cutoff: null` for one more
morning. Going live needs a `git pull --ff-only` on trunk plus one `launchctl kickstart -k` of the
API label — the kickstart is for DG-139, which is in the same pull; DG-134 alone would need neither
that nor an npm build.


## Live on trunk — 2026-09-03 05:29:53–05:30 (David's "run it")

- `git -C ~/dynasty-genius-product pull --ff-only` → `a1f1023f..32ceb8fb`, fast-forward, trunk level
  with origin. Ten files: DG-134's five plus DG-139's `universe_pvo_batch.py`, `roster_auditor.py`,
  `test_served_age_is_sleepers.py`, `test_surface3_pvo_preservation.py`.
- `launchctl kickstart -k gui/501/com.davidleess.dynasty-api` → **pid 90590 → 50754**.
- Probes, real routes off the served openapi: `/api/health` 200 (9.5s cold, 0.40s warm),
  `/api/engine-b/scores` 200, `/api/system/capture-health` 200, `/api/roster/audit` 200 with 27
  players all carrying an age, `/api/roster/capacity` 200.
- **Zero `frontend/` files in the pull** — confirmed with `git diff --name-only`, so the bundle
  needed no rebuild. The kickstart was DG-139's requirement, not DG-134's.

**What is and is not proven.** The code trunk runs is now the new code. DG-134's derivation only
executes at capture time, so **no real cutoff has been written yet** — the first capture to write
`{"value": 2023, "status": "derived"}` is the **09:00 chain on 2026-09-03**. Read
`capture_report.status` and today's row count, not the chain's exit code (DG-136's lesson). Nothing
so far has exercised the new refusal path in production either; the tests are still the only
evidence for it.
