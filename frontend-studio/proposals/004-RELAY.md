# 004 RELAY — Movement significance on the daily tape

From Studio. Verified against the live app and `app/data/fc_forward_capture.db` on 2026-07-21.
Every item ends with the same ask: **confirm, fix, or refute with a concrete technical reason.**

## Summary

| ID | Summary | Severity |
|---|---|---|
| N0 | Model-market divergence is systematic by position | High |
| N1 | Movement ranked by dollars ranks by cheapness | High |
| N2 | FantasyCalc `displayTrend` fetched daily, then discarded | High |
| N3 | Masthead move count treats all fluctuation as news | Medium |
| N4 | Per-row sparklines auto-scale away comparability | Medium |
| N5 | `maybeTradeFrequency` / `maybeRosterPercent` discarded at capture | Medium |
| N6 | Movement-history card contradicts sparklines on same screen | Low |

---

## N0 — Model-market divergence is systematic by position, not player-specific — High

**Repro:** `app/data/market_divergence_history.db`, table `market_divergence_history`, capture date
2026-07-21. Take every row whose `divergence.model_percentile` and `divergence.market_percentile`
are both non-null (299 players once joined to a full 28-day price series) and group
`model_minus_market_delta` by position.

**Observed:**

| Position | n | Median (model − market) percentile | We ≥5 higher | Market ≥5 higher |
|---|---|---|---|---|
| TE | 54 | **+13.6** | 37 | 5 |
| WR | 122 | +8.5 | 67 | 11 |
| RB | 79 | +2.5 | 31 | 22 |
| QB | 44 | **−10.8** | 8 | 27 |

The QB distribution is one-sided: of 44 QBs, the ten largest gaps run −40 to −22, and only 13 sit
above zero at all. TEs mirror it — 37 of 54 above the market, the top of the distribution running
+57, +55, +43, +37.

**Expected:** If the model and the market disagree, I would expect the disagreement to be
distributed across players rather than to load onto two positions in opposite directions.

**Hypothesis, offered for you to confirm or kill — I cannot check it from where I sit.** The league
is 12-team Superflex; the FantasyCalc pull is parameterised `numQbs=2`, so the market side is
superflex-priced and QB scarcity is baked into it. If the model's percentile (or the xVAR
replacement baseline underneath it) is computed against a single-QB replacement level, QBs would be
systematically understated and every other position correspondingly overstated — which is the exact
shape above. The TE skew would have the same explanation if TE-premium settings enter one side and
not the other.

**User cost:** This determines whether the whole model-vs-market comparison is usable. If the skew is
a scaling artifact, then a large fraction of the divergences the app surfaces are measuring league
settings rather than analytical disagreement, and reading them as edges is a mistake. If it is
genuine, it is the single most valuable thing the model currently says and should be surfaced
deliberately rather than left to be discovered player by player.

This is the highest-value item in this brief. Confirm, fix, or refute with a concrete technical
reason.

---

## N1 — Movement ranked by dollar delta is, in practice, ranked by cheapness — High

**Repro:** `http://127.0.0.1:8000/?surface=daily-what-changed`. Read the "Your roster" and "Around
the league" lists under Market movement. Both are ordered by absolute value delta.

**Observed:** On 2026-07-21 the roster list leads with Jaxson Dart (−113) and places Omar Cooper
(−47) ninth. Around the league, Josh Cameron (**+292.9%**) ranks 9th, below Josh Allen (**+1.3%**);
both moved ~$125.

**Expected:** Ordering that reflects how unusual a move is for the player who made it.

**Measurement** (n=404 players with a complete 28-day series in `fc_forward_capture_joinable`;
"normal day" = median absolute daily % change × 1.4826):

- Median daily dispersion by price band: **21.00%** under $200; 10.15% $200–750; 1.51% $750–2k;
  1.26% $2k–5k; **0.74%** over $5k. Spearman(log value, dispersion) = **−0.709**.
- Dispersion is a stable player property: split-half Spearman (days 1–13 vs. 14–27) = **0.913**.
- Ranking by dollars vs. ranking by multiple-of-own-normal-day, over 14 consecutive days: mean top-10
  overlap **3.6/10**, mean top-25 overlap **11.5/25**, and the #1 item differed on **13 of 14 days**.
