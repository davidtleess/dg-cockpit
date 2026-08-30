# DG-100 — The nflverse vintage record is in NO backup, and the 30GB raw tree is invisible to the anti-rot test

**Layer:** 1  ·  **State:** todo  ·  **Lane:** ClaudeFable5-DG100-20260829  ·  **DG 3.0**  ·  **DECISION RECORDED 08-29 — build pre-freeze if Wed/Thu lands, else first in-season infra slot**
**Source:** filed 2026-08-29 night on David's delegation ("u decide", gap-audit session); mechanics measured that evening.

**Problem:** `app/data/nflverse_usage.db` (11.1GB, written daily ~06:16) is excluded from offsite backup as "Rebuildable from nflverse public usage statistics … not irreplaceable" — a rationale written before the store's role changed to daily point-in-time vintage capture. Public nflverse reproduces CURRENT content, not the dated vintages: 2027 training fuel a disk loss burns permanently. Worse, the sibling `app/data/nflverse_usage/` raw tree (30GB, ~1,548 entries — the snapshots themselves) is in NO manifest section with NO recorded rationale, because the anti-rot test scans only `*.db` files. The bigger half of the record is structurally invisible.

**How we know (2026-08-29):** exclusion at `app/config/backup_manifest.json:276-279`; anti-rot scope at `tests/contract/test_backup_manifest_anti_rot_red.py:138-154` (present `*.db` must be covered or excluded-with-reason — silent on directories); sizes by ls/du (db 11,097,899,008 bytes; raw/ 30G); mechanism read from `scripts/backup_irreplaceable_data.py` — manifest-driven, append-only FULL re-upload per run to an immutable prefix, then a full re-download sha256 verify (:353-366, :505-540); last six runs 3.3-3.67GB in 33-37 min (`app/data/logs/backup_irreplaceable.out.log`).

**DECIDED (David's delegation, 2026-08-29):** the vintage record goes offsite — goal 1, nothing is lost. **NOT via nightly manifest inclusion**, which would 4x the payload (~14.8GB), run ~2.5h past the 10:30 alert's read of the backup marker, cross every byte twice (upload + verify download), and grow the append-only bucket ~333GB/month on David's bill with retention deliberately deferred (spec :1562). Instead, an incremental channel for what is actually irreplaceable:
1. **Verify derivability:** confirm via DG-050's replay receipts that db content reproduces from raw snapshots + capture code for the nflverse streams specifically (harness read 20/20 REPRODUCED on 08-29).
2. **Additive daily sync of `app/data/nflverse_usage/raw/`** to ONE stable GCS prefix after capture — the tree is ~1,546 FLAT timestamp-named snapshot files (e.g. `ngs_passing_2025_20260805T….json`, no subdirectories — verified 08-29), immutable once written, so an additive, no-delete file sync uploads only each day's new files. One-time ~30GB, then daily deltas (~$0.60/mo standard-class storage vs ~$7/mo-and-compounding for naive nightly inclusion).
3. **Update the db's exclusion rationale** to "derivable from backed-up raw vintages + capture code (DG-050 receipts)". If step 1 fails for any stream, add a weekly db snapshot as fallback instead.
4. **Extend anti-rot coverage to non-`.db` data trees** under app/data/ so the next unprotected directory cannot be invisible.

**Done looks like:** raw/ mirrored offsite with a dated receipt; a restore drill (DG-052's scope) can name the vintage record among what comes back; the anti-rot test fails when a sizable data tree has neither coverage nor rationale.

**Depends on:** nothing to start. Backup-class changes are David-gated; this executes his 2026-08-29 delegation — **flag the land in the readout he reads.**

---

**Notes**
- The nightly 10:15 job is untouched either way; this is a new, separate channel.
- Land by Wed/Thu 09-02/03 to observe at least one cycle before the Fri 09-04 EOD freeze; otherwise first in-season infra slot (after CAP-9). See `~/dg-build/IN-SEASON-QUEUE.md`.
