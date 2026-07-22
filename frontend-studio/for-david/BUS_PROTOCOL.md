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
3. Delivery is Tower's job (since 2026-07-14: David is the gate, never the wire). **Since 2026-07-21 the wire rule is: sender owns delivery.** Whoever sends a message verifies it landed **positively** — confirm the message CONTENT actually appears in the recipient's transcript. An empty input box proves nothing: it is equally what you see when the paste never landed at all (amended 2026-07-21 on David's word, after the crew's read-before-commit check caught the original wording being wrong). A spinner proves nothing either — the recipient may be busy with unrelated earlier work. If the content is not there, the sender re-sends. Long pastes collapse to `[Pasted text #N]` in scrollback, so check a short distinctive phrase or take the recipient's own acknowledgment. Nobody submits text they did not send, however stuck the cockpit looks; an unattributed strand is not anyone's to complete. If a reply never arrives, the sender re-sends. Ghost text (dim SGR-2 prompt suggestions) is furniture: read panes with `capture-pane -e`, never submit it, never report it.
   The mail-carrier daemon (launchd `com.davidleess.dg-mail-carrier`) is **PAUSED and unarmed** and is no longer part of the flow. Codex's 2026-07-21 bounded verification reproduced three failures — it can press Enter on an open permission dialog, can take over a live sender's message without proving the sender is gone, and can submit an unattributed strand — plus a scope defect: it discovers target panes across the entire tmux server rather than the cockpit session. It stays on disk, inert behind an absent marker file, unless David words otherwise. On David's "relay NNN", Tower sends `From Studio — review ~/frontend-studio/proposals/NNN-RELAY.md and respond per the standing protocol` to all three crew panes (they may read `proposals/` — it contains only Studio's outward-facing work), verifies each delivery landed (input line cleared or spinner visible; retry Enter once — the tmux paste race strands messages), sends Studio the bare mechanical ack (`NNN relayed to crew`, nothing more), and confirms to David. Framing stays neutral — no lean signaled, or the review is biased.
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
- **2026-07-21 — the Studio mandate (standing law).** Studio had been blocked-idle, waiting to be relayed something; that is the waste being fixed, not rest. Studio now holds a standing self-directed license: (1) outsider product thinking — use the live product, study rival tools, find what is missing that nobody is asking for, ideas originating FROM Studio; (2) craft — study and practice UI/design/animation technique, looking outward at the design world, never inward at internals. **Inversion rule: Studio is never handed our roadmap, backlog, or task list** — building what we specced destroys the outsider asset, and the contamination wall catches governance, not imported priorities. Convergence with our plans is validation; divergence is the value. David's specific design briefs reach Studio through Tower only when a real surface needs its eye — occasional, never the diet. **Containment: Tower holds a quality floor in addition to David's gate** — obviously sub-bar work (incoherent, overconfident, decided-language on undecided things, off-scope, not reviewable) is bounced back to Studio with what is wrong; Tower does not judge design merit, only keeps junk from reaching David or the crew. Studio reaching outside its lane is a hard stop reported to David immediately. Guardrail: continuous use spends freshness, so the ~09-01 fresh-eyes review stays LIVE, not retired.
- **2026-07-21 — the wire.** David: the carrier is "an important tool" in principle (agents must communicate without silently going idle) but "the whole wire build was excessive and over-engineered — we just need to effectively communicate and stay in our lanes." Codex's bounded pre-arm verification returned DO NOT ARM (3 of 4 safety claims NOT PROVEN, each reproduced). Ruling: **sender owns delivery**, written into every lane bootstrap; carrier stays paused and unarmed; no remediation commissioned.
- **2026-07-21 — ghost text.** David: "I like the ghost text — you guys just need to ignore it." The suggestion-disable thread (`--prompt-suggestions` exists) is CLOSED and declined. Agents read panes with `-e` so ghosts self-identify, never submit them, and stop narrating specimens to David.
