---
name: project_dg142_built_2026-09-03
description: "DG-142 (roster trust badge checks the served bytes) LANDED on main 1812a5c8 09-03 08:08 but NOT live at closeout; the 'backtest re-run restores the badges' claim is FALSE — the published surface is pinned in tracked source owned by another lane"
metadata:
  type: project
---

**DG-142 LANDED on main `1812a5c8` 2026-09-03 08:08** (built + audited 06:46 as `7542bdb9`).
David released the after-09:15 hold early with "land 142" — safe because **landing alone changes
nothing on screen**. Gate read directly: 6829 passed / 33 skipped, frontend 90 + 629, no failures.
**⚠ NOT LIVE at closeout: trunk was `6f517027` (DG-140), behind 2 — the roster page still showed the
old VALIDATED chips.** To make it live: trunk pull → `launchctl kickstart -k gui/501/com.davidleess.dynasty-api`
→ curl `/api/roster/audit`. No npm build. Expect four "not proven" badges and a degraded read — that
is the ticket working, and the curl output is the acceptance receipt nobody has captured yet. Suite 6817 / 33 skipped (6804 without
the new file — delta 13). 13 tests, 10 red first.

**The defect:** `roster_audit_models.py` guarded badge freshness with `result.model_version !=
manifest[pos]`. Both sides are the generic string `"engine_b_v2"` on ALL FOUR positions, so the
staleness branch was **unreachable by construction**. Artifacts `run_date 2026-05-31`; served
bundles mtime `2026-08-31 16:44:58`. The page said RB/TE/WR "passed its accuracy checks" about
models that no longer existed — while `/api/trust-surface/*` said the opposite on the same screen.

**The fix:** wire the pre-existing `check_served_alignment` (sha256s the deployed .pkl vs the
artifact's `model_artifact_hash`) into the SECOND consumer. Refusal unconditional; the two hashes
choose only the caveat — both present → `trust_status_stale`, either absent → `trust_status_unavailable`
(never assert a cause you did not establish). No new copy; both tokens already in SAFE_TOKENS.
Live effect: all four EXPERIMENTAL, roster read `degraded`. Authorised, and it includes QB.

**⛔ THE BIG CORRECTION — I told David the wrong thing first, the audit caught it.**
"A backtest re-run restores the badges" is **FALSE**. A re-run DOES record the served hashes
(verified: `backtest_harness.py:781-786` hashes the pkl from the same manifest the guard reads;
feeding those hashes to the guard gives aligned=True on all four). **But the published surface the
badge reads is PINNED** — `PINNED_RUN_IDS` in `scripts/publish_trust_surface.py:22-27` ("Explicit
pins — NOT auto-selected by run-date"), enforced by `scripts/validate_trust_publication.py:147`
which RAISES on mismatch. `run_backtest.py` writes into a runs/ dir the roster page never opens.
Real follow-on = 4 steps: backtest per position (`--all` covers QB/RB/WR only — TE needs its own
invocation) → **edit PINNED_RUN_IDS** → re-publish → re-run the publication audit. That edit
retires the pinned "coherent 2026-05-31 G3 batch" — a decision, not a chore. **Both scripts belong
to `davidleess-0b`'s lane, so the follow-on is NOT this lane's to execute.**

**⚠ Alignment ≠ a good badge.** Passing the guard only removes the staleness refusal. The
`20260831T204458Z` bundles have never been walk-forward backtested, so their promotion-gate outcome
is UNMEASURED. Re-publishing returns the truth, not necessarily three VALIDATED badges. Never
promise David the badges come back.

**⚠ Landing shows nothing without a restart** — land → trunk pull → `launchctl kickstart -k
gui/501/com.davidleess.dynasty-api` → curl `/api/roster/audit`. No npm build (no frontend file).

**Audit:** 30 agents / 6 lenses, 24 findings, **16 refuted, 8 survived**, 3 changed the work: the
blocking one above; the caveat conflating five causes; and the `caveat → degraded` step being pinned
NOWHERE — proven by mutation (deleting `if trust_caveats: status = "degraded"` left all 6815 tests
green). That branch is pre-existing (blame 2026-06-19) and is now covered in both directions.

Related: [[project_dg134_landed_2026-09-03]], [[feedback_synthesis_is_the_weak_layer]],
[[feedback_parallel_session_coordination]].
