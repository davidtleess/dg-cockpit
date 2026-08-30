# DG-095 — Actions are still ranked by an xVAR scalar (Ruling 10 violation: taxi sort, cut_priority, partner payload)

**Layer:** 5  ·  **State:** dropped  ·  **Lane:** —  ·  **DG 3.0**  ·  **DROPPED 2026-08-29 late — David's frontend ruling**
**Source:** filed 2026-08-29 night on David's delegation ("u decide", gap-audit session); all sites re-verified on trunk that evening.

**Problem:** Ruling 10: a disclosed one-lane composite describing a PLAYER is legitimate; ranking ACTIONS by any scalar is not. Live today: taxi action cards ordered by raw xVAR; cut candidates tier-sorted by xVAR percentile and stamped with an ordinal `cut_priority`; and `partner_score` orders trade partners — the payload SEASON-BUILD-SPEC MR-9 calls "the ranked-action payload" on the very surface SR-17 was dropped over.

**How we know:** Read on trunk 2026-08-29: `src/dynasty_genius/league_opportunity_map.py:518-519` (`sort_value=raw_xvar`), ordered at :609, printed at :679; `roster_cut_engine.py:171-180` (`_tier_sort_key` on `xvar_percentile_overall`), :359 sort → :375 `cut_priority=rank`; `league_opportunity_map.py:219` (partner_score descending). Ruling text: MASTER plan :218-249 — "That is the actual violation." Spec: MR-9 (:1604 area) + PT-7 (:1637).

**Done looks like:** No surface orders actions by any scalar. xVAR stays on cards as player-describing evidence. BOTH sentinel semantics preserved: `cut_priority == 0` (forced-compliance under `_FORCED_REVIEW_STATUSES`, set at :297 — ILLEGAL_RESERVE / INVALID_SNAPSHOT; `league_opportunity_map.py:372` `hard_conflict` depends on it) AND `cut_priority == -1` (the exempt sentinels: taxi-exempt :267, ir-compliant-exempt :318). Only the ORDINAL ranks (1..N from the :359 sort) go — contract becomes 0 = forced, -1 = exempt, null = everything else (booleans are cleaner but touch more surface; flag the tradeoff at land time). Contracts regenerated; rewritten tests green.

**Depends on:** nothing (DG-086's percentile authority landed 08-29).

---

**Notes**
- DECIDED shape: (1) taxi cards keep `evidence.raw_xvar` (:507) but get a factual ordering (position-then-name or roster order); the :609 group-then-sort machinery stays, fed factual keys. The file's own "transparent sort_key" comment (:77-79) predates the ruling and does not save it. (2) Cut engine keeps candidate SELECTION (cuts_required is a hard Sleeper constraint) and drops candidate RANKING: no :359 desirability sort, no ordinal rank — `cut_priority` 0 for forced-compliance, null otherwise (minimal contract change; a `forced_compliance` boolean is cleaner but touches more surface — flag the tradeoff at land time). (3) `partner_score`: drop from the payload per MR-9.
- Blast radius (corrected after adversarial verification): `tests/test_phase21_roster_cut.py`'s cited asserts (:138, :290, :385, :408) all check `== 0` forced-compliance and SURVIVE unchanged under the preserved semantics (:574 is a constructor arg, also survives). Real breakage concentrates in `test_phase22_trade_reconciler.py:311` (ordinal `[0]`-indexing — rewrite to set-membership + forced flag), `test_phase17_league_opportunity_map.py:177-178` (sort asserts → factual keys), phase17_5 wiring :26, phase18 :38, `frontend/src/roster-capacity/RosterCapacitySandbox.tsx:161` (cut_priority column → forced/exempt/eligible marker) + its test, `DailyWhatChanged.tsx:855-863` (partner rankings section) + test :178-226, and types.gen.ts / zod.gen.ts regeneration (regen trap).
- Bigger than DG-094 — a solid day with the test rewrites. If it misses the freeze, it rides the first in-season correctness slot; a law violation does not soak well.

---

**DROPPED 2026-08-29 late night — DAVID'S RULING, verbatim (gap-audit session):** *"I don't care to persist the governance of language and caveats and lack of overall recommendation from the back end into the front end. I'd rather use layman's terms and call a spade a spade, and I've given it the green light to do so."* Ranked actions are now legitimate presentation under his word; the ordinal ranks and partner payload this ticket would have removed are exactly what a recommendation-forward frontend consumes. The sentinel documentation above (0 = forced, -1 = exempt, set at :297/:267/:318) stays useful as a map of the code. Revive only on David's word.
