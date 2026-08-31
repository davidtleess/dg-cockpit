# DG-112 — Delete the retired Databricks bundle from the repo

**Layer:** process  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG112-20260830  ·  **DG 3.0**  ·  **David: "ok go ahead remove it" (2026-08-30)**
**Source:** the last step of DG-101's teardown runbook, unblocked once the workspace destroy completed.

**Problem:** `infrastructure/` holds a Databricks Asset Bundle for an architecture the master plan's restraint list (§9) forbids and that David retired on 2026-08-30. DG-101 deliberately kept the files so `databricks bundle destroy` would still have a definition to tear down with. The destroy is now done — the workspace holds zero jobs — so the definition has no remaining purpose, and leaving it invites a future agent to redeploy it.

**How we know (2026-08-30, commands run):**
- `databricks jobs list --profile dbc-228373f7-57ec` before → one job, `refresh_genius_state`, job_id `1030657541959808`, created 2026-05-03, **live schedule `pause_status: PAUSED`** (dev-mode bundles auto-pause; the repo's `UNPAUSED` never took effect).
- `databricks jobs list-runs --job-id 1030657541959808` → **0 runs, ever. Zero compute billed.**
- `databricks bundle destroy -t dev --auto-approve` → "Destroy: 1 deleted", workspace bundle dir removed.
- `databricks jobs list` after → **0 jobs**.
- Safety scan before deleting: `.github/workflows/ci.yml` references neither `infrastructure` nor `databricks`; `scripts/codex_audit_sql.py` does not exist in the live tree; the only tracked references outside `.oa3/` and agent-ledger history are the MASTER plan (prose, stays) and `infrastructure/README.md` (deleted with the rest).

**Done looks like:** `infrastructure/` gone from `main`; suite green; nothing in CI or the live tree references it. Git history keeps every byte, so this is recoverable, not destructive.

**Depends on:** DG-101 (landed `ae2309bf`) and the workspace destroy — both complete.

---

**Notes**
- **The "URGENT every-minute job" was real on paper and never real in practice.** The master plan (:814) and the 2026-08-29 gap audit both carried it as a live billing risk; the measurement says zero runs and zero cost. The genuine risk was latent: a `-t prod` deploy would have armed a job firing sixty times an hour. That path is now closed at both ends.
- `~/.databrickscfg` still holds David's workspace profiles. Left alone deliberately — it is his credential file and may serve other work; removing it is his call, not a code change.
- The four `.sql` files under `infrastructure/src/sql/` go with the directory. They were governed by an auditor (`scripts/codex_audit_sql.py`) that no longer exists in the live tree; their content is preserved in git history and discussed at length in the 2026-07-29/30 agent ledgers.
