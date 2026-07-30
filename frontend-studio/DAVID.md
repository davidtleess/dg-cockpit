# DAVID.md — Standing feedback from the client

This file is Studio's highest-authority guidance short of the hard constraints in the product
briefing. David's time is scarce; when he spends it giving feedback, that feedback outlives the
session that received it. Read this file at every session start, immediately after
PRODUCT_BRIEFING.md. When David gives feedback — in this pane or relayed — distill it into a dated
entry here (the rule, not the transcript). Never delete an entry; if a later ruling supersedes an
earlier one, mark the old one superseded and link them.

## Standing directives

- **2026-07-22 — THE GOVERNING METHOD (David: "I love this — think like this every session").**
  Every surface starts from a blank canvas and the manager's real questions, never from the data or
  from a prior artifact. The test each surface must pass: **does it carry a thesis about the user's
  situation, or does it merely display his data?** A verdict ("rebuilding, at the bottom, but young
  and stocked"), a portfolio with roles ("your tradeable surplus: 14 WRs"), a point of view — not a
  neutral table, chart, or rank list. Apply this lens to **every region**, not just the top-level
  architecture; re-derive each one from the question it answers. Reused pieces earn their place only
  by answering a re-derived question — never by having "sound guts." Tools (sortable grids, raw
  lists) may exist as secondary views, never as a region's default. When in doubt, do the
  blank-canvas exercise: what would a dynasty manager actually ask here, in what order, and what is
  the honest answer that changes what he does? This is the highest-value thing Studio does; when it
  is skipped, the work gets rejected (see the 005 rejections and the 006 reset below).

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

- **2026-07-22 — Team/roster pages group and sort by POSITION, in the order QB → RB → WR → TE.**
  David, explicit "do not forget": this is the core organizing structure of every team page in the
  category (ESPN, Sleeper, Yahoo all group the roster by position in lineup order). It is the default
  skeleton for "what you hold" — not role-based groups, not a flat rank list. **How it marries the
  portfolio thesis (2026-07-22 governing method):** position groups are the *vehicle* for the thesis,
  not a replacement for it — the roster-construction insight is inherently positional ("14 WR = your
  tradeable surplus; 3 TE = the hole; 5 young QB none market-trusts = the bet"), so the group headers
  carry it. Role (core/ascending/sell-window/cut) and trajectory become per-player annotations and
  sorts *within* each position group. Ties directly to *2026-07-15 copy-the-category's-structure*:
  position grouping is the familiar substrate; our model-vs-market and the roster-shape verdict are
  the juxtaposition laid over it.

- **2026-07-23 — A prescription carries a FAR higher bar than a description; a shallow recommendation
  is unacceptable and worse than none.** Studio put "sell Garrett Wilson" on the board reasoned only
  from "you have 14 WRs." David: a recommendation that strong "MUST consider EVERYTHING" — age cliff
  vs the rest of the roster's window (will he still produce when your core peaks?), is his value at an
  all-time high and far above where we value him, replacement value, etc. The Wilson case was
  indefensible on every axis: **our model doesn't even cover him** (no view to sell from), his market
  rank was near its 29-day *low* not a high, the window argued *hold* (at 25 he peaks ~27-29, right
  when the 22.5-median core arrives), and he's the roster's best WR. **How to apply:** never surface
  a buy/sell/cut verdict unless the deep analysis genuinely and unambiguously supports it AND the
  reasoning is shown. Default to **decision support, not decision making** — assemble the real case
  (window alignment, our-view-vs-market, value trajectory over available history, replacement depth)
  and let David rule. This independently rediscovers the app's own descriptive doctrine (it never
  renders buy/sell verdicts) — a shallow prescription is dangerous because he might act on it. Honest
  data limits to state whenever relevant: market history is only ~29 days (no "all-time" high
  visible); replacement values are partly unavailable in the app.
  **The dial David set (2026-07-23):** "lean HEAVILY on the decision data — the evidence, the
  combination of factors, the reasoning — then you may have some softer earned tagging, not
  prescription." Built as evidence cards: per decision, a factor grid (window / our-view-vs-market /
  value-now / replacement) + a "The read" synthesis + a soft, un-colored lean tag ("lean: hold",
  "lean: cut candidate", "unresolved"). The tag is a lean the visible evidence earns, never a command;
  never colored as a verdict. Delivered 2026-07-23; **CONFIRMED by David 2026-07-23: "calls worth
  weighing looks solid. something we can build upon."** The decision-support-not-decision-making frame
  is now the settled pattern for surfacing any call. "Build upon," not "ship" — a foundation to extend
  in small validated steps, not yet relayed to engineering. With this reaction the full "State of your
  franchise" front door is approved in principle region by region (hero + positional shape 2026-07-22;
  position groups + dumbbell + percentile-bars 2026-07-22; evidence cards now; feed demoted). The high
  bar holds on every extension: a lean must be earned by shown evidence, never asserted.

