# DG-141 — `vintage_changed` is true every morning by construction: a microsecond timestamp is hashed into `provenance_hash`, poisoning the PAIR while the semantic half still works

**Layer:** 2 · **State:** done · **Lane:** Davids-MacBook-Pro-69536 · **DG 3.0** · **capture provenance / signal integrity · small**
**Source:** measured by Fred (davidleess-45) 2026-09-02 ~22:30; the narrower framing below (the pair is
poisoned, the semantic half works) came out of Tower's counter-example and Fred's own correction of his first
wording — each session corrected the other, and neither claim here is one session's unchecked assertion. Filed while closing DG-134, after Tower asserted in two
tickets (DG-137, DG-139) and to David that a landing would produce "exactly ONE spurious `vintage_changed: true`".
Fred refuted the premise; **Tower reproduced the measurement independently before accepting it** and found the
mechanism. Both records agree.

**Problem:** the vintage is the PAIR `(semantic_output_hash, provenance_hash)` — `model_forward_capture_driver.py:588-593`
keys the prior-vintage lookup on both, `daily_diff.py:273-275` compares both. **`resolve_provenance_subset` hashes
`source_snapshot_captured_at` (`model_forward_capture_driver.py:158`), a microsecond-precision timestamp that is
different on every league run by construction.** So `provenance_hash` changes every morning no matter what, and
`vintage_changed` is therefore true every morning no matter what.

**Measured (Tower, own query, `app/data/model_forward_capture.db` read-only, last 10 capture dates):**
14 distinct `semantic_output_hash`, 12 distinct `provenance_hash`, 14 distinct vintage pairs, and **a new vintage
on 9 of 9 consecutive date pairs.** Fred's independent count matches exactly.

**The driver's own docstring is wrong about this.** `:138-142` says the subset "EXCLUDES git_sha / artifact_sha256
/ **dates** / row_lineage (those are kept out of the vintage hash)" — and `:158`, sixteen lines later, hashes a date.

**What the flag costs us today — stated narrowly, because the broad version is false:** it is the PAIR that is
poisoned, not the vintage machinery. `vintage_changed` carries no information ACROSS DAYS, so it cannot confirm
or deny that a landed change reached the artifact — which is exactly what a morning receipt is read for. The
semantic half is a working content signal and must not be changed (see the counter-example below). Two tickets
(DG-137, DG-139) put a "one-time flip" prediction in their landing notes on the strength of it; the prediction was
true in the trivial sense and misleading in the useful one.

**The store already contains the counter-example that shows the fix works.** On 2026-09-02 two captures share
`provenance_hash 9b8fd7bfae` (both read the 13:00Z league run) and differ in `semantic_output_hash`
(`d15b41b1a0` → `f87cb30e5b`) — that is DG-137's 14:50 rerun changing 142 team labels. **Within a day, with the
snapshot timestamp held constant, `semantic_output_hash` detected a real content change cleanly.** The semantic
half works; the provenance half is what is noisy.

