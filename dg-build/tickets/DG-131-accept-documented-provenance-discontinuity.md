# DG-131 — The capture is dark because a provenance witness was destroyed; accept a documented discontinuity

**Layer:** 2 · **State:** done · **Lane:** Davids-MacBook-Pro-17129 · **DG 3.0** · **backend / ops · RESTORES DAILY CAPTURE**
**Source:** David's ruling 2026-09-01, given directly: **accept a documented provenance
discontinuity**, and provenance is the first of three items routed to this lane.

**Problem:** `model_forward_capture` aborts every run with
`required_provenance_missing: app/data/models/head_a/runs/20260524T140748Z/te_v3_metadata.json`,
while the enclosing `run_pvo_refresh` reports `status: ok`. Measured:

    sqlite3 "file:app/data/model_forward_capture.db?mode=ro" \
      "select capture_date,count(*) from model_forward_capture_raw group by 1 order by 1 desc limit 4"
    2026-08-30|12226   2026-08-29|24452   2026-08-28|12226   2026-08-27|24452

**Last capture 2026-08-30. Nothing for 08-31 or 09-01** — roughly 12,000 prediction rows per day,
and those days cannot be recaptured later.

**The file is unrecoverable, verified not assumed.** Not on disk, not in git, and in none of the 14
offsite runs: `app/config/backup_manifest.json` names `app/data/models/head_a/v3_manifest.json` and
`.../runs/20260524T140748Z/te_v3.pkl` from that directory but **never the metadata**. The logged
sha256 is not an acceptance test — bytes are not derivable from a hash and there is no copy to
verify against. Serving was never at risk: `te_v3.pkl` is byte-identical to the 08-29 offsite copy.

**⛔ ANTI-SCOPE.** Do NOT make the provenance check optional. It fails closed and that is correct;
David ruled that an unreadable model must be a hard error. Do NOT regenerate the file and present it
as restored provenance — that manufactures a witness and breaks continuity with the logged hash.

**Approach.** Replace a missing witness with a RECORDED STATEMENT OF ITS ABSENCE. A durable registry
(`app/config/provenance_discontinuities.json`) names each artifact whose provenance is permanently
unrecoverable, with the date, the ruling and the reason. The check stays mandatory: a missing
artifact that is NOT in the registry still aborts. Only a deliberately declared discontinuity
proceeds, and the declaration itself becomes part of the provenance record — so the vintage says
"this witness is absent, here is why", rather than being silently whole.

Both read sites are `src/dynasty_genius/capture/model_forward_capture_driver.py` — `:183` (in the
provenance_hash subset) and `:285` (the full block). The metadata is read ONLY to `_sha()` it; its
content is never parsed, so nothing downstream depends on its fields. `te_metadata_sha256` has one
writer and zero readers outside the driver.

**Done:** the daily capture runs to completion again and writes rows for the current date; a missing
REQUIRED artifact that is not declared still aborts (pinned by test); the declared discontinuity
appears in the stored provenance rather than being papered over; the healthy path's provenance_hash
is byte-unchanged; and `te_v3_metadata.json` is added to `backup_manifest.json` so the class cannot
recur.


---

## LANDED 2026-09-01 — `a62cbcf7`

**Design: a recorded statement of absence, not a weakened check.** The refusal path is byte-unchanged
for every artifact except the one David ruled on. `app/config/provenance_discontinuities.json` is
consulted ONLY on `FileNotFoundError`; missing-and-undeclared still aborts. The hashed provenance
subset carries only the FACT of absence (`status`, `unrecoverable_since`), never prose, so re-wording
the registry cannot move a vintage hash — the stored block carries the full record separately.
A healthy vintage's `provenance_hash` is unchanged; the extra key appears only when declared.

Sound only because these bytes were hashed and never parsed: the driver reads the metadata solely to
`_sha()` it, and `te_metadata_sha256` has one writer and zero readers. The registry states that
constraint so nobody later declares an artifact whose content is consumed.

**Recurrence closed, and this is the more important half.** The metadata was lost because
`backup_manifest.json` ENUMERATED FILES in a model run directory — it named `v3_manifest.json` and
`te_v3.pkl` and never the sidecar, which is why all 14 offsite runs held the pickle and none held the
metadata. The manifest now carries `app/data/models/head_a/runs/20260524T140748Z` as
`kind: "directory"`. **Other model run directories likely carry the same enumeration pattern — worth
a sweep.**

**Evidence.** `scripts/run_model_forward_capture.py` against a scratch `--db-path` (never the shared
store): `status: ok`, exit 0, **12,201 raw rows**, `te_v3_metadata.sha256: null` beside a
`discontinuity` record. Full suite `6607 passed, 32 skipped`. The declared-absence test confirmed
failing without the wiring, with the exact production error
`required_provenance_missing:...te_v3_metadata.json`.

**⛔ LANDED IS NOT ACTIVE.** The scheduler runs from `~/dynasty-genius-product`, whose working tree
was at `aed29b72` and lacks this fix — `dg-land.sh` pushes `HEAD:main` and leaves the trunk's own
checkout behind. **Until that tree is fast-forwarded, the 09:00 capture still aborts.** Verified the
update touches 9 files and collides with none of the trunk's 25 dirty files, so `git pull --ff-only`
is clean; it needs a quiet moment, not a merge.

**⚠ ROOT CAUSE OF THAT, worth fixing in dg-build:** `dg-work.sh` fetches `origin/$BASE` and then
branches from LOCAL `$BASE`. Since `dg-land.sh` never fast-forwards the local ref, every new worktree
starts one land behind, which is what produced this ticket's add/add conflict on the ledger. Branch
from `origin/$BASE` instead.
