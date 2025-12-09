"use client";

import { useEffect, useState, useRef } from "react";
import { useInView } from "../components/useInView";

export default function HowItWorksPage() {
  const step1 = useInView(0.2);
  const step2 = useInView(0.2);
  const step3 = useInView(0.2);

  const blockRef = useRef<HTMLDivElement | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // лёгкий параллакс для всего блока
  useEffect(() => {
    const node = blockRef.current;
    if (!node) return;

    const handleMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / 70;
      const y = (e.clientY - (rect.top + rect.height / 2)) / 70;
      setParallax({ x, y });
    };

    const handleLeave = () => setParallax({ x: 0, y: 0 });

    node.addEventListener("mousemove", handleMove);
    node.addEventListener("mouseleave", handleLeave);
    return () => {
      node.removeEventListener("mousemove", handleMove);
      node.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-zinc-50">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-indigo-300/80">
            как это работает
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            От теста до живого маршрута по курсам
          </h1>
          <p className="max-w-2xl text-sm text-zinc-400">
            Athena не заменяет курсы, а управляет тем, как ты их проходишь:
            какие уроки, в каком темпе и с какими повторами.
          </p>
        </header>

        {/* общий «liquid glass» блок с живым фоном и параллаксом */}
        <section
          ref={blockRef}
          className="hero-animated-bg glass-card relative overflow-hidden px-5 py-7 sm:px-7 sm:py-8"
          style={{
            transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
            transition: "transform 0.12s ease-out",
          }}
        >
          {/* вертикальный таймлайн */}
          <div className="absolute left-4 top-10 bottom-10 hidden w-px bg-gradient-to-b from-indigo-300/30 via-sky-300/40 to-emerald-300/30 sm:block" />

          <div className="space-y-6">
            {/* Шаг 1 */}
            <article
              ref={step1.ref}
              className={`relative rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4 pl-10 shadow-[0_16px_45px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-700 ${
                step1.inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <div className="absolute left-3 top-5 hidden h-3 w-3 rounded-full bg-indigo-300 shadow-[0_0_0_4px_rgba(129,140,248,0.35)] sm:block" />
              <p className="text-[11px] uppercase tracking-[0.22em] text-indigo-300/80">
                шаг 1
              </p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-50">
                Онбординг и когнитивный профиль
              </h2>
              <p className="mt-2 text-sm text-zinc-300">
                Ты отвечаешь на вопросы про цели, опыт, память, дисциплину и
                доступное время. Athena строит профиль: как часто тебе нужны
                повторы, какой формат лучше заходит и какая нагрузка комфортна.
              </p>
            </article>

            {/* Шаг 2 */}
            <article
              ref={step2.ref}
              className={`relative rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4 pl-10 shadow-[0_16px_45px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-700 delay-100 ${
                step2.inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <div className="absolute left-3 top-5 hidden h-3 w-3 rounded-full bg-sky-300 shadow-[0_0_0_4px_rgba(125,211,252,0.4)] sm:block" />
              <p className="text-[11px] uppercase tracking-[0.22em] text-sky-300/80">
                шаг 2
              </p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-50">
                Анализ курсов и карта знаний
              </h2>
              <p className="mt-2 text-sm text-zinc-300">
                Athena разбирает курсы: темы, модули, сложность, практику. Из
                этого строится карта знаний, по которой ИИ понимает, какие
                блоки нужны именно тебе и в каком порядке.
              </p>
            </article>

            {/* Шаг 3 */}
            <article
              ref={step3.ref}
              className={`relative rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4 pl-10 shadow-[0_16px_45px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-700 delay-200 ${
                step3.inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <div className="absolute left-3 top-5 hidden h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(74,222,128,0.45)] sm:block" />
              <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-300/80">
                шаг 3
              </p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-50">
                Живой план и адаптация каждую неделю
              </h2>
              <p className="mt-2 text-sm text-zinc-300">
                На выходе ты видишь конкретный план по дням. Athena отслеживает,
                что ты успеваешь сделать, и каждую неделю обновляет стратегию:
                смещает дедлайны, добавляет повторы сложных тем и закладывает
                выходные, чтобы не выгореть.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
