# TOWER BOARD — the live state of every lane
# RULE: every line carries WHEN it was verified and FROM WHAT. A line without a fresh
# verification stamp is NOT reportable to David. Rebuild from source, never from Tower's
# own earlier messages — that is how a stale claim survives (2026-07-27, restore-drill AC).
# SOURCES OF TRUTH, in order: docs/agent-ledger/<today>.md · the pane's latest full report ·
# the artifact itself (git, marker, bucket, disk). Tower's memory is NOT a source.

LAST FULL REBUILD: 2026-07-27 22:05 ET · MODEL lines re-verified 23:14 from ledger 23:11 (from ledger lines 1-290 + all four panes + git + marker + bucket)

## LANE: Claude (dynasty:1.1) — implementing lane, spokesperson
STATUS      parked, idle, clean stopping point
LAST OUTPUT ledger 21:45 "DGX-02 AC RESOLVED — verified from the bucket, earlier 'unproven' reversed"
HOLDING     S0-01 (a)(b)(c) repaired + Codex-CLEAR, UNCOMMITTED (module e029a41f / contract 3b7b2287, 24/24 green)
BLOCKER     David's word to start unit (d). Reviewer CLEAR does not schedule work.
NEXT        (d) rounding-order repair — PRE-DECLARED RISK: may move the headline 131 by a boundary case
VERIFIED    22:05 from ledger + pane

## LANE: Codex (dynasty:1.2) — review lane
STATUS      idle, awaiting next unit
LAST OUTPUT ledger 21:13 "intermediate CLEAR on (a)-(c), content only, does not authorize (d)"
HOLDING     nothing uncommitted; review evidence files on disk
BLOCKER     none — waiting on Claude's next unit, which waits on David
VERIFIED    22:05 from ledger + pane

## LANE: Gemini (dynasty:1.3) — operations & telemetry, read-only
STATUS      idle, postflight filed
LAST OUTPUT ledger 21:01 telemetry postflight — jobs, DGX-02 independent verification, marker self-disclosure
BLOCKER     read-only `launchctl` dialogs refused by Tower's own guard; David's override unanswered
VERIFIED    22:05 from ledger + pane

## LANE: Studio (dynasty:2.1) — outsider design, self-directed. PANE RETAINS NO SCROLLBACK.
STATUS      idle after shipping; rest, not block
LAST OUTPUT proposal 011 + 011-RELAY (21:24/21:29), STATUS.md, DAVID.md entry
HOLDING     one question parked with Tower for David (tier ladder wording)
FINDING     DVS ceiling saturation + frozen model lane — TOWER-VERIFIED INDEPENDENTLY, see below
BLOCKER     David's gate on 011; nothing crosses without it
VERIFIED    22:05 from disk (pane cannot be read — take Studio's own acknowledgment)

## PRODUCT STATE — verified by Tower directly, not relayed
BACKUP      run 20260727T233130Z completed 288 files / 1,137,173,796 B / sha256_verified=true
            pointer names that run, verified=true. Restore drill PASSED end-to-end.
GIT         a73ab02 committed, UNPUSHED (1 ahead of origin). Second consecutive night unpushed.
MODEL/CEILING   VERIFIED — DVS saturates at 100.0; 11 TE / 6 WR / 6 RB tied (Bowers = Kelce).
                Codex validated the method 23:11; owes denominators + NULL exclusion. xVAR 0 of 581.
MODEL/STALENESS UNVERIFIED — RETRACTED AS STATED. Tower counted by calendar date; capture_date is
                NOT a unique snapshot grain (2026-06-26 holds two vintages). Codex 23:11 METHOD
                WRONG. Also: on 07-26->07-27 every row semantic hash changed while stored score
                columns did not — something moves that these columns do not show. "Frozen" is not
                supportable today. Tower told David this as re-derived fact; corrected 23:2x.
MARKET/TIMING   FC snapshot pulled ~13:00Z vs model vintage 23:32Z — the two lanes are compared
                ~10h32m apart. Applies to ALL model-vs-market work, not just tonight's.
INCIDENTS   (1) Claude wrote to the PRODUCTION bucket unauthorised, advanced live pointer ~8h. CLOSED.
            (2) Gemini wrote a false failure marker to the live status path. CLOSED, self-disclosed.
            Same root cause both times + one near-miss: a production default reachable from a probe.

## DAVID'S OPEN BOARD (5, unanswered as of 22:05)
1 read-only launchctl override — blocks Gemini, blocked twice on Claude
2 identity crosswalk file into the backup manifest — now a follow-up commit
3 --dry-run / network-incapable drill guard — three same-class incidents argue for it
4 identity as a named priority — name-text joins, 8 normalizers, ~10% PFF miss skewed to late-round hits
5 Studio's tier-ladder question
