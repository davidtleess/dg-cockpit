---
name: dg-plan
description: Inspect an authorized engineering goal and write an exact, test-first implementation plan without editing product code. Use when the user asks Gemini to plan Dynasty Genius work or reduce ambiguity before execution.
---

# Dynasty Engineering Plan

Use the bundled, pinned ASW planning, programming, debugging, UI/UX, loop, and review skills only within this Dynasty contract.

1. Establish the goal, repository, authorized scope, constraints, and success evidence.
2. Inspect relevant source, tests, instructions, runtime surfaces, and pre-existing dirty state without editing product code.
3. Resolve uncertainties from local evidence. If a missing decision materially changes the outcome, end `BLOCKED`.
4. Write a bite-sized plan with exact file paths, test-first red/green steps, commands and expected outcomes, real-surface QA, security checks, cleanup, and the final human gate.
5. Self-review the plan for requirement coverage, placeholders, inconsistent names, and unowned scope.
6. End `READY_FOR_GATE` when the plan is executable, or `BLOCKED` with the concrete reason and smallest resume action.

## Hard gates

Planning never authorizes commit, push, merge, release, publish, destructive work, permission escalation, scope expansion, or external communication. A failed or malformed safety hook means `BLOCKED`. The third failure of the same required verification means `BLOCKED`.

`READY_FOR_GATE` means the reviewed plan is ready for a human execution decision; it does not permit product edits or any hard gate.
