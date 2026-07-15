# David's bus protocol — running the Studio lane

## Launching Studio

Studio is baked into the cockpit: `dg` now creates it automatically as **window 2** (named `studio`) of the `dynasty` session, alongside the engineers' 3-pane window 1. Switch with `Ctrl-b 2` / `Ctrl-b 1`. Because `dg` kills and rebuilds the session, every `dg` run gives Studio a fresh session automatically — the reset cadence is built in.

To launch it manually inside an already-running cockpit:
```bash
tmux new-window -t dynasty -n studio -c ~/frontend-studio
claude
```

The working directory MUST be `~/frontend-studio` — that is what loads Studio's persona instead of the repo's governance bootstrap. Never launch Studio with its working directory inside `dynasty-genius-product`, and never paste the governance/session-starter reads into its window.

First boot: just say "Introduce yourself and begin." It will read the briefing, run the app, and write `proposals/000-first-impressions.md`.

## Message flow

1. Studio writes a proposal to `~/frontend-studio/proposals/NNN-*.md` plus a companion relay brief `NNN-RELAY.md` — the engineer-facing message, authored by Studio in its own voice.
2. You read the summary block at the top of the RELAY; Studio prints its David-only commentary (contested-territory flags, sequencing advice) directly in its pane when it hands you the proposal. You decide if it goes to the engineers at all (you are a filter, not a pipe). Check for two things only: nothing you've decided to hold back, and no attempts to guess at the team's internal rules. Do not rewrite its arguments — fidelity is the point.

Your feedback compounds: anything you tell Studio gets distilled into `~/frontend-studio/DAVID.md`, which it re-reads at every session start — so your corrections survive the fresh-session resets. If Studio ever repeats a mistake you've already corrected, check that file first; the entry may be missing or badly distilled.
3. Delivery is Tower's job (since 2026-07-14: David is the gate, never the wire). On David's "relay NNN", Tower sends `From Studio — review ~/frontend-studio/proposals/NNN-RELAY.md and respond per the standing protocol` to all three crew panes (they may read `proposals/` — it contains only Studio's outward-facing work), verifies each delivery landed (input line cleared or spinner visible; retry Enter once — the tmux paste race strands messages), sends Studio the bare mechanical ack (`NNN relayed to crew`, nothing more), and confirms to David. Framing stays neutral — no lean signaled, or the review is biased.
4. Engineers respond with cost/steelman/verdict or an escalation. You relay the substance back to Studio — strip any governance references, spec names, or process language before it crosses; paraphrase rather than paste when in doubt.
5. You rule on escalations. If you amend governance because of one, that's the system working.

## The proposal lifecycle

1. **Studio drafts** `NNN` proposal + `NNN-RELAY.md`, prints its David-only commentary in its pane.
2. **You gate** (summary block + pane note; the two checks) → your "relay NNN" to Tower is the trigger.
3. **Tower transports.** You say "relay NNN" in Tower's pane; Tower delivers the standard relay line to all three crew panes, verifies each landed (the inter-agent messaging has a known stranding race), acks Studio mechanically, and confirms to you. Manual fallback: Studio's pitch always includes the exact one-liner so you can paste it yourself if Tower isn't running. You are the gate, never the wire.
4. **Engineers verify** through their own adversarial loop and converge on ONE consolidated response: per item, CONFIRMED (root cause + cost) / REFUTED (with repro) / ESCALATE (governance conflict, cost/benefit). Verification only — a relay never authorizes implementation.
5. **You rule**: pick which confirmed items become work (per-item approval, your normal gate); decide escalations; relay verdict *substance* to Studio stripped of governance/spec language.
6. **Studio updates**: retracts refuted items "without ceremony," iterates prototypes on confirmed design gaps, logs any of your feedback to DAVID.md.
7. **After fixes ship**, point Studio at the running app to re-run its repro paths and confirm from the user's seat — the outsider is also your acceptance tester.

Concurrency is intended: Studio works ahead (researching/prototyping `NNN+1`) while the engineers verify `NNN`, treating unverified findings as provisional. Proposals never schedule work — you are the only scheduler.

## Boundary rules (what may cross)

Toward Studio: engineering facts, costs, technical constraints, data realities, your decisions. NEVER: governance/spec/constitution content or names, sync state, ledger text, the team's internal debates.

Toward the engineers: Studio's proposals and arguments as written. NEVER: instructions to defer, or your verdict before their review.

## Red flags to watch

- An engineer answers a proposal with policy citations and no named cost → point them at rule 1 of the welcome message.
- Studio asks to read governance/design docs "for context" → refuse; that's the covenant.
- You notice Studio's proposals starting to sound like the team (spec language, doctrine terms) → contamination; time for a reset.
- Agreement arriving too fast on both sides → nobody is doing the work; ask for the costs.

## Reset cadence

Fresh perspective decays. Every few weeks — or when the red flag above fires — start Studio as a fresh session (`claude` in `~/frontend-studio`, no resume). Its persona, the briefing, and its own past proposals in `proposals/` carry forward on disk; its accumulated conversational drift does not. Refresh `PRODUCT_BRIEFING.md` first if the app has changed materially (rerun the three-agent briefing exercise or ask me).

## Escalation ledger

When you rule on a Studio-vs-governance escalation, note the ruling in one line at the bottom of this file. If the same rule generates three escalations, that rule is the problem — amend it with the engineers.

---
### Rulings
(none yet)
