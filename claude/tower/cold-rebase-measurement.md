# Cold rebase measurement — model-vs-market divergence, common-cohort re-rank

Independent measurement. Computed from the production artifacts and the production
source that builds them. No prior analysis, ledger, or validation document was read.

- Measured: 2026-07-26
- Repo: `/Users/davidleess/dynasty-genius-product`
- Working files: `/tmp/cold-rebase-70049/` (measure.py, rebase.py, sensitivity.py, accounting.py)

---

## 1. Artifacts and snapshot date

| Role | Path | Vintage |
|---|---|---|
| Divergence artifact (per-player model value, market value, both percentiles, signal) | `/Users/davidleess/dynasty-genius-product/app/data/valuation/universe_market_divergence_latest.json` | `captured_at` = 2026-07-26T13:40:00.907652+00:00 |
| Coverage rollup | `/Users/davidleess/dynasty-genius-product/app/data/valuation/universe_market_divergence_coverage_latest.json` | same build |
| Market source of record (FantasyCalc PIT capture) | `/Users/davidleess/dynasty-genius-product/app/data/fc_forward_capture.db`, table `fc_forward_capture_joinable` | `snapshot_date` = 2026-07-26, `source` = fc_native, `settings_hash` = e27351d720e9fcf0 |
| Refresh provenance | `/Users/davidleess/dynasty-genius-product/app/data/valuation_runtime/market_divergence_refresh_latest_report.json` | status ok, `fresh_fc_forward_capture`, retrieved_at 2026-07-26T13:00:00Z |

**Snapshot date used: 2026-07-26** (artifact field `market_snapshot_date` = "2026-07-26";
market rows read at that same snapshot_date).

Production source read:

- `/Users/davidleess/dynasty-genius-product/src/dynasty_genius/universe_market_divergence.py` — builds the artifact.
- `/Users/davidleess/dynasty-genius-product/src/dynasty_genius/services/market_overlay_service.py` — `pct_rank`, `NOISE_BAND`.
- `/Users/davidleess/dynasty-genius-product/scripts/run_market_divergence_refresh.py` — `_read_market_from_fc_pit()`, which is how the FC response is assembled from the DB.

I deliberately did **not** open `src/dynasty_genius/market_divergence_rebase.py` (name matched the
excluded pattern), nor `docs/agent-ledger/`, `docs/superpowers/`, `docs/validation/`.

---

## 2. How the two ranks are actually computed (from the code, not assumed)

`universe_market_divergence.py`:

- `_model_cohorts()` (L37-51) builds, **per position**, a list of `valuation.xvar` over every
  row in the PVO batch whose `engine_path` is in {ENGINE_A, ENGINE_B, BLEND_AB} **and**
  `valuation_status` in {MODEL_SUPPORTED, MODEL_UNCERTAIN} **and** xvar is not null.
  Market coverage is not a condition.
- `_market_lookup()` (L22-34) builds, **per position**, a list of FantasyCalc `value` over
  **every** FC entry with a position and a value. Model coverage is not a condition.
- L220-222: `model_percentile = round(pct_rank(model_cohort, xvar), 3)`,
  `market_percentile = round(pct_rank(market_cohort, market_value), 3)`,
  `delta = round(model_percentile - market_percentile, 3)`.
- `pct_rank` (market_overlay_service.py L46-53) is mid-rank: `(less + 0.5*equal) / n`,
  returning 0.5 when n < 2. The subject's own value is a member of its cohort.

So the ranks are position-scoped, and the defect is real as stated: for a given position the
two cohorts are different sets. Confirmed numerically in §3.

**Reproduction check:** I recomputed both percentiles and the delta from the raw inputs for
every row that carries them. **336 of 336 matched the stored values exactly** (all three
fields, to the stored 3-decimal precision). The as-produced side of this measurement is
therefore not an approximation — it is the production computation re-executed.

---

## 3. Populations and counts

Universe rows in the artifact: **12,202**.

FC market snapshot 2026-07-26: **475** entries, all with distinct sleeper_ids, all with a value.

Position-scoped populations actually used by production:

