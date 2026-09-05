# DG-144 — Remove the range: one number per player

**Layer:** 6 · **State:** done · **Lane:** Davids-MacBook-Pro-54105 · **DG 3.0** · **product truth / presentation · small**
**Source:** David's ruling 2026-09-03 06:22 ET (Tower session `6f07a6c0`, message stamped 10:22:36Z), verbatim:
*"So then, plus or minus 20, remove it, one number per player."* Twenty-three minutes earlier (05:59 ET):
*"I don't see the point of a range if it's going to be 40 points. So either predict a number … Generally
speaking, I don't think the range is such a huge point."* **This supersedes the display half of his 2026-09-01
DG-128 ruling ("the band ships with the number").** Filed 2026-09-03 19:2x ET by Greg (`davidleess-eb [a78c76]`).

**Problem:** every scored player renders *"Likely range L to H"* under the roster score
(`frontend/src/roster/RosterAuditRow.tsx:84-88`) and as a fact on the player card
(`frontend/src/player/ValuationTwoLane.tsx:148-151`). The width is a per-position, per-basis CONSTANT — two sigma
of whichever engine produced the number: the 388 measured rows carry 2 × `DVS_SIGMA_B` (QB 44.8 / RB 45.6 / WR 40.0 /
TE 47.2) and the 80 rookie-model rows 2 × `DVS_SIGMA_A` (QB 80.0 / RB 40.8 / WR 64.8 / TE 59.4) — because the only
per-player form (the blend) fires on 0 of 12,227 rows. It describes that engine's average model error at that
position, never the player, and David has ruled it off the screen. *(Corrected 09-03 23:2x ET on the review panel's finding: the
first filing said "four distinct widths"; there are eight, four per engine. Conclusion unchanged.)*

**How we know:** `grep -rn 'likelyRange' frontend/src` → exactly two render sites (2026-09-03 19:20 ET, trunk
`6f517027`). Widths re-measured 2026-09-03 23:2x ET on the served artifact (`universe_pvo_runtime.json`, captured
18:00:02Z): 468 bands = 388 `dvs_engine=B` at four widths + 80 `dvs_engine=A` at four wider ones; 188 touch 0 or 100;
0 blend rows.

**Done looks like:** in the worktree, `npm run gate` green (typecheck · lint · vitest · banned-language · build);
`RosterAuditBand.test.jsx` and `ValuationBand.test.jsx` rewritten to assert that NO range renders for a measured,
a blended, and an unscored row — watched RED before the change; `grep -rn 'Likely range\|likelyRange\|dg-roster__band'
frontend/src` returns only the test's own `querySelector(".dg-roster__band")` absence assertions; the `data-basis` marker is untouched (09-01 ruling: the number is not greyed by its basis — still
in force). After trunk pull + `npm run build` + API restart, David's roster and every player card show one number
per player.

**Scope decision — the one that touches less:** on-screen removal only. `dvs_band_low` / `dvs_band_high` STAY on
the PVO, in the artifact, and on both API models. Reasons: no producer change the night before the freeze; zero
openapi regen (the contract does not move); DG-128's serving-time guard
`assert_band_sigma_runs_match_served_models()` stays armed — it pins the served model runs and is worth keeping
whether or not a band is drawn. Retiring the fields from the contract and the computation from the assembler is a
post-freeze follow-up and David's call: (b) drop from both API models + `npm run openapi-gen`; (c) drop the
computation and decide the guard's future separately.

**Anti-scope:** no change to the number, its basis marker, or `dvs_pct`; no backend edit; no
hand-edit of `frontend/openapi.json`; nothing under `.oa3`.

