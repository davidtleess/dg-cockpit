# DG-108 — The backend still strips David-facing evidence with the repealed presentation vocabulary

**Layer:** 6  ·  **State:** todo  ·  **Lane:** unassigned  ·  **DG 3.0**  ·  **Follow-up recorded by DG-104's adversarial panel, 2026-08-30**
**Source:** David's ruling 2026-08-29 (verbatim in `DG091-DESIGN-BRIEF.md`): the frontend speaks layman's terms and may state overall recommendations; receipts stay one press away. DG-104 freed the FRONTEND's voice and deliberately left the backend alone — that was the right call for a frontend-only ticket, but it leaves live residue.

**Problem:** two presentation gates below the frontend still delete or block David-facing text using the repealed vocabulary, so the freed frontend is fed pre-censored evidence.

1. `app/api/routes/players.py:204-238` — `_banned_vocabulary()` loads `banned_standalone_words` + `banned_phrases` from `frontend/src/shell/banned_vocabulary.json` at request time. `_counter_argument_field()` blanks a counter-argument to `text=None` with caveat `evidence_suppressed_banned_term`, and `_evidence_list_field()` drops evidence items, whenever the text contains a word-boundary `elite`/`starter`/`depth`/`bust` or any of the 25 banned phrases. Under a ruling whose premise is "receipts one press away", a repealed word list is still removing receipts — and the replacement is a caveat, which is exactly the furniture the ruling drops.
2. `tests/test_rookie_board_contract.py:21-26` — still bans "draft target", "draft this", "trade candidate", "verdict", "confidence" in the David-facing Rookie Board HTML/JS (`src/dynasty_genius/dashboard/rookie_board.html`, `resources/*.js`). Untouched by DG-104 and previously unrecorded.

**How we know:** DG-104's three-lens adversarial panel (2026-08-30) raised both; both reproduce by reading the cited lines. `banned_vocabulary.json` is byte-identical across DG-104 (`git diff main...HEAD` touches it not at all), so these paths behave exactly as before.

**Done looks like:** the same split DG-104 applied to the frontend, applied here — *presentation* filtering of David-facing prose dies under the 2026-08-29 ruling; *evidence-typing* stays armed. Specifically: player-detail evidence and counter-arguments are no longer suppressed for containing a green-lit word, and the `evidence_suppressed_banned_term` caveat stops being emitted for that reason; the rookie-board contract's lexical bans are re-scoped to typed-field leakage rather than vocabulary. **Do NOT empty `banned_vocabulary.json`** — DG-104 kept all three lists deliberately, and `banned_fields` plus the phrase list still drive the armed frontend `banned_field_render` / `banned_field_label` gates and `scripts/validate_surface3_regen_integrity.py`.

**Depends on:** DG-104 (landed). This one CHANGES LIVE API BEHAVIOUR, so it is not a frontend-only ticket and needs its own before/after evidence on a real player payload.

---

**Notes**
- Same ambiguity rule as DG-104: if a check serves both purposes, split it rather than drop it, and record which half died under which authority.
- DG-104 also left the `no_directive_copy` component id standing in `app/config/tier_readiness.json` across five David-ratified surfaces. Its *expectation* strings were rewritten to the truth (they no longer claim directive-token enforcement), but the id itself still reads as a law that was repealed. **Renaming a David-ratified component id is David's re-ratification to make, not a lane's** — surface it to him rather than renaming it in a build ticket.
