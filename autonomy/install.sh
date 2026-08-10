#!/bin/bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$ROOT/.." && pwd)"
STATE_ROOT="${DG_AUTONOMY_HOME:-$HOME/.dg-autonomy}"
OWNERSHIP="$STATE_ROOT/install.json"
BACKUP_ROOT="$STATE_ROOT/backups"
HISTORY_ROOT="$STATE_ROOT/history"
LIVE_FLIGHT_DECK="${DG_AUTONOMY_FLIGHT_DECK:-$HOME/dynasty_flight_deck.sh}"
SOURCE_FLIGHT_DECK="$REPO_ROOT/home/dynasty_flight_deck.sh"
CODEX_MARKETPLACE_ROOT="$ROOT/codex-marketplace"
CODEX_PLUGIN="dg-autonomy@dynasty-autonomy"
ANTIGRAVITY_PLUGIN="$ROOT/antigravity/dg-autonomy"
ANTIGRAVITY_LIVE_ROOT="${DG_AUTONOMY_ANTIGRAVITY_LIVE_ROOT:-$HOME/.gemini/config/plugins/dg-autonomy}"
LAUNCHER="$STATE_ROOT/bin/dg-autonomy"
LAUNCHER_TARGET="$ROOT/core/bin/dg-autonomy.mjs"

usage() {
  echo "Usage: $0 --check|--activate|--status|--uninstall" >&2
  exit 64
}

hash_file() {
  shasum -a 256 "$1" | awk '{print $1}'
}

hash_tree() {
  node --input-type=module - "$1" <<'NODE'
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
const root = process.argv[2];
const files = [];
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.isFile()) files.push(path);
  }
}
walk(root);
const hash = createHash("sha256");
for (const path of files.sort()) {
  hash.update(relative(root, path));
  hash.update("\0");
  hash.update(readFileSync(path));
  hash.update("\0");
}
process.stdout.write(hash.digest("hex"));
NODE
}

codex_expected_version() {
  node --input-type=module - "$ROOT/codex-marketplace/plugins/dg-autonomy/.codex-plugin/plugin.json" <<'NODE'
import { readFileSync } from "node:fs";
process.stdout.write(JSON.parse(readFileSync(process.argv[2], "utf8")).version);
NODE
}

run_source_checks() {
  node "$ROOT/core/scripts/sync-adapters.mjs" --check
  node --test "$ROOT/tests/policy.test.mjs" "$ROOT/tests/adapters.test.mjs"
  claude plugin validate "$ROOT/claude/dg-engineering"
  claude plugin validate "$ROOT/claude/dg-tower"
  agy plugin validate "$ANTIGRAVITY_PLUGIN"
  node --input-type=module - "$ROOT/codex-marketplace/.agents/plugins/marketplace.json" "$ROOT/codex-marketplace/plugins/dg-autonomy/.codex-plugin/plugin.json" <<'NODE'
import { readFileSync } from "node:fs";
for (const path of process.argv.slice(2)) JSON.parse(readFileSync(path, "utf8"));
NODE
  echo "Dynasty autonomy source checks passed"
}

write_ownership() {
  local output="$1"
  local backup_path="$2"
  local backup_hash="$3"
  local installed_hash="$4"
  node --input-type=module - "$output" "$REPO_ROOT" "$CODEX_MARKETPLACE_ROOT" "$ANTIGRAVITY_PLUGIN" "$backup_path" "$backup_hash" "$installed_hash" "$LAUNCHER" "$LAUNCHER_TARGET" <<'NODE'
import { writeFileSync } from "node:fs";
const [output, sourceRoot, marketplacePath, antigravityPath, backupPath, backupHash, installedFlightDeckHash, launcherPath, launcherTarget] = process.argv.slice(2);
const record = {
  schemaVersion: 2,
  layerVersion: "0.2.0",
  sourceRoot,
  activatedHosts: ["claude", "codex", "gemini", "tower"],
  codex: { marketplaceName: "dynasty-autonomy", marketplacePath, plugin: "dg-autonomy" },
  antigravity: { plugin: "dg-autonomy", pluginPath: antigravityPath },
  launcher: { path: launcherPath, target: launcherTarget },
  flightDeck: { backupPath, backupHash, installedHash: installedFlightDeckHash },
  installedAt: new Date().toISOString(),
  rollback: [
    "codex plugin remove dg-autonomy@dynasty-autonomy",
    "codex plugin marketplace remove dynasty-autonomy",
    "agy plugin uninstall dg-autonomy",
    "restore the recorded flight-deck backup"
  ]
};
writeFileSync(output, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600 });
NODE
}

