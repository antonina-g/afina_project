"use client";

import { useEffect, useRef, useState } from "react";

type SlideId = "route" | "ai" | "result";

const SLIDES: { id: SlideId; title: string; body: string; badge: string }[] = [
  {
    id: "route",
    title: "Маршрут из нескольких курсов",
    body:
      "Athena разбирает онлайн‑курсы на модули и собирает из них единый путь: базовая теория, практика и проект идут в нужном порядке, без дыр и повторов.",
    badge: "структура",
  },
  {
    id: "ai",
    title: "Темп и повторы под тебя",
    body:
      "Сервис отслеживает, как часто ты учишься и какие темы даются тяжелее, и на лету меняет недельную нагрузку и точки повторения, чтобы не перегружать и не давать материалу забыться.",
    badge: "адаптация",
  },
  {
    id: "result",
    title: "Фокус на завершении программы",
    body:
      "Вместо простого списка уроков ты видишь конкретный шаг на сегодня и прозрачный прогресс по маршруту, поэтому легче дойти до конца и собрать портфолио.",
    badge: "результат",
  },
];

export default function ProductPage() {
  const [active, setActive] = useState<SlideId>("route");
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement | null>(null);

  const current = SLIDES.find((s) => s.id === active)!;

  // автосмена слайдов и плавный поворот «орбиты»
  useEffect(() => {
    const idx = SLIDES.findIndex((s) => s.id === active);
    const timer = setTimeout(() => {
      const next = SLIDES[(idx + 1) % SLIDES.length];
      setActive(next.id);
      setOrbitAngle((angle) => angle + 120);
    }, 7000);
    return () => clearTimeout(timer);
  }, [active]);

  // параллакс для всего блока
  useEffect(() => {
    const node = heroRef.current;
    if (!node) return;

    const handleMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / 60;
      const y = (e.clientY - (rect.top + rect.height / 2)) / 60;
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
      <div className="mx-auto max-w-5xl">
        <section
          ref={heroRef}
          className="relative overflow-hidden rounded-[32px] border border-white/15 bg-slate-950/80 px-6 py-8 sm:px-8 sm:py-10 shadow-[0_40px_140px_rgba(0,0,0,0.9)]"
          style={{
            transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
            transition: "transform 0.12s ease-out",
          }}
        >
          {/* уникальный фон для продукт‑блока: концентрические орбиты */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-[-40%] rounded-full border border-sky-500/10" />
            <div className="absolute inset-[-20%] rounded-full border border-sky-400/15" />
            <div className="absolute inset-[5%] rounded-full border border-sky-300/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_60%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.24),transparent_60%)]" />
          </div>

          <header className="relative space-y-2">
            <p className="text-[11px] uppercase tracking-[0.25em] text-sky-200/80">
              продукт
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Как устроена Athena
            </h1>
            <p className="max-w-2xl text-sm text-zinc-200/90">
              В центре — ИИ‑слой, который объединяет курсы в единый маршрут,
              следит за темпом и доводит тебя до результата.
            </p>
          </header>

          <div className="relative mt-8 grid gap-8 md:grid-cols-[1.1fr,1.1fr] items-center">
            {/* Левая часть: орбита с тремя спутниками‑слайдами */}
            <div className="relative h-[260px]">
              <div
                className="absolute inset-6 rounded-full border border-sky-300/40 bg-slate-950/40 backdrop-blur-xl"
                style={{
                  transform: `rotate(${orbitAngle}deg)`,
                  transition: "transform 900ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {SLIDES.map((slide, index) => {
                  const isActive = slide.id === active;
                  const baseAngle = (index / SLIDES.length) * 360;
                  const rad = (baseAngle * Math.PI) / 180;
                  const radius = 80;
                  const x = Math.cos(rad) * radius;
                  const y = Math.sin(rad) * radius;

                  return (
                    <button
                      key={slide.id}
                      onClick={() => {
                        setActive(slide.id);
                        setOrbitAngle(baseAngle);
                      }}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                      }}
                    >
                      <div
                        className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border text-[10px] font-medium uppercase tracking-[0.16em] ${
                          isActive
                            ? "border-sky-300/90 bg-sky-400/20 text-sky-50 shadow-[0_0_35px_rgba(56,189,248,0.9)]"
                            : "border-white/15 bg-slate-900/70 text-zinc-300/80 hover:border-sky-300/70 hover:text-sky-100"
                        }`}
                      >
                        <span>{slide.badge}</span>
                        {isActive && (
                          <span className="absolute inset-0 -z-10 rounded-2xl bg-sky-400/30 blur-xl" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* центральное «ядро» Athena */}
              <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-sky-200/80 bg-gradient-to-br from-sky-300 to-indigo-400 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_45px_rgba(56,189,248,0.95)]">
                <div className="flex h-full w-full items-center justify-center">
                  Athena
                </div>
              </div>
            </div>

            {/* Правая часть: переписывающаяся карта продукта */}
            <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-slate-950/70 px-5 py-5 shadow-[0_24px_70px_rgba(0,0,0,0.9)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-40" />
              <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl" />
              <div className="pointer-events-none absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />

              <div key={current.id} className="ai-panel-zoom space-y-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-sky-300/80">
                  {current.id === "route" && "как мы собираем маршрут"}
                  {current.id === "ai" && "как Athena подстраивает темп"}
                  {current.id === "result" && "как ты доходишь до результата"}
                </p>
                <h2 className="text-sm font-semibold text-zinc-50">
                  {current.title}
                </h2>
                <p className="text-sm text-zinc-200">{current.body}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
