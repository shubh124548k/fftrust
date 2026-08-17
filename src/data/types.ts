/**
 * FF TRUST — Production canonical type system (PROMPT 02).
 *
 * Single source of truth for every canonical record shape. Data files
 * (`src/data/*`) import these types; selectors (`src/lib/selectors/*`) expose
 * them; components consume them. Adding a field here propagates type-safety to
 * every consumer — no silent breakage.
 *
 * DESIGN RULES
 * - `priceInr` is the canonical price field (number, INR).
 * - `media: ListingMedia[]` is the canonical media list (≤30 images).
 * - `published` gates public exposure; `demo` marks SAMPLE fixtures.
 * - `featured` is an editorial flag, independent of `published`.
 * - Evidence fields reflect REAL provenance state — never a guarantee.
 * - No passwords, OTPs or recovery codes anywhere in this layer.
 */

/** ISO-8601 timestamp string. */
export type ISODate = string;

/* ============================================================
 * LISTING MEDIA
 * ============================================================ */

export type ListingMediaKind = "image" | "video";

export interface ListingMedia {
  kind: ListingMediaKind;
  /** Canonical real URL (static asset or real hosted media). Decorative
   *  visuals must NOT set `evidence: true`. */
  url: string;
  alt?: string;
  caption?: string;
  /** When true, this media is canonical account/service evidence — never
   *  decorative. Drives the evidence gallery treatment. */
  evidence?: boolean;
}

/** Maximum number of image media per listing (per spec: up to 30). */
export const MAX_LISTING_IMAGES = 30;

/**
 * Data-driven trust highlight. Each chip represents a claim that the
 * canonical data explicitly supports — never fabricated. Components render
 * these as small professional badges on cards / Details / Compare.
 *
 * Icon semantics: "check" = ✓ verified / proof; "zap" = ⚡ speed / performance.
 */
export interface TrustHighlight {
  /** "check" renders ✓, "zap" renders ⚡. */
  icon: "check" | "zap";
  /** Short professional label (max ~25 chars). */
  label: string;
}

/**
 * Simplified media fields (preferred over the flat `media: ListingMedia[]`).
 * These provide a clean, URL-only interface for the canonical data files.
 *
 * - `frontImage`: exactly ONE cover image URL shown on the listing card
 * - `galleryImages`: up to 30 image URLs shown in the detail gallery
 * - `videoUrl`: optional single video URL (YouTube/Vimeo/direct file)
 *
 * If both `frontImage` and `media[]` exist, `frontImage` takes precedence
 * for the card image. If `galleryImages` exists, it takes precedence over
 * `media[]` for the detail gallery.
 */
export interface ListingMediaFields {
  /** Front/cover image URL for the listing card. */
  frontImage?: string;
  /** Up to 30 gallery image URLs for the detail page. */
  galleryImages?: string[];
  /** Optional single video URL (YouTube, Vimeo, or direct video file). */
  videoUrl?: string;
}

/* ============================================================
 * ACCOUNT LISTING
 * ============================================================ */

export type AccountCategory =
  | "battleground"
  | "ranked"
  | "collection"
  | "starter"
  | "prime";

export interface AccountEvidence {
  /** Whether the original bound email transfers with the account. */
  hasBoundEmail: boolean;
  /** Whether a purchase receipt is on file. */
  hasOriginalReceipt: boolean;
  /** Whether recovery-code access is part of the listing scope.
   *  FF TRUST itself never collects OTPs / recovery codes. */
  hasRecoveryAccess: boolean;
  /** Honest provenance note — never a guarantee. */
  provenanceNote?: string;
}

/**
 * Production account listing. Supports the full public field set: stable ID,
 * title, priceInr, level, optional rank, Prime, collections, weapons, Evo,
 * emotes, bundles, pets, vehicles, badges, description, tags, seller reference,
 * evidence/provenance, up to 30 image URLs, video URLs, terms, publication
 * state, featured state and timestamps.
 */
