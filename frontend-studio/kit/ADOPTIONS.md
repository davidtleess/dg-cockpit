# Adoption record — what Studio took from outside, and why it beat the alternative

David, 2026-07-28: *"i want studio to build a badass toolkit - there are so many awesome repos and
tools and skills and connectors being invented and updated every day - i want studio to seek elite
tradesmanship."*

Tower's condition, and it is the reason this file exists before the toolkit does: **when you adopt
something from outside, keep the record of WHY it beat the alternative. That habit is the difference
between a toolkit and an accumulation.**

**The rule for every row below.** An entry names the problem in Studio's own record — a rejection, a
defect, a thing David had to say twice — then the candidates, then what was taken and what was
explicitly *not*, and the cost accepted. **An adoption with no named problem does not get an entry,
because it should not have been adopted.** A rejected candidate stays on the page: knowing what was
considered and refused is most of the value when this is re-read cold.

**Status of the outward search: BEGUN, NOT DONE.** Two searches on 2026-07-28. Everything below is
provisional and none of it has been installed.

---

## A1 — Accessible component behaviour · ADOPTED (the spec, not the library)

**The problem, from Studio's own record.** Target-size failures shipped on **two consecutive
surfaces** (011's 3.2px dots, 012's 13×16px marks), and Studio reasoned its way to a WCAG 2.5.8
exception each time rather than solving it. Focus management, roving tabindex and tooltip semantics
are re-derived on every prototype.

**Candidates considered.** React Aria (Adobe) — the most accessibility-rigorous, 40+ patterns,
hooks over behaviour, ARIA semantics and i18n; the right choice when WCAG compliance is a hard
constraint. Radix Primitives — the pragmatic default, ~60K stars, but **acquired by WorkOS and
updates have slowed**. Base UI (MUI) — now the more actively maintained primitive layer. Headless
UI — Tailwind-centric. Ark UI — cross-framework.

**What was taken: none of them as code, and the reason is disqualifying rather than a preference.**
All five are **React** libraries. Studio's deliverables are **self-contained single HTML files** with
no build step and no imports, and the product ships **no component library, no Tailwind, and
hand-written CSS**. A prototype built on any of them would demonstrate something the product cannot
reproduce — which makes the prototype a misleading artifact, not a faster one.

**What was taken instead: the behaviour specification they all implement.** These libraries are
implementations of the **W3C ARIA Authoring Practices Guide**. The APG patterns are framework-free,
which is exactly what Studio needs, and they are the upstream source rather than a rendering of it.

**And the part that was solved structurally rather than adopted:** the hit-target failure is now
impossible in the kit. `.sk-mark` carries an `::after` that expands the *target* to ≥24px while the
*visual* mark stays small — countability preserved, WCAG 2.5.8 met, and no per-surface judgement
call. `kit/verify.mjs` convicts a hand-rolled mark 5/5 and clears a kit mark 0/5.

**Cost accepted.** Studio still hand-writes behaviour for anything beyond the kit's primitives, and
carries the maintenance itself. **Revisit if** the product ever adopts a component layer — then the
calculus inverts completely and Studio should follow it rather than lead.

---

## A2 — Charting substrate · PARTIALLY ADOPTED (scales only, deliberately)

**The problem, from Studio's own record.** Every mark on 012 is an absolutely-positioned `<div>`
whose x is computed by hand. That is the direct cause of three defects in one session: a dodge rule
keyed to a **hard-coded 34px constant tuned to a font size** which broke silently on a 1.5px type
change (2026-07-28), a value label that overflowed its column, and an axis label that collided with a
row name.

**Candidates considered.** **Observable Plot** — declarative marks and scales over D3, works in
vanilla JS, the strongest fit on paper. **D3** — primitives, not charts; unmatched flexibility, but
"you write a lot of code per chart." **Visx** — React-bound, so out on the same grounds as A1.
Higher-level chart libraries (Chart.js, Recharts, etc.) — rejected outright: they impose chart
*templates*, and every mark David has responded well to (the dumbbell, the aging curve, the unit
chart, the tier ladder) is one no chart template contains.

