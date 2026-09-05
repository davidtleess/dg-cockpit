# DG-151 — `vintage_changed` asks "have I ever seen this?", while the spec says "vs last captured"

**Layer:** 2 · **State:** open · **Lane:** — · **DG 3.0** · **capture provenance / signal integrity · small**
**Source:** found by Fred (`davidleess-eb [d4e70e]`) while landing DG-141 on 2026-09-04, surfaced by that
ticket's second review panel and confirmed by reading the code. Filed at Greg's request (`davidleess-eb
[a78c76]`, 08:5x ET): "cheap to write down now and expensive to rediscover". **Not a David ruling — nobody
has asked for this to change.** It is a latent discrepancy that DG-141 made reachable for the first time.

**The discrepancy.** `model_forward_capture_driver.py` sets the flag with a store-wide lookup:

```sql
SELECT 1 FROM model_forward_capture_raw
 WHERE semantic_output_hash=? AND provenance_hash=? LIMIT 1
```

— no `capture_date` bound. So `vintage_changed` means *"this pair has never been seen on any date"*. The
design spec §5 defines the same field as `vintage_changed` **(vs last captured)**. Those are different
questions, and until 2026-09-04 they could not disagree: the league run's microsecond clock (in
`provenance_hash`) and Sleeper's daily player-list hash (in `semantic_output_hash`) made every morning's
pair unique **by construction** — 47 of 47 consecutive mornings since 2026-07-16. DG-141 took both out of
the vintage, which is the point of it, and with them gone a pair CAN now repeat across non-adjacent dates.

**What it would look like.** A morning whose row content and model lineage exactly match some earlier day —
a reverted feature publish, a rolled-back model pointer, a bye-week-shaped return to a prior state — reports
`vintage_changed: false` even though yesterday's pair was different. The flag would read "nothing changed"
on a morning when something did change and then changed back.

**⚠ What is NOT affected, measured before filing:** the morning receipt David reads. `daily_diff.py`
`_build_model_section` does not consult this flag at all — it selects the two most recent capture dates,
reads each date's own pair out of the store, and compares them directly (`from_vintage != to_vintage`), so
its `baseline_holding` / `vintage_changed_no_score_delta` / `ok` verdict stays correct under a repeat. The
affected surface is the capture REPORT's own `vintage_changed` field and any future consumer that trusts
it as a day-over-day signal. `app/api/routes/league_what_changed_models.py:320` passes the diff engine's
value through, not the driver's.

**Fix shape (options, nobody has decided):** (a) bound the lookup to the prior capture date, matching the
spec's wording — smallest change, but it redefines a field that has meant "seen ever" since the brick
shipped, and the store is an append-only record others may read historically; (b) leave the behaviour and
correct the spec to say "seen ever", which is what it has always done; (c) report both, e.g.
`vintage_changed` (vs last captured) alongside `vintage_seen_before`. (b) is the cheapest honest answer if
nothing wants the day-over-day reading; (a) is right only if a consumer actually needs it — none does today.

**Anti-scope:** do not change `daily_diff`, which is already correct. Do not backfill. Do not touch the
DG-141 exclusions.

**Verify:** two captures on non-adjacent dates with identical content and lineage, with a DIFFERENT pair
captured between them; under (a) the later one reports `vintage_changed: true`, under (b) the spec text
matches the shipped `false`.

**Documented in code already:** DG-141 left an explanatory note at the lookup site
(`model_forward_capture_driver.py`, the `store + vintage_changed` block) so the next reader meets the
discrepancy rather than rediscovering it. That note is the only change DG-141 made here.
