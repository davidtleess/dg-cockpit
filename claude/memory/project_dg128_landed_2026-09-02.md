---
name: project-dg128-landed-2026-09-02
description: "DG-128 RANGE-ONLY cut landed on main 1dff211f 2026-09-02 07:43 and is LIVE in the API (pull+build+restart 07:44) — nobody new is ranked; the fill is held on `ticket/DG-128-fill-held` (fde9a5ca), PUSHED to origin 09-02 ~11:45; bands arrive with the next PVO refresh from trunk."
metadata:
  type: project
---

**Landed 2026-09-02 07:43:** `f8995d3d..1dff211f HEAD -> main`, 11 commits (head `d72f27dc`,
also on `origin/ticket/DG-128`), David typed `dg-land.sh DG-128` himself after reading the
three-times-audited closeout — that act was his yes on the 29.7 amendment (v3 TE head carries
its own σ, not the ridge's 23.6). Per-commit verification: all 11 green, Python 6696→6754,
frontend 623→629.

**What shipped:** `dvs_band_low/high` on every PVO (σ_B holdout RMSE/P90×100: QB 22.4 RB 22.8
WR 20.0 TE 23.6; σ_A v2 ridge; σ_A_v3[TE] 29.7 from bakeoff oof_rmse 2.7051 — that artifact
SURVIVES, see [[reference_te_v3_metadata_unrecoverable]]); pins to served runs asserted in
`build_universe_pvo_batch.py` and `refresh_prospect_cards.py` — a moved manifest aborts the
refresh (`status: aborted`, exit 1, prior runtime kept). "Likely range" on roster row + player
card ("—" for null); no greying (David's own AskUserQuestion pick 02:08Z in the 0b session).

**What did NOT ship:** the coverage fill. 115 gated players (3 on David's roster) stay blank.
The fill lives on `ticket/DG-128-fill-held` (fde9a5ca) — PUSHED by David 2026-09-02 ~11:45
(`origin/ticket/DG-128-fill-held` = fde9a5ca, ls-remote verified), so it is backed up; a
DG-128 worktree may be recreated over it when the fill is re-opened. The 09:00 refresh that
morning was green (status ok / capture ok / 468 bands); 11:30 green too. His ruling: "range-only this week"; re-open only
on his word ("I want to see the size of it before it ships").

**Live state 07:44:** trunk `1dff211f` pulled, `frontend/dist` rebuilt (bundle
`index-BZ1jEJNN.js`), API restarted pid 4070 (the old process had run since 08-31 08:18 — so
DG-133 went live in the same restart). Bands appear only after `run_pvo_refresh` runs from
trunk: 09:00 chain (first live run of DG-133's fix; four windows failed before it) or the
11:30/14:00 slots. Proof: `grep -c '"dvs_band_low": [0-9]'
app/data/valuation_runtime/universe_pvo_runtime.json` → 468 (388 vets + 80 rookies); 157+34
touch 0/100 — expected, σ is 20–24 a side. Read the report's `status` AND
`capture_report.status` (DG-136), never the chain's exit alone.

**Open follow-ups:** trunk-bundle build gap needs a ticket
([[reference_trunk_frontend_bundle_is_a_manual_build]]); Greg's DG-137 (served team) lands
after the 10:18 restart, backend-only. dg-build commits a36ff93/57b1aa8/bdb01b1 local — push
only on David's word.
