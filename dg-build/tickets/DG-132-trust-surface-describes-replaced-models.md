# DG-132 — Every accuracy figure on screen describes models that were replaced on 08-31

**Layer:** 2 · **State:** done · **Lane:** Davids-MacBook-Pro-37947 · **DG 3.0** · **backend + frontend · PRE-FREEZE**
**Source:** scoreboard audit 2026-09-01, verified independently. David's direction: land before the
2026-09-04 freeze; it is the only item on the pre-kickoff cut.

**Problem:** the trust surface publishes accuracy figures for four models that are no longer served.

    artifact run_date  2026-05-31        served bundle  20260831T204458Z
    QB claims d7acb680...   served fbb3617b...   MISMATCH
    RB claims 5507e37f...   served 03f67f7c...   MISMATCH
    WR claims 3b83bbf9...   served e1cbb125...   MISMATCH
    TE claims e2ca15ed...   served 84f05d61...   MISMATCH

`TrustStrip.tsx` renders on EVERY surface, so this is not a corner of the product — it is the
persistent honesty claim David reads all day, and it is currently describing replaced models.

**Why nothing catches it — two distinct failures, both verified:**

1. `scripts/publish_trust_surface.py:100-104` guards with
   `card.get("model_version") != artifact.model_version`. Both are the literal string
   `"engine_b_v2"` for every bundle ever built, so the check passes by construction while the
   artifacts differ.
2. `scripts/publish_trust_surface.py:112-114` stamps the published card source with
   `artifact.model_version` / `artifact.model_artifact_hash` / `artifact.git_sha` — **copied from
   the artifact**. `scripts/validate_trust_publication.py:197-199` then compares that stamp back
   against the same artifact. It compares a value to a copy of itself and is structurally incapable
   of failing.

Neither check ever consults the model that is actually SERVING. That is the missing comparison.

**⛔ ANTI-SCOPE — do NOT regenerate the model cards as the fix.** Regenerating stamps the served
model's identity onto a grade computed for a different, smaller model (displayed 15/11/14/14
features vs served 17/13/16/16) and converts a detectable mismatch into a permanent green light.
The numbers are stale because the backtest has not been re-run; publishing them under a new hash
launders that. Re-running the backtest is separate work and is NOT pre-freeze.

**Do:** compare against the served artifact, by content, and fail closed.
- A check that reads `app/data/models/engine_b/v2_manifest.json`, sha256s each served bundle, and
  compares to the trust artifact's recorded `model_artifact_hash`.
- Unreadable manifest, missing bundle, or absent hash → NOT aligned. Never assume alignment.
- Surface the result so David is told, in plain prose, that the figures describe an older model.
  Copy follows David's 2026-08-29 ruling: prose, no pipeline or governance vocabulary.
- Add the sentence to the copy dictionary BEFORE the field ships, per the DG-091 render rule.
- Regenerate OpenAPI via the script; never hand-commit `frontend/openapi.json` (known trap).

**Done:** a served-vs-published content mismatch is detected and stated on screen; the check fails
closed on unreadable inputs; a test pins that alignment is FALSE today for all four positions and
TRUE when the hashes match; existing trust-surface tests still pass; no published value changes.

## LANDED 2026-09-01 — `3bc9ecd2` on `main` (via `dg-land.sh`)

**What was built**
- `src/dynasty_genius/eval/served_model_alignment.py` — `check_served_alignment(position, published_hash)`
  reads `app/data/models/engine_b/v2_manifest.json`, sha256s the served bundle by content, and compares
  it to the trust artifact's `model_artifact_hash`. Fails closed on: no published hash; unreadable
  manifest; position missing from the manifest; missing bundle file. Added to `AUTHORIZED_EVAL_FILES`
  in `tests/contract/test_subsystem_4_audit.py` with a justification comment (the audit test failed
  first, as it should).
- `app/api/routes/trust_surface.py` — `TrustSurfaceResponse` gains `describes_deployed_model: bool`
  and `deployed_model_note: str | None`. The note is one plain sentence, no pipeline vocabulary:
  *"These accuracy numbers were measured on an earlier version of this model. The version answering
  today has been retrained since."*
- `frontend/src/shell/TrustStrip.tsx` renders the note only when present (`.dg-trust__stale-model`,
  cliff colour, semibold). OpenAPI regenerated via `npm run openapi-gen`, never hand-edited.

**Tests** — `tests/contract/test_served_model_alignment.py` (8, incl.
`test_live_artifacts_are_currently_misaligned_for_all_four_positions`, which pins that the check
fires TODAY); `frontend/src/shell/TrustStrip.test.jsx` (+2: note shown when misaligned, silent when
aligned). Full suite + frontend gate green through `dg-land.sh`.

**Anti-scope honoured** — no model card regenerated; no backtest re-run; no published value changed.

**⚠ LANDED IS NOT LIVE.** At landing, the trunk `~/dynasty-genius-product` sat at `0def485d`
(does not contain `3bc9ecd2`) and the API process has been up since 2026-08-31 08:18. David sees the
note only after a trunk fast-forward AND an API restart, and the restart is sequenced AFTER the 09:00
chain's `engine_b_prediction_conflict` partition fix (davidleess-a0's), which must not be raced.
Until then the trust strip still shows the stale figures with no warning.

**Post-freeze, separate ticket:** re-run the backtest against the served bundles so the figures can
become true again — that is the only thing that turns the note off honestly.
