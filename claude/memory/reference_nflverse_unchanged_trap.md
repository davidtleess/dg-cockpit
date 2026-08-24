---
name: reference-nflverse-unchanged-trap
description: A stale nflverse DB mtime and a stale nflverse_capture ledger date are the SIGNATURE OF A HEALTHY idempotent capture, not evidence of data loss — verified 2026-08-21
metadata:
  type: reference
---

`UsageStore.apply_season` (`src/dynasty_genius/nflverse_usage.py`) returns `"unchanged"` and
writes NOTHING when the content digest matches the stored row — and it does **not** update
`nflverse_capture.ingested_at` on that path.

**Consequence that looks exactly like a catastrophe and is not:** because the scheduled job
fetches only 2023/2024/2025 (three FINISHED seasons — the SR-06 defect), every stream returns
`unchanged` every single day. So `app/data/nflverse_usage.db` keeps an old mtime and the ledger
keeps an old `ingested_at` **forever**, no matter how many successful captures run.

On 2026-08-21 this was misread as "the contracts stream failure destroyed the whole morning's
stats." It had not. Proof that settles it in one command — compare the raw snapshots:

```
python - <<'PY'
import json
a=json.load(open('.../raw/ngs_passing_2023_<older>.json'))
b=json.load(open('.../raw/ngs_passing_2023_<newer>.json'))
print(a['records']==b['records'])   # True => data genuinely unchanged
PY
```
Only `captured_at` differs between runs; identical file SIZES with differing sha256 is the
fixed-width-timestamp signature, not changed data.

**Also established the same morning, against a wrong first reading:** `apply_season` commits
per stream-season on its own connection, and `contracts` is LAST in `build_streams()`. A
contracts failure therefore **cannot** roll back the stat streams. What it does cost is
`publish_export()` — it sits after the stream loop inside the same `try`, so an exception skips
it and `export/nflverse_usage.ready.json` goes stale.

Related: [[project_season_readiness_2026]]
