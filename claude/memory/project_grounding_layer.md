---
name: grounding-layer-plan
description: "Grounding-layer decision — kernel now (guard + markup), full build gated to ~Aug 2026 on BUILD-1; checkpoints/owners so it isn't forgotten"
metadata: 
  node_type: memory
  type: project
  originSessionId: 7ae03760-46ad-426b-ba81-8c65aadac73b
---

Origin: David's idea (night of 2026-07-21) for a "grounding layer" — a salient, always-current record of the product's load-bearing findings so agents don't cite buried/stale beliefs. Explored + adversarially pressure-tested over a long session. Draft: `scratchpad/2026-07-21-grounding-layer-DRAFT-v2.md` (ephemeral — seed content for the eventual build).

**Verdict (mine, David-accepted):** good idea, but value is back-loaded (grows as the season transitions findings Hypothesis→Provisional→Validated ~Sept) while cost is front-loaded. Building the full projection system now = overkill/premature. **Extract the kernel now; defer the full build.** Key design law settled: the product is the SOLE source of truth; any grounding artifact is a pure PROJECTION that defines nothing (no thresholds, no independent gate). Uses ONLY existing DG vocabulary — the validation ladder `Hypothesis → Provisional → Validated` + `decision_supported` flag; the ladder never flips `decision_supported` (pre-existing DG firewall, verified in 3 layers incl. the constitution). No new terminology.

## The three pieces, their triggers, owners, checkpoints
1. **GUARD (urgent).** One line into the QB-1 **H2 pre-registration** doc + crew instruction: *rushing is under-test; may not be asserted as established until the pre-registration resolves.* Protects the live experiment from believed-as-proven contamination. Owner: crew (spokesperson). Checkpoint: **Tower parked board, OPEN, surfaced every boot; CLOSED only when Tower verifies the line is on-disk in the H2 doc.** Rides active QB-1 work — closes within days.
2. **MARKUP + CONSTITUTION FIX (deferred).** Crew produces a short honest map of the ~5–10 load-bearing findings graded Validated/Provisional/Hypothesis (draft capital → Hypothesis, not the proven-sounding constitution wording). USE it to correct the constitution IN PLACE (source of truth agents already read) — do NOT stand up a new doc (that recreates the roadmap.md staleness trap). Then park the map as seed for the full build. Owner: crew. Trigger: **ride the next constitution amendment cycle** (amendment train already running).
3. **FULL BUILD (gated, ~August).** The self-updating projection system (registry + generator + boot regeneration + point-of-use hook + enforcing checks). Go/no-go **~Aug 2026, gated on BUILD-1 signal** (which findings actually matter) + the 4 open questions answered (where run-scripts write results; full promotion-signal list; the category taxonomy; governance-digest alignment). If BUILD-1 shows no proven edge, the gate may say DON'T build. Checkpoint: **David's standing agenda in `tower.md`** — Tower raises it proactively in August with the BUILD-1 read.

## Why not bulletproof (and why that's fine)
Nothing here — kernel or full build — is the safety mechanism. Real robustness lives in existing defenses (pre-registration, No-Verdict linter, Codex falsification, David gates every promotion). Grounding is a convenience/salience layer on top. A visibly-partial kernel is SAFER here than a falsely-complete full system, because false completeness makes people stop checking — against the falsification discipline the whole operation runs on.

## Anti-forget mechanism (the point of this memory)
Two independent trackers so a single point of forgetting can't drop it: (a) **Tower** — board items 1+2, standing-agenda item 3, verify-on-disk discipline; (b) **this memory** — check at session boot/closeout. See [[cockpit_handoff]], [[project_dynasty_genius]].
