import { BRANDS, BRAND_CATEGORIES, Brand } from "./brands.data";

export { BRANDS, BRAND_CATEGORIES };
export type { Brand, BrandCategory } from "./brands.data";

/** Saved on a subscription when the user chose "no logo". */
export const NO_BRAND = "none";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// One pattern per brand. A keyword only counts when it is not glued to other letters or
// digits, so "steam" matches "Steam Deck" but not "Steamboat Cafe".
const MATCHERS = BRANDS.map((brand) => ({
  id: brand.id,
  pattern: new RegExp(`(?:^|[^a-z0-9])(?:${brand.keywords.map(escapeRegExp).join("|")})(?:$|[^a-z0-9])`),
}));

export const findBrand = (id: string | null | undefined): Brand | null =>
  BRANDS.find((b) => b.id === id) ?? null;

/** The id of the brand a typed name most likely refers to, or null when nothing matches. */
export const detectBrand = (name: string): string | null => {
  const lower = name.toLowerCase();
  return MATCHERS.find((m) => m.pattern.test(lower))?.id ?? null;
};

/**
 * The brand to draw for a subscription. A saved choice wins; "none" means the user turned
 * the logo off; subscriptions saved before logos existed fall back to matching the name.
 */
export const resolveBrand = (name: string, saved?: string | null): Brand | null => {
  if (saved === NO_BRAND) return null;
  if (saved) return findBrand(saved);
  return findBrand(detectBrand(name));
};

/** Brands grouped for the picker, in category order and sorted by name. */
export const brandsByCategory = () =>
  BRAND_CATEGORIES.map((category) => ({
    category,
    brands: BRANDS.filter((b) => b.category === category).sort((a, b) => a.label.localeCompare(b.label)),
  })).filter((group) => group.brands.length > 0);
