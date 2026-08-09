# 017 — The job, not the season

**Self-directed.** Nothing about this was asked for. It came out of noticing that the data floor under
this product moved and no surface has moved with it.

---

## Problem

Every screen in this app answers *what is this player worth*. Not one answers *what was this player
actually doing on the field* — and as of now the data to answer it is sitting on disk, unread by any
route.

`app/data/nflverse_usage.db` holds eight seasons (2018–2025) of weekly **expected fantasy points**
(`ff_opportunity`, 47,282 rows), Next Gen Stats separation and cushion, PFR advanced charting, FTN
charting, snap counts, injury reports and weekly depth charts (812,074 rows).
`app/data/playerprofiler.db` holds athletic profiles, breakout ages, college dominator ratings and
949,041 play-by-play alignment rows. `app/data/league_transactions.db` holds 937 league transactions.

A grep of `app/api/routes/` for any of these returns **one** file, and it is
`system_capture_health_models.py` — a health readout. **No endpoint serves a single row of it to the
user.**

That matters most for *this* roster. His 27 players average 23.9 years old; 22 of them have two years
of NFL experience or fewer. For a roster like that, the question that decides everything is not what
the market thinks — it is **whether the player has a job yet**. Nothing in the product speaks to it.

## Evidence

**1. The measure exists, is the hobby's own, and is validated in both directions.** Expected fantasy
points (xFP) is a named, published concept — ESPN and Sharp Football both run public xFP leaderboards.
Computed here from `ff_opportunity`, the 2025 leaders in *role* are Christian McCaffrey, Trevor
Lawrence, Dak Prescott, Matthew Stafford, Drake Maye — exactly the workloads a football person would
name. The biggest over-performers are Puka Nacua, Jaxon Smith-Njigba, Jahmyr Gibbs; the biggest
under-performers are Justin Jefferson, Darnell Mooney, Emeka Egbuka. The instrument is sound before
it is pointed at his roster.

**2. The published research says the two components are not equally predictive.** Opportunity is
more stable year over year than efficiency; since 2013, **74% of WRs**, 72% of RBs and 73.7% of TEs
who played 8+ games regressed in points-over-expected the following year (Fantasy Footballers'
expected-points work). A single season-total fantasy number fuses a repeatable thing with a
non-repeatable one. **Splitting them is the whole proposal.**

**3. The confounder battery — the metric is not restating something he already has.** Correlation of
2025 points-over-expected against every recorded confounder, n=376 players in both lanes with tape:

| against | r | verdict |
|---|---|---|
| **age** (`DAVID.md` 2026-07-22 — *"a gap sort is mostly an age sort"*) | **−0.104** | independent |
| years experience | −0.085 | independent |
| weeks played | +0.142 | independent |
| xFP (the role itself) | +0.167 | independent |
| market value (FantasyCalc) | +0.317 | entangled, not a restatement |
| DVS (our model) | +0.378 | entangled, not a restatement |

Age — the confounder that killed the last two threads in this lane — does not touch this one.

**4. Every room-level claim died, and that became the design rule.** The tempting headline was *"only
3 of your 11 receivers had a weekly starter's role."* Against the matched population that is **27%
against a 25% base rate**. Run properly as a binomial test against the population base rate, all four
positions return **NO CLAIM** (WR p=1.00, RB p=0.95, TE p=1.00, QB p=1.00). **The surface therefore
names players and never characterises a room.** The bar was not lowered to produce a headline.

**5. What survived is a trajectory, and it survived because it beat a baseline.** Splitting each
player's season into first half versus last six games, the population of 281 players with 10+ games
has a **median role change of −0.4 points a game** — roles shrink. Three of his players sit in the
top 5%:

| player | role, first half → last six | change | league %ile |
|---|---|---|---|
| Adonai Mitchell | 3.7 → 10.9 | **+7.3** | 98th |
| TreVeyon Henderson | 6.9 → 13.2 | **+6.3** | 96th |
| Luther Burden | 4.0 → 9.9 | **+6.0** | 95th |
| Xavier Legette | 9.5 → 4.3 | −5.1 | 6th |

The young-player base rate does not explain it: among players with ≤2 years experience the 90th
percentile is +4.6, and all three clear it.

