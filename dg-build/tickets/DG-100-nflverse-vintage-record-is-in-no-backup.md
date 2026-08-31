# DG-100 — The nflverse vintage record is in NO backup, and the 30GB raw tree is invisible to the anti-rot test

**Layer:** 1  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG100-20260829  ·  **DG 3.0**  ·  **DECISION RECORDED 08-29 — build pre-freeze if Wed/Thu lands, else first in-season infra slot**
**Source:** filed 2026-08-29 night on David's delegation ("u decide", gap-audit session); mechanics measured that evening.

**Problem:** `app/data/nflverse_usage.db` (11.1GB, written daily ~06:16) is excluded from offsite backup as "Rebuildable from nflverse public usage statistics … not irreplaceable" — a rationale written before the store's role changed to daily point-in-time vintage capture. Public nflverse reproduces CURRENT content, not the dated vintages: 2027 training fuel a disk loss burns permanently. Worse, the sibling `app/data/nflverse_usage/` raw tree (30GB, ~1,548 entries — the snapshots themselves) is in NO manifest section with NO recorded rationale, because the anti-rot test scans only `*.db` files. The bigger half of the record is structurally invisible.

**How we know (2026-08-29):** exclusion at `app/config/backup_manifest.json:276-279`; anti-rot scope at `tests/contract/test_backup_manifest_anti_rot_red.py:138-154` (present `*.db` must be covered or excluded-with-reason — silent on directories); sizes by ls/du (db 11,097,899,008 bytes; raw/ 30G); mechanism read from `scripts/backup_irreplaceable_data.py` — manifest-driven, append-only FULL re-upload per run to an immutable prefix, then a full re-download sha256 verify (:353-366, :505-540); last six runs 3.3-3.67GB in 33-37 min (`app/data/logs/backup_irreplaceable.out.log`).

