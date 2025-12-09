"use client";

import { useInView } from "../components/useInView";

export default function AIStrategyPage() {
  const step1 = useInView(0.2);
  const step2 = useInView(0.2);
  const step3 = useInView(0.2);
  const step4 = useInView(0.2);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-zinc-50">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Заголовок */}
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-indigo-300/80">
            как работает ии‑стратегия
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Внутри Athena: как ИИ превращает тест и курсы в маршрут
          </h1>
          <p className="max-w-2xl text-sm text-zinc-400">
            Athena анализирует твой когнитивный профиль и структуру курсов,
            чтобы построить живую стратегию обучения, а не статичный список
            уроков.
          </p>
        </header>

        {/* Вертикальная линия шагов */}
        <section className="relative grid gap-8 md:grid-cols-[auto,1fr]">
          {/* линия */}
          <div className="relative flex justify-center">
            <div className="h-full w-px bg-gradient-to-b from-indigo-400/70 via-slate-600 to-fuchsia-400/70" />
          </div>

          <div className="space-y-8">
            {/* Шаг 1 */}
            <article
              ref={step1.ref}
              className={`rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-[0_14px_45px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-700 ${
                step1.inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.22em] text-indigo-300/80">
                шаг 1 · онбординг
              </p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-50">
                Ты проходишь расширенный тест
              </h2>
              <p className="mt-2 text-sm text-zinc-300">
                Athena считывает твой стиль обучения, память, дисциплину, цели и
                доступное время и собирает стартовый профиль.
              </p>
            </article>

            {/* Шаг 2 */}
            <article
              ref={step2.ref}
              className={`rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-[0_14px_45px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-700 ${
                step2.inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.22em] text-indigo-300/80">
                шаг 2 · анализ курсов
              </p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-50">
                Athena парсит и «понимает» курсы
              </h2>
              <p className="mt-2 text-sm text-zinc-300">
                ИИ разбирает план курсов: темы, сложность, формат и объём
                практики. Каждый курс превращается в структурированный набор
                блоков.
              </p>
            </article>

            {/* Шаг 3 с псевдо‑JSON */}
            <article
              ref={step3.ref}
              className={`rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.75)] backdrop-blur-xl transition-all duration-700 ${
                step3.inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.22em] text-indigo-300/80">
                шаг 3 · генерация стратегии
              </p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-50">
                ИИ собирает недельный план обучения
              </h2>
              <p className="mt-2 text-sm text-zinc-300">
                На основе профиля и курсов Athena строит план: какие активности
                делать на неделе, в каком порядке и с какой нагрузкой.
              </p>

              <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/80 p-3 text-[11px] font-mono text-zinc-300 shadow-[0_16px_50px_rgba(0,0,0,0.8)]">
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  пример плана на неделю
                </p>
                <pre className="mt-1 overflow-x-auto whitespace-pre text-[11px] leading-relaxed">
{`{
  "week": 1,
  "focus": "Python базовый",
  "sessions": [
    { "day": "Пн", "type": "video",    "duration_min": 20 },
    { "day": "Ср", "type": "practice", "tasks": 3 },
    { "day": "Сб", "type": "revision", "duration_min": 15 }
  ],
  "anti_burnout": { "day_off": "Вс" }
}`}
                </pre>
              </div>
            </article>

            {/* Шаг 4 */}
            <article
              ref={step4.ref}
              className={`rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-[0_14px_45px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-700 ${
                step4.inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.22em] text-indigo-300/80">
                шаг 4 · адаптация каждую неделю
              </p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-50">
                Стратегия обновляется под твой реальный прогресс
              </h2>
              <p className="mt-2 text-sm text-zinc-300">
                Athena смотрит, что ты успел сделать, двигает дедлайны, меняет
                нагрузку и предлагает повторение сложных тем — план остаётся
                живым.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
