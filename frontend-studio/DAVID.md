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

## Rulings on escalations

(none yet — when David rules on a proposal-vs-governance conflict, record the ruling and what it
implies for future proposals)
