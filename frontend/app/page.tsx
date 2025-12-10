"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import UserProfile from "./components/UserProfile";
import { useInView } from "./components/useInView";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

type Course = {
  id: number;
  title: string;
  level: string;
  language: string;
  url: string;
};

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const benefitsInView = useInView(0.2);
  const coursesInView = useInView(0.2);

  const heroRef = useRef<HTMLDivElement | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handleMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / 40;
      const y = (e.clientY - (rect.top + rect.height / 2)) / 40;
      setParallax({ x, y });
    };

    const handleLeave = () => setParallax({ x: 0, y: 0 });

    hero.addEventListener("mousemove", handleMove);
    hero.addEventListener("mouseleave", handleLeave);
    return () => {
      hero.removeEventListener("mousemove", handleMove);
      hero.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    setIsLoggedIn(!!token);

    async function fetchCourses() {
      try {
        const res = await fetch(`${API_BASE_URL}/courses/`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setCourses(data.courses || []);
      } catch (e: any) {
        setError(e.message || "Не удалось загрузить курсы");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  const handleStartOnboarding = () => {
    if (isLoggedIn) {
      window.location.href = "/onboarding";
    } else {
      window.location.href = "/register";
    }
  };

  const handleGoToDashboard = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      window.location.href = `/dashboard/${userId}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-zinc-50">
      {/* navbar */}
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image
                src="/logo.png"
                alt="Athena logo"
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Athena</p>
              <p className="text-[11px] text-gray-400">
                Персонализированное обучение с ИИ‑стратегиями
              </p>
            </div>
          </div>

          {/* вкладка «Курсы» убрана */}
          <nav className="hidden items-center gap-6 text-xs text-zinc-300 md:flex">
            <a href="/product" className="hover:text-white transition">
              Продукт
            </a>
            <a href="/how-it-works" className="hover:text-white transition">
              Как это работает
            </a>
            <a href="/ai-strategy" className="hover:text-white transition">
              ИИ‑стратегия
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {!isLoggedIn && (
              <>
                <a
                  href="/login"
                  className="hidden text-xs text-zinc-300 hover:text-white md:inline"
                >
                  Войти
                </a>
                <a
                  href="/register"
                  className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-white/20"
                >
                  Зарегистрироваться
                </a>
              </>
            )}
            <UserProfile />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-10 space-y-12">
        {/* HERO */}
        <section
          ref={heroRef}
          className="relative overflow-hidden rounded-3xl px-6 py-12 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:px-10 hero-animated-bg"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen"
            style={{
              transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
              transition: "transform 0.12s ease-out",
            }}
          >
            <svg
              className="h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid"
                  x="0"
                  y="0"
                  width="24"
                  height="24"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="1" cy="1" r="1" fill="rgba(148,163,184,0.35)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,_#ffffff40,_transparent_60%)]" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 bottom-[-80px] h-72 w-72 rounded-full bg-purple-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-6 bottom-6 h-40 w-40 rounded-[2.5rem] border border-white/25 bg-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.55)] backdrop-blur-2xl hero-glass-blob" />

          <div className="pointer-events-none absolute inset-x-6 bottom-0 h-1 rounded-t-full bg-gradient-to-r from-emerald-400/40 via-indigo-400/40 to-fuchsia-400/40 blur-[2px] animate-[heroGlow_4s_ease-in-out_infinite]" />

          <div className="relative z-10 space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-blue-100/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-ping" />
              персонализированное обучение
            </p>

            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              Athena подстраивает обучение
              <br />
              под твой темп, память и дисциплину
            </h1>

            <p className="max-w-2xl text-sm sm:text-base text-blue-50/95">
              Ответь на несколько вопросов — и Athena с помощью ИИ построит
              маршрут по онлайн‑курсам, который подходит именно тебе: формат,
              нагрузка и стратегия закрепления.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleStartOnboarding}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-7 py-2.5 text-sm font-medium text-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.45)] transition-transform transition-shadow hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgba(56,189,248,0.55)] active:translate-y-0"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isLoggedIn ? "Начать онбординг" : "Начать обучение"}
                  <span className="flex h-1 w-6 items-center gap-0.5">
                    <span className="dot-loader" />
                    <span className="dot-loader delay-75" />
                    <span className="dot-loader delay-150" />
                  </span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-sky-100 via-white to-sky-100 opacity-0 transition group-hover:opacity-100" />
              </button>

              {isLoggedIn && (
                <button
                  onClick={handleGoToDashboard}
                  className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-2.5 text-sm font-medium text-white/95 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Перейти к дашборду
                </button>
              )}
            </div>

            {/* 3D‑карта маршрута */}
            <div className="mt-6 space-y-3">
              <p className="text-xs uppercase tracking-[0.22em] text-blue-100/80">
                твой будущий маршрут
              </p>
              <p className="text-sm text-blue-50/90">
                Так будет выглядеть твой персональный маршрут: Athena сама
                подберёт курсы, порядок и нагрузку.
              </p>

              <div className="relative mt-2 h-40 sm:h-44">
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-black/20 backdrop-blur-xl" />
                <div className="relative flex h-full items-center justify-center gap-4 perspective-[1200px]">
                  <div className="group relative w-40 max-w-[45%] -translate-y-2 rotate-[-10deg] transform-gpu rounded-2xl border border-white/15 bg-slate-950/70 px-3 py-3 text-[11px] shadow-[0_14px_40px_rgba(0,0,0,0.6)] transition hover:-translate-y-4 hover:rotate-[-6deg] hover:border-emerald-300/70 hover:shadow-[0_22px_60px_rgba(16,185,129,0.5)] sm:w-48">
                    <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-emerald-300/80">
                      шаг 1
                    </p>
                    <p className="font-semibold text-zinc-50">
                      Базовый Python
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      Выравниваем фундамент и синтаксис.
                    </p>
                  </div>

                  <div className="group relative w-44 max-w-[48%] translate-y-3 rotate-[-2deg] transform-gpu rounded-2xl border border-white/20 bg-slate-950/80 px-3 py-3 text-[11px] shadow-[0_16px_45px_rgba(0,0,0,0.65)] transition hover:-translate-y-2 hover:rotate-0 hover:border-blue-400/70 hover:shadow-[0_24px_70px_rgba(59,130,246,0.55)] sm:w-52">
                    <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-blue-300/80">
                      шаг 2
                    </p>
                    <p className="font-semibold text-zinc-50">
                      Алгоритмы и структуры данных
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      Упор на задачи под твой темп и память.
                    </p>
                  </div>

                  <div className="group relative w-40 max-w-[45%] -translate-y-4 rotate-[8deg] transform-gpu rounded-2xl border border-white/15 bg-slate-950/60 px-3 py-3 text-[11px] shadow-[0_12px_35px_rgба(0,0,0,0.6)] transition hover:-translate-y-6 hover:rotate-[4deg] hover:border-fuchsia-400/70 hover:shadow-[0_22px_60px_rgba(236,72,153,0.55)] sm:w-48">
                    <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-fuchsia-300/80">
                      шаг 3
                    </p>
                    <p className="font-semibold text-zinc-50">
                      Практический проект
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      Закрепляем маршрут одним цельным проектом.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* чипы «как Athena подстраивается» */}
        <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.6)]">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-50">
                Как Athena подстраивается под тебя
              </h2>
              <p className="text-xs text-zinc-400">
                ИИ‑стратегия учитывает три ключевых оси: память, темп и
                дисциплину.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="group relative flex-1 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs shadow-[0_10px_35px_rgba(0,0,0,0.6)] transition hover:-translate-y-1 hover:border-emerald-300/70 hover:bg-emerald-400/5">
              <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-emerald-400/20 blur-2xl transition group-hover:bg-emerald-400/35" />
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/90">
                память
              </p>
              <p className="text-[11px] text-zinc-300">
                Athena настраивает длину сессий и повторы под то, как ты
                запоминаешь: короткие спринты или глубокие погружения.
              </p>
            </div>

            <div className="group relative flex-1 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs shadow-[0_10px_35px_rgба(0,0,0,0.6)] transition hover:-translate-y-1 hover:border-sky-300/70 hover:bg-sky-400/5">
              <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-sky-400/20 blur-2xl transition group-hover:bg-sky-400/35" />
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300/90">
                темп
              </p>
              <p className="text-[11px] text-zinc-300">
                Отслеживаем, как часто ты заходишь и сколько делаешь, и
                автоматически подстраиваем недельную нагрузку.
              </p>
            </div>

            <div className="group relative flex-1 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs shadow-[0_10px_35px_rgба(0,0,0,0.6)] transition hover:-translate-y-1 hover:border-fuchsia-300/70 hover:bg-fuchsia-400/5">
              <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-fuchsia-400/20 blur-2xl transition group-hover:bg-fuchsia-400/35" />
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-300/90">
                дисциплина
              </p>
              <p className="text-[11px] text-zinc-300">
                Напоминания, челленджи и видимый прогресс в маршруте помогают
                не срываться даже в загруженные недели.
              </p>
            </div>
          </div>
        </section>

        {/* преимущества */}
        <section
          ref={benefitsInView.ref}
          className={`grid gap-6 md:grid-cols-3 transition-all duration-700 ${
            benefitsInView.inView
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm transition hover:-translate-y-1 hover:border-indigo-400/70 hover:bg-white/[0.06]">
            <h3 className="mb-2 text-sm font-semibold">
              Анализ стиля обучения
            </h3>
            <p className="text-xs leading-relaxed text-zinc-200">
              Athena учитывает, как ты воспринимаешь информацию, чтобы подобрать
              формат материалов и темп прохождения.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm transition hover:-translate-y-1 hover:border-indigo-400/70 hover:bg-white/[0.06]">
            <h3 className="mb-2 text-sm font-semibold">
              Единый маршрут по курсам
            </h3>
            <p className="text-xs leading-relaxed text-zinc-200">
              Вместо бесконечного выбора из каталогов — прозрачный маршрут:
              какие курсы и в каком порядке проходить.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm transition hover:-translate-y-1 hover:border-indigo-400/70 hover:bg-white/[0.06]">
            <h3 className="mb-2 text-sm font-semibold">
              Фокус на результате
            </h3>
            <p className="text-xs leading-relaxed text-zinc-200">
              План закрепления, напоминания и контроль прогресса помогают дойти
              до конца программы, а не остановиться на середине.
            </p>
          </div>
        </section>

        {/* курсы в базе Athena */}
        <section
          ref={coursesInView.ref}
          className={`space-y-4 rounded-3xl border border-white/8 bg-slate-950/70 p-6 shadow-[0_18px_60px_rgба(0,0,0,0.55)] transition-all duration-700 ${
            coursesInView.inView
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Курсы в базе Athena</h2>
              <p className="text-xs text-zinc-400">
                Эти курсы используются для построения персональных стратегий.
              </p>
            </div>
            <span className="text-[10px] text-zinc-500">
              API: {API_BASE_URL}
            </span>
          </div>

          {loading && (
            <p className="text-sm text-zinc-300">Загружаем курсы...</p>
          )}
          {error && <p className="text-sm text-red-400">Ошибка: {error}</p>}

          {!loading && !error && courses.length === 0 && (
            <p className="text-sm text-zinc-300">Курсы не найдены.</p>
          )}

          <ul className="space-y-3">
            {courses.map((course) => (
              <li
                key={course.id}
                className="rounded-xl border border-white/8 bg-slate-900/80 p-4 transition hover:border-blue-400/70 hover:bg-slate-900"
              >
                <a
                  href={course.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-blue-300 hover:text-blue-200 hover:underline"
                >
                  {course.title}
                </a>
                <p className="mt-1 text-[11px] text-zinc-400">
                  Уровень: {course.level} · Язык: {course.language}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <footer className="flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-zinc-500">
          <span>Athena · персонализированное обучение</span>
          <span>Локальная среда разработки · localhost</span>
        </footer>
      </main>
    </div>
  );
}
