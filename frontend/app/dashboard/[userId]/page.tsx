"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";

const API_BASE_URL = "http://localhost:8000/api";

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
  const [openStrategyId, setOpenStrategyId] = useState<number | null>(null);

  const userId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("userId")
      : null;
  const accessToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem("accessToken")
      : null;

  const gamification = useMemo(() => {
    const totalStrategies = strategies.length;
    const totalSteps = strategies.reduce(
      (acc, s) => acc + (s.steps?.length || 0),
      0
    );
    const completedPercent = Math.min(
      100,
      totalStrategies > 0 ? 40 + totalStrategies * 10 : 0
    );
    const level = 1 + Math.floor(totalStrategies / 2);
    const xpCurrent = totalStrategies * 120 + totalSteps * 10;
    const xpNextLevel = 500 + level * 200;

    return {
      totalStrategies,
      totalSteps,
      completedPercent,
      level,
      xpCurrent,
      xpNextLevel,
    };
  }, [strategies]);

  // главная стратегия для блока "Рекомендации LLM" — первая из списка
  const mainStrategy = strategies[0] || null;

  const fetchDashboardData = async () => {
    if (!userId || !accessToken) {
      setError("Нет userId или токена. Перезайдите в систему.");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // профиль
      const resProfile = await fetch(`${API_BASE_URL}/profile/${userId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (resProfile.status === 404) {
        setProfile(null);
        setStrategies([]);
        setRecommendedCourses([]);
        setError(null);
        return;
      }

      if (!resProfile.ok) {
        throw new Error("Ошибка загрузки профиля");
      }

      const profileData = await resProfile.json();

      setProfile({
        learningstyle: profileData.learningstyle,
        memoryscore: profileData.memoryscore,
        disciplinescore: profileData.disciplinescore,
        recommendedformat: profileData.recommendedformat,
        recommendedpace: profileData.recommendedpace,
        strategysummary: profileData.strategysummary,
      });

      // рекомендации и, при наличии, стратегии
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
        // если /recommendations не вернул стратегии — добираем из отдельного эндпоинта
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

      // создаём/находим курс
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

      // генерируем стратегию LLM для этого курса
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

      await resStrategy.json();

      // перезагружаем дашборд — стратегии и верхний блок обновятся
      await fetchDashboardData();
      setStepikUrl("");
    } catch (e: any) {
      setError(e.message || "Ошибка при добавлении стратегии");
    } finally {
      setLoadingStrategy(false);
    }
  };

  if (loading && !profile) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-200 text-sm animate-pulse">
          Загрузка дашборда...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      {/* живой фон */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.08),transparent_60%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.08),transparent_60%)] opacity-70" />
        <div className="absolute inset-0 opacity-40">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-sky-300/70 animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto p-8 space-y-8 animate-fade-up">
        <header className="space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <span className="h-8 w-8 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-300 shadow-[0_0_25px_rgba(56,189,248,0.5)] group-hover:shadow-[0_0_40px_rgba(56,189,248,0.8)] transition-shadow">
              А
            </span>
            <span className="text-3xl font-semibold tracking-tight group-hover:text-sky-200 transition-colors">
              Афина — дашборд
            </span>
          </Link>

          <p className="text-sm text-slate-400">
            Твой ИИ‑слой, который следит за темпом, памятью и дисциплиной.
          </p>
        </header>

        {error && (
          <div className="bg-red-900/40 border border-red-500/60 text-red-100 px-4 py-2 rounded-xl backdrop-blur-md animate-fade-in">
            {error}
          </div>
        )}

        {/* ➕ Добавить курс Stepik */}
        <section className="bg-slate-900/50 border border-slate-700/70 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.9)] animate-fade-up">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
              ➕
            </span>
            Добавить курс Stepik
          </h2>
          <p className="text-sm text-slate-400">
            Вставь ссылку на курс — Афина найдёт его в базе и построит
            стратегию под твой профиль.
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              className="flex-1 rounded-xl bg-slate-950/70 border border-slate-700/70 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/60 transition-all"
              type="text"
              value={stepikUrl}
              onChange={(e) => setStepikUrl(e.target.value)}
              placeholder="https://stepik.org/course/59426/syllabus"
            />
            <button
              onClick={handleAddStrategy}
              disabled={loadingStrategy}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-sm font-medium shadow-[0_10px_30px_rgba(56,189,248,0.45)] hover:shadow-[0_12px_40px_rgba(56,189,248,0.75)] transition-all"
            >
              {loadingStrategy ? "Генерируем..." : "Добавить + стратегия"}
            </button>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Профиль обучения */}
          <section className="bg-slate-900/50 border border-slate-700/70 rounded-2xl p-6 space-y-3 backdrop-blur-xl animate-fade-up [animation-delay:80ms]">
            <h2 className="text-lg font-semibold">Профиль обучения</h2>
            {profile ? (
              <>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Стиль: {profile.learningstyle ?? "-"}</li>
                  <li>Память: {profile.memoryscore ?? "-"} / 10</li>
                  <li>Дисциплина: {profile.disciplinescore ?? "-"} / 10</li>
                  <li>Формат: {profile.recommendedformat ?? "-"}</li>
                  <li>Темп: {profile.recommendedpace ?? "-"}</li>
                </ul>

                <div className="mt-4 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Карта нагрузки
                  </p>
                  <div className="flex gap-1 h-2">
                    <div
                      className="flex-1 rounded-full bg-emerald-500/40"
                      style={{
                        opacity: ((profile.memoryscore ?? 5) / 10) || 0.5,
                      }}
                    />
                    <div
                      className="flex-1 rounded-full bg-sky-500/40"
                      style={{
                        opacity: ((profile.disciplinescore ?? 5) / 10) || 0.5,
                      }}
                    />
                    <div
                      className="flex-1 rounded-full bg-violet-500/40"
                      style={{
                        opacity: profile.recommendedpace ? 0.9 : 0.4,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Память</span>
                    <span>Дисциплина</span>
                    <span>Темп</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">
                Профиль ещё не создан. Сначала пройдите онбординг.
              </p>
            )}
          </section>

          {/* Рекомендации LLM */}
          <section className="relative rounded-2xl p-[1px] animate-fade-up [animation-delay:160ms]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-500 opacity-60 blur-md" />
            <div className="relative bg-slate-950/70 rounded-2xl border border-sky-500/40 backdrop-blur-2xl overflow-hidden shadow-[0_0_60px_rgba(56,189,248,0.55)]">
              <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),transparent_55%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.3),transparent_55%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.6),rgba(15,23,42,0.9))]" />

              <div className="relative p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/30 text-sky-100 text-sm shadow-[0_0_20px_rgba(56,189,248,0.8)]">
                    ✦
                  </span>
                  <h2 className="text-lg font-semibold tracking-tight text-sky-50">
                    Рекомендации LLM
                  </h2>
                </div>

                <p className="text-xs uppercase tracking-[0.25em] text-sky-300/80">
                  ЛИЧНЫЙ ИИ‑НАСТАВНИК
                </p>

                {mainStrategy ? (
                  <>
                    <p className="text-sm text-sky-50/90 whitespace-pre-line leading-relaxed">
                      {mainStrategy.summary}
                    </p>

                    {mainStrategy.format_tips &&
                      mainStrategy.format_tips.length > 0 && (
                        <ul className="mt-2 text-xs text-sky-100/80 list-disc list-inside space-y-1">
                          {mainStrategy.format_tips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      )}
                  </>
                ) : (
                  <p className="text-sm text-sky-100/80">
                    Пока нет рекомендаций. Пройдите онбординг или добавьте курс
                    Stepik, и Афина соберёт для вас первую ИИ‑стратегию.
                  </p>
                )}

                <div className="mt-4 h-16 relative overflow-hidden rounded-xl border border-sky-500/40 bg-slate-900/60">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,_rgba(56,189,248,0.5),transparent_60%),radial-gradient(circle_at_right,_rgba(168,85,247,0.45),transparent_60%)] opacity-80 animate-pulse" />
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.2),rgba(15,23,42,0.9))]" />
                  <div className="relative h-full flex items-center justify-between px-4 text-[11px] text-sky-100/80">
                    <span>Темп • Память • Дисциплина</span>
                    <span className="text-sky-300/90">
                      Обновление каждую неделю
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Прогресс и геймификация Афины */}
        <section className="bg-slate-900/60 border border-emerald-500/40 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-[0_24px_80px_rgba(16,185,129,0.4)] animate-fade-up [animation-delay:210ms]">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/30 text-xs text-emerald-100">
              ⚡
            </span>
            Прогресс и геймификация Афины
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-200">
            {/* Уровень */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80">
                Уровень
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold">
                  {gamification.level}
                </span>
                <span className="text-xs text-slate-400">
                  XP {gamification.xpCurrent} / {gamification.xpNextLevel}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-purple-400 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (gamification.xpCurrent / gamification.xpNextLevel) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Маршрут */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80">
                Маршрут
              </p>
              <p>
                Стратегий:{" "}
                <span className="font-semibold">
                  {gamification.totalStrategies}
                </span>
              </p>
              <p>
                Шагов в планах:{" "}
                <span className="font-semibold">
                  {gamification.totalSteps}
                </span>
              </p>
              <p className="text-xs text-slate-400">
                Афина считает тебя активным, если есть хотя бы 1 стратегия.
              </p>
            </div>
          </div>
        </section>


        {/* Ваши стратегии */}
        <section className="bg-slate-900/60 border border-slate-700/80 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-[0_24px_80px_rgba(15,23,42,0.95)] animate-fade-up [animation-delay:240ms]">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-300">
              ●
            </span>
            Ваши стратегии ({strategies.length})
          </h2>

          {strategies.length === 0 ? (
            <p className="text-sm text-slate-400">
              Стратегий пока нет. Добавьте курс Stepik, чтобы сгенерировать
              первую стратегию.
            </p>
          ) : (
            <div className="space-y-3">
              {strategies.map((s, index) => {
                const isOpen = openStrategyId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setOpenStrategyId(isOpen ? null : s.id)
                    }
                    className={[
                      "w-full text-left rounded-2xl border transition-all duration-300",
                      "bg-slate-950/60 border-slate-800/80 hover:border-sky-500/80 hover:bg-slate-900/80",
                      "shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_40px_rgba(56,189,248,0.35)]",
                      isOpen
                        ? "border-sky-500/80 shadow-[0_0_40px_rgba(56,189,248,0.45)]"
                        : "",
                      "animate-fade-up",
                      `[animation-delay:${260 + index * 40}ms]`,
                    ].join(" ")}
                  >
                    <div className="p-4 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                            Курс
                          </span>
                          <span className="h-1 w-1 rounded-full bg-slate-500" />
                          <span className="text-xs text-slate-400">
                            Уровень: {s.course.level}
                          </span>
                        </div>
                        <div className="text-base font-semibold text-slate-50">
                          {s.course.title || "Курс без названия"}
                        </div>
                        {s.pace && (
                          <p className="text-xs text-slate-400">
                            Темп: {s.pace}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {s.course.url && (
                          <a
                            href={s.course.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-sky-400 hover:text-sky-300 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Открыть на Stepik
                          </a>
                        )}
                        <span
                          className={[
                            "inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs",
                            "border-sky-500/60 bg-sky-500/10 text-sky-300",
                            "transition-transform duration-300",
                            isOpen ? "rotate-180" : "",
                          ].join(" ")}
                        >
                          ▾
                        </span>
                      </div>
                    </div>

                    <div
                      className={[
                        "grid transition-all duration-300 ease-out",
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0",
                      ].join(" ")}
                    >
                      <div className="overflow-hidden px-4 pb-4">
                        {s.summary && (
                          <p className="text-sm text-slate-200 mb-3 whitespace-pre-line">
                            {s.summary}
                          </p>
                        )}

                        {s.format_tips && s.format_tips.length > 0 && (
                          <ul className="mt-1 text-xs text-slate-300/90 list-disc list-inside space-y-1">
                            {s.format_tips.map((tip, i) => (
                              <li key={i}>{tip}</li>
                            ))}
                          </ul>
                        )}

                        {s.steps && s.steps.length > 0 && (
                          <div className="mt-4 border-t border-slate-800/80 pt-3 space-y-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              План по шагам
                            </p>
                            <ol className="space-y-2 text-xs text-slate-200">
                              {s.steps.map((step, idx) => (
                                <li key={idx} className="flex gap-2">
                                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-sky-500/20 text-[10px] flex items-center justify-center text-sky-300">
                                    {idx + 1}
                                  </span>
                                  <div>
                                    <div className="font-medium">
                                      {step.title}
                                    </div>
                                    <div className="text-slate-400">
                                      {step.description}
                                    </div>
                                    {step.recommended_time && (
                                      <div className="text-[10px] text-slate-500 mt-0.5">
                                        ~ {step.recommended_time} мин.
                                      </div>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Курсы в базе Афины */}
        <section className="bg-slate-900/50 border border-slate-700/70 rounded-2xl p-6 space-y-4 backdrop-blur-xl animate-fade-up [animation-delay:280ms]">
          <h2 className="text-lg font-semibold">Курсы в базе Афины</h2>
          {recommendedCourses.length === 0 ? (
            <p className="text-sm text-slate-400">
              Пока нет курсов в базе под ваш профиль.
            </p>
          ) : (
            <ul className="space-y-2 text-sm text-slate-300">
              {recommendedCourses.map((c, idx) => (
                <li
                  key={c.id}
                  className="flex flex-col rounded-xl bg-slate-950/40 border border-slate-800/80 px-3 py-2 hover:border-sky-500/70 hover:bg-slate-900/80 transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${300 + idx * 30}ms` } as any}
                >
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
