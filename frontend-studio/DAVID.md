# DAVID.md — Standing feedback from the client

This file is Studio's highest-authority guidance short of the hard constraints in the product
briefing. David's time is scarce; when he spends it giving feedback, that feedback outlives the
session that received it. Read this file at every session start, immediately after
PRODUCT_BRIEFING.md. When David gives feedback — in this pane or relayed — distill it into a dated
entry here (the rule, not the transcript). Never delete an entry; if a later ruling supersedes an
earlier one, mark the old one superseded and link them.

## Standing directives

- **2026-07-14 — Relay briefs.** Every proposal ships with an engineer-facing `NNN-RELAY.md`:
  verifiable claims, exact repro paths, observed vs. expected, user cost, severity-ranked, each item
  ending with "confirm, fix, or refute with a concrete technical reason." Direct and unsoftened.
  No speculation about the engineering team's internal rules.
- **2026-07-14 — Summary block, no meta.** Each RELAY opens with a plain summary table (ID,
  seven-word summary, severity) — only compressed body content, nothing meta, because engineers
  read that file.
- **2026-07-14 — David-only commentary goes to the pane, not files.** Contested-territory flags,
  sequencing advice, what's being held for later: print it in the pane when handing David a
  proposal. He reads it live. Durable lessons go here; ephemeral notes go on screen.
- **2026-07-14 — David reads selectively; his feedback is law.** He may not read every document
  end-to-end. Write everything skimmable (summaries first, bodies after). When he does invest the
  time to respond, treat the substance in extremely high regard: record it here, apply it from then
  on, and never require him to say it twice.
- **2026-07-14 — Credibility sequencing.** Lead engagements with objectively verifiable defects;
  hold doctrine-adjacent arguments (tone, disclaimers-vs-confidence) until credibility is banked
  from confirmed findings. (David endorsed this sequencing for the first relay.)

- **2026-07-15 — The last-line flag.** When a handoff ends in something only David can do (a
  ruling, an approval, a review), the final line of the pane message — with nothing after it — is
  exactly: `>>> DAVID: <the action, one plain sentence>`. The bottom of the pane always shows
  either work in progress or the one thing he owes. (Replaced a same-day instruction to append to a
  shared NEEDS-DAVID.md queue file, rescinded before first use — do not write to ~/cockpit/.)

- **2026-07-15 — David is never pointed at files.** File paths in messages to David are a protocol
  violation. Files are for engineers; David gets *shown and told*: open the artifact in his browser
  yourself, then print a plain-English pitch in the pane — ten lines or fewer: what's broken, what's
  proposed, what the artifact on his screen demonstrates, what it costs, and the ONE question his
  reaction is wanted on. An approval given before he has seen the work is void — real approval
  follows delivery.

- **2026-07-15 — Delivery format CONFIRMED.** David reacted to the 001 re-delivery: browser-open of
  the artifact + plain-English pitch in the pane + one question is the *proven standard* for all
  design deliveries, not an experiment. He explicitly liked the browser-open. (Confirms and
  operationalizes the "never pointed at files" entry above.)

- **2026-07-15 — Tray over sidebar.** David prefers a bottom tray to a side drawer for detail
  surfaces: a tray leaves the page readable around it; a sidebar "becomes the only focal point."
  **How to apply:** default detail surfaces to trays that coexist with the page, not panels that
  replace it.
- **2026-07-15 — Detail space must earn its keep.** Restating the movement (delta, rank, trend
  chart) in a bigger box is "good but not hugely valuable." The extra space must carry metrics that
  *improve his analysis* — context that changes how he reads the number, not the number again,
  larger. **How to apply:** for every detail surface, ask "what does this let him conclude that the
  row didn't?" — if the answer is nothing, the metric doesn't ship.

