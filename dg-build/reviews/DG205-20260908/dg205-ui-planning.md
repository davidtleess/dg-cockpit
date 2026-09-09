# DG-205 planning — the track record screen (prospective DG-208 owner)

**Identity.** Claude session `245fd3a2-d8ac-4908-9aad-b156da509998`, `DG_SESSION=Claude54410`,
worktree `~/dg-wt/DG-203` (frozen; my browser-smoke files are handed off). **Planning only.** No product
edit, no new worktree, no install, no publication, no hosted or data write, no test producing shared
output, no outcome-performance query, no `frontend-studio` access, no subagents. I read `AGENTS.md`,
`PRODUCT.md`, the Lovable routes and queries, `app/api/routes/workspace_snapshots.py`, and the DG-204
browser script as reference. DG-204's uncommitted hosting and CI work is untouched.

**Authority.** David, 2026-09-08T23:28:19Z: *"ok write the plan the tickets and the roles for each
parallel worker"*, following *"whats the next thing to work on from the recommendations my independent
reviewer gave"*. His reviewer's core finding is the premise here: the decision edge is unverified, and
**three claims need separate validation — predicting football production, anticipating market movement,
and improving decisions.** The screen must not blur them, and must not imply a record exists before one
does.

**Disclosure of interest.** I wrote the archive this screen reads (`workspace_snapshot_store.py`,
DG-190). That makes me fast here and it also makes me the wrong person to certify that the archive is
sound. Someone else should own that judgement.

---

## 1 · What the screen is, in one sentence

**A list of saved readings and what each one is waiting to be graded against.** Not a scoreboard.
Until an evaluation exists, the honest content is provenance: what we said, when, over which population
and horizon, and what would have to arrive before anyone could say whether it was right.

## 2 · The state contract

Five states, and the screen must be able to render each without inventing the others.

| state | when | what it shows |
|---|---|---|
| `unavailable` | the archive transport is not reachable | says the archive is not reachable from this session, and that this is a connection fact, not a statement about our record |
| `empty` | reachable, zero snapshots | says no reading has been saved yet, and what saving one would capture |
| `saved` | snapshots exist, none graded | the readings, their dates, populations and horizons, each marked **ungraded** |
| `pending` | a declared evaluation exists whose horizon has not elapsed | the reading, the declared target, and the date it becomes gradable. **No partial score.** |
| `graded` | an evaluation has produced a result | the result, on one named claim, with its population and horizon beside it |

`saved` is the state the product is in today, and the screen should be correct and useful there before
any grading exists. That is the whole first ticket.

⛔ **Never a blended score.** Football production and market movement are separate claims and render as
separate blocks. There is no combined "accuracy" number, and no third block that averages them.

## 3 · What each saved reading shows

Straight from the receipt, which already carries all of it and refuses to save without it:

* the snapshot id, the saved time, and `evaluation_status` (today always `ungraded`)
* the six-field source tuple — report run, report hash, market and league hashes, catalog run,
  ownership date — because that identifies the forecast underneath, and **a count of snapshots is never
  a count of predictions**. Two saves of one forecast are one prediction.
* the populations it covers, from the counts block
* the declared evaluation plan, if the reading carries one

**A reconstructed input is labelled at the point of use.** If a baseline was rebuilt after the fact
rather than captured at the time, the row says so in words, next to the number, not in a footnote.

## 4 · Transport, and the collision with root

Root owns `/data/dg-bundle.json`: a static, publishable, snapshot-pinned file. **The archive cannot use
that path.** It is private, mutable and per-save, and exporting it as a public JSON would publish
David's roster history.

**Proposal:** a **same-origin server route** in the Lovable app that proxies the local backend, refusing
unless the request is loopback or authenticated. Nothing private is ever emitted as a static asset.

```
GET  /api/private/track-record/snapshots        -> list (receipts only, no payloads)
GET  /api/private/track-record/snapshots/:id    -> one receipt plus its declared plan
```

