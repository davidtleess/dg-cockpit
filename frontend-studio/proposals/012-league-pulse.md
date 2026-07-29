# 012 — Your league has a pulse; the app has never taken it

**Status: sketch shown to David 2026-07-28 evening. Direction checkpoint, NOT an approval.**
Self-directed; nobody asked for it. The relay is authored and **not authorised to cross**.

## David's reaction, verbatim (2026-07-28 evening)

> *"cool data - i would like to know what the trades were not just see a square. i like this league
> pulse idea - the data is interesting"*

**What changed as a result, same session:**

- **Every one of the 39 squares now names its own trade.** Each square is a real `<button>` keyed
  to a transaction id; hover gives the date, both managers, and exactly what each received, in the
  hobby's words ("Free Kelly got Travis Etienne (RB), Kenneth Walker (RB), 2026 1st"). Verified:
  **39/39 squares resolve.** Clicking one opens that trade in the log below and highlights both.
- **The log went from the 7 trades of 2026 to all 39**, with filters — season, only mine, moved a
  1st, and any manager — because one population with several ways in is the standing rule, not four
  separate views. A click on a square whose trade a filter would hide **widens the filter** rather
  than doing nothing.
- **The 2023 startup-draft trade is marked as a one-off** (hatched square, tagged card). It is the
  only trade in four years that moved picks deeper than round 3, and unmarked it would have implied
  July is a trading month. It is not; it is the league's first-ever draft.
- **No "biggest trade" sort**, and the surface says why: this app's market history begins
  2026-06-24, so a 2023 deal cannot be priced.

**The durable lesson, recorded in `DAVID.md`:** a mark that stands for one real event must be able
to name that event. This is the second time Studio has been told a version of it (2026-07-26,
*"there are so many dots — who are they??"*). A countable unit chart makes an implicit promise that
each square IS one thing; leaving it anonymous breaks that promise in front of the reader.

## David's second and third reactions, verbatim (same sitting)

> *"no the trade history is important. i like the time series - perhaps theres a better way to viz
> it - but more importantly the data could be used to spot manager trends - are there patterns we
> can vizualize? do teams in the playoffs trade a lot at a certain time? what do they normally give
> up? does a manager have a history of trading a certain way? are their positions that get traded
> the most? etc etc etc"*

> *"people are creature's of habit, right? what kind of habits can we track and use to our
> advantage??"*

**This changed the surface's job.** It is no longer a feed or an archive — it is **opponent
modelling**: turning four seasons of behaviour into knowledge about the eleven people David
negotiates with. Nothing in the app models the *manager*; it only models rosters.

### The measurement pass, run before anything was redrawn

Every habit David named was scored on one test: **how many of the 55 manager-pairs have
non-overlapping 95% intervals?** A habit nobody can be distinguished on is not a habit yet.

| habit | sample | pairs separating | verdict |
|---|---|---|---|
| Who is actually engaged (roster moves, waiver spend) | **641 moves**, 4 seasons | range 4.5–29.5/season, sd 6.8 | **usable** |
| When the LEAGUE deals | 39 trades pooled over 12 managers | 69% Sep–Dec (CI 54–81%) | **usable** |
| What he takes home (accepts picks vs players) | 38 trades, ~6 each | **1 of 55** | not yet |
| What he pays in | 38 trades | **0 of 55** | not yet |
| When he will deal | 38 trades | **0 of 55** | not yet |
| Which position he collects | median **6** players seen per manager | — | too thin |

**The honest headline, and it cuts against what I had already built:** at 39 trades over four
seasons, almost no *individual trading* habit separates one manager from another. What does
separate them is how often they touch their roster at all — and that runs on 641 observations
instead of 6. **Three of the five columns I had built came straight back out**, including a
"takes picks" bar that the page's own ledger declared unusable.

What the test cannot see, stated per the 2026-07-25 rule: pairwise 95% separation across 55
comparisons is a stringent bar, and the extremes remain *facts about what has happened* even when
they are not yet *predictions*. Kissane's Team has accepted zero picks in three trades. That is
worth knowing before offering him picks; it is not yet a law.

### What changed as a result

