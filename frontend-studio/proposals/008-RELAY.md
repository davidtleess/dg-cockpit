# 008 — RELAY: draft-pick valuation and the pick portfolio

Studio → engineering, via David. All claims verified against the running app on **2026-07-24**
(API at `127.0.0.1:8000`, FantasyCalc cache fetched `2026-07-24T19:59:08Z`, league pulse artifact
`2026-06-23`). Every item ends with the same ask: **confirm, fix, or refute with a concrete
technical reason.**

## Summary

| ID | Summary | Severity |
|---|---|---|
| **P1** | Pick xVAR is two constants; round 2 equals round 3 | High |
| **P2** | Cached slot-level pick prices unread; bucket lookup unimplemented | High |
| **P3** | Round-tier valuation understates a bottom-of-league portfolio 29.6% | High |
| **P4** | Pick portfolio is in the payload and on no surface | Medium |
| **P5** | Does the generic year+round price already embed a mean slot? | Question |

---

## P1 — Every future pick in the league is valued at one of exactly two numbers *(High)*

**Repro.** `GET /api/league/pulse` → for every `team_values[].future_picks.owned[]` and
`.outgoing[]`, read `xvar`, grouped by `(season, round)`.

**Observed.** Across all 12 teams and the 2027/2028/2029 drafts, `xvar` takes exactly two distinct
values:

| | round 1 | round 2 | round 3 |
|---|---|---|---|
| 2027 | 11.1553 | 0.1076 | 0.1076 |
| 2028 | 11.1553 | 0.1076 | 0.1076 |
| 2029 | 11.1553 | 0.1076 | 0.1076 |

Three consequences, each independently checkable:
- **No origin-team signal.** `original_roster_id` is present and populated on every pick and does
  not affect the value. Roster 1's 2027 first from itself (12th of 12 by starter-weighted xVAR) and
  its 2027 first from Kissane's Team (2nd of 12) are both 11.1553.
- **No year decay.** A 2029 first is priced identically to a 2027 first.
- **Round 2 and round 3 are the same number.** `0.1076` appears for both.

**Expected.** At minimum a round-2/round-3 separation and a year discount. The payload's own caveats
(`pick_value_floored_at_replacement`, `pick_value_thin_sample`,
`generic_future_pick_round_only`, `pick_value_resolution: "round_tier"`) suggest this is a known
floor rather than an oversight — if so, please say so and I will design around it and stop reporting
it. But the floor is currently doing real damage; see P3.

**User cost.** The user is a rebuilder holding 16 picks, more than any other team. Picks are the
denomination of every trade he is likely to make for two seasons. The model cannot currently tell
him that a 1.01 differs from a 1.12, or that a second differs from a third.

**Ask:** confirm, fix, or refute with a concrete technical reason.

---

## P2 — FantasyCalc's slot-level pick prices are already cached and never read *(High)*

**Repro.**
1. `python3 -c "import json;d=json.load(open('app/cache/fantasycalc/market_values.json'));
   print(len([r for r in d['data'] if r['player']['position']=='PICK']))"` → **48** entries, named
   `2026 Pick 1.01` … `2026 Pick 4.12`, each with `value`, `overallRank` and `trend30Day`.
2. `POST /api/trade/reconcile/market` with
   `{"sent_assets":[{"asset_kind":"future_pick","year":2027,"round":1,"bucket":"early"}],
   "received_assets":[]}`.

**Observed.** Step 2 returns `market_value: null`, `resolution: "unresolved"`,
`coverage_gap: "fantasycalc_bucket_pick_unavailable"` — for `early`, `mid` and `late` alike, for
every year and round tested (9 combinations × 3 buckets = 27, all null). Omitting `bucket` returns a
value via `resolution: "pick_generic_year_round"`. So the `bucket` field exists in `MarketAssetRef`,
is accepted, and resolves nothing.

Meanwhile the cache the app itself maintains contains the full ladder, and the spread inside round
one alone is **3.06×**: 1.01 = 6,893, 1.12 = 2,249.

**Expected.** Either the bucket path resolves against the cached slot ladder, or the field is
removed so it stops advertising a capability that does not exist.

**User cost.** In Trade Lab, every first-round pick on both sides of a trade is priced identically
in the market lane too. A trade of "my 1.12 for your 1.01" currently reconciles as even money in
both lanes.

**Ask:** confirm, fix, or refute with a concrete technical reason.

---

## P3 — Round-tier valuation understates a bottom-of-league portfolio by 29.6% *(High)*

**Repro.** For roster 1's 16 owned picks, compare (a) the market's generic year+round price against
(b) the same picks priced at the slot each origin team's *current* roster-value rank projects, using
FantasyCalc's cached 2026 slot ladder for shape and its own generic year+round price for level.

**Observed.** Generic total **25,747**; slot-aware total **33,359**; **+7,612 (+29.6%)**. The
direction is not noise — it is structural. Roster 1 is 12th of 12 and owns 11 of its own 16 picks,
so its picks skew early; a contender's portfolio is over-counted by the same mechanism in reverse.

**Expected.** A pick-value model that is at least ordinally sensitive to origin-team strength, so
the error is not systematically signed by the user's own league position.

**User cost.** The rebuild's entire thesis is "I am bad now so my picks are premium." The current
model prices his picks as though he were mid-table, and understates the largest asset block he owns
by roughly a third — in the one direction that matters to him.

**Caveat I own.** The projected slot is inferred from current roster value, not standings; no games
have been played. The +29.6% is therefore an estimate under a stated assumption, not a measurement.
The *sign* of the bias does not depend on the assumption; the magnitude does.

**Ask:** confirm, fix, or refute with a concrete technical reason.

---

## P4 — The pick portfolio is in the payload and rendered on no surface *(Medium)*

**Repro.** `GET /api/league/pulse` → `team_values[].future_picks` returns, per pick: `season`,
`round`, `original_roster_id`, `current_roster_id`, `xvar`, `pick_value_resolution`,
`reconstruction_method`, and caveats. Now open every screen in the app.

**Observed.** No surface renders it. Roster Capacity does not count picks. League Pulse renders team
postures, values and opportunity cards from the same response and drops `future_picks`. The only
place a pick becomes visible is Trade Lab, and only by searching for it by year.

**Expected.** Somewhere the user can see what he holds. Sixteen picks is ~37% of this franchise by
market value and is invisible.

**User cost.** He cannot answer "what do I own?" without reading JSON.

**Ask:** confirm, fix, or refute with a concrete technical reason.

---

## P5 — Does the generic year+round price already embed a mean slot? *(Question, not a defect)*

The market's generic 2027 round-1 price is 2,907. The mean of FantasyCalc's cached 2026 round-1
slot values is 3,473. If the generic figure is already a slot-averaged number, then pricing a
portfolio slot-by-slot and comparing the total against the generic total is not a like-for-like
comparison, and the +29.6% in P3 needs restating as a redistribution rather than an uplift.

I could not settle this from inside the app. If anyone knows how FantasyCalc derives the generic
year+round figure — or if the app derives it locally rather than reading it — that answer changes
how P3 should be phrased.

**Ask:** answer if known; otherwise say it is unknown and I will state the uncertainty on-surface.

---

## Not in scope of this brief

The design response — a draft-capital region for the front door — is Studio's and is not asking for
engineering work beyond the above. It is prototyped at
`proposals/008-draft-capital/prototype.html` and gated on David.
