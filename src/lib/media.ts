/**
 * FF TRUST — Media resolution helpers.
 *
 * Provides a unified interface for extracting media from any listing type,
 * regardless of whether the listing uses the new simplified fields
 * (`frontImage`, `galleryImages`, `videoUrl`) or the legacy `media[]` array.
 *
 * Priority:
 *  1. `frontImage` / `galleryImages` / `videoUrl` (new — preferred)
 *  2. `media[]` (legacy — fallback)
 *
 * All URLs are validated for safety (http/https only, no javascript:/data:).
 * Gallery images are capped at MAX_LISTING_IMAGES (30).
 */

import { MAX_LISTING_IMAGES } from "@/data/types";
import { validateImageUrl, validateVideoUrl } from "@/lib/validation";
import type { ListingMedia } from "@/data/types";

/** Any listing type that has media fields. */
interface MediaBearingListing {
  frontImage?: string;
  galleryImages?: string[];
  videoUrl?: string;
  media?: Array<{ kind: "image" | "video"; url: string; alt?: string }>;
}

export interface ResolvedMedia {
  /** Validated front image URL (or null if none). */
  frontImage: string | null;
  /** Validated gallery image URLs (max 30). */
  galleryImages: string[];
  /** Validated video URL (or null if none). */
  videoUrl: string | null;
  /** Alt text for the front image. */
  frontImageAlt: string;
}

/**
 * Resolve media from any listing, using new fields first, legacy fallback.
 * Validates all URLs for safety and caps gallery at 30 images.
 */
export function resolveListingMedia(
  listing: MediaBearingListing,
  title: string = "Listing",
): ResolvedMedia {
  // Front image — prefer frontImage, fallback to first image in media[]
  let frontImage: string | null = null;
  if (listing.frontImage) {
    frontImage = validateImageUrl(listing.frontImage);
  }
  if (!frontImage && listing.media) {
    const firstImage = listing.media.find((m) => m.kind === "image");
    if (firstImage) {
      frontImage = validateImageUrl(firstImage.url);
    }
  }

  // Gallery images — prefer galleryImages, fallback to media[] images
  let galleryImages: string[] = [];
  if (listing.galleryImages && listing.galleryImages.length > 0) {
    galleryImages = listing.galleryImages
      .slice(0, MAX_LISTING_IMAGES)
      .map((url) => validateImageUrl(url))
      .filter((url): url is string => url !== null);
  } else if (listing.media) {
    galleryImages = listing.media
      .filter((m) => m.kind === "image")
      .slice(0, MAX_LISTING_IMAGES)
      .map((m) => validateImageUrl(m.url))
      .filter((url): url is string => url !== null);
  }

  // Video — prefer videoUrl, fallback to media[] video
  let videoUrl: string | null = null;
  if (listing.videoUrl) {
    videoUrl = validateVideoUrl(listing.videoUrl);
  }
  if (!videoUrl && listing.media) {
    const video = listing.media.find((m) => m.kind === "video");
    if (video) {
      videoUrl = validateVideoUrl(video.url);
    }
  }

  return {
    frontImage,
    galleryImages,
    videoUrl,
    frontImageAlt: title,
  };
}

/**
 * Build the canonical `ListingMedia[]` list for a listing, matching the detail
 * dossier convention: `frontImage` (cover), then `galleryImages`, then
 * `videoUrl`, then any legacy `media[]` entries. Deduplication is left to the
 * consumer — this reproduces exactly the media that feeds the gallery.
 */
export function toListingMediaList(
  listing: MediaBearingListing,
  title: string = "Listing",
): ListingMedia[] {
  return [
    ...(listing.frontImage ? [{ kind: "image" as const, url: listing.frontImage, alt: title }] : []),
    ...(listing.galleryImages?.map((url) => ({ kind: "image" as const, url, alt: title })) ?? []),
    ...(listing.videoUrl ? [{ kind: "video" as const, url: listing.videoUrl, alt: title }] : []),
    ...(listing.media ?? []),
  ];
}

/**
 * All displayable image URLs for a listing (front image + gallery), validated,
 * deduplicated and capped at MAX_LISTING_IMAGES. Drives lightbox galleries on
 * account / panel / paid-push cards.
 */
export function getListingAllImages(
  listing: MediaBearingListing,
  title: string = "Listing",
): string[] {
  const { frontImage, galleryImages } = resolveListingMedia(listing, title);
  const imgs = [frontImage, ...galleryImages].filter(Boolean) as string[];
  return [...new Set(imgs)].slice(0, MAX_LISTING_IMAGES);
}

/* ============================================================
 * VIDEO EMBEDS — YouTube / Vimeo detection + safe embed URLs
 * ============================================================ */

/** Extract a YouTube video ID from common URL formats. */
export function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/** Extract a Vimeo video ID from a URL. */
export function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

/**
 * Convert a video URL to a privacy-friendly embed URL (YouTube-nocookie /
 * Vimeo), or return null for direct-file videos. The result is always a URL
 * already allowed by the site CSP frame-src allowlist.
 */
export function toVideoEmbedUrl(url: string): string | null {
  const youtubeId = getYouTubeId(url);
  if (youtubeId) return `https://www.youtube-nocookie.com/embed/${youtubeId}`;
  const vimeoId = getVimeoId(url);
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;
  return null;
}
