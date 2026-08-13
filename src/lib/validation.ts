/**
 * FF TRUST — Input validation utilities.
 *
 * Security boundary for validating user-controlled and canonical-data inputs.
 * Client-side validation is for UX; these functions provide the actual
 * safety checks that prevent XSS, URL injection, and malformed data.
 *
 * Key principles:
 *  - Never trust client-provided listing IDs or type identifiers
 *  - Reject dangerous URL schemes (javascript:, data:, vbscript:)
 *  - Validate numeric ranges (prices, levels)
 *  - Cap text length to prevent oversized payloads
 *  - Sanitize free-form text for display
 */

/** Allowed listing types. */
export const VALID_LISTING_TYPES = ["account", "panel", "paid-push"] as const;
export type ValidListingType = (typeof VALID_LISTING_TYPES)[number];

/** Dangerous URL schemes that must never be allowed. */
const DANGEROUS_SCHEMES = /^(javascript|data|vbscript|file|about):/i;

/** Allowed URL schemes for images and media. */
const SAFE_URL_SCHEMES = /^https?:\/\//i;

/** Maximum text lengths for various fields. */
export const MAX_LENGTHS = {
  title: 200,
  description: 2000,
  sellerName: 100,
  inquiry: 500,
  searchQuery: 200,
  listingId: 100,
} as const;

/**
 * Validate that a URL uses a safe protocol (http/https).
 * Rejects javascript:, data:, vbscript:, file:, and other dangerous schemes.
 */
export function isSafeUrl(url: string | undefined | null): url is string {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) return false;
  if (DANGEROUS_SCHEMES.test(trimmed)) return false;
  return SAFE_URL_SCHEMES.test(trimmed);
}

/**
 * Validate an image URL — must be http/https.
 * Use this before rendering any canonical-data image URL.
 */
export function validateImageUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  return isSafeUrl(url) ? url : null;
}

/**
 * Validate a video URL — must be http/https from an allowed provider.
 * Currently allows YouTube, Vimeo, and direct video URLs.
 */
export function validateVideoUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  if (!isSafeUrl(url)) return null;
  const lower = url.toLowerCase();
  // Allow YouTube, Vimeo, and direct video file URLs
  if (
    lower.includes("youtube.com") ||
    lower.includes("youtu.be") ||
    lower.includes("vimeo.com") ||
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mov") ||
    lower.endsWith(".m4v")
  ) {
    return url;
  }
  return null;
}

/**
 * Validate a listing ID — must be a non-empty alphanumeric string with
 * hyphens/underscores only, within max length.
 */
export function validateListingId(id: string | undefined | null): string | null {
  if (!id || typeof id !== "string") return null;
  const trimmed = id.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_LENGTHS.listingId) return null;
  // Allow alphanumeric, hyphens, underscores only
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) return null;
  return trimmed;
}

/**
 * Validate a listing type — must be one of the allowed types.
 */
export function validateListingType(type: string | undefined | null): ValidListingType | null {
  if (!type || typeof type !== "string") return null;
  return VALID_LISTING_TYPES.includes(type as ValidListingType)
    ? (type as ValidListingType)
    : null;
}

/**
 * Validate a price — must be a positive finite number within a reasonable range.
 */
export function validatePrice(price: number | undefined | null): number | null {
  if (price === null || price === undefined || typeof price !== "number") return null;
  if (!Number.isFinite(price) || price < 0 || price > 99999999) return null;
  return Math.round(price);
}

/**
 * Validate a level — must be a non-negative integer within game range.
 */
export function validateLevel(level: number | undefined | null): number | null {
  if (level === null || level === undefined || typeof level !== "number") return null;
  if (!Number.isInteger(level) || level < 0 || level > 999) return null;
  return level;
}

/**
 * Sanitize free-form text for safe display.
 * Trims whitespace, caps length, strips control characters.
 * Does NOT escape HTML — React handles that automatically.
 */
export function sanitizeText(
  text: string | undefined | null,
  maxLength: number = MAX_LENGTHS.description,
): string {
  if (!text || typeof text !== "string") return "";
  const trimmed = text.trim();
  // Strip control characters (except newlines/tabs)
  const cleaned = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return cleaned.slice(0, maxLength);
}

/**
 * Validate a WhatsApp inquiry message — caps length, strips dangerous content.
 */
export function validateInquiry(inquiry: string | undefined | null): string {
  return sanitizeText(inquiry, MAX_LENGTHS.inquiry);
}

/**
 * Check if a string contains potential XSS patterns.
 * This is a defense-in-depth check — React already escapes content.
 */
export function containsXssPatterns(text: string | undefined | null): boolean {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase();
  return (
    lower.includes("<script") ||
    lower.includes("javascript:") ||
    lower.includes("onerror=") ||
    lower.includes("onload=") ||
    lower.includes("onclick=") ||
    lower.includes("<iframe") ||
    lower.includes("<embed") ||
    lower.includes("<object")
  );
}

/**
 * Rate limiter — simple in-memory counter for client-side abuse prevention.
 * For production server-side rate limiting, use a proper middleware/Redis solution.
 */
export class RateLimiter {
  private attempts = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000, // 1 minute
  ) {}

  /** Check if an action is allowed for the given key. Returns true if allowed. */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(key);

    if (!entry || now > entry.resetAt) {
      this.attempts.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (entry.count >= this.maxAttempts) {
      return false;
    }

    entry.count++;
    return true;
  }

  /** Reset the counter for a key. */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /** Get remaining attempts for a key. */
  remaining(key: string): number {
    const entry = this.attempts.get(key);
    if (!entry || Date.now() > entry.resetAt) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - entry.count);
  }
}

// Global rate limiters for common actions
export const contactRateLimiter = new RateLimiter(5, 60000); // 5 per minute
export const reportRateLimiter = new RateLimiter(3, 300000); // 3 per 5 minutes
