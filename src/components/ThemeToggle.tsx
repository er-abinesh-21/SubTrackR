import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

/** Switches between the dark and light themes; the two icons trade places with a quick turn. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cn(
        "relative h-9 w-9 rounded-full text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground hover:ring-foreground/40",
        className
      )}
    >
      <Sun
        className={cn(
          "absolute inset-0 m-auto h-4 w-4 transition-all duration-300",
          theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
        )}
      />
      <Moon
        className={cn(
          "absolute inset-0 m-auto h-4 w-4 transition-all duration-300",
          theme === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0"
        )}
      />
    </button>
  );
}
