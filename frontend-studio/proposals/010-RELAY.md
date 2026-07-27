# 010 — RELAY

**Status: NOT AUTHORISED TO CROSS. David's gate.**

| ID | summary | severity |
|---|---|---|
| Q1 | `positional_summary` cannot discriminate need; all four read deficit | High |
| Q2 | No endpoint exposes lineup-slot standing against the league | Medium (capability) |

**Two items only, and both are deliberately narrow.** The measurement behind proposal 010 mostly
re-confirmed defects already filed as 009 P1–P5, which are awaiting verdicts. Nothing here re-files
them. Q1 is a *user-visible consequence* of an existing item and is filed because the consequence
changes its severity; Q2 is genuinely new and is a capability request, not a defect.

---

## Q1 — `positional_summary` cannot discriminate where the roster needs help. High.

**Repro.** `curl -s http://127.0.0.1:8000/api/league/pulse` → `team_values[]` where `roster_id == 1`
→ `positional_summary`.

**Observed**, live 2026-07-26:

| position | `surplus_label` | `z_score` | `starter_xvar` | `n_rostered` |
|---|---|---|---|---|
| QB | `deficit` | −1.907 | **0.0** | 5 |
| RB | `deficit` | −1.457 | 13.4 | 5 |
| WR | `deficit` | −1.739 | 2.4 | 14 |
| TE | `deficit` | −2.72 | −16.85 | 3 |

**Expected.** A field named `surplus_label` should separate a 14-player WR room from a 3-player TE
room. It returns the same value for all four. Across the league the labels do vary
(`deficit` 11 / `neutral` 28 / `surplus` 9), so the mechanism works — it saturates for this roster.

**Two distinct faults, and they need separating before either is fixed:**

1. `surplus_label` is a z-score against the league, so the weakest team floors at every position.
   This is **009 P5**, already filed. Included here only because Q1's second half depends on it.
2. `starter_xvar: 0.0` for QB is **not** a low opinion of Jaxson Dart — it is the IR/taxi exclusion
   filed as **009 P3**. Dart returns `dynasty_value_score: 77.5` from `/api/players/`. The starter
   value for the position is being computed as zero while a real, healthy, rostered QB fills the slot.

**Why the user pays for it, and why this raises P3's severity.** This league is **superflex**, where
QB is the scarcest position. Measured against every other roster's best legal lineup, QB is this
roster's **weakest slot — 9th of 12, 1,568 market-value points below the league median at that
slot**, twice the gap of the next-worst. The app's only answer to "where do I need help" reports that position's
starter value as `0.0` and labels it identically to the three positions where the roster is fine.
The one surface that should point at the hole cannot see it. P3 was filed as a lineup-composition
defect; this is the consequence, and it lands on the position that matters most in this format.

**Ask:** confirm, fix, or refute with a concrete technical reason — specifically, whether
`starter_xvar` is intended to exclude IR/taxi when computing a *positional* summary, and whether
`surplus_label` is intended to be a league-relative z-score rather than a roster-relative one.

---

## Q2 — Nothing exposes lineup-slot standing against the league. Medium — capability request.

**Note on lineup source, added 2026-07-26.** The measurement below uses a computed best-legal-lineup
rather than Sleeper's saved `rosters[].starters`, deliberately: for assessing *roster* need you want a
team's best possible lineup, not an off-season lineup of unknown vintage. Both were checked. Sleeper's
saved lineups are **92% populated** (10 of 12 teams complete) and disagree with a best-value optimiser
for **10 players** — including Free Kelly benching Josh Allen (10,232) behind Dak Prescott (3,970). If
the league layer adopts slot standing, which of the two it uses is a real design decision and should be
stated explicitly rather than left implicit.

**Repro.** Across `/api/league/pulse`, `/api/roster/audit`, `/api/roster/capacity`: the finest
positional granularity available is per-position (QB/RB/WR/TE) aggregate — `positional_summary`,
`value_views.starter_weighted_xvar`, `value_views.lineup_xvar`. No endpoint returns, per lineup slot,
this roster's filler against the other eleven rosters' fillers of the same slot.

**Why it matters.** Position-level aggregates cannot answer the question a manager actually asks.
This roster holds **14 WRs and is 8th of 12 at both WR slots** — quantity without a top. Position
aggregates read that as depth; slot standing reads it correctly as a weakness. The same roster holds
**5 QBs and is 9th of 12 at QB**. "How many do I have" and "how good is my starter" diverge here in
both directions, and only the second one is a need.

**What was computed externally to get it** (`frontend-studio/analysis/need-and-targets.py`): best legal
lineup — QB, RB, RB, WR, WR, TE, FLEX, FLEX, SUPER_FLEX — filled greedily by market value for all 12
rosters, then each slot compared across teams. It required no data the app does not already hold. It
was computed on the fresh on-disk artifact rather than the API because of **009 P1**.

**Ask:** confirm whether best-legal-lineup slot standing is in scope for the league layer, or refute
with a concrete technical reason — in particular whether the greedy fill is considered a sound lineup
optimiser for SUPER_FLEX, since that assumption is the whole basis of the measurement.

---

## Note on what this relay deliberately does not contain

The 010 measurement also re-derived, independently and on fresher data, the substance of 009 P1, P2,
P3 and P4. Those are not re-filed. One correction worth recording: the degeneracy warning issued with
`replaceability.py` on 2026-07-25 — that `gain − cost` collapses to a team-pair constant — was
**re-verified on 2026-07-26 fresh data and holds** (Free Kelly's starters all return −12 / +47;
rzalika's a single −382). Any future engineering work that ranks trade targets should not use that
difference as a key.