**DECIDED (David's delegation, 2026-08-29):** the vintage record goes offsite — goal 1, nothing is lost. **NOT via nightly manifest inclusion**, which would 4x the payload (~14.8GB), run ~2.5h past the 10:30 alert's read of the backup marker, cross every byte twice (upload + verify download), and grow the append-only bucket ~333GB/month on David's bill with retention deliberately deferred (spec :1562). Instead, an incremental channel for what is actually irreplaceable:
1. **Verify derivability:** confirm via DG-050's replay receipts that db content reproduces from raw snapshots + capture code for the nflverse streams specifically (harness read 20/20 REPRODUCED on 08-29).
2. **Additive daily sync of `app/data/nflverse_usage/raw/`** to ONE stable GCS prefix after capture — the tree is FLAT timestamp-named snapshot files (e.g. `ngs_passing_2025_20260805T….json`, no subdirectories — verified 08-29), immutable once written, so an additive, no-delete file sync uploads only each day's new files. ~~One-time ~30GB, then daily deltas (~$0.60/mo standard-class storage vs ~$7/mo-and-compounding for naive nightly inclusion).~~ **⚠ COST FIGURE CORRECTED 2026-08-30 — measured, see below.**
3. **Update the db's exclusion rationale** to "derivable from backed-up raw vintages + capture code (DG-050 receipts)". If step 1 fails for any stream, add a weekly db snapshot as fallback instead.
4. **Extend anti-rot coverage to non-`.db` data trees** under app/data/ so the next unprotected directory cannot be invisible.

**Done looks like:** raw/ mirrored offsite with a dated receipt; a restore drill (DG-052's scope) can name the vintage record among what comes back; the anti-rot test fails when a sizable data tree has neither coverage nor rationale.

**Depends on:** nothing to start. Backup-class changes are David-gated; this executes his 2026-08-29 delegation — **flag the land in the readout he reads.**

---

## ⚠ MEASURED CORRECTION 2026-08-30 — my own "~$0.60/mo" figure was wrong

Filing this ticket I estimated the ongoing cost from the tree's TOTAL size and an assumed
small daily delta. The first real backfill batch falsified that within ten minutes, and the
honest numbers are materially different. Measured on the live tree 2026-08-30:

| stream | size | files | note |
|---|---|---|---|
| **contracts** | **19.30 GB** | **14** | **~1.6 GB per snapshot — 61% of the whole tree** |
| depth_charts | 4.29 GB | 80 | |
| ff_opportunity | 3.04 GB | 106 | |
| ftn_charting | 2.04 GB | 65 | |
| all nine others | 3.1 GB | 1,319 | |
| **total** | **31.8 GB** | **1,584** | |

The contracts stream re-dumps the entire contracts table on every capture, at ~1.6 GB a time,
and it captures roughly daily. All 14 snapshots carry DISTINCT sha256s (each embeds its own
`captured_at`), so they are near-duplicates, not exact ones — nothing dedupes them today.

**What that does to the numbers:** the one-time backfill is ~$0.64/mo of standard-class
storage (fine, unchanged in spirit). The ONGOING delta is not ~$0.60/mo — it is **~1.7 GB/day
≈ 51 GB/month of permanent, append-only bucket growth**, dominated by contracts. Left alone
for a year that is ~650 GB ≈ **$13/mo and still climbing**, on a bucket whose retention policy
is deliberately deferred (SEASON-BUILD-SPEC :1562). The channel is still the right shape and
still far cheaper than nightly full re-upload — but the compounding term lives in the capture
volume, not in this channel, and it is now tracked as **DG-106**.

**Also measured (useful, and better than the pre-land estimate):** real throughput is
**~1 GB/min including the per-file verify download** — the whole 31.8 GB backfill is under an
hour, not the ~3 hours I projected. The 07:00 daily slot has ample room.

## LAND RECORD 2026-08-30 — merge `874023ab` on main
Landed through dg-land after a pre-land adversarial panel (its correctness lens returned
1 BLOCKING + 3 major before the account hit its usage limit; all four were hand-verified
against the real code and fixed — write-stability/quiesce gate, dotfile skip, fail-closed
listing parse + `--no-clobber`, and the over-broad manifest exclusion). Suite 6,516 passed / 0
failed. Trunk pulled to `874023ab`.

**The kill test nobody planned:** the first backfill batch was killed mid-run (SIGTERM) when it
turned out `--max-uploads 10` meant 13 GB of contracts files. The design behaved exactly as
written — **8 complete, individually-verified objects on the remote, ZERO partial objects**
(GCS finalizes per object), **no marker written** (the run never completed, so it never claimed
success), and the run-start sentinel left as the only local record that it began. The next run
picked the 8 up as already-synced and continued additively. That is the append-only contract
proving itself under an abnormal termination, which no test could have shown.

~~**STILL OPEN for David's sitting (unchanged by the land):** bootstrap the plist and MOVE the
label from `catchup_guard.json`'s `unguarded` section into `receipts`.~~
**✅ CLOSED 2026-08-30 on David's word "install it".** Plist symlinked + bootstrapped 07:34
(15 dynasty labels, exactly 1 calendar slot, `runs=0` — no retroactive fire, so it never raced
the backfill). Guard registration landed as **DG-107** (merge `9c020e5c`) once the backfill's
marker existed; guard dry-run then read 13 jobs checked, 0 unconfigured, **`kicked: []`**.

**Notes**
- The nightly 10:15 job is untouched either way; this is a new, separate channel.
- Land by Wed/Thu 09-02/03 to observe at least one cycle before the Fri 09-04 EOD freeze; otherwise first in-season infra slot (after CAP-9). See `~/dg-build/IN-SEASON-QUEUE.md`.

## ✅ BACKFILL COMPLETE + CHANNEL PROVEN 2026-08-30

**One-time backfill, `status: completed`:** 1,584 of 1,584 files offsite, 1,575 uploaded this
run (21.95 GB) on top of the 9 the killed first batch had already placed, `sha256_verified: true`,
`failures: []`, 0 deferred, 0 dotfiles, 0 capped. The whole 31.8 GB vintage record is offsite and
every object was verified by download-and-compare, not assumed.

**The daily cost is 13 seconds.** A second run immediately after: `files_already_synced: 1584`,
`files_uploaded: 0`, `bytes_uploaded: 0`, exit 0, 13.3s wall. So tomorrow's 07:00 scheduled run
is trivial — the "scheduled job inherits an unfinished backlog" risk from installing the plist
mid-backfill is closed by measurement, not by hope.

**Known inefficiency, deliberately NOT fixed before the freeze:** the already-synced comparison
calls `file_fingerprint()` and uses only the size, so each run sha256s the full 31.8 GB to learn
sizes it could `stat()`. It costs ~10s of CPU a day and is correct, so it stays until after
2026-09-04; a one-line change to `path.stat().st_size` would make the daily run ~1s. Recorded
here rather than fixed, because a capture-adjacent change during freeze week buys nothing.

**Guard registration** completed as DG-107 (merge `9c020e5c`); acceptance in that ticket.
