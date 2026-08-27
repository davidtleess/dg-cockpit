"""GREEN v19 real-store byte-copy migration probe.

Copies the LIVE governed stores byte-for-byte into a disposable root and runs
the real initialization path against them. It never writes to, reads for
mutation, or otherwise touches the live files: the only live operation is a
read for the copy and a hash.
"""

from __future__ import annotations

import hashlib
import importlib.util
import shutil
import sqlite3
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(REPO))

spec = importlib.util.spec_from_file_location(
    "_v19_probe_contract", REPO / "tests" / "contract" / "test_footballguys_phase_a_red.py"
)
assert spec and spec.loader
T = importlib.util.module_from_spec(spec)
spec.loader.exec_module(T)

STORES = ("receipts", "semantics", "observations")


def _sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    live_root = REPO
    scratch = Path(tempfile.mkdtemp(prefix="fbg_v19_probe_"))
    print(f"disposable root: {scratch}")

    copied: dict[str, str] = {}
    for store in STORES:
        rel = T.RUNTIME_PATHS[store]
        src = live_root / rel
        if not src.exists():
            print(f"  {store}: ABSENT live, skipped")
            continue
        dst = scratch / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        # the governed namespace is private; mirror the live mode exactly
        dst.parent.chmod(0o700)
        shutil.copy2(src, dst)
        for suffix in ("-wal", "-shm"):
            side = Path(str(src) + suffix)
            if side.exists():
                shutil.copy2(side, Path(str(dst) + suffix))
        copied[store] = _sha(dst)
        print(f"  {store}: copied {src.stat().st_size} bytes sha={copied[store][:16]}…")
        with sqlite3.connect(f"file:{dst}?mode=ro", uri=True) as conn:
            row = conn.execute(
                "SELECT sql FROM sqlite_master WHERE type='table' AND name='acquisitions'"
            ).fetchone()
            print(f"     pre-migration acquisitions DDL: {(row[0] if row else None)}")

    if not copied:
        print("NO LIVE STORES PRESENT — probe vacuous, reporting as such")
        return 2

    failures = 0
    for store in copied:
        driver = T._driver(scratch, mode="full_offsite")
        try:
            driver.initialize_database(store)
        except Exception as exc:  # noqa: BLE001 - probe reports, never masks
            print(f"  {store}: INITIALIZE RAISED {exc!r}")
            failures += 1
            continue
        path = scratch / T.RUNTIME_PATHS[store]
        with sqlite3.connect(path) as conn:
            cols = [r[1] for r in conn.execute("PRAGMA table_info(acquisitions)")]
            expected = [
                c.strip().split()[0] for c in T._V18_ACQUISITIONS_BODY.split(",")
            ]
            if store == "semantics":
                print(f"  {store}: initialized OK (event ledger; acquisitions={cols})")
                continue
            att = [r[1] for r in conn.execute("PRAGMA table_info(attempts)")]
            att_expected = [
                c.strip().split()[0] for c in T._V18_ATTEMPTS_BODY.split(",")
            ]
            ok = cols == expected and att == att_expected
            print(f"  {store}: canonical postcondition={'OK' if ok else 'MISMATCH'}")
            if not ok:
                print(f"     acquisitions={cols}\n     attempts={att}")
                failures += 1
            # reopen: migration is never a one-open validation exemption
            T._driver(scratch, mode="full_offsite").initialize_database(store)
            print(f"  {store}: reopen re-validates OK")

    # the live files must be untouched by this probe
    for store, _ in copied.items():
        src = live_root / T.RUNTIME_PATHS[store]
        print(f"  live {store} still sha={_sha(src)[:16]}…")

    print("PROBE FAILURES:", failures)
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
