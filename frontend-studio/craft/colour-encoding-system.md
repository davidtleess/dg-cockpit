# The Dynasty Genius colour and encoding system

**Authorised by David, 2026-07-29:** *"we need colors a color scheme that represents things"* … *"you can
create the apps color scheme and encoding if you have a strong set of research and ideas and thinking
behind it."*

**Status: proposal with a measured basis. Nothing shipped, nothing relayed.** Demonstration:
`craft/lab-002-colour-encoding.html`. Every colour claim below was produced by running the dataviz
validator, never by eye — the numbers are reproducible with the commands in §7.

---

## 1. The finding that shapes everything else

**The product's four shipped position hues fail, and they fail for everyone — not only for
colourblind readers.**

| pair | ΔE | verdict |
|---|---|---|
| TE `#00a0af` ↔ WR `#b9579c` | **4.0** (deutan) | far below the 6 floor — a deuteranope cannot separate WR from TE |
| TE `#00a0af` ↔ RB `#009f7a` | **8.0** (normal vision) | below 15 — **full-colour readers can't reliably separate them either** |

They have been shipping unused, so nothing has been drawn wrong yet. The moment position hue is used —
which this system proposes — they would be.

## 2. What actually needs representing

Enumerated from the domain, ranked by how often the manager asks it:

