# PRODUCT HEALTH BOARD — Dynasty Genius

**What this tracks:** whether David's data is fresh, whether his models are honest, and whether he
can trust what the app shows him. It replaced the lane-status board on 2026-08-08 when Tower's role
changed. It does not track what agents are doing.

**THE RULE:** every line carries **when it was verified and by what command.** A line without a
fresh stamp is not reportable to David. **Tower's own earlier statement is never a source.**
Every item is labelled **VERIFIED** or **PROPOSED PRODUCT CHANGE** — never blurred.

---

# ============ 2026-08-08 — ESTABLISHED FROM SOURCE, 08:00–09:00 ET ============

## DATA FRESHNESS

**VERIFIED 08:35 — `/api/health` route logic executed in-process**
`overall_status: "degraded"`, `worst_affected_tier: "daily_diagnostics"`. All three subsystems
(model_provenance, capture_health, tier_readiness) report `ok`. Degradation comes entirely from two
stale artifacts.

**VERIFIED 08:35 — `app/config/report_freshness.json` reconciled against `launchctl list` and `ops/launchd/`**
- `roster_capacity` — **stale, ~24.5 days**, tier `daily_diagnostics`. **Causes the degraded root.**
- `league_opportunity` — **stale, ~24.5 days**, tier `auxiliary` (suppressed to info-only).
- **Root cause: neither has a launchd job. Declared in the freshness config, never scheduled.
  It cannot self-heal.**
- **Consequence, and it is the important part: `degraded` is this system's resting state and has
  been for ~24 days, so the amber light carries no information. A genuinely new failure on a Tuesday
  morning in season would look identical to an ordinary morning.**

**VERIFIED 08:35 — 8 of 10 plists loaded; 2 exist but are NOT installed**
Not installed: `dynasty-nflverse-usage-capture`, `dynasty-league-transaction-capture`.
Nothing in the system reconciles `ops/launchd/*.plist` ↔ `report_freshness.json` ↔ `launchctl list`.

**VERIFIED 08:35 — green over a degraded run**
`app/data/features_runtime/feature_refresh_latest_report.json` reports `"status": "ok"` and grades
`fresh`, while its own `stream_provenance` records **four of five upstream streams fell back to
cache and `participation` loaded completely empty** (`loaded_empty`, ValueError). **Nothing in the
freshness layer reads `stream_provenance`.** Freshness grades a file's shape, not its substance.

**VERIFIED 08:35 — the content-vintage check WORKS, and caught a real case**
`league_opportunity_latest.json` file mtime 2026-07-22 23:49, internal `captured_at` 2026-07-15.
Health correctly reported the content date, not the mtime. This mechanism is sound — copy its
standard.

**VERIFIED 08:35 — `pvo_refresh`, a `core_substrate` artifact, declares no `status_field` and no
`timestamp_field`.** It grades `fresh` on file mtime alone. A failed run that rewrites its report is
indistinguishable from success. Only 3 of 8 tracked artifacts declare `status_field`; the other 5
structurally cannot ever report `producer_failed`.

## MODEL HONESTY

**VERIFIED 08:50 — nothing in this system has ever compared a prediction to a real outcome.**
- `scripts/run_realized_outcome_scoring.py` lines **385, 392, 398** — all three data loaders
  `return []` unconditionally. The comment at 393-394 states *"no captured snapshots exist until the
  companion code runs."*
- **That premise is false.** Queried `app/data/model_forward_capture.db` directly:
  `model_forward_prediction_snapshot` = **500,303 rows**, capture_date **2026-06-28 → 2026-08-07**.
  Also `model_forward_capture_raw` = 561,308 rows from 2026-06-24.
- Last run marker `app/data/valuation_runtime/realized_outcome_scoring_status_latest.json`:
  `"status": "noop"`, `"noop_reason": "no_predictions_for_target"`, finished 2026-08-04T14:09:32Z.
- Job IS installed and firing — `launchctl list` → `com.davidleess.dynasty-realized-outcome-scoring`.
- `app/config/report_freshness.json:130-134` → `"success_status": ["ok", "noop"]`.
- **Precision that matters:** the same config carries `dormant_ok: true` and an in-season window of
  months 9-12 and 1, so being quiet in August is CORRECT, honest design. **The failure is scheduled
  to arrive in September:** the window opens, the job runs on real finalized weeks, hits the `[]`,
  files a `noop`, and `noop` is a success status. It reports healthy all season while grading
  nothing. Tier is `auxiliary`, so it could not turn the health light amber even if it flagged.

