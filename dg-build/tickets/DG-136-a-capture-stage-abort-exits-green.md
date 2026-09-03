# DG-136 — A capture-stage `abort()` exits 0: the chain reports green on a morning that captured nothing

**Layer:** 2 · **State:** LIVE on trunk 09-02 21:34 (landed `a1f1023f` 21:29; trunk pulled 21:33, API pid 90590) · **Lane:** Fred (`davidleess-45`) · **DG 3.0** · **ops / forward capture · small**
**Source:** 09:00-chain rehearsal readers (2026-09-02 ~06:00, trunk `f8995d3d`); verified against the live log by Tower; ticketed 2026-09-02 06:15 by Tower.

**Problem:** every refusal inside `capture_model_pvo_snapshot`
(`src/dynasty_genius/capture/model_forward_capture_driver.py:448-456`, the local `abort()`) is
RETURNED as a dict, not raised. `_publish_runtime` (`scripts/run_pvo_refresh.py:417-438`) stores
that dict at `report["capture_report"]` and only a *raised* exception rewrites the outer
`report["status"]` — so the outer status stays `"ok"`, `main()` returns 0 (`:742`), and
`run_daily_chain.py:242` marks the step `ok` from the exit code alone. A morning whose capture
appended zero rows is therefore indistinguishable, at the chain level, from a morning that
captured 12,226.

**It has already happened, unnoticed:** `app/data/logs/pvo_refresh.out.log` lines ~377228-377311
hold TWO 2026-08-31 runs whose report reads outer `"status": "ok"` with
`capture_report.status: "aborted"`, `aborted_reason: required_provenance_missing:…te_v3_metadata.json`.
Both exited 0. `model_forward_capture_raw` has NO 2026-08-31 rows (68 dates present since
06-24; 08-12 and 08-31 are the two holes). The "one capture day lost" finding of 09-01 was
reached by reading the DB, not by any monitor — nothing on the machine would have said so.

**Fix shape (pick one, say which):** (a) in `_publish_runtime`, after the capture call, if
`capture_report.get("status") != "ok"` set the outer `status` to `"aborted"`,
`aborted_stage: "capture"`, `aborted_reason` from the inner report, and keep
`restored_from_backup: False` (the refresh DID succeed and the runtime pair must stay published —
the comment at `:417-418` already says so; this ticket changes the *exit code*, not the rollback
rule); or (b) have the chain read `capture_report.status` from the persisted report. (a) is the
one-line honest fix and also covers the standalone `com.davidleess.dynasty-model-pvo-refresh`
label, which is where the 08-31 runs came from; (b) leaves that label green. Prefer (a).

**Anti-scope:** do not raise from inside the driver (its persisted bare-token report is the
contract that the DG-131 capture and the standalone CLI read); do not roll back the runtime pair
on a capture abort; do not touch the receipt-based catch-up guard's success test without checking
what it reads (`reference_sleep_catchup_guard`) — if it keys on exit code, a green-to-red flip
here will make it re-kick a morning that legitimately refused, which is the *correct* new
behaviour but must be known.

**Verify:** a contract test that feeds a `capture_fn` returning
`{"status": "aborted", "aborted_reason": "x"}` and asserts `_publish_runtime` returns
`status == "aborted"`, `aborted_stage == "capture"`, and the runtime pair on disk is the NEW
bytes (not restored); `main()` exit 1 on that path; the existing ok-path test unchanged.
After landing: the first morning it fires, the chain report must name the step `failed` and the
runtime pair must still carry that morning's `artifact_vintage`.

**Built 2026-09-02 20:32–20:57 on `ticket/DG-136` (Fred, `davidleess-45`) — worktree created 20:32, first
commit 20:39, amended to `11646a09` at 20:57 after the audit below — on top of DG-135's `60f6940f`. Fix
shape (a), as the ticket preferred, with three things the ticket did not say:**
- **Both paths, not just `_publish_runtime`.** The legacy in-place path (`runtime_dir=None`, still
  reachable by flag) had the identical hole; it gets the same abort report with its refresh metadata
  (`pre`/`post`/`semantic_changed`/`dirty_paths`) preserved, the way its *raised*-failure branch already
  did. One helper, `_capture_refusal(capture_report) -> Optional[str]`, is the single rule both call.
- **Fails closed, beyond the ticket's `!= "ok"`.** Only a literal `status == "ok"` clears the stage. A
  report with no `status` → `aborted_reason: capture_report_missing_status`; not a dict at all →
  `capture_report_malformed:<type>`. Same *rule* the health card applies to this receipt's own top-level
  `status` (`report_freshness.json` `status_field`/`success_status`) — a different field; the card has
  never read the nested driver report. Checked that this cannot turn a healthy afternoon red: the driver
  has exactly two top-level statuses (`"ok"` at `model_forward_capture_driver.py:652`, `"aborted"` at
  `:451`), all nine `abort()` sites (`:462,467,470,476,503,537,541,611,649`) are "nothing was appended"
  conditions, and same-day repeats return `ok` — today's four runs all read `ok` / 12,227 rows (09:00 in
  `daily_chain.out.log`, the chain inherits the step's stdout; 11:30, 14:00, 14:50 in `pvo_refresh.out.log`).
