# DG-113 — The morning read: a verdict-first front page

**Layer:** 6 · **State:** done · **Lane:** Davids-MacBook-Pro-71019 · **DG 3.0** · **frontend-only · DG-091 phase 2B wave 2**
**Source:** `DG091-STUDIO-SPEC.md` §2 + David's 2026-08-30 panel. Wave 2 — build AFTER DG-115 lands
(it needs the new type scale and the green/red delta tokens).

**The test:** one glance answers *am I ok · what moved · what should I look at.*

**Build (spec §2 is the authority; example copy there is a starting point, not a cage):**
1. **Header band** — date as the title, and ONE freshness sentence with a status dot replacing the
   "Attention — details inside" pill, the monospace tape pane, FEED DIAGNOSTICS and RECEIPTS.
   Its "details" opens the health sheet.
2. **The verdict hero** — one or two plain sentences assembled ONLY from fields already on screen
   (roster delta count, largest mover, cut requirement, staleness). Three states written out in
   spec §2.2: clean morning, action-needed, stale morning.
3. **"Worth a look"** — up to two recommendation cards. **David's ruling green-lights this.** Each:
   a bold one-line verdict, two sentences of reason built strictly from on-screen fields, a button
   into the relevant surface. If nothing clears the bar: one line, "Nothing worth acting on today."
   If inputs are missing, say which and that it will return.
4. **What moved** — top 3 movers as cards, the rest as the restyled table; **green-up/red-down
   deltas** (DG-115 ships the tokens); drop the empty 30-DAY column until data exists.
5. **Around the league** — **EXCLUDE players already shown in your-roster** (today Jaxson Dart is
   #1 in both lists with identical numbers — that reads as an unfiltered query).
6. **KILL THE DEBUG DUMP.** "Current roster context" currently reads "Starting lineup value: 97.39"
   directly above "Weekly lineup strength: 97.39" — the SAME NUMBER under two names — plus "Card
   count: 5", "David roster player count: 27". Replace with one "Where you stand" block in prose,
   or cut it and let the Roster surface own it. Prose-ified debug output is still debug output.

**Honesty law:** facts stay, furniture goes. The verdict may never assert something the payload
does not support; if an input is missing the sentence says so instead of estimating.
**Done:** the three morning states render correctly from real payloads; no duplicate player across
sections; no same-number-two-names; verified in a real browser at 1440 and 390.
