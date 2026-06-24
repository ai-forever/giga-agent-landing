#!/usr/bin/env python3
"""Export LangGraph ops threads using the same text rules as the GigaAgent UI."""

from __future__ import annotations

import argparse
import json
import os
import pickle
import re
import sqlite3
from datetime import date, datetime
from pathlib import Path
from typing import Any


DEFAULT_EMAIL = "codex@openai.com"
DEFAULT_OPS_PATH = Path(".langgraph_ops.pckl")
DEFAULT_DB_PATH = Path("/Users/tggayazov/work/giga_agent/backend/.giga_agent/db/local.db")
DEFAULT_OUT_DIR = Path("parsed_threads")


def uuid_from_db_id(raw: str) -> str:
    if len(raw) == 32 and "-" not in raw:
        return f"{raw[:8]}-{raw[8:12]}-{raw[12:16]}-{raw[16:20]}-{raw[20:]}"
    return raw


def resolve_user_id(db_path: Path, email: str) -> str:
    with sqlite3.connect(db_path) as conn:
        row = conn.execute("select id from core_users where email = ?", (email,)).fetchone()
    if row is None:
        raise SystemExit(f"User not found in {db_path}: {email}")
    return uuid_from_db_id(str(row[0]))


def json_default(value: Any) -> Any:
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Path):
        return str(value)
    if hasattr(value, "hex") and value.__class__.__name__ == "UUID":
        return str(value)
    if callable(value):
        return f"<function {getattr(value, '__name__', 'anonymous')}>"
    try:
        return str(value)
    except Exception:
        return repr(value)