Both refuse with an honest body when the backend is unreachable, so the `unavailable` state above is a
real response rather than a caught exception. The existing backend endpoints already exist and are
unchanged by this: `GET /workspace-snapshots`, `GET /workspace-snapshots/{id}`.

⛔ **The POST capture endpoint is not reachable from this screen.** Saving a reading is a deliberate act
elsewhere; a track record screen that can create its own entries is not a record.

**Ownership to settle before any code:**

| file | owner | note |
|---|---|---|
| `lovable/src/routes/track-record.tsx` | **me (DG-208)** | replaces the placeholder |
| `lovable/src/components/dg/TrackRecord*.tsx` | **me (DG-208)** | new, mine alone |
| `lovable/src/routes/api/private/track-record/*` | **root** | transport, auth and refusal are root's call, not mine |
| `lovable/src/lib/dg/queries.ts` | **root** | I need one query added; I do not edit it |
| `/data/dg-bundle.json` and `backend.ts` | **root** | untouched by this work |

That split is the collision resolution: **I own what renders, root owns what fetches.** I will not add a
transport of my own, and I will not read Supabase.

## 5 · The future-data input contract

This is the part that decides whether the screen can ever be honest, so it is stated as a contract
rather than discovered later. To grade a reading, an evaluation must supply, **declared before the
outcome is read**:

1. **which claim** — `football_production` or `market_movement`. Never both in one record.
2. **the population** — the exact player ids, fixed at declaration, so the graded set cannot be chosen
   after the fact.
3. **the horizon** — start and end, with the date it becomes gradable.
4. **the baseline** — what we are being compared against, named. A forecast with no baseline is not
   gradable, it is just a number that later had a number next to it.
5. **the outcome source** — which producer supplies the truth, and its own as-of.
6. **`reconstructed: true|false`** — whether the baseline was captured at the time or rebuilt later.

⚠ **If any field is absent the screen renders `pending`, never `graded`.** A missing declaration is the
single most likely route to a flattering result, because it lets the population or the baseline be
picked once the answer is visible.

## 6 · Smallest runnable implementation

**DG-208a — the saved-readings screen.** The five states, the receipt fields, the labelled
reconstruction flag, and honest copy for `unavailable` and `empty`. Depends only on the list route.
This is shippable on its own and is worth shipping on its own: it replaces a placeholder that currently
says nothing with a screen that says what we have saved.

**DG-208b — the pending block.** Reads a declared plan and shows the claim, the population size, the
horizon and the gradable date. Still no score. Depends on the plan being carried in the receipt.

**DG-208c — the graded block, one claim at a time.** Football production first, because its outcome
source already exists. Market movement second and separately. Neither renders until a real evaluation
lands.

Each is independently useful and independently abandonable, which is the point: if the evaluation work
stalls, 208a still leaves the product better than the placeholder.

## 7 · Conflicts and code paths I would flag now

* **`teamsQuery` and `transactionsQuery` return `[]` by design.** The league and trades screens are
  placeholders for the same reason this one is. Do not let a future ticket "fill" them from the
  alternate model.
* **`track-record.tsx` currently says the preview "does not establish a decision-making advantage".**
  That sentence stays true after 208a and must not be deleted when content arrives; it is only retired
  by a real graded result on a declared claim.
* **The archive is content-addressed and refuses a re-save of an identical reading.** So the list is a
  list of *distinct* readings; a user who saves twice in a day will see one entry and should be told
  why rather than assuming a bug.
* **`evaluation_status` is hard-coded `ungraded` in the store.** Whoever introduces grading must change
  the producer, not the screen. If the screen ever computes a status, that is the defect.
* The DG-204 browser script is a useful shape for this screen's own smoke check later. Root has changed
  it since my handoff; treat it as reference only.

## 8 · Out of scope, explicitly

No decision logging. No model change. No historical outcome grades. No new chart. No new dependency.
No public export of any private snapshot. No automatic forecast regeneration, and no change to source
dates, pinned selection or reload behaviour.
