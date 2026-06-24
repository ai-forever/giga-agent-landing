export type TraceRole = "user" | "assistant" | "tool";

export interface TraceToolCall {
  id: string;
  name: string;
  arguments: unknown;
}

export interface TraceAttachment {
  sandbox_path?: string;
  original_name?: string;
  file_type?: string;
  size?: number;
  id?: string;
  preview_path?: string;
}

export interface TraceMessage {
  index: number;
  role: TraceRole;
  content: string;
  reasoning: string;
  toolCallId: string;
  toolCalls: TraceToolCall[];
  attachments?: TraceAttachment[];
}

export interface TraceDemo {
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

export interface TraceThreadSummary {
  id: string;
  title: string;
  graphId?: string;
  updatedAt?: string;
  messageCount: number;
  trace: TraceDemo;
}

export interface TraceToolCallWithResult extends TraceToolCall {
  result?: TraceMessage;
}

export interface TraceRunStep {
  assistant: TraceMessage;
  toolCalls: TraceToolCallWithResult[];
}
