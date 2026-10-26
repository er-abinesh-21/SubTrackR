import {
  Tv,
  Music,
  Youtube,
  Cloud,
  Gamepad2,
  Newspaper,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionIconProps {
  name: string;
  size?: "sm" | "md";
  className?: string;
}

// Known services get a glyph; everything else gets initials. Tiles stay in the theme's
// own colours so a long list reads as one family rather than a rainbow.
const ICON_MAPPINGS: { keywords: string[]; icon: React.ElementType }[] = [
  { keywords: ["netflix", "hulu", "hbo", "disney", "apple tv", "plex", "crunchyroll"], icon: Tv },
  { keywords: ["spotify", "apple music", "tidal", "pandora", "soundcloud"], icon: Music },
  { keywords: ["youtube"], icon: Youtube },
  { keywords: ["icloud", "dropbox", "google drive", "onedrive"], icon: Cloud },
  { keywords: ["xbox", "playstation", "nintendo", "steam"], icon: Gamepad2 },
  { keywords: ["new york times", "washington post", "wsj", "medium"], icon: Newspaper },
  { keywords: ["amazon prime", "walmart+"], icon: ShoppingBag },
  { keywords: ["adobe", "figma", "canva", "notion", "office 365"], icon: Zap },
];

const SIZES = {
  sm: { box: "h-8 w-8 rounded-lg", icon: "h-4 w-4", text: "text-[0.7rem]" },
  md: { box: "h-10 w-10 rounded-[11px]", icon: "h-[18px] w-[18px]", text: "text-sm" },
};

export function SubscriptionIcon({ name, size = "md", className }: SubscriptionIconProps) {
  const lowerCaseName = name.toLowerCase();
  const match = ICON_MAPPINGS.find((m) => m.keywords.some((k) => lowerCaseName.includes(k)));
  const s = SIZES[size];

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "?";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center bg-secondary font-display font-semibold text-foreground ring-1 ring-inset ring-border",
        s.box,
        s.text,
        className
      )}
    >
      {match ? <match.icon className={s.icon} strokeWidth={1.75} /> : initials}
    </div>
  );
}
