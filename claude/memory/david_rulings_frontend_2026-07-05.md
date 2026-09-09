---
name: david_rulings_frontend_2026-07-05
description: "David's frontend design rulings, JUNE and JULY 2026 — the prose ruling, the tier ladder (elite not stud), the margin thesis, the ranked-board hero, the Dynasty Nerds bar, Studio's charter, Tailwind barred, colour never encodes direction."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 245fd3a2-d8ac-4908-9aad-b156da509998
  modified: 2026-09-08T12:32:50.405Z
---

**Recovered 2026-09-08 from the Codex rollouts. It was in NO memory file, and the record wrongly dated the
prose ruling to 2026-08-29.** The August ruling is a RESTATEMENT — David himself wrote *"as i said before"*.

**⭐ 2026-07-05 16:38:16Z — the prose ruling, first statement:**
> "while the integrity of the models and data is paramount - the front-end should not be full of 'backend'
> language - everything should be prose. football language - fantasy language - dynasty manager language"

**⭐ 2026-07-06 03:33:01Z — the no-verdict rule relaxed on the FRONT END, with his own examples:**
> "the hard rule about not stating to DO something can chill out a little on the front end..if someone has a
> way higher PVO than others you can call him a stud or something favorable - if there are cohorts or tiers
> that are elite - you can call them that. the front end should help me identify patterns, or cohorts, trends,
> opportonities, weaknesses, threats, etc."

⛔ This **predates and contradicts** the commissioned UI research in
`docs/strategies/UI Research/Dynasty Genius UI Direction Spec.md`, which mandates a Bloomberg-terminal density
and a permanent ban on the words "Elite" and "Bust". He named "elite" and "stud" as words he WANTS. Do not
cite that research doc as product direction.

**2026-07-06 03:28:03Z:** *"as i said before - the data and the models do not need to be displayed in the UI
the same way and/or with the same language as the backend - i want a usefull and enjoyable UI/UX"*

**2026-07-05 00:07:31Z, the ambition:** *"we can also build a world class front end UI - one that fantasty
football guru's would drop their jaws if they saw"*

**2026-07-06 03:46:49Z:** *"do not lose this guidance - it's how i want the product built"* — followed by the
second half, which is a standing product ask, not a one-off: continuous analysis for *"performance patterns -
age patterns - league manager patterns - positional patterns"* because *"this is how we can find more
competitiive edges"*.

**2026-07-06 14:21:37Z — how he wants the research done:** study how real fantasy apps display data,
*"player rankings first ('the most common barometer')"*, naming Sleeper, ESPN, Yahoo, NFL Fantasy, Underdog,
DynastyNerds/GM, KTC, FantasyPros, PFF, DraftKings. Rankings-first is the same instinct that later became the
rank-vs-rank direction in [[project_dg184_market_ranks_frontend_2026-09-07]].

**Why:** two lanes have now re-derived the prose ruling from scratch because the July original was lost, and a
commissioned research doc still on disk argues the opposite of what he asked for.
**How to apply:** quote 07-05 as the origin and 08-29 as the restatement. Related:
[[david_rulings_dg3]] (the August restatement + the DG-091 four-dimension verdict),
[[david_rulings_glyphs_2026-09-04]] (status indicators are the one narrow exception),
[[feedback_my_conventions_are_not_davids_rules]].

---

## The rest of JULY, recovered 2026-09-08 (the design month)

**⭐ He withdrew "stud" himself, hours later, and named the top tier:** *"use elite not stud, and choose a
special vocabulary for the top 1%... otherwise this looks good. THIS IS NOW OUR PRODUCT ROADMAP."* He chose
**Generational**. Ratified ladder: Generational ≥99 · Elite 95-99 · Cornerstone · Starter · Depth. ⛔ "stud"
is REJECTED. Then constrained on 07-09: *"elite should not be an arbitraty percentile - we should look at
the relative values (production, age, etc) of the players compared to the field and historicals in the field"*.