- **The board became the time series.** Each manager's row is now his entire four-year trading
  history on one shared axis — one mark per trade, NFL-season windows shaded behind, every mark
  naming its trade and opening it below. This answers "does a manager have a way of trading" and
  "when do they trade" in the same object, and it is the better version of the time series David
  asked for. Marks that would collide are dodged by measured extent, not a magic constant.
- **A habit ledger**, in David's own framing: every habit, what knowing it would let him do, its
  sample, and whether four seasons can support it *yet*.
- **Three league-level panels**: which positions move (only **QB** clears its share of rosters —
  the superflex signature; RB/WR/TE are inside the noise), the shape of a deal (**63% players for
  picks**; this league has **no trade deadline**, `trade_deadline: 99`, which is why December is
  its busiest month rather than its last), and the honest negative on playoff timing.
- **The playoff question got answered, and the answer is "not yet."** Every 95% interval overlaps
  between playoff and non-playoff teams, on 31+31 trade-sides that are *not independent* because
  most trades pair one of each. Drawn as overlapping intervals rather than hidden.

## David's fourth correction, verbatim — and the defect it caught

> *"you don't need to include startup draft data. but you do need to make sure the actual league
> manager is still with the team. some managers have changed. some team names have changed but have
> the same manager."*

**Both correct, and the second one caught a false statement already on the board.**

Measured from four seasons of rosters and users, joined on Sleeper `user_id`:

- **Three managers have left the league** — Khargreav9, Mike Rochichez "Scratch", Baynesy Beluga.
  Their trades must never attach to whoever inherited the roster slot. (They were already excluded
  from the board, which is built from the 2026 roster list, but nothing said so.)
- **Free Kelly was formerly "All Gas No Brake"** — same account, renamed team. His history travels
  through the rename as one record, which the `user_id` join already did; the surface now says so.
- **Tenure is uneven:** nine managers since the 2023 startup, MDEF from 2024, jgil96 from 2025,
  jkazzz from 2026.

**The defect:** the board printed *"never traded in four seasons"* against **jgil96, who has been
in the league two.** A blank stretch of timeline was reading as inactivity when it was absence —
and jkazzz's two trades looked like a low rate when they are two trades in a single season.

**Fixed:** every lane hatches the period before that manager joined, tenure prints under every name
("here since the startup" / "joined 2025"), former names are stated inline ("was All Gas No Brake"),
and the trades tooltip carries a per-season rate so counts across unequal tenure are comparable.

**Startup draft: dropped at source, not flagged.** 38 trades, not 39. It moved picks in rounds up
to 18 against this league's three-round rookie draft and cannot recur. Removing it *strengthened*
the calendar finding — **five months (Jan, Feb, Apr, Jul, Aug) have never produced a trade in four
years**, and 27 of 38 close September–December (71%, CI 55–83%). All prose figures on the surface
are now read from the data rather than typed, so they cannot drift again.

**What is still not settled:** David has confirmed the trade history matters and named the
direction. He has not seen the habit work, and nothing is approved.

## Known deviation, stated rather than tuned away

`tools/craft-gate.mjs` fails this surface on **WCAG 2.2 SC 2.5.8 (24px target minimum)**: the trade
marks are 10–12px. Kept deliberately — countability is the mark's entire purpose, and the standard's
*equivalent control* exception is genuinely met (every trade is also a full-width card in the log,
and every mark is a real focusable `<button>`, so keyboard reaches all 38). Density warns at 2.74
per 10k px² — between the approved 006 front door (1.4) and the rejected 009 matrix (3.6) — after
three columns were cut. Type carries two declared extensions above the product's three tokens.

---

---

## The finding, in one line

Sleeper publishes this league's complete transaction history on the same free, read-only,
no-auth API Dynasty Genius already calls eleven other ways — **746 completed transactions and
39 trades across four seasons**. The product has never called it once (`grep -rn "transactions"
src/ app/ scripts/` → **0 matches**), and one component of its own trade-partner score is a
hardcoded zero as a direct consequence.

---

## Problem

