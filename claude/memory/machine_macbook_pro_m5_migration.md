---
name: machine-macbook-pro-m5-migration
description: David's main machine became a MacBook Pro M5 Pro (arm64) on 2026-08-22, migrated from an INTEL MacBook Air — migrated binaries cannot exec, and several ops gotchas follow from it
metadata:
  type: project
---

**2026-08-22: David migrated from a MacBook Air (INTEL) to a MacBook Pro (M5 Pro, arm64, 48GB).**
His words: *"this is my new MAIN machine - this is where the system will be built and run from here
on. i may use the Air periodically or as an ancillary unit but this machine is now the heartbeat."*

**Rosetta 2 is NOT installed.** So anything carried over from the Air is x86_64 and does not fail
slowly — it cannot exec at all: `posix_spawn(...) EBADARCH`, `86: Bad CPU type in executable`.
Under launchd that surfaces only as `EX_CONFIG` (78) with **zero bytes of log output**.
**If something that used to work now dies with no output, check the architecture first.**

Gotchas established by measurement that day, each of which cost real time:

- **zsh has a `log` builtin** that shadows `/usr/bin/log`. `log show ...` silently returns nothing
  and looks like "no such events". Always use the absolute path `/usr/bin/log show`.
- **launchd's penalty box.** A job that fails to spawn is left
  `properties = penalty box`, `watching = 0`, `state = spawn scheduled`, and stays stuck after the
  underlying cause is fixed. **`launchctl kickstart` does NOT clear it** — only
  `launchctl bootout gui/501/<label>` followed by `launchctl bootstrap gui/501 <plist>`.
  This failure is recorded ONLY in launchd's in-memory state and dies at reboot.
- **gcloud runs its interpreter with `-S`**, so a `google-crc32c` wheel installed in any venv is
  invisible to it. It shells out to `gcloud-crc32c`, which macOS quarantines on a fresh SDK install;
  Gatekeeper then blocks it and gcloud computes hashes as `AAAAAA==`. A gcloud upgrade re-downloads
  that binary and can re-quarantine it.
- **launchd's PATH is `/usr/bin:/bin:/usr/sbin:/sbin`** — no Homebrew. gcloud there resolves
  `python3` to system 3.9 and refuses to load unless `CLOUDSDK_PYTHON` is set.
- **Verifying a scheduled wake: `pmset -g sched` is the ONLY reliable check.** Two file paths were
  cited as corroboration on 2026-08-22 and **both are wrong** —
  `/Library/Preferences/com.apple.AutoWake.plist` and
  `/Library/Preferences/SystemConfiguration/com.apple.AutoWake.xml` do not exist on macOS 26 **even
  when the schedule is live and `pmset -g sched` prints it**. Verifying by file path will make you
  "fix" a wake that is not broken.
- **The Claude Code `!` prefix cannot run `sudo`** — no TTY, so sudo has nowhere to prompt
  (`a terminal is required to read the password`). Privileged interactive commands need David in a
  real terminal, and he must check the prompt: `Davids-MacBook-Pro` vs `Davids-Air`.
- **The Claude Code status line was a casualty (found + fixed 2026-08-22).**
  `~/.claude/settings.json` pointed `statusLine` at `~/.dg-context/runtime/bin/dg-context-fast`,
  an **x86_64** build -> `bad CPU type in executable`, so the line rendered as nothing and failed
  silently. Fixed by repointing to a new POSIX-sh wrapper
  `~/.dg-context/runtime/bin/dg-context-statusline`, which execs the already-working
  `dg-context.mjs ingest claude` (renders `ctx 42% · 58% left · 1000k max`). The wrapper resolves
  `node` itself (PATH -> newest `~/.nvm/versions/node/*/bin/node` -> Homebrew) because status line
  hooks do not inherit the interactive PATH, and it **always prints something** so the next
  breakage is visible rather than silent. Backup: `settings.json.bak-20260822-165947`.
  **STILL POINTED AT THE DEAD BINARY** (not touched, needs David's call):
  `~/.dg-context/install.json` (the hash-guarded installer) and
  `~/dg-cockpit/frontend-studio/.claude/settings.json` (Studio's own status line).

- The old **`.venv/bin/python` -> system 3.9.6 trap is GONE** — the venv rebuild fixed it. Any doc
  still warning about it is stale.

Whether the **Air** has been powered down / had its LaunchAgents disabled was still UNRESOLVED at
the end of 2026-08-22. If it runs, it captures into a divergent store and pushes to the same GCS
bucket. See [[project_season_readiness_2026]] and [[reference_backup_architecture]].

---

## ✅ RESOLVED 2026-08-23 — the backup plist was fixed in the repo and never installed

The `CLOUDSDK_PYTHON` fix above was committed to `ops/launchd/...plist` on 08-22 and **the live
copy in `~/Library/LaunchAgents/` still sat at 2026-07-04 with no `EnvironmentVariables` block at
all.** launchd loads the *installed* copy, so the offsite backup kept failing `auth_unavailable`,
0 bytes, in a gitignored marker no surface read.

**A committed plist is not an installed plist.** `launchctl print gui/501/<label>` and grep the
`environment = {` block — that is the only thing that proves what launchd actually holds.

**The guard could not see it.** `tests/contract/test_backup_irreplaceable_ops_scheduler.py` asserts
`Path("ops/launchd/...")` — the REPO copy — and never looks at `~/Library/LaunchAgents/`. It
reported `6 passed` for the entire time the live plist was broken. A drift test that reads only the
source side is not a drift test.

**Fix: symlink, do not copy.** Of 12 plists, 6 were symlinks and 5 were copies; the ONE that drifted
was a copy. Symlinking makes the drift class structurally impossible. Tradeoff accepted knowingly:
the live launchd config now follows the working tree, so a branch switch or a lane editing
`ops/launchd/` changes what is on disk (latent — it takes effect only at the next bootstrap).

**PROVEN, not assumed:** scheduled run `20260823T141500Z` fired at the 10:15 calendar event,
`last exit code = 0`, 3,264,672,103 bytes / 654 files, `sha256_verified: true`. First exit-0 for
this job on the M5; every prior success was a manual run inheriting Terminal's environment.

**Claude Code's auto-mode classifier blocks `launchctl bootout/bootstrap` and `git push`.** Not a
permissions problem to debug — hand David the `!` one-liner and he runs it.
