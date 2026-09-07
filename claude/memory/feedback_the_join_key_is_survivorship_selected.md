---
name: feedback-the-join-key-is-survivorship-selected
description: "DG-165 2026-09-06: draft picks without a gsis_id are mostly players with no NFL record, so dropping 'rows without an id' thins the failures — but their PFR games field is NaN, not zero, and calling them 'washouts' was an overclaim the review caught. Resolve identities through independent sources; keep the rest as explicit unknowns."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: b80e4907-2b8e-494e-987a-b2e7a5ee6cd2
  modified: 2026-09-06T14:45:25.386Z
---

**Two survivorship traps hiding in identity and missingness, and one overclaim, all from DG-165 (2026-09-06):**

1. **The join key is assigned by surviving.** A gsis id exists only for players who reached an NFL roster
   system. Of 108 skill-position draft picks (1999–2025) without one, 63 resolve to an NFL identity through
   the nflverse players table or 1999–2025 rosters (keyed on draft year + pick, or name + year) and 45 have
   no NFL record in any source. Dropping "rows without an id" therefore deleted mostly-failures — the
   1999–2004 kept rows showed a 0.5% no-appearance rate against 6–10% later.
2. **Missingness encodes the outcome through the data-collection mechanism.** All of them also lack a birth
   date (PFR never recorded one). An `age_missing` indicator learned "missing age ⇒ no record" and scored a
   2026 seventh-round QB with no birth date on file at P = 0.00 (artifact-free: 0.10). Fix: impute, no
   indicator; a test pins that a missing age scores exactly like the position-median age.
3. **⛔ The overclaim.** The first build wrote "107 of 108 never played" because PFR's `games` was NaN and the
   code did `fillna(0)`. NaN is a missing record, not a measured zero; the round-1 review caught it. Fix: resolve
   identities through independent sources; a resolved identity with no weekly stat row IS a measured zero
   (fantasy points); an unresolved one is kept with NaN labels and a `label_basis`, counted, never dropped,
   never asserted to have failed — with an explicit `unresolved_as_zero` sensitivity arm (moved season-1 AUC by
   ~0.001 and no 2026 score by more than two season points).

**Why:** the estimand trap ([[feedback_a_filters_correctness_depends_on_the_estimand]]) one layer down — the
identity join and the missingness pattern "look like data quality" and are partly the outcome. And the
overclaim is [[feedback_a_placeholder_hardens_into_a_fact]]: a `fillna(0)` became "proven washouts" in three
documents within an hour.

**How to apply:** before dropping rows for a missing key, cross-tabulate the missing-key rows against an
independent outcome proxy — and check whether that proxy is itself missing rather than zero. Before adding
a missingness indicator, ask what process generates the missingness and whether that process is the outcome.
Never write "never played" for a NaN; write "no record in <sources>" and keep the row as an explicit unknown.
