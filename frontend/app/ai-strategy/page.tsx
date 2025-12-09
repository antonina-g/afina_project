"use client";

import { useEffect, useRef, useState } from "react";

type ModeId = "axes" | "memory" | "discipline";

const MODES: {
  id: ModeId;
  label: string;
  title: string;
  body: string;
}[] = [
  {
    id: "axes",
    label: "Три оси адаптации",
    title: "Athena крутит сразу три «рычага» обучения",
    body: "В каждом дне маршрута Athena одновременно учитывает память, темп и дисциплину. Память задаёт частоту повторов, темп — сколько материала заходит без перегруза, дисциплина — как мягко подталкивать вперёд.",
  },
  {
    id: "memory",
    label: "Память и повторы",
    title: "Повторы приходят в тот момент, когда ты почти забыл",
    body: "Сервис отслеживает, какие темы ты проходил и как быстро к ним возвращался. Если материал начинает «расползаться», Athena подбрасывает короткие спринты и задачи вместо длинных лекций.",
  },
  {
    id: "discipline",
    label: "Режим и защита от выгорания",
    title: "План подстраивается под твой реальный ритм",
    body: "Когда начинаются пропуски, Athena не строит огромный хвост из долгов. Она ослабляет нагрузку, перераспределяет задачи и заранее закладывает выходные, чтобы ты мог вернуться в маршрут без чувства вины.",
  },
];

export default function AIStrategyPage() {
  const [active, setActive] = useState<ModeId>("axes");
  const [pulse, setPulse] = useState<ModeId>("axes");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const current = MODES.find((m) => m.id === active)!;

  // автопереключение «состояний ИИ»
  useEffect(() => {
    const idx = MODES.findIndex((m) => m.id === active);
    const timer = setTimeout(() => {
      const next = MODES[(idx + 1) % MODES.length];
      setActive(next.id);
    }, 7000);
    return () => clearTimeout(timer);
  }, [active]);

  // отдельный пульс для светящихся узлов
  useEffect(() => {
    const idx = MODES.findIndex((m) => m.id === pulse);
    const timer = setTimeout(() => {
      const next = MODES[(idx + 1) % MODES.length];
      setPulse(next.id);
    }, 2500);
    return () => clearTimeout(timer);
  }, [pulse]);

  // параллакс всей панели
  useEffect(() => {
    const node = panelRef.current;
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
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-zinc-50">
      <div className="mx-auto max-w-5xl space-y-6">
        <section
          ref={panelRef}
          className="tab-hero-bg glass-card relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10"
          style={{
            transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
            transition: "transform 0.12s ease-out",
          }}
        >
          <header className="mb-6 space-y-2">
            <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-200/80">
              ИИ‑стратегия
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Как Athena думает о твоём обучении
            </h1>
            <p className="max-w-2xl text-sm text-zinc-300">
              Представь маленький ИИ‑мозг, который на каждом шаге решает:
              напомнить, притормозить или, наоборот, ускорить. Эта страница —
              его панель управления.
            </p>
          </header>

          <div className="grid gap-8 md:grid-cols-[1.15fr,1.2fr] items-stretch">
            {/* Левая часть: «нейросеть» из трёх осей */}
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-950/70 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.9)]">
              {/* сетка‑фон с лёгким дрейфом */}
              <div className="pointer-events-none absolute inset-0 opacity-30 ai-grid">
                <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern
                      id="ai-grid"
                      x="0"
                      y="0"
                      width="16"
                      height="16"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="1" cy="1" r="0.8" fill="rgba(148,163,184,0.4)" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#ai-grid)" />
                </svg>
              </div>

              {/* соединяющие линии + бегущий сигнал */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/4 top-1/3 h-px w-1/2 bg-gradient-to-r from-emerald-300/10 via-emerald-300/60 to-sky-300/10 overflow-hidden">
                  <div className="ai-signal" />
                </div>
                <div className="absolute left-1/4 bottom-1/3 h-px w-1/2 bg-gradient-to-r from-sky-300/10 via-sky-300/60 to-emerald-300/10 overflow-hidden">
                  <div className="ai-signal" />
                </div>
              </div>

              {/* три «узла» — память, темп, дисциплина */}
              <div className="relative grid gap-4">
                <AxisNode
                  id="axes"
                  label="Баланс трёх осей"
                  description="Память · темп · дисциплина"
                  active={active === "axes"}
                  pulse={pulse === "axes"}
                  onClick={() => setActive("axes")}
                />
                <AxisNode
                  id="memory"
                  label="Память и повторы"
                  description="Когда и как возвращать темы"
                  active={active === "memory"}
                  pulse={pulse === "memory"}
                  onClick={() => setActive("memory")}
                />
                <AxisNode
                  id="discipline"
                  label="Режим и выгорание"
                  description="Как не бросить на середине"
                  active={active === "discipline"}
                  pulse={pulse === "discipline"}
                  onClick={() => setActive("discipline")}
                />
              </div>
            </div>

            {/* Правая часть: «экран» с мыслью ИИ */}
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-950/85 px-5 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-40" />
              <div key={current.id} className="ai-panel-zoom space-y-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-300/80">
                  {current.label}
                </p>
                <h2 className="text-sm font-semibold text-zinc-50">
                  {current.title}
                </h2>
                <p className="text-sm text-zinc-200">{current.body}</p>
                <p className="text-[11px] text-zinc-500">
                  Athena обновляет эти параметры каждую неделю, опираясь на твой
                  реальный прогресс, а не на идеальный календарь.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type AxisNodeProps = {
  id: ModeId;
  label: string;
  description: string;
  active: boolean;
  pulse: boolean;
  onClick: () => void;
};

function AxisNode({ label, description, active, pulse, onClick }: AxisNodeProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left transition ${
        active
          ? "border-emerald-300/90 bg-emerald-400/15"
          : "border-white/10 bg-slate-900/70 hover:border-emerald-300/60 hover:bg-emerald-400/10"
      }`}
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-200/80">
          {label}
        </p>
        <p className="mt-1 text-xs text-zinc-200">{description}</p>
      </div>
      <div
        className={`relative h-9 w-9 rounded-full border border-emerald-300/60 bg-emerald-300/20 ${
          pulse ? "animate-pulse ai-node-glow" : ""
        }`}
      >
        <span className="absolute inset-1 rounded-full bg-gradient-to-br from-emerald-300 to-sky-300 opacity-90" />
      </div>
    </button>
  );
}
