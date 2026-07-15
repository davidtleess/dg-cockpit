# 000 — First Impressions: Dynasty Genius, Cold Open

**Studio · July 14, 2026.** First-ever run of the app, captured before reading a single line of
source code. Method: drove the live app at `127.0.0.1:8000` in a real browser (Playwright/Chromium,
1440×900 and 390×844) the way a dynasty manager uses it on a Tuesday morning — read the tape,
audited the roster, mocked a trade, scouted the league. Every claim below has a screenshot in
`proposals/assets/000-first-run/`.

These are naive reactions, preserved on purpose. Some may soften with more time in the product;
none have been sanded down for diplomacy.

---

## The one-paragraph verdict

There are two products wearing one shell. The first is a serious, honest, two-lane valuation engine
with receipts — 21 consecutive verified captures, per-position backtests with confidence intervals,
provenance on everything. The second is the interface, which treats that engine's internal state as
if it were the user experience: raw enum strings where words should be, debug flags where sentences
should be, disclaimers where confidence should be, and dead glass where interaction should be. The
data respects the hobby. The interface does not yet respect the person.

---

## The morning test

The core loop this app exists for: *coffee, open app, "what moved, and should I care?"*

What actually happens on July 14:

1. **The first thing I see, top-right, is an amber warning: "Status unavailable."**
   (`01-default-what-changed-viewport.png`) Meanwhile the context rail on the *same screen* says
   `Market Sync Active: 21 consecutive days tracked · Status: Synced`, and every feed reads `ok`.
   Expanding the pill yields "Data freshness unavailable — update status unknown / system health
   configuration unavailable" (`29-status-strip.png`) — over a page of perfectly fresh data. The app
   opens every single morning by crying wolf about itself. Trust chrome that contradicts its own
   page is worse than no trust chrome.

2. **The tape is genuinely close to good.** Headshots, team chips, value, signed delta, a 30-day
   sparkline per row. This is the best surface in the app and it's ~70% of the way to excellent.
   The remaining 30%: every sparkline is the same amber whether the player is up or down (I can't
   read direction at a glance — I have to parse signs); "Moves on the tape: 51" headlines a page
   whose model section then says nothing moved (the count silently includes market moves and
   universe entries/exits); and there's a phantom trailing dash column under an ambiguous
   `VALUE · Δ · 30-DAY` header.

3. **Then I try to touch it, and nothing answers.** Chris Bell is +139 on my roster — the top mover.
   Why? Injury news? Camp hype? I click his row. Nothing. I verified in the DOM: no clickable
   ancestor, `cursor: auto` (`interact2.mjs` probe). The morning screen shows *what* moved and
   provides no path anywhere toward *why* or even to the player's own card. The tape is glass.

4. **Below the tape, the product turns into a terminal.** "Current roster context" is five stacked
   blocks, each opening with `Status: ok`, "Descriptive only — not decision-grade", and a caveat box
   containing literally `captured_at_vs_report_generated_at — stale (age 504.5h)` — repeated five
   times (`01-default-what-changed-full.png`). Further down: `UNROSTERED_MODEL_MARKET_DIVERGENCE: 4`.
   The single most strategic fact on the page — **Posture: REBUILDING** — is buried at the bottom of
   caveat block #1 in the same type size as the debug strings.

Time from open to "I know what happened and what to look at": it never arrives. The tape gives the
what; the why is unreachable; the context is unreadable.

---

## What's genuinely good (and worth protecting)

- **The two-lane thesis.** Model view and market view side by side, never merged into a verdict, is
  a *differentiator*. KeepTradeCut and FantasyCalc give you one number; this app's honest "here are
  two lenses that disagree" is something no mainstream tool does. The thesis deserves a far better
  stage than it's getting.
- **Receipts culture.** Capture windows, model provenance, fold tables with CI95s, "what this model
  is not for." Dynasty degenerates *love* receipts. This is the right instinct — it just currently
  presents as compliance paperwork instead of confidence.