expected_flight_deck_hash() {
  mkdir -p "$STATE_ROOT"
  local expected_path
  expected_path="$(mktemp "$STATE_ROOT/flight-deck.expected.XXXXXX")"
  render_flight_deck "$SOURCE_FLIGHT_DECK" "$expected_path"
  hash_file "$expected_path"
  rm -f "$expected_path"
}

codex_marketplace_present() {
  codex plugin marketplace list 2>/dev/null | grep -Fq "dynasty-autonomy"
}

codex_plugin_present() {
  codex plugin list 2>/dev/null | grep -Fq "dg-autonomy@dynasty-autonomy"
}

codex_plugin_current() {
  local version
  version="$(codex_expected_version)"
  codex plugin list 2>/dev/null | grep -F "dg-autonomy@dynasty-autonomy" | grep -Fq " $version "
}

antigravity_plugin_present() {
  agy plugin list 2>/dev/null | grep -Fq "dg-autonomy"
}

verify_owned_state() {
  if [ ! -f "$OWNERSHIP" ]; then
    echo "BLOCKED: Dynasty autonomy is not active" >&2
    return 2
  fi
  if [ "$(ownership_value sourceRoot)" != "$REPO_ROOT" ]; then
    echo "BLOCKED: ownership belongs to another source root" >&2
    return 2
  fi
  if [ ! -d "$CODEX_MARKETPLACE_ROOT" ] || [ ! -d "$ANTIGRAVITY_PLUGIN" ]; then
    echo "BLOCKED: an owned plugin source is missing" >&2
    return 2
  fi
  if [ ! -f "$LIVE_FLIGHT_DECK" ]; then
    echo "BLOCKED: live flight deck is missing" >&2
    return 2
  fi
  local live_hash
  live_hash="$(hash_file "$LIVE_FLIGHT_DECK")"
  if [ "$live_hash" != "$(ownership_value flightDeck.installedHash)" ] || [ "$live_hash" != "$(expected_flight_deck_hash)" ]; then
    echo "BLOCKED: live flight deck or its source has drifted" >&2
    return 2
  fi
  if [ ! -L "$LAUNCHER" ] || [ "$(readlink "$LAUNCHER")" != "$LAUNCHER_TARGET" ] || [ ! -x "$LAUNCHER_TARGET" ]; then
    echo "BLOCKED: Dynasty CLI launcher is missing or drifted" >&2
    return 2
  fi
  if ! codex_marketplace_present; then
    echo "BLOCKED: Codex marketplace registration is missing" >&2
    return 2
  fi
  if ! codex_plugin_present; then
    echo "BLOCKED: Codex plugin is missing or disabled" >&2
    return 2
  fi
  if ! codex_plugin_current; then
    echo "BLOCKED: Codex plugin version is stale" >&2
    return 2
  fi
  if ! antigravity_plugin_present; then
    echo "BLOCKED: Antigravity plugin registration is missing" >&2
    return 2
  fi
  if [ ! -d "$ANTIGRAVITY_LIVE_ROOT" ] || [ "$(hash_tree "$ANTIGRAVITY_LIVE_ROOT")" != "$(hash_tree "$ANTIGRAVITY_PLUGIN")" ]; then
    echo "BLOCKED: installed Antigravity plugin content is stale or drifted" >&2
    return 2
  fi
}

