# DG-046 — The common-cohort divergence fix is built, tested, and NOT WIRED IN

**Layer:** 5  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG046-20260826  ·  **DG 3.0**
**Source:** 2026-08-26 six-layer completion audit (L5 auditor), facts re-verified same day.

**Problem:** the product's flagship market signal — model-vs-market divergence — is served daily
by the OLD mismatched-population computation. The repo's own docstring calls that delta
uninterpretable. The mandated common-cohort rebase EXISTS
(`src/dynasty_genius/market_divergence_rebase.py`) and is contract-tested
(`tests/contract/test_market_divergence_rebase_red.py`) but is imported ONLY by its test —
the daily job (`scripts/run_market_divergence_refresh.py`) still imports the old builder.
Every day it stays dark, the served number stays uninterpretable.

**How we know:** grep of importers; the launchd plist runs the old path; verified 2026-08-26.
**Mitigating fact (verified 2026-08-26):** `market_divergence_history.db` payloads store the RAW
components (`market_value`, `dynasty_value_score`) alongside the wrong percentiles — 549,460 rows
since 2026-07-09 — so the season archive is RECOMPUTABLE post-hoc. This is a should-fix-soon,
not a lost-forever emergency. Honesty markup (`decision_supported=false` gates) already prevents
decisions on the wrong number.

**Done looks like:** the daily job builds divergence through the common-cohort rebase; the
contract test that today only proves the module works also pins the production import path; one
production cycle observed serving the rebased artifact; the what-changed/PVO surfaces carry the
new number with unchanged honesty markup.

**Tier:** product code on a daily producer — pre-freeze candidate; after 09-04 it is not Tier 0
and waits for the season's end unless David rules otherwise. **Edge distance: DIRECT** — this is
the nearest lever that makes a served number more real.

---

**✅ BUILT AND LANDED 2026-08-26 ~13:50 — merge `e976b1e2` on `main`, trunk pulled same minute.**
David's "1 yes" (~13:45). Implementation went one better than the ticket's ask: rather than
bolting the rebase module onto the runner, `build_universe_market_divergence` itself now ranks
BOTH lanes against the common cohort (two-pass: eligibility collected with the row loop's own
skip conditions, then ranked against that population only) — so every caller is fixed, not just
the daily job. Rows + batch header disclose `inclusion_rule` + population; the small-cohort gate
judges the real common population; the cross-proof test pins the served delta to
`market_divergence_rebase.rebased_delta` forever. 7 new tests RED-first; 397 existing
divergence/market tests green untouched (nothing had pinned the wrong populations); full gate
green in dg-land. The rebase module stays as the historical-baseline/proof harness, docstring
updated. **Acceptance:** trunk pulled pre-14:00 so the SR-00 14:00 market retry may produce the
first production rebased artifact same-day (monitor armed); otherwise tomorrow's 09:40 chain run
is the first. Verify `divergence_cohort_method` in the served artifact.

**✅ PRODUCTION ACCEPTANCE SAME DAY, 14:00 — a day early.** The trunk was pulled before the SR-00
14:00 retry slot, and the retry rebuilt the served artifact on the new code. Verified live:
`universe_market_divergence_latest.json` declares `divergence_cohort_method`
(inclusion_rule model_backed_and_market_priced; populations QB 45 / RB 90 / TE 62 / WR 144),
341 delta rows each carrying their cohort disclosure, honesty markup unchanged
(decision_supported false). The number the product serves every morning is interpretable as of
today. Ticket CLOSED in full.