- **The tape rows.** Identity + value + delta + sparkline is the correct atomic unit for the morning
  loop. It exists. It works. It's the seed of the whole product's visual language.
- **Typography foundation.** Archivo + IBM Plex is a credible pairing; the dark theme's base
  surfaces are fine. The bones are not the problem.

---

## The findings, ranked

### 1. The flagship view renders broken strings
The full player evidence card — the page where the two-lane thesis lives — renders its model lane as
`ENGINE_BACTIVE_B75.331.3——11.822—` and its market lane as
`FantasyCalc7242Overall 13Position 32026-07-14T13:00:00.878123+00:00market_overlay_static_caveatsource_timestamp_is_fetch_time_not_publish_time`
(`33-player-detail-full.png`). That is engine name, grade, version, value, rank, a microsecond ISO
timestamp, and two caveat slugs concatenated without separators. For Ashton Jeanty — the crown jewel
of the roster. The single most important page in the product is visibly broken, and because opening
it doesn't change the URL, it can't even be linked or bookmarked.

### 2. The app speaks to its user in variable names
Everywhere: `PRE_MODEL`, `no_age_signal (5y)`, `approaching_cliff (2y)`, `awaiting_first_finalized_week`,
`fantasycalc_raw_scale_not_xvar`, `decision_supported = false`, `partner_score 2.168`,
`team_posture.v1`, "missing: aging_curve_value, ppg_t_minus_1, snap_share_t_minus_1"
(`02`, `05`, `07`, `23`, `32`, `33`). This is not a caveat problem or a copy-polish problem; it is a
missing presentation layer. Nielsen's second heuristic — match between system and real world — is
violated on every screen. A tool for one expert user still deserves English.

### 3. League Pulse is unusable at exactly its job
The counterparty-scouting page renders **40,897 pixels tall** — about 45 screens of scrolling
(`05-league-pulse-full.png`). Each of 11 opponents is a vertical dump of snake_case key-value pairs
(`complementarity_score` / `0.92`, one per line). Scouting is a *comparison* task; this layout makes
comparison physically impossible. This should be one ranked, scannable table or a grid of 11 cards.
Also: it opens with a duplicated title and a methodology paragraph before any data.

### 4. Trade Lab fights the user at every step
The emotional core of dynasty — mocking trades — greets you with a paragraph about what it *won't*
do, above three unstyled native form controls on a bare page (`03-trade-lab-viewport.png`). In use
(`26`, `27`, `32`): searching "2027" returns ~36 identical raw buttons in arbitrary order; adding an
asset is possible but **removing one is not** (no control exists — confirmed by click probe); the
layout visibly breaks when the inspector opens (app header and status pill displaced mid-page); and
"Run comparison" with **zero assets on both sides** happily returns a straight-faced results panel —
"Parity: within band", "Adjusted fairness delta range: 0 to 27.83", "Roster rules conflict:
transaction blocked" — plus eight snake_case flags. Confident nonsense from an empty input is a
correctness bug, not a styling issue.

### 5. Ghost-opacity plague
Roster Capacity renders its entire cut-candidate table at roughly 20–30% opacity — 22 rows of
barely-legible ghost text under an equally ghosted "Artifact status: ok" (`04`). Model Trust does
the same to its gate matrix and model card (`06`). Whether this is a bug or an intentional
"de-emphasis" style, the effect is the same: core content the user came for is nearly invisible.
De-emphasis that makes the primary content illegible isn't hierarchy, it's erasure.

### 6. Data absence is louder than data presence
Roster Capacity ends with ~30 lines enumerating `ATH range unavailable`, `CB range unavailable`,
`ILB range unavailable`… — defensive linemen and long snappers in a QB/RB/WR/TE league (`04`).
Roster Audit ships a "Model status" column that reads `n/a` in 100% of rows, and DVS is a dash for
most (`02`). The Movement history slot says "the line begins once enough days are on the books"
while the same page celebrates 21/21 verified capture days — if 21 isn't enough, tell me the number;
if it is, draw the line (`01`). Empty states are fine; empty states that enumerate everything that
doesn't exist, in the user's face, are the interface apologizing instead of designing.

