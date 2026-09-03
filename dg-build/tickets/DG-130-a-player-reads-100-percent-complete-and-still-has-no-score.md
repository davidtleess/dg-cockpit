# DG-130 — A player reads 100% complete and still has no score, and nothing says why

**Layer:** 6 (with a Layer 3 half) · **State:** todo · **Lane:** — · **DG 3.0** · **frontend copy + backend**
**Source:** 2026-09-01. Bob measured it, David rejected the framing that made it look defensible.

**Problem:** `feature_completeness` counts whether COLUMNS are populated. The gate counts
whether there is enough SEASON. They are different questions and the surface shows one while
silently gating on the other.

Garrett Wilson reads `feature_completeness 1.0`, `risk_flags []`, identity resolved,
`model_grade ACTIVE_B`, a live `projection_2y` of 11.22 — and **no score**, because `games_t`=7.
A flawless feature row describing seven games.

The asymmetry makes it worse: Braelon Allen at 0.9286 carries a "Signal completeness 93%"
caveat, and **Wilson carries none at all** — so the player with PERFECT completeness gets the
LEAST explanation for his own blankness. That combination is what led a lane to conclude the
gate was not the cause and to start hunting in DG-092-guarded xVAR code for a symptom.

**Two halves, do not conflate:**
1. **Copy (do first — the honest half):** when a score is withheld for sample size, say so in
   prose, in David's language. "We have his full record for seven games — not enough season to
   rank him yet" is true, useful, and not governance vocabulary.
2. **Backend:** every withheld score emits a caveat naming the ACTUAL reason. Today 391 of the
   498 addressable-unranked carry no caveat of any kind.

**Related and worth folding in:** four scored players on David's roster carry no position
percentile (`compute_dvs_pct_batch` filters its reference population on `model_grade ==
"ACTIVE_B"`, excluding prospects by construction), and `/api/roster/audit` exposes a `dvs_pct`
field that is **null on all 27 rows** while the live percentile is served elsewhere as
`xvar_percentile_position`. A consumer reading the audit sees a field that will never populate.

**Honesty law:** a surface that shows a completeness number must never let it imply the score
was computed.
**Done:** no player displays a completeness figure alongside an unexplained blank; every
withheld score names its real cause in prose; the dead `dvs_pct` field is populated or removed.

---

## Scope — 2026-09-02 15:05–15:33, Tower (two read-only readers over trunk `862a1afb` + live API pid 95078; every decisive line re-verified by Tower)

### The three blanks on David's roster today, and the mechanical reason for each

| Player | Served today | Real reason | Where the reason lives / dies |
|---|---|---|---|
| **Garrett Wilson** WR | `—`, completeness **100%**, "Scored by the active-player model", caveats `no_usage_signal` + `age_curve_only` | 2025 row `games_t=7` < `ENGINE_B_MIN_GAMES_T=8` (`engine_b_contract.py:143`; gate at `pvo_assembler.py:434-441`). Engine B DID score him (`projection_2y` 11.23); with no Engine A prior the assembler nulls the score at `:497-507`. His 2022 and 2023 rows are 17 games each — he is not thin, the gate is one-season ([[project_ranking_diagnosis_2026-08-31]]) | The artifact row carries the reason as prose ("Insufficient professional season data — …"). The roster audit **drops it** — `roster_auditor.py:210` rebuilds `caveats` from the age lane only and never reads the universe row's; `:255-258` hard-code `inputs_missing=[]`, `risk_flags=[]`. Then `:172` calls `audit_player(player)` with no `engine_b_score`, so `:531-537` stamp `no_usage_signal` + `age_curve_only` on him — **"We have no snap or usage data for him" is FALSE on a 100%-complete row that has snap share.** The card hides the backend's own `degradation.message` behind `PlayerDetailCard.tsx:48` `{!modeled && …}` — he is `modeled`, so it never renders; what does reach the card is the assembler's raw prose via `EvidenceSection` (passes the render rule by shape: no underscore, no shout). |
| **Braelon Allen** RB | `—`, 93%, "Signal completeness 93% — missing: ppg_t_minus_2" | Same gate, `games_t=4`; `projection_2y` 4.89; nulled at `:497-507` | Same losses. His one visible caveat names a lag, not the gate — the wrong reason, confidently. |
| **Tank Dell** WR | `—`, 24%, "…active-player model not yet validated…" | **No 2025 row at all** (runtime CSV has only his 2023 row, 10 games) → `select_inference_partition` finds nothing → routed `PRE_MODEL` (`universe_pvo_batch.py:41-47`). Not an identity failure (`identity_status=sleeper_resolved`) and not the gate. | This row DOES say why — verbosely, in 13 missing-input names — and the dictionary maps it to the wrong sentence: `copy.ts:641-646` turns every `dynasty_value_score unavailable:` into "the active-player model has not been validated for his position". WR is validated. The truth is "he did not play last season". |

