"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { InstagramServicePage } from "@/components/instagram/service-page";
import { getLikesPackages, getLikesService } from "@/lib/selectors/instagram";

const LIKES_ICON = <Heart className="h-5 w-5 text-white" />;

export function LikesClientPage() {
  const packages = getLikesPackages();
  const service = getLikesService();

  return (
    <InstagramServicePage
      service={service}
      packages={packages}
      heroIcon={LIKES_ICON}
      heroWord="Likes"
    />
  );
}
