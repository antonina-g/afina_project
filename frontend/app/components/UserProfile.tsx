"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserProfile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");

    console.log("Token:", token); 
    console.log("Username:", storedUsername); 
    console.log("Email:", storedEmail); 

    if (token) {
      setIsLoggedIn(true);
      setUsername(storedUsername || "Пользователь");
      setEmail(storedEmail || "email@example.com");
    }
  }, []);

const handleLogout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.removeItem("email");

  setIsLoggedIn(false);
  setShowDropdown(false);

  router.push("/login");   
  router.refresh();        // обновить страницу
};

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white text-sm"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-xs font-bold">{username?.charAt(0).toUpperCase()}</span>
        </div>
        <span>{username}</span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">{username || "Пользователь"}</p>
            <p className="text-xs text-gray-500">{email || "email@example.com"}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
          >
            Выйти из профиля
          </button>
        </div>
      )}
    </div>
  );
}
