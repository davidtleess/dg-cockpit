# Colour and accessibility — ramps, contrast models, and where they disagree

Pulled 2026-07-24 (Tower) against Tier 2 §6 of `CRAFT-LIBRARY.md`. All sources free: W3C
Understanding documents, the APCA documentation site (author-hosted), Okabe & Ito's Color Universal
Design page (author-hosted), ColorBrewer, MDN. **One paywall noted:** Bang Wong's *Nature Methods*
"Points of View: Color blindness" (2011), which popularised the Okabe–Ito set, is behind Springer's
paywall — §D cites **Okabe & Ito's own free page** instead, which is the primary source anyway.

Written for a **dark-mode, data-dense** surface with OKLCH tokens already in place. That combination
is exactly where the two contrast models diverge most.

## A. Build ramps by fixing lightness, not by nudging hex

*Evil Martians, "OKLCH in CSS: why we moved from RGB and HSL",
evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl.*

- **L** = perceived lightness 0–1; **C** = chroma (0 = grey; no fixed ceiling — the limit is
  gamut-dependent); **H** = hue angle (red ≈ 20°, yellow ≈ 90°, green ≈ 140°, blue ≈ 220°,
  purple ≈ 320°).
- HSL's failure is specific: its cylinder pretends every hue supports 0–100% saturation, so "adding
  10% lightness will have different results for blue and purple colors." OKLCH's L is perceptually
  uniform, so **the same L step is the same visual step at every hue**. The payoff, quoted: "All
  backgrounds with L≥87% have good contrast with black text" — a rule of that shape is only
  expressible in a perceptually uniform space.
- **Gamut:** sRGB covers ~35% of visible colour, P3 adds ~30% more. Not every OKLCH triple is
  displayable; browsers gamut-map to the nearest renderable colour. Check candidates on oklch.com.
- **Relative colour syntax** derives states from a base without a second hardcoded value:

```css
.button:hover { background: oklch(from var(--accent) calc(l + 0.1) c h); }
@media (color-gamut: p3) { :root { --accent: oklch(0.7 0.22 250); } }  /* raise C only */
```

**Do:** define ramp steps as a fixed L ladder shared by every hue, and let C vary per hue (because
the achievable maximum does). **Rules out:** a ramp built by "darkening" hex values, and any ramp
where the same step index means different lightness in different hues — the failure that makes a
green chart series read as louder than a blue one carrying the same magnitude.

## B. WCAG 2.2 is the conformance floor — know exactly what it asks

*W3C, Understanding SC 1.4.3 (Contrast Minimum) and SC 1.4.11 (Non-text Contrast),
w3.org/WAI/WCAG22/Understanding/.*

- **1.4.3:** text ≥ **4.5:1**; **large text ≥ 3:1**, where large = **18pt or 14pt bold**
  (≈ **24px / 18.5px**). Exceptions: inactive components, pure decoration, invisible text, text
  incidental to a picture, and logotypes. The 4.5 figure "compensated for the loss in contrast
  sensitivity usually experienced by users with vision loss equivalent to approximately 20/40".
- **1.4.11:** **3:1** against adjacent colours for (i) UI components' state/identity indicators and
  (ii) **"parts of graphics required to understand the content"** — which is chart lines, series
  marks, axis references, anything the reader must resolve. No exception exists for data points.
  **Values are not rounded: 2.999:1 fails.**
- **1.4.1 Use of Color:** colour must not be the *only* visual means of conveying information.

**Do:** run 1.4.11 against every mark you expect to be *read*, not just against text.
**Rules out:** a 1px hairline series in a low-chroma tint, a disabled state distinguished by hue
alone, and grid/axis lines chosen purely for how quiet they look.

## C. APCA — and the two places it contradicts WCAG 2

*Myndex, "Why APCA", git.apcacontrast.com/documentation/WhyAPCA.html, and the easy-intro page.*

APCA reports **Lc**, a perceptual lightness contrast, not a ratio. Guidance levels:

| Lc | Use |
|---|---|
| 90 | preferred body text (min 14px/400) |
| 75 | minimum body text (min 18px/400) |
| 60 | standard content text (24px normal / 16px bold) |
| 45 | headlines (36px normal / 24px bold), detailed pictograms |
| 30 | absolute minimum — placeholders, disabled text, large semantic icons |
| 15 | absolute minimum for any non-text element that must be discernible |

Add **Lc 15** for AAA-equivalent. **Polarity is signed:** positive Lc = dark text on light,
negative = light text on dark, and the two are not interchangeable.

**Where they disagree, concretely:**

1. **Dark mode.** APCA's documentation is blunt: WCAG 2 contrast "cannot be used for guidance
   designing dark mode", because its maths "far overstates contrast for dark colors" — a pair at
   4.5:1 near black can be functionally unreadable. This is the single most relevant divergence for
   this product.
2. **Size and weight.** WCAG 2 applies one blanket ratio with a single large-text carve-out. APCA
   states that "no single figure such as 4.5:1 or 3:1 can be used as a blanket target" and weights
   for spatial frequency — thin, small type needs more.

**The rule to work by, stated honestly:** **WCAG 2.2 is the W3C Recommendation and the conformance
standard; APCA is the candidate method for the not-yet-recommended WCAG 3.** So: **pass WCAG 2.2 as
the floor, then use APCA to choose among the options that pass — and to catch the dark-mode pairs
WCAG 2 wrongly blesses.** Where APCA says a dark-mode pair is too weak and WCAG says 4.5:1, believe
APCA and fix it; where APCA would let you go below the WCAG floor, don't.
**Rules out:** citing a WCAG pass as proof a dark-surface pairing is legible.

