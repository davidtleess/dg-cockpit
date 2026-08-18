# RELAY 024 — model-output findings from the domain-foundation build

**From:** Studio (independent front-end practice)
**Date:** 2026-08-17
**Verified against:** the running app at `127.0.0.1:8000`, artifacts under `app/data/`, and the
published backtest at `/api/trust-surface/{POS}`. Every claim below has a command beside it.

## Summary

| ID | summary | severity |
|---|---|---|
| R1 | DVS clipped at 100 erases separation above the cap | high |
| R2 | divergence_validity unevaluated while UI ships divergence everywhere | high |
| R3 | DVS is projection_2y rescaled; publish the PPG instead | high |
| R4 | Age-cliff constants measure late for RB, early for WR | medium |
| R5 | 843 MB of usage data reachable by no route | medium |

---

## R1 — `dynasty_value_score` is clipped at 100, erasing separation exactly where trades happen

**Claim.** DVS saturates at 100.0 for the top of three positions, collapsing real, already-computed
differences in the underlying projection.

**Reproduce.**
```
curl -s localhost:8000/api/players/7564  # Ja'Marr Chase   DVS 100.0, projection_2y 17.649
curl -s localhost:8000/api/players/8137  # George Pickens  DVS 100.0, projection_2y 14.568
curl -s localhost:8000/api/players/11604 # Brock Bowers    DVS 100.0, projection_2y 11.914
curl -s localhost:8000/api/players/7553  # Kyle Pitts      DVS 100.0, projection_2y 10.251
```
Across `app/data/valuation/universe_market_divergence_latest.json`: **6 of 163 WRs, 11 of 89 TEs and
5 of 99 RBs** carry DVS exactly 100.0. Their `projection_2y` values span **5.76 PPG (WR)**,
**5.10 (TE)** and **2.45 (RB)**.

**Observed.** Chase and Pickens are the same number. Bowers and Pitts are the same number.
**Expected.** A valuation used for trade support separates the assets trades are built around.

**Why the user pays.** The product's stated purpose is dynasty trade decision support. The clip
removes the model's opinion precisely on the highest-value pieces — 12% of the entire TE position
is rendered as one value — so the model is silent on the trades that matter most. The information
is not missing; it is discarded at the display scale.

**Confirm, fix, or refute with a concrete technical reason.** In particular: is the clip a display
convention (in which case the underlying continuous value can be exposed) or a valuation ceiling?

---

## R2 — `divergence_validity` is null for all four positions

**Claim.** The backtest gate that would establish that model-vs-market disagreement is informative
is not evaluated, while divergence labels ship on multiple surfaces.

**Reproduce.**
```
for P in QB RB WR TE; do curl -s localhost:8000/api/trust-surface/$P \
  | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['position'], d['divergence_validity'])"; done
# QB None / RB None / WR None / TE None
```
Related, same source: mean nDCG@24 against the market baseline (`dp_archive`) across the four folds
is **QB −0.0240, RB −0.0311, WR −0.0006, TE +0.0032** — i.e. the model does not out-rank the market
at any position, which the shipped copy already states as *"Consensus-competitive, edge unproven."*

**Observed.** Divergence is computed, labelled and surfaced; its validity gate is `None`.
**Expected.** Either an evaluated gate, or surfaces that describe divergence as an observation.

**Why the user pays.** Every two-lane readout invites the user to weigh a disagreement. If the
disagreement has never been shown to carry information, the user is being asked to act on an
unevaluated premise — and given R2's own nDCG numbers, at QB and RB the disagreement is at least as
likely to be our error as the market's.

**Confirm, fix, or refute with a concrete technical reason.** Specifically: never computed,
computed and withheld, or deferred pending data?

---

## R3 — DVS is `projection_2y` rescaled; the concrete unit already exists

**Claim.** `dynasty_value_score = projection_2y × a per-position constant`, clipped to [0, 100].

**Reproduce.** Over the 388 players in the universe artifact carrying both fields, the ratio
DVS ÷ projection_2y is constant within position:

| position | constant | sd of ratio | n |
|---|---|---|---|
| QB | 4.9752 | 0.0019 | 37 |
| RB | 6.3688 | clipping only | 99 |
| WR | 6.8976 | clipping only | 163 |
| TE | 10.6371 | 0.0110 | 89 |

Spot check (WR): projection 0.36 → DVS 2.5; 0.52 → 3.6; 0.82 → 5.7.

**Observed.** Surfaces lead with a 0–100 score whose meaning must be learned.
**Expected.** The same quantity is available in fantasy points per game — the unit the user reads
every week — at zero modelling cost. The model card states the intended use as *"forecast 2-year
average PPG."*

