# DG-117 — Surface cleanup: the sideways scroll, the three names, and the QA language

**Layer:** 6 · **State:** done · **Lane:** Davids-MacBook-Pro-65092 · **DG 3.0** · **frontend-only · DG-091 phase 2B WAVE 1**
**Source:** the 2026-08-30 closeout audit, all measured on the LIVE product.

**Four defects, all evidenced:**
1. **Roster Audit scrolls the whole page sideways 185px at 390** (`documentElement.scrollWidth` 575
   vs `clientWidth` 390; `table.dg-roster__table` is 559px inside a 358px parent with
   `overflow-x: visible`). **Model Trust scrolls 665px** (scrollWidth 1055;
   `table.dg-trust-folds__table` 1039px in a 358px parent), squeezing every other element to
   ~350px beside ~700px of empty black. Wide tables must scroll INSIDE their own container — the
   page body must never scroll horizontally.
2. **"xVAR" survived the copy dictionary and the same quantity now has THREE names:** "Value above
   replacement (xVAR)" (player card, Roster Audit), "xVAR bracket" (Roster Audit menu), bare "xVAR"
   (Roster Capacity column header), "Value over replacement" (League Pulse). Pick ONE — the spec's
   is "Value over replacement" — and route it through the dictionary. **The render rule cannot
   catch this: `renderRule.ts:37` looks for 4+ consecutive capitals and "xVAR" is not.** Extend the
   rule with an explicit jargon list so it can.
3. **Internal QA language on a user surface:** Roster Audit header chips read "RB checked out in
   testing" and similar. That is crew vocabulary; write it for the manager or remove it.
4. **Roster Audit is mostly empty:** 22 of 26 rows read "Not scored yet / n/a / —", two adjacent
   columns both say nothing, and the QB context section renders "—" for every metric for all five
   QBs. Either give the empty state one honest sentence explaining WHY (per David's prose ruling)
   or stop rendering columns that never have data.

**Honesty law:** an empty cell explained is fine; an empty cell dressed up is not. Do not invent
data to fill a column — say why it is empty.
**Done:** no page scrolls sideways at 390 on ANY surface; one name for the quantity, enforced;
no QA vocabulary on user surfaces; empty states explain themselves. Real-browser proof at 1440/390.
