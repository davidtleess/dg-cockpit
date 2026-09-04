---
name: project_dg134_landed_2026-09-03
description: "DG-134 landed on main 32ceb8fb 2026-09-03 05:23 but is NOT live (trunk unpulled); the capture's training cutoff now reads feature_season and REFUSES rather than nulling; vintage_changed flips every morning by construction (DG-141)"
metadata:
  type: project
---

**DG-134 landed on main `32ceb8fb` 2026-09-03 05:23:10** (David ran `dg-land.sh` himself; branch
`e2fa691b` pushed 05:20 on his "push it"). Gate read directly, not trusted: 6804 passed / 33 skipped,
frontend 90 + 629, no failures. Worktree + branch removed by the lander.

**LIVE ON TRUNK 2026-09-03 05:30** on David's "run it": pull `a1f1023f..32ceb8fb` (10 files —
DG-139 came in the same pull), `launchctl kickstart -k gui/501/com.davidleess.dynasty-api` →
**pid 90590 → 50754**; 5 real routes 200 (health 9.5s cold / 0.40s warm), 27 roster rows with ages,
**0 frontend files so no bundle rebuild**. The kickstart was DG-139's requirement, not DG-134's.

**⚠ NOTHING IS PROVEN ON SCREEN YET.** The derivation runs at CAPTURE time, so the first capture to
write `{"value": 2023, "status": "derived"}` is the **09-03 09:00 chain**. Read
`capture_report.status` + today's row count, never the chain's exit (DG-136's lesson). The new
refusal path has still never executed in production — the tests remain its only evidence.

**What changed:** `_derived_training_cutoff` read `record["season"]`; the runtime table has always
spelled it `feature_season` (col 19 of 44 — 40 is the SEED table's count). The `KeyError` was
swallowed, so a `null` was hashed into every row's provenance under a "derived" label. It now reads
the partition module's `SEASON_COLUMN`/`ELIGIBLE_COLUMN` and its **public** `season_of` /
`is_training_eligible` (promoted from private by this ticket). An unanswerable table is **REFUSED**,
not nulled: `TrainingCutoffUnderivable` with bare token `capture_training_cutoff_underivable` →
driver's own aborted report, nothing appended → via DG-136 the chain step exits 1. The old `season`
spelling is refused, deliberately.

Measured live before landing: `null` → **2023**, 12,227 rows and every other column byte-identical;
the HEAD rehearsal reproduced the hash actually on that day's live rows.

**⛔ THE ADDENDUM'S "ONE SPURIOUS `vintage_changed`" WAS FALSE, for DG-134 and DG-139 both.** The
vintage is the PAIR `(semantic_output_hash, provenance_hash)`; it was true on **9 of 9 consecutive
capture dates**. Mechanism (found by `davidleess-0b`, verified independently): a microsecond
timestamp `source_snapshot_captured_at` is hashed directly at `model_forward_capture_driver.py:158`,
while the same function's docstring 17 lines above says the subset EXCLUDES dates. **Now DG-141,
open, remedy undecided.** The SEMANTIC half works — 09-02's two captures share a provenance hash
but differ semantically (DG-137's 14:50 rerun, 142 team labels).

**Time bomb to remember:** "trained through" is ambiguous between feature season and outcome season.
2023 is right today only because `HOLDOUT_SEASONS = [2022, 2023]` happens to be the last two eligible
seasons and the target is `avg_ppg_t1_t2`. When 2024 becomes eligible the two readings diverge and
this field needs a decision.

Related: [[project_dg136_built_2026-09-02]], [[project_dg137_served_team_landed]],
[[feedback_my_conventions_are_not_davids_rules]], [[feedback_parallel_session_coordination]].
