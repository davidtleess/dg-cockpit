# Automatic forward market tracking — approved increment

**Final disposition:** COMPLETE, MERGED, PUSHED AND ACTIVE September 10 evening Eastern time. Both an actual launch and the natural scheduled retry passed. David subsequently approved landing with “Go”; DG222 source `3471848d` is merged at main `d05315e7` after the official8085backend/975frontend gate. The [final handoff](AUTOMATIC-TRACK-RECORD-HANDOFF-2026-09-10.md) supersedes the original pre-landing scope and intermediate builder status below. Root completed final runner/CLI integration and outcome preparation after the DG224 handoff; no builder assignment remains open.

David approved automatic model-versus-market tracking with “Go for it.” The outcome is an ongoing, immutable record of what the saved forecast said versus subsequent compatible FantasyCalc prices. Existing collectors and grading policies are reused. Root owns end-to-end implementation and reviewed activation of one dedicated tracking job. No new valuation model, hosted release, shared-store write or change to existing jobs is included.

## Current verified inputs

- New worktrees DG222–225 use base `4f93a3807c479260b7c374dcae27ee441e4db1a4`. Prior DG221 remains separate, awaiting actual visual QA because the Mac is locked.
- Actual current Sleeper league fetched at 23:27 UTC: 12-team Superflex, full PPR, no TE premium; all scoring settings and roster slots match the frozen report. Six playoff teams begin Week15 with the saved Week17 championship configuration.
- Original template archive: `/Users/davidleess/dg-wt/DG-189/runs/20260908T014624Z/archive/f67ae44e44fd51f0534f92c875a01d2bfc1b8a720bfc96025fc6115d45220dc0/`. All ten files are hash-locked. Forecast and ownership dates stay September6.
- Actual FC source: `/Users/davidleess/dynasty-genius-product/app/data/fc_forward_capture.db`, read-only, plus `/Users/davidleess/dynasty-genius-product/app/data/capture/fc_forward_capture_latest_report.json`. The FC09:00 step succeeds independently of the enclosing chain's later feature-refresh failure.
- Root verified all422 current rows, individual content hashes, unique IDs, one retrieval time and whole-batch hash against the separate actual collector success receipt. That is a complete **normalized collector capture**. Original HTTP response bytes remain unavailable; the old payload hash is retained as a receipt field, not falsely replayed.
- Historical rows exist, but continuous dates and stable row counts do not establish complete historical captures. Only evidence meeting the declared contract may supply trailing momentum. `fc_snapshots.db` is a different source series and is excluded. No density threshold or synthetic historical success receipt is permitted.

Root evidence: `/Users/davidleess/dg-wt/DG-222/runs/20260910T232518Z-automatic-track-record/`.

## Scope and ownership

| Ticket | Actual owner | Bounded work |
|---|---|---|
| DG222 | Codex root | Explicit forward-reading adapter; integration; private runtime/config; one dedicated LaunchAgent; independent source and real scheduled-path checks |
| DG223 | Claude54281 / session376f54b0-2909-46df-837c-ace5852eb144 | Read-only capture adapter and private immutable capture store; no existing collector changes |
| DG224 | Claude54331 / sessionfa00374f-ec34-45ea-9ec0-926acc034407 | Automatic enrollment/due-evaluation runner and CLI; reuse existing policy/scorer/store |
| DG225 | Claude54410 / session245fd3a2-d8ac-4908-9aad-b156da509998 | Independent scientific/source/runtime review; no builder edits |

All three actual identities and activity were verified before dispatch. Sagan supplements their work with independent operational review; it is not a replacement for the Claude builders.

Exact bounded implementation contracts are the immutable root-run files `capture-preflight-correction-and-contract.txt` and `runner-implementation-contract.txt`. Root's native test-first plan is `DG-222/docs/superpowers/plans/2026-09-10-automatic-market-track-record.md`. No other builder may edit another owner's files or modify an existing run's evidence.

## Scientific and product behavior

1. Build a NEW research reading from a verified original template and a later compatible market capture. Preserve original report/catalog/league/forecast bytes, model values and original ownership date. The existing default ranking reader remains same-day strict; the opt-in forward reader makes the differing dates explicit. Neither the hosted reading nor old archive is changed.
2. Preserve every raw market asset. Current422 rows comprise397 known skill positions,24 picks and1 unknown position. FantasyCalc's Travis Hunter price remains1564; his unresolved market position means no paired rank, not no price or a draft pick. The current rehearsal has386 paired players. This changes the new study's paired population, not the live board or any football forecast.
3. Create at most one automatic eligible enrollment per exact forecast identity and policy. New polling dates are not independent forecasts. Do not automatically create secondary enrollments or retrofit a comparator into an existing enrollment.
4. Fresh start: actual enrollment time, compatible capture no more than24hours old. Historical momentum uses the already-declared actual price ratio from a complete compatible trailing capture, never `trend_30day` or a backfill from another source. Missing history leaves the market registration awaiting its endpoint, with descriptive-only association and the comparator unavailable. It does not make a fresh market start itself invalid.
5. `as_of` is the observed retrieval clock for this collector. Source publication time is unavailable. Every record distinguishes original retrieval from the time this tracker preserved its evidence. New serialization hashes identify normalized artifacts; they are not claimed hashes of original HTTP bytes.
6. Keep the declared30-day descriptive and90-day primary windows and deterministic first-compatible-capture selection. Retain zero prices, missing endpoints, ties, unpriced/unresolved players and negative results with their proper meanings. Market movement remains separate from football production and actual trade/roster decisions.
7. New enrollment is market-only: football baseline and schedule inputs are absent, and the old production record remains intact. Do not grade a full-season forecast against partial outcomes or mislabel a new enrollment as preseason.

## Operational acceptance

Read the FC store with SQLite `mode=ro` and a consistent transaction; never instantiate its migrating store constructor. Bind actual original receipt bytes to every row/count/hash and reject races. Append verified captures only under a private explicit root, retain first preservation time on duplicate polls, and reject same-identity changes. Historical absence cannot stop preserving a valid new capture.

The runner uses a private interprocess lock, separate capture/enrollment/grade/wait/error outcomes, and a unique immutable receipt directory per invocation. It catches up after sleep/login without firing collectors or models. It evaluates due work through the existing scorer and records no premature grades. Unavailable open windows remain retryable; duplicate polling does not inflate samples.

After source, CLI and independent review pass, root packages a versioned private runtime under `/Users/davidleess/dg-runtime/forward-market-tracker/` and activates only `com.davidleess.dynasty-forward-track-record`. The new template stays outside the shared guard's scanned `ops/launchd/*.plist` directory. Existing installed job hashes and schedules are preserved. Verify an actual launchd invocation and idempotent follow-up, plus synthetic future-window tests; do not claim future real outcomes already exist.

No browser/UI change is required for this increment. The real surface is the collector-to-archive-to-enrollment CLI and scheduled runtime. Hosted freshness and a decision notebook are subsequent milestones, not silently added work. No commit/push/merge, dependency install, model refit/promotion, production API restart, shared data mutation, hosted publication or frontend-studio access.
