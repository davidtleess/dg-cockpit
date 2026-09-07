---
name: project_dg178_available_players_2026-09-07
description: "DG-178 Available Players tab built, QA'd and root-reviewed 2026-09-07 (HEAD 8960e0ec, final catalog 013635Z: 433 = 360 with a forecast (349 original + 4 recovered = 353 frozen, + 7 starting estimates), 73 without); cold-start sidecar 012231Z consumed NEW-ONLY"
metadata: 
  node_type: memory
  type: project
  originSessionId: 23554c0d-3c96-4901-ab8c-1987997dd183
  modified: 2026-09-07T01:39:01.468Z
---

DG-178 lane (davidleess-cb, worktree `~/dg-wt/DG-178`, branch `ticket/DG-178`), 2026-09-07 ~01:40 UTC: the
Available Players tab (David: "ok go" 2026-09-06) is built, browser-QA'd and committed; 214512Z stays pinned on
the isolated 8787 preview (`?surface=research-preview&tab=available`). Final catalog
`runs/20260907T013635Z/dg178_available_catalog/` (head 74dc624d, clean): 784 rows = 274 owned identity rows + 510
available; default 433 = 360 with a forecast (349 original accepted + 4 recovered RBs = 353 frozen, plus 7 starting estimates from the
root-accepted DG-165 cold-start sidecar run 012231Z, manifest 2d459486…, estimates 93bc11aa…) + 73 without.
catalog.csv `0255e690…` unchanged across every sidecar run. Root final acceptance GREEN 01:42 UTC (human preview gate closing; no production, no merge). Final QA `runs/20260907T014036Z/dg178_available_qa/` (phone Why-tap containment verified by screenshot).

**Why:** root's independent reviews found fail-open cases (arm, years, duplicates, identity substitution, blank
rows, non-finite sums, git_dirty, route trusting the run name, census metadata) and frontend truth gaps
(coverage vs sort value, ties per basis, empty-status, watched-only status bypass, tiny values, lifted watch
state, owned-status wording); each got a RED→GREEN test. A starting estimate is labelled, its Why names the
per-year class and the producer's paired evidence; no impact number is fabricated; no waiver-return claim.

**How to apply:** never trust a run name or one CSV hash as a binding; validate arm/model and year semantics;
keep "no forecast" distinct from "no value for this sort"; a component that can unmount must keep fallback
state with a stable owner; a consumer of a peer's sidecar is NEW-ONLY with the same census/target/hash checks.
See [[project_dg178_ranking_contract_2026-09-06]] and [[feedback_the_failure_path_returns_the_success_signal]].
