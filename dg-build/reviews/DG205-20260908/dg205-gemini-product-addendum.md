# DG-205 Product Addendum: Track Record & Evaluation Contract

**Author:** David's Actual AGY Gemini Session (Product Brainstormer)  
**Coordination:** Root Planning Feedback Response  
**Date:** September 8, 2026  
**Target Destination:** `/private/tmp/dg205-gemini-product-addendum.md`  

---

## 1. Corrected Plain-English Headline

> **"Here is where our five-year valuation and 2026 scoring forecasts stood against the market and simple benchmarks at the kickoff freeze — locked in so we can prove whether we beat consensus or just followed it."**

This directly serves David’s core daily decision workflow:
- It centers the primary question: **Us vs. the Market** (our five-year points above replacement vs. FantasyCalc price/rank).
- It frames the accountability test cleanly: Did our 2026 points forecast beat dead-simple benchmarks (last year’s scoring and position medians), and will the market eventually move toward our five-year view?
- It makes no premature claims of a "decision edge" or outcome accuracy while the regular season remains ungraded.

---

## 2. Minimum Useful Screen

A single, high-credibility Lovable screen at `/track-record` that replaces the placeholder without exposing developer plumbing, raw flags, or guessed formulas:

### A. The Cutoff Context Header
- **Freeze Receipt:** Archived September 8, 2026 (capturing September 6/7 forecasts and market prices).
- **Core Stance:** 825 original forecasts locked across the enrolled catalog; five-year points above replacement locked beside FantasyCalc market prices.
- **Status Narrative (Plain Prose):**
  *"Outcomes locked for evaluation. Football scoring grades after Week 17; market movement evaluated on declared 30/60/90 day horizons. No performance advantage claimed until outcomes mature."*
  *(No raw `decision_supported=false` constant or developer schema nouns in user view).*

### B. Track 1: Football Production Accountability (Season Window)
- **Target:** 2026 regular-season scoring (Weeks 1–17, standard research PPR preset).
- **Baselines Displayed Beside Forecast:**
  - *Baseline A (Prior-Season Production):* 2025 points in identical scoring/window (retrospectively reconstructed at cutoff, frozen).
  - *Baseline B (Positional Median):* 2025 median for qualifying QB/RB/WR/TE participants.
- **Outcome Status:** Displayed honestly as `Ungraded — Season in progress`.
  *(No guessed weekly accumulator, no unverified zero-point assumptions for active non-scorers, and no fabricated outcomes).*
- **Evaluation Rule Disclosure (in drawer/receipt):** Requires all 4 positions to be evaluable; paired 95% bootstrap interval on MAE difference must sit entirely below zero to claim a win against a baseline.

### C. Track 2: Market Movement Accountability (Us vs. Market)
- **Target:** Testing whether FantasyCalc market prices and ranks move toward our five-year points-above-replacement valuation.
- **Registered Horizons:** Initial freeze snapshot vs. declared forward observation cutoffs (e.g., 30-day post-kickoff, mid-season, end-of-season).
- **Current State:** `Registered — Awaiting observation cutoff`.
- **Integrity Rule:** Market convergence and football scoring error are reported in separate columns and cards; market movement is never substituted as proof of football accuracy.

### D. Filterable Audit Table
- **Columns:** `Player`, `Pos`, `Team`, `5-Yr Value Rank`, `Market Rank`, `2026 Forecast (Pts)`, `Baseline A (2025 Pts)`, `Baseline B (Pos Med)`, `Football Outcome`, `Market Horizon Delta`.
- **Default Filters:** `Your Roster (27)`, `Market Paired Pool (388)`, `All Forecasted (825)`.
- **Honest Missing/Pending States:** Clear tabular indicators for players without forecasts, starting estimates, or unobserved market horizons.

---

## 3. Final Scope Recommendation

### What to Build in this Scope (Connected, Runnable Foundation):
1. **Connect Existing Snapshot Archive to Lovable:** Wire the Lovable `/track-record` route to consume the verified archived snapshot and evaluation declaration via the internal local data adapter (no public static export).
2. **Freeze Cutoff-Valid 2025 Production Baselines:** Reconstruct and freeze 2025 prior-season points and position medians for the forecast cohort under the exact research scoring rule; label them explicitly as retrospective reconstructions frozen at cutoff.
3. **Register the Market-Movement Evaluation Track:** Formalize the separate "Us vs. Market" observation window and delta metric in the evaluation declaration alongside football production, addressing David's core question while keeping the two evaluation tracks structurally decoupled.
4. **Deliver the Minimum Useful Screen:** Render the two-track accountability ledger with explicit pending/ungraded states and plain-language receipts.

### What to Exclude / Defer:
- **Exclude Interim Football Accumulators:** No automated weekly scrapers, in-season schedulers, or running point accumulators until the freeze contract is landed and games are finalized.
- **Exclude Decision Logging:** Trade Lab counterfactuals, waiver logs, and transaction grading remain subsequent work.
- **Exclude Model/Valuation Changes:** Preserve current equal-weight five-year points above replacement; no retrains or formula adjustments.
- **Exclude Historical Backfilling:** No retro-grading of 2024 or earlier seasons.
