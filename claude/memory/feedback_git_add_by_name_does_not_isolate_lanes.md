---
name: feedback_git_add_by_name_does_not_isolate_lanes
description: "Never `git add -A` is NOT enough in a shared repo — adding a file BY NAME still stages the other lane's uncommitted edits to that same file; check `git diff <file>` first"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 6f07a6c0-2441-4274-a8bf-6eff1f431537
  modified: 2026-09-03T02:33:56.680Z
---

**`git add <file>` stages the whole working-copy file, including edits another session made to it.**
The "never `git add -A` / `git add .`, always name the files" discipline protects against sweeping
OTHER files. It does nothing when two lanes edit the SAME file — and in `~/dg-build` that file is
always `BOARD.md`, because every ticket lands a board row.

**What it cost, 2026-09-02 ~22:35 (Tower / davidleess-0b):** two DG-141 commits (`ac0c6f5`, `aa7d714`)
swept Fred's uncommitted DG-134 board row and **pushed it to origin/main**, so his row is attributed to
commits about a different ticket. Fred caught it and measured it with
`git log -1 -S "<a phrase only his edit contains>" -- BOARD.md`. **Tower had twice asserted — to Fred
and to David — "I did not touch his files; I only committed my own by name." Both statements were
false, and Tower would have gone on believing them.** The claim felt safe because the rule being
followed was real; it was just the wrong rule for a shared file.

**Why:** an assurance about someone else's work is a claim about the filesystem, not about your
intent. "I only added my own files" describes what you typed, not what got staged.

**How to apply — before staging any file a second lane might also be editing:**
1. `git diff <file>` (or `git diff --stat`) and read it. If a hunk isn't yours, it isn't yours.
2. Stage the hunks, not the file: `git add -p BOARD.md`.
3. If it is already pushed: **do not rewrite pushed history over attribution** — that is the bigger
   error. Say so plainly and leave it (Fred's call 2026-09-02, and it was right).
4. Never tell a peer "I left your files alone" without having run (1). Say what you staged instead.

**What this was NOT:** a peer reported that the push also broke "David's standing rule that dg-build
pushes only on his word". Tower declined to accept that account and let David rule; the peer then
searched and retracted — no such rule exists, and Tower verified the retraction positively rather
than by absence: David's own turns say "You can commit everything and keep moving" (08-31) and "you
can commit and land it" (09-01), and he added a standing `Bash(git push *)` allow rule on 08-31.
**The staging error stood on its own and needed no rule.** See [[feedback_my_conventions_are_not_davids_rules]].

Related: [[feedback_parallel_session_coordination]] (how to find out what the other lane is doing),
[[feedback_check_when_not_just_what]] (same failure shape — asserting without measuring),
[[reference_peer_assumes_your_context]].
