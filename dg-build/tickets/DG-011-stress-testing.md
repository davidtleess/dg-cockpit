# DG-011 — Stress-test the model outside its training distribution

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** independent consultant brief, 2026-08-18

**Problem:** We do not know how the model behaves in the seasons that matter most — injury waves,
unexpected rookie breakouts, an offence collapsing. Those are precisely the weeks a dynasty edge is
won or lost.

**How we know:** no out-of-distribution or scenario testing exists in the repo.

**Done looks like:** a small set of named historical stress cases replayed through the model, with
the error on each stated plainly next to the normal-season error.

**Depends on:** DG-002.