| Position | Model-side pop (ranks against) | Market-side pop (ranks against) | Common |
|---|---:|---:|---:|
| QB | 47 | 68 | 45 |
| RB | 111 | 109 | 88 |
| TE | 111 | 68 | 65 |
| WR | 199 | 154 | 138 |
| PICK | 0 | 76 | 0 |
| **Total** | **468** | **475** | **336** |

Player-level (distinct sleeper_id):

- Model side (model-backed valuation with a position and an xvar): **468**
- Market side (FC entry with position and value): **475**
- **Both (common cohort): 336**
- Model-only: **132**
- Market-only: **139** (of which **76 are draft PICKs**, which the model never values;
  the other 63 are real players the model does not model-back)

Reconciling accounting (all verified):

- 399 rows carry a `market_overlay` = the 475 FC entries minus the 76 PICKs that match no
  PVO row. Of those 399, **336** are model-backed and get percentiles; **63** are
  `UNAVAILABLE` / `model_status_unavailable`.
- Coverage file signal counts: gates_passed 186 + inside_band 150 = 336. Matches exactly.
- Zero rows in this snapshot are `gates_blocked`, so no percentile-bearing row is excluded
  by a gate.
- Position label never disagreed between the model row and the FC entry for any of the 336.

---

## 4. Inclusion rule (mine, stated explicitly)

**A player is "comparable" iff production emitted BOTH a model_percentile and a
market_percentile for them in this snapshot** — equivalently: identity resolved, a
model-backed valuation with a non-null xvar, and a FantasyCalc entry matched by sleeper_id
with a non-null value. That is exactly **336 players**.

Reasoning:

1. It is the set the product already puts a divergence number on. Anything narrower would
   measure a hypothetical; anything wider would invent divergences that do not exist today.
2. It is symmetric — it requires both sides — which is the whole point of the like-for-like
   question.
3. It falls out of the code rather than out of my judgement: it is the intersection of
   `_is_model_backed()` and `fc_by_sleeper` membership, and I verified the set of 336
   equals the model∩market sleeper-id intersection independently.
4. Draft PICKs are excluded automatically and correctly — they inflate the market side's
   position roster with a class the model does not value at all.

**Rebase scope:** I kept the re-rank **position-scoped**, because production's ranks are
position-scoped. Changing the scoping at the same time would confound the measurement.
A position-agnostic variant is reported in §7 as sensitivity only.

---

## 5. Noise band

- Value: **0.10** (i.e. 10 percentile points, since percentiles are 0-1 fractions).
- Rule: `INSIDE_BAND` iff `abs(delta) < 0.10`; strictly-less-than, so exactly 0.10 is
  out-of-band.
