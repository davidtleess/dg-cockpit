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
