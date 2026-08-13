import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Compare",
  description:
    "Compare FF TRUST listings side-by-side — accounts with accounts, panel sellers with panel sellers, paid push with paid push. All values come from canonical records, no fake statistics.",
  path: "/compare",
});

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
