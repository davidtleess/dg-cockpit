---
name: david-workflow-push-not-pull
description: David rejects document/pull workflows — he wants agents to push consolidated asks to him through one voice
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 38369f00-9dee-487c-8809-f585ebd3dff6
  modified: 2026-07-26T14:38:04.264Z
---

David (2026-07-14, building the 4-agent cockpit) explicitly rejected file-based coordination aimed at him: a NEEDS-DAVID.md decision queue with status-bar badge and popup keybinding was rolled back same-day at his request ("i don't like this... I prefer they or 1 of them just tell me what the team needs from me").

What he wants instead: agents align among themselves, then ONE spokesperson pushes him a plain-language consolidated ask (">>> DAVID: 1) ... 2) ...", priority order). Engineer Claude (pane 1.1) holds the spokesperson role for the engineering lane; Studio speaks for its own lane (and opens the browser for design reviews rather than pointing at files).

**Why:** He may not have time to read documents or remember keybindings; anything he must open, poll, or manage will be ignored. Banners, pane messages, and direct conversation work; artifacts-to-check don't.

**How to apply:** When designing any workflow that needs David's attention or decision, make it push-based and conversational — a message that arrives in front of him with the ask in one sentence. Never create a file, dashboard, or checklist he is expected to open or maintain. Summaries before bodies, always. See [[frontend-studio-outsider-agent]].

**Pixels before decisions (2026-07-15, from David directly):** Never ask David to decide on design work — relay approval included — before the mockup/prototype is on his screen ("aren't i supposed to see the mockup before asking me to decide on anything"). The design review ritual is a hard gate, not a recommendation: no "or just say relay if you're confident" shortcuts. Sequence is always: Studio opens it in his browser → he reacts → then the relay/approve ask.

**Fresh reads before every report (2026-07-15, from David directly — "did you check the panes before telling me that?"):** Never report cockpit state to David from watcher events or memory of earlier reads. Capture every relevant pane immediately before ANY status report. Reason it bit: David sometimes answers a lane directly at its pane (e.g. "aligned on 1. go on 2" typed straight into Claude's pane 5 minutes after its ask) — Tower's wire is not the only channel, so Tower's model of "waiting on David" can be stale the moment it's spoken. Verify authorship of any pane-direct gate word with David if Tower didn't carry it.

**David flips pane permission modes himself (2026-07-26, from David directly — "i changed all the permissions myself").** An unexplained mode change in any pane is most likely him, not a wire fault or a stray keystroke. Do not report mode flips as anomalies, do not investigate them, and never send a corrective keystroke (that was already charter law — this closes the remaining reason Tower kept noticing). If a flip genuinely matters for something Tower is about to do, ask him in one line rather than narrating the observation.

**Accountability addendum (2026-07-15, from David directly):** He audits closeouts after the fact and holds Tower to them. Two rules from his first audit: (1) a closeout that silently excludes long-running background work is defective — inventory it explicitly, then land/checkpoint it or get his explicit risk acceptance plus a guarding watcher; during any open recurring instability, unattended overnight work is presumptively postponed. (2) Status language must be literal: never write "nothing needs you" (or variants) beneath a list of things that need him — if a decision list exists, the closing line names the top item instead.
