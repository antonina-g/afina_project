"use client";

import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8000/api"; // при необходимости поменяй

type Profile = {
  learningstyle?: string;
  memoryscore?: number;
  disciplinescore?: number;
  recommendedformat?: string;
  recommendedpace?: string;
  strategysummary?: string;
};

type StrategyStep = {
  title: string;
  description: string;
  recommended_time?: number;
};

type Strategy = {
  id: number;
  course: {
    id: number;
    title: string;
    level: string;
    url: string;
  };
  summary: string;
  pace: string;
  format_tips: string[];
  steps: StrategyStep[];
  created_at: string;
  updated_at: string;
};

type RecommendedCourse = {
  id: number;
  title: string;
  level: string;
  language: string;
  formattype: string;
};

type RecommendationsResponse = {
  strategies?: Strategy[];
  courses?: RecommendedCourse[];
};

const DashboardPage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<
    RecommendedCourse[]
  >([]);
  const [stepikUrl, setStepikUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("userId")
      : null;
  const accessToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem("accessToken")
      : null;

  const fetchDashboardData = async () => {
    if (!userId || !accessToken) {
      setError("Нет userId или токена. Перезайдите в систему.");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // Профиль
      const resProfile = await fetch(`${API_BASE_URL}/profile/${userId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!resProfile.ok) {
        throw new Error("Ошибка загрузки профиля");
      }
      const profileData = await resProfile.json();

      setProfile({
        learningstyle: profileData.learning_style,
        memoryscore: profileData.memory_score,
        disciplinescore: profileData.discipline_score,
        recommendedformat: profileData.recommended_format,
        recommendedpace: profileData.recommended_pace,
        strategysummary: profileData.strategy_summary,
      });

      // Рекомендации (в т.ч. курсы, возможно стратегии)
      const resRecs = await fetch(
        `${API_BASE_URL}/recommendations/${userId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!resRecs.ok) {
        throw new Error("Ошибка загрузки рекомендаций");
      }
      const recsData: RecommendationsResponse = await resRecs.json();

      if (recsData.strategies) {
        setStrategies(recsData.strategies);
      } else {
        // Если recommendations стратегий не отдает, запрашиваем отдельно
        const resStrategies = await fetch(
          `${API_BASE_URL}/users/${userId}/strategies/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (resStrategies.ok) {
          const sData = await resStrategies.json();
          setStrategies(sData.strategies || []);
        } else {
          setStrategies([]);
        }
      }

      setRecommendedCourses(recsData.courses || []);
    } catch (e: any) {
      setError(e.message || "Ошибка загрузки дашборда");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddStrategy = async () => {
    if (!userId || !accessToken) {
      setError("Нет userId или токена.");
      return;
    }
    if (!stepikUrl) {
      setError("Введите ссылку на курс Stepik.");
      return;
    }

    try {
      setError(null);
      setLoadingStrategy(true);

      // 1. Создаем/находим курс
      const resCourse = await fetch(`${API_BASE_URL}/add-course/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ stepik_url: stepikUrl }),
      });

      if (!resCourse.ok) {
        const err = await resCourse.json().catch(() => ({}));
        throw new Error(err.error || "Ошибка добавления курса");
      }

      const courseData = await resCourse.json();
      const courseId = courseData.course.id;

      // 2. Генерируем стратегию
      const resStrategy = await fetch(
        `${API_BASE_URL}/users/${userId}/strategies/generate/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ course_id: courseId }),
        }
      );

      if (!resStrategy.ok) {
        const err = await resStrategy.json().catch(() => ({}));
        throw new Error(err.error || "Ошибка генерации стратегии");
      }

      await resStrategy.json(); // если нужно, можно использовать ответ

            // 3. Обновляем дашборд
      await fetchDashboardData();
      setStepikUrl("");
    } catch (e: any) {
      setError(e.message || "Ошибка при добавлении стратегии");
    } finally {
      setLoadingStrategy(false);
    }
  };

  const activeStrategy = strategies[0] || null;

  if (loading && !profile) {
    return <div className="text-white p-8">Загрузка дашборда...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2">
          <div className="text-sm text-slate-400">ID: {userId}</div>
          <h1 className="text-3xl font-bold">Афина</h1>
          <p className="text-slate-400">
            Ваш персонализированный дашборд.
          </p>
        </header>

        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-100 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {/* ➕ Добавить курс Stepik */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-xl">➕</span> Добавить курс Stepik
          </h2>
          <p className="text-sm text-slate-400">
            Введите ссылку на курс Stepik → курс сохранится в базе → будет
            сгенерирована персональная стратегия.
          </p>
          <div className="flex gap-3">
            <input
              className="flex-1 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500"
              type="text"
              value={stepikUrl}
              onChange={(e) => setStepikUrl(e.target.value)}
              placeholder="https://stepik.org/course/59426/syllabus"
            />
            <button
              onClick={handleAddStrategy}
              disabled={loadingStrategy}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-sm font-medium"
            >
              {loadingStrategy ? "Генерируем..." : "Добавить + стратегия"}
            </button>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Профиль обучения */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-2">
            <h2 className="text-lg font-semibold">Профиль обучения</h2>
            {profile ? (
              <ul className="text-sm text-slate-300 space-y-1">
                <li>Стиль: {profile.learningstyle ?? "-"}</li>
                <li>
                  Память: {profile.memoryscore ?? "-"} / 10
                </li>
                <li>
                  Дисциплина: {profile.disciplinescore ?? "-"} / 10
                </li>
                <li>Формат: {profile.recommendedformat ?? "-"}</li>
                <li>Темп: {profile.recommendedpace ?? "-"}</li>
              </ul>
            ) : (
              <p className="text-sm text-slate-400">
                Профиль не найден. Пройдите онбординг.
              </p>
            )}
          </section>

          {/* Рекомендации LLM */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-2">
            <h2 className="text-lg font-semibold">Рекомендации LLM</h2>
            {activeStrategy?.summary ? (
              <p className="text-sm text-slate-300 whitespace-pre-line">
                {activeStrategy.summary}
              </p>
            ) : profile?.strategysummary ? (
              <p className="text-sm text-slate-300 whitespace-pre-line">
                {profile.strategysummary}
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Пока нет рекомендаций. Добавьте курс, чтобы получить
                персональную стратегию.
              </p>
            )}
          </section>
        </div>

        {/* Ваши стратегии */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            Ваши стратегии ({strategies.length})
          </h2>
          {strategies.length === 0 ? (
            <p className="text-sm text-slate-400">
              Стратегий пока нет. Добавьте курс Stepik, чтобы сгенерировать
              первую стратегию.
            </p>
          ) : (
            <div className="space-y-3">
              {strategies.map((s) => (
                <div
                  key={s.id}
                  className="border border-slate-800 rounded-lg p-4 bg-slate-950/40"
                >
                  <div className="flex justify-between items-center gap-2">
                    <div>
                      <div className="font-medium">
                        {s.course.title || "Курс без названия"}
                      </div>
                      <div className="text-xs text-slate-400">
                        Уровень: {s.course.level}
                      </div>
                    </div>
                    {s.course.url && (
                      <a
                        href={s.course.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-400 hover:underline"
                      >
                        Открыть на Stepik
                      </a>
                    )}
                  </div>

                  {s.summary && (
                    <p className="mt-2 text-sm text-slate-300 line-clamp-3">
                      {s.summary}
                    </p>
                  )}

                                    {s.pace && (
                    <p className="mt-1 text-xs text-slate-400">
                      Темп: {s.pace}
                    </p>
                  )}

                  {s.format_tips && s.format_tips.length > 0 && (
                    <ul className="mt-2 text-xs text-slate-400 list-disc list-inside space-y-0.5">
                      {s.format_tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Рекомендованные курсы */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Рекомендованные курсы</h2>
          {recommendedCourses.length === 0 ? (
            <p className="text-sm text-slate-400">
              Пока нет рекомендованных курсов.
            </p>
          ) : (
            <ul className="space-y-2 text-sm text-slate-300">
              {recommendedCourses.map((c) => (
                <li key={c.id} className="flex flex-col">
                  <span className="font-medium">{c.title}</span>
                  <span className="text-xs text-slate-400">
                    {c.level} • {c.language} • {c.formattype}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default DashboardPage;
