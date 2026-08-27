# DG-077 — Complete the resource layer: dedup, stale state, contract_mismatch, receipt invalidation

**Layer:** 6  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 1.5d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** Section 11.2 requires one generated-schema-aware resource layer with request deduplication, cancellation, five named states (loading/ready/http_unavailable/contract_mismatch/stale), sanitized errors, and cache invalidation by read-model receipt. The hook delivers cancellation, Zod validation, and four states — and its own header disclaims 'No caching or retry policy' and exempts 'Trade Lab POSTs and typeahead search', the exact exemption that produced SR-15's wrong-player bug. Add deduplication, the stale state, a real contract_mismatch state, receipt-keyed invalidation, and bring the trade paths under the one layer. Receipt invalidation depends on read-model receipts existing, so this sequences after the read-model store ticket.

**How we know:** frontend/src/lib/useEndpointResource.ts:2-5 (header disclaiming caching and exempting trade paths, verified 2026-08-26), :9-56 (four states, no dedup, no stale, parse-error standing in for contract_mismatch); proposal :605-616

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
