"use client";

import * as React from "react";
import { Users } from "lucide-react";
import { InstagramServicePage } from "@/components/instagram/service-page";
import { getFollowersPackages, getFollowersService } from "@/lib/selectors/instagram";

const FOLLOWERS_ICON = <Users className="h-5 w-5 text-white" />;

export function FollowersClientPage() {
  const packages = getFollowersPackages();
  const service = getFollowersService();

  return (
    <InstagramServicePage
      service={service}
      packages={packages}
      heroIcon={FOLLOWERS_ICON}
      heroWord="Followers"
    />
  );
}
