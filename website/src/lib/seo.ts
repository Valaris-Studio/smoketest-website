export type SEOInput = {
  site: string | URL;
  pathname: string;
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  noindex?: boolean;
};

export type SEOResolved = {
  title: string;
  description: string;
  canonical: string;
  image: string;
  robots: string;
  ogType: "website";
  twitterCard: "summary_large_image";
};

const DEFAULT_OG_IMAGE_PATH = "/og-default.png";

export function normalizeCanonical(
  site: string | URL,
  pathname: string,
  override?: string,
): string {
  const origin = new URL(site.toString()).origin;

  if (override) {
    const absolute = /^https?:\/\//i.test(override)
      ? new URL(override)
      : new URL(override, origin);
    return stripTrailingSlash(absolute.origin + absolute.pathname);
  }

  const cleanPath = pathname.split("?")[0]?.split("#")[0] ?? "/";
  const withLeading = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  return stripTrailingSlash(origin + withLeading);
}

function stripTrailingSlash(url: string): string {
  const parsed = new URL(url);
  if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  }
  return parsed.toString();
}

export function resolveImage(site: string | URL, image?: string): string {
  const origin = new URL(site.toString()).origin;
  if (!image) return origin + DEFAULT_OG_IMAGE_PATH;
  if (/^https?:\/\//i.test(image)) return image;
  return new URL(image, origin).toString();
}

export function buildSEO(input: SEOInput): SEOResolved {
  return {
    title: input.title,
    description: input.description,
    canonical: normalizeCanonical(input.site, input.pathname, input.canonical),
    image: resolveImage(input.site, input.image),
    robots: input.noindex ? "noindex,nofollow" : "index,follow",
    ogType: "website",
    twitterCard: "summary_large_image",
  };
}
