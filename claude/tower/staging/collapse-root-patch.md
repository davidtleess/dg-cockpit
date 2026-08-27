# STAGED — durable scoping fix for dg-antigravity-tool-policy.mjs

**Status: NOT LIVE. Unverified. Do not install until `verify-tool-policy.sh` passes.**

Staged 2026-08-19 by Tower. Reason it is staged rather than installed: `syspolicyd` was at 256% CPU
(load avg 11.7) and every `node` invocation timed out, so the boundary matrix could not be run. An
unverified edit to a security boundary is worse than no edit.

## Problem it solves

agy/Antigravity reports ONE workspace as its root PLUS nested subdirectories:

```
event_workspacePaths = ["/Users/davidleess/dynasty-genius-product",
                        "/Users/davidleess/dynasty-genius-product/docs/agent-ledger"]
```

The live policy requires `roots.length === 1`, so it reads this as ambiguous and denies **every** agy
tool call. Today that is worked around per-session with `DG_AUTONOMY_WORKTREE` via
`~/.claude/tower/bin/agy-scoped.sh`. The durable fix is to collapse a coherent tree to its root.

## Why the naive version was REVERTED — read before touching this

Collapsing to the common ancestor with no guard makes `authorizedRoot = /Users/davidleess` for any
session whose workspace is `$HOME` — which the **Gemini Consultant's is**. That would authorize writes
across all of `$HOME`, **including `~/frontend-studio`**, breaching David's STANDING WALL TW29-WALL-35.
The old `roots.length !== 1` test was blocking that case by accident.

## The two edits

### 1. Replace the roots gate in `main()`

```js
  const roots = process.env.DG_AUTONOMY_WORKTREE
    ? [process.env.DG_AUTONOMY_WORKTREE]
    : event?.workspacePaths;
  if (typeof name !== "string" || !args || typeof args !== "object" || !Array.isArray(roots) || roots.length === 0) {
    decision("deny", "Dynasty autonomy requires one explicit authorized workspace");
    return;
  }
  const authorizedRoot = collapseToSingleRoot(roots);
  if (!authorizedRoot) {
    decision("deny", "Dynasty autonomy requires one explicit authorized workspace");
    return;
  }
```

### 2. Add the helper, with the guard

```js
import { homedir } from "node:os";

// Directories that may NEVER be an authorized root, however a workspace is reported.
// $HOME and / are ancestors of ~/frontend-studio (Studio's lane, David's STANDING WALL
// TW29-WALL-35), ~/.ssh, ~/.gemini and ~/.claude. A session rooted there must name a
// narrower scope explicitly via DG_AUTONOMY_WORKTREE. This is the guard whose absence
// caused Tower to revert the first attempt on 2026-08-19.
const STUDIO_LANE = resolve(homedir(), "frontend-studio");
const FORBIDDEN_ROOTS = new Set([resolve("/"), resolve(homedir())]);

// Reduce a workspace description to the single root it denotes.
// Returns null — meaning DENY — when the entries are genuinely disjoint, when the root
// is a forbidden ancestor, or when the root would contain Studio's lane.
function collapseToSingleRoot(roots) {
  const resolved = roots
    .filter((r) => typeof r === "string" && r.length > 0)
    .map((r) => resolve(r));
  if (resolved.length === 0) return null;

  let root = resolved[0];
  for (const candidate of resolved) {
    if (candidate.length < root.length) root = candidate;
  }
  // every entry must live under the chosen root, else the workspace really is ambiguous
  for (const candidate of resolved) {
    if (candidate !== root && !isPathWithinScope(root, candidate)) return null;
  }
  if (FORBIDDEN_ROOTS.has(root)) return null;
  if (root === STUDIO_LANE || isPathWithinScope(root, STUDIO_LANE)) return null;
  return root;
}
```

## What this does and does NOT change

- Any agy session opened in a real project directory works with **no env var and no launcher**.
- A session rooted at `$HOME` — which is how the Gemini Consultant is currently launched — is **still
  denied, by design.** It must name a narrower scope. So this fix does NOT by itself unblock the
  Consultant; that session still needs `agy-scoped.sh`, or to be relaunched from inside the repo.
- `DG_AUTONOMY_WORKTREE` still wins when set, and can still be narrower than the workspace.
- Disjoint roots still deny.

## Install procedure

1. `~/.claude/tower/bin/verify-tool-policy.sh <candidate-file>` — must print ALL PASS.
2. Copy candidate over `~/.gemini/config/plugins/dg-autonomy/scripts/dg-antigravity-tool-policy.mjs`
3. Copy the same file to `~/dg-cockpit/autonomy/antigravity/dg-autonomy/scripts/` so `install.sh`'s
   hash comparison does not revert it; confirm `diff` is empty.
4. Re-run the verifier against the installed live file.