The engagement has spent three threads (009, 010, and David's 2026-07-25 conjunction ruling)
trying to answer *"who should I deal with?"* from roster composition alone. Every version was
built on the same premise: **infer what a manager wants from the shape of his roster.**

The premise was never tested against the thing that would settle it — what the manager actually
did. That record exists, is free, and is one endpoint away.

### What the app currently believes, read live from `/api/league/pulse`

The partner score is presented as a four-component composite with per-component evidence
(`frontend/src/league-pulse/PartnerRankings.tsx:13` renders all four). Measured across all
eleven counterparties:

| component | range across 11 teams | live? |
|---|---|---|
| `complementarity_score` | 0.0 – 1.0 (8 distinct values) | yes |
| `posture_alignment_score` | 0.0 – 0.25 (4 distinct values) | yes |
| `divergence_density_score` | **1.0 for every team** | no — saturated |
| `activity_recency_score` | **0.0 for every team** | no — hardcoded |

`src/dynasty_genius/league_opportunity_map.py:185` reads, in full:

```python
activity_recency_score = 0.0
```

and line 184 is `_safe_score(len(divergence_rows) / 5.0)`, which clips at 1.0 — every team in a
12-team league clears five divergence rows, so it is a constant by construction.

**The consequence:** the two lowest-ranked partners score exactly **1.00**, which is
*entirely* the dead constant — complementarity 0, posture 0. The app reports a score containing
zero information about them, ranked, with evidence, in a UI region David reads.

And the component David's own 2026-07-25 ruling identifies as the thing that *makes a gap
actionable* — posture — is worth at most **0.25 of a 2.17 top score, about 11%**.

### What the transaction log says, and where it contradicts the app

| | app says | actually did (2026) |
|---|---|---|
| **Seidmans Sasquatches** | ASCENDING, **partner rank #4** | **zero transactions of any kind all year**; 1 trade in 4 seasons |
| **jkazzz** | ASCENDING, **partner rank #11 (last)** | most active manager in the league — 15 moves, 2 trades, moved **today** |
| **Free Kelly** | BALANCED | spent **four** future firsts in May to acquire **Josh Allen and DK Metcalf** |
| **Drew P. Bauls** | BALANCED | **net +4 picks**, including three firsts — a rebuilder buying futures |

**I am not claiming the ranking is inverted.** I measured that and it is not: Spearman between
the app's partner rank and career trade count is **−0.363** (n=11, weakly in the *right*
direction), and against 2026 activity **+0.115 / −0.052** — i.e. essentially zero. The honest
claim is narrower and still serious: **the ranking is blind to reachability, not hostile to it.**
It cannot distinguish a manager who has not moved in four years from the one who traded this
morning, because it has never looked.

### The calendar the app has no concept of

David's own standing domain note (2026-07-24 §5): *"the seasonal trade calendar is real and is
the rebuilder's engine."* Measured from four seasons of this league's own log:

- **27 of 39 trades (69%, Wilson 95% CI 54–81%) close between September and December.**
  December alone is 12.
- The offseason peak is **May (8 trades)** — rookie-draft season.
- **January, February, April and August have never produced a single trade in four years.**
- **87% of trades (34/39) include at least one draft pick.**
- Today is **28 July**. The last trade in this league was **51 days ago, and it was David's own.**
- August is the league's **second-busiest month for roster churn** (65 waiver/FA moves) and its
  **deadest for trading** — churn and dealing are different signals, and only one of them is
  visible in this product today.

---

## Evidence

- **Endpoint availability**: `GET https://api.sleeper.app/v1/league/{league_id}/transactions/{round}`,
  rounds 1–18, no auth, same host and client the product already uses. Verified live for all four
  of this league's season ids (2023 `912589367620100096` → 2026 `1314363401744416768`).
- **Briefing §4 already records the gap**: *"The league-transactions endpoint exists at Sleeper but
  is not called anywhere in this codebase — past transactions are not in the snapshot."* It was
  written down as a fact and never read as a cost.
- **Category precedent**: Sleeper's own app opens its league tab on a transaction feed; ESPN and
  Yahoo both surface league activity as a primary league-level object. Reading what the league did
  is not an exotic feature — it is the convention this product is missing.
- **Reproduction**: `analysis/pull-transactions.py` (SSL-blocked on system python; the curl loop in
  `analysis/txn-raw/` is the working pull), then `analysis/build-activity-data.py`.

