---
name: project_dg135_landed_dg130_scoped_2026-09-02
description: DG-135 LIVE and DG-139 landed c62783b1 09-02 22:18 (age fix, NOT live — needs pull+restart and the 09:00 rebuild); DG-140 filed and URGENT before the 09:00 chain; DG-130 scoped awaiting David's 4 decisions
metadata:
  type: project
---

**DG-135 LIVE 2026-09-02 21:34** (landed `60f6940f` 15:29). Fred pulled trunk `862a1afb → a1f1023f`, rebuilt the
bundle (`index-C6XzDCYI.js`) because the generated client changed, API **pid 90590**; served
`/api/engine-b/scores` lists 200 + 503. Verified by Tower on the machine, not from the relay.

**DG-139 LANDED `c62783b1` 2026-09-02 22:18 — NOT LIVE.** `served_age()` in `universe_pvo_batch.py` +
`roster_auditor.py:242`: Sleeper's current age wins, the model's feature-season age is only the fallback
(fires on ONE scored row). 324 of 10,977 rows were a year young, 255 of the 468 valued. **Two halves:** the
roster audit row needs trunk pull + API restart (NO bundle rebuild — backend-only); the card, League Pulse's
age profile, team posture and the roster cut report only move at the next green refresh from trunk (09:00
chain). **Do NOT say it flips `vintage_changed` once — that flag is true EVERY morning by construction
(9 of 9 consecutive date pairs; `source_snapshot_captured_at` is hashed at
`model_forward_capture_driver.py:158`). Filed as DG-141. Verify DG-139 by COUNTING served ages, not by the flag.** Reviewed by 10 agents (3 lenses + 7 skeptics).

**⭐ DG-140 IS THE URGENT ONE — land it BEFORE the 09:00 chain.** The artifact's age DRIVERS
(`top_drivers`/`risk_flags`) are computed at the feature age in `pvo_assembler.py:226-240` and copied verbatim
by the batch, so **97 rows carry a cliff verdict that is false at the player's real age (46 rostered, Wilson
among them; 33 are past their cliff with NO `age_past_position_cliff` flag)**. This PREDATES DG-139 — those
sentences are false today; DG-139 removed the stale number that hid it. The card serves the artifact, so if
DG-140 lands before the rebuild the card goes coherent-and-false → coherent-and-true with no bad window.
**Circular-import trap: `roster_auditor` imports `served_age` FROM `universe_pvo_batch`, so importing
`audit_player` back will not work** — lift `CLIFF_AGES` + the banding (`roster_auditor.py:62,515-531`) or pass
signals in. The roster audit row is already correct (`:198,217` recomputes drivers from the live Sleeper row).

**Also corrected 09-02:** DG-102's board row said "todo" while the ticket and `dg-land.sh:100` have said done
since `10562f9` (08-31) — the frontend gate DOES run in dg-land. Board fixed.

**DG-130 still scoped, awaiting David's 4 decisions** (gate sentence wording; completeness cell on a blank row;
`dvs_pct` populate vs remove; order vs DG-139 — DG-139 is now moot, it landed).

**Tomorrow 09:10 ET duty:** read the 09:00 receipts before David's ~09:15 read — `daily_chain_latest_report.json`
step statuses, `pvo_refresh_latest_report.json` status + `capture_report.status` + raw_rows (~12,227), bands 468,
served≠Sleeper team 0, **and now served≠Sleeper age 324 → 0 — that count, never `vintage_changed`, is DG-139's proof**. No cron armed.

**Why:** the next session must not report DG-139 as live, must not re-file DG-140, and must not let the 09:00
rebuild ship 97 false cliff sentences. **How to apply:** check `git -C ~/dynasty-genius-product log -1` before
saying what is live; [[reference_trunk_frontend_bundle_is_a_manual_build]];
[[feedback_workflows_die_on_spend_limit]] — the first DG-139 review lost all 3 lenses (2 spend limit, 1 machine
sleep at 21:45:52) and the relaunch returned 10/10.