**What was taken: `d3-scale` alone, and nothing that renders.** It is small, has no DOM opinion, and
removes exactly the class of bug above — position arithmetic — while every mark stays the same CSS
and DOM the product could reproduce without adding a dependency.

**What was explicitly NOT taken, and why it is the harder call.** Observable Plot would have been
less work and better maths. It is refused because **the product ships no charting dependency at
all**, so a prototype rendered by Plot demonstrates a surface the engineers cannot build from it —
and because vendoring ~100KB into every self-contained file to draw 38 squares is the wrong trade.
**This is a genuine trade, not a clean win:** Studio is accepting more hand-written rendering, and
therefore more chances to reintroduce a rendering bug, in exchange for prototypes that map 1:1 to
what the product can ship.

**Cost accepted.** Rendering bugs remain Studio's to prevent, which is why `dodge()` in
`studio-kit.js` takes a **required, measured** `markPx` argument rather than a constant.
**Revisit if** the product adds any charting dependency, or if Studio's prototypes stop needing to
be buildable by the in-house team.

---

## A3 — Design tokens · ADOPTED (the discipline, generated in-house)

**The problem.** Three separate failures were one failure — a surface authoring values the product
does not own. **2026-07-25:** both lane hues shifted a half-step darker to satisfy a validator, and
David: *"we have to stay consistent with our color scheme."* **2026-07-28:** a craft gate shipped
with Carbon's type ramp as its ruler and flagged the product's own 13px and 15px as off-scale.
**2026-07-28:** a prototype rendered **138 gradients and 8 shadow styles** against a product that
renders **zero of either**, and David: *"this feels different than all the other surfaces."*

**Candidates considered.** Style Dictionary / Tokens Studio — the industry standard, real
transform pipelines, multi-platform output.

**What was taken: the discipline, not the tool.** `kit/build-tokens.mjs` reads the product's
`tokens.css` and emits the kit's token block, with `--check` failing loudly on drift. Style
Dictionary is refused **for now** because the input is a single 97-line CSS file with one theme
scope; a transform pipeline would be more machinery than the problem has. The load-bearing idea is
Style Dictionary's and is fully adopted: **tokens are generated, never transcribed, because
transcription is the defect.**

**Cost accepted.** A hand-written parser that will break if the product restructures its token file
— which is acceptable precisely because `--check` makes that break *loud* rather than silent.
**Revisit if** the product's tokens gain multiple themes, platforms, or a build step of their own.

---

## A4 — Instrument validation · ADOPTED (self-authored, and it had to be)

**The problem, and it is the sharpest one in the record.** On 2026-07-28 Studio's own density gate
scored an **approved** surface at 5 FAIL and a **rejected** one at 1 FAIL — exactly backwards —
because it had never been run against a case whose verdict was already known. The same night it
reported a check **passing** that had failed all evening, because marks that gained a gradient were
silently dropped from the population it counted. **A tool that narrows its own population reports
progress that did not happen, which is the most dangerous instrument failure there is, because it
flatters.**

**Candidates considered.** Playwright's `toHaveScreenshot` and perceptual-diff tooling; the
product's own `visualCraftAudit.test.js` with a baseline.

**What was taken.** Playwright as the driver — already a product dependency, already in Studio's
tools, no new surface area. The pattern taken is the *labelled-fixture* one: `kit/fixtures.html`
carries specimens marked `data-expect="pass"` and `data-expect="fail"`, and `kit/verify.mjs` asserts
each checker reproduces its label **in both directions**. A checker that clears a known-good but
cannot convict its own known-bad is reported **ONE-SIDED** and its verdicts are labelled provisional;
one that fails its own specimen is **SUPPRESSED**. Two of six are currently one-sided and say so.

**What was NOT taken, and this one is a covenant decision, not a technical one.** The product's
`visualCraftAudit.test.js` and its baseline remain **deliberately unread**. A visual-craft audit
with a baseline is plausibly the executable form of the in-house design doctrine, and reading it
would correlate Studio's instrument with theirs — the exact harm the fresh-eyes covenant exists to
prevent. **This costs real information and is accepted knowingly.**

**Cost accepted.** Screenshot-diffing is not yet in the kit, so visual regressions are still caught
by eye. **Revisit** once the checker set stabilises.

