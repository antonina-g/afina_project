"use client";

import { useEffect, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

type StrategyItem = {
  course_id: number;
  course_title: string;
  created_at: string;
  summary?: string;
  pace?: string;
};

type ProfileResponse = {
  user_id: number;
  username: string;
  learning_style: string | null;
  memory_score: number | null;
  discipline_score: number | null;
  recommended_format: string | null;
  recommended_pace: string | null;
  strategy_summary: string;
  goals: string;
  interests: string;
  strategies: StrategyItem[];
};

type RecommendationCourse = {
  id: number;
  title: string;
  level: string;
  language: string;
  format_type: string;
  url: string;
};

type RecommendationsResponse = {
  user_id: number;
  profile: {
    learning_style: string | null;
    memory_score: number | null;
    discipline_score: number | null;
    recommended_format: string | null;
    recommended_pace: string | null;
    strategy_summary: string;
  };
  courses: RecommendationCourse[];
};

export default function DashboardPage({
  params,
}: {
  params: { userId: string };
}) {
  const userId = params.userId;

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [recs, setRecs] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, recsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/profile/${userId}/`),
          fetch(`${API_BASE_URL}/recommendations/${userId}/`),
        ]);

        if (!profileRes.ok) throw new Error(`Profile error: ${profileRes.status}`);
        if (!recsRes.ok) throw new Error(`Recs error: ${recsRes.status}`);

        const profileData = await profileRes.json();
        const recsData = await recsRes.json();

        setProfile(profileData);
        setRecs(recsData);
      } catch (e: any) {
        setError(e.message || "Не удалось загрузить дашборд");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  return (
    <div className="min-h-screen bg-slate-950 text-zinc-50">
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
            профиль и стратегия
          </p>
          <h1 className="text-3xl font-semibold">Afina — дашборд пользователя</h1>
          <p className="text-sm text-zinc-400">Пользователь ID: {userId}</p>
        </header>

        {loading && <p className="text-sm text-zinc-300">Загружаем данные…</p>}
        {error && (
          <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        {!loading && !error && profile && (
          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg">
              <h2 className="mb-3 text-sm font-semibold text-zinc-100">
                Когнитивный профиль
              </h2>
              <ul className="space-y-1 text-xs text-zinc-200">
                <li>
                  Стиль обучения:{" "}
                  <span className="font-medium">
                    {profile.learning_style ?? "—"}
                  </span>
                </li>
                <li>
                  Память:{" "}
                  <span className="font-medium">
                    {profile.memory_score ?? "—"}
                  </span>{" "}
                  / 10
                </li>
                <li>
                  Самодисциплина:{" "}
                  <span className="font-medium">
                    {profile.discipline_score ?? "—"}
                  </span>{" "}
                  / 10
                </li>
                <li>
                  Рекомендуемый формат:{" "}
                  <span className="font-medium">
                    {profile.recommended_format ?? "—"}
                  </span>
                </li>
                <li>
                  Рекомендуемый темп:{" "}
                  <span className="font-medium">
                    {profile.recommended_pace ?? "—"}
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg">
              <h2 className="mb-3 text-sm font-semibold text-zinc-100">
                Краткая стратегия обучения
              </h2>
              <p className="text-xs leading-relaxed text-zinc-200 whitespace-pre-line">
                {profile.strategy_summary || "Стратегия пока не сгенерирована."}
              </p>
            </div>
          </section>
        )}

        {!loading && !error && profile && profile.strategies.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg">
            <h2 className="mb-3 text-sm font-semibold text-zinc-100">
              Стратегии по курсам
            </h2>
            <ul className="space-y-3 text-xs text-zinc-200">
              {profile.strategies.map((s) => (
                <li
                  key={`${s.course_id}-${s.created_at}`}
                  className="rounded-xl border border-white/10 bg-slate-950/70 p-4"
                >
                  <div className="text-sm font-medium text-zinc-50">
                    {s.course_title}
                  </div>
                  {s.summary && (
                    <p className="mt-1 text-xs text-zinc-200">
                      Резюме: {s.summary}
                    </p>
                  )}
                  {s.pace && (
                    <p className="mt-1 text-xs text-zinc-400">Темп: {s.pace}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {!loading && !error && recs && recs.courses.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg">
            <h2 className="mb-3 text-sm font-semibold text-zinc-100">
              Рекомендованные курсы
            </h2>
            <ul className="space-y-3 text-xs">
              {recs.courses.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-1 rounded-xl border border-white/10 bg-slate-950/70 p-4"
                >
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-blue-300 hover:text-blue-200 hover:underline"
                  >
                    {c.title}
                  </a>
                  <span className="text-[11px] text-zinc-400">
                    Уровень: {c.level} · Язык: {c.language} · Формат:{" "}
                    {c.format_type || "—"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