**Why the user pays.** The one-user client has objected to the abstraction of these numbers
repeatedly since 2026-07-15. "We project 9.2 points a game over the next two seasons" is the same
model output as "DVS 63.3", and one of them can be checked against what he watches on Sunday.

**Secondary, same finding:** the constants differ by position, so **DVS is not comparable across
positions** — DVS 50 is 10.05 PPG for a QB and 4.70 for a TE. No shipped sort currently mixes
positions on DVS (checked: no comparator in `frontend/src` references it), so this is a property to
preserve rather than a live defect.

**Confirm, fix, or refute with a concrete technical reason.**

---

## R4 — the age-cliff constants land late for RB and early for WR

**Claim.** Measured against the app's own data, the coded thresholds (RB 26, WR 28, TE 30, QB 33)
do not sit where production actually breaks.

**Reproduce.** `app/data/nflverse_usage.db`, `ff_opportunity` weekly 2018–2025, **regular season
only** (the table carries weeks 1–22; postseason weeks inflate per-game rates), PPR points per game,
joined to `contracts.date_of_birth` on `gsis_id`, age at 1 September, same player season N → N+1,
minimum 8 games in season N. Studio's script: `tools/does-the-age-cliff-land-where-the-code-says.py`.

**The control that must be applied first:** the median qualifying player declines **−17.1%**
year-over-year at *every* age (n=956, all positions pooled) — selection, not ageing. Read every
figure below as a difference from that baseline.

| position | coded | at the coded age | where it actually breaks |
|---|---|---|---|
| RB | 26 | −9.8 vs baseline | **29**: −32.1 vs baseline, 92% of survivors decline, 14 of 27 gone the next season, median including departed **−100%** |
| WR | 28 | −8.4 vs baseline | **27**: −11.5 vs baseline; receivers run *above* baseline through 26 (+10.6) |
| TE | 30 | −14.7 vs baseline | **30 — the constant is right** |
| QB | 33 | — | **unmeasurable**: no age bucket cleared the minimum sample. A hole, not a confirmation. |

**Observed.** Age-cliff risk flags fire on 26-year-old backs and not on 27-year-old receivers.
**Expected.** Flags aligned to where production actually falls, or no binary flag at all.

**Why the user pays.** The flag is amber-styled evidence on the player card and a sort key in Roster
Audit. A false flag on a 26-year-old back and a missing one on a 27-year-old receiver both push the
user toward the wrong asset.

**Studio's own caveats, stated rather than buried:** per-cell samples are 20–60, so bucket-to-bucket
wiggles of 8–10 points are inside the noise; only the WR peak at 25–26 and the RB wall at 29 are
large enough to lean on. Surviving-player medians still understate decline because the worst
outcomes leave the sample. PPG mixes role and efficiency.

**A design note that outlives the constant:** an age cliff is a categorical label on a continuous,
noisy quantity, so it lies at the boundary — a flag at 26 years 1 month and none at 25 years 11
months. If the thresholds are revisited, the more durable fix is a curve with uncertainty drawn and
the player positioned on it.

**Confirm, fix, or refute with a concrete technical reason.**

---

## R5 — 843 MB of captured usage data is reachable by no API route

**Claim.** The advanced-statistics layer is captured and unserved.

**Reproduce.**
```
grep -rl "nflverse\|playerprofiler\|pff_export\|ff_opportunity" app/api/routes/   # returns nothing
```
`app/data/nflverse_usage.db` — 15 tables, 843 MB: `depth_charts` 812,074 rows (2018–2024),
`ftn_charting` 185,215 (2022–2025), **`ff_opportunity` 47,282 weekly expected-fantasy-point rows
(2018–2025)**, `nflverse_injury_report` 45,337, NGS receiving/rushing/passing 14,731 / 6,059 / 5,933
(2016–2025), PFR splits. Plus `playerprofiler.db` (472 MB) and a PFF export tree.

**Observed.** Waiver Radar and Rookie Board render explanation cards stating that in-season usage
signals do not exist yet. `PRODUCT_BRIEFING.md` §4 says the same.
**Expected.** Either the constraint text is updated, or the data is served.

**Why the user pays.** Two screens are parked on a premise the repository no longer supports, and
the only quantities that would let the product speak the hobby's own units — routes, target share,
snap share, expected points — are on disk and unreachable.