**VERIFIED 08:35 — model vintage is not disclosed to David anywhere in the app.**
Model cards at `app/data/backtest/model_cards/` generated **2026-05-15** (85 days). Served by
`/api/trust-surface/{position}/model-card` with `is_experimental: false`, no age field, no staleness
flag. Registry `app/config/model_registry.json` — 9 artifacts, all approved by David 2026-07-02;
engine_a run `20260502T153931Z` (98 days), engine_b v2 `20260513T012309Z` (87 days).
Training window is a free-text string reading **"2018–2022"**. There is no `trained_at` field
anywhere in the repo.

**VERIFIED 08:35 — no drift detection of any kind exists.** No PSI, no distribution-shift test, no
calibration decay monitor, no Brier, no reliability curve, no retrain trigger, no scheduled
backtest. The two things named "drift" that do run (`run_pvo_refresh.py` seed staleness,
`feature_validation.py` column deltas) compare **today's artifact to yesterday's artifact** — both
read zero when the world shifts and the pipeline faithfully tracks the shift. Neither compares
anything to the training distribution. **Drift is the report card getting worse; with no report
card there is no drift signal.**

**VERIFIED 08:35 — `market_divergence_history.db` is 702 MB, written daily, keyed
[player_id, capture_date], and nothing has ever read it back as a trend.** The engine designed to
consume it (`src/dynasty_genius/eval/gate4_divergence_edge.py`) has never run on real data — its
output ledgers are 3-byte `[]` stubs dated 2026-05-15.

## PRODUCT POSTURE — verified 2026-08-08

Every user-facing endpoint returns `decision_supported: false`. The five main surfaces are gated at
`diagnostic_grade_active_limited`. The app describes and never recommends. **That gate is honest —
it exists because nothing has ever proven the model's calls are good.** The realized-outcome scorer
is the machine that would earn the right to remove it.

Last frontend commit **2026-07-10**; last API route commit **2026-07-15**; zero frontend or API
files touched in the seven days to 2026-08-07. Recent crew work measured ~65% process/governance/
tooling, ~35% data plumbing, 0% model, 0% user-facing surface; ledger prose to code ≈ 8.8 : 1.

---

## PROPOSED PRODUCT CHANGES — all AWAITING DAVID. None started. None authorized.

Recorded here so they are never mistaken for descriptions of the product.

1. **PROPOSED PRODUCT CHANGE — wire the outcome scorer to the existing 500,303 prediction
   snapshots.** Tower's recommended first move: the scorer's statistics are already built, and it is
   the only path to model honesty and to any drift signal at all.
2. **PROPOSED PRODUCT CHANGE — schedule the two artifacts that have no producer** (`roster_capacity`,
   `league_opportunity`), so the health light stops resting on amber and regains its meaning.
3. **PROPOSED PRODUCT CHANGE — have freshness read `stream_provenance`,** so a run that fell back to
   cache on four of five streams cannot grade `fresh`.
4. **PROPOSED PRODUCT CHANGE — disclose model-card age in the app** where David can see it.
5. **PROPOSED PRODUCT CHANGE — treat `noop` as non-success once the in-season window opens,** or the
   scorer reports healthy all season while grading nothing.
6. **PROPOSED PRODUCT CHANGE — reconcile plists ↔ freshness config ↔ launchctl,** so a declared
   artifact can never again have no producer.
7. **PROPOSED PRODUCT CHANGE — a 2026 weekly-results ingest.** Nothing currently ingests weekly game
   data; the one week-grain capture job is hard-coded to seasons 2023–2025 and is not installed.