def obj_dict(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    dumped = None
    for name in ("model_dump", "dict"):
        method = getattr(value, name, None)
        if callable(method):
            try:
                dumped = method()
                break
            except Exception:
                pass
    if isinstance(dumped, dict):
        return dumped
    return dict(getattr(value, "__dict__", {}) or {})


def get_attr(value: Any, name: str, default: Any = None) -> Any:
    if isinstance(value, dict):
        return value.get(name, default)
    return getattr(value, name, default)


def message_type(message: Any) -> str:
    value = get_attr(message, "type")
    if value:
        return str(value)
    cls = message.__class__.__name__.lower()
    if "human" in cls:
        return "human"
    if "ai" in cls:
        return "ai"
    if "tool" in cls:
        return "tool"
    return cls


def get_message_text(message: Any) -> str:
    content = get_attr(message, "content", "")
    if isinstance(content, list):
        parts: list[str] = []
        for part in content:
            if isinstance(part, dict) and part.get("type") == "text":
                parts.append(str(part.get("text") or ""))
            elif get_attr(part, "type") == "text":
                parts.append(str(get_attr(part, "text", "") or ""))
        return "\n\n".join(parts)
    return str(content or "")


def get_human_message_text(message: Any) -> str:
    additional = get_attr(message, "additional_kwargs", {}) or {}
    raw = additional.get("user_input") if isinstance(additional, dict) else None
    text = str(raw if raw is not None else get_message_text(message))
    return re.sub(r"\n*\[system:[\s\S]*$", "", text, flags=re.IGNORECASE).rstrip()


def normalize_reasoning_text(text: str) -> str:
    return re.sub(
        r"\n{3,}",
        "\n\n",
        "\n".join(line.rstrip() for line in text.split("\n")),
    ).strip()


def normalize_displayed_markdown(text: str) -> tuple[str, str]:
    md = re.sub(r"(^|\n)(```[^\n]*)", r"\1\n\2", text or "")
    reasoning_parts: list[str] = []

    def strip_closed(match: re.Match[str]) -> str:
        content = match.group(1).strip()
        if content:
            reasoning_parts.append(content)
        return ""

    md = re.sub(r"<thinking>([\s\S]*?)</thinking>\s*", strip_closed, md)
    open_idx = md.find("<thinking>")
    if open_idx != -1 and md.find("</thinking>", open_idx) == -1:
        tail = md[open_idx + len("<thinking>") :].strip()
        if tail:
            reasoning_parts.append(tail)
        md = md[:open_idx]
    return md.strip(), "\n\n".join(reasoning_parts).strip()


def get_think_text(tool_call: dict[str, Any]) -> str:
    args = tool_call.get("args")
    if not isinstance(args, dict):
        return ""
    for key in ("thought", "thoughts"):
        value = args.get(key)
        if isinstance(value, str) and value.strip():
            return value
    return ""


def wrap_files_links_with_angles(markdown: str | None) -> str:
    if not markdown:
        return ""

    attachment_prefix = "attachment:"
    result: list[str] = []
    i = 0
    while i < len(markdown):
        bang = markdown.find("![", i)
        bracket = markdown.find("[", i)
        if bang == -1 and bracket == -1:
            result.append(markdown[i:])
            break
        if bang == -1:
            link_start = bracket
        elif bracket == -1:
            link_start = bang
        else:
            link_start = min(bang, bracket)

        result.append(markdown[i:link_start])
        prefix_start = link_start
        pos = link_start + 1 if markdown[link_start] == "!" else link_start
        if pos >= len(markdown) or markdown[pos] != "[":
            result.append(markdown[link_start])
            i = link_start + 1
            continue
        pos += 1

        depth = 1
        while pos < len(markdown) and depth > 0:
            if markdown[pos] == "[":
                depth += 1
            elif markdown[pos] == "]":
                depth -= 1
            if depth > 0:
                pos += 1
        if depth != 0 or pos >= len(markdown):
            result.append(markdown[link_start])
            i = link_start + 1
            continue
        pos += 1

        if pos >= len(markdown) or markdown[pos] != "(":
            result.append(markdown[link_start:pos])
            i = pos
            continue
        pos += 1

        already_angled = markdown[pos : pos + 1] == "<"
        url_check_start = pos + 1 if already_angled else pos
        if not markdown[url_check_start:].startswith(attachment_prefix):
            result.append(markdown[link_start:pos])
            i = pos
            continue

        if already_angled:
            close = markdown.find(">)", pos)
            if close == -1:
                result.append(markdown[link_start:pos])
                i = pos
                continue
            result.append(markdown[link_start : close + 2])
            i = close + 2
            continue

        paren_depth = 1
        url_end = pos
        while url_end < len(markdown) and paren_depth > 0:
            if markdown[url_end] == "(":
                paren_depth += 1
            elif markdown[url_end] == ")":
                paren_depth -= 1
            if paren_depth > 0:
                url_end += 1
        if paren_depth != 0:
            result.append(markdown[link_start:pos])
            i = pos
            continue

        url = markdown[pos:url_end]
        prefix = markdown[prefix_start:pos]
        if " " in url or "(" in url or ")" in url:
            result.append(f"{prefix}<{url}>)")
        else:
            result.append(f"{prefix}{url})")
        i = url_end + 1

    return "".join(result)


def collect_links(markdown: str) -> list[str]:
    links = set(re.findall(r"(?:attachment|file):<?([^>)\s]+(?: [^>)]+)?)>?", markdown))
    return sorted(link.strip("<>") for link in links if link.strip("<>"))


def parse_message(message: Any) -> dict[str, Any]:
    mtype = message_type(message)
    additional = get_attr(message, "additional_kwargs", {}) or {}
    text = get_human_message_text(message) if mtype == "human" else get_message_text(message)
    normalized, inline_reasoning = normalize_displayed_markdown(text)

    raw_tool_calls = get_attr(message, "tool_calls", []) or []
    tool_calls = [obj_dict(call) for call in raw_tool_calls]
    think_calls = [call for call in tool_calls if call.get("name") == "think"]
    visible_tool_calls = [call for call in tool_calls if call.get("name") != "think"]

    reasoning_parts: list[str] = []
    if isinstance(additional, dict) and additional.get("reasoning_content"):
        reasoning_parts.append(str(additional["reasoning_content"]))
    reasoning_parts.extend(filter(None, (get_think_text(call) for call in think_calls)))
    if inline_reasoning:
        reasoning_parts.append(inline_reasoning)

    markdown = wrap_files_links_with_angles(normalized)
    return {
        "id": get_attr(message, "id"),
        "type": mtype,
        "text": normalized,
        "markdown": markdown,
        "reasoning": normalize_reasoning_text("\n".join(reasoning_parts)),
        "tool_calls": visible_tool_calls,
        "think_tool_calls": think_calls,
        "tool_call_id": get_attr(message, "tool_call_id"),
        "name": get_attr(message, "name"),
        "attachments": collect_links(markdown),
        "additional_kwargs": additional,
        "response_metadata": get_attr(message, "response_metadata", {}) or {},
    }


def load_ops(path: Path) -> dict[str, Any]:
    os.environ.setdefault("DATABASE_URI", "sqlite:///dummy")
    os.environ.setdefault("REDIS_URI", "redis://localhost:6379")
    with path.open("rb") as fh:
        return pickle.load(fh)


def parse_threads(ops: dict[str, Any], user_id: str, email: str) -> list[dict[str, Any]]:
    parsed: list[dict[str, Any]] = []
    for thread in ops.get("threads", []):
        metadata = thread.get("metadata") or {}
        if metadata.get("user_id") != user_id:
            continue
        values = thread.get("values") or {}
        messages = values.get("messages") or []
        parsed.append(
            {
                "thread_id": str(thread.get("thread_id")),
                "user_email": email,
                "user_id": user_id,
                "title": metadata.get("thread_title"),
                "graph_id": metadata.get("graph_id"),
                "assistant_id": metadata.get("assistant_id"),
                "status": thread.get("status"),
                "created_at": thread.get("created_at"),
                "updated_at": thread.get("updated_at"),
                "message_count": len(messages),
                "metadata": metadata,
                "messages": [parse_message(message) for message in messages],
            }
        )
    parsed.sort(key=lambda item: str(item.get("updated_at") or ""), reverse=True)
    return parsed


def write_markdown(threads: list[dict[str, Any]], out_path: Path) -> None:
    lines = ["# Parsed GigaAgent Threads", ""]
    for thread in threads:
        title = thread.get("title") or "(untitled)"
        lines.extend(
            [
                f"## {title}",
                "",
                f"- thread_id: `{thread['thread_id']}`",
                f"- graph_id: `{thread.get('graph_id')}`",
                f"- updated_at: `{json_default(thread.get('updated_at'))}`",
                f"- messages: `{thread.get('message_count')}`",
                "",
            ]
        )
        for message in thread["messages"]:
            label = str(message.get("type") or "message").upper()
            msg_id = message.get("id")
            lines.append(f"### {label}" + (f" `{msg_id}`" if msg_id else ""))
            if message.get("reasoning"):
                lines.extend(["", "<details><summary>Reasoning</summary>", "", message["reasoning"], "", "</details>"])
            if message.get("markdown"):
                lines.extend(["", message["markdown"]])
            if message.get("tool_calls"):
                lines.extend(["", "Tool calls:", ""])
                for call in message["tool_calls"]:
                    lines.append(f"- `{call.get('name')}` `{call.get('id')}`")
            if message.get("attachments"):
                lines.extend(["", "Attachments:", ""])
                for attachment in message["attachments"]:
                    lines.append(f"- `{attachment}`")
            lines.append("")
    out_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", default=DEFAULT_EMAIL)
    parser.add_argument("--ops", type=Path, default=DEFAULT_OPS_PATH)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB_PATH)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT_DIR)
    args = parser.parse_args()

    user_id = resolve_user_id(args.db, args.email)
    ops = load_ops(args.ops)
    threads = parse_threads(ops, user_id, args.email)

    args.out_dir.mkdir(parents=True, exist_ok=True)
    json_path = args.out_dir / "codex_threads.json"
    md_path = args.out_dir / "codex_threads.md"
    json_path.write_text(
        json.dumps(threads, ensure_ascii=False, indent=2, default=json_default),
        encoding="utf-8",
    )
    write_markdown(threads, md_path)
    print(f"Resolved {args.email} -> {user_id}")
    print(f"Exported {len(threads)} threads")
    print(json_path)
    print(md_path)


if __name__ == "__main__":
    main()
