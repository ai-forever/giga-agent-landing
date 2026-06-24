import { DemoChat } from "./components/giga-demo/DemoChat";
import { getTraceThreads } from "./components/giga-demo/utils";

const features = [
  ["01", "REPL & code execution", "Python и shell внутри sandbox с сохранением состояния между шагами."],
  ["02", "Sandboxes", "Local Docker, Local Jupyter и E2B для изолированного выполнения задач."],
  ["03", "MCP & tools", "Подключение внешних инструментов и frontend MCP flow с подтверждением действий."],
  ["04", "Skills", "Подключаемые навыки агента, которые расширяют поведение под рабочие процессы команды."],
  ["05", "Deep Research", "Планирование, поиск, чтение источников, рефлексия и отчет с цитированием."],
  ["06", "RAG", "Коллекции документов, embeddings, Qdrant и ответы с привязкой к источникам."],
  ["07", "Threads & projects", "История чатов, файлы, проектный контекст и ветвление диалогов."],
  ["08", "Access control", "Пользователи, группы, ACL и superuser-контроль чувствительных провайдеров."],
];

const providers = [
  "GigaChat",
  "DeepSeek",
  "OpenAI-compatible",
  "Local models",
];

const deployItems = [
  ["Self-hosted", "Развертывание в вашей инфраструктуре."],
  ["Sandbox limits", "Изоляция, лимиты CPU/RAM/PIDs и lifecycle."],
  ["ACL", "Права доступа к документам, sandboxes и ресурсам."],
  ["Approve flow", "Подтверждение tool calls или режим автономности."],
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
          <a href="#core">Функции</a>
          <a href="#models">Модели</a>
          <a href="#deploy">Развертывание</a>
          <a href="#changelog">Changelog</a>
        </nav>
        <a className="header-link" href="https://github.com/ai-forever/giga_agent">
          GitHub
        </a>
      </header>

      <main id="top">
        <section className="hero section-band">
          <div className="hero-copy">
            <p className="eyebrow">Self-hosted agent runtime</p>
            <h1>GigaAgent для команд, которым нужен контроль над агентами, кодом и данными.</h1>
            <div className="hero-meta">
              <p className="hero-lead">
                Запускайте агентную среду в своей инфраструктуре, подключайте GigaChat, DeepSeek и
                OpenAI-compatible модели, выполняйте код в sandbox, ищите по документам и собирайте
                отчеты с источниками.
              </p>
              <div className="hero-actions" aria-label="Основные действия">
                <a className="button primary" href="https://trashchenkov.github.io/giga_agent/">
                  Документация
                </a>
                <a className="button secondary" href="#deploy">
                  Быстрый старт
                </a>
                <a className="button tertiary" href="https://github.com/ai-forever/giga_agent">
                  GitHub
                </a>
              </div>
              <div className="hero-facts" aria-label="Ключевые факты">
                <span>Docker / Compose</span>
                <span>RAG + Qdrant</span>
                <span>REPL sandbox</span>
              </div>
            </div>
          </div>

          <DemoChat threads={threads} />
        </section>

        <section className="section-band intro-band">
          <div className="section-heading">
            <p className="eyebrow">Почему это важно</p>
            <h2>Не чат-бот, а рабочая среда для агентных процессов.</h2>
          </div>
          <div className="intro-grid">
            <p>
              GigaAgent объединяет UI, треды, файлы, tool calling, sandbox execution и подключаемые
              модули в одном runtime. Команда получает контролируемый агентный слой, который можно
              развернуть рядом со своими данными.
            </p>
            <p>
              В центре продукта - практические workflow: анализ данных, поиск по внутренним
              документам, исследовательские отчеты, интеграции с GitHub и внешними API.
            </p>
          </div>
        </section>

        <section className="section-band" id="core">
          <div className="section-heading">
            <p className="eyebrow">Core-функционал</p>
            <h2>Runtime для задач, где нужны код, данные и контроль.</h2>
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
            <h2>Работает с нужными вам провайдерами.</h2>
          </div>
          <div className="model-layout">
            <div className="provider-list">
              {providers.map((provider) => (
                <span key={provider}>{provider}</span>
              ))}
            </div>
            <p>
              Runtime не привязан к одному поставщику: подключайте managed API, self-hosted модели и
              совместимые OpenAI endpoints, сохраняя единый агентный интерфейс.
            </p>
          </div>
        </section>

        <section className="section-band deploy-band" id="deploy">
          <div className="section-heading">
            <p className="eyebrow">Развертывание</p>
            <h2>Контроль инфраструктуры без потери удобства.</h2>
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

        <section className="section-band changelog-band" id="changelog">
          <div className="section-heading">
            <p className="eyebrow">Changelog</p>
            <h2>Последние изменения.</h2>
          </div>
          <div className="changelog-placeholder">Добавить позже</div>
        </section>
      </main>

      <footer className="site-footer">
        <img src="assets/dark_theme_GigaAgent.svg" alt="GigaAgent" />
        <a href="https://trashchenkov.github.io/giga_agent/">Документация</a>
        <a href="https://github.com/ai-forever/giga_agent">GitHub</a>
        <span>Docker Hub: gigateam/giga_agent</span>
        <span>GHCR: ghcr.io/ai-forever/giga_agent</span>
      </footer>
    </>
  );
}
