"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useThemeStore } from "@/stores/useTheme";

interface ThemeContextType {
  theme: "light" | "dark" | "system";
  colors: {
    background: string;
    text: string;
    card: string;
    border: string;
  };
  setTheme: (theme: "light" | "dark" | "system") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme, setTheme } = useThemeStore();

  const colors = {
    light: {
      background: "#f5f7fa", // Xám nhạt nhẹ nhàng
      text: "#1a202c", // Đen đậm, dễ đọc
      card: "#ffffff", // Trắng tinh
      border: "#e2e8f0", // Xám nhạt
    },
    dark: {
      background: "#1f2526", // Xám đen đậm, chuyên nghiệp
      text: "#e2e8f0", // Xám nhạt sáng
      card: "#2d3436", // Xám đậm
      border: "#4a5568", // Xám trung
    },
  };

  const currentColors =
    theme === "system"
      ? typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? colors.dark
        : colors.light
      : colors[theme];

  useEffect(() => {
    document.documentElement.style.setProperty("--background", currentColors.background);
    document.documentElement.style.setProperty("--text", currentColors.text);
    document.documentElement.style.setProperty("--card", currentColors.card);
    document.documentElement.style.setProperty("--border", currentColors.border);

    // Thêm/tắt class "dark" dựa trên theme
    document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches));
  }, [theme, currentColors]);

  return (
    <ThemeContext.Provider value={{ theme, colors: currentColors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};