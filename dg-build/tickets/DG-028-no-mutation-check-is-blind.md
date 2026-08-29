# DG-028 — Make the "we changed nothing" check actually able to see

**Layer:** 3  ·  **State:** doing  ·  **Lane:** Davids-MacBook-Pro-21493  ·  **DG 3.0**
**Source:** Tower, 2026-08-18, adversarial review

**Problem:** Every model-science proposal proves it left production alone with
`git diff -- app/config/model_registry.json app/data/models`. That command cannot see the files it
is guarding. Any agent can overwrite a live model artifact and the check still passes.

**How we know:**
```
$ git check-ignore -v app/data/models/engine_b/runs/20260626T165649Z/te_v3.pkl
.gitignore:65 → ignored
$ git check-ignore -v app/data/models/engine_b/runs/20260513T012309Z/qb_v2.pkl
.gitignore:61 → ignored
$ git check-ignore -v app/data/models/engine_b/v2_manifest.json
.gitignore:60 → ignored
$ git diff --stat -- app/config/model_registry.json app/data/models
(empty — and empty is what it returns either way)
```

**Done looks like:** a check that hashes the artifacts named in `model_registry.json` and compares
against the recorded hashes. It fails loudly when a live artifact moves.

**Depends on:** nothing. This is the guard that lets everything else run safely in parallel.

---

**Notes**
Worth doing before any parallel model work starts, not after. It is also the natural companion to the
worktree protocol: isolation stops accidental collisions, this catches deliberate ones.

---

**Build record — 2026-08-28, lane Davids-MacBook-Pro-21493, branch `ticket/DG-028`, commit `44b93432` (pushed to origin, NOT landed — coordinator reviews and lands)**

Built `scripts/check_model_no_mutation.py`: hashes every artifact named in
`app/config/model_registry.json` and compares against the recorded hashes, resolving paths the way
serving does by reusing the DEBT-6 provenance layer (`load_model_registry` +
`inspect_registered_artifact` in `app/api/routes/system_model_provenance_models.py` — literal and
`latest_run_dir` resolution through governing pointers, streamed sha256, traversal guards). One line
per artifact with the observed hash; exit 0 only when every named artifact matches; exit 1 on
MUTATED / MISSING / POINTER-BROKEN / UNVERIFIABLE; exit 2 fail-closed when the registry is unusable.
Read-only; judged as environment `production` (the question is "did serving reality move?"). Zero
existing files modified — new script + new test file only.

TDD: `tests/contract/test_no_mutation_check_dg028.py` watched RED first —
`.venv/bin/python -m pytest tests/contract/test_no_mutation_check_dg028.py -q` → `7 failed, 1 passed`
(ModuleNotFoundError; the pass was the real-registry guardability check). After implementation:
`8 passed`. The headline test is the deliberate-mutation red the ticket asked for: in a throwaway git
repo with the artifact gitignored, it overwrites a live registry-named artifact, asserts
`git diff --stat -- app/config/model_registry.json app/data/models` returns EMPTY (old check blind),
and asserts the new guard fails with the artifact id and label MUTATED. Also covered: clean pass with
per-artifact hash receipts, deleted artifact, `latest.json` repointed at a different run dir, null
recorded sha256 (UNVERIFIABLE — never skipped), missing registry → exit 2, and that the real
checked-in registry records a hash for every entry (it does — 9/9).

Receipts (commands run 2026-08-28):
- `.venv/bin/python scripts/check_model_no_mutation.py --repo-root ~/dynasty-genius-product` →
  `CLEAN — 9 registry-named artifacts match their recorded hashes`, exit 0.
- Same guard against the DG-028 worktree root (which materialises only tracked files) → 5 MISSING,
  exit 1 — the loud-failure path proven against real disk state, not only fixtures.
- `pre_commit run` (ruff) on both new files → Passed; neighboring
  `tests/contract/test_system_model_provenance_t1.py` + `_t4.py` → 46 passed.
