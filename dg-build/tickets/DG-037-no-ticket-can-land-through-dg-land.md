# DG-037 — No ticket can land through `dg-land.sh`: five ways, and it never reached the gate

**Layer:** process  ·  **State:** **done — fixed and verified 2026-08-23**  ·  **Lane:** ClaudeOpus5-DG037-20260823  ·  **DG 3.0**
**Source:** measured end-to-end while building DG-034, 2026-08-23. Not inferred — every claim below is
a command that ran in `~/dg-wt/DG-034`.

**Problem:** `dg-work.sh` makes a worktree usable by symlinking the 15 GB shared store. `dg-land.sh`
refuses on a dirty tree (`:48`) and on any test failure (`:73`). Those two are in direct contradiction:
**the symlinks that make the worktree work are what fail the gate.** Five independent mechanisms,
none of them related to any ticket's own change — and the fifth means the script exited before it ever
reached the first four.

**1 — three symlinks read untracked, so the dirty-tree check refuses.**
`dg-work.sh`'s in-flight landability fix writes its exclude file to
`"$(git -C "$DEST" rev-parse --git-dir)/info/exclude"`. In a worktree that is
`.git/worktrees/<TICKET>/info/exclude`, but **git only ever reads `$GIT_COMMON_DIR/info/exclude`**.
The exclude half has never taken effect; only the `skip-worktree` half works (that uses the
per-worktree index, which is why 72 phantom deletions do get cleared).
```
$ git rev-parse --git-dir            → /Users/davidleess/dynasty-genius/.git/worktrees/DG-034
$ git rev-parse --git-common-dir     → /Users/davidleess/dynasty-genius/.git
$ git status --porcelain
?? app/data/backtest
?? app/data/identity
?? app/data/sources
$ git -c core.excludesFile=<patterns> status --porcelain     # when git can actually read them
(clean)
```
The last line is the proof: the excludes work fine, they are simply written where git never looks.
**This is NOT the "git won't ignore paths with tracked entries" theory** — those 72 tracked files are
already `skip-worktree`'d and the exclude suppresses the symlinks regardless. One-word fix
(`--git-dir` → `--git-common-dir`), but the common dir is SHARED across every worktree, so the naive
fix appends duplicate lines on every run and leaks one worktree's paths into all others. Needs a
moment's design, not just the one word.

**2 — 13 tests fail because `git check-ignore` will not traverse a symlink.**
```
$ pytest "tests/contract/test_footballguys_phase_a_red.py::test_p0_runtime_paths_are_narrowly_gitignored[receipts.db]"
E  AssertionError: runtime path remains commit-eligible: app/data/footballguys/receipts.db
E  assert 128 == 0
   fatal: pathspec 'app/data/footballguys/receipts.db' is beyond a symbolic link
```

**3 — 3 tests fail because `frontend/node_modules` is not shared.**
`dg-work.sh` shares `.venv` but not `node_modules`, so any test shelling out to a node scanner dies:
```
$ pytest tests/contract/test_frontend_banned_language_linter_contract.py
E  code: 'ERR_MODULE_NOT_FOUND'   Node.js v24.15.0
```
Note the trailing-slash trap if this is fixed by symlinking: both `.gitignore:192` and
`frontend/.gitignore:1` say `node_modules/`, which matches a **directory** and therefore does not
match a symlink — a symlinked `node_modules` reads untracked and re-triggers mechanism 1.

**4 — 3 tests fail because a symlink resolves outside the worktree.**
```
E  ValueError: '/Users/davidleess/dynasty-genius-product/app/data/sources/nflverse_schedules'
             is not in the subpath of '/Users/davidleess/dg-wt/DG-034'
```
`Path.relative_to()` against a resolved shared path. Affects
`test_b21_schedules_capture_red.py`, `test_cfbd_fbs_schedules_capture_red.py`,
`test_identity_crosswalk_hardening_red.py`.

**5 — `dg-land.sh` dies on line 33 before it does anything, in every repo, always.**
Found only by actually running it. `LOCK="$REPO/.git/dg-land.lock"` assumes `$REPO/.git` is a
directory. It is not: `~/dynasty-genius-product` is itself a **linked worktree** of
`~/dynasty-genius`, so its `.git` is a one-line file.
```
$ cat ~/dynasty-genius-product/.git
gitdir: /Users/davidleess/dynasty-genius/.git/worktrees/dynasty-genius-product

$ bash bin/dg-land.sh DG-037 --dry-run
bin/dg-land.sh: line 33: /Users/davidleess/dynasty-genius-product/.git/dg-land.lock: Not a directory
```
`exec 9>"$LOCK"` fails and the script exits at the lock, before the dirty check, the rebase or the
tests. The mkdir fallback at `:36` has the identical bug. **This script has never run to completion
in this layout** — which is also why mechanisms 1-4 were never noticed: nobody ever got far enough to
see them.

**How we know the 19 are not any ticket's fault:** stash the ticket's change, re-run, get the identical
19.
```
$ git stash push -- <the four changed files>
$ pytest tests/contract/test_{b21_schedules_capture_red,cfbd_fbs_schedules_capture_red,footballguys_phase_a_red,frontend_banned_language_linter_contract,identity_crosswalk_hardening_red}.py -q
19 failed, 944 passed
$ git stash pop
```
Full suite in the worktree: **19 failed, 6251 passed, 40 skipped, zero collection errors.**

