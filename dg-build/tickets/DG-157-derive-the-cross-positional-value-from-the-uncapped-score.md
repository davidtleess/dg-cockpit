# DG-157 — Derive the cross-positional value from the UNCAPPED score, so seventeen players stop being priced at a ceiling

**Layer:** 3 · **State:** done · **Lane:** Davids-MacBook-Pro-69536 · **DG 3.0** · **model correctness / cross-positional · small**
**Source:** David's ruling, 2026-09-04 22:30:11Z (18:30 ET), verbatim and in full: *"take decision one now. then
build before week 1"* — answering a two-decision brief in which decision one is this and decision two is the
single-denominator rescale (a separate ticket). Measured and verified by Fred (`davidleess-eb [d4e70e]`).

**Problem:** `pvo_assembler.py` clamps the displayed score to 100 and then derives the cross-positional value
**from the clamped number**. For a player above his position's ceiling that value is not his — it is the ceiling's.
Seventeen players are priced that way today (TE 8, RB 5, WR 4), and each position's clamped players all share one
identical cross-positional value: TE 2.85, RB 58.05, WR 39.40.

**What it costs:** the cross-positional value is what the product uses to compare players ACROSS positions — trade
math, cut ordering, the opportunity map. Trey McBride and Colston Loveland are both priced at 2.85 although the
model separates them by 52% of a point per game. Largest corrections available (upper bounds, see below):
Puka Nacua +40.0, Trey McBride +38.9, Christian McCaffrey +21.6.

**The fix:** compute the cross-positional value from `dvs_raw` — the uncapped score — instead of the clamped one.
That restores exactly the identity the contract already documents: `(ppg − replacement_ppg) × 100 / P90[anchor]`,
in which the position ceiling cancels. Nothing else changes.

**Verified before filing, on the live artifact (`captured_at` 2026-09-04T18:00:04Z, 502 Engine-B scored):**
* **Zero of 502 displayed scores move** — by construction, not by measurement: the displayed score is set on one
  line and the cross-positional value derived from it on another; this edits only the second.
* **Exactly 17 cross-positional values change**, and nobody else's — for an unclamped player the raw and clamped
  scores are the same number.
* **No constant moves**, so both DG-092 identities hold and the 14 coupled-constant contract tests in
  `tests/contract/test_phase15_xvar.py` pass untouched. Run, not assumed.

⚠ **THE CONSEQUENCE THAT MUST BE FINDABLE LATER, because the cards look identical.** The cross-positional value is
also a RANK. **103 of 502 players change place** — the 17 whose value moves, plus **86 they leapfrog whose own
value does not change at all.** That rank (`xvar_percentile_overall`) is a sort key for the roster cut ordering, so
cut advice can shift for players whose card is byte-identical. **David has been told this in his own terms before
he ruled.** It is the fix working, not a defect, but nobody should rediscover it as a mystery.

**Anti-scope:** no constant moves — not `ENGINE_B_P90_PPG`, not `ENGINE_B_REPLACEMENT_DVS`, not
`XVAR_LAMBDA_ENGINE_B` (DG-092 guards it). No displayed-score change. No model retrain or promotion. Not the
single-denominator rescale, which is decision two and its own ticket.

**Not blocked by, and does not block, the surface work.** The three coupled pieces Bob holds (the prospect-card
invariance gate, the hard threshold at 80, the uncapped what-changed model section) are all triggered by a
DISPLAYED-SCORE change. This ticket moves no displayed score, so it lands safely alone; they are coupled to
decision two.

**Verify:** on the live artifact, 0 displayed scores differ; exactly 17 cross-positional values differ; the 14
coupled-constant contract tests pass; and a clamped player's new value equals the uncapped identity.

---

**LANDED main `f80e0309` 2026-09-04 18:5x ET (Fred, davidleess-eb d4e70e) — NOT live until the next trunk pull.** Gate 6973 passed / 33 skipped, frontend 94 files / 654 tests. 20 tests, 3 red first.

**Verified on the live artifact AFTER the change:** 0 displayed scores move; **17 cross-positional values corrected**; the corrected players now carry **16 distinct figures where they carried 3**. Largest corrections (upper bounds — availability is not in the artifact): Nacua `39.40 → 79.40`, McBride `2.85 → 41.67`, Smith-Njigba `39.40 → 62.50`, Chase `39.40 → 61.30`, McCaffrey `58.05 → 79.60`, Bowers `2.85 → 18.14`.

**Scope widened by one, deliberately.** The brief measured Engine B only. Engine A had a clamped player too (Jeremiyah Love, priced at its RB ceiling value 57.61), so `scoring/engine_a.py` now returns its pre-clamp score alongside the clamped one and both engines are corrected. Leaving one player at a ceiling while fixing seventeen would have been an inconsistency nobody could explain later.

**Rounding, stated because it is visible:** the uncapped score is rounded to 1 dp before the multiplier, exactly as the displayed score always has been, so corrected and uncorrected players stay on ONE basis. Consequence: Ferguson (9.910) and Loveland (9.908) still share a value — correct, they are that close. 7 distinct among the 8 TEs.

**Blend path unchanged and said so rather than left to be found:** it blends two already-clamped components, has no uncapped counterpart, and carries `dvs_clamped False` by construction. Zero live rows today.

⛔ **NO CONSTANT MOVED** — not `ENGINE_B_P90_PPG`, not `ENGINE_B_REPLACEMENT_DVS`, not `XVAR_LAMBDA_ENGINE_B`. The DG-092 family is untouched and its 14 contract tests pass unchanged. **That is the whole reason this landed alone, ahead of the rescale**, and it is why none of Bob's three coupled surface pieces trigger on it: the prospect-card invariance gate, the `> 80` counter-argument threshold and the uncapped what-changed model section are ALL driven by a DISPLAYED-score change, of which this has none.

⚠ **THE CONSEQUENCE THAT MUST STAY FINDABLE, because the cards look identical.** The cross-positional value is also a RANK. On the live artifact **103 of 502 players change place** — the 17 whose value moves, plus **86 they leapfrog whose own value does not change at all**. That rank (`xvar_percentile_overall`) sorts the roster cut ordering, so cut advice can shift for a player whose card is byte-identical. **David was told this in his own terms before he ruled** ("take decision one now", 18:30 ET).

**Next, and NOT this ticket:** decision two, the single-denominator rescale. Sequencing agreed directly with Bob — his three defensive pieces land FIRST and sit dormant on trunk, the rescale core lands LAST as the switch, and neither goes live until both are on `origin/main`.