export interface AccountListing {
  id: string;
  title: string;
  category: AccountCategory;
  level: number;
  /** Optional rank — some accounts may be unranked. */
  rank?: string;
  region: string;
  /** Price the customer pays (INR). */
  priceInr: number;
  /** Optional pre-discount price (INR). When set and greater than priceInr,
   *  cards and details derive a real "SAVE ₹X • Y% OFF" badge. Never set
   *  unless a genuine original price exists. */
  originalPrice?: number;
  /** Prime membership flag. */
  prime?: boolean;
  /** Named collection items on the account. */
  collections?: string[];
  weapons?: string[];
  evo?: string[];
  emotes?: string[];
  bundles?: string[];
  pets?: string[];
  vehicles?: string[];
  badges?: string[];
  description?: string;
  tags: string[];
  /** Stable seller reference id (see SellerReference). */
  sellerRef: string;
  evidence: AccountEvidence;
  /** Up to 30 image URLs + video URLs, structured (legacy). */
  media: ListingMedia[];
  /** Simplified media fields (preferred over media[]). */
  frontImage?: string;
  galleryImages?: string[];
  videoUrl?: string;
  terms?: string;
  published: boolean;
  /** Editorial featured flag — independent of `published`. */
  featured?: boolean;
  /** SAMPLE fixture flag — never production. */
  demo?: boolean;
  /** Data-driven trust highlights — only render when present. NEVER fabricate. */
  trustHighlights?: TrustHighlight[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

/** Backward-compat alias (PROMPT 01 consumers). */
export type AccountRecord = AccountListing;

/* ============================================================
 * SELLER REFERENCE
 * ============================================================ */

/**
 * Seller reference. REAL-DATA contract: `verifiedEvidence` lists honest
 * evidence-state labels (e.g. "Bound email on file") — NEVER fake ratings,
 * reviews, verification percentages or trust scores.
 */
export interface SellerReference {
  id: string;
  displayName: string;
  /** Honest evidence-state labels derived from real canonical state. */
  verifiedEvidence: string[];
  /** Public contact note (e.g. "Owner · WhatsApp"). */
  note?: string;
  demo?: boolean;
}

/* ============================================================
 * PANEL SELLER SERVICE
 * ============================================================ */

export type ServiceCategory =
  | "panel"
  | "topup"
  | "diamond"
  | "bundle"
  | "account-care";

/**
 * Optional package tier for service listings (PROMPT 02 Parts 10/12).
 * When present, the UI renders tier pricing with computed savings/discount;
 * when absent, the single `priceInr` is shown. All values are canonical.
 *
 * Extended (PROMPT 5): each package now supports optional per-tier highlights,
 * features, duration, delivery, included/excluded — only rendered when present.
 */
export interface ServicePackage {
  /** Stable ID within the listing. */
  id: string;
  /** Tier label (e.g. "Basic", "Pro", "Premium"). */
  label: string;
  /** Original price in INR (before discount). */
  originalPrice: number;
  /** Current price in INR (what the customer pays). */
  currentPrice: number;
  /** Optional badge text (e.g. "BEST VALUE", "POPULAR"). */
  badge?: string;
  /** Short package-specific highlights — card shows max 2–3. */
  highlights?: string[];
  /** Longer feature list — Details shows full. */
  features?: string[];
  /** Duration description (e.g. "1-day access"). */
  duration?: string;
  /** Delivery speed description (e.g. "Within 1 hour"). */
  delivery?: string;
  /** Items included in this specific tier. */
  included?: string[];
  /** Items excluded from this specific tier. */
  excluded?: string[];
}

/**
 * Panel Seller service record. Legitimate service marketplace: service ID,
 * title, category, priceInr, scope, requirements, included/excluded, media,
 * evidence, seller reference, terms, tags and publication state.
 */
export interface PanelSellerService {
  id: string;
  title: string;
  category: ServiceCategory;
  scope: string;
  requirements: string[];
  included: string[];
  excluded: string[];
  priceInr: number;
  /** Optional package tiers — when present, package pricing overrides single price. */
  packages?: ServicePackage[];
  tags: string[];
  sellerRef: string;
  media: ListingMedia[];
  /** Simplified media fields (preferred over media[]). */
  frontImage?: string;
  galleryImages?: string[];
  videoUrl?: string;
  evidence?: AccountEvidence;
  evidenceNotes?: string;
  terms?: string;
  published: boolean;
  featured?: boolean;
  demo?: boolean;
  /** Data-driven trust highlights — only render when present. NEVER fabricate. */
  trustHighlights?: TrustHighlight[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

/** Backward-compat alias. */
export type ServiceRecord = PanelSellerService;

/* ============================================================
 * PAID PUSH SERVICE
 * ============================================================ */

export type RankPushMode = "CS" | "BR";

/**
 * Paid Push service record. Supports CS Rank Push and BR Rank Push.
 * NEVER promises guaranteed rank, wins, completion, anti-ban or safety.
 * `schedule` is set ONLY when real — never fabricated availability.
 */
export interface PaidPushService {
  id: string;
  mode: RankPushMode;
  title: string;
  fromRank: string;
  toRank: string;
  packageTier: string;
  scope: string;
  requirements: string[];
  priceInr: number;
  /** Optional package tiers — when present, package pricing overrides single price. */
  packages?: ServicePackage[];
  tags: string[];
  sellerRef: string;
  media: ListingMedia[];
  /** Simplified media fields (preferred over media[]). */
  frontImage?: string;
  galleryImages?: string[];
  videoUrl?: string;
  evidence?: AccountEvidence;
  evidenceNotes?: string;
  /** Real schedule only — never fabricated. */
  schedule?: string;
  terms?: string;
  published: boolean;
  featured?: boolean;
  demo?: boolean;
  /** Data-driven trust highlights — only render when present. NEVER fabricate. */
  trustHighlights?: TrustHighlight[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

/** Backward-compat alias. */
export type RankPushPackage = PaidPushService;

/* ============================================================
 * INSTAGRAM SERVICE
 * ============================================================ */

/** Single Instagram package (views / followers / likes tier). */
export interface InstagramPackage {
  /** Stable unique ID. */
  id: string;
  /** Quantity of views/followers/likes. */
  quantity: number;
  /** Original price in INR (before discount). */
  originalPrice: number;
  /** Discounted price in INR (what customer pays). */
  discountPrice: number;
  /** Whether this package is available for purchase. */
  enabled: boolean;
  /** Optional badge text (e.g. "BEST VALUE", "POPULAR"). */
  badge?: string;
}

/** One Instagram service category (Views / Followers / Likes). */
export interface InstagramServiceType {
  key: "views" | "followers" | "likes";
  label: string;
  emoji: string;
  /** WhatsApp number for orders (E.164 format without +). */
  whatsappNumber: string;
  packages: InstagramPackage[];
  /** Data-driven trust highlights — only render when present. NEVER fabricate. */
  trustHighlights?: TrustHighlight[];
}

/** Instagram growth category metadata (hub tile). `status` gates the tile:
 *  live categories link to their real route; coming-soon categories render
 *  locked and NEVER navigate to a fake destination. */
export interface InstagramCategoryMeta {
  /** Stable key (also the iconKey lookup). */
  key: string;
  label: string;
  shortLabel: string;
  emoji?: string;
  iconKey?: string;
  /** Live categories link here — omitted for coming-soon tiles. */
  href?: string;
  description?: string;
  status: "live" | "coming-soon";
  /** Plural unit label for counts (e.g. "packages", "videos"). */
  unit: string;
}

/* ============================================================
 * MODULE DEFINITION
 * ============================================================ */

export type ModuleStatus = "live" | "coming";

/**
 * Module definition. New modules added to `src/data/modules.ts` are discovered
 * automatically by nav + footer + sitemap — no per-component edits.
 */
export interface ModuleDefinition {
  key: string;
  label: string;
  href: string;
  anchor?: string;
  description?: string;
  status: ModuleStatus;
  /** Lucide icon name key for consistent rendering. */
  iconKey?: string;
  /** Sort order for nav rendering. */
  order?: number;
  /** Navigation surface grouping — controls where the module appears in the
   *  shell (primary bar, services dropdown, safety group, system group). */
  surface?: "primary" | "services" | "safety" | "system";
  /** Module category — controls how the ModuleLanding template composes. */
  category?: "marketplace" | "editorial" | "utility" | "safety";
  /** Publication flag — unpublished modules are hidden from public nav
   *  (but remain in the config for future activation). */
  published?: boolean;
  /** SEO meta description for this module (truthful, no fake claims). */
  metaDescription?: string;
}

/* ============================================================
 * SITE CONFIG + WHATSAPP CONFIG (typed)
 * ============================================================ */

export interface WhatsAppConfig {
  /** International format, no "+". */
  number: string;
  label: string;
  /** Literal false — the website NEVER sends automatically. */
  autoSendClaim: false;
}

export interface SafetyContent {
  recordingRemind: string;
  recordingKeep: string;
  neverCollect: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  shortDescription: string;
  /** SEO meta description for the default/home page metadata. */
  seoDescription: string;
  /** Canonical brand logo asset (public path). Single source of truth for
   *  every UI brand location and all social/SEO metadata consumers. */
  brandLogo: string;
  whatsapp: WhatsAppConfig;
  independence: string;
  safety: SafetyContent;
  trustDisclaimer: string;
  palette: { cyan: string; azure: string; violet: string };
  url: string;
  locale: string;
  currency: string;
}

/* ============================================================
 * TRUST / PRICE GUIDE / FAQ / LEGAL CONTENT
 * ============================================================ */

export interface TrustPillar {
  key: string;
  title: string;
  body: string;
  iconKey?: string;
}

export interface EvidenceLabel {
  key: string;
  label: string;
  description: string;
}

export interface TrustContent {
  disclaimer: string;
  pillars: TrustPillar[];
  evidenceLabels: EvidenceLabel[];
}

export interface PriceGuideContent {
  intro: string;
  emptyNote: string;
  /** Literal — bands are derived from real canonical data only. */
  derivedFromReal: true;
}

export interface FAQItem {
  q: string;
  a: string;
  category?: string;
}

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalContent {
  terms: { intro: string; sections: LegalSection[] };
  privacy: { intro: string; sections: LegalSection[] };
}

/** How-it-works process step for the Home 3D process diagram. */
export interface ProcessStep {
  key: string;
  title: string;
  body: string;
  iconKey?: string;
}

export interface HowItWorksContent {
  intro: string;
  steps: ProcessStep[];
}

/** Scam-center awareness content — honest, non-alarmist. */
export interface ScamCenterContent {
  intro: string;
  redFlags: { key: string; label: string; body: string }[];
  goldenRule: string;
}

/** Compare / favorites preview content. */
export interface CompareContent {
  intro: string;
  emptyNote: string;
}

/** Safety Academy journey content — visual step-by-step. */
export interface SafetyAcademyContent {
  intro: string;
  lessons: { key: string; title: string; body: string; iconKey?: string }[];
}

/* ============================================================
 * SHARED SELECTOR TYPES
 * ============================================================ */

export type SortKey = "newest" | "price-asc" | "price-desc" | "level-desc";

export interface FeaturedResult<T> {
  records: T[];
  /** True when the returned records are SAMPLE fixtures (real inventory empty). */
  isSample: boolean;
}

export interface PriceBounds {
  min: number;
  max: number;
  count: number;
}