- **The driver is untouched, the pair is never rolled back, the guard's success test is untouched** —
  all three anti-scope lines held. `restored_from_backup: False` and the `runtime` block (new sha,
  marker `ok`) stay in the abort receipt so a reader can see the pair IS this morning's.

**Attribution, corrected by the audit (the ticket's title and my first draft both had it wrong):** the
chain did NOT mark `run_pvo_refresh` ok on 08-31 — its 09:00 step that morning failed on a *raised*
abort (`[Errno 62] Too many levels of symbolic links`, `daily_chain.out.log:19438`, exit 1). The two
exit-0 refusals (`required_provenance_missing:…te_v3_metadata.json`) were the **standalone label's 11:30
and 14:00 runs** (`pvo_refresh.out.log` ~377228-377311), which is what the ticket body says. The chain
reads nothing but the exit code, so it *would* report the same refusal `ok` at 09:00; the fix covers
both launchers. And "nothing on the machine would have said so" overstates it: the 10:30 gap alert's
store-hole check named the day at T+1 — `~/DG-CAPTURE-ALERTS.txt:17`, `2026-09-01T10:30 GAP
model_forward_capture: missing capture date 2026-08-31`. What DG-136 adds is a red exit at the run itself
and a same-morning chain-step line, ~20 hours earlier.

**What a refusal morning now looks like (each consequence read off the consumer, not assumed):**
- `main()` returns 1 → the chain marks `run_pvo_refresh` **`failed`** (`run_daily_chain.py:242`); the
  10:30 gap alert emits `GAP chain step run_pvo_refresh: recorded exit_code 1` and posts the macOS
  notification (`run_capture_gap_alert.py:393-396, 1030`; the accepted-exit pin file cannot suppress the
  chain-step line, and it holds no pins anyway); the standalone 11:30/14:00 label exits 1.
- **System Health renders the pvo_refresh row `producer_failed` / `producer_failure:<driver reason>`**,
  clock = receipt mtime (`system_health_models.py:558-580`, the DG-033 fallback) — **even though the
  served pair is fresh.** The row is `core_substrate`, so it degrades `overall_status`
  (`system_health_models.py:686-704`) and **the shell pill on every screen reads "Attention — details
  inside"** (`ShellStatusDrawer.tsx:45`) from the abort receipt onward. That is the tradeoff shape (a)
  buys: the exit code says the *morning* failed, not the *pair*. No serving surface hides data — the only
  readers of the refresh receipt are `report_freshness.json` and `catchup_guard.json`; the pair is served
  through its ready marker. If David wants a distinct "refreshed, not captured" state, that is a card
  change, not this ticket.
- A **14:00 standalone refusal is also named at the NEXT morning's 10:30 alert** as
  `GAP com.davidleess.dynasty-model-pvo-refresh: exited 1 on its last run` (launchd's persisted last
  exit, `run_capture_gap_alert.py:457-521`; today's alert line 21 is exactly that shape for 09-01's
  refresh-stage abort). Expected, once per boot session — not a fresh morning failure.
- The catch-up guard keys on the receipt, not the exit code — pvo_refresh declares no timestamp field
  (`catchup_guard.json:22`), so mtime is its clock, and the abort path writes the receipt → the run
  counts as attempted, **no re-kick loop**. Pinned by test against the guard's own planner: with the red
  receipt's mtime at 14:00:05, `plan_kicks` at 14:15 returns nothing; with no receipt it plans the 14:00
  kick. Greg's build note, answered by design.
- **The chain does not amplify:** no step declares `run_pvo_refresh` a hard upstream
  (market_divergence's is `run_fc_forward_capture`, `run_daily_chain.py:114`; what_changed has none), so
  market-divergence and what-changed still run over the still-published pair (pinned by test). Greg's
  second note.
- Capture-health's drift number goes unavailable with `chain_step_not_ok:failed`
  (`system_capture_health_models.py:727-728`) — right, nothing was captured.

**Verify (the ticket's spec, met):** `tests/contract/test_dg136_capture_abort_exits_red.py`, seven tests:
returned refusal → `status aborted / aborted_stage capture / aborted_reason` = the driver's own, pair on
disk = NEW bytes with marker `ok`, receipt == report; ok path unchanged; missing-status and non-dict
reports fail closed; **`main()` exits 1** with the pair published — real `main()` (argv → publish lock →
candidate → promote → capture → exit code) with the Phase-17.2 producer and the driver replaced by stubs
at their injected seams and `ROOT` pointed at tmp so the lock reads nothing; the driver stub is its
`abort()` shape verbatim; legacy path flips the same way; the guard's planner plans no kick off the red
receipt; no chain step hard-depends on the step. **Four of seven red on `60f6940f`** — verified by me
(old runner checked out, run, restored) and independently by two auditors against a `git archive` of
`60f6940f`; the three green on main pin existing facts the fix relies on (ok path, guard, chain topology).
The first fail-closed cut broke two pre-existing legacy tests that pass `capture_fn=None` (a `None`
report read as malformed) → the legacy path judges the refusal only when a capture was requested.
Full Python suite **6778 passed / 33 skipped** on `11646a09` (the amended, final commit).
No `frontend/` file, no OpenAPI change.

**Audit before David read this (30 agents, 0 died — 4 lenses, 2 skeptics per finding): 13 findings, 13
confirmed, 0 refuted; all folded in above.** The three that mattered: (1) the 08-31 attribution
(chain vs standalone label) was wrong in the ticket title, the runner docstring, the test header and my
first commit message — corrected in all four; (2) my first draft's build window "15:40–16:20" was
fabricated — git says 20:32/20:39, and the machine clock agrees; (3) "the worktree's capture DB is a
read-only symlink into trunk" was false — it is a plain writable symlink into the LIVE 1.4 GB store, so
an induced capture would write production rows; that, not a guard, is why none was run. The rest:
the 09:00 run's log location, "only the driver swapped" (three seams), "pinned by test" for the guard
(now true — test extended to `plan_kicks`), "same field" (same rule, different field), the shell pill,
the next-morning alert line, and "unnoticed" (T+1 store-hole alert did fire).

**Not done, said plainly:** no live refusal was induced end-to-end. The ticket's after-landing check
stands: the first morning it fires, the chain report must name the step `failed` and the runtime pair
must still carry that morning's `artifact_vintage`.

**Live when:** trunk `git pull` alone — both launchers run `scripts/run_pvo_refresh.py` from trunk's
checkout, so the next scheduled run (11:30 / 14:00 / 09:00) carries it; no API restart, no bundle for
THIS ticket. (The same pull brings DG-135, which DOES need `npm --prefix frontend run build` + restart.)

**Acceptance — landed 2026-09-02 21:29 ET (merge commit timestamp), David ran both one-liners himself (`git push -u origin ticket/DG-136`
at 11646a09, then `~/dg-build/bin/dg-land.sh DG-136`):**
```
→ rebasing ticket/DG-136 onto origin/main
Current branch ticket/DG-136 is up to date.
→ running tests            (Python suite green; frontend gate green, built in 178ms)
→ merging into main
Merge made by the 'ort' strategy.
 scripts/run_pvo_refresh.py                         |  53 +++++
 .../contract/test_dg136_capture_abort_exits_red.py | 265 +++++++++++++++++++++
 2 files changed, 318 insertions(+)
To https://github.com/davidtleess/dynasty-genius.git
   60f6940f..a1f1023f  HEAD -> main
✔ DG-136 landed on main and pushed. Worktree and branch removed.
```
Rebase target was DG-135's `60f6940f` (already the base — no-op). The frontend gate rebuilt a bundle
(`index-C6XzDCYI.js`) inside the worktree only; trunk's `frontend/dist` is untouched and still
`index-BZ1jEJNN.js`. Remote branch `origin/ticket/DG-136` still exists at `11646a09` (dg-land deletes
the local one only) — merged, harmless. ~~Not live: trunk is at `862a1afb`~~ — **superseded below.**

## Live on trunk — 2026-09-02 21:33–21:34 (David's "go")
All four steps run by Fred from `~/dynasty-genius-product`, receipts as read back:
1. 21:33:34 `git pull --ff-only` → `862a1afb..a1f1023f`, 10 files / +653 −3, the three pre-existing
   dirty files (`.mcp.json`, `docs/agent-ledger/2026-08-19.md`, `tests/test_aging_curves.py`) were not
   in the incoming diff and are untouched.
2. 21:33:41 `npm --prefix frontend run build` → `dist/assets/index-C6XzDCYI.js` (474,214 B) replaces
   `index-BZ1jEJNN.js` (07:44); `dist/index.html` references the new hash.
3. 21:34:03 `launchctl kickstart -k gui/501/com.davidleess.dynasty-api` rc 0 → **pid 90590** (was 95078),
   state running; pid unchanged at 21:34:53.
4. Probes on the new pid: `/api/health` 200 · `/api/engine-b/scores` 200 · `/api/system/capture-health`
   200 · `/api/roster/audit` 200 (27 players) · `/api/roster/capacity` 200; `/` serves
   `index-C6XzDCYI.js`; the served `/api/engine-b/scores` contract lists `200` and `503` (DG-135).
   Greg (`davidleess-0b`) sent the pid at 21:35.
No publish lock and no refresh/chain process at restart time. **First scheduled run to execute DG-136's
code: the 09-03 09:00 chain** (the 11:30/14:00 standalone label executes trunk's script too). Nothing
in this ticket has yet been exercised by a real refusal — the tests are the evidence, not a live run.