- Source locations:
  - `src/dynasty_genius/universe_market_divergence.py:13` — `NOISE_BAND = 0.10`, applied at
    `_signal_from_delta()` L94-99.
  - `src/dynasty_genius/services/market_overlay_service.py:20` — `NOISE_BAND: float = 0.10`
    (the same constant for the overlay service's `_classify_flag`, L56-60).
  - Echoed as data in `src/dynasty_genius/sleeper_universe.py:16`
    (`"divergence_noise_band": 0.10`) and surfaced in the artifact's own
    `defaults.divergence_noise_band` = 0.1.

Not assumed — read from the code, and confirmed by re-deriving the signal label from the
stored delta for all 336 rows with **0 mismatches** against the stored `signal`.

---

## 6. The measurement

All figures over the **336-player common cohort**, using production's 3-decimal rounding on
both sides so the two conditions are computed identically.

### Divergence as currently produced (§3 of the brief)

- Mean absolute divergence: **0.1460** (14.60 percentile points)
- Mean **signed** divergence: **+0.0785** — a systematic model-high tilt
- Out-of-band: **186** / 336; inside band: **150** / 336
  (MODEL_HIGH_MARKET_LOW 140, MODEL_LOW_MARKET_HIGH 46, INSIDE_BAND 150)

### Divergence rebased over the common cohort only (§4 of the brief)

- Mean absolute divergence: **0.1145** (11.45 percentile points)
- Mean **signed** divergence: **-0.0000** — exactly zero, as it must be when both sides are
  ranked over the identical population. The +0.0785 tilt above was an artefact of the
  population mismatch, not a real model-vs-market disagreement.
- Out-of-band: **163** / 336; inside band: **173** / 336
  (MODEL_HIGH_MARKET_LOW 86, MODEL_LOW_MARKET_HIGH 77, INSIDE_BAND 173)

### Headline figures (§5 of the brief)

| Figure | Value |
|---|---|
| Players compared | **336** |
| **Mean absolute change in divergence** | **0.10716** = **10.72 percentile points** |
| Median absolute change | 0.095 (9.5 pts) |
| Max absolute change | 0.312 (31.2 pts) |
| **Players changing noise-band classification (in-band ↔ out-of-band)** | **131 of 336 (39.0%)** |
| — out-of-band → inside band | 77 |
| — inside band → out-of-band | 54 |
| — unchanged (OUT→OUT) | 109 |
| — unchanged (IN→IN) | 96 |
| Players changing **full signal label** (incl. direction flips) | **133 of 336 (39.6%)** |
| — of which sign flips while staying out-of-band | 2 |

Per position (n, band-reclassified):

| Position | n | reclassified | % |
|---|---:|---:|---:|
| QB | 45 | 21 | 46.7% |
| RB | 88 | 13 | 14.8% |
| TE | 65 | 30 | 46.2% |
| WR | 138 | 67 | 48.6% |
| **All** | **336** | **131** | **39.0%** |

RB is the least affected — and RB is the position where the two populations are closest in
size (111 vs 109). TE, where the model ranks against 111 but the market against 68, is the
most distorted per player: the largest individual changes are all TEs (Jackson Hawes
+0.451 → +0.139; Mitchell Evans +0.431 → +0.123; Daniel Bellinger +0.418 → +0.108).

---

## 7. Sensitivity checks

- **Rounding.** Recomputing both conditions unrounded (no 3-decimal round anywhere) gives
  mean absolute change 0.10714 and **132** reclassified instead of 131 — a single player
  sits on the boundary. The 131 figure is the production-faithful one.
- **Fragility.** 54 of the 336 as-produced deltas sit within 0.02 of the 0.10 band edge, so
  the classification is intrinsically sensitive near the threshold. This is a property of
  the current output, not of the rebase.
- **Alternative rebase scoping.** Re-ranking position-agnostically over all 336 gives mean
  absolute change 0.1195 and **155** reclassified. Reported for contrast only; the
  position-scoped 131 is the like-for-like answer, since production ranks within position.

---

## 8. Could NOT establish — marked UNVERIFIED

- **UNVERIFIED:** whether other snapshots show the same magnitude. I measured the single
  most recent snapshot (2026-07-26) only. There is a `market_divergence_history.db` with
  12,202 upserted rows for this run; I did not run a time series.
- **UNVERIFIED:** whether any downstream consumer (frontend, trade lab, league opportunity
  artifacts) re-derives divergence differently or re-bands it. I traced only the producer.
- **UNVERIFIED:** the content and intent of `src/dynasty_genius/market_divergence_rebase.py`.
  It exists in production source and its name suggests it may already address this, but the
  measurement instructions excluded files matching `*rebase*`, so I did not read it. This is
  the single largest gap in this report — someone should confirm whether that module is live
  in the path that produces `universe_market_divergence_latest.json`. My reproduction check
  (336/336 exact from `universe_market_divergence.py` logic alone) is strong evidence it is
  **not** applied to this artifact, but I did not verify that directly.
- **UNVERIFIED:** whether the 63 market-covered-but-not-model-backed players and the 132
  model-backed-but-market-uncovered players *should* be comparable. I treated them as out of
  scope by the stated inclusion rule; whether the model or the market has the coverage gap
  wrong is a separate question this measurement does not address.
- **Not a defect claim.** This measures what changes under a common-cohort re-rank. It does
  not establish that the rebased number is the *correct* one — only that the current
  comparison is not like-for-like and that the difference is large.

---

## 9. One-line answer

On the 2026-07-26 snapshot, over the **336** players the model and the market both cover,
re-ranking both sides over that common cohort moves divergence by a mean of **10.72
percentile points** and flips the noise-band classification for **131 of 336 players
(39.0%)**; the as-produced comparison also carries a **+7.85-point systematic model-high
tilt** that vanishes entirely (to -0.0000) once the populations are matched.
