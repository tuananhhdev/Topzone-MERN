import { create } from "zustand";

interface ThemeState {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  getCurrentTheme: () => "light" | "dark";
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: typeof window !== "undefined" ? (localStorage.getItem("theme") as "light" | "dark" | "system" || "system") : "system",

  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      document.documentElement.classList.toggle("dark", get().getCurrentTheme() === "dark");
    }
    set({ theme });
  },

  getCurrentTheme: () => {
    const storedTheme = get().theme;
    if (storedTheme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return storedTheme;
  },
}));