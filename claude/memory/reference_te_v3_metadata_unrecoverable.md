---
name: reference-te-v3-metadata-unrecoverable
description: "te_v3_metadata.json was destroyed 2026-08-31 and is genuinely unrecoverable — \"reconstruct and verify against its sha256\" is a trap, not a remedy."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 0d30ce38-6359-4ba2-9420-29f91795414f
  modified: 2026-09-01T10:47:17.129Z
---

`app/data/models/head_a/runs/20260524T140748Z/te_v3_metadata.json` was destroyed in the
2026-08-31 09:04 symlink incident (a loop wrote into a directory it had already symlinked;
`rm -rf`/`ln -s` followed the link into the real trunk). The restore from GCS brought back
2 of 3 files because `backup_manifest.json` names `te_v3.pkl` and `v3_manifest.json` and
**not** the metadata.

**⛔ THE ATTRACTIVE WRONG REMEDY.** A pre-incident capture logged its hash at
`app/data/logs/daily_chain.out.log:4777` —
`ec64317784eed23ff6c3a8757f1983b8c869bd3509b95fe1a906c13722ed186a` — and this reads like
"an exact acceptance test: the difference between unrecoverable and reconstruct-and-verify."
**It is not.** You cannot derive bytes from a hash. Verified 2026-09-01:

    gsutil ls -r 'gs://dynasty-genius-backup-dtl/dynasty-genius/**/head_a/**'
    -> EVERY daily run (20260818 … 20260829+) carries te_v3.pkl and v3_manifest.json.
       NONE carries te_v3_metadata.json.
    git log --all -- '**/te_v3_metadata.json'  -> empty
    find ~ -name 'te_v3_metadata*'             -> empty

No copy exists anywhere, and the file's content is **never parsed** — both use sites
(`model_forward_capture_driver.py:183` and `:284-296`) only compute `_sha(te_meta_bytes)`.
So there is no schema to rebuild from either. With nothing to verify against, a hash is
useless as a recipe.

**THE REAL DECISION** is not "restore it": it is accept a *documented provenance
discontinuity* (create a file so the capture resumes, record that the hash changes at this
date) versus keep losing capture days. `model_forward_capture` already has no rows for
2026-08-31, and each 09:00 chain aborts the capture again **while reporting success** — the
driver returns an abort report instead of raising, and the runner only fails on a raise.
Whatever is created must be added to `backup_manifest.json` or this recurs.

**⛔ DO NOT re-run `scripts/promote_head_a_te_v3.py`** — it writes a NEW `runs/{ts}/` from a
fresh Ridge fit and moves the `v3_manifest.json` pointer, breaking day-over-day provenance
for every prior capture.

**✅ The other half of the restore IS clean — independently verified.**
`te_v3.pkl` on disk is byte-identical to the 20260829 backup copy, both
`9e1b0b7fc7f707fba9831662fd792067f26e37370fb5aa5fd6532c02cf3e8618`. Serving is intact; only
the provenance witness is gone.

**WHY IT WENT UNDETECTED, and the durable fix:**
`tests/contract/test_model_forward_capture_driver.py:38` pins the exact production path and
`:291` asserts the provenance block reports it — but the test injects a fake reader instead
of touching disk. A required production artifact vanished with a green suite. There is no
test that a required-provenance artifact EXISTS on the real filesystem.

See [[project_gate_integrity_and_te_validation]] and [[reference_symlink_write_through]].
