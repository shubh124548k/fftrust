import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getFeaturedAccounts } from "@/lib/selectors/accounts";
import {
  getFeaturedPanelServices,
  getFeaturedRankPush,
} from "@/lib/selectors/services";

/**
 * FF TRUST — Dynamic Sitemap (PROMPT 3).
 *
 * Automatically reflects legitimate canonical pages:
 *  - Home + full catalogue routes
 *  - Instagram service routes
 *  - Legal / trust / contact routes (incl. /safety, /contact, /disclaimer)
 *  - One anchor entry per catalogue section (listings render inside overlay
 *    dossiers on the home sections, so each section is a unique URL — never
 *    duplicate <loc> entries).
 *
 * Does NOT include:
 *  - Duplicate URLs
 *  - Private/user-specific states
 *  - Temporary UI states
 *  - API routes
 *
 * When canonical data changes, the sitemap automatically updates.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/accounts`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/paid-push`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    // Instagram service pages — canonical order routes
    {
      url: `${baseUrl}/instagram/views`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/instagram/followers`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/instagram/likes`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    // Utility routes
    {
      url: `${baseUrl}/wishlist`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    // Trust & safety
    {
      url: `${baseUrl}/proof`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/safety`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    // Legal pages
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  /** One entry per catalogue section — unique URL, freshest lastModified. */
  const sectionPage = (
    records: { demo?: boolean; published?: boolean; updatedAt?: string; createdAt?: string }[],
    url: string,
    priority: number,
  ): MetadataRoute.Sitemap => {
    const published = records.filter((r) => !r.demo && r.published);
    if (published.length === 0) return [];
    const latest = Math.max(
      ...published.map((r) => new Date(r.updatedAt || r.createdAt || now).getTime()),
    );
    return [
      {
        url: `${baseUrl}${url}`,
        lastModified: new Date(latest),
        changeFrequency: "weekly",
        priority,
      },
    ];
  };

  // Listing sections (details render in overlay dossiers from the home sections)
  const sectionPages: MetadataRoute.Sitemap = [
    ...sectionPage(
      getFeaturedAccounts(999).records,
      "/#explore",
      0.7,
    ),
    ...sectionPage(
      getFeaturedPanelServices(999).records,
      "/#panel-seller",
      0.7,
    ),
    ...sectionPage(
      getFeaturedRankPush(999).records,
      "/#paid-push",
      0.7,
    ),
  ];

  return [...staticPages, ...sectionPages];
}
