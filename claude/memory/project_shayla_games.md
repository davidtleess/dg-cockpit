---
name: project-shayla-games
description: Kids' learning games David is building with his daughter Shayla (b. ~2020) — two single-file HTML games on the Desktop, and the design rules they follow
metadata:
  type: project
---

David is building simple computer games with and for his daughter **Shayla** (5, turning 6 as of
2026-08-23). Two exist, both **single self-contained HTML files on the Desktop**, opened by
double-clicking — no install, no server, no build step, works offline:

- `~/Desktop/Shayla's Letters.html` — keyboard game. Three levels picked on the start screen:
  Letters (find the key), Words (fill the missing letter), Spelling (type the whole word).
  Level 1 and Level 3 both open by spelling SHAYLA. Started 2026-08-23.
- `~/Desktop/Shayla's Lemonade Stand.html` — mouse game, requested by Shayla herself. Click a
  moving walker, drag/click ingredients into the pitcher to fill a picture order, serve the cup.
  5 customers = one day; coins persist in localStorage.

**The design rules these follow — reuse them for any future game:**
- **No fail state.** Wrong input is a wobble. No buzz, no X, no losing. At this age a "wrong"
  sound teaches avoidance of the computer; silence teaches experimentation.
- **Each game owns one input.** Letters = keyboard only. Lemonade = mouse only. Don't mix.
- **Drag is never required.** Trackpad dragging is too hard for small hands — every drag target
  also accepts a plain click. Drag is available and rewarding, never blocking.
- **Everything is spoken** via `speechSynthesis` (prefers the macOS voice Samantha), with a mute
  toggle. No audio files, so the single-file/offline property holds.
- **`localStorage` must be wrapped in try/catch** — Safari throws on `file://` pages and an
  unguarded read kills the game on load. This bit us once.
- Google Fonts (Fredoka + Nunito) are linked but degrade to `ui-rounded` system fonts offline.
- Teach `Cmd+Ctrl+F` fullscreen so there's no browser chrome for her to click out of.

Working style that worked: classify the task out loud, ask 1–2 real questions via the question
tool with ASCII previews, present a short design, get a yes, build. See [[feedback-david-workflow]].
