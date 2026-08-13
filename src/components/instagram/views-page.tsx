"use client";

import { Eye } from "lucide-react";
import { InstagramServicePage } from "@/components/instagram/service-page";
import { getViewsPackages, getViewsService } from "@/lib/selectors/instagram";

/**
 * FF TRUST — Instagram Views client page.
 *
 * Powered by the shared InstagramServicePage template. All pricing data comes
 * from src/data/instagram/views.ts — changing the data file automatically
 * updates cards, savings, and the WhatsApp message.
 */
export function ViewsClientPage() {
  const packages = getViewsPackages();
  const service = getViewsService();

  return (
    <InstagramServicePage
      service={service}
      packages={packages}
      heroIcon={<Eye className="h-5 w-5 text-white" />}
      heroWord="Views"
      cardLabel="VIEWS"
    />
  );
}
