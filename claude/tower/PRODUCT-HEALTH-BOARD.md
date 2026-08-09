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