---

## Proposal

**No surface is proposed yet.** Per the 2026-07-25 hard rule — *when a surface answers a new
question, state the question in one line and get it confirmed before building anything* — this
sketch exists to put one question to David:

> **Does what your league actually does — who is active, who is dealing, when, and for what —
> belong in this product?**

If yes, the natural home is region 3 of the question ladder ("what should I do"), and it changes
the 009/010 thread's input rather than its drawing — which is the 2026-07-26 lesson from 010
(*when a surface is not landing, iterating the drawing is the wrong move; the premise is what
needs re-examining*).

## Prototype

`proposals/012-league-pulse/prototype.html` — self-contained, built by
`proposals/012-league-pulse/build.py` from `analysis/league-activity.json`.

Three regions, deliberately rough, nothing filtered by default:

1. **When does this league actually deal?** — every trade in league history, one square each,
   as four season small-multiples over a twelve-month axis, with today marked and 2026's
   unplayed months hatched rather than left to read as quiet. **Every square names its trade on
   hover and opens it on click.**
2. **Who is even reachable?** — all twelve managers (David pinned top), the app's posture and
   partner rank on the left of a seam, what they actually did on the right. Sortable on every
   column; hover on every mark.
3. **What every one of those trades actually was** — all 39, newest first, in the hobby's own
   words ("Free Kelly received Josh Allen (QB), DK Metcalf (WR)"), with four filters over one
   population.

### Craft notes

- **Tools loaded: `dataviz` and `frontend-design`.** Both, this time.
- **No new hue.** Model blue and market amber are constitutional and mean model-lane /
  market-lane; neither lane appears on this surface, so neither hue is borrowed. Type tokens are
  the product's 13/15/18px verbatim; the two sizes above them (22, 42px) are declared extensions.
- **Season is position, not shading.** The first draft stacked four seasons in one column with a
  lightness ramp and a four-entry key — `tools/craft-gate.mjs` failed it on C2 (Okabe & Ito:
  direct-label, never a key), and it was right. Small multiples removed the key entirely and read
  better.
- **The dashed zero line** in the pick column is dashed specifically so it is not confusable with
  the solid lane seam three columns to its left — same form, different meaning is the 009-matrix
  failure.
- Gate result: **0 fail, 2 warn** (density 2.22/10k px², between the approved 006 front door at
  1.4 and the rejected 009 matrix at 3.6; and the two declared type extensions).

---

## Costs, honestly

1. **A transaction record is history, not intent.** It says what a manager has done; it never says
   what he will do next. A dormant manager may answer a DM tomorrow. This is decision *support*,
   and the surface says so.
2. **n=39 trades over four seasons.** The Sep–Dec concentration is solid (CI 54–81%); the
   month-by-month detail is not, and the surface states the interval rather than implying
   precision.
3. **Manager turnover.** Two of the twelve have fewer than four seasons here (jgil96 2, jkazzz 1),
   so "career trades" is not a like-for-like column. It is labelled with seasons-in-league beside
   it, but it remains an unequal comparison.
4. **It adds a daily fetch.** One more Sleeper call in the morning capture chain, on an API that
   is already being hit eleven ways. Small, but not free.
5. **Posture disagreement is not proof the app is wrong.** The app's posture is a roster-shape
   label and was never meant to be a behaviour label. The claim is that a behaviour signal exists,
   is free, and is currently modelled as the number zero — not that the roster-shape read is
   invalid.
6. **This does not fix the deeper instrument problem.** The 2026-07-26 shared-population finding
   still stands over every model-vs-market mark in this product; nothing here touches it.

---

## Open questions

1. **The one for David:** does league activity belong in this product at all? (Everything else
   waits on that.)
2. If yes — is it a *region* of the front door's "what's changing" feed, or an input that quietly
   improves the partner ranking, or both?
3. Is `activity_recency_score = 0.0` a deliberately parked placeholder or an unfinished one?
   Engineering's to say; I have not speculated in the relay.
4. Does the app want *failed* transactions too? They are in the log (53/48/74/6 per season) and
   they reveal intent — a manager who bid and lost still tried. Excluded from every figure here.
