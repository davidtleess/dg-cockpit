# Realized-outcome scorer amended-commit divergence audit — Codex v1

Date: 2026-08-14  
Cycle: `TW0813-SCORER-1`  
Amended commit: `17cfc1e95f9324932ffefb829a16da32568d2ca4`  
Superseded commit: `3d9b89adbae0c4c559678424d9348a0d06ed53a6`  
Verdict: **CLEAR**

## Checks

1. The amended commit has tree
   `2396fb1a573b675601bcde866c97638a26366064`, byte-identical to the superseded
   commit's tree. `git diff-tree` between the two commits is empty.
2. The parent remains
   `23a2e5bd67f3c70ac6ff43ac579e7baea43aff36`; only the commit object/message
   changed.
3. The committed message matches
   `scorer_cycle_commit_message_v2.txt` exactly after removing the one extra
   newline emitted by `git log --format=%B`.
4. The correction section names both intentionally included QB-1 documentation
   files, their short blob pins, the 108-line cross-thread inclusion, and the
   prior false "cycle files only" boundary claim. PC-B1 is therefore resolved
   by turning the commit into an explicitly disclosed mixed evidence record;
   there is no hidden content divergence.
5. The correction section also names the 16 trailing-whitespace findings and
   explains why those hash-cited evidence bytes remain unchanged. PC-W1 is
   resolved as an honestly retained WARN, not misreported as a clean
   commit-range diff check.
6. The index is empty. `origin/main...HEAD` is `0 1`: the amended commit remains
   one local commit ahead and has not been pushed.
7. David's completed-run archive exists at
   `run.claude-scorer-COMPLETE-3d9b89a.json.bak`; no active `run.json` remains.
   No stash residue is present.
8. Because the tree is byte-identical, all committed blob pins and the fresh
   focused 92/92 scorer result from the first audit remain applicable without
   rerunning product checks.

## Disposition

The amended commit closes the scorer delivery loop. Push and the first live
finalized-week scoring run remain David-gated. This audit authorizes neither.

