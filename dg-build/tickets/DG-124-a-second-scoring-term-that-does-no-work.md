# DG-124 — A second scoring term that does no work, one line from the first

**Layer:** 3 · **State:** todo · **Lane:** — · **DG 3.0** · **backend + frontend copy**
**Source:** the 2026-08-31 closeout audit. DG-119 correctly caught `activity_recency_score` (a
hardcoded `0.0` at `league_opportunity_map.py:185` that made the product tell David his league had
been quiet). **It walked past the line above it.**

**Problem:** `league_opportunity_map.py:184` —
`divergence_density_score = _safe_score(len(divergence_rows) / 5.0)` with `_safe_score` clamping to
`[0, 1]` (`:44-45`). On the live payload it is **1.0 for all eleven partners**: any partner with
five or more divergence rows saturates the clamp, and every partner has at least five. A term
identical for every row **does no ranking work**, while the partner card's own explanation implies
it does — the same defect class DG-119 was written to fix, in the same function.

**Two separate fixes, do not conflate them:**
1. **The copy (frontend, do first — it is the honest half):** the card must not imply a component
   is discriminating between partners when it is saturated for all of them. Say what is true today.
2. **The score (backend, David's call):** either rescale so the term discriminates (the divisor is
   the whole question — 5.0 saturates immediately at this league size), or drop it from the
   composite and say so in the disclosure. **Changing a scoring term changes published values, so
   this half is POST-FREEZE and needs David's word.**

**Wider action this implies:** two of the composite's terms have now been found inert by reading
the producer. **Audit every remaining term the same way** — compute each across the live payload
and check it actually varies between partners before any surface describes it as a reason.

**Honesty law:** never describe a component as a reason for a ranking without first proving it
varies across the rows being ranked.
**Done:** no card implies a saturated term is discriminating; every composite term has a recorded
live variance check; the rescale-or-drop decision is David's and is recorded verbatim.
