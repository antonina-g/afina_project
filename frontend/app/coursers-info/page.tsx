"use client";

import { useState } from "react";

const TABS = [
  { id: "how", label: "Как используются" },
  { id: "sources", label: "Источники курсов" },
  { id: "quality", label: "Качество и отбор" },
];

export default function CoursesInfoPage() {
  const [active, setActive] = useState<string>("how");

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-zinc-50">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="tab-hero-bg glass-card px-6 py-8 sm:px-8 sm:py-10">
          <header className="mb-6 space-y-2">
            <p className="text-[11px] uppercase tracking-[0.25em] text-violet-200/80">
              курсы
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Как Athena работает с курсами
            </h1>
            <p className="max-w-2xl text-sm text-zinc-300">
              Athena не делает собственный контент. Она использует существующие
              онлайн‑курсы, перестраивая их под твой маршрут.
            </p>
          </header>

          {/* Табы */}
          <div className="tabs-root border-b border-white/10 pb-3">
            <div className="flex flex-wrap gap-3 relative">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition ${
                    active === tab.id ? "tabs-item-active" : "text-zinc-400"
                  }`}
                >
                  <span
                    className={`icon-pill ${
                      active === tab.id ? "icon-pill-active" : ""
                    }`}
                  >
                    {tab.label[0]}
                  </span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Контент вкладок */}
          <div className="mt-6 space-y-3 animate-sectionFadeIn">
            {active === "how" && (
              <>
                <p className="text-sm text-zinc-200">
                  Из курсов вытаскиваются темы, модули, длительность и уровень
                  сложности, после чего Athena собирает из них непрерывный путь.
                </p>
                <p className="text-sm text-zinc-400">
                  Вместо трёх разрозненных курсов ты видишь один маршрут, где
                  всё выстроено по нарастающей сложности.
                </p>
              </>
            )}

            {active === "sources" && (
              <>
                <p className="text-sm text-zinc-200">
                  В базу попадают только платформы с внятной структурой: курсы с
                  программой, модулями, практикой и понятным уровнем.
                </p>
                <p className="text-sm text-zinc-400">
                  Athena не «скрейпит» случайные видео: используются именно
                  курсы, у которых можно оценить содержание и нагрузку.
                </p>
              </>
            )}

            {active === "quality" && (
              <>
                <p className="text-sm text-zinc-200">
                  Приоритет у курсов с высокой завершением, хорошими отзывами и
                  насыщенной практикой.
                </p>
                <p className="text-sm text-zinc-400">
                  Если по теме есть несколько курсов, Athena соберёт гибрид:
                  теорию из одного, задачи и проекты — из других.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
