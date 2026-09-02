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
