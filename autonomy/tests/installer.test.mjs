import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmod,
  mkdir,
  mkdtemp,
  readlink,
  unlink,
  readFile,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const autonomyRoot = fileURLToPath(new URL("..", import.meta.url));
const cockpitRoot = fileURLToPath(new URL("../..", import.meta.url)).replace(/\/$/, "");
const installerPath = join(autonomyRoot, "install.sh");
const sourceFlightDeck = fileURLToPath(
  new URL("../../home/dynasty_flight_deck.sh", import.meta.url),
);

async function writeOwned(path, content, mode = 0o600) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, { mode });
}

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "dg-autonomy-install-"));
  const home = join(root, "home");
  const fakeBin = join(root, "fake-bin");
  const log = join(root, "host.log");
  await mkdir(fakeBin, { recursive: true });
  await mkdir(home, { recursive: true });

  const hostScript = `#!/bin/bash
set -eu
printf '%s %s\\n' "$(basename "$0")" "$*" >> "$FAKE_HOST_LOG"
if [ "\${FAKE_VALIDATOR_FAIL:-0}" = "1" ] && [ "\${1:-}" = "plugin" ] && [ "\${2:-}" = "validate" ]; then
  exit 9
fi
if [ "\${FAKE_ACTIVATION_FAIL:-0}" = "1" ] && [ "$(basename "$0")" = "codex" ] && [ "\${1:-}" = "plugin" ] && [ "\${2:-}" = "marketplace" ] && [ "\${3:-}" = "add" ]; then
  exit 11
fi
if [ "$(basename "$0")" = "codex" ] && [ "\${1:-}" = "plugin" ] && [ "\${2:-}" = "list" ]; then
  if [ "\${FAKE_MISSING_CODEX:-0}" != "1" ] && { [ "\${FAKE_MISSING_CODEX_UNTIL_ADD:-0}" != "1" ] || [ -f "$FAKE_STATE_DIR/codex-plugin" ]; }; then printf '%s\\n' 'dg-autonomy@dynasty-autonomy installed, enabled 0.2.0 '; fi
  exit 0
fi
if [ "$(basename "$0")" = "codex" ] && [ "\${1:-}" = "plugin" ] && [ "\${2:-}" = "marketplace" ] && [ "\${3:-}" = "list" ]; then
  if [ "\${FAKE_MISSING_CODEX:-0}" != "1" ] && { [ "\${FAKE_MISSING_CODEX_UNTIL_ADD:-0}" != "1" ] || [ -f "$FAKE_STATE_DIR/codex-marketplace" ]; }; then printf '%s\\n' 'dynasty-autonomy'; fi
  exit 0
fi
if [ "$(basename "$0")" = "codex" ] && [ "\${1:-}" = "plugin" ] && [ "\${2:-}" = "marketplace" ] && [ "\${3:-}" = "add" ]; then
  touch "$FAKE_STATE_DIR/codex-marketplace"
fi
if [ "$(basename "$0")" = "codex" ] && [ "\${1:-}" = "plugin" ] && [ "\${2:-}" = "add" ]; then
  touch "$FAKE_STATE_DIR/codex-plugin"
fi
if [ "$(basename "$0")" = "agy" ] && [ "\${1:-}" = "plugin" ] && [ "\${2:-}" = "list" ]; then
  if [ "\${FAKE_MISSING_ANTIGRAVITY_UNTIL_ADD:-0}" != "1" ] || [ -f "$FAKE_STATE_DIR/antigravity-plugin" ]; then printf '%s\\n' 'dg-autonomy'; fi
  exit 0
fi
if [ "$(basename "$0")" = "agy" ] && [ "\${1:-}" = "plugin" ] && [ "\${2:-}" = "install" ]; then
  touch "$FAKE_STATE_DIR/antigravity-plugin"
  mkdir -p "$FAKE_ANTIGRAVITY_LIVE_ROOT"
  cp -R "\${3}/." "$FAKE_ANTIGRAVITY_LIVE_ROOT/"
fi
exit 0
`;
  for (const name of ["claude", "codex", "agy"]) {
    const path = join(fakeBin, name);
    await writeFile(path, hostScript, { mode: 0o755 });
    await chmod(path, 0o755);
  }

  const sentinels = new Map([
    [join(home, ".claude", "settings.json"), '{"claude":"sentinel"}\n'],
    [join(home, ".claude", "hooks.json"), '{"hooks":"sentinel"}\n'],
    [join(home, ".codex", "config.toml"), 'codex = "sentinel"\n'],
    [join(home, ".codex", "hooks.json"), '{"hooks":"sentinel"}\n'],
    [
      join(home, ".gemini", "antigravity-cli", "settings.json"),
      '{"permissions":{"allow":["sentinel"]}}\n',
    ],
    [
      join(home, ".gemini", "antigravity-cli", "hooks.json"),
      '{"hooks":"sentinel"}\n',
    ],
  ]);
  for (const [path, content] of sentinels) {
    await writeOwned(path, content);
  }

  const flightDeck = join(home, "dynasty_flight_deck.sh");
  const flightDeckSentinel = "#!/bin/bash\necho sentinel-flight-deck\n";
  await writeOwned(flightDeck, flightDeckSentinel, 0o755);

  const env = {
    ...process.env,
    HOME: home,
    PATH: `${fakeBin}:${process.env.PATH}`,
    FAKE_HOST_LOG: log,
    FAKE_STATE_DIR: root,
    FAKE_ANTIGRAVITY_LIVE_ROOT: join(home, ".gemini", "config", "plugins", "dg-autonomy"),
    DG_AUTONOMY_HOME: join(home, ".dg-autonomy"),
    DG_AUTONOMY_FLIGHT_DECK: flightDeck,
    DG_AUTONOMY_ANTIGRAVITY_LIVE_ROOT: join(home, ".gemini", "config", "plugins", "dg-autonomy"),
  };
  return { env, flightDeck, flightDeckSentinel, home, log, sentinels };
}

