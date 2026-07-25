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
