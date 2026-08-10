---
name: dg-status
description: Report the current Dynasty autonomy run's goal, scope, phase, checks, changes, blocker, and human gate. Use when the user asks Claude for progress or whether an engineering run is ready.
---

# Dynasty Autonomy Status

Use installed Superpowers skills for brainstorming, planning, worktrees, TDD, execution, review, and verification.

1. Read the worktree-local run record with the exact command below; do not infer state from memory.

   ```sh
   "$HOME/.dg-autonomy/bin/dg-autonomy" status
   ```
2. Report goal, role, authorized repository and scope, worktree, phase, checks with evidence, changed files, cleanup state, blocker, and next human action.
3. If the record is absent, malformed, or inconsistent with the working tree, report `BLOCKED`.
4. Report exactly one terminal state when terminal: `READY_FOR_GATE` or `BLOCKED`. Otherwise say `ACTIVE` and name the current phase.

## Hard gates

Status reporting never performs commit, push, merge, release, publish, destructive work, permission escalation, scope expansion, or external communication. A failed or malformed safety hook means `BLOCKED`. The third failure of the same required verification means `BLOCKED`.

`READY_FOR_GATE` means the authorized work is ready for human action. `BLOCKED` must include the concrete reason and smallest resume action.
