import { useCallback, useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "subtrackr-theme";

const META_COLORS: Record<Theme, string> = { dark: "#1B1717", light: "#EDEBDD" };

const listeners = new Set<() => void>();

// index.html applies the saved theme before first paint; the <html> element is the source of truth.
const read = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META_COLORS[theme]);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked; the choice just will not persist.
  }
  listeners.forEach((listener) => listener());
};

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);
  const setTheme = useCallback((next: Theme) => applyTheme(next), []);
  const toggleTheme = useCallback(() => applyTheme(read() === "light" ? "dark" : "light"), []);
  return { theme, setTheme, toggleTheme };
}
