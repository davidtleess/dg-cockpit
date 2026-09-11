# DG-220 frozen retrospective validation protocol

Prepared September 10, 2026. Design only: no model fit, new backtest, loss calculation or product/data changes performed. Root froze this protocol before the builder executed any new comparisons. David approved strengthening the gaps after DG217. This is a retrospective challenge to existing evidence, not a newly untouched confirmation set.

## Recommended scope, in priority order

1. Test the saved rookie policy against stronger, easy-to-explain baselines on identical historical rows.
2. Check whether saved veteran errors/appearance probabilities support the older-QB and high-prior-production WR cases that motivated DG-217.
3. Quantify replacement/horizon assumption sensitivity. Do not claim historical waiver/trade validation without historical available-player/transaction alternatives.

No winner will be selected, promoted or served from these comparisons. Report every prespecified arm, including negative findings; any later policy change requires a separately specified confirmation/prospective decision.

## Locked data and actual columns

Rookie artifact: `/Users/davidleess/dg-wt/DG-165/runs/20260906T195904Z/dg165_rookie_capital/`. `out_of_time_predictions.csv` has draft_season, forecast_year, draft position, pick, round, gsis_id, label_basis, points_j, appear_j and the saved policy/baseline e_points_yearj and p_appear_yearj. Canonical policy is the saved inner_menu columns, not exploratory plain or the final 2026 selected variant applied retrospectively. `cohort.csv` has 2,083 rows for 2001–2026, including 35 unresolved identities; it has identity/draft attributes but **no outcome columns**. Use the frozen common outcome CSV to recover early training labels. Do not train comparators only on the 2008+ held-out prediction CSV, which would discard the model's earlier training classes.

Veteran artifact: `/Users/davidleess/dg-wt/DG-177/runs/20260906T195728Z/dg177_basic_horizons/`. Join `historical_predictions.csv` to `basic_cohort.csv.gz` on exact player_id + feature_season + position. Cohort has age, games_t, ppg_t, total_points_t, identity_status, per-horizon labels and censored flags. Policy forecast columns are `policy_*`; keep `candidate_*` out of the primary comparison. Use the linked corrected manifest `../dg177_basic_horizons.manifest.corrected.json` (SHA b73027d06792d788dafc48a77731314b7e3ab0739fadeb2eaf83df5a61297430).

Common outcomes: `/Users/davidleess/dg-wt/DG-179/runs/20260906T194819Z/league_season_outcomes/`. CSV SHA 199a48beb96a25f5dad50758b3f72b40a5d7d0cf2000f7cdaf2f411873c6ecb8; manifest SHA d3812d0d56b50971e98552fed4f791d3132eeffa7c242601e7c609285863ba18. It contains player_id, season, points, games, appeared for the default-PPR championship window. Exact-league scoring equivalence remains unsupported. Verify hashes and unique joins before calculations; fail the relevant analysis on mismatches, never repair quietly.

## Rookie population and cutoff

Primary horizons j=1 and j=5; j=2,3,4 are secondary descriptive outputs, not additional chances to declare success. Test rows are exactly the saved out-of-time rows with finite policy prediction and observed points_j at that horizon, draft years 2008–2025 subject to target closure by 2025. Key is (draft_season, pick), not name or today's position. Preserve the existing counts: year1 1,438 observed, year5 1,116 observed. Disclose seven unresolved held-out rows and the future/censored exclusions; stop if counts differ unexpectedly.

For a forecast of rookie class T, the j-th outcome year is d+j−1. Eligible baseline training classes satisfy **d<T AND d+j−1 <= T−1**, equivalently d+j <= T, with d>=2001 and the outcome season covered. Resolve identity exactly as frozen label_basis specifies. A resolved draft identity with no common outcome row in a covered complete season contributes **zero points and appearance=0**, including players who never contributed. Unresolved or uncovered labels remain missing and excluded from losses/means with separate counts. Do not require a later appearance to admit a player. Use draft-table position throughout, not position_current. UDFAs are outside this declared population.

First reproduce existing stored labels for all overlap rows from this rule. Early-class reconstructed labels are used only for comparator means. No model code, identities or forecasts are refit/re-resolved.

## Rookie comparator definitions

All means include observed zeros and use only the training set above, separately for each T and j.

- B0: existing saved pooled baseline, retained as the original comparison.
- B1 position-only: arithmetic mean points among eligible training draftees at the player's draft position. If n_position=0, use the pooled training mean and flag the fallback. If there are no training observations at all, mark unsupported; never insert a zero prediction.
- B2 position×pick-bin, shrunk toward B1: bins fixed now as **1–16, 17–32, 33–100, 101+**. Let n and sum_y describe that position/bin's eligible training rows. Prediction is **(sum_y + 20*B1)/(n+20)**. Twenty is a fixed pseudo-count, not tuned on these historical outcomes. n=0 falls back exactly to B1. Missing/nonpositive pick is a separate flagged unsupported-bin case that receives B1; preserve it rather than drop the test row. Record bin membership, counts, sums, parent mean, weight and forecast for every test row.

Compute analogously B1/B2 appearance probability using mean appear_j and the same shrinkage. This is a separate appearance diagnostic; it must not be called breakout or points calibration. No recency weighting, alternative bins, shrinkage search or baseline winner selection in this increment. The estimated means are baseline arithmetic, not a refit of either DG model.

