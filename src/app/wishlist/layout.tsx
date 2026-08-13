import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Wishlist",
  description:
    "Your saved FF TRUST listings — accounts, panel services and paid push packages — stored on this device and resolved against the canonical catalogue.",
  path: "/wishlist",
});

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
