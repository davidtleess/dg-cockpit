# DG-146 — A small rookie marker on the roster row

**Layer:** 6 · **State:** done · **Lane:** Davids-MacBook-Pro-54105 · **DG 3.0** · **product truth / presentation · small**
**Source:** David, 2026-09-03 23:35 ET (03:35:57Z), answering Greg's plain-words question about DG-144's consequence #1 ("in the
roster table, the wide range was the only thing that made a rookie-model number look different from a measured one.
Now they look identical there. The player card still says which model scored him. Fine as is, or do you want a small
marker back in the table?"). Verbatim: **"2) small marker indicating theyre a rookie."** Filed 09-03 23:38 ET by Greg
(`davidleess-eb [a78c76]`), who builds it.

**Problem:** since DG-144 a rookie's number (rookie model: draft capital + age) and a veteran's measured number look
identical in the roster table. The card still says "Scored by: rookie model …"; the table says nothing.

**How we know:** DG-144 review panel, honesty lens, 2026-09-03 20:xx ET — `RosterAuditRow.tsx` renders no basis cue
once the range came off, and the number is not greyed by basis (David, 2026-09-01). Consequence #1 in DG-144's Notes.

**Done looks like:** each roster row for a rookie carries one small word, "Rookie", minted once in the copy dictionary,
between the name and its Details control; the number itself is untouched (09-01 ruling stands: same weight, same colour).
A fixture rookie row shows the word and a veteran row does not — watched red first; `npm run gate` green; no new
horizontal overflow at 390 or 1440. **Printed on the row's `is_prospect` flag** — which, the review panel found, the
roster route DERIVES from the rookie-model basis (`is_veteran = engine_path in {ENGINE_B, BLEND_AB}`;
`is_prospect = not is_veteran`, `roster_auditor.py:220/260`) and only for rookies taken in the league's 2026 draft
(`in_current_draft`, `:176-183`). True on every row served today (all 80 rookie-model rows are draft class 2026); the
first filing's "keyed on the player fact" was wrong one layer down and is corrected here; **DG-147** keys it on the
draft class and closes the waiver-rookie gap. Two honest limits: a short-sample VETERAN whose number is a blend
(DG-143's fill creates these) is not a rookie and gets no marker — distinguishable on the card ("Scored by") and in the
row's Details caveat only; and a 2026 rookie acquired OUTSIDE the league draft (8 league-wide today, none on David's
roster) gets no word AND no number on the roster while his card scores him — pre-existing, DG-147.

**Also in scope (panel, 09-04 00:1x):** the Players filter on the same screen said "Prospects" for exactly the rows
that now say "Rookie" — one fact, two words (DG-117). The option now reads "Rookies"; its value and behaviour are
unchanged.

**Anti-scope:** no styling of the number by basis; no change to the player card; no backend edit; nothing under `.oa3`.

**Depends on:** DG-144 (landed `505027b5`).

---

**Notes**

**Build + review record (Greg).** Cut 2026-09-03 23:5x ET from origin/main `22d904b0`; TDD — `RosterAuditRookie.test.jsx`
RED first (1 failed | 1 passed; the blend guard is green by construction). `5f19ebdf`: `ROOKIE_MARKER` minted in
`copy.ts`, the word after the name in `RosterAuditRow.tsx` on `is_prospect`, `.dg-roster__rookie` in `RosterAudit.css`
(tokens only; census unchanged). First gate attempt failed on import order and the smoke on a missing `timeout`
binary (macOS); the re-run: gate GREEN (631), `npm run visual:smoke` **25/25**, marker visible on Kaelon Black / Omar
Cooper Jr. / Fernando Mendoza in `artifacts/visual/roster-audit-desktop.png`. Panel 09-04 00:1x–00:2x ET, 3 lenses ×
2 refuters, 37 agents — **21 verifiers died on the spend limit ("resets 4:10am")**; the honesty lens was fully
verified, the correctness and protocol lenses' items re-verified inline by Greg (gate, smoke, census, commit paths,
base). Survivors → `54532718`: the "player fact" wording corrected everywhere (the flag is derived, see above); the
Players filter says "Rookies"; the test's rookie fixture carries the live row shape (`PROSPECT_C`, model status not
applicable, no percentile); the CSS comment says the border is decorative. Re-run on the final tree: gate GREEN
(631), smoke **25/25**. Refuted/unactioned notes: "Rookie" beside a blank value would be honest and is unreachable
today; at 1440 the word wraps "Details" to a second line on two rows (taller row, never a wider table — DG-117/128).

**LANDED 2026-09-04 07:30 ET — merge `12023dff` on `origin/main`** (rebased onto DG-145's `024de1ac`; pytest 6843
passed / 32 skipped; frontend gate 637/637 + build; worktree removed). **NOT LIVE**: trunk `6f517027`, now 14 behind
(DG-142 ×2, DG-144 ×3, DG-143 ×3, DG-145 ×3, DG-146 ×3). Live = pull before 09:00 or after 14:00 (Fred's window) →
`cd frontend && npm run build` → API restart — on David's word; not given as of 07:31.

