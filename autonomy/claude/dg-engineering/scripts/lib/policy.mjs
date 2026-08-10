import { existsSync, realpathSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, relative, resolve } from "node:path";

const contractUrl = new URL("../contract.json", import.meta.url);

export async function loadContract() {
  return JSON.parse(await readFile(contractUrl, "utf8"));
}

function tokenize(command) {
  const segments = [[]];
  let word = "";
  let quote = null;
  let escaped = false;

  const flushWord = () => {
    if (word !== "") segments.at(-1).push(word);
    word = "";
  };
  const flushSegment = () => {
    flushWord();
    if (segments.at(-1).length > 0) segments.push([]);
  };

  for (let index = 0; index < command.length; index += 1) {
    const character = command[index];
    if (escaped) {
      word += character;
      escaped = false;
      continue;
    }
    if (character === "\\" && quote !== "'") {
      escaped = true;
      continue;
    }
    if (quote) {
      if (character === quote) quote = null;
      else word += character;
      continue;
    }
    if (character === "'" || character === '"') {
      quote = character;
      continue;
    }
    if (character === ";" || character === "|" || character === "&" || character === "\n") {
      flushSegment();
      while (command[index + 1] === character) index += 1;
      continue;
    }
    if (character === ">" || character === "<") {
      flushWord();
      let operator = character;
      if (command[index + 1] === character) {
        operator += character;
        index += 1;
      }
      segments.at(-1).push(operator);
      continue;
    }
    if (/\s/.test(character)) {
      flushWord();
      continue;
    }
    word += character;
  }
  if (escaped || quote) return null;
  flushWord();
  return segments.filter((segment) => segment.length > 0);
}

function commandName(value = "") {
  return value.split("/").at(-1);
}

function unwrap(segment) {
  let tokens = [...segment];
  let changed = true;
  while (changed && tokens.length > 0) {
    changed = false;
    const name = commandName(tokens[0]);
    if (name === "env") {
      let index = 1;
      while (index < tokens.length) {
        if (["-u", "--unset", "-C", "--chdir"].includes(tokens[index])) index += 2;
        else if (tokens[index].startsWith("-")) index += 1;
        else if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[index])) index += 1;
        else break;
      }
      tokens = tokens.slice(index);
      changed = true;
    } else if (["command", "builtin", "nohup", "time"].includes(name)) {
      let index = 1;
      while (tokens[index]?.startsWith("-")) index += 1;
      tokens = tokens.slice(index);
      changed = true;
    }
  }
  return tokens;
}

function gitSubcommand(tokens) {
  const optionsWithValues = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path"]);
  for (let index = 1; index < tokens.length; index += 1) {
    const token = tokens[index];
    const optionName = token.split("=")[0];
    if (optionsWithValues.has(optionName) && !token.includes("=")) {
      index += 1;
      continue;
    }
    if (token.startsWith("-")) continue;
    return token;
  }
  return null;
}