| # | dimension | kind | how often |
|---|---|---|---|
| 1 | **our model vs the market** | a fixed **pair** | every surface — it is the product's whole thesis |
| 2 | **position** (QB/RB/WR/TE) | categorical, 4 values, stable forever | every player reference |
| 3 | **rank movement** up/down | directional | every ranked list |
| 4 | **asset class** — player vs pick | categorical, 2 values | constantly (63% of this league's trades are players-for-picks) |
| 5 | **pick horizon** — 2026/27/28 | **ordered**, with a real recency premium | every pick reference |
| 6 | **data state** — present / thin / absent | categorical, 3 | wherever the record is incomplete |
| 7 | **manager posture** — contend/rebuild | categorical, 4 | league surfaces |
| 8 | **ownership** — mine / theirs / free | categorical, 3 | league surfaces |

Eight dimensions. **Healey's ceiling for rapid, accurate discrimination is about five hues**
(`craft/T4-1-preattentive-visual-search.md` §7.3). So the question is not "what colour is each of these"
— it is **which ones earn hue at all**.

## 3. The scarcity rule, and it is FORCED rather than preferred

I searched for a four-hue position set that would clear the ΔE ≥ 8 target **while sitting alongside the
two constitutional lane hues as one categorical set**. Sixty-four candidate sets across the legal hue
arcs, with lightness varied as a second discrimination channel:

> **No set clears it. None.** Six simultaneous categorical hues do not fit on this product's wheel once
> model-blue and market-amber are fixed.

That converts a stylistic instinct into a constraint:

> **One categorical dimension carries hue per surface.** If a surface compares positions, positions get
> hue and everything else goes neutral. If it compares our view to the market's, the lanes get hue and
> positions go neutral. Never both at full strength.

## 4. The layers

**Layer 0 — the ground. Encodes nothing.**
Tinted neutral ramp, five lightness steps (`craft/premium-surface-technique.md`): `.17 .21 .245 .28 .32`
at chroma ~.015, hue 258. Carries depth, never meaning.

**Layer 1 — CONSTITUTIONAL: the two lanes. Never reassigned, in any theme, on any surface.**
`--dg-model` blue (hue 255) = our model's view. `--dg-market` amber (hue 75) = the market's view.
Always exactly two, always the same two. This is the product's argument made visible, and it is the one
assignment that must be memorised once and never re-learned.

**Layer 2 — IDENTITY: position. Re-stepped, measured, always co-labelled.**

| position | OKLCH | hex | why |
|---|---|---|---|
| QB | `oklch(0.60 0.15 300)` | `#8f68cb` | violet — **keeps the product's shipped QB hue**; in superflex the premium position keeps the most distinct identity |
| RB | `oklch(0.64 0.15 130)` | `#6d9d2d` | green, lightest of the four — short-career position |
| WR | `oklch(0.52 0.15 5)` | `#ab3a5d` | crimson, darkest — the deepest position group |
| TE | `oklch(0.58 0.13 200)` | `#009098` | teal — pulled off the old cyan that collided with both RB and blue |

Measured, both themes, all pairs: **deutan ΔE 8.4** (clears the ≥8 target), **tritan ΔE 7.1–8.9
depending on the pair — inside the 6–8 floor band, which is legal here ONLY because every position mark
carries its two-letter label**, **normal-vision ΔE 15.8** (clears 15), chroma in gamut, contrast ≥ 3:1.
Against the shipped set that is **4.0 → 8.4** deutan and **8.0 → 15.8** normal.
**Stated rather than rounded up:** tritan is not above target, and the label is what makes it legal.

Lightness deliberately varies per hue (.52–.64) because deuteranopes discriminate by lightness; hue
alone would not have cleared the target at any rotation I tested.

**Layer 3 — ORDERED: pick horizon. A lightness ramp, not a hue.**
2026 → 2029 is *ordered* and carries a real recency premium (measured: a 2027 first sits +17% above the
ordinary one-year step). An ordered quantity must never get four categorical hues. It gets **one
channel — lightness on the neutral ground** — so nearer years read stronger. This spends no hue at all,
which is why the system can afford it.

**Layer 4 — DIRECTIONAL: rank movement.** Green ▲ / red ▼, per David's ruling of 2026-07-15, **arrows
only** — never on value, gap, margin or tier.

**Layer 5 — WHAT GETS NO HUE, BY RULE.** This layer is the most important part of the system, because it
is what stops colour from sliding back into decoration:

- **verdicts** — buy/sell/hold, good/bad, matchup quality. Banned. (Sleeper *does* colour matchup
  quality; we deliberately do not, because this product renders decision support, not verdicts.)
- **manager posture** — contend/rebuild is verdict-adjacent. Type and label only.
- **asset class** — player vs pick gets **form**: a rounded chip for a player, a squared chip carrying
  the year for a pick. Free, and unambiguous.
- **data state** — absent renders as **hatch**, thin as a **hollow/hatched mark carrying its n**. Never
  a hue, because "we don't know" is not a category alongside real ones.
- **ownership** — weight plus a labelled reference line, the device already validated on 013.

## 5. The one real collision, named rather than hidden

**RB green and WR crimson sit in the same hue families as the movement arrows.** That is a genuine
cost of this system and I am not going to pretend otherwise. Three things make it survivable, in order
of strength:

1. **The category already does exactly this and it works.** Sleeper colour-codes positions *and* uses
   green/red trending arrows in the same lists. The convention is proven in the app David's league
   actually runs on. (Sleeper's League Legend documents green/red = added/dropped by many teams.)
2. **The forms never coincide.** A position hue is a **filled badge containing its two letters**. A
   movement hue is a **bare triangle glyph beside a rank number**. Different shape, different place in
   the row, and the position badge always carries text.
3. **Movement wins any tie.** Where the two would genuinely be confusable, movement keeps green/red —
   it is David's explicit ruling and the fantasy-standard idiom — and the position badge de-saturates
   to neutral, per the scarcity rule.

The alternative was to move positions out of the green and red families entirely. I tested it: with
blue, amber, green and red all reserved, the remaining arcs cannot hold four separable hues. **The
collision is the price of having four position hues at all**, and the category's own precedent says it
is payable.

## 6. What this does not settle

- **Whether David wants this much colour.** The system is deliberately restrained: two lanes plus four
  positions, everything else earning its distinction from form, weight, texture or lightness. It could
  legitimately be argued the other way.
- **Whether the engineers will accept re-stepped position tokens.** They ship four hues today. This
  changes their values, and the argument for it is the measurement in §1, not taste.
- **Light theme surfaces.** Validated against white; the product's real light surfaces are near-white
  but not white, so the contrast row should be re-run against the actual token before anything ships.

## 7. Reproduce it

```
# the product's shipped set — FAILS
node scripts/validate_palette.js "#8e6ac7,#009f7a,#b9579c,#00a0af" \
  --mode dark --surface "#12171b" --pairs all

# the proposed set — PASSES in both themes
node scripts/validate_palette.js "#8f68cb,#6d9d2d,#ab3a5d,#009098" \
  --mode dark  --surface "#12171b" --pairs all
node scripts/validate_palette.js "#8f68cb,#6d9d2d,#ab3a5d,#009098" \
  --mode light --surface "#ffffff" --pairs all
```

Run from the dataviz skill's base directory. Searches that produced the set:
`scratchpad/hue-search.mjs`, `hue2.mjs`, `hue3.mjs`, `te.mjs` (session-local; the commands above are
the durable record).

## 8. Sources

- **Healey 1996** on the categorical hue ceiling — via `craft/T4-1-preattentive-visual-search.md` §7.3.
- **Okabe & Ito** on direct labelling over keys — via `craft/colour-accessibility.md` §D.
- **Sleeper League Legend** (support.sleeper.com) — the category's documented assignments: green/red
  trending arrows, orange unread news, gold champion; position colour-coding present but hexes
  unpublished. Confirms the category spends hue on position and reserves green/red for direction.
- **The dataviz skill's validator** — the arbiter for every number here.
- **David's rulings**: green/red scoped to rank-movement arrows (2026-07-15); model/market hue meaning
  constitutional and never reassigned; verdict hues banned; percentile bars use length plus lane hue,
  never good/bad colouring (2026-07-15).
