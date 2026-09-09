---
name: reference_frontend_css_census_and_copy_rule
description: "How the frontend's two CSS censuses and the copy rule actually count — the four footguns that make a new .css or imported design fail in ways the error message does not explain."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 245fd3a2-d8ac-4908-9aad-b156da509998
  modified: 2026-09-08T12:15:59.654Z
---

**Measured 2026-09-08 by reading the rules, building DG-196.** Any new `.css` under `frontend/src` fails
`src/styles/rawCssAudit.test.js` and `visualCraftAudit.test.js` until its row is added to the committed
baseline JSON — they assert `baseline == currentReport()` over **every** css file found by directory walk. If
you do not own the baseline, compute your row and hand it over; do not edit the baseline.

⭐ **A new CSS file can be an ALL-ZERO row.** `stripVarCalls` removes every `var(--dg-…)` before counting, so a
dimension written `height: var(--dg-space-5)` is invisible to the census. Declare the file's own pixel sizes as
local custom properties on the root class (`--dg-rank-scale-rail: 2px`) and use them everywhere.

⛔ **Four ways that still counts, all discovered the hard way:**
1. **`border-top: 1px solid X` counts as `raw_spacing_values`.** The regex is not anchored to a property start,
   so `border-top:` contains `top:` and `1px` matches. Write `border-top: var(--dg-…-hair) solid …`.
2. **A custom property whose NAME ends in a counted word counts.** `--dg-x-width: 3px` matches `width:\s*3px`.
   Never end a local token name in width/height/top/right/bottom/left/margin/padding/gap.
3. **A `@container` or `@media` prelude cannot take a `var()`**, so its `max-width: 20rem` is an unavoidable
   raw value. One per file is honest; say so rather than deleting the query.
4. **`max-width: 76ch` counts** (`ch` is in the unit list). Wrap it in a local token too.

⭐ **`visualCraftAudit` counts the SELECTOR TEXT**, so a class merely containing "row", "table", "list" or
"card" scores `row_treatment_selectors` / `card_treatment_selectors` even when nothing tabular is happening —
`dg-rank-scale__row` scored 3. Not a defect; explain it or rename.

⛔ **The copy rule bans four or more consecutive capitals reaching the DOM** (`renderRule.ts`,
`SHOUTED_TOKEN_PATTERN`, allow-list is only `COVID`), plus any `word_word` token and the term `xVAR`. Imported
designs are full of shouted eyebrows — "OURS", "MARKET", "ABOUT". **The shout is typography, not text:** put
`Ours` in the DOM and `text-transform: uppercase` in the CSS. `auditRenderedCopy(container)` in a test proves
it. Player and team names go in a `[data-user-text]` subtree, which is exempt.

**Why:** each of these costs a round trip with a confusing failure — a census diff naming a file you thought was
token-pure, or a copy audit failing on a word the design told you to write.
**How to apply:** before writing a new component's CSS, declare the local px tokens first; before copying design
prose, lowercase the eyebrows. Related: [[feedback_a_visibility_floor_can_erase_the_data]] — the same DG-188
lesson says a minimum VISIBLE size belongs in CSS, never in the number the geometry uses.
