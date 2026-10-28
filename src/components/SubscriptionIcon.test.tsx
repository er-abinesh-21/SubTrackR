import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
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
