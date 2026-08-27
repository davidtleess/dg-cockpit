# DYNASTY GENIUS — SEASON READINESS BRIEF
# Distilled decision record, 2026-08-20. Written for agents with NO prior context.

## THE DEADLINE
NFL week 1 kickoff: **2026-09-10 20:20 ET**. Today 2026-08-20. **21 calendar days / 15 working days.**
Builder: David (15 yrs enterprise software, systems thinker, NEW to writing code syntax) + AI agents.
One user. One league (12-team Superflex PPR). One laptop (MacBook, macOS 12).

## THE SCOPING RULING (David approved the architecture plan; this is how it phases)
**DO NOT run the architecture migration before the season.** INC 1 re-keys canonical identity across
every store — the riskiest operation in the program — and doing that while irreplaceable daily capture
flows is the worst possible risk pairing. The season is when data loss is most costly and least
recoverable. "Running" != "rearchitected".

**Season-readiness sprint now. Architecture program starts off-season (Jan-Feb 2027).**

Three sprint goals, in priority order:
1. **NOTHING IS LOST** — capture runs reliably every day of the season. Gaps are permanent.
2. **NOTHING IS WRONG** — numbers David acts on are correct.
3. **SOMETHING IS USEFUL** — he opens it each morning and gets value.

## REPO FACTS (verified 2026-08-20, re-verify before acting)
- Product repo `/Users/davidleess/dynasty-genius-product`, HEAD `c1e8a0c` on
  `feature/outcome-loop-week1` @ `ce7b540`, **pushed 2026-08-20** and level with
  `origin/feature/outcome-loop-week1`. **13 ahead / 3 behind `origin/main` (d2c85c2)** — unmerged,
  which is not the same as unbacked-up. 58 dirty files across other lanes; do not touch them.

  **Two measurement traps here, both of which bit this project once already:**
  - `git rev-list --left-right --count origin/main...HEAD` prints `<behind>  <ahead>`. A reading of
    `3  13` means **13 ahead, 3 behind**. It was reported inverted for a full session.
  - *Ahead of `origin/main`* does **not** answer *"is my work backed up?"* Eleven of the commits once
    described as "living only on this laptop" were already safe on the remote branch; only two were
    genuinely laptop-only. **For data-loss questions always ask
    `git rev-list --count origin/<current-branch>..HEAD`.** On a machine whose cockpit backup has
    never succeeded, confusing those two questions is how a false alarm — or a real one — gets missed.
- **USE `.venv/bin/python3.14`. NOT `.venv/bin/python`** — that symlinks to system Python 3.9.6
  despite pyvenv.cfg declaring 3.14.4. 4+ scripts call the broken path.
- **IGNORE `.oa3/`** — nested git worktree duplicating every path. Always `--exclude-dir=.oa3`.
- Test suite: `.venv/bin/python3.14 -m pytest tests -q` -> 6,258 pass / 17 fail / 12 skip in ~6 min.
  All 17 failures are uncommitted in-flight work (14 in untracked
  `tests/contract/test_governed_cadence_inputs_red.py`, 3 OpenAPI drift from modified
  `frontend/openapi.json`). Invariant is ZERO COLLECTION ERRORS, never a pinned test count.
- app/data = 15 GB untracked. 33 API route modules. ~140 modules in src/dynasty_genius.
- Frontend: React 19.2.7, Vite 8, TS 6, Zod 4, vitest. 19 test files / 96 src files.

## VERIFIED DEFECTS — the correctness backlog
1. **RETRACTED 2026-08-20 — DO NOT EDIT THE LAMBDA.** An earlier version of this brief said
   `XVAR_LAMBDA_ENGINE_B['TE']` should be 0.703 rather than 0.648 and that every TE was undervalued
   ~8%. **That was wrong and acting on it would introduce the error it claimed to remove.**
   The three constant families are algebraically COUPLED:
     dvs = ppg / P90[pos] * 100 ; replacement_dvs = repl_ppg / P90[pos] * 100 ;
     lambda[pos] = P90[pos] / P90[WR]
     => xvar = (dvs - replacement_dvs) * lambda = (ppg - repl_ppg) * 100 / P90[WR]
   **P90[pos] cancels exactly.** xVAR does not depend on the position's own P90, so the P90 drift
   never reaches cross-positional comparison. Verified numerically: 20.7746 via constants vs 20.7586
   via the cancelled form. Editing lambda alone yields **+8.5% error**.
   **The real TE defect is the CLAMP, an ordering problem, not a scaling one.** Because TE's P90 is
   understated (9.4 vs 10.28 on current data), TE DVS inflates and more TEs hit the 100 ceiling:
   11 of 89 TEs clamped, versus QB 0/37, RB 5/99, WR 6/163. The top of the position flattens into
   ties. If the constants are ever moved, ALL THREE dicts move together.