8. **PROPOSED PRODUCT CHANGE — the login attestation itself** ("everything behind what you're looking
   at is trustworthy"). It does not exist. Whether it lives in the app or comes from Tower is David's.

## DATED COMMITMENTS

| Item | Due | State |
|---|---|---|
| Grounding-layer full-build GO/NO-GO | "~August 2026" (his charter edit 2026-07-22) | **DUE NOW, unraised.** NO-GO is a legitimate outcome. |
| The Gemini seat — contribution record | ~2026-07-24 | **OVERDUE by two weeks.** |
| Studio fresh-eyes review + crew stability | ~2026-09-01 | Approaching. Studio last produced 2026-07-30. |

## STUDIO — from disk, 2026-08-08 08:00

Newest proposal `016-the-silent-lane.md`, 2026-07-30 11:21 (directory mtime 2026-07-30 20:55).
`DAVID.md` and `for-david/STATUS.md` last written 2026-08-01 15:27/15:28. **David confirmed
2026-08-07 that this rest was INTENTIONAL while the crew built Layer 1 — it is not neglect.**
Observed working under its own self-directed licence overnight 08-07/08 (PlayerProfiler athletic
profiles on disk with no API route reading them; roster-tape depth on a young roster).
**Convergence with crew work observed; independence NOT established** — pane 2.1 retains almost no
scrollback and Tower has no verified record of what crossed into that lane in the preceding six days.
Record it as convergence, never as independent corroboration.

---

# ============ 2026-08-09 — VERIFIED 09:28–09:35 ET ============

## ⚠ NEW AND USER-FACING: `/api/health` is slow and getting slower
**VERIFIED 09:32 — `curl -w '%{time_total}'` against the live server, two attempts:**
`http=200 t=43.74s` and `http=200 t=39.02s`, payload 3,567 bytes both times.
**Yesterday 2026-08-08 the same endpoint answered in 14.36s.** The rest of the app is unaffected:
`/` = 0.109s, `/docs` = 0.023s. So it is this endpoint specifically, and it roughly TRIPLED in a day.
This is the endpoint behind the System Diagnostics card David sees in the app.
**TOWER NEAR-MISS, recorded:** the first probe used `--max-time 8`, returned `http_code=000`, and
Tower nearly reported the server DOWN. It was slow, not down. Wrong instrument; caught before it
reached David. The lesson generalises — a timeout is an instrument setting, not a fact about the world.

## ✅ THE GREEN-ON-STALE-DATA DEFECT IS NOW CONFIRMED, not inferred
Two readings, different times of day, same artifacts, opposite verdicts, **identical underlying data**:

| when | roster_capacity / league_opportunity | root |
|---|---|---|
| 2026-08-08 11:58 (inside the 3h grace window) | `freshness_overdue / within_grace`, 24.64d | **`ok`** |
| 2026-08-09 09:32 (before the 09:35 & 10:00 slots) | `stale / past_grace`, **25.54d** | **`degraded`** |

Config: both `cadence: weekly`, `grace_hours: 3`, scheduled 10:00 and 09:35, `dormant_ok: false`,
in-season months [9,10,11,12,1]. **Neither has a producer** — `launchctl list` returns none.
**Conclusion: the health light turns green every day for a window around mid-morning, on data now
25.5 days old, waiting on a job that will never run.** That window includes the hour David would sit
down on a Tuesday in season. Pinning the exact evaluator rule is crew work; the outcome is not in doubt.

## MORNING JOBS — 2026-08-09
- `league_capture` — ran clean **09:20:43**, marker `status: ok`. Health: `fresh`, 0.01d.
- `feature_refresh` — **started 09:15, still running at 09:30 (PID 7620, 15+ min elapsed).**
  Yesterday's completed in ~6 min. Not failed; running long. Health still grades **yesterday's**
  report `fresh` at 1.01d.
- `pvo_refresh` — started on time **09:30** (PID 23816). Health reads `freshness_overdue /
  within_grace` at 1.00d while it runs.
- **Yesterday's feature refresh substance (VERIFIED from `stream_provenance`):** `participation`
  = `loaded_empty` (ValueError); `pbp`, `player_stats`, `snap_counts` all `fallback_used: true`
  (ValueError / ConnectionError / ValueError). **Only `rosters` loaded clean.** The report still
  said `status: ok` and health still graded it `fresh`. The shape-not-substance gap is live daily.

## UNCHANGED, RE-VERIFIED 09:32
`realized_outcome` grades **`fresh`** at 4.97d — still the 2026-08-04 `noop`. Nothing has graded a
prediction. Model provenance / capture health / tier readiness subsystems all `ok`.

## STUDIO — from disk, 09:28
**Alive and producing.** `017-the-job.md` and `018-what-repeats.md` (08-08), **`019-on-the-field.md`
written 09:24 today.** `DAVID.md` 09:15 today, `for-david/STATUS.md` 09:24 today.
019 supersedes 017/018 on David's own reaction, quoted in it: *"wtf is a JOB?? are you using any of
your football context research?"* — **David has been working with Studio directly across 08-08/09.**
019 status line: *"Not approved, nothing relayed."* Studio reports **no background jobs** in its lane
and the **fresh-eyes covenant INTACT** — it deliberately left the product's `visualCraftAudit.test.js`
baseline unread, and named the cost rather than hiding it.

**RELAYED PROPOSAL (Studio's, not started, David's gate):** install Playwright MCP and Chrome
DevTools MCP. Changes his machine, therefore his word.

## CREW — observed only, not Tower's lane
Ledger `2026-08-09.md` 41KB by 09:25 · 2 commits today · **57 uncommitted paths** (22 yesterday).

---

# ============ 2026-08-09 EVENING — RE-VERIFIED 21:58–22:03 ET ============

**VERIFIED 21:58 — `curl localhost:8000/api/health`** → `http=200 t=24.96s`, `overall_status:
degraded`, `worst_affected_tier: daily_diagnostics`. Root `/` = 0.033s. **Latency trend on this one
endpoint: 14.4s (08-08) → 39–44s (08-09 09:32) → 25.0s (08-09 21:58).** Still ~750× every other
route. User-facing: it is the System Diagnostics card.

**VERIFIED 21:58 — the stale pair is unchanged and still has no producer.**
`roster_capacity` observed_at 2026-07-15T00:40:22Z, age 2,251,091s = **26.05d**, `past_grace`,
tier `daily_diagnostics` — this is the degraded root. `league_opportunity` same, auxiliary.
`launchctl list | grep -iE "roster|opportunity"` → **NONE**. 8 dynasty jobs loaded, all exit 0.

**VERIFIED 22:00 — today's jobs ran on time; substance again degraded under a green status.**
`feature_refresh` generated 2026-08-09T13:41:46Z, `status: ok`, graded `fresh`. Its own
`stream_provenance`: `participation` fallback (ValueError) · `pbp` fallback (ValueError) ·
`player_stats` fallback (ConnectionError) · `snap_counts` fallback (ValueError) · **only `rosters`
loaded clean.** Four of five streams on cache, second consecutive day. `pvo_refresh` 13:33Z,
`what_changed` 13:45Z, both `fresh`.

**VERIFIED 21:58 — models unchanged.** `realized_outcome` still the 2026-08-04T14:09:32Z `noop`,
graded **`fresh`** at 5.49d. Nothing has graded a prediction. All three subsystems `ok`,
every report `decision_supported: false`.

**VERIFIED 22:02 — crew shipped a real data source today.** 24 commits. `schedules_capture` (nflverse)
and `cfbd_fbs_schedules_capture` landed with RED contract tests and captured content under
`app/data/sources/`. First non-docs substance in days. **Doc paths to code paths ≈ 99 : 20.**
41 uncommitted paths at 22:02. Zero frontend, API or model files touched.

**VERIFIED 21:59 — Studio alive.** `019-on-the-field.md` 09:24 today plus a `019-on-the-field/`
working directory 10:12; `DAVID.md` and `for-david/STATUS.md` both **15:09 today**. Not blocked,
not dark.

**DATED COMMITMENTS — unchanged, and two are late.** Grounding-layer GO/NO-GO **DUE NOW, still
unraised**. Gemini seat record **overdue ~2 weeks**. Studio fresh-eyes ~09-01 approaching.

## ⚠ TOWER CORRECTION — 22:50, self-caught before David
**What Tower told David 22:05:** *"500,303 prediction snapshots sitting in the capture DB that it
never reads"* — presented as the asset justifying PROPOSED CHANGE #1. **The count was real; the
substance was not, and the error is the exact species Tower had criticised the freshness layer for
in the same message: grading shape, not content.**

**VERIFIED 22:48 — `sqlite3 app/data/model_forward_capture.db` (read-only), full-table GROUP BYs:**
- `model_forward_prediction_snapshot` = **524,735** rows, 43 capture dates 2026-06-28 → 2026-08-09.
- `prediction_ppg_status`: **`capture_incomplete` 503,168 (95.9%)** · `captured` **21,567 (4.1%)**.
- `projection_2y` IS NULL on exactly those same 503,168 rows.
- `util_snapshot_status` on the sample incomplete row: `missing_feature_row`.
- Player identity is NOT the problem — only 43 rows are `unresolved:`.
- **Usable = resolved player AND non-null projection = 21,567 rows / 506 distinct players.**
- Per day: **12,218 rows captured, of which 501 carry a projection.** Stable at 501 every single day
  across the window. **Whether 501 is the intended fantasy-relevant universe or a silent cap is
  crew's to answer — Tower does not know and must not assert.**

**Consequence for the recommendation, and it is a real revision:**
1. **Nothing is gradeable today.** These are 2026-season predictions; no 2026 game has been played.
   `run_scoring` needs a FINALIZED (season, week) — line 190. The urgency is NOT "learn if the model
   is good this week."
2. **The September trap is a scheduling fact, not an opinion.** In-season window months [9,10,11,12,1];
   job installed and firing; `_default_prediction_loader` (line 392) `return []` → predictions
   checked FIRST (line 193) → `no_predictions_for_target` → `noop`; `report_freshness.json:130-134`
   lists `noop` as a **success status**; tier `auxiliary` cannot raise the health light. **It will
   report healthy all season while grading nothing.**
3. **The genuinely perishable asset is the CAPTURE, not the scorer.** Outcomes can be backfilled
   forever; you can never go back and ask the model what it believed on a past date. Every day the
   capture writes ~11.7k hollow rows per 501 good ones is a day of archive that cannot be redone.
**Tower's sharpened recommendation: the capture-completeness gap is the time-critical item; the
scorer wiring is important but has ~4 weeks of slack. Both remain PROPOSED PRODUCT CHANGES,
unstarted, unauthorized.**

## ✅ 23:15 — THE "CAPTURE GAP" IS NOT A GAP. Tower's 22:50 read was wrong; withdraw the fix.
David approved (23:10) three things: the diagnostic, tonight's two builds, Studio's MCP install.
The diagnostic ran first and **invalidated one of the two builds before any hand-off happened.**

**VERIFIED 23:14 — read-only code trace, citations checked:**
- `src/dynasty_genius/capture/model_forward_capture_driver.py:568-570` — status is a **pure null-check**
  on `projection_2y`, copied from the PVO row at `:552`. No filter, no threshold, no rank test.
- `src/dynasty_genius/pvo_assembler.py:378-382` — `projection_2y` is set **only inside the Engine B
  branch**. Engine A (`:357-376`) produces a DVS, not a 2-year PPG projection, so its 80 rows are
  null **by construction**.
- Writing a row for all ~12,218 is **deliberate**: "append-only, survivorship-complete: retired/
  injured/cut/benched players are retained with explicit status, never silently dropped" —
  `docs/superpowers/specs/2026-06-27-realized-outcome-loop-design.md:71`, driver comment `:539-544`.
- The 501 reconciles exactly and independently: `app/data/valuation_runtime/universe_pvo_coverage_runtime.json`
  reports `counts_by_engine_path.ENGINE_B = 501` and `engine_b_identity_join.join_success_count = 501`,
  `prediction_count = 503`, `orphan_count = 2` (both `sleeper_id_missing`, named).
- 501 emerges from data, not a cap: skill positions only (`scripts/assemble_engine_b_dataset.py:167`)
  ∧ `games_t >= 4` (`feature_assembly.py:142-143`, constant `:57`) ∧ inference season 2025
  → 503 runtime rows − 2 identity orphans = **501**. No LIMIT / head / top-N anywhere in the path.
- History shows a clean step 503/day (06-28→07-09) → 501/day (07-10→08-09), matching the
  seed→runtime feature-source switch. Monitored: `scripts/run_pvo_refresh.py:167-171` flags a
  `coverage_count_delta>=10` on any modeled engine path.

**CONCLUSION: the archive is NOT 96% hollow. 501 IS the modeled universe. There is no perishable
capture defect and nothing to fix. Tower's 22:50 "perishable clock" argument is WITHDRAWN.**

**PROPOSED PRODUCT CHANGE (new, small, NOT approved) — the status vocabulary is overloaded, and it
is what fooled Tower.** `src/dynasty_genius/capture/prediction_snapshot_store.py:17-22` documents
`capture_incomplete` as *"the companion write should have happened and didn't — fail-closed."* The
driver stamps that same word on ~11,717 rows/day whose real meaning is "outside the modeled
universe." The spec's vocabulary (`…design.md:58`) has no term for that state. No test pins the
driver's use. **A word meaning "a write failed" is being applied to normal, correct behaviour —
it produced one false alarm tonight and will produce more.**

**STILL VALID AND STILL APPROVED: wire the outcome scorer before the September window opens.**
Nothing in this trace touches the `_default_prediction_loader` `return []` at
`scripts/run_realized_outcome_scoring.py:392`, the predictions-checked-first order at `:193`, or
`noop`-as-success at `app/config/report_freshness.json:130-134`. The September trap is unchanged.

**STUDIO — VERIFIED 23:13, `bin/pane-send.sh` → `VERDICT=DELIVERED`** (marker `SM-0809-MCP` found in
2.1's transcript; presend gate PASS). David's MCP approval carried. Nothing else sent to that lane.

---

# ============ 2026-08-10 — SESSION CLOSE, VERIFIED 14:56–15:05 ET ============

## ⚡ THE SLOW ENDPOINT IS FAST AGAIN — cause NOT established
**VERIFIED 14:56 — three consecutive probes of `localhost:8000/api/health`: 2.51s, 1.83s, 1.77s.**
Payload identical (3,556 bytes). Trend on this one endpoint: 14.4s (08-08) → 39–44s (08-09 morning)
→ 25.0s (08-09 22:00) → **~1.8s now. Roughly 14× faster than last night.**
**Tower has NOT established why.** No commit names it. Candidates not distinguished: `529a3e5
fix(layer1): make the B21 canonical read fail-closed and identity-bound`, or a server restart.
**An unexplained improvement is not a fix and may regress. Do not report it as fixed.**

## HEALTH — still `degraded`, same single cause, now 26.76 days
**VERIFIED 14:56 — `/api/health`:** `roster_capacity` `stale/past_grace` **26.76d** (degraded root,
`daily_diagnostics`); `league_opportunity` same, auxiliary. **Still no producer** — David did NOT
approve the six board items at 23:10, so this is expected, not a regression.
All other artifacts `fresh`: `pvo_refresh` 0.23d · `feature_refresh` 0.23d · `what_changed` 0.22d ·
`market_divergence` 0.22d · `league_capture` 0.23d. `realized_outcome` **`fresh` at 6.20d** — still
the 2026-08-04 `noop`. All three subsystems `ok`.

## ⚠ THE APPROVED SCORER WORK HAS NOT STARTED
**VERIFIED 15:00 — `git log --since='2026-08-10 00:00'` = 35 commits; grep for
`outcome|scorer|realized|snapshot` in subjects → NONE.** Non-docs files touched today are entirely
the footballguys intake thread (`footballguys_intake.py`, `daily_control.py`, `source_registry.py`
+ contract tests). **The September trap is unchanged and unaddressed** —
`run_realized_outcome_scoring.py:392` still `return []`, `:193` still checks predictions first,
`report_freshness.json:130-134` still lists `noop` as success, tier still `auxiliary`.
**This is the single most important open item and it belongs to David to hand over.**

## 💰 COST WATCH — the duty that has no other owner
**VERIFIED 15:02 — 25 commits matching `round-N` / `framing vN`, timestamped 08:49 → 12:39 today
= ~3h50m of three lanes running challenge/accept rounds on the FRAMING of one intake module.**
It did land real code (`f9b57d3 feat(footballguys): Phase A intake…`), so it was not wasted — but
the newest commit is `f2dc48a … GREEN review NOT CLEAR (3C/4H) — repair plan wired, RED v3
requested`, i.e. still in review churn at 14:51. **60 uncommitted paths.** Named, not judged:
Tower does not direct the crew. **This is exactly the class of spend that had no watcher 08-01→08-07.**

## STUDIO — approval delivered, lane then went quiet ~15.5h
**VERIFIED 14:57 from disk (2.1 retains no scrollback):** newest proposal `020-when-can-i-believe-it.md`
**2026-08-09 22:34**; `for-david/STATUS.md` 22:34; `DAVID.md` **23:22** — i.e. Studio wrote AFTER
Tower's 23:13 delivery, then nothing for ~15.5h. Pane 2.1 now `busy=no dialog=none composer=empty`.
**VERIFIED 14:58 — `~/frontend-studio/.mcp.json` DOES NOT EXIST; `.claude/settings.local.json`
mtime 2026-08-09 09:43, i.e. before the approval. The MCP install has NOT happened.**
Studio's own STATUS.md still carries it as the open item: *"The one decision worth his time when he
is up: whether to install Playwright MCP and Chrome DevTools MCP."* — **that decision is now MADE
and delivered; Studio simply has not acted on it yet.**
Studio reports **no background jobs** in its lane and the **fresh-eyes covenant INTACT** (product's
`visualCraftAudit.test.js` deliberately unread, cost named).
**Blocked-idle vs rest: NOT ESTABLISHED.** Nothing blocks it — the approval is in its transcript.

## DATED COMMITMENTS — unchanged, still late. Tower's own duty, no other owner.
| Item | Due | State |
|---|---|---|
| Grounding-layer full-build GO/NO-GO | ~Aug 2026 (his charter edit 2026-07-22) | **DUE, STILL UNRAISED — 2 sessions running.** NO-GO is legitimate. |
| Gemini seat contribution record | ~2026-07-24 | **OVERDUE ~2.5 weeks.** |
| Studio fresh-eyes review + crew stability | ~2026-09-01 | 3 weeks out. Studio producing through 08-09. |

## 🔴 THE COCKPIT BACKUP IS BROKEN — and has been since ~09:57 today
**VERIFIED 15:08 — `bash ~/dg-cockpit/backup.sh` → exit 1.** It aborts at `backup.sh:71`,
`"$REPO/autonomy/verify.sh" --source-only`, under `set -euo pipefail`.

**The event, not the symptom.** A **"Dynasty autonomy layer"** was merged into `~/dg-cockpit` this
morning — `e3c8ee7 08-10 09:56 feat: add Dynasty autonomy layer` and `9f9e8ff 08-10 09:57 merge:…`.
**Its own verifier fails**, so it now blocks every cockpit backup. Tower did not author it and does
not know who did.

**The failing assertion** (`autonomy/tests/cockpit.test.mjs:14`): it expects the launcher to read
`claude --plugin-dir "$HOME/dg-cockpit/autonomy/claude/dg-engineering"`; the actual
`home/dynasty_flight_deck.sh` hardcodes `/Users/davidleess/dg-cockpit/…`. **A `$HOME`-vs-literal-path
mismatch — one line.** Tower has NOT fixed it: `dg` rebuilds David's entire session and the cockpit
launcher is not Tower's to edit under v2. Naming it precisely so the fix is two minutes for whoever owns it.

**What this actually costs, stated exactly:**
- **VERIFIED — last successful off-machine backup: `d7a6f26` 2026-08-09 22:00.** Everything after it
  is unbacked: Tower's 22:50 correction, the 23:15 diagnostic result, today's 15:05 board entry, the
  rewritten handoff, Studio's `020-when-can-i-believe-it.md` and its whole `craft/` + `tools/` output.
- **`~/dg-cockpit` is `[ahead 2]` of `origin/main`** — the autonomy commits are not on the remote either.
- 21 modified/untracked paths in the backup tree. The rsync copy steps (`backup.sh:37-55`) DID run
  before the abort, so the content is staged in the working tree — **copied, never committed, never pushed.**
- **NOT at risk of loss tonight:** the live originals sit in `~/.claude/tower/`,
  `~/.claude/projects/-Users-davidleess/memory/` and `~/frontend-studio/`, which survive a `dg`
  session rebuild. **What is missing is the SECOND COPY. Everything from the last ~17 hours exists on
  exactly one machine.**

**Tower does not talk its way past a FAIL. This closeout is reported as NOT DURABLE.**

---

# ============ 2026-08-11 — VERIFIED 23:44–23:52 ET ============

**LAYER 1 (asked by David):** last `layer1`-tagged commit `529a3e5` 08-09 20:19. Since then the
crew's active thread IS Layer 1 source work — the Footballguys intake: AGENT_SYNC banner (08-10)
records Phase A framing CLEAR at round 25, David's retention word "1" given, RED authorship
authorized. Commits 08-10→08-11 show a Codex RED v9→v18 repair loop; newest `87362f1` 08-11 22:43
"GREEN repaired vs RED v18 — 505/505 strict, suite 5738/0". 76 uncommitted paths.

**SCORER STILL UNSTARTED (approved 08-09 23:10):** `git log --since='2026-08-10 15:00'` grep
outcome/scorer/realized/snapshot → **0 commits**. `run_realized_outcome_scoring.py` prediction
loader still `return []`; `report_freshness.json:133` still lists `noop` as success. September trap
unchanged, 3rd session running.

**COCKPIT BACKUP STILL BROKEN:** `backup.sh` exit 1, same `$HOME`-vs-literal-path assertion in
`autonomy/tests/cockpit.test.mjs`. dg-cockpit still `[ahead 2]`. Last off-machine backup `d7a6f26`
08-09 22:00 — **~2 days of Tower/Studio state on one machine.**

**DELIVERED 23:55 — TW11-SCORER-HANDOFF to dynasty:1.1.** David's word 23:50 ("find the right time
and then tell the team whats needed"). Waited out the lane's build (busy 23:52 → clean stop
23:55:05), presend gate PASS, `pane-send.sh` → **VERDICT=DELIVERED** (marker in transcript, whole
buffer searched). Content: the approved scorer wiring + September trap, the named backup defect
(owner unassigned), unapproved items explicitly excluded.

## 🔴 07:12 TOWER CORRECTION — caught by DAVID ("are u sure?"), not by Tower
**Tower's 07:05 verdict ("1.1 hallucinated — 'I can't commit/push' is verified false") was WRONG.**
VERIFIED 07:11 by live test: the 08-10 autonomy layer's PreToolUse hook
(`dg-engineering/scripts/pre-tool-use.mjs` + `lib/policy.mjs:276`, `contract.json` hardGates)
**denies `git commit` and `git push` to pane 1.1** — "Action requires a human gate" — overriding
the settings allowlist. Tower's two "proofs" were real citations that didn't support the
conclusion: the allowlist is overridden by the hook, and the ~100 commits are unattributable to
1.1 (Codex's pane is not Claude Code and carries no hook). The lane's repo-state table was
accurate in every checked cell. **Lesson, again: a citation is not a verification of the
CONCLUSION it is attached to. The 07:05 message reached David before the check that would have
killed it.** Advice retracted with it: "tell the lane to run its own commit" — it cannot.

---

# ============ 2026-08-12 — SESSION CLOSE, VERIFIED 13:38–13:45 ET ============

**PHASE A LANDED, NOT PUSHED.** `e6b6775` 07:38 "land Phase A RED v26 + GREEN — 660/660 strict,
dual-lane reviewed." Repo now **ahead 101**; CI shows no push run since 08-10 13:39Z — only
scheduled compliance audits. The push David was handed this morning has still not happened.

**SCORER: STILL ZERO COMMITS — 4th session.** Handoff TW11-SCORER-HANDOFF was DELIVERED 08-11
23:55 (verified marker). A full day of footballguys work since; nothing against the scorer.
September trap unchanged.

**STUDIO: quiet ~2 days.** Newest output 08-10 14:57–14:59 (`020` proposal, DAVID.md, STATUS.md).
`.mcp.json` still absent — the 08-09-approved MCP install never happened. Exceeds a working
session — **flagged to David at close as possible blocked-idle.**

**DATED COMMITMENTS:** Grounding GO/NO-GO **still unraised — 4 sessions.** Gemini seat ~3 wks
overdue. Studio fresh-eyes ~09-01.

**Today's Tower correction (07:12) stands on the record above: the autonomy hard-gate hook is
real; 1.1 was truthful; Tower was wrong and David caught it.**
