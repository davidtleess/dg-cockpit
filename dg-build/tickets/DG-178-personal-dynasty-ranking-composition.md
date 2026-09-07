# DG-178 — A tested foundation for David's dynasty rankings

**Layer:** 3 → 4 · **State:** todo · **Lane:** Davids-MacBook-Pro-25057

**What's missing:** Production, availability, rookie qualification and career retention have different units, populations and clocks; their current descriptions do not prove that combining them yields David's expected future lineup value.

**How we know:** DG-165's preserved README multiplies P(ever qualifies) by a conditional veteran retention path; `rookie.py:19` defines qualification differently from Engine A's played-game filter. DG-171 records David's replacement ruling. Assignment: `ORCHESTRATION-2026-09-06.md`.

**Done looks like:** A candidate ranking contract and executable assembler declare units, forecast date, season horizons, conditional events, source/model versions and league settings. Behavioral tests cover zero games, delayed rookie breakout, attrition, negative margins, a missing estimate, QB eligibility in Superflex, RB/WR/TE FLEX competition, and common cross-position units. Availability/qualification is counted exactly once under a demonstrated compatible decomposition. The app-facing result preserves player identity and explicit model coverage, gives one focal value per player when supported, and keeps research estimates visibly distinct from served values. A read-only audit exercises David's actual roster and the named young-QB/TE gaps; integration adapters may use clearly labeled fixtures while model candidates are under validation. No invented probabilities to fill coverage.

Preserve David's 'next who is actually available' replacement decision, one-number display, and the separate fantasy-market comparison. Do not silently change replacement policy, posture, uncertainty presentation or promote a candidate. Use DG-066/171/172 as context and record any football choice for Codex to bring to David. Review DG-168's preserved mixed-scope branch read-only; do not land it or extract its rookie estimator into production.

**Composition review, before implementation:** Name the output's basis explicitly: value above obtainable replacement is not automatically marginal lineup gain. The latter requires comparing feasible lineups with/without the player under common scenarios. Test a healthy bench QB who beats the free-agent QB but adds zero points to an already stronger QB+SF lineup that week. Future replacement assumptions need their own horizon and sensitivity evidence; today's waiver inventory is not known several years forward. DG-171's automatic posture-to-replacement-depth mapping is a proposal, not authority to change David's available-replacement rule. Time preference, depth value and roster fit are different concepts.

---

## Lane response — 2026-09-06 09:2x ET, davidleess-cb (PID 25057), worktree `~/dg-wt/DG-178` from `origin/main` `ecc260ef`

Codex is not reachable by session message from this seat (`SendMessage` → "No agent named 'Codex orchestrator' is reachable"), so the proposed interface is recorded here.

### The minimal shared interface (what every producer hands the assembler; the assembler only weights and sums)

```
HorizonTerm
  h: int                       0 = the NFL season that starts after forecast_date (2026 for a 2026-09-06 forecast) … H = 5
  season: int                  the calendar season h refers to — declared, not inferred
  ev_above_replacement: float  UNCONDITIONAL expected points-per-game above the position's replacement rate in season h.
                               Unconditional = already integrated over the producer's OWN availability/qualification event;
                               a season he does not contribute counts 0, never negative.
  conditioning_event: str      the exact event the producer integrated over, in words

TermSet (one per player per producer)
  player_id, position, forecast_date (information cutoff)
  producer: {name, version, estimate_class: served | candidate | fixture}
  replacement_ref: {position, policy, rate_ppg, snapshot_id, horizon_assumption}   which bar was subtracted; future seasons are an
                                                                                   explicit scenario ("held_constant_from_snapshot")
  terms: list[HorizonTerm]     may be shorter than H with a stated reason
  coverage: full | partial | none, reason
```

Assembler: `V(posture) = Σ_h d^h · ev_h`, `d` from an explicit `Posture` (never inferred; the audit reports d = 1.0 and a contend value side by side).
Output: one focal value per player, `basis = "value_above_obtainable_replacement"`, coverage, producer metadata, replacement_ref, posture.
Served DVS passes through untouched in a separate field; candidate/fixture values never occupy it. One unit for every position, so
cross-position comparability is an invariant of the assembler, not a per-position rule.

**Marginal lineup gain is a separate basis**, produced only by comparing feasible best lineups with and without the player under the
snapshot roster and eligibility (QB → QB/SF; RB/WR/TE → own slot/FLEX/SF). Never the focal value.

### What each forecast lane owes, so the decomposition is demonstrably compatible
- **DG-177 (veteran):** per season h, EITHER `(P(event at h), E[ppg | event at h])` on ONE declared event, OR `ev_h` directly. The adapter
  multiplies only within the same h and the same event string; mismatched event strings are refused, not composed.
- **DG-165 (rookie):** per season h, `P(qualifies at h | draft capital)` and `E[ppg above replacement | qualifies at h]`, or `ev_h`
  directly. **Not** `P(ever) × a level-conditional retention path`: "ever" has no clock and "the level he reaches" is the unknown.

### Five compatibility findings on today's inputs
1. **Three events, two clocks.** Engine B / availability event = "≥ `MIN_GAMES_THRESHOLD`(4) games in t+1 OR t+2"
   (`src/dynasty_genius/models/availability.py` `EVENT_DEFINITION`); survival-cell cohort = "rank ≤ QB37/RB45/WR71/TE21 by REG-season
   total PPR" (preserved `CANONICAL.md`); DG-165 label = the same bar-rank event, "ever". The contract records them; it does not
   pretend they match.
2. **The served value is a 2-season-window quantity.** `P(window) × E[avg ppg over window]` used as the h=0 term overstates h=0
   availability (`P(A ∪ B) ≥ P(A)`). Declared approximation until DG-177 supplies per-season P.
3. **Replacement arithmetic.** The unconditional h=0 value is `P × (E − R)`, not `P × E − R`: losing him means fielding the
   replacement, not fielding zero. Served `xvar` subtracts an undiscounted bar (`pvo_assembler.py` xVAR block). The candidate uses
   `P × (E − R)`; the served number is untouched. Moves candidate numbers for low-P players.
4. **`ev_h = ev_0 × R(h)` drops the return-after-non-qualification path** (13% of exits reverse within a year). Biased low for
   low-P players. Declared.
5. **The served artifact publishes no `availability_p`.** Checked `universe_pvo_runtime.json` captured 2026-09-06T13:00:53Z:
   4,041 skill rows, 582 scored (502 Engine B, 80 Engine A); no availability field at row or valuation level. P is recoverable
   exactly as served ÷ projection on UNCLAMPED B rows, only as a bound on clamped rows, and not at all for the 80 Engine A rows.
   **Request to the producer lane: publish `availability_p` per row.** Until then the adapter derives it on unclamped rows and marks
   clamped/A rows partial with the reason.

### Football choices recorded for David (defaults preserve rulings; none decided here)
a. Replacement bar = the best actually-available player's served value, held constant across horizons as an explicit scenario.
   Band-averaging is a parameter defaulting to 1 (= max), so the 09-05 ruling is preserved unchanged.
b. A veteran at or below the bar carries **0.0, not blank**, with reason "below replacement"; delayed veteran breakout is unmodelled
   by a cell keyed on a positive margin.
c. A player whose P cannot be recovered gets **no** unconditional value (coverage partial, reason stated) rather than an assumed P = 1.
d. The h=0 term is a RATE (ppg); the cells' ratio is on season totals. `CANONICAL.md` already flags rate-vs-total as chosen, not
   derived. Unit declared as ppg-above-replacement season-equivalents.

### Evidence — 2026-09-06 09:3x ET, worktree `~/dg-wt/DG-178` (unlanded)

Built and tested, TDD (every test watched red first): `src/dynasty_genius/ranking/` (contract, assembler,
league_settings, replacement, survival_cells, served_rows, lineup_gain, adapters/veteran_served,
adapters/rookie_fixture), `scripts/dg178/audit_roster_coverage.py`, `tests/ranking/` **67 passed**
(`.venv/bin/python -m pytest tests/ranking -q`). Full write-up: `docs/ranking/DG-178-value-contract.md`.

**Read-only audit run `20260906T133032Z`** (artifact 2026-09-06T13:00:53Z sha `5bc37f82a87d`, unchanged
across the read; snapshot `league-20260906T130052Z`; cells sha `fafb2ef0908e`; read from TRUNK paths —
the worktree's runtime dirs are private and empty):

- David's roster 27: **21 full · 1 partial · 5 none.** None = 4 Engine A rookies (Mendoza, Cooper,
  Bell, Black: no `projection_2y`, the rookie lane owes their terms) + Tank Dell (no served score).
  Partial = **Jaxson Dart**, his highest served asset: `QB <=23 m1` cell suppressed, n=10 < 12 — h=0
  known, future a stated absence, no neighbour borrowed.
- League rostered: 212 / 7 / 54. Skill universe 4,041: 495 / 7 / 3,539 (3,459 unscored, 80 Engine A).
- Seven of his 21 valued players are below the bar → **0.0, not blank** (Ali, Allen, Mitchell,
  Legette, Bryant, Harris, K. Williams). Replacement: QB Rattler 9.41 · RB Estime 6.67 · WR Mims 7.40 ·
  TE Parkinson 7.36 served ppg.
- **DG-176's mechanism, verified on this artifact, is one step off:** Mendoza/Simpson/Sadiq are Engine
  A rows and never reach the cells; the suppressed-young-QB-cell shape bites Dart instead.
- Marginal lineup gain (active roster, served h=0 rates, taxi/IR excluded): Dart 5.11, Jeanty 2.67,
  Washington 1.55, Barner 1.37, McCarthy 1.17 (fills SF with Mendoza on taxi), others ≤ 1.03 or 0.0.
  Run `132925Z` is superseded: it let taxi/IR start and showed Mendoza a 2.8 gain he cannot deliver.

**Open, owed by other lanes (not blockers to this increment):**
1. `availability_p` per served row (producer) — recovered here as served/projection on unclamped rows.
2. Rookie per-season terms (DG-165, lane 24974). 3. Per-season veteran P and E on one event (DG-177).

**Football choices for David are listed in the doc §"Football choices" (a–f); none decided here.**

### Evidence — 2026-09-06 09:4x ET, rookie candidate wired (unlanded, checkpoint on `ticket/DG-178`)

Lane 24974 delivered `dg165_rookie_capital_v1` (80 drafted 2026 rookies, `p_qual_year1..5` on the cells' bar-rank
event). Read by `adapters/rookie_candidate.py`: their season j=1 is our h=0; joined on `(position, draft_season, pick)`
because the served artifact has **no `gsis_id` for any 2026 rookie**. The file carries no `E[ppg | qualifies in j]`, so
**run `20260906T134009Z`** shows David's roster **21 full · 5 partial · 1 none** — the four rookies are now partials
with their probabilities quoted (Mendoza 0.893/0.953/0.856/0.866/0.850; Cooper 0.540…; Black 0.293…; Bell 0.204…),
not blanks and not numbers. Lane 24974 is adding `e_ppg_given_qual_year{j}` + `p_qual_year6` (announced 09:38); the
adapter consumes both without change. **Undrafted rookies rostered anywhere in the league: 0** (measured, reported to
lane 24974). **Finding 6:** rate denominators differ — Engine B all-games (DG-024) vs REG-season stat-row games
(cells, rookie level); carried on the rookie terms verbatim, not absorbed.

Two board horizons assembled side by side (six seasons = cells' reach, five = rookie file's reach): same order on his
roster, values 8–17% lower on five. **Which horizon the board sums is a Codex/David call.** 83 tests pass.

### Evidence — 2026-09-06 09:4x ET, FINAL for this increment (`ticket/DG-178`, three commits, unlanded)

Lane 24974's v2 (`~/dg-wt/DG-165/runs/20260906T133904Z/`, csv sha `bdd759fab1df`) carries `p_qual_year1..6` and
`e_ppg_given_qual_year1..6`. **Audit run `20260906T134341Z`: David's roster 25 full · 1 partial (Dart, suppressed
QB ≤23 cell n=10<12) · 1 none (Tank Dell, no served score).** League rostered 257/7/9; universe 575/7/3,459 (the 3,459
are unscored rows). DG-176's three names all carry a value now — from probabilities and levels, no cell involved.

**The lane's own measurement of its level rides on every rookie term:** under-predicts out of time by 0.6–1.1 ppg at
every season; RMSE gain over the position-mean comparator −3% to +6%. **Not corrected here** (a producer change).

His roster at d=1.0, six seasons (served DVS beside): Mendoza **30.20** (70.73 A) · Jeanty 27.44 (57.6) · Henderson
25.54 (47.9) · McCarthy 20.94 (56.8) · Burden 18.34 (44.3) · Cooper 15.75 (44.86 A) · Kraft 14.62 · Washington 14.62 ·
Dart — (76.4, cell suppressed). At d=0.6 Jeanty 11.83 leads Mendoza 11.64: **the posture toggle acts at the top of his
roster.** Universe inspection order at d=1.0: Jeremiyah Love (rookie RB) 54.19 first, Smith-Njigba 50.53, C. Williams,
J. Allen, Nix, Gibbs; Tate 15th, Mendoza 18th. **Not a board, not validated**; the candidate order disagrees with the
served DVS order and that disagreement is reported, not resolved.

**Football/science choices for Codex → David, added by the rookie integration:** (g) quote vs correct the level's
bias; (h) six- vs five-season board horizon (both assembled, six led only because the cells reach six); (i) reconcile
the two rate denominators (REG stat-row games vs all games) at the producer, not in the adapter.

85 tests (`tests/ranking`), all watched red first; full existing suite 7,161 passed / 33 skipped before the rookie
adapter; ruff clean via the pre-commit hook. Write-up: `docs/ranking/DG-178-value-contract.md` in the worktree.

---

## Round-1 response — 2026-09-06 10:2x–10:4x ET, `ticket/DG-178` (unlanded; da210bdf preserved, four commits on top)

**Queue status (REVIEW-2026-09-06-ROUND1.md, lane 25057):** items 1, 3, 4, 5, 6, 7, 8 built and tested; item 2 agreed
with both lanes (below). 109 tests, each watched fail first; ruff clean via the pre-commit hook.

1. **Comparability is typed.** `TargetSpec` (scope, scoring, exposure, event, clock, quantity, cutoff — all closed sets)
   on every term; a term without one is refused; units derive from the typed quantity. The assembler classifies readiness
   on typed fields alone (`comparable / research_only / incomplete / none / unclassified`), separate from numerical
   coverage, and the comparable-only path returns `value=None` with the mismatched fields as the reason, identity kept.
   Both legacy compositions are typed as what they are and a test pins that they can never come out comparable.
