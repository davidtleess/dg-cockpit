# DG-043 — The player card's two-lane furniture fails contrast, markup, and mobile width

**Layer:** 6  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** found 2026-08-25 by DG-022's real-surface QA gates (whole-page axe + overflow), which
the 08-19 WIP wrote but never got to run. All three defects predate DG-022 and are proven
independent of it.

**Problem:** three measured defects in the pre-existing `ValuationTwoLane` furniture on the player
detail card (`frontend/src/player/ValuationTwoLane.tsx` + `PlayerDetail.css`, landed with
surface3 T8):
1. `.dg-two-lane__divergence > span` ("Divergence unavailable") fails WCAG 2 AA contrast —
   axe `color-contrast`, serious.
2. `dl.dg-two-lane__facts` puts bare `<span>`s inside a `<dl>` — axe `definition-list`, serious —
   and the same markup renders as run-on text on the REAL surface:
   "FantasyCalc1224Overall 185Position 712026-07-22T13:00:00…" (visible in the DG-022 QA
   screenshots). The markup defect and the visual defect are one defect.
3. At a 390px viewport the page overflows horizontally to 776px — the lanes
   (`.dg-two-lane__lane`, 760px wide) never collapse for mobile.

**How we know:**
```
dg-build/preserved/2026-08-25-dg022-qa/dg022-axe-main.json        # both axe violations, real surface
dg-build/preserved/2026-08-25-dg022-qa/dg022-mobile-overflow.json # body 776 vs viewport 390
dg-build/preserved/2026-08-25-dg022-qa/probe-without-dg022.mjs    # hides every DG-022 element:
                                                                  # still 776 — pre-existing, proven
dg022-tank-desktop.png / dg022-tank-mobile.png                    # the run-on facts line, visible
```

**Done looks like:** whole-`main` axe on the Tank Dell card returns `[]`, the facts render as
labeled pairs, and `body.scrollWidth <= viewport` at 390px — at which point DG-022's spec can
drop its scoped-gate carve-outs and assert the whole page again.

**Depends on:** nothing. Pure frontend surface work; no API or data change.

---

**Notes**
Tier under the freeze policy: cosmetic/a11y surface work with no capture-job impact — Tier 3
territory, which is refused for the rest of the sprint. Unless David says otherwise this is
POST-FREEZE work; it is filed now so the measurement does not evaporate.

---

**ID note:** filed 2026-08-25 ~19:15 as "DG-042" moments after a parallel session landed ITS
DG-042 (`DG-042-ppg-season-type-guard.md`, merge `c2b11f0a`) — renumbered to DG-043 before this
file was ever committed. The product ledger section for DG-022 on 2026-08-25 says "Filed as
DG-042" — that reference predates the collision discovery and means THIS ticket.
