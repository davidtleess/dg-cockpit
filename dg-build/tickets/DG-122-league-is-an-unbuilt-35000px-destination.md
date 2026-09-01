# DG-122 — League is an unbuilt 35,000-pixel destination, and the gate called it clean

**Layer:** 6 · **State:** todo · **Lane:** — · **DG 3.0** · **frontend-only · DG-091 follow-on**
**Source:** the 2026-08-31 closeout audit. Measured independently by TWO auditors on the live
product, in agreement. The DG-091 program closeout reported this surface as clean; it is not.

**Problem — measured, not estimated:**
- **35,475px tall at 1440; 44,020px at 390** (main innerText 46,170 characters). That is **26× the
  Trade partners view the program celebrated cutting by 79%** — and it sits behind "League", one of
  only five nav destinations David has.
- **Eight opportunity cards, and not one of them names a team.**
- ***"Something here is worth a look."* renders SIXTEEN TIMES.**
- **"Unknown team" renders SIX TIMES** — and the same `/api/league/pulse` response that feeds the
  page carries the team names. The surface is discarding data it was given.
- Section headings read "Model-native opportunity cards" / "Market overlay opportunity cards" —
  pipeline vocabulary, on a user surface, after the copy-dictionary program.
- Raw artifact ids print as **unlabelled body copy with no interaction**: `team_posture.v1`,
  `team_value_matrix.v1`, `league_opportunity.v2`.

**Why the gate missed it (fix this too, or it recurs):** `visual-smoke.spec.ts` asserts horizontal
overflow, content presence and axe. **It has no assertion about page LENGTH or repetition**, so a
39-viewport page of duplicated sentences passes clean. Add a length budget per surface and a
repeated-sentence check — a page that says one thing sixteen times is a defect the gate should name.

**Build:** apply the DG-119 pattern that worked — framed cards, the TEAM NAME leading, one
producer-entailed sentence each, the caveat once, components behind a disclosure. Fix the
"Unknown team" fallback to read the name the payload already carries. Route the headings and the
artifact ids through the copy dictionary and the receipt layer.

**Honesty law:** if a card genuinely has no team (an unrostered player), say that in words rather
than "Unknown team" — and check the producer before writing any sentence about why.
**Done:** League reads at a glance; every card names its team or says honestly why it cannot;
no sentence repeats sixteen times; page length within the new budget; gate extended so this class
cannot pass again.