**Confirm, fix, or refute with a concrete technical reason.** (First raised 2026-08-07 as 017 R3;
restated here because the briefing's hard-constraint text is now materially stale.)

---

*Studio measures against the running app and never writes to this repository. Where a finding rests
on Studio's own instrument, the script is named so the measurement can be re-run or refuted.*

---

# DISPOSITIONS — engineering response received 2026-08-18

Recorded verbatim in substance, with Studio's corrections to its own two method errors. Every
figure below was re-derived by the engineering side rather than taken from this brief.

| ID | verdict | what changed |
|---|---|---|
| R1 | **CONFIRMED — and worse than filed** | It is a valuation ceiling, not a display convention. The clamp is applied to the value that ships (`pvo_assembler.py:390-407`), and the designed disclosure is dark. |
| R2 | **CONFIRMED — deferred pending data** | Not never-computed, not withheld. Earliest real evaluation ~2026-12. Studio's nDCG figures were **not** reproduced and are neither endorsed nor disputed. |
| R3 | **CONFIRMED exactly** | Constants reproduce to within 0.001. One refinement, one correction to Studio (below). |
| R4 | **Neither confirmed nor refuted** | The constants drive a human-readable boolean only; the predictive models use fitted continuous curves. A mis-calibrated constant here is a **display** defect. |
| R5 | **CONFIRMED on every reachable fact** | One Studio citation was unresolvable. The repair is narrower and more precise than filed. |

## R1 — the disclosure is dark, and that is the part to act on

`player_value_object.py:85` defines `dvs_clamped` ("True if raw DVS exceeded 100 before clamping")
and the assembler computes it, but the served valuation block carries neither `dvs_clamped` nor any
`dvs_p90_ref`. Studio verified independently: the string appears in neither
`frontend/src/lib/api/types.gen.ts` nor `app/api/routes/`. The formula at source is
`dvs_raw = projection_2y / ENGINE_B_P90_PPG[pos] * 100.0`, so the per-position constant is
`100 / P90`, with `ENGINE_B_P90_PPG` = QB 20.1 / RB 15.7 / WR 14.5 / TE 9.4.

Studio's RB count of 5 against engineering's 6 is not a conflict: the sixth is Jeremiyah Love, whose
`projection_2y` is null on a non-Engine-B path. Per-position denominators differ because this brief
counted DVS-carrying players (163 WR) and the re-derivation counted universe rows (1,790). Both are
correct on different bases.

## R3 — the refinement is accepted, and Studio's comparator check was scoped wrong

**Accepted refinement.** "The same quantity at zero modelling cost" holds only in the unclamped
region, where DVS is a strictly monotone rescaling. In the clamped region information is *destroyed*
rather than transformed. The honest statement is: **DVS is PPG rescaled AND truncated.** The
register now says exactly that.

**Studio's error, withdrawn.** This brief claimed "no shipped sort currently mixes positions on DVS
(checked: no comparator in `frontend/src` references it)." A comparator does exist —
`roster_cut_engine._tier_sort_key:171-180` sorts a mixed-position roster by `(tier, score)` with
`score = dvs` for tiers B and C. The check was scoped to the layer Studio happened to search, which
cannot support a claim about the whole system. The claim was right in effect and wrong in method.

**The open question, answered by measurement rather than argument.** On the live roster the DVS path
is **dormant**: of 21 cut candidates, 20 carry an `xvar_pct` and take the tier-A path, and the
shipped order is monotone in `raw_xvar` (verified across all 20). The single tier-C player,
Tank Dell, has no score at all, so no cross-position DVS comparison occurs. The latent defect is
real; it does not currently fire on this roster.

## R4 — accepted, including the caveat that weakens Studio's own figure

The distinction between attrition and production is accepted and is now in the register: "14 of 27
gone the next season" is an attrition statistic, "−32.1 vs baseline" is a production statistic, and
at RB-29 cell sizes only attrition is well powered. Conflating them would overstate the wall.

Since the constants drive display rather than the model, the live cost is now nameable: Roster Audit
renders an `approaching_cliff (Ny)` label on every row, computed from these constants. Rasheen Ali
(RB, 25) currently reads **`approaching_cliff (1y)`** against an in-house measured wall at 29.

## R5 — Studio's citation was unresolvable; the repair is narrower than filed

`PRODUCT_BRIEFING.md` does not exist in the product repository. It exists only in Studio's own
engagement directory, and citing it to this audience was an error — the reader could not open it. It
is withdrawn as a citation. The product's own text is the right anchor, and engineering supplied it:

> `ParkedSurfaceCard.tsx:23` — "This surface needs in-season usage signals (routes, snaps) that only
> accrue while games are played; building it now would ship an empty surface."

The precise repair: routes and snaps for **2018-2025** are on disk. What does not exist is the
**current-season 2026 vintage**. The sentence implies the data *class* is absent when only the
vintage is.

**A live consequence of R5, measured after the response and filed as A2 in the addendum:** Roster
Audit renders "do not use for dynasty decisions" on 23 of 27 roster rows, and its `inputs_missing`
list names `ppg_t`, `games_t`, `snap_share`, `snap_share_t_minus_1` — the exact quantities held in
the unserved store.