2. **Annual target contract — AGREED with lanes 24974 and 23481 (their "recorded" messages 10:3x ET).** Per player and
   NFL season j: REG scope, nflverse weekly `fantasy_points_ppr`, exposure = stat-row games, event A_j = appears;
   `p_appear_year{j}`, `e_points_year{j}_given_appear`, `e_games_year{j}_given_appear`, and the unconditional
   `e_points_year{j}`, `e_games_year{j}` (points and games exactly 0 when absent); NaN + `identity_status` for
   unresolved identities; manifest with cutoff, label window, scope, exposure, shas, per-quantity grading against a
   training-only baseline. **Estimand:** `C_ij = max(0, E[points_ij] − R_j·E[games_ij])`, R_j = replacement's expected REG
   points per stat-row game (available-player rule, held constant); the max is the season-level bench decision, stated as
   a policy; weekly-optimal is an upper bound not computed. **Lane 23481 limits: j ≤ 2 only, players with a 2025 feature
   row only, folds 2018–2023 → the comparable board is a TWO-season board for everyone.**
3. **Ages:** the cells were cut right-inclusive on exact age (`rebuild_fixed.py:52`); fractional ages now bin correctly
   (23.5 → 24-25, 31.5 → 32+; outside (19,45] → none). Served whole-year ages are looked up as k+0.5 with the basis on the
   term. **Consequence:** Dart moves into a published cell (full); McCarthy 20.94→11.79, Henderson 25.54→18.31 (research).
4. **Rookie clock:** a 2026 file on a 2027 forecast date is refused (vintage), not shifted; non-finite probabilities,
   levels and term values refused.
5. **Lineup gain:** duplicate identity refused; adding a rostered player is the remove-one counterfactual.
6. **Below the bar today:** 0.0 at h=0, seasons 1–5 an unmodelled partial — not six zeros.
7. **Audit re-run `20260906T143500Z`:** denominators = every roster id; duplicate Sleeper ids refused (none); Travis
   Hunter labelled outside the skill population (artifact position DB), not lost. **David's 27: 0 comparable · 19
   research_only · 7 incomplete · 1 none.** League 274: 0 / 205 / 59 / 9 (+1 outside). Universe 4,041: 0 / 254 / 328 /
   3,459. Replacement pool census per position (unrostered / scored / eligible): QB 430/30/25, RB 852/61/58,
   WR 1,683/138/115, TE 803/89/73 — best SCORED ≠ best OBTAINABLE, stated. Dell: no served score, nothing invented.
8. **Write-up corrected:** the "rookie-leading order cannot be optimistic" claim is withdrawn; the doc now carries the
   estimand math, the typed spec, and the historical-withheld-season validation plan, which cannot run until producers
   emit the annual target (none does yet).

**Next concrete step:** reader adapters for lane 23481's j ≤ 2 annual outputs and lane 24974's v3 when their run paths
arrive, then the first comparable two-season board and its historical grading. Independent work meanwhile: none of
substance remains in this lane's queue; the fixture adapter already exercises the comparable path end to end.

### Addendum — 2026-09-06 10:5x ET: the annual-target reader is built ahead of the files

`adapters/annual_candidate.py` reads the agreed shape (`p_appear_year{j}`, `e_points_year{j}_given_appear`,
`e_games_year{j}_given_appear`, `e_points_year{j}`, `e_games_year{j}`, `identity_status`; manifest `forecast_cutoff`,
`forecast_year`, `label_window`, `scoring_scope`, `scoring`, `exposure_definition`, `event`, `seasons`). It refuses a
file whose typed fields are not the annual target, checks unconditional = p × conditional on load, refuses a wrong
vintage, treats unresolved identities as a stated absence, and builds `C_ij = max(0, E[points] − R_j·E[games])` with
R_j from the same producer's unrostered rows (best available by expected season points; his own per-game rate per
season — typed scenario `same_player_from_snapshot_per_season`). Verified end to end on a fixture: comparable
readiness and a two-season value under the typed board. **Both lanes' files drop in with no code change.** 118 tests.
Full suite at the previous checkpoint: 7,270 passed / 33 skipped.

**Football choice (h) added for Codex → David:** on the annual target the bar player is chosen by unconditional
expected season points (availability inside, matching the served-rate ranking spirit) and R_j is his conditional
per-game rate. The alternative — choose by conditional rate — picks a different man when a high-rate player is often
absent. Defaulted to the former; parameter, not a ruling.

### Round-1 close — 2026-09-06 10:5x ET: STOPPED at the review's stop condition (producer files outstanding)

The comparable path is wired end to end: `compose_annual_term_sets` + `scripts/dg178/audit_roster_coverage.py
--annual-csv/--annual-manifest` (one pair per producer) build the replacement from each producer's unrostered rows,
sum the shortest reach the producers share, and print the comparable-only board with David's roster on it.
Smoke-tested on the fixture in the agreed shape (2 seasons summed, readiness comparable; written to scratch, not `runs/`,
because a fixture is not a forecast). 119 tests; ruff clean; branch tip on `ticket/DG-178`, tree clean, da210bdf preserved.

**Exact blocker:** no producer has emitted the annual target yet. Lane 23481 will supply j ≤ 2 (report-only);
lane 24974 v3 is regenerating to the contract. When either run path arrives, one audit command produces the first
comparable board and its `report.json`; the historical withheld-season grading described in the doc can then run.
**No independent work of substance remains in this lane.** No merge, promotion, restart, shared-data write or
dependency change was made.

### Addendum — 2026-09-06 11:0x ET: reader extended for lane 24974's announced v3 shape (pre-file)

`adapters/annual_candidate.py` now reads the nested manifest (`forecast_date.forecast_cutoff`, `units.scoring_scope`,
`units.exposure_definition`, `definitions.appearance`) through a closed prose→literal table that refuses unrecognised
values, and joins rookie rows on `(position, draft_season, pick)` when no Sleeper id exists. 122 tests. Waiting on the
v3 run path (est. ~11:10 ET) to produce the first comparable board for the 80 rookies; the veteran side stays
research-only until lane 23481's j ≤ 2 outputs exist, so a MIXED comparable board is not yet possible.

### Addendum — 2026-09-06 11:1x ET: first annual producer file integrated (lane 24974 v3) — result 0 comparable, honestly

`~/dg-wt/DG-165/runs/20260906T144444Z/` loaded after three parser fixes on my side (interval columns beside season
columns; a scoring type wrongly matched from a NEGATED denominator note; comparability now typed on `labels_through`,
not the calendar day, so a 09-01 and a 09-06 pre-season forecast are the same vintage).

**A wrong run caught and kept as evidence (`144913Z`): 80 comparable players all at 0.0.** Two causes, both fixed with
tests: rookie rows have no Sleeper id, so the rostered check never matched and Mendoza became his own bar (identities
are now resolved through the artifact by the pick join); and a rookie-only producer can only offer rookies as "the next
actually available", which is not the league's next available at any position. The bar is now computed over the UNION
of producers and checked for completeness against every scored unrostered player in the artifact; an incomplete bar
builds no comparable value.

**Run `145059Z` (honest):** 0 comparable · 80 incomplete · 3,961 none. Each rookie's reason: "replacement pool
incomplete: 25 scored unrostered QB not forecast by any producer (e.g. Joe Milton)" (RB 60, TE 74, WR 124). **The
comparable board therefore waits on lane 23481's veteran annual file — which covers the unrostered pool (505 feature
rows) — and will sum two seasons.** 128 tests; branch tip on `ticket/DG-178`, tree clean.

### THE FIRST COMPARABLE BOARD — 2026-09-06 ~11:10 ET, run `20260906T150758Z` (both annual producers)

Lane 23481's veteran annual file (`~/dg-wt/DG-177/runs/20260906T145606Z/`, 505 rows, seasons 1–2) + lane 24974's
rookie v3 (`~/dg-wt/DG-165/runs/20260906T144444Z/`, 80 rows, seasons 1–6) → **582 comparable on the typed annual
target, two seasons summed, every position's bar complete** (3 veteran rows not identifiable in the artifact, noted).
Join: the veteran `player_id` IS the artifact's `dg_player_id` (gsis-shaped; `identity_ids.gsis_id` is null on every row).

**An estimand correction forced by the data:** R_j was the bar player's points per game he appears in; the best available
QB and RB are part-time players (Rattler 8.5 games, Estime 8.3) whose per-game rates zeroed Henderson and Barner. **R_j is
now E[points_j]/17, the bar player's expected points per league week**, his absences counted as nothing (a floor on the
pool). A full-time player is 0.0 exactly when his expected points trail the bar's — CANONICAL.md's zero test. Run
`150343Z` (per-game version) is kept as the evidence. Bars: QB Rattler 6.27/wk · RB Estime 5.23 · TE Parkinson 6.88 ·
WR Mims 6.51 — the same four men the served-rate rule picked (a consistency check, not validation).

**David's 27 on the comparable board (season points above replacement, two seasons, d=1.0):** Mendoza 280.3 · Dart 261.4
· Jeanty 207.7 · McCarthy 155.9 · Washington 150.6 · M. Jones 143.2 · Henderson 142.8 · G. Wilson 131.9 · Odunze 125.0 ·
Kraft 116.0 · Cooper 88.8 · Gabriel 85.6 · Burden 84.9 · Black 75.6 · Ayomanor 64.9 · Dike 54.5 · Barner 45.8 ·
T. Johnson 40.3 · Bell 26.3 · Mitchell 24.6 · Bryant 22.3 · Legette 19.9 · B. Allen 18.4 · Harris 7.6 · Ali 0.0 ·
K. Williams 0.0 · **Tank Dell: none** (no 2025 feature row; not forecast by any producer). Universe top: Love 384.3 ·
Maye 381.7 · Nacua 365.6 · J. Allen 352.9 · C. Williams 338.9.

**Producer grading rides on every term** (from lane 23481's `results.json`, mechanically): QB season 2 "does not beat the
training-only baseline on unconditional points (RMSE 92.1 vs 89.6)"; all other veteran cells beat theirs. **Not
downweighted or dropped — a policy choice recorded for Codex.** Rookie-term grading reader in progress (their
`evaluation.json` shape). 137 tests; branch tip on `ticket/DG-178`, tree clean.

**Still not validation of the assembled value:** the historical withheld-season grading of `C_ij` itself (doc §Validation)
has not run; it needs both producers' historical per-player outputs on common seasons, which exist for veterans
(`historical_predictions.csv`) and rookies (`out_of_time_predictions.csv`) and is the next concrete step.

### Addendum — 2026-09-06 11:1x ET: both producers' gradings ride on their terms; final run `20260906T151055Z`

The rookie lane's `evaluation.json` (`annual["j"].e_points_year`, per position: RMSE, training-only baseline, bias) is
read like the veteran lane's `results.json`; every annual term now carries "beats / does not beat the training-only
baseline (RMSE m vs b, bias …)". Rookie season-1 points run **12 under on average (QB 19 under)** by their own grading;
QB season 2 on the veteran side does not beat persistence. Neither is corrected or downweighted here. Same 582
comparable / two seasons / bars complete as `150758Z`. 138 tests; branch tip `85b02434`, tree clean.

**Next concrete step (mine): grade `C_ij` itself on withheld seasons** from the producers' historical per-player
predictions with a STATED historical bar proxy (historical league rosters do not exist, so "actually available" cannot be
reconstructed; the proxy and its sensitivity will be reported, not hidden). Scoping now.

### THE ASSEMBLED VALUE GRADED ON WITHHELD SEASONS — 2026-09-06 ~11:15 ET, run `20260906T151423Z` (review item 8)

`scripts/dg178/grade_assembled_value.py` + `ranking/grading.py` (tested). Grades `C_ij` from both producers' historical
per-player predictions against the realised contribution under the same policy, per (position, season), vs each
producer's own training-only baseline arm. **Bar proxy, stated:** rank by PREDICTED expected points at DG-171's measured
midpoints (QB35/RB42/WR63/TE20), `R = e_points/17`, ±5-rank sensitivity reported (Spearman moves ≤ 0.05).

| cell | Spearman (pred vs realised) | top-k overlap | decision value vs producer baseline |
|---|---|---|---|
| veterans season 1 (2021–24) | QB 0.68 · RB 0.64 · TE 0.55 · WR 0.64 | 0.58 · 0.71 · 0.63 · 0.76 | above baseline at all four |
| veterans season 2 (2024–25) | 0.60 · 0.58 · 0.58 · 0.58 | 0.58 · 0.65 · 0.46 · 0.68 | above at QB/RB/WR; TE just below (3,238 vs 3,261) |
| joint season 1 (2021–24) | 0.68 · 0.61 · 0.52 · 0.62 | 0.54 · 0.67 · 0.58 · 0.71 | above baseline at all four |
| joint season 2 (2024–25) | 0.62 · 0.55 · 0.56 · 0.56 | 0.58 · 0.63 · 0.46 · 0.63 | above at all four |

**The comparability finding, measured on common seasons and one bar:** among started players, rookies' predicted `C`
runs **10–35 points BELOW what they realise** in most cells (e.g. WR 2023 −34.8, TE 2024 −59.6) while veterans run
slightly high (+0 to +16); rookies hold **8–17% of the realised top-k against 0–8% of the predicted top-k**. So the joint
board is comparable in KIND and biased against rookies in LEVEL — by the rookie producer's own measured under-prediction
(its evaluation: season-1 points −12 on average, QB −19). **Not corrected here; recorded for Codex/lane 24974.** Rookie-only
cells are skipped (a draft class is smaller than the bar rank); the joint cells carry the rookie evidence. 145 tests;
branch tip on `ticket/DG-178`, tree clean.

**This closes the round-1 queue for lane 25057.** Remaining choices are Codex's: QB year-2 handling, the rookie level
bias, the bar proxy for history, and the displayed horizon (the comparable board is two seasons by construction).

### CORRECTION — 2026-09-06 11:2x ET: the rookie history I graded is the PLAIN arm, not the arm on the board

Lane 24974 reports that in run `144444Z` `out_of_time_predictions.csv` and `evaluation.json` describe the PLAIN arm
(its `evaluation.json` carries `trend: false`), while `rookie_scores_2026.csv` — the file on the comparable board — comes
from the trend-selected arm (out-of-time season-1 bias about −3, not −12). **So the joint-cell finding above (rookies'
predicted C 10–35 below realised) describes the plain arm and is NOT evidence about the board's rookie values.** The
veteran-only and joint-veteran figures stand. The rookie lane is regenerating so evaluation and out-of-time predictions
describe the scoring arm; the joint grading will be re-run on that file and this entry updated. Until then the rookie
grading notes on the 2026 terms (read from the same `evaluation.json`) also describe the plain arm and are labelled so.

**Guard added (11:3x ET):** the contradiction was detectable from the files — `manifest.trend_experiment.decision =
"auto_trend"` (the scoring arm) vs `evaluation.json.trend = false` (the graded arm). `grade_assembled_value.py` now
REFUSES a rookie history whose graded arm differs from the scoring arm (override recorded), and the annual reader prefixes
every rookie evidence note with "GRADING OF A DIFFERENT ARM". Watched firing on run `144444Z` before being trusted.
Re-run of the joint grading waits on lane 24974's regenerated run (~15 min).

### RE-GRADE on the corrected rookie history — 2026-09-06 11:3x ET, run `20260906T151850Z` — the under-ranking finding is WITHDRAWN

Lane 24974's corrected run `151705Z` (evaluation + out-of-time predictions now the trend arm that scored the board; scores
byte-identical) passes the arm guard. **Joint cells, rookie bias among started players (predicted − realised), 2021–24:**
QB +7.5 / +1.4 / +7.9 / **−23.4** · RB −12.6 / +14.2 / +5.9 / +20.5 · TE +0.6 / +2.7 / +1.0 / +3.2 · WR +3.1 / +14.9 / −7.6 / +0.2.
Mixed in sign and mostly small (cells hold 9–35 rookies); the systematic 10–35-point under-prediction was the plain arm's.
**The "joint board is biased against rookies in level" conclusion is withdrawn.** One residual at QB 2024; the rookie
lane's own grading of the scoring arm shows season-1 QB bias −11.1, RB −3.2, TE +0.8, WR −2.0. Joint decision value stays
above the producer baselines at all four positions in both seasons; joint Spearman 0.53–0.68; bar-rank sensitivity ≤ 0.05.

