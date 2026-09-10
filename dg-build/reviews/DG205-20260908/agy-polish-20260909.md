# Lovable App Polish & Elevation Review

**Author:** David's Actual AGY Gemini Session (Product Brainstormer)  
**Coordination:** Scoped for Codex Root & Actual Claude Builders  
**Date:** September 9, 2026  
**Destination:** `/private/tmp/dg-agy-lovable-polish-20260909.md`  
**Current Worktree Inspected:** `DG-205` (`/Users/davidleess/dg-wt/DG-205` on main `4ad796c2`)  
**Context Note:** `DG-204` represents earlier hosted-delivery work; `DG-205` is the verified integration worktree. Differences between DG-204 and DG-205 have been verified and noted below.

---

## Executive Summary & Code Baseline Audit (DG-204 vs. DG-205)

A byte-by-byte diff between `DG-204` and `DG-205` confirms:
1. **Core UI Components are Byte-Identical:** `Board.tsx`, `Cells.tsx`, `AppShell.tsx`, and `routes/index.tsx` have zero drift. The recommendations for table density, focal numbers, label noise, and mobile layout apply directly and cleanly to DG-205.
2. **Track-Record Plumbing is Already Built in DG-205:** Unlike DG-204, DG-205 has already implemented the loopback bridge `lovable/src/lib/dg/track-record-bridge.server.ts`, the private routes `lovable/src/routes/api/private/track-record/index.ts` and `/capture.ts`, and the backend endpoint `app/api/routes/workspace_track_record.py`. However, `lovable/src/routes/track-record.tsx` remains the empty `Unsupported` placeholder. The Claude builders have the backend ready; they only need the frontend view component.
3. **Dependencies Already Installed:** `cmdk` (`^1.1.1`), `@tanstack/react-query`, and Radix UI primitives are already present in `lovable/package.json`. No new npm packages are required for any of these recommendations.

---

## The Full Recommendations (Verbatim & Expanded with Builder Scoping)

Each recommendation is tagged with its implementation nature:
- **[Visual Polish / Frontend-Only]**: Uses existing loaded data in `DgBundle` / `boardRows`; zero backend or schema changes.
- **[Frontend Wiring / Existing DG-205 Endpoint]**: Connects an existing or newly landed DG-205 route to UI.
- **[New Data / Product Logic]**: Requires future backend contracts or external data sources.

---

### 1. The First Viewport: Deliver the "Macro Answer" First

#### The Problem
When David opens `/` (Roster) or `/board`, the top 150px of vertical viewport space is dominated by database audit metadata:
```text
"27 players. 27 carry both our rank and a market rank, among the 388 players who carry both numbers."
"Saved reading · our values 2026-09-06 · market prices 2026-09-07 · ownership 2026-09-07"
"Select a player to see the difference and compare an unowned alternative at his position."
```
On mobile, `<HealthLine />` is duplicated right at the top of the content area, displaying snapshot reload buttons and `<details>` collapsible notes. This directly violates `PRODUCT.md` (*"an honest developer diagnostics console wearing a fantasy skin is the failure mode"*). The scan starts with mental math and plumbing rather than fantasy football reality.

#### Recommendations
1. **Lead with the Macro Narrative Card [Visual Polish / Frontend-Only]:**
   * Replace the three lines of audit text on `/` with a clean, high-conviction roster summary card in plain manager prose:
     > **"Your Roster: 27 players · 6 Top-50 Dynasty Assets · +4.2% Net Model Value over Market Consensus"**  
     > *"Biggest market divergence: C.J. Stroud (+14 spots ahead of FantasyCalc price)."*
   * *Builder Implementation Note:* This is 100% frontend logic. Derive this dynamically from the already loaded `boardQuery("mine")` array by scanning top ranks and `gap_max` / `gap_min`.
2. **Tuck Provenance into a Quiet Status Pill [Visual Polish / Frontend-Only]:**
   * Move the snapshot dates, common player count, and reload controls into a compact, elegant header pill in the top-right toolbar:
     `[ 🔒 Kickoff Freeze · Sep 8 · 388 Paired ]`
   * Clicking the pill opens the existing `ReceiptSheet` / provenance drawer. It never dominates the primary content viewport.

---

### 2. The Data Table: Establishing the Canonical Row & Killing Label Noise

#### The Problem
In `lovable/src/components/dg/Cells.tsx`:
* `AdvantageCell` prints: `row.projected_advantage.toFixed(1) + " pts over replacement"` in every row.
* `PriceCell` prints: `row.market_value.toLocaleString() + " FantasyCalc price"` in every row.
Repeating these string units 27 to 388 times down a vertical list creates severe visual vibration. Furthermore:
* All numbers share the exact same `13px` font size and weight. **No focal value owns the row.**
* `--row-height` is set to `52px` in `styles.css`. This is far too loose for a data terminal where managers scan 40–50 players at a time. `DESIGN.md` explicitly specifies compact data density (~32px to 38px).