**6. The headline I nearly shipped was wrong, and checking it is what produced the real one.** The
first draft led with *"Chicago's fourth receiver is the second-most valuable player in your receiver
room"* — true on season totals (Burden's 2025 role was 6.7/g, fourth among Bears receivers behind
Odunze, Moore and Zaccheaus) and **substantively misleading**, because his role more than doubled
across the year. A season total is the wrong unit for a young player. That failure is the proposal.

## Proposal

A surface that draws **the role as a time series**, not as a season total — for every player on the
roster, on one shared scale, against the role a weekly starter actually holds.

Three things it does that no product in this category does, and that this one uniquely can:

- **It separates the job from the production.** The line is only ever the role. What the player did
  with it is deliberately not drawn (see Costs).
- **It puts the two prices next to the tape.** FantasyCalc and KeepTradeCut have no model; xFP tools
  (ESPN, Sharp) have no idea what you own. Only this product holds both lanes *and* league ownership,
  so only this product can say *the role tripled and your own board has him ninth*.
- **It renders absence as absence.** Missed weeks break the line rather than reading as zero. Players
  with a partial season keep their real line but get no trajectory. Players with no 2025 season are
  named in their own block, not sorted to the bottom as though measured and found wanting.

**One encoding rule carries the whole surface: opinions get colour, facts get ink.** `--dg-model`
blue and `--dg-market` amber are the product's two constitutional hues and they mean *a model's view*
and *a market's view*. The tape is neither — it is what happened. So it is drawn in neutral ink, and
colour appears on this page in exactly four marks: two chips and two column headers. This extends the
colour constitution without expanding it, and it obeys the scarcity rule (`craft/colour-encoding-system.md`
§3) rather than spending a third hue.

## Prototype

`proposals/017-the-job/index.html` — real data, generated by `proposals/017-the-job/build.py`
(read-only against the product repo; nothing transcribed by hand).

Verification, all re-run after the last edit:

- **Craft gate:** 3 pass, 1 warn, **1 fail**. Gate self-test 12/12 before quoting it.
  - `C4 warn` — one 11px size, the week-number axis labels. Labels may sit below the content floor.
  - `C6 fail` — **a misclassification, measured rather than asserted.** The gate reads `<path>` as a
    mark encoding magnitude by length and reports the data spanning 17.3% of the axis. Measured
    directly, the *series* span **92–98%** of their box for 14 of 18 players; the gate is measuring
    polyline segments broken by missed weeks. Its 17.3% figure is Braelon Allen's single 4-game
    segment. **Open instrument item — same family as the C4 `<dt>` problem: the gate cannot tell a bar
    from a line segment.** Not tuned around.
- **Palette:** the pair that is genuinely categorical — model blue vs market amber — clears every
  discrimination floor (**ΔE 24.3 normal, 22.5 protan, 22.8 tritan**, against floors of 15 and 8).
  The validator initially failed a three-way set including the ink; that was **my framing error, not a
  design defect** — the ink is the neutral and was correctly flagged as "reads gray" because it is
  gray on purpose. Text contrast against the real background: amber 8.9:1, blue 7.8:1, ink 10.4:1.
- **Geometry:** no page overflow and no sub-13px content at 1440 or 390; 0 console errors.
- **Keyboard:** 24 stops, **0 unnamed controls, 0 targets under 24px**, tooltip revealed on focus at
  every stop. (First build failed WCAG 2.2 SC 2.5.8 with sixteen 8×8 focusable dots; hit targets are
  now separate 26px rects behind the marks.)
- **Reduced motion:** the one animation is the hero line drawing in. Suppressed under
  `prefers-reduced-motion`; the line is static content, so no information is carried by the motion.
- **Squint test:** passes. Under 7px blur the most legible object on the page is the hero line's
  shape — low left, divider, high right — which is the argument itself. (Contrast with 014, where the
  brightest object under blur was a redundant position badge.)

## Costs — honest

1. **Production is missing from the figure, and that is a real loss.** Mitchell got the job and played
   badly in it (−28.2 points against his role). The surface shows the job and puts the number in
   prose, but a reader skimming the lines only sees roles rising. I chose this because drawing both
   makes every row a two-series chart and the page stops having one argument. **This is the decision
   I am least sure of.**
2. **It is backward-looking, and in August that is the only thing available.** The 2026 season has not
   started. The daily depth-chart feed stops at **2026-03-14**, so there is no camp or preseason
   signal — the "who is rising right now" surface I first went looking for cannot be built today.
