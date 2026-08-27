# Loop-control + Judge increment — Codex after-the-fact adversarial review v2

- **Closed:** 2026-08-13
- **Request:** `[w#lc-judge-review-2]`
- **Reviewed dg-cockpit state:** `033b883` + corrective `68b9e8d`
- **Reviewed product state:** `a6cb629` + `e897963` + `84e38c7`
- **Corrected routing contract acknowledged:** Judge routing is counters-only (phase cap 5,
  run cap 10, diminishing returns). No discretionary referral surface may remain.
- **Verdict:** **NOT CLEAR — six BLOCKERs.** D5 remains David-reserved.

This pass was performed fresh. The crashed-pane transcript and v1 report were treated as leads,
not evidence; every retained issue below was reproduced independently against the current files.

## BLOCKER findings

### [BLOCKER] LCJ2-B1 — Judge SHIP exceeds the ratified authority transfer

- **Criterion:** `02-agent-operating-loop.md:265-278` and spec §9: the Judge rules only a
  loop-control gate, never a verification failure; SHIP authorizes exactly the ruled, pinned
  commit, never push or another outward action.
- **Files:** `dg-cockpit/autonomy/core/lib/loop-control.mjs:340-374,379-430`;
  `autonomy/core/scripts/codex-tool-policy.mjs:61-75,94-105`;
  `autonomy/claude/dg-engineering/scripts/pre-tool-use.mjs:57-70,118-122`;
  `autonomy/core/lib/policy.mjs:188-200`; `autonomy/core/scripts/stop-check.mjs:44-49`.
- **Reproducer/results:** drive a run to `PHASE_ROUND_CAP`, while its latest `tests` receipt is
  `failed`, then call `adjudicateRun(..., {ruling:"SHIP", evidence:"e"})`. It returns
  `READY_FOR_GATE`, preserves the failed receipt, and records `pins: []`. On that state both
  hooks exit 0 for `git commit -m ruled && git push` and
  `git commit -m ruled && gh pr create --title x --body y`; both commands classify as `commit`
  because `commit` precedes `push`/`external-communication` in the priority list. A separate
  verification-only `BLOCKED` run is rendered by the Stop hook as `ADJUDICATION REQUIRED —
  routes to the judge` even though the Judge must not rule it.
- **Why blocking:** the implementation can override a live verification failure and can use one
  Judge allowance to perform actions David explicitly retained.

### [BLOCKER] LCJ2-B2 — the revision guard is not an atomic cross-process guard

- **Criterion:** spec §2.2 / F17: from the same revision, exactly one writer succeeds and the
  other receives `DG_REVISION_CONFLICT`; no finding or round is silently lost.
- **File:** `dg-cockpit/autonomy/core/lib/run-state.mjs:24-62`.
- **Reproducer/results:** two child Node processes load revision 1, synchronize on a gate, and
  independently call `persistRun` with distinct `writer` fields. Both return success with
  revision 2; the disk ends with only one writer. The read/compare and rename are separated by
  an unlocked write window. The shipped F17 test (`loop-control.test.mjs:302-314`) is sequential,
  so it cannot falsify this race.
- **Why blocking:** the authoritative review record can silently lose a concurrent finding while
  telling both lanes their write succeeded.

### [BLOCKER] LCJ2-B3 — a closed round can be rewritten after the gate fires

- **Criterion:** `02-agent-operating-loop.md:282-286` and the spec's structured-record source of
  truth: closed round history must be replay-stable.
- **File:** `dg-cockpit/autonomy/core/lib/loop-control.mjs:251-263`.
- **Reproducer/results:** three zero-churn closed rounds with one unresolved round-1 BLOCKER
  produce `ADJUDICATION_REQUIRED/DIMINISHING_RETURNS`. Calling
  `resolveFinding(finding-red-1-1, round:3)` after round 3 is already closed succeeds, writes
  `resolvedInRound:3`, and changes the same history to `CLEAR_ELIGIBLE`.
- **Why blocking:** a lane can erase a counter-driven Judge gate retroactively.

### [BLOCKER] LCJ2-B4 — snapshot scope escapes the worktree and rejects its own core module

- **Criterion:** spec F19: scope must be worktree-confined, reject symlink escape, and accept
  governed text source within the size limit.
- **File:** `dg-cockpit/autonomy/core/lib/loop-control.mjs:86-141` plus its three generated copies.
- **Reproducer/results:** make `linked-parent` a symlink to an external directory and open scope
  `linked-parent/secret.txt`; it is accepted and copied because only the final path's `lstat` is
  checked. Separately, `file autonomy/core/lib/loop-control.mjs` reports `data`; the source has
  literal NUL bytes at its fingerprint/hash delimiters. Opening a real round on that file throws
  `TypeError: Scope entry is binary: autonomy/core/lib/loop-control.mjs`.
- **Why blocking:** the measurement mechanism can read outside authorization while the mechanism
  itself cannot be reviewed through its own required round recorder.

### [BLOCKER] LCJ2-B5 — Gemini can create the counters that route a case to the Judge

- **Criterion:** `02-agent-operating-loop.md:287-289` and the unchanged Gemini Operations &
  Telemetry charter: Gemini has no binding review or CLEAR authority.
- **Files:** `dg-cockpit/autonomy/core/lib/loop-control.mjs:28-31,173-280`;
  `autonomy/core/contract.json:8-12`.
