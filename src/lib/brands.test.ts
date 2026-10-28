import { describe, it, expect } from "vitest";
import {
  BRANDS,
  BRAND_CATEGORIES,
  NO_BRAND,
  brandsByCategory,
  detectBrand,
  resolveBrand,
} from "./brands";

describe("detectBrand", () => {
  it("matches a brand inside the name, ignoring case", () => {
    expect(detectBrand("netflix")).toBe("netflix");
    expect(detectBrand("My SPOTIFY Family plan")).toBe("spotify");
  });

  it("prefers the more specific brand", () => {
    expect(detectBrand("YouTube Music Premium")).toBe("youtubemusic");
    expect(detectBrand("YouTube Premium")).toBe("youtube");
  });

  it("returns null when nothing matches", () => {
    expect(detectBrand("")).toBeNull();
    expect(detectBrand("Gym membership")).toBeNull();
    expect(detectBrand("Phone bill")).toBeNull();
  });

  it("only matches whole words, so look-alikes do not get a logo", () => {
    expect(detectBrand("Steamboat Cafe")).toBeNull();
    expect(detectBrand("Zoominfo")).toBeNull();
    expect(detectBrand("Linearity course")).toBeNull();
    expect(detectBrand("Steam Deck")).toBe("steam");
    expect(detectBrand("iCloud+ 200GB")).toBe("icloud");
    expect(detectBrand("Paramount+ Essential")).toBe("paramountplus");
  });

  it("covers services beyond streaming", () => {
    expect(detectBrand("ChatGPT")).toBeNull(); // no official mark available
    expect(detectBrand("Claude Pro")).toBe("claude");
    expect(detectBrand("Uber Eats Pass")).toBe("ubereats");
    expect(detectBrand("Uber One")).toBe("uber");
    expect(detectBrand("GitHub Copilot")).toBe("githubcopilot");
    expect(detectBrand("NordVPN 2 year")).toBe("nordvpn");
    expect(detectBrand("Proton Mail Plus")).toBe("proton");
    expect(detectBrand("Airtel Postpaid")).toBe("airtel");
    expect(detectBrand("Swiggy One")).toBe("swiggy");
  });
});

describe("resolveBrand", () => {
  it("uses the saved choice over the name", () => {
    expect(resolveBrand("Netflix", "spotify")?.id).toBe("spotify");
  });

  it("treats none as a deliberate no-logo choice", () => {
    expect(resolveBrand("Netflix", NO_BRAND)).toBeNull();
  });

  it("falls back to the name for subscriptions saved before logos existed", () => {
    expect(resolveBrand("Netflix")?.id).toBe("netflix");
    expect(resolveBrand("Netflix", null)?.id).toBe("netflix");
    expect(resolveBrand("Gym membership")).toBeNull();
  });

  it("ignores a saved id that no longer exists", () => {
    expect(resolveBrand("Netflix", "removed-brand")).toBeNull();
  });
});

describe("brand catalog", () => {
  it("has unique ids and a known category for every brand", () => {
    const ids = BRANDS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    BRANDS.forEach((b) => {
      expect(BRAND_CATEGORIES).toContain(b.category);
      expect(b.keywords.length).toBeGreaterThan(0);
      expect(b.keywords.every((k) => k === k.toLowerCase())).toBe(true);
    });
  });

  it("groups brands by category in category order, sorted by name", () => {
    const groups = brandsByCategory();
    expect(groups.map((g) => g.category)).toEqual(BRAND_CATEGORIES.filter((c) => BRANDS.some((b) => b.category === c)));
    groups.forEach((g) => {
      const labels = g.brands.map((b) => b.label);
      expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
    });
    expect(groups.flatMap((g) => g.brands)).toHaveLength(BRANDS.length);
  });
});
