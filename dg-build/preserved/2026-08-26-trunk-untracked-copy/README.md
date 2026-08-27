# Trunk untracked files — protective COPY (2026-08-26 ~13:30)

The product trunk carried 22 untracked paths in NO backup copy (GitHub holds only tracked files;
backup.sh's GCS entry covers app/data; nothing covered these). Panel-hardened Item 3 of the day
plan: COPY into dg-build (which pushes to its private GitHub remote), never commit to the trunk,
never touch other lanes' files. Originals remain exactly where they were.

Copied here (63 files, 1.8M):
- `evidence/` — docs/agent-ledger/evidence/2026-08-09, -11, -12, -14, -18 (the Engine B
  forensics + independent model audit record)
- `strategies/` — the two 2026-08-19 architecture docs. ⚠ The master-proposal doc family carries
  the REG-only retrain step that REVERSES David's same-day "all games" ruling — preserved as
  historical record, do not work from it without striking that step.
- `superpowers/` — the four 2026-08-18 plan/spec docs
- `model-scoreboard.fixture.json` — frontend e2e fixture

Deliberately NOT copied: `.oa3/` (a live git worktree, not evidence) and
`tests/contract/test_governed_cadence_inputs_red.py` (another lane's live RED test).

Whether any of these should be COMMITTED to the product repo is David's ruling, per file class.
This copy exists so that question is no longer urgent.
