---
name: dg-auto
description: Run a bounded engineering goal autonomously through planning, implementation, testing, real-surface QA, and review to a human gate. Use when the user asks Gemini to complete an authorized code change rather than only advise.
---

# Dynasty Autonomous Engineering

Use the bundled, pinned ASW planning, programming, debugging, UI/UX, loop, and review skills only within this Dynasty contract.

1. Establish the exact goal, authorized repository, scope, and acceptance evidence from available context.
2. Inspect dirty state. Preserve every pre-existing user change and create a dedicated worktree before editing.
3. From the authorized worktree, initialize the run record with the exact command below. Replace every angle-bracket value with explicit text or an absolute path; do not use command substitution. If authority or isolation is unclear, end `BLOCKED`.

   ```sh
   "$HOME/.dg-autonomy/bin/dg-autonomy" init --role gemini --goal "<goal>" --repository "<absolute-repository-path>" --worktree "<absolute-worktree-path>" --scope "<authorized paths and operations>"
   ```
4. Produce a native implementation plan before product edits.
5. Implement test-first: write a failing test, observe the expected failure, write minimal code, and observe the pass.
6. Run the relevant full tests, static checks, build, and browser or real-surface QA.
7. Review the diff for scope, correctness, regressions, security, configuration preservation, and cleanup.
8. Record every required receipt with the CLI. The required names are `tests`, `static-analysis`, `real-surface-qa`, `review`, and `cleanup`. Use concrete evidence; when a check is genuinely inapplicable, record a passed receipt whose evidence explains why.

   ```sh
   "$HOME/.dg-autonomy/bin/dg-autonomy" record-check --name tests --status passed --evidence "<command and result>"
   "$HOME/.dg-autonomy/bin/dg-autonomy" finish
   ```

   `finish` fails closed to `BLOCKED` if any required receipt is missing or failed. Never invent or infer a receipt.
9. End exactly `READY_FOR_GATE` when the authorized work and evidence are complete, or `BLOCKED` with the concrete reason and smallest resume action.

## Hard gates

Never perform commit, push, merge, release, publish, destructive work, permission escalation, scope expansion, or external communication. Stop before the action and report `BLOCKED`. A failed or malformed safety hook also means `BLOCKED`. The third failure of the same required verification means `BLOCKED`.

Do not call work complete without fresh evidence. `READY_FOR_GATE` means the next action belongs to the human; it never authorizes a hard gate.
