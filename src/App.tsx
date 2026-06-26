import { Box, Cloud, Github, Server } from "lucide-react";
import { DemoChat } from "./components/giga-demo/DemoChat";
import { getTraceThreads } from "./components/giga-demo/utils";

const features = [
  ["01", "Исследования с источниками", "Агент планирует поиск, читает материалы, проверяет выводы и собирает отчет с цитатами."],
  ["02", "Выполнение задач через код", "Python, shell и notebook-подход для анализа данных, генерации артефактов и проверки гипотез."],
  ["03", "Внутренние знания", "Аггрегируйте знания команды в коллекции документов, дополняйте запросы коллекциями через RAG"],
  ["04", "Инструменты и MCP", "Подключайте GitHub, браузер, API и собственные сервисы через контролируемый tool calling."],
  ["05", "Проекты и треды", "Контекст задач, файлы, история решений и ветвление диалогов остаются в рабочем пространстве."],
  ["06", "Навыки команды", "Skills превращают повторяемые процессы в инструкции, которые агент применяет стабильно."],
];

const providers = [
  ["GigaChat", "Нативная интеграция для корпоративных сценариев."],
  ["DeepSeek", "Сильные reasoning-сценарии и coding flow."],
  ["OpenAI-compatible", "Единый интерфейс для совместимых endpoints."],
  ["Local models", "Развертывание рядом с чувствительными данными."],
];

const deployItems = [
  ["Self-hosted", "Docker/Compose и контроль над тем, где живут данные, файлы и execution."],
  ["Sandbox limits", "Ограничения CPU/RAM/PIDs, lifecycle и изоляция рабочих запусков."],
  ["ACL", "Пользователи, группы и права доступа к коллекциям, sandbox и провайдерам."],
  ["Approve flow", "Ручное подтверждение действий или автономные режимы для доверенных процессов."],
];

const proofItems = [
  ["Агентные возможности", "Исполнение кода в sandbox, MCP, Skills, плагины, RAG, память"],
  ["Настраиваемые пространства", "Организации, группы пользователей, дополнительные каналы"],
  ["Независимость", "Решение под лицензией MIT - разворачивайте на собственных серверах, конфигурируйте под нужды своей организации"],
];