repair_owned_activation() {
  local recorded_hash
  recorded_hash="$(ownership_value flightDeck.installedHash)"
  if [ ! -f "$LIVE_FLIGHT_DECK" ] || [ "$(hash_file "$LIVE_FLIGHT_DECK")" != "$recorded_hash" ]; then
    echo "BLOCKED: live flight deck changed outside Dynasty ownership; refusing repair" >&2
    return 2
  fi
  if [ -e "$LAUNCHER" ] && { [ ! -L "$LAUNCHER" ] || [ "$(readlink "$LAUNCHER")" != "$LAUNCHER_TARGET" ]; }; then
    echo "BLOCKED: launcher path is occupied by an unowned file" >&2
    return 2
  fi

  local repair_backup="$STATE_ROOT/dynasty_flight_deck.before-repair.sh"
  cp -p "$LIVE_FLIGHT_DECK" "$repair_backup"
  local marketplace_added=0 plugin_added=0 plugin_replaced=0 antigravity_added=0 antigravity_replaced=0 launcher_added=0
  rollback_repair() {
    set +e
    if [ "$antigravity_added" -eq 1 ]; then agy plugin uninstall dg-autonomy >/dev/null 2>&1; fi
    if [ "$plugin_added" -eq 1 ]; then codex plugin remove dg-autonomy@dynasty-autonomy >/dev/null 2>&1; fi
    if [ "$plugin_replaced" -eq 1 ]; then codex plugin add "$CODEX_PLUGIN" >/dev/null 2>&1; fi
    if [ "$marketplace_added" -eq 1 ]; then codex plugin marketplace remove dynasty-autonomy >/dev/null 2>&1; fi
    if [ "$antigravity_replaced" -eq 1 ]; then agy plugin install "$ANTIGRAVITY_PLUGIN" >/dev/null 2>&1; fi
    if [ "$launcher_added" -eq 1 ]; then rm -f "$LAUNCHER"; fi
    cp -p "$repair_backup" "$LIVE_FLIGHT_DECK"
    rm -f "$repair_backup"
    set -e
    echo "BLOCKED: repair failed and owned changes were rolled back" >&2
  }

  local temporary_flight_deck="$STATE_ROOT/dynasty_flight_deck.repairing.sh"
  render_flight_deck "$SOURCE_FLIGHT_DECK" "$temporary_flight_deck"
  chmod +x "$temporary_flight_deck"
  mv "$temporary_flight_deck" "$LIVE_FLIGHT_DECK"
  mkdir -p "$(dirname "$LAUNCHER")"
  if [ ! -L "$LAUNCHER" ]; then
    ln -s "$LAUNCHER_TARGET" "$LAUNCHER"
    launcher_added=1
  fi
  if ! codex_marketplace_present; then
    if ! codex plugin marketplace add "$CODEX_MARKETPLACE_ROOT"; then rollback_repair; return 2; fi
    marketplace_added=1
  fi
  if codex_plugin_present && ! codex_plugin_current; then
    if ! codex plugin remove "$CODEX_PLUGIN"; then rollback_repair; return 2; fi
    plugin_replaced=1
  fi
  if ! codex_plugin_current; then
    if ! codex plugin add "$CODEX_PLUGIN"; then rollback_repair; return 2; fi
    plugin_added=1
  fi
  if antigravity_plugin_present && { [ ! -d "$ANTIGRAVITY_LIVE_ROOT" ] || [ "$(hash_tree "$ANTIGRAVITY_LIVE_ROOT")" != "$(hash_tree "$ANTIGRAVITY_PLUGIN")" ]; }; then
    if ! agy plugin uninstall dg-autonomy; then rollback_repair; return 2; fi
    antigravity_replaced=1
  fi
  if ! antigravity_plugin_present; then
    if ! agy plugin install "$ANTIGRAVITY_PLUGIN"; then rollback_repair; return 2; fi
    antigravity_added=1
  fi

  local backup_path backup_hash installed_hash ownership_tmp
  backup_path="$(ownership_value flightDeck.backupPath)"
  backup_hash="$(ownership_value flightDeck.backupHash)"
  installed_hash="$(hash_file "$LIVE_FLIGHT_DECK")"
  ownership_tmp="$STATE_ROOT/install.json.tmp"
  if ! write_ownership "$ownership_tmp" "$backup_path" "$backup_hash" "$installed_hash" || ! mv "$ownership_tmp" "$OWNERSHIP"; then
    rollback_repair
    return 2
  fi
  rm -f "$repair_backup"
  verify_owned_state
  echo "Dynasty autonomy active state verified and repaired"
}

