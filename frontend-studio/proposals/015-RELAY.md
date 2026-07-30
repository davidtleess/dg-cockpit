# 015-RELAY — the player evidence card renders its two lanes as unlabelled value strings

**From:** Studio (independent front-end practice)
**Measured:** 2026-07-30 against the running app at `http://127.0.0.1:8000`, market artifact
`2026-07-29T13:00:10.941198+00:00`. Every item below was reproduced in a scripted browser session and
re-checked on three different players.

## Summary

| ID | seven-word summary | severity |
|---|---|---|
| P1 | Player card lanes render fifteen unlabelled concatenated values | **critical** |
| P2 | Internal snake_case identifiers rendered as user copy | high |
| P3 | Raw ISO timestamp with microseconds shown as freshness | high |
| P4 | Trade Lab concatenates player name into band label | medium |
| P5 | Divergence strip juxtaposes two incompatible numeric scales | medium |
| P6 | Definition list contains no dt or dd elements | low |

---

## P1 — CRITICAL. The two-lane facts block renders values with no labels, run together

**Repro.** `http://127.0.0.1:8000/?surface=trade-lab` → type `Allen` into the asset search → click the
`Josh Allen` result → in the right-hand Inspector click **Open full evidence card**.
(The card is reachable from anywhere a player is selected; Trade Lab is simply the shortest path.)

**Observed.** `.dg-two-lane__lane--model .dg-two-lane__facts` contains **8 element children, all bare
`<span>`, `display:inline`, with no separator and no label**. The market lane contains **7**. Rendered,
the model lane for the most valuable player in the league reads:

```
ENGINE_BACTIVE_B9948.23——19.901—
```

and the market lane:

```
FantasyCalc10183Overall 1Position 12026-07-29T13:00:10.941198+00:00market_overlay_static_caveat…
```

**Confirmed on three players, so this is not a degraded-record artifact:**

| player | model lane as rendered |
|---|---|
| Josh Allen | `ENGINE_BACTIVE_B9948.23——19.901—` |
| Ashton Jeanty | `ENGINE_BACTIVE_B75.331.3——11.822—` |
| Rome Odunze | `ENGINE_BACTIVE_B698.4——10.012—` |

**Expected.** Each value carries a visible label, and values do not abut. The lane is marked up as a
`<dl>` and the natural fix is the one the markup already implies — `<dt>`/`<dd>` pairs — but any
labelled presentation resolves it.

**Why the user pays for it.** This card is the product's flagship player view and the whole point of
the two-lane thesis. As rendered, a reader cannot tell which number is DVS, which is xVAR, which is the
position percentile, or which of the three projection slots is populated. `9948.23` is not a number in
this system — it is `99`, `48.2`, `3` with the separators missing, and nothing on screen says so. The
product's own descriptive-not-decision doctrine depends on the reader being able to *read the
evidence*; here the evidence is unreadable, and a plausible misreading (`99` and `48.2` fusing into
`9948.23`) is worse than no number at all.

**Confirm, fix, or refute with a concrete technical reason.**

---

## P2 — HIGH. Internal snake_case identifiers are rendered directly as user-facing copy

**Repro.** Same card for P2a; `?surface=trade-lab` with any comparison run for P2b.

**Observed — thirteen distinct identifiers, verbatim on screen:**

*Player evidence card:* `market_overlay_static_caveat`, `source_timestamp_is_fetch_time_not_publish_time`,
`age_not_near_position_cliff`, `no_market_overlay`, `no_internal_value_signal`,
`engine_b_not_decision_grade`, and inside a caveat sentence `ppg_t_minus_1`, `ppg_t_minus_2`,
`snap_share_t_minus_1`.

*Trade Lab:* `market_overlay_display_only`, `fantasycalc_raw_scale_not_xvar`,
`market_values_not_model_inputs`, `decision_supported_false`, `inside_band`.

Also on the card: `ENGINE_B` and `ACTIVE_B` as engine path and model status.

**Expected.** A display string per code. `decision_supported_false` is the app's own central doctrine —
that it does not render verdicts — and it currently reaches the user as a field name.

