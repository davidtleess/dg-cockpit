> **Publication update:** Roster first is now merged into GitHub main at `cb381ae4`. Full local merge checks passed, and a clean build of the merged commit is retained. GitHub frontend passed; backend has the same 21 pre-existing failures, with none introduced. Earlier no-publication statements below describe the original handoff. No production deployment.

# Dynasty Genius Directions — Roster first handoff, 2026-09-08

Status: READY_FOR_GATE. David approved Roster first; this supersedes the earlier shared-only AWAITING_LAYOUT_CHOICE checkpoint. No new layout question remains.

Preview: http://127.0.0.1:8794/?surface=workspace&view=roster
Code: /Users/davidleess/dg-wt/DG-195, ticket/DG-195, based on published6f0315d2 plus the reviewed DG192 headshot dependency. Nothing committed, merged, pushed or deployed by this increment.

## What David can do
The workspace opens to his roster, grouped QB/RB/WR/TE. Dense rows show real headshots, our overall rank beside the market's rank, gaps in places, and separately labelled season points. Missing readings stay with their position. Quarterback depth includes every owned QB without asserting who should start.

Select a player for the 360px desktop inspector at widths1360andup; narrower screens use a native dismissible sheet. The inspector presents actual paired/tied ranks, the rank scale, season total forecasts and FantasyCalc price in their separate units. Watch and Compare remain available. Find an alternative opens the relevant same-position unowned pool, retains a summary of the roster player, and passes BOTH chosen player identities into Compare. A group-level alternatives request requires an explicit roster-player choice. Sticky phone Back preserves the selected player; Close and Escape restore focus. Position-filter changes clear a stale selection; resizing transfers focus into the desktop inspector.

Global search deliberately remains global and ownership-labelled, with a Clear search action. Existing Available, watchlist, Today, Compare and What changed/snapshot paths remain present. No artificial historical movements, lineup roles, causal model explanations or position ranks were copied from design mock data. The relevant available pool remains433; it is labelled as a pool, not all possible unowned players.

## Evidence
- Full frontend gate: npm run gate,975 tests across116 files, typecheck/lint/copy/build PASS. Log: runs/20260908T123901Z/proof/dg195-roster-accepted-gate.log. Existing7lintwarnings/1info andbundle-sizewarning remainnonblocking.
- After the final market-label CSS specificity correction, scoped style audits10/10passed, Biome andbuildpassed; no logic changed. Evidence: proof/dg195-roster-final-css-tests.log and proof/dg195-roster-accepted-build.log.
- Actual Chromium30mainstates at1440/1360/1200/976/390/320, zeroaxeviolations, zerohorizontaloverflow and no pageerrors. Includes roster, selectedinspector, alternative, exactpairCompare, search/watch/available/historyregressions. browser-final/receipt.json.
- Additional realbrowserchecks: full-detaildisclosureuniqueIDs/landmarks, resizefocus, positionfilterclearing, explicitgroupchoice, searchrecovery, andlightselectedstate. Allpass withaxe0; edge-browser-accepted/receipt.json. Actualscreenshotsvisuallyreviewed, notjustDOMchecks.
- Independent actualClaude54410 session245fd3a2-d8ac-4908-9aad-b156da509998 reviewed source andbrowser; finalNO BLOCKERS. proof/independent-review-final.md. Reviewer did not run fullgate/axe/lightcontrast; root did. Reviewer corrected an overstatement that Close scrolled away; it was already sticky, while Back needed fixing.
- API comparison and market-ranks responses deep-equal previouspreview8793. No football forecast/model/scoring ormarket-datachanges. Original825forecasts and954photo dependency preserved.
- 34changedcode/documentationfiles recorded in proof/delivery-code-sha256.json; gitdiff--checkpassed. Privatecache directories verified. Existingpreviews and immutableevidence retained.

## Builder ownership and integration
ActualClaude54331 builtDG198RosterGroups; actualClaude54281 builtDG199Inspector; actualClaude54410 independentlyreviewed. Their worktrees remain intact. Root integratedonlyownednewfiles, corrected QBmissingmembership/tieends/unitlabels/headinghierarchy/headeralignment, and owns parentworkflow. Root further polished inspectorpadding/64pxportrait/copy, responsivecardgrid, breakpoint, labels/focus andscopedcontrast. CurrentDG195files, not intermediatebuilderhashes, are the reviewtarget. No internal agents substitutedforbuilders.

## Limits and next gate
This improves usability and comparison; it does not validate a decision-making edge or make projected points interchangeable with marketprice. The data is the existing saved Sep6capture, displayedasdated; appearance anduncertaintyare notnewlyestimatedhere. Browser-localwatchlist andexisting snapshots retain their currentstoragebehavior. Supportedleaguebasis remains12-teamSuperflex/fullPPR/noTEpremium/Week17, withresearchPPRforecastlimitations disclosed.

Next gate is David's review of the local preview. Publication needs authorization. Keep dynasty-genius as the app repository, dg-build as buildcoordination, and dg-cockpit as environment/recovery; no repositoryconsolidation was performed.