render_flight_deck() {
  local source="$1"
  local destination="$2"
  node --input-type=module - "$source" "$destination" "$REPO_ROOT" <<'NODE'
import { readFileSync, writeFileSync } from "node:fs";
const [source, destination, sourceRoot] = process.argv.slice(2);
const portable = readFileSync(source, "utf8");
const rendered = portable.replaceAll("$HOME/dg-cockpit", sourceRoot);
writeFileSync(destination, rendered, { mode: 0o700 });
NODE
}

ownership_value() {
  local expression="$1"
  node --input-type=module - "$OWNERSHIP" "$expression" <<'NODE'
import { readFileSync } from "node:fs";
const [path, expression] = process.argv.slice(2);
const record = JSON.parse(readFileSync(path, "utf8"));
let value = record;
for (const key of expression.split(".")) value = value?.[key];
if (value === undefined || value === null) process.exit(2);
process.stdout.write(String(value));
NODE
}

activate() {
  run_source_checks
  if [ -f "$OWNERSHIP" ]; then
    if [ "$(ownership_value sourceRoot)" != "$REPO_ROOT" ]; then
      echo "BLOCKED: existing ownership belongs to another source root" >&2
      exit 2
    fi
    repair_owned_activation
    return
  fi
  if [ ! -f "$LIVE_FLIGHT_DECK" ]; then
    echo "BLOCKED: live flight deck not found at $LIVE_FLIGHT_DECK" >&2
    exit 2
  fi

  mkdir -p "$BACKUP_ROOT"
  if [ -e "$LAUNCHER" ] || [ -L "$LAUNCHER" ]; then
    echo "BLOCKED: launcher path already exists before activation" >&2
    exit 2
  fi
  local backup_path="$BACKUP_ROOT/dynasty_flight_deck.before.sh"
  cp -p "$LIVE_FLIGHT_DECK" "$backup_path"
  local backup_hash
  backup_hash="$(hash_file "$backup_path")"

  local temporary_flight_deck="$STATE_ROOT/dynasty_flight_deck.installing.sh"
  render_flight_deck "$SOURCE_FLIGHT_DECK" "$temporary_flight_deck"
  chmod +x "$temporary_flight_deck"
  mv "$temporary_flight_deck" "$LIVE_FLIGHT_DECK"
  local installed_hash
  installed_hash="$(hash_file "$LIVE_FLIGHT_DECK")"

  mkdir -p "$(dirname "$LAUNCHER")"
  ln -s "$LAUNCHER_TARGET" "$LAUNCHER"
  local launcher_added=1
  local codex_marketplace_added=0
  local codex_plugin_added=0
  local antigravity_added=0
  rollback_partial() {
    set +e
    if [ "$antigravity_added" -eq 1 ]; then agy plugin uninstall dg-autonomy >/dev/null 2>&1; fi
    if [ "$codex_plugin_added" -eq 1 ]; then codex plugin remove dg-autonomy@dynasty-autonomy >/dev/null 2>&1; fi
    if [ "$codex_marketplace_added" -eq 1 ]; then codex plugin marketplace remove dynasty-autonomy >/dev/null 2>&1; fi
    if [ "$launcher_added" -eq 1 ]; then rm -f "$LAUNCHER"; fi
    cp -p "$backup_path" "$LIVE_FLIGHT_DECK"
    set -e
    echo "BLOCKED: activation failed and owned changes were rolled back" >&2
  }

  if ! codex plugin marketplace add "$CODEX_MARKETPLACE_ROOT"; then
    rollback_partial
    return 2
  fi
  codex_marketplace_added=1
  if ! codex plugin add "$CODEX_PLUGIN"; then
    rollback_partial
    return 2
  fi
  codex_plugin_added=1
  if ! agy plugin install "$ANTIGRAVITY_PLUGIN"; then
    rollback_partial
    return 2
  fi
  antigravity_added=1

  local ownership_tmp="$STATE_ROOT/install.json.tmp"
  if ! write_ownership "$ownership_tmp" "$backup_path" "$backup_hash" "$installed_hash"; then
    rollback_partial
    return 2
  fi
  if ! mv "$ownership_tmp" "$OWNERSHIP"; then
    rollback_partial
    return 2
  fi
  verify_owned_state
  echo "Dynasty autonomy activated"
}

