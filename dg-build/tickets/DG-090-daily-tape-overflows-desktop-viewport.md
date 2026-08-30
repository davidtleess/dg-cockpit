# DG-090 — The daily tape overflows the desktop viewport by 5px, and the surface's a11y evidence gate has never passed

**Layer:** 6  ·  **State:** done — **Problem A LANDED 08-29 night (merge `232fc0c1`, served
live same evening); Problem B TRANSFERRED to DG-091's visual pass per David's split ruling**  ·
**Lane:** Davids-MacBook-Pro-23766  ·  **DG 3.0**  ·  **frontend-only**

**⭐ 08-29 NIGHT LAND (A only):** `white-space: normal` + `overflow-wrap: anywhere` on
`.dg-ui-tape__fact` (ui.css), rawCssAuditBaseline regenerated in the same change; TDD RED
watched (right=1445), 3-refuter panel (2 minors fixed), gate 6494/0, vitest 311/311; live
:8000 serves the rebuilt bundle. **MAJOR DISCOVERY for DG-091 to inherit: the daily-open axe
assertion (visual-smoke.spec.ts:453) is NONDETERMINISTIC** — 3 pass / 4 fail over 7 runs on
the same tree; failures report the real Problem-B debt (~39 serious nodes, fg `#767a7e` on
`#161c21` = 3.97:1 @13px; note the rendered fg differs from the declared --dg-text-muted —
find what dims it before retuning). The overflow fix unblocked the spec past the overflow
assertion for the first time, exposing the flake (it pre-exists). Playwright is NOT in the
land gate; any lane running `npx playwright test` on main hits coin-flip failures until DG-091
retires the debt. Do NOT exclude the color-contrast rule — make the run deterministic
(post-settle / reduced-motion) and retire the debt. Evidence: failed-run trace + pw logs
preserved in the night session's scratchpad (`DG-090-runs-preserved/`).
**Source:** exposed 2026-08-29 when DG-089 repaired the visual-smoke harness (strict-mode
selector fixed; Playwright chromium installed — the harness had NEVER actually run).

**Problem A (the 5px):** `span.dg-ui-tape__fact` renders to right=1445 at a 1440 viewport —
`expectNoHorizontalOverflow` fails for the daily-open evidence bundle. PRE-EXISTING: probe-proven
byte-identical on MAIN's own bundle (live :8000, zero DG-089 buttons) and on the DG-089 branch.
Not a DG-089 regression; DG-089's rows measure 43px single-line (probe evidence in its ticket).

**Problem B (contrast census):** a manual axe run on the surface reports ONE violation class —
color-contrast [serious], 46 nodes (h4 group headers, headshot-fallback initials, meta labels,
disclosure lines, overlay notes, position spans) — all pre-existing element classes.

**Done looks like:** the daily-open evidence bundle (visual-smoke.spec.ts:397) passes end-to-end
on a clean tree: no horizontal overflow at 1440 and 390, axe returns [], screenshots + focus
capture archived. Fix the tape span's overflow (likely white-space/min-width on the fact span);
work the 46-node contrast list down to zero or to documented token changes.

**Constraints:** frontend-only; the tape is a ui/ primitive shared with other surfaces — check
its other consumers before changing it. Post-freeze unless David pulls it (purely cosmetic-eval
debt; nothing captures wrong data).
