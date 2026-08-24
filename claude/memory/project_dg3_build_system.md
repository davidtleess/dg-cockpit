# DG 3.0 build system — `~/dg-build/`

**Created 2026-08-18 on David's word.** He asked for "a full ticketing process with sprints that
takes your work and everyone elses work and makes it a build plan — are making some big changes",
then "we are building DG 3.0 now".

## Where it is and what it is
`~/dg-build/` — **its own git repo as of 2026-08-19 (`dfa7016`), 38 files.**
**⚠ NOT covered by `~/dg-cockpit/backup.sh`** — verified `grep -n "dg-build" backup.sh` → no match.
Local git history only. Adding coverage is David's call; the one-line fix is an rsync line.

- `README.md` — the whole system in one page
- `BOARD.md` — one line per ticket, rebuilt from ticket files, never from itself
- `AGENT-HOOK.md` — the parallel-work protocol, written to be prepended to the product repo's
  `AGENTS.md`. **Tower does not commit to the product repo; David was given the exact command.**
- `bin/dg-work.sh` — one worktree + branch per ticket, claims the ticket, guards tested
- `bin/dg-land.sh` — rebase, test, merge, push, clean up, under an exclusive lock.
  **⚠ It still cannot land a ticket unaided (DG-038, hit 2026-08-24).** DG-037 fixed the five
  mechanisms that stopped a worktree reaching the gate; the merge block BEHIND the gate has a
  sixth. It runs `git checkout -B "$BASE"` in a temp worktree, and git refuses one branch in two
  worktrees — so it dies on any base that is checked out anywhere, which is the trunk's normal
  state. **`--dry-run` returns at `:100`, before that block, so a green dry run does NOT mean a
  landable ticket.** Work around it by merging in a DETACHED worktree and
  `git push origin HEAD:$BASE`; then the trunk's LOCAL branch is 1 behind origin and needs
  `git pull --ff-only` (not automatic — a detached push cannot move a checked-out branch).
  **A failed land also self-conceals:** it leaves the temp worktree, the lane claim, the branch
  and `State: todo` behind, and the NEXT run silently `rm -rf`s the evidence — so an interrupted
  land reads as an unstarted ticket whose lane is mysteriously taken.
- `tickets/DG-001..DG-030`, `_templates/`, `sprints/`

## Ticket format (near-zero governance, David 2026-08-18)
Five fields: what's wrong · how we know (the command) · layer · done looks like · state
(`todo/doing/done/dropped`). **No approval gate, no falsifier requirement, no verify-lane rule** —
all stripped when David turned governance down. The layer stamp stays because it is HIS law.

## The parallel-work protocol — the repo-specific part that matters
A plain `git worktree add` is USELESS here: `app/data` is **15 GB with only 148 tracked files** and
`.venv` is **2.3 GB**, all untracked. A bare worktree cannot import nflreadpy or open a store.
**Design rule: SHARE what is read (symlink), NEVER share what is written (per-worktree dirs).**
Written dirs kept private: `features_runtime`, `valuation_runtime`, `ops`, `model_capture`,
`league_runtime`, `what_changed`, `roster_capacity`.

**Discovered 2026-08-18:** `~/dynasty-genius-product/.oa3` **IS a git worktree** (detached at
62768d0) — that is the "full parallel copy of the tree" that confused two reviews. Two more
worktrees in `/private/tmp` are prunable. Trunk is `main`; the working branch was
`feature/outcome-loop-week1`.

**2026-08-24 — which base a ticket branches from is now load-bearing.** DG-034 and DG-036 both live
ONLY on `feature/outcome-loop-week1` (38 ahead / 6 behind `origin/main`, unmerged 11 days before the
09-04 freeze). Anything touching `system_capture_health_models.py` must branch `--from
feature/outcome-loop-week1` or it is written against a file missing +172 lines. Whether that branch
reaches `main` before the season is unanswered and is David's call.
**Naming trap:** `origin/main`'s PR #160 merged a branch named `ticket/DG-035`, but its content is
the 2026-08-19 governance removal — unrelated to the DG-035 capture-chain ticket, which is still open.
