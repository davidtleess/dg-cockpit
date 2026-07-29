# 012-RELAY — the transaction log, and two dead components in the partner score

**Not authorised to cross. David's to send.**

| ID | summary | severity |
|---|---|---|
| **T1** | Partner score component hardcoded to zero, rendered as evidence | high |
| **T2** | Second component saturates at 1.0 for every team | high |
| **T3** | Sleeper transactions endpoint never called; free, four seasons available | high |
| **T4** | Team-posture artifact 35 days stale behind a daily-refresh page | medium |
| **T5** | Two lowest-ranked partners score exactly the dead constant | medium |

Verified live against the running app and the Sleeper API on **2026-07-28**. Every figure below
was computed by Studio alone and is reproducible, not reviewed.

---

## T1 — `activity_recency_score` is a hardcoded `0.0`, and the UI renders it as evidence — HIGH

**Where.** `src/dynasty_genius/league_opportunity_map.py:185`

```python
activity_recency_score = 0.0
```

It is summed into `partner_score` at line 189–195 and emitted in `score_components` at line 206.
`frontend/src/league-pulse/PartnerRankings.tsx:13` lists it among the four components it renders.
The fixture (`frontend/src/league-pulse/fixtures.ts:129`) and the test
(`PartnerRankings.test.jsx:34`) both set it to `0.2`, so the component is designed to be non-zero.

**Repro.**
```bash
curl -s http://127.0.0.1:8000/api/league/pulse \
 | python3 -c "import json,sys; d=json.load(sys.stdin); \
   print(sorted({p['score_components']['activity_recency_score'] for p in d['partner_rankings']}))"
```
**Observed:** `[0.0]` — one distinct value across all 11 counterparties.
**Expected:** either a measured value, or the component removed from the payload and the UI.

**Why the user pays.** He is shown a four-part justification for a ranking in which one part is
structurally incapable of varying. A score component that is always zero is not a weak signal; it
is a claim of evidence that does not exist.

**Ask:** confirm this is a deliberate placeholder, or fix it. If deliberate, it should not render
as a score component until it carries a value.

---

## T2 — `divergence_density_score` saturates at `1.0` for every team — HIGH

**Where.** `src/dynasty_genius/league_opportunity_map.py:184`

```python
divergence_density_score = _safe_score(len(divergence_rows) / 5.0)
```

`_safe_score` (line 44–45) clamps to `[0, 1]`. Every roster in a 12-team league carries more than
five rows whose divergence signal is `MODEL_HIGH_MARKET_LOW` or `MODEL_LOW_MARKET_HIGH`, so the
divisor of 5 puts every team at the ceiling.

**Repro.** Same command as T1 with `divergence_density_score`.
**Observed:** `[1.0]` — one distinct value across all 11 counterparties.
**Expected:** a divisor scaled to the observed distribution, so the component discriminates.

**Why the user pays.** Combined with T1, **two of the four displayed components are constants**.
The ranking is in fact `complementarity + posture_alignment`, and since complementarity spans
0→1.0 while posture spans 0→0.25, it is roughly 4:1 complementarity. That is not what the surface
says it is.

**Ask:** confirm the divisor, or rescale it.

---

## T3 — Sleeper's transactions endpoint is never called; four seasons of this league's history are free and sitting there — HIGH

**Where.** `grep -rn "transactions" --include=*.py src/ app/ scripts/` → **0 matches**.
`app/data/sleeper.py` calls `/league/{id}`, `/rosters`, `/users`, `/traded_picks`, `/drafts`.
It does not call `/league/{id}/transactions/{round}`.

**Repro.**
```bash
curl -s "https://api.sleeper.app/v1/league/1314363401744416768/transactions/1" | head -c 400
```
Same host, same read-only no-auth API, `round` = 1..18.

**Observed, pulled across four season ids** (2023 `912589367620100096`, 2024 `1049152209134424064`,
2025 `1183088915091423232`, 2026 `1314363401744416768`):

- **746 completed transactions**; by type: 379 free-agent, 318 waiver, 39 trade, 10 commissioner.
- **39 trades**, each with `roster_ids`, `adds`/`drops` keyed by sleeper player id, a
  `draft_picks[]` array carrying `season`, `round`, `roster_id` (original owner),
  `previous_owner_id`, `owner_id`, and a `status_updated` timestamp.
- **34 of 39 trades (87%) move at least one draft pick.**
- 2026 to date: 56 completed transactions, 7 trades, most recent **2026-07-28**.

**Two things this makes computable that are currently unavailable:**
1. **T1's missing input.** Manager activity and recency are a direct read.
2. **Revealed posture.** Net pick flow per manager, which is the rebuild/contend tell. Four
   examples where it diverges from the app's current label: Free Kelly (app `BALANCED`) spent four
   future firsts in May to acquire Josh Allen and DK Metcalf; Drew P. Bauls (app `BALANCED`) is
   net **+4** picks; Seidmans Sasquatches (app `ASCENDING`, **partner rank #4**) has made **zero
   transactions in 2026** and one trade in four seasons; jkazzz (app `ASCENDING`, **partner rank
   #11, last**) is the most active manager in the league and traded today.

**Studio's own limit, stated up front:** the app's posture is a roster-shape label and was never
intended as a behaviour label, so these are not "wrong posture" defects. The claim is that a free
behaviour signal exists and is currently represented in the codebase by the literal number zero.

**Why the user pays.** He is ranking trade partners with no idea which of them is answering
messages. The app's #4 recommended partner has not made a move all year.

**Ask:** confirm whether the endpoint is excluded for a reason Studio cannot see (rate limits,
snapshot-schema cost, a normalizer constraint), or schedule it into the morning capture.

---

## T4 — the team-posture artifact is 35 days stale on a page that refreshes daily — MEDIUM

**Repro.**
```bash
curl -s http://127.0.0.1:8000/api/league/pulse \
 | python3 -c "import json,sys; print(json.load(sys.stdin)['source_artifacts'])"
```
**Observed (2026-07-28):** `team_posture` captured **2026-06-23**, `team_value_matrix`
**2026-06-23**, `league_opportunity` **2026-07-15**. Endpoint `status: degraded`.

**Expected:** posture derived from a snapshot no older than the divergence data rendered beside it.

**Why the user pays.** This is the same finding relayed as 003 on 2026-07-15 (F1–F4, league data
freshness) and as of today the posture artifact has **not moved** — it is the same 2026-06-23
capture, now thirteen days older than when it was first reported. Postures drive the partner
ranking; a rebuilder who bought in May is still labelled from a June snapshot.

**Ask:** confirm the 003 fix is scheduled, or state what is blocking it.

---

## T5 — two counterparties are ranked on nothing but the dead constant — MEDIUM

**Repro.** Same call as T1; inspect the two lowest `partner_score` values and their components.
**Observed:** jgil96 and jkazzz both score exactly **1.000** —
`complementarity 0.0 + divergence_density 1.0 + activity_recency 0.0 + posture_alignment 0.0`.
**Expected:** a score whose value reflects at least one measured quantity about that team.

**Why the user pays.** Two of eleven partner rankings carry no information about the team they
rank, and are presented identically to the ones that do. A tie at the bottom looks like a measured
tie; it is an artifact.

**Ask:** confirm, fix, or refute with a concrete technical reason.

---

**Every item above: confirm, fix, or refute with a concrete technical reason.**