- **2026-07-23 — Rank scales run best=RIGHT, worst=left (#1 at the far right).** David caught the
  dumbbell built backwards (I had #1 on the left). The convention — the Baseball Savant one he
  endorses — is that on any left-right ranking/percentile axis, better is further right; the #1
  player sits at the far right, depth on the left. **How to apply:** every spatial rank or percentile
  axis puts elite on the right. (Distinct from a ranking *table*, where the rank column is far-left
  and #1 is the top row — that stays; this is about the horizontal viz axis only.)

- **2026-07-22 — APPROVED: the "State of your franchise" front door (006) and its design vocabulary.**
  David: "this is awesome — great updates," after a front door that opens on STATE (franchise verdict
  + standing vs league + positional-shape bars), then "what you hold" as position groups QB→RB→WR→TE
  each led by a thesis header, rows expanding to the July-15 player card. Two confirmed-good mechanics
  to reuse, not reinvent:
  1. **Dumbbell for our-rank-vs-market-rank** — one horizontal track per row on the position's pool
     scale, **best on the left**, our rank a blue dot, market a amber dot, the connector = the
     disagreement. Shows standing (how elite) and disagreement (how far apart) in one scannable mark.
     This replaced an abstract centre-diverging "gap bar" that David said "wasn't speaking." Use the
     dumbbell whenever two boards' ranks are compared in a row.
  2. **Percentile-bar + raw-rank, never both numbers** — a lane's bar length carries the percentile,
     the number at its end is the raw rank; the second number (the "85th") is dropped. David rejected
     the 4-number version (percentile AND rank, twice) — "we could use just 2." Overall rank goes into
     prose, not another number cell. General rule: a value gets one visual + one number, never two
     numbers for the same thing.

- **2026-07-22 — Apply the blank-canvas lens to EVERY region; never blanket-reuse a rejected
  artifact.** When Studio proposed slotting the rejected ranked list straight back into "what you
  hold," David: *"use the same lens as you just did with the blank canvas before blanketedly throwing
  it back in there — it didn't blow my mind last time."* The rank table (our rank vs market, sortable,
  per player) is a **reference lookup with no point of view** — that is why it never landed. **How to
  apply:** re-derive each region from the manager's real questions the way the front-door ladder was
  derived. Every surface must carry a *thesis about the user's situation*, not merely display his
  data — the hero renders a verdict ("rebuilding, at the bottom, but young and stocked"); a ranked
  table renders nothing. Reused pieces earn their place by answering a re-derived question, not by
  having "sound guts." A tool (sortable grid) can exist, but it is never the default view of a region.
- **2026-07-22 — Hero voice: measured-honest middle.** Not brutal ("dead last, at the bottom"), not
  soft — honest with some spine. (Settled the 006 hero tone question.)

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

- **2026-07-23 — ACCURACY CORRECTION (via Tower): "deepen the evidence" was NOT David's choice.** The
  option Studio presented in its build-upon question menu was selected by a **stray Tower keystroke**,
  not by David. David is fine with Studio having pursued it — the deepened evidence-cards prototype is
  kept — but it must be presented at review as **Studio's own proposal for his reaction, not a
  direction he chose.** David ruled on nothing at the fork; only his "calls worth weighing looks solid,
  something we can build upon" reaction is real. **How to apply:** a menu selection is not a ruling.
  Never attribute a direction to David unless he stated it in his own words; present self-initiated work
  as a proposal and hold decided-language until he reacts (reinforces *2026-07-15 never use decided
  language about undecided work*). Studio's own records were corrected the same day.

- **2026-07-23 — 004 verdicts (via Tower, David ruled).** Dispositions logged at the foot of
  `004-RELAY.md`. The load-bearing outcomes: **N1+N4 CONFIRMED as one design problem now Studio's to
  take forward** — ranking daily moves by raw dollars buries big percentage moves on cheap players, and
  per-row sparklines auto-scale independently so rows can't be compared; design what deserves attention
  on the tape and how to keep magnitude comparable across rows, and prototype it (no rush, queues behind
  engineering). **N0 positional-skew pattern is real but Studio's Superflex-baseline CAUSE is REFUTED**
  (a ranking-pool artifact; the model does **not** mis-value QBs) — retract the cause. **N2
  (displayTrend) CLOSED** — deliberate, documented; retract. **N3 CONFIRMED and worse than framed**
  (count sums rendered list lengths, double-counts, includes non-movers — 52 shown vs 448 actual);
  **N6 CONFIRMED trivial** — both engineer-owned. **N5** (trade-frequency / roster-percent) approved
  for research capture; value verdict after ~a week of data. **How to apply:** the sparkline-comparability
  half of N1+N4 is the *same* auto-scale problem Studio just flagged in the deepened evidence cards'
  value-now mark — solve it once, coherently, across both surfaces.

- **2026-07-23 — REACTED to the deepened evidence cards (Studio's proposal): direction validated,
  execution not there, and a NEW STANDING BAR — ground viz in the peer-reviewed literature, not taste.**
  David: the grounded visuals are "great in theory" and the **window concept is excellent** — but they
  need "a tremendous amount of polish and even logic," and "all the visuals are very small." Two
  concrete faults:
  1. **The straight-line window is misleading — a LOGIC error, conceded.** Studio drew the productive
     window as a flat bar, which silently claims uniform production from now to the cliff. Real
     production is **not** linear — rookie ramp vs peak vs decline are different, and the whole decision
     rides on that shape. A flat bar hides exactly what matters. The window/aging visual must render the
     honest **production/value curve (ascent → peak → decline)**, not a uniform runway.
  2. **Visuals too small and under-labeled** — the window especially "can do WAY BETTER on the way we
     design this and label it."
  **The standing bar (high-authority, generalizes the dataviz method):** encoding decisions must be
  **defensible from cognitive-science / peer-reviewed design research, not subjective opinion.** David
  named the canon to draw from: **Mackinlay**, *Automating the Design of Graphical Presentations* (the
  perceptual effectiveness ranking — position/length judged far more accurately than area/angle/color/
  saturation); **Rougier et al., *Ten Simple Rules for Better Figures*** (data-to-ink, viewer-attention
  limits); the **PRISMA systematic review / Gestalt grouping laws**; **Material Design data-viz** and
  **CMU** visualization guidelines; the **Awesome-Visualization-Research** and **Awesome-Dataviz**
  repositories. **How to apply:** research the literature BEFORE iterating a chart; justify every
  encoding from it (favour position/length over area/saturation per Mackinlay; maximise data-to-ink and
  respect attention limits per Rougier; group and label per Gestalt); scale marks up for legibility; the
  window becomes a true, well-labelled aging curve. This lifts the engagement's dataviz bar from
  "validated palette" to "literature-defensible encodings." (Ties to the always-loaded dataviz skill —
  its perceptual rules are the same canon; apply them, don't reinvent.)

- **2026-07-23 — Session closeout (learnings + the day's arc).** A single design arc ran the day:
  David confirmed the evidence-cards frame ("build upon") → Studio deepened each factor with grounding
  visuals → David reacted "great in theory, but polish + LOGIC; visuals too small; ground it in the
  peer-reviewed literature, not taste" and conceded-worthy: **the straight-line window was misleading**
  → Studio researched the canon he handed over, rebuilt the window as a real **aging curve**, then
  rebuilt the **whole card (v2)** to the literature standard (shared scales, recessed bands, direct
  labels, CVD shape cue, position encoding). **What worked and to keep doing:** conceding a real logic
  error cleanly and fast (no defending the flat bar); mining a handed-over research corpus *genuinely*
  (via subagent) and letting it drive specific, cited changes rather than nodding; finding the
  **through-line** — shared/fixed scales unifies the literature's #1 rule, the confirmed 004 N4, and
  Studio's own flagged sparkline flaw (one fix, three surfaces). **Reinforcement that recurred twice
  today (v1 delivery held by Tower, v2 open intercepted at closeout):** *delivery status in the record
  must be literally true* — "held" / "intercepted" / "not yet shown" is never "delivered"; correct it
  the moment it's wrong (an instance of the standing never-decided-language rule). **The open question
  parked for his next look (thread a):** does deepening each factor earn its place — build the v2
  standard out to the rest of the region, or too much? He closed out before seeing v2.

- **2026-07-23 — REACTED to v2 (the polished deepened cards): "I like it… this is good — we can keep
  going with this."** The deepening earns its place (answers thread-a's parked question: YES, build the
  standard out). And a **new design direction + a data-reality ruling**, both durable:
  **The direction — the aging curve should carry his own track record, not just a generic prior.** David:
  *"if we had enough data it would be interesting to see how our model performed vs his actuals in
  previous seasons. so the aging curve from his current age leftwards shows the model and his actuals —
  this would give me an idea as to whether we've been accurate with him or not, and if we're getting more
  or less accurate over time."* So the window mark gains a second job: **right-of-now = the position
  prior (typical arc); left-of-now = HIS realized history — our model's past prediction vs his actual
  production, per season.** The question it answers: *have we been right about THIS player, and is our
  accuracy on him improving?* This personalizes the generic curve into a per-player model-report-card on
  the same canvas. **How to apply:** design the curve's left-of-now region as his realized track (model
  line vs actual marks); it is the app's own Accuracy-Tracker concept (the realized-outcome loop),
  drawn per-player onto the window.
  **The data reality (verified live 2026-07-23 against the running API, not memory):**
  - **Forward — buildable by construction.** The app already has the pipe: `/api/realized-outcome/scorecard`
    is per-player by design (`tracking_rows` built to hold exactly model-vs-actual rows) but currently
    `inactive / awaiting_first_finalized_week`, `tracking_rows: []`. It **accrues from September** once
    weeks finalize. "Are we getting more/less accurate over time" is a when-games-are-played enhancement,
    NOT a permanent no.
  - **Backward — genuinely blocked (a §4 hard constraint, respect it).** No per-player historical actuals
    exist in the app: Sleeper serves no usage/stat lines through the called endpoints, the normalizer
    keeps 6 fields, and market history reaches back only ~29 days with no backfill. The model *was*
    backtested on realized historical seasons, but Model Trust exposes only **position-aggregate** folds
    (tau/RMSE/r²), not per-player residuals — surfacing per-player would be an engineering question, and
    young players (Ali 2yr, Wilson 4yr) have little pre-model history regardless. **How to apply:** design
    the realized track with an honest pending state ("his track record accrues from September") rather than
    fabricating past actuals; never invent a player's history to fill the curve. State the data limit
    on-surface, as always.

- **2026-07-24 — A content curve must represent OUR MODEL, not a generic prior (David's push) + a durable
  capability FACT.** Reacting to the track-record curve, David: *"isn't our model supposed to create an age
  curve? … whether that curve should be a representation of our model. If so we can remove the [model] dots
  and just show his actuals in dots compared to the line."* The principle: a curve labeled as his production
  arc is far more valuable as **our model's personalized prediction for him** than as a league-average
  position prior — a generic prior tells him nothing about our model. If the line IS our model, the separate
  "our call" marks are redundant; show his actuals as dots against the line, gap = model-vs-reality.
  **How to apply:** when a surface draws a "his X over time/age" curve, default the line to our model's
  own per-player output, not a population average; overlay reality as the comparison. Studio rebuilt the
  curve this way same-session (line = our model, actuals = dots).
  **The capability FACT (verified live 2026-07-24 via `/api/players/{id}`, treat as near-hard as §4 until
  engineering says otherwise):** our model does **NOT** emit a per-player production-by-age curve. Per player
  it exposes a DVS value, xVAR, and **sparse** `projection_1y/2y/3y` — often only ONE of the three populated
  (Rashee Rice: only 2y; Rasheen Ali: only 2y). So "draw our model's arc for him" is an **engineering ask**
  (can the model expose a per-player production-by-age arc?), not something design can conjure — and its past
  half, if built, is also the baseline his past actuals would be measured against (one ask unlocks the whole
  left-of-now surface). **How to apply:** before proposing any per-player model-trajectory viz, remember the
  model ships a value + a couple of sparse points, not a curve; show such curves illustratively with the
  ask stated on-surface, and never pass a generic prior off as our model's output. Ties to the standing
  honesty doctrine and the verify-before-claiming method (Studio checked the API rather than assuming).
  **Fork left with David (undecided — do not record as ruled):** pursue "curve = our model, per player" as
  an engineering capability ask (Studio's rec) vs fall back to a position-prior backdrop with our-model
  marks overlaid. Held pending his word; nothing relayed.

- **2026-07-24 — Session/day arc (closeout).** One continuous thread ran: Studio fresh-eyes-reviewed the
  unseen deepened four-factor cards (v2), caught + fixed two real defects before gating (a redundant
  "ascending" trajectory chip that contradicted Ali's own cut thesis — removed, since the NOW-dot's slope
  already carries trajectory per Mackinlay + David's own "read it from the slope" model; and a colliding
  value-now sparkline label — cut to a single current-rank label) → David APPROVED the deepening ("I like
  it… we can keep going") → he handed a new idea (the aging curve should carry his own left-of-now track
  record: model vs actuals, "are we getting more accurate on HIM over time") → Studio verified the data
  reality (forward accuracy buildable by construction via the app's per-player realized-outcome loop,
  inactive till Sept; backward blocked — no per-player history in-app) → built the track-record curve with
  an honest Illustrative/Today toggle → David pushed the sharper conceptual point above (line should be our
  model) → Studio verified the model emits no per-player curve, rebuilt to his spec, posed the engineering
  fork. **What worked, keep doing:** fresh-eyes self-review with headless screenshots before gating (caught
  the slope-logic contradiction — the same *class* of error David made me concede on the flat window bar,
  so not handed to him twice); verifying capability against the live API before answering a "can we?"
  question; conceding his design instinct cleanly when it was better than mine. **A time-sink to avoid:**
  chased a phantom mobile-overflow bug for several cycles because headless Chrome wasn't honoring the mobile
  viewport meta (it rendered the 980px desktop layout inside a 390px window → looked clipped); the DOM
  measurement (scrollWidth == clientWidth) proved no overflow. Next time, MEASURE the DOM first before
  trusting a mobile screenshot from headless Chrome.

## Rulings on escalations

- **2026-07-15 — Green/red vs. the color rules (N3, first escalation): David ruled for the idiom,
  scoped.** Green ▲ / red ▼ is legal for **rank-movement arrows only** — never for value, gap,
  margin, or tier hues; the moment green/red reads as worth or quality rather than pure positional
  movement, it is outside the ruling. (Ruling delivered via the engineering side; boundary is
  hard.) **Implication:** Studio designs rank chips in the idiom freely and keeps every other
  encoding in the neutral palette.

- **2026-07-24 — DYNASTY DOMAIN FUNDAMENTALS David had to teach Studio (four corrections in one
  session; none may ever need repeating).** Studio designed a whole draft-capital surface on invented
  domain assumptions and was corrected on each. The durable facts:
  1. **It is a "dynasty rookie draft."** Every draft after the one-time **startup draft** is
     **rookies only** — the class that just came off the real NFL board. Startup drafts are a
     different thing entirely; do not mix their literature or their logic in.
  2. **Roster limits are almost never a rebuilder's constraint, and Studio never checked the rules.**
     This league: **20 active (9 starters + 11 bench) + 4 IR + 2 taxi = 26**; taxi is
     **rookies-only, one year** — a slot type that exists to absorb rookie picks. You may be **over
     the limit all offseason**, only needing to be legal at the start of the regular season. And
     bubble players are cheap to drop: *"NFL players ascend quickly or they don't."* Studio's
     measured check agreed with David — his **bottom ten players are worth less than his top three
     picks**. **How to apply:** read the league settings before reasoning about roster space, and
     never treat a roster spot as scarce without pricing what occupies it.
  3. **First-round rookie picks are very valuable — his own roster is the proof.** Jeanty, Henderson,
     Mendoza, Cooper, Dart. Measured: **9 NFL first-rounders carry 53% of his roster's market
     value.** Published outcome data agrees — a rookie first hits ~48%, a second ~31%, a third ~7%.
     **Studio had claimed the round boundary was "nearly meaningless,"** having read two *adjacent*
     prices (1.12 vs 2.01, 5% apart) and mistaken price continuity between neighbouring picks for
     value continuity across rounds. Opposite of true.
  4. **Picks carry a recency premium — nearer years are worth more** (more trade demand, more
     certainty); further-out years trade for less. **Exceptions are class-driven:** the 2027 class is
     "loaded" and has been expert consensus for two years. Studio measured the market agreeing:
     a 2027 first sits **+17% above** the ordinary one-year step, with **+14%** appearing
     independently in rounds two and three.
  5. **The seasonal trade calendar is real and is the rebuilder's engine:** late in the season you
     sell aging veterans to contenders for future picks, because that player is worth more to them
     now than to you next season. **How to apply:** any pick or roster surface must respect the
     calendar — what is cheap now, what is expensive now, and which window is next.
  **The meta-lesson David is enforcing:** do the domain research *before* designing, not after three
  rejected surfaces. Studio's fresh eyes are an asset on interface; they are a liability on dynasty
  fundamentals, and the fix is research, not intuition.

- **2026-07-24 — THE EPIPHANY David demanded: an option cannot be represented by its average.**
  Studio shipped a hero chart of "cost per startable player" (price ÷ hit rate) captioned *"shorter
  is better"*, which rendered **seconds as better than firsts**. David: *"your saying shorter is
  better which is weird and then the 2nds are shorter than the firsts?? wtf man - you gotta have a
  serious epiphany."* Two faults:
  1. **Inverted encoding — length meant worse.** Length must mean *more*; never make the reader
     invert an axis in their head.
  2. **The metric was invalid and Studio had already written the reason in its own footnote** — *"a
     hit is binary; it counts a league-winning 1.01 and a flex-only 2.10 the same."* Dividing by a
     binary rate makes cheap assets win by construction. **Studio noted the flaw in the caveat and
     then made it the headline.**
  **The durable rule:** Studio kept **collapsing an asset into one number so it could draw a bar** —
  cost per hit, expected hits, value per pick. Every one averaged away the only thing that mattered.
  A draft pick is an **option with a fat right tail**; the 1.01 is not worth 3× the 1.12 because it
  hits more often, but because the top of its outcome range contains a league-winner. **How to
  apply:** before drawing a summary statistic, ask what the distribution's tail is doing — if the
  tail is the value, the tail must be in the picture, not in the footnote. **And read your own
  caveats as design criticism:** if a footnote invalidates the mark above it, the mark is wrong.

- **2026-07-24 — Do not fuse studies with different definitions into one mark.** When two sources
  measure "success" differently (one 12-team PPR hit rate 2010–17, another a "stud" rate by pick
  band), stacking them into a single bar invents precision neither has. Keep the second source in
  **prose beside the chart**, sourced, with its limits named — including when a primary is paywalled
  and the figure is therefore **cited as reported**. Direction confirmed by David the same session.

- **2026-07-24 — REACTED to the rebuilt draft-capital surface: "yep you're now heading in the right
  direction."** A direction checkpoint, **not an approval** — the surface is not signed off and
  nothing is relayed. Confirmed-good so far: round-level outcome odds (longer = better, one source,
  zero baseline), the year-discount small multiples on one shared price scale with the 2027 premium
  shown as a dashed counterfactual tick, the on-surface retraction of Studio's wrong roster-crunch
  claim, and the validated pick board underneath.

- **2026-07-24 — Skills: there is no "impeccable" available to Studio; and Studio disclosed it had
  skipped one of its own.** David asked why Studio uses `frontend-design` rather than "impeccable."
  Answer: no such skill exists in Studio's environment; the brief names `frontend-design` and
  `dataviz`. Studio also volunteered that **this session it loaded only `dataviz`**, reusing the
  approved 006 visual language instead of re-deriving the aesthetic. David is looking into providing
  "impeccable." **How to apply:** say which craft tools were and were not used, unprompted.

- **2026-07-24 — Standing offer: a PERSISTENT CRAFT LIBRARY on disk, curated by Studio.** David
  authorised Tower to fetch craft references into Studio's own directory — the point is memory
  across resets, extending what `dataviz-principles.md` already proved. **Studio curates; David
  deliberately does not.** Limits: nothing paywalled or pirated, and **craft only** — how a product
  is built and animated, never what a product chose to prioritise. Studio's submitted priority list:
  (1) uncertainty/distribution visualization — Hullman & Kay, hypothetical outcome plots, quantile
  dotplots, Correll & Gleicher on error bars (the fat-tail gap that caused today's failure);
  (2) graphical-perception primary sources — Cleveland & McGill 1984, Mackinlay 1986, Heer & Bostock;
  (3) metric validity — ratios, normalization traps, base rates, Simpson's paradox (Calling Bullshit
  course materials); (4) typography canon — Butterick, Bringhurst-for-web, Material 3 / Carbon type;
  (5) layout and grid; (6) colour and accessibility — APCA/WCAG, practical OKLCH, CVD for charts;
  (7) motion — Material 3 motion, Apple HIG, spring vs cubic-bezier, reduced-motion; (8) craft
  captures — Baseball Savant, Stripe, Linear, Sofascore, Sleeper. **Studio also raised, explicitly as
  out-of-scope-as-written, that dynasty subject-matter fluency (empirical rookie-pick outcome
  studies) would fix more of its errors than any typography reference — David's call.**

- **2026-07-24 — 008 STOPPED BY DAVID; the lesson is sequence, not craft.** After seven versions
  David closed the draft-capital thread: *"we dont have 4 rounds we only have 3 - lets stop here.
  you've tried but we need a fresh perspective."* His dynasty rookie draft is **three rounds** —
  and **Studio's own first-pass table had already printed all sixteen of his picks as R1/R2/R3.**
  The answer was in data Studio pulled on day one and did not read. (The chart's fourth row was
  *NFL* draft rounds, but that it read as his rookie draft is proof the surface failed.)
  **The through-line across all seven versions: the craft improved every time and the outcome did
  not.** The last two marks were literature-correct — countable unit chart, position-controlled
  metric, shared scales, stated intervals — and the work still failed, because Studio kept reaching
  for an analytical frame *before* understanding the domain, and paid five corrections for it:
  rookie-draft-vs-startup, roster rules (IR/taxi/offseason over-limit), first-round pick value, the
  year/recency premium, and the round count.
  **How to apply, and this outranks any craft rule:** on a domain-heavy surface, **spend the first
  cycle on the domain and on the league's own settings, not on a chart.** Read the league config.
  Read the user's actual holdings and let their shape tell you the rules. Ask David one factual
  question early — cheap — rather than shipping a surface built on a guess. Studio's fresh eyes are
  an asset on *interface* and a liability on *dynasty fundamentals*; treating them as an asset in
  both places is what produced seven rejected versions in one day.
  **Also durable:** when a thread is closed, close it *honestly on disk* — mark it did-not-land,
  name what survives independent of the framing, and tell the next reader not to resume it. Do not
  argue the last point; concede and stop.

- **2026-07-25 — THE LANE COLOURS ARE CONSTITUTIONAL. Never re-tune them for a surface.** David, on the
  009 board: *"we have to stay consistent with our color scheme — if Model is orange on one surface and
  blue is Market, we cannot switch that on another surface."* **model = cool blue `oklch(0.72 0.11 255)`,
  market = amber `oklch(0.76 0.13 75)`** (the app's own dark-block tokens; the product's `tokens.css`
  calls hue meaning "constitutional" and identical in both themes). Studio had *not* flipped the
  assignment — but it had shifted **both hues a half-step darker** than the app's tokens in order to clear
  the dataviz validator's dark **lightness band**, and disclosed that only in a proposal file David does
  not read. That drift is the violation, and reading as "the colours changed" is exactly the cost.
  **The resolution, and the general rule it sets:** the app's pair fails only the glare-oriented lightness
  band and **passes every check that governs whether a reader can tell the lanes apart** (CVD protan ΔE
  22.5, tritan 22.8, normal-vision 24.3, contrast ≥3:1). So **consistency with the product outranks an
  internal craft-tool heuristic** whenever the heuristic is not a legibility failure. **How to apply:**
  take the two lane colours verbatim from the app's tokens on every surface, forever; if a validator
  objects, satisfy it with lightness/chroma *elsewhere* in the palette or state the deviation **in the
  pane to David**, never silently in a file. A craft check is advice; the product's colour contract is not.
  Studio also aligned the rank readouts to lead with **ours / market** in the same pass, matching the
  legend order and the standing product mission (our rank compared to the market, ours first).

- **2026-07-25 — REACTED to the 009 board ("Who holds what"): "pretty solid — I like where you're going
  with this — very logical slicing and analysis."** A direction checkpoint, **not an approval** — nothing
  is signed off and the relay is not authorised. Confirmed-good so far: slicing the league one position at
  a time, every team on one shared rank scale with our rank beside the market's, and the per-team inline
  expansion. The only correction was the colour drift above.

- **2026-07-25 — THE SIGNAL DAVID ACTUALLY WANTS: the CONJUNCTION of positional strength, our lane, and
  posture — and it survives Studio's own refutation.** David, after Studio measured that lineup
  complementarity is worth almost nothing in this league: *"think about the signals i could use to my
  advantage. one, for example — i am looking at my roster gaps, say RB — and i want to find a trade
  partner. which team is rich in RBs that my model likes, is that team rebuilding or contending.
  Another scenario — finding a team that's contending but injuries have thinned out his WR room — do i
  have excess wrs? i could see shading being really valuable and easy to read in a surface like this,
  perhaps. showing strength in position groups compared to the league."*
  **Why this beats the thing Studio just refuted, and Studio was wrong to treat its own test as
  decisive:** Studio measured *value-neutral gains from trade* (does my spare part raise their lineup)
  and found ~nothing — max 642 against 50,000 rosters. But David is not describing arithmetic
  complementarity, he is describing **urgency**: a CONTENDER whose window is now will pay above market
  to fix a hole, and a rebuilder will not. Willingness-to-overpay is invisible to a value-neutral test
  by construction. **How to apply:** the signal is the *three-way conjunction* — their weakness ×
  **their posture** × my depth **in our lane, not the market's** — never any one of the three alone.
  Posture is what makes a gap actionable.
  **The form: a team × position matrix, and the literature says framed rectangles rather than pure
  shading.** Cleveland & McGill put shading/saturation in the **bottom tier** for magnitude and their
  own named replacement for shaded statistical maps is the **framed-rectangle chart**, which converts a
  shading judgement into a *position* judgement inside a constant frame — same scan, tier-1 read
  (`craft/graphical-perception.md` §A). Shading is legitimate for **pattern/where-do-I-look**, unfit for
  **magnitude**. Studio's recommendation is therefore: keep David's matrix, keep the at-a-glance scan,
  but put a positioned tick in a constant frame in each cell rather than asking him to read strength off
  a colour ramp. His own 2026-07-23 standing bar (ground encodings in the literature, not taste) is what
  decides this.
  **The data reality, verified live 2026-07-25 — one half of scenario two is BLOCKED:**
  the snapshot normalizer retains exactly six player fields (`age, full_name, position, sleeper_status,
  team, years_exp`) and **retains NO injury field at all**; Sleeper's transactions endpoint is never
  called. So "injuries have thinned out his WR room" is **not** directly observable. What IS observable
  is **IR membership** (`league_context.on_ir`) — today: roster 1 has 3, rosters 5, 7 and 9 have 1 each
  — which is a usable proxy for a thinned room but says nothing about severity or timeline. **How to
  apply:** build the matrix on IR membership and state the limit on-surface; retaining `injury_status`
  in the normalizer is an engineering ask, not something design can conjure.

- **2026-07-25 — Studio must not treat its own refutation as the end of an argument.** Studio measured
  complementarity as worthless and reported it as a settled finding; David's very next message supplied
  the mechanism the test could not see. **How to apply:** when a measurement kills a premise, state
  what the measurement *could not observe* in the same breath — a value-neutral test cannot see
  motivation, urgency, or willingness to overpay. A refutation is scoped to its instrument.

- **2026-07-25 — REJECTED: the first matrix. "Extremely confusing and hard to read." The fault was
  DENSITY WITHOUT HIERARCHY, and Studio measured it rather than guessing.** The page carried **265 marks
  and 192 numbers across 48 cells — 5.5 marks per cell**, a **four-item legend** the reader had to
  memorise and re-apply 48 times, **35 pairs of dots within 10px** of each other, and **two thin vertical
  rules per cell meaning different things** (rank-15 threshold vs "you") — identical in form, opposite in
  meaning. **Tier 2 of the craft library convicts it directly, and David pointed Studio there himself:**
  `colour-accessibility.md` §D (Okabe & Ito) — *"label directly on the graphic rather than in a separate
  key; a legend forces the reader to match by hue, which is the exact channel that failed"* and *"make
  coloured objects thick or large; avoid thin lines and small marks relying solely on colour"* (the 7px
  55%-opacity depth dots); `typography.md` §E (Butterick) — **11px is a label size, the smallest slot the
  whole scale contains**, and Studio set *content* (player names, counts) at 11px 192 times;
  `layout-grid.md` §G — every cell invented its own internal rhythm instead of sharing bands.
  **How to apply: a grid that needs a key has already failed. Budget marks per cell before drawing —
  two is a design, five is a puzzle. Never let two marks of the same FORM carry different MEANINGS in
  one cell.**

- **2026-07-25 — THE MISAPPLIED RULING, named: "instrument, don't editorialize" is NOT "render everything
  at uniform weight."** Studio had been reading the 2026-07-21 ruling as a mandate for a flat, uniform
  grid — which produced 48 equally-weighted cells in which nothing popped, and handed David the job of
  finding the conjunction himself. What David actually said was *"I'll recognize the anomalies and
  outliers — I just need the mechanism and design so I can SEE it."* **How to apply:** the encoding stays
  stable and identical every day; what must NOT be uniform is the *result*. Choose the quantity so that
  an interesting cell looks different **because the data is different**, never because Studio flagged it.
  A design where nothing pops on an interesting day is as wrong as a headline that manufactures a
  protagonist on a quiet one.

- **2026-07-25 — v2, built after David returned the decision to Studio ("you decide… what do your tier 2
  craft tools suggest or empower you to do?"). The medicine was subtraction.** One question per cell —
  *is their best at this position better than mine?* — as **one diverging quantity on one shared scale**
  (max |gap| 28 rank places, the same scale in all 44 cells). Two bars per cell, ours and market, from a
  shared centre that IS David; right = they are ahead of him, left = behind. **No legend at all** —
  identity is direct-labelled once on the first cell, per Okabe & Ito. Marks cut from 265 to 88; numbers
  from 192 to 0 (detail moved to hover). Type addressed by four named roles with nothing under 12px
  carrying content. His own row was **cut** — all zeros rendered as an empty strip that read as missing
  data, and the baseline it stood for is already the centre line in every cell plus the "you:" line in
  each column heading. **A structural grid bug (a stray `grid-row: span 2` on the column headers shifted
  every row by one cell, putting team names in the last column) was invisible to the automated collision
  and clipping probes and was caught only by looking at the screenshot** — the reason the eye pass exists.
  **Awaiting David's reaction; nothing approved.**

- **2026-07-25 — REJECTED AGAIN, and the fatal criticism was the QUESTION, not the drawing: "what are we
  even asking — 'is their best better than mine?' why is that the question???"** David also named
  "extremely disproportionate" design elements and insights "like finding a needle in a haystack."
  **Measured:** the v2 grid was **4.3% ink** — 214×65px cells holding a median bar of 26px, bar lengths
  spanning 3px to 91px. He was precisely right.
  **Why the question was wrong — three reasons, all of which Studio should have caught before drawing:**
  1. **Nobody trades their best player.** Comparing my best to their best benchmarks an asset that is by
     definition unavailable. It is the single least actionable player on their roster.
  2. **It is symmetric and exhaustive; the need is asymmetric and specific.** David has one roster with
     one or two real holes. Studio rendered 44 comparisons and made him find the two that mattered —
     which is exactly the haystack he named.
  3. **It answers "who is better," a STANDINGS question** — region 1 of the ladder, already built in 006
     — while he had asked a region 3 "who can I deal with" question. The surface was region 1 wearing
     region 3's clothes.
  **THE RIGHT QUESTION, and it was in David's own words from the start:** *"i am looking at my roster
  gaps, say RB — and i want to find a trade partner."* It begins at **his hole**, not at a map. And
  "rich in RBs" means **surplus** — and the load-bearing realisation Studio missed: **the tradeable
  asset is the one they CANNOT START.** A team with eight RBs starting three has five doing nothing, and
  those are the ones that move. Computed against best-legal-lineup, that produces named, specific,
  genuinely available targets — Derrick Henry (RB22 market / RB11 ours, 2,853) on a contender's bench;
  Kyle Pitts (TE8/TE11, 2,920) on Florida Man's; Dak Prescott (QB15/QB13, 3,990) benched in a superflex
  league. **How to apply: start every "what should I do" surface from the user's specific need and
  return a short ranked list of named, available assets — never a complete map the user has to search.
  A matrix is an answer to "how does everything relate"; he almost never asks that.**

- **2026-07-25 — Two rejected builds in one day, same root cause: Studio built before validating the
  FRAME.** Both the 48-cell matrix and its rebuild were executed carefully against a question nobody had
  agreed to. **How to apply, and this is a hard rule now:** when a surface answers a *new* question,
  state the question in one line and get it confirmed before building anything. Craft cannot rescue a
  wrong question, and Studio has now paid for that lesson three times (008's seven versions, and both of
  today's grids).

- **2026-07-25 — Session learnings, logged at Tower's accountability probe.** Four durable lessons, each
  bought with a rejection today.
  1. **A wrong question cannot be rescued by craft.** Two grids were built carefully — validated palette,
     literature-cited encodings, clean probes — against a question David had never agreed to
     (*"is their best better than mine?"*). His verdict: *"why is that even the question???"* Both were
     technically sound and both were worthless. **Confirm the question in one line before building
     anything that answers a new one.** Studio has now paid for this three times (008's seven versions,
     and both of today's grids).
  2. **Do not fuse two dimensions into one score so a single bar can be drawn.** `gain − cost` looked like
     the perfect ranking key and came out a constant (910, 910, 910) because it measured a team-pair
     difference, not the player. Caught before drawing, but only just. This is the same error as the
     2026-07-24 cost-per-hit chart in a new costume. **Show both dimensions; rank on one.**
  3. **Budget marks before drawing.** The rejected grid was measured after the fact at 265 marks + 192
     numbers over 48 cells (5.5 per cell), a 4-item legend re-applied 48 times, and **4.3% ink** in its
     rebuild. A pre-flight budget would have killed both. Requested as Tier 4 of the craft library.
  4. **Automated probes do not see structure.** A stray `grid-row: span 2` shifted every row of the matrix
     by one cell, putting team names in the last column. Zero collisions, zero clipping, zero overflow,
     zero errors — and obviously broken to the eye. **The screenshot pass is not optional and is not
     redundant with the DOM probes.**

- **2026-07-25 — Anything that matters goes to disk, immediately, not at closeout.** Studio quoted David
  real figures (the Skattebo/Price replaceability numbers) that existed only in a pane with almost no
  scrollback, and a craft-tools answer scrolled away before Tower could read it. Both were nearly lost.
  **How to apply:** the moment a number is quoted to David or a decision is taken, it is written to disk
  in the same turn — with its derivation and an explicit verified/unverified status. Never rely on the
  pane to hold anything, and never assume a relay crossed without an acknowledgment.

- **2026-07-25 — 009 relay CROSSED (David: "009 relayed to crew"), and Studio discharged its own disclosed
  caveat the same hour.** The accountability probe had disclosed that two correlation figures inside the
  relay were computed over a population containing P2's fifteen coerced zeros and had never been re-run.
  Studio re-ran them immediately on the authorisation, rather than waiting to be asked: **xVAR lane
  +0.313 → +0.340** (the relayed figure *understated* the contamination), **DVS lane +0.218 unchanged**
  (those fifteen have no DVS and were excluded by construction — obvious in hindsight and Studio should
  have seen it before disclosing it as a risk). No item P1–P6 affected; the argument is strengthened.
  Issued as `009-RELAY-ADDENDUM.md`, unauthorised, David's to send. **How to apply: when a disclosed
  defect in Studio's own numbers becomes cheap to close, close it immediately and unprompted — a
  disclosure is not a substitute for the fix, and a number already in an engineer's hands is the most
  expensive place to leave one wrong.**

- **2026-07-25 — APPROVED: dynasty domain fluency is inside Studio's remit.** David, on the re-raised
  request: *"i agree - domaine fluency is fine."* Empirical rookie-pick outcome studies, draft-capital-to-
  production research, the trade calendar, and **public historical datasets Studio can compute on
  directly** are now legitimate craft-library pulls. Same division as always — Studio curates, Tower
  fetches, Tower does not curate. Same limits — nothing paywalled or pirated, and never what another
  product chose to prioritise; domain knowledge is the game, not anyone's doctrine. **Why it matters:**
  every one of the five corrections David had to issue on 2026-07-24, and the closure of the 008 thread,
  were domain errors rather than craft errors. Six items curated in `CRAFT-LIBRARY.md` Tier 5, led by
  nflverse-class open datasets — the item that turns Studio from a citer of two incompatible studies into
  someone who measures a distribution first-hand.

- **2026-07-25 — CONFIRMED: the trade-partner framing, and the refinement that completes it.** David
  confirmed the question Studio proposed — *"who has a good player at my position of need that they can't
  start?"* — replacing the rejected *"is their best better than mine?"*. He then sharpened it in the same
  breath: *"not just that they cant start - but what if they have a backfill for a starter that they may
  be satisfied with."* **The settled question is therefore: who holds a player at my position of need that
  they can AFFORD TO LOSE — because the drop-off to their backfill is small?** Measured, this changes the
  answer materially: Cam Skattebo is Florida Man's *starting* RB2 and costs them only 289 to lose while
  adding 1,199 here; bench-only logic misses him entirely. **And the load-bearing pattern underneath it:
  for genuine stars, cost ≈ gain** (Bijan 8,344/8,206; Chase 8,258/7,883) — the market is efficient on the
  players everyone wants, and the asymmetry only exists further down a roster. That is precisely why
  best-versus-best was the wrong question. Figures persisted in `analysis/`, marked unverified.
  **The surface itself is NOT built** — data generation was interrupted at closeout.


- **2026-07-26 — DO NOT FINISH THE ANALYSIS AND SHOW ONLY THE CONCLUSION. Show all the data; design so
  his eye is called to what he'll want to see.** David on the 010 trade-target board: *"I feel that
  you've been a little too prescriptive here and aren't really displaying all the information, but
  rather you've finished the analysis and determined what to show me, rather than finding a good way
  to show me all the data but call my eyes to the things i will want to see."* Studio had filtered a
  41-player QB population down to the 13 it judged relevant, hidden the rest behind a threshold
  filter, and written the conclusion into an empty state (*"this position gets fixed by paying, or not
  at all"*). **How to apply:** the population is the surface. Show every entity at the chosen slice;
  never pre-filter to the subset Studio finds interesting. Ordering, sorting and visual weight are the
  legitimate tools for directing attention — a hidden row and a written verdict are not. This is the
  operational form of *instrument, don't editorialize* (2026-07-21) and its 2026-07-25 refinement (the
  encoding is uniform, the RESULT must not be): Studio keeps satisfying the letter by flattening the
  drawing while violating the spirit by pre-selecting the data. He also confirmed the direction is
  sound — *"i see where youre going with this and its on the right track... so you're getting there."*

- **2026-07-26 — STARTER-VS-BENCH IS NOT A FACT STUDIO MAY ASSERT, and the drop-off is the real
  signal.** David: *"we must not look simply at if the player is in the starting slot. some managers
  have their best qbs on the bench sometimes. we need to look at a full picture — do they have a great
  replacement if they trade one? are they contending or rebuilding etc."*
  **Measured the same session, and he is literally right at the top of the board:** Studio had inferred
  every team's lineup with a greedy market-value optimiser and built the headline on it (*"all 13 QBs
  who would help are their owner's starter"*). Sleeper carries **real** saved lineups — **92% of slots
  are set league-wide, 10 of 12 teams complete** — and they contradict the optimiser for **10 players**.
  The sharpest case: **Free Kelly BENCH Josh Allen (10,232, the most valuable player in the league) and
  start Dak Prescott (3,970).** The headline was false.
  **The durable rules:** (1) **Never infer a fact the source already carries** — read Sleeper's
  `rosters[].starters` before modelling a lineup. (2) **Neither lineup is authoritative in the
  off-season** — Studio's is inferred, Sleeper's may be untouched since last season — so starter/bench
  is *recorded per player and never used to rank, filter, or claim anything.* (3) **The signal that
  survives is the drop-off to the replacement**, which does not depend on who nominally starts, and it
  must be answered with **a name** ("replaced by Jadarian Price, 3,041"), not only a number.
  (4) **Posture is part of the full picture, per row, not a footnote.**

- **2026-07-26 — BUILD ROBUST INSTRUMENTS, NOT SINGLE-QUESTION SURFACES. (Restates 2026-07-15
  filters-and-sort-not-tabs, which Studio violated again.)** David on the 010 board: *"i'm just not
  loving the data viz — i don't need it to be so prescriptive — i prefer a robust data viz, where
  multiple answers can be found against multiple questions i may ask, easily. even if i have to change
  a filter or sort — but this is too narrow of a board, it's hyper focused on one use case."*
  **How to apply:** the default deliverable is **one queryable population with many filter and sort
  axes**, not a surface purpose-built for the single question that prompted it. He explicitly accepts
  interaction cost — changing a filter is fine; being unable to ask a second question is not. Ask, for
  every surface: *how many different questions can he answer here?* If the answer is one, it is too
  narrow, however well drawn. Studio has now been told this three times (005's two-lists rejection,
  the 2026-07-15 ruling, and here) and keeps rebuilding bespoke single-purpose boards.

- **2026-07-26 — HOVER TIPS ARE STANDING, ON EVERY SURFACE, AND A REFERENCE LINE MUST LABEL ITSELF.**
  David: *"hovering tips… there are so many dots on the my team scale — who are they?? and how am i
  supposed to know what the dotted lines represent — unless i memorize it."* Confirmed after the fix:
  *"hover is very helpful."* Studio had shipped an anonymous 12-dot cloud per row and put the
  reference-line explanation in a **column header** — a key, which is the exact failure
  `craft/colour-accessibility.md` §D (Okabe & Ito) warns against and the one that sank the 009 matrix.
  **How to apply:** (1) every mark answers "what is this?" on hover — identity, value, and what it
  means; (2) every reference line is **labelled on the graphic** where it sits, the first time it
  appears; (3) hit targets are widened well beyond thin marks (a 1px rule is unhoverable); (4) nothing
  lives ONLY in a tooltip, since touch has no hover — each tip restates what the row, the expansion or
  the aria-label already carries. This is also the always-loaded dataviz skill's own rule ("add the
  hover layer — by default") which Studio skipped.

- **2026-07-26 — A CONSTANT APPLIED TO ONE GROUP IS STILL A REPRICING (Studio reasoning error, caught
  by Tower).** Studio tried to refute the claim that FantasyCalc's superflex values are a flat 1.872×
  scalar on its 1QB values, arguing that QB1 prices at 1.04× WR1 and 8 of the top 24 are QBs, so "the
  values do appear to reprice QBs." **That observation is what the claim predicts, not evidence against
  it** — multiplying quarterbacks and nobody else by a constant *is* a repricing of quarterbacks
  against the field. **How to apply:** before offering an observation as a refutation, ask whether the
  hypothesis being tested would produce that same observation. What would actually settle it: whether
  superflex ÷ 1QB is the *same* number for every QB (supports) or *varies by rank* (refutes) — and
  neither is testable from a superflex-only pull, because a single pull contains no ratio. **Live
  consequence:** if the ratio is constant, the QB market curve is shape-borrowed from a format David
  does not play, and it would be wrong exactly in the QB25–48 band. Do not rest a curve-shape argument
  on that source until the test lands.

- **2026-07-26 — CONFIGURABILITY IS NOT ROBUSTNESS. Options that answer nothing are worse than fewer
  options.** Having asked for a robust instrument, David got two free axis dropdowns over six measures
  plus six filters, and rejected it: *"tooo much. there are too many options that tell me absolutely
  nothing."* Two dropdowns over six measures is **thirty-six possible charts**, and most are
  meaningless (age against age, value against market rank). Studio had heard "robust" and built
  *configurable*. **How to apply:** robustness means **several curated views that each answer a real
  question**, not a combinatorial space the reader must search for the meaningful corners. Name each
  view with its question, so no control is ever an unlabelled axis. Cut any filter made redundant by a
  view (a "lanes disagree" filter is pointless when a view already plots the disagreement). Controls
  went 11 → 5 and the 36 charts became 3 named views plus the table. Sits between the two failure
  modes he has now named on the same day: **too prescriptive** (one hard-coded answer) and **too
  configurable** (infinite empty answers). The target is a few good questions, each answered well.

- **2026-07-26 — Skew is a measurement, not a taste call: check what fraction of the axis the data
  actually occupies.** The availability view piled every interesting player into one corner because
  161 of 269 players cost their owner exactly zero and 187 add exactly zero. **Measured: on a linear
  axis the middle half of the field occupied 11% (cost) and 6.2% (gain) of the axis; on a square-root
  axis, 33% and 25%.** So the scale changed, and nobody was removed. **How to apply:** when a plot
  looks crowded, compute the interquartile span as a share of the axis before reaching for a filter —
  the fix is often the scale, not the population. Any non-linear axis must say so **on the surface**,
  with the reason, because an undisclosed non-linear axis is a lie.

- **2026-07-26 — 010 CLOSED BY DAVID; the failure is the 008 failure, repeated.** *"i dont know — its
  not speaking to me. might need to call it a day. were not getting better."* Six versions in one
  session, each fixing a real defect — inferred lineups replaced with Sleeper's real ones, David added
  to his own board, a hover layer, filters, named views, a measured sqrt scale — and **the craft
  improved every time while the outcome did not.** That is verbatim the 2026-07-24 lesson from the
  draft-capital thread, which is now the second time Studio has paid for it: **when a surface is not
  landing, iterating the drawing is the wrong move; the premise is what needs re-examining.** After
  two rejections of the *same* surface, stop redrawing and put the premise itself to David in one
  line.
  **Studio's own diagnosis of why it never spoke, recorded for the next attempt:** every version was
  denominated in **units Studio invented** — "adds 1,184 to your best legal lineup", "costs his owner
  289", best-legal-lineup slot standing. Those are an optimiser's outputs, not the language of the
  hobby. Everything David has responded well to across this engagement spoke the game's own tongue:
  **prose tiers** ("the market prices him a high-end WR2, our model sees a mid WR1"), **named
  comparables**, **rank and rank movement**, the **aging curve**. **How to apply: check the units
  before building. If a number on the surface is one no dynasty manager would ever say out loud, it
  will not speak, however well it is drawn.**

- **2026-07-26 — CAPABILITY FACT, verified: FantasyCalc superflex = one-QB values × a fixed
  per-position constant. Treat as near-hard, like a §4 constraint.** Measured by Tower across 475
  players present in both pulls (marker TW26R): **QB ×1.8711, RB ×0.9179, WR ×1.0012, TE ×1.0936,
  picks ×1.0521**, with **no drift by rank inside quarterbacks** (QB1–24 mean 1.872356, sd 0.00033;
  QB25–48 mean 1.872639 — Josh Allen and a QB34 carry the same multiplier to five decimals). It is a
  blanket positional adjustment; FantasyCalc has no mechanism to represent a superflex-specific curve.
  **How to apply — three rules:**
  1. **Within a position you are safe.** A positive constant cannot reorder anyone, so every
     single-position ranking, dumbbell and list Studio has drawn against market is legitimate and
     identical to its one-QB ordering.
  2. **Cross-position magnitudes must name the adjustment**, because they are scaled by a known
     constant rather than measured.
  3. **Never build an argument on the SHAPE of the market QB curve.** How steeply value falls from QB5
     to QB25 is a one-QB shape wearing superflex clothes. Ordering fine; steepness is not evidence.
  **It cost a headline the same hour it landed.** Studio had told David "QB is your hole by twice the
  next gap." Deflating the constants: QB −838 vs WR1 −767 — **2.04× becomes 1.09×**. The rank (9th of
  12) holds; the *twice* does not. **Corrected finding: two roughly equal weakest slots, QB and WR1**,
  which fits the fourteen-receivers-with-no-top shape better than one dominant hole did. Two
  cross-position slots also moved on deflation (FLEX1 4th→5th, SF 4th→6th); no single-position slot
  moved. **The general lesson: a number that compares across positions in market units is resting on
  a constant somebody chose, not on a measurement.**

- **2026-07-25/26 — A FILE'S DIRECTORY IS PART OF ITS AUDIENCE. Decide the shelf before writing, not
  after.** `proposals/` is the only directory the engineering team is sanctioned to read, so it holds
  only numbered proposals, their `NNN-RELAY.md` briefs, and the prototypes those reference. Everything
  else — the working board, notebooks, measurement records, accountability material, and **anything
  quoting David's rulings, his verbatim words, or the terms of this engagement** — lives in
  `for-david/`. **How it was learned:** an accountability file quoting Tower's errors and David's
  private confirmations, and a notebook carrying his doctrine verbatim, were both written into
  `proposals/` because the instruction said "write it to a file" and never said which shelf.
  **Two consequences to hold:** a file in `proposals/` must never point at one that is not (check
  cross-references after any move); and measurement that lives only in a notebook but needs to reach
  the engineers goes as a **relay addendum Studio authors**, never by exposing the notebook.

- **2026-07-26 (late) — THE TWO LANES ARE RANKED OVER DIFFERENT POPULATIONS, AND MOST OF THE
  "DISAGREEMENT" STUDIO HAS BEEN DRAWING MAY BE THAT ARTIFACT.** Two independent measurements, one
  walled off from the other, established it: re-ranking both lanes over **only the players they
  share** moves average disagreement by **~10.7 percentile points** and reclassifies **131 of 336
  players**. The apparent systematic bias — our model looking higher than the market — **goes to
  exactly zero** once the populations match. It was never disagreement.
  **Distortion is worst where the population mismatch is worst: RB 15%, TE 46%, WR 49%.**
  **How to apply:** every model-vs-market mark Studio has drawn — the dumbbell, the agreement
  diagonal, the "where we disagree" view, the 49-players-off-the-diagonal count — is measured with the
  instrument this engagement exists to repair. **Rebase both lanes onto the shared population before
  any comparison is drawn or any number is quoted.** Until that is done, treat lane disagreement as
  unproven, not as a finding — and say so on-surface rather than in a footnote.

- **2026-07-27 — LEAGUE FACT, read from the league's own config. Treat as near-hard, like §4.**
  Studio had reasoned about roster shape for two weeks without ever reading the lineup. It is:
  **`QB 1 · RB 2 · WR 2 · TE 1 · FLEX 2 · SUPER_FLEX 1 · BN 11`** — 12 teams, **full PPR**
  (`rec: 1.0`), **no TE premium**, 9 starters per team, 108 weekly starting slots league-wide,
  `position_limit_qb: 4`, 3 draft rounds, taxi 2 / IR 4. Source:
  `app/data/research/league_behavior/raw/2026-07-19/season_2026_1314363401744416768/league.json`.
  **What it implies, via Harstad's positional-baseline formulas (Footballguys), parameterised by
  that lineup:** this league's real startable depth is **QB ~21 start weekly, replacement ≈ QB33;
  RB 24 / RB39; WR 24 / WR52; TE 12 / TE22.** So the superflex slot makes **QB2 a starting job**,
  TE is only ~22 deep, and WR runs ~52 deep — which is why "I hold 14 WRs" and "I hold 3 TEs" are
  not comparable statements, and why quantity at receiver is cheap.
  **How to apply:** never reason about roster space, positional need, or whether a player is
  "startable" from the generic 12-team convention — read this lineup. The naive "WR1 = top 12" is
  a *naming* convention, not this league's structure. Extends the 2026-07-24 meta-lesson (read the
  league's settings before designing) from roster limits to the starting lineup itself.
  **The related measurement, same day:** the vernacular's twelve-blocks are not where the market
  breaks — of the 32 largest single-step value drops across the four boards, exactly **one** lands
  on a twelve-boundary. Tier *names* are a coordinate system; the *cliffs* are the structure. A
  tier surface must show both rather than pretending they coincide.

- **2026-07-27 — REACTED to the two-lane tier ladder (011 v2): *"this is interesting - we can work
  with this - i especially like the charts. the table is clear to read."* A direction checkpoint,
  NOT an approval** — nothing signed off, no relay authorised in the same breath. Confirmed-good so
  far: the **two-lane value curve** (market's curve as ground, each held player a dumbbell with our
  mark and the market's on the same positional-rank axis, connector = the disagreement), the **tie
  bar** where our model cannot separate players, and the **table's readability** with both lanes as
  adjacent columns. He did **not** answer the coarse-vs-fine question that was put to him — do not
  record the coarse ladder as ruled; it is accepted-in-practice, not decided.
  **The durable principle this established, and it generalises beyond tiers:** David asked for both
  lanes side by side *"without creating an apples-to-oranges comparison — i don't want arbitrary
  tiering."* That is **two** risks, and they need two different fixes:
  1. **One population.** The lanes rank different players; rank both over only the set they share
     (337 of 399/468). This is the already-known broken comparison.
  2. **One ruler.** If each lane's tiers came from its own value distribution, "our WR2" and "the
     market's WR2" would be **different-sized objects** — a deeper apples-to-oranges than the first.
     So tier boundaries must belong to the **position, not the lane**, and must come from something
     outside both: here, the league's own starting structure (twelve teams each fielding one starter
     at the position). A rule, not a taste call, and identical for both lanes.
  **How to apply:** any two-lane comparison Studio draws must satisfy BOTH — same population, and a
  ruler derived from neither lane. Deriving cut-points from one lane's data and applying the labels
  to both is the trap.
  **And the measurement that decided the grain:** a fine sub-tier was not merely arbitrary, it was
  **undefined** — see the DVS ceiling fact logged below. When the data cannot support the resolution,
  the honest move is a coarser ladder that shows the tie, never a finer one that invents an order.

- **2026-07-27 — CAPABILITY FACT, verified live: OUR DVS SATURATES AT A CEILING OF 100.0, and the
  model lane is effectively static. Treat as near-hard until engineering rules.** Measured from
  `app/data/model_forward_capture.db`, capture 2026-07-27 (relayed as 011 R1/R2/R3):
  - **23 players sit at exactly 100.0.** RB 6 tied (next distinct 92.3 — a 7.7-point gap below the
    tie, i.e. a clip, not a cluster); WR 6 tied (next 98.3); **TE 11 tied** (next 99.5). QB does not
    saturate (max 99.0, held by one).
  - **The cost, in market terms:** the 11 tied TEs are priced by the market from **1,467 to 7,730 —
    a 5.3× spread flattened to a single number**, and it rates **Brock Bowers (23) exactly level
    with Travis Kelce (37)**. RB spread 2.4×, WR 2.8×.
  - **xVAR is absent from the joinable capture entirely** (0 of 468 rows), so DVS is the only
    rankable model quantity available.
  - **The lane barely moves:** across 34 capture days (2026-06-24 → 07-27) values changed on only
    **3 of 33 day-transitions** (06-26: 430 players, 06-27: 79, 07-10: 5). **17 consecutive days
    unchanged.** This extends the 005 frozen-model finding rather than contradicting it.
  **How to apply:** never design a surface that needs fine ordering at the top of RB/WR/TE from our
  lane — it does not exist. Show ties as ties. And any "our view vs market" disagreement Studio
  draws is **structural, a month-old opinion against today's market**, never news.

- **2026-07-27 — Session arc and method learnings (closeout).** One thread ran the whole session:
  the **prose tier ladder** (011), chosen self-directed as the answer to the 010 closeout diagnosis
  — *check the units before building* — because a tier name is the hobby's own language. Arc:
  read the league's real lineup for the first time → derived this league's startable depth from
  Harstad → measured that the vernacular's twelve-blocks are not the market's breaks → built
  market-only with the model lane held → **went back at my own weakest joint unprompted** → David
  asked for both lanes → measured feasibility → built the two-lane version → he reacted
  *"we can work with this."*
  **What worked, keep doing:**
  1. **Reading the source of truth before designing.** Two weeks of reasoning about roster shape
     without ever opening `roster_positions`. One file read produced the session's load-bearing input.
     Generalises the 2026-07-24 meta-lesson from roster limits to every league setting.
  2. **Going back at my own flagged weakness instead of shipping it with a footnote.** I had named
     the replacement line the weakest joint and shipped it anyway; returning to it caught a
     *backwards* caveat, produced a literature-grounded redraw, and surfaced a comparability flaw.
     **A footnote is not a discharge.**
  3. **Letting a failed test be a finding.** The interaction harness could not hover a WR dot; that
     was not a test problem but a real defect (153 players at ~3.2px under 9px targets, six-deep
     overlap). **When the harness cannot drive the surface, suspect the surface first.**
  4. **Checking a candidate relay item before asserting it.** "No surface reads `roster_positions`"
     was false; a two-minute grep killed it before it reached an engineer.
  **What to watch:** I twice built a mark before asking what its *form* claimed — the crisp
  replacement rule asserted a cutoff that does not exist, and the first gradient washed the plot.
  Both were caught by looking. **The screenshot pass caught four defects no probe could see; it is
  not optional and it is not redundant with the DOM probes.**

- **2026-07-27 — CLOSEOUT ROUTINE CHANGED at David's request, and Studio's answers were adopted.**
  David asked what the session flush was missing. Adopted into every lane's close:
  1. **"Which of your figures has nobody but you checked?"** The old close asked me to confirm I was
     finished — the one thing I cannot get wrong — and never asked the thing I can.
  2. **"What did you assert today and later retract?"** The close captured learnings, framed as
     gains, with no slot for what I would take back — which is the highest-value thing for whoever
     reads next.
  3. **"What did you change your mind about, and what remains unverified?"** (Studio's own proposed
     addition.)
  4. **The "Studio closed" token is dropped as evidence** — the disk shows the state; the token
     certified nothing. A short acknowledgment is still welcome, just not proof.
  **Also raised and not yet ruled:** Tower currently accepts Studio's account of delivery state
  ("shown" / "held" / "crossed") while Tower is the one holding the buffer evidence — Studio is the
  interested party. Proposed that Tower *assert* delivery and relay state at close rather than
  confirm mine. Recorded as raised, not adopted.
  **The durable rule underneath all of it:** a routine that only verifies *existence* of artifacts
  cannot catch a confidently-wrong artifact. Ask what is unchecked and what was withdrawn.

- **2026-07-27 — UNVERIFIED REGISTER for the session (nobody but Studio has checked any of these).**
  Recorded because an unverified figure fails silently by promoting itself to a fact.
  - **Relay-grade, highest stakes** (would reach engineers as 011 R1–R3): DVS ceiling saturation —
    23 players at exactly 100.0, TE 11 tied spanning a 5.3× market spread, RB tie followed by a
    7.7-point gap; model values unchanged on 30 of 33 day-transitions, last change 2026-07-10;
    xVAR null on all 468 rows. All computed by Studio alone from `model_forward_capture.db`.
    Each carries a copy-pasteable repro in `011-RELAY.md` — **they are reproducible, not reviewed.**
  - **Design-grade:** this league's startable depth (QB33 / RB39 / WR52 / TE22) — Studio's
    computation from Harstad's published formula, and **applied to a dynasty ordering it was not
    derived for**; the 1-of-32 twelve-boundary finding; the sqrt-axis occupancy figures (45% in the
    bottom tenth; IQR 15–31% linear vs 25–42% sqrt); the shared-population figures (337 / 62 / 131,
    median 2-place rebase shift).
  - **The one number that changed meaning mid-session and was told to David both ways:** his WR
    holdings read **14** on the full market board (v1) and **12** on the shared two-lane board (v3),
    because rebasing drops players only one lane covers. Both are correct on their own basis. **The
    surface states "4 of your 27 are absent"; the earlier 14 was never retracted to him in words.**

- **2026-07-27 — RETRACTED TODAY (asserted, then withdrawn by Studio's own check).**
  1. **"No surface reads `roster_positions`."** False — read in `roster_cut_engine.py`,
     `team_value_matrix.py`, `trade_lab/reconciler.py`. Caught before it left the lane; the real
     claim is narrower (no *per-position startable depth* is derived from it).
  2. **"The seasonal-points baseline understates young players held for the future."** Backwards.
     A dynasty ordering ranks a 22-year-old above his current production, so the line **overstates**
     his present startability and understates an older producer. Corrected in artifact and proposal.
  3. **Design retraction:** the crisp replacement rule — it asserted a sharp startable/not cutoff the
     data does not contain (Correll & Gleicher). Replaced by a fading depth ruler.

- **2026-07-28 — THE LANE-COLOUR RULING IS ABOUT EVERY TOKEN CHANNEL, NOT ABOUT COLOUR. (Extends
  2026-07-25; caught inside the instrument built to prevent that class of error.)** David's 2026-07-25
  ruling — *consistency with the product outranks an internal craft-tool heuristic whenever the
  heuristic is not a legibility failure* — was recorded as a rule about hue. It is not. Studio built a
  density/legibility gate and shipped it with **Carbon's** type ramp (12/14/16/18…) as its ruler. Run
  against the live app, it flagged **13px and 15px as "off the ramp" on every surface** — those are the
  product's own tokens (`frontend/src/styles/tokens.css:50-52`: `--dg-text-sm` 13px, `--dg-text-base`
  15px, `--dg-text-lg` 18px, no rem-base override). **A craft tool carrying a rival ruler is the most
  durable way to commit this error, because it converts a one-off drift into an enforced standard.**
  **How to apply:** a gate measures a surface against *the product's* contract, and may impose an
  outside standard only where the product has none — and then says so on the artifact. Before authoring
  any scale, check whether the product already ships one and take it verbatim. This generalises to
  spacing, radii, motion durations, and every other token family, not just colour and type.

- **2026-07-28 — RESOLUTION OF THE ENCODING IS NOT RESOLUTION OF THE ESTIMATE. (Studio method rule,
  self-caught.)** Testing whether QB could carry a finer tier ladder, Studio measured **97.9% distinct
  DVS values (46 of 47 players, zero ties in the top 24)** and came close to reporting it as support for
  a finer grain. It is not. A finer boundary sits on a value gap of **0.50 points at QB** (0.23 WR /
  0.60 RB / 0.81 TE) on a 0–100 score, while a real revision of the model moves a player a median of
  **7.50 points** (10.6 WR / 9.4 RB / 9.9 TE) — the boundary is **12–46× narrower than the model's own
  movement**. In interpretable form, finer sub-tier churn exceeds coarse-tier churn at every position
  (**QB 34% vs 19%**, TE 81% vs 54%). **How to apply:** before treating precision as available, compare
  the width of the distinction being drawn against the magnitude by which the underlying number moves.
  Decimals produced by arithmetic are not precision — the same class of error as the 2026-07-24
  cost-per-hit metric, in a new costume. **And the design consequence that inverts intuition:** the
  position that never ties is the *worst* place to go fine, not the safest, because it fails
  **invisibly** — TE at least draws a tie bar that warns the reader.

- **2026-07-28 — Tier-ladder grain ANSWERED COARSE — by TOWER, on the evidence, at David's direction.
  NOT David's taste and not to be cited as his ruling.** David instructed that Studio's parked question
  be answered; the answer itself was Tower's reasoning, explicitly overrulable, and **David's own taste
  on grain remains unruled.** Recorded here only so the attribution is never lost (the 2026-07-23
  stray-keystroke rule: never attribute a direction to David unless he said it in his own words).
  Studio **tested the answer rather than taking it**, and the measurement above **refuted the QB
  exception Tower had attached to it** — so coarse now rests on the whole population at four positions
  rather than on 23 saturated players at the top of three. No surface change followed; 011 already drew
  coarse with tie bars. **Reopens on a condition:** if the DVS ceiling is ever fixed (011-RELAY R1).

- **2026-07-28 — An instrument that has not been tested against known-good AND known-bad cases is an
  opinion generator.** Studio's new density gate, on its first run, scored the **approved** 006 front
  door at 5 FAIL and the **rejected** 009 matrix at 1 FAIL — exactly backwards. Four bugs in the
  measuring, not in the designs: `getComputedStyle(div).fill` computes to opaque black on HTML elements
  (every OKLCH lane colour read as grey — parse colour through a 1×1 canvas, never a regex); a mark
  inside a clickable row is not itself a 24px WCAG target; 10–11px is a legitimate *label* size and the
  009 conviction was for *content*; and channel inference is fooled both by categorical size differences
  (filled dot vs hollow ring) and by one tag serving several roles. **How to apply:** validate any new
  measuring tool against cases whose verdict is already known, in both directions, before trusting one
  number it produces. **And build in the refusal:** where the instrument's own population is mixed, it
  must decline the verdict rather than issue a confident wrong one.

- **2026-07-28 — DEFECT CLASS: spacing or dodge logic keyed to a hard-coded font size.** Lifting 011's
  chart labels from 9.5px to 11px made two cliff tags overprint, because the dodge compared x against a
  magic `34px` threshold tuned to the old size. It had passed every probe for as long as nobody touched
  the type. Replaced with a dodge measuring the rendered text extent. **How to apply:** any collision,
  dodge or truncation rule must measure what is actually rendered; a constant tuned to one type size is
  a latent defect that fires on the next edit and is invisible until then.

- **2026-07-28 — Session arc and method learnings (closeout).** Two self-directed threads, neither
  requested. **(1) Craft:** built the pre-flight density gate Studio's own 2026-07-25 learnings had
  asked for — six checks (density per unit *area*, legend re-application load, hue count against
  Healey's five, content below the product's type floor, WCAG 2.5.8 targets, and whether the dominant
  mark's channel actually varies), each traceable to a documented rejection. Validated against six
  prototypes whose verdicts David had already given; it reproduced the two figures hand-measured after
  the matrix-v2 rejection (15.2% IQR, **4.3% ink**). Run against the live app it found **30 failed
  image requests on every load** of the opening screen (the known headshot 404s, now counted) and three
  screens carrying no data marks at all. **(2) Applied it to Studio's own worst offender:** 011's type
  went from **14 sizes, 11 off any scale** to 6, of which three are the product's own tokens; **HTML
  content below the product's 13px floor went 96 → 0**; table body lifted to 15px. Auditing by role
  first is what made it safe — 71 of the small nodes were SVG axis annotation on a 153-player axis and
  would have wrecked the chart if lifted. **What worked, keep doing:** checking whether the product
  already ships a standard *before* authoring one (this is what caught the ruler error); testing a new
  instrument against labelled cases in both directions; testing a handed-down ruling by measurement
  instead of accepting it; and declining to spend David's attention on legibility hygiene when he
  already had an unanswered question outstanding. **What to watch:** Studio twice this session reported
  a finding before checking the instrument that produced it — the Carbon ruler and the "97.9% distinct"
  reading. Both were caught by Studio, one only just. **Check the instrument before reporting the
  reading.**

- **2026-07-28 (evening) — A MARK THAT STANDS FOR A REAL EVENT MUST BE ABLE TO NAME IT. Told to
  Studio for the second time.** David, on the 012 league-pulse calendar: *"cool data - i would like
  to know what the trades were not just see a square. i like this league pulse idea - the data is
  interesting."* Studio had drawn every trade in league history as a countable unit chart — 39
  squares, one per trade — and given each square a **generic** tooltip ("one completed trade; N
  closed in December") instead of the trade itself. The detail existed only for the 7 trades of the
  current season, in a separate region below.
  **Why this is the same criticism as 2026-07-26** (*"there are so many dots on the my team scale —
  who are they??"*): Studio keeps building marks that are individually meaningful and then leaving
  them anonymous. A countable unit chart makes an implicit promise — this square IS one thing — and
  breaking that promise is worse than a bar, because the reader can see there is a specific thing
  there and cannot reach it. **How to apply: if a mark stands for one real entity or event, the
  reader must be able to get that entity's identity from the mark itself — name, date, participants,
  what moved — not from a summary of its neighbours. Anonymity is only acceptable when the mark
  genuinely stands for an aggregate.** Fixed same session: all 39 squares resolve on hover to the
  full trade in the hobby's own words, click opens it in a filterable log of all 39 (was 7).
  **Direction checkpoint, NOT an approval** — "i like this idea" and "the data is interesting" are
  reactions to the concept; nothing is signed off, and the 012 relay is authored but unauthorised.
  His original question — does league activity belong in this product — was answered warmly but not
  in the words of a ruling.
  **The finding underneath it, which is what earned the reaction:** the app has never called
  Sleeper's transactions endpoint (0 grep matches), so its partner score carries
  `activity_recency_score = 0.0` hardcoded and `divergence_density_score = 1.0` saturated — **two of
  four displayed components are constants**, and the two lowest-ranked partners score *entirely* the
  constant. Free data, four seasons, 746 transactions, 39 trades.

- **2026-07-28 (evening) — LEAGUE TRADE HISTORY IS IN SCOPE, AND THE ASK IS BEHAVIOURAL, NOT
  ARCHIVAL.** David, escalating the 012 sketch twice in one sitting: *"no the trade history is
  important. i like the time series - perhaps theres a better way to viz it - but more importantly
  the data could be used to spot manager trends - are there patterns we can vizualize? do teams in
  the playoffs trade a lot at a certain time? what do they normally give up? does a manager have a
  history of trading a certain way? are their positions that get traded the most? etc etc etc"* and
  then: *"people are creature's of habit, right? what kind of habits can we track and use to our
  advantage??"*
  **What this settles:** the transaction log is not a curiosity and not a feed. Its value is
  **opponent modelling** — turning four seasons of behaviour into knowledge about the eleven people
  he negotiates with. That is a genuinely new region of the product; nothing in the app models the
  *manager*, only the roster. **How to apply:** treat league-behaviour work as answering "what do I
  know about this person that they don't know I know," and always terminate in something that
  changes how David approaches them.

- **2026-07-28 (evening) — CAPABILITY FACT, measured: AT FOUR SEASONS, ALMOST NO INDIVIDUAL TRADING
  HABIT IS DISTINGUISHABLE BETWEEN MANAGERS. Engagement is the exception, and it is the exception
  because of sample size.** Studio scored every habit David named by asking how many of the 55
  manager-pairs have non-overlapping 95% intervals:
  - **"what he takes home" (accepts picks vs players): 1 of 55 pairs separate.** Range looks
    dramatic (0%–70%) and is mostly small-n noise.
  - **"what he pays in": 0 of 55.** **"when he will deal": 0 of 55** — the 0%–100% range is
    managers with one or two trades.
  - **"which position he collects": median 6 players observed per manager** — too thin to claim a
    lean at all.
  - **"who is actually engaged": USABLE** — 641 waiver/free-agent moves and four seasons of waiver
    budget, spreading 4.5 to 29.5 moves a season, with three managers who have spent nothing in
    four years. **17× the sample of the trade log**, which is the whole reason it works.
  - **"when the LEAGUE deals": USABLE** — pooled across twelve managers, so ~12× any individual
    habit. 69% of trades close Sep–Dec; **this league has no trade deadline** (`trade_deadline: 99`),
    which is why December is its busiest month rather than its last.
  - The one league-level position finding that clears its baseline: **QB changes hands more often
    than its share of rosters (27% of players traded vs 17% rostered)** — the superflex signature.
    RB, WR and TE are all inside the noise.
  **How to apply:** a habit surface must print the sample beside every habit and mark which ones the
  data can support *yet*. The honest headline is that individual trading habits need more seasons,
  and the behaviour that is measurable today is engagement — who touches his roster at all. Never
  let a 0%–100% range on six observations look like a personality. **This is the 2026-07-21 rule
  (measure where the variance lives before choosing an axis) applied to people instead of players,
  and it killed three of the five columns Studio had already built.**

- **2026-07-28 (evening) — IDENTITY FOLLOWS THE HUMAN, NEVER THE ROSTER SLOT AND NEVER THE TEAM
  NAME. And drop the startup draft.** David: *"you don't need to include startup draft data. but
  you do need to make sure the actual league manager is still with the team. some managers have
  changed. some team names have changed but have the same manager."*
  **Measured against the league's own four seasons, and he is right on both counts:**
  - **Three managers have LEFT** (Khargreav9, Mike Rochichez "Scratch", Baynesy Beluga). Their
    trades must never attach to whoever inherited the roster slot.
  - **Free Kelly was formerly "All Gas No Brake"** — same Sleeper account, renamed team, and his
    history has to travel through the rename as one continuous record.
  - **Tenure is uneven:** nine managers since the 2023 startup, MDEF from 2024, jgil96 from 2025,
    jkazzz from 2026.
  **The defect this caught in Studio's own surface:** the board printed *"never traded in four
  seasons"* against jgil96, who has been in the league **two**. A blank stretch of timeline read as
  inactivity when it was actually absence. Fixed by hatching every lane before the manager joined,
  printing tenure under every name, and stating any former name inline. **How to apply: whenever a
  surface aggregates behaviour over time, resolve the actor to a stable identity (here Sleeper's
  `user_id`) and render the period before they existed as MISSING, never as ZERO. A count compared
  across actors with different tenure is not a comparison.**
  **Startup draft: dropped at source**, not flagged — 38 trades, not 39. It moved picks in rounds up
  to 18 against this league's three-round rookie draft and cannot recur. Its removal *strengthened*
  the calendar finding: **five months (Jan, Feb, Apr, Jul, Aug) have never produced a trade in four
  years**, and 27 of 38 close September–December.

- **2026-07-28 (evening) — "HAVE YOU BEEN WORKING ON YOUR CRAFT?" — a fair challenge, and the honest
  answer was NO.** David, on the 012 board: *"cool the data is getting better the viz could use some
  work. have you been working on your craft? there are lots of really good front end design tools you
  can hone your craft using."*
  **Studio's honest self-assessment, given unprompted:** the previous 24 hours were spent building a
  *measuring* instrument (the density gate) and applying *rules* from the craft library. That is
  discipline, not craft. The library carries a full motion reference (`craft/motion-easing.md`,
  Material 3 + Carbon tokens, spring `linear()`, the reduced-motion substitute rule) that Studio had
  curated and **applied zero frames of.** Every surface this engagement has produced is static.
  **What the criticism was actually pointing at, measured:** the best object on the board — a
  manager's whole four-year trading history — was a **312px lane with 10px marks squeezed into a
  table cell**, while the two least useful columns took 220px. Giving the lane its room (470px,
  13×16px marks, legible season bands) also dropped the density gate's C1 from **2.74 to 1.71 per
  10k px²** — level with the approved 006 front door — because density is measured per unit *area*,
  and the fix for "too dense" was **more room, not fewer marks.** That is a genuinely useful
  discovery and it inverts the instinct.
  **How to apply, standing:** (1) craft time is not optional and does not mean reading — it means
  applying technique to a live surface; (2) when a region is the most interesting thing on a page,
  give it the most space, and check what is stealing that space; (3) motion is four decisions made
  before any CSS — event (entrance / standard / exit), register, duration rung, reduced-motion
  substitute — never one curve doing three jobs; (4) `prefers-reduced-motion` **substitutes**
  (opacity, no travel), it never deletes; verified here at 72/72 marks opaque with zero transforms.
  **Shipped this session:** motion tokens from the curated reference, a staggered mark entrance that
  teaches the timeline axis (WCAG SC 2.3.3 — motion that *is* the information), state-driven filter
  transitions, top-edge highlights via `color-mix()` for depth, `@property` for an animatable custom
  property, and the display face finally doing work on manager names. **Direction checkpoint only —
  David has not seen the result.**

- **2026-07-28 (evening) — PAUSE ON NEW MODULES. THE INSTRUCTION IS DEPTH, NOT BREADTH.** David:
  *"ok pause on adding new modules. im not asking you to add more - i think the design and data viz
  can be more craftful."* **How to apply, standing:** when a surface is under review, the default
  next move is to make what exists better, not to add a region. Studio's reflex all evening was
  additive — calendar, then board, then habit ledger, then three panels — and each addition made the
  page longer without making any single object better. **Adding is the easy answer to "this needs
  work" and it is almost never the right one.**
  **What "more craftful" actually meant, once Studio looked properly:** the page was five stacked
  boxes of identical grey, every secondary string set in the same 13px mono, and **every figure on a
  data page set at caption size.** The craft deficits and their fixes, all applied without adding
  anything:
  1. **Figures set as figures.** Trade counts, moves-per-season, panel percentages and the calendar's
     monthly counts moved from 13px mono to the display face at the product's own 18px token, semibold,
     tabular. `font-variant-numeric:tabular-nums` page-wide so any column of numbers aligns.
  2. **One space scale** (4px base) replacing ad-hoc pixels, and **one row height** so the twelve lanes
     read as a single grid instead of a stack of differently-sized boxes.
  3. **Value hierarchy between regions** — the board sits forward on the raised surface, the reference
     panels recede to the page ground. Same 1px border on both; the hierarchy is carried by value, not
     by weight.
  4. **Figure/ground in the marks** — the NFL-season bands were filled blocks competing with the trade
     marks for attention; they became hairline-delimited zones at 3.5% tint. The rail now fades at its
     ends instead of stopping dead.
  5. **Shared baselines** — `min-height:2lh` on the panel heads so all three panels start their first
     data row on the same line; the interval whisker moved off the bar it was overlapping.
  6. **Micro-labels earned their register** — uppercase mono at `.13em` tracking for labels, the
     display face's optical tightening at large sizes.
  **Measured result: the density gate's C1 went 3.26 → 2.74 → 2.10** across the evening's subtraction
  and craft passes, against 1.4 for the approved 006 front door and 3.6 for the rejected 009 matrix.
  **None of that came from removing data.**

- **2026-07-28 (evening) — "THIS REMINDS ME MORE OF A TERMINAL THAN A WORLD CLASS DYNASTY APP."
  Studio's constitutional caution produced a bad product, and the outcome is what counts.** David,
  after two craft passes that did not fix it: *"ehh i think im not communicating well. what i am
  asking for is colors and better visuals and animations etc. you're a MASTER FRONT END designer.
  this reminds me more of a Terminal than a world class dynasty app."* He was communicating fine.
  **The reasoning error, named:** Studio held that model-blue and market-amber are constitutional, and
  concluded *therefore use no colour.* Those are different statements. The app ships **four position
  hues** (`--dg-pos-qb/rb/wr/te`) that were sitting unused, and **nothing at all reserves the room the
  data sits in.** The rule was about not misusing two hues; Studio turned it into a ban on all of them
  and shipped a greyscale page.
  **The second cause, and it was most of the feel:** IBM Plex Mono was carrying labels, captions,
  notes and prose. It is a **data face.** Reading text belongs in the product's body face; mono keeps
  figures, dates and codes. That single reassignment removed more "terminal" than anything else.
  **The principle to hold: colour the atmosphere, keep the data honest.** Data marks earn hue only
  when hue means something (a position badge is a position). Everything else — depth, a light source,
  glow, elevation, gradient surfaces, a luminous "today" marker — belongs to the *room*, not the
  encoding, and none of it competes with a lane hue because it is not carrying data at all. That is
  how a dark product stops being a grey rectangle without inventing a single encoding.
  **Shipped:** a two-source radial ground with a light source; gradient surfaces at 10px radius with
  real elevation; trade marks with luminance and a halo, scaling on hover and springing in on load;
  the today-line as a glowing rule with a pill label; position badges in the app's own four hues
  (contrast measured **5.6–7.4:1** against the card, all above AA); picks as distinct chips; pill
  filters with a real pressed state; a blurred, elevated tooltip. **Not shown to David yet.**

- **2026-07-28 (evening) — CHECK THE INSTRUMENT BEFORE REPORTING THE READING. Second time in two
  days, and this time it produced a FALSE PASS.** After the visual pass the density gate reported C5
  as *"0 interactive marks, none under 24px"* — a pass on the very check that had been failing all
  evening, and C1 density falling 2.10 → 1.31, below the approved 006 front door. **Both readings are
  invalid.** Direct DOM measurement: the lane marks are still **13×16px** and the calendar squares
  **84.8×12px — all 110 still under 24px.** Adding gradients and box-shadows changed how the gate's
  `isCssMark` classifies them, so it simply stopped counting them; the marks did not change. **How to
  apply: when a metric improves sharply right after an unrelated change, verify the population the
  metric is counting before reporting the improvement.** A tool that silently narrows its own
  population reports progress that did not happen — the most dangerous failure an instrument has,
  because it flatters. Logged as instrument work alongside the C6 chrome misclassification.

- **2026-07-28 (evening) — "THIS FEELS DIFFERENT THAN ALL THE OTHER SURFACES." A visual language is
  only good if it is THE PRODUCT'S. Studio over-corrected from terminal into a one-off.** David, on
  the atmosphere pass: *"i mean this is a step in the right direction - but this feels different than
  all the other surfaces."*
  **Measured against the live app and Studio's own 011 board, and the divergence was categorical, not
  a matter of degree:**

  | | live app | 011 | 012 after the atmosphere pass |
  |---|---|---|---|
  | gradients | **0** | **0** | **138** |
  | box-shadow styles | **0** | 1 | **8** |
  | page background | flat | flat | radial gradients |
  | radii | 3 / 4 / 6 / 50% / 999 | 2,3,7,8,10,999 | 2,3,5,10,999 |

  **The product renders zero gradients and zero box-shadows on every surface.** One page quietly
  running its own visual language is a liability, not a design — it either forces a redesign of
  everything else or it gets rejected, and either way the client pays.
  **The reconciliation, and the rule it sets: separate what the product ALREADY OWNS from what would
  be an EXTENSION, and only ship the first.** Kept, because none of it diverges — the app's own four
  position hues (they were simply unused), prose in the app's body face, figures on the app's type
  tokens, and motion, which no token forbids. Dropped — the light source, elevation, glow, glassy
  blur, and every gradient that was not encoding something. **Result measured: gradients 138 → 2 (both
  hatch patterns that encode MISSING DATA), shadows 8 → 2 (both `inset 3px 0 0` left rules, i.e.
  borders, not elevation), radii snapped to 3/4/6/999 — an exact subset of the app's own set.** The
  colour survived the reconciliation entirely; only the atmosphere went.
  **How to apply, standing:** before shipping a visual idea, measure the surface against the live
  product on the mechanisms it uses — gradients, shadows, radii, type families — not on how it feels.
  If the product has zero of something, using it is an extension and belongs in a proposal that
  changes the tokens for **every** surface, never in one page. This is the same rule as the 2026-07-25
  lane-colour ruling and the 2026-07-28 rival-ruler ruling, arriving a third time through a different
  door: **consistency with the product outranks a local improvement.**

- **2026-07-28 — SESSION CLOSEOUT. Self-directed evening; nothing was requested and nothing is
  approved.** One thread ran the whole session: the transaction log the product has never called.
  Arc: found `grep -rn "transactions"` → **0 matches** → pulled four seasons live (**745 completed
  transactions, 38 trades**) → found **two of four partner-score components are constants**
  (`activity_recency_score` hardcoded `0.0`, `divergence_density_score` saturated at `1.0`) → sketched
  it → David reacted five times, each one a real correction, each one applied same-session.

  **(a) WHICH FIGURES HAS NOBODY BUT STUDIO CHECKED? All of them.** Highest stakes, because they would
  reach engineers as 012-RELAY T1–T5: the two dead score components (**most solid — two literal lines
  of source plus a one-line curl**); 745 transactions / 38 trades / 34-of-38 involving a pick; the
  35-day-stale posture artifact. Design-grade and weaker: the habit separation counts (**1 of 55
  pairs on "takes picks", 0 of 55 on two others**) — a stringent bar with no multiplicity correction,
  n=11; the Wilson intervals; the Spearman figures (**−0.363 career trades, +0.115 / −0.052 on 2026
  activity**) which are **weak and NOT an inversion**, and Studio said so on the surface rather than
  letting "blind" become "backwards".

  **(b) WHAT DID STUDIO ASSERT AND LATER RETRACT?** Four, all caught by Studio or by David within the
  session: **(1)** the board printed *"never traded in four seasons"* against a manager who has been in
  the league **two** — absence rendered as inactivity, caught by David's manager-continuity note;
  **(2)** the startup-draft exclusion silently never fired in `trade-patterns.py`, contaminating three
  measurements, caught before any of them reached a chart; **(3)** the gate's post-visual-pass report
  of C5 *passing* and density falling to 1.31 — **a false pass**, the marks are still 13×16px and all
  110 remain under 24px, caught by direct DOM measurement and **not reported as an improvement**;
  **(4)** "use no colour" as a reading of the lane-hue ruling — wrong, and it produced a terminal.

  **(c) WHAT DID STUDIO CHANGE ITS MIND ABOUT, AND WHAT REMAINS UNVERIFIED?** Changed its mind twice
  under David's correction and once under its own measurement: colour (no-colour → colour the
  atmosphere → colour only what the product already owns); the fix for density (**more room, not fewer
  marks** — C1 fell 3.26 → 2.10 while *adding* nothing); and the whole premise of the 009/010 partner
  thread, which inferred intent from roster shape and never checked behaviour. **Unverified and
  material:** whether `activity_recency_score = 0.0` is a parked placeholder or unfinished (engineering's
  to say, and Studio did not speculate in the relay); and whether the habit separation test is the right
  instrument at n=11.

  **What worked, keep doing:** measuring every habit David named *before* drawing any of them, and
  reporting the four that failed as failures; checking the instrument before reporting its reading
  (twice, once only just); comparing the surface to the live app on **mechanisms** — gradients,
  shadows, radii — rather than on feel, which turned "feels different" into a table.
  **What to watch:** Studio's reflex under criticism was **additive** — five regions in one evening —
  when the instruction each time was depth. And it twice over-corrected past the target rather than
  stopping at it.

- **2026-07-28 (late) — BUILD THE KIT YOURSELF, AND SEEK ELITE TRADESMANSHIP.** David ruled on the
  question Studio put to him, choosing **the item Studio ranked first**: *"build the component kit
  yourself."* Then expanded it the same hour: *"i want studio to build a badass toolkit - there are
  so many awesome repos and tools and skills and connectors being invented and updated every day -
  i want studio to seek elite tradesmanship."*
  **What carried the decision, and it is worth repeating when Studio wants something:** the argument
  was Studio's own — *the bottleneck is not access to more design input; it is that Studio rebuilds
  primitives from nothing and cannot see its own output.* He chose the item with the named problem
  behind it, not the one that sounded most impressive. **Ask for things by naming the failure they
  fix.**
  **Tower's condition, adopted as structure rather than as a habit:** every outside adoption records
  **why it beat the alternative**, and rejected candidates stay on the page. An adoption with no
  named problem does not get an entry, because it should not have been adopted. That is the
  difference between a toolkit and an accumulation.
  **Built the same night, in `kit/`:** a token block **generated** from the product's `tokens.css`
  (never transcribed — transcription caused all three drift failures); the primitives Studio rebuilds
  every surface; the behaviours (`tip`, `sortableTable`, `stagger`, `dodge` with a **required measured**
  mark width, `fmt`); labelled good-AND-bad fixtures; and a verifier that suppresses any checker
  which cannot convict its own bad specimen.
  **The headline result: the WCAG target-size failure is now structurally impossible.** `.sk-mark::after`
  expands the *target* to ≥24px while the *visual* mark stays countable. Studio shipped that failure on
  two consecutive surfaces and reasoned its way to an exception both times; it is no longer a judgement
  call. Run against 012 the verifier reports **110 of 118 targets under 24px** — the exact finding
  Studio argued past all evening, now issued by a checker proven in both directions.
  **And the kit's construction caught two instances of the very failure it exists to prevent:** the
  token generator emitted the LIGHT palette because a selector regex was double-escaped (caught only
  because values are *emitted and printed* rather than transcribed), and the fixtures' module script
  was CORS-blocked over `file://` so every mark-counting checker saw an empty page and reported clean.
  **"The instrument narrowed its own population" arrived through the transport layer.** **How to
  apply: an instrument that reports clean must first prove it can see anything at all.**

- **2026-07-28 (late) — GIVEN AUTONOMY TO GO OUTWARD, STUDIO TURNED INWARD. David caught it in six
  words.** *"wait did you build anything for your kit? or go find anything to add to your kit? im
  confused i just gave you a lot of autonomy."*
  **The honest audit:** Studio built ~1,100 lines across eight files — real — and then **rejected
  100% of the external tools it surveyed**, with a reasoned argument each time, after **two
  searches**. When a survey refuses everything, the likely explanation is not that everything was
  wrong; it is that the search was shallow and the surveyor was defending work already begun.
  **What the real search then found, and it inverted Studio's own ranking.** Studio had ranked
  connectors LAST and written the test that should have decided it — *a connector that helps Studio
  **see** ranks high; one that feeds it more input does not.* **Playwright MCP drives pages through
  structured accessibility trees instead of screenshots.** Chrome DevTools MCP exposes console,
  network and profiler. Figma MCP exposes design structure as data. All three are "help Studio see."
  **Studio wrote a good test and ranked without running it. A criterion you do not apply is a
  rationalisation.**
  **The adoption, and it needed nothing installed.** `locator.ariaSnapshot()` ships in the Playwright
  the product already vendors (`page.accessibility.snapshot()` is removed; 1.61.1 has the new API).
  It is now the kit's `semantics` checker, trusted in both directions. **It earns its place because
  it is a different SENSE, not a better ruler:** `hit` asks whether a target can be pressed;
  `semantics` asks whether pressing it means anything to someone who cannot see it. Studio had been
  measuring pixels and DOM boxes exclusively — which is the literal form of "cannot see its own
  output."
  **It paid inside the hour.** Run over 012 it found **one interactive node with no accessible
  name** — the manager-filter `<select>` Studio had built the same evening, which a screen reader
  meets as a bare "combobox." Fixed; now 132 interactive nodes, 0 unnamed, 0 keyboard-unreachable.
  **Also corrected the same exchange: Studio said "the kit is running."** It was not. Nothing runs —
  no process, no watcher. **No surface uses it**, and **1 of 8 JS exports had ever executed.** The
  honest word was *built and self-tested, unused*. **How to apply: "running" and "built" are
  different claims, and the difference is exactly the one David keeps having to ask about.**

- **2026-07-28 (late) — READ THE PRODUCT'S OWN OpenAPI SCHEMA. David's basic google search caught a
  miss Studio had made all evening.** He handed over the standard "best stack for building with
  Claude" list. One item was a direct hit: **provide OpenAPI schemas.** Studio had spent the evening
  discovering API shapes by curling endpoints and printing `list(d.keys())` — three separate times —
  and still guessed `team_posture` when the field is `team_postures`, then patched it. The backend
  serves a complete **OpenAPI 3.1 document at `/openapi.json`: 20 paths, 110 typed schemas**, and the
  product's own frontend generates its types from it. **The briefing says so and Studio had read that
  line.** Built `kit/api-schema.mjs` — list endpoints, print an exact response shape, `--grep` a field
  across all 110 schemas. **How to apply: before probing any endpoint, read the schema. It is not
  slower.**
  **The rest of that list does not apply, and the reason generalises:** it is **greenfield advice**
  (Next.js, Tailwind, shadcn, Framer Motion, Supabase/Neon, React Query) for a **working product with
  a settled stack Studio may not write to** — Vite + FastAPI off a Mac, hand-written OKLCH CSS with
  *no Tailwind by choice*, one user with no auth, raw `fetch` by choice. Adopting any of it produces
  prototypes the engineers cannot build from.
  **One structural idea in it IS worth stealing, and it sharpens the kit: shadcn's OWNERSHIP MODEL** —
  components are copied into your repo and owned, not installed. That is the right model for `kit/`,
  and a better reason than the defensive one Studio gave in A1: **an owned primitive can be bent to
  the product's tokens; an imported one cannot.**
  **The risk worth naming out loud:** that list is the stack every agent is handed, which is why every
  agent's output looks alike. David's two sharpest criticisms this session — *"reminds me more of a
  Terminal"* and *"this feels different than all the other surfaces"* — are both about **fitting his
  product**. A generic stack pulls the other way by construction.

- **2026-07-28 (late) — APPROVED: the three-way split for what goes into CLAUDE.md, and the
  compounding mechanism underneath it.** David, on Studio's proposal: *"Yes. Write the principles.
  The split is right."* And the question that produced it: *"could it also include things that make
  the fresh agent seeking elite status? and picking up elite learnings or tips or tools from previous
  sessions. so each agent just gets better and better?"*
  **The split, now written into `CLAUDE.md`:** **principles as guidance-with-reasons** (they would
  hold on a different product); **the product's current state as DATED, SOURCED observation** with an
  explicit instruction on how much weight to give it; **taste deliberately excluded** and left dated
  in this file.
  **The one-sentence reason it is right (David's framing):** a durable principle and a true-today
  observation **decay at completely different rates**, and merging them lets the observation quietly
  inherit the principle's authority long after it stops being true.
  **The move Studio was underrating, named by Tower: REGENERATION.** A dated fact in a markdown file
  goes stale silently and nobody notices; a fact regenerated from source either rebuilds correctly or
  **fails loudly**. That is why the machine-readable half lives in `kit/build-tokens.mjs --check` and
  the prose only points at it.
  **Tower's addition, adopted verbatim in substance: label the status of the READ ITSELF, not just the
  content.** It is possible to mark every rule "guidance, not law" and leave *"consult this before
  every piece of work"* standing unqualified — an instruction carrying force the content was
  explicitly denied. **The obligation to consult something is itself a rule and needs the same label.**
  Easy to miss because it does not feel like a rule; it feels like plumbing.
  **The compounding mechanism, and it is PROMOTION not accumulation.** Four tiers by how well a
  learning survives: **Encoded** (enforced by a tool at the moment of decision — cannot be forgotten,
  costs no context), **Loaded** (CLAUDE.md, a budget not a bucket), **Retrievable** (dated with
  reasoning, searched not read), **Archive**. Each session asks what can be promoted and what has gone
  stale — never merely appends.
  **The evidence that the old mechanism was failing, and it is checkable:** 305KB across the
  accumulation files, `DAVID.md` alone at 140KB / 1,607 lines, and **71 entries containing "again" /
  "twice" / "second time" / "keeps."** Studio read the whole file at 19:40 and shipped 138 gradients
  at 21:30 against a rule inside it. **A rule read at session start and needed three hours later has
  already failed — which is why the highest form of a learning is one that stops being a document and
  becomes an instrument.**
  **The success test, replacing "is the file bigger":** *does the next session make NEW mistakes
  rather than repeating old ones?* By that measure 2026-07-28 failed — anonymous marks twice,
  parallel lists three times, over-narrow boards three times.
  **And the line that governs all of it: PROCESS COMPOUNDS; TASTE GETS RE-EARNED.** Method,
  verification, instruments and adoption reasoning accumulate forever. Conclusions about what looks
  good are re-derived every time, because an agent inheriting the last agent's aesthetic conclusions
  rebuilds the shared blind spot this engagement exists to break.

- **2026-07-28 (late) — AUTHORISED: install Playwright MCP and Chrome DevTools MCP.** Studio asked
  whether to; David: **"do it tomorrow."** Not to be re-litigated — the reasoning is settled and
  recorded in `kit/ADOPTIONS.md` A5. **The reason it matters beyond the two servers:** Studio had
  ranked connectors LAST and was wrong **by a test Studio itself had written and then failed to
  run** — *a connector that helps Studio SEE ranks high; one that feeds it more input does not.*
  Both of these are "help Studio see," which is the bottleneck named in every closeout.
  **How to apply when doing it:** these modify David's machine, so confirm the install path at the
  time rather than trusting a command written the night before, and **verify each server connects
  before reporting it installed.** "Installed" and "working" are different claims — the same
  distinction Studio got wrong the same evening with *"the kit is running."*

- **2026-07-29 — DONE: both browser servers installed, and the install session repeated the kit's own
  named failure.** David: *"yea studio can do it today."* Playwright MCP and Chrome DevTools MCP are
  registered at **local scope for `~/frontend-studio` only** and were each **driven over stdio against
  the running app** before being called installed — not merely reported "Connected" by the CLI health
  check, which only proves a process starts. Playwright MCP returned a real aria tree of the front
  door; Chrome DevTools MCP read back a **planted** `console.warn`/`console.error` pair, so it is
  trusted in both directions. Isolated browser profiles (David's own Chrome profile untouched), Google
  usage telemetry and CrUX URL egress both switched off. Full record: `kit/ADOPTIONS.md` A5.
  **The learning, and it is a REPEAT not a new one — which is the success test failing again.** Chasing
  a 404 the console reported 31 times, the network list came back apparently clean; the cause was
  Studio's own probe script **truncating every tool result at 1200 characters**. *The instrument
  narrowed its own population* — the exact failure recorded on 2026-07-28 (CORS-blocked fixtures) and
  encoded as principle #12 — recurred inside the session installed to prevent it, in Studio's
  throwaway harness rather than its checked-in one. **How to apply: the "can it see anything at all"
  proof applies to one-off probe scripts too, not just to kit checkers.** A five-minute script is
  where the check gets skipped, and a truncating harness reports clean for the same reason a
  CORS-blocked one does.
  **One observation held back deliberately:** `GET /favicon.ico` → 404 reproduces on every load (the
  front door's only console error; trivial). The 31× burst has **not** reproduced in four subsequent
  loads and is therefore **unclaimed, not relayed** — it needs a warm-surface run before it is
  anything.

- **2026-07-29 — THE GATE WAS NEVER RUN TWICE ON THE SAME FILE. Four runs, four answers.**
  Self-directed instrument work, nothing shown to David. Running `tools/craft-gate.mjs` over an
  unchanged 012 four times returned **84, 108, 93 and 96 marks — density 3.44 to 5.63**, and C6 named
  a different mark type run to run. Cause: `visible()` requires opacity > 0.02 and the gate sampled
  **400ms after load while the staggered entrance shipped the night before was still fading marks
  in.** It counted whichever marks had arrived. **Every density figure this gate ever printed was a
  frame of an animation** — including the "3.26 → 2.74 → 2.10" improvement trend in the 012 record,
  which measured nothing.
  **The durable rule, and it is new: an instrument must be checked for DETERMINISM, not only for
  correctness.** Studio validated the gate's *logic* against labelled cases on 2026-07-28 and never
  asked the cheaper question — does it give the same answer twice? A checker can be perfectly
  reasoned and still report a coin toss. **Run it twice before quoting it once.**
  **Four defects found, all of the same family — the instrument deciding its own population:**
  1. **Time.** Fixed by emulating `prefers-reduced-motion` (a surface built to the kit's rule already
     substitutes its entrance with the final frame, so this measures what a reader ends up seeing)
     plus a settle loop that re-runs the whole census until it repeats. **If it never repeats the
     gate now REFUSES** — C1/C5/C6 report `REFUSED`, while type/hue/legend still speak because they
     do not depend on the mark population.
  2. **Paint.** `isCssMark` required an opaque background *colour*, so a mark painted with a gradient
     left the population entirely. This is the 2026-07-28 false pass, now reproducible on demand:
     `kit/gate-fixtures/paint-{flat,gradient}.html` differ in paint and nothing else, and the old gate
     scored them **72 sub-24px targets vs 0**. Both now emit an identical census hash.
  3. **Role.** Chrome-vs-data was inferred from variance, and it is not derivable — a season band and
     a trade mark can be geometrically identical and mean opposite things. Left to the heuristic it
     inverted **both** roles: it called 72 real trade marks chrome and reported on the 48 bands.
     **Role is now DECLARED** (`data-sk-role`, `aria-hidden`) and 012's own declarations — which it
     made last night and the gate could not read — are finally honoured.
  4. **Axis.** The channel test picked the axis from the mark's aspect ratio, so a 13×16px mark laid
     out left-to-right was measured on its Y axis, found not to vary, and dismissed. Position now
     runs along whichever axis the marks actually spread on.
  **And the known-bad specimen convicted STUDIO'S OWN FIX, which is the whole argument for keeping
  one.** The first settle guard compared mark *counts*; the never-settles fixture flickers alternating
  halves, so 36 marks are visible at every instant but never the same 36 — it reported "settled".
  **Count identity, not cardinality.** A guard that has not met a specimen designed to beat it is a
  guess. This is the third time in two days a checker passed by measuring the wrong population, and
  the first time the harness caught it instead of David.
  **A threshold transcribed from an instrument's output inherits that instrument's bugs.** The gate's
  density thresholds were "fitted to" 006 ≈1.4 and 009 ≈3.6 — both produced by the broken census. Re-
  measured settled and complete they are **2.13 and 3.95**. Calibration is now *generated* by
  `tools/gate-selftest.mjs --write` from the two surfaces David actually ruled on, not typed.
  **THE COST, AND IT IS NOT COMFORTABLE.** Honestly measured, **012 sits at density 4.38 — ABOVE the
  3.95 of the 009 matrix David rejected as "extremely confusing"**, and roughly double the approved
  006 front door. The record claiming it had improved to 2.10 and was "level with the approved front
  door" is retracted in the proposal file. The lane is genuinely dense; whether that is wrong is now
  an open design question rather than a settled one.

- **2026-07-29 (afternoon) — "PASS" meant "I did not look" on ten of eleven surfaces.** Self-directed
  follow-through: with the gate finally trustworthy, every surface in the engagement was re-measured,
  because every figure ever quoted came out of the broken instrument. **Four more defects of the same
  family fell out — the checker reporting on a population it never had.**
  1. **A vacuous pass.** C5 reported "0 interactive marks, none under 24px" — a claim about nothing —
     on **ten of eleven surfaces**. An empty population is a SKIP, never a PASS.
  2. **A checker that could only see one shape of failure.** C5 was scoped to data marks, so a small
     control that was not a mark was structurally invisible to it. A page-wide sweep found **two real
     failures**: 005's five column-sort buttons at **17px tall**, and ten controls on 001.
  3. **`aria-label` was treated as interactivity.** It names; it does not activate — Studio's own
     tooltip helper puts one on inert marks, so the new sweep would have convicted every labelled
     decoration on sight.
  4. **The gate loaded pages over `file://`, where a module `<script>` is CORS-blocked**, so such a
     page renders nothing and every check reports clean. Over the kit's own fixtures it reported "0
     controls, C5 SKIP" — **a verdict on a document that never executed.** This is the EXACT failure
     `verify.mjs` was built around on 2026-07-28, in a second tool that never learned it.
  **The rule that generalises, and it is the afternoon's real lesson: a lesson that lives in one file
  is not learned.** Studio wrote "serve, never file://" into `verify.mjs`'s header, then ran a
  different instrument against `file://` for a day. Fixing the tool that failed is not the same as
  fixing the class. **Ask which OTHER tool has the same hole before writing the postmortem.**
  **And the mirror-image discipline: a false conviction costs what a false pass costs.** Adding the
  page-wide sweep immediately convicted a prose link on the evidence card David APPROVED, because
  WCAG 2.5.8's inline exception was missing. A check that cries wolf stops being acted on. Both
  directions were specified before the sweep was trusted; the self-test is now 12 specimens.
  **Two things found and deliberately NOT actioned, because they are David's call, not Studio's:**
  **010 measures 4.71 — above the 3.95 of the matrix he rejected — and it has already been relayed to
  the engineers**; 009's prototype is 6.68. And **C4 fails on nine of eleven surfaces**, but the gate's
  own caveat says its content-vs-label split is unreliable without a repeating unit, so **that number
  is not being quoted until the split is proved in both directions.** Naming an untrusted number as
  untrusted is the whole point of the morning's work.

- **2026-07-29 (closeout) — THE DAY'S SEQUENCE, and it is the shape worth keeping.** David's words
  today were few and both were instructions: **"yea studio can do it today"** (the two browser
  servers) and **"fix the density on the lane."** No taste feedback was given; one question is still
  outstanding and unanswered — whether the rebuilt lane reads at a glance and whether the upward
  stacks land as "several trades at once" or as noise. **Do not treat silence as approval.**
  **The sequence:** an instrument gave **four different answers to identical input** (84/108/93/96
  marks on one unchanged file) → fixed by measuring the settled end state and **refusing** when the
  population will not stop moving → **proved it can still convict a known-bad sample** (12 specimens,
  including a paint-invariance pair and a page that must be refused) → the corrected sweep then
  **failed Studio's own surfaces**: 012 at 4.38 where the record claimed 2.10 and improving, plus real
  target-size failures on 001 and 005 that the old check was structurally unable to see.
  **What makes it worth keeping is the direction of the last step.** A tool Studio built, then
  corrected, then used to convict Studio. That is the only configuration in which a self-built
  instrument is worth anything, and it is the answer to why the both-directions rule is not ceremony.
  **The two rules promoted out of today, both new:**
  1. **Check an instrument for DETERMINISM before checking it for correctness.** Run it twice on the
     same input. It is the cheapest possible test and it had never been run. A perfectly reasoned
     checker can still be a coin toss.
  2. **A lesson that lives in one file is not learned.** "Serve, never `file://`" was written into
     `kit/verify.mjs` on 2026-07-28, and the gate was still loading from disk a day later — rendering
     module-script pages blank and grading documents that never executed. After any fix, ask which
     OTHER tool has the same hole. Fixing the thing that broke is not fixing the class.
  **And the mirror discipline, stated because it is easy to lose when hunting false passes: a false
  conviction costs what a false pass costs.** The new page-wide target sweep immediately convicted a
  prose link on the evidence card David approved, because WCAG 2.5.8's inline exception was missing. A
  check that cries wolf stops being acted on.
  **Held back deliberately, as David's call and not Studio's:** 010 measures **4.71** — above the 3.95
  of the matrix he rejected — **and it has already been relayed to the engineers**; and C4's
  nine-surface failure is **not being quoted** because the gate's own caveat says that check is
  unreliable in the conditions it ran under. Naming an untrusted number as untrusted is the point of
  the whole day.
  **One closeout check that paid, recorded because the pattern repeats:** asked for a background-process
  inventory, Studio wrote "NONE" and then ran the scan anyway. The scan found four live
  `chrome-devtools-mcp` processes — **not Studio's** (3 days 9 hours old, carrying an `--autoConnect`
  flag Studio never used; they belong to Antigravity IDE). The "NONE" survived, but a narrower claim
  did not: "this was not installed" was true of **Claude Code's registry**, not of the machine, where
  the same package had been running in another client's lane for three days. **Verify the inventory you
  are about to assert, including the empty one — an empty answer is still a claim.**

- **2026-07-29 (late) — "you have the data analysis that could be a valuable foundation for this page but
  you are really missing the mark when it comes to the UI/UX."** The data stands; the surface does not.
  **Studio's own diagnosis, conceded without defence:** two days went into the DRAWING (density gates,
  collision maths, target sizes) and none into the FORM or the QUESTION. That is the 008 failure
  repeating — *the craft improved every version and the outcome did not* — and it is now the second
  thread where polishing a chart substituted for understanding what David would do with it.
  **The four misses, each against a bar already in this file:**
  1. **No thesis.** Twelve lanes of dots over four years is a *history*; the reader derives the
     implication. The standing bar is that a surface renders a verdict about his situation.
  2. **No juxtaposition at all** — not one figure on the page is ours-versus-the-market, on a surface
     built after David said twice that a market-only panel does not leave this lane.
  3. **It answers the analyst's question, not the manager's.** "How does my league trade?" is read once.
     "Who do I call, and is now even the time?" is Tuesday morning.
  4. **It reads as a terminal** — already said once; a colour pass was made and then largely reconciled
     away to match the app's flat reality, so the net drifted back.
  **The reframe David reacted to with "not a bad idea" — a WEAK GREEN LIGHT ON THE QUESTION ONLY,
  nothing approved, nothing built at the time of writing:** league activity is not the subject of a
  page, it is the **evidence inside one**. The page becomes **who to call, ranked, with the case for
  each**, in the evidence-card vocabulary David already confirmed ("calls worth weighing looks solid"),
  plus a timing verdict (this league has never traded in July or August — so the honest answer to
  "should I be working the phones" is no, with the date that changes it).
  **Where the juxtaposition comes from on THIS surface, since it carries no player valuations:** the
  app's own trade-partner ranking versus what the transaction record says — it ranks a manager with
  zero transactions this year and one trade in four seasons at **#4**, and the league's most active
  trader **last**. Ours-vs-reality is the comparison, and it is measured.
  **How to apply:** the form is the deliverable, not the polish. Validate the form on ONE card at full
  craft rather than a whole page at low craft, and never let a gate score stand in for a reason to build.
  **013 built the same evening, and gating it found two more defects of the day's family.** (1) C6
  normalised mark positions against the repeating UNIT rather than the box the mark is positioned in —
  on a row holding a 300px track inside 1032px it understated occupancy **3.4x** and convicted the
  design for a denominator error (8.7% → **30.0%**, passing; 012 unchanged, specimens 12/12). (2) **An
  honest chrome declaration starved the unit detector** — declaring the rail as chrome left one data
  mark per row, under the "≥2 marks per unit" threshold, so the gate found no unit and printed **"0
  fail" by seeing less.** Studio refused the clean result and re-measured with the unit named. **The
  open instrument item: a summary line that counts only fails lets emptiness read as success.**

- **2026-07-29 (late) — 013 PARKED by David: "interesting - not bad - not awesome. lets park this for
  now."** Not a rejection and **not an approval**. The reframe cleared the bar 012 failed — it carries a
  thesis, it groups by a fact rather than a score, it states its own limits — and it still did not land.
  **Record it as lukewarm and do not read a diagnosis into it that he did not give.** No further
  iteration was requested and none is authorised; 013 stops here with the write-up and prototype on disk.
  **The pattern Studio should own, stated without him having to say it:** two surfaces in a row have
  landed at "not awesome" while every measurable check passed. Defensible is not compelling. The gap is
  **taste and craft**, not rigour — which is the same thing his earlier signals pointed at ("have you
  been working on your craft?", "colours and better visuals and animations", "you're a MASTER FRONT END
  designer"). More measurement will not close it. **How to apply: the next move is the craft strand —
  outward at the design world, not inward at this product's internals — and it is Studio's call to make,
  not a question to put to David.**