Audit `151859Z` on the corrected run: board unchanged (582 comparable; David: Mendoza 280.3 · Dart 261.4 · Jeanty 207.7 …);
rookie evidence notes now describe the scoring arm. **Round-1 queue for lane 25057 closed; branch tip on `ticket/DG-178`,
tree clean; 147 tests.**


### ⭐ FOR CODEX / DAVID — the local preview, exact URL and command (2026-09-06 12:1x ET)

```
cd ~/dg-wt/DG-178
DG178_RUNS_ROOT=/Users/davidleess/dg-wt/DG-178/runs .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8787
open "http://127.0.0.1:8787/?surface=research-preview"       # API: http://127.0.0.1:8787/api/research/preview
```
Running now on **127.0.0.1:8787** (started by this session from the worktree; nothing production touched). It reads the
newest `runs/*/dg178_audit/report.json` in the worktree only. Two views on the page: **2-year** (annual producers) and
**5-year** (five-year veteran producer + rookies), switchable; the header states the scoring-window limitation
(full NFL regular season, NOT David's fantasy weeks; no recomputation done) and frames evidence as retrospective
historical evaluation with cutoffs enforced. Copy is football-readable ("research estimate", "forecast evidence
incomplete", the actual missing-data reason); producer ids and hashes live only inside each row's "Why" disclosure.

### Five-year veteran producer integrated — runs `161634Z` (audit) · `161528Z` (grading) · `161436Z` (universe)

Lane 23481's basic-horizon producer (`~/dg-wt/DG-177/runs/20260906T155259Z/`, 750 rows, seasons 1–5, evidence VERIFIED)
is typed as a **different producer on the same target** (different population: keeps one-game seasons, adds zero-game
rows after an active season; base appearance ≈0.6 not 0.8). Its reconciliation of my universe is ingested row by row and
doubles as an **identity bridge** (2,142 artifact rows gain a gsis). **Five-year board: 821 comparable.** David: Mendoza
731 · Dart 499 · Jeanty 411 · Henderson 282 · McCarthy 205 · M. Jones 200 · Washington 195 · **Tank Dell 0** (forecast
trails the reference in every season → replace; he is on the board, not absent). Universe: **one** rostered player
unforecast — Travis Hunter, stat-line position CB, outside the modelled set (a stated modelling choice, not mine).
Bars on this view: QB Flacco 121 · RB Estime 85 · TE Parkinson 114 · WR Mims 112 expected season-1 points.

**Evidence, as the producer states it:** years 1–4 supported on 14/12/9/5 folds; **year 5 graded once** — every year-5
term carries "graded on ONE fold". **My grading of the assembled value on its history (161528Z):** per-season Spearman
0.51–0.71; under the season-long decision metric the veteran-only candidate trails the persistence baseline at RB/WR/TE
in season 1 (e.g. WR 21,715 vs 34,801) while the producer's RMSE grading says it beats it — **the two metrics disagree
and both are reported**; k-season sums from one origin (k = 2..5, horizons joined on player and origin) are mixed in
sign across origins, TE consistently negative, no stable superiority.

Week scope corrected per Codex: the final fantasy week is NOT inferred from the playoff start; the page says a
full-season forecast is not a forecast of David's fantasy weeks and that no recomputation has been done.


### ⭐ ROUND-3 CHECKPOINT `96a683ab` (2026-09-06 ~12:50 ET) — Codex's six grading/evidence items + the surface gate

**Preview (rebuilt, restarted, isolated):** `http://127.0.0.1:8787/?surface=research-preview` · API `/api/research/preview` ·
serves audit run **`20260906T164337Z`** (captures beside it in `runs/20260906T164337Z/dg178_preview/`: desktop 1280 and
phone 390, viewport + full page + Why-open + five-year view; `capture-report.json` records 0 page errors, no horizontal
overflow at 390, first roster row at y=645 on the phone, was ~760). Start command from `~/dg-wt/DG-178`:
`DG178_RUNS_ROOT=/Users/davidleess/dg-wt/DG-178/runs .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8787`

**Grading fixes, each pinned by a failing test first (`tests/ranking/test_grading_round3.py`, 9 tests; 7 older tests
updated to the corrected rule):**
1. **Origin off-by-one** — every k-season origin is the FIRST FORECAST SEASON (veteran `feature_season + 1` read from the
   h=1 row's `forecast_season`; rookie `forecast_year`); rows carry `target_seasons`; a cell mixing them raises. Test:
   2022-features veteran rows pair with the 2023 rookie origin, never 2022.
2. **Policy columns only** — `policy_*` is the only read in the default mode; empty = UNAVAILABLE, counted
   (`unavailable_rows` / `unavailable_origins` in the reports); `legacy_arm` is an explicit flag that needs an arm column
   and was not used. Consequence on the annual 154635Z file: **season 2 and the two-season sum are NOT GRADED** (zero
   policy folds) — the API and the page say so; nothing is borrowed from the old plain/comparator folds.
3. **Cross-arm self-zero** — reference identity and realised outcome are shared; each arm subtracts ITS OWN forecast of
   that player. The reference scores exactly 0 under both arms; a retained loser keeps his negative outcome. Pinned.
4. **Bytes bound, fail closed** — scoring CSV + history CSV + evaluation file must each match the manifest's declared
   sha256 (a manifest declaring no history file is UNVERIFIED). Lane 23481's **corrected manifest** for 155259Z (fictitious
   `annual_forecasts.csv` entry dropped) is what is read. Recorded hashes: audit `annual_producers[*].csv_sha256 /
   manifest_sha256 / results_sha256 / evidence.bound_files`; grading `inputs.veteran_history.{sha256,binding}`.
5. **Intervals relabelled** — "90% bootstrap over players, conditional on this observed cohort and its reference; the shared
   reference error does not cancel when the arms' actions differ; not model, selection, season or forecast uncertainty"
   (in every cell and on the page). The producers' own intervals carry lane 23481's wording (sampling uncertainty
   conditional on fitted models).
6. **Reference scope** — "best among players WITH a forecast"; the eligible census travels with it (unrostered eligible
   players nobody forecast: **QB 368 · RB 727 · TE 667 · WR 1458**, reasons counted: no gsis mapping / left the cohort after
   two absent seasons / no NFL history); `census_complete=False` while `pool_complete` (every SCORED unrostered artifact
   player is forecast) stays a separate flag — I kept readiness on the forecast-pool flag and put the census in the copy,
   which is the "mark" branch of your instruction; if you want the census to GATE readiness, say so and the board goes
   to 0 comparable. The same-player-every-season rule is labelled a scenario, not a claim about future waiver access.

**⚠ A claim withdrawn.** Under the corrected rule the round-2 finding "the veteran candidate trails the persistence
baseline at RB/WR/TE in season 1 while its RMSE says it beats it" does NOT survive — it was an artefact of subtracting
the baseline's reference forecast from the candidate. Corrected numbers (163059Z annual · 163120Z basic, joint = both
producers, per-fold intervals conditional on the cohort): annual season 1, both together: QB/RB/WR/TE above baseline in
total on 3 folds (QB 2 clearly above 1 clearly below; TE 1 above 2 indistinguishable); veteran alone: QB below in total
(3 indistinguishable), RB/TE/WR above. Basic: seasons 1–4 above baseline in total at every position (14/12/9/5 folds);
season 5 one fold; k-season sums k=2..5 mixed by origin (e.g. 2-season joint QB 2017 +2,093 [1,240, 3,107]; veteran
3-season QB 2020 −507 [−1,355, 0]); the single 5-season origin (2021) is above zero at every position — one fold, not
support. No superiority claim anywhere.

**Surface (Codex's list):** "above/below reference" replaces keep/replace, lede says "not drop or trade advice" and the
details carry the counterfactual note; header separates the legacy 2-year veteran (season 1 evaluated on 3 folds, 2 of 4
positions within the interval; **season 2 not evaluated**) from the 5-year basic producer (14/12/9/5/1) with the adjacent
sentence "season 1 has some historical support; season 2 is experimental and has not been evaluated"; "source check
passed (file identity, not validation)" is the identity wording; producer ids only inside Why; the existing app score
moved behind Why and labelled "Existing app score (0-100; a different scale…)"; Tank Dell's two-year reason names the
five-year view that carries him (he is 0 there, every season below reference); the reference line carries the eligible
census and the scenario note.

**Boards:** two-year **584** research estimates (582 on 155204Z before the identity bridge filled two rows), five-year
**821**. David two-year: Mendoza 270 · Dart 206 · Jeanty 191 · Washington 160 · Henderson 134 · Odunze 115 · Cooper 108;
five-year: Mendoza 731 · Dart 499 · Jeanty 411 · Henderson 282 · McCarthy 205 · M. Jones 200 · Washington 195. Full
backend suite **7,363 passed / 32 skipped**; ranking 190; route 10; vitest styles 40.

**Open limitations (not fixed here):** (a) placement follows the served artifact's position — Bredeson (159) and
Nowakowski (169) sit at TE; lane 24974 has now captured Sleeper `fantasy_positions` (`~/dg-wt/DG-165/runs/20260906T164442Z/
eligibility_capture/`: Bredeson RB, Nowakowski TE, Hunter DB|WR → WR-eligible, Dell WR/Inactive, 20 of my 271 pool ids
Inactive) — integration is mine and is the next bounded step; (b) forecasts are full-NFL-season, not David's fantasy
weeks (stated on the page); (c) the two-year veteran season 2 is exported ungraded; (d) Hunter is unforecast (producer
modelling choice on a WR-eligible player, now known).


### ⭐ ROUND-3b CHECKPOINT `9487a7e0` (2026-09-06 ~13:05 ET) — composition consistency + Sleeper eligibility; FINAL for this cycle

**Preview (rebuilt, restarted):** `http://127.0.0.1:8787/?surface=research-preview` · API `/api/research/preview` · serves
audit **`20260906T165547Z`** (captures `runs/20260906T165547Z/dg178_preview_v2/`: desktop 1280 + phone 390, viewport, full
page, Why-open, five-year; 0 page errors, no horizontal overflow, roster row at y=626 on the phone). Same start command.

**Composition consistency (Codex's instruction after the rookie lane's Chris Bell observation):** both horizon views now
come from ONE set of per-season terms — the accepted basic five-year producer (corrected manifest, evidence bytes bound)
plus the rookie producer — with the same reference, scoring and snapshot; the 2-year number is the first two terms, the
5-year number the first five. Asserted in the audit on every player (**822 checked, 0 violations**: first two terms
identical, value(5) ≥ value(2)) and pinned on the assembler (`test_assembler.py`, prefix-sum test). The legacy two-year
veteran model (annual 154635Z) is served as a separately named **model comparison** in the research details, never as a
horizon toggle. Consequence on David's roster: two-year Mendoza 237 · Jeanty 166 · Dart 143 · Henderson 114 (the legacy
model reads 270 · 206 · 191 — a different model, shown beside it as such); five-year unchanged (Mendoza 731 · Dart 499 ·
Jeanty 411 · Henderson 282). Both views: 822 research estimates; Dell 0 on both (every season below reference).

**Sleeper fantasy eligibility integrated inside this adapter** (lane 24974's capture 164442Z, 12,226 rows keyed by
Sleeper id; sha recorded in the audit's `fantasy_eligibility` block): placement happens BEFORE the population filter —
**Travis Hunter (DB|WR) is now a WR row** (unforecast; his reason stays the producer's modelling choice, now on a
WR-eligible player), **Bredeson RB, Nowakowski TE**; 123 artifact rows move in total (mostly FB → RB, a Sleeper fantasy
position; "Player Invalid" is a Sleeper artifact). A missing field stays unknown, the NFL position is never
substituted. The universe (run 165051Z) uses the same rule; the bar player's NFL roster status rides on the reference
(QB Flacco, RB Estime, TE Parkinson, WR Mims — all **Active**); an Inactive bar would be said in words.

**Cross-reviews received:** lane 23481 — "RESEARCH PREVIEW PASS" on 96a683ab (seven checks by file and row; nit fixed:
the five-year support sentence now names seasons 1–4); lane 24974 — second pass 4/4 PASS with the placement gap (now
closed) and the reference-differs-by-view observation (now moot: one term set; a cross-view note fires automatically
if the references ever differ again). Full backend suite **7,372 passed / 32 skipped** (run after 9487a7e0); ranking 198 + route 12.

**Still true, said on the page:** research estimate, not complete dynasty value, not drop/trade advice; full NFL season,
not David's fantasy weeks; year 5 rests on one fold; the eligible census (QB 368 / RB 727 / TE 667 / WR 1457 unrostered
eligible players without a forecast) is copy, not a readiness gate — Codex's call if it should gate. No feature work
beyond this; nothing merged, promoted, served or written outside `~/dg-wt/DG-178` and this ticket.


### ⭐ FINAL RECEIPTS `8b6339a2` (2026-09-06 ~13:15 ET) — Codex's last two handoff checks done; server left up

**Preview:** `http://127.0.0.1:8787/?surface=research-preview` (API `/api/research/preview`) is UP on audit
**`20260906T171037Z`** and will stay up; captures `runs/20260906T171037Z/dg178_preview/` (0 page errors, no overflow at
390, roster row y=626 on the phone). Start command unchanged.

1. **Travis Hunter's reason is now the producer's, not an invented one.** Absent rows carry the producer's stated
   reconciliation reason verbatim by Sleeper id (`compose.absent_annual_term_sets(..., stated_reasons=)`), or say "no
   producer stated a reason". His row reads: *"Sleeper allows WR (DB|WR), but the veteran model currently excludes his
   two-position history (its source position is CB); no forecast yet."* Value stays None (never 0). Pinned in
   `tests/ranking/test_compose.py` and `tests/contract/test_research_preview_route.py`.
2. **Every published season list is cut to its view's horizon** (the five-year `league_rostered` list was the one that
   was not). Both views 822 research estimates; composition check 822 players, 0 violations.