**Depends on:** nothing. DG-143 (held on David's percentile ruling) is independent of this.

---

**Notes**

**Build, 2026-09-03 19:16–19:25 ET (Greg).** Worktree cut from origin/main `1812a5c8` (dg-work.sh took local main
`6f517027`; reset to origin/main first). TDD: the two band tests renamed `*Band` → `*OneNumber` and rewritten;
`npx vitest run` on them BEFORE any source change: **4 failed | 1 passed** (the unscored-row case never had a range).
Then `7aced050`: range span off `RosterAuditRow.tsx`, range fact off `ValuationTwoLane.tsx`, label pair +
`likelyRange()` out of `copy.ts`, dead `.dg-roster__band` rule out of `RosterAudit.css`. `npm run gate` GREEN
(tsc · biome 0 errors / 7 pre-existing warnings · vitest 90 files 629 passed · banned-language · vite build).
`dg-land.sh DG-144 --dry-run` 19:4x: pytest **6830 passed / 32 skipped**, frontend gate green, merge builds, push
accepted in rehearsal.

**Review, ~19:50–20:15 ET — 5 lenses × 3 refuters, 92 agents (honesty · correctness · completeness · protocol ·
built bundle).** 29 findings, 21 survived, 8 refuted. ⚠ The three refuters on the built-bundle lens died on the
account spend limit (tripped during the panel; reset at 22:00 ET); its decisive items were verified inline by Greg instead: the fresh
`dist/assets/index-*.js` contains 0 × "Likely range", 0 × "dg-roster__band", 1 × "Dynasty value". Fixed in
`b3cb7c34`:
- **The blend caveat still promised a range.** `engine_ab_blend_low_sample:games=N` ended "— the range around it
  is wider for that" and renders in a blend row's Details; now ends at the pedigree. `copy.test.ts` pins it and
  forbids /range/ (RED first: 1 failed | 13 passed). Today 0 blend rows serve; DG-143's fill would create them.
- **The width claim was wrong** (see the corrected Problem text above) in this ticket and two comments.
- Stale DG-128 comment above `.dg-roster__score`; an inaccurate fallback description in `copy.ts`; two comments
  that quoted the retired label and made the acceptance grep non-empty.

**Consequences the panel named that the first filing did not — recorded, not fixed:**
1. **On the roster ROW, the range width was the only visible measured-vs-rookie-model cue** (the number is not
   greyed by basis, his 09-01 ruling; the row prints no basis word). After DG-144 a rookie-model number and a
   measured number look identical in the table. The player card still says it in words ("Scored by": rookie
   model / active-player model / a blend), and the row's Details caveat says it for blends. David's 09-01
   sentence "a prior-dominated estimate must not render with the same authority as a measured one" is therefore
   unserved on the roster row unless he says his 09-03 ruling retires it too — **put to him in plain words by
   Greg 09-03 evening.**
2. The armed sigma-run guard (`assert_band_sigma_runs_match_served_models`, first statement of the batch build)
   now defends a band nobody sees and can still refuse the entire 09:30 refresh with a reason string that names
   the band. Pre-existing; part of the post-freeze retirement decision above.
3. Nine backend/test docstrings (`dvs_band.py`, `player_value_object.py`, `roster_audit_models.py`, `players.py`,
   `universe_pvo_batch.py`, the five `test_dg128_*` files) and DG-128's ticket still describe a range on screen.
   DG-128 carries a dated pointer to this ticket as of tonight; the docstrings go with the field retirement.
4. The player-card removal is proven in jsdom only: the Playwright smoke gates the five destinations and never
   opens a player card. The roster page IS covered in a real browser: the built-bundle lens ran `npm run
   visual:smoke` on `7aced050`'s fresh build → **25 passed / 0 failed**; the roster screenshots (desktop, mobile,
   expanded) show the three fixture rows that carry a band with nothing under the value; all four roster axe
   receipts unchanged (0 violations); no preview/playwright process left behind; nothing on :8000 touched.
5. **What David sees today is unchanged until pull → `npm run build` → restart:** the served bundle
   `index-C6XzDCYI.js` (built 09-02 21:33) still prints the range on 24 of 27 roster rows. His word 09-03 evening:
   *"tomorrow is fine."*

**LANDED 2026-09-03 23:26 ET — merge `505027b5` on `origin/main`** (`dg-land.sh DG-144`: rebase clean; pytest 6830
passed / 32 skipped; frontend gate 629/629 + build; merge + push; worktree and branch removed). **NOT LIVE:** trunk
`~/dynasty-genius-product` stays at `6f517027`, now 5 behind origin/main (DG-142 ×2 + DG-144 ×3). Going live is
pull → `cd frontend && npm run build` → API restart, on David's word: *"tomorrow is fine"* (09-03 19:26 ET) and
*"land it when the review is clean"* (19:42 ET).

