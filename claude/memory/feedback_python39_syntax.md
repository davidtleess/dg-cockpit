---
name: python-environment-dynasty-genius
description: Dynasty Genius now runs Python 3.14 in a project venv — old 3.9 syntax constraints no longer apply inside the project
metadata: 
  node_type: memory
  type: project
  originSessionId: 38369f00-9dee-487c-8809-f585ebd3dff6
---

As of 2026-07-14 (verified from pyproject.toml, CI, and the active venv), dynasty-genius-product uses **Python 3.14** (`.venv/bin/python3.14`, Ruff target py314). PEP 604 unions (`str | None`) are fine in project code.

Historical note: the machine's system Python is 3.9.6, and early project work (April 2026) hit 3.9 syntax errors. That constraint is obsolete for the project — always invoke the project venv explicitly, never bare `python3`.

The `round` parameter-name shadowing advice still stands as general practice.

**Why:** The project migrated environments; the old memory caused incorrect advice.

**How to apply:** Use `.venv/bin/python3.14` for all project commands; write modern 3.14 syntax. See [[project_dynasty_genius]].
