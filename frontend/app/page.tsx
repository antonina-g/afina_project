"use client";

import { useEffect, useState } from "react";
import UserProfile from "./components/UserProfile";

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
    window.location.href = `/dashboard/${userId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-zinc-50">
      {/* Хедер */}
      <header className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white">Afina</h1>
          <p className="text-xs text-gray-400">Персонализированное обучение</p>
        </div>
        <UserProfile />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-500 to-fuchsia-600 px-6 py-12 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:px-10">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,_#ffffff40,_transparent_60%)]" />
          <div className="relative z-10 space-y-6">
            <p className="text-xs uppercase tracking-[0.25em] text-blue-100/80">
              персонализированное обучение
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              Афина помогает учиться
              <br />
              в темпе, который подходит именно тебе
            </h1>
            <p className="max-w-2xl text-sm sm:text-base text-blue-50/95">
              Платформа анализирует стиль обучения, память и самодисциплину и
              строит под тебя индивидуальную стратегию на основе реальных
              онлайн‑курсов.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleStartOnboarding}
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-blue-50"
              >
                {isLoggedIn ? "Начать онбординг" : "Начать обучение"}
              </button>
              {isLoggedIn && (
                <button
                  onClick={handleGoToDashboard}
                  className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-2.5 text-sm font-medium text-white/95 backdrop-blur transition hover:bg-white/10"
                >
                  Перейти к дашборду
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Преимущества */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm">
            <h3 className="mb-2 text-sm font-semibold">Анализ стиля обучения</h3>
            <p className="text-xs leading-relaxed text-zinc-200">
              Афина учитывает, как ты воспринимаешь информацию, чтобы подобрать
              формат материалов и темп прохождения.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm">
            <h3 className="mb-2 text-sm font-semibold">Единый маршрут по курсам</h3>
            <p className="text-xs leading-relaxed text-zinc-200">
              Вместо бесконечного выбора из каталогов — прозрачный маршрут:
              какие курсы и в каком порядке проходить.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm">
            <h3 className="mb-2 text-sm font-semibold">Фокус на результате</h3>
            <p className="text-xs leading-relaxed text-zinc-200">
              План закрепления, напоминания и контроль прогресса помогают дойти
              до конца программы, а не остановиться на середине.
            </p>
          </div>
        </section>

        {/* Курсы */}
        <section className="space-y-4 rounded-3xl border border-white/8 bg-slate-950/70 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Курсы в базе Афины</h2>
              <p className="text-xs text-zinc-400">
                Эти курсы используются для построения персональных стратегий.
              </p>
            </div>
            <span className="text-[10px] text-zinc-500">
              API: {API_BASE_URL}
            </span>
          </div>

          {loading && <p className="text-sm text-zinc-300">Загружаем курсы...</p>}
          {error && (
            <p className="text-sm text-red-400">Ошибка: {error}</p>
          )}

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

        {/* Футер */}
        <footer className="flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-zinc-500">
          <span>Afina · персонализированное обучение</span>
          <span>Локальная среда разработки · localhost</span>
        </footer>
      </main>
    </div>
  );
}
