# DG-025 — Ablate the usage features under a SCALED, tuned fit

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** Tower, 2026-08-18, reviewing three independent submissions against each other

**Problem:** Three lanes agree the usage features are inert in the shipped model. Two incompatible
explanations are on the table and **no test run so far discriminates between them.**

- **Explanation A** — the features are fine; unscaled Ridge with a large fixed α annihilated them.
  *Implication: the scaling defect has been costing real accuracy for months.*
- **Explanation B** — season-averaged rate stats are genuinely near-collinear with season-averaged
  points, so they carry nothing this target can use.
  *Implication: scaling changes nothing that matters, and the fix is the shape of the training row.*

**What has been run, and why none of it settles this:**
- Coefficient decomposition on the shipped model → shows inertness, silent on cause.
- Ablation of usage features → run against the **unscaled** shipped model, so it cannot separate A from B.
- Scaled technique screen → shows scaled Ridge beats naive at all four positions, but measures the
  **whole model**, never isolating the usage features.
- RidgeCV-with-scaling accuracy test → tested RMSE, not attribution.

**The test:** fit scaled Ridge with α tuned by nested expanding-time CV, twice — once with the usage
features, once without. Same folds, same everything else.

**Done looks like:** the two RMSEs, per position, with a cluster bootstrap interval on the difference.
- Materially different → **Explanation A.** The scaling defect is expensive; fix it first.
- Indistinguishable → **Explanation B.** Scaling is a correctness fix with no accuracy payoff, and
  DG-006 (week-level rows) is the only road forward.

**Depends on:** DG-017 supplies the scaled pipeline this needs.

---

**Notes**
This is one experiment and it decides which of two multi-week programs is worth running. It should
happen before either.