- Percent-ranking fails in the opposite direction: it promotes sub-$350 players whose moves are, for
  them, average (Kareem Hunt, −33.8%, is a **1.0×** day).
- Normalizing does **not** promote immaterial moves: the median dollar value of a 3× move is ~$71
  (<$200), ~$101 ($200–750), ~$59 ($750–2k), ~$122 (>$2k) — a ~2× spread against a 28× spread in
  percent volatility.

**User cost:** On 2026-07-21 the single most unusual move on the user's roster — Cooper's largest
single-day move in the entire capture — is rendered ninth, in identical weight to eight moves that
are ordinary for the players who made them.

Confirm, fix, or refute with a concrete technical reason.

---

## N2 — `displayTrend` is fetched from FantasyCalc every morning and discarded — High

**Repro:**
```
curl -s "https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=2&numTeams=12&ppr=1"
```
Then: `sqlite3 app/data/fc_forward_capture.db "pragma table_info(fc_forward_capture_joinable)"`.

**Observed:** The source response carries `displayTrend` per player — **true for 26 of 463 players
(5.6%)** as of 2026-07-21. It also carries `maybeMovingStandardDeviation`,
`maybeMovingStandardDeviationPerc`, and `maybeMovingStandardDeviationAdjusted` (the last populated
for 169/463, and it widens as value falls: 2 for the top ~25, rising to 5 at rank 125+). The capture
schema retains `market_volatility` / `market_volatility_status` only — `market_volatility` is
populated on 2,026 of 12,943 rows (~16%), and `displayTrend` is not retained at all. The UI renders
trend/delta for every player.

**Expected:** Either the field is retained and available to the surface, or there is a stated reason
it is dropped.

**User cost:** The vendor's own answer to "is this trend worth showing?" is available at zero
marginal cost — it is already in the response body being parsed — and the surface shows all 463
moves undifferentiated instead.

Note: this is an observation about the payload and the schema. I am not assuming the omission is
accidental; if it is deliberate, the reason is useful to me and changes what I would propose.

Confirm, fix, or refute with a concrete technical reason.

---

## N3 — The masthead move count treats every fluctuation as news — Medium

**Repro:** Same URL. Read the masthead figure: **"Moves on the tape — 52 — market and model changes
since the prior snapshot."**

**Observed:** On 2026-07-21 the model region reads "Projections held steady — no player movement on
this tape," so the entire count is market fluctuation. Across the 27 comparison days in the capture,
**~100% of players change value every day** (lowest single day: 95.7%; zero flat days). The median
player's move on 2026-07-21 was **1.05×** his own normal day.

**Expected:** A hero figure that varies with whether anything happened. A count of moves cannot,
because the count is approximately constant by construction.

**User cost:** The number that anchors the screen carries no information, and on a quiet off-season
morning it implies 52 things need attention when the honest read is one or two. Precedent for the
alternative: Amplitude states "if no orange dots are present, all data points are within the
confidence interval"; Oura's Symptom Radar ships an explicit *No signs* state and surfaces
contributing metrics only when signs exist.

Confirm, fix, or refute with a concrete technical reason.

---

## N4 — Per-row sparklines are independently auto-scaled, so rows cannot be compared — Medium

**Repro:** Same URL. Compare the sparklines for Pat Bryant (row 8) and Omar Cooper (row 9).

**Observed:** Both render as full-height traces of similar visual amplitude. Their underlying daily
dispersions differ by ~11× (Bryant ±6.77% a normal day; Cooper ±0.62%). Cooper's series is a
monotone month-long decline from 2,430 to 2,047; Bryant's is high-frequency chop. The rendering does
not distinguish them.

**Expected:** Either a shared scale across rows, or an encoding that carries dispersion rather than
normalizing it away.

**User cost:** The one chart per row that could answer "is this normal for him?" is the element that
destroys that information.

Confirm, fix, or refute with a concrete technical reason.

---

## N5 — `maybeTradeFrequency` and `maybeRosterPercent` are discarded at the capture boundary — Medium

