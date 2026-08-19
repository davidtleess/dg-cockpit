# DG-024 — DAVID'S CALL: does Engine B's PPG mean regular season, or all games?

**Layer:** 3  ·  **State:** DECIDED — all games  ·  **Lane:** —  ·  **DG 3.0**

**The question:** `fetch_and_agg_stats` has no `season_type` filter, so postseason games are counted
in points-per-game. That is a definition, not a bug, and only David can set it.

**What it costs:** 162 players have postseason rows; **160 of them have a different PPG because of
it**, mean absolute change 0.412. **Six players cross the eight-game modelling gate only because
postseason games are counted** — they are in the model solely on that basis.

**If the answer is "regular season only":** Engine B, the P90 ceilings, replacement level, xVAR and
calibration all need rerunning, because every one of them is derived from PPG.

**If the answer is "all games":** nothing changes, and the definition gets written down so this
question doesn't come back.

**Done looks like:** David says which one, and it is recorded.

---

**Notes**
This was routed to David rather than quietly patched in code. That was the right call — a silent edit
here would have changed every valuation on the board without anyone deciding to.


---

# ✅ DECIDED — David, 2026-08-19 06:32 ET

> **"all games"**

**Engine B's points-per-game counts every game a player played, postseason included.**

## What this settles

- `fetch_and_agg_stats` having no `season_type` filter is **correct by decision**, not a defect.
  Nobody should "fix" it. If you are reading this because you found that missing filter and thought
  it was a bug: it isn't, and this is the record.
- **No rerun is required.** Engine B, the P90 ceilings, replacement level, xVAR and calibration all
  stand as they are.
- The **six players who clear the eight-game modelling gate only because postseason games count**
  legitimately remain in the model.
- The 160-of-162 PPG difference is the definition working as intended, not drift.

## What is left

Write this definition into the code beside `fetch_and_agg_stats`, and into the Engine B feature
contract, so the question does not come back in three months. **Crew work — Tower does not edit the
product repository.**

Until that lands, this ticket file and Tower's memory are the record.
