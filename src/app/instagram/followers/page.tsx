import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { FollowersClientPage } from "@/components/instagram/followers-page";

export const metadata: Metadata = pageMetadata({
  title: "Instagram Followers",
  description:
    "Instagram followers packages with clear INR pricing. Order via WhatsApp — the website never sends automatically.",
  path: "/instagram/followers",
});

export default function InstagramFollowersPage() {
  return <FollowersClientPage />;
}
