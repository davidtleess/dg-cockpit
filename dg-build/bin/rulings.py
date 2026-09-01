#!/usr/bin/env python3
"""Every ruling David gave today, across every lane, in one chronological list.

Why this exists: David runs four AI lanes at once. He makes a decision in ONE
lane's session and the other three cannot see it — so they ask him again, or
they discover an apparent contradiction and ask him to adjudicate between two
lanes' accounts of his own words. He is both the bottleneck and the only
propagation channel, and a recommendation relayed between lanes has already
acquired his authority by the third hop.

The fix is not discipline, it is a lookup. Every ruling ALREADY exists on disk:
an AskUserQuestion answer is written into the transcript as a tool result, and
his typed messages are there verbatim. Nothing ever read them back.

Read-only. Touches no session state.
"""

from __future__ import annotations

import glob
import json
import os
import re
import sqlite3
import sys
from datetime import datetime, timezone

PROJ = os.path.expanduser("~/.claude/projects/-Users-davidleess")
CODEX_DB = os.path.expanduser("~/.codex/thread_history_1.sqlite")

# Lane name -> session id. Names are David's; handles are the bus addresses.
LANES = {
    "Bob  [davidleess-a0]": "4fc1a3c2-f5d3-43ff-91aa-2d474cab86ad",
    "Fred [davidleess-4d]": "bf2ad4c4-aeaf-4a13-8257-32ff57d1c02c",
    "Greg [davidleess-0b]": "daab5375-6c9f-478d-8739-b758480b06a7",
}

ANSWERED = re.compile(r"Your questions have been answered:\s*(.+?)(?:\.\s*You can now continue|$)", re.S)
QA_PAIR = re.compile(r'"([^"]{4,400}?)"\s*=\s*"([^"]{1,300}?)"')


def _kind(s: str) -> str:
    """TYPED vs QUOTED. Both are things David entered, but only one is his instruction.

    Measured 2026-08-31: at 08:05:54 he PASTED a lane's own AskUserQuestion prompt --
    question plus numbered options -- into a different lane, then typed "that's what bob
    asked". That paste is genuinely his input and must not be dropped, but listing it
    beside his rulings invites a reader to attribute the OPTIONS to him. A true claim
    wearing a false attribution is the dangerous object; today that exact confusion cost
    three lanes twenty minutes.
    """
    if "\n  1. " in s and "\n  2. " in s:
        return "QUOTED"
    return "TYPED"


def _local(ts: str) -> str:
    """Transcript stamps are UTC; David lives in ET."""
    try:
        dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        return dt.astimezone().strftime("%H:%M:%S")
    except Exception:
        return (ts or "")[11:19]


def _text_of(block) -> str:
    if isinstance(block, str):
        return block
    if isinstance(block, list):
        out = []
        for b in block:
            if isinstance(b, dict) and b.get("type") == "text":
                out.append(b.get("text", ""))
            elif isinstance(b, str):
                out.append(b)
        return "\n".join(out)
    return ""


