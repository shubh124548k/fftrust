import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { SectionHeading } from "@/components/visual/section-heading";
import { PromotionInfoBox } from "@/components/promotion/promotion-info-box";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbListJsonLd } from "@/components/seo/structured-data";

const PaidPushMarketplace = dynamic(
  () => import("@/components/showroom/paid-push-marketplace").then((m) => m.PaidPushMarketplace),
  { loading: () => <div className="animate-pulse rounded-2xl bg-white/5 h-64" /> },
);

export const metadata: Metadata = pageMetadata({
  title: "Paid Push — CS / BR",
  description: `Browse every published CS and BR rank-push package on ${siteConfig.name}. Scope and effort only — no guaranteed rank, wins, anti-ban or safety. Canonical inventory only.`,
  path: "/paid-push",
});

export default function PaidPushPage() {
  return (
    <main className="relative pt-28 pb-20 sm:pt-32">
      <div className="container-wide">
        <Breadcrumbs items={[{ label: "Marketplace" }, { label: "Paid Push" }]} />
        <Link
          href="/#category-hub"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <SectionHeading
          overline="Full Catalogue — Paid Push"
          title="Paid Push — CS /"
          italic="BR"
          support="Every published CS and BR rank-push package in the canonical catalogue. Scope and effort only — never a guarantee of rank, wins, completion, anti-ban or safety. Sort by price and compare."
          id="paid-push-title"
        />

        <div className="mt-10">
          <PaidPushMarketplace />
        </div>

        <div className="mt-14">
          <PromotionInfoBox />
        </div>
      </div>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Marketplace", path: "/#category-hub" },
          { name: "Paid Push", path: "/paid-push" },
        ]}
      />
    </main>
  );
}