2. **Bootstrap defect** in `eval/backtest_metrics.py` `compute_ndcg_diff_bootstrap`: `_diff` passes the
   ORIGINAL pool's ranks into each resample while `compute_ndcg` rebuilds IDCG from the RESAMPLED
   relevance vector. **42.3% of replicates produce NDCG > 1.0 (impossible).** Width inflation
   QB 75% / RB 82% / WR 83% / TE 84%. Point estimates unchanged to 4dp. `ndcg_diff_bca_ci95` is
   ORPHANED (no consumer/gate/surface) so blast radius is one function.
3. **Archive gaps.** `model_forward_capture` has 56 of 57 days — **missing 2026-08-12**.
   `fc_forward_capture` is complete (57/57). `market_divergence_history` missing 4 days
   (07-10, 07-12, 07-17, 08-12). Health check already reports this to a surface nobody reads.
4. **Engine A models are cross-version pickles** — `app/data/models/*.pkl` written by sklearn 1.6.1,
   runtime is 1.8.0, warns "may lead to breaking code or invalid results" on every load.
5. **`market_divergence_rebase.py:166`** is complete and called by NOTHING. Independent measurement of
   the mismatch it fixes: 131 of 336 rows reclassified, 10.72pp mean absolute, +/-1 boundary
   sensitivity. (Do NOT cite the widely-quoted 10.67pp/127-of-338 — the repo's own ledger marks it
   contamination-only.)
6. **`POST /api/trade/analyze`** is the only route declared `-> dict` with no `response_model`; it ships
   `"Likely_Favors_You"` / `"Likely_Favors_Opponent"` today, bypassing every schema invariant.
7. **`/api/health` costs 16s** (7.96s capture-health + 8.01s tier-readiness, two unmemoized paths).
   Player view costs 0.76s parsing 53,276,093 bytes across two uncached artifacts of 12,222 players
   each — on every request AND every Trade Lab keystroke.
8. **leakage regex** `engine_a_contract.py:71` blocks `value_over_replacement` and `market_share_yds`
   while PASSING `sleeper_adp`, `fp_ecr`, `fantasycalc_value`. Also `_rank$` can never fire in
   `leakage.py:52` (uses `regex.match`, anchored) but fires everywhere in
   `validate_training_csv.py:57` (uses `.search`).

## OPS STATE (changed today)
- Scheduled wake **6:00 AM daily** via `pmset repeat wakeorpoweron` — VERIFIED LIVE. Previously the Mac
  slept after 1 minute on AC with no wake, which is the likely cause of the 08-12 gap.
- **Installed today**: `com.davidleess.dynasty-league-transaction-capture` (06:30) and
  `-nflverse-usage-capture` (06:15), symlinked from `ops/launchd/`, loaded, `RunAtLoad=false`.
  First scheduled run 2026-08-21. `league_transactions.db` last advanced 2026-08-07 (13 days lost;
  transactions are NOT recoverable by re-reading — `daily_control.py:235`).
- Full daily chain: 06:15, 06:30, then 09:00 fc-snapshot, 09:15 feature-refresh, 09:20 league-capture,
  09:30 model-pvo-refresh, 09:35 league-opportunity-map, 09:40 market-divergence-refresh,
  09:45 what-changed-report, 10:00 roster-capacity-audit + realized-outcome-scoring,
  10:15 backup-irreplaceable. **12 wall-clock offsets, no dependency edges** — a slow upstream job
  silently feeds stale data downstream.
- **Cockpit backup has never succeeded** — exit 127, PATH cannot resolve `node`; `claude` and `agy`
  fail the same test so fixing node alone will not clear it.

## MODEL STATE — the honest position
Engine B: Ridge, R2 0.621 / Spearman 0.775 on 752-row holdout, beats naive 3/3. BUT:
**all 16 model-vs-market NDCG confidence intervals straddle zero** (straddle ratio 8x to 758x).
QB loses to free `dynastyprocess_ecr_2qb` on 3 of 4 folds. WR passes G3 on a 3-of-4 sign count over
noise. **The measured position is not "we lose to consensus" — it is "we carry no measurable
information beyond a free source this repo already ingests."**
Engine A (rookies) is stale: 3-feature pick/round/age, WR C / RB C / TE C / QB D.

