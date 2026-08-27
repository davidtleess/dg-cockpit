# Loop-control + Judge increment — Codex after-the-fact adversarial review v1

- **Date:** 2026-08-12
- **Review request:** `[w#lc-judge-review-1]` / `[w#3ibw2fbp-1]`
- **Reviewed product-repo range:** `a6cb629^..e897963`
- **Reviewed dg-cockpit range:** `5836106^..033b883`, bounded to `autonomy/**`,
  `backup.sh`, `bootstrap.sh`, `claude/agents/judge.md`, and
  `home/dynasty_flight_deck.sh`. This deliberately includes the RED-era backup
  intermediate so the final state is reviewed against the pre-increment baseline.
- **Verdict:** **NOT CLEAR — six BLOCKER findings.** WARN/STYLE backlog: none from
  this pass. D5 remains David-reserved and is not ruled here.

## Findings

### [BLOCKER] LCJ-B1 — Judge SHIP does not preserve the ratified authority boundary

- **Criterion:** `02-agent-operating-loop.md` §Loop-control budget and spec §9:
  SHIP authorizes exactly the ruled, pinned content's commit; no push/outward action;
  verification failures are never Judge-rulable.
- **Files:**
  - `dg-cockpit/autonomy/core/lib/loop-control.mjs:359-389`
  - `dg-cockpit/autonomy/core/scripts/codex-tool-policy.mjs:61-76,101-105`
  - `dg-cockpit/autonomy/claude/dg-engineering/scripts/pre-tool-use.mjs:57-70,118-122`
- **Reproducible evidence:**
  1. `adjudicateRun` accepts `SHIP` with no pins (`pins: []`). It never checks that
     pins are non-empty, bind named files, or match staged content.
  2. With a synthetic terminal SHIP run, both hooks returned exit 0 for all of:
     `git commit -am arbitrary`, `git commit -m ruled && git push`, and
     `git commit -m ruled && gh pr create ...`. `classifyCommand` prioritizes
     `commit`, and both hooks short-circuit allow on that single classification.
  3. A BLOCKED run containing a current failed `tests` receipt and missing
     `static-analysis`, plus loop reason `PHASE_ROUND_CAP`, was accepted by
     `adjudicateRun(... SHIP ...)` and became `READY_FOR_GATE` while the failed and
     missing checks remained. J4 tests only the simpler case where the run has no
     loop-control reason code.
- **Impact:** a Judge ruling can commit unpinned arbitrary staged content, perform a
  push or PR action in the same tool call, and override live verification failures.
  This exceeds David's ratified delegation.
- **Smallest remediation:** require non-empty structured content pins and verify the
  exact staged tree/index against them before allowing a single, commit-only command;
  reject compound command segments; refuse SHIP whenever the latest required-check
  state contains a failure or omission. Add negative J controls for each bypass.

### [BLOCKER] LCJ-B2 — revision guard loses concurrent findings while both writers report success

- **Criterion:** spec F17 and §2.2: one stale writer must receive
  `DG_REVISION_CONFLICT`; no finding or round may be silently lost.
- **File:** `dg-cockpit/autonomy/core/lib/run-state.mjs:27-62`
- **Reproducible evidence:** two separate CLI processes were launched concurrently
  from the same revision, each recording a different BLOCKER. Across 50 attempts:
  `bothSuccess=38`, `bothSuccessLost=13`, `oneConflict=12`. In the 13 false-success
  cases both commands exited 0 and printed `Recorded BLOCKER`, but the final run file
  contained one finding. The read/compare/rename sequence is not an atomic CAS.
- **Impact:** the new state system silently drops exactly the disagreement evidence
  it was introduced to preserve.
- **Smallest remediation:** serialize mutations with an inter-process lock or use a
  storage primitive with transactional compare-and-swap; then add a true
  multi-process F17 positive control, not two sequential calls from one process.

### [BLOCKER] LCJ-B3 — closed round history can be rewritten to erase an adjudication gate

- **Criterion:** structured round records are the authoritative detector input;
  closed rounds and their dispositions must be replay-stable.
- **File:** `dg-cockpit/autonomy/core/lib/loop-control.mjs:250-262`
- **Reproducible evidence:** a three-closed-round run with one old unresolved
  blocker and zero churn returned
  `ADJUDICATION_REQUIRED/DIMINISHING_RETURNS`. Calling
  `resolveFinding(... finding-red-1-1, round: 3)` after round 3 was already closed
  succeeded, wrote `resolvedInRound: 3` into the round-1 finding, and changed the
  same run to `CLEAR_ELIGIBLE`.
- **Impact:** a lane can retroactively rewrite the sole source of truth after the
  detector fires and bypass the Judge.
- **Smallest remediation:** resolutions must be recorded only while the named
  current round is open; reject a closed target round, a future/backdated round, or
  a resolution that was not part of that round's pre-close record. Add a negative
  contract proving a gated closed history is immutable.

### [BLOCKER] LCJ-B4 — snapshot scope escapes the worktree and rejects the module itself

- **Criterion:** spec F19 and §2.2: scope must be worktree-confined, reject symlink
  escape, and accept governed text source within the size cap.
- **Files:**
  - `dg-cockpit/autonomy/core/lib/loop-control.mjs:85-118`
  - `dg-cockpit/autonomy/core/lib/loop-control.mjs` (literal NUL bytes in source)
- **Reproducible evidence:**
  1. A worktree directory entry symlinked to an external directory; scope
     `linked-parent/secret.txt` was accepted because only the final file's `lstat`
     was checked. The open snapshot copied the external file's bytes.
  2. `file autonomy/core/lib/loop-control.mjs` reports `data`, and the file contains
     three literal NUL bytes. Opening a real round scoped to that module throws
     `TypeError: Scope entry is binary: autonomy/core/lib/loop-control.mjs`.
