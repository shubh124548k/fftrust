/**
 * FF TRUST — Instagram pricing selectors.
 *
 * Provides computed values (savings amount, savings percentage) derived
 * from the canonical pricing data. Components never calculate savings
 * directly — they use these selectors.
 */

import { instagramViewsData } from "@/data/instagram/views";
import { instagramFollowersData } from "@/data/instagram/followers";
import { instagramLikesData } from "@/data/instagram/likes";
import { instagramCategories } from "@/data/instagram/categories";
import type { InstagramCategoryMeta, InstagramPackage, InstagramServiceType } from "@/data/types";

export interface InstagramPackageWithSavings extends InstagramPackage {
  /** Savings amount in INR (originalPrice - discountPrice). */
  savingAmount: number;
  /** Savings percentage, rounded to nearest integer. */
  savingPercentage: number;
  /** Formatted quantity (e.g. "500,000"). */
  formattedQuantity: string;
}

/** Calculate savings from a package. */
export function calculateSavings(pkg: InstagramPackage): { savingAmount: number; savingPercentage: number } {
  const savingAmount = pkg.originalPrice - pkg.discountPrice;
  const savingPercentage = Math.round((savingAmount / pkg.originalPrice) * 100);
  return { savingAmount, savingPercentage };
}

/** Format a number with Indian-style comma separators. */
export function formatQuantity(n: number): string {
  return n.toLocaleString("en-IN");
}

/** Format a price in INR. */
export function formatPrice(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

/** Instagram package sort keys (numeric — never sorts formatted strings). */
export type InstagramSortKey = "price-asc" | "price-desc";

/**
 * Sort Instagram packages numerically by discount price (the selling price
 * shown on the card). Derived from canonical pricing data only.
 */
export function sortInstagramPackages(
  packages: InstagramPackageWithSavings[],
  sort: InstagramSortKey,
): InstagramPackageWithSavings[] {
  const copy = [...packages];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.discountPrice - b.discountPrice);
    case "price-desc":
    default:
      return copy.sort((a, b) => b.discountPrice - a.discountPrice);
  }
}

/** Get all enabled Views packages with computed savings. */
export function getViewsPackages(): InstagramPackageWithSavings[] {
  return instagramViewsData.packages
    .filter((p) => p.enabled)
    .map((p) => {
      const { savingAmount, savingPercentage } = calculateSavings(p);
      return {
        ...p,
        savingAmount,
        savingPercentage,
        formattedQuantity: formatQuantity(p.quantity),
      };
    });
}

/** Get the Views service metadata. */
export function getViewsService(): InstagramServiceType {
  return instagramViewsData;
}

/** Get all enabled Followers packages with computed savings. */
export function getFollowersPackages(): InstagramPackageWithSavings[] {
  return instagramFollowersData.packages
    .filter((p) => p.enabled)
    .map((p) => {
      const { savingAmount, savingPercentage } = calculateSavings(p);
      return {
        ...p,
        savingAmount,
        savingPercentage,
        formattedQuantity: formatQuantity(p.quantity),
      };
    });
}

/** Get the Followers service metadata. */
export function getFollowersService(): InstagramServiceType {
  return instagramFollowersData;
}

/** Human-readable unit label for a service key. */
export function unitLabelForService(key: InstagramServiceType["key"]): string {
  return key === "views" ? "Views" : key === "followers" ? "Followers" : "Likes";
}

/** Get all enabled Likes packages with computed savings. */
export function getLikesPackages(): InstagramPackageWithSavings[] {
  return instagramLikesData.packages
    .filter((p) => p.enabled)
    .map((p) => {
      const { savingAmount, savingPercentage } = calculateSavings(p);
      return {
        ...p,
        savingAmount,
        savingPercentage,
        formattedQuantity: formatQuantity(p.quantity),
      };
    });
}

/** Get the Likes service metadata. */
export function getLikesService(): InstagramServiceType {
  return instagramLikesData;
}

/** Derived summary for one Instagram hub tile — count + from-price are always
 *  computed from the canonical package data, never stored/hardcoded. */
export interface InstagramCategorySummary {
  meta: InstagramCategoryMeta;
  /** Number of enabled packages (0 for coming-soon categories). */
  count: number;
  /** Cheapest enabled package price in INR (null for coming-soon). */
  fromPrice: number | null;
  /** Lowest package quantity as a formatted label (e.g. "From 500"), null for
   *  coming-soon categories. */
  fromLabel: string | null;
}

const servicePackageLoader: Record<string, () => InstagramPackageWithSavings[]> = {
  views: getViewsPackages,
  followers: getFollowersPackages,
  likes: getLikesPackages,
};

/** Build every Instagram hub tile from canonical category metadata + data. */
export function getInstagramCategorySummaries(): InstagramCategorySummary[] {
  return instagramCategories.map((meta) => {
    const load = servicePackageLoader[meta.key];
    if (!load) {
      return { meta, count: 0, fromPrice: null, fromLabel: null };
    }
    const pkgs = load();
    if (pkgs.length === 0) {
      return { meta, count: 0, fromPrice: null, fromLabel: null };
    }
    const cheapest = pkgs.reduce((a, b) => (b.discountPrice < a.discountPrice ? b : a));
    return {
      meta,
      count: pkgs.length,
      fromPrice: cheapest.discountPrice,
      fromLabel: `From ${formatQuantity(cheapest.quantity)}`,
    };
  });
}

