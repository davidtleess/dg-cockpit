# DG-028 — Make the "we changed nothing" check actually able to see

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
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