- **2026-07-15 — Baseball Savant is a reference point.** David rates Savant player pages
  (baseballsavant.mlb.com) highly despite their overload — especially the visualization formats.
  **How to apply:** translate, don't copy — percentile-slider profiles, identity-dense bio headers
  (age, draft capital), and movement context are the transferable pieces for dynasty; explore
  depth-chart movement (currently dropped by the app's data normalizer — engineering ask) as a
  football-specific analog. First taste shipped in the 001 tray (DVS 0–100 track, draft-capital
  bio line).

- **2026-07-15 — Detail expands inline, in the row.** Supersedes the tray preference (which
  superseded the sidebar): even the bottom tray "is still a space eater." The proven direction:
  click a row → it expands in place and pushes the next row down. Detail is attached to its row,
  overlays nothing, and closes back into the flow. **How to apply:** accordion rows are the default
  detail pattern everywhere.
- **2026-07-15 — The metrics bar: production against expectation, across a season.** Movement math
  (deltas, ranges, multiples of median move) is better but still not the value. What David analyzes:
  how a season progresses game by game — target share, YPRR, stats, depth-chart movement — and
  whether a player is approaching the production his model score (DVS) implies. Three lenses to
  design in: **Fantasy football** (points vs. expectation), **real football** (usage and role),
  **dynasty** (value trajectory vs. model view). Use the advanced stats available, and make it
  digestible intuitively. **How to apply:** every player detail surface should answer "is his role
  and production converging on what his valuation implies?" — season-scale first, day-scale second.

- **2026-07-15 — Grounding doctrine (the Savant screenshot).** DG's proprietary numbers (DVS, xVAR,
  values) are "too abstract to provide any value" without a comparison population. The ladder:
  **Rank** (simplest) → **Tiers** (next) → **percentile vs. the league, one aligned bar per metric,
  raw value beside it** (Savant's device: every advanced stat readable three ways — raw, percentile,
  visual position). **How to apply:** no proprietary number ships without its population context;
  percentile bars use length + lane hue, never poor/great verdict coloring (that part of Savant
  does not translate — it's verdict framing).

- **2026-07-15 — David gives framing, not specs.** When he references an app or a metric ladder,
  he is handing over real-life user context to think with — not a feature list to transcribe.
  **How to apply:** treat his references as lenses; do the design reasoning independently, research
  real-world apps and dynasty sites proactively before proposing, and don't wait for permission to
  look outward.
- **2026-07-15 — Grounding rulings.** Position group confirmed as the right percentile population.
  Raw source tiers (FantasyCalc's 43 fine-grained tiers) rejected — a tier must match the coarse
  real-world meaning dynasty players use, or carry names (comparables) that make it concrete.

- **2026-07-15 — Tiers are prose, and tier-mates stay.** Numbered tiers ("3 of 9") rejected: "I have
  no idea what 1–9 means." Tiers must carry the fantasy world's own words — Generational, Elite, and
  the ladder below them — researched from real dynasty usage, not invented. Naming the other players
  in the tier is confirmed as "a great call" — keep it. **How to apply:** every tier surface uses a
  named ladder; the names ground the label.
- **2026-07-15 — Next grounding axis: recent production vs. position group.** Where a player ranks
  matters, and so does how he has actually performed against his position group recently. **How to
  apply:** pair every valuation/rank readout with a realized-production readout (PPG percentile vs.
  position, recent window); research the data path before designing.

- **2026-07-15 — Our tier vs. market tier.** Show the model's prose tier next to the market's prose
  tier — the two-lane thesis spoken in dynasty language ("market prices him high-end WR2; the model
  sees a mid WR1"). Requires ranking the full modeled population, not just tape players.
- **2026-07-15 — Week-over-week production.** Production grounding must become a weekly series, not
  a season aggregate — how the season is progressing, week by week, vs. the position group. "Think
  about the real life analysis": the Tuesday-morning question is what last week's game changed.

- **2026-07-15 — APPROVED: the grounded analysis layer (001 final direction).** David: "I really
  like this... exactly the kind of comparison that creates value for me." Confirmed elements:
  market-vs-model prose tiers side by side; the model-expectation line over weekly production
  ("I don't think the PPG prediction is a big problem" — he is open to iterating its form, not
  removing it); percentile bars vs. position group; value-adjacent names. **Prose tier ladder is
  mandatory** — make it statistically sound and representative, but it must be prose. Direction
  memorialized in the 001 package; iteration continues from there, not from scratch.

- **2026-07-15 — Relays go through Tower.** When a proposal needs relaying to the engineers, hand
  David the *decision*, not the task: the ask is "tell Tower to relay it" (Tower, the agent in the
  adjacent pane, does the tmux delivery and sends a mechanical acknowledgment when it has crossed).
  Include the exact one-line relay text in the pitch as a manual fallback. **Never assume a relay
  happened until Tower's ack arrives.** (001 crossed by David's own hand before this protocol took
  effect; engineers verifying as of 2026-07-15.)

- **2026-07-15 — Rank is the default lens, everywhere.** Player rank (overall and positional) is
  fantasy's biggest metric. Default sort = rank, highest first — never size-of-move. The far-left
  column is the rank number with its change beside it (green ▲N up / red ▼N down — David's explicit
  spec; rank movement uses the fantasy-standard idiom). All columns sortable. A list position that
  isn't the rank (e.g., "23" by move size next to "#13 overall") is a confusion generator.
- **2026-07-15 — The product mission, in order.** (1) Rank players with a deeply analytical model.
  (2) Display OUR rankings in comparison to the market — "this is the one we seem to be struggling
  with." Every panel leads with that comparison, in rank-space, before anything else.
- **2026-07-15 — Speak the market's language; normalize our outputs.** Don't mix scales in one read
  (percentile bars + 0–100 DVS + raw values = "ALL OVER THE PLACE"). Copy basic structures/layouts/
  prose from the best dynasty sites (Dynasty Nerds, KTC, Sleeper) without fear. Challenge the
  engineers to normalize model outputs into market-comparable space (rank-space first) so our work
  reads in the hobby's units. DVS and xVAR are detail-line facts, not headline scales.

- **2026-07-15 — Design from the question ladder, not the data.** The structure must mirror how the
  mind's eye works: what questions would David ask, in what order — "what's the overall rank of all
  my players → what's the rank by position → for a player I want to analyze, what data can I study
  and what trends need visualizing" — and every UI/UX decision must be the answer to a specific
  question in that ladder. Iterating visuals without the journey map produces "directionally
  correct" but structurally scrambled screens. **How to apply:** before any surface design, write
  the question ladder; map each module to the question it answers; study how the reference sites'
  page architecture answers the same ladder. State (rankings) comes before change (movement) —
  fantasy sites lead with ranked state and annotate change onto it.

- **2026-07-15 — The ladder's order is a dynasty-strategy question, not a UX preference.** Which
  questions get answered first and most frequently must be decided by what matters most in dynasty
  fantasy football — and that differs between rebuild and contend phases (and off-season vs.
  in-season). Deep research into dynasty strategy comes before the IA decision. David's team is
  currently REBUILDING — the default experience should serve that phase first but the architecture
  must accommodate the phase shifting.

- **2026-07-15 — Session close (night of Jul 14→15).** Parked by David via Tower: **tomorrow's
  first design review = the state-first restructured default screen** (roster-ranked with position
  strip, already built in the 001 prototype; open it in his browser, pitch, one question). The
  architecture research verdict to carry: every reference product leads with ranked STATE and
  annotates change; analytics products group rosters by position. Dynasty-strategy deep research
  (rebuild-vs-contend priority ladder) left running overnight — synthesize into the question-ladder
  document before the review; module order is not final until it lands.

- **2026-07-15 — Filters and sort, not tabs.** Views are filter + sort states over one queryable
  list, not separate tabs/widgets. "Available free agents" = an availability filter; "top movers" =
  a sort by move. **How to apply:** default to a single list with filter chips and sortable columns
  wherever multiple "views" of the same population are wanted.

- **2026-07-15 — Copy the category's structure; our data is the juxtaposition.** Don't invent
  structure where a category convention exists. Build surfaces the way KTC/FantasyCalc/Sleeper
  users already know them (rank | player | pos·age | tier | trend | value; overview→graph→neighbors
  player anatomy; risers rail beside rankings), then overlay DG's model as the visible second lane —
  model rank beside market rank, expectation line on the standard graph, divergence as the
  highlight. Familiarity is the substrate that makes our insight legible; originality budget is
  spent ONLY on the juxtaposition itself. (Studio conceded a craft bias here — decorrelation from
  the in-house team's doctrine must not become decorrelation from the market's conventions.)

- **2026-07-15 — Ration David's attention.** One design question per review ritual, never a stream.
  NEVER ask him to sequence Studio's own work (apply-now-or-later, which-draft-first): make the
  call, note it in one line, present the result — he redirects if he disagrees. When Tower opens
  the cockpit board, park all pending asks with Tower and send David nothing until Tower announces
  the board is clear.

- **2026-07-15 — Session close (midday).** Morning's rulings all recorded above (rank-first default
  confirmed on screen; filters/sorts over tabs; copy-the-category/juxtaposition doctrine; ration
  David's attention — one question per review, never sequencing asks; board discipline via Tower).
  One boundary lesson: Studio attempted to read the app server's process environment to extract the
  Sleeper league id for a live free-agent verification — correctly blocked; the live-ownership
  check belongs to engineering (001b N7) or to David's own ten-second Sleeper glance. Open threads
  parked for tomorrow's brief: (1) combined design review — universe list w/ model-rank column +
  question ladder (S1 on Tower's board); (2) 001b relay approval (S2, decision-ready); (3)
  engineering verdicts on 000/001 still outbound; (4) Bo Nix live verification (market QB12 /
  model QB4 / FA as of Jun 23 data).

- **2026-07-15 — Plain English in the pane, always.** Studio's language drifts toward internal
  codenames one session after reset. In messages to David, no internal shorthand ("ladder doc",
  "001b addendum", "rank-led rebuild") without an immediate five-word translation. David should
  never need a glossary for his own designer. **How to apply:** every codename in pane text carries
  its plain meaning in the same sentence, every session, no exceptions.
- **2026-07-15 — Never use decided language about undecided work.** Studio wrote "module order is
  final" before David had reacted — false. Nothing is final until David reacts; Studio's documents
  are proposals, and his review is where finality comes from. **How to apply:** pre-review status
  vocabulary is "drafted / proposed / ready for review"; "final / confirmed / decided" is reserved
  for what David has explicitly ruled on.

- **2026-07-15 — APPROVED: the state-first default screen (morning review).** The rebuilt default
  screen — the roster as one rank-ordered table (best player first, rank far-left with change
  arrows), position summary cards above it, big movers demoted to a secondary view — reviewed live
  and approved: "looks better… yes I think this is logical." David also greenlit sending the 001b
  engineering brief (rank-first defaults + the ask that the model publish rankings comparable to
  market rankings); relay goes through Tower, unconfirmed until Tower's acknowledgment.

- **2026-07-15 — League data must refresh frequently (client requirement).** David, on learning the
  app's Sleeper league snapshot (rosters, ownership, team postures) was 22 days old: "we have to
  have frequent refreshes of our league data." Stale league artifacts are defects, not caveats.
  **How to apply:** treat artifact age as a first-class critique dimension on every surface Studio
  reviews; any proposal built on league data states the data's age; relayed to engineering as 003
  (F1–F4: schedule the snapshot capture, refresh the derivation chain, show age on-surface).

- **2026-07-21 — A market move alone is not actionable; the juxtaposition is the product.** David on
  the 004 noise-floor pitch: "a player could move after a big week, or after an injury to someone
  ahead of him on the depth chart, or after earning a starting role — but should I really be ACTING
  on those signals?" He can get the *cause* of a move from anywhere. **How to apply:** detecting that
  the market moved is a filter, never a headline. The headline must be what only this app knows —
  whether that move carried the market *toward* our model's view or *away* from it. Any surface whose
  top-line finding is "the market did something" is incomplete by construction.
- **2026-07-21 — Our rank/value beside the market's, on every surface — restated after a miss.**
  David: "it's important that we show a juxtaposition of our rank or value compared to the market
  rank or value, otherwise I wouldn't know if we agree or disagree with the signals." Studio shipped
  a market-only surface and had to be told this a second time (it was already standing doctrine from
  2026-07-15, "the product mission, in order"). **How to apply:** before pitching any surface, check
  that both lanes are present and that the comparison *leads*. A market-only panel does not leave
  this lane again.
- **2026-07-21 — A dense hero visual must separate, or it doesn't ship.** On the 404-player jittered
  strip: "the top header is cool but the plots are indistinguishable — needs a lot of re-thinking if
  it's gonna stay." **How to apply:** overplotting is a failure, not a texture. If the reader cannot
  pick individual marks out of the mass, either change the form so the data separates (more
  dimensions, faceting, filtering to what matters) or cut the visual. "Looks impressive at a glance"
  is not a defence.

- **2026-07-21 — Instrument, don't editorialize. David reads the anomalies himself.** On the v2
  headline naming a single player: "it still feels like we're making a HUGE statement about one
  player at the top — what if there's not an outlier and it's just a normal day or week? Are we
  still going to have a huge headline about a player that barely moved? I'd think a more consistent
  approach to that section would be just as valuable — **consistent color coding and ways to show the
  shape of the data over time. I'll recognize the anomalies and outliers — I just need the mechanism
  and design so I can see it.**" **How to apply:** a summary region must render the *same shape every
  day* regardless of whether anything happened. Never let the design manufacture a protagonist on a
  quiet day. Prefer a stable instrument — fixed layout, fixed encoding learned once, all entities
  shown, shared scales, time on the x-axis — over a variable narrative headline. Ranking/ordering
  rules are fine because they are stable; prose that changes its subject daily is not. This is the
  Baseball Savant lineage he already endorsed: Savant never tells you who matters, it renders every
  player identically and lets the reader see it.
  **Studio's own trap, noted:** 004 v1 correctly criticised the app's "52 moves on the tape" for
  manufacturing significance, then v2 committed the same error in prose form. Check new designs
  against the critique they were built from.

- **2026-07-21 — Measure where the variance lives BEFORE choosing an axis. (Studio method rule,
  self-corrected.)** Across 004, three of four attempts failed for one underlying reason: Studio
  encoded a variable that barely varied, or let copy assert significance the data did not support.
  The v3 small-multiples spent every card's vertical axis on gap-over-time, where a player's gap
  travels a median of **3.9 points**, while the spread of gaps *across players* is **40** — a tenth
  of the signal, drawn 23 times. David: *"all the trend lines are flat… the design is largely hiding
  anything of value in the data."*
  **The diagnostic that catches it:** if the most important finding in a dataset arrives via a table
  printed in a terminal rather than out of the visualisation, the visualisation is wrong. (004's
  position skew did exactly that.)
  **How to apply:** before picking a chart form, compute the dispersion of every candidate dimension
  — across time, across entities, across categories — and give the display's dominant axis to the
  largest. Do it first, not fourth. Report a flat dimension in one honest sentence instead of
  plotting it repeatedly.

- **2026-07-21 — KEPT: the position-faceted model-vs-market view (004 v4).** David, after three
  rejections in one session: *"ok this is pretty cool - we can keep this and iterate later on."*
  Kept, not finished — this is a park, not a sign-off, and no relay was authorised in the same
  breath. Confirmed elements: the four position panels (our percentile against the market's, with an
  agreement diagonal), roster drawn bright over a dimmed league, the fixed state strip above it, and
  time removed from the overview in favour of the per-player drill-down.
  **The lesson that got there:** three of Studio's four attempts failed for the same underlying
  reason — encoding a variable that barely varies, or letting copy assert significance the data did
  not support. The fix each time was to measure where the variance actually lived before choosing an
  axis. Do that first, not fourth.

- **2026-07-22 — The front door is STATE, not CHANGE. Reset endorsed by David.** After two rejected
  attempts to fix the overnight-change surface, David pulled Studio to a blank canvas: *"should
  [overnight change] be the opening page?"* Studio's answer, which he endorsed ("a better flow… you're
  onto something… I like your thinking and proposal"): the opening page should be **the state of the
  franchise** — where you stand, what you hold, what it implies — not a change log. The realization
  that unlocked it: **Studio had inherited the app's own framing** (its default screen is "Daily
  What-Changed") and spent the entire engagement — 001 morning tape, 004 noise floor, 005 — polishing
  a *monitoring feed* as if it were the front door. That is the shared blind spot the engagement
  exists to break, absorbed from the product itself. **The question ladder, most foundational first:**
  (1) Where do I stand? — phase (contend/rebuild/stuck), roster value vs the other 11, positional
  strength/weakness, QB in Superflex. (2) What do I hold? — each asset's value ours-vs-market and its
  trajectory (ascending/peak/declining), sell-windows, dead weight. (3) What should I do? — convert
  aging vets to picks/youth (the rebuild's whole job), fix a hole, trade-partner fit. (4) What's
  changing? — the market/news feed; **this is where overnight-change belongs, #4 not #1**. (5) Is the
  model any good? — the backtest, occasional. **How to apply:** every serious product in the category
  opens on state and exiles change to a rail (KTC/FantasyCalc risers-fallers sidebar; ESPN/Sleeper
  open on your team). Design the front door as orientation for a rebuilder around his timeline; the
  daily-change work Studio already did is a feed on that page, not the page.

- **2026-07-22 — Studio missed twice in one session (005 v1 and v2); the systemic causes, named by
  David.** After v2 he called it "really bad… an awful visual experience," with three specific
  faults, each tracing to a ruling already in this file:
  1. **Two long lists.** The roster module and the full board are two parallel lists — a direct
     violation of *2026-07-15 filters-and-sort-not-tabs* (views are filter+sort states over ONE
     list). "My roster" was **already a filter chip** on the full board; Studio built a redundant
     second list instead of defaulting the one list to that filter.
  2. **No interactivity.** The daily list can't be clicked — a dead end — violating *2026-07-15
     detail-expands-inline-in-the-row* (accordion rows are the default everywhere). He can't
     investigate a player he cares about.
  3. **Drift column backwards.** The toward-you/pulling-away tag colored model/market hues with a
     good/bad valence — verdict coloring, forbidden — AND the metric ("gap to our model narrowing")
     bundled opposite real outcomes: a player tagged "toward you / blue / reassuring" was often one
     whose market value was *falling*. The thing he feels is his asset's own market movement, not its
     distance from our model.
  **How to apply, going forward:**
  - **Check every surface against the standing rulings in this file BEFORE building, not after.** All
    three faults were pre-ruled. Studio has the rules and still shipped against them.
  - **Validate the interaction model cheaply first** — a rough sketch + one question — before pulling
    340 players, 29 days of history, and polishing SVGs. Studio over-built two heavy artifacts on an
    unvalidated concept. Small verified steps (David's global standing instruction), not big reveals.
  - **Separate the two hats.** Critic findings (frozen model, no published rank, superflex
    contamination) are *engineering relays*. The daily surface is *design for the user*. Studio keeps
    smuggling critic findings into the user surface (the two-boards diagnostic module was a critique
    dressed as a user module).
  - **One list, filterable and sortable, with inline row expansion.** That was the answer the whole
    time and it was already half-built.

- **2026-07-22 — Design from the daily job, not from where the variance lives (005 v1→v2).** Studio
  built a surface around the axis with the most statistical variance (age), producing anonymous
  scatter panels David couldn't read ("who are the players in blue vs orange? who is the filled
  dot?") and a top module whose value was unclear. His instruction: *"think about the real-life
  usage of this product — think about what I should be analyzing every day."* **How to apply:** the
  question ladder (2026-07-15) is the design input, not the variance decomposition. A statistically
  real pattern is not automatically a daily tool — the age gradient is a learn-it-once insight, not
  something he checks each morning. Lead with named entities on his roster, not anonymous marks of
  the whole population. **The load-bearing finding:** a raw model-vs-market gap sort is mostly an
  age sort (our "market is sleeping, buy low" list came out as 30–35-year-olds), so the naive
  juxtaposition is an artifact for a rebuilder; compare *within position* where age washes out, and
  make the daily read his own roster with a market-drift (toward/away) annotation.

## Rulings on escalations

- **2026-07-15 — Green/red vs. the color rules (N3, first escalation): David ruled for the idiom,
  scoped.** Green ▲ / red ▼ is legal for **rank-movement arrows only** — never for value, gap,
  margin, or tier hues; the moment green/red reads as worth or quality rather than pure positional
  movement, it is outside the ruling. (Ruling delivered via the engineering side; boundary is
  hard.) **Implication:** Studio designs rank chips in the idiom freely and keeps every other
  encoding in the neutral palette.
