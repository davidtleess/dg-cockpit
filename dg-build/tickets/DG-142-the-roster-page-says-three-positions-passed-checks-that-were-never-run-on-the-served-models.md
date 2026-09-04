# DG-142 — The roster page says three positions "passed accuracy checks" that were never run on the models now serving

**Layer:** 2 · **State:** open · **Lane:** Davids-MacBook-Pro-77417 · **DG 3.0** · **product truth / trust surface · small**
**Source:** third-party review ("Bob") 2026-09-03, verified end-to-end by Tower's agent on the live API the
same morning. Every element of the claim reproduced.

**Problem:** `app/api/routes/roster_audit_models.py:69` compares `result.model_version != manifest[pos]`.
Both sides are the generic string `"engine_b_v2"` on all four positions, so **the staleness branch is
unreachable by construction** — the badge cannot notice that the binary changed. Live: `/api/roster/audit`
returns `model_status_by_position = {QB: PROVISIONAL, RB: VALIDATED, TE: VALIDATED, WR: VALIDATED}` with no
`trust_status_stale` caveat and `status: "active"`.

All four `backtest_result_*.json` are `run_date 2026-05-31`; `v2_manifest.json` and all four served `.pkl`
files are mtime **2026-08-31 16:44:58**. Running `check_served_alignment` for all four positions returns
**aligned=False on 4 of 4** — "the deployed model has been replaced since these figures were measured".
Measured hash pairs (published artifact vs sha256 of the served .pkl in run `20260831T204458Z`):
QB `d7acb680…`/`fbb3617b…` · RB `5507e37f…`/`03f67f7c…` · WR `3b83bbf9…`/`e1cbb125…` · TE `e2ca15ed…`/`84f05d61…`.

**What David sees today** (`RosterAuditHeader.tsx:62` + `copy.ts:951-955`): "RB passed its accuracy checks",
same for TE and WR; QB reads "passed the safety checks, but not every season we tested confirmed it".
**Nothing on that surface says the numbers describe a replaced model.**

**The product contradicts itself on the same screen.** All four `/api/trust-surface/{POS}` responses already
return `describes_deployed_model=false` with "These accuracy numbers were measured on an earlier version of
this model. The version answering today has been retrained since." (`trust_surface.py:25-28`), rendered at
`TrustStrip.tsx:101-102`.

**Fix shape:** the correct guard already exists — `src/dynasty_genius/eval/served_model_alignment.py:51`
`check_served_alignment` reads `v2_manifest.json`, sha256s the deployed `.pkl` bytes (`:48`) and compares to
the artifact's recorded `model_artifact_hash` (`:108`), failing closed. It is wired into exactly ONE of the two
consumers: `trust_surface.py:130` (guarded) and `roster_audit_models.py:60-61` (unguarded). Wire it into the
second.

**⚠ EXPECTED AND INTENDED CONSEQUENCE — David authorised this knowing it:** all four positions then fail closed
to EXPERIMENTAL, rendering as "not proven" (`copy.ts:954`), and a non-empty `trust_caveats` forces
`status="degraded"` (`roster_audit_models.py:335-336`), which renders "Heads up: this roster read came back
degraded — treat the numbers below as provisional." (`RosterAuditHeader.tsx:38-40`). **The fix makes the page
more truthful and less reassuring at the same time.** It stays that way until the backtests are re-run against
the `20260831T204458Z` bundles — which is the follow-on work, same day.

**⏱ SEQUENCING — David's instruction: land AFTER his ~09:15 morning read, not before.**

**Anti-scope:** do not "fix" it by regenerating model cards or by loosening the guard; do not touch
`trust_surface.py`, which is already correct. Bob's count of "three VALIDATED badges" UNDERCOUNTS by one —
QB's PROVISIONAL is unjustified by the same defect. Scope the fix to the comparison, not to the word VALIDATED.

**Verify:** `/api/roster/audit` reports every position as not-proven with a stale-trust caveat while the
backtests predate the served bundles; after a genuine re-run against `20260831T204458Z`, the badges return
to their earned states without any change to this code.


---

## Closeout — built 2026-09-03 06:40–06:46 (Fred), commit `7542bdb9` on `ticket/DG-142`