export default function App() {
  const threads = getTraceThreads();

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="GigaAgent">
          <img src="assets/dark_theme_GigaAgent.svg" alt="GigaAgent" />
        </a>
        <nav className="header-nav" aria-label="Основная навигация">
          <a href="#core">Возможности</a>
          <a href="#models">Модели</a>
          <a href="#deploy">Контроль</a>
          <a href="#contact">Запуск</a>
        </nav>
        <a className="header-link" href="https://github.com/ai-forever/giga_agent">
          <Github aria-hidden="true" size={18} strokeWidth={2.2} />
          GitHub
        </a>
      </header>

      <main id="top">
        <section className="hero section-band">
          <div className="hero-copy">
            <p className="eyebrow">Сделано в GigaChain</p>
            <h1>
              <span className="hero-brand-gradient">GigaAgent</span> - универсальный агент для вашего бизнеса
            </h1>
            <div className="hero-meta">
              <p className="hero-lead">
                Настройте агента сразу для всех работников своей организации. Подойдет для работы с
                документами, аналитики данных, исследований, создания прототипов и личных нужд
              </p>
              <div className="hero-actions" aria-label="Основные действия">
                <a className="button primary" href="https://trashchenkov.github.io/giga_agent/">
                  Документация
                </a>
                <a className="button secondary" href="#core">
                  Возможности
                </a>
                <a className="button tertiary" href="https://github.com/ai-forever/giga_agent">
                  <Github aria-hidden="true" size={18} strokeWidth={2.2} />
                  Репозиторий
                </a>
              </div>
            </div>
          </div>

          <div className="demo-glass">
            <div className="demo-glass-header" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <DemoChat threads={threads} />
          </div>
        </section>

        <section className="section-band proof-band">
          <div className="proof-grid" aria-label="Ключевые преимущества">
            {proofItems.map(([title, text]) => (
              <article className="proof-card" key={title}>
                <h2>{title}</h2>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-band" id="core">
          <div className="section-heading">
            <p className="eyebrow">Возможности</p>
            <h2>Все, что нужно агенту, находится в одном конфигурируемом рабочем пространстве.</h2>
          </div>
          <div className="feature-grid">
            {features.map(([kicker, title, text]) => (
              <article className="feature-card" key={kicker}>
                <span className="card-kicker">{kicker}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-band model-band" id="models">
          <div className="section-heading">
            <p className="eyebrow">Модели</p>
            <h2>Выбирайте модели под задачу, политику доступа и стоимость.</h2>
          </div>
          <div className="model-layout">
            <div className="provider-list">
              {providers.map(([provider, text]) => (
                <article className="provider-row" key={provider}>
                  <strong>{provider}</strong>
                  <span>{text}</span>
                </article>
              ))}
            </div>
            <article className="model-note">
              <h3>Один интерфейс, разные backend-стратегии.</h3>
              <p>
                Можно сочетать корпоративный API, глобальные и локальные модели, не меняя
                пользовательский сценарий и агентные инструкции.
              </p>
            </article>
          </div>
        </section>

        <section className="section-band deploy-band" id="deploy">
          <div className="section-heading">
            <p className="eyebrow">Контроль</p>
            <h2>Инфраструктурные решения остаются на вашей стороне.</h2>
          </div>
          <div className="deploy-grid">
            {deployItems.map(([title, text]) => (
              <article className="deploy-card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-band changelog-band" id="contact">
          <div className="section-heading">
            <p className="eyebrow">Запуск</p>
            <h2>Выбирайте удобный для вас способ развертывания.</h2>
          </div>
          <div className="launch-panel">
            <div className="launch-commands" aria-label="Команды запуска">
              <div className="launch-tabs">
                <input id="launch-tab-python" name="launch-tab" type="radio" defaultChecked />
                <input id="launch-tab-compose" name="launch-tab" type="radio" />
                <div className="launch-tab-list" role="tablist" aria-label="Способ запуска">
                  <label htmlFor="launch-tab-python">python package</label>
                  <label htmlFor="launch-tab-compose">compose app</label>
                </div>
                <div className="launch-tab-panels">
                  <div className="launch-tab-panel panel-python terminal-window">
                    <div className="terminal-bar" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                    <code>
                      <span className="terminal-prompt">$</span>
                      <span className="terminal-typing command-add">uv add giga_agent</span>
                    </code>
                    <code>
                      <span className="terminal-prompt">$</span>
                      <span className="terminal-typing command-dev">uv run giga_agent dev</span>
                    </code>
                  </div>
                  <div className="launch-tab-panel panel-compose terminal-window">
                    <div className="terminal-bar" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                    <code>
                      <span className="terminal-prompt">$</span>
                      <span className="terminal-typing command-build">make build</span>
                    </code>
                    <code>
                      <span className="terminal-prompt">$</span>
                      <span className="terminal-typing command-up">make up</span>
                    </code>
                  </div>
                </div>
              </div>
            </div>
            <div className="launch-copy">
              <h3>Готовые платформы</h3>
              <p>
                Запускайте локально через uv или разворачивайте self-hosted сборку через контейнерные
                registry для команды.
              </p>
              <div className="launch-links" aria-label="Варианты запуска и контейнеры">
                <a className="launch-link digitalocean" href="https://cloud.digitalocean.com/apps/new?repo=https://github.com/ai-forever/giga_agent/tree/main">
                  <Cloud aria-hidden="true" size={16} strokeWidth={2.2} />
                  DigitalOcean
                </a>
                <a className="launch-link cloudru" href="https://cloud.ru/ru/docs/artifact-registry">
                  <Server aria-hidden="true" size={16} strokeWidth={2.2} />
                  Cloud.ru Artifact Registry
                </a>
                <a className="launch-link ghcr" href="https://github.com/ai-forever/giga_agent/pkgs/container/giga_agent">
                  <Github aria-hidden="true" size={16} strokeWidth={2.2} />
                  GHCR
                </a>
                <a className="launch-link dockerhub" href="https://hub.docker.com/r/gigateam/giga_agent">
                  <Box aria-hidden="true" size={16} strokeWidth={2.2} />
                  Docker Hub
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <img src="assets/dark_theme_GigaAgent.svg" alt="GigaAgent" />
        <div className="footer-links">
          <a href="https://trashchenkov.github.io/giga_agent/">Документация</a>
          <a href="https://github.com/ai-forever/giga_agent">GitHub</a>
        </div>
      </footer>
    </>
  );
}