**Receipts:** full backend suite **7,374 passed / 32 skipped** after `8b6339a2` (run from the worktree root); ranking
199 + route 13 + compose 9. Canonical for this cycle: commits `96a683ab` → `9487a7e0` → `b8595e77` (doc) → `640c6059`
(superseded run kept as evidence) → `8b6339a2`; audit `171037Z`; grading `163059Z` (annual, comparison) and `163120Z`
(basic, main); universe `165051Z`; Sleeper eligibility capture (lane 24974)
`~/dg-wt/DG-165/runs/20260906T164442Z/eligibility_capture/`. Nothing merged, promoted, served in production or written
outside `~/dg-wt/DG-178` and this ticket. No further feature work this cycle.


### ACK — resumed 2026-09-06 15:1x ET (date checked) on Codex's Week-17 queue (David: championship ends NFL Week 17)

First action, now: capture a DATED current-2026 NFL roster source (nflverse `roster_2026.csv`, raw public release, run-local
and immutable under `runs/<ts>/dg178_nfl_roster_capture/` with URL, HTTP timestamp and sha256) and build the current-player
census joined to lane 24974's full Sleeper eligibility snapshot (164442Z) and the league snapshot — test-first in
`ranking/nfl_census.py`. Rules I am holding: Sleeper active+team is NOT a current-NFL denominator; league-owned players stay
regardless of source flags (Dell included); classes active / injured_reserve / pup / nfi / practice_squad / suspended_or_exempt
/ not_on_nfl_roster / unknown; identity conflicts and missing joins explicit; the report states the exact denominator,
source hashes, coverage by reason × position and the full uncovered id list. Then the target contract for DG-179's shared
outcome (nflverse-default PPR, David's Week-17 window, pre-2021 week 16, equal weekly weighting; window identity bound and
mixed targets refused; no rescaling of old targets). Preview 171037Z stays running as the comparator. No merge, promotion,
shared writes, installs or production restart.


### Week-17 queue, step 1 done — `bb70ffbd` (2026-09-06 15:21 ET): dated NFL roster capture + current-player census; window typed

**Source (immutable, run-local, no shared cache):** nflverse `roster_2026.csv` →
`runs/20260906T191548Z/dg178_nfl_roster_capture/` — URL
`https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_2026.csv`, HTTP Last-Modified **Sun, 06 Sep
2026 11:28:11 GMT**, captured 19:15:49Z, sha256 `5ec59c52…ab55`, 2,946 rows, week 1 REG, statuses ACT/DEV/CUT/RES/RET/EXE.
Joined to lane 24974's Sleeper eligibility snapshot (164442Z, raw sha `97b15239…`) and the league snapshot
(`league-20260906T130052Z`), with both lanes' reconciliations as a VERIFIED identity bridge (80 rookie pairs, 2,566
veteran pairs). Code: `ranking/nfl_census.py` (4 tests), `scripts/dg178/capture_nfl_roster.py`,
`scripts/dg178/build_current_player_census.py`.

**Denominator (verbatim in report.json):** every Sleeper player whose fantasy_positions include QB/RB/WR/TE AND who
appears on the dated nflverse roster (any listed status), PLUS every league-owned player regardless of any source flag;
Sleeper active/status/team are recorded on each row and never define membership.

**Census `runs/20260906T191951Z/dg178_current_census/`:** members **784** — active 500 · practice squad 137 · injured
reserve 68 · cut 68 · retired 6 · exempt 1 · owned-but-on-no-2026-roster 3 · unknown 1. By position: QB 112 (86 active),
RB 192 (111 active), TE 164 (121 active), WR 316 (182 active). Joins: 775 by Sleeper id · 2 by Sleeper's gsis · 4 via the
bridges (Max Bredeson, RB active MIN, among them) · 3 none (owned). **League-owned 274**: 256 active, 12 IR (Tank Dell,
joined by Sleeper id, nflverse gsis `00-0038977`), 2 practice squad, 1 exempt, 3 on no roster. **Identity conflict, flagged
not resolved:** Tyler Conklin — Sleeper gsis `00-0034439` vs nflverse `00-0034270`. **Uncovered, listed in full
(`uncovered.csv`):** 3,373 Sleeper skill-eligible players on no 2026 roster (QB 363 · RB 852 · TE 683 · WR 1,475), reasons
recorded — Roethlisberger (Active/PIT) and Bortles (Active/NO) among them, which is why Sleeper flags are not the
denominator. **nflverse skill rows no Sleeper row claims: 140**, listed in full in report.json (mostly practice squad
without a Sleeper id). Travis Hunter: active JAX, nflverse position WR; stays unforecast until a historically valid
producer covers him (lane 23481's same-season offensive-role refit is running). Census pointers sent to both lanes;
added identity is not a justified forecast.

**Target contract, prepared:** `TargetSpec.window` ∈ {all_reg_weeks, championship_week17} with the quotable description
("points through the championship week (NFL Week 17) since 2021 and through Week 16 for seasons before 2021, with
equal weekly weighting") and `scoring = PPR_nflverse_default` with the caveat (not David's exact league scoring; fumble
and special-teams settings unattributed; no exact-match claim). A producer file on another window than the board's is
refused by mismatch (test), never rescaled or mixed; the audit takes `--window`; the surface's window sentence follows
the typed target (test). Old all-REG targets are untouched. Preview 171037Z keeps running as the comparator.

**Outcome-identity binding, `f37f206c`:** `manifest.outcome` (artifact, csv/manifest sha256, scoring id, window, closure) → `AnnualCandidate.outcome_identity`; producers composed together must carry ONE identity (a differing hash/window/closure, or a binding beside no binding, is refused — `assert_one_outcome_identity`, also inside `annual_replacement`); the grading runner takes `--window` and refuses two histories on different windows or artifacts, recording both. Ready for DG-179's artifact and the refits: expected manifest keys `window.id = championship_week17`, `scoring = nflverse_default_ppr`, `outcome.{artifact,csv_sha256,manifest_sha256,scoring_id,window.id,closure.labels_through}`.

**Receipts:** full backend suite **7,382 passed / 32 skipped** after `bb70ffbd`; ranking 208 (incl. census 4, window 3, outcome binding 2) after `f37f206c`; route 14. The isolated preview on 8787 was refreshed on HEAD's route code, still serving audit `171037Z` (the comparator; nothing in its numbers changed — only the window sentence now reads from the typed target). **Waiting on:** DG-179's common outcome CSV + manifest, lane 23481's offensive-role refit (Hunter as a WR cohort row if his 2025 roster evidence supports it), lane 24974's rookie refit on the new window. Then: fresh grade on the new labels (`--window championship_week17`), audit with `--window championship_week17` and the census, local browser QA desktop/phone, and an isolated preview refresh — 171037Z stays as the comparator until the new candidate is validated.

**Codex's coverage update, acknowledged — `c4a0cb75`:** the target id is now `nflverse_default_ppr_championship_window_v1` on the typed target, in the manifest table and in the surface sentence; the scoring caveat names the components saved PPR does not establish (all-unit fumble losses, recovery touchdowns, individual ST forced-fumble/recovery bonuses; an exact-league mode would refuse). **A download is not coverage:** a producer bound to the shared artifact stays UNVERIFIED until `manifest.outcome.coverage.status` is affirmatively `verified`/`complete` (test). Unlabelled history rows are skipped, never zero-filled; unassigned ids fail closed on the producers' side and are never resolved here. No independent scorer exists in DG-178. Waiting on the shared manifest schema; my expected keys are listed above and will bend to Codex's schema.


### Candidate composed from lane 23481's refit — `0364881d` (2026-09-06 15:37 ET); comparator 171037Z still served

**Served preview is now PINNED** (`DG178_PREVIEW_RUN=20260906T171037Z`): `http://127.0.0.1:8787/?surface=research-preview`
keeps the accepted comparator; the candidate opens at
`http://127.0.0.1:8787/?surface=research-preview&run=20260906T193509Z` (API `/api/research/preview?run=20260906T193509Z`).
Captures `runs/20260906T193509Z/dg178_preview/` (desktop + phone: 0 page errors, no overflow, both horizon buttons).

**Inputs (all bytes bound):** veteran refit `~/dg-wt/DG-177/runs/20260906T191832Z/` via the corrected manifest
`efc3bfe0e9b79d47…`, `basic_forecasts.csv` `4872bf73196fcb3b…`, window `all_reg_weeks` (NOT the championship window — that
waits on DG-179), evidence VERIFIED (scoring, history, evaluation bytes); rookie 154706Z unchanged; universe 193436Z on the
refit's reconciliation (no rostered player unforecast); fresh grade `193345Z` on the refit's history (same rules; fold
counts 14/12/9/5/1). Candidate audit **`193509Z`**: 825 research estimates on both views (was 822), prefix consistency
**825 checked / 0 violations** — the two-year and five-year views take identical prefix terms from this file.

**Travis Hunter** is now a WR research estimate from the producer's own row (2025 week-19 roster role; expected 85.4
REG points 2026), value **0** on both views: below the WR reference (Mims 112) in every season (−27, −24, −28, −20, −17).
Not fabricated: the row is the producer's, the composition is the same rule as everyone else's.

**⚠ A reference flip to report, not hide.** The RB bar changed from Audric Estime to **Kareem Hunt** because Hunt's
season-1 forecast (85.9) now edges Estime's (85.7) by 0.2 points; under the same-player-every-season scenario Hunt's
later seasons (48 · 26 · 11 · 6) sit far below Estime's (72 · 56 · 53 · 33), so every RB's later margins rise: David's
Jeanty two-year 166 → **186**, Henderson 114 → **134**, Kaelon Black 28 → **51** (five-year 84 → **199**); QB/WR/TE bars
unchanged (Flacco 121 · Mims 112 · Parkinson 114). The refit itself moved RB forecasts by at most ±2.8 points in
season 1 (QB/WR/TE ±0.8). The page states the scenario; the sensitivity of later-season margins to a 0.2-point flip
in the bar's identity is a property of that scenario. **Football choice for David/Codex, not built:** define the
future-season reference as the best available player's expected points IN THAT SEASON (a per-season maximum over
today's unrostered pool) instead of the same player carried forward; it removes the age-cliff artefact and is still
"the next who is actually available" today. I will not change the estimand without a ruling.

Comparison model (legacy annual, 585 rows) unchanged. Nothing merged, promoted, served in production or written
outside the worktree and this ticket; the comparator stays served until Codex validates the candidate.

**Cross-check received (lane 23481, ~15:40 ET): research preview PASS on candidate 193509Z, no counterexample** — Kraft's five margins and Hunter's five margins equal its export minus Parkinson's / Mims's own rows to the third decimal; the RB reference flip confirmed as the same-player scenario meeting an age cliff (season-1 RB forecasts moved ≤ 2.82, mean +0.008), the per-season best-available question left to Codex. Still all-REG-weeks; both lanes refit on DG-179's artifact when it exists.

**Noted (lane 24974, ~15:45 ET):** source preparation for DG-179 at `~/dg-wt/DG-165/runs/20260906T194454Z/source_preparation/` (preparation_manifest sha `710c92d9…`; identified_weekly.parquet 442,167 rows 2001–2025, sha `6f7c76cc…`; 530 unidentified rows quarantined; 1999–2000 excluded as incomplete, never zero-labelled; 2022 BUF–CIN excluded explicitly). Codex's CLI binds it into the common player-season artifact; my window typing meets both producers' next manifests there. No action here.


### Adapters aligned to DG-179's implemented schema — `892a2435` (2026-09-06 15:51 ET)

Read-only from `~/dg-wt/DG-179/src/dynasty_genius/eval/league_season_outcomes.py`. `ranking/outcome_artifact.py` (4 tests)
loads the shared artifact by its manifest + `outcomes.csv`: `schema_version == dg179_league_season_outcomes_v1`,
`scoring_preset == nflverse_default_ppr_championship_window_v1`, `outputs['outcomes.csv'].{sha256,bytes}` checked against
the CSV bytes, columns `player_id,season,points,games,appeared`, `outcome_rows` == rows read, `league_scoring_exact` must be
False, `season_windows` checked against the rule (≤2020: weeks 1–16, final 17 excluded; ≥2021: 1–17, final 18 excluded;
weight 1.0), `exposure_definition` = "unique stat_record weeks within the outcome window". **`coverage_status` is a research
qualification, never 'complete individual data':** `qualified_research_game_complete_identified_rows` → qualified (admitted
game ids match the source, the exact unattributed-row quarantine is disclosed; not proof of perfect individual stats);
`calendar_checked_game_coverage_unverified` or anything else → not qualified, evidence inspection-only. Labels outside the
admitted seasons are UNKNOWN (`outcome()` returns None), never zero. The typed Week-17 target now carries the artifact's
exposure (`stat_record_weeks_in_window`); the old stat-row exposure is a mismatch. Producer bindings read DG-179's names
(`target_identity`, `outcomes_csv_sha256`, `manifest_sha256`, `scoring_preset`, `coverage_status`, `last_complete_season`);
the audit takes `--outcome-manifest/--outcome-csv`, derives the board target from the artifact and REFUSES a main producer
whose binding differs (`producer_binding_matches`); the page quotes the qualification sentence and the disclosed
`exact_league_scoring_gaps`. Ranking 215 · route 16 · full backend suite **7393 passed / 32 skipped** after `892a2435`. Waiting on the actual artifact path/hash and both refits; no candidate
will be generated from the old source under a new name.


