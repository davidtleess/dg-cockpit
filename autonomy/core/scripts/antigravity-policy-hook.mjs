#!/usr/bin/env node

const BOUNDARY = `DYNASTY AUTONOMY BOUNDARY

Work only inside the authorized repository and scope. Preserve pre-existing changes and use an isolated worktree. You may inspect, plan, edit, test, run real-surface QA, delegate bounded subtasks, review, and clean up. Stop before commit, push, merge, release, publish, destructive work, permission escalation, scope expansion, or external communication. End the run exactly READY_FOR_GATE or BLOCKED. A malformed safety hook or a third failure of the same required verification means BLOCKED.`;

async function readStandardInput() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return chunks.join("");
}

try {
  const raw = await readStandardInput();
  const payload = JSON.parse(raw);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new TypeError("payload must be an object");
  }
  process.stdout.write(
    JSON.stringify({ injectSteps: [{ userMessage: BOUNDARY }] }),
  );
} catch {
  process.stderr.write("Dynasty autonomy hook failed closed\n");
  process.exitCode = 2;
}
