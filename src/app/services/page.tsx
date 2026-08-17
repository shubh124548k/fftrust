import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeading } from "@/components/visual/section-heading";
import { PanelSellerShowroom } from "@/components/showroom/panel-seller-showroom";
import { PromotionInfoBox } from "@/components/promotion/promotion-info-box";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbListJsonLd } from "@/components/seo/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "Panel & Services",
  description: `Browse every published panel, top-up and account-care service on ${siteConfig.name}. Explicit scope, included/excluded lists and honest evidence. Canonical inventory only.`,
  path: "/services",
});

export default function ServicesPage() {
  return (
    <main className="relative pt-28 pb-20 sm:pt-32">
      <div className="container-wide">
        <Breadcrumbs items={[{ label: "Marketplace" }, { label: "Services" }]} />
        <Link
          href="/#category-hub"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <SectionHeading
          overline="Full Catalogue — Services"
          title="Panel &"
          italic="Services"
          support="Every published Panel Seller service in the canonical catalogue — panel, top-up and account-care listings with explicit scope, included/excluded lists and honest evidence. Sort by price and compare."
          id="services-title"
        />

        <div className="mt-10">
          <PanelSellerShowroom />
        </div>

        <div className="mt-14">
          <PromotionInfoBox />
        </div>
      </div>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Marketplace", path: "/#category-hub" },
          { name: "Services", path: "/services" },
        ]}
      />
    </main>
  );
}
