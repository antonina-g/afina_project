"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

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

  // Берём userId из localStorage (установлен при регистрации)
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
    router.push("/login");     // неавторизованных уводим на логин
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
      // 1. Берём accessToken из localStorage (установлен при регистрации)
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      // 2. Формируем payload только с ответами (без user_id)
      const payload = {
        answers: Object.fromEntries(
          Object.entries(answers).map(([k, v]) => [k.toString(), v])
        ),
      };

      // 3. Делаем запрос с Authorization в headers
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
      setSuccess("Профиль обновлён! Стратегия сгенерирована.");
      console.log("Onboarding result:", data);

      // 4. После успеха редиректим на дашборд
      if (userId) {
        setTimeout(() => {
          router.push(`/dashboard/${userId}`);
        }, 1500); // даём время на отображение success сообщения
      }
    } catch (e: any) {
      setError(e.message || "Не удалось сохранить ответы");
    } finally {
      setSubmitting(false);
    }
  };

    if (isAuth === null) {
    return <p className="p-4">Проверяем доступ...</p>;
  }

  if (isAuth === false) {
    return null; // или тут можно показать текст "нужно войти"
  }


  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-bold">Онбординг Afina</h1>
        <p className="mb-6 text-zinc-600">
          Ответь на вопросы, чтобы мы настроили стиль обучения под тебя.
        </p>

        {loading && <p>Загружаем вопросы...</p>}
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </p>
        )}

        {!loading && questions.length > 0 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((q) => (
              <div
                key={q.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <p className="mb-3 text-sm font-medium text-zinc-800">
                  {q.id}. {q.text}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt) => (
                    <label
                      key={opt.value}
                      className={`cursor-pointer rounded-md border px-3 py-2 text-sm transition ${
                        answers[q.id] === opt.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt.value}
                        className="mr-2"
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
              className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Сохраняем..." : "Завершить онбординг"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
