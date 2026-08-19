# DG-010 — Position-specific age curves

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** independent consultant brief, 2026-08-18 (named failure mode #2)

**Problem:** Running backs fall off a cliff; receivers and quarterbacks plateau late. If age enters
the model linearly or near-linearly, we are systematically wrong at both ends of every position's
curve — and in dynasty, both ends are where the trades happen.

**How we know:** an aging-curve concept exists in the repo's older execution plan, but no fitted
per-position age curve artifact is in use by Engine B today.

**Done looks like:** a fitted, versioned age curve per position, measured from our own historical
data rather than assumed, with the residual improvement over the current treatment stated.

**Depends on:** DG-002.

---

**Notes**
This one is close to the heart of what David actually trades on, and it is cheap relative to
DG-005/006/007. Worth considering early.
