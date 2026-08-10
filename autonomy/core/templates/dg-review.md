---
name: dg-review
description: Review an autonomous engineering worktree and its evidence for correctness, safety, scope, and real-surface behavior. Use when the user asks {{HOST}} to assess changes before a human commit or publication gate.
---

# Dynasty Engineering Review

{{BACKEND}}

1. Read the goal, scope, plan, run status (`"$HOME/.dg-autonomy/bin/dg-autonomy" status`), and all repository instructions.
2. Inspect the complete diff and lead with concrete findings ordered by severity.
3. Verify tests, static checks, builds, and relevant browser or real-surface evidence directly; absence of evidence is not success.
4. Check security, secrets, dependency provenance, configuration preservation, dirty-tree isolation, and cleanup.
5. Confirm the change did not expand scope and did not cross a human gate.
6. If this review belongs to an active autonomous run, record it with `"$HOME/.dg-autonomy/bin/dg-autonomy" record-check --name review --status <passed-or-failed> --evidence "<findings and commands>"`. End `READY_FOR_GATE` only when no blocking finding remains and fresh verification supports the claim. Otherwise end `BLOCKED` with findings and the smallest remediation.

## Hard gates

Review never performs commit, push, merge, release, publish, destructive work, permission escalation, scope expansion, or external communication. A failed or malformed safety hook means `BLOCKED`. The third failure of the same required verification means `BLOCKED`.

`READY_FOR_GATE` is a review result, not permission to publish.