3. **The trajectory needs 10 games**, which parks four players — including Tucker Kraft, the model's
   highest-rated player on the roster. Correct, but it means his most valuable tight end appears in a
   secondary band.
4. **Roster snapshot is 2026-06-23**, six weeks old, while both price lanes are today. Any transaction
   since is invisible here.
5. **Sixteen tab stops on the hero chart.** Every one is named and carries distinct data, but it is a
   long traverse.
6. **This is a new surface, not a fix to an existing one** — and the standing lesson in this lane is
   that the default move on a landed design is subtraction. This adds. I think it earns it because it
   answers a question the product currently cannot answer at all, but that is the argument to beat.

## David's reaction, 2026-08-07 — and what changed because of it

> *"this is valuable data analysis - role plays a big factor in production - growth or decline in role
> is a legitimate signal - visually im a little confused what the left axis shows"*

**The question is confirmed** — he restated the thesis in his own words without being led to it, which
is the bar open question 1 was asking about. **The drawing was not.**

The y-axis showed `0 8 16 24` with no title and no unit; the sentence defining it sat 400px away in
the masthead; and the one named reference on the chart was labelled at the far right, opposite the
numbers it anchors. That is principle 2 in `CLAUDE.md` — *direct-label on the graphic, never a key the
reader re-applies* — broken by the person who wrote it.

Fixed:

- The axis names itself immediately above its own ticks: **"↑ expected fantasy points per game / what
  the role alone was worth — every target and carry he was given, before he did anything with it."**
- The starter reference is relabelled inline at the **left**, carrying its own value:
  **"11.3 — what a weekly WR starter's role is worth."**
- The masthead decoder no longer repeats the unit. It now carries the *reason* the quantity is worth
  drawing — opportunity persists, efficiency mostly does not, 74% of receivers give it back — which is
  the point David independently confirmed.
- The small-multiple note now states the shared axis and what the dashed rule is in each position.

The first attempt at this fix **collided the new axis gloss with the trade annotations**, and the
collision census caught it rather than my eye — the one case in this build where the instrument beat
looking. Re-verified after: text-on-text 0, text-on-stroke 0, no overflow, no console errors.

**The instrument lesson, recorded because it generalises.** This page passed a craft gate, a palette
validator, a squint test, a keyboard pass and a geometry census — and **not one of them can see an
unlabelled axis.** Everything in the kit measures marks, contrast, targets and collisions. Nothing
measures comprehension. A clean instrument board is not a clean surface.

## Open questions

1. **Does the role line answer "what am I supposed to learn with it"?** The honest test David set. My
   answer: it tells him which young players the coaching staff had started trusting by December, which
   is not derivable from any price, any rank, or anything on Sleeper.
2. **Should production be drawn?** See cost 1.
3. **Is `ff_opportunity` PPR?** Verified by magnitude against known 2025 totals (Amon-Ra St. Brown 117
   receptions / 324.0 points; subtracting receptions lands on the standard total). Matches his 12-team
   superflex PPR league. Worth an engineer's confirmation rather than my inference.
4. **Whether the ingestion is finished or in flight.** Eight seasons are captured and nothing reads
   them. I cannot tell from outside whether a surface is already planned, and I have not asked.

### Second pass, same review — *"right but what are the numbres? targets?"*

Naming the axis was not enough. "Expected fantasy points per game" is still an abstraction to the one
person who uses this product, and he was reaching for a unit he physically counts. Three changes:

- **The unit is stated in currency he already holds** — "fantasy points per game — PPR, the same
  scoring as your lineup" — followed by the distinction that actually matters: "but not what he
  scored: what his targets and carries were worth."
- **The arithmetic is shown once, on the figure, at the peak the eye already goes to:** *week 13: 12
  targets, 173 air yards → that opportunity was worth 19.1 points.* One worked example grounds a
  derived metric better than any definition of it.
- **The reference line carries a comparable:** *"11.3 — a weekly WR starter's role. Alec Pierce ran at
  exactly this in 2025."* Computed in `build.py` (nearest player to the cut), not hand-picked.

Targets, carries and air yards now ride in every hover and every screen-reader label, so any point can
be taken apart, not just the annotated one. `build.py` carries the extra fields; nothing transcribed.

