# DG-129 — The availability model is not a published artifact, so a CSV edit changes served values

**Layer:** 3 · **State:** todo · **Lane:** — · **DG 3.0** · **backend / serving integrity**
**Source:** the KNOWN SIMPLIFICATION declared in `ee57d802`, filed rather than left in a commit body.

**Problem:** since `ee57d802`, served value is `P(plays) × E[points | plays]`. The four Engine B
bundles are published artifacts under `v2_manifest.json`, protected by the publish sentinel
(`cd4a6234` + `d280530b`). **`P(plays)` is not.** `availability.score_rows` re-fits at SCORING
TIME from `app/data/training/engine_b_features_v2.csv`.

Consequences, all live:
- Regenerating that CSV changes every served value with **no model publish and no receipt**.
- The publish sentinel does not cover it — a scorer cannot defer to a fit that never declares.
- It is not point-in-time reproducible: replaying a past date re-fits on today's table.

That is precisely the silent coupling the sentinel exists to make visible for the other four
bundles, and it is the one model in the serving path without it.

**Do:** train and persist the availability model as a run-scoped artifact, register it in a
manifest, bring it inside the sentinel's window, and load it at scoring time instead of fitting.

**Done:** no fit happens at scoring time; the artifact has a run id and a validation report
carrying its walk-forward folds and calibration; and regenerating the training CSV cannot change
a served value without a model publish.
