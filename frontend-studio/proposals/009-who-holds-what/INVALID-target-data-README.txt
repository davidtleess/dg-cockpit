INVALID — DO NOT USE.

This file (renamed from target-data.js on 2026-07-25) carries a `surplus` field computed as
gain - cost. That metric is DEGENERATE: it returns a team-pair constant (910, 910, 910 ...)
because it reduces to (their replacement level - my replacement level) and says nothing about
the player it is attached to. Ranking on it is meaningless.

Superseded by: ../../analysis/replaceability.py  and
               ../../analysis/replaceability-2026-07-25.json
which keep cost and gain as two separate dimensions and never fuse them.
