# DG-141 — `vintage_changed` is true every morning by construction: a microsecond timestamp is hashed into `provenance_hash`, poisoning the PAIR while the semantic half still works

**Layer:** 2 · **State:** open · **Lane:** unclaimed · **DG 3.0** · **capture provenance / signal integrity · small**
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
date, which the docstring already says does not belong in a vintage, and `artifact_vintage` records it outside the
hash anyway; or (b) keep it and report the two halves separately, so a receipt can say "content unchanged,
provenance moved" instead of one uninformative boolean. (a) is smaller and matches the stated design; (b) preserves
the ability to notice a re-pointed snapshot. Either way `daily_diff`'s `vintage_changed_no_score_delta` status and
its consumers need re-reading, and the historical rows keep their recorded hashes — no backfill.

**Anti-scope:** do not backfill or recompute historical `provenance_hash` values; do not change
`semantic_output_hash`, which is working. Not a blocker for DG-134 or DG-139, both of which land independently.

**Verify:** with the fix, two captures of the same artifact on different days with unchanged inputs report
`vintage_changed: false`; the 09-02 same-day pair above still reports a change.
