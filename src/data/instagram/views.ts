/**
 * FF TRUST — Canonical Instagram pricing data.
 *
 * Single source of truth for all Instagram service pricing.
 * When this data changes, everything updates automatically:
 *   - Price cards
 *   - Order form
 *   - WhatsApp message
 *   - SEO-visible pricing
 *
 * No fake data. No hard-coded calculations in components.
 * All savings are computed from originalPrice and discountPrice.
 */

import type { InstagramPackage, InstagramServiceType } from "@/data/types";
import { siteConfig } from "@/config/site";

/** Instagram Views packages — exact pricing data. */
export const instagramViewsData: InstagramServiceType = {
  key: "views",
  label: "Instagram Views",
  emoji: "👁",
  whatsappNumber: siteConfig.whatsapp.number,
  packages: [
    { id: "ig-views-500000", quantity: 500000, originalPrice: 1100, discountPrice: 470, enabled: true, badge: "BEST VALUE" },
    { id: "ig-views-300000", quantity: 300000, originalPrice: 700, discountPrice: 300, enabled: true },
    { id: "ig-views-200000", quantity: 200000, originalPrice: 500, discountPrice: 210, enabled: true },
    { id: "ig-views-100000", quantity: 100000, originalPrice: 250, discountPrice: 120, enabled: true, badge: "POPULAR" },
    { id: "ig-views-75000", quantity: 75000, originalPrice: 200, discountPrice: 90, enabled: true },
    { id: "ig-views-50000", quantity: 50000, originalPrice: 120, discountPrice: 60, enabled: true },
    { id: "ig-views-30000", quantity: 30000, originalPrice: 80, discountPrice: 38, enabled: true },
    { id: "ig-views-20000", quantity: 20000, originalPrice: 55, discountPrice: 26, enabled: true },
    { id: "ig-views-10000", quantity: 10000, originalPrice: 30, discountPrice: 14, enabled: true },
    { id: "ig-views-5000", quantity: 5000, originalPrice: 18, discountPrice: 9, enabled: true },
    { id: "ig-views-3000", quantity: 3000, originalPrice: 12, discountPrice: 6, enabled: true },
    { id: "ig-views-1000", quantity: 1000, originalPrice: 5, discountPrice: 3, enabled: true },
    { id: "ig-views-500", quantity: 500, originalPrice: 3, discountPrice: 2, enabled: true },
  ],
};

// Sibling canonical data: src/data/instagram/followers.ts