Primary loss: row-weighted MSE and paired MSE difference saved policy minus each baseline (negative favors policy), with RMSE for legibility. Secondary: MAE and signed mean prediction error. Report by position and horizon, and per draft year. Include all positions; do not let overall pooled improvement hide a positional failure. The narrow highly drafted rookie question additionally gets a fixed picks<=32 subgroup for each position, with counts, errors and uncertainty, not hand-picked Love analogues.

## Veteran applicability protocol

Base population is the existing saved observed held-out rows at each horizon, not today's ranked or market-priced survivors. Join prior attributes without changing row eligibility. Use exact existing policy and baseline forecasts; no refit, new feature, current player status, market rank or retrospective injury exclusion.

Primary questions: (a) **QB with feature-season age>=35**; (b) **WR in the top 12 by feature-season championship-window points among that season's WR basic-cohort members**, include all ties at the 12th threshold. Derive that previous-season quantity from the common artifact at season t, which is known at the declared post-t cutoff. A known absence is zero, unknown stays unknown. Define WR membership anew at each historical feature season; never use future star status, current valuations, future points or appearances. No minimum future games. Retain zero-production future outcomes.

Report j=1 and j=5 first, then all j as descriptive. Also display fixed age bands <25, 25–29, 30–34, >=35 by position and the complementary non-top12 WR group, so a selected concern has context. For each: player-season n, distinct players, number/list of feature seasons, observed absence share, MSE/MAE/bias policy and baseline; paired loss difference. For QB>=35 include Brier score and mean predicted appearance versus observed appearance. Avoid data-adaptive calibration bins; fixed probability bins [0,.2), [.2,.4), [.4,.6), [.6,.8), [.8,1] with count and observed frequency are descriptive only.

No subgroup is discarded because its result looks poor. Flag fewer than 30 rows or fewer than five seasons as sparse and suppress strong superiority claims. Veteran year5 has **one historical evaluated feature season (2020)** for every position; no subgroup analysis can manufacture additional season-level evidence. Missing age/feature-season points receives an explicit unclassified count, not a guessed category.

## Uncertainty and multiplicity

Use paired resampling of policy/baseline losses, not independent resampling of arms. Fixed seed 20260910, 2,000 draws, percentile 95% intervals. Rookie primary intervals resample **draft-year clusters**, preserving all players within sampled years; each rookie belongs to one class. Veteran rows recur across years: give paired **player-cluster** and **forecast-year-cluster** intervals separately, clearly labeled as different dependence sensitivities, plus per-year differences. Neither interval is a complete joint uncertainty guarantee. Do not report a season-generalizing interval at j=5 when there is only one year; a player-cluster interval there is conditional on the 2025 outcome season.

Report pooled row-weighted loss and equal-year-weighted mean loss difference together, with distinct labels. Do not silently switch the primary aggregation. Intervals describe this reconstructed history; they do not account for prior model/menu development or the new subgroup choices prompted by DG-217. Treat families of position/horizon/subgroup comparisons as descriptive; no isolated p-value or interval excluding zero is sufficient to declare a deployment winner.

## Replacement and horizon sensitivity protocol

Use the exact frozen current 825 model-player population; report the 388 paired-player subset separately with ranks recomputed inside that subset. No present market data enters model forecasts. Hold all annual player forecasts and identity mapping fixed.

Prespecify twelve scenarios: H in {1,2,5}; weights either all 1 or 0.9^(j−1); reference either the existing selected player's annual path R_position,j or a constant R_position,1 in each future season. Value is **sum_j<=H weight_j * max(expected_points_i,j − R_position,j, 0)**. Preserve ties/missing status. Constant replacement is an assumption challenge, not a demonstrated alternative policy. Record the exact reference values and formulas, not only ordinal ranks.

Outputs for every scenario: zero-value count/share, top20 position composition, top20 overlap with the existing five-year ranking, median/90th-percentile absolute rank change using tie midranks for summaries, and all-player exact rank intervals and annual contributions. Show the DG-217 six named examples as illustrations after the full table, not as a selected performance sample. This diagnoses sensitivity; it cannot establish lineup points gained or trade value. max(E[points]−R,0) is not E[max(points−R,0)], and there is no modeled dynamic sequence of future pickups here.

Do not create historical replacement truth from today's Flacco/Hunt availability or today's survivor pool. Existing frozen annual forecast history can support a separate fixed-intersection cumulative-points loss analysis for H=1,2,5, but that would change horizon populations and H=5 has only the common 2020 feature season; it does not solve historical replacement-opportunity validation. Lower priority than the two primary tests above; omit unless root explicitly includes it in the frozen contract.

## Acceptance and conclusions

Deliver a protocol/hash receipt; population/missingness table; exact training/test cutoff and comparator row ledger; paired metrics/uncertainty; subgroup counts; full sensitivity matrix; concise conclusions separating production, appearance, valuation assumptions and decision evidence. Independently verify selected baseline calculations including a zero contributor, unresolved identity, sparse draft bin, early training class and oldest-QB subgroup. Stop on key/hash/closure disagreement rather than changing inclusion rules after seeing results.

The strongest allowable conclusion is that the existing saved policy did or did not beat these stronger declared baselines in reconstructed historical samples, and that specified current ranks are more or less assumption-sensitive. New true confirmation must be prospectively recorded (e.g. frozen 2026 predictions and comparators with the same definitions). No part of this analysis justifies declaring an optimal horizon, changing a player by hand or promoting a revised valuation on the same historical data that motivated it.
