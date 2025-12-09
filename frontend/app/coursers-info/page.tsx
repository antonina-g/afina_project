export default function CoursesInfoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-zinc-50">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-indigo-300/80">
            курсы
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Как Athena использует курсы
          </h1>
          <p className="max-w-2xl text-sm text-zinc-400">
            Athena не создаёт свои уроки. Она анализирует уже существующие
            курсы и собирает из них связанный маршрут под твой профиль.
          </p>
        </header>

        <section className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_14px_45px_rgba(0,0,0,0.8)]">
            <h2 className="text-sm font-semibold">
              1. Анализ структуры и сложности
            </h2>
            <p className="mt-2 text-sm text-zinc-300">
              Из курса вытаскиваются модули, темы, примерное время и уровень
              сложности. Это помогает выстроить последовательность и не
              перегружать неделями с тяжёлым материалом подряд.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_14px_45px_rgba(0,0,0,0.8)]">
            <h2 className="text-sm font-semibold">
              2. Сбор единого маршрута из нескольких курсов
            </h2>
            <p className="mt-2 text-sm text-zinc-300">
              Если нужно освоить тему из разных источников, Athena склеивает
              блоки: базу берёт из одного курса, практику — из другого, а
              дополнительные материалы — из третьего.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_14px_45px_rgba(0,0,0,0.8)]">
            <h2 className="text-sm font-semibold">
              3. Повторы и контроль точек провала
            </h2>
            <p className="mt-2 text-sm text-zinc-300">
              Для сложных тем Athena планирует дополнительные повторения и
              практику, чтобы не просто «досмотреть курс», а реально закрепить
              материал.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
