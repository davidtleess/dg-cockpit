# DG-031 — Salvage the outcome-season resolver and Coverage contract into a clean baseline

**Layer:** 1 → 3  ·  **State:** done  ·  **Lane:** CodexCrew20260819  ·  **DG 3.0**
**Source:** majority ballot round 2, 2026-08-19; independent branch falsification at frozen SHA `0b5b22c`

**Problem:** `feature/outcome-loop-week1` contains two useful backend fixes, but neither exact commit
is safe to land. `38b377b` couples the season resolver to an unsafe rehearsal that can pass without
discriminating real from control and targets fixed `app/data` outputs. `e691f5e` restores the
scorecard Coverage response but leaves the generated TypeScript/Zod/index clients stale. Landing the
42-file branch as a prerequisite would also carry known false health, scoreboard, visual and wire
contracts.

**Done looks like:** from current `main`, rebuild only these two narrow slices test-first:

1. `run_realized_outcome_scoring.py` resolves the active roster/league year through an injected
   provider, with RED contracts for preseason rollover, active-season behavior, provider failure,
   and injected-provider isolation. No rehearsal, fixed shared-data output, or unrelated script is
   imported.
2. The realized-outcome scorecard route serves its existing Coverage payload rather than 503ing;
   backend contracts pass; `frontend/openapi.json` and all generated API artifacts
   (`types.gen.ts`, `zod.gen.ts`, `index.ts`) are regenerated and parse the response.
3. Full relevant Python/frontend tests, Ruff, typecheck, build, banned-language and diff-check pass.

**Explicitly out of scope:** health provenance/DG-023, Model Scoreboard UI/API, ledger tooling,
historical closeout documents, scorer rehearsal, shared-data writes, Studio, commit/push/merge/release.

**Depends on:** nothing; the coverage producer already exists on `main`.

---

**Evidence commands:**

```text
git cherry -v main feature/outcome-loop-week1
git show --stat 38b377b
git show --stat e691f5e
```

Round 2 closed 3/4 for this narrow rebuild in
`docs/agent-ledger/2026-08-19.md` under `[w#outcome-loop-recovery-ballot]`.