**Done looks like:** `dg-work.sh DG-NNN && dg-land.sh DG-NNN --dry-run` reports a clean tree and a
green suite on a worktree with no changes in it. Until then every lane must land by hand, which is
precisely the serialisation and test gate `dg-land.sh` exists to enforce.

**Depends on:** nothing. **Blocks:** every open ticket with a worktree — DG-014, 015, 020, 021, 022,
023, 029, 034.

---

**STATUS 2026-08-23 — FIXED. All five mechanisms closed. Acceptance criterion met verbatim.**

The governing idea: mechanisms 1-4 are all one mistake — **symlinking a directory git needs to see
through**. So the fix is not to hide the symptoms but to stop creating that shape. A subtree is
symlinked WHOLE only when nothing under it is tracked; otherwise the directory is materialised (real)
and its children are shared one at a time. That removes phantom deletions and untracked symlinks by
construction, so `update-index --skip-worktree` and the per-worktree exclude are both **deleted**, not
repaired.

Two rules carry the remaining cases:
- **Self-correcting, no hand-list:** after symlinking a directory, ask git whether it is ignored. The
  repo writes its ignores as `foo/` (e.g. `.gitignore:162 app/data/backtest/qb_validation/`), and a
  trailing slash matches a DIRECTORY, so the symlink is not matched and would read untracked. If git
  does not call it ignored, it gets materialised instead. Nobody maintains a list.
- **`MUST_BE_REAL`** (one entry: `app/data/footballguys`) for the opposite case — nothing under it is
  tracked, but contract tests `check-ignore` paths inside it, and check-ignore refuses at the first
  symlinked component. Applies to the whole subtree in both directions, because
  `.../intake/staging/stage-abc.tmp` needs `intake/` and `intake/staging/` real too.

`frontend/node_modules` is now shared (mechanism 3). Excludes are written to `--git-common-dir`,
once and only if absent. **Total change to shared state: one line, `frontend/node_modules`.**
Ordering matters and is commented: excludes are written BEFORE sharing, or the self-correcting rule
would expand node_modules into a real tree of a thousand packages.

`dg-land.sh` lock path now resolves through `git rev-parse --git-common-dir` (mechanism 5).

And the script no longer lies when it fails: anything still untracked is printed with
*"That is a dg-work.sh bug (DG-037). Report it; do not hand-exclude it."* The previous version
reported `landable : 72 phantom deletions skip-worktree'd` and looked like success while leaving the
tree unlandable.

```
$ bash bin/dg-work.sh DG-037 --from feature/outcome-loop-week1
  exclude  : + frontend/node_modules (added to the shared info/exclude)
  landable : clean tree, no phantom deletions, no untracked leftovers
  shared   : 89 symlinked read-only, 32 dirs materialised, 72 tracked files left to git,
             0 copied writable, 0 absent
             (1.3s wall clock — no measurable cost over the old script)

$ git -C ~/dg-wt/DG-037 status --porcelain
(empty)

$ .venv/bin/python3.14 -m pytest -q          # fresh worktree, NO ticket changes in it
6256 passed, 40 skipped          # was: 19 failed, 6251 passed

$ bash bin/dg-land.sh DG-037 --from feature/outcome-loop-week1 --dry-run
6270 passed, 40 skipped, 361 warnings in 46.22s
✔ dry run: rebase clean, tests pass. Nothing merged.
```
The last block is this ticket's Done, verbatim. (6270 vs 6256 because the rebase pulled in DG-034's
14 new tests — incidental confirmation that DG-034 landed.)

**Not done, deliberately — one open question for David.** The shared `info/exclude` still carries the
block hand-added 2026-08-19 (`.venv`, `app/cache`, `app/data/cfbd_cache`, `app/data/footballguys`,
`app/data/nflverse_usage`, `app/data/pff_exports`). Every one of those now has a real `.gitignore`
rule (`.gitignore:195, 28, 35, 224, 125, 179`), so the fix above does not need them. Leaving them is
not free: `app/data/footballguys` blanket-excludes a tree whose contract test
(`test_p0_runtime_paths_are_narrowly_gitignored`) exists precisely to prove those paths are
**narrowly** ignored — so that test can now pass for the wrong reason. Removing them was not done here
because they are shared state another lane wrote and this ticket had already changed enough.

---

**Notes**
`bin/dg-work.sh`'s uncommitted +30/-1 landability change was taken over on David's word 2026-08-23
rather than left for its author. Its `skip-worktree` half was correct about the symptom and is
superseded; its exclude half was written to `rev-parse --git-dir` and never did anything. Both are
removed by the rewrite above.

The original note here proposed running the gate in `$WT_ROOT/.land-$TICKET` where the layout is real.
That was rejected once the causes were understood: mechanisms 2-4 are tests asserting things about the
real repo layout, and they are **right** to fail on a symlink farm. Moving the gate would have kept
the worktree lying and only changed where the truth was measured. Making the worktree honest fixes the
tests *and* every lane's day-to-day `pytest` run, which no gate relocation would have.
