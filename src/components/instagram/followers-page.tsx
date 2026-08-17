"use client";

import { Users } from "lucide-react";
import { InstagramServicePage } from "@/components/instagram/service-page";
import { getFollowersPackages, getFollowersService } from "@/lib/selectors/instagram";

/**
 * FF TRUST — Instagram Followers client page.
 *
 * True clone of the Views page — same template, same components, same order
 * system, same WhatsApp flow. All pricing data comes from
 * src/data/instagram/followers.ts — changing the data file automatically
 * updates cards, savings, and the WhatsApp message.
 */
export function FollowersClientPage() {
  const packages = getFollowersPackages();
  const service = getFollowersService();

  return (
    <InstagramServicePage
      service={service}
      packages={packages}
      heroIcon={<Users className="h-5 w-5 text-white" />}
      heroWord="Followers"
    />
  );
}
