# DG-040 — the daily nflverse capture has never once succeeded: upstream renamed contracts `cols`

**Layer:** 1  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG040-20260824  ·  **DG 3.0**
**Source:** live ops sweep, 2026-08-24, while ranking the board. The 06:15 job was exit 1 in
`launchctl list` and nobody had looked.

**Problem:** the nflverse contracts upstream changed shape between 2026-08-08 and 2026-08-21:
`cols` (List(Struct) of 13 cap fields) is now published as `season_history` — same 13 fields,
same trailing non-numeric `'Total'` row — and a genuinely new `contract_history` List(Struct)
of 11 fields was added. `nflreadpy` is unchanged at 0.1.5; this is a data-release change, not a
dependency change. The capture's exact-shape gate (`src/dynasty_genius/nflverse_usage.py:1320`)
refuses, correctly and loudly — but contracts runs last, so every scheduled run of
`com.davidleess.dynasty-nflverse-usage-capture` exits 1 **after** the 12 stat streams land.

The launchd job was installed 2026-08-20 with first run 2026-08-21 (SEASON-BRIEF), and the drift
predates it: **the scheduled job is 4-for-4 failed — it has never once succeeded.** The err.log
only shows two failures because the log lives on this machine and the machine is two days old
(Intel Air → M5 migration 2026-08-22).

**How we know:**
```
$ tail app/data/logs/nflverse_usage_capture.err.log
UsageCaptureError: nflverse_unexpected_columns: stream contracts record 0 has
unexpected ['contract_history', 'season_history'] and missing ['cols']; the declared
source shape is exact          # raised at nflverse_usage.py:1320 via :3044

$ sqlite3 'file:app/data/nflverse_usage.db?mode=ro' \
    "SELECT snapshot_id, count(*) FROM contracts GROUP BY 1 ORDER BY 1 DESC LIMIT 2"
nflverse-usage-20260808T0357…  48511      # the LAST normalized contracts vintage
nflverse-usage-20260808T0228…  48511      # both are 08-08 hand-runs

$ ls app/data/nflverse_usage/raw/ | grep ^contracts_ | (dates)
2×20260808, 20260821, 20260822, 20260823, 20260824    # daily raw blobs ARE written
```

**Census of the full 2026-08-24 payload** (51,994 records, streaming parse of the 1.7 GB raw
blob): one homogeneous 26-key top-level shape; all 3,243,422 `season_history` entries carry
exactly the 13 declared `cols` fields; all `contract_history` entries carry exactly
`amount_earned, apy, contract_type, effective_apy, guarantees, percent_earned, status, team,
total, year_signed, yrs`; 62 records have SQL-null for both nested lists; `is_active` is bool
everywhere; zero integer/non-finite violations. The new shape is as exact as the old one.

**What is and is not lost:** the 12 stat streams land daily before contracts fails (contracts
runs last by design and cannot roll them back), and the raw contracts payload is written to
`app/data/nflverse_usage/raw/` before normalize runs — so nothing is unrecoverable. What is
missing is 16 days of normalized contracts vintages (08-09 → today) and a green exit code on
the season's primary capture job, 17 days before kickoff.

**Done looks like:**
1. `_CONTRACTS_COLUMNS` declares the new exact source shape (26 keys: `cols` out,
   `season_history` + `contract_history` in), `json_columns` and `nested_fields` updated to
   match the census. The gate stays exact — the next drift must fail just as loudly.
2. The store widened by the module's own explicit path,
   `UsageStore.migrate_additive_columns(db_path, specs)` — additive only; the legacy `cols`
   column stays on the 08-08 rows (zero readers exist outside the capture module; verified by
   grep over src/, app/api/, scripts/).
3. A capture run from the trunk completes with status ok and a contracts vintage dated today
   in the store.
4. Contract tests pin the new shape, including the null-nested-lists case.

**Depends on:** nothing. **Related:** DG-033 (status grading on this producer), the
nflverse-"unchanged"-trap note (a stale mtime here means idempotent-healthy — this failure is
the opposite case and the ledger says `failed` outright).

---

**CLOSED 2026-08-24, lane ClaudeFable5-DG040-20260824. All four "done" criteria met.**

Landed as merge `6b5dceb9` on `origin/feature/outcome-loop-week1` — **the first ticket ever
landed through `dg-land.sh` unaided** (base checked out in the trunk, the exact DG-038
condition; its dry run proved the merge and `git ls-remote` confirmed nothing pushed until the
real land). RED 60 failed → GREEN 108 passed on the contracts contract file; full suite
**6323 passed / 40 skipped / zero collection errors** at the gate, twice (dry + real).

Deployment, each step run and verified:
```
$ git -C ~/dynasty-genius-product pull --ff-only        # trunk → 6b5dceb9; no dirty overlap
$ .venv/bin/python3.14 -c "...migrate_additive_columns(Path('app/data/nflverse_usage.db'),
    build_streams())"                                    # → {'contracts': ['season_history',
                                                         #    'contract_history']}
$ .venv/bin/python3.14 scripts/run_nflverse_usage_capture.py   # launchd's exact invocation
  → status "ok", EXIT=0, run nflverse-usage-20260824T1718351183490000
```
Store verified read-only afterwards: new vintage `…T1718…:contracts` = 48,690 rows beside the
two 2026-08-08 vintages (145,712 total — accumulate-from-capture-one arithmetic exact);
`season_history`/`contract_history` populated with `cols` NULL on new rows and vice versa on
legacy rows; **exactly 62 rows null in both nested columns — matching the payload census to
the row**; ledger `nflverse_usage_status_latest.json` reads `ok`.

The scheduled 06:15 run on 2026-08-25 is the remaining production confirmation; nothing
differs from today's hand-run but the launchd trigger, which the four failed runs already
proved fires.

**CONFIRMED 2026-08-25 06:34.** The scheduled run fired at 06:15:00 EDT and succeeded on its
own — the job's first clean scheduled exit: `launchctl list` exit 0;
`nflverse_usage_status_latest.json` status `ok`, run `nflverse-usage-20260825T1015008880030000`,
finished in 99s; contracts vintage `…20260825T1015…` = 48,690 rows stored beside yesterday's.
Nothing about this ticket remains open.

Cosmetic finding for the tooling, not worth a ticket: `dg-land.sh` composes the merge subject
as `TICKET: <branch subject>`, so a branch subject that already starts with the ticket id
lands as "DG-040: DG-040: …". Strip a leading `TICKET:` from the subject if it grates.
