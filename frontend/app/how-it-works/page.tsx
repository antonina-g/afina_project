"use client";

import { useInView } from "../components/useInView";

export default function HowItWorksPage() {
  const step1 = useInView(0.2);
  const step2 = useInView(0.2);
  const step3 = useInView(0.2);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-zinc-50">
      <div className="mx-auto max-w-4xl space-y-10">
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

        <section className="space-y-6">
          <article
            ref={step1.ref}
            className={`rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-[0_16px_55px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-700 ${
              step1.inView
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <h2 className="text-sm font-semibold text-zinc-50">
              1. Онбординг и когнитивный профиль
            </h2>
            <p className="mt-2 text-sm text-zinc-300">
              Ты отвечаешь на вопросы про цели, опыт, память, дисциплину и
              доступное время. Athena строит профиль: как часто тебе нужны
              повторы, какой формат лучше заходит и какая нагрузка комфортна.
            </p>
          </article>

          <article
            ref={step2.ref}
            className={`rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-[0_16px_55px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-700 ${
              step2.inView
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <h2 className="text-sm font-semibold text-zinc-50">
              2. Анализ курсов и сбор «карты знаний»
            </h2>
            <p className="mt-2 text-sm text-zinc-300">
              Athena разбирает курсы: темы, модули, сложность, практику. Из
              этого строится карта знаний, на основе которой ИИ понимает, как
              связаны между собой темы и какие блоки нужны именно тебе.
            </p>
          </article>

          <article
            ref={step3.ref}
            className={`rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-[0_16px_55px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-700 ${
              step3.inView
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <h2 className="text-sm font-semibold text-zinc-50">
              3. Живой план и адаптация каждую неделю
            </h2>
            <p className="mt-2 text-sm text-zinc-300">
              На выходе ты видишь конкретный план по дням. Athena отслеживает,
              что ты успеваешь сделать, и каждую неделю обновляет стратегию:
              смещает дедлайны, добавляет повторы сложных тем и защищает от
              выгорания за счёт запланированных выходных.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
