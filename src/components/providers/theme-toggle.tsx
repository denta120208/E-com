"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "ecom-theme";

type ThemeValue = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeValue>(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeValue | null;
    if (stored) {
      return stored;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "dark" ? "Light" : "Dark"}
    </Button>
  );
}
