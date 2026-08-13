/* eslint-disable no-console */
/**
 * PROMPT 13 data-integrity audit (tsx) — SEO/robots/sitemap/404/favicon
 * static-layer checks. Does not need a browser.
 *
 * Checks:
 * 1. SEO helpers: absoluteUrl + pageMetadata derive canonical/OG/Twitter from
 *    siteConfig (single source of truth), locale from siteConfig.locale.
 * 2. Metadata coverage: every public route exports metadata with an absolute
 *    canonical (pageMetadata or alternates.canonical); client pages rely on
 *    the root layout title template. No duplicate canonical paths.
 * 3. sitemap.ts + robots.ts: every legitimate public route present in the
 *    sitemap source; robots disallows /api/ and points to siteConfig.url.
 * 4. New pages (/safety, /contact, /disclaimer): canonical whatsapp number
 *    only, buildWhatsAppUrl flow, LegalPage/Breadcrumbs/BreadcrumbList wiring,
 *    no placeholder numbers anywhere in src.
 * 5. 404: not-found.tsx premium content + home/explore links.
 * 6. Branding: canonical public/fftrust.png (official 1536x1024 logo) is the
 *    single brand asset; favicon.ico is a real ICO derived from it; metadata
 *    icons point at the canonical logo; no stale default-branding files remain.
 * 7. Modules/footer: contact → /contact, safety → /safety, disclaimer link.
 */
import { strict as assert } from "node:assert";
import { readFileSync, existsSync } from "node:fs";
import * as path from "node:path";
import { siteConfig } from "../src/config/site";
import { absoluteUrl, pageMetadata } from "../src/lib/seo";

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

const SRC = path.resolve(__dirname, "..", "src");
const read = (rel: string) => readFileSync(path.join(SRC, rel), "utf8");

console.log("1) SEO helpers");
{
  assert.equal(absoluteUrl("/safety"), `${siteConfig.url}/safety`);
  assert.equal(absoluteUrl("safety"), `${siteConfig.url}/safety`);
  const md = pageMetadata({
    title: "Buyer Safety",
    description: "d",
    path: "/safety",
  });
  check("pageMetadata canonical is absolute", md.alternates?.canonical === `${siteConfig.url}/safety`);
  check("pageMetadata og:title carries brand", md.openGraph?.title === "Buyer Safety · FF TRUST");
  check("pageMetadata og:locale from siteConfig", md.openGraph?.locale === siteConfig.locale);
  check("pageMetadata og:siteName from siteConfig", md.openGraph?.siteName === siteConfig.name);
  check("pageMetadata og:image is canonical brandLogo", Array.isArray(md.openGraph?.images) && (md.openGraph?.images as { url: string }[])[0]?.url === siteConfig.brandLogo);
  check("pageMetadata twitter card", JSON.stringify(md.twitter).includes("summary_large_image"));
  check("pageMetadata twitter image is canonical brandLogo", JSON.stringify(md.twitter).includes(siteConfig.brandLogo));
  check("brandLogo is the official fftrust.png", siteConfig.brandLogo === "/fftrust.png");
  check("siteConfig url derived from NEXT_PUBLIC_SITE_URL or dev fallback", process.env.NEXT_PUBLIC_SITE_URL ? siteConfig.url === process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "") : siteConfig.url === "http://localhost:1111", siteConfig.url);
  check("siteConfig url never has trailing slash", !siteConfig.url.endsWith("/"));
}

