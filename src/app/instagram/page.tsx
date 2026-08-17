import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { pageMetadata } from "@/lib/seo";

const InstagramHubPage = dynamic(
  () => import("@/components/instagram/instagram-hub-page").then((m) => m.InstagramHubPage),
  { loading: () => <div className="animate-pulse rounded-2xl bg-white/5 h-64" /> },
);

export const metadata: Metadata = pageMetadata({
  title: "Instagram Marketplace",
  description:
    "Instagram growth services — Views, Followers, and Likes with transparent INR pricing. Order via WhatsApp.",
  path: "/instagram",
});

export default function InstagramHub() {
  return <InstagramHubPage />;
}
