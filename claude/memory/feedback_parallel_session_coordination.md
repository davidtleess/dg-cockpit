---
name: feedback-parallel-session-coordination
description: How to find out what a parallel Claude session is working on before landing anything — the cockpit/tmux is gone, so use process ancestry and transcript files
metadata:
  type: feedback
---

David runs two Claude sessions at once during sprint work and will ask "is there a way for you to
determine what the parallel session is working on?" before authorizing a push. **There is, and tmux
is not it** — as of 2026-08-25 `tmux ls` fails (`no such file or directory`); the cockpit panes that
[[cockpit_session_identity]] assumes are not running.

**Why:** landing pushes to a shared `origin/main` while another agent has the trunk checked out and
scheduled producers firing. "No conflict" has to be measured, not assumed.

**How to apply — five checks, all read-only, ~1 minute:**

1. **Identify yourself first.** `echo $PPID`, then walk `ps -o pid=,ppid=,command= -p $P` up the
   chain. Your Bash shells hang off YOUR `claude` pid. Every other long-running `claude` pid is
   someone else. Do not guess from cwd — both sessions share it.
2. **Read their transcript.** `~/.claude/projects/-Users-davidleess/<uuid>.jsonl`, newest mtime that
   is not yours. Parse the JSONL: `type=="user"` entries are David's own words (the clearest
   statement of their intent); `tool_use` blocks give the exact files they have touched. Filter by
   timestamp since their last instruction — 20 lines of output answers it.
3. **Check the shared locks and claims.** `dg-land.lockdir` under `git rev-parse --git-common-dir`
   (the bare `dg-land.lock` FILE is just an fd target and is always there — it is NOT a held lock);
   `State: doing` in `~/dg-build/tickets/`; `git status` in the trunk.
4. **Check file overlap, not vibes.** `comm -12` the merge's `git diff --name-only` against the
   trunk's dirty paths. Check mtimes — a scary-looking untracked file can be 17 days stale.
5. **Check the BLAST RADIUS on what they are about to verify.** This is the one that actually
   mattered on 2026-08-25: they were waiting on an 11:30 pvo-refresh, and the answer was that
   `pvo_refresh` does not declare `input_provenance_field` (only `feature_refresh` does, of eight
   artifacts), so the change could not move their surface. Naming that beats any amount of
   "should be fine".

**Also:** the real collision risk is usually `~/dg-build/BOARD.md`, not code — both sessions write it.
Pull immediately before editing, push immediately after. And do not edit `MEMORY.md` or a memory file
while the other session is active; it is last-writer-wins with no git in that directory.

**"I only committed my own files by name" does NOT isolate lanes — measured 2026-09-02.** A peer
committed `BOARD.md` by name twice while closing its own ticket and told me twice it had left my
files alone. It believed that, and it was wrong: `git add BOARD.md` takes the WORKING COPY, including
whatever row the other lane has in progress. My two in-progress DG-134 board edits went out inside
`ac0c6f5` and `aa7d714` — both messages about a different ticket (DG-141) — and were **pushed to
origin/main before David gave the word for DG-134's push**, crossing his dg-build push rule without
anyone intending to. Naming a file only isolates you when one lane writes it; BOARD.md is the file
every lane always has dirty.

**How to apply:** before committing in `~/dg-build`, run `git diff --stat` and look at BOARD.md
specifically — `git add -p BOARD.md` if another lane is live. Afterwards, `git log -1 -S "<a phrase
only your row contains>" -- BOARD.md` settles in five seconds whether a commit carried someone
else's work. Do **not** rewrite pushed history to fix a cosmetic attribution error — that is the
bigger mistake; report it and leave it.

Related: [[project_dg3_build_system]], [[cockpit_session_identity]].
