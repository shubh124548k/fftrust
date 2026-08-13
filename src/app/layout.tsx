import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { RouteTransition } from "@/components/layout/route-transition";
import { ScrollManager } from "@/components/layout/scroll-manager";
import { SceneAtmosphere } from "@/components/visual/scene-atmosphere";
import { AccountDetailOverlay } from "@/components/detail/account-detail-overlay";
import { ServiceDetailOverlay } from "@/components/detail/service-detail-overlay";
import { CompareDock } from "@/components/compare/compare-dock";
import { SellerContactPopup } from "@/components/seller/seller-contact-popup";
import { ScrollProgressBar } from "@/components/motion/scroll-progress-bar";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/structured-data";
import { siteConfig } from "@/config/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.seoDescription,
  icons: {
    icon: siteConfig.brandLogo,
    apple: siteConfig.brandLogo,
  },
  keywords: [
    "Free Fire accounts",
    "account trust",
    "panel seller",
    "rank push",
    "buyer safety",
    "FF TRUST",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  applicationName: siteConfig.name,
  category: "marketplace",
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.seoDescription,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: siteConfig.brandLogo,
        width: 1536,
        height: 1024,
        alt: `${siteConfig.name} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.seoDescription,
    images: [siteConfig.brandLogo],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  referrer: "strict-origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${spaceGrotesk.variable} antialiased`}
      >
          {/* Root wrapper: min-h-screen flex-col so footer sticks (mt-auto) and pushes on overflow */}
          <div className="relative flex min-h-screen flex-col">
            <SceneAtmosphere />
            <ScrollManager />
            <ScrollProgressBar />
            <a href="#explore" className="skip-link">Skip to content</a>
            <SiteHeader />
            <main className="relative flex-1" style={{ zIndex: "var(--z-foregroundUI)" }}>
              <RouteTransition>{children}</RouteTransition>
            </main>
            <SiteFooter />
          </div>
          <AccountDetailOverlay />
          <ServiceDetailOverlay />
          <CompareDock />
          <SellerContactPopup />
          <OrganizationJsonLd />
          <WebSiteJsonLd />
          <Toaster />
      </body>
    </html>
  );
}