#### Recommendations
1. **Strict Header-Only Labeling [Visual Polish / Frontend-Only]:**
   * Delete `"pts over replacement"` and `"FantasyCalc price"` from the row cells in `Cells.tsx`.
   * State the metric and unit once in the column headers in `Board.tsx`:
     * Header 4: `OUR 5-YR ADVANTAGE (PTS)`
     * Header 5: `FANTASYCALC PRICE`
     * Header 6: `2026 PROJ`
2. **Establish a Clear Focal Value [Visual Polish / Frontend-Only]:**
   * Give our model advantage or rank primary typographic authority: `15px font-mono font-semibold text-[var(--ours)]` (tabular-nums).
   * Secondary columns (market price, projected points) stay in muted tabular font (`13px text-[var(--ink-dim)] font-mono`).
3. **Right-Align All Numeric Columns [Visual Polish / Frontend-Only]:**
   * Decimal points and thousands separators must align vertically down the entire table.
4. **Tighten Row Density [Visual Polish / Frontend-Only]:**
   * Update `--row-height` in `lovable/src/styles.css` from `52px` to `38px` (desktop) and `44px` (mobile tap target).

---

### 3. Eliminate Dead-End Navigation Routes (`/track-record`, `/league`, `/trades`)

#### The Problem
Three out of the five primary navigation links (`/track-record`, `/league`, `/trades`) currently render identical, bleak gray error boxes:
```text
"This saved preview does not include... / Trade history is not included in this saved preview."
```
Landing on an "Unsupported" box on 60% of the main tabs breaks the illusion of a finished tool.

#### Recommendations
1. **Activate `/track-record` as the Pre-Season Freeze & Evaluation Ledger [Frontend Wiring / Existing DG-205 Endpoint]:**
   * *Status in DG-205:* The backend router (`app/api/routes/workspace_track_record.py`) and loopback bridge (`track-record-bridge.server.ts`) are **ALREADY IMPLEMENTED** in DG-205!
   * *Action:* Replace the `Unsupported` component in `lovable/src/routes/track-record.tsx` with a real view consuming `/api/private/track-record`.
   * *Contents:* Display the September 8 freeze receipt, the declared evaluation plan (`workspace-production-2026-v1`), the two frozen 2025 baselines (prior points & position median), and the 825-player audit table with honest pending states (`Status: Ungraded — Season in Progress`).
2. **Activate `/league` as an Asset Distribution View [Visual Polish / Frontend-Only]:**
   * *Status:* The bundle already contains ownership for all rostered players and `league_ownership` strings (e.g. `"David's Team"`, `"Team 2"`, etc.) in `bundle.payloads.available` and `market_ranks`.
   * *Action:* Instead of an empty error box, group the 388 ranked players by fantasy owner. Render a clean multi-card or accordion view showing each team's roster, total model advantage, and top players. Zero new backend queries required.
3. **Activate `/trades` as a Trade Lab / Dual-Player Comparison [Visual Polish / Frontend-Only]:**
   * *Status:* `comparisonPair()` and `alternativesFor()` in `lovable/src/lib/dg/backend.ts` already contain the comparison logic.
   * *Action:* While historical league transactions remain uningested, re-title the tab or view as **Trade Lab / Player Compare**. Provide two search dropdowns allowing David to select Player A and Player B and see their 5-year advantage, market prices, and scoring projections side-by-side.

---

### 4. Upgrade the Mobile Experience to First-Class

#### The Problem
On mobile (`PhoneRow` in `Board.tsx`), rows are stripped down to:
* Left: Name + Headshot + Team
* Right: Rank Pair + Gap
**All valuation numbers (5-Year Advantage, FantasyCalc Price, 2026 Points) are completely invisible on mobile.** Furthermore, the technical `<HealthLine />` component with its raw reload button is injected into the top of the mobile viewport.

#### Recommendations
1. **Evict `<HealthLine />` from the Mobile Header [Visual Polish / Frontend-Only]:**
   * Move data health and reload controls into a bottom-sheet settings trigger or footer drawer.
2. **Two-Line Mobile Data Card [Visual Polish / Frontend-Only]:**
   * Redesign `PhoneRow` in `Board.tsx` into a crisp, high-density two-line card:
     * **Line 1:** `Rank Chip · Player Name · Team · Bold Focal Advantage (+142.4 pts)` (right-aligned in blue).
     * **Line 2:** `FC Price ($6,420) · Gap (+14 spots) · 2026 Proj (284 pts)`.
   * This gives the mobile user the actual valuation data without forcing them to tap into the drawer for every single player.
