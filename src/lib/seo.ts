import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/**
 * FF TRUST — Shared SEO metadata helpers (PROMPT 3).
 *
 * Every public page derives its canonical URL, OpenGraph and Twitter metadata
 * from `siteConfig` — the single source of truth — so nothing is hardcoded per
 * page. All claims stay truthful: no fake ratings, reviews or popularity.
 */

/** Build an absolute canonical URL from a site-relative path. */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalized}`;
}

/** Standard page metadata: canonical + OpenGraph + Twitter. */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const canonical = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} · ${siteConfig.name}`,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      locale: siteConfig.locale,
      images: [
        {
          url: siteConfig.brandLogo,
          width: 1536,
          height: 1024,
          alt: `${siteConfig.name} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${siteConfig.name}`,
      description,
      images: [siteConfig.brandLogo],
    },
  };
}
