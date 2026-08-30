# DG-101 — Stale strategy docs still present forbidden architecture as the plan; a leftover cloud job is scheduled every minute

**Layer:** process  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**  ·  **PRE-FREEZE (banners are docs-only; the job check needs a network call)**
**Source:** filed 2026-08-29 night on David's delegation ("u decide", gap-audit session).

**Problem:** Two pre-DG-3.0 docs still present themselves as the current plan: `docs/roadmap.md` (last commit 2026-04-30 — four months before the entire law set) and `docs/storage-strategy.md`, whose line 18 still reads "This doc is the blueprint. Code follows." while prescribing the Databricks/Delta architecture the master plan's restraint list (§9) forbids. And `infrastructure/resources/jobs.yml` declares `refresh_genius_state` with `quartz_cron_expression: "0 * * * * ?"` (:30) — every minute — which the master plan marks "Databricks — retire it or wire it. URGENT" (:814). Deployment/billing status unconfirmed; nothing in app/ or src/ imports Databricks.

**How we know (2026-08-29):** `git log -1 --format=%ci -- docs/roadmap.md` → 2026-04-30 08:16; `docs/storage-strategy.md:18` quoted above; `infrastructure/resources/jobs.yml:3,:30` quoted above; MASTER plan :814 quoted above. A fresh agent reading roadmap.md or storage-strategy.md today would work from a superseded plan — exactly how both prose inventories rotted.

**Done looks like:** (1) A dated supersession banner atop both docs (and any sibling presenting a superseded plan as current), naming the MASTER plan + REV2 as governing — docs-only, freeze-safe any day. (2) The Databricks question ANSWERED with evidence: read-only checks of whether the bundle/job is deployed and what it has billed, the finding handed to David with a retire recommendation — **the retire/wire ruling is HIS** (MASTER §8 item 4, :814-822: "Check whether this is costing money before ruling on it"; pausing or undeploying a deployed cloud job is an external write, David-gated per :265 — same class as the mail-carrier retirement he ruled on explicitly tonight). Execute on his word, recording the command run.

**Depends on:** network + Databricks auth for the read-only checks. If this machine has no working credentials, hand David the exact check commands to run via the `!` prompt instead of guessing.

---

**Notes**
- Do NOT delete the old docs — banner them. They are part of the record; the failure mode is presentation-as-current, not existence.
- The billing check is the urgent half: an every-minute Quartz trigger, if actually deployed and unpaused, has been burning since May. No one has looked. The check is read-only and needs no ruling; only the retire/wire ACT does.