## PRODUCT LAW — as amended and APPROVED by David 2026-08-20 (Revision 2)
- **A1 (allow recommendations) WITHDRAWN.** The product will NOT say buy/sell in 2026. This is an
  evidence decision, not a rule: with no measurable information beyond free consensus, a recommendation
  surface grades consensus with extra steps and charges an anchoring cost. Silence = the default of
  HOLDING, and holding is currently optimal (David trades ~2x/season; more trades = more variance
  against counterparties pricing off the same source).
- **A4 HOLDS and is promoted**: no amendment ships its restricting half without its enabling half.
  Plus the MIRROR OBLIGATION: a repeal ships with re-ratification of every gate that cited it.
- **A3 (a rule must name its danger)** — forward-only, with a structural docket mechanism.
- **A2/A7 revised**: repeal the two runtime denylist filters (`players.py:174-189`,
  `roster_audit_models.py:115-123`); KEEP `league_pulse.validate_tokens` (allowlist over structural
  token identity) and the build-time integrity check.
- **A5 (diagnostic lane)** survives ONLY with `validate_no_prohibited_features` left ARMED on that lane.
- **A6 main half WITHDRAWN** — dropping the market denylist while A5 opens a diagnostic lane would
  remove the only runtime guard on the assembled training CSV. Only the regex FIX survives. Also
  `head_b`'s "MARKET_PROHIBITED_COLUMNS" is really a post-NFL temporal guard and must be renamed, not
  deleted.
- **REFUSED: do not drop `CI_WIDTH_MAX`** (`composite_gate.py:19`). QB fails 2 folds (2020 w=0.4048,
  2022 w=0.4131); its real disqualifier is 2022, a MATURE fold the cold-start exception declines to
  excuse. Dropping it would certify a model that loses to free consensus.
- **Ruling 10**: composites of ONE lane's own outputs with disclosed construction + stated interval,
  DESCRIBING A PLAYER, are legitimate. **Ranking ACTIONS by any scalar is not.** Today
  `league_opportunity_map.py:518` and `roster_cut_engine.py:171,359` sort actions by raw xVAR.
- **PPG = ALL GAMES incl. postseason** (David 2026-08-19). Definition lives in THREE sites; DG-024
  covers two — the third is `qb_ppg_labels.py:817-822`. Zero-snap eligibility still undecided.

## HIGH-VALUE, ZERO-REPEAL WORK IDENTIFIED
- **Replay the 39 historical trades** (league completed 12/11/9/7 across 2023-26). Pin both lanes on
  each transaction date, replay forward. Zero new data, no realized outcomes needed. Measures the
  selection function at ~13x the forward ledger's lifetime sample. Called "the strongest thing
  shippable this month."
- **The self-consistency clock**: 57 days of captures already answer "what did you say then", lane
  lead-lag, and a stability ledger. Needs no realized outcomes and is NOT calendar-gated.

## GOVERNANCE POSTURE
David turned PROCESS governance to near zero on 2026-08-18. No approval gates, no ticket ceremony, no
mandatory falsifiers. **The one habit kept: say the command you ran.** Do not reintroduce ceremony.
Material irreversible acts still need his word: storage cutover, identity cutover, model promotion,
outcome-finality authority, `decision_supported` criteria, new paid sources, external writes.

## DAVID'S RULING — League Activity strip (2026-08-20)
> *"i will be able to add league activity after week one - but i do need to have it"*

**League Activity is DEFERRED out of the 15-day sprint, NOT cut.** It is a committed deliverable for
**week 1 of the season (on or before 2026-09-17)**, built off the `league_transactions.db` that SR-08
recovers during the sprint.

Consequences for the sprint budget:
- Do NOT convert SR-17's conditional 1.5d into a committed League Activity strip inside the sprint.
- **SR-17 is still dropped** (its consumers are the two sites Ruling 10 forbids ranking by a scalar).
- Those 1.5 days return to SLACK, not to new work. Committed lands near ~9.5d against 11 available,
  restoring roughly 1.5 days of margin — which the pressure test showed the sprint badly needed
  (1.25d of slack was called "one surprise", and PT-3 alone found a ticket understated ~2x).

**The sprint must leave League Activity BUILDABLE**: SR-08 must land the transaction recovery and
SR-10a/SR-11 must cover the store, so the strip is a read-only surface over data already flowing
rather than a new capture path built under season pressure.
