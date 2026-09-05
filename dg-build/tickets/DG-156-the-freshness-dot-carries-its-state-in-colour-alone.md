# DG-156 — The morning freshness dot carries its state in colour alone

**Layer:** 6 · **State:** done · **Lane:** Davids-MacBook-Pro-48631 · **DG 3.0** · **frontend / accessibility · small**
**Source:** Greg (`davidleess-eb [a78c76]`), 2026-09-04 ~17:2x ET, as the smallest true instance of David's glyph
ruling; filed by Bob after verifying the surface at source. **David, 2026-09-04 09:24 ET, verbatim:** *"we need
glyphs and symbols, not full sentences. This is UI/UX."*

**Problem:** the Today masthead already carries a mark — `.dg-wc__freshness-dot`
(`frontend/src/what-changed/DailyWhatChanged.tsx:619-624`) — with three states driven by `data-status`
(`ok` / `attention` / `unknown`). **All three are distinguished by BACKGROUND COLOUR and nothing else**
(`DailyWhatChanged.css:216-234`: `ok` → `--dg-up`, `attention` → `--dg-caveat`, and `unknown` has no rule at all, so
it falls through to the base `--dg-chrome`). A reader who cannot separate those hues sees one identical circle in
every state. It is already a glyph; it is just a glyph that does not say anything.

**How we know (read 2026-09-04 ~17:2x ET):** the markup and CSS above; the three `data-status` values are set at
`:616` and `:622` from `capture.status === "loading" ? "unknown" : line.status`.

**Done looks like:** shape carries the state, colour never alone — a filled mark for a current reading, a half mark
for a reading with a named limit, a hollow mark for no reading. **A hollow mark is never rendered as the current
one:** `unknown` today has no CSS rule and inherits the neutral chrome, which is the same "silence reads as fine"
shape as every other defect found this week. Nothing else in the product gets marks in this pass.

**⚠ ONE CORRECTION TO THE BRIEF, raised rather than built around.** The instruction was that each mark gets a real
accessible name. **The dot is already `aria-hidden="true"` and that is deliberate**, not an oversight: the CSS
comment at `:225-227` states the design — *"The dot restates the sentence beside it and is never the only channel:
the words say which feeds are behind and why."* The sentence next to the dot already carries the state in text, so
naming the mark too would make a screen reader announce the same fact twice, which is a regression dressed as an
improvement. **Recommended: shape carries the state in the VISUAL channel, the sentence stays the single accessible
channel, and the dot stays `aria-hidden`.** That satisfies the actual rule — do not encode information in colour
alone — without duplicating anything. **Greg's call; do not build until he rules on this point.**

**Anti-scope:** the dot never replaces the sentence; no other surface gets marks; no producer change; the receipt line
one press behind "Details" is explicitly OUT (three status enums whose `"ok"` means three different things share it,
and it is not a state David acts on — settled 2026-09-04 when DG-150 landed).

**Depends on:** nothing. DG-150 (`248cddc7`) is the sentence half and is done.

---

**Notes**

- The three-mark vocabulary proposed by Greg: `●` filled "Current", `◐` half "Limited", `○` hollow "No reading".
  Shape first, colour as reinforcement only.
- Worth checking during the build, not assumed: whether `attention` and `unknown` are visually distinguishable in
  BOTH themes once shape is doing the work, and whether the mark survives at the 390px width where the rail's box is
  `display:none` (the DG-114 case where a line that only exists on the box is a line David never sees on his phone).

**Acceptance — LANDED `cfffd0c1` 2026-09-04 ~17:4x ET by Bob (`~/dg-build/bin/dg-land.sh DG-156`).** Gate 654.
**NOT live** — it goes with the next pull, which is not scheduled; David has not asked for another.

| state | mark | how it is drawn | means |
|-------|------|-----------------|-------|
| `ok` | ● filled | `background: var(--dg-up)` + matching border | Current — the check ran |
| `attention` | ◐ half | `linear-gradient(90deg, var(--dg-caveat) 0 50%, transparent 50% 100%)` | Limited — an answer with a named limit |
| `unknown` | ○ hollow | `transparent` + `var(--dg-border-strong)` border | No reading — it could not answer |

**THE DEFAULT IS INVERTED AND THAT IS THE FIX.** The base was `background: var(--dg-chrome)` — a FILLED neutral dot
— and `unknown` had no rule at all, so a check that could not answer rendered exactly like one that answered fine.
Hollow is now the base, so any state nobody styles fails toward *"we did not get an answer"*. Half-filled rather than
a second hue keeps the middle state distinguishable from both neighbours with no colour perception at all.

**Greg overruled his own rule 2 on the point raised above:** the dot keeps `aria-hidden="true"` and the sentence
beside it stays the single accessible channel. Naming a decorative mark that restates the adjacent sentence would
make a screen reader announce the same fact twice. The rule that survives is the one always intended — never encode
information in colour alone — and shape satisfies it without duplication.

**Both build-time requirements are ASSERTIONS, not intentions:** a test proves the three states differ structurally
rather than only in hue, and another proves no media query hides the masthead or the freshness line, so the mark
survives the 390px width where the rail's box is `display:none` (DG-114). Tests red first: 3 of 5.