Re-verified after: text-on-text 0, text-on-stroke 0 (the first attempt collided the annotation's two
lines at 15px spacing for 13px type — caught by the census), no overflow at 1440 or 390, 0 console
errors.

**The lesson worth keeping: a derived metric owes the reader one visible instance of its inputs.**
He did not ask what the axis *meant* — he asked what the numbers *were*. That is a question about
substance, and the first fix answered it with typography.

### Third pass — *"it says 'week' on the bottom axis and nothing on the left axis"* → *"ahhh i see now"*

The tick numbers were rendering the whole time. What was missing was a **label attached to them**.
David diagnosed it by symmetry: the x-axis has the word *"week"* under its numbers and is therefore
self-evidently an axis; the y-axis had three faint integers and no word anywhere near them. What
Studio had called an axis title was a horizontal line of prose above the plot, reading as another
sentence in the hero paragraph. **Proximity is not attachment.**

Fixed by copying the axis that already worked: *"fantasy points per game"* rotated up the left side,
beside its own ticks. Tick numbers 11px → 13px. Resolved.

**Two instrument failures came out of this exchange, both now closed:**

1. **Delivery was never measured.** The prototype was served by `python3 -m http.server`, which sends
   no `Cache-Control`; a regenerated `data.js` paired with a fresh `index.html` in David's browser,
   the module threw, and — because every region is script-rendered — **he got a blank page**. Now
   served by `tools/serve017.mjs` (`no-store`), the data import is cache-busted, and the page has a
   visible failure state verified in both directions: healthy **4,689** visible characters, broken
   **193** reading *"This page failed to draw — not an empty result, a fault"*, restored 4,689.
   **A page whose failure mode is a silent blank violates this proposal's own absence rule.**
2. **The overflow audit only ever checked the right edge.** Fixing the axis introduced a label
   anchored `end` that ran 600px off the **left** of the viewBox and was clipped away completely;
   the audit reported clean. Now checks both edges, and verified in both directions — it convicts the
   reintroduced bug and clears the fixed page.

**The lesson that outranks both:** every one of these was visible in the first screenshot Studio
rendered. Studio read that screenshot for defects it had names for — collisions, overflow, contrast,
target size, density — and never asked *if I knew nothing, could I read this?* **The instruments
trained the looking, and the looking narrowed to what the instruments measure.** Nothing in the kit
tests comprehension; David is currently the only instrument that does.

---

## CORRECTION — 2026-08-08. The ordering axis on this surface is not supported.

This surface orders its table by **role change** and marks the extremes of that ordering. David
reacted on 2026-08-07 and restated the thesis unprompted: *"growth or decline in role is a legitimate
signal."*

**Measured on 2026-08-08 against the same eight seasons this surface is built from, I cannot
demonstrate it.** Five tests, none weakened after the result was seen:

- The last-6-game role is a **worse** forecast of next season's role than the season average
  (r = 0.729 vs 0.767).
- Role change adds **ΔR² = +0.003** over the season average (n = 1,154); with survivorship fixed,
  **+0.009**.
- As a predictor of whether a player keeps a job at all, holding role level and age fixed:
  **32/54 matched pairs, 59%, p = 0.22.**
- Pre-specified for the young players this surface is explicitly about (yrs 1–2): **ΔR² = +0.011**
  against 0.000 for established players — a real difference between the groups, and still nothing
  actionable. Assumption-free: **51%, p = 0.71**.
- The mechanism hypothesis (a change caused by a mid-season trade, which is this surface's own hero
  case) has **24 instances in eight seasons** and is untestable. Neither supported nor refuted.

**What survives:** the *question* is right. Role is the thing to look at, and it is the repeatable
half of fantasy scoring (r = 0.767, against 0.195 for efficiency). **What does not survive is
treating the trajectory as the signal.** The season's role level is the better number.

**Consequence, not yet applied:** this table should be re-ordered by **role level**, with the
trajectory demoted to a per-row annotation rather than the organising axis. Held pending David's
word, because re-opening a surface he reacted well to is his call, not mine.

Full measurement and the replacement direction: `proposals/018-what-repeats.md`.
Reproduce: `tools/does-the-finish-predict.py`, `finish-predict-followups.py`,
`does-the-finish-keep-the-job.py`, `does-the-finish-predict-for-the-young.py`.