### ACK — first real consumer load of the COMMON ARTIFACT (2026-09-06 15:57 ET): every stated fact reproduced

`OutcomeArtifact.load(manifest.json, outcomes.csv)` on `/Users/davidleess/dg-wt/DG-179/runs/20260906T194819Z/league_season_outcomes/`
loads cleanly through every check: outcomes.csv sha256 `199a48beb96a25f5dad50758b3f72b40a5d7d0cf2000f7cdaf2f411873c6ecb8`,
manifest.json sha256 `d3812d0d56b50971e98552fed4f791d3132eeffa7c242601e7c609285863ba18`, target_identity `049d2229…3c6a`,
scoring_identity `5aef5bc5…e75b`, window_identity `d9e68e1f…d7a4`, source_identity_sha256 `4bf98873…2040` — all equal to
Codex's handoff. **46,274** identified player-seasons, admitted seasons **2001–2025** (25), last complete 2025; coverage
`qualified_research_game_complete_identified_rows` → research-qualified (not proof of individual-stat completeness; the
manifest's limitations text says so and the page will); `league_scoring_exact` False; exact gaps disclosed for `fum_lost`,
`fum_rec_td`, `st_ff`, `st_fum_rec`. Reproduced from the CSV: **298 negative player-seasons retained; 821 zero-game
pairs**; Travis Hunter 2025 = **63.8 points / 7 games, appeared** (no position filter); a season outside the admitted years
returns UNKNOWN (None), never 0. Typed target from the artifact: REG · PPR_nflverse_default · championship_week17 ·
stat_record_weeks_in_window · appearance · per_season · season_points · labels_through 2025.

Ready on my side: the audit takes `--outcome-manifest/--outcome-csv --window championship_week17`, derives the board target
from this bundle and refuses any main producer whose binding (target_identity, outcomes_csv_sha256, manifest_sha256,
scoring_preset, coverage_status, last_complete_season) differs. Census already labels cut (68) and retired (6) separately
from active (500). Future-replacement policy UNCHANGED this cycle; the fixed same-available-player scenario is kept
explicitly and its sensitivity is now logged on every reference (runner-up, both per-season series, season-1 gap).
Waiting for the two refits' paths; then fresh grade on the new labels, compose, browser QA, isolated refresh.


### Census repaired per Codex's review — `533e6205` (2026-09-06 16:01 ET); corrected census `runs/20260906T200049Z/dg178_current_census/`

**The real collision, pinned RED first then fixed:** Conklin (Sleeper 5133) joined nflverse's Conklin record `00-0034270` by
Sleeper id with a gsis conflict; Izzo (Sleeper 5094, Sleeper gsis `00-0034270`) claimed the SAME record through the gsis
fallback and read ACTIVE/DET. Now any NFL record claimed by more than one Sleeper row is **contested**: every claimant is
`unknown` with the multiple-claim note, the record is listed under `contested_nfl_records`, no source is presumed right.
Source keys must be unique (refused, never dict-overwritten). Every owned id is retained even if absent from the Sleeper
capture (explicit unknown row; `build_census([], [], league_owned=…)` now returns it). Failed joins read "no verified join to
the captured 2026 roster … absence from the NFL is not proven"; owned-without-join class `no_verified_join_to_2026_roster`.
The CLI validates the capture manifest (sha256, rows, season, columns — a 2025 row is refused for 2026) and merges identity
bridges only where they agree (duplicates / cross-file conflicts refused). 10 census tests.

**Corrected census 200049Z** (`census.csv` sha `cdec701a4a1f87fd…`): denominator = roster-LISTED-or-OWNED, **NOT active NFL** (said in
`denominator_note`): 784 listed-or-owned · **active_nfl 499** · practice squad 137 · IR 68 · cut 68 · retired 6 · exempt 1 ·
no-verified-join 3 · unknown 2 (Conklin, Izzo). Contested records **1** (`00-0034270`: 5094, 5133). Unclaimed NFL skill rows
**141** by status: ACT 5 · DEV 46 · RES 17 · CUT 70 · RET 3 (Conklin's contested record joins the unclaimed set). Owned 274, all
present. Uncovered 3,373 listed in full. Notified both lanes. Default preview NOT refreshed (comparator 171037Z pinned) until
the corrected census and both new-target producers are verified. Full backend suite after `533e6205`: 7400 passed, 32 skipped.

**Rookie refit on the common artifact LOADED — `f516f37b`:** `~/dg-wt/DG-165/runs/20260906T195904Z/dg165_rookie_capital/` reads through the adapter as written (binding under `outcomes`, window from the championship preset): 80 rows, 6 seasons, typed target REG · PPR_nflverse_default · championship_week17 · stat_record_weeks_in_window · labels_through 2025; scoring/history/evaluation bytes bound; **zero binding mismatches** against artifact 194819Z (csv 199a48be…, manifest d3812d0d…, target 049d2229…, qualified, 2025). Its own evaluation on the NEW labels: 18/17/16… folds, RMSE below the training-only baseline at 4 of 4 positions (point comparison). No candidate on the new target until the veteran refit on the same artifact arrives.


### Last census guard — `a20365d5`: reverse-id mismatch on a fallback join quarantined; census regenerated as `runs/20260906T202057Z/dg178_current_census/`

Replayed exactly as Codex asked (only Izzo 5094 vs only Conklin's NFL row): the gsis fallback made him active/DET with no
conflict. Now on the gsis and bridge fallbacks an NFL row naming a DIFFERENT non-empty Sleeper id is incompatible regardless
of claim count → unknown, record not carried; a fallback to a row with NO Sleeper id (Bredeson) stays clean. Single-claim
regression test added (12 census tests). **The logic changed the output, so the census was regenerated** (`census.csv` sha
`3e836b21beade9cc…`): one more false-active surfaced — Sleeper **6618**, joined by gsis `00-0035718` to an nflverse **DL** row whose
own Sleeper id is 6118 — now unknown. Everything else is identical to 200049Z: 784 listed-or-owned · **active 498** ·
practice squad 137 · IR 68 · cut 68 · retired 6 · exempt 1 · no-verified-join 3 · **unknown 3** (Conklin, Izzo, 6618) ·
identity conflicts 3 · contested records 1 · unclaimed NFL skill rows 141 (ACT 5 · DEV 46 · RES 17 · CUT 70 · RET 3) ·
owned 274. No source id was chosen; both sides are quarantined. Lanes notified of the new path.


### ⭐ FIRST WEEK-17 BOARD — candidate audit `20260906T202257Z`, checkpoint `09c764fa` (2026-09-06 16:24 ET); comparator 171037Z still served

**Candidate URL:** `http://127.0.0.1:8787/?surface=research-preview&run=20260906T202257Z` (API
`/api/research/preview?run=20260906T202257Z`); default stays pinned to 171037Z. Captures `runs/20260906T202257Z/dg178_preview/`
(desktop + phone: 0 page errors, no overflow, roster row y=626 on the phone).

**Inputs, every byte bound to the common artifact `194819Z`** (csv `199a48be…`, manifest `d3812d0d…`, target `049d2229…`,
qualified, labels 2025): veteran DG-177 `195728Z` through its corrected companion `b73027d0…` (`basic_forecasts.csv`
`a43f3126…`, 759 rows, seasons 1–5; evaluation status `05a01003…`: 14/12/9/5/1 folds); rookie DG-165 `195904Z`
(`rookie_scores_2026.csv` `db96647d…`, 80 rows, seasons 1–6; companion correction `COMPANION-2026-09-06.md` `8ef52aba…`
noted — cohort 2,083 fitted rows, classes 2001–2026, 155 picks from 1999/2000 dropped as unknown, never zero). Zero binding
mismatches for both; producers agree on the core binding fields (a side stating extra identity fields does not split
them; a binding beside none is still a mix — refused). Board target derived FROM the artifact: REG · PPR_nflverse_default ·
championship_week17 · stat_record_weeks_in_window · appearance · per_season · season_points · labels_through 2025.

**Fresh grade on the NEW labels (`202159Z`, both histories bound, window consistent):** veteran alone season 1 above the
training-only baseline in total at every position on 14 folds (QB 59,356 vs 58,926 · RB 31,839 vs 30,083 · TE 9,892 vs 6,640 ·
WR 34,342 vs 32,906); both together QB 59,839 vs 54,602; season 5 one fold (RB −3,048 vs −5,216); k-season sums per origin,
no superiority claim. Old-target metrics are not validation and are not shown.

**Board:** **825** research estimates on both views (none unverified); prefix consistency **825 / 0 violations**; no model
comparison (the legacy annual model is on the old target and cannot be mixed). David two-year: **Mendoza 229 · Jeanty 181 ·
Dart 134 · Henderson 133 · Washington 90 · Odunze 58 · Kraft 47**; five-year: **Mendoza 700 · Jeanty 498 · Dart 475 ·
Henderson 376 · McCarthy 192 · Black 189 · Washington 186 · M. Jones 185** (5–8% below the all-REG candidate 193509Z, as the
veteran lane predicted). References (fixed same-player scenario, sensitivity logged on the page): QB Flacco 115 (runner-up
Mariota, gap 14.6) · RB Hunt 88 (Bam Knight, 10.8) · TE Parkinson 108 (Otton, 6.7) · **WR Mims 106 (Keenan Allen, gap 2.6)**.
Hunter WR research estimate 0 (−25.2 / −23.3 / −27.2 / −19.1 / −16.1 vs Mims); Kraft two-year 46.9 (12.445 + 34.464).
Surface says: points through the championship week (NFL Week 17) since 2021, Week 16 before, equal weekly weighting;
research preset named; not David's exact league scoring; artifact qualification sentence; not drop/trade advice.

Lanes messaged for the prefix/join cross-checks. Nothing merged, promoted, served in production or written outside the
worktree and this ticket; the default preview is not refreshed until Codex verifies this candidate.

**Cross-check received (lane 23481, 16:26 ET): research preview PASS on 202257Z** — every quoted row reproduces to the third decimal from `basic_forecasts.csv a43f3126…` (Kraft, Hunter, all four references with their runner-up gaps); bindings verified (corrected companion `b73027d0…`, results.json `0b91d35f…`, history `f4fe6644…`, artifact identities); no old-producer hash appears anywhere. Its one gap closed at `5f4ddd49`: the evaluation-status companion is now bound by the sha256 of the bytes read (`EvaluationStatus.source_sha256`; on 195728Z it reproduces `05a010038bf368ec…`); audit 202257Z predates that field, so for that run the companion hash is bound here, in this ticket, and will be in the report from the next run. Fact correction accepted: the companion does state scoring_identity/window_identity under `label_source`. Full backend suite after `09c764fa`: 7403 passed, 32 skipped.


### ⭐ FOR CODEX — candidate regenerated as `20260906T203007Z` under `26ba557d` (records `f023478c`), 2026-09-06 16:31 ET: evidence gap closed, rows identical

**Exact command (from `~/dg-wt/DG-178`, code `26ba557d`, tree clean — recorded in `report.json["provenance"]` with argv):**
```
.venv/bin/python scripts/dg178/audit_roster_coverage.py \
  --artifact /Users/davidleess/dynasty-genius-product/app/data/valuation_runtime/universe_pvo_runtime.json \
  --snapshot /Users/davidleess/dynasty-genius-product/app/data/league_runtime/runs/league-20260906T130052Z/snapshot.json \
  --cells /Users/davidleess/dg-build/preserved/2026-09-06-dg164-survival-cells/retention_R_v3.json \
  --main-csv ~/dg-wt/DG-177/runs/20260906T195728Z/dg177_basic_horizons/basic_forecasts.csv \
  --main-manifest ~/dg-wt/DG-177/runs/20260906T195728Z/dg177_basic_horizons.manifest.corrected.json \
  --main-csv ~/dg-wt/DG-165/runs/20260906T195904Z/dg165_rookie_capital/rookie_scores_2026.csv \
  --main-manifest ~/dg-wt/DG-165/runs/20260906T195904Z/dg165_rookie_capital/manifest.json \
  --main-grading runs/20260906T202159Z/dg178_grading/report.json \
  --outcome-manifest ~/dg-wt/DG-179/runs/20260906T194819Z/league_season_outcomes/manifest.json \
  --outcome-csv ~/dg-wt/DG-179/runs/20260906T194819Z/league_season_outcomes/outcomes.csv \
  --identity-bridge ~/dg-wt/DG-177/runs/20260906T195728Z/dg177_basic_horizons/universe_reconciliation.csv \
  --eligibility ~/dg-wt/DG-165/runs/20260906T164442Z/eligibility_capture/sleeper_eligibility.csv \
  --universe runs/20260906T202125Z/dg178_universe/eligible_universe.csv \
  --window championship_week17 --forecast-date 2026-09-06
```
**Bindings:** both boards carry `evaluation_status.source_sha256 = 05a010038bf368ec43372209c860247f016dedc1e152bfbf0addd2241eefd2d9`
for the veteran producer; the rookie status is derived from `evaluation.json` (already bound as its evaluation file, sha
`8dc1…`-style recorded under `results_sha256`), so it carries no separate companion hash by design. **Diff vs 202257Z:** on both
boards all 825 rows' values, per-season margins/actions, readiness, references (incl. runner-ups), readiness counts,
composition consistency (825 / 0), board target and artifact identity are identical; only provenance and the companion
hash were added. Grading `202159Z` untouched (it never read the companion). Browser captures `runs/20260906T203007Z/
dg178_preview/`: 0 page errors, no overflow at 390, both tabs and Why. **Candidate URL:**
`http://127.0.0.1:8787/?surface=research-preview&run=20260906T203007Z`; default still pinned to 171037Z — when you authorize,
the isolated pin becomes `DG178_PREVIEW_RUN=20260906T203007Z` (local only, not production). Rookie lane told its 202257Z join
check carries over unchanged; veteran lane informed. Server start command unchanged.

**Rookie join check received (lane 24974, clock-checked 16:28 ET): PASS on every expectation** — 80 rookie rows on both views, 80 distinct player and Sleeper ids, each of its rows matching exactly one board row; placement = Sleeper fantasy_positions 80/80 (Bredeson TE→RB the only draft-position difference; Nowakowski TE and Jam Miller RB differ from nflverse by the placement rule); 80/80 research estimates with evidence verified; page values Mendoza 229.4 / 699.8, Cooper 42.7 / 131.3, Black 43.0 / 188.6, Bell 0 / 0, Bredeson 0 / 40.2; copy scan 0 'proven edge' / 'draft capital' / 'complete dynasty value'. Its two observations: `estimate_class = candidate` is the producer-class vocabulary (candidate vs served), the reader-facing word is the readiness chip 'Research estimate' — nothing to change; a self-evidencing rookie join block (key count, matched-once, duplicates) in the producer entry is a good next-cycle addition, not made now (no unrelated changes this cycle). Ranking + route suites at `26ba557d`: 242 passed.

**Rookie join check RE-RUN on 203007Z (lane 24974, 16:31 ET): PASS, identical to 202257Z on every line** — independently re-derived, not carried over; a direct block diff of the two report.json files finds all boards, readiness, composition consistency, outcome artifact, replacement, coverage and fantasy_eligibility byte-identical, with only the veteran companion's `evaluation_status.source_sha256` and the provenance block added. Both lanes have now passed the run Codex will pin.


### ⭐ DEFAULT PIN DONE (Codex-authorized, 2026-09-06 16:32 ET) — isolated localhost:8787 now serves reviewed candidate `20260906T203007Z`

**Exact HEAD:** `d10e8b42df2ddf9609c55c3ae980e3ed78904036` (`ticket/DG-178`, tree clean; the pin commit only adds the default-pin captures). **Server (local only,
not production):** restarted from `~/dg-wt/DG-178` as
`DG178_RUNS_ROOT=/Users/davidleess/dg-wt/DG-178/runs DG178_PREVIEW_RUN=20260906T203007Z .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8787`.
**Default confirmed:** `GET /api/research/preview` → `source.run = 20260906T203007Z`, `source.pinned = true`, 825 research
estimates, views h2/h5, model_comparisons empty; page `http://127.0.0.1:8787/?surface=research-preview` HTTP 200, kicker
reads "local run 20260906T203007Z (accepted comparator)"; real-browser captures `runs/20260906T203007Z/dg178_preview_default_pinned/`
(desktop + phone: 0 page errors, no overflow at 390, both tabs). **Comparator preserved:** 171037Z and every other run are
untouched and reachable by id (`?run=20260906T171037Z` → `pinned=false`). **Focused receipts at this HEAD:** ranking + route
242 passed; earlier full backend suite after `09c764fa` 7,403 passed / 32 skipped (only provenance/companion-hash code and
run directories changed since). No scientific or model change in this cycle; nothing merged, promoted, published or
restarted in production.


### READ-ONLY PREFLIGHT for the next board increment (David: "please continue building") — 2026-09-06 17:05 ET; no edits, no regeneration, pin unchanged (203007Z served)

**What the served run already gives us (API `/api/research/preview`, run 203007Z, 1.26 MB):** every view carries `league`
(all **274** league players, every one a research estimate on the Week-17 board — **0 missing forecasts, 99 with value 0.0**
= below the reference in every season), `top` (60) and `roster` (27); per row: value, per-season `expected_margin` + `action`,
`reference_player`, `reference_expected_points` (season 1 only), readiness, status sentence, raw reason, placement source,
fantasy positions, NFL status. Per view: `reference[pos].expected_points_by_season` (the whole reference series), runner-up
and sensitivity note. **The page renders only roster + top 40** — the 274 are fetched and dropped. So "find any league player"
needs NO API change and NO new fetch.

**Findings (read-only):**
1. **Zero impact vs missing forecast are not distinguished in words.** A 0.0 row (e.g. Chris Rodriguez, −23.9 / −3.5) carries the
   same sentence as a 200-point row ("Research estimate of two-year impact…"). On this board every league player has a
   forecast, so the distinction is currently copy-only; the previous run (Dell) proves the "missing" path exists.
2. **Genuine zero-margin copy bug (frontend):** a margin that rounds to 0 (|m| < 0.5, e.g. −0.3 → `Math.round` → "0") is labelled
   "0 below reference" / "0 above reference", and an exact 0 is labelled "below reference" while the assembler's action is
   replace. No served row hits exact 0 today (0 of 4,800 season cells), but rounded-to-zero cells can. The label should read
   "level with reference" when the rounded value is 0, and show one decimal below 1 point.
3. **The reference line overstates the current waiver pool.** "368 eligible unrostered QB have no forecast (149 no gsis
   mapping, 139 left the cohort, 80 no NFL history)" counts historical Sleeper ids from the eligible universe. The dated
   current census (202057Z) says the ACTUAL unrostered QB pool on a 2026 NFL roster is **88**: 68 with a forecast (34 active,
   8 practice squad, 2 IR, 3 cut, 1 retired) and **20 without** (9 active, 4 practice squad, 2 IR, 4 cut, 1 retired). RB: 78 with /
   32 without (4 active, 14 PS, 3 IR, 10 cut, 1 retired); WR: 154 with / 55 without (4 active); TE: 102 with / 21 without
   (3 active, 2 unknown). The audit never reads the census (`report.json` has no census block); the reference's
   `unforecast_eligible` comes from the universe. This is the "thousands of historical Sleeper IDs" problem Codex named.
4. **Inspecting a player's annual forecasts against the reference** needs no new data: forecast_j = margin_j + reference
   series_j (the reference series is on the view); today the Why row shows only signed margins and the season-1 reference.

**Smallest testable design (proposed, not built):**
- **Route** (`research_preview.py`, tests exist, 16): (a) `_sentence` for a 0.0 row: "Zero impact on this board: his forecast sits
  below the next available {pos} in every season shown (e.g. 2026: N vs ref M); a forecast exists — this is not a missing
  number." (b) per-season detail gains `forecast_points` = margin + reference series so the Why row can show "2026: 120 vs
  reference 108 (+12)". (c) reference gains `current_pool` from the census: `{on_2026_roster_unrostered, with_forecast,
  without_forecast, without_by_status}` and the sentence "Of the 88 unrostered QB on a 2026 NFL roster, 68 have a forecast
  and 20 do not (9 active, 4 practice squad, 2 IR, 4 cut, 1 retired)"; the universe count is relabelled "Sleeper-eligible
  ids including inactive and retired: 368". Who sets the reference does NOT change.
- **Audit** (`audit_roster_coverage.py`): `--census runs/…/dg178_current_census/census.csv` → `report["current_census"]` (path,
  sha, per-position pool by availability class × has-forecast) and `ReplacementRef.current_pool`; a regeneration under the
  same inputs would change only copy fields (numbers identical, verifiable by the same diff as 203007Z vs 202257Z).
- **Frontend** (`ResearchPreview.tsx`, no new layout): (a) one text input above a "League" section that filters
  `view.league` client-side by name/team/position (existing pattern: the trade lane's `AssetSearch` input styling; not the
  shell's global "Find a player", which opens the live card and must stay separate from research values) — desktop: the
  filtered table under the roster; phone: the same input, results capped to matches, each row with the focal number, the
  per-season margins and Why — the five-second answer is "type a name, see his number, tap Why to see forecast vs reference
  per season"; (b) `marginLabel(m)` → above / below / level with reference, one decimal under 1 point; (c) Why row shows
  forecast vs reference per season; (d) the reference line quotes the census pool sentence. Extract `marginLabel` and
  `filterLeague` as pure functions with a vitest each (none exists for this surface today; the styles census tests run).
- **Tests first:** route tests for (a)(b)(c); ranking test for the census ingestion; two vitest units; the existing prefix/
  reference consistency assertions untouched. **Preserved:** every forecast value, the fixed same-player reference and its
  logged sensitivity, the 2/5 prefix rule, no drop/trade advice, explicit eligibility and placement.

Awaiting Codex's final scope; nothing above is started.


### BUILD RELEASED — plan written, first red test running (2026-09-06 17:1x ET)

Plan: `~/dg-wt/DG-178/docs/superpowers/plans/2026-09-06-player-comparison-and-current-coverage.md` (committed on
`ticket/DG-178` from `d10e8b42`). Tasks T1 census binding (`ranking/current_census_binding.py`) → T3 route (zero / missing /
equal / near-zero sentences tied to the row's seasons; per-season player vs reference expected points derived from
full-precision margin + reference series; coverage as three separate populations; the reference's NFL attachment from the
census) → T4 frontend (pure `researchHelpers.ts`: `filterLeague`, `marginLabel`; one labelled search input over the 274
league rows; Why row per season; coverage line) → T2 audit `--census-dir` (refuses a `latest` path) → T5 new immutable
candidate diffed row-for-row against 203007Z, browser QA, cross-review. **First expected-red test:**
`tests/ranking/test_current_census_binding.py` (4 tests: byte/source re-hash + season + uniqueness refusals, `latest`
refused, attachment unverified for uncovered/unknown/absent ids — Hunt-style — and verified only on a clean join, coverage
as separate populations) — RED at write time (ImportError, module absent). Facts pre-checked: derivation
margin + reference series reproduces the producer forecast on 2,515/2,515 veteran cells; Braelon Allen 0 / 48.8226; Hunt
uncovered (no verified join; Sleeper Active/no team); page's "Active" beside him is Sleeper's flag. Pin unchanged (203007Z).


### ⭐ FOR ROOT — comparison-board candidate `20260906T213858Z` under `fd89bf13` (records `32129f15`), 2026-09-06 17:39 ET; server stable, default still 203007Z

**Candidate URL:** `http://127.0.0.1:8787/?surface=research-preview&run=20260906T213858Z` (API `?run=20260906T213858Z`); default
`GET /api/research/preview` → 203007Z pinned (unchanged). Server restarted on HEAD from `~/dg-wt/DG-178` with the same command
(`DG178_PREVIEW_RUN=20260906T203007Z`), stable now.

**Every review item closed, each test-first:** one byte buffer per consumed file (census.csv, uncovered.csv, report.json, roster,
Sleeper, snapshot, every identity-bridge file) with an on-disk-mutation read-once regression; blank ids and count mismatches
refused; owned ids absent from the census counted, never dropped; members with no verified NFL join (Conklin, Izzo, Searight)
reported apart from "listed" (TE verified 101 of 120 listed; 3 unverified: 1 with an estimate, 2 without) — no unverified member
called listed; contested NFL records in their own sentence; ownership reconciled row-by-row against the verified snapshot
(the Rodgers False/999 tamper is refused); bridge provenance required whenever a row joined through a bridge (4 rows; two
re-hashed bridge sources recorded); the audit reads the snapshot once and parses/hashes the same bytes; tiny margins render
with enough decimals (+0.004, ±<0.001, "within 0.001 of reference"), never a signed zero; **mobile overflow fixed** (the
results wrapper was a grid item with min-width:auto): measured 390/390 at default, with a query, with Why open on the 2-year
AND the 5-year view; the query survives the horizon toggle (interaction test); the search sits after David's roster so the
roster is still first on the phone (row y=626).

**Candidate evidence:** report `provenance.git_head fd89bf13`, clean; `current_census` identity checks ALL true (census csv,
roster, Sleeper, snapshot, identity_bridge, season, unique ids, counts, ownership); diff vs 203007Z on both boards: all 825
values, per-season margins/actions/advantages, readiness, references (incl. runner-ups), counts, composition consistency,
board target, artifact identity **identical**; 274 league rows on both views. Captures `runs/20260906T213858Z/dg178_preview/`:
desktop 1280 + phone 390 (0 page errors, no overflow), search-london, search-braelon-why, and the two Why-open phone
screenshots (2-year, 5-year). Braelon Allen h2 0 / h5 48.8226; Travis Hunter numeric 0 both; Hunt RB reference kept, labelled
"NFL attachment unverified".

**Receipts:** ranking 237 · route 19 · census binding 11 (inside ranking) · vitest research 10 + styles 40; full backend suite
after `55088dcf`: 7417 passed, 32 skipped (only the binding changed since; ranking suite re-run green); full backend suite after `fd89bf13`: 7418 passed, 32 skipped.
Lanes asked to cross-check the new per-season player/reference figures and the rookie search/placement.


### ⭐ FINAL HANDOFF TO ROOT — comparison-board candidate `20260906T214512Z` under `219a88d6` (records `66f21acb`), 2026-09-06 17:45 ET

**Since 213858Z, all root findings closed, each with a test:** (1) the audit's report `inputs.snapshot.sha256` is the captured
`snapshot_sha256` — the snapshot is read exactly once and parsed/hashed from the same bytes; a static regression
(`tests/ranking/test_audit_snapshot_read_once.py`) asserts one `read_bytes` and no fresh re-hash; (2) the search hint is the
single `role="status"` live region (count, no-match, default), the results table is not live — interaction test asserts the
status text changes and no `aria-live` on the results wrapper. **Candidate 214512Z:** provenance `git_head 219a88d6`, clean;
census identity checks ALL true (incl. ownership and bridge provenance); diff vs 203007Z on both boards: all 825 values,
margins/actions/advantages, readiness, references, counts, composition consistency, board target, artifact identity
**identical**; 274 league rows on both views. Captures `runs/20260906T214512Z/dg178_preview/` (desktop + phone: 0 page errors,
no overflow; search-london, search-braelon-why, phone Why-open on 2-year and 5-year) and a probe: 390/390 at default, with a
query, with Why open on both horizons; the query survives the toggle. Intermediate candidates 212825Z, 213444Z, 213726Z,
214319Z, 214404Z are committed as immutable evidence (superseded; not to be pinned).

**Receipts at `219a88d6`:** ranking 238 (incl. census binding 12, snapshot read-once 1) · route 19 · vitest research 11 + styles
40 · tsc clean · biome clean · full backend suite after `fd89bf13` 7,418 passed / 32 skipped (only frontend and the one-line
audit hash fix since). **Recorded exception:** immutable audit `summary.md` files carry generator trailing whitespace; they are
not edited to beautify — the product-code-scoped diff is the receipt. **Candidate URL:**
`http://127.0.0.1:8787/?surface=research-preview&run=20260906T214512Z`; default still 203007Z (pinned, server stable). No
value, reference, eligibility or placement rule changed; nothing merged, promoted, published or restarted in production.


### ⭐ DEFAULT PIN DONE (root-authorized, 2026-09-06 17:47 ET) — isolated localhost:8787 now serves accepted candidate `20260906T214512Z`

**Exact HEAD:** `3688e542552addecdd3ff8e8374b3cd006e7a652` (`ticket/DG-178`, tree clean; this commit adds only the default-pin captures). **Report sha verified:**
`19e032a4067dff1759199a84720c0f879bb61f792fd3b2703808b55485a7af37` equals root's. **Server (local only, not production):**
restarted from `~/dg-wt/DG-178` as
`DG178_RUNS_ROOT=/Users/davidleess/dg-wt/DG-178/runs DG178_PREVIEW_RUN=20260906T214512Z .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8787`.
**Default confirmed:** `GET /api/research/preview` → `source.run = 20260906T214512Z`, `pinned = true`, 825 research estimates, 274
league rows, census 202057Z bound, views h2/h5; page `http://127.0.0.1:8787/?surface=research-preview` HTTP 200, kicker "local
run 20260906T214512Z (accepted comparator)"; captures `runs/20260906T214512Z/dg178_preview_default_pinned/` (desktop + phone:
0 page errors, no overflow; search-london, search-braelon-why, clear). **Preserved:** 203007Z (reachable by
`?run=20260906T203007Z`, `pinned=false`) and every intermediate run. **Focused receipts at this HEAD:** ranking + route 257
passed; frontend research 11 + styles 40, tsc and biome clean (unchanged since `219a88d6`). Nothing merged, promoted,
published or restarted in production. Next for this lane: read-only cross-review of the scoring and transition audit tools
when their owners hand off; no new product tasks or refits.