function runInstaller(args, env) {
  return spawnSync("bash", [installerPath, ...args], {
    cwd: autonomyRoot,
    env,
    encoding: "utf8",
  });
}

async function assertSentinels(sentinels) {
  for (const [path, content] of sentinels) {
    assert.equal(await readFile(path, "utf8"), content, path);
  }
}

test("installer check, activation, repeat activation, status, and uninstall are narrow", async () => {
  const setup = await fixture();

  const checked = runInstaller(["--check"], setup.env);
  assert.equal(checked.status, 0, checked.stderr);
  assert.equal(await readFile(setup.flightDeck, "utf8"), setup.flightDeckSentinel);
  await assertSentinels(setup.sentinels);

  const activated = runInstaller(["--activate"], setup.env);
  assert.equal(activated.status, 0, activated.stderr);
  assert.equal(
    await readFile(setup.flightDeck, "utf8"),
    (await readFile(sourceFlightDeck, "utf8")).replaceAll(
      "$HOME/dg-cockpit",
      cockpitRoot,
    ),
  );
  const firstLog = await readFile(setup.log, "utf8");
  assert.match(firstLog, /codex plugin marketplace add/);
  assert.match(firstLog, /codex plugin add dg-autonomy@dynasty-autonomy/);
  assert.match(firstLog, /agy plugin install/);
  await assertSentinels(setup.sentinels);
  assert.equal(
    await readlink(join(setup.home, ".dg-autonomy", "bin", "dg-autonomy")),
    join(autonomyRoot, "core", "bin", "dg-autonomy.mjs"),
  );

  const repeated = runInstaller(["--activate"], setup.env);
  assert.equal(repeated.status, 0, repeated.stderr);
  const repeatedLog = await readFile(setup.log, "utf8");
  assert.equal(
    repeatedLog.match(/codex plugin add dg-autonomy@dynasty-autonomy/g)?.length,
    1,
  );
  assert.equal(repeatedLog.match(/agy plugin install/g)?.length, 1);

  const status = runInstaller(["--status"], setup.env);
  assert.equal(status.status, 0, status.stderr);
  assert.match(status.stdout, /dynasty-autonomy/);
  assert.match(status.stdout, /dg-autonomy/);

  const uninstalled = runInstaller(["--uninstall"], setup.env);
  assert.equal(uninstalled.status, 0, uninstalled.stderr);
  assert.equal(await readFile(setup.flightDeck, "utf8"), setup.flightDeckSentinel);
  const finalLog = await readFile(setup.log, "utf8");
  assert.match(finalLog, /codex plugin remove dg-autonomy@dynasty-autonomy/);
  assert.match(finalLog, /codex plugin marketplace remove dynasty-autonomy/);
  assert.match(finalLog, /agy plugin uninstall dg-autonomy/);
  await assertSentinels(setup.sentinels);
  await assert.rejects(
    readlink(join(setup.home, ".dg-autonomy", "bin", "dg-autonomy")),
    { code: "ENOENT" },
  );
});

