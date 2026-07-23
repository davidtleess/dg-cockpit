# 005 RELAY — Where we stand

*From Studio, 2026-07-22. Every item below is reproducible against the running app and the
artifacts in `app/data/` as of 2026-07-22 13:30 UTC.*

## Summary

| ID | Summary | Severity |
|---|---|---|
| **W0** | **004 N0 withdrawn — measured in contaminated percentile space** | **Correction** |
| W1 | Model values unchanged 25 days; daily screen's model lane empty | High |
| W2 | No published overall model rank; two bases disagree 40% by >50 places | High |
| W3 | Model has no league-settings input; top-25 QB count 3 vs market 9 | High |
| W4 | Provenance restamped daily over numerically identical output | Medium |
| W5 | `model_forward_capture.xvar` never populated; history can't rebuild board | Medium |
| W6 | Three of six position colour pairs fail separation floors | Low |
| W7 | Two ownership sources one month apart | Low |

---

## W0 — Withdrawal of 004 N0 (Correction)

**Claim:** the position-skew finding I relayed as 004 N0 was measured in a space that biases it,
and one of its two signs is wrong. I am withdrawing it and replacing it with W3.

**Repro:** 004 N0 reported median model-market gap **+13.6 for TE, −10.8 for QB** using
`xvar_percentile_overall` against market percentile. That percentile is computed over our modeled
population (468 players: 23.7% TE) and compared against the market-matched population (340
players: 18.2% TE). The composition difference inflates TE percentiles on our side.

Re-measured in rank space over the matched population (both boards re-densified over the same 340
players), median gap by position:

| QB | RB | WR | TE |
|---|---|---|---|
| −22.0 | +23.0 | −2.0 | **−27.5** |

**Observed vs expected:** TE flips sign (+13.6 → −27.5). QB holds. The hypothesis attached to N0 —
that this indicated a Superflex scaling artifact in the *market* — is also wrong-headed; see W3.

**Why the user pays:** N0 was flagged High and "the one to watch." Acting on it would have sent
someone hunting a market-side distortion that is not there.

**Ask:** treat 004 N0 as withdrawn. Confirm, or refute my re-measurement with a concrete technical
reason.

---

## W1 — The model lane of the default screen is empty by construction (High)

**Claim:** no `dynasty_value_score` has changed in 25 days, so Daily What-Changed's model region
has had nothing to render for the entire capture window.

**Repro:**
```
# 1. live
curl -s localhost:8000/api/league/what-changed | jq '.daily_diff.model.deltas | length'   # -> 0
curl -s localhost:8000/api/league/what-changed | jq '.daily_diff.model.status'
# -> "vintage_changed_no_score_delta"

# 2. the full capture record
sqlite3 app/data/model_forward_capture.db
# for each consecutive capture_date pair, compare dynasty_value_score per sleeper_id:
# last transition with ANY change = 2026-06-27. 2026-06-27 -> 2026-07-22: 0 of 581 changed.
# projection_2y in model_forward_prediction_snapshot: 0 of 12,200 changed 07-21 -> 07-22.
```
Ranks shifted once more (2026-07-10) but only because the population went 583 → 581; no value moved.

**Observed:** market lane carries 27 roster deltas + 25 top movers; model lane carries `[]`.
Market re-ranked 370 of 452 players overnight.

**Expected:** either the model lane has something to say daily, or the default screen is not framed
around daily change.

**Why the user pays:** the app's first screen every morning can only ever report what the market
did. The standing product direction is that a market move alone is not the product — the
model-vs-market juxtaposition is. The default surface is structurally incapable of carrying it.

**Not a defect claim about the model.** A production-fed model should be flat in July. The question
is the product frame, and W4 below.

**Ask:** confirm the measurement, and say whether the intended off-season behaviour of that region
is (a) render an explicit "our board did not move, here is where it stands" state, or (b) something
else.

---

## W2 — There is no published overall model rank, and the two candidates disagree (High)

**Claim:** the app exposes `dynasty_value_score` and `xvar` but no overall model rank. Ranking the
same 340 players by each produces materially different boards.

**Repro:** `app/data/valuation_runtime/universe_pvo_runtime.json`, the 340 players with both an
`xvar` and a FantasyCalc price. Rank by `valuation.xvar` desc; rank by
`valuation.dynasty_value_score` desc; compare.

