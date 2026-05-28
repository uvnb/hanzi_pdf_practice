"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const t = useTranslations("Nav");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("hanzi-theme") as Theme | null;
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const selected = saved === "dark" || saved === "light" ? saved : preferred;
    document.documentElement.dataset.theme = selected;
    setTheme(selected);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem("hanzi-theme", next);
    document.documentElement.dataset.theme = next;
    setTheme(next);
  }

  return (
    <button
      aria-label={t("theme")}
      className="themeButton"
      onClick={toggleTheme}
      type="button"
    >
      {theme === "dark" ? t("light") : t("dark")}
    </button>
  );
}
