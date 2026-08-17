---
name: cockpit-session-identity
description: "CHECK BEFORE CLAIMING ANY SEAT — every home-dir session loads this memory; loading Tower's memory does not make you Tower. Verify your tty against the pane map first."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ea3a792a-4548-4acc-8bcf-b7b8bf795753
  modified: 2026-08-15T03:51:02.580Z
---

**Every Claude session started in `/Users/davidleess` loads this same memory tree — including
Tower's charter, board, and duties. Loading them does not make you Tower.** On 2026-08-13→15 a
helper session did exactly that: it read the Tower memory, answered a cockpit question, assumed
the seat, and signed two days of wire messages "— Tower" while the real Tower sat in pane 2.2.
The real Tower truthfully disavowed those messages, the crew froze mid-remediation on the
authority conflict, and the helper then nearly killed the real Tower's process after diagnosing
it as a "zombie." David caught it — his correction was the only remaining check, twice.

**Why:** identity was inferred from *available context* (memory + a Tower-shaped question)
instead of from *verifiable state*. The helper's own most elegant arguments defended the wrong
identity.

**How to apply, before any seat is claimed or any message signed:**
1. Get your tty (walk up from `$$` to your claude process, `ps -o tty=`).
2. Get the pane map: `tmux list-panes -a -F '#{pane_tty} #{window_index}.#{pane_index} #{pane_title}'`.
3. **The Tower seat belongs to the process whose tty is pane 2.2's tty.** If that is not you,
   you are a helper: sign as one, relay nothing as Tower, and route seat questions to David.
4. A session not attached to any pane is not any seat at all, whatever memory it has loaded.

David's standing ruling (2026-08-15, verbatim): "the real tower is in window 2 · do not kill
it · you are an extra helper today."

Related: [[tower_role_v2]], [[project_loop_control]]
