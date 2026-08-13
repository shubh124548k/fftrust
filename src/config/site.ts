/**
 * FF TRUST — Canonical site configuration (typed, single source of truth).
 *
 * Owner contact, platform identity, disclosure, and shared copy live here.
 * Every consumer (WhatsApp builder, footer, About, metadata) reads from this
 * file — never hardcode owner values into components.
 *
 * SAFETY: this config never holds passwords, OTPs, or recovery codes.
 * INDEPENDENCE: FF TRUST is an independent platform; it is NOT affiliated
 * with Garena or Free Fire. This disclosure propagates to footer/metadata.
 */

import type { SiteConfig } from "@/data/types";

/**
 * Canonical site URL — derived from NEXT_PUBLIC_SITE_URL (production) with a
 * safe local-development fallback. Netlify sets NEXT_PUBLIC_SITE_URL to the
 * real production domain; local `next dev` on port 1111 uses the fallback.
 * Metadata (OG image, canonical, sitemap, robots, structured data) all derive
 * from this value so production never emits localhost.
 */
function resolveSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (envUrl) return envUrl;
  return process.env.NODE_ENV === "production"
    ? "https://fftrust.example"
    : "http://localhost:1111";
}

export const siteUrl = resolveSiteUrl();

export const siteConfig: SiteConfig = {
  name: "FF TRUST",
  tagline: "Account Trust Studio",
  shortDescription:
    "An independent account-trust marketplace for Free Fire accounts, panel-seller services and rank-push packages — built around transparency, evidence and buyer safety.",
  seoDescription:
    "FF TRUST is an independent platform for Free Fire account listings, panel and services listings, paid push packages and Instagram views, followers and likes — with buyer proof and transparency throughout. Not affiliated with Garena or Free Fire.",
  brandLogo: "/fftrust.png",
  whatsapp: {
    number: "919330564851",
    label: "Owner · WhatsApp",
    /** The website NEVER sends automatically — the user presses Send. */
    autoSendClaim: false,
  },
  independence:
    "FF TRUST is an independent platform. It is not affiliated with, endorsed by, or sponsored by Garena or Free Fire. All trademarks belong to their respective owners.",
  safety: {
    recordingRemind:
      "Before you buy an account, please immediately TURN ON SCREEN RECORDING.",
    recordingKeep:
      "Keep SCREEN RECORDING ON throughout the transaction for PROOF.",
    neverCollect:
      "FF TRUST never asks for passwords, OTPs or recovery codes. The website cannot start recording.",
  },
  trustDisclaimer:
    "Transparency and provenance are not the same as a guarantee. Labels reflect the real canonical evidence state on file — nothing more.",
  palette: {
    cyan: "electric trust cyan",
    azure: "deep azure blue",
    violet: "holographic violet",
  },
  url: siteUrl,
  locale: "en-IN",
  currency: "INR",
};

export type { SiteConfig } from "@/data/types";