**Every element of the ticket reproduced independently before building.**
`_manifest_versions()` returns the literal `'engine_b_v2'` for all four positions and every
`backtest_result_*.json` carries `model_version: 'engine_b_v2'`, so `result.model_version !=
manifest[pos]` is **False by construction on all four** — the staleness branch could not fire.
The artifacts are `run_date 2026-05-31`; the served bundles are mtime `2026-08-31 16:44:58`.
`check_served_alignment` against the artifacts' real identity key (`model_artifact_hash`) returns
**aligned=False on 4 of 4**, and not for a missing-identity reason — a genuine hash mismatch,
"the deployed model has been replaced since these figures were measured", with distinct published
vs served hashes per position (QB `d7acb680…`/`fbb3617b…`, RB `5507e37f…`/`03f67f7c…`,
WR `3b83bbf9…`/`e1cbb125…`, TE `e2ca15ed…`/`84f05d61…`).

**The fix is one `elif`.** The guard already existed and was wired into exactly one of its two
consumers. `roster_audit_models.py` now asks it too, immediately after the version-string check:
any not-aligned answer → `EXPERIMENTAL` + `trust_status_stale`. **The consumer does not inspect
the reason** — five different unhappy answers all refuse identically, which is what keeps the two
consumers from drifting apart again. No new caveat token and **no new copy**:
`trust_status_stale` is already in `SAFE_TOKENS` and already renders.

**Measured effect on the live tree**, from the worktree:
`{QB: EXPERIMENTAL, RB: EXPERIMENTAL, TE: EXPERIMENTAL, WR: EXPERIMENTAL}`, caveats
`['trust_status_stale']`. That is the authorised outcome, including QB — Bob's "three VALIDATED
badges" undercounts by one, exactly as the ticket says.

**Tests: 11, ten of them red first.** The eleventh pins an invariant that already held and is
labelled as such rather than counted as evidence. Two deliberate design choices in them:
- **Nothing hardcodes today's four-way failure.** The live-tree test asserts the *invariant* —
  a position reads as its earned badge **if and only if** the served model agrees — so it stays
  true after the re-run restores the badges, with no change to this code or these tests. A test
  asserting "all four are EXPERIMENTAL" would have to be deleted the day the product gets better,
  which is the wrong incentive to leave in the tree.
- **The aligned case is tested through the real guard against the real bundle bytes**, by writing
  the actual sha256 of the deployed `.pkl` into a fixture artifact — not by mocking the guard to
  return True. The fixture also asserts its own precondition (the version strings MATCH), so the
  test cannot silently degrade into re-testing the old string comparison.

Full suite **6815 passed / 33 skipped**; 6804 with this file ignored — delta exactly 11, and 6804
is the DG-134 baseline unchanged. `ruff check` clean; pre-commit passed. The pre-existing
`test_roster_audit_contract.py` (21 tests) passes untouched.

