# DG195 — Directions imported; shared components verified; main layout pending

## Disposition
IN_PROGRESS / AWAITING_LAYOUT_CHOICE. This is a checkpoint, not completion of Dynasty Genius Directions.dc.html. The imported file presents three explicit alternatives (Rankings first, Roster first, Player first), with no selected winner. Root asked David which should become the main app and recommended Rankings first for us-versus-market scanning. No answer has arrived. Do not infer a choice from elapsed time or describe the existing board as the completed new design.

Local preview: http://127.0.0.1:8794/?surface=workspace&view=roster
Worktree /Users/davidleess/dg-wt/DG-195, branch ticket/DG-195, base6f0315d2 plus reviewed uncommittedDG192 headshot dependency. Nothing committed, merged, pushed, deployed or promoted. Existing previews preserved.

## Imported source
Actual authenticated Claude Design DesignSync import performed by actualClaude54281 from project d3ecd3d1-20db-44fe-b619-4c3b2a35ed9c. Exact six files in /private/tmp/dg-design-import-20260908-directions/source: main Directions HTML, requested image-slot.js, ios-frame.jsx, support.js, and transitive RankScale.dc.html/WhyBlock.dc.html. Source/hash manifests in parent directory. Desktop artboards and all three phones rendered and visually inspected; reference screenshots in DG195run/source-preview. No editor runtime, drag/drop sidecar, sample data or device bezel shipped. iOS frame is imported by x-import from=./ios-frame.jsx; the source-import helper's contrary dependency note is inaccurate, though it fetched the correct file.

## Working shared implementation
- DG197 compact48px desktop header, one controlled search with keyboard shortcut, watchlist shortcut and188px neutral rail. All six existing routes, ownership counts, source disclosures and snapshot controls preserved. Phone controls44px; responsive existing navigation retained.
- DG196 shared rank axis with real population, blue/amber intervals on BOTH sides, exact printed ranks, separate visible mark lanes on agreement/overlap, declared local zoom and honest missing/malformed/incompatible-population states.
- Root integrated scale into existing player detail, carrying DG192 photos forward. WhyBlock adapted into actual forecast evidence, valuation basis and market context inside the existing disclosure. Explicitly no player-specific causal explanation supplied by this snapshot; no invented age/rushing/market preference factors.
- APIs unchanged: market-ranks and comparison responses deep-equal8793.388 paired players,27 roster players (26 paired),433 available; all954 existing headshots retained read-only. Existing saved snapshot remains available.

## Independent verification and resolved findings
Full frontend gate passed924tests/113files, typecheck, lint, copy checks andbuild.18 real desktop/390/320px states passed axe/overflow and exercised search,watch,compare,history. Six real cases at260px verified endpoint/interval/tick/label geometry, including JoshAllen agreement, McCarthy markettie, CedricTillman both ties and MylesPrice atlast rank. Additional source-basis/missing-price/save-control checks pass. Header/rail measured at1440/976/975/390/320px: desktop48px header/188px rail, phone44px controls, no rail clipping.
Root reviewed source and screenshots. ActualClaude54281 independently verified API populations/intervals, re-derived AdonaiMitchell geometry, agreement visibility, RasheenAli missing state and accessible controls; final report NO BLOCKERS for shared components only. Review in /private/tmp/dg195-shared-independent-review.md and run/shared-proof.

Root corrections after builder handoff: removed narrow-label stacking that clipped the label because a container query cannot change its own container's variable; switched crowded zoom ticks to endpoints plus midpoint; included desktop rail padding within viewport height using border-box. Failed browser evidence retained next to passing v2 evidence. DG197 first handoff incorrectly certified an empty CSS raw-import assertion; that assertion was removed. Its phrase "root measured61px" is inaccurate: root initially found the mismatch by source inspection, then measured the final dimensions in Playwright.

Vite cache isolation hazard found and fixed forDG195: whole node_modules symlink allowed temporary config files under shared .vite-temp. DG195 now has a private directory of dependency links and private .vite/.vite-temp. No packages installed or shared caches removed. Durable note in docs/agent-ledger/2026-09-08.md. Do not claim no temporary cache write occurred before this correction.

## Resume
Ask/receive David's preferred main layout, then implement that composition against these shared components and real data. A: dense board/selection/comparison flow; B: positional roster composition and alternatives; C: list plus permanent inspector. Confirm shape from imported source before assignment; do not copy illustrative values, prior snapshots, positional rank chips, unsupported roster depth claims or causal factors. Existing comparison constrains available-player versus roster-spot; inspect the source interaction before broadening it. Preserve real headshots and history.
Actual session identities last verified:54410/245fd3a2 (DG196 builder),54331/fa00374f (DG197 builder),54281/376f54b0 (import/review). Reverify current identity/activity/worktree before dispatch. No builders need invented work while the layout choice is pending.

Evidence run: /Users/davidleess/dg-wt/DG-195/runs/20260908T115429Z.23 source hashes in shared-proof/final-code-sha256.json. Native run remains BLOCKED for layout choice; shared-check receipts do not constitute completion of the main design.
