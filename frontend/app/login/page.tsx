"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Неверные учётные данные");
      }

      setSuccess("Вход успешен! Переводим на главную...");

      // Сохраняем все данные в localStorage
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("userId", String(data.user_id));
      localStorage.setItem("username", data.username);  // ← ДОБАВЬ
      localStorage.setItem("email", data.email);        // ← ДОБАВЬ

      // Редиректим на главную через 1 сек
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (e: any) {
      setError(e.message || "Не удалось войти");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-purple-900">Afina</h1>
        <p className="text-center text-gray-600 mb-6">Персонализированное обучение</p>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded bg-green-50 text-green-700 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Логин
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Введи логин"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Введи пароль"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-60"
          >
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-4">
          Нет аккаунта?{" "}
          <a href="/register" className="text-purple-600 hover:underline">
            Зарегистрироваться
          </a>
        </p>
      </div>
    </div>
  );
}