### READ-ONLY CROSS-REVIEW for root (2026-09-06 17:53 ET) — DG-165 transition audit 214212Z and DG-177 scoring audit 214632Z; no edits

**DG-165 transition audit `~/dg-wt/DG-165/runs/20260906T214212Z/dg165_transition_audit/` — qualified acceptance, one disclosure gap.**
Reproduced from the frozen files: veteran side = `policy_p_appear_year1` / `policy_e_points_year1` of 195728Z's history at
(player, feature season) on **2,776 / 2,776** rows (0 mismatches); rookie side = 195904Z's out-of-time `e_points_year{{exp+1}}` /
`p_appear_year{{exp+1}}` on 2,776 / 2,776; unique (player, target season) keys; `experience` = veteran information season −
rookie information season on every row; rookie origin = draft season; target = veteran feature season + 1 — so equal target ≠
equal forecast origin (the veteran side has 1/2/3 more seasons of NFL information), and the 885 / 976 / 915 rows are three
different populations; no widening or causal claim is supported. Binding: target identity `049d2229…`, csv `199a48be…`,
manifest `d3812d0d…` = the common artifact; veteran history bytes bound (`f4fe6644…` re-hashed equal). **Labels vs the
artifact:** on the **2,150** paired rows whose (player, target season) the artifact contains, points, games and appearance
equal the artifact exactly (my earlier "2,128 mismatches" was my own boolean-encoding error: `appeared` is 1.0/0.0). **Gap:**
the other **626** paired rows (exp 1: 112, exp 2: 249, exp 3: 265) are player-seasons the artifact does NOT contain — by the
artifact's own `zero_definition` an absent pair is unknown, not zero — yet both frozen producers label them 0 points / 0
games / not appeared (the shared "no stat record in a covered season = zero appearance" convention), and the audit reports
`label_unknown: 0` and files them as `paired`. Both sides use the same convention, so the paired comparison is internally
consistent, but those 626 labels are a convention, not artifact rows; the coverage ledger should say so (e.g. a
`label_source` = artifact | convention_zero column) and the board must not read them as artifact-backed. Provenance nit,
numbers unaffected: the veteran input is bound to the run's own `manifest.json` (`253d5461…`) rather than the corrected
companion (`b73027d0…`) root and I bind; the history bytes are bound, so the arithmetic stands. Coverage ledger visible
(6,249 rows: paired 2,776; outside overlap classes 2,832; no veteran row without a window appearance 511; despite an
appearance 25; identity unresolved 105); bootstrap caveat stated (player sampling only, both fits frozen).