**Population (artifact 14:50):** 115 ENGINE_B rows with a null score; **114 are `games_t` 4–7** (4:33 · 5:29 · 6:31 · 7:21); **54 of the 115 read completeness 1.0** — Wilson's case is the majority case, not an edge. The 115th is Bo Melton (crosswalk position CB; no `ENGINE_B_P90_PPG["CB"]`, `pvo_assembler.py:432`) — a different reason class, unrostered, note only.
**`dvs_pct`:** confirmed null on 27/27 audit rows while the live percentile is served on the card as `xvar_percentile_position`.
**Side finding → DG-139:** Wilson's row says age 25 AND "2 years to the 28 cliff" — served age is the feature-season age; 324 rows a year young.

### What the ticket already knew that survives
Two halves, honest half first. The Wilson sentence in the Problem statement is still the right sentence. Both readers' candidates and the ticket's own pass a port of the render rule's three regexes and contain none of the backend's banned phrases/standalones (`players.py:209-224` `_contains_banned` would silently blank a caveat that used "starter/depth/bust/elite").

### Fix shape — one landing, three layers, in this order (the bundle must be rebuilt anyway)

**1. Backend emits a TOKEN, not prose** (`pvo_assembler.py:497-507`, the rule its own comment at `:496-503` already states): replace the dead-window sentence with
`score_withheld_short_season:games=<N>` (gate), `score_withheld_no_season` (no inference row → PRE_MODEL), `score_withheld_identity_unresolved` (identity not resolved). Then **carry it to the roster row**: `roster_auditor.py:210-216` copies the universe row's withheld-token into `caveats`; and `:172`/`:531-537` stop stamping `no_usage_signal`/`age_curve_only` on a row that HAS a `projection_2y` (pass the projection in, or gate on `row["projection_2y"] is not None`). Contract tests: the three roster rows each carry exactly one `score_withheld_*` token and NOT `no_usage_signal`; the artifact and the audit agree.

**2. Dictionary** (`frontend/src/lib/copy.ts`): three entries, the games one parameterized exactly like DG-128's `engine_ab_blend_low_sample:games=N` at `:614-624`; and repair `:641-646` so the PRE_MODEL prefix no longer claims "not validated for his position" when the position IS validated. Candidate sentences (David's choice; all three pass the render rule and the backend banned-term filter):
- gate — **"We have his full record for 7 games — not enough season to rank him yet."** (the ticket's own) or **"He played only 7 games last season — we need eight before we put a number on him."** (says the threshold out loud)
- no season — **"He did not play last season, so there is no season on the books to rank him from."**
- identity — **"We cannot yet match him to his NFL record, so there is nothing to score him from."** (`identity_unverified` already exists at `copy.ts:448`; reuse or replace)

**3. Surfaces:**
- Roster row `RosterAuditRow.tsx:81`: dash **plus the sentence** in the value cell. `:94` — the honesty law: when the score is null, the completeness cell does not print a bare "100%"; it prints "—" (or the reason, David's call).
- Card `PlayerDetailCard.tsx:48`: add a `modeled && dynasty_value_score == null` block routed through the dictionary; stop printing `degradation.message` raw; the `!modeled` prose at `:51-53` ("stays blank until our next model run") is false for a gate case and goes.
- `dvs_pct` (the ticket's "related"): populate from the same source the card's `xvar_percentile_position` comes from, or drop it from `RosterAuditPlayer` — Tower recommends **populate** (David asked for one number and a percentile is how he reads it), in its own commit inside the same landing.

### What this is NOT
It is the honest sentence while coverage is unfixed. David's ruling "rank everyone, always" ([[david_rulings_ranking_2026-08-31]]) is satisfied only by the coverage fix (the gate reads durability off ONE season while the row carries three); DG-130 must not be reported as satisfying it.

### Decisions for David (after the morning read)
1. Gate sentence: the ticket's wording, or the one that names "eight"?
2. Completeness cell on a blank row: "—", or the reason sentence a second time?
3. `dvs_pct`: populate or remove?
4. Build order: DG-130 before DG-139 (age) or after — both are on his roster; DG-139 is a two-line flip, DG-130 is a day.

**Size:** backend + auditor + tests ≈ half a day; dictionary + two surfaces + fixture refresh (the render-rule fixture still has Wilson as PRE_MODEL at 24% — stale) ≈ half a day. One landing; pull needs bundle rebuild + restart.
