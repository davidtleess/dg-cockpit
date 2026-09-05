# DG-161 — The model and the market disagree about age, and which of them is wrong is unknown

**Layer:** 3 · **State:** WATCH (date-bound, see below) · **Lane:** — · **DG 3.0** · **model honesty · measurement**
**Source:** David's ruling of 2026-08-31, selected from an options list: ***"Chase it now — it outranks the rest"***,
in answer to *"your recommendation surface may be pointing backwards for dynasty — buys averaging 27.4 years old,
sells 23.8. I could not reproduce it from the artifact I checked. Chase it?"* Chased 2026-09-04 ~20:0x ET by Bob.
⚠ **Provenance note:** the words are an option a lane WROTE and David CLICKED. The decision is his; the phrasing is
ours. It is his ruling, not his sentence.

**⛔ THE REPRODUCTION TRAP — read before measuring anything.** Measure ONLY from
`app/data/valuation/universe_market_divergence_latest.json`. The served PVO runtime has **0 of 12,227 rows with a
populated `market_overlay`** (verified 09-04), so checking that file makes the finding look unreproducible. It is a
different tree. The 08-31 asker hit exactly this and reported "could not reproduce".

---

## 1. THE HEADLINE, and it is not the one this has been carried under

**"The model has an age bias" is NOT supported by the evidence.** Measured on 363 rows carrying a market price, a
divergence and an age:

| regression on age | slope / year | 95% CI | detectable? |
|---|---:|---|---|
| **model** percentile | +0.0036 | [−0.0047, +0.0127] | **no — spans zero** |
| **market** percentile | −0.0022 | [−0.0098, +0.0057] | **no — spans zero** |
| **their difference** | **+0.0058** | **[+0.0009, +0.0113]** | **YES** |

Neither side is detectably age-tilted on its own. **Only the gap between them is.** So the honest statement is that
the model and the market disagree about age in a way that is real and measurable, and **which of them is wrong is
unknown.** The two spanning-zero intervals sit beside the one that does not, deliberately, so this cannot be
re-simplified back into "the model is biased".

Per position, only **running back** is individually detectable: **+0.014/yr, CI [+0.003, +0.025]**. QB, WR and TE all
span zero. Overall divergence-vs-age slope +0.006/yr, CI [+0.001, +0.011], p = 0.014.

## 2. HIS FOUR YOUNGEST ARE ALL ON THE SELL SIDE

The league gap is the statistic; this is the thing he can look at. Of his 26 rows carrying both a price and a
divergence: **Ashton Jeanty (22), Braelon Allen (22), Luther Burden (22) and Chris Bell (22) are ALL on the
model-lower-than-market side today, and Mac Jones (27) is on the model-higher side.** His roster's own gap is
buy-side 24.4 vs sell-side 23.1 = **+1.33 years**.

## 3. THE SIZE CORRECTION — the direction survived, the magnitude did not

League-wide: buy-side signals average **26.7** years, sell-side **25.1** — a gap of **1.61 years**. The figure in the
record since 08-31 is **27.4 vs 23.8, a gap of 3.6**. **Under half.** Stated explicitly because the 3.6 is in the
record and will otherwise keep being quoted.

## 4. WHAT SETTLES IT, AND THE DATE

Age against REALIZED production on the holdout: **RB −0.377 ppg/yr** (CI excludes zero), **WR −0.267** (excludes
zero), QB +0.092 and TE +0.101 (both span zero). Backs are exactly where the divergence tilt is detectable, which is
**suggestive** that the model under-penalises RB age. **⚠ IT IS NOT DECISIVE, AND THE CAVEAT MUST TRAVEL WITH THE
NUMBERS: the holdout contains only players who posted a QUALIFYING season, so survivorship biases the age slope
toward zero.** The players who disappeared are the ones an age effect would hit hardest and they are absent.

**What answers it is the realized-outcome harness grading real predictions against real outcomes, including the
players who vanished. Its first possible number is WEEK 4.** That makes this a **WATCH item with a date**, not a fix
and not a closure.

## ⛔ THE STAKE IS SMALLER THAN IT HAS BEEN FRAMED

This has been carried as "the product is confidently advising him to buy old players and sell young ones". **It does
not advise.** `decision_supported` is **FALSE on all 363 rows**; the copy is descriptive — *"We price him higher than
the market does"*, not *"buy him"* — and buy/sell language is in `banned_vocabulary.json`. A price disagreement can
be READ as a hint, which is why this still matters, but the surface makes no recommendation. (Greg wrote the stronger
framing and retracted it to David 09-04.)

**Done looks like:** re-run these four measurements once the harness has graded a week, and rule then. **⛔ Do NOT
change a scoring path on this evidence** — Bob's recommendation, accepted by Greg 09-04, six days before kickoff.

**Anti-scope:** nothing built, nothing promoted, no producer touched.
