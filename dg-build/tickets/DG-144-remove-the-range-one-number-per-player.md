# DG-144 — Remove the range: one number per player

**Layer:** 6 · **State:** doing · **Lane:** Davids-MacBook-Pro-54105 · **DG 3.0** · **product truth / presentation · small**
**Source:** David's ruling 2026-09-03 06:22 ET (Tower session `6f07a6c0`, message stamped 10:22:36Z), verbatim:
*"So then, plus or minus 20, remove it, one number per player."* Twenty-three minutes earlier (05:59 ET):
*"I don't see the point of a range if it's going to be 40 points. So either predict a number … Generally
speaking, I don't think the range is such a huge point."* **This supersedes the display half of his 2026-09-01
DG-128 ruling ("the band ships with the number").** Filed 2026-09-03 19:2x ET by Greg (`davidleess-eb [a78c76]`).

**Problem:** every scored player renders *"Likely range L to H"* under the roster score
(`frontend/src/roster/RosterAuditRow.tsx:84-88`) and as a fact on the player card
(`frontend/src/player/ValuationTwoLane.tsx:148-151`). The width is a per-position CONSTANT — 2 × `DVS_SIGMA_B`:
QB 44.8 / RB 45.6 / WR 40.0 / TE 47.2 — because the only per-player form (the blend) fires on 0 of 12,227 rows.
It describes the position's average model error, never the player, and David has ruled it off the screen.

**How we know:** `grep -rn 'likelyRange' frontend/src` → exactly two render sites (2026-09-03 19:20 ET, trunk
`6f517027`). Width measured 2026-09-03 by the review-verdict workflow: four distinct widths across 468 bands,
188 of them touching 0 or 100.

**Done looks like:** in the worktree, `npm run gate` green (typecheck · lint · vitest · banned-language · build);
`RosterAuditBand.test.jsx` and `ValuationBand.test.jsx` rewritten to assert that NO range renders for a measured,
a blended, and an unscored row — watched RED before the change; `grep -rn 'Likely range\|likelyRange' frontend/src`
returns nothing; the `data-basis` marker is untouched (09-01 ruling: the number is not greyed by its basis — still
in force). After trunk pull + `npm run build` + API restart, David's roster and every player card show one number
per player.

**Scope decision — the one that touches less:** on-screen removal only. `dvs_band_low` / `dvs_band_high` STAY on
the PVO, in the artifact, and on both API models. Reasons: no producer change the night before the freeze; zero
openapi regen (the contract does not move); DG-128's serving-time guard
`assert_band_sigma_runs_match_served_models()` stays armed — it pins the served model runs and is worth keeping
whether or not a band is drawn. Retiring the fields from the contract and the computation from the assembler is a
post-freeze follow-up and David's call: (b) drop from both API models + `npm run openapi-gen`; (c) drop the
computation and decide the guard's future separately.

**Anti-scope:** no change to the number, its basis marker, `dvs_pct`, or any caveat copy; no backend edit; no
hand-edit of `frontend/openapi.json`; nothing under `.oa3`.

**Depends on:** nothing. DG-143 (held on David's percentile ruling) is independent of this.

---

**Notes**
