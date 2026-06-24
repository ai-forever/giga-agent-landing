import { Ban } from "lucide-react";
import { ExpandableBlock } from "./ExpandableBlock";
import type { TraceToolCallWithResult } from "./types";
import { getToolMeta, getToolTitle, prettyJson } from "./utils";

interface ToolCallsListProps {
  toolCalls: TraceToolCallWithResult[];
}

export function ToolCallsList({ toolCalls }: ToolCallsListProps) {
  return (
    <div className="ga-tool-list">
      {toolCalls.map((toolCall, index) => {
        const title = getToolTitle(toolCall.name, toolCall.arguments);
        const meta = getToolMeta(toolCall.name, toolCall.arguments, toolCall.result?.content);
        return (
          <div className="ga-tool-card" key={toolCall.id}>
            <ExpandableBlock title={title} meta={meta}>
              <div className="ga-tool-section-label">ПАРАМЕТРЫ</div>
              <pre className="ga-code-pre">{prettyJson(toolCall.arguments)}</pre>
              <div className="ga-tool-section-label">РЕЗУЛЬТАТ</div>
              <pre className="ga-code-pre">{toolCall.result?.content ?? "Результат отсутствует в трейсе."}</pre>
            </ExpandableBlock>
          </div>
        );
      })}
      {toolCalls.length === 0 && (
        <div className="ga-tool-empty">
          <Ban size={14} />
          <span>Tool calls отсутствуют в этом сообщении</span>
        </div>
      )}
    </div>
  );
}
