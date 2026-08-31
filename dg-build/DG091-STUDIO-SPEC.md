# DG-091 Studio Design Spec — fresh-eyes seat

**Produced 2026-08-29 night on David's order to start building. Designed from the LIVE
RENDERED PRODUCT ONLY** (http://127.0.0.1:8000, all 11 nav surfaces at 1440px + 390px, the
player card, inspector and health panel; screenshots listed at the end). The seat was given
no tickets, no roadmap, no source code and no internal vocabulary — only David's three
verbatim rulings and the hard honesty facts. The Studio directory (~/frontend-studio) was
never touched: the wall holds.

---

# Dynasty Genius — Front-End Redesign Spec
**Studio fresh-eyes seat · designed from the rendered product only · 2026-08-29**
Evidence: screenshots of every surface at 1440px and 390px in `/private/tmp/claude-501/-Users-davidleess/a78b7a79-4f7a-419c-8451-7d7e3919050f/scratchpad/studio-shots/`. Every "before" string in this spec was seen on screen.

---

## 1 · Overall direction

Today the product reads like the lab notebook of the team that built the model — every surface leads with what it is *not* ("Descriptive only — not decision-grade" appears up to eight times on a single page), raw pipeline keys render literally on screen (`partner_score_market_influenced`, `no_age_signal (5y)`, `live_precondition_not_ok:capture_health_ok=degraded`), and the player card is one unlabeled run-together string (`ENGINE_BACTIVE_B77.518.4358%—15.576—`). The redesign turns it into **a morning sports brief written by a sharp analyst David trusts** — the feel of opening **The Athletic** or **Apple Sports** crossed with the one-glance readiness score of a **Whoop/Oura morning brief**, on the calm dark restraint of **Linear**. The analyst has opinions and states them in plain sentences; the receipts exist for every number but live one press down, not on the front of the page. Three governing moves: **(1) verdict first, numbers second, provenance one press away; (2) a copy dictionary between the data and the screen so no raw key can ever render; (3) one caveat sentence per surface, placed only where it would change a decision — never a stamp.**

### Truth rules (bind every screen — these survive from the current product's honesty)
1. **Never invent a number.** All recommendation and verdict copy is template text assembled from fields already on screen today (deltas, model-vs-market direction, cut-exposure rank, roster overflow count). If a template's input is missing, the block says so in a sentence — it never estimates.
2. **Stale or unscored is said plainly, once, in one human sentence** — e.g. "Two of our nine overnight feeds ran a day behind, so a few prices are from Thursday." Never a status stamp, never repeated per-panel.
3. **Every number keeps its receipt one press away.** Any stat block, table row, or verdict sentence opens a "Where this comes from" sheet on press: source name, capture time, model run date/version, inputs used, and (at the bottom, monospace) run ID / artifact hash / git SHA.
4. **The dark canvas stays. No framework change** — everything below is restyle, copy, and layout on the existing React app. Every field the new copy needs already reaches the client (verified on screen).

### The copy dictionary (engineering requirement, not a style hope)
One module (e.g. `copy.ts`) maps every backend token, caveat key, and status enum to a human string — the strings in §6 and the per-surface sections are its seed content. **Render rule: no string containing an underscore or ALL_CAPS token may reach the DOM.** Fallback for an unmapped key: humanize (strip underscores, sentence case), render in the "Where this comes from" sheet only — never in body copy — and log a console warning so the crew adds the mapping.

---

## 2 · The Morning Read (front page, replaces "Daily What-Changed")

**The morning test:** one glance answers *am I ok / what moved / what should I look at.* Top to bottom:

### 2.1 Header band
- Left: **"Saturday, August 29"** (28px/700) with "Morning read" as a 13px overline above it.
- Right: **one freshness sentence** with a colored dot, replacing the "Attention — details inside" pill, the "Partial Market Sync" monospace pane, FEED DIAGNOSTICS, and RECEIPTS panels entirely.
  - Fresh: 🟢 `All feeds ran on time — prices as of 9:00 this morning.`
  - Today's actual degraded state: 🟠 `Two of nine overnight feeds ran a day behind — details`
  - "details" opens the **health sheet** (see 2.6).

### 2.2 The verdict (hero, full width)
One or two sentences, 22px/500, assembled from fields already present (roster delta count, largest mover, cut requirement, staleness). Written examples:

