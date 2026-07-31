# THE SIX LAYERS — David's architectural doctrine, 2026-07-28 21:04 ET
# AMENDED BY DAVID 2026-07-30 19:05 ET — layers 4 and 5 SWAPPED. See the amendment below.

**Status: LAW. David's word, verbatim below. Nothing Tower does outranks memorialising this and
then making it ritual — his instruction, his priority order.**

> ## ⭐ AMENDMENT — DAVID'S WORD, 2026-07-30 19:05 ET
> **"fine - we can swith 4 and 5. but as i said everything must start with a robust and complete
> layer 1 and 2"**
>
> **THE ORDER IS NOW:**
> 1 ingest · 2 curate · **3 models** · **4 CONTEXT (the 12 managers, league behaviour)** ·
> **5 data analysis** · 6 front-end.
>
> **Why he moved it** (Tower's recommendation, 19:04, which he accepted): the old layer 4 —
> generic trend and cohort analysis — is where every public dynasty tool already competes. The
> old layer 5 is the only thing nobody can copy, because it needs HIS league. It also depends far
> more on layer 1 (transactions, which are NOT ingested) than it depends on generic analysis.
> Ordered the old way, the roadmap sent him through the crowded room first.
>
> **What did NOT change, and he restated it deliberately:** everything starts with a robust and
> COMPLETE layers 1 and 2. The swap re-ranks what happens AFTER the foundation; it does not move
> anything ahead of it.
>
> ⚠ **The original text below is preserved VERBATIM and its internal numbering is now historical.**
> Where his original closing line says "struggling in layer 4", that referred to generic data
> analysis, which is now layer 5. His words are not rewritten to fit the amendment.
>
> ⚠ **`docs/governance/05-layer-doctrine.md` in the product repo is the crew's copy and is STALE
> until amended.** Authoring that amendment is crew work; LANDING it is David's word.

> **1) we ingest the data** — we have a robust dataset available both paid and free and we can
> expand should we choose to. we must set up production grade pipelines that keep our data fresh
> and of high quality at all times
>
> **2) we curate** — joins, transformations, loads, modeling, identity graphs, etc. — think of it
> as our bronze->silver->gold data layers. always clean and usable by whatever use case requires
> it. as much of this as it makes sense should be scheduled and automatic.
>
> **-- Steps 1 and 2 are the foundation - if we don't have this our app WILL NOT WORK. we
> shouldn't be wasting cycles until we've built this foundation**
>
> **3) our models** — constantly benchmarking and trying to find edges against real results as
> they land. always trying new ways to improve accuracy and better predictability of future
> outcomes. the data science layer
>
> **4) the data analysis layer** — we have all this clean data — we need to constantly track
> trends, and analyze variables and cohorts, all different types of data analysis to spot edges
> and opportunities for me.
>
> **5) Context** — we have a special advantage that we can see manager behavior and specific data
> trends of the 12 teams in this league — an analysis of each manager and overall league data is
> the next advantage point
>
> **6) Front-End** — empowering me with layers 1-5.
>
> **We cannot lose track of these layers. if we're struggling in layer 4 but we haven't fortified
> and tested layers 1 and 2, we're not thinking correctly.**

---

## THE PROOF, SAME NIGHT — why this rule exists

David issued this **immediately after** an evening that demonstrated its necessity, and the
sequence should never be forgotten:

- Tower and the crew spent ~3.5 hours on **layer 6** — the exact wording of a sentence on a
  player card for 113 players shown as "Modeled" with no value.
- Four wording options were produced, re-cut against a newly discovered reason, and David picked
  one.
- **David then broke the entire premise with two sentences of football knowledge**: *"i know for a
  fact Garrett Wilson has played well over 8 games"* and *"i also know he was a first round pick."*
- Measurement that followed: **all 501 modeled-route players carry an empty `nfl_draft_round`.**
  Draft capital is absent from the entire modeled population. The Engine A prospect prior the
  design depends on has nothing to read.
- His verdict: *"this screams data quality problem. not 113 slide through a gap."* He was right.
- Codex independently found the system writes *"Engine A prospect score used as prior"* on all 113
  when **no prior was used** — a false sentence the system tells itself.

**A layer-1/2 defect was consuming an entire evening of layer-6 effort, and nobody noticed until
the human with football knowledge looked at it.** That is precisely the failure mode this doctrine
forbids.

---

## TOWER'S OBLIGATIONS — the ritual, not the poster

**1. Every piece of work gets a LAYER STAMP before it starts.** Tower states which layer the work
serves, out loud, when relaying any order to a lane.

**2. THE FOUNDATION QUESTION, asked before Tower relays work at layer 3, 4, 5 or 6:**
> *Is this defect actually at this layer, or is it a symptom of layers 1–2?*
If the honest answer is "unverified," that is the finding, and it goes to David BEFORE the work
is ordered — not after three hours of it.

**3. Tower reports layer position to David when it changes what he should think.** "We are fixing
a screen for a data problem" is a sentence Tower owes him unprompted.

**4. Foundation work outranks everything above it in the same thread.** If layers 1–2 are unproven
for the data a piece of work touches, Tower says so and recommends the foundation first. David can
overrule; Tower may not skip the statement.

**5. This is checked at BOOT and at CLOSEOUT**, alongside the board rebuild. The closeout debrief
names which layers today's work served, and whether any of it rested on an unverified foundation.

**6. Studio is OUTSIDE this.** These six layers are OUR architecture. The inversion rule stands:
Studio never receives our roadmap, backlog, or internal architecture. It may independently arrive
at anything it likes — as it did tonight, finding two of four trade-partner score components are
hardcoded constants because the app has never called Sleeper's transactions endpoint, which is
itself a layer-1 ingestion hole found from outside.

---

## STANDING READ, recorded 2026-07-28

On tonight's evidence the cockpit has been operating **top-down** — layer 6 surfaces, layer 3
model honesty — while **layer 1 ingestion has holes nobody has inventoried**: draft capital absent
across 501 modeled players; Sleeper's transactions endpoint never called in the product's history;
seven scheduled data jobs that ran ten hours late two days ago; a compliance check red since
2026-07-25.

**Tower's recommendation, David's to accept or reject: the next real thread is a layer-1/2 audit —
what we ingest, what is missing, what is stale, and what is silently constant.** Not more surfaces.