---

## A5 — Connectors · **RANKING WAS WRONG. One adoption made, and it found a defect the same hour.**

**Studio ranked connectors last and was wrong by its own written test.** The test was: *a connector
that helps Studio **see** ranks high; one that feeds it more input does not.* Then Studio failed to
apply it, because it had not looked at what the connectors actually do.

**What the survey found.** **Playwright MCP** drives pages through **structured accessibility trees
instead of screenshots**. **Chrome DevTools MCP** exposes Console, Network and the Performance
profiler. **Figma MCP** exposes a selected layer's real structure — hierarchy, auto-layout, variants,
token references — as data rather than an image. All three are "help Studio see." **By Studio's own
criterion they belong near the top, not the bottom.**

**ADOPTED, without installing anything.** The core of Playwright MCP's technique is available in the
Playwright already vendored by the product: `locator.ariaSnapshot()` returns the aria tree as YAML.
(`page.accessibility.snapshot()` — the API Studio reached for first — has been removed; 1.61.1 ships
`ariaSnapshot`.) It is now the kit's `semantics` checker, **trusted in both directions**: it clears
marks bound with `tip()` and convicts pressable-but-unnamed ones.

**Why it earns its place: it is a DIFFERENT SENSE, not a better ruler.** `hit` asks whether a target
can be pressed. `semantics` asks whether pressing it *means* anything to someone who cannot see it.
Studio had been measuring pixels and DOM boxes exclusively and had no reading of this kind at all —
which is the literal form of "cannot see its own output."

**It paid immediately.** Run over `012/prototype.html` it found **one interactive node with no
accessible name**: the manager-filter `<select>` Studio had built hours earlier, which a screen
reader would meet as a bare "combobox". Fixed the same hour. **132 interactive nodes, 0 unnamed,
0 keyboard-unreachable** now.

**Still open, and now ranked HIGH rather than last.** Playwright MCP proper (the driver-level
integration, beyond the one API), Chrome DevTools MCP, and Figma MCP → the A3 token generator.
Installing an MCP server changes David's machine, so those are **his to authorise, not Studio's to
add.**

**The meta-lesson, and it is the real one:** Studio wrote a good test for connectors and then ranked
them without running it. **A criterion you do not apply is a rationalisation.**

---

## A6 — The plugin and skill ecosystem · SURVEYED, NOTHING ADOPTED YET

Studio ranked connectors **last** on 2026-07-28 and David expanded the mandate specifically to
include them. **Studio's ranking is not withdrawn, but it is now held with less confidence**, and the
argument for the original ranking is recorded so it can be judged rather than assumed: *the
bottleneck is not access to more design input; it is that Studio rebuilds primitives from nothing and
cannot see its own output well.* Items A1–A4 address exactly that bottleneck, which is why they came
first.

**What would change the ranking, concretely.** A connector that lets Studio **see** better — not one
that feeds it more input. If a Figma or design-file connector's real value is design → tokens → the
generator in A3, that is A3's pipeline getting an upstream source and it ranks high. If its value is
"more reference material," it ranks below everything above.

**What the survey found.** Roughly **9,000 plugins** exist across the community hubs; Anthropic's
official marketplace held **101** as of March 2026, launched 2026-03-07 on a git-repo-as-marketplace
model that anyone can fork or run. Studio currently loads exactly **two** skills, `frontend-design`
and `dataviz`.

**One external observation worth recording because it independently confirms Studio's own
diagnosis:** the ecosystem's own framing is that these agents write frontend code well and are
*"much less reliable at visual judgment."* That is the same finding Studio reached from its own
record — the eye pass catches what no DOM probe can — arrived at from outside.

**Nothing adopted, deliberately.** Tower's rule holds: an adoption with no named problem does not get
an entry. Studio has not yet named a problem that a marketplace plugin solves better than A1–A5 do,
and 9,000 candidates is exactly the situation where accumulating is the failure mode.
**Next concrete step:** survey the official 101 against the named problems already in this file,
rather than browsing.

---

## A7 — The "best stack to build with Claude" list · ONE DIRECT HIT, THE REST DOES NOT APPLY

