import { describe, it, expect, beforeEach } from "vitest";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { THEME_STORAGE_KEY, useTheme } from "./use-theme";
import { ThemeToggle } from "@/components/ThemeToggle";

const root = document.documentElement;

describe("theme", () => {
  beforeEach(() => {
    root.dataset.theme = "dark";
    root.classList.add("dark");
    localStorage.clear();
  });

  it("starts from the theme index.html applied", () => {
    root.dataset.theme = "light";
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
  });

  it("switches the page, remembers the choice and notifies every user of the hook", () => {
    const a = renderHook(() => useTheme());
    const b = renderHook(() => useTheme());

    act(() => a.result.current.toggleTheme());

    expect(root.dataset.theme).toBe("light");
    expect(root.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(a.result.current.theme).toBe("light");
    expect(b.result.current.theme).toBe("light");

    act(() => b.result.current.setTheme("dark"));
    expect(root.dataset.theme).toBe("dark");
    expect(root.classList.contains("dark")).toBe(true);
  });

  it("offers the toggle with a label that names what it will do", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Switch to light theme" }));
    expect(root.dataset.theme).toBe("light");
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
  });
});
