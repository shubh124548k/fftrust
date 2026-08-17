import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * FF TRUST — Dynamic Sitemap (PROMPT 3).
 *
 * Automatically reflects legitimate canonical pages:
 *  - Home + full catalogue routes (/accounts, /services, /paid-push)
 *  - Instagram service routes
 *  - Legal / trust / contact routes (incl. /safety, /contact, /disclaimer)
 *
 * PROMPT 2: the homepage is a clean marketplace gateway — no product-grid
 * anchors are indexed (the old #explore / #panel-seller / #paid-push anchors
 * were removed alongside the sections they targeted).
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
    // Instagram marketplace hub + service pages — canonical order routes
    {
      url: `${baseUrl}/instagram`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
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
      url: `${baseUrl}/purchase-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/account-transfer-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/listing-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/content-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/seller-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/free-fire-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/services-policy`,
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

  // Marketplace catalogue pages (/accounts, /services, /paid-push) are already
  // listed above with a daily change frequency. Anchor entries (#explore,
  // #panel-seller, #paid-push) were removed in PROMPT 2 — the homepage is now a
  // clean gateway with no product-grid anchors to index.

  return staticPages;
}