status() {
  verify_owned_state
  echo "Dynasty autonomy ownership"
  echo "marketplace: $(ownership_value codex.marketplaceName)"
  echo "Codex plugin: $(ownership_value codex.plugin)"
  echo "Antigravity plugin: $(ownership_value antigravity.plugin)"
  echo "source: $(ownership_value sourceRoot)"
  echo "launcher: $LAUNCHER"
}

uninstall_layer() {
  if [ ! -f "$OWNERSHIP" ]; then
    echo "Dynasty autonomy is not active"
    return
  fi
  if [ "$(ownership_value sourceRoot)" != "$REPO_ROOT" ]; then
    echo "BLOCKED: ownership source does not match this repository" >&2
    exit 2
  fi

  local installed_hash
  installed_hash="$(ownership_value flightDeck.installedHash)"
  if [ ! -f "$LIVE_FLIGHT_DECK" ] || [ "$(hash_file "$LIVE_FLIGHT_DECK")" != "$installed_hash" ]; then
    echo "BLOCKED: live flight deck changed after activation; preserving both versions" >&2
    exit 2
  fi
  local backup_path
  backup_path="$(ownership_value flightDeck.backupPath)"
  local backup_hash
  backup_hash="$(ownership_value flightDeck.backupHash)"
  if [ ! -f "$backup_path" ] || [ "$(hash_file "$backup_path")" != "$backup_hash" ]; then
    echo "BLOCKED: recorded flight-deck backup is missing or changed" >&2
    exit 2
  fi

  if codex_plugin_present; then
    codex plugin remove dg-autonomy@dynasty-autonomy
  fi
  if codex_marketplace_present; then
    codex plugin marketplace remove dynasty-autonomy
  fi
  if antigravity_plugin_present; then
    agy plugin uninstall dg-autonomy
  fi
  cp -p "$backup_path" "$LIVE_FLIGHT_DECK"
  if [ -L "$LAUNCHER" ] && [ "$(readlink "$LAUNCHER")" = "$LAUNCHER_TARGET" ]; then
    rm -f "$LAUNCHER"
  fi

  mkdir -p "$HISTORY_ROOT"
  mv "$OWNERSHIP" "$HISTORY_ROOT/uninstalled-$(date -u '+%Y%m%dT%H%M%SZ').json"
  echo "Dynasty autonomy uninstalled; ownership history preserved"
}

if [ "$#" -ne 1 ]; then usage; fi
case "$1" in
  --check) run_source_checks ;;
  --activate) activate ;;
  --status) status ;;
  --uninstall) uninstall_layer ;;
  *) usage ;;
esac