**Repro:** Same two commands as N2.

**Observed:** Both fields are present in the source response and populated for **399 of 463**
players. Neither appears in the capture schema.

**Expected:** Retained, or a stated reason for dropping them.

**User cost:** Trade frequency is the liquidity signal that separates a genuine re-price from a
thin-market artifact — the direct analogue of relative volume in the finance tooling that solved
this problem. Without it, a move on a rarely-traded player and a move on a heavily-traded one are
indistinguishable on the surface.

Confirm, fix, or refute with a concrete technical reason.

---

## N6 — The Movement history card contradicts the sparklines beside it — Low

**Repro:** Same URL. Read the "Movement history" card in the right rail against the sparkline column
in the same viewport. Screenshot: `assets/004-noise-floor/live-01-default.png`.

**Observed:** The card reads *"Series pending. History accrues one verified capture per day; the
line begins once enough days are on the books."* The context rail on the same screen reads *"Market
Sync Active: 28 consecutive days tracked,"* and every roster row is already drawing a 28-point
series.

**Expected:** One statement about whether history exists.

**User cost:** Minor, but it is the surface that carries the app's data-provenance credibility, and
it is visibly wrong next to the data it says is missing.

Confirm, fix, or refute with a concrete technical reason.

---

## Known limits of the method proposed in N1

Stated so they are not discovered as objections:

- **28 days is short.** The baseline is provisional and firms up daily.
- **Masking:** a player's first genuine jump inflates his own baseline for the following month, so a
  second real move scores lower than it should. MAD (breakdown 0.5) reduces this against standard
  deviation (~0) but does not remove it.
- **Ghost effect:** with a flat equal-weighted window a shock exits abruptly on day N+1, stepping the
  baseline with no change in the underlying process. EWMA or Rousseeuw–Croux Qn are the known
  remedies; neither is worth it on 28 days.
- **MAD degeneracy:** if more than half the window is tied, MAD = 0 and everything flags. Not
  occurring today (0 of 404; worst case 8 tied days of 27). The correct guard is an explicit "no
  usable baseline" hold-out state, **not** a denominator floor — a floor is common practice but has
  no basis in the robust-statistics literature.
- **The 2×/3× thresholds are borrowed from retail-finance convention, not derived from this
  dataset.** They yield 42 players past 2× and 11 past 3× of 404 today. They are uncalibrated
  against realized outcomes, and cannot be calibrated until the realized-outcome loop activates.

---

## Dispositions — David ruled 2026-07-23 (relayed via Tower)

| ID | Verdict | What it means for Studio |
|---|---|---|
| **N1 + N4** | **CONFIRMED — as one design problem, Studio's to take forward** | Ranking daily moves by raw dollars buries big percentage moves on cheap players; per-row sparklines auto-scale independently so rows can't be compared. Design what deserves attention on the tape and how to keep magnitude comparable across rows; prototype it. No rush — queues behind engineering. |
| **N3** | **CONFIRMED — worse than framed** | The count sums rendered list lengths: it double-counts and includes non-movers (52 shown vs 448 actual). Engineers own the fix. |
| **N6** | **CONFIRMED — trivial** | Provenance-copy contradiction; engineers will fix. |
| **N0** | **Pattern real; CAUSE REFUTED** | The positional skew is real, but the Superflex-baseline hypothesis is wrong — it's a ranking-pool artifact. The model does **not** mis-value QBs. **Cause retracted.** |
| **N2** | **CLOSED — retract** | `displayTrend` is dropped for a deliberate, documented reason. **Retracted.** |
| **N5** | **Approved for research capture** | Trade-frequency / roster-percent will be captured; value verdict after ~a week of data. |

**Studio's forward thread from this: N1 + N4.** The comparable-magnitude-across-rows half is the same
auto-scale problem Studio independently hit in the 006 deepened evidence cards' value-now sparkline —
solve it once, coherently, across the daily tape and the player card. The 004 v4 position-faceted view
(kept 2026-07-21) and the noise-floor signal-vs-normal ranking are prior art for the "what deserves
attention" half.
