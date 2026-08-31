# DG-114 — The navigation shell: five destinations, a player drawer, and a real phone

**Layer:** 6 · **State:** done · **Lane:** Davids-MacBook-Pro-71164 · **DG 3.0** · **frontend-only · DG-091 phase 2B wave 2**
**Source:** `DG091-STUDIO-SPEC.md` §4 + David's 2026-08-30 panel (verbatim: *"Remove from nav
entirely"* and *"Build the phone shell now"*). Wave 2 — build AFTER DG-115 lands.

**Build:**
1. **Rail 11 → 5 destinations:** Today (the morning read, default) · Roster (absorbs Roster Audit +
   Roster Capacity; the cut list is a SORT of the same table, not a second surface) · Trades
   (Trade Lab + partner rankings) · League (League Pulse) · Track record (Model Trust + Accuracy
   Tracker). Keep the existing `?surface=` slugs working — this is grouping, not a router rewrite.
2. **Parked surfaces and Project Tracker LEAVE the nav** (David's ruling). URL-reachable only.
   Side effect worth noting: this retires the 21 composited-contrast AA failures, all of which are
   `.dg-shell__parked-badge` at 2.89:1.
3. **The player drawer** — a row press opens the card DIRECTLY (cut the two-step popover → "Open
   full evidence card"); 640px right drawer on desktop, full-screen sheet on phone; Esc / X / scrim
   / browser Back all close it.
4. **PHONE SHELL AT 390 (David: build it now):** a fixed bottom tab bar with the 5 destinations
   replacing today's wrapped link-cloud (~430px of chrome currently scrolls past before content);
   52px rows; essential columns only; a top bar with wordmark, search and the status dot.
5. Search stays where DG-110 put it; give the ⌘K palette its visible trigger if not already there.

**NOT in scope:** `?player=` URL addressability — it reverses a recorded deferral (I3-owned) and is
David's open decision. Flag it, don't reverse it.
**Done:** five rail items; no parked entries; a player opens in one press from every surface and
Back closes it; at 390 the bottom tabs work and no page scrolls sideways; real-browser proof.
