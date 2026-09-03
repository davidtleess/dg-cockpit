---
name: reference_constitution_v110_location
description: The Product Constitution v1.1.0 (2026-07-14) is in pushed git history, NOT "one command from gone"; David deliberately removed docs/governance/ from main on 2026-08-19 (ecf5c1d9) — re-committing it would reverse his ruling
metadata:
  type: reference
---

**Where the constitution actually is (verified 2026-09-02):**

- `docs/governance/00-product-constitution.md` v1.1.0 (last_updated 2026-07-14) was committed as `fb08c92b` (PR #152) and is on `origin/main`'s history — on GitHub. Recover with `git show ecf5c1d9^:docs/governance/00-product-constitution.md` (sha256 `37c19dfc…`, byte-identical to the `.oa3` working copy).
- David removed ALL 19 files of `docs/governance/` from main himself in `ecf5c1d9` (2026-08-19 21:35, "chore: replace governance with product builder charter") — the day after his "governance to near zero" ruling. The removal is a decision, not an accident.
- `~/dynasty-genius-product/.oa3/` is NOT an untracked stray copy: it is a **git worktree of the same repository**, detached at `62768d09` (an ancestor of main). It shows as `?? .oa3/` from the product tree only because a worktree inside a worktree is untracked there. `~/dynasty-genius` (branch `feature/qb-context-annotations`) is another worktree of the same repo; its v1.0.0 copy is that branch's tracked file, not "the old repo".

**Why this matters:** On 2026-09-01 Tower told David the v1.1.0 constitution "exists only in an untracked directory — zero files tracked in git, not in any offsite copy — one command from gone" and asked to commit it plus add it to the backup manifest. David authorized it on 09-02. **That premise was false** (`git status` in the wrong tree; never checked history or `git worktree list`). Constructing that commit would have reinstated a directory David deliberately deleted. Not done; David told.

**How to apply:** Before calling anything "unbacked", run `git log --all --diff-filter=D -- <path>` and `git worktree list`. A `??` in one worktree says nothing about the repository. See [[feedback_check_when_not_just_what]], [[david_rulings_dg3]] (governance to near zero, 2026-08-18). If David ever wants the doctrine findable again (draft capital first, lead on usage/lag on box score, no binary cliffs), that is a new ruling to put to him, not a restore.
