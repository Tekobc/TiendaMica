"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("adonai-theme");
    const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme = savedTheme ? (savedTheme === "dark" ? "dark" : "light") : preferredDark ? "dark" : "light";

    root.classList.toggle("dark", nextTheme === "dark");
    setTheme(nextTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    try {
      localStorage.setItem("adonai-theme", nextTheme);
    } catch {
      // The in-memory theme still works when storage is unavailable.
    }
    setTheme(nextTheme);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-pressed={isDark}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white/80 text-stone-700 transition-colors hover:bg-rose-50 dark:border-rose-300/70 dark:bg-[#2a2227] dark:text-stone-100 dark:hover:bg-[#33272c]"
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}