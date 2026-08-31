# DG-101 — Stale strategy docs still present forbidden architecture as the plan; a leftover cloud job is scheduled every minute

**Layer:** process  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG101-20260830  ·  **DG 3.0**  ·  **PRE-FREEZE (banners are docs-only; the job check needs a network call)**
**Source:** filed 2026-08-29 night on David's delegation ("u decide", gap-audit session).

**Problem:** Two pre-DG-3.0 docs still present themselves as the current plan: `docs/roadmap.md` (last commit 2026-04-30 — four months before the entire law set) and `docs/storage-strategy.md`, whose line 18 still reads "This doc is the blueprint. Code follows." while prescribing the Databricks/Delta architecture the master plan's restraint list (§9) forbids. And `infrastructure/resources/jobs.yml` declares `refresh_genius_state` with `quartz_cron_expression: "0 * * * * ?"` (:30) — every minute — which the master plan marks "Databricks — retire it or wire it. URGENT" (:814). Deployment/billing status unconfirmed; nothing in app/ or src/ imports Databricks.

**How we know (2026-08-29):** `git log -1 --format=%ci -- docs/roadmap.md` → 2026-04-30 08:16; `docs/storage-strategy.md:18` quoted above; `infrastructure/resources/jobs.yml:3,:30` quoted above; MASTER plan :814 quoted above. A fresh agent reading roadmap.md or storage-strategy.md today would work from a superseded plan — exactly how both prose inventories rotted.

**Done looks like:** (1) A dated supersession banner atop both docs (and any sibling presenting a superseded plan as current), naming the MASTER plan + REV2 as governing — docs-only, freeze-safe any day. (2) The Databricks question ANSWERED with evidence: read-only checks of whether the bundle/job is deployed and what it has billed, the finding handed to David with a retire recommendation — **the retire/wire ruling is HIS** (MASTER §8 item 4, :814-822: "Check whether this is costing money before ruling on it"; pausing or undeploying a deployed cloud job is an external write, David-gated per :265 — same class as the mail-carrier retirement he ruled on explicitly tonight). Execute on his word, recording the command run.

**Depends on:** network + Databricks auth for the read-only checks. If this machine has no working credentials, hand David the exact check commands to run via the `!` prompt instead of guessing.

---

**Notes**
- Do NOT delete the old docs — banner them. They are part of the record; the failure mode is presentation-as-current, not existence.
- The billing check is the urgent half: an every-minute Quartz trigger, if actually deployed and unpaused, has been burning since May. No one has looked. The check is read-only and needs no ruling; only the retire/wire ACT does.

---

## LANDED 2026-08-30 — merge `ae2309bf`; DATABRICKS RETIRED END TO END

**David's ruling:** *"as for databricks - we can retire it."* Then, after the evidence came back
and the workspace was torn down: *"ok go ahead remove it"* → the bundle deletion is **DG-112**
(merge `d5f4ede4`).

**The evidence half, run after David authenticated the CLI (its stored refresh token was dead,
so this needed his one interactive `databricks auth login`):**
- `databricks jobs list` → ONE job, `refresh_genius_state`, id `1030657541959808`, created
  2026-05-03, **live schedule `pause_status: PAUSED`**.
- `databricks jobs list-runs --job-id 1030657541959808` → **0 runs. Ever.**
- `databricks bundle destroy -t dev --auto-approve` → `Destroy: 1 deleted`.
- `databricks jobs list` after → **0 jobs.**

**⚠ THIS CORRECTS THE MASTER PLAN.** Plan :814 carried "Databricks — retire it or wire it.
URGENT", and the 2026-08-29 gap audit repeated it as a live billing risk, both reasoning from
`jobs.yml` declaring `pause_status: UNPAUSED` on `0 * * * * ?` (every minute). **The workspace
says it never fired and never billed.** Databricks Asset Bundles deployed with `mode:
development` auto-pause their schedules, so the repo's UNPAUSED never took effect. The risk was
**latent, not active** — a `-t prod` deploy would have armed a job firing sixty times an hour.
Both ends are now closed: nothing is deployed, and the definition is deleted.

*Lesson worth keeping: a declared schedule is not a running schedule. Measure the workspace;
never price a cloud job from its YAML.*

Docs half: dated supersession banners on `docs/roadmap.md` (last substantive 2026-04-30, four
months pre-DG-3.0, still promising buy/sell flags) and `docs/storage-strategy.md` (still
asserting "This doc is the blueprint. Code follows." for the forbidden Lakehouse architecture).
Both kept for history; neither is the plan.
