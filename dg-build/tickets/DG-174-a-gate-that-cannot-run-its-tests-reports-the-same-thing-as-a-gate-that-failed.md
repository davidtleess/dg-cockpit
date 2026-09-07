# DG-174 — A gate that CANNOT RUN its tests reports the same thing as a gate whose tests FAILED

**Layer:** process · **State:** open · **Lane:** — · **DG 3.0** · **tooling honesty**
**Source:** Found by Bob 2026-09-06 while building a worktree by hand. Filed by Greg the same morning.

---

## THE DEFECT

`bin/dg-land.sh` runs the gate with `.venv/bin/python3.14` **if present** and otherwise **falls back to bare
`python3`**. In a tree without a virtualenv that fallback runs an interpreter with no pytest, and the resulting
***"No module named pytest"* is reported as a TEST FAILURE.**

**Two states, one signal:** *the tests ran and something is broken* and *the tests could not run at all*. A lane
meeting the second reads it as the first and starts debugging code that is fine — which is what happened: 21
"failures", every one provisioning, the same tests passing 115/115 once the tree was rebuilt with `dg-work.sh`.

## ⭐ WHY IT BELONGS WITH THE WEEK'S OTHER DEFECTS

This is [[feedback_the_failure_path_returns_the_success_signal]] inverted: not a failure wearing a success signal,
but **an inability-to-check wearing a failure signal.** Same root — two distinguishable states collapsed into one
message — and the same fix: **distinguish the empty cases BY NAME**, with different exit codes.

**Bob's framing, which is the reusable half:** the failure mode is not only false comfort, it is **false alarm**,
*"which costs the same hour and looks like diligence while it does it."*

## DONE WHEN

1. A missing or wrong interpreter **fails loudly and differently** from a test failure — its own exit code and a
   message naming provisioning, not correctness.
2. **The fallback is removed or made explicit.** A silent substitution of interpreter is the mechanism; a gate
   should refuse rather than guess which python it is running.
3. `dg-land.sh` and `dg-work.sh` agree on what a provisioned tree is, and the gate asserts it before running
   anything.

## ⛔ TRAPS

- ⛔ **Do not "fix" this by improving the error message.** A message is a comment; this needs an exit code and an
  assertion. Same lesson as the deleted fragility rule on 09-05 — a documented threshold is exactly as good as a
  deleted one.
- ⚠ Related and worth checking in the same pass: `bin/dg-work.sh`'s header already warns that a raw
  `git worktree add` produces an unusable tree. **The warning exists and was not read**, which is the standing
  argument for making it a check rather than prose — see DG-173's treatment of the same problem in data files.
- ⚠ Also in this family: **a worktree serves COMMITTED data at tracked paths**, so a measurement inside one may be
  reading a six-week-old artifact — see [[reference_a_worktree_serves_committed_data_not_live_data]].
