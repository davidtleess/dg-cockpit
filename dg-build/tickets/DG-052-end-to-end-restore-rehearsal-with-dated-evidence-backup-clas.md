# DG-052 — End-to-end restore rehearsal with dated evidence; backup class joins per-store health

**Layer:** 1  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** foundation  ·  **Size:** 2d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** Section 6.4 line 298 requires per-producer health to include 'its backup class and last restore evidence are acceptable.' The audit's 'no restore-drill evidence anywhere' overstates the gap: backup_irreplaceable_data.py already downloads every backed-up object and sha256-verifies it against the staging inventory on each daily run before advancing latest.json, and today's marker shows sha256_verified true across 672 files. What is actually missing: no store carries a backup class (blocked on the catalog ticket's new field), the gap alert judges backup as one fleet-level marker rather than per store, and no rehearsal has ever proven the restored bytes reconstruct a working product — opening restored SQLite DBs with integrity_check and booting readers against a restored tree, the new-Mac disaster floor. Scope: a periodic (monthly) end-to-end rehearsal writing a dated evidence artifact, and per-store backup-class acceptance wired into capture health.

**How we know:** docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:298; scripts/backup_irreplaceable_data.py:14-18,508-540 (daily download-and-verify drill exists); app/data/ops/backup_status_latest.json (sha256_verified true, run 20260826T141500Z, 672 files); scripts/run_capture_gap_alert.py:363-377 (single fleet-level backup_lines, no per-store class)

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
