---
name: reference-two-market-lanes-one-is-stale
description: The player-detail route serves a SECOND market overlay six weeks older than the ranks payload; prices must come only from /api/research/market-ranks.
metadata:
  type: reference
---

This backend serves market prices from **two different places, and they disagree**.

Measured 2026-09-08 on the frozen preview 8794 for J.J. McCarthy (sleeper_id 11565):

| Route | market_value | market rank | dated |
|---|---|---|---|
| `/api/research/market-ranks` | 1233.0 | 193–194 of 388 | `market_as_of` 2026-09-06 |
| `/api/players/{id}` `market` lane | 1703.0 | 129 overall, 30 at position | `source_timestamp` **2026-07-22** |

The player route is **not lying** — it flags itself with `market_overlay_static_caveat` and
`source_timestamp_is_fetch_time_not_publish_time`. But it is a static overlay six weeks behind, and
nothing about a rendered page would look wrong if a consumer read prices from it beside current ranks.

**Rule: prices and market ranks come from `/api/research/market-ranks` only.** The DG-201 bundle
generator refuses any row carrying `market_rank_overall`, `market_rank_position` or `source_timestamp`
for exactly this reason. `/api/players` is still the right source for identity, age, draft round and
league ownership — just never for a price.

Related: [[reference_a_worktree_serves_committed_data_not_live_data]] is the same shape — two paths to
what looks like the same number, one of them quietly old.