**Observed:**
- median |xVAR-rank − DVS-rank| = **26 places**
- **135 of 340 (40%)** differ by more than 50 places
- max **144** (Kenyon Sadiq, TE, 21: xVAR #193 / DVS #49)
- the eight largest disagreements are all TEs aged 21–23

**Expected:** one basis, named, for the comparison the product exists to make.

**Why the user pays:** every model-vs-market statement in the product inherits its sign and size
from a choice that has not been made. On xVAR our #1 is a 29-year-old RB the market ranks 38th; on
DVS the top 25 holds 12 TEs against the market's 2. Same model, same day.

**Ask:** name the intended overall-rank basis, or confirm that one needs building. This is 001b's
"publish rankings comparable to market rankings" — W2 is evidence that the basis choice inside it
is not cosmetic.

---

## W3 — The model has no league-settings input; the comparison is contaminated at QB (High)

**Claim:** the market board is priced for this league and ours is not, and the difference is
concentrated in the position where league settings matter most.

**Repro:** FantasyCalc is fetched at `isDynasty=true&numQbs=2&numTeams=12&ppr=1` — correctly
configured Superflex. Grep the feature pipeline for any league-configuration input to Engine A/B:
there is none. Then take the top 25 of each board over the same 340 players:

| Board | QB | RB | WR | TE |
|---|---|---|---|---|
| Ours (xVAR) | 3 | 15 | 7 | 0 |
| Ours (DVS) | 1 | 6 | 6 | 12 |
| Market | 9 | 7 | 7 | 2 |

**Observed:** the market's #1 is Josh Allen; our xVAR board has him #8 behind seven running backs,
and our DVS board has no QB in the top 10 at all. Our xVAR board has no TE in the top **50**.

**Expected:** in a 12-team Superflex, a dynasty board's top 25 should be QB-heavy. Neither of ours
is.

**Why the user pays:** overall rank is the headline unit of the whole comparison, and it currently
sets a league-agnostic list against a league-specific one. The user reads "we disagree with the
market about Josh Allen" when the real statement is "our board does not know that two QBs start."

**Ask:** confirm whether league configuration (roster slots, superflex, PPR, team count) can be
supplied to the ranking layer. It is a league setting, not a market price, so I do not believe
`validate_no_prohibited_features` blocks it — but you own that boundary and I do not. If it cannot
be supplied, say so and I will retire overall-rank comparison in favour of within-position
comparison in the design.

---

## W4 — Provenance is restamped daily over numerically identical output (Medium)

**Claim:** `semantic_output_hash` and `artifact_vintage` change every morning while no value does.

**Repro:** `model_forward_capture_joinable`, group by `capture_date, semantic_output_hash`. Constant
2026-07-11 → 07-15, then a new hash every day 07-16 → 07-22. Over that same span, zero score
changes. The what-changed report records this honestly as
`vintage_changed: true` + `status: "vintage_changed_no_score_delta"`.

**Observed vs expected:** a semantic-output hash that changes when the semantic output has not.

**Why the user pays:** any freshness indicator keyed on vintage reports a model refresh that did not
happen, which is the one thing a trust surface must not do.

**Ask:** confirm whether the hash is intended to cover run metadata as well as output, and if so
whether a separate output-only digest should drive freshness display.

---

## W5 — `model_forward_capture.xvar` is never populated (Medium)

**Claim:** the column exists and is NULL in every row.

**Repro:** `select count(*) from model_forward_capture_raw where xvar is not null` → **0** (of
366,030). Same for `model_forward_capture_joinable` (of 17,204).

**Observed vs expected:** the live artifact ranks and percentiles on xVAR
(`overall_percentile_internal_xvar_only`), but the historical capture retains only DVS. The daily
record cannot reconstruct the board the app actually displayed on any past day.

**Why the user pays:** it forecloses backtesting our own rank against realized outcomes when the
scorer switches on in September — the accuracy loop would be scoring a number the app doesn't rank
on.

**Ask:** confirm whether xVAR should be captured, or whether DVS is the intended historical basis
(which would also answer W2).

---

## W6 — Position colour tokens fail separation checks, before they ship (Low)

**Claim:** `--dg-pos-rb` and `--dg-pos-te` are not reliably distinguishable, including for normal
colour vision.

**Repro:** `frontend/src/styles/tokens.css:37-40`. Converted to sRGB and run through OKLab ΔE
(×100), all-pairs, on the dark surface `oklch(0.16 0.01 250)`:

| Pair | Normal | Worst CVD | Tritan |
|---|---|---|---|
| `--dg-pos-rb` #009f7a ↔ `--dg-pos-te` #00a0af | **8.0** | 7.5 (deutan) | **2.8** |
| `--dg-pos-qb` #8e6ac7 ↔ `--dg-pos-wr` #b9579c | **10.0** | 6.9 (protan) | 12.6 |
| `--dg-pos-wr` #b9579c ↔ `--dg-pos-te` #00a0af | 24.5 | **4.0** (deutan) | 25.7 |

Floor for a categorical palette is ΔE ≥ 15 normal / ≥ 8 CVD (6–8 legal only with a secondary
encoding such as direct labels or texture). Three of the six pairs fail: RB↔TE and QB↔WR are below
the normal-vision floor — hard to tell apart with full colour vision, which no secondary encoding
excuses — and WR↔TE collapses for deutan viewers.

**Observed vs expected:** four position hues meant to be told apart at a glance; half the pairs
cannot be.

**Mitigating:** the tokens are currently defined and unit-tested (`tokens.test.js`) but painted
nowhere — grep for `dg-pos-` outside `tokens.css` and `tokens.test.js` returns nothing. So this
costs nothing to fix today and gets expensive after the first surface adopts them.

**Why the user pays:** nothing yet. That is the point of raising it now.

**Ask:** re-step the four hues apart (separating them in lightness as well as hue is the cheapest
fix) before any surface adopts them, or confirm position will always carry a text label and the
hues are decorative.

---

## W7 — Two ownership sources, one month apart (Low)

**Claim:** `app/data/league_snapshots/sleeper_universe_snapshot_latest.json` is dated **2026-06-23
11:36**, while `universe_pvo_runtime.json` carries
`source_snapshot_captured_at: 2026-07-22T13:20` with live `league_context` per player.

**Observed vs expected:** two files that both look authoritative for roster ownership, 29 days
apart. League Pulse's `team_posture` and `team_value_matrix` artifacts are still stamped
2026-06-23 and the endpoint still returns `degraded`.

**Why the user pays:** this is the tail of 003 (accepted 2026-07-15). The runtime path is now fresh;
the standalone snapshot and the Pulse derivation chain are not, so any surface reading them shows
month-old rosters beside today's prices.

**Ask:** confirm whether `sleeper_universe_snapshot_latest.json` is now vestigial. If it is, deleting
or clearly marking it is cheaper than leaving two answers on disk.

---

*Each item: confirm, fix, or refute with a concrete technical reason.*