- **Reproducer/results:** on a `role:"gemini"` run, `openRound`, a Gemini-recorded `BLOCKER`, and
  five `closeRound` calls all succeed. `loopVerdict` returns
  `ADJUDICATION_REQUIRED` with `PHASE_ROUND_CAP` and `DIMINISHING_RETURNS`.
- **Why blocking:** although `68b9e8d` correctly removes discretionary referral, the telemetry
  lane can still manufacture the binding counter path to the Judge. Only Tower is rejected.

### [BLOCKER] LCJ2-B6 — the Codex hard-deny hook violates Codex's denial protocol

- **Criterion:** a hard-gate hook must fail closed on its actual host surface.
- **File:** `dg-cockpit/autonomy/core/scripts/codex-tool-policy.mjs:15-24` and generated
  `autonomy/codex-marketplace/plugins/dg-autonomy/scripts/pre-tool-use.mjs`.
- **Reproducer/results:** feed `{}` to the script. It exits 2, writes JSON denial to stdout, and
  writes nothing to stderr. The official Codex contract permits the JSON denial response or,
  alternatively, exit 2 with the blocking reason on stderr. The shipped hook mixes the paths.
  This independently explains the observed host error: `exited with code 2 but did not write a
  blocking reason to stderr`.
- **Why blocking:** Codex reports the safety hook as failed instead of establishing a trusted deny;
  this is the hard backstop that is supposed to stop mutation after a terminal state.
- **Official contract:** <https://learn.chatgpt.com/docs/hooks.md#pretooluse>

## Non-blocking backlog

### [WARN] LCJ2-W1 — exact source verification remains red and the reported hang is unbounded

- **Criterion:** deterministic source verification.
- **Files:** `dg-cockpit/autonomy/verify.sh:14`, `autonomy/tests/installer.test.mjs:113-119`,
  `home/dynasty_flight_deck.sh:5,20,62`.
- **Evidence:** clean committed serial and default-parallel runs both completed at 59/60; the only
  failure is the disclosed launcher-path assertion. I did not reproduce the parallel hang.
  `verify.sh` still uses default parallelism and the installer test's `spawnSync` has no timeout,
  so an installer stall can still hang the whole gate. The launcher-path regression sits in the
  explicitly excluded intermediate `5836106`, so it is backlog here rather than a new blocker
  attributed to `033b883`/`68b9e8d`.

### [WARN] LCJ2-W2 — counters-only sweep left contradictory referral/status text

- **Criterion:** governance `02:269-271` and spec §9 counters-only routing; governance post-fix
  sweep rule.
- **Files:** `docs/superpowers/specs/2026-08-12-loop-control-design.md:4,265` and
  `dg-cockpit/home/dynasty_flight_deck.sh:63-65`.
- **Evidence:** the spec header still says awaiting David authorization despite §9 RATIFIED;
  §9 still says a "capped or referred review dispute"; the committed Judge launcher comment still
  enumerates "referrals." These do not restore a callable referral verb, but they conflict with
  `68b9e8d`'s current contract.

### [WARN] LCJ2-W3 — syntactically valid but schema-invalid run state is treated as safe

- **Criterion:** terminal hard-backstop robustness and schema-version integrity.
- **File:** `dg-cockpit/autonomy/core/lib/run-state.mjs:69-99`.
- **Evidence:** replace the run record with `{}` and invoke the Codex hook on an in-worktree
  `apply_patch`; the hook exits 0. `readRunSnapshotSync` validates JSON syntax only, not the v3
  run shape. This is not needed to reproduce any BLOCKER above, but it is a fail-open state worth
  hardening.

## Named-item disposition and checks

- **Corrected `68b9e8d` scope:** ACK. `referToJudge` is absent, CLI `refer` exits 64, legacy
  referral fields have no weight, J1/J1b pass. LCJ2-B5 is a different counter-authority path;
  LCJ2-W2 is stale text only.
- **R1:** no finding. Fingerprint is normalized phase + criterionId + file, summary excluded; the
  choice closes reword evasion and the accepted false-merge tradeoff is bounded by lineage.
- **R2:** no finding. `CLEAR_ELIGIBLE` permits a later round under caps, matching §8's explicit
  late-new-BLOCKER decision; WARN/STYLE cannot change the verdict. A direct WARN-only probe
  returned `CLEAR_ELIGIBLE` and allowed round 2, which is consistent with that stated procedural
  design, not treated as a new blocker.
- **D5:** not ruled; reserved for David.
- **Focused loop/Judge/adapter suite:** 42/42 pass serially.
- **Full source suite:** 59/60 serial and 59/60 default-parallel; no hang reproduced.
- **Adapter sync:** clean. **Supply-chain scan:** clean. **Diff whitespace:** clean.
- **Plugin validation:** Claude engineering PASS, Claude Tower PASS, Antigravity PASS, Codex PASS.
- **Product governance:** validator PASS; focused governance tests 7/7 PASS in an archive of
  `84e38c7`.
- **Direct adversarial matrix:** mixed verification+cap SHIP, absent pins, compound commit+push/PR,
  malformed hook input, true two-process revision race, post-close history rewrite, parent-symlink
  escape, self-scope, Gemini counter route, verification-only Stop route, and schema-invalid state.
- No activation, commit, push, external publication, product-code edit, run-state mutation, or
  Studio-directory inspection was performed. Existing dirty work in both repositories was
  preserved.

## Result

**NOT CLEAR.** Only LCJ2-B1 through LCJ2-B6 continue remediation. W1-W3 are backlog under the
new severity budget.
