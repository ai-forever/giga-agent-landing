import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AssistantText, Message, ReasoningText } from "./Message";
import { ToolCallsList } from "./ToolCallsList";
import type { TraceDemo, TraceRunStep } from "./types";
import { getRunSteps } from "./utils";

interface AgentRunProps {
  trace: TraceDemo;
  playbackKey: number;
}

export function AgentRun({ trace, playbackKey }: AgentRunProps) {
  const steps = useMemo(() => getRunSteps(trace), [trace]);
  const groups = useMemo(() => getRunGroups(steps), [steps]);
  const finalSteps = useMemo(() => steps.filter((step) => step.toolCalls.length === 0), [steps]);
  const totalBlocks = groups.length + finalSteps.length;
  const visibleBlocks = useBlockReplay(totalBlocks, playbackKey);

  return (
    <div className="ga-agent-run-list" data-playback={playbackKey}>
      {groups.slice(0, visibleBlocks).map((group, index) => (
        <RunSection key={`${playbackKey}-${index}`} group={group} initiallyExpanded />
      ))}
      {finalSteps.slice(0, Math.max(0, visibleBlocks - groups.length)).map((step, index) => (
        <div className="ga-replay-block" key={`${playbackKey}-final-${step.assistant.index}`}>
          <Message step={step} index={groups.length + index} />
        </div>
      ))}
    </div>
  );
}

const BLOCK_REPLAY_INTERVAL_MS = 520;

function useBlockReplay(totalBlocks: number, playbackKey: number) {
  const [visibleBlocks, setVisibleBlocks] = useState(totalBlocks > 0 ? 1 : 0);

  useEffect(() => {
    setVisibleBlocks(totalBlocks > 0 ? 1 : 0);
  }, [playbackKey, totalBlocks]);

  useEffect(() => {
    if (visibleBlocks >= totalBlocks) return;
    const timer = window.setTimeout(() => {
      setVisibleBlocks((value) => Math.min(value + 1, totalBlocks));
    }, BLOCK_REPLAY_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [totalBlocks, visibleBlocks]);

  return visibleBlocks;
}

interface RunGroup {
  steps: TraceRunStep[];
  elapsed: string;
}

interface RunSectionProps {
  group: RunGroup;
  initiallyExpanded: boolean;
}

function RunSection({ group, initiallyExpanded }: RunSectionProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const label = `Агент работал · ${group.elapsed}`;
  const previewLines = getRunPreview(group);

  return (
    <div className={`ga-agent-run ga-replay-block${expanded ? "" : " is-collapsed"}`}>
      <button
        className="ga-run-header"
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <span
          className="ga-run-chevron"
          style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
          aria-hidden
        >
          <ChevronRight size={14} />
        </span>
        <strong>{label}</strong>
      </button>
      {expanded && (
        <div className="ga-run-body">
          <button
            type="button"
            aria-label="Свернуть прогон"
            className="ga-run-rail"
            onClick={() => setExpanded(false)}
          />
          {group.steps.map((step) => (
            <div className="ga-run-phase" key={step.assistant.index}>
              {step.assistant.reasoning && <ReasoningText text={step.assistant.reasoning} />}
              <AssistantText content={step.assistant.content} />
              {step.toolCalls.length > 0 && <ToolCallsList toolCalls={step.toolCalls} />}
            </div>
          ))}
        </div>
      )}
      {!expanded && previewLines.length > 0 && (
        <button className="ga-run-preview" type="button" onClick={() => setExpanded(true)}>
          {previewLines.map((line, lineIndex) => (
            <span key={lineIndex}>{line}</span>
          ))}
        </button>
      )}
    </div>
  );
}

function getRunPreview(group: RunGroup) {
  return group.steps
    .flatMap((step) => [step.assistant.reasoning, step.assistant.content])
    .filter((text): text is string => Boolean(text && text !== "null"))
    .flatMap((text) => text.split("\n"))
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("!["))
    .slice(0, 8);
}

function getRunGroups(steps: TraceRunStep[]): RunGroup[] {
  const toolSteps = steps.filter((step) => step.toolCalls.length > 0);

  return [
    { steps: toolSteps.slice(0, 1), elapsed: "22 сек" },
    { steps: toolSteps.slice(1, 3), elapsed: "34 сек" },
    { steps: toolSteps.slice(3, 4), elapsed: "9 сек" },
  ].filter((group) => group.steps.length > 0);
}
