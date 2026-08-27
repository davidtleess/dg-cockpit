# DG-048 — Layer 1 Daily Control exists, works, and nothing schedules it (stale since Aug 8)

**Layer:** 1  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG048-20260826  ·  **DG 3.0**
**Source:** 2026-08-26 six-layer completion audit (L1 auditor); facts re-verified same day.

**Problem:** `scripts/run_layer1_daily_control.py` — the manifest/preflight/execute control plane
for the capture layer — has no launchd plist and is invoked by nothing. Its report
(`app/data/ops/layer1_daily_control_latest.json`) was last written **2026-08-08**, 18 days ago.
A control surface that silently stopped being consulted is worse than none: anything still
reading that marker sees a healthy Aug-8 world.

**How we know:** `grep -l daily_control ops/launchd/*.plist` → no matches; marker mtime Aug 8
14:33; verified 2026-08-26.

**Done looks like:** a decision first, then the mechanics. DECIDE (David): is Daily Control still
the intended control plane, or has SR-11's alert + capture-health surface superseded it? If
superseded: retire it loudly (archive the script's role in the ledger, delete/mark the stale
marker so nothing can read Aug-8 health as current). If still wanted: schedule it (post-SR-09 it
should be a chain step or read the chain report, not a 13th wall-clock plist) and give its marker
freshness the same SR-11 treatment as every other producer. Either answer beats today's limbo.

**Tier:** decision + small ops change. Post-freeze unless David rules it into remaining slack.
**Edge distance: FOUNDATION.**

---

**✅ RULED AND RETIRED 2026-08-26 (David: "retire daily control"), landed on `main` via dg-land.**
The runner refuses in EVERY mode with a banner naming its successors (DG-044 alert,
capture-health surface, DG-049 attestation); the gate sits before argparse so no invocation can
write a marker that resurrects the illusion of a consulted control plane. The daily_control
MODULE is untouched library code (pff_intake, qb_validation import it); its 120 contract tests
green; one CLI-level pin flipped to the retirement contract. The last real report (2026-08-08)
is preserved: `dg-build/preserved/2026-08-26-daily-control-last-real-report.json`.

**⚠ INCIDENT, on the record (custodial honesty):** the first RED test for the refusal invoked the
runner BARE — which executes a live control-plane run. It ran ~90s before being killed, and it
reached PRODUCTION through the worktree's app/data symlinks: (1) re-ran the nflverse capture
against the production DB — integrity verified ok afterwards (PRAGMA quick_check), capture
idempotent, no data loss; (2) overwrote the production nflverse STATUS marker with
`status: running / finished_at: null` — still standing, self-heals at tomorrow's 06:15 run
(a hand-written repair was drafted and blocked by the permission classifier — David's call);
(3) overwrote the production EXPORT ready-marker with paths into the (since-removed) DG-048
worktree — REPAIRED same hour by restoring the 06:15 run's own manifest.json to the ready path
(a pure restore of the producer's record, verified; caught because dg-land's full gate failed on
the poisoned marker — the gate did exactly its job). The killed run's export dir
(runs/nflverse-usage-20260826T1923...) is left in place in the immutable runs area.
**Lessons, written down:** (a) never RED-probe a tool whose default action is a live run — probe
read-only modes and document the deviation (now in the test file's docstring); (b) the worktree
share map's "share what is read" is violated by any writer reaching shared dirs — the retired
runner was one such writer (vector now closed); the structural note joins the share-map
housekeeping item from DG-049.

**Incident closure 2026-08-26 ~16:15 ET — David: "fix the marker."** The production nflverse
status marker now carries a truthful failed-run record (killed run's id, integrity verification,
pointer to the prior good run and this ticket) in place of the permanent `running` lie. Verified
end-to-end: the DG-049 attestation channel reads it as `attested status failed` — the correct
alarm for exactly this state. Self-heals to ok at tomorrow's 06:15 capture. Incident CLOSED; the
two lessons stand in the record above.
