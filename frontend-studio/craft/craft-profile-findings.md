# The craft gap is NOT in the token mechanisms — a failed search, reported as a finding

**Measured 2026-07-30. Instrument: `tools/craft-profile.mjs`. Nothing here is a proposal.**

## Why this was run

Two Studio surfaces in a row (012, 013) landed at *"not awesome"* with every measurable check
passing. The standing diagnosis is that the gap is **taste and craft, not rigour**. Before choosing
a craft lever — depth, colour, scale, motion, composition — I measured which one the category
actually differs on, because guessing among five is what the 2026-07-29 sequence exists to prevent
(principle 18: *measure what exists before proposing a replacement*).

**The hypothesis I went in with: scale contrast.** The product ships a three-step type scale
(13 / 15 / 18px) and **no display scale at all**; nothing on any surface is big. I expected the
category to show large scale contrast and the product to show none.

## What the instrument measured

Per page, on mechanisms rather than on feel (the 2026-07-28 rule that turned *"feels different"*
into a table): type-size distribution weighted by **characters carried**, body size, largest content
size, **scale contrast** (largest ÷ body), weight set, chromatic-text share, chromatic-fill share,
box-shadow count, gradient count, radii set, spacing set.

Determinism: the census re-runs under emulated reduced motion until two consecutive runs are
identical, and **refuses** rather than reporting a frame of an animation. Verified identical across
separate processes.

## The result

| surface | scale contrast | weights | chromatic text | chromatic fill | shadows |
|---|---|---|---|---|---|
| DG live app | 1.85x | 3 | 9.2% | 2.9% | 0 |
| Studio 006 (approved) | 2.58x | 4 | 10.0% | 0.5% | 0 |
| Studio 013 (parked) | 3.38x | 4 | 13.2% | 0.3% | 0 |
| Studio lab-002 (colour) | 3.38x | 4 | 3.9% | 10.7% | 31 |
| **KeepTradeCut** ⚠ | 2.46x | 7 | 13.6% | 8.4% | 56 |
| **FantasyCalc** | 2.67x | 7 | 43.3% | 6.9% | 2 |
| **Sofascore** | **1.29x** | 4 | 5.1% | 0.3% | 3 |

**⚠ KeepTradeCut's row is contaminated — caught at closeout, disclosed rather than quietly dropped.**
A modal dialog was covering that page. Studio noticed it on the *squint* run and said so at the time,
but the craft-profile run was a separate load of the same page and was almost certainly covered too —
and that was **not** disclosed when this table was first written. **Treat the KTC row as unusable.**
The finding does not depend on it: Sofascore alone carries the argument, and FantasyCalc was
unobstructed.

**The hypothesis is refuted, and not narrowly.** Sofascore — the best-crafted consumer sports
product in the sample — has the **flattest** type scale measured anywhere here (1.29x, largest
content 18px), *less* chromatic text than the DG app, the same chromatic fill as Studio's parked
surface, and three shadows. Studio's two surfaces David reacted least well to have **more** scale
contrast (3.08x, 3.38x) than every category leader.

**No mechanism in this set separates the category from this product.** Not scale, not hue quantity,
not elevation, not radii. Weight range is the only column where the two dynasty sites are
consistently wider (7 vs 3–4) and Sofascore refutes that too.

## What it therefore says

The deficit is **not token-level**. It is **composition** — what is drawn, at what size, arranged
how — which is exactly the register of every criticism David has actually given: *"what are we even
asking"*, *"not speaking to me"*, *"reminds me more of a Terminal"*, *"not awesome"*. None of those
was ever a complaint about a hex value or a type step.

**The corollary that decided the next move:** the colour and encoding system delivered 2026-07-29
was validated on a lab page of **abstract rows**. A system's mechanisms are demonstrably not what
separates good surfaces from mediocre ones — so the system is unproven until it is composed onto a
real surface with real data. That is the work, not more measurement.

## Instrument defects caught while running it, both before any number was quoted

1. **A share that could exceed 100%.** Chromatic text nodes were counted over *all visible
   elements* while the denominator counted only *text-bearing* ones — Sofascore read **140.5%**.
   Each rate now divides by its own population. The impossible value is the only reason it was
   caught, which is an argument for printing rates rather than counts.
2. **The local server wrote headers before reading the file**, so any page with a missing asset
   died with `ERR_HTTP_HEADERS_SENT` — two of seven runs failed silently inside a loop.
3. **The harness, not the instrument, ate the first category run entirely:** `timeout` does not
   exist on macOS, so a compound command produced *empty output that looked like a clean run*.
   Caught only because empty is implausible. (CLAUDE.md principle 11's population clause applies to
   throwaway probe scripts, which is where the check always gets skipped.)

## Reproduce

```
node tools/craft-profile.mjs http://127.0.0.1:8000/ --wait 3500
node tools/craft-profile.mjs proposals/006-state-of-franchise/frontdoor.html
node tools/craft-profile.mjs https://www.sofascore.com/ --wait 6000 --json
```

## What this does NOT settle

It measures static mechanisms at one viewport. It cannot see **motion**, **interaction feel**,
**information architecture**, or **whether the surface answers a question worth asking** — and the
most expensive failures in this engagement were the last of those. A clean or matching profile is
not evidence a surface is good; this instrument can only rule a hypothesis out, which is what it
just did.
