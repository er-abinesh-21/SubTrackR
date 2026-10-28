import { describe, it, expect } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { SubscriptionIcon } from "./SubscriptionIcon";

const brandOf = (name: string) => render(<SubscriptionIcon name={name} />).container.firstElementChild as HTMLElement;

describe("SubscriptionIcon", () => {
  it("shows the official brand mark for known services, whatever the casing", () => {
    expect(brandOf("Netflix").dataset.brand).toBe("netflix");
    expect(brandOf("SPOTIFY Premium").dataset.brand).toBe("spotify");
    expect(brandOf("Dropbox Plus").dataset.brand).toBe("dropbox");
  });

  it("prefers the more specific brand", () => {
    expect(brandOf("YouTube Music").dataset.brand).toBe("youtubemusic");
    expect(brandOf("YouTube Premium").dataset.brand).toBe("youtube");
  });

  it("does not mistake unrelated names for a brand", () => {
    expect(brandOf("Phone bill").dataset.brand).toBeUndefined();
  });

  it("falls back to initials when there is no mark", () => {
    const tile = brandOf("Gym membership");
    expect(tile.dataset.brand).toBeUndefined();
    expect(tile).toHaveTextContent("GM");
  });
});

describe("SubscriptionIcon with a saved brand", () => {
  const tile = (props: { name: string; brand?: string | null }) =>
    render(<SubscriptionIcon {...props} />).container.firstElementChild as HTMLElement;

  it("shows the chosen brand instead of the one the name suggests", () => {
    expect(tile({ name: "Netflix", brand: "spotify" }).dataset.brand).toBe("spotify");
  });

  it("shows initials when the user chose no logo", () => {
    const t = tile({ name: "Netflix", brand: "none" });
    expect(t.dataset.brand).toBeUndefined();
    expect(t).toHaveTextContent("N");
  });
});

describe("SubscriptionIcon for brands without a bundled mark", () => {
  it("loads the logo from the company website", () => {
    const { container } = render(<SubscriptionIcon name="Snapmint EMI" />);
    const tile = container.firstElementChild as HTMLElement;
    expect(tile.dataset.brand).toBe("snapmint");
    expect(container.querySelector("img")?.getAttribute("src")).toBe("https://icons.duckduckgo.com/ip3/snapmint.com.ico");
  });

  it("tries the site's own icon next, then falls back to initials", () => {
    const { container } = render(<SubscriptionIcon name="Flipkart Pay Later" />);
    const img = () => container.querySelector("img") as HTMLImageElement;

    fireEvent.error(img());
    expect(img().getAttribute("src")).toBe("https://flipkart.com/favicon.ico");

    fireEvent.error(img());
    expect(container.querySelector("img")).toBeNull();
    expect(container.firstElementChild).toHaveTextContent("FP");
  });

  it("treats a tiny placeholder image as no logo", () => {
    const { container } = render(<SubscriptionIcon name="Meesho Pay Later" />);
    // jsdom reports naturalWidth 0, like a 1px placeholder.
    fireEvent.load(container.querySelector("img") as HTMLImageElement);
    expect(container.querySelector("img")?.getAttribute("src")).toBe("https://meesho.com/favicon.ico");
  });

  it("rejects DuckDuckGo's 48x48 placeholder but keeps a real icon", () => {
    const { container } = render(<SubscriptionIcon name="Freecharge" />);
    const img = () => container.querySelector("img") as HTMLImageElement;
    const loadWithSize = (w: number, h: number) => {
      Object.defineProperty(img(), "naturalWidth", { configurable: true, value: w });
      Object.defineProperty(img(), "naturalHeight", { configurable: true, value: h });
      fireEvent.load(img());
    };

    loadWithSize(48, 48); // placeholder: move on to the site's own icon
    expect(img().getAttribute("src")).toBe("https://freecharge.in/favicon.ico");

    loadWithSize(64, 64); // a real favicon: keep it
    expect(img().getAttribute("src")).toBe("https://freecharge.in/favicon.ico");
  });
});
