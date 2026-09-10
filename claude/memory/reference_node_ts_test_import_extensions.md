---
name: reference_node_ts_test_import_extensions
description: "In the Lovable app, VALUE imports between src/lib/dg/*.ts must carry the .ts extension or node --test silently drops whole test files; type-only imports must not."
metadata:
  type: reference
---

**`npm test` in `lovable/` is `node --test tests/*.test.ts` — native Node type stripping, no bundler.
Node's ESM resolver does NOT guess extensions, so a VALUE import without `.ts` fails to resolve.**

```ts
import { headshotUrl } from "./release";       // ⛔ breaks node --test
import { headshotUrl } from "./release.ts";    // ✅
import type { Tier } from "./copy";            // ✅ fine either way — erased before resolution
```

**The tell is a DROP IN TEST COUNT, not an error you can read.** Adding two extensionless imports to
`backend.ts` took the suite from **68 tests to 39** — the files that transitively imported it failed to
load, and the summary still said `pass 34 / fail 5`, which looks like five ordinary failures rather
than half the suite never running. ⚠ Always compare the total test count before and after touching
imports; `fail 0` on a shrunken suite is the same lie as a skipped guard
([[feedback_the_failure_path_returns_the_success_signal]]).

Only files reachable from `tests/*.test.ts` are affected. Vite resolves both forms, so the app builds
either way and the break shows up only in the Node suite. The existing convention is visible in
`src/lib/dg/copy.ts` (`from "./backend.ts"`).
