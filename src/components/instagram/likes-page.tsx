"use client";

import { Heart } from "lucide-react";
import { InstagramServicePage } from "@/components/instagram/service-page";
import { getLikesPackages, getLikesService } from "@/lib/selectors/instagram";

/**
 * FF TRUST — Instagram Likes client page.
 *
 * True clone of the Views/Followers pages — same template, same components,
 * same order system, same WhatsApp flow. All pricing data comes from
 * src/data/instagram/likes.ts — changing the data file automatically updates
 * cards, savings, and the WhatsApp message.
 */
export function LikesClientPage() {
  const packages = getLikesPackages();
  const service = getLikesService();

  return (
    <InstagramServicePage
      service={service}
      packages={packages}
      heroIcon={<Heart className="h-5 w-5 text-white" />}
      heroWord="Likes"
    />
  );
}
