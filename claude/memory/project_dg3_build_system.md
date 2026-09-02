# DG 3.0 build system — `~/dg-build/`

**Created 2026-08-18 on David's word.** He asked for "a full ticketing process with sprints that
takes your work and everyone elses work and makes it a build plan — are making some big changes",
then "we are building DG 3.0 now".

## Where it is and what it is
`~/dg-build/` — **its own git repo as of 2026-08-19 (`dfa7016`), 38 files.**
**Backup coverage (corrected 2026-08-27):** backup.sh HAS rsynced dg-build CONTENT since
2026-08-19 (backup.sh:68, added on David's word; `.git` excluded — content mirrors, history
doesn't). Primary backup is its own GitHub remote (davidtleess/dg-build, added 08-23). The
old "NOT covered, grep no match" claim predated the 08-19 rsync line.

- `README.md` — the whole system in one page
- `BOARD.md` — one line per ticket, rebuilt from ticket files, never from itself
- `AGENT-HOOK.md` — the parallel-work protocol, written to be prepended to the product repo's
  `AGENTS.md`. **Tower does not commit to the product repo; David was given the exact command.**
- `bin/dg-work.sh` — one worktree + branch per ticket, claims the ticket, guards tested. **⚠ Lane PIDs: before 2026-09-01 (`c2b0b89`) the stamp was `$(hostname -s)-$$` — the SCRIPT's own PID, dead at exit — so no Lane PID on the board from before that date can be checked with `ps -p`; a dead PID proves nothing. Now stamps the nearest `claude` ancestor PID (alive for the session). Also: running dg-work.sh just to INSPECT a ticket stamps a claim on it — Tower did this to DG-128 at 12:32 on 09-01 and then misattributed the stamp to a peer. Inspect with `git worktree`/`git show` instead, or clear the Lane field after.**
- `bin/dg-land.sh` — rebase, test, merge, push, clean up, under an exclusive lock.
  **✅ WORKS UNAIDED as of 2026-08-24 (DG-038 done, dg-build `16e75a8`).** The merge now builds
  on a DETACHED head and pushes `HEAD:$BASE`, so a base checked out in the trunk no longer kills
  it; `--dry-run` builds the real merge and runs `git push --dry-run`, so a green dry run now
  DOES mean a landable ticket; one EXIT trap cleans the lock and temp worktree, so a failed land
  no longer self-conceals. Gated by `tests/test-dg-land.sh` (hermetic sandbox, 21 checks).
  Proven in production the same day: DG-040 was the first ticket ever landed through it unaided.
  After a land the trunk's LOCAL base branch is 1 behind origin — the script says so and leaves
  `git pull --ff-only` to a human; check dirty-file overlap before pulling the trunk.
  The nine pre-DG-037 worktrees (DG-014/015/020/021/022/029 etc.) still need remove-and-recreate
  before the dirty-tree gate passes them (safe — all nine branches on origin).
- `tickets/DG-001..DG-040`, `_templates/`, `sprints/` (sprints dir empty — the SR sprint lives
  in the product repo's `docs/.../2026-08-20-dg-SEASON-BUILD-SPEC.md`, SR-11 scheduled D4=08-26)

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

**2026-08-25 — the base question is ANSWERED: everything lands on `main`.** David ruled the merge
(2026-08-25, `d33c9896`) and then "land on main"; `feature/outcome-loop-week1` is retired as a
landing base. DG-029 (`849f3eaf`) and DG-021 (`b291107f`) landed on `main` through `dg-land.sh`
unaided the same morning. **The trunk itself switched to `main` at 10:21 EDT the same day** (three
dirty files on main-deleted paths archived in `dg-build/preserved/2026-08-25-trunk-switch/` + product
`stash@{0}`; producers now run from `main`). The 2026-08-24 note below is HISTORICAL.
**2026-08-25 late day: origin/main closed at `2bf91d8d` (evening-closeout ledger + SR-21 marked
done in the sprint spec + the DG-022 block's stale "DG-042"→DG-043 corrected in place, all via
throwaway detached worktrees). THREE merges landed on it — DG-041 `b797ee1f`, the parallel
session's DG-042 PPG guard `c2b11f0a`, DG-022 `20807368` — and the trunk pull is DELIBERATELY
HELD at `main@a61f0fbe`** so the 08-26 ~09:00 cycle confirms DG-023 single-variable — pull
`--ff-only` post-window (after ~10:15 ET) on 08-26. NOT drift; recorded in BOARD, the tickets,
and the 08-25 ledger. Only DG-041 touches a producer. First DG-041 production run 08-27: expect
ONE source_hash move (provenance echo, frames identical), then participation
`fallback_used=false`; /api/health stays `inputs_degraded` on a healthy 08-27 — participation
moves to LIVE in the basis (the `inputs_live` expectation was verified unreachable 08-26
evening; see DG-045's D5 SITTING PACK). DG-022's serving-surface change goes live
when whatever serves the API restarts after the pull. Ticket-ID collision resolved 08-25: the
a11y filing is **DG-043** (the 08-25 ledger's "Filed as DG-042" is a stale reference).
**2026-08-26 morning: DG-044 (SR-11) filed, built, reviewed, LANDED `b1b888be` — all before the
09:00 window.** dg-work.sh `--from origin/main` works (its fetch of the literal ref warns
harmlessly); dg-land removed the worktree and flipped the ticket to done unaided.
**2026-08-26 FULL DAY: NINE tickets landed through dg-land (DG-044/046/053/047/049/048/039 +
the evening pair DG-080/DG-081 = SR-15 + SR-16 pulled forward on David's word, merges
`ab32a605` + `c606fc53` — chosen because frontend-only work can't contaminate Thursday's
single-variable checks or collide with DG-045; the -048/-039 pair on David's rulings), the six-layer audit ran, the layer roadmap was RATIFIED and
the board now runs DG-001..079** (DG-049..079 = the ratified backlog with edge-distance + size
stamps; ROADMAP-LAYERS.md in dg-build root). SR-09/DG-045 steps 1-7 built + adversarially
reviewed on `ticket/DG-045` (`6038d2d6`, pushed, NOT landed — coupled to Thursday's launchctl
sitting; three retired plists are live symlinks, never land-then-wait). ~~⚠ dg-work share-map gap:
`league_transactions/` not shared into worktrees (false marker-absent readings)~~ — **FIXED
08-26 evening (`bfed555`), NEW worktrees only; DG-014/020/045 stay unlinked until recreated** —
and the DG-048 incident proved writers CAN reach production through shared symlinks (record in
that ticket).
**2026-08-26 late evening (second session): dg-build closed at `c4137b0`** — D5 SITTING PACK
appended to the DG-045 ticket (fact-verified + adversarially reviewed, supersedes every looser
sitting note), share-map fix `bfed555`, and `17cccd3` merged the mis-truncated DG-049/053 stray
ticket files into their canonicals (strays removed — they held the only copy of the closeout
text), added BOARD's supersession bracket on the afternoon DG-045 narrative, and stamped
ROADMAP-LAYERS' header with David's same-day ratification. **Post-window 08-26 ~10:16: trunk PULLED `--ff-only`
`a61f0fbe → b1b888be` — all four merges in, the pin is released; trunk = origin/main.** DG-035
option (b) closed; DG-040 fully proven (second consecutive scheduled 06:15 success — and its
marker transiently reads `status: running` mid-capture, a state readers must tolerate). SR-11's
install + live-fire acceptance completed same day (kickstart 12:00, banner seen by David).

**Recreate procedure for pre-DG-037 worktrees, proven twice:** verify tip==origin and dirt is
phantom-only → `git worktree remove --force` → `git branch -D ticket/DG-NNN` (origin keeps the
copy) → clear the ticket's Lane field → `DG_SESSION=<lane> dg-work.sh DG-NNN` (base defaults to
main) → cherry-pick the branch's one real commit. Watch for add/add conflicts on ledger files —
keep the trunk's canonical version, never re-plant a worktree-local duplicate (DG-032).

*(Historical, 2026-08-24:)* DG-034 and DG-036 lived only on `feature/outcome-loop-week1`; that
branch reached `main` in the 2026-08-25 merge, so the branch-from-feature rule is obsolete.
**Naming trap:** `origin/main`'s PR #160 merged a branch named `ticket/DG-035`, but its content is
the 2026-08-19 governance removal — unrelated to the DG-035 capture-chain ticket, which is still open.