test("status fails on registration drift and activate repairs owned registrations", async () => {
  const setup = await fixture();
  const activated = runInstaller(["--activate"], setup.env);
  assert.equal(activated.status, 0, activated.stderr);
  await unlink(join(setup.env.FAKE_STATE_DIR, "codex-marketplace"));
  await unlink(join(setup.env.FAKE_STATE_DIR, "codex-plugin"));
  await unlink(join(setup.env.FAKE_STATE_DIR, "antigravity-plugin"));

  const driftEnvironment = {
    ...setup.env,
    FAKE_MISSING_CODEX_UNTIL_ADD: "1",
    FAKE_MISSING_ANTIGRAVITY_UNTIL_ADD: "1",
  };
  const driftedStatus = runInstaller(["--status"], driftEnvironment);
  assert.equal(driftedStatus.status, 2);
  assert.match(driftedStatus.stderr, /registration is missing|marketplace registration is missing/);

  const repaired = runInstaller(["--activate"], driftEnvironment);
  assert.equal(repaired.status, 0, repaired.stderr);
  assert.match(repaired.stdout, /verified and repaired/);
  const log = await readFile(setup.log, "utf8");
  assert.equal(log.match(/codex plugin marketplace add/g)?.length, 2);
  assert.equal(log.match(/codex plugin add dg-autonomy@dynasty-autonomy/g)?.length, 2);
  assert.equal(log.match(/agy plugin install/g)?.length, 2);
});

test("status and repair fail closed when the live flight deck was externally edited", async () => {
  const setup = await fixture();
  const activated = runInstaller(["--activate"], setup.env);
  assert.equal(activated.status, 0, activated.stderr);
  await writeFile(setup.flightDeck, "#!/bin/bash\necho externally-edited\n", { mode: 0o755 });

  const status = runInstaller(["--status"], setup.env);
  assert.equal(status.status, 2);
  assert.match(status.stderr, /drifted/);
  const repair = runInstaller(["--activate"], setup.env);
  assert.equal(repair.status, 2);
  assert.match(repair.stderr, /changed outside Dynasty ownership/);
});

test("validator failure stops before activation", async () => {
  const setup = await fixture();
  const result = runInstaller(["--activate"], {
    ...setup.env,
    FAKE_VALIDATOR_FAIL: "1",
  });
  assert.notEqual(result.status, 0);
  assert.equal(await readFile(setup.flightDeck, "utf8"), setup.flightDeckSentinel);
  const log = await readFile(setup.log, "utf8");
  assert.doesNotMatch(log, /marketplace add|plugin add|plugin install/);
  await assertSentinels(setup.sentinels);
});

test("mid-activation failure rolls back and exits blocked", async () => {
  const setup = await fixture();
  const result = runInstaller(["--activate"], {
    ...setup.env,
    FAKE_ACTIVATION_FAIL: "1",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /BLOCKED: activation failed/);
  assert.equal(await readFile(setup.flightDeck, "utf8"), setup.flightDeckSentinel);
  const log = await readFile(setup.log, "utf8");
  assert.doesNotMatch(log, /agy plugin install/);
  await assert.rejects(
    readFile(join(setup.home, ".dg-autonomy", "install.json"), "utf8"),
    { code: "ENOENT" },
  );
  await assertSentinels(setup.sentinels);
});

test("uninstall recovers when an owned Codex registration is already absent", async () => {
  const setup = await fixture();
  const activated = runInstaller(["--activate"], setup.env);
  assert.equal(activated.status, 0, activated.stderr);

  const uninstalled = runInstaller(["--uninstall"], {
    ...setup.env,
    FAKE_MISSING_CODEX: "1",
  });
  assert.equal(uninstalled.status, 0, uninstalled.stderr);
  assert.equal(await readFile(setup.flightDeck, "utf8"), setup.flightDeckSentinel);
  const log = await readFile(setup.log, "utf8");
  assert.doesNotMatch(log, /codex plugin remove dg-autonomy@dynasty-autonomy/);
  assert.doesNotMatch(log, /codex plugin marketplace remove dynasty-autonomy/);
  assert.match(log, /agy plugin uninstall dg-autonomy/);
});