- **Impact:** the churn mechanism can read/copy data outside the authorized
  worktree, while the core loop-control implementation cannot itself be reviewed
  through the round mechanism.
- **Smallest remediation:** canonicalize the full existing target (and parent
  chain) with `realpath` and prove containment before any read/copy; use escaped
  delimiters or length-prefixing rather than literal NUL source bytes. Add both
  real-parent-symlink and self-scope positive controls.

### [BLOCKER] LCJ-B5 — Gemini can exercise the new binding review and referral powers

- **Criterion:** `02-agent-operating-loop.md` §Loop-control budget “Roles
  unchanged”; Gemini is Operations & Telemetry only; only either binding lane may
  refer a dispute.
- **Files:**
  - `dg-cockpit/autonomy/core/contract.json:8-12`
  - `dg-cockpit/autonomy/core/lib/loop-control.mjs:27-31,341-352`
- **Reproducible evidence:** `createRun(role: "gemini")` followed by `round-open`,
  Gemini-authored `BLOCKER`, `round-close`, and `refer --by gemini` all succeeded;
  `loopVerdict` returned `ADJUDICATION_REQUIRED/JUDGE_REFERRAL`.
  `assertActiveEngineeringRun` rejects Tower only, and `referToJudge` accepts any
  non-empty `by` string.
- **Impact:** the mechanics grant Gemini judgment-shaped BLOCKER and Judge-referral
  authority that David's ratified telemetry-only charter explicitly withholds.
- **Smallest remediation:** mechanically constrain round findings, CLEARs,
  resolutions, and referrals to the two binding roles and validate `by` against the
  authenticated run role/seat rather than caller text. Add Gemini-denial controls.

### [BLOCKER] LCJ-B6 — the reviewed increment introduced the sole full-suite failure

- **Criterion:** full source suite and backup source-verification gate must pass;
  a claimed pre-existing failure must predate the reviewed range.
- **Files:**
  - `dg-cockpit/home/dynasty_flight_deck.sh:5,20,62`
  - `dg-cockpit/autonomy/tests/cockpit.test.mjs:12-31`
  - `dg-cockpit/backup.sh:71-74`
- **Reproducible evidence:** both serial and default-parallel full suites completed
  at `59 passed / 1 failed`. The failure expects portable home-relative plugin
  paths, but the flight deck now carries hard-coded home-directory paths. A diff
  against `5836106^` proves this increment changed those lines from the portable
  form; therefore the failure did not predate the reviewed increment. Because
  `backup.sh` runs `verify.sh --source-only` before commit/push, the same regression
  blocks the normal backup gate.
- **Impact:** the increment is not suite-green and weakens new-Mac portability and
  backup operability.
- **Smallest remediation:** restore portable path construction (prefer the already
  declared cockpit-root variable) and keep the contract; then rerun both focused
  and complete source verification.

## Named open-item disposition

- **R1 fingerprint composition:** no separate finding. Excluding free-text summary
  is the safer identity choice against reword evasion. The false-merge risk must be
  carried by criterion-ID discipline; it does not excuse LCJ-B3's mutable history.
- **R2 CLEAR_ELIGIBLE wording:** no finding. The implementation permits a later
  round under the remaining caps, so a genuinely new BLOCKER can be recorded.
- **Parallel-suite hang:** not reproduced. One default-parallel run and two serial
  runs completed; each failed only LCJ-B6. Pinning test concurrency to 1 may still
  be a reliability improvement, but this review has no evidence to label it a
  blocker.
- **SHIP-commit allowance:** BLOCKER LCJ-B1.
- **D5 churn threshold:** expressly reserved for David; no ruling or inference made.

## Checks performed

- Read mandatory governance in order: `02` v1.5.0, `00` v1.1.0, `05` v1.3.1,
  `01` v1.0.0, `03` v1.1.0, `PRODUCT.md`, `DESIGN.md`, current board through
  `END CURRENT BOARD`, and today's ledger.
- Inspected complete bounded commit ranges and changed-file lists; verified
  `033b883 == origin/main` in dg-cockpit and product HEAD contains `a6cb629` plus
  ratification follow-up `e897963`.
- New focused tests: **35/35 passed** (`loop-control`, `stop-hook-bounds`, Judge).
- Full suite, serial: **59/60**; full suite, default parallel: **59/60**; same
  LCJ-B6 failure, no hang reproduced.
- Adapter sync check: clean. Supply-chain tree scan: clean. Diff whitespace checks:
  clean on the reviewed bounded surfaces.
- Plugin validation: Claude engineering PASS; Claude Tower PASS; Antigravity PASS;
  Codex marketplace PASS.
- Product governance validator: PASS; focused governance contracts: **7/7 passed**.
- Direct falsification matrix additions: compound SHIP commands; empty/unmatched
  pins; failed/missing verification under a loop gate; real two-process revision
  race; post-close resolution; parent-symlink escape; self-scope; Gemini referral.
- No dependency, secret, model, data, player-analysis, frontend, activation, push,
  or Studio-directory action was taken. Existing unrelated dirty paths in both
  repositories were preserved.

## Review result

**NOT CLEAR.** Only the six BLOCKERs above continue remediation. A fresh artifact
state requires the relevant falsification controls, focused suite, complete source
suite, adapter sync/scan, plugin validators, governance validation, and a new
independent review. A prior nominal GREEN does not carry across these changes.
