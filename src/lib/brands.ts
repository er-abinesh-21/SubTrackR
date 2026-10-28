import { BRANDS as BUNDLED_BRANDS, BRAND_CATEGORIES, Brand } from "./brands.data";
import { WEB_BRANDS } from "./brands.web";

export { BRAND_CATEGORIES };
export type { Brand, BrandCategory } from "./brands.data";

/** Saved on a subscription when the user chose "no logo". */
export const NO_BRAND = "none";

/** Web-logo brands come first: they hold the specific names ("flipkart pay later", "paytm postpaid"). */
export const BRANDS: Brand[] = [...WEB_BRANDS, ...BUNDLED_BRANDS];

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

/** What the picker searches: the brand name, its category and the words that detect it. */
export const brandSearchValue = (brand: Brand) =>
  `${brand.label} ${brand.category} ${brand.keywords.join(" ")}`;

/**
 * Plain word matching for the picker, used instead of cmdk's fuzzy search (which matches
 * letters scattered across unrelated names). Every typed word must appear in the value.
 * Returns 1 for a match and 0 otherwise, as cmdk expects.
 */
export const matchesBrandSearch = (value: string, search: string) => {
  const haystack = value.toLowerCase();
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term)) ? 1 : 0;
};
