/**
 * FF TRUST — Canonical Instagram Followers pricing data.
 *
 * Single source of truth for Instagram Followers pricing.
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

/** Instagram Followers packages — exact pricing data. */
export const instagramFollowersData: InstagramServiceType = {
  key: "followers",
  label: "Instagram Followers",
  emoji: "👥",
  whatsappNumber: siteConfig.whatsapp.number,
  packages: [
    { id: "ig-followers-1000000", quantity: 1000000, originalPrice: 45000, discountPrice: 19000, enabled: true, badge: "BEST VALUE" },
    { id: "ig-followers-500000", quantity: 500000, originalPrice: 23000, discountPrice: 9800, enabled: true },
    { id: "ig-followers-200000", quantity: 200000, originalPrice: 9500, discountPrice: 4000, enabled: true },
    { id: "ig-followers-100000", quantity: 100000, originalPrice: 5000, discountPrice: 2100, enabled: true, badge: "POPULAR" },
    { id: "ig-followers-75000", quantity: 75000, originalPrice: 3800, discountPrice: 1600, enabled: true },
    { id: "ig-followers-50000", quantity: 50000, originalPrice: 2600, discountPrice: 1100, enabled: true },
    { id: "ig-followers-25000", quantity: 25000, originalPrice: 1400, discountPrice: 580, enabled: true },
    { id: "ig-followers-10000", quantity: 10000, originalPrice: 550, discountPrice: 230, enabled: true },
    { id: "ig-followers-7500", quantity: 7500, originalPrice: 370, discountPrice: 155, enabled: true },
    { id: "ig-followers-5000", quantity: 5000, originalPrice: 240, discountPrice: 100, enabled: true },
    { id: "ig-followers-3000", quantity: 3000, originalPrice: 190, discountPrice: 80, enabled: true },
    { id: "ig-followers-2000", quantity: 2000, originalPrice: 150, discountPrice: 62, enabled: true },
    { id: "ig-followers-1000", quantity: 1000, originalPrice: 85, discountPrice: 35, enabled: true },
    { id: "ig-followers-500", quantity: 500, originalPrice: 45, discountPrice: 19, enabled: true },
    { id: "ig-followers-250", quantity: 250, originalPrice: 20, discountPrice: 9, enabled: true },
  ],
};
