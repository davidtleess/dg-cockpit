# DG-049 — Extend the capture-gap alert to the two unmonitored event streams (SR-10b's deferred scope)

**Layer:** 1  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG049-20260826  ·  **DG 3.0**
**Edge distance:** foundation  ·  **Size:** 2d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**In-season eligible under the freeze rule (capture-critical) — the one backlog item that may
land mid-season.**

**Problem:** SR-11's gap alert — the only detection channel — registers only the 3 store entries in capture_cadence.json; league_transactions and nflverse_usage stay unmonitored all season because the cadence analyzer has no event-stream store kind (bursty streams with legitimately quiet days do not fit daily-cadence semantics — the spec's own stated reason for deferring SR-10b). Gaps in these stores are permanently unbackfillable, and the risk window is widest right now: SR-09 replaces 13 proven plists with a brand-new chain whose bug would burn silent holes in exactly these stores — the L1 audit's named biggest risk. This is capture-critical, so it is the one L1 backlog item eligible to land during the season under the freeze rule; SR-10b is listed under the spec's 'WHAT HE DOES NOT GET', so no ticket or sprint slot covers it.

**How we know:** docs/strategies/2026-08-20-dg-SEASON-BUILD-SPEC.md:101 ('the cadence analyzer cannot hold them without a new store kind. Those two stores stay unmonitored this season'); app/config/capture_cadence.json (config_version 2, 3 store_id entries incl. fc_forward_capture); scripts/run_capture_gap_alert.py (store registration reads that config); audit L1 biggest_risk

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.

---

**✅ BUILT AND LANDED 2026-08-26 ~15:30 (merge on `main` via dg-land full gate, trunk pulled) —
the 2d estimate closed in ~45 minutes because both producers ALREADY write atomic status markers
on every run (no producer changes needed; the estimate priced building attestation, which
existed).** Design: attestation channel — after slot+grace the marker must attest TODAY with
status ok; absent/stale/unreadable/future-dated/failed each alert once per NEW signature, persist
silently (known-holes philosophy), recovery clears so relapse is loud. Config: additive optional
`event_streams` in capture_cadence.json (fail-closed validated; the pydantic strict-mode
tuple-vs-list trap cost one RED cycle and is why the loader tests exist). State schema 2 gains
additive `event_stream_issues`. 13 tests RED-first; DG-044's alert suite + capture-health suites
green unchanged. **Every capture store now has a detection channel before the chain soaks.**

**Live dry-run acceptance produced two side findings:**
1. The alert auto-flagged DG-053's committed-not-installed plist (class not_loaded) — TRUE
   positive. **Thursday's 10:30 check expectation is AMENDED: the run should print exactly ONE
   line (the ff-playerids not-loaded line) + heartbeat until David's bootstrap clears it.**
   Recorded in DG-045's land conditions.
2. `~/dg-wt` worktrees' share map predates `league_transactions/` — the dir is absent in
   worktrees, so a worktree-rooted dry-run shows a false "no attestation marker" for it. Trunk
   truth is healthy. Housekeeping: add league_transactions to dg-work.sh's share map.

*(Provenance: the closeout above was originally written 2026-08-26 to a mis-truncated filename —
`…-event-s.md`, one character short of the tooling's 60-char slug — and merged back here the
same evening; the stray file is removed. Side finding 2's housekeeping is DONE the same evening:
`dg-work.sh` SHARE_PATHS now includes `app/data/league_transactions`; existing worktrees
DG-014/DG-020/DG-045 stay unlinked until recreated — never recreate before the branch is pushed.)*
