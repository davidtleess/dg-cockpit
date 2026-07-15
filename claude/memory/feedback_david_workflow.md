---
name: david-workflow-push-not-pull
description: David rejects document/pull workflows — he wants agents to push consolidated asks to him through one voice
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 38369f00-9dee-487c-8809-f585ebd3dff6
---

David (2026-07-14, building the 4-agent cockpit) explicitly rejected file-based coordination aimed at him: a NEEDS-DAVID.md decision queue with status-bar badge and popup keybinding was rolled back same-day at his request ("i don't like this... I prefer they or 1 of them just tell me what the team needs from me").

What he wants instead: agents align among themselves, then ONE spokesperson pushes him a plain-language consolidated ask (">>> DAVID: 1) ... 2) ...", priority order). Engineer Claude (pane 1.1) holds the spokesperson role for the engineering lane; Studio speaks for its own lane (and opens the browser for design reviews rather than pointing at files).

**Why:** He may not have time to read documents or remember keybindings; anything he must open, poll, or manage will be ignored. Banners, pane messages, and direct conversation work; artifacts-to-check don't.

**How to apply:** When designing any workflow that needs David's attention or decision, make it push-based and conversational — a message that arrives in front of him with the ask in one sentence. Never create a file, dashboard, or checklist he is expected to open or maintain. Summaries before bodies, always. See [[frontend-studio-outsider-agent]].
