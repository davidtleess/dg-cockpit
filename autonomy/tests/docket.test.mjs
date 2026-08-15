import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  composeDocket,
  deliverDocket,
  needsDocket,
  readReceipt,
  sweepDockets,
} from "../core/lib/docket.mjs";

// The docket clerk: when a loop-control gate fires ADJUDICATION_REQUIRED, the
// machinery — not any lane, not Tower — carries the case to the judge pane.
// Born from David's question 2026-08-14: "well what if you're not around?"
//
// Laws under test, each learned in production this week:
// 1. Only loop-gate codes (PHASE_ROUND_CAP / RUN_ROUND_CAP /
//    DIMINISHING_RETURNS) reach the bench. Check-failure blocks are David's —
//    the judge can never override verification failures.
// 2. Delivery is proven ONLY by marker-in-transcript. An accepted paste, an
//    empty composer, a clean exit — none of those are proof.
// 3. A marker split across wrapped lines must still verify (TW0814-ADJ-1
//    false-negative).
// 4. An open dialog swallows pastes; delivery must refuse, record a failed
//    receipt, and leave the retry to the sweep.
// 5. The clerk is idempotent: a verified receipt means never deliver twice.

const GATED_RUN = {
  role: "claude",
  goal: "wire scorer",
  worktree: "/worktree",
  terminalState: "BLOCKED",
  reason: "Loop control requires David's decision: PHASE_ROUND_CAP",
  reasonCodes: ["PHASE_ROUND_CAP"],
  updatedAt: "2026-08-14T16:00:00.000Z",
};

const CHECK_FAILURE_RUN = {
  role: "claude",
  goal: "wire scorer",
  worktree: "/worktree",
  terminalState: "BLOCKED",
  reason: "review failed 3 times in green-review",
  reasonCodes: [],
  updatedAt: "2026-08-14T16:00:00.000Z",
};

function fakeTmux({ panes, transcript, dialogOpen = false }) {
  const calls = [];
  return {
    calls,
    exec(args) {
      calls.push(args);
      const command = args[0];
      if (command === "list-panes") return panes;
      if (command === "capture-pane") {
        const tail = dialogOpen ? "Do you want to proceed?\n❯ 1. Yes\n" : "❯ \n";
        return `${transcript()}\n${tail}`;
      }
      return "";
    },
  };
}

test("jurisdiction: loop-gate codes docket, check failures never do", () => {
  assert.equal(needsDocket(GATED_RUN), true);
  assert.equal(needsDocket(CHECK_FAILURE_RUN), false);
  assert.equal(needsDocket({ ...GATED_RUN, terminalState: null, reasonCodes: [] }), false);
});

test("docket text carries the trigger and the record path, never lane content", () => {
  const docket = composeDocket(GATED_RUN, { statePath: "/state/run.json" });
  assert.match(docket.marker, /^ADJ-[0-9a-f]{8}$/);
  assert.match(docket.message, /PHASE_ROUND_CAP/);
  assert.match(docket.message, /\/state\/run\.json/);
  assert.match(docket.message, /machinery-carried/i);
  assert.doesNotMatch(docket.message, /wire scorer/, "the goal is lane framing; it stays out");
  const again = composeDocket(GATED_RUN, { statePath: "/state/run.json" });
  assert.equal(again.marker, docket.marker, "marker is stable for one gate firing");
});

test("delivery verifies by transcript marker and writes a verified receipt", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dg-docket-"));
  const statePath = join(directory, "run.json");
  await writeFile(statePath, JSON.stringify(GATED_RUN));
  let sent = "";
  const tmux = fakeTmux({
    panes: "%7 ⚖ judge\n%2 🗼 tower\n",
    transcript: () => sent,
  });
  const originalExec = tmux.exec;
  tmux.exec = (args) => {
    if (args[0] === "send-keys" && args.includes("-l")) sent += args.at(-1);
    return originalExec(args);
  };

  const result = await deliverDocket({ statePath, run: GATED_RUN, exec: tmux.exec });
  assert.equal(result.status, "delivered");
  assert.equal(result.verified, true);
  const receipt = await readReceipt(statePath);
  assert.equal(receipt.status, "delivered");
  assert.match(receipt.marker, /^ADJ-/);

  const second = await deliverDocket({ statePath, run: GATED_RUN, exec: tmux.exec });
  assert.equal(second.status, "already-delivered", "verified receipt means never send twice");
});

test("a marker split across wrapped lines still verifies", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dg-docket-wrap-"));
  const statePath = join(directory, "run.json");
  await writeFile(statePath, JSON.stringify(GATED_RUN));
  const { marker } = composeDocket(GATED_RUN, { statePath });
  const wrapped = `${marker.slice(0, 5)}\n${marker.slice(5)}`;
  const tmux = fakeTmux({ panes: "%7 ⚖ judge\n", transcript: () => wrapped });
  const result = await deliverDocket({ statePath, run: GATED_RUN, exec: tmux.exec });
  assert.equal(result.verified, true);
});

test("no judge pane or an open dialog fails closed with a retryable receipt", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dg-docket-fail-"));
  const statePath = join(directory, "run.json");
  await writeFile(statePath, JSON.stringify(GATED_RUN));

  const noPane = fakeTmux({ panes: "%2 🗼 tower\n", transcript: () => "" });
  const missing = await deliverDocket({ statePath, run: GATED_RUN, exec: noPane.exec });
  assert.equal(missing.status, "failed");
  assert.match(missing.error, /judge pane/i);

  const dialog = fakeTmux({ panes: "%7 ⚖ judge\n", transcript: () => "", dialogOpen: true });
  const refused = await deliverDocket({ statePath, run: GATED_RUN, exec: dialog.exec });
  assert.equal(refused.status, "failed");
  assert.match(refused.error, /dialog/i);
  assert.equal(
    dialog.calls.some((args) => args[0] === "send-keys"),
    false,
    "an open dialog swallows pastes; nothing may be sent",
  );
  const receipt = await readReceipt(statePath);
  assert.equal(receipt.status, "failed");
  assert.equal(receipt.attempts >= 2, true);
});

test("the sweep retries failed dockets and skips delivered and out-of-jurisdiction runs", async () => {
  const directory = await mkdtemp(join(tmpdir(), "dg-docket-sweep-"));
  const gatedPath = join(directory, "gated.json");
  const failedOncePath = join(directory, "failed.json");
  const davidsPath = join(directory, "davids.json");
  await writeFile(gatedPath, JSON.stringify(GATED_RUN));
  await writeFile(failedOncePath, JSON.stringify(GATED_RUN));
  await writeFile(davidsPath, JSON.stringify(CHECK_FAILURE_RUN));

  let sent = "";
  const tmux = fakeTmux({ panes: "%7 ⚖ judge\n", transcript: () => sent });
  const originalExec = tmux.exec;
  tmux.exec = (args) => {
    if (args[0] === "send-keys" && args.includes("-l")) sent += args.at(-1);
    return originalExec(args);
  };

  const noPane = fakeTmux({ panes: "", transcript: () => "" });
  await deliverDocket({ statePath: failedOncePath, run: GATED_RUN, exec: noPane.exec });

  const results = await sweepDockets([gatedPath, failedOncePath, davidsPath], { exec: tmux.exec });
  const byPath = new Map(results.map((entry) => [entry.statePath, entry]));
  assert.equal(byPath.get(gatedPath).status, "delivered");
  assert.equal(byPath.get(failedOncePath).status, "delivered", "sweep retries failures");
  assert.equal(byPath.get(davidsPath).status, "out-of-jurisdiction");
});
