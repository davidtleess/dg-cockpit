---
name: reference_git_ff_only_no_commit_is_not_a_dry_run
description: "`git merge --ff-only --no-commit origin/main` is NOT a dry run — --no-commit is IGNORED for fast-forwards, so it performs the pull. And `git merge --abort` then does nothing, because no merge is in progress. Cost a real unauthorized pull of trunk 2026-09-05 06:01."
metadata:
  node_type: memory
  type: reference
---

**⛔ `git merge --ff-only --no-commit <ref>` PERFORMS THE MERGE.** `--no-commit` is **ignored for a
fast-forward** — there is no merge commit to withhold, so the flag has nothing to suppress and the branch pointer
moves. It looks like a dry run. It is the pull.

**And the escape hatch does not work either:** `git merge --abort` afterwards **does nothing and says nothing
useful**, because no merge is in progress to abort. So the two commands a careful person would reach for —
"preview it" and "undo it" — both silently do the opposite of what their names promise.

**THE TELL WAS ON SCREEN AND WAS READ AS CONFIRMATION.** The output was:

    Updating 43c15699..96dad300
    Fast-forward

That is the output of the thing HAPPENING, not a preview of it. **This is the more valuable half of the lesson**,
because next time the flag will be a different flag and the output will still be the truth. A dry run that prints
the same words as the real thing is [[feedback_the_failure_path_returns_the_success_signal]] wearing a git hat.

**What to do instead — these actually preview:**
- `git log --oneline HEAD..origin/main` — what would come in.
- `git diff --stat HEAD origin/main` — what would change.
- `git merge-base --is-ancestor HEAD origin/main` — would it even fast-forward.
- To check whether local modifications would block it: `git status --short` and compare paths against
  `git diff --name-only HEAD..origin/main`. No merge command required, and none should be run.

**Recovering from it:** `git reset --keep <old-sha>` restored the baseline AND preserved three other lanes'
uncommitted modifications intact (`.mcp.json`, an agent ledger, `test_aging_curves.py` — each diff verified after).
`--keep` is the right flag here; `--hard` would have destroyed another session's work.

## ⛔ WHY THIS ONE WAS DANGEROUS RATHER THAN UNTIDY

Trunk pulled but **not rebuilt and not restarted** is a HALF-APPLIED state, and it is worse than either end:
the 09:00 chain would run on NEW code and write a NEW-scale artifact, while the running API process still holds
the OLD constants in memory. Old replacement lines against new scores, every one ~28% lower — **David's entire
roster reading far below replacement**, arriving while nobody is watching.

Verified rather than assumed: `run_daily_chain.py` shells Python subprocesses only — no `launchctl kickstart`,
no `npm run build`, no API restart anywhere in it. **A pulled tree does NOT self-complete.**

**THE STANDING RULE, and it is worth more than the git trap:**
> **The API restart must complete before any chain run on a pulled tree. If the sequence is interrupted between
> pull and restart, REVERT rather than leave it half-applied.**

⚠ **The mirror hazard, so it is not solved in one direction only:** restarting on new constants while the OLD
artifact is still served is the same inconsistency reversed. Before pulling well ahead of a chain run, establish
whether the served numbers and replacement comparisons are BAKED INTO the artifact or COMPUTED at request time.
If computed at request time, compress the pull-to-chain window instead of taking early margin.

See [[reference_trunk_frontend_bundle_is_a_manual_build]], [[project_live_2026-09-04_morning]].
