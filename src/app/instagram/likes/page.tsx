import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LikesClientPage } from "@/components/instagram/likes-page";

export const metadata: Metadata = pageMetadata({
  title: "Instagram Likes",
  description:
    "Instagram likes packages with clear INR pricing. Order via WhatsApp — the website never sends automatically.",
  path: "/instagram/likes",
});

export default function InstagramLikesPage() {
  return <LikesClientPage />;
}
