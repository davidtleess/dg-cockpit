# David's rulings — DG 3.0

**His words verbatim. Never paraphrased. This file is the record when nothing else is.**

---

## 2026-08-19 06:32 ET — Engine B PPG counts ALL GAMES

> **"all games"**

Answering: does Engine B's points-per-game mean regular season only, or every game played?

**Settled:** postseason games count. `fetch_and_agg_stats` having no `season_type` filter is
**correct by decision, not a defect** — do not "fix" it. No rerun of Engine B, P90, replacement,
xVAR or calibration. The six players who clear the eight-game gate only via postseason stay in.
The 160-of-162 PPG difference is the definition working, not drift.

**Outstanding:** the definition still needs writing into the code beside `fetch_and_agg_stats` and
into the Engine B feature contract. Crew work — Tower does not edit the product repo.
Ticket: `~/dg-build/tickets/DG-024-DECISION-ppg-definition.md`.

---

## 2026-08-19 06:36 ET — Tower commits to the product repository

> **"commit the agents.md hook"**

Preceded by **"then commit it as the opening hook for every agent in DG"** (2026-08-18 ~23:0x).

**This overrides the charter's "You never edit the product repository."** Tower raised the boundary
once, was instructed a second time, and complied. The charter's own tie-break — *the instruction that
narrows wins **until he says otherwise*** — was satisfied: he said otherwise, explicitly, twice.

**Do not treat this as a general licence.** It authorised one doc-only commit of the parallel-work
protocol. Product code, models, data artifacts and the registry remain outside Tower's hands. If a
future Tower is asked again, the same sequence applies: raise it once, then do as he says.

**How it was done, and the care is the point:**
- Confirmed `AGENTS.md` was clean first — 56 unrelated dirty files in the tree belonged to others.
- `git add AGENTS.md` only. **Never `git add -A`.** Dirty count was 56 before and after.
- `feature/outcome-loop-week1` → `16a1e54`; `main` → `552733c`, applied in a throwaway worktree so
  main took exactly ONE commit and none of the branch's 7 feature commits.
- Both refs verified to carry the hook; pushed and confirmed arrived.

---

## 2026-08-18 ~22:44 ET — governance to near zero

> **"and i want the governance turned down to near zero. i still see value in the fresh eyes of
> studio but im ready to let the crew work freely and the judge to have its own free thinking.
> as well as you, tower."**

Retired: per-ticket approval gates, the three-label ritual, blocking foundation checks, mandatory
falsifiers, verify-lane separation, entry/exit criteria, and the Layer 1 catalog's ten-checkbox gate
on opening Layer 2.

**NOT retired, and he restated Studio's worth in the same sentence:** the Studio firewall (Studio
never receives our tickets, roadmap or vocabulary — that is the mechanism, not governance), the
six-layer ordering (his own law), and citing what you ran (accuracy, not compliance).

---

## 2026-08-19 06:32 ET — back up dg-build

> **"add dg-build to backup"**

Done: `~/dg-cockpit/backup.sh` now rsyncs `~/dg-build/` (excluding `.git`). Verified 38/38 files
identical, executables preserved. **Content is backed up; dg-build's own git history is not** —
a separate remote for it is undecided.
