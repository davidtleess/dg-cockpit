# DG BUILD

A ticket board and a sprint. That's the whole system.

**David sets the goal and the order. Lanes pick work up and build it. Nobody waits for permission.**

---

## Tickets

One file per ticket, `tickets/DG-NNN-<slug>.md`. IDs are flat and never reused.

A ticket is five things:

- **What's wrong or missing** — one sentence
- **How we know** — the command someone ran or the file they read. One line. Not a section.
- **Layer** — 1 ingest · 2 curate · 3 models · 4 context · 5 data analysis · 6 front-end
- **Done looks like** — the thing you'd run or look at to see it worked
- **State** — `todo` · `doing` · `done` · `dropped`

That's it. If a ticket needs more explaining than that, it's probably two tickets.

**Why the layer field stays:** it's your own priority ordering from 2026-07-30, not process. It
exists so nobody spends an evening on a screen for a data problem — which has already happened once.
Drop it with a word if you want it gone.

## Sprints

One week, one goal sentence, a list of ticket IDs. `sprints/SPRINT-NN.md`.

At the end: what landed, what didn't, what we learned. Three lines, not a ceremony.

## The board

`BOARD.md` — one line per ticket, and nothing else. If it takes longer than a minute to read, it's
broken.

Rebuild it from the ticket files, never from an older copy of itself.

## Studio

**Studio never receives anything from this system** — no ticket, no sprint, no backlog, no roadmap,
not the vocabulary. Its whole value is that it doesn't know our plans, and it has repeatedly found
things from outside that nobody inside was looking for.

Traffic is one-way: a Studio idea David likes becomes an ordinary ticket here. Nothing goes back.

## Tower

Files tickets when it measures something. Doesn't assign, approve, route, or chase.

---

## The one habit worth keeping

**Say the command you ran.** Not as a rule anyone enforces — just because a claim nobody checked has
cost this project real evenings, and a one-line citation costs nothing.

A close that says "done" is worth less than a close that pastes the output.
