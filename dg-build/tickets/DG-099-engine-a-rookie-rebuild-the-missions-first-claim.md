# DG-099 — Engine A rookie rebuild: the mission's first claim has no model behind it

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**  ·  **OFF-SEASON (Jan-Feb 2027 program)**
**Source:** filed 2026-08-29 night on David's delegation ("u decide", gap-audit session).

**Problem:** The mission's #1 claimed advantage is the highest hit rate on incoming rookies via pre-NFL signal quality (docs/mission.md). Engine A is a stale 3-feature model (pick / round / age; run 20260502T153931Z) grading roughly WR C / RB C / TE C / QB D, untouched since May; CFBD enrichment was defined but never promoted because backtests did not beat baseline. Nothing anywhere schedules a rebuild — the board's only Engine A ticket (DG-021) fixed a false caveat, not the model.

**How we know:** docs/mission.md (the claim); docs/model-architecture.md + validation docs (features, grades, run id — re-verify exact grades at claim time; they are from the model's own cards). `grep -il "engine.a\|rookie" ~/dg-build/tickets/*.md` → nine matches (DG-011, DG-017, DG-021, DG-053, DG-057, DG-061, DG-066, DG-086, and this file) — read each: none schedules an Engine A rookie rebuild; DG-021 is the only Engine-A-specific one and it fixed a false caveat, not the model (2026-08-29, corrected same night after adversarial verification — the original line claimed "DG-021 only", which was false as a command result). The 08-29 gap audit's model auditor independently verified the staleness.

**Done looks like:** Either a rebuilt rookie engine through the full honesty chain — leakage-clean labels (DG-026 lesson), walk-forward validation (DG-002 pattern), challenger-vs-challenger comparison (DG-030), TrainingSpec sidecar + verify_artifact (DG-057), promoted ONLY through the 8-3 chain (DG-058/059) — or a documented, measured decision that the baseline cannot be beaten and the mission claim is amended. Either outcome is a win; the current silence is not.

**Depends on:** DG-058/DG-059 (promotion chain — no 2027 candidate promotes without it); rookie-class data refresh; David's word on any paid data source (CFBD contract terms).

---

**Notes**
- Timing: Jan-Feb 2027 by the scoping ruling; the 2027 rookie class makes it urgent by March. Filed now so the off-season program opens with the mission's core claim already on the board instead of rediscovering it.