## D. Colour-vision deficiency, for charts specifically

*Okabe & Ito, "Color Universal Design", jfly.uni-koeln.de/color (author-hosted, free).*

Prevalence: red-green CVD affects roughly **8% of Caucasian, 5% of Asian and 4% of African males** —
more common than AB blood type. Their three principles: choose schemes identifiable by all colour
vision types; **combine colour with shape, position, line type and pattern**; and name colours
explicitly in text.

Concrete rules, and each maps to a defect class:

- **Never pair red with green** to carry a distinction. Use **magenta/purple vs green**.
- Use **vermilion (RGB 100%, 32%, 0%)** rather than pure dark red; **never red text on black**.
- **Encode a lightness difference as well as a hue difference** — lightness survives CVD simulation,
  hue does not.
- **Label directly on the graphic** rather than in a separate key. A legend forces the reader to
  match by hue, which is the exact channel that failed.
- **"Make colored objects thick or large; avoid thin lines and small marks relying solely on
  colour."** This is the published rule that the "marks too small to read" defects violated — it is
  not a taste question, it is CVD guidance.

The **Okabe–Ito 8-colour qualitative set**, the de facto standard for CVD-safe categorical figures:
`#E69F00` orange, `#56B4E9` sky blue, `#009E73` bluish green, `#F0E442` yellow, `#0072B2` blue,
`#D55E00` vermilion, `#CC79A7` reddish purple, `#000000` black. It spans a wide luminance range on
purpose, so lightness remains a separating channel after hue collapses. On a dark surface, swap black
for the surface's lightest neutral and re-check each pair.

## E. Pick the scheme type from the data, not the palette browser

*ColorBrewer, colorbrewer2.org/learnmore/schemes_full.html (Brewer & Harrower).*

- **Sequential** — ordered low→high. "Lightness steps dominate the look of these schemes."
  Lightness carries the magnitude; hue is decoration.
- **Diverging** — a meaningful midpoint (zero, mean, median). Light in the middle, dark contrasting
  hues at both extremes. Symmetric by construction, so **if the data is asymmetric, move the break
  or drop colours from one arm** — do not stretch the ramp.
- **Qualitative** — nominal categories. "Hues are used to create the primary visual differences
  between classes", explicitly *not* lightness. Paired and Accent variants exist for related
  categories and for emphasis.

**Monotone luminance is the test for any sequential ramp.** Viridis was built for perceptual
uniformity, monotonically increasing luminance, greyscale readability and CVD tolerance
(cran.r-project.org/web/packages/viridis/vignettes/intro-to-viridis.html). Rainbow/jet fails all
four: it has "kinks" where apparent colour changes fast over a small data range, inventing structure
that is not in the data — documented as measurably harming accuracy in clinical reading
(blogs.egu.eu/divisions/gd/2017/08/23/the-rainbow-colour-map/).

**Rules out:** rainbow for any quantity; a qualitative palette used for an ordered variable (it
implies an order the hues do not carry — an expressiveness failure, see `graphical-perception.md`
§C); and a sequential ramp whose lightness is non-monotone. **Check:** convert the ramp to greyscale.
If the order is not still readable, it is not a sequential ramp.

## F. Forced-colors mode — what your chart looks like when your palette is deleted

*MDN, `@media (forced-colors)` and `forced-color-adjust`.*

Under `forced-colors: active` (Windows High Contrast and equivalents) the UA **overrides at paint
time**: `color`, `background-color`, `border-color`, `outline-color`, `text-decoration-color`,
`column-rule-color`, and **SVG `fill` and `stroke`**. It forces `box-shadow: none`,
`text-shadow: none`, `background-image: none` (except url() images), `color-scheme: light dark`.

Your entire chart palette is therefore gone, and every series becomes one colour.

```css
@media (forced-colors: active) {
  .series      { stroke: CanvasText; }
  .series--alt { stroke: CanvasText; stroke-dasharray: 4 3; }  /* second channel survives */
  .card        { border: 1px solid CanvasText; }               /* box-shadow is gone */
  .surface     { background-color: Canvas; }
}
```

System colour keywords: `Canvas`, `CanvasText`, `ButtonFace`, `ButtonText`, `GrayText`, `Highlight`,
`HighlightText` — the UA picks them from **native element semantics, not ARIA roles**, so a `<div
role="button">` gets no help.

**Do:** ensure every series already carries a **non-colour** channel — dash pattern, marker shape,
direct label, position — so forced-colors degrades to monochrome-but-readable rather than
monochrome-but-identical. This is the same requirement as §D, arriving from a different direction.
**Rules out:** `forced-color-adjust: none` used to "keep the brand colours". MDN's warning is
explicit: it removes the contrast those users depend on. Reserve it for the rare case where a colour
*is* the content (e.g. a colour swatch), and pair it with a text label.

## G. The load-bearing takeaway

**Colour is never allowed to be the only channel, and the model you check contrast with depends on
the surface.** OKLCH gives ramps that are predictable (§A); WCAG 2.2 is the floor you must clear,
including 3:1 on chart marks (§B); APCA is what you use to judge a *dark* surface, because WCAG 2's
maths overstates contrast near black (§C); and CVD guidance and forced-colors mode both terminate in
the same instruction — carry the distinction in lightness, shape, pattern or a direct label as well
as in hue (§D, §F). The thin, small, hue-only mark fails all four tests at once.