def from_claude(lane: str, sid: str) -> list[tuple]:
    path = os.path.join(PROJ, f"{sid}.jsonl")
    if not os.path.exists(path):
        return []
    rows: list[tuple] = []
    # tool_use_id -> tool name. A tool_result only counts as a ruling when its
    # matching CALL was AskUserQuestion. Without this, any Bash output that
    # happens to quote an answer payload — e.g. a lane reading another lane's
    # transcript, which is exactly what this file exists to make routine —
    # is harvested as a fresh ruling. The measurement layer must not inherit
    # the defect it measures.
    asked: set[str] = set()
    # Content already emitted as TYPED, so a message that appears BOTH as a queued
    # enqueue and later as a delivered user record is counted once.
    seen_typed: set[str] = set()
    for line in open(path, encoding="utf-8", errors="replace"):
        try:
            d = json.loads(line)
        except Exception:
            continue
        if d.get("type") == "assistant":
            for b in (d.get("message") or {}).get("content") or []:
                if isinstance(b, dict) and b.get("type") == "tool_use" and b.get("name") == "AskUserQuestion":
                    asked.add(b.get("id"))
            continue
        # 0. Words David typed MID-TURN. When he types while a lane is working, the
        # message is absorbed into the running turn ("reason": "absorbed_mid_turn") and
        # NEVER becomes a standalone user record -- so a scan of user-type messages is
        # blind to it. Measured 2026-08-31: 17 of David's direct messages that day were
        # invisible this way, including all three lane NAMES, the competition-is-not-naive
        # ruling, and the "which stands?" message that set off the morning's retraction
        # cascade. A provenance tool that cannot see them will report a real ruling as
        # unsourced, which is worse than not looking.
        if d.get("type") == "queue-operation":
            if d.get("operation") != "enqueue":
                continue
            raw = d.get("content")
            if not isinstance(raw, str):
                continue
            s = raw.strip()
            if not s or s.startswith("<"):
                continue
            key = s.replace("\n", " ")[:400]
            if key in seen_typed:
                continue
            seen_typed.add(key)
            rows.append((_local(d.get("timestamp") or ""), lane, _kind(s), key))
            continue

        if d.get("type") != "user":
            continue
        ts = _local(d.get("timestamp") or "")
        content = (d.get("message") or {}).get("content")

        # 1. Words David typed himself.
        if isinstance(content, str):
            s = content.strip()
            if s and not s.startswith("<") and "cross-session-message" not in s:
                key = s.replace("\n", " ")[:400]
                if key not in seen_typed:
                    seen_typed.add(key)
                    rows.append((ts, lane, "TYPED", key))
            continue

        # 2. AskUserQuestion answers — the option he SELECTED is the ruling.
        if isinstance(content, list):
            for b in content:
                if not isinstance(b, dict) or b.get("type") != "tool_result":
                    continue
                if b.get("tool_use_id") not in asked:
                    continue  # not an answer to a question — see note above
                body = _text_of(b.get("content"))
                m = ANSWERED.search(body or "")
                if not m:
                    continue
                for q, a in QA_PAIR.findall(m.group(1)):
                    rows.append((ts, lane, "CHOSE", f"{a}   ←  {q}"))
    return rows


def from_codex() -> list[tuple]:
    if not os.path.exists(CODEX_DB):
        return []
    rows: list[tuple] = []
    try:
        con = sqlite3.connect(f"file:{CODEX_DB}?mode=ro", uri=True)
        today = datetime.now().strftime("%Y-%m-%d")
        cur = con.execute(
            "SELECT created_at_ms, item_json FROM thread_items "
            "WHERE item_type='userMessage' ORDER BY created_at_ms"
        )
        for ms, raw in cur:
            stamp = datetime.fromtimestamp(ms / 1000)
            if stamp.strftime("%Y-%m-%d") != today:
                continue
            try:
                d = json.loads(raw)
            except Exception:
                continue
            txt = d.get("text") or ""
            if not txt:
                for c in d.get("content") or []:
                    if isinstance(c, dict) and c.get("text"):
                        txt += c["text"]
            txt = (txt or "").strip()
            if txt:
                rows.append((stamp.strftime("%H:%M:%S"), "Lou  [Codex · no bus]", "TYPED",
                             txt.replace("\n", " ")[:400]))
        con.close()
    except Exception as exc:  # never let Lou's store break the whole record
        rows.append(("--:--:--", "Lou  [Codex · no bus]", "ERROR", f"could not read: {exc}"))
    return rows


def main() -> int:
    rows: list[tuple] = []
    for lane, sid in LANES.items():
        rows.extend(from_claude(lane, sid))
    rows.extend(from_codex())
    rows.sort(key=lambda r: r[0])

    print(f"# David's rulings — {datetime.now().strftime('%Y-%m-%d')}, all lanes, chronological")
    print()
    print("CHOSE = an option he selected in a question (his ruling, verbatim from the answer payload).")
    print("TYPED = words he typed himself.")
    print("❝ QUOTED = text he PASTED in (e.g. another lane's question). His input, NOT his")
    print("  instruction — do not attribute the pasted words or options to him.")
    print("Read this BEFORE asking him something, and before treating any lane's account of his")
    print("word as authority. A relay is not a source; this file is.")
    print()
    for ts, lane, kind, text in rows:
        if kind == "CHOSE":
            print(f"{ts}  {lane:26} ★ {text}")
        elif kind == "ERROR":
            print(f"{ts}  {lane:26} !! {text}")
        elif kind == "QUOTED":
            print(f"{ts}  {lane:26} ❝ {text}")
        else:
            print(f"{ts}  {lane:26}   {text}")
    print()
    print(f"({len(rows)} entries · {sum(1 for r in rows if r[2] == 'CHOSE')} explicit rulings)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