**⭐ THE MARGIN THESIS, 07-08 — he calls it what the product IS:** *"it's not the MODEL change that's most
important — it's the VALUE we have per player v the Value the market has for that player. Finding that margin
is our competitive edge."* … *"if we value a player at 100 and the market values them at 50, that's a
relatively LARGE margin — I need to see that, color coded, heat mapped perhaps... on every player."* A level
comparison outranks day-over-day movement; trends are secondary and earn little surface.

**⭐ Then HE reframed the hero the same week:** the primary surface is a **ranked value board** across the
universe; the margin is the **killer secondary column**, not a standalone hero, because coverage was thin.
With it: scope presets My Roster / League Rosters / Full Comparable Universe, **NO watchlist** (⚠ reversed by
his own 2026-09-08 Directions import, which has one), and default sort = position-grouped Sleeper-style on
roster pages, overall ranking with position filters on the universe.

**⭐ He rejected the product three times in two days:** *"the current version is horrible"* → *"still wildly
disappointing"* → *"these still look really bad"*. He set the bar with 14 Dynasty Nerds screenshots: *"this is
the gold standard. DG should be at this level... at least"*, and a standing order: *"always visually audit the
work and raise the bar until a truly exceptional standard is met."* Root cause he named: the design
FOUNDATION, producing "a developer console in a fantasy skin". Also *"this team does not understand the
fundamentals"*, with player rankings *"the most common barometer"*.

**Colour, July:** green/red legal for **rank-movement arrows ONLY**, glyph plus signed numeral coloured as ONE
chip, never on value, margin or tier.

**Charts, 07-09 (his clearest chart direction):** the line graph should shade where the cohorts break, so he
can see *"not only where the margin is but also where the player sits respective to the total market of
players at that position"*.

**Studio's charter, 07-14, his first person:** an outside designer-engineer who *"has not read — and will
never read — the governance corpus… That is my design, not an oversight."* ⛔ One response banned:
*"'Policy says no' is never a sufficient answer to Studio — policies are mine to amend."* Later the wall:
*"do not let claude or codex mess up with studios work."*

**Process gates:** he previews designed surfaces before any visual commit; contract-green is never a visual
green; no system-nominated single-player hero on a descriptive surface (the MoverHero was deleted by name).
*"make sure you are not just thnking like engineers, though, the impeccable front end has to be considered
like an end user."* **"margin" is the ratified product noun**, not "spreads".

**Sequencing, end of July:** front end is **layer 6**, gated behind layers 1-2. *"we have over thought over
engineered over tooled over govered sooooo deeply that we are building COMPLETE SLOP."*

## JUNE 2026 — the rulings that shaped the shell

- **Player Detail v1 covers active players AND prospects** — *"I confirm scope (b), present the design - send
  to claude"* (06-07). He held it when coverage came back thin: honest degradation, never a smaller product.
- **⛔ Colour may never encode direction:** the divergence strip *"stays uniform-neutral slate; direction
  conveyed via label text; no directional brand color"*. ⚠ Loosened in July for movement arrows only, and
  again on 08-30 ("Green up / red down"). Value, margin and tier hues stay neutral.
- **Fix the copy at SOURCE, not at render** — the banned word was rewritten in the producer, with the
  render-time guard kept only as defence in depth. Displayed wording is a product defect, not a rendering one.
- **Say WHY there is no card:** "unmodeled category" / "no active model score", never a vague "evidence
  incomplete".
- **⛔ Tailwind is BARRED by the terms of his own stack authorization.** Stack A is React + Vite + TypeScript +
  Zod with CSS variables; he rejected both the HTMX/Tailwind and the Next.js/shadcn poles.
- **He authorized the double-gated copy linter:** a component may not render `.verdict` or `.dynasty_tier`
  into visible JSX even when the words on screen are clean.
- **Player Detail form:** inspector is a neutral preview carrying a plain count, with no grade, edge, delta or
  warning glyph; the full evidence card lives on its own page.
