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
- `bin/dg-land.sh` — rebase, test, merge, push, clean up, under an exclusive lock
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
