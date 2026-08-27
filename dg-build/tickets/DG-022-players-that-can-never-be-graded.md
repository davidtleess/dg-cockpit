# DG-022 — Players with no canonical id can never be graded, and nothing says so

**Layer:** 2  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG022-20260825  ·  **DG 3.0**
**Source:** crew lane, 2026-08-18; carried forward by the judge seat as real and separate

**Problem:** A player can be present in the market data, present on a roster, and carry
`dg_player_id: None` in the served artifact. He joins to nothing, so the realized-outcome scorer can
never score him — not this week, not ever. Tank Dell (sleeper_id 9502) is the named case.

**How we know:** he appears in `fc_forward_capture_joinable` at `snapshot_date=2026-08-18`; a query
for him in `model_forward_capture_joinable` returns empty.

**Done looks like:** the count of never-gradable players is known, visible, and shrinking — and a
player in that state is not presented as if he were being tracked.

**Depends on:** the identity work at layer 2. This is a symptom of it, not a separate bug.

---

**Notes**
The scorer's own accounting is honest — orphans are recorded with a reason rather than dropped. The
gap is that nothing surfaces the consequence to David.

---

**CLOSED 2026-08-25, lane ClaudeFable5-DG022-20260825. Landed as merge `20807368` on
`origin/main` through `dg-land.sh` unaided (gate: full suite green after rebase onto
`c2b11f0a`; pre-land local run 6,087 passed / 0 failed / zero collection errors).**

**What landed is the 08-19 WIP (origin/ticket/DG-022 @ `86e9d218`, CodexTeam20260819 lane),
resumed by its own SESSION_CLOSE_HANDOFF and finished.** The ticket's original premise had
already been refined by that lane: exclusion is a ROUTE fact, not an identity defect. The
product now serves a typed `frozen_prediction` lane on player detail — status/basis against
David's declared 2026-08-05 frozen capture (`app/config/realized_outcome_frozen_predictions.json`
+ read-only capture DB), `decision_supported: false` hardwired, fail-closed on every
contradiction. Tank Dell (9502): `not_in_frozen_prediction_cohort` / `non_model_route_at_freeze`
— he is no longer presented as if he were being tracked, and the card says how many current
rostered skill players ARE in the cohort (live at QA time: 218 of 272, a dated observation).

**Resume steps executed:** worktree recreated on current main (proven procedure); cherry-pick;
ledger add/add kept trunk canonical; the four generated OpenAPI seams REGENERATED never
hand-merged (`openapi.json`/`types.gen.ts`/`zod.gen.ts` byte-identical; `index.ts` regen
restored main's Coverage/ModelScoreboard/BackupHealth types the WIP's side predated — the
regen-trap failure mode, caught by the regen). Analysis: 6-agent fan-out incl. two adversarial
refuters, one of which executed the merge composition in a scratch tree (zero merge-added
failures) and re-proved the frozen store byte-for-byte.

**Four fixes the WIP could not have known (each measured before fixed):** duplicate
"2026 model evaluation" region landmark from the compact inspector variant (axe, real surface;
TDD fix — compact is no landmark, card's is pinned); hermetic third seam missing in BOTH
DG-021's API tests and the WIP's own main-app surface3 test (silent production-DB reads,
disclosed patches); unclosed read-only sqlite handle (contextlib.closing); unpinned reachable
classifier arm captured+null-projection (pinned).

**Real-surface QA — the gate the WIP was blocked on — PASSED:** live app on the rebased tree,
system Chrome, desktop+mobile+mid-scroll captures, component-scoped axe `[]`, spec derives
coverage text from the live API (card == API). Endpoint ~130ms/request incl. the coverage join
— measured, acceptable. Whole-page gates found three PRE-EXISTING base defects (two axe
violations + 390px overflow to 776px), proven independent by hiding every DG-022 element:
**filed as DG-043** (the landed ledger's "DG-042" reference predates the ID collision with the
parallel session's PPG ticket). Evidence: `dg-build/preserved/2026-08-25-dg022-qa/`.

**Deployment note:** serving-surface change only — no producer touches this. Goes live when the
trunk pulls (post-window 08-26, with DG-041 + the parallel session's DG-042) and whatever serves
the API next restarts. "Known, visible, and shrinking": known and visible are DONE (the coverage
counts on every card); "shrinking" is the identity work this ticket was always a symptom of —
still layer-2 scope, not claimed here.
