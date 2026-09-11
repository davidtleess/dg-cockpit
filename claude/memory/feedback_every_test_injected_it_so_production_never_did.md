---
name: feedback_every_test_injected_it_so_production_never_did
description: "DG-215 2026-09-10: every test injected the release-inventory provider, so nobody noticed the CLI passed none — the feature was inert in the only path that runs in production while the suite stayed green."
metadata:
  type: feedback
---

**If every test supplies a dependency, no test can see that the real entrypoint never supplies it.**

DG-215 classified a late nflverse feed as "waiting" using evidence from a release-inventory probe.
Forty tests injected that probe. **Neither CLI branch passed one**, so in production the classifier
had no evidence, a real absent `snap_counts_2026.parquet` was recorded as an error, and the retry
queue stayed empty. The feature was inert exactly where it mattered and the suite was green. Root
found it by reading the CLI, not by running anything.

Writing the test for it immediately exposed a second defect in the same file: `DEFAULT_RAW_ROOT` was
referenced but never imported, so **the CLI raised `NameError` on every invocation without
`--raw-root`** — which is every production invocation.

**How to apply:**
- For any injected dependency with a production default, write one test that exercises the REAL
  entrypoint and asserts the wiring: `assert kwargs["release_inventory"] is default_provider`. The
  injection point and the production wiring are two different facts.
- ⭐ Ask *which path does the user's machine actually take?* and test that path once, end to end.
  A suite that only ever calls the library never touches `main()`.
- Keep the library default `None` so tests stay offline by construction, and let the CLI supply the
  real provider — but then the split itself has to be asserted, or it is just a convention.

**A second trap from the same ticket — a helper with no caller reads like the fix.** I told the
reviewer a diagnostic was wired into the status payload. Only the function existed; my patch script's
anchor had silently failed to match and I reported the result without checking the bytes. The
reviewer's grep found one reference — its own definition. **That is worse than the original gap: the
name reads like completed work to anyone searching for it.** After any scripted edit, grep for a
CALLER, not for the definition. Related: [[feedback_the_failure_path_returns_the_success_signal]],
[[feedback_a_correct_payload_is_not_a_correct_product]].