**DG-177 scoring audit `~/dg-wt/DG-177/runs/20260906T214632Z/dg177_league_scoring_audit/` — no concrete mismatch found.**
Arithmetic: championship weeks 1–17 exact 3,217 + attributed 7 + no-stat zero 1,233 + unresolved 1 = **4,458** rostered
player-weeks; all-REG 3,384 + 8 + 1,330 + 1 = 4,723; week 18 (265 rows) is outside the window on every row. `exact` rows have
Sleeper = league points to 1e-6; `absent_zero` rows are 0 on both sides; league ≠ research preset on **7 of 4,458** window
rows (sum −2.0; ±2 from fumble / special-teams keys) and on 102 of 17,456 weekly rows population-wide (sum +92, range −2..+12);
1 unresolved row (`source_difference`, week 6, −0.5), 2 component-weeks unresolved (`event_ambiguous_or_missing_id`); quarantine
re-audit 22 rows, 0 nonzero under league keys; individual keys credited incl. `st_ff` / `st_fum_rec` / `fum_rec_td`, team keys
never applied to individuals; `league_scoring_exact` False for stated reasons (rostered player-weeks only — not full-universe
proof; 1 unresolved; kicker keys unsupported); sources bound (prepared weekly `6f7c76cc…`, league snapshot `ece82e24…` = my
audit's, settings `3ffeb558…`); launch provenance recorded honestly (dirty = untracked runs only). **For board consumption:** the
research preset and David's league points agree on rostered weeks to within a couple of points per week; that is not proof
of exact scoring for the universe, and the preset's caveat on the page stays as it is.

**Correction (lane 23481, 17:55 ET): the scoring-audit producer is `runs/20260906T215247Z` (checkpoint f1eed4df); 214632Z and 214808Z are labelled SUPERSEDED beside their directories. Re-verified read-only on 215247Z:** window exact **3,215** + attributed 7 + absent-zero 1,233 + unresolved **3** = 4,458; all-REG 3,382 + 8 + 1,330 + 3 = 4,723; week 18 (265 rows) outside the window; exact rows equal to 1e-6; absent-zero rows zero; the 3 unresolved are the week-6 −0.5 source difference plus two QB weeks (11560 wk 6; 6804 wk 11; 4943 wk 17) whose special-teams split is unverifiable — Sleeper equals research on both, not certified; quarantine re-audit now all **530** rows (36 nonzero under league keys: 6 original + 30 historical st_split_unknown; all 22 rows of 2025 inert); same sources and settings shas; exact-league still False for the stated reasons. Nothing I verified on 214632Z changes on 215247Z except the two newly-uncertified QB weeks, which is stricter.

**Transition audit reissued as `~/dg-wt/DG-165/runs/20260906T215655Z/dg165_transition_audit` (lane 24974; tool b1d0e3f1, run 3cb51062) — the 626 gap is closed; re-verified read-only at 17:57 ET:** every paired row now carries `label_source` = artifact | convention_zero (k1 773 / 112, k2 727 / 249, k3 650 / 265, in joined_rows.csv, coverage_ledger.csv, metrics.json and REPORT.md); all 626 convention_zero rows are absent from the artifact and 0 / 0 / not appeared, all 2,150 artifact rows equal the artifact exactly, and the rows are identical to 214212Z apart from the new column; the caveat text says the zeros are the two producers' shared convention and not artifact rows and that an absent pair with a non-zero label refuses; the veteran binding of record is now the corrected companion `b73027d0…` with the run manifest `253d5461…` recorded beside it; artifact binding by declared sha (`199a48be…` verified as bytes). **Qualified acceptance stands with the disclosure in place.**

**Final scoring-audit producer is `~/dg-wt/DG-177/runs/20260906T220010Z/dg177_league_scoring_audit` (lane 23481; 215247Z now SUPERSEDED beside its directory) — re-verified read-only at 18:01 ET:** every scoring and event count unchanged (window 3,215 / 7 / 1,233 / 3 = 4,458; all-REG 3,382 / 8 / 1,330 / 3 = 4,723; 1,412 events on 532 plays, 21 ambiguous, 0 missing ids; the unattributed ledger's 21 rows reconcile); exact rows equal to 1e-6, absent-zero rows zero; same sources and settings shas; exact-league False. Disclosure only: the quarantine re-audit now reports 6 known nonzero (the original exceptions), 494 verified zero and 30 unknown special-teams splits (36 that cannot be certified inert), original values untouched — the earlier "36 nonzero" wording is withdrawn in favour of that split. **No concrete mismatch; cross-review closed for both tools.**


### AVAILABLE-PLAYERS BUILD RELEASED (David "ok go") — plan written, first RED test (2026-09-06 20:4x ET)

HEAD `3688e542`, tree clean, 214512Z pinned. Plan: `~/dg-wt/DG-178/docs/superpowers/plans/2026-09-06-available-player-discovery.md`
(committed). Tasks: T1 `ranking/available_catalog.py` (unowned census members with the PRODUCERS' own expected points read
from the frozen CSVs the accepted report hashes; default pool active + practice squad + IR = 433 expected; cut / retired /
unknown separate; archive and unmatched NFL rows as disclosures; missing forecast retained with a plain reason; future =
2027–2030 only when every year is present) → T2 immutable catalog builder → T3 `GET /api/research/available` bound to the
served preview run → T4 `AvailablePlayers` tab with pure helpers (search / position / NFL-status / watched / missing filters;
sort bases stated beside the control; exact ties named; local watchlist with ownership-change wording; safe storage) → T5
actual catalog run, browser QA desktop/phone, checkpoint, cross-review requests. **First expected-red test:**
`tests/ranking/test_available_catalog.py` (4 tests: population/values/missing, future undefined when a year is missing,
producer sha refusal, denominators + disclosures + freshness dates) — RED (ImportError) at write time. No impact math or
reference change; no DG-165 cold-start consumption until root accepts it.

**Disclosure (20:5x ET):** while debugging a helper test I ran `npx vite-node` once; npx fetched `vite-node@6.0.0` into the user-level npx cache for that one-off script. No project dependency, lockfile or `node_modules` changed and the script was deleted; I will use vitest for any further debugging. Recorded because the brief forbids dependency installation.

## 2026-09-07 01:25 UTC — Available players: BUILT, QA'd, root's review items closed (davidleess-cb)

**HEAD `060316d2` on `ticket/DG-178`** (commits this scope: `ae735893` plan, `71ca246c` catalog/route/helpers, `da2893f3` fail-open fixes, `782411e7` whole-census binding, `060316d2` tab + runs). Tree clean. 214512Z stays pinned.

**Served now (isolated, restarted on HEAD; root's scoped allowance):** `http://127.0.0.1:8787/?surface=research-preview&tab=available` (PID 82294, `DG178_PREVIEW_RUN=20260906T214512Z`, `DG178_RUNS_ROOT=~/dg-wt/DG-178/runs`). `GET /api/research/available` → catalog **`20260907T011150Z`** (built on `782411e7`; catalog.json `590c2e1e…`, catalog.csv `5e86ede3…` — byte-identical to 010245Z and to root's replay 010608Z). Research board tab unchanged (`/api/research/preview` still 214512Z pinned).

**Final catalog (011150Z):** 784 rows = 274 owned identity/status rows + 510 available. Default pool **433 = 353 with a forecast + 80 without** (active 242 / PS 135 / IR 56); cut 68 (28/40), retired 6 (4/2), unknown 3 (1/2). Recovered exactly root's four: 6109/00-0035125 Ingold, 1379/00-0029892 Juszczyk, 2471/00-0031595 Burton, 8025/00-0036727 Prentice — values identical to DG-165's `recovery_sidecar.csv` (010020Z/005402Z), checked cell by cell. with_now 353, with_future_total 353, incomplete_path 0, blank-row 0. Bound: report `19e032a4…` (run 214512Z), census 202057Z (`census.csv 3e836b21…`, `report.json ae59cbef…`, `uncovered.csv c3838866…`), snapshot `ece82e24…`, producers `a43f3126…` (arm `basic_cohort_3col_plus_lags`) and `db96647d…` (`dg165_rookie_capital_v3_chain:inner_menu:trend`). Provenance records `git_state` {tracked_modified: [], untracked: [frontend files then uncommitted, run dirs]}.

**Root's review items — disposition (each has a RED→GREEN test):**
1. arm/model validated row by row against the report's `evidence.scoring_arm` / `model_version` (rehashed copies refused) · 2. forecast-year semantics: cutoff must precede year 1, `forecast_season_year{j}` must equal the path derived from the report's forecast date, rookie `draft_season` must be year 1; never relabelled · 3. duplicate gsis / draft key / producer argument / report Sleeper or gsis identities refused · 4. report gsis and census verified NFL gsis must agree; conflict fails the build; the Sleeper-gsis fallback is gone · 5. all-blank producer row = "no usable forecast" with its own reason; `forecast_path` {none|incomplete|complete}; populations count `with_now`, `with_future_total`, `incomplete_path` · 6. finite cells and aggregates, P(appear) ∈ [0,1], hurdle identity e = P×E[·|appear] for points AND games (real data: 0 violations, max diff 0); negatives retained · 7. builder `git_state` with tracked/untracked separate, dirty = either · 8. route: catalog.json bytes vs companion `outputs_sha256`, `sources.report_sha256` vs the served report bytes, malformed/companionless newest → explicit 500, no fallback · 9. whole-census binding: `current_census.report_sha256` and `uncovered_csv_sha256` required and compared (metadata-only mutations refused) · Frontend: counts distinguish forecast coverage from "value for this ordering" (recovered rows under impact sit apart with the specific reason; component test); ties named and emphasised on the selected basis only, both impact columns shown; explicit empty status = no-match with explanation; watched-only disables + explains status/missing controls, census-absent watched ids stay as unresolved placeholders (entries store name/position/team/date); short football-first lede, limitations in the disclosure; owned population worded as watch-status rows; watchlist v2 rejects array containers, drops array/blank/non-string entries with a repair notice; local `formatAvailablePoints` (−0.035 → −0.04, 0 → 0.0, 0.007 → 0.01); `useWatchlist` owned by ResearchPreview so the in-memory fallback survives tab switches (integrated StrictMode-style test with throwing storage).

**Checks:** backend full suite from root **7440 passed, 32 skipped**; `tests/ranking` + both route files 278; ruff clean on my files; frontend `vitest src/research src/styles` **76 passed**, `tsc --noEmit` clean, `biome check` clean, `npm run build` ok; `frontend/openapi.json` regenerated (only `/api/research/available` added; snapshot test passes). Product-scoped diff vs `3688e542`: 16 files, all DG-178-owned plus the two CSS ledgers and the OpenAPI snapshot.

**Browser QA (Playwright, local binaries, run inside `frontend/`): `runs/20260907T011921Z/dg178_available_qa/` (23 files, report.json).** Desktop 1280 and phone 390: no page errors; scrollWidth == innerWidth at both; default hint "353 of 433 in the default pool shown with a forecast; 80 without. Sorted by 2026 projected points (championship window)…"; top by 2026: Flacco 115.3, Parkinson, Mims, K. Allen, Otton…; 14 tie markers (exact 0.0 groups) by 2026, 8 by future; 80 rows in "No value for this ordering" with the producer reason; impact-5 sort: "84 listed apart with no value for this ordering" with the four recovered RBs saying why; Why shows the path + P(appears) + "identity join report_gsis 00-0026158"; watch → v2 storage entry with name/position/team/date, watched-only shows "active · watched · available", 7 controls disabled with the note; unwatch empties storage; future/RB/cut/search/no-match/clear/missing-only/empty-status states all as specified; details open; board tab renders "Two-year impact (research preview)". Earlier 011635Z found a 1369 > 1280 desktop overflow (sort select) → fixed, ledger updated; 011533Z is a partial run (script selector), kept.

**Schema for root's independent acceptance** (as served): `GET /api/research/available?run=&catalog=` → `{source:{kind, catalog_run, report_run, pinned, census_run_id, report_sha256, integrity, provenance:{git_head, git_dirty, git_state:{dirty, tracked_modified[], untracked[]}, argv, script, generated_at}}, freshness:{ownership_as_of, nfl_status_as_of, caveat}, populations:{default|cut|retired|unknown|owned → {total, with_forecast, without_forecast, with_now, with_future_total, incomplete_path, by_class{}, by_position{pos→{with_forecast, without_forecast}}}}, populations_note, disclosures:{uncovered_sleeper_ids, unmatched_nfl_records, contested_nfl_records, archive_unforecast_by_position{}, note}, forecast_note, forecast_years[5], future_years[4], notes{ownership, now, future, appearance, sorting, watchlist}, rows[784]}`; row = `{sleeper_id, player_id, name, league_position, fantasy_positions, availability_class, population, nfl_team, nfl_status_raw, join_basis, identity_conflict, forecast:{producer, source_csv, source_csv_sha256, join_basis(report_gsis|census_nfl_gsis|recovered_census_nfl_gsis), join_id, seasons[{season, e_points, p_appear, e_points_given_appear, e_games}]}|null, now_points, future_points, future_years, future_reason, missing_reason, impact{h2,h5}, readiness, owned_now, roster_id, recovered, forecast_path{status, years_present}}`. `catalog.json` = report fields + `rows_detail` + `run` + `provenance`; `catalog.csv` columns: sleeper_id, player_id, name, league_position, fantasy_positions, availability_class, population, nfl_team, nfl_status_raw, join_basis, identity_conflict, readiness, now_points, future_points, future_reason, missing_reason, impact_h2, impact_h5, producer, forecast_join_id, forecast_path_status, recovered, e_points_2026..2030, p_appear_2026..2030; `report.json` = populations/disclosures/sources (report, census{run_id, 3 hashes}, snapshot, producers{csv, sha256, seasons, arm}, census_identity_checks, validation{}), recovered{count, rows[{sleeper_id, gsis, producer}]}, provenance, outputs_sha256{catalog.json, catalog.csv}.

**Next (root's acceptance of DG-165 sidecar 011503Z, manifest `d628766f…`, estimates `93bc11aa…`, new-only):** starting test-first on an optional consumer (separate module `cold_start_consumer.py` + `--cold-start-dir` on the builder), NEW-ONLY with exact hash/identity/target/year/probability/finite/full-path/coherence guards, per-year `estimate_class` carried, "Starting estimate" labelling with the per-year class in Why. The 825 + four recoveries stay untouched; a new catalog run only after the consumer's tests pass; expected 433 = 360 + 73 if all seven full paths bind. Not consuming any value before that run is checked against root's stated numbers (Rourke 2026 −0.2117124292 must stay negative).

## 2026-09-07 01:43 UTC (measured `date -u`; the earlier heading read 01:45 and had been written ahead of the clock) — FINAL RECEIPT: available players + starting estimates, all root items closed (davidleess-cb)

**HEAD `8960e0ec` on `ticket/DG-178`, tree clean.** Commits since the 01:25 checkpoint: `64666bdc` NEW-ONLY cold-start consumer · `8482a81b` starting-estimate UI + bind reissued sidecar 012231Z · `74dc624d` consumer boundary guards + watched-only without status filtering · `8960e0ec` phone-readable Why + final runs. 214512Z stays pinned; the 8787 preview runs backend HEAD `74dc624d` (PID 20884; `8960e0ec` is frontend-only and the built bundle is read from disk per request, so no restart was needed). URL: `http://127.0.0.1:8787/?surface=research-preview&tab=available`.

**Final catalog `runs/20260907T013635Z/dg178_available_catalog/`** (head 74dc624d, git_state clean): 784 rows; default **433 = 360 with a forecast (349 original accepted + 4 recovered = 353 frozen, plus 7 starting estimates = 360; no overlap; counted from the catalog rows) + 73 without**; cut 68/retired 6/unknown 3 unchanged; the 825 accepted rows and the four recoveries byte-unchanged; catalog.csv `0255e690…` identical across every sidecar run (012902Z, 013005Z, 013330Z, 013413Z, 013609Z, 013635Z); bound to DG-165 run **012231Z** (manifest `2d459486…`, estimates `93bc11aa…`, evaluation `705e857b…`), partition {candidates 7, recovered_existing_forecast 4, unresolved 73, ledger_rows 84} carried under `starting_estimates.source.partition`. Rourke 2026 −0.2117124292 negative; all sidecar values exact.

**Root's later items — disposition:** consumer partition read from `inputs.partition` ✓ · a supported cold-start year requires all five finite terms ✓ · expected games ≥ 0 and conditional games inside `games_bound_declared` [1, 17] (manifest without it refused) ✓ · exact integral origin/season labels (`2026.5`, `2027.0` refused, never truncated) ✓ · watched-only bypasses status filtering entirely (a watched player now owned under `no_verified_join_to_2026_roster` stays listed with "now owned in your league", status in words; search/position still apply; integrated test) ✓ · name-sort lower table reads "Players without a forecast / Why no forecast" ✓ · lifted watch state survives tab switches with throwing storage ✓ · **phone Why:** opening a detail anchors the scroller to its left edge and the explanation renders in a sticky viewport-bound block — QA `runs/20260907T014036Z/dg178_available_qa/`: at 390 the table was scrolled 92 px right before the tap, 0 after; identity cell 16–160, prose paragraphs 16–350, all inside; screenshot `phone-390-07c-why-tap-after-scroll-viewport.png` shows Kurtis Rourke's identity, −0.2 / 38.6, and every paragraph's line beginnings and ends (only the header's impact columns scroll off, by design); desktop 1280 same check passes. Evidence wording quotes only the producer's paired h1 evidence and its caveats; no waiver-return or pickup-edge claim anywhere.

**Tests at HEAD:** backend full suite **7446 passed, 32 skipped** (at 74dc624d; no backend change since); `.venv/bin/python -m pytest tests/ranking tests/contract/test_research_available_route.py tests/contract/test_research_preview_route.py -q` → **284 passed** (root's exact command; my earlier 265 omitted the preview route file); the consumer file alone has 6 tests incl. the boundary cases; ruff clean on my files; frontend `vitest src/research src/styles` **79 passed**, `tsc --noEmit` clean, `biome check` clean, `npm run build` ok. QA runs kept: 011533Z (partial), 011635Z, 011921Z, 013817Z, 014036Z (final).

**Cross-lane:** DG-165 (davidleess-a3) told the seven rows bind exactly and no row disagrees (its message carried the same 353+4+7 double count; corrected to 349+4=353, +7=360 at 01:43 UTC).

**Bookkeeping correction 01:43 UTC (root's request):** the breakdown, the heading time and the test count above were corrected in place; no product edit, no new run. No production change, no merge, no shared-data write, no installs (local binaries only), no paid data. Ready for root's screenshot/containment rerun and David's gate.

---

## Round-2 response — 2026-09-06 11:3x–11:5x ET, `ticket/DG-178` (unlanded; ba8028b6 preserved, commits on top)

**Queue status (REVIEW-2026-09-06-ROUND2.md, lane 25057):** items 1–6 built and tested (167 tests, each watched fail
first); item 7 (local research preview) in progress.

1. **Counterfactual fixed.** Season-long replace/retain in one scoring window: signed margin `E[points_i] − E[points_ref]`,
   the sign chooses the ex-ante action, the expected advantage is its positive part. The named reference is worth exactly
   0 against himself (was +58.61 Rattler / +50.61 Estime). Margin and action ride on every term; the term names the policy
   as season-long, not optimal weekly substitution.
2. **Grading keeps losses** (predicted +10, realised −10 = error 20); the historical reference is the rank-N player by the
   training-only BASELINE arm's forecast, shared by both arms; bootstrap CIs on decision-value differences and biases;
   **the two-season SUM graded from one origin per player** with one reference per origin, folds reported separately.
   Result (run `154542Z`, corrected counterfactual): the candidate's advantage over the baseline is fold- and
   position-dependent — e.g. two-season joint by origin: RB 2022 +1,822 [+473, +3,328], RB 2023 +2,274 [+775, +3,837],
   WR 2023 +3,092 [+1,520, +4,447] but QB 2022 −196 [−957, +433], TE 2022 −797 [−1,502, −139], WR 2022 ±0 — **no stable
   superiority claim survives**; absolute biases among retained players are dominated by the reference player's own
   season (shared reference error), which the paired differences net out.
3. **Evidence identity fails closed.** `rookie_arm_consistency({}, {})` is False; the runner refuses unverified rookie
   history unless explicitly allowed (recorded UNVERIFIED); the reader verifies scoring arm + declared CSV sha256 + graded
   arm + declared evaluation sha256; unverified producers get readiness `unverified`, never `comparable`. **Today: the
   rookie producer (run 154033Z) VERIFIES; the veteran producer is UNVERIFIED (its manifest declares no output hash) until
   lane 23481's regenerated handoff.** Audit `154543Z`: 80 comparable · 502 unverified · 3,459 none.
4. **Scoring/week reconciliation measured** (`ranking/reconciliation.py`): league scoring vs nflverse `fantasy_points_ppr`
   key by key; week scope NFL REG 1–18 vs David's 1–17 (regular 1–14, playoffs 15–17) — stated, not assumed equal. A board
   refuses term sets with mixed replacement policies or snapshots.
5. **Universe proven** (`ranking/universe.py`, run `154435Z`): eligible = snapshot FANTASY_RELEVANT skill rows + every
   rostered player (4,041); eligible unrostered QB 430 / RB 851 / WR 1,684 / TE 802, producers forecast 30 / 59 / 139 / 88;
   **10 rostered players forecast by nobody** (Dell, Hunter, Lloyd, Brooks, James, Royals, Watson, Ekeler, Aiyuk,
   Richardson — none has a gsis in the artifact); 4 veteran ids outside the universe; 1 rookie position mismatch
   (Bredeson RB/TE). **Sleeper `fantasy_positions` is not captured anywhere in shared data, so multi-position eligibility
   cannot be verified here — a capture gap, recorded.** Sent to lane 23481 with the universe CSV path.
6. **Selection claim removed**; residuals now carry n and bootstrap CIs per cell.

**Coordination:** both lanes are regenerating with affirmative identifiers and output hashes; lane 24974's round-2 run
is integrated and verified; lane 23481's is running.

### Round-2 item 7 — the local read-only research preview is up and verified — 2026-09-06 11:5x ET

**Inspect it:** from `~/dg-wt/DG-178`:
```
DG178_RUNS_ROOT=/Users/davidleess/dg-wt/DG-178/runs .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8787
open "http://127.0.0.1:8787/?surface=research-preview"        # API: http://127.0.0.1:8787/api/research/preview
```
It is running now on 8787 (this session started it; no production process touched). URL-only surface, no rail entry.
Reads `runs/<latest>/dg178_audit/report.json` in the worktree, never the live artifact; header says "local run … not the
live board" and "two-year impact, not complete dynasty value"; served value beside every candidate number; "Why" on each
row gives the sentence + reference + provenance; "Not shown with a number" lists Tank Dell with the reason in plain words.
Captures: `runs/20260906T155418Z/dg178_preview/` (desktop 1280, phone 390 full-page and viewport). Phone: no horizontal
overflow (scrollWidth = clientWidth = 390), table scrolls in its own container. 661 frontend tests, tsc/biome clean.

**The board it shows (audit `155204Z`, both producers' corrected handoffs, evidence VERIFIED on both):** 582 comparable on
two seasons; next-available bars QB Mariota 103 · RB Estime 89 · TE Parkinson 122 · WR K. Allen 106 expected points.
David's roster (two-year season points above the next available, keep/replace per season): Mendoza 270 · Dart 206 ·
Jeanty 191 · Washington 160 · Henderson 134 · Odunze 115 · Cooper 108 · G. Wilson 82 · Burden 81 · Ayomanor 57 · Dike 46 ·
McCarthy 43 · Bell 41 · M. Jones 34 · Black 30 · Mitchell 30 · Bryant 26 · Legette 23 · Harris 21 · Kraft 19 · Barner 15 ·
K. Williams 8 · Ali 0 · B. Allen 0 · T. Johnson 0 · Gabriel 0 · **Tank Dell: no number** (no 2025 feature row; lane 23481's
basic-cohort run will say whether that is an identity gap or a football absence). League leaders: Nacua 429 · Maye 425 ·
J. Allen 398 · Love 388 · Smith-Njigba 372.

**Grading on the corrected veteran history (`155334Z`):** year 1 only (folds 2022–24): candidate vs baseline decision value
QB 10,941 vs 11,054 · RB 9,406 vs 8,537 · TE 1,438 vs 1,083 · WR 10,786 vs 10,770; joint with rookies above at all four.
**Year 2 is ungraded** on that file by the producer's own statement (no evaluable fold), so the two-season SUM cannot be
graded from it yet; the rookie-only two-season origins are graded. Veteran reader now prefers the `policy_*` columns.

**Round-2 queue for lane 25057: items 1–7 complete.** Open: lane 23481's basic-cohort run (year-2 grading, the ten
rostered-unforecast players, the four unmatched ids); nothing on my side blocks it. No merge/promote/restart/shared write.
