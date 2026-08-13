/**
 * FF TRUST — Canonical Instagram Likes pricing data.
 *
 * Single source of truth for Instagram Likes pricing.
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

/** Instagram Likes packages — exact pricing data. */
export const instagramLikesData: InstagramServiceType = {
  key: "likes",
  label: "Instagram Likes",
  emoji: "❤️",
  whatsappNumber: siteConfig.whatsapp.number,
  packages: [
    { id: "ig-likes-1000000", quantity: 1000000, originalPrice: 12000, discountPrice: 5000, enabled: true, badge: "BEST VALUE" },
    { id: "ig-likes-500000", quantity: 500000, originalPrice: 6500, discountPrice: 2700, enabled: true },
    { id: "ig-likes-200000", quantity: 200000, originalPrice: 2800, discountPrice: 1150, enabled: true },
    { id: "ig-likes-100000", quantity: 100000, originalPrice: 1500, discountPrice: 620, enabled: true, badge: "POPULAR" },
    { id: "ig-likes-75000", quantity: 75000, originalPrice: 1100, discountPrice: 450, enabled: true },
    { id: "ig-likes-50000", quantity: 50000, originalPrice: 700, discountPrice: 290, enabled: true },
    { id: "ig-likes-25000", quantity: 25000, originalPrice: 380, discountPrice: 155, enabled: true },
    { id: "ig-likes-10000", quantity: 10000, originalPrice: 140, discountPrice: 58, enabled: true },
    { id: "ig-likes-7500", quantity: 7500, originalPrice: 80, discountPrice: 33, enabled: true },
    { id: "ig-likes-5000", quantity: 5000, originalPrice: 50, discountPrice: 21, enabled: true },
    { id: "ig-likes-3000", quantity: 3000, originalPrice: 42, discountPrice: 17, enabled: true },
    { id: "ig-likes-2000", quantity: 2000, originalPrice: 35, discountPrice: 14, enabled: true },
    { id: "ig-likes-1000", quantity: 1000, originalPrice: 15, discountPrice: 6, enabled: true },
    { id: "ig-likes-500", quantity: 500, originalPrice: 9, discountPrice: 4, enabled: true },
    { id: "ig-likes-250", quantity: 250, originalPrice: 5, discountPrice: 2, enabled: true },
    { id: "ig-likes-100", quantity: 100, originalPrice: 5, discountPrice: 2, enabled: true },
  ],
};