/** Get a specific package by ID (Views pool). */
export function getPackageById(id: string): InstagramPackageWithSavings | null {
  const all = getViewsPackages();
  return all.find((p) => p.id === id) ?? null;
}

/** Get a specific package by ID across ALL Instagram services (views,
 *  followers, likes). Used by wishlist / compare resolution so an Instagram
 *  package can be looked up from any part of the app. */
export function getInstagramPackageById(id: string): InstagramPackageWithSavings | null {
  const pools = [getViewsPackages(), getFollowersPackages(), getLikesPackages()];
  for (const pool of pools) {
    const found = pool.find((p) => p.id === id);
    if (found) return found;
  }
  return null;
}

/** Resolve the canonical service type (Views/Followers/Likes) that owns a
 *  package ID, or null when the ID does not resolve. */
export function getInstagramServiceByPackageId(
  id: string,
): { service: InstagramServiceType; pkg: InstagramPackageWithSavings } | null {
  const entries: { service: InstagramServiceType; packages: () => InstagramPackageWithSavings[] }[] = [
    { service: instagramViewsData, packages: getViewsPackages },
    { service: instagramFollowersData, packages: getFollowersPackages },
    { service: instagramLikesData, packages: getLikesPackages },
  ];
  for (const entry of entries) {
    const pkg = entry.packages().find((p) => p.id === id);
    if (pkg) return { service: entry.service, pkg };
  }
  return null;
}

/** Sanitize a single-line form value for embedding in a WhatsApp message. */
export function sanitizeInstagramLine(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
}

/** Does the value look like a valid Instagram username, @handle, or profile URL? */
function isValidInstagramHandleOrUrl(value: string): boolean {
  const trimmed = value.trim();
  if (/^(https?:\/\/)?(www\.)?instagram\.com\/.+$/i.test(trimmed)) return true;
  const handle = trimmed.replace(/^@/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(handle);
}

/** Does the value look like a reasonable phone number (E.164-ish, 10–15 digits)? */
function isValidPhoneNumber(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/** Validate the universal Instagram order form. Returns a map of field → error. */
export function validateInstagramOrderForm(form: {
  customerName: string;
  instagramUsername: string;
  whatsappNumber: string;
  note: string;
}): Record<string, string> {
  const errs: Record<string, string> = {};
  const name = form.customerName.trim();
  const username = form.instagramUsername.trim();
  const phone = form.whatsappNumber.trim();
  const note = form.note.trim();

  if (!name) {
    errs.customerName = "Name is required";
  } else if (name.length < 2) {
    errs.customerName = "Name must be at least 2 characters";
  } else if (name.length > 60) {
    errs.customerName = "Name must be 60 characters or fewer";
  }

  if (!username) {
    errs.instagramUsername = "Instagram username or profile URL is required";
  } else if (username.length > 200) {
    errs.instagramUsername = "Too long — max 200 characters";
  } else if (!isValidInstagramHandleOrUrl(username)) {
    errs.instagramUsername = "Enter a valid @username or Instagram profile URL";
  }

  if (!phone) {
    errs.whatsappNumber = "WhatsApp number is required";
  } else if (!isValidPhoneNumber(phone)) {
    errs.whatsappNumber = "Enter a valid phone number (e.g. +91 98765 43210)";
  }

  if (note.length > 500) {
    errs.note = "Note must be 500 characters or fewer";
  }

  return errs;
}

/** Build a WhatsApp order message for a specific package. */
export function buildInstagramOrderMessage(params: {
  service: InstagramServiceType;
  pkg: InstagramPackageWithSavings;
  customerName: string;
  instagramUsername: string;
  whatsappNumber: string;
  note?: string;
}): string {
  const { service, pkg, customerName, instagramUsername, whatsappNumber, note } = params;
  const lines = [
    `Hello 👋 FF TRUST!`,
    ``,
    `🛒 I want to order ${service.label}.`,
    ``,
    `📦 Package: ${pkg.formattedQuantity} ${unitLabelForService(service.key)}`,
    `💰 Original Price: ${formatPrice(pkg.originalPrice)}`,
    `🔥 Discount Price: ${formatPrice(pkg.discountPrice)}`,
    `💚 You Save: ${formatPrice(pkg.savingAmount)} (${pkg.savingPercentage}%)`,
    ``,
    `👤 Customer: ${customerName}`,
    `📸 Instagram: ${instagramUsername}`,
    `📱 WhatsApp: ${whatsappNumber}`,
  ];
  if (note && note.trim()) {
    lines.push(`📝 Note: ${note.trim()}`);
  }
  lines.push(
    ``,
    `🔐 I understand that FF TRUST will never ask for my Instagram password, OTP, or login credentials.`,
    ``,
    `Please confirm my order. Thank you! 🙏`,
  );
  return lines.join("\n");
}

/** Build a WhatsApp URL with a pre-filled message.
 * Uses api.whatsapp.com directly — the wa.me short-link server re-encodes the
 * text param on redirect and corrupts non-BMP characters (emoji → U+FFFD). */
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  return `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
}
