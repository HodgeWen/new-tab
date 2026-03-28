import { beforeEach, describe, expect, it } from "vitest";

import { getSetting, setSetting } from "@/services/local-storage";

beforeEach(() => {
  localStorage.clear();
});

describe("localStorage 设置", () => {
  it("读写 showSearchBar", () => {
    expect(getSetting("showSearchBar")).toBe(true);
    setSetting("showSearchBar", false);
    expect(getSetting("showSearchBar")).toBe(false);
  });

  it("读写 wallpaperSource", () => {
    expect(getSetting("wallpaperSource")).toBe(null);
    setSetting("wallpaperSource", "https://example.com/bg.jpg");
    expect(getSetting("wallpaperSource")).toBe("https://example.com/bg.jpg");
  });
});
