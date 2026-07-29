#!/usr/bin/env python3
"""Inject the measured league-activity dataset into the 012 prototype.

    python3 proposals/012-league-pulse/build.py

Reads  analysis/league-activity.json   (built by analysis/build-activity-data.py)
Writes proposals/012-league-pulse/prototype.html  (self-contained, no fetches)
"""

import json
import pathlib

HERE = pathlib.Path(__file__).parent
DATA = HERE.parent.parent / "analysis" / "league-activity.json"
TEMPLATE = HERE / "template.html"
OUT = HERE / "prototype.html"

MARKER = "/*__DATA__*/null"


def main() -> None:
    data = json.loads(DATA.read_text())
    html = TEMPLATE.read_text()
    if MARKER not in html:
        raise SystemExit(f"marker {MARKER!r} not found in template")
    OUT.write_text(html.replace(MARKER, json.dumps(data, separators=(",", ":"))))
    print(f"wrote {OUT} ({OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
