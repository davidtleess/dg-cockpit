---
name: project_state_2026-09-03_evening
description: "Evening of 2026-09-03 (Greg seat): DG-144 LANDED 505027b5 and DG-143 LANDED 22d904b0, NOT live — trunk 6f517027 now 8 behind; David: 'tomorrow is fine'. His 21:35 rulings: FA = league free agent (DG-145 rescoped, Bob), rookie marker (DG-146, Greg), land DG-143. Fred's DG-141 A/B with David. Run `date` before stamping a time."
metadata:
  type: project
---

**DG-144 — David's 06:22 ET ruling "plus or minus 20, remove it, one number per player" — LANDED `505027b5` on
`origin/main` at 23:26 ET, NOT LIVE.** Trunk `~/dynasty-genius-product` is at `6f517027`, **5 behind** (DG-142 ×2 +
DG-144 ×3). Live = pull → `cd frontend && npm run build` → API restart. His words: *"tomorrow is fine"* (19:26 ET) and *"land it
when the review is clean"* (19:42 ET). On-screen removal only: `dvs_band_low/high` stay on the PVO, the
artifact and both API models; the sigma-run guard stays armed. Retiring them is post-freeze and David's call.

**Facts the review corrected (5 lenses × 3 refuters, 92 agents):** the band width was EIGHT per-(position, engine)
constants, not four — 388 measured rows at 2×sigma_B (QB 44.8 / RB 45.6 / WR 40.0 / TE 47.2), 80 rookie-model rows at
2×sigma_A (QB 80.0 / RB 40.8 / WR 64.8 / TE 59.4); 0 blend rows. The blend caveat's "— the range around it is wider
for that" was struck (would render in a blend row's Details once DG-143's fill creates blend rows). Playwright smoke on
the built bundle: 25/25, roster shows nothing under the value.

**Consequence put to David in plain words ~23:28 ET, ANSWERED 23:35 (ruling 2 below):** on the roster ROW the range width was the only
visible cue separating a rookie-model number from a measured one (the number is not greyed by basis, his 09-01
ruling). After DG-144 they look identical in the table; the player card still says "Scored by …" in words. His 09-01
"a prior-dominated estimate must not render with the same authority" is unserved on the row unless he says the
09-03 ruling retires it.

**Team plan dispatched ~23:25 ET under David's "then plan a few hours of work and get the team going" (19:42 ET):**
- **Fred (`davidleess-eb [d4e70e]`) → DG-141 option (a)** — Q11/A verbatim: *"With respect to question 11, take the
  timestamp out."* Capture-driver change; Fred to state whether tomorrow's trunk pull goes before 09:00 or after 10:15.
- **Bob (`davidleess-08`) → DG-145** "Free agents show FA on the card" (David 05:59 ET: *"I think free agents should
  show 'FA' on the card."*), filed by Greg (dg-build `d3ac125`). **Assumption stated to David, unconfirmed:** "free
  agent" = NO NFL TEAM on Sleeper (Sleeper's own "FA"), not unrostered-in-his-league. Bob measures first.
- **Greg** = translator seat ([[david_ruling_greg_translator_2026-09-03]]).

**David's three answers, 23:35 ET (03:35:57Z), verbatim: "1) nobody in the league owns. 2) small marker indicating theyre a
rookie. 3) yes land it"** — (1) DG-145 RESCOPED: "FA" = league free agent (on no roster in his league), NOT
no-NFL-team; Bob's A/B measurement on NFL teams is moot, recorded unbuilt. (2) DG-146 filed (dg-build `07bd219`),
Greg builds: one word "Rookie" on the roster row keyed on `is_prospect`; number untouched. (3) **DG-143 LANDED
`22d904b0`** (Greg, via dg-land; pytest 6834/33 skipped; gate comment corrected `5426ffbd` to the audited market
figures) — NOT LIVE; trunk now **8 behind**.

