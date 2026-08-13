import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ViewsClientPage } from "@/components/instagram/views-page";

export const metadata: Metadata = pageMetadata({
  title: "Instagram Views",
  description:
    "Instagram views packages with clear INR pricing, from 500 to 500,000 views. Order via WhatsApp — the website never sends automatically.",
  path: "/instagram/views",
});

export default function InstagramViewsPage() {
  return <ViewsClientPage />;
}