3. **Swipeable Position Filter Pills [Visual Polish / Frontend-Only]:**
   * Add horizontal scrolling filter pills at the top of mobile screens: `[ All ] [ QB ] [ RB ] [ WR ] [ TE ] [ My Roster ] [ Free Agents ]`.

---

### 5. Elevate the Player Drawer into a "Scouting Report"

#### The Problem
Clicking a player opens a native `<dialog>` drawer (`PlayerDrawer.tsx`) containing basic metadata, an unstyled Recharts scatter plot, and raw producer notes inside an unstyled `<details>` tag.

#### Recommendations
1. **Visual Spread Bar (Model vs. Market) [Visual Polish / Frontend-Only]:**
   * In the player header, render a clean horizontal gauge/spread bar comparing our rank interval against the FantasyCalc market rank interval. Visually shows if we are higher, lower, or overlapping at a single glance.
2. **Refined 5-Year Projection Arc [Visual Polish / Frontend-Only]:**
   * In `PlayerDrawer.tsx`, the player's 5 season forecasts (`row.seasons`) are already loaded. Render them as a clean sequence of discrete season chips or a compact mini-sparkline (`'26: 280 pts`, `'27: 265 pts`, `'28: 240 pts`, etc.) to illustrate the player's aging trajectory.
3. **1-Tap "Compare Against Alternative" [Visual Polish / Frontend-Only]:**
   * Under the existing "Alternative Players" list, add an explicit 1-tap **"Compare"** button that immediately loads the selected alternative into the dual-player comparison view (`chooseCompare(altId)` is already implemented in `PlayerDrawer.tsx`).
4. **Keyboard Hotkeys & Smooth Transition [Visual Polish / Frontend-Only]:**
   * Enable `J` / `K` keyboard navigation to cycle to the next/previous player on the board without closing the drawer.

---

### 6. Search & Command Palette Experience

#### The Problem
Player search is currently a localized text input in the sidebar that drops a basic `<ul>` of text buttons.

#### Recommendations
1. **Global Command Palette (`Cmd + K`) [Visual Polish / Frontend-Only]:**
   * Leverage the pre-installed `cmdk` package (`"cmdk": "^1.1.1"` in `package.json`) to provide a global keyboard shortcut (`Cmd + K` / `Ctrl + K`) that opens an instant search modal from any route.
2. **Enriched Search Result Rows [Visual Polish / Frontend-Only]:**
   * Show the player's headshot, team badge, position, and roster ownership status (`[Your Roster]`, `[Free Agent]`, or `[Owner Name]`) directly in the search dropdown so David gets answers before navigating.

---

## Scoping Matrix for Actual Claude Builders

| ID | Polish Recommendation | Nature | Target Files | Difficulty | Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POL-01** | Header Roster Narrative (replace audit text) | **Visual Polish** | `lovable/src/routes/index.tsx` | Easy | **High** |
| **POL-02** | Remove repeated per-row string labels | **Visual Polish** | `lovable/src/components/dg/Cells.tsx` | Easy | **High** |
| **POL-03** | Focal number hierarchy & tabular alignment | **Visual Polish** | `Cells.tsx`, `Board.tsx` | Easy | **High** |
| **POL-04** | Table row density (52px -> 38px) | **Visual Polish** | `lovable/src/styles.css` | Easy | **High** |
| **POL-05** | Activate `/track-record` using DG-205 bridge | **Frontend Wiring** | `lovable/src/routes/track-record.tsx` | Medium | **High** |
| **POL-06** | Activate `/league` (team asset grouping) | **Visual Polish** | `lovable/src/routes/league.tsx` | Medium | **High** |
| **POL-07** | Activate `/trades` (Trade Lab comparison) | **Visual Polish** | `lovable/src/routes/trades.tsx` | Medium | **Medium** |
| **POL-08** | Mobile 2-line row card with focal value | **Visual Polish** | `lovable/src/components/dg/Board.tsx` | Medium | **High** |
| **POL-09** | Evict `<HealthLine />` from mobile viewport | **Visual Polish** | `lovable/src/components/dg/AppShell.tsx` | Easy | **Medium** |
| **POL-10** | Player Drawer spread bar & 5-yr arc | **Visual Polish** | `lovable/src/components/dg/PlayerDrawer.tsx` | Medium | **Medium** |
| **POL-11** | Global `Cmd+K` palette using `cmdk` | **Visual Polish** | `lovable/src/components/dg/AppShell.tsx` | Medium | **Medium** |

*Notice: 10 of the 11 recommendations are pure frontend visual polish requiring zero backend changes, and the 1 wiring task (`POL-05`) targets endpoints that are already built in DG-205.*