- Good, clean morning: **"You're in good shape. Your roster gained value overnight — Jaxson Dart led the way, up 306 — and nothing needs a decision from you today."**
- Action needed (today's actual data — roster overflow of 1 exists on Roster Capacity): **"One thing needs doing: you're one player over the roster limit, so a cut is due before kickoff. Otherwise a good morning — your roster gained value, led by Jaxson Dart, up 306."**
- **How a stale morning reads** (today's actual degraded state): **"Mostly a normal morning — your roster gained value, led by Jaxson Dart, up 306. One heads-up: two of our nine overnight feeds ran a day behind, so a handful of market prices below are from Thursday rather than this morning. Nothing here is guessed — anything we couldn't back with fresh data shows a dash instead of a number."**

### 2.3 "Worth a look" (the recommendation block — new, now allowed)
Up to two cards, each: bold one-line verdict, two-sentence reason built strictly from on-screen fields, and a button into the relevant surface. Written examples from today's real data:

> **Sell-high window: Jaxson Dart.** The market has run him up **+306 this month to 5,082 — 30th overall, 11th among QBs** — while our model prices him lower than that. If you've thought about shopping him, this is the strongest market he's had since we started tracking. **See his card →**

> **Your required cut: start with Rasheen Ali.** You're one over the limit, and he's the most expendable player on your roster — lowest value over replacement, and we're seeing only a sliver of the usage data we'd want. **See the cut list →**

If no recommendation clears the bar: the block collapses to one line — `Nothing worth acting on today.` If inputs are missing: `We'd normally flag trade windows here, but today's market feed is a day behind — check back tomorrow.`

### 2.4 "What moved" — your roster
- Subtitle (replaces "Price-discovery deltas — market overlay only, isolated from model output."): **"Market prices — what the dynasty market is paying. Our own projections didn't move today."** (The second clause replaces the "Model output changes" panel, which disappears as a panel.)
- **Top 3 movers as cards**: headshot, name 17px/600, `QB · Giants`, market value 24px tabular, delta chip (green ▲ / red ▼), 30-day sparkline.
- **The rest as the existing table**, restyled: rank, headshot, name, team·pos, value, delta chip, sparkline, and the per-row `⌗` glyph replaced by a `Source` link (opens the receipt sheet — same data the glyph shows today: capture date, feed). The empty "30-DAY —" column is **removed until data exists**; one table-footer line covers it: *"Trend lines start next week — we've been capturing daily prices for only a few days."* (replaces the "Movement history / Series pending" panel).
- "Show all 26" stays.

### 2.5 "Around the league"
- Same table pattern, top 10, **excluding players already shown in your-roster section** (today Jaxson Dart appears at #1 in both lists — fix that).
- Footer line: `Showing 10 of 458 movers league-wide · See all`.
- ENTERED/EXITED chip walls become one collapsed row: **"New to the player pool: 9 · Dropped out: 11 — show"**.

### 2.6 What leaves this page
The right-hand diagnostics rail (Partial Market Sync pane, FEED DIAGNOSTICS, RECEIPTS, Movement history) and the "Current roster context" accordion with its five repeated "Status: ok / Descriptive only / Context caveats: captured_at_vs_report_generated_at — fresh (age 0h)" blocks. Their *content* survives in two places: the **health sheet** (a right-side drawer listing each of the 9 feeds as a plain row: name in words, 🟢/🟠, "last ran 9:00 AM", one sentence when degraded — e.g. *"Price-history capture is missing 4 of the last 52 days; trend lines may have small gaps."*) and the per-number **receipt sheets**. The roster-context numbers (starting lineup value, posture, capacity) already live on the Roster surface — no duplicate here.

---

## 3 · The Player Card

Today: a page of run-together unlabeled strings (`ENGINE_BACTIVE_B77.518.4358%—15.576—`, `FantasyCalc5082Overall 30Position 112026-08-29T13:00:01.968686+00:00market_overlay_static_caveat…`) plus snake_case bullets. Redesign — **a drawer, not a page**: slides from the right on desktop (640px, Esc/X/scrim closes, URL-addressable `&player=12508`), full-screen sheet on phone with a sticky back header. The two-step "row popover → Open full evidence card" flow is cut; **a row press opens the card directly.**

Layout top to bottom, with the real Jaxson Dart data:

1. **Identity**: headshot 64px · **Jaxson Dart** 28px/700 · `QB · Giants · 22 years old` 15px secondary.
2. **The take** (17px/500, 2–3 sentences, template over existing fields):
   *"The market is hot on Dart — up 306 this month to 30th overall — and prices him higher than our model does. That gap makes him a sell-high candidate rather than a buy. Our projection leans on draft capital and age, because he has no NFL seasons on tape yet."*
3. **Three stat blocks** (32px tabular numbers, 13px labels, each pressable → receipt sheet):
   - **Market value · 5,082** — `#30 overall · QB11 · FantasyCalc, this morning`
   - **30-day change · ▲ +306** — `up 6.4%`
   - **Our projection · 15.6 PPG** — `2-year outlook · model grade 77.5` (unscored players show **"Not scored yet"** with the sentence in rule 2 below)
4. **Price history**: the sparkline at full width; until series exists, one line: *"Trend line starts next week — daily tracking began recently."*
5. **What we know / what's missing** (replaces the snake_case caveat bullets):
   - `age_not_near_position_cliff` → *"Age is on his side — years away from the typical QB decline."*
   - `Signal completeness 83% — missing: ppg_t_minus_1, ppg_t_minus_2, snap_share_t_minus_1` → *"We're missing his last two seasons of scoring and snap counts, so the projection leans harder on draft capital and age."*
   - `no_market_overlay` / `no_internal_value_signal` / `engine_b_not_decision_grade` → fold into at most **one** honesty sentence: *"Our QB model is a good second opinion, not a proven market-beater — weigh it accordingly."* (once, at the bottom, not three bullets).
   - `No counter-argument available` / `0 risk flags` → **render nothing.** Absence of content is not content.
6. **Footer**: `Where this comes from →` opens the receipt sheet: *"Market price from FantasyCalc, captured 9:00 AM today (capture time, not publish time). Projection from our active-player model, run May 31, 2026, frozen for the 2026 season — he was one of 221 of 274 rostered skill players included."* Below a divider, monospace 12px: run ID, artifact hash, git SHA, `source_timestamp_is_fetch_time_not_publish_time` explained in the sentence above rather than shown raw.

**Unscored player rule** (replaces `PRE_MODEL` / `n/a` everywhere): *"Not scored yet — [Name] joined rosters after our last model run. Market value is real; the projection stays blank until the next run."*

---

## 4 · Navigation shell

### 4.1 The left rail: 11 items → 5 destinations
| New item | Absorbs | Notes |
|---|---|---|
| **Today** | Daily What-Changed | The morning read. Default surface. |
| **Roster** | Roster Audit + Roster Capacity | One roster table (value, age outlook, projection, note) with a cut-pressure banner when over the limit; the cut list is a sort of the same table, not a second surface. |
| **Trades** | Trade Lab + League Pulse "Partner Rankings" | Trade builder plus "Who to call" partner cards. |
| **League** | League Pulse (postures + team values) | 12 team cards, not a 41,000px dump. |
| **Track record** | Model Trust + Accuracy Tracker | "How good is this thing?" in prose; the study behind a link. |

- **Rookie Board / Waiver Radar / Research Assistant "(Parked)" leave the nav entirely.** Roadmap is not product. (Open question 2 offers David a footer home for them.)
- **Project Tracker leaves the rail**; reachable at its URL for the crew.
- Rail visual: 220px, 15px labels with simple line icons, active item filled-pill highlight, no "DEVELOPER" section header.
- Bottom of rail: the health dot + one word (`All fresh` / `2 feeds behind`) → opens the health sheet. This is where system status lives from anywhere.

### 4.2 Finding a player from anywhere
- **Search field pinned at the top of the rail** (`Find a player…`, shortcut ⌘K), type-ahead over all tracked players (the 458-mover pool plus rosters), each result `name · pos · team`. Selecting opens the **player card drawer over whatever surface you're on.**
- Every player name anywhere in the product (tables, cards, trade builder, league cards) is a press target opening the same drawer.

### 4.3 Getting back
- Drawer: X, Esc, scrim press, or browser Back (drawer state in the URL).
- Surfaces are `?surface=` URLs as today; browser Back always does the expected thing. No breadcrumbs needed at one level of depth.

### 4.4 Phone (390px)
- The wrapped link-cloud header (currently the entire first screen) is replaced by a **fixed bottom tab bar** with the 5 destinations (icon + 11px label) and a top bar: `Dynasty Genius · 🔍 · 🟠`.
- Tables drop to essential columns (name, value, delta); sparkline hides under 480px; rows 52px tall; player card is a full-screen sheet.
- No page may scroll horizontally: `overflow-x: auto` on tables, wrap on chips. (Today the player card's raw strings overflow the phone viewport.)

---

## 5 · Type & density

**Scale** (system stack or current sans; monospace only inside receipt sheets):
- Overline/labels: 12–13px/600, +0.06em, sentence case (kill ALL-CAPS section heads except tiny table headers).
- **Body: 15px minimum**, 1.5 line-height. Today's 12–13px body is gone.
- Secondary/meta: 13px, `--text-dim` (but still ≥4.5:1 contrast).
- Section titles: 18px/600 sentence case. Page title: 28px/700. Hero verdict: 22px/500.
- Key numbers: 32px/700 tabular-nums (stat blocks); 15px tabular in tables.
- Table rows: min 44px desktop / 52px phone; max ~7 columns desktop, 3–4 phone.

**Color tokens** (dark canvas stays; suggested values, engineering may match existing brand):
- `--canvas #0D1117 · --panel #161B22 · --line #21262D`
- `--text #E6EDF3 · --text-dim #9BA7B4` (nothing dimmer than this for content)
- `--brand` = current amber (links, active nav, focus) · `--up #3FB950 · --down #F85149 · --warn #F5A623`
- **Kill the dim-grey-means-experimental treatment.** Model Trust and Roster Capacity currently render whole tables at near-invisible contrast; low confidence is expressed with a small tag or a sentence, never with unreadable text. Everything on screen is fully readable or not on screen.
- **Restyle all native controls** (white browser buttons/selects/checkboxes currently float on the dark canvas in Trade Lab and Roster Audit): dark filled controls, `--line` borders, `--brand` focus rings.

**What gets bigger:** the verdict, player names, the three player-card numbers, deltas, touch targets.
**What disappears:** every repeated disclaimer, every raw key, empty columns, "No X available" rows, duplicate page titles (League Pulse renders its title twice today), the per-row `⌗` glyph (becomes a `Source` link), the two-step evidence-card popover.

**Per-surface density notes**
- **Roster** (merged): columns `Player · Age · Market value · Our projection · Age outlook · Note`. Age outlook strings: `approaching_cliff (1y)` → *"Decline window ~1 yr out"*; `no_age_signal (5y)` → *"Years from age risk"*. The `Caveats: 7` count column → one worst-item word in Note, details in the card. Filter/sort bar keeps its options with restyled controls. The QB context section renders only if it has data; today's all-dashes version becomes one line: *"QB college-context data isn't wired up yet — nothing to show."* The 29-row "ATH/C/CB… range unavailable" list is deleted.
- **League**: 12 **team cards** in a grid: team name 17px/600, posture word (`Contending / Rebuilding / Rising / Middle of the pack`), one-line reason from its top signals (*"Best starters in the league and loaded at RB/WR"*), four labeled mini-bars `QB RB WR TE` (surplus→thin). Press a card → team drawer with the full numbers. "How we rate teams" link holds the honest paragraph about heuristic postures + the 60/20/15/5 weights. Page target ≤3 screens, from 46.
- **Trades**: builder as two labeled columns (`You send / You get`) using player search chips; result shows both sides priced two ways with a plain arithmetic verdict (*"By market prices you're giving up 1,240 more than you're getting; by our model it's closer to even."*) plus one honesty line: *"We price both sides — judging fit and timing is still on you."* (Open question 1 covers going further.)
- **Track record**: three prose blocks with big numbers — *"Does it beat expert consensus? Yes — tied or better in every test year."* / *"Does it beat the market? Honestly, we don't know yet — only one clean test season exists, and the market won it."* / *"Does it beat just using last year's points? Yes, by a little — real but small (+0.098, and our own bar for 'worth acting on' is 0.05)."* The fold table, gate states, CIs, run IDs move behind `Read the full study →`.

**Acceptance checklist for the crew**
1. Front page answers am-I-ok / what-moved / what-to-look-at in one viewport at 1440px and two swipes at 390px.
2. Zero underscores and zero ALL_CAPS tokens anywhere in the DOM outside receipt sheets.
3. Every number opens a receipt in ≤1 press.
4. "Descriptive only — not decision-grade" appears 0 times.
5. Any one caution appears at most once per surface.
6. All text ≥4.5:1 contrast; no native-styled form controls; no horizontal page scroll at 390px.
7. A stale or unscored state always produces a human sentence, never a dash-only surface or a raw status key.

---

## 6 · Voice guide

**Rules**
1. **Verdict first.** Lead with what it means; the number supports the sentence.
2. **Speak as "we" to "you."** *"We're missing his snap counts"*, not *"signal completeness 29%"*.
3. **Call a spade a spade.** *"Sell-high window"*, *"start with Rasheen Ali"* — allowed and expected. Honesty lives in the receipt, not in hedged prose.
4. **One caution, once, where it changes the decision.** Never a stamp, never repeated, never in a panel of its own.
5. **Numbers get names and context** (*"5,082 — 30th overall"*), dates get weekdays (*"Thursday, Aug 28"*, never ISO timestamps), and every acronym is either replaced (xVAR → *"value over replacement"*) or introduced once.
6. **Absence is silence.** "No risk flags available" and "counter-argument unavailable" render nothing.
7. **Missing data is a sentence, not a code**: say what's missing and what we do instead.
8. **No lab vocabulary on product surfaces**: artifact, capture, overlay, gate, provenance, decision-grade, diagnostic, delta-surface are banished to receipt sheets — and even there, wrapped in sentences.

**Rewrites of real strings** — see the voice examples list (12+ before→after pairs, every "before" observed on screen).

---

## 7 · Cut entirely

1. Every instance of **"Descriptive only — not decision-grade."** and **"Experimental — not decision-grade."** (counted 8 on Daily What-Changed alone).
2. The **"Attention — details inside"** badge and its raw-key popover (→ health dot + health sheet in words).
3. **FEED DIAGNOSTICS / RECEIPTS / Partial Market Sync** monospace panels on the front page (→ one freshness sentence + health sheet).
4. The **"Current roster context"** accordion with five identical "Status: ok / Context caveats: captured_at_vs_report_generated_at" blocks.
5. **Rookie Board, Waiver Radar, Research Assistant (Parked)** nav entries, and **Project Tracker** from the rail.
6. The **two-step row popover** ("4 caveats · counter-argument unavailable · Decision support only · Open full evidence card") — rows open the card directly.
7. The floating **"Inspector"** link and its ID-list popover (superseded by receipt sheets).
8. The **29-position "range unavailable"** list on Roster Capacity (ATH/C/CB/DB/DE/DEF/…).
9. The **empty 30-DAY column**, "Movement history — Series pending" panel, "No counter-argument available", "No risk flags available", "0 risk flags" rows.
10. The **dim-grey "not decision-grade" text treatment**, all native white browser controls, and the duplicate League Pulse page title.
11. On-surface **run IDs, artifact hashes, git SHAs, `decision_supported = false`, G1–G4 gate rows, "MET = point-estimate gate state, not decision support", "Promotion blocked by G3."** — all live inside `Read the full study` / receipt sheets.
12. The league-wide duplicate: roster players repeated inside "Around the league".

---

## Voice guide — before → after (real strings seen on screen)

- "Descriptive only — not decision-grade." (appears up to 8× per page) → deleted everywhere; where a caution genuinely earns its place: "Early signal — we wouldn't trade on this alone yet."
- "A daily delta surface (what changed since the prior snapshot); no verdict, no nominated move." → "What changed overnight."
- "Partial Market Sync: some inputs are being verified · Projection Update: August 29, current · Status: Degraded" → "Two of our nine overnight feeds ran a day behind, so a few market prices are from Thursday. Everything else is current as of 9:00 this morning."
- "Attention — details inside" → "🟠 Two feeds a day behind — details" (green mornings: "🟢 All feeds ran on time — prices as of 9:00 this morning.")
- "Projections held steady — no player movement on this tape." → "Our projections didn't move today. Everything below is the market talking."
- "Price-discovery deltas — market overlay only, isolated from model output." → "Market prices — what the dynasty market is paying, separate from our projections."
- "Movement history — Series pending. History accrues one verified capture per day; the line begins once enough days are on the books." → "Trend lines start next week — we've been capturing daily prices for only a few days."
- "Total capacity cuts required 1 / Active slot overflow 1" → "You're one player over the roster limit — one cut is due before kickoff."
- "Candidates sorted by cut exposure rank as diagnostic order — not a cut sequence." → "If you have to cut someone, start at the top of this list — it's sorted most-expendable first."
- "thin_unrostered_pool_below_min_4 / valuation_coverage_below_floor" → "Heads up: the waiver pool is thin and some prices are missing right now, so these value figures are rougher than usual."
- "PRE_MODEL" / "Model status: n/a" → "Not scored yet — joined rosters after our last model run. Market value is real; the projection stays blank until the next run."
- "no_age_signal (5y)" → "Years from age risk."  ·  "approaching_cliff (1y)" → "Decline window about a year out."
- "ENGINE_BACTIVE_B77.518.4358%—15.576—" (player card, one run-together string) → "Our projection: 15.6 points per game (2-year outlook) · model grade 77.5"
- "FantasyCalc5082Overall 30Position 112026-08-29T13:00:01.968686+00:00market_overlay_static_caveatsource_timestamp_is_fetch_time_not_publish_time" → "Market value 5,082 — 30th overall, 11th among QBs · FantasyCalc, this morning" (capture-time nuance moves to the receipt sheet as a sentence)
- "Signal completeness 83% — missing: ppg_t_minus_1, ppg_t_minus_2, snap_share_t_minus_1" → "We're missing his last two seasons of scoring and snap counts, so this projection leans harder on draft capital and age."
- "Consensus-competitive, edge unproven… per-fold NDCG-diff bootstrap CIs include zero. decision_supported = false … Promotion blocked by G3." → "Honest read: our QB model ranks players about as well as expert consensus, but hasn't proven it beats the market. Treat it as a sharp second opinion, not an oracle."
- "We cannot say yet whether the QB model beats the market. Only 1 of 4 test seasons produced a usable model-versus-market comparison…" → "Does it beat the market? Honestly, we don't know yet — only one clean test season exists, and the market won it. More seasons will settle this."
- "EXPERIMENTAL — a read-only league snapshot. Diagnostic Workspace: Surfaces raw model outputs and market variance. Valuation data is descriptive only, does not nominate players or direct trades, and requires manual qualitative evaluation." → "Your league at a glance — who's contending, who's rebuilding, and who to call."
- "YippeKiYay MarshalFaulker · partner_score 2.091 · complementarity_score 0.84 · perspective_posture REBUILDING · counterparty_posture CONTENDER" → "Your best trade partner: YippeKiYay MarshalFaulker. They're contending, you're rebuilding, and they're deep exactly where you're thin — RB and WR."
- "Tank DellWRValuation Unavailable - evaluate qualitatively" → "Tank Dell — no price available right now; judge this one yourself."
- "Realized-outcome loop inactive — 2026 data accrues from September. Reason: awaiting_first_finalized_week · Settlement status: unsettled · Data maturity: not yet started" → "The scoreboard starts at Week 1. Once real games are played, we'll grade every projection right here."
- "degraded · core data affected · 9 reports: 6 fresh · 2 stale · roster_capacity: live_precondition_not_ok:capture_health_ok=degraded; …" → health sheet rows in words: "🟠 Price-history capture — missing 4 of the last 52 days; trend lines may have small gaps. · 🟢 Market feed — ran 9:00 AM."


## Open questions for David

- Trade verdicts — how far do you want the spade called? Minimum (already in spec): plain arithmetic on both pricings — "by market prices you're giving up 1,240 more than you get; by our model it's closer to even." Further: a single blended "take this deal / pass" imperative, which requires you to bless how market and model are weighed against each other when they disagree. Which one?
- The three parked surfaces (Rookie Board, Waiver Radar, Research Assistant) and Project Tracker leave the navigation in this spec. Should they vanish entirely (reachable only by URL), or do you want one small "In the shop" page in the footer that lists what's parked and why?
- Movement colors: the spec introduces green-up / red-down for deltas alongside the amber brand accent, replacing today's all-amber tape. Fine, or do you prefer keeping a single-accent look?
- Phone investment: the spec includes a bottom-tab app shell at 390px. Do you actually check this on your phone often enough to build that now, or should the crew ship desktop-first and leave phone as "readable, not tailored"?
- Front-page name: the default surface is called "Today" in the nav with "Morning read" as its on-page overline. Happy with those words, or do you want your own?