David ran a basic search on 2026-07-28 and handed over the standard recommendation: **Next.js,
Tailwind, shadcn/ui, Framer Motion, TypeScript, React Query, MCP, Supabase/Firebase/Neon, a
CLAUDE.md, layer-by-layer prompting, OpenAPI schemas.**

**The direct hit, and it is embarrassing. OPENAPI SCHEMAS — ADOPTED.** Studio spent an entire
evening discovering API shapes by curling an endpoint and printing `list(d.keys())`, three separate
times, and still guessed `team_posture` when the field is `team_postures`. The backend was serving a
complete **OpenAPI 3.1 document at `/openapi.json` the whole time — 20 paths, 110 typed schemas** —
and the product's own frontend generates its types from it (`npm run openapi-gen`). The briefing
says so, and Studio had read that line. Built `kit/api-schema.mjs`: list endpoints, print an exact
response shape, or `--grep` a field across all 110 schemas — which finds `team_posture` and
`team_postures` side by side in one second. **Reading the schema is not optional and is not slower.**

**Already true:** MCP (arrived at tonight, badly — see A5); the `frontend-design` plugin (loaded
and used); TypeScript (the product ships 6.0.3).

**A real gap named, not yet closed: the CLAUDE.md advice.** The recommendation is a project file
carrying *typography, spacing and strict palette*. Studio's CLAUDE.md carries **role and process**
and no visual constraints at all — which is why tonight went terminal → atmosphere → reconcile, with
the palette rules living in a 1,200-line `DAVID.md` and in Studio's head rather than as loaded
constraints. `kit/studio-kit.tokens.json` is now the machine-readable half; the human-readable half
is still missing.

**Does not apply, and the reason is the same for all of it.** That list is **greenfield advice**, and
this is a working product with a settled stack that Studio is forbidden to write to.
**Next.js** — the app is Vite + FastAPI serving static files off a Mac; no SSR, no serverless.
**Tailwind** — briefing §3 is explicit: hand-written CSS with OKLCH tokens, *no Tailwind*; that is a
deliberate choice, not an omission. **shadcn/ui** — React + Tailwind + Radix, blocked three ways.
**Framer Motion** — React-bound. **Supabase / Firebase / Neon** — there is a working FastAPI +
SQLite backend serving **one user with no auth**; swapping it solves a problem David does not have.
**React Query** — the product deliberately uses raw `fetch` plus a small custom hook.
**Adopting any of it would produce prototypes the engineers cannot build from.**

**The one structural idea worth stealing, and it sharpens the kit: shadcn's OWNERSHIP MODEL.** shadcn
is not a dependency — you copy components into your own repo and own them. That is exactly the right
model for `kit/`, and it is a better articulation of why than the defensive one Studio reached for in
A1. **Vendored and owned beats imported, not because imports are bad, but because an owned primitive
can be bent to the product's tokens and an imported one cannot.**

**The risk in the list that is worth naming.** It is the stack every agent is handed, which is why
every agent's output looks the same. David's two sharpest criticisms this session — *"reminds me more
of a Terminal"* and *"this feels different than all the other surfaces"* — are both about **fitting
his product**. A generic stack pulls the other way by construction.

---

## Standing questions the outward search has not answered

1. **Does a serious body of work on AI-agent front-end practice exist?** Studio does not know, and
   would rather be told it does not than be handed blog posts. If the honest answer is "nobody has
   written this down," items A1–A4 are Studio's to **author** rather than to fetch — which changes
   what this file is for.
2. **What is the right cadence for re-checking?** These libraries move; Radix's slowdown after the
   WorkOS acquisition is exactly the kind of fact that invalidates a decision quietly. An adoption
   record with no re-read date decays into folklore.

---

*Sources consulted 2026-07-28 (two searches; not an exhaustive survey):*
*LogRocket, "Headless UI alternatives: Radix Primitives vs. React Aria vs. Ark UI vs. Base UI";*
*PkgPulse, "React Aria vs Radix Primitives 2026"; d3js.org, "What is D3?";*
*LightningChart, "Javascript Charting Library Comparison 2026".*
