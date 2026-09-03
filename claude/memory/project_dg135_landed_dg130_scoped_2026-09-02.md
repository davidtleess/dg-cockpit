---
name: project_dg135_landed_dg130_scoped_2026-09-02
description: DG-135 landed 60f6940f 09-02 15:29 and LIVE 21:34 (Fred pulled trunk to a1f1023f, rebuilt bundle, API pid 90590), DG-138/DG-139 filed, DG-130 scoped awaiting David's 4 decisions after the 09-03 morning read
metadata:
  type: project
---

**DG-135 landed on main `60f6940f` 2026-09-02 15:29 ET by Tower** (on DG-137's `862a1afb`). **LIVE 2026-09-02 21:34** —
Fred pulled trunk `862a1afb → a1f1023f` (with DG-136) at 21:33 on David's "go", rebuilt the bundle
(`index-C6XzDCYI.js`) because the generated client `frontend/src/lib/api/*.gen.ts` changed (DG-076
openapi_sha256 stamp), and kickstarted the API → **pid 90590** (was 95078); the served `/api/engine-b/scores`
contract lists 200 + 503. (Earlier text: NOT LIVE as of 15:34, trunk `862a1afb`/pid 95078 — superseded.)
The ticket's premise was FALSE (regen-only = zero diff; the 503 was raised at runtime and never declared);
fix = `responses={503: …}` with envelope models in `app/api/routes/dependency_unavailable_models.py`.
Reviewed by 3 lenses + skeptics (10 agents, 0 died — spend limit did not bite); 3 findings fixed pre-landing.

**Filed from it:** DG-138 (three routes — roster_capacity/model_scoreboard/realized_outcome_scorecard — declare a
FLAT 503 model but raise HTTPException so the wire carries `{"detail":…}`; also the never-declared roster 422;
no live symptom, post-freeze). DG-139 (served AGE is the feature-season age: `universe_pvo_batch.py:198` +
`roster_auditor.py:240`; 324 rows a year young, 255 scored; Wilson's row says 25 and "2 years to the 28 cliff";
DG-137's rule for age, plain `or` is right here).

**DG-130 scoped on the ticket 15:33, awaiting David's 4 decisions** (gate sentence wording; completeness cell on a
blank row; `dvs_pct` populate vs remove; DG-130 before/after DG-139). Verified mechanics: Wilson `games_t=7`,
Allen `4` → gate → `pvo_assembler.py:497-507` nulls the score; the reason is ON the artifact row and
`roster_auditor.py:210` drops it, then `:531-537` stamps the FALSE `no_usage_signal` on a 100%-complete row;
Dell has NO 2025 row → PRE_MODEL, and `copy.ts:641-646` maps him to a wrong sentence. 114 of 115 unscored
ENGINE_B rows are `games_t` 4–7. DG-130 is the honest sentence, NOT the coverage fix — do not report it as
satisfying "rank everyone, always".

**Tomorrow 09:10 ET duty:** read the 09:00 chain receipts before David's ~09:15 read — `daily_chain_latest_report.json`
step statuses + `pvo_refresh_latest_report.json` `capture_report.status` + raw_rows (~12,227) + bands (468) +
served≠Sleeper team (0). No cron is armed (session crons die with the session).

**Why:** the next session must not report DG-135 as live, must not re-scope DG-130, and must not re-file DG-138/139.
**How to apply:** check `git -C ~/dynasty-genius-product log -1` before saying what is live; read
[[project_dg137_served_team_landed]] for the live baseline; [[reference_trunk_frontend_bundle_is_a_manual_build]].