**Anti-scope held.** No model cards regenerated, no guard loosened, `trust_surface.py` untouched
(it was already correct, and it is another lane's file). The fix is scoped to the comparison, not
to the word VALIDATED.

**⏱ SEQUENCING — NOT LANDED.** David's instruction is that this lands AFTER his ~09:15 read. It is
committed on `ticket/DG-142` and unpushed. Landing it before that read would put "this roster read
came back degraded" in front of him unannounced.

**The follow-on: I got this wrong first time, and the audit caught it.**

I originally wrote that "the re-run restores every badge", having verified only that a re-run
would record the served bundles' identity. That part is true and holds:
`backtest_harness.py:781-786` hashes the pkl from **the same `v2_manifest.json` the guard reads**
(`_find_model_pkl`, `:810`; `artifact_hash` is a plain sha256, `backtest_artifact.py:200-206`), and
feeding today's served hashes to the guard returns **aligned=True on all four**. But two things I
had not checked make the original sentence false:

1. **A backtest re-run alone changes nothing David can see.** The published surface the badge reads
   is pinned by explicit run_ids in tracked source — `PINNED_RUN_IDS` in
   `scripts/publish_trust_surface.py:22-27`, commented "Explicit pins — NOT auto-selected by
   run-date" — and `scripts/validate_trust_publication.py:147` **raises** if the published manifest
   disagrees. `run_backtest.py` writes into a runs/ directory the roster page never opens. So the
   real follow-on is four steps, not one: run the backtests per position (`--all` covers QB, RB and
   WR by its own help text, so TE needs its own invocation), **edit `PINNED_RUN_IDS` to the four new
   run_ids**, re-publish, then re-run the publication audit.
2. **That edit is a decision, not a chore** — it retires the pinned "coherent 2026-05-31 G3 batch"
   that the pin exists to protect. And both files belong to another lane (`davidleess-0b` owns
   `publish_trust_surface.py` and `validate_trust_publication.py`), so **the follow-on is not mine
   to execute** without David reassigning it.

**And alignment is not the same as a good badge.** Passing the guard only removes the staleness
refusal; what badge each position then earns is whatever the promotion gate awards on the new
folds. The `20260831T204458Z` bundles have never been walk-forward backtested — that is the
premise of this ticket — so their gate outcome is **unmeasured**. A position can legitimately come
back "not proven" for an entirely different and honest reason. Nobody should promise David that
re-publishing returns three VALIDATED badges; what it returns is the truth, which is the point.

## Corrections the audit forced — 30 agents, 6 lenses, 24 findings, 16 refuted, 8 survived

Three of the eight changed the work rather than the wording:

- **BLOCKING (follow-on):** "the re-run restores every badge" was false — see above. Verified at the
  source myself before accepting it: the pins are real and the published run_ids match them exactly.
- **The caveat named a cause it had not established.** The first cut mapped all five unaligned
  answers to `trust_status_stale`, so an unreadable manifest would have told David the figures were
  "measured on a different build". On a ticket about a badge asserting what it had not checked, that
  repeats the defect one level down. Now: both hashes present → `trust_status_stale`; anything
  unreadable → `trust_status_unavailable`. Refusal is unchanged and unconditional.
- **The degraded transition was pinned nowhere.** A section of my test file was headed "the product
  consequence, pinned" over a test that never called the assembler. An auditor proved the gap by
  mutation: deleting `if trust_caveats: status = "degraded"` left the **entire 6815-test suite
  green**. Two new tests now drive the assembler in both directions; re-running that same mutation
  confirms the new test catches it while the 21 pre-existing roster tests still pass. The branch is
  pre-existing code (blame: 2026-06-19) that this ticket made load-bearing — an inherited hole, but
  mine to close now that it matters.

Two smaller ones, also fixed: the aligned-path test read a **gitignored** manifest and would have
*errored* rather than skipped in any tree but this laptop (the land gate runs elsewhere — a known
trap), so it now skips with a reason; and the mis-named test was renamed to what it actually checks.

One finding I accepted without changing code: two pre-existing roster tests (`test_isolated_corrupt_dropped`
and its QB twin) assert `status == "degraded"`, which is now **doubly caused** while the trust caveat
is live. Their caveat assertions still discriminate, so the drop paths stay pinned; noting it here so
nobody later reads their green as proof the drop logic works.

**⏱ SEQUENCING — NOT LANDED, NOT LIVE.** David's instruction: land AFTER his ~09:15 read. Committed
on `ticket/DG-142`, unpushed.

**Landing is not enough to see it.** The API serves this from a process that must be restarted; the
ticket's Verify step is written as a live-API observation, so without the restart David would land
this, curl the route, still see VALIDATED chips, and reasonably conclude the fix failed. The full
sequence is: land on main → `git -C ~/dynasty-genius-product pull --ff-only` → `launchctl kickstart
-k gui/501/com.davidleess.dynasty-api` → then
`curl -s localhost:8000/api/roster/audit | python3 -m json.tool` and read `status`,
`model_status_by_position`, `caveats`. **No frontend rebuild** — this change touches no `frontend/`
file. That curl output is the receipt and belongs in this ticket.


---

## Landed — main `1812a5c8`, 2026-09-03 08:08 (David: "land 142")

David released the after-09:15 hold early. That is safe and was said so before landing: **landing
alone changes nothing on screen.** The route is served from a process reading trunk's checkout, so
until trunk is pulled and the API restarted, the roster page still shows the old VALIDATED chips.

Gate output read directly rather than trusting its ✔: **6829 passed / 33 skipped** (higher than this
ticket's own 6817 because DG-140 landed underneath in between), frontend suites 90 and 629 passed,
and zero occurrences of "failed", "error" or "abort" in the log. Worktree and branch removed by the
lander.

**State at landing:** main `1812a5c8`; trunk `6f517027` (DG-140, pulled by another lane while this
was building — so DG-140 did make its 09:00 window); trunk behind 2. API pid 50754.

**To make it live** — a deliberate act, not a side effect:
`git -C ~/dynasty-genius-product pull --ff-only` → `launchctl kickstart -k
gui/501/com.davidleess.dynasty-api` → `curl -s localhost:8000/api/roster/audit | python3 -m json.tool`
and read `status`, `model_status_by_position`, `caveats`. No npm build. That curl output is the
acceptance receipt and belongs here. **Expect it to be unflattering**: four "not proven" badges and
a degraded read. That is the ticket working.
