import type { TraceDemo, TraceMessage, TraceRunStep, TraceThreadSummary } from "./types";

export const getTrace = (): TraceDemo => window.TRACE_DEMO;

export const getTraceThreads = (): TraceThreadSummary[] =>
  window.TRACE_THREADS?.length
    ? window.TRACE_THREADS
    : [
        {
          id: window.TRACE_DEMO.thread?.id ?? "workspace",
          title: window.TRACE_DEMO.thread?.title ?? window.TRACE_DEMO.prompt,
          graphId: window.TRACE_DEMO.thread?.graphId,
          updatedAt: window.TRACE_DEMO.thread?.updatedAt,
          messageCount: window.TRACE_DEMO.messages.length,
          trace: window.TRACE_DEMO,
        },
      ];

export const prettyJson = (value: unknown): string => {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
};

export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(1, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${totalSeconds} сек`;
  return seconds ? `${minutes} мин ${seconds} сек` : `${minutes} мин`;
};

export const getToolResult = (
  messages: TraceMessage[],
  callId: string,
): TraceMessage | undefined =>
  messages.find((message) => message.role === "tool" && message.toolCallId === callId);

export const getRunSteps = (trace: TraceDemo): TraceRunStep[] =>
  trace.messages
    .filter((message) => message.role === "assistant")
    .map((assistant) => ({
      assistant,
      toolCalls: assistant.toolCalls.map((call) => ({
        ...call,
        result: getToolResult(trace.messages, call.id),
      })),
    }));

export const getToolTitle = (name: string, args: unknown): string => {
  if (name === "python") {
    return "Код-интерпретатор";
  }

  if (name === "search") return "Ищет в сети";
  if (name === "get_urls") return "Читает ссылки";
  if (name === "read_file") return `Прочитал ${getFileName(args) ?? "файл"}`;
  return name;
};

export const getToolMeta = (name: string, args: unknown, result?: string): string => {
  if (name === "search") {
    const queries = getArrayArg(args, "queries");
    return queries.length ? `${queries.length} запросов` : "";
  }

  if (name === "get_urls") {
    const urls = getArrayArg(args, "urls");
    return urls.length ? `${urls.length} ссылок` : "";
  }

  if (name === "read_file") return "";
  if (name === "python") return result?.includes("График построен") ? "# Выполнение кода" : "python";
  return "";
};

const getArrayArg = (args: unknown, key: string): unknown[] => {
  if (!args || typeof args !== "object" || !(key in args)) return [];
  const value = (args as Record<string, unknown>)[key];
  return Array.isArray(value) ? value : [];
};

const getFileName = (args: unknown): string | undefined => {
  if (!args || typeof args !== "object") return undefined;
  const path = (args as Record<string, unknown>).sandbox_path;
  if (typeof path !== "string") return undefined;
  return path.split("/").at(-1);
};
