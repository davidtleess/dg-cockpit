# DG-192 — headshots across the complete workspace

Local preview: http://127.0.0.1:8793/?surface=workspace&view=roster

**954 players, 954 real headshots, zero missing, 954 distinct image hashes.** This is the full union of the workspace's ranking and comparison populations, including search-only players. The 27-player roster and 433-player available board retain their original membership and numbers. Market ranks and football comparison API responses are identical to preview8792.

Worktree `/Users/davidleess/dg-wt/DG-192`, branch `ticket/DG-192`, base/main `6f0315d2`. Actual Claude builders: DG-193/session245fd3a2 (acquisition), DG-194/sessionfa00374f (identity/detail/Compare); independent source/mount reviewer session376f54b0. Root integrated and independently inspected the implementation and rendered product. Nothing committed, merged, pushed or deployed by this increment.

## What changed

The preview now serves a verified private collection through `DG_HEADSHOT_CACHE_ROOT`. Player details and both comparison cards use the same photos as the board. Failed images fall back to initials; a failed photo cannot hide the next player's image in a reused component. Photos load lazily, reserve their layout space, and preserve the top of portrait-format headshots.

The new acquisition CLI requires a complete player population and a new output directory. Sources are exact-ID Sleeper photos, audited official NFL/Fordham portrait URLs, then verified ESPN NFL/college paths. It bounds requests, verifies TLS and image decoding, refuses unsafe inputs and shared output paths, and reports every missing photo, source, attempt and content hash. Inputs and raw photos remain private, outside publication.

Final sources: 945 Sleeper thumbnails, 5 verified NFL portraits, 2 ESPN NFL portraits, 1 Fordham portrait, 1 ESPN college portrait. Jack Strand, Isaiah Searight and Sal Cannella required recovery. Searight uses his authentic 2018 Fordham portrait; Cannella uses an authentic college-era portrait. These are recognition images, not statements about current team or age. Generic NFL placeholder assets were excluded after visual inspection.

## Evidence

Run: `/Users/davidleess/dg-wt/DG-192/runs/20260908T102054Z`.

- `final-provenance.json`: all954 final files rehashed against both acquisition reports; no missing, duplicate or known silhouette contents. Original951 fetched fresh; final run reused those verified bytes and fetched3 recoveries.
- `browser/`: initial951 decode-all pass,10 desktop/mobile workspace states,10 contact sheets covering all954 entries, and a real forced image failure followed by successful next-player recovery. Root viewed all contact sheets and every recovered portrait.
- `browser-final-v2/`:954/954 browser decode; all3 recovered players render, zero axe violations/overflow/page errors; `searight-final-crop.png` verifies the final portrait framing after the CSS adjustment. Earlier `browser-final/` stopped on a browser-test harness context error; it is not final evidence. The earlier Searight screenshot preceded asynchronous image decode; the explicit DOM-decode screenshot is authoritative.
- `proof/dg192-backend-complete.log`:75 passed (builder, mount, legacy assets, OpenAPI).
- `proof/dg192-frontend-complete.log`:112 files/871 tests passed; typecheck, Biome, CSS audits and frontend build passed. Existing warnings only.
- `final-api-preservation.json`: ranking/comparison payloads identical to8792; saved-snapshot archive available from a private copy.
- `shared-trunk-preserved-final.json`: shared-trunk status and all46 baseline file hashes preserved. The first comparison used a different untracked-files display mode; the final receipt uses the original exact command.

The independent review's existing-relative-directory test gap is closed. The source audit found swapped ESPN IDs for Izzo/Conklin in the current Sleeper dump; verified historical mappings were preserved, and both actual photos came from Sleeper's exact player photo IDs. Durable warning in `docs/agent-ledger/2026-09-08.md`; no shared identity data changed.

## Reproduce and operate

Use `.venv/bin/python -B scripts/build_workspace_headshots.py --players-json <players.json> --verified-identities-json <final-identities.json> --output-dir <new-absolute-run-directory>`. Optional `--seed-cache` may point read-only at a previously audited collection. On this Mac the decoder is `/usr/bin/sips`; it refuses if unavailable. No dependency installation is needed or authorized.

Point `DG_HEADSHOT_CACHE_ROOT` at the resulting **headshots subdirectory**, not the report directory. Preview8793 configuration is recorded in `preview-config.json`; final PID is in `preview-final-pid.txt` (reverify before acting). Earlier previews and original immutable archives remain intact. New captures on8793 target its private archive copy. Publication must include code/tests/CSS only and deliberately provision the private photo collection; never commit runs, raw sources, photos, runtime symlinks, or environment credentials.

Final independent review: `proof/dg192-final-independent.md`, **NO BLOCKER**. Reviewer independently rehashed954 files and inspected all3 recovered portraits. The reviewer ran a targeted guard mutation; root rechecked the final code hashes afterward and confirmed all files match the tested implementation. The two remaining suggestions concern future host additions and stricter ESPN ID syntax; neither affects the verified numeric IDs or the two explicit approved hosts in this collection. No additional scope was opened.

Disposition: **READY_FOR_GATE**. Local implementation, verification and review complete. A future publication action must deliberately provision the private image collection as well as land code.