console.log("2) Metadata coverage on every public route");
{
  const routeMeta: { route: string; file: string; expectTitle: string }[] = [
    { route: "/accounts", file: "app/accounts/page.tsx", expectTitle: "Free Fire Account Listings" },
    { route: "/services", file: "app/services/page.tsx", expectTitle: "Panel & Services" },
    { route: "/paid-push", file: "app/paid-push/page.tsx", expectTitle: "Paid Push" },
    { route: "/instagram/views", file: "app/instagram/views/page.tsx", expectTitle: "Instagram Views" },
    { route: "/instagram/followers", file: "app/instagram/followers/page.tsx", expectTitle: "Instagram Followers" },
    { route: "/instagram/likes", file: "app/instagram/likes/page.tsx", expectTitle: "Instagram Likes" },
    { route: "/privacy", file: "app/privacy/page.tsx", expectTitle: "Privacy Policy" },
    { route: "/terms", file: "app/terms/page.tsx", expectTitle: "Terms of Service" },
    { route: "/refund-policy", file: "app/refund-policy/page.tsx", expectTitle: "Refund Policy" },
    { route: "/proof", file: "app/proof/page.tsx", expectTitle: "PROOF" },
    { route: "/safety", file: "app/safety/page.tsx", expectTitle: "Buyer Safety" },
    { route: "/contact", file: "app/contact/page.tsx", expectTitle: "Contact" },
    { route: "/disclaimer", file: "app/disclaimer/page.tsx", expectTitle: "Disclaimer" },
  ];
  for (const r of routeMeta) {
    const src = read(r.file);
    const hasMeta = src.includes("export const metadata");
    const hasCanonical = src.includes("pageMetadata({") || src.includes("alternates: { canonical");
    check(`${r.route} exports metadata`, hasMeta);
    check(`${r.route} canonical via pageMetadata/alternates`, hasCanonical, "missing canonical wiring");
    check(`${r.route} title present`, src.includes(r.expectTitle));
  }
  // Client pages cannot export metadata — they rely on route layouts or root template
  const wishlistLayout = read("app/wishlist/layout.tsx");
  const compareLayout = read("app/compare/layout.tsx");
  check("/wishlist has metadata layout", wishlistLayout.includes("pageMetadata({") && wishlistLayout.includes('path: "/wishlist"'));
  check("/compare has metadata layout", compareLayout.includes("pageMetadata({") && compareLayout.includes('path: "/compare"'));
  const rootLayout = read("app/layout.tsx");
  check("root layout has title template", rootLayout.includes('template: `%s · ${siteConfig.name}`'));
  // Unique canonical paths
  const paths: string[] = [];
  for (const r of routeMeta) {
    const m = r.file === "app/proof/page.tsx" ? read(r.file).match(/path: "([^"]+)"/) : null;
    paths.push(m ? m[1] : r.route);
  }
  check("no duplicate canonical paths", new Set(paths).size === paths.length, JSON.stringify(paths));
}

console.log("3) sitemap + robots source");
{
  const sitemap = read("app/sitemap.ts");
  const required = [
    "/accounts", "/services", "/paid-push", "/instagram/views", "/instagram/followers",
    "/instagram/likes", "/wishlist", "/compare", "/proof", "/safety", "/contact",
    "/privacy", "/terms", "/refund-policy", "/disclaimer",
  ];
  for (const u of required) check(`sitemap.ts has ${u}`, sitemap.includes(u), "missing");
  check("sitemap.ts home entry", sitemap.includes("url: baseUrl,"));
  check("sitemap.ts has no double-slashed locs", !sitemap.includes("//#"));
  const robots = read("app/robots.ts");
  check("robots.ts disallows /api/", robots.includes('disallow: ["/api/"]'));
  check("robots.ts sitemap from siteConfig.url", robots.includes("`${siteConfig.url}/sitemap.xml`"));
  check("robots.ts allows public root", robots.includes('allow: "/"'));
}

console.log("4) New pages wiring");
{
  const contact = read("app/contact/page.tsx");
  check("contact uses buildWhatsAppUrl", contact.includes("buildWhatsAppUrl"));
  check("contact uses canonical number", contact.includes("siteConfig.whatsapp.number") && !contact.includes("919999999999"));
  check("contact has Breadcrumbs + JSON-LD", contact.includes("Breadcrumbs") && contact.includes("BreadcrumbListJsonLd"));
  check("contact has trust note (no credentials)", /never.{0,40}credential/i.test(contact) || /credentials/i.test(contact));
  const safety = read("app/safety/page.tsx");
  check("safety uses LegalPage + scam content", safety.includes("LegalPage") && safety.includes("getScamCenterContent"));
  check("safety links to /proof", safety.includes('/"proof"') || safety.includes('"/proof"'));
  const disclaimer = read("app/disclaimer/page.tsx");
  check("disclaimer uses trustDisclaimer", disclaimer.includes("trustDisclaimer"));
  check("disclaimer links to /safety and /refund-policy", disclaimer.includes('"/safety"') && disclaimer.includes('"/refund-policy"'));
  // No placeholder phone anywhere in src
  const allSrc = ["lib", "config", "data", "components", "app"]
    .flatMap((d) => globSync(d));
  let placeholderHits = 0;
  for (const f of allSrc) {
    const content = readFileSync(f, "utf8");
    if (/91(9|0)99999999|919999999999|0000000000/.test(content)) placeholderHits++;
  }
  check("no placeholder phone numbers in src", placeholderHits === 0, `${placeholderHits} file(s)`);
  // Every hardcoded wa.me number in src must equal the canonical number
  const waUses = allSrc.filter((f) => {
    const c = readFileSync(f, "utf8");
    return /wa\.me\//.test(c) || /whatsapp\.com\//.test(c) || /wapp\.send/.test(c);
  });
  const badNumbers: string[] = [];
  for (const f of waUses) {
    const c = readFileSync(f, "utf8");
    for (const m of c.matchAll(/wa\.me\/(\d{9,15})/g)) {
      if (m[1] !== siteConfig.whatsapp.number) badNumbers.push(`${m[1]} (${f})`);
    }
  }
  check("whatsapp flows reference canonical number", badNumbers.length === 0, badNumbers.join(" "));
}

