"use client";

import * as React from "react";
import { Eye } from "lucide-react";
import { InstagramServicePage } from "@/components/instagram/service-page";
import { getViewsPackages, getViewsService } from "@/lib/selectors/instagram";

const VIEWS_ICON = <Eye className="h-5 w-5 text-white" />;

export function ViewsClientPage() {
  const packages = getViewsPackages();
  const service = getViewsService();

  return (
    <InstagramServicePage
      service={service}
      packages={packages}
      heroIcon={VIEWS_ICON}
      heroWord="Views"
    />
  );
}
