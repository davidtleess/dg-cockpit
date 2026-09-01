---
name: symlink-write-through
description: Writing into a directory you have already symlinked follows the link into the REAL tree — it destroyed two trunk model files on 2026-08-31
metadata: 
  node_type: memory
  type: reference
  modified: 2026-08-31T14:33:55.758Z
  originSessionId: 4fc1a3c2-f5d3-43ff-91aa-2d474cab86ad
---

**Never `ln -s` or `rm -rf` a path inside a directory you have already symlinked.** The write follows
the link into the real tree.

## What happened (2026-08-31, the day's only real data loss)

Simulating a worktree share, a loop ran over a path list:

```sh
mkdir -p "$WT/$(dirname "$rel")"
rm -rf   "$WT/$rel"
ln -s    "$TRUNK/$rel" "$WT/$rel"
```

An earlier iteration had already created `$WT/app/data/models/head_a` → `$TRUNK/.../head_a`.
So the next iteration, for `head_a/v3_manifest.json`, resolved `$WT/app/data/models/head_a/` **through
that symlink into the trunk** and:
- `rm -rf` deleted the TRUNK's real `v3_manifest.json` and `runs/`, then
- `ln -s` created `head_a/v3_manifest.json` → `head_a/v3_manifest.json` — pointing at itself.

Symptom, 15 minutes later: the 09:00 daily chain's `run_pvo_refresh` aborted with
`[Errno 62] Too many levels of symbolic links`. The files were gitignored, so git could not help.

## How to avoid it

1. **Check every ancestor before writing.** `test -L "$parent"` / `os.path.islink()` up the chain,
   not just the leaf. A parent link is invisible at the leaf.
2. **Build link sets deepest-first, or link only leaves into REAL parent dirs** — which is exactly
   what the repo's own `dg-work.sh:share_path` does: a directory containing tracked files is created
   as a REAL directory and recursed into; only ignored children are symlinked. Read it before writing
   your own version.
3. `ln -s TARGET DIR` where DIR already exists creates `DIR/basename(TARGET)` **inside** it rather
   than failing. Use `ln -shf` deliberately or remove the destination first — and know which one you
   are removing.
4. Do experiments in a scratch tree that contains **no** links back into the source.

## Why it was recoverable

`app/data/models/head_a/v3_manifest.json` and `.../runs/20260524T140748Z/te_v3.pkl` are both
`required: True` in `app/config/backup_manifest.json`, so the nightly GCS run held them. Restored from
`gs://dynasty-genius-backup-dtl/dynasty-genius/runs/20260830T141500Z/` and **verified by sha256
against `model_registry.json`** (`9e1b0b7f…`) rather than by eye. Serving was never affected — the
product reads the engine_b manifest, not head_a.

**The lesson beyond the mechanics:** verify a restore against an independent record of what the file
should be. The registry carried the hash, so the repair was provable rather than plausible.

Related: [[project_gate_integrity_and_te_validation]], [[reference_backup_architecture]]
