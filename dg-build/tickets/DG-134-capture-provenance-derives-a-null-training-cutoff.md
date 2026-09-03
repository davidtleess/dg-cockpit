# DG-134 — The forward capture's provenance records `training_cutoff: null` every morning because it reads a `season` column the runtime table does not have

**Layer:** 2 · **State:** open · **Lane:** Davids-MacBook-Pro-77417 · **DG 3.0** · **backend / capture provenance · cosmetic today, a lie tomorrow**
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

## Closeout — built 2026-09-02 21:47–21:58 (Fred), commit `7fbc40e1` on `ticket/DG-134`

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
  column 31 (values `"True"`/`"False"`).
- **`feature_assembly.SEASON_COLUMN` does not exist.** The only shared constant is
  `inference_partition.SEASON_COLUMN`; that is what the fix uses.
- Today's row count is **12,227**, not 12,226 (12,226 was 09-01's). Unchanged by this ticket
  either way — that was the point of the row-level diff.
- **The addendum's "exactly ONE spurious `vintage_changed: true`" is wrong.** `provenance_hash`
  already changes on essentially every capture — the store holds **12 distinct hashes over the
  last 10 capture dates** (`feature_csv_sha256` and `source_snapshot_captured_at` are both in the
  hashed subset). The first capture after landing will carry a new hash, exactly as every capture
  before it did. There is no anomalous morning to warn anyone about.

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
with ONLY the live spelling; the hashed subset carrying it; the driver aborting with nothing
appended to any table; and the legacy refresh restoring the pair byte-identically. Full suite
**6795 passed / 33 skipped** — the 6778 baseline plus exactly these 17, no regressions. `ruff check`
clean; pre-commit passed.

**Anti-scope held.** No assembler change, no CSV regeneration, no change to which rows are captured,
no change to the `provenance_hash` algorithm — only the value inside it becoming real.

**Going live.** DG-134 touches no `frontend/` file, so **no `npm run build`**. Both launchers run
trunk's script from disk, so a `git pull --ff-only` on trunk is sufficient; no API restart is needed
for this ticket (the API does not read the derivation). The first capture to write a real cutoff
is the next scheduled run after the pull.
