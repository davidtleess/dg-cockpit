import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const scanner = join(repoRoot, "autonomy", "core", "scripts", "scan-tree.mjs");

test("flight deck loads only the approved role adapters", async () => {
  const flightDeck = await readFile(join(repoRoot, "home", "dynasty_flight_deck.sh"), "utf8");
  assert.match(
    flightDeck,
    /claude --plugin-dir \"\$HOME\/dg-cockpit\/autonomy\/claude\/dg-engineering\"/,
  );
  assert.match(
    flightDeck,
    /claude --agent tower --plugin-dir \"\$HOME\/dg-cockpit\/autonomy\/claude\/dg-tower\"/,
  );
  assert.match(flightDeck, /tmux send-keys -t \"\$SESSION:1\.2\" \"codex\" C-m/);
  assert.match(flightDeck, /tmux send-keys -t \"\$SESSION:1\.3\" \"agy\" C-m/);
  const studioLaunch = 'tmux send-keys -t "$SESSION:2.1" "claude" C-m';
  assert.equal(flightDeck.split(studioLaunch).length - 1, 1);
  assert.doesNotMatch(
    flightDeck.match(/# 6\. Setup Window 2:[\s\S]*?# 7\. Tower/)?.[0] ?? "",
    /dg-autonomy|antigravity-swarm|--plugin-dir/,
  );
});

test("flight deck resume wire watches the writable worktree run record", async () => {
  const flightDeck = await readFile(join(repoRoot, "home", "dynasty_flight_deck.sh"), "utf8");
  assert.match(flightDeck, /"\$PROJECT_DIR\/\.agents\/dg-autonomy\/run\.json"/);
  assert.doesNotMatch(flightDeck, /\.git\/worktrees\/[^/]+\/dg-autonomy\/run\.json/);
});

test("bootstrap activates after host setup and backup verifies source only", async () => {
  const bootstrap = await readFile(join(repoRoot, "bootstrap.sh"), "utf8");
  const hostSetup = bootstrap.indexOf("other agent configs");
  const activation = bootstrap.indexOf('autonomy/install.sh" --activate');
  const dataRestore = bootstrap.indexOf("data restore from GCS");
  assert.ok(hostSetup >= 0 && activation > hostSetup && dataRestore > activation);

  const backup = await readFile(join(repoRoot, "backup.sh"), "utf8");
  assert.match(backup, /autonomy\/verify\.sh\" --source-only/);
  assert.doesNotMatch(backup, /rsync[^\n]*(?:\.dg-autonomy|plugin\/cache|run\.json)/);

  const ignore = await readFile(join(repoRoot, ".gitignore"), "utf8");
  for (const entry of [
    ".dg-autonomy/",
    ".agents/dg-autonomy/",
    "autonomy/.state/",
    "autonomy/.smoke/",
    "autonomy/.plugin-cache/",
  ]) {
    assert.match(ignore, new RegExp(entry.replaceAll(".", "\\.")));
  }
});

test("supply-chain scanner reports rules without printing secret contents", async () => {
  const root = await mkdtemp(join(tmpdir(), "dg-autonomy-scan-"));
  await mkdir(join(root, "safe"), { recursive: true });
  await writeFile(join(root, "safe", "file.mjs"), "export const value = 1;\n");
  const clean = spawnSync(process.execPath, [scanner, "--root", root], {
    encoding: "utf8",
  });
  assert.equal(clean.status, 0, clean.stderr);

  const secret = "ghp_1234567890abcdef1234567890abcdef1234";
  await writeFile(join(root, ".env"), `TOKEN=${secret}\n`);
  const blocked = spawnSync(process.execPath, [scanner, "--root", root], {
    encoding: "utf8",
  });
  assert.equal(blocked.status, 1);
  assert.match(blocked.stderr, /secret-bearing filename/);
  assert.match(blocked.stderr, /token-shaped value/);
  assert.doesNotMatch(blocked.stderr, new RegExp(secret));
});

test("operator docs explain commands, boundaries, ASW limits, and rollback", async () => {
  const guide = await readFile(join(repoRoot, "autonomy", "README.md"), "utf8");
  for (const command of [
    "dg-auto",
    "dg-plan",
    "dg-review",
    "dg-status",
    "./autonomy/install.sh --check",
    "./autonomy/verify.sh --isolated",
    "./autonomy/install.sh --activate",
    "./autonomy/verify.sh --live",
    "./autonomy/install.sh --status",
    "./autonomy/install.sh --uninstall",
  ]) {
    assert.match(guide, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  for (const phrase of [
    "READY_FOR_GATE",
    "BLOCKED",
    "a949cb8b9736115c555bf493eeb009ccb28a703e",
    "MIT",
    "incomplete",
    "Tower",
    "Studio",
    "commit",
    "permission escalation",
    "~/.dg-autonomy",
  ]) {
    assert.match(guide, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }

  const rootReadme = await readFile(join(repoRoot, "README.md"), "utf8");
  assert.match(rootReadme, /Autonomy Layer/);
  assert.match(rootReadme, /autonomy\/README\.md/);
  assert.match(rootReadme, /Studio.*independent/is);
  assert.match(rootReadme, /Tower.*health-only/is);
});