**Why the user pays for it.** These read as leaked internals and undercut trust in exactly the panel
built to establish it. `age_not_near_position_cliff` is genuinely useful information ("he is not near
the age cliff for his position") rendered in a form no reader should have to parse.

**Confirm, fix, or refute with a concrete technical reason.**

---

## P3 — HIGH. The market's freshness is a raw ISO-8601 timestamp with microseconds

**Observed.** `2026-07-29T13:00:10.941198+00:00`, rendered inline in the market lane with no label.

**Expected.** A human freshness string. **Note the existing caveat this interacts with:** the payload
already states that `source_timestamp` is *fetch* time, not *publish* time — so the honest display is
something like "fetched 21h ago", never a to-the-microsecond instant, which implies a precision about
the market's own freshness that the app explicitly says it does not have.

**Why the user pays for it.** Six decimal places of microseconds on a value whose own caveat says it is
not the publish time is precision theatre attached to the one number a daily user checks for staleness.

**Confirm, fix, or refute with a concrete technical reason.**

---

## P4 — MEDIUM. Trade Lab concatenates the asset name into the parity label

**Repro.** `?surface=trade-lab` → search `Jeanty` → add to a side → **Run comparison**.

**Observed.** The market lane renders `Ashton JeantyInside band` on one line — a missing separator
between the asset name and its divergence label.

**Expected.** `Ashton Jeanty — inside band`, or the two on separate lines.

**Why the user pays for it.** It reads as a rendering bug on the surface where the user is deciding
whether to trust a valuation, and it is the same missing-separator class as P1.

**Confirm, fix, or refute with a concrete technical reason.**

---

## P5 — MEDIUM. The divergence strip places two incompatible scales side by side, undifferentiated

**Observed.** After a comparison: `Model lane 31.3` and `Market lane -7143`, adjacent, same size, same
weight, same colour, with `inside_band` beside them.

**Expected.** The two lanes are known to be on different scales — the payload says so
(`fantasycalc_raw_scale_not_xvar`) — so the display must prevent the subtraction a reader will
instinctively perform. At minimum the two lanes should be visually distinguished from one another.

**Why the user pays for it.** Two adjacent numbers of the same visual weight invite comparison. These
two cannot be compared, and the panel knows it.

**Observation attached, offered as context rather than as a defect:** the product's `tokens.css` calls
model/market hue meaning *constitutional*, and the player card does use it (blue and amber lane rules).
Trade Lab — where the two-lane comparison is the entire purpose of the screen — renders **zero elements
carrying either lane hue** inside `<main>`. Measured across surfaces (chrome excluded, content only):
Daily What-Changed 14 model / 20 market; Trade Lab 0 / 0; League Pulse 0 / 1 across 2,601 painted
elements. Roster Audit, Roster Capacity and Model Trust are model-only surfaces by construction and are
correctly excluded from that comparison.

**Confirm, fix, or refute with a concrete technical reason.**

---

## P6 — LOW. `<dl class="dg-two-lane__facts">` contains no `<dt>` or `<dd>`

**Observed.** Both lanes: `dl.querySelectorAll('dt').length === 0`,
`dd.length === 0`, direct `<span>` children only.

**Expected.** A definition list contains definition terms and definitions. As shipped the element is
invalid and conveys no structure to assistive technology — a screen reader meets fifteen unlabelled
values in a list that promises pairs. Fixing P1 with `<dt>`/`<dd>` closes this at the same time.

**Confirm, fix, or refute with a concrete technical reason.**

---

## Reproduction harness

All measurements above come from scripted sessions; the DOM assertions in P1 and P6 are:

```js
const dl = document.querySelector('.dg-two-lane__lane--model .dg-two-lane__facts');
dl.children.length;                    // 8
dl.querySelectorAll('dt').length;      // 0
dl.querySelectorAll(':scope > span').length;  // 8
dl.textContent.trim();                 // "ENGINE_BACTIVE_B9948.23——19.901—"
```
