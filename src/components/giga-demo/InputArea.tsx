import { Check, ChevronDown, Files, FolderOpen, Mic, Paperclip, Plus, ScanSearch, Send, Wrench } from "lucide-react";
import { useState } from "react";

export function InputArea() {
  const [autoApprove, setAutoApprove] = useState(true);
  const [message, setMessage] = useState("");
  const [skill, setSkill] = useState("Глубокое исследование");
  const [model, setModel] = useState("deepseek-v4-pro");
  const [toolsOpen, setToolsOpen] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const [tokenTooltipOpen, setTokenTooltipOpen] = useState(false);

  const closePopovers = () => {
    setToolsOpen(false);
    setModelsOpen(false);
  };

  const toggleTools = () => {
    setModelsOpen(false);
    setToolsOpen((value) => !value);
  };

  const toggleModels = () => {
    setToolsOpen(false);
    setModelsOpen((value) => !value);
  };

  return (
    <div className="ga-input-shell">
      <div
        className="ga-input-area"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) closePopovers();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") closePopovers();
        }}
      >
        <input className="ga-file-input" type="file" multiple aria-hidden="true" tabIndex={-1} />
        <div className="ga-input-topline">
          <textarea
            className="ga-textarea"
            placeholder="Введите вашу задачу..."
            rows={1}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button
            className={`ga-auto-approve${autoApprove ? " is-on" : ""}`}
            type="button"
            aria-pressed={autoApprove}
            onClick={() => setAutoApprove((value) => !value)}
            data-onboarding="autonomy-switch"
          >
            <span>Автономность</span>
            <span className="ga-switch" aria-hidden="true" />
          </button>
        </div>
        <div className="ga-input-controls">
          <button
            className="ga-icon-button"
            type="button"
            aria-label="Добавить"
            aria-expanded={toolsOpen}
            onClick={toggleTools}
          >
            <Plus size={24} />
          </button>
          {toolsOpen && (
            <div className="skill-popover open" aria-hidden={!toolsOpen}>
              <strong>Добавить</strong>
              <button type="button" onClick={closePopovers}>
                <Paperclip size={16} />
                Прикрепить файл
              </button>
              <button type="button" onClick={closePopovers}>
                <Files size={16} />
                Документы
              </button>
              <span className="popover-section">Скиллы</span>
              {[
                "Глубокое исследование",
                "Python + Search",
                "RAG по документам",
                "GitHub changelog",
                "Browser use",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSkill(item);
                    closePopovers();
                  }}
                >
                  <Wrench size={16} />
                  <span>{item}</span>
                  {skill === item && <Check size={14} className="popover-check" />}
                </button>
              ))}
            </div>
          )}
          <button className="ga-project-context" type="button" aria-label="Текущий проект workspace">
            <FolderOpen size={15} />
            <span>workspace</span>
          </button>
          <span className="ga-input-spacer" />
          <button
            className={`ga-token-meter${tokenTooltipOpen ? " is-open" : ""}`}
            type="button"
            aria-label="Расход токенов"
            aria-describedby="token-usage-tooltip"
            onMouseEnter={() => setTokenTooltipOpen(true)}
            onMouseLeave={() => setTokenTooltipOpen(false)}
            onPointerEnter={() => setTokenTooltipOpen(true)}
            onPointerLeave={() => setTokenTooltipOpen(false)}
            onFocus={() => setTokenTooltipOpen(true)}
            onBlur={() => setTokenTooltipOpen(false)}
            onClick={() => setTokenTooltipOpen(true)}
          >
            <span className="ga-token-ring" aria-hidden="true" />
            <span className="token-tooltip" id="token-usage-tooltip" role="tooltip">
              3.1% - 31.2K / 1.0M context<br />
              $0.015
            </span>
          </button>
          <button className="ga-skill-pill" type="button" aria-expanded={toolsOpen} onClick={toggleTools}>
            <ScanSearch size={15} />
            <span>{skill}</span>
          </button>
          <button
            className="ga-model-pill"
            type="button"
            aria-expanded={modelsOpen}
            onClick={toggleModels}
          >
            <span>{model}</span>
            <ChevronDown size={16} />
          </button>
          {modelsOpen && (
            <div className="model-popover open" aria-hidden={!modelsOpen}>
              {["deepseek-v4-pro", "GigaChat Max", "OpenAI-compatible"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setModel(item);
                    closePopovers();
                  }}
                >
                  {item}
                  {model === item && <Check size={14} className="popover-check" />}
                </button>
              ))}
            </div>
          )}
          <button className="ga-icon-button" type="button" aria-label={message.trim() ? "Отправить" : "Голосовой ввод"}>
            {message.trim() ? <Send size={22} /> : <Mic size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
}
