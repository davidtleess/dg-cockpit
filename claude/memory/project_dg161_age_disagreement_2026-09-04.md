---
name: project_dg161_age_disagreement_2026-09-04
description: David's 08-31 top-priority "age bias" chased 09-04 — it reproduces at UNDER HALF the claimed size, and it is NOT a model bias; only the model-market DIFFERENCE is detectable. WATCH to week 4.
metadata:
  type: project
---

**DG-161 (renumbered from DG-160 on 09-04 20:3x ET — two lanes filed DG-160 the same evening; Fred's replacement-reasoning ticket kept the number because it was already landed in a commit, a branch and test filenames. This one had no code). Filed 2026-09-04. David's 2026-08-31 ruling (an option he CLICKED, our words): "Chase it now — it outranks
the rest." Chased four days later; it had never been picked up.**

**⛔ THE REPRODUCTION TRAP:** measure ONLY from `app/data/valuation/universe_market_divergence_latest.json`. The
served PVO runtime has **0 of 12,227 rows with a populated `market_overlay`** — checking that file makes the finding
look unreproducible, which is exactly what happened to the 08-31 asker.

**⛔ "THE MODEL HAS AN AGE BIAS" IS NOT SUPPORTED.** Regressed on age over 363 rows: model percentile **+0.0036/yr,
CI [−0.0047, +0.0127] — spans zero**; market percentile **−0.0022/yr, CI [−0.0098, +0.0057] — spans zero**; their
DIFFERENCE **+0.0058/yr, CI [+0.0009, +0.0113] — does not**. Neither side is detectably age-tilted alone; only the
gap is. The honest headline is that **the model and the market disagree about age and which is wrong is unknown.**
Only RB is detectable per position (+0.014/yr, CI [+0.003, +0.025]).

**⛔ THE SIZE WAS OVERSTATED: gap 1.6 years (buy-side 26.7, sell-side 25.1), NOT the 3.6 (27.4 / 23.8) in the record
since 08-31.** Direction survived, magnitude did not — quote 1.6.

**On David's roster:** his four youngest — Jeanty, Allen, Burden, Bell, all 22 — are ALL model-lower-than-market;
Mac Jones (27) is model-higher. His own gap is +1.33 years.

**⛔ THE STAKE WAS OVERSTATED TOO:** it does NOT advise. `decision_supported` is FALSE on all 363 rows, the copy is
descriptive (*"We price him higher than the market does"*), and buy/sell is in `banned_vocabulary.json`. Greg wrote
"confidently advising him to buy old and sell young" and retracted it.

**What settles it:** realized production vs age on the holdout gives RB −0.377 ppg/yr and WR −0.267 (both exclude
zero), suggestive that the model under-penalises RB age — **but the holdout only contains players who posted a
QUALIFYING season, so survivorship biases the slope toward zero and it is not decisive.** The answer comes from the
realized-outcome harness grading predictions against outcomes INCLUDING the players who vanished: **first possible
number is WEEK 4.** WATCH item with a date, not a fix. ⛔ Do not change a scoring path on this evidence.
Related: [[project_dg147_dg149_landed_2026-09-04]], [[feedback_the_failure_path_returns_the_success_signal]].

---

## ⭐ ADDED 2026-09-04 EVENING (Greg) — THE ROOT FIX WAS ALREADY RULED AND ALREADY BUILT, ON 08-31

**This changes what the 1.6-year residual MEANS, and nothing in this ticket knew it.** Verified from the
08-31 transcript's own AskUserQuestion results, not recalled:

- **2026-08-31 10:19:55 EDT** (stamp 14:19:55**Z**) — asked which age fix he wanted, David selected
  **"Root fix: stop deleting the players who stopped playing."** The option's preview laid out the causal
  chain: 638 seasons deleted, old players preferentially (77% label rate at 28+ vs 85% at ≤23) → age curve
  learned too flat (−0.21 vs a true −0.25) → model prefers older players → buy 27.4 / sell 23.8.
  **"Cut it at the top."**
- **2026-08-31 10:53:52 EDT** (stamp 14:53:52**Z**) — asked how far to go, he selected **"Go all the way — assemble, retrain, pin,
  republish"**, explicitly accepting that TE might honestly FAIL its gate as a result.
- The effect is visible in the record: the age coefficient moved −0.2593 → −0.4028 against a market −0.3855
  (see [[project_ranking_diagnosis_2026-08-31]], hurdle live 09-01).

**So the honest headline is not "his top priority went unchased for four days."** It is: *he ruled the root
fix on 08-31, it was built and retrained the same day, and the 1.6-year gap measured on 09-04 is what
SURVIVED it* — down from the 3.6 that was the reason to act. That is a fix that worked and left a residue,
which is a completely different thing to report to him than an untreated bias, and it is the version he should
hear. The residue is still not shown to be a MODEL defect: both slopes span zero, only their difference does not.

⚠ **How this was missed:** the ticket was chased from the 08-31 ruling line alone without reading forward in
the same day's transcript to see whether the ruling had already been executed. Before chasing any ruling as
unbuilt, read to the END of the session that produced it. [[feedback_check_when_not_just_what]].