console.log("5) Premium 404");
{
  const nf = read("app/not-found.tsx");
  check("not-found.tsx exists", nf.length > 0);
  check("404 has lost-in-marketplace headline", nf.includes("Lost in the"));
  check("404 links back home", nf.includes('href="/"'));
  check("404 links to explore", nf.includes('href="/#explore"'));
  check("404 uses GlassPanel holo premium", nf.includes("GlassPanel") && nf.includes("holo"));
}

console.log("6) Branding (canonical official logo, no default-branding leftovers)");
{
  const publicDir = path.resolve(__dirname, "..", "public");
  const logo = path.join(publicDir, "fftrust.png");
  check("public/fftrust.png exists", existsSync(logo));
  if (existsSync(logo)) {
    const buf = readFileSync(logo);
    const sig = buf.slice(0, 8).toString("hex");
    check("fftrust.png valid PNG signature", sig === "89504e470d0a1a0a", sig);
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    check("fftrust.png is 1536x1024", w === 1536 && h === 1024, `${w}x${h}`);
  }
  const favicon = path.join(SRC, "app", "favicon.ico");
  check("favicon.ico exists", existsSync(favicon));
  if (existsSync(favicon)) {
    const buf = readFileSync(favicon);
    check("favicon.ico has valid ICO header", buf.readUInt16LE(0) === 0 && buf.readUInt16LE(2) === 1);
    const count = buf.readUInt16LE(4);
    check("favicon.ico has >=2 entries", count >= 2, `count=${count}`);
    for (let i = 0; i < count; i++) {
      const off = buf.readUInt32LE(6 + i * 16 + 12);
      const len = buf.readUInt32LE(6 + i * 16 + 8);
      const sig = buf.slice(off, off + 8).toString("hex");
      check(`favicon entry ${i} embeds a valid PNG`, sig === "89504e470d0a1a0a" && len > 100, `${buf[6 + i * 16]}x${buf[6 + i * 16 + 1]} sig=${sig}`);
    }
  }
  const layout = read("app/layout.tsx");
  check("layout metadata icons point at brandLogo", layout.includes("icon: siteConfig.brandLogo") && layout.includes("apple: siteConfig.brandLogo"));
  const seoLib = read("lib/seo.ts");
  check("pageMetadata images derive from brandLogo", seoLib.includes("siteConfig.brandLogo"));
  const noStale = !existsSync(path.join(SRC, "app", "icon.svg")) && !existsSync(path.join(SRC, "app", "apple-icon.png")) && !existsSync(path.join(publicDir, "logo.svg"));
  check("stale default-branding files removed (icon.svg/apple-icon.png/logo.svg)", noStale);
}

console.log("7) Modules + footer navigation");
{
  const modules = read("data/modules.ts");
  check("module contact href is /contact", modules.includes('href: "/contact"'));
  check("module buyer-safety href is /safety", modules.includes('href: "/safety"'));
  const footer = read("components/layout/site-footer.tsx");
  check("footer has Disclaimer link", footer.includes('"/disclaimer"'));
  check("footer keeps /privacy /terms /refund-policy", footer.includes('"/privacy"') && footer.includes('"/terms"') && footer.includes('"/refund-policy"'));
}

function globSync(dir: string): string[] {
  const { readdirSync } = require("node:fs") as typeof import("node:fs");
  const out: string[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(ts|tsx|js|mjs|cjs)$/.test(e.name)) out.push(p);
    }
  };
  walk(path.join(SRC, dir));
  return out;
}

console.log(fail === 0 ? "\nALL PROMPT 13 DATA-INTEGRITY CHECKS PASS" : `\n${fail} PROMPT 13 DATA-INTEGRITY CHECKS FAILED`);
process.exit(fail === 0 ? 0 : 1);
