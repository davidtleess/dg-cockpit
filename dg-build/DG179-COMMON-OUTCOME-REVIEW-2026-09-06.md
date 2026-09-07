# DG-179 common outcomes — qualified local research handoff

The common outcome artifact is cleared for isolated rookie/veteran research refits. This is not exact David-league scoring, complete individual-stat certification, live promotion, or acceptance of the downstream forecast/UI increment.

Bundle: `/Users/davidleess/dg-wt/DG-179/runs/20260906T194819Z/league_season_outcomes/`.

- outcomes.csv SHA256 `199a48beb96a25f5dad50758b3f72b40a5d7d0cf2000f7cdaf2f411873c6ecb8`
- manifest.json SHA256 `d3812d0d56b50971e98552fed4f791d3132eeffa7c242601e7c609285863ba18`
- target identity `049d2229c4ba06eececba66a083a777142f85ff0f459b0499912f49fa0ca3c6a`
- scoring identity `5aef5bc509187a8cc3af8c6f7d97bed071ced2893d9b8063e07dc674917de75b`
- window identity `d9e68e1fdf358cd87f77b166042aa1343bf31442b56770d1d8e4302073cad7a4`

## Evidence checked

Root final focused contract suite: **68 passed in 7.97s**. Offline Ruff passed the module, CLI, contract tests and root QA script. Independent specification and code-quality reviews passed. Duplicate raw JSON keys and duplicate CSV headers now refuse; the frozen parquet input and resulting arithmetic are unchanged.

Root ran the actual CLI with prepared source, saved league snapshot, explicit research-ppr mode, years2001–2025 and checked preparation sidecar. Output46,274playerseasons. Independent loop recomputation through `docs/agent-ledger/evidence/2026-09-06/dg179_root_outcome_qa.py` verified all46,274 outputpairs, points, games and appearance flags against442,167weeklyrows, actualinput/output hashes and window definitions. All298negativeplayerseasons remainnegative;821identifiedoutside-window-onlypairs have0games/points andappearedfalse. Hunter2025 remains63.8PPR/7games despiteCBstatposition; sharedoutcomes have no positionfilter.

Source reviewer independently checked all27rawcapturehashes,5capture-outputhashes,29preparation-inputhashes and3prepareddatafilehashes. Exact partition442,697admittedrawrows=442,167identified+530quarantined, originalindices preserved with no overlap/omission. All1,899identifiednegativeweeklyrows (1,828REG) preserved. Every2001–2025REGgameID and season/weekmatches captured officialschedule.

## Required caveats

- Research preset is `nflverse_default_ppr_championship_window_v1`, not exactleague scoring. All-unit fumblelosses, recoveryTDs andindividualSTforced-fumble/recoveryrules require additionalattribution before equivalence is claimed. Exactmode refuses.
- ModernREGweeks1–17, equalweeklyweight. Historicalnormalizednflverseweeks1–16 through2020;2001 is normalized1–17 inthissource. ALLNFLgameabilityfeatures remain unchanged.
- 1999/2000 excluded because three completedgames are missing; producer labels outsideadmittedyears unknown/omitted, notzero. Canceled2022BUF-CIN explicitly notanappearance.
- Sixnonzero unidentifiedrows are exactreviewedquarantine, notnumeric-tolerancecleaning. Signedexcludedpoints6.68, absolute14.88; other524quarantinerows zero. They are notassigned aplayer or fabricatedas0. Individual-statcompleteness remainsunproven.
- Source preparation normalizes NaN tonull in target_share,air_yards_share,wopr2001–2008; allothercells match. Rawsource retained. The preparationmanifest .gitignorehash isstale; allscientificdatahashespass. DG165companiondisclosuree2e672ff preservesoriginalmanifest; no blanketallfilesmatchclaim.

## Coordinated review outcome

Fresh rookie 1–6 and veteran 1–5 fits and historical grading now consume this exact artifact. Independent reviews accepted both producers and the corrected census. Integration audit `20260906T203007Z` binds the new producers, the common artifact, and the veteran evaluation-status companion. Root browser checks passed on its actual desktop and phone views: all 27 David players and all 274 league-rostered players have estimates; their first two annual terms and reference players agree across both horizons. Full-board consistency checked 825 estimates with zero violations. The old-target comparison is excluded. See [final increment review](CHAMPIONSHIP-WINDOW-REVIEW-2026-09-06.md) for the exact handoff and remaining research limitations. Nothing merged or promoted.
