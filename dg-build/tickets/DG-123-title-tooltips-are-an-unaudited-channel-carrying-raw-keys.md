# DG-123 — `title=` tooltips are an unaudited channel, and raw keys are being put there

**Layer:** 6 · **State:** todo · **Lane:** — · **DG 3.0** · **frontend-only · DG-091 follow-on**
**Source:** the 2026-08-31 closeout audit, which found the program's headline claim — "zero raw
pipeline tokens on screen" — is true only under the checker's own definition.

**Problem:** `renderRule.ts:140` sets `AUDITED_ATTRIBUTES = ["aria-label", "alt", "placeholder"]`
and `renderRule.ts:35` states plainly that `title` is left unaudited as "the product's existing
hover-receipt convention". Meanwhile raw keys are **actively placed in `title=` on VISIBLE PROSE**,
outside every declared exempt subtree — verified live at both widths:

| Surface | Element | `title=` |
|---|---|---|
| Today | `p.dg-wc__overlay-note` ("Heads up: we couldn't compare our projections…") | `model_multi_vintage_ambiguous` |
| Roster · Cut list | `li.dg-rc__caveat` ("The free-agent pool at this position is thin…") | `thin_unrostered_pool_below_min_4` |
| Roster · Cut list | `li.dg-rc__caveat` ("Too few players here carry a price…") | `valuation_coverage_below_floor` |
| Trade partners | `p.dg-league-pulse__caveat` | `league_pulse_artifact_state_2026-08-30` |
| League | same paragraph | `league_pulse_artifact_state_2026-08-30` |

The prose was rewritten and the raw key was parked in a tooltip **on the very same element**.
Call sites: `RosterCapacitySandbox.tsx:136`, `SnapshotStamp.tsx:37`, `DailyWhatChanged.tsx:1506`.

**Decide, then enforce — the ticket is the decision as much as the code.** Either:
(a) **audit `title` like any other user-visible text**, and move these identifiers into the
    `[data-identifier]` receipt layer DG-120 built for exactly this purpose; or
(b) **keep `title` as a sanctioned receipt channel** — but then it must be DECLARED as one in the
    rule, the same way the three subtrees are, and it must carry identifiers ONLY, never messages
    (DG-120's law), with a test proving a snake_case MESSAGE in a `title` fails.
Recommend (a): a tooltip is not a receipt — it is invisible to touch users, unreachable by
keyboard, and unreadable by anyone who does not know to hover.

**Also in scope:** the shipped bundle still contains `phase17_non_decision_grade: "Descriptive
context, not a decision-grade call."` — repealed vocabulary that slips the retired-furniture guard
because its pattern `/not decision-grade/i` does not match "not A decision-grade call"
(`ui/retiredFurniture.test.js:56`). Tighten the pattern and retire the string.

**Done:** the claim "no raw pipeline key reaches David" is true without an asterisk, or the
exception is declared, narrow, and tested. Whichever is chosen, the board row and any closeout
that repeats the claim must state it accurately.
