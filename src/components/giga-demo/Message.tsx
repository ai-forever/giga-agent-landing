import { ToolCallsList } from "./ToolCallsList";
import type { TraceRunStep } from "./types";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface MessageProps {
  step: TraceRunStep;
  index: number;
}

export function Message({ step, index }: MessageProps) {
  const content = step.assistant.content && step.assistant.content !== "null" ? step.assistant.content : "";
  const showReasoningFirst = step.toolCalls.length === 0;
  const markdownAttachment = getInlineMarkdownAttachment(step.assistant.attachments);

  return (
    <article className="ga-run-step">
      {showReasoningFirst && step.assistant.reasoning && <ReasoningText text={step.assistant.reasoning} />}
      {content && markdownAttachment ? (
        <MarkdownAttachmentBlock filename={markdownAttachment.original_name ?? "attachment.md"} content={content} />
      ) : content ? (
        <div className="ga-assistant-text">
          <MarkdownMessage content={content} />
        </div>
      ) : null}
      {step.assistant.attachments?.map((attachment) =>
        attachment.preview_path ? (
          <figure className="ga-attachment-preview" key={attachment.id ?? attachment.preview_path}>
            <img src={attachment.preview_path} alt={attachment.original_name ?? "Вложение"} />
            <figcaption>{attachment.original_name ?? "Вложение"}</figcaption>
          </figure>
        ) : null,
      )}
      {!showReasoningFirst && step.assistant.reasoning && <ReasoningText text={step.assistant.reasoning} />}
      {step.toolCalls.length > 0 && <ToolCallsList toolCalls={step.toolCalls} />}
    </article>
  );
}

export function AssistantText({ content }: { content: string }) {
  if (!content || content === "null") return null;
  return (
    <div className="ga-assistant-text">
      <MarkdownMessage content={content} />
    </div>
  );
}

function MarkdownAttachmentBlock({ filename, content }: { filename: string; content: string }) {
  const [open, setOpen] = useState(true);

  return (
    <section className={`ga-md-attachment${open ? " is-open" : " is-closed"}`}>
      <button
        className="ga-md-attachment-header"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{filename}</span>
        <ChevronDown size={18} aria-hidden />
      </button>
      {open && (
        <div className="ga-md-attachment-body">
          <div className="ga-assistant-text">
            <MarkdownMessage content={content} />
          </div>
        </div>
      )}
    </section>
  );
}

export function ReasoningText({ text }: { text: string }) {
  if (!text) return null;
  const [open, setOpen] = useState(false);
  const expandable = text.length > 120 || text.includes("\n");
  return (
    <button
      className={`ga-reasoning${expandable && !open ? " is-faded" : ""}`}
      type="button"
      aria-expanded={open}
      onClick={() => expandable && setOpen((value) => !value)}
    >
      {(open || !expandable ? text : text.split("\n").slice(0, 4).join("\n")).split("\n").map((line, lineIndex) =>
        line.trim() ? <span key={lineIndex}>{line}</span> : <br key={lineIndex} />,
      )}
    </button>
  );
}

function getAttachmentLabel(src: string) {
  const label = decodeURIComponent(src.replace(/^(attachment|file):\/?/, "").split("/").at(-1) ?? "");
  return label || "Вложение";
}

function getInlineMarkdownAttachment(attachments: TraceRunStep["assistant"]["attachments"]) {
  return attachments?.find((attachment) => {
    const name = attachment.original_name ?? attachment.sandbox_path ?? "";
    return /\.(md|markdown)$/i.test(name);
  });
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      urlTransform={(uri) => uri}
      components={{
        a({ href, children, ...props }) {
          if (!href) return <a {...props}>{children}</a>;
          if (href.startsWith("attachment:") || href.startsWith("file:")) {
            return (
              <a className="ga-attachment-link" href={href} target="_blank" rel="noreferrer" {...props}>
                {children || getAttachmentLabel(href)}
              </a>
            );
          }
          return (
            <a href={href} target="_blank" rel="noreferrer" {...props}>
              {children}
            </a>
          );
        },
        img({ src, alt, ...props }) {
          if (!src) return null;
          if (src.startsWith("attachment:") || src.startsWith("file:")) {
            return (
              <a className="ga-attachment-link" href={src} target="_blank" rel="noreferrer">
                {alt || getAttachmentLabel(src)}
              </a>
            );
          }
          return (
            <figure className="ga-attachment-preview">
              <img src={src} alt={alt || "Вложение"} {...props} />
              <figcaption>{alt || "Вложение"}</figcaption>
            </figure>
          );
        },
        table({ children, ...props }) {
          return (
            <div className="ga-markdown-table-wrap">
              <table className="ga-markdown-table" {...props}>
                {children}
              </table>
            </div>
          );
        },
        code({ className, children, ...props }) {
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </Markdown>
  );
}
