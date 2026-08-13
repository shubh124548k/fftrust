import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * FF TRUST — Production robots (PROMPT 3).
 *
 * Generated from the canonical site config so the sitemap URL always matches
 * the real deployment domain. Public pages are crawlable; API and developer
 * surfaces are excluded.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
