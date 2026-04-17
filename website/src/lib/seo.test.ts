import { describe, expect, it } from "vitest";
import { buildSEO, normalizeCanonical, resolveImage } from "./seo";

const SITE = "https://valaris.studio";

describe("normalizeCanonical", () => {
  it("builds absolute URL from site + pathname", () => {
    expect(normalizeCanonical(SITE, "/product")).toBe(
      "https://valaris.studio/product",
    );
  });

  it("keeps root pathname intact", () => {
    expect(normalizeCanonical(SITE, "/")).toBe("https://valaris.studio/");
  });

  it("strips trailing slash from non-root paths", () => {
    expect(normalizeCanonical(SITE, "/docs/")).toBe(
      "https://valaris.studio/docs",
    );
  });

  it("strips query string and fragment", () => {
    expect(normalizeCanonical(SITE, "/product?ref=x#section")).toBe(
      "https://valaris.studio/product",
    );
  });

  it("accepts an override path and resolves it against the site origin", () => {
    expect(normalizeCanonical(SITE, "/ignored", "/real")).toBe(
      "https://valaris.studio/real",
    );
  });

  it("accepts an override that is already absolute", () => {
    expect(
      normalizeCanonical(SITE, "/ignored", "https://other.example/x/"),
    ).toBe("https://other.example/x");
  });

  it("prepends leading slash when pathname is missing one", () => {
    expect(normalizeCanonical(SITE, "product")).toBe(
      "https://valaris.studio/product",
    );
  });
});

describe("resolveImage", () => {
  it("returns default OG image when none provided", () => {
    expect(resolveImage(SITE)).toBe("https://valaris.studio/og-default.png");
  });

  it("resolves a relative image path against the site origin", () => {
    expect(resolveImage(SITE, "/og/home.png")).toBe(
      "https://valaris.studio/og/home.png",
    );
  });

  it("keeps absolute image URLs untouched", () => {
    expect(resolveImage(SITE, "https://cdn.example/x.png")).toBe(
      "https://cdn.example/x.png",
    );
  });
});

describe("buildSEO", () => {
  it("produces index,follow robots by default", () => {
    const seo = buildSEO({
      site: SITE,
      pathname: "/",
      title: "t",
      description: "d",
    });
    expect(seo.robots).toBe("index,follow");
  });

  it("produces noindex,nofollow when noindex is true", () => {
    const seo = buildSEO({
      site: SITE,
      pathname: "/",
      title: "t",
      description: "d",
      noindex: true,
    });
    expect(seo.robots).toBe("noindex,nofollow");
  });

  it("fills og and twitter defaults", () => {
    const seo = buildSEO({
      site: SITE,
      pathname: "/",
      title: "t",
      description: "d",
    });
    expect(seo.ogType).toBe("website");
    expect(seo.twitterCard).toBe("summary_large_image");
  });
});
