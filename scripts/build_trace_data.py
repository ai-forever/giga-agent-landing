#!/usr/bin/env python3
"""Build the browser workspace trace file from parsed LangGraph threads."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


THREADS_PATH = Path("parsed_threads/codex_threads.json")
OUT_PATHS = [Path("public/trace-data.js"), Path("dist/trace-data.js")]
MAX_INLINE_MARKDOWN_CHARS = 30_000
WORKSPACE_THREAD_TITLES = {
    "Дайджест новостей ИИ-агентов",
    "Ключевая ставка и депозиты за 24 месяца",
}


def clean_prompt(text: str) -> str:
    text = re.sub(r"<user_info>[\s\S]*?</user_info>", "", text or "").strip()
    user_query = re.search(r"<user_query>([\s\S]*?)(?:</user_query>|<user_query>|$)", text)
    if user_query:
        return user_query.group(1).strip()
    return text


def role_from_type(message_type: str) -> str:
    if message_type == "human":
        return "user"
    if message_type == "tool":
        return "tool"
    return "assistant"


def tool_call_arguments(call: dict[str, Any]) -> Any:
    return call.get("args") if "args" in call else call.get("arguments")


def infer_file_type(path: str) -> str:
    suffix = Path(path).suffix.lower()
    if suffix in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}:
        return "image"
    if suffix == ".json" and ".plotly" in Path(path).name:
        return "plotly_graph"
    if suffix in {".md", ".txt", ".csv", ".json"}:
        return "text"
    return "file"


def attachment_from_path(path: str) -> dict[str, Any]:
    name = Path(path).name or "attachment"
    attachment: dict[str, Any] = {
        "sandbox_path": path,
        "original_name": name,
        "file_type": infer_file_type(path),
        "id": path,
    }
    if path.endswith("key-rate-deposits-plot.png"):
        attachment["preview_path"] = "/key-rate-deposits-plot.png"
    return attachment


def normalize_demo_content(content: str, thread: dict[str, Any]) -> str:
    if thread.get("thread_id") != "019ef007-8b91-7661-b29c-b2610560b9c9":
        return content
    return re.sub(
        r"!\[([^\]]*)]\(attachment:[^)]+\.plotly\.json\)",
        r"![\1](/key-rate-deposits-plot.png)",
        content,
    )


def inline_markdown_attachment(content: str, attachment_paths: list[Any]) -> str:
    markdown_paths = [
        str(path)
        for path in attachment_paths
        if isinstance(path, str) and Path(path).suffix.lower() in {".md", ".markdown"}
    ]
    if not markdown_paths:
        return content

    stripped = content.strip()
    attachment_only = re.fullmatch(
        r"!?\[[^\]]*]\(<?(?:attachment:|file:)?[^)]+\.m(?:ark)?d>?\)",
        stripped,
        flags=re.IGNORECASE,
    )
    if not attachment_only:
        return content

    path = Path(markdown_paths[0])
    if not path.exists() or not path.is_file():
        return content

    text = path.read_text(encoding="utf-8", errors="replace").strip()
    if len(text) > MAX_INLINE_MARKDOWN_CHARS:
        text = text[:MAX_INLINE_MARKDOWN_CHARS].rstrip() + "\n\n…"
    return text


def convert_message(message: dict[str, Any], index: int, thread: dict[str, Any]) -> dict[str, Any]:
    attachments = message.get("attachments") or []
    content = message.get("markdown") or message.get("text") or ""
    content = inline_markdown_attachment(content, attachments)
    content = normalize_demo_content(content, thread)
    return {
        "index": index,
        "role": role_from_type(message.get("type", "")),
        "content": content,
        "reasoning": message.get("reasoning") or "",
        "toolCallId": message.get("tool_call_id") or "",
        "toolCalls": [
            {
                "id": str(call.get("id") or f"tool-{index}-{call_index}"),
                "name": str(call.get("name") or "tool"),
                "arguments": tool_call_arguments(call),
            }
            for call_index, call in enumerate(message.get("tool_calls") or [])
        ],
        "attachments": [
            attachment_from_path(path)
            for path in attachments
            if isinstance(path, str)
        ],
    }


def build_trace(thread: dict[str, Any]) -> dict[str, Any]:
    messages = [
        convert_message(message, index + 1, thread)
        for index, message in enumerate(thread.get("messages") or [])
    ]
    first_user = next((message for message in messages if message["role"] == "user"), None)
    title = thread.get("title") or "Новый чат"
    return {
        "source": "parsed_threads/codex_threads.json",
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "thread": {
            "id": thread["thread_id"],
            "title": title,
            "graphId": thread.get("graph_id"),
            "updatedAt": thread.get("updated_at"),
            "messageCount": thread.get("message_count", len(messages)),
        },
        "model": "GigaAgent",
        "prompt": clean_prompt(first_user["content"] if first_user else title),
        "elapsed": "из истории",
        "messages": messages,
        "missing": [],
    }


def main() -> None:
    threads = json.loads(THREADS_PATH.read_text(encoding="utf-8"))
    traces = []
    for thread in threads:
        if thread.get("title") not in WORKSPACE_THREAD_TITLES:
            continue
        trace = build_trace(thread)
        traces.append(
            {
                "id": thread["thread_id"],
                "title": thread.get("title") or "Новый чат",
                "graphId": thread.get("graph_id"),
                "updatedAt": thread.get("updated_at"),
                "messageCount": thread.get("message_count", 0),
                "trace": trace,
            }
        )

    active = next((thread for thread in traces if thread["messageCount"] > 0), traces[0])
    payload = "window.TRACE_THREADS = "
    payload += json.dumps(traces, ensure_ascii=False, indent=2)
    payload += ";\nwindow.TRACE_DEMO = window.TRACE_THREADS[0].trace;\n"
    payload += f"window.TRACE_DEMO = {json.dumps(active['trace'], ensure_ascii=False, indent=2)};\n"

    for out_path in OUT_PATHS:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(payload, encoding="utf-8")
        print(out_path)
    print(f"threads: {len(traces)}")
    print(f"active: {active['title']}")


if __name__ == "__main__":
    main()
