/* eslint-disable no-console */
/**
 * PROMPT 12 data-integrity audit (tsx) — canonical layer checks for the
 * premium Details + Buyer Proof work. Does not need a browser.
 *
 * Checks:
 * 1. proofContent integrity: 12 sections, unique keys, every iconKey maps to a
 *    lucide icon used by the /proof page, keepRecording/dontShare lists intact.
 * 2. WhatsApp: buyer contexts carry Category + full buyer-proof block; the
 *    account context forwards category from canonical data.
 * 3. Media: gallery image cap at 30; video embed conversion (YouTube →
 *    youtube-nocookie, Vimeo → player.vimeo, direct file → null).
 */
import { strict as assert } from "node:assert";
import { proofContent } from "../src/config/proof";
import { buildWhatsAppMessage, accountWhatsAppContext } from "../src/lib/whatsapp";
import { getListingAllImages, getListingAllImages as _imgs, toVideoEmbedUrl, getYouTubeId, getVimeoId } from "../src/lib/media";
import { accounts, sampleAccounts } from "../src/data/accounts";

void getListingAllImages;
void _imgs;

let pass = 0;
let fail = 0;
const failures: string[] = [];

function check(name: string, ok: boolean, detail?: string) {
  if (ok) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    failures.push(name + (detail ? ` :: ${detail}` : ""));
    console.log(`  FAIL  ${name}${detail ? ` :: ${detail}` : ""}`);
  }
}

console.log("1) proofContent integrity");
check("sections length is 12", proofContent.sections.length === 12, `got ${proofContent.sections.length}`);
{
  const keys = proofContent.sections.map((s) => s.key);
  check("section keys are unique", new Set(keys).size === keys.length);
  const iconSet = new Set([
    "Video", "Play", "ShieldCheck", "Wallet", "MessageCircle", "FileCheck",
    "Lock", "Info", "UserCheck", "Store", "Fingerprint", "Scale",
  ]);
  const unknown = proofContent.sections.filter((s) => s.iconKey && !iconSet.has(s.iconKey));
  check("every section iconKey maps to a /proof icon", unknown.length === 0, JSON.stringify(unknown.map((s) => s.iconKey)));
  const everyHasIcon = proofContent.sections.every((s) => typeof s.iconKey === "string" && iconSet.has(s.iconKey as string));
  check("every section has an iconKey", everyHasIcon);
}
check("keepRecording has 4 items", proofContent.keepRecording.length === 4);
check("dontShare has 4 items", proofContent.dontShare.length === 4);
check("neverSend present", proofContent.neverSend.includes("Never send passwords, OTPs, recovery codes"));
check("disclaimer present", proofContent.disclaimer.includes("independent platform"));
check("heading is KEEP SCREEN RECORDING ON", proofContent.heading === "KEEP SCREEN RECORDING ON");

console.log("2) WhatsApp category + buyer-proof lines");
{
  const msg = buildWhatsAppMessage({
    id: "SAMPLE-ACC-001",
    title: "SAMPLE — Architect Account",
    price: 4200,
    sellerRef: "SAMPLE-OWNER",
    category: "battleground",
    inquiry: "Interested.",
    buyer: true,
  });
  const frags = [
    "Ref: SAMPLE-ACC-001",
    "Category: battleground",
    "Item: SAMPLE — Architect Account",
    "Listed price: ₹4200 INR",
    "TURN ON SCREEN RECORDING",
    "KEEP SCREEN RECORDING ON",
    "Never send passwords, OTPs, recovery codes or other sensitive credentials through FF TRUST.",
    "Buyer Proof: KEEP SCREEN RECORDING ON — never share passwords, OTPs or recovery codes.",
    "(Sent via FF TRUST — independent platform.)",
  ];
  for (const f of frags) check(`wa message has ${f.slice(0, 40)}`, msg.includes(f));
  check("category line comes after Ref", msg.indexOf("Ref:") < msg.indexOf("Category:"));
  check("buyer proof comes after listed price", msg.indexOf("Listed price:") < msg.indexOf("TURN ON SCREEN RECORDING"));
}
{
  const ctx = accountWhatsAppContext(
    { id: "SAMPLE-ACC-003", title: "SAMPLE — Starter Vault", priceInr: 1500, sellerRef: "SAMPLE-OWNER", category: "starter" },
    "Interested.",
    true,
  );
  check("accountWhatsAppContext forwards category", ctx.category === "starter");
  check("accountWhatsAppContext forwards price", ctx.price === 1500);
  check("accountWhatsAppContext is buyer context", ctx.buyer === true);
}

console.log("3) Media caps + video embed helpers");
{
  const listing = {
    frontImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop",
    galleryImages: Array.from({ length: 40 }, (_, i) => `https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=800&h=600&fit=crop&n=${i}`),
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  };
  const all = getListingAllImages(listing, "Cap test");
  check("getListingAllImages caps at 30", all.length === 30, `got ${all.length}`);
  check("gallery images validated (https only)", all.every((u) => u.startsWith("https://")));
}
{
  const yt = getYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  check("getYouTubeId parses watch URL", yt === "dQw4w9WgXcQ", yt || "no id");
  check("getYouTubeId parses youtu.be", getYouTubeId("https://youtu.be/dQw4w9WgXcQ") === "dQw4w9WgXcQ");
  check("getVimeoId parses vimeo.com", getVimeoId("https://vimeo.com/76979871") === "76979871");
  const embed = toVideoEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  check("toVideoEmbedUrl → youtube-nocookie", embed === "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", embed || "null");
  check("toVideoEmbedUrl → vimeo", toVideoEmbedUrl("https://vimeo.com/76979871") === "https://player.vimeo.com/video/76979871");
  check("toVideoEmbedUrl direct file → null", toVideoEmbedUrl("https://example.com/video.mp4") === null);
  check("toVideoEmbedUrl handles the canonical sample video", toVideoEmbedUrl(sampleAccounts.find((a) => a.videoUrl)?.videoUrl || "") !== null);
}
{
  const canonicalVideo = sampleAccounts.find((a) => a.videoUrl)?.videoUrl;
  check("sample data includes a video listing", !!canonicalVideo, "no videoUrl in sampleAccounts");
  const published = [...accounts, ...sampleAccounts].filter((a) => a.published && !a.demo);
  check("published account media resolve to real images", published.every((a) => getListingAllImages(a, a.title).every((u) => u.startsWith("https://"))));
}

console.log("\n========================================");
console.log(`P12-DATA RESULT: ${pass} PASS / ${fail} FAIL`);
if (failures.length) {
  console.log("Failures:");
  failures.forEach((f) => console.log(`  - ${f}`));
}
process.exit(fail ? 1 : 0);
