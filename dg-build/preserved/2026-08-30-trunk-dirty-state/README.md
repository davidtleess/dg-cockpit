# Trunk dirty state preserved 2026-08-30 (before the 09-04 freeze)

**Why:** the product trunk carries uncommitted work that exists in NO backup copy. This is a
non-destructive snapshot so nothing is lost; **landing or discarding any of it is David's call,
not a lane's** — none of it was written by the session that preserved it, and
AGENT-HOOK rule 1 bars working in the shared trunk.

## `tracked-mods.patch` — 3 modified tracked files
1. **`tests/test_aging_curves.py` — a REAL one-line determinism fix, worth landing.**
   `@pytest.mark.parametrize("position", list(REQUIRED_POSITIONS))` →
   `sorted(REQUIRED_POSITIONS)`. `REQUIRED_POSITIONS` is a set, so `list()` yields an order that
   varies between processes under hash randomization, making the generated test IDs
   non-deterministic. Test-only, zero production risk, Tier-0-shaped.
2. `docs/agent-ledger/2026-08-19.md` — +51 lines of ledger content (the DG-032 reconcile
   question; see that ticket before committing, its condition has MUTATED from its ticket text).
3. `.mcp.json` — local MCP config; **almost certainly machine-local, not for the repo.**

## `untracked-paths.txt` — 23 untracked paths
Includes `app/data/identity_snapshots/`, `docs/agent-ledger/evidence/2026-08-09..18/` (forensics
probe scripts), several `docs/strategies` and `docs/superpowers` files, and `.oa3/`.
An earlier snapshot of a similar set lives in `preserved/2026-08-26-trunk-untracked-copy/`.

**Also unbacked, flagged by the backend/ops lane and NOT resolved:** four local branches carry
commits absent from `origin/main` with no remote ref — `docs/product-briefing-claude`,
`feat/morning-tape-data-contract`, `feat/studio-batch-a-remediation`, `gov/02-closeout-motion`.
Pushing someone's unreviewed branch is David's decision; they are named here so the work is at
least visible rather than silently at risk.
