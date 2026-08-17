/**
 * FF TRUST — WhatsApp destination builder.
 *
 * Builds a SAFE, URL-encoded WhatsApp deep link from canonical owner config
 * + a public record context. The website only OPENS WhatsApp with a prefilled
 * message — it never sends automatically, never collects credentials, and only
 * exposes public fields (id, title, price, mode/package, inquiry, seller ref).
 *
 * Buyer contexts append the screen-recording reminder from canonical safety
 * copy (never a claim that the site records).
 */

import { siteConfig } from "@/config/site";
import { proofContent } from "@/config/proof";

export type WhatsAppContext = {
  /** Public record id (account / service id). */
  id?: string;
  /** Public title. */
  title?: string;
  /** Public INR price (number). */
  price?: number;
  /** Public category label (e.g. "battleground", "panel", "CS Rank Push"). */
  category?: string;
  /** Service mode / package label (e.g. "CS Rank Push · Gold IV → Heroic"). */
  mode?: string;
  /** Public seller reference id. */
  sellerRef?: string;
  /** Free-form inquiry line. */
  inquiry?: string;
  /** Buyer context — appends the recording reminder + buyer-proof lines. */
  buyer?: boolean;
};

/** Build the prefilled, URL-encoded message body. */
export function buildWhatsAppMessage(ctx: WhatsAppContext): string {
  const lines: string[] = [];
  lines.push(`FF TRUST — inquiry`);
  if (ctx.id) lines.push(`Ref: ${ctx.id}`);
  if (ctx.category) lines.push(`Category: ${ctx.category}`);
  if (ctx.title) lines.push(`Item: ${ctx.title}`);
  if (ctx.mode) lines.push(`Package: ${ctx.mode}`);
  if (ctx.sellerRef) lines.push(`Seller ref: ${ctx.sellerRef}`);
  if (typeof ctx.price === "number") lines.push(`Listed price: ₹${ctx.price} INR`);
  if (ctx.inquiry) lines.push(ctx.inquiry);
  if (ctx.buyer) {
    lines.push("");
    lines.push(siteConfig.safety.recordingRemind);
    lines.push(siteConfig.safety.recordingKeep);
    lines.push(proofContent.neverSend);
    lines.push(`Buyer Proof: ${proofContent.heading} — never share passwords, OTPs or recovery codes.`);
  }
  lines.push("");
  lines.push("(Sent via FF TRUST — independent platform.)");
  return lines.join("\n");
}

/** Build the full wa.me URL. User still presses Send. */
export function buildWhatsAppUrl(ctx: WhatsAppContext): string {
  const text = encodeURIComponent(buildWhatsAppMessage(ctx));
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${text}`;
}

/** Build a WhatsApp context from an AccountListing (public fields only). */
export function accountWhatsAppContext(
  listing: { id: string; title: string; priceInr: number; sellerRef: string; category: string },
  inquiry: string,
  buyer = true,
): WhatsAppContext {
  return {
    id: listing.id,
    title: listing.title,
    price: listing.priceInr,
    sellerRef: listing.sellerRef,
    category: listing.category,
    inquiry,
    buyer,
  };
}

/* ============================================================
 * FREE JOIN — polished owner-contact message (PROMPT 11).
 * Opens WhatsApp directly with a pre-filled emoji-rich inquiry.
 * WhatsApp-safe plain text (no markdown `**`), URL-encoded below.
 * ============================================================ */

export const FREE_JOIN_MESSAGE = [
  "🚀 FF TRUST — FREE LISTING & SERVICE INQUIRY",
  "",
  "👋 Hello FF TRUST Team!",
  "",
  "I would like to join FF TRUST and list/promote a service or product.",
  "",
  "✨ FREE TO JOIN",
  "🛒 Sell / List your service or offer",
  "📩 Contact the owner directly for listing details",
  "",
  "🔥 EXAMPLES OF WHAT I CAN LIST / OFFER:",
  "",
  "🎮 Free Fire ID / Account",
  "🛡️ Free Fire Panel",
  "🏆 Paid Push — CS / BR",
  "📸 Instagram Views",
  "👥 Instagram Followers",
  "❤️ Instagram Likes",
  "💰 Very Low Price Services",
  "⭐ Other gaming / social-media related services",
  "",
  "📌 I understand that FF TRUST is an independent platform and that listing/service availability is subject to verification and approval.",
  "",
  "📝 My inquiry:",
  "I would like to discuss listing my service/product with FF TRUST.",
  "",
  "🤝 Please tell me the requirements and next steps.",
  "",
  "🔐 FF TRUST — Independent Platform",
  "🛡️ Transparency • Evidence • Buyer Safety",
  "",
  "📲 Sent via FF TRUST — independent platform.",
].join("\n");

/** Build the wa.me URL for the free-join inquiry. User still presses Send. */
export function buildFreeJoinWhatsAppUrl(): string {
  const text = encodeURIComponent(FREE_JOIN_MESSAGE);
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${text}`;
}
