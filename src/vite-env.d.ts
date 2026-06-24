/// <reference types="vite/client" />

type TraceRole = "user" | "assistant" | "tool";

interface TraceToolCall {
  id: string;
  name: string;
  arguments: unknown;
}

interface TraceMessage {
  index: number;
  role: TraceRole;
  content: string;
  reasoning: string;
  toolCallId: string;
  toolCalls: TraceToolCall[];
}

interface TraceDemo {
  source: string;
  exportedAt?: string;
  thread?: {
    id: string;
    title: string;
    graphId?: string;
    updatedAt?: string;
    messageCount?: number;
  };
  model: string;
  prompt: string;
  elapsed: string;
  messages: TraceMessage[];
  missing: string[];
}

interface TraceThreadSummary {
  id: string;
  title: string;
  graphId?: string;
  updatedAt?: string;
  messageCount: number;
  trace: TraceDemo;
}

interface Window {
  TRACE_DEMO: TraceDemo;
  TRACE_THREADS?: TraceThreadSummary[];
}
