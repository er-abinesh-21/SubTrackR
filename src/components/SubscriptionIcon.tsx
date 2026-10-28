import { useState } from "react";
import { Tv, Music, Cloud, Gamepad2, Newspaper, ShoppingBag } from "lucide-react";
import { Brand, resolveBrand } from "@/lib/brands";
import { cn } from "@/lib/utils";

interface SubscriptionIconProps {
  name: string;
  /** The brand saved on the subscription; undefined falls back to matching the name. */
  brand?: string | null;
  size?: "sm" | "md";
  className?: string;
}

// Names with no brand match: a glyph that hints at the category.
const GLYPHS: { keywords: string[]; icon: React.ElementType }[] = [
  { keywords: ["music"], icon: Music },
  { keywords: ["video", "tv"], icon: Tv },
  { keywords: ["news"], icon: Newspaper },
  { keywords: ["shop", "store"], icon: ShoppingBag },
  { keywords: ["game", "gaming"], icon: Gamepad2 },
  { keywords: ["cloud", "storage"], icon: Cloud },
];

const SIZES = {
  sm: { box: "h-8 w-8 rounded-lg", glyph: "h-4 w-4", mark: "h-[17px] w-[17px]", web: "h-5 w-5", text: "text-[0.7rem]" },
  md: { box: "h-10 w-10 rounded-[11px]", glyph: "h-[18px] w-[18px]", mark: "h-[22px] w-[22px]", web: "h-6 w-6", text: "text-sm" },
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

/**
 * Where a brand without a bundled mark gets its logo: DuckDuckGo's icon service first, then
 * the site's own favicon. Both can "succeed" with a placeholder instead of failing, so each
 * source says which images do not count as a logo and the next source is tried instead.
 */
const MIN_LOGO_PX = 32;
// DuckDuckGo answers unknown sites with the same grey 48x48 placeholder.
const DDG_PLACEHOLDER_PX = 48;

const webLogoSources = (domain: string) => [
  {
    url: `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    isLogo: (img: HTMLImageElement) =>
      img.naturalWidth >= MIN_LOGO_PX && !(img.naturalWidth === DDG_PLACEHOLDER_PX && img.naturalHeight === DDG_PLACEHOLDER_PX),
  },
  {
    url: `https://${domain}/favicon.ico`,
    isLogo: (img: HTMLImageElement) => img.naturalWidth >= MIN_LOGO_PX,
  },
];

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "?";

function FallbackTile({ name, glyph, size, className }: { name: string; glyph?: React.ElementType; size: "sm" | "md"; className?: string }) {
  const s = SIZES[size];
  const Glyph = glyph;
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
      {Glyph ? <Glyph className={s.glyph} strokeWidth={1.75} /> : initialsOf(name)}
    </div>
  );
}

function WebLogoTile({ brand, size, className }: { brand: Brand; size: "sm" | "md"; className?: string }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const s = SIZES[size];
  const sources = webLogoSources(brand.domain as string);
  if (sourceIndex >= sources.length) return <FallbackTile name={brand.label} size={size} className={className} />;
  const tryNextSource = () => setSourceIndex((i) => i + 1);
  return (
    <div
      aria-hidden="true"
      data-brand={brand.id}
      className={cn("flex shrink-0 items-center justify-center bg-white ring-1 ring-inset ring-black/10", s.box, className)}
    >
      <img
        key={sourceIndex}
        src={sources[sourceIndex].url}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        className={cn("object-contain", s.web)}
        onLoad={(e) => {
          if (!sources[sourceIndex].isLogo(e.currentTarget)) tryNextSource();
        }}
        onError={tryNextSource}
      />
    </div>
  );
}

export function SubscriptionIcon({ name, brand: savedBrand, size = "md", className }: SubscriptionIconProps) {
  const lowerCaseName = name.toLowerCase();
  const s = SIZES[size];

  const brand = resolveBrand(name, savedBrand);
  if (brand?.icon) {
    const colors = brandColors(brand.icon.hex);
    return (
      <div
        aria-hidden="true"
        data-brand={brand.id}
        className={cn("flex shrink-0 items-center justify-center ring-1 ring-inset ring-black/10 dark:ring-white/10", s.box, className)}
        style={{ backgroundColor: colors.background }}
      >
        <svg viewBox="0 0 24 24" className={s.mark} fill={colors.mark} role="img">
          <path d={brand.icon.path} />
        </svg>
      </div>
    );
  }
  if (brand?.domain) return <WebLogoTile brand={brand} size={size} className={className} />;

  // A deliberate "no logo" choice means initials, not a guessed glyph.
  const glyph = savedBrand
    ? undefined
    : GLYPHS.find((g) => g.keywords.some((k) => new RegExp(`(?:^|[^a-z0-9])${k}(?:$|[^a-z0-9])`).test(lowerCaseName)))?.icon;
  return <FallbackTile name={name} glyph={glyph} size={size} className={className} />;
}
