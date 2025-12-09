"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

type Option = { value: string; label: string };
type Question = {
  id: number;
  section: "learning_style" | "memory" | "discipline";
  text: string;
  options: Option[];
};

export default function OnboardingPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const router = useRouter();

  const userId =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("userId"))
      : null;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("accessToken");
    const storedUserId = localStorage.getItem("userId");

    if (!token || !storedUserId) {
      setIsAuth(false);
      router.push("/login");
      return;
    }

    setIsAuth(true);

    async function fetchQuestions() {
      try {
        const res = await fetch(`${API_BASE_URL}/onboarding/questions/`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (e: any) {
        setError(e.message || "Не удалось загрузить вопросы");
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [router]);

  const handleChange = (qid: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      const payload = {
        answers: Object.fromEntries(
          Object.entries(answers).map(([k, v]) => [k.toString(), v])
        ),
      };

      const res = await fetch(`${API_BASE_URL}/onboarding/answers/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `API error: ${res.status}`);
      }

      const data = await res.json();
      console.log("Onboarding result:", data);
      setSuccess("Профиль обновлён! Стратегия сгенерирована.");

      if (userId) {
        setTimeout(() => {
          router.push(`/dashboard/${userId}`);
        }, 1500);
      }
    } catch (e: any) {
      setError(e.message || "Не удалось сохранить ответы");
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuth === null) {
    return (
      <div className="min-h-screen bg-slate-950 text-zinc-50 flex items-center justify-center">
        <p className="text-sm text-zinc-300">Проверяем доступ...</p>
      </div>
    );
  }

  if (isAuth === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-zinc-50">
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-indigo-300/80">
            онбординг
          </p>
          <h1 className="text-3xl font-semibold">Расскажем Athene, как ты учишься</h1>
          <p className="text-sm text-zinc-400">
            Ответь на вопросы о стиле обучения, памяти и дисциплине — Athena
            построит стратегию под твой профиль.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.75)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#38bdf816,_transparent_55%),radial-gradient(circle_at_bottom,_#a855f716,_transparent_55%)] opacity-80" />

          <div className="relative z-10">
            {loading && <p className="text-sm text-zinc-300">Загружаем вопросы...</p>}

            {error && (
              <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-200 border border-red-500/40">
                {error}
              </p>
            )}
            {success && (
              <p className="mb-4 rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 border border-emerald-500/40">
                {success}
              </p>
            )}

            {!loading && questions.length > 0 && (
              <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.7)]"
                  >
                    <p className="mb-3 text-sm font-medium text-zinc-50">
                      {q.id}. {q.text}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt) => (
                        <label
                          key={opt.value}
                          className={`cursor-pointer rounded-xl border px-3 py-2 text-sm transition ${
                            answers[q.id] === opt.value
                              ? "border-sky-400 bg-sky-400/10 text-sky-100"
                              : "border-white/10 bg-slate-900/60 text-zinc-200 hover:border-sky-300/60 hover:bg-slate-900"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={opt.value}
                            className="mr-2 accent-sky-400"
                            checked={answers[q.id] === opt.value}
                            onChange={() => handleChange(q.id, opt.value)}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-3 inline-flex items-center justify-center rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900 shadow-[0_14px_45px_rgba(15,23,42,0.7)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(56,189,248,0.6)] disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {submitting ? "Сохраняем..." : "Завершить онбординг"}
                    <span className="flex h-1 w-6 items-center gap-0.5">
                      <span className="dot-loader" />
                      <span className="dot-loader delay-75" />
                      <span className="dot-loader delay-150" />
                    </span>
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
