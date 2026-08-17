import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { InstagramHubPage } from "@/components/instagram/instagram-hub-page";

export const metadata: Metadata = pageMetadata({
  title: "Instagram Marketplace",
  description:
    "Instagram growth services — Views, Followers, and Likes with transparent INR pricing. Order via WhatsApp.",
  path: "/instagram",
});

export default function InstagramHub() {
  return <InstagramHubPage />;
}