**Fix shape (options, David decides):** (a) drop `source_snapshot_captured_at` from the hashed subset — it is a
date, which the docstring already says does not belong in a vintage, and the audit-only provenance block records it
outside the hash anyway (NOT `artifact_vintage`, which is the PVO's own build clock — panel correction 09-04); or (b) keep it and report the two halves separately, so a receipt can say "content unchanged,
provenance moved" instead of one uninformative boolean. (a) is smaller and matches the stated design; (b) preserves
the ability to notice a re-pointed snapshot. Either way `daily_diff`'s `vintage_changed_no_score_delta` status and
its consumers need re-reading, and the historical rows keep their recorded hashes — no backfill.

**Anti-scope:** do not backfill or recompute historical `provenance_hash` values; do not change
`semantic_output_hash`, which is working. Not a blocker for DG-134 or DG-139, both of which land independently.

**Verify:** with the fix, two captures of the same artifact on different days with unchanged inputs report
`vintage_changed: false`; the 09-02 same-day pair above still reports a change.

---

**LANDED main `ea067645` 2026-09-04 08:52 ET (Fred, davidleess-eb d4e70e) — NOT live until the next trunk pull.** Both halves, on David's two rulings: Q11 09-03 06:22 ET "take the timestamp out" (option a) and 09-04 08:11 ET "B" (the content half). Four commits; gate on the rebased tree 6872 passed / 32 skipped, frontend 93 files / 649 tests.

**What changed.** (a) `source_snapshot_captured_at` left `resolve_provenance_subset`, so the league run's clock no longer defines the provenance half. (B) `_semantic_projection` now strips `lineage.sleeper_snapshot_hash` — and ONLY that field — so Sleeper's daily player-list reshuffle no longer defines the content half. `governance_version` STAYS in the hash. Both lineage fields remain REQUIRED on a model-supported row and recorded in `provenance.row_lineage`; a row missing either still aborts before any write. No backfill; historical rows keep their hashes.

⛔ **The trap this ticket nearly shipped:** the first B commit (`a875a78d`) excluded the WHOLE `lineage` key, which also removed `governance_version` from the vintage — and `resolve_provenance_subset` excludes row lineage, so a governance bump would have been hashed by NOTHING and shipped as `vintage_changed: false`. Found by five independent review lenses at full vote, fixed in `d2f83530`. **A ruling names a field; do not widen it to the block that contains it.**

**Measured (read-only, live store + artifacts).** 70 capture dates 06-24..09-03; a new vintage pair on 52 of 69 consecutive pairs; the 17 unchanged pairs all predate the daily league run; **47 of 47 consecutive mornings new since it began 07-16**. Dynasty value score unchanged on 6 of the last 8 mornings (5 of 8 counting xVAR: 468 rows moved 08-28→29) while EVERY common row's `semantic_row_hash` changed. On the live 12,227-row artifact under the landed projection: swapping in the 09-02 Sleeper hash leaves `7780ec5ca61c` unchanged; bumping `governance_version` moves it to `9df33aa48de4`. On 09-02→09-03, 11,581 of 12,226 rows reconcile once the Sleeper hash is held constant; the other 645 differ in fields the store does not keep (its own columns moved by 3 `model_grade` + 1 `player_name`, 0 score, 0 xVAR) — consistent with DG-139's age landing that morning, but the 09-02 artifact needed to prove it field-by-field is not retained, so that attribution is **inference, not measurement**.

**Going live.** Pull only — the driver runs inside the chain's own process and the API serves the receipt from the artifact on disk. ⚠ **The pull must finish BEFORE the 09:00 chain or AFTER the 14:00 refresh**: the 11:30 and 14:00 `run_pvo_refresh` jobs pass `--capture-db-path` and capture again, so a mid-day pull puts two hash formulas on one date and the NEXT morning's receipt reads `model_multi_vintage_ambiguous` (09-03's receipt was exactly that, from 09-02's manual 14:50 rerun). Three captures a day normally yield ONE stored vintage — the later ones reproduce the pair and the store ignores the duplicate rows. **No manual PVO refresh after the pull on the pull day.** The first capture under the new formula reports one expected `vintage_changed: true`.

**Open, deliberately not in this ticket.** (1) The receipt's sentence for a trip still reads "rebuilt on a newer model run"; after B a trip can fire with every model artifact unchanged because a player's team or status moved — David's wording call, frontend lane. (2) `vintage_changed` asks "seen EVER", while §5 says "vs last captured"; the two coincided only while every morning's pair was unique by construction. The receipt is unaffected (`daily_diff` compares the two latest dates directly). Documented at the lookup site.

**Review.** Panel 1 on (a): 6 lenses / 54 agents, none died, 16 findings, 15 stood, none a code defect. Panel 2 on B: 5 lenses / 74 agents, **8 refuters died on API errors and were re-checked by hand rather than counted as refutations**, 23 findings, 11 stood — one of them the `governance_version` defect above.
