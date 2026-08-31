# DG-106 — The contracts stream writes a 1.6GB snapshot per capture, and every copy is kept forever

**Layer:** 1  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**  ·  **POST-FREEZE (in-season safe: no capture-path change before 09-04)**
**Source:** measured 2026-08-30 during DG-100's first real backfill; the discovery corrected DG-100's own cost figure.

**Problem:** `contracts` re-dumps the entire nflverse contracts table on every capture — **19.30 GB across just 14 snapshots, 61% of the whole 31.8 GB vintage tree**, at ~1.6 GB each, captured roughly daily. Nothing dedupes or compresses them. Every copy is retained locally, and now offsite too (DG-100's channel is append-only by law), so the record grows ~1.7 GB/day ≈ **51 GB/month permanently** — dominated by one slow-moving stream. Unaddressed for a year that is ~650 GB (~$13/mo of bucket, climbing) plus the same growth again on local disk, to preserve fourteen near-copies of a table that changes slowly.

**How we know (2026-08-30, all read-only):** per-stream sizes measured over `app/data/nflverse_usage/raw/` — contracts 19.30 GB / 14 files vs snap_counts 1.42 GB / 174 files; `shasum -a 256` over all 14 contracts snapshots returns 14 DISTINCT digests (each file embeds its own `captured_at`, so byte-identity can never hold even when the records are unchanged — see `src/dynasty_genius/nflverse_usage.py:2400-2419`, metadata written into the same document as `records`); capture cadence visible in the filenames (daily 10:15 stamps from 2026-08-21 onward). Throughput context from the same day: ~1 GB/min upload including verify.

**Done looks like:** the vintage record stays honest and complete while its growth stops compounding. Any of these, or a combination, decided on evidence:
1. **Cadence** — contracts is slow-moving; a weekly capture keeps the record meaningful at 1/7th the volume. Cheapest fix, no format change, no reproducibility risk.
2. **Content-addressed storage** — hash the `records` payload separately from the metadata envelope; when the payload digest is unchanged, write a small pointer snapshot instead of 1.6 GB. Preserves the daily "what did we see on this date" answer at near-zero marginal cost. Needs the replay harness to follow pointers (DG-050 contract).
3. **Compression** — these are uncompressed JSON of tabular data; gzip typically returns 85-90% on this shape. Smallest behavioral change; must keep the replay harness and DG-100's channel able to read/verify what they store.

**Depends on:** nothing. Touches the capture path, so it lands POST-FREEZE (a capture-format change during the six unmodified cycles the freeze buys is exactly what the freeze forbids).

---

**Notes**
- Do NOT delete existing snapshots to reclaim space. They are the record; the fix is the growth rate, not the history. Any retention proposal is a David-gated backup-class decision (MASTER §8).
- Whatever is chosen must keep DG-050's replay harness green — contracts is one of its 14 verified nflverse streams, and the reproducibility guarantee is what lets `nflverse_usage.db` be excluded from backup at all (DG-100).
- If option 3 is chosen, note DG-100's channel verifies by re-downloading and comparing sha256 of what it stored; compressing at rest is compatible, compressing in-flight-only is not.
