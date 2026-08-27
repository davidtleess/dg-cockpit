# DG-038 — `dg-land.sh` cannot merge into any base that is checked out somewhere

**Layer:** process  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG038-20260824  ·  **DG 3.0**
**Source:** hit while landing DG-036, 2026-08-24. The gate passed and the merge step died.

**Problem:** `dg-land.sh:106-113` creates a detached temp worktree at `origin/$BASE` and then runs
`git checkout -q -B "$BASE" "origin/$BASE"` inside it. Git refuses to check out one branch in two
worktrees, so the merge dies whenever `$BASE` is already checked out anywhere — which is the normal
state of the trunk. `~/dynasty-genius-product` holds `feature/outcome-loop-week1`, so **every ticket
based on the working trunk fails at the merge**, after the full suite has already run.

It has not bitten `main` only because nothing currently has `main` checked out. The moment anything
does, `--from main` breaks the same way. This is not a branch-specific accident.

**How we know:**
```
$ ~/dg-build/bin/dg-land.sh DG-036 --from feature/outcome-loop-week1
...
6301 passed, 40 skipped, 361 warnings in 46.32s
→ merging into feature/outcome-loop-week1
fatal: 'feature/outcome-loop-week1' is already used by worktree at '/Users/davidleess/dynasty-genius-product'

$ git worktree list | grep outcome-loop-week1
/Users/davidleess/dynasty-genius-product   e6995967 [feature/outcome-loop-week1]
```

**Two consequences beyond the failed merge**, both observed:

1. **It leaves the temp worktree behind.** `~/dg-wt/.land-DG-036` survived at a detached HEAD, and
   `git worktree list` showed it. The `rm -rf "$TMP_WT"` at `:108` only runs on the NEXT attempt, and
   the `worktree remove` at `:115` is never reached. A second run of `dg-land.sh` would have removed
   it silently — so the failure self-conceals.
2. **The ticket is left claimed, the branch undeleted, and `State:` still `todo`**, because every
   bookkeeping step lives after the merge. A reader of the board sees an unstarted ticket whose lane
   is taken and whose tests already pass.

**Done looks like:** `dg-land.sh DG-NNN --from <a base that is checked out>` merges and pushes. The
merge does not need the branch checked out at all — a detached worktree can merge and push with
`git push origin HEAD:$BASE`, which is exactly how DG-036 was completed by hand. A test, or a dry-run
that exercises the merge path, catches this before the suite has burned 47 seconds.

Whatever the fix, it must also decide what to do about the **local** branch in the trunk, which after
a detached push is one commit behind `origin`. Updating it means touching a shared worktree that
routinely carries dozens of dirty files from other lanes, so `dg-land.sh` should probably say so
rather than do it.

**Depends on:** nothing. **Related:** DG-037 (the five other mechanisms that stopped tickets landing;
this is a sixth, in the half of the script DG-037's dry-run could not reach — `--dry-run` returns at
`:100`, before the merge block ever runs).

---

**Notes**
The `--dry-run` gate is what made this survivable: it reported "rebase clean, tests pass" and was
telling the truth about everything it tested. It simply never tests the merge. That is the cheap fix
worth considering first — a dry run that also proves the merge can start.

---

**CLOSED 2026-08-24, lane ClaudeFable5-DG038-20260824.**

What changed in `bin/dg-land.sh`:
1. The merge is built on a **detached** head in the throwaway worktree and pushed as
   `git push origin HEAD:$BASE` — the base branch is never checked out, so it may be checked out
   anywhere else (the hand procedure that landed DG-036, now the script's own procedure).
2. `--dry-run` now runs the **entire merge block** with `git push --dry-run`, so a green dry run
   means "this ticket can actually land", not just "the suite passed".
3. One EXIT trap owns the lock **and** the temp worktree: a failed merge/push no longer leaves
   `.land-<TICKET>` behind for the next run to silently destroy, and the error says outright that
   the ticket worktree, branch and claim are untouched.
4. A leftover temp worktree from an interrupted (kill -9) land is announced before removal, not
   silently erased.
5. After a real land the script tries `git fetch origin $BASE:$BASE` (fast-forward-only); when git
   refuses because the trunk holds the branch, it prints where the stale local branch lives instead
   of touching a shared worktree — the "say so rather than do it" this ticket asked for.

**Evidence — the bug, reproduced in a hermetic sandbox before the fix:**
```
$ DG_REPO=$SB/trunk DG_BUILD=$SB/build DG_WT_ROOT=$SB/wt dg-land.sh DG-999 --from base
→ merging into base
fatal: 'base' is already used by worktree at '…/trunk'
EXIT=128            # and $SB/wt/.land-DG-999 left behind
```

**Evidence — the gate:** `tests/test-dg-land.sh` (new; run it from anywhere) builds the production
layout in a temp dir — bare origin → clone → linked-worktree trunk with the base **checked out** →
ticket worktree — and drives three scenarios: a real land, a dry run, and a push rejected by a
pre-receive hook. 21 checks, all failing before the fix (10 FAIL) and all passing after:
```
$ ~/dg-build/tests/test-dg-land.sh
scenario 1: land into a base that the trunk has checked out        8/8 ok
scenario 2: --dry-run exercises the merge path without pushing     7/7 ok
scenario 3: push rejected by the remote (pre-receive exit 1)       6/6 ok
✔ all scenarios pass
```

Real-world verification is the next land through this script (DG-040 is queued for it).

Still true and out of scope here: the nine pre-DG-037 worktrees cannot pass the dirty-tree gate
until removed and recreated (safe — all nine branches are on origin, BOARD.md 2026-08-23).
