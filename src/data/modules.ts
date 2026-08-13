/**
 * FF TRUST — Canonical module definitions (PROMPT 14 future-proofed).
 *
 * Single source of truth for the set of platform modules. Nav, footer, mobile
 * command center, sitemap and SEO discover these automatically — adding a
 * module here propagates to every surface without per-component edits.
 *
 * `surface` controls WHERE the module appears in the shell.
 * `category` controls HOW the ModuleLanding template composes.
 * `published` controls visibility (unpublished = hidden from public nav).
 * `status: "coming"` renders an honest "Coming Soon" entry (never a fake link).
 *
 * To add a future module:
 *  1. Add a ModuleDefinition entry here with status="coming" or "live"
 *  2. If "live", add the section to page.tsx — nav/footer/sitemap auto-discover
 *  3. No edits needed to header, footer, mobile command center, or selectors
 */

import type { ModuleDefinition } from "@/data/types";

export const modules: ModuleDefinition[] = [
  { key: "home", label: "Home", href: "/", anchor: "#top", status: "live", iconKey: "Home", order: 0, surface: "primary", category: "utility", published: true, metaDescription: "FF TRUST — an independent account-trust marketplace for Free Fire accounts, panel-seller services and rank-push packages." },
  { key: "explore", label: "Explore", href: "/#explore", anchor: "#explore", description: "Browse trusted accounts", status: "live", iconKey: "Compass", order: 10, surface: "primary", category: "marketplace", published: true, metaDescription: "Browse canonical Free Fire account listings with honest evidence metadata, INR pricing and WhatsApp inquiry." },
  { key: "price-guide", label: "Price Guide", href: "/#price-guide", anchor: "#price-guide", description: "INR price ranges", status: "live", iconKey: "BadgeIndianRupee", order: 30, surface: "primary", category: "utility", published: true, metaDescription: "Price bounds derived from published canonical records — never hardcoded. No invented market averages." },
  { key: "trust", label: "Trust", href: "/#trust", anchor: "#trust", description: "How trust & evidence work", status: "live", iconKey: "ShieldCheck", order: 20, surface: "safety", category: "safety", published: true, metaDescription: "Trust Center — transparency and provenance are not the same as a guarantee. Evidence labels reflect the real canonical state." },
  { key: "list-account", label: "List Your Account", href: "/#list-account", anchor: "#list-account", description: "Seller onboarding", status: "live", iconKey: "LayoutList", order: 40, surface: "primary", category: "marketplace", published: true, metaDescription: "Seller intake workflow — a transparent 6-step process. Submission is not verification and not publication." },
  { key: "panel-seller", label: "Panel Seller", href: "/#panel-seller", anchor: "#panel-seller", description: "Service marketplace", status: "live", iconKey: "Server", order: 50, surface: "services", category: "marketplace", published: true, metaDescription: "Panel Seller service showroom — panel, top-up and care services with explicit scope and honest evidence." },
  { key: "paid-push", label: "Paid Push", href: "/#paid-push", anchor: "#paid-push", description: "CS / BR rank-push packages", status: "live", iconKey: "Trophy", order: 60, surface: "services", category: "marketplace", published: true, metaDescription: "CS Rank Push and BR Rank Push packages. No guaranteed rank, wins, anti-ban or safety. Scope and effort only." },
  { key: "buyer-safety", label: "Safety", href: "/safety", description: "Screen-recording & buyer protection", status: "live", iconKey: "Video", order: 65, surface: "safety", category: "safety", published: true, metaDescription: "Buyer safety — turn on screen recording before you buy. The website cannot start recording." },
  { key: "how-it-works", label: "How It Works", href: "/#how-it-works", anchor: "#how-it-works", description: "The transparent 4-step flow", status: "live", iconKey: "Workflow", order: 67, surface: "primary", category: "editorial", published: true, metaDescription: "A transparent four-step flow — from canonical evidence to WhatsApp inquiry." },
  { key: "scam-center", label: "Scam Center", href: "/#scam-center", anchor: "#scam-center", description: "Red flags & awareness", status: "live", iconKey: "AlertTriangle", order: 68, surface: "safety", category: "safety", published: true, metaDescription: "Scam Center — interactive red-flag cards for fake proof, AI evidence, pressure, impersonation and credential theft." },
  { key: "compare", label: "Compare", href: "/#compare", anchor: "#compare", description: "Side-by-side & favorites", status: "live", iconKey: "Columns3", order: 69, surface: "primary", category: "utility", published: true, metaDescription: "Compare 2-4 accounts side-by-side with honest missing values. No fake metrics." },
  { key: "proof", label: "PROOF", href: "/proof", description: "Buyer proof — keep screen recording ON", status: "live", iconKey: "ShieldCheck", order: 71, surface: "primary", category: "safety", published: true, metaDescription: "Buyer Proof — keep screen recording ON throughout verification and transaction. Never share passwords, OTPs or recovery codes." },
  { key: "faq", label: "FAQ", href: "/#faq", anchor: "#faq", description: "Common questions", status: "live", iconKey: "HelpCircle", order: 70, surface: "system", category: "utility", published: true, metaDescription: "Common questions about FF TRUST — independence, trust, buyer safety and WhatsApp contact." },
  { key: "about", label: "About", href: "/#about", anchor: "#about", description: "Independent platform", status: "live", iconKey: "Info", order: 80, surface: "system", category: "editorial", published: true, metaDescription: "FF TRUST is an independent platform — not affiliated with Garena or Free Fire." },
  { key: "legal", label: "Legal", href: "/#legal", anchor: "#legal", description: "Terms & privacy", status: "live", iconKey: "Scale", order: 90, surface: "system", category: "utility", published: true, metaDescription: "Terms and privacy — frontend-only platform, no credential collection, no paid backend." },
  { key: "contact", label: "Contact", href: "/contact", description: "WhatsApp the owner", status: "live", iconKey: "MessageCircle", order: 95, surface: "system", category: "utility", published: true, metaDescription: "Contact the owner on WhatsApp — you press Send, the website never sends automatically." },
  // Future module example — intentionally configured as "coming". Renders an
  // honest "Coming Soon" entry in nav + module showcase. Never a fake link.
  { key: "safety-academy", label: "Safety Academy", href: "/#safety-academy", anchor: "#safety-academy", description: "Visual safety journey", status: "live", iconKey: "GraduationCap", order: 66, surface: "safety", category: "safety", published: true, metaDescription: "Safety Academy — a visual step-by-step journey through safe trading." },
  // Example of a future "coming" module (uncomment to activate):
  // { key: "compare-pro", label: "Compare Pro", href: "/#compare", anchor: "#compare", description: "Advanced comparison tools", status: "coming", iconKey: "Columns3", order: 71, surface: "primary", category: "utility", published: true, metaDescription: "Advanced comparison tools — coming soon." },
];
