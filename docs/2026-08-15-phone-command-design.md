# Phone command — run the show from the phone, keep the factory on the Mac

**David's words, 2026-08-15:** "the one thing i really want is to be able to run the show and
make decisions from my phone and keep the team working on my computer" → "first commit this
idea. then build it."

## The idea

The cockpit already works unattended between decisions: the docket clerk routes disputes to the
Judge, the resume wire un-strands turn boundaries, SHIP rulings commit, and everything that
genuinely needs David parks and waits. The missing half is the phone loop:

1. **David-moments reach the phone.** The moment any run parks terminal — judge STOP, gate
   freeze, release wait — a park-watcher notifies David: one line, what parked, what word is
   needed. Local banner always; phone push via the remote-controlled seat.
2. **David's words come back from the phone.** The Tower pane launches remote-controlled, so
   the seat appears in the Claude app's Code tab after every boot. Whatever David types there
   executes on the Mac: the release verb, crew relays, state checks.
3. **The crew never waits on presence.** Machinery moves everything that isn't a decision;
   the phone carries only decisions.

## Laws

- **Notify on parks, never on progress.** A push interrupts David's life; it spends that only
  when his word is the blocker. One notification per park event, forever (receipt-deduped).
- **The watcher informs; it never lifts.** Park detection has zero authority — release remains
  David's verb, signed with his word.
- **Durable means boot-started.** The watcher rides the same daemon as the resume wire; the
  remote-control flag rides the flight deck. Nothing depends on any particular session being
  alive — the standard set by the clerk and the wire.
- **The phone is a terminal, not a seat.** Remote input lands in the real Tower's session and
  carries exactly the authority David's typed words always carry — no new powers.

## Build

- `computePark(run, receipt)` in `autonomy/core/lib/wire.mjs`: run.terminalState set and not
  yet notified → notification due, keyed `park:<terminalState>:<updatedAt>`.
- The `resume-wire.mjs` daemon handles both duties per poll: CLEAR → wake implementer;
  terminal → (a) macOS banner via osascript, (b) fixed-format PARK notice into the 🗼 tower
  pane so the remote-controlled seat surfaces it to the phone ("push when actions required").
- Flight deck §7: Tower launches with `--remote-control`.
- Push settings (`/config` → both push options) are persisted user settings — David's, one-time.

## Honest limits

- Phone push transits Anthropic's Remote Control channel; Mac asleep = nothing runs (as today).
- Whether the app auto-lists a fresh session after rotation is VERIFY-ONCE on the next `dg`.
- The park notice into the Tower pane is a message like any other; the seat's harness decides
  what reaches the phone. The macOS banner is the guaranteed local floor.