**Fred's DG-141 A/B question is with David (put ~23:45 ET, unanswered as of this write):** A = clock fix alone (flag
still trips daily because each row also hashes Sleeper's whole player list, which changes daily — 6 of the last 8
quiet mornings flagged); B = also drop the Sleeper-list hash (one line + tests; flag then trips only on a real row
change). Fred recommends B and is holding the land for David's word. Either way the first morning after the pull
flips once (formula change) — expected.

**Still unowned from the morning rulings:** the tight-end rank (8 TEs pinned at 100; coupled constants; needs a
plain either/or for David before anything moves).

**⚠ Spend limit:** the account's subagent spend limit tripped ~20:15 ET mid-panel (4 verify agents died); *"resets
10pm America/New_York"* — reset by 22:00; workflows usable again after that. When it trips, verify decisive questions inline
([[feedback_workflows_die_on_spend_limit]]).

**Why:** the next session must not report DG-144 as live, must not re-land it, must not treat the FA reading as
confirmed, and must know Fred/Bob hold DG-141/DG-145. **How to apply:** `git -C ~/dynasty-genius-product log -1` and
`rev-list --count HEAD..origin/main` before saying what David sees ([[reference_trunk_frontend_bundle_is_a_manual_build]]).

**⚠ Lesson (Bob caught it, 23:38 ET):** every timestamp Greg wrote after 19:20 was ~2 hours early — the session
guessed the clock from the flow of work instead of running `date`. Commit times (`git log --date=format-local`)
were the source of the corrections. Run `date` before writing any "HH:MM ET" into a ticket, a board row, or a memory
([[feedback_check_when_not_just_what]]).

## Morning 2026-09-04, 07:30 ET (Greg) — what a session picking this up must know
- The DG-146 review panel stalled on the spend limit ("resets 4:10am"); the session sat until David typed
  "Continue" at ~07:2x. **It is MORNING. The 09:00–10:15 chain is the next event.**
- **DG-146** (rookie marker): `5f19ebdf` + review fixes `54532718`, gate 631 green, smoke 25/25 on the final tree;
  **landing via dg-land.sh started 07:30** — check `git log origin/main` for a DG-146 merge before claiming it landed.
  Panel corrections applied: `is_prospect` is DERIVED on the roster route (engine_path ∉ {ENGINE_B, BLEND_AB}) and only
  for league-drafted rookies (`in_current_draft`); the Players filter now says "Rookies" not "Prospects".
- **DG-147 filed** (dg-build `e7a2909`), unassigned: a 2026 rookie acquired off waivers/taxi gets no number and no
  word on the roster while his card scores him; 8 league-wide today, none on David's. In-season waiver risk.
- **The live switch is NOT done.** Trunk `6f517027`, 8+ behind. Fred measured the window: pull BEFORE the 09:00 chain
  or AFTER the 14:00 refresh, never between (two vintage pairs on one day → next morning's receipt refuses to compare).
  Greg asked David for "go" to do it at 08:30 (pull → `cd frontend && npm run build` → API restart, pid 50754 from
  09-03 05:30 → verify roster). **Not given as of 07:30.** If no go by 08:45 → next window after 14:00.
- **Fred (DG-141):** option (a) reviewed (54 agents), dry-run running, HELD for David's A/B; Fred's default (his own,
  and within David's Q11 ruling): land (a) alone by 08:15 if no answer, file B as follow-up. Fred's corrections: 5 of
  8 mornings (once xVAR counts), and B still flags a morning where rows really moved (09-03: 645 rows, the age fix).
  ⚠ Neither `ticket/DG-141` nor `ticket/DG-145` was on origin at 07:28 — unbacked work in `~/dg-wt`.
- **Bob (DG-145):** rescoped to LEAGUE free agents; his rule: backend `league_ownership {status, owner, as_of}` from the
  09:00 league snapshot, frontend mints "FA" once + prints the capture date; openapi regen required. Status unknown
  since 23:38. Bob's heads-up relayed to David: the top-scored free agents are TEs at 71–78 (the pinned-TE constant).

