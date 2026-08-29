# DG-054 — One versioned name normalizer producing staging keys

**Layer:** 2  ·  **State:** doing  ·  **Lane:** Davids-MacBook-Pro-22452  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 2d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** Proposal §7.1 (line 329) requires exactly one versioned name normalizer; today name normalization is scattered per-source — playerprofiler's suffix-insensitive logic, footballguys intake, the cfbd adapter, the prospect resolvers, and the QB eval lane each carry their own normalize-name code with no version stamp. The same raw name can therefore resolve differently per stream, and no identity outcome can cite which normalizer produced its staging key, which blocks any future identity assertion from being evidence-grade. Deliverable: a single normalizer module emitting a normalizer_version, per-source callers migrated behind it, and the version recorded in ingest identity outcomes. Small, independently landable, and a stated precondition of the owned-identity migration.

**How we know:** docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:329; src/dynasty_genius/playerprofiler.py:160-186 (suffix handling local to one source); parallel normalize-name logic in src/dynasty_genius/sources/footballguys_intake.py, adapters/cfbd_receiving_adapter.py, identity/college_prospect_identity.py, eval/qb_validation/identity.py (grep verified 2026-08-26)

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.

---

## Build record — 2026-08-28, lane Davids-MacBook-Pro-22452

**Branch:** `ticket/DG-054` · **Commit:** `1119ed715db0cef44115502c93edfe03e230a478` · pushed to origin. NOT landed — coordinator reviews and lands.

**Built:** `src/dynasty_genius/identity/name_normalizer.py` — the §7.1 normalizer.
Frozen v1 pipeline: missing-guard (None/NaN/pd.NA/pd.NaT mint NO key) → NFKD → ASCII fold →
lowercase → remove intra-token punctuation (`.` `'`) → non-alnum runs split tokens → strip
TRAILING generational suffixes (jr/sr/ii/iii/iv/v; never the only token; suffix kept as
metadata) → join. Output `NormalizedName{raw, normalized, suffix, staging_key, normalizer_version}`;
`normalizer_version = "dg_name_normalizer.v1"` stamped in every output; staging key format
`stg1:<name_with_underscores>` so keys self-identify their version and `is_staging_key()` keeps
them unmistakable for gsis/sleeper/dg_id. `to_dict()` is the fragment ingest identity outcomes
embed. Tests: `tests/test_name_normalizer.py`, 36 tests, hypothesis property tests derandomized
(idempotence, determinism, version stamp, charset/key-shape, known cross-source collisions,
non-collisions, missing-scalar no-key). Watched RED first (`ModuleNotFoundError`), then green:
`.venv/bin/python -m pytest tests/test_name_normalizer.py -q` → `36 passed`. Ruff via
pre-commit `ruff-check` → Passed. Neighbor sanity: `pytest tests/test_identity_coverage_matrix.py`
→ `21 passed`. `git status --porcelain` before commit showed ONLY the two new files.

**Scope decision (flagging for coordinator):** the ticket text says "per-source callers migrated
behind it", but David's scoping law (identity migration post-season; additive enabler only —
staging keys BESIDE existing keys, re-key nothing live) controls: consumers are NOT rewired.
The module offers the canonical path; the eight legacy chains it supersedes are enumerated with
file:line in its docstring, each to migrate in its own ticket. Note the QB-eval chain
(`eval/qb_validation/identity.py:41`) is registered evidence (`h5.join.normalization`) and must
never be silently re-pointed. Survey note: `sources/footballguys_intake.py:200`
`_normalized_target` is an archive PATH normalizer, not a player-name normalizer — the ticket's
grep over-matched there; player-name handling in that intake carries names as identity evidence
but has no own normalize chain to migrate.

**Deliberate v1 divergences from legacy chains (versioned, documented in module docstring):**
trailing-only suffix strip (legacy strips anywhere — middle initial "V" now survives);
"A.J. Brown" keys as `aj brown` (qb chain would give `a j brown`); no nickname aliasing
(GIVEN_NAME_ALIASES stays resolver-level in `identity/__init__.py`).
