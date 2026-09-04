---
name: reference-verify-single-file-html-games
description: Playwright is already on this machine (npx cache, not global) and can play Shayla's single-file HTML games end to end — the only way to prove a layout change actually fits
metadata:
  type: reference
---

**Playwright 1.62.1 with Chromium is already installed**, but `npm root -g` does NOT show it and
`require('playwright')` fails from a random cwd. It lives in the npx cache:

    /Users/davidleess/.npm/_npx/e41f203b7505f1fb/node_modules/playwright

Require it by that absolute path. Browsers are cached in `~/Library/Caches/ms-playwright`.
Nothing needs installing — do not offer to install it.

**Why it matters:** for the single-file games in [[project-shayla-games]], static reading cannot
tell you whether a layout change fits. On 2026-09-03 a headless playthrough — 30 customers to
day 6 at two viewports — was the only thing that proved a 6-bin shelf did not overflow, and it
separated a real regression from two things that merely looked wrong.

**Three traps that cost iterations, all harness bugs rather than game bugs:**
- **Walkers spawn OFF screen** (`x: -70` or `w + 70`) and walk in. Playwright counts an
  off-screen element as "visible", so `waitForSelector('.walker')` then clicking aims at
  negative coordinates and silently misses. Poll for a walker whose rect is inside the viewport.
- **Synthetic `PointerEvent`s do not work on the bins.** `makeDraggable` calls
  `node.setPointerCapture(e.pointerId)` before it attaches its `pointerup` listener; a fake
  event has no valid `pointerId`, the call throws, and the listener is never attached. Use real
  `page.mouse.move/down/up` throughout — which is more faithful anyway.
- **The cup never becomes "stable"** — `.cup` has an infinite `readycup` bob, so `page.click`
  times out on its actionability check. Press it with `page.mouse` at its measured centre.

**Read computed style, not screenshots, for enabled/disabled state.** `.bin` has a 200ms opacity
transition, so a screenshot taken right after `setBinsEnabled(true)` catches it mid-fade at ~0.35
and looks broken when it is fine. Query `.disabled` instead.

**Always diff against the ORIGINAL at the same viewport before calling something a regression.**
At 1024x640 the customer zone wraps below the pitcher and the street shrinks to 187px — both were
already true before the 2026-09-03 change, and only a before/after probe showed that.