### 7. The product is afraid of its user
"Descriptive only — not decision-grade" appears seven-plus times on a single page. Every context
block opens with a status line, a disclaimer, and a caveat box before its content. Trade Lab's first
sentence is a legal notice. I understand and respect the design constraint — no verdicts, no
buy/sell language, descriptive not prescriptive. But there is a difference between *not giving
verdicts* and *flinching before every fact*. Sleeper and Underdog feel like the hobby; this feels
like being deposed. Tone is a design surface, and right now it's set to "compliance."

### 8. Identity is inconsistent
The tape has real headshots; Roster Audit renders names as gray text chips; the Entered/Exited chips
mix initials and photos for players of the same status; the inspector shows the raw Sleeper ID
(`7569`) as a content line (`01`, `02`, `27`). Player identity is the atomic unit of a fantasy
product — it should render one way, everywhere.

### 9. Every surface is a dead end
Beyond the unclickable tape: cut candidates on Roster Capacity aren't links, League Pulse teams
aren't links, the player card has no URL, and the only working route to a full player card I found
was: open Trade Lab → search the player → add them to a trade → open inspector → "Open full evidence
card." Navigation between related facts — the connective tissue of a research tool — doesn't exist.

### 10. Small chrome, daily cost
Native unstyled `<select>`/`<input>`/`<button>` controls glare white-on-dark on Roster Audit and
Trade Lab. The Accuracy Tracker's one card is a blinding white block on the dark theme, with its
heading duplicated ("ACCURACY TRACKER" twice) and its reason rendered as
`awaiting_first_finalized_week` (`07`). Command palette works but is keyboard-only (options ignore
the mouse). Phone-width rendering (`40`) degrades tolerably — nav wraps, tape stacks — but rows
overflow. None of these alone matters; together they set the product's perceived quality floor.

---

## Discrepancies vs. the product briefing

Noting these for the record (the briefing was compiled this morning; the app may have moved):

- Briefing says player identity is initials-only chips and headshot requests 404. **Headshots render
  today** on the What-Changed tape (and partially on Entered/Exited chips), not elsewhere.
- Briefing says the What-Changed rows carry a "30-day trend" — they do, as working sparklines; only
  the big Movement history chart is a placeholder.
- Briefing describes Trade Lab persistence via localStorage; I can confirm the draft survives within
  a browser profile, and add: an empty trade runs and returns a populated result panel, which the
  briefing doesn't mention.

## Covenant status

Clean. No source code, no governance/spec/process documents read. Everything above comes from the
running product, the API's rendered output, and `PRODUCT_BRIEFING.md`.

---

## Where I'd go first

If David asked me for the highest-leverage sequence, it's this — each will arrive as its own
numbered proposal with a working prototype:

1. **001 — The Morning Tape, finished.** Make the default screen answer its own question: clickable
   rows that open the player card, direction-readable sparklines, an honest "moves" count, posture
   promoted to the masthead, and the telemetry wall collapsed into one provenance line that expands
   on demand. This is the screen he sees 365 mornings a year; polish lands here first.
2. **002 — The player card, rebuilt.** Fix the broken lane strings, give the card a URL, one
   identity header, the two lanes as an actual visual comparison, caveats in English. The thesis
   page should be the best page in the product.
3. **003 — A presentation-layer vocabulary.** One mapping from every enum/flag/field the API emits
   to a human phrase, applied everywhere — kills finding #2 across all screens at once, without
   touching the no-verdict constraint.
4. **004 — League Pulse as a scouting table.** 45 screens → one.
5. **005 — Trade Lab worthy of the name.** Remove-asset, grouped pick picker, styled controls,
   empty-state guard, results that lead with the two lanes instead of the flags.

— Studio
