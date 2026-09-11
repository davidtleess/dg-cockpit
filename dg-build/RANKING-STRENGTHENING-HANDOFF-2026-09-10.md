# Ranking strengthening — local implementation; visual acceptance blocked

David's approved gaps have working implementations in `/Users/davidleess/dg-wt/DG-221`, branch `ticket/DG-221`, based on `4f93a3807c479260b7c374dcae27ee441e4db1a4`. The remaining acceptance check is actual desktop/mobile inspection: the CUA tool still reports the Mac locked. This is **not READY_FOR_GATE**, merged, published, or a changed model.

[Local preview](http://127.0.0.1:8821/board) · [Football assessment](/Users/davidleess/dg-wt/DG-221/runs/20260910-ranking-strengthening/SCIENTIFIC-ASSESSMENT-FINAL.md) · [Exact 15-file source manifest](/Users/davidleess/dg-wt/DG-221/runs/20260910-ranking-strengthening/final-source-manifest.json)

## What improved

- Existing annual forecasts now reach all 825 modeled players. Among the 388 market-paired players, missing current-season displays fall from 248 to zero. Original forecasts, five-year values/ranks, market prices, ownership and source dates remain unchanged. The 73 relevant unforecast available players still show missing forecasts.
- The player drawer explains annual projected points, the named replacement reference and the advantage credited, plus one-, two- and five-year ranks on the same population. Later-only advantage and unpriced players are explained without inventing an actionable edge.
- A reproducible retrospective tool tests stronger rookie baselines, all five veteran horizons and prespecified subgroups, and twelve valuation assumptions. Rookie forecasts beat the stronger draft-pick comparator historically; older-quarterback points advantage remains uncertain. Replacement assumptions materially affect rankings. No scenario or new model was promoted.

## Ownership and review

Three actual Claude builders supplied bounded work: Claude54281 / DG218 backend, Claude54331 / DG219 frontend, Claude54410 / DG220 science. Their current session identities were verified before dispatch. Codex root integrated explicit paths into DG221, added a guarded local bundle refresh tool, verified real sources and actual client normalization, and reproduced the study. Internal Sagan independently reviewed the code, calculations and final narrative as a supplement to those builders.

Known review findings are closed. The final compatibility fix supports complete older per-season reference bars only when their explicit units are season points; malformed present data still fails. The contract fixture was expanded with root authorization instead of relaxing validation. The final scientific narrative corrects the historical scoring window to Weeks 1–16 before 2021 and Weeks 1–17 thereafter. The earlier report draft is superseded by `SCIENTIFIC-ASSESSMENT-FINAL.md`.

## Evidence

All evidence below is under `/Users/davidleess/dg-wt/DG-221/runs/20260910-ranking-strengthening/`.

| Check | Result | Receipt |
|---|---|---|
| Root affected backend/contract integration | 196 passed, 1 existing skip | `backend-final-tests.log` |
| Standalone science tests | 37 passed | `science-tests.log` |
| Lovable tests | 131 passed | `frontend-tests.log` |
| TypeScript / ESLint / production build | Passed; 0 lint errors, 7 pre-existing warnings | `frontend-types.log`, `frontend-lint.log`, `frontend-build.log` |
| Python syntax | 9 final files parse; Ruff/Pyflakes unavailable, no installation | `python-final-static.json` |
| Actual Claude full contract suite | 6,286 passed, 7 skipped; same counts as pristine baseline; five final backend files match root | `final-contract-receipt.json` |
| Original values and new detail | 825 players / 4,125 seasons / 1,164 horizon intervals verified | `independent-enriched-verification.json` |
| Actual client old/new reading | 954 identities preserved; 248 missing paired forecasts filled; existing fields preserved | `independent-client-verification.json` |
| Scientific CLI reproduction | All 21 final outputs byte-identical | `science-reproduction-receipt.json` |
| Independent sensitivity calculations | 14,556 rank intervals / 38,816 annual contributions | `independent-final-sensitivity.json` |
| Independent review and narrative | Known findings closed; scientific claims supported | `independent-dg218-final-backend-closure.md`, `independent-dg218-dg219-known-findings-closure.md`, `final-narrative-review.json` |
| Local HTTP delivery | Exact 2,781,198-byte new bundle; unchanged ledger and 954 headshots | `preview-enriched-delivery.json` |
| Actual visual inspection | BLOCKED — Mac locked; no screenshots or rendered acceptance claimed | `visual-qa-blocker.json` |

An intermediate scientific draft used an obsolete replacement block, and another intermediate result was overwritten by its builder. Both issues are disclosed in the assessment; neither altered original forecasts or frozen inputs. Conclusions use the corrected, independently reproduced final study only. The root scientific script's only post-reproduction change clarifies its console progress text; calculations are unchanged.

## Resume and delivery boundary

Unlock the Mac, then inspect the integrated preview at desktop 1440px and phone 390px/320px. Exercise Stafford, Terry McLaurin, Jefferson, Lamb, Rasheen Ali and a later-only stash; confirm annual/horizon explanations, missing/legacy behavior, scrolling, keyboard/touch and navigation. Fix any observed defect, rerun only affected checks, and finish acceptance. Do not substitute component tests or HTTP checks for that inspection.

Two root-owned loopback processes are intentionally retained for the preview: UI port 8821 and GET-only ledger fixture port 8822. Process identities and safe cleanup context are in `cleanup-receipt.json`. The app-panel open request was queued, not confirmed visible.

No commits, pushes, merges, publication, production restart, scheduler change, dependency installation, shared-data write or model refit/promotion occurred. Product release configuration still points at the currently published reading; the local preview has a private configuration copy. A later authorized release must export and connect the new enriched data as well as ship the code. Committing the code alone will not update the hosted data.
