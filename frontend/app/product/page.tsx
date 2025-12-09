export default function ProductPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-zinc-50">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-indigo-300/80">
            продукт
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Athena — надстройка над курсами, а не ещё один курс
          </h1>
          <p className="max-w-2xl text-sm text-zinc-400">
            Ты приносишь любые онлайн‑курсы. Athena подстраивает стратегию
            прохождения: какой блок сейчас в приоритете, когда повторять и как
            не перегореть.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_14px_45px_rgba(0,0,0,0.8)]">
            <h2 className="text-sm font-semibold">Что делает Athena</h2>
            <ul className="mt-2 space-y-1 text-sm text-zinc-300">
              <li>• Строит персональный план по дням и неделям.</li>
              <li>• Предлагает формат работы под твой стиль обучения.</li>
              <li>• Следит за прогрессом и мягко двигает дедлайны.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_14px_45px_rgba(0,0,0,0.8)]">
            <h2 className="text-sm font-semibold">Что Athena не делает</h2>
            <ul className="mt-2 space-y-1 text-sm text-zinc-300">
              <li>• Не заменяет сами курсы и не продаёт контент.</li>
              <li>• Не превращает обучение в бесконечный чат с ИИ.</li>
              <li>• Не навязывает один «идеальный» путь для всех.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
