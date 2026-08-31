# DG-118 — Extend the visual evidence gate to every surface it is supposed to protect

**Layer:** 6 · **State:** done (2026-08-30, LANDED on main as merge `89110a22`; commits 55a3c694 + ee95d9b4 + 63b7fe8c) · **Lane:** Davids-MacBook-Pro-63904 · **DG 3.0** · **frontend-only · DG-091 phase 2B WAVE 3 (last — it must gate the finished work)**
**Source:** the 2026-08-30 closeout audit.

**Problem:** `frontend/e2e/visual-smoke.spec.ts` visits only `?surface=what-changed`,
`?surface=asset-primitive-capture` and `?surface=accuracy-tracker` (lines 459, 499, 515, 552, 581,
603). **Every defect DG-116 and DG-117 fix lives on a surface the gate never visits** — Trade Lab's
unbuilt styling, Roster Audit's 185px sideways scroll, Model Trust's 665px. A gate that cannot see
the breakage it exists to prevent is decoration.

**Build:**
1. Visit EVERY nav surface at 1440 and 390: no horizontal page overflow, axe clean, screenshots
   archived. Wide tables scrolling inside their own container is correct and must not be flagged.
2. **State the gate's real coverage honestly.** It runs under
   `emulateMedia({reducedMotion:'reduce'})` (:113), so the default-motion path readers actually see
   has NO browser-level a11y coverage. Either cover both paths or say plainly in the spec's own
   comment which path is gated. **Never buy green by excluding a rule.**
3. **Use axe's COMPOSITED colors, not `getComputedStyle`.** They disagree — axe blends ancestor
   opacity and is right. A `getComputedStyle` scan reports 0 failures on surfaces where the
   composited scan finds 21 (`.dg-shell__parked-badge`, 2.89:1 at cumulative opacity 0.65).
4. **Guard against the FALSE RECEIPT:** scanning a surface whose backend is unavailable renders an
   error state with zero rows and reports a small clean violation count. The gate must FAIL on a
   surface that rendered no content rather than passing it as clean.

**Done:** every nav surface gated at both widths; the reduced-motion limitation stated in the spec;
composited-color checking; a content-presence assertion so an empty error state can never pass.
Coordinate with DG-102 (the land gate is pytest-only and blind to frontend breakage).

---

**Closeout (2026-08-30).** Landed as merge `89110a22`. Two blockers found by review and fixed in
`63b7fe8c` before the land:

1. **The branch could not land.** `dg-land.sh`'s whole gate is `pytest -q`, and pytest is the ONE
   gate in the repo that reads `frontend/e2e/visual-smoke.spec.ts` —
   `tests/contract/test_horizon2_browser_evidence_gate_red.py`. Four of its pins broke against the
   rewritten spec (measured: 4 failed / 6515 passed on the branch, 0 failed on main), one of them
   BECAUSE axe coverage went up (`.include("main")` was required and is now gone). **So the note in
   this ticket that the land gate is "blind to frontend breakage" was wrong**, and reasoning from it
   instead of measuring it is what hid the blocker. The contract is rewritten to pin behaviour rather
   than filename spellings, and it now carries the coverage lock and the fixture lock itself, because
   vitest does not run at land.
2. **A guard the spec claimed and did not have.** The header said guards 1-2 catch a fixture that
   rots against the generated Zod schema. On a SECONDARY read they do not: re-rotting the
   capture-health fixture leaves every surface green at both widths while the front page silently
   swaps the sentence about David's feeds — no error card, no rows lost, main text UP. Every fixture
   is now parsed against its endpoint's generated schema at module load and in the unit suite
   (`frontend/src/lib/__fixtures__/liveFixtureSchemas.ts`, `liveFixtures.test.js`).

Also fixed: the jsdom coverage lock matched the spec's comments, so a TODO naming a surface bought a
green lock; focus screenshots overwrote each other across widths; the trust-strip guard rejected only
alpha exactly 0, so `rgba(...,0.4)` passed.

**Final gate:** 23 passed, 4 consecutive full runs on the landed tree. pytest 6521 passed / 0 failed.
vitest 575 passed. tsc clean. biome 7 pre-existing warnings. 44 axe receipts, 0 violations.

**Still open, deliberately:** `npm run visual:smoke` is NOT wired into `dg-land.sh`; what runs at land
is the pytest coverage lock and fixture lock. And the gate measures the document and the DOM, never
the viewport — clipped content, occluded content and a container-absorbed overflow pass. Both are
written into the spec's own NOT COVERED section.
