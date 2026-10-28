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
import { resolveBrand } from "@/lib/brands";
import { cn } from "@/lib/utils";

interface SubscriptionIconProps {
  name: string;
  /** The brand saved on the subscription; undefined falls back to matching the name. */
  brand?: string | null;
  size?: "sm" | "md";
  className?: string;
}

// Services whose official marks are not available: a glyph that hints at the category.
const GLYPHS: { keywords: string[]; icon: React.ElementType }[] = [
  { keywords: ["hulu", "disney", "prime video"], icon: Tv },
  { keywords: ["xbox", "nintendo"], icon: Gamepad2 },
  { keywords: ["new york times", "washington post", "wsj"], icon: Newspaper },
  { keywords: ["amazon prime", "walmart+"], icon: ShoppingBag },
  { keywords: ["adobe", "canva", "office 365"], icon: Zap },
  { keywords: ["onedrive"], icon: Cloud },
  { keywords: ["music"], icon: Music },
  { keywords: ["video"], icon: Youtube },
];

const SIZES = {
  sm: { box: "h-8 w-8 rounded-lg", glyph: "h-4 w-4", mark: "h-[17px] w-[17px]", text: "text-[0.7rem]" },
  md: { box: "h-10 w-10 rounded-[11px]", glyph: "h-[18px] w-[18px]", mark: "h-[22px] w-[22px]", text: "text-sm" },
};

const luminance = (hex: string) => {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
};

/**
 * Brand marks sit on the brand's own colour. Near-black brands (Notion, Medium, Tidal...)
 * would vanish on this dark theme, so they get a light tile with a dark mark instead.
 */
const brandColors = (hex: string) => {
  const lum = luminance(hex);
  if (lum < 0.03) return { background: "#EDEBDD", mark: hex === "000000" ? "#1B1717" : `#${hex}` };
  return { background: `#${hex}`, mark: lum > 0.45 ? "#1B1717" : "#FFFFFF" };
};

export function SubscriptionIcon({ name, brand: savedBrand, size = "md", className }: SubscriptionIconProps) {
  const lowerCaseName = name.toLowerCase();
  const s = SIZES[size];

  const brand = resolveBrand(name, savedBrand);
  if (brand) {
    const colors = brandColors(brand.icon.hex);
    return (
      <div
        aria-hidden="true"
        data-brand={brand.id}
        className={cn("flex shrink-0 items-center justify-center ring-1 ring-inset ring-white/10", s.box, className)}
        style={{ backgroundColor: colors.background }}
      >
        <svg viewBox="0 0 24 24" className={s.mark} fill={colors.mark} role="img">
          <path d={brand.icon.path} />
        </svg>
      </div>
    );
  }

  // A deliberate "no logo" choice means initials, not a guessed glyph.
  const glyph = savedBrand ? undefined : GLYPHS.find((g) => g.keywords.some((k) => lowerCaseName.includes(k)));
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
      {glyph ? <glyph.icon className={s.glyph} strokeWidth={1.75} /> : initials}
    </div>
  );
}
