import { DemoChat } from "./components/giga-demo/DemoChat";
import { getTraceThreads } from "./components/giga-demo/utils";

const features = [
  ["01", "Исследования с источниками", "Агент планирует поиск, читает материалы, проверяет выводы и собирает отчет с цитатами."],
  ["02", "Код рядом с диалогом", "Python, shell и notebook-подход для анализа данных, генерации артефактов и проверки гипотез."],
  ["03", "Внутренние знания", "RAG-коллекции, embeddings, Qdrant и ответы, которые можно привязать к документам команды."],
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
  ["Agent workspace", "UI, файлы, треды и инструменты собраны в одном месте."],
  ["Traceable runs", "Видно, что агент сделал, какие инструменты вызвал и где получил результат."],
  ["Production control", "Модели, провайдеры и политики доступа настраиваются под вашу инфраструктуру."],
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
          GitHub
        </a>
      </header>

      <main id="top">
        <section className="hero section-band">
          <div className="hero-copy">
            <p className="eyebrow">Self-hosted agent workspace</p>
            <h1>Агентная среда, которую можно держать рядом с кодом, данными и правилами команды.</h1>
            <div className="hero-meta">
              <p className="hero-lead">
                GigaAgent объединяет чат, проекты, файлы, sandbox execution, RAG и tool calling в
                одном темном рабочем интерфейсе. Команда получает не витринного ассистента, а
                управляемый runtime для реальных задач.
              </p>
              <div className="hero-actions" aria-label="Основные действия">
                <a className="button primary" href="https://trashchenkov.github.io/giga_agent/">
                  Смотреть документацию
                </a>
                <a className="button secondary" href="#core">
                  Изучить возможности
                </a>
                <a className="button tertiary" href="https://github.com/ai-forever/giga_agent">
                  GitHub
                </a>
              </div>
              <div className="hero-facts" aria-label="Ключевые факты">
                <span>Docker ready</span>
                <span>RAG + tools</span>
                <span>Sandboxed code</span>
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

        <section className="section-band intro-band">
          <div className="section-heading">
            <p className="eyebrow">Новый слой работы</p>
            <h2>GigaAgent закрывает разрыв между LLM-чатом и production-процессом.</h2>
          </div>
          <div className="intro-grid">
            <p>
              Вместо разрозненных промптов и ручных копипаст агент получает доступ к документам,
              инструментам и sandbox, а команда видит ход работы и может управлять границами
              автономности.
            </p>
            <p>
              Платформа подходит для исследовательских отчетов, анализа данных, внутренних
              knowledge-base сценариев, coding workflow и интеграций, где важны безопасность и
              воспроизводимость.
            </p>
          </div>
        </section>

        <section className="section-band" id="core">
          <div className="section-heading">
            <p className="eyebrow">Возможности</p>
            <h2>Все, что нужно агенту, находится в одном управляемом workspace.</h2>
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
                Можно сочетать managed API, open-weight модели и локальные endpoints, не меняя
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
            <h2>Начните с локального окружения, затем подключайте модели, документы и tools.</h2>
          </div>
          <div className="launch-panel">
            <code>docker compose up</code>
            <p>
              Документация и исходный код открыты, поэтому можно быстро поднять демо, проверить
              агентные сценарии и адаптировать workspace под процессы команды.
            </p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <img src="assets/dark_theme_GigaAgent.svg" alt="GigaAgent" />
        <div className="footer-links">
          <a href="https://trashchenkov.github.io/giga_agent/">Документация</a>
          <a href="https://github.com/ai-forever/giga_agent">GitHub</a>
          <span>Docker Hub: gigateam/giga_agent</span>
          <span>GHCR: ghcr.io/ai-forever/giga_agent</span>
        </div>
      </footer>
    </>
  );
}