function classifySegment(originalTokens) {
  const tokens = unwrap(originalTokens);
  const name = commandName(tokens[0]);
  if (!name) return "inspect";

  if (["sudo", "doas", "su", "pkexec"].includes(name)) return "permission-escalation";
  if (["rm", "rmdir", "shred", "unlink"].includes(name)) return "destructive";
  if (["eval", "xargs", "parallel"].includes(name)) return "unreviewable-command";
  if (name === "find" && tokens.some((token) => ["-delete", "-exec", "-execdir", "-ok", "-okdir"].includes(token))) {
    return "destructive";
  }
  if (["curl", "wget", "ssh", "scp", "sftp", "ftp", "telnet", "nc", "ncat", "mail", "sendmail"].includes(name)) {
    return "external-communication";
  }

  if (["bash", "sh", "zsh", "dash", "ksh", "fish"].includes(name)) {
    const flagIndex = tokens.findIndex((token, index) => index > 0 && /^-[^-]*c/.test(token));
    if (flagIndex >= 0 && tokens[flagIndex + 1]) return classifyCommand(tokens[flagIndex + 1]);
  }
  if (["npx", "bunx"].includes(name)) return classifySegment(tokens.slice(1));
  if (["npm", "pnpm", "yarn"].includes(name) && ["exec", "dlx"].includes(tokens[1])) {
    let index = 2;
    while (tokens[index]?.startsWith("-")) index += 1;
    return classifySegment(tokens.slice(index));
  }
  if (["python", "python3", "node", "ruby", "perl", "php"].includes(name)) {
    const codeIndex = tokens.findIndex((token, index) => index > 0 && ["-c", "-e", "--eval"].includes(token));
    if (codeIndex >= 0) {
      const code = tokens[codeIndex + 1] ?? "";
      if (/\b(?:rmtree|remove|unlink|rmdir|truncate|DROP\s+(?:DATABASE|SCHEMA|TABLE)|DELETE\s+FROM)\b/i.test(code)) {
        return "destructive";
      }
      if (/\b(?:requests\.|urlopen|fetch\s*\(|https?\.|socket\.|net\.|child_process|subprocess|system\s*\(|exec\s*\()/i.test(code)) {
        return "unreviewable-command";
      }
      return "unreviewable-command";
    }
  }

  if (name === "git") {
    if (tokens.some((token, index) => index > 0 && /^alias\./.test(token))) return "unreviewable-command";
    const subcommand = gitSubcommand(tokens);
    if (["commit"].includes(subcommand)) return "commit";
    if (["push"].includes(subcommand)) return "push";
    if (["merge", "rebase"].includes(subcommand)) return "merge";
    if (["tag"].includes(subcommand)) return "release";
    if (["clean", "reset", "restore"].includes(subcommand)) return "destructive";
  }
  if (name === "gh") {
    const operation = tokens.slice(1).join(" ");
    if (/^release\s/.test(operation)) return "release";
    if (/^(?:pr|issue)\s+(?:create|comment|edit|close|reopen|review|merge)\b/.test(operation) || /^api\b.*(?:--method|-X)\s*(?:POST|PUT|PATCH|DELETE)\b/i.test(operation)) {
      return "external-communication";
    }
  }
  if ((["npm", "pnpm", "yarn"].includes(name) && tokens.includes("publish")) || (name === "docker" && tokens[1] === "push")) {
    return "publish";
  }
  if (["npm", "pnpm", "yarn"].includes(name) && tokens.some((token) => token === "-g" || token === "--global")) {
    return "permission-escalation";
  }
  if (/\b(?:DROP|TRUNCATE)\s+(?:DATABASE|SCHEMA|TABLE)\b/i.test(tokens.join(" ")) || /\bDELETE\s+FROM\b/i.test(tokens.join(" "))) {
    return "destructive";
  }
  if (["npm", "pnpm", "yarn"].includes(name) && (tokens[1] === "test" || (tokens[1] === "run" && tokens[2] === "test"))) return "test";
  if (["npm", "pnpm", "yarn"].includes(name) && tokens[1] === "run" && !/^(?:test|lint|build|check|typecheck|verify)(?::|$)/.test(tokens[2] ?? "")) return "unreviewable-command";
  if (name === "make" && /^(?:deploy|publish|release|commit|push|install)$/i.test(tokens[1] ?? "")) return "unreviewable-command";
  if ((name === "node" && tokens[1] === "--test") || ["pytest", "cargo", "go"].includes(name) && tokens[1] === "test") return "test";
  return "inspect";
}

export function classifyCommand(command) {
  if (typeof command !== "string" || command.trim() === "") return "unreviewable-command";
  if (command.includes("$ (") || command.includes("`") || /(?:^|[;&|]\s*)[({]/.test(command)) return "unreviewable-command";
  if (/\$\s*\(/.test(command)) return "unreviewable-command";
  const segments = tokenize(command.trim());
  if (!segments) return "unreviewable-command";
  const actions = segments.map(classifySegment);
  const priority = [
    "permission-escalation", "destructive", "commit", "push", "merge",
    "release", "publish", "external-communication", "unreviewable-command",
  ];
  return priority.find((action) => actions.includes(action)) ??
    (actions.includes("test") ? "test" : "inspect");
}

export function isPathWithinScope(root, candidate) {
  const canonicalize = (path) => {
    let existing = resolve(path);
    const suffix = [];
    while (!existsSync(existing)) {
      const parent = dirname(existing);
      if (parent === existing) break;
      suffix.unshift(basename(existing));
      existing = parent;
    }
    const canonical = existsSync(existing) ? realpathSync(existing) : existing;
    return resolve(canonical, ...suffix);
  };
  const relation = relative(canonicalize(root), canonicalize(candidate));
  return relation === "" || (!relation.startsWith("..") && !isAbsolute(relation));
}

export function findScopeViolation(command, { cwd, authorizedRoot } = {}) {
  if (!cwd || !authorizedRoot || !isPathWithinScope(authorizedRoot, cwd)) return cwd ?? "missing command cwd";
  const segments = tokenize(command);
  if (!segments) return "unparseable shell command";
  for (const original of segments) {
    const tokens = unwrap(original);
    const name = commandName(tokens[0]);
    const targets = [];
    for (let index = 0; index < tokens.length - 1; index += 1) {
      if ([">", ">>"].includes(tokens[index])) targets.push(tokens[index + 1]);
    }
    if (name === "cd" && tokens[1]) targets.push(tokens[1]);
    if (name === "git") {
      for (let index = 1; index < tokens.length; index += 1) {
        if (["-C", "--work-tree", "--git-dir"].includes(tokens[index]) && tokens[index + 1]) targets.push(tokens[index + 1]);
        if (tokens[index].startsWith("-C") && tokens[index].length > 2) targets.push(tokens[index].slice(2));
        if (tokens[index].startsWith("--work-tree=")) targets.push(tokens[index].slice(12));
      }
    }
    if (["touch", "mkdir", "mkfifo", "truncate"].includes(name)) {
      targets.push(...tokens.slice(1).filter((token) => !token.startsWith("-")));
    }
    if (["cp", "mv", "install"].includes(name) && tokens.length > 2) targets.push(tokens.at(-1));
    if (name === "tee") targets.push(...tokens.slice(1).filter((token) => !token.startsWith("-")));
    for (const target of targets) {
      const resolvedTarget = resolve(cwd, target);
      if (!isPathWithinScope(authorizedRoot, resolvedTarget)) return resolvedTarget;
    }
  }
  return null;
}

function blocked(reason) {
  return { allowed: false, state: "BLOCKED", reason };
}

export async function evaluateAction({
  role,
  action,
  hookStatus = "ok",
  failureCount = 0,
  scopeExpanded = false,
} = {}) {
  const contract = await loadContract();
  const knownRoles = new Set([...contract.engineeringRoles, "tower", "studio"]);

  if (!knownRoles.has(role)) return blocked(`Unknown or missing Dynasty role: ${role ?? "none"}`);
  if (hookStatus !== "ok") return blocked(`Safety hook did not return ok: ${hookStatus}`);
  if (scopeExpanded || action === "scope-expansion") return blocked("Requested action expands the authorized scope");
  if (!Number.isFinite(failureCount) || failureCount >= contract.failureLimit) return blocked(`Verification reached the failure limit of ${contract.failureLimit}`);
  if (role === "studio") return blocked("Studio has no Dynasty engineering adapter");
  if (role === "tower") {
    return contract.tower.actions.includes(action)
      ? { allowed: true, state: null, reason: null }
      : blocked("Tower is limited to product-health verification");
  }
  if (contract.hardGates.includes(action)) return blocked(`Action requires a human gate: ${action}`);
  if (contract.engineeringActions.includes(action)) return { allowed: true, state: null, reason: null };
  return blocked(`Action is not in the engineering allowlist: ${action ?? "none"}`);
}
