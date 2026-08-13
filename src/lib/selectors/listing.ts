/**
 * FF TRUST — Unified listing selectors (PROMPT 01).
 *
 * One shared transformation surface for every canonical listing kind (account,
 * panel service, paid push). Consumers (Card, Details, Media, Compare,
 * WhatsApp, metadata) read through these helpers instead of re-assembling
 * media arrays / price / evidence inline — so a canonical shape change
 * propagates everywhere without per-component edits.
 *
 * All media helpers wrap `src/lib/media` (validation + 30-image cap).
 */

import {
  resolveListingMedia,
  toListingMediaList,
  getListingAllImages,
  type ResolvedMedia,
} from "@/lib/media";
import type {
  AccountEvidence,
  AccountListing,
  ListingMedia,
} from "@/data/types";

export { toListingMediaList, getListingAllImages };

/** Unified, validated media view for any listing kind. */
export function getListingMedia<T extends { media?: ListingMedia[] }>(
  listing: T,
  title: string = "Listing",
): ResolvedMedia {
  return resolveListingMedia(listing, title);
}

/** Canonical price (INR) for any listing. `priceInr` is the single source. */
export function getListingPrice<T extends { priceInr: number }>(listing: T): number {
  return listing.priceInr;
}

/** Evidence state for any listing kind (undefined when no evidence on file). */
export function getListingEvidence<T extends { evidence?: AccountEvidence }>(
  listing: T,
): AccountEvidence | undefined {
  return listing.evidence;
}

/* ============================================================
 * ACCOUNT CARD DATA — everything a card needs from one record.
 * ============================================================ */

export interface AccountCardData {
  /** Validated media (front image, gallery, video). */
  media: ResolvedMedia;
  /** Deduplicated, capped image URLs for the lightbox. */
  allImages: string[];
  /** Canonical INR price. */
  price: number;
  weaponCount: number;
  collectionCount: number;
  evoCount: number;
  evidence: AccountEvidence;
  isFeatured: boolean;
  isUnavailable: boolean;
}

/** Derive all card-display data from one canonical account record. */
export function getAccountCardData(record: AccountListing): AccountCardData {
  return {
    media: resolveListingMedia(record, record.title),
    allImages: getListingAllImages(record, record.title),
    price: record.priceInr,
    weaponCount: record.weapons?.length ?? 0,
    collectionCount: record.collections?.length ?? 0,
    evoCount: record.evo?.length ?? 0,
    evidence: record.evidence,
    isFeatured: !!record.featured && !record.demo,
    isUnavailable: !record.published,
  };
}

/* ============================================================
 * ACCOUNT DETAILS DATA — everything the dossier needs.
 * ============================================================ */

export interface AccountDetailsData {
  /** Validated media for the card stage. */
  media: ResolvedMedia;
  /** Canonical `ListingMedia[]` for the detail gallery. */
  mediaList: ListingMedia[];
  /** Canonical INR price. */
  price: number;
  evidence: AccountEvidence;
}

/** Derive all detail-dossier display data from one canonical account record. */
export function getAccountDetailsData(record: AccountListing): AccountDetailsData {
  return {
    media: resolveListingMedia(record, record.title),
    mediaList: toListingMediaList(record, record.title),
    price: record.priceInr,
    evidence: record.evidence,
  };
}
