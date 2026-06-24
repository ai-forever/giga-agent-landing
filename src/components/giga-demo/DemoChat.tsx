import { ChevronDown, Files, Folder, FolderPlus, MoreHorizontal, User } from "lucide-react";
import { useMemo, useState } from "react";
import { AgentRun } from "./AgentRun";
import { InputArea } from "./InputArea";
import type { TraceThreadSummary } from "./types";

interface DemoChatProps {
  threads: TraceThreadSummary[];
}

export function DemoChat({ threads }: DemoChatProps) {
  const [playbackKey, setPlaybackKey] = useState(0);
  const visibleThreads = useMemo(
    () => threads.filter((thread) => thread.messageCount > 0),
    [threads],
  );
  const projectThreadTitles = useMemo(
    () => new Set(["Дайджест новостей ИИ-агентов", "Ключевая ставка и депозиты за 24 месяца"]),
    [],
  );
  const projectThreads = useMemo(
    () => visibleThreads.filter((thread) => projectThreadTitles.has(thread.title)),
    [projectThreadTitles, visibleThreads],
  );
  const chatThreads = useMemo(
    () => visibleThreads.filter((thread) => !projectThreadTitles.has(thread.title)),
    [projectThreadTitles, visibleThreads],
  );
  const [selectedId, setSelectedId] = useState(() => visibleThreads[0]?.id ?? threads[0]?.id);
  const selectedThread =
    threads.find((thread) => thread.id === selectedId) ?? visibleThreads[0] ?? threads[0];
  const trace = selectedThread.trace;

  const selectThread = (threadId: string) => {
    setSelectedId(threadId);
    setPlaybackKey((value) => value + 1);
  };

  return (
    <div className="ga-window" aria-label="Интерактивный пример интерфейса GigaAgent">
      <aside className="ga-sidebar">
        <div className="ga-new-chat">
          <img className="sidebar-logo" src="assets/gigachain_logo.svg" alt="" aria-hidden="true" />
          <span>Новый чат</span>
        </div>
        <div className="ga-sidebar-splitter" aria-hidden="true" />
        <div className="ga-sidebar-section">
          <span className="ga-sidebar-link">
            <Files size={14} />
            Документы
          </span>
          <div className="ga-sidebar-divider" aria-hidden="true" />
          <span className="ga-sidebar-heading ga-sidebar-link-projects">
            ПРОЕКТЫ
            <FolderPlus size={14} />
          </span>
          <span className="ga-project-row">
            <ChevronDown size={13} />
            <Folder size={14} />
            workspace
          </span>
          {projectThreads.map((thread) => (
            <button
              className={`ga-project-thread${thread.id === selectedThread.id ? " is-active" : ""}`}
              type="button"
              key={thread.id}
              onClick={() => selectThread(thread.id)}
              title={thread.title}
            >
              {thread.title}
            </button>
          ))}
          <div className="ga-sidebar-divider" aria-hidden="true" />
          <span className="ga-sidebar-heading ga-sidebar-link-plain">
            ЧАТЫ
            <MoreHorizontal size={15} />
          </span>
          {chatThreads.map((thread) => (
            <button
              className={`ga-chat-row${thread.id === selectedThread.id ? " is-active" : ""}`}
              type="button"
              key={thread.id}
              onClick={() => selectThread(thread.id)}
              title={thread.title}
            >
              {thread.title}
            </button>
          ))}
        </div>
        <div className="ga-sidebar-account">
          <span className="ga-account-avatar" aria-hidden="true">
            <User size={16} />
          </span>
          <span>codex@openai.com</span>
        </div>
      </aside>

      <div className="ga-chat">
        <div className="ga-message-stream" aria-live="polite">
          <article className="ga-user-message">
            <p>{trace.prompt}</p>
          </article>
          <article className="ga-assistant-message">
            <AgentRun key={playbackKey} trace={trace} playbackKey={playbackKey} />
          </article>
        </div>
        <InputArea />
      </div>
    </div>
  );
}
