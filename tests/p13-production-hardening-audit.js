/* eslint-disable no-console */
// PROMPT 13 — Production hardening audit (browser).
// robots.txt + sitemap.xml correctness, new pages (/safety /contact /disclaimer),
// premium 404, branded favicon links, breadcrumbs (nav + JSON-LD), metadata
// (title/canonical/OG/Twitter), no horizontal overflow across 15 widths,
// no console errors, canonical WhatsApp flows preserved.
const puppeteer = require("puppeteer-core");
const fs = require("fs");

const BASE = "http://localhost:1111";
// Canonical site URL mirrors the app: NEXT_PUBLIC_SITE_URL in production,
// localhost:1111 as the local-development fallback. Tests assert metadata
// against the same resolution the site uses.
const CANON = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:1111").replace(/\/+$/, "");
const CANDIDATE_BROWSERS = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];
const BROWSER = CANDIDATE_BROWSERS.find((p) => fs.existsSync(p));
if (!BROWSER) { console.error("No browser found for Puppeteer"); process.exit(1); }
const WIDTHS = [320, 360, 375, 390, 414, 430, 480, 768, 820, 1024, 1280, 1366, 1440, 1600, 1920];

let failures = 0;
function check(name, ok, extra = "") {
  if (ok) console.log(`PASS  ${name}`);
  else { failures++; console.log(`FAIL  ${name} ${extra}`); }
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({ executablePath: BROWSER, headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

  // ---- 1. robots.txt ----
  const robots = await page.goto(`${BASE}/robots.txt`, { waitUntil: "networkidle0", timeout: 60000 }).then((r) => r.text());
  check("robots.txt 200", robots.length > 0);
  check("robots.txt allows /", robots.includes("Allow: /"));
  check("robots.txt disallows /api/", robots.includes("Disallow: /api/"));
  check("robots.txt sitemap absolute", robots.includes(`Sitemap: ${CANON}/sitemap.xml`), robots.match(/Sitemap:.*/)?.[0] || "");

  // ---- 2. sitemap.xml ----
  const smText = await page.goto(`${BASE}/sitemap.xml`, { waitUntil: "networkidle0", timeout: 60000 }).then((r) => r.text());
  const locs = [...smText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check("sitemap.xml valid + has locs", locs.length >= 14, `${locs.length} locs`);
  check("sitemap.xml has no duplicate locs", new Set(locs).size === locs.length, "duplicates!");
  const normalize = (u) => (u.endsWith("/") && u.length > 1 ? u.slice(0, -1) : u);
  const normLocs = locs.map(normalize);
  const required = [
    `${CANON}/`, `${CANON}/accounts`, `${CANON}/services`, `${CANON}/paid-push`,
    `${CANON}/instagram/views`, `${CANON}/instagram/followers`, `${CANON}/instagram/likes`,
    `${CANON}/wishlist`, `${CANON}/compare`, `${CANON}/proof`, `${CANON}/safety`,
    `${CANON}/contact`, `${CANON}/privacy`, `${CANON}/terms`, `${CANON}/refund-policy`, `${CANON}/disclaimer`,
  ].map(normalize);
  const missing = required.filter((u) => !normLocs.includes(u));
  check("sitemap.xml contains all legitimate public routes", missing.length === 0, missing.join(" "));
  check("sitemap.xml no private/API urls", !smText.includes("/api"));

  // ---- 3. New pages: metadata, breadcrumbs, content ----
  const NEW_PAGES = [
    { route: "/safety", title: "Buyer Safety" },
    { route: "/contact", title: "Contact" },
    { route: "/disclaimer", title: "Disclaimer" },
  ];
  for (const { route, title } of NEW_PAGES) {
    const resp = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
    check(`${route} returns 200`, resp.status() === 200, resp.status());
    const head = await page.evaluate(() => ({
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content") || "",
      ogLocale: document.querySelector('meta[property="og:locale"]')?.getAttribute("content") || "",
      twitter: document.querySelector('meta[name="twitter:card"]')?.getAttribute("content") || "",
      description: document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
      h1: document.querySelector("h1")?.textContent?.trim() || "",
      words: (document.body.innerText || "").length,
      breadcrumb: !!document.querySelector('nav[aria-label="Breadcrumb"]'),
      current: !!document.querySelector('nav[aria-label="Breadcrumb"] [aria-current="page"]'),
    }));
    check(`${route} title correct`, head.title.includes(title), head.title);
    check(`${route} canonical absolute`, head.canonical === `${CANON}${route}`, head.canonical);
    check(`${route} og:image present`, head.ogImage !== "", head.ogImage);
    check(`${route} og:image uses canonical logo URL`, head.ogImage === `${CANON}/fftrust.png`, head.ogImage);
    check(`${route} og:locale set`, head.ogLocale === "en-IN", head.ogLocale);
    check(`${route} twitter card`, head.twitter === "summary_large_image", head.twitter);
    check(`${route} meta description`, head.description.length > 40);
    check(`${route} h1 + content`, head.h1.length > 0 && head.words > 400, `words=${head.words}`);
    check(`${route} visible breadcrumbs with current page`, head.breadcrumb && head.current);
  }

  // ---- 4. Breadcrumb JSON-LD on new + existing pages ----
  for (const route of ["/safety", "/contact", "/disclaimer", "/privacy", "/proof"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
    const blocks = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent),
    );
    const parsed = [];
    for (const b of blocks) { try { parsed.push(JSON.parse(b)); } catch { parsed.push(null); } }
    const bc = parsed.find((p) => p && p["@type"] === "BreadcrumbList");
    check(`${route} has BreadcrumbList JSON-LD`, !!bc);
    if (bc) {
      const items = (bc.itemListElement || []).length;
      const last = (bc.itemListElement || []).slice(-1)[0];
      check(
        `${route} breadcrumb list has items + last name + url`,
        items >= 2 && typeof last?.name === "string" && typeof last?.item === "string",
        `items=${items} last=${JSON.stringify(last)}`,
      );
    }
  }

  // ---- 5. Premium 404 ----
  const resp404 = await page.goto(`${BASE}/this-page-does-not-exist-xyz`, { waitUntil: "networkidle0", timeout: 60000 });
  check("unknown route returns 404 status", resp404.status() === 404, resp404.status());
  const nf = await page.evaluate(() => ({
    text: document.body.innerText,
    homeLink: !!Array.from(document.querySelectorAll("a")).find((a) => a.getAttribute("href") === "/" && /back home/i.test(a.textContent)),
    exploreLink: !!Array.from(document.querySelectorAll("a")).find((a) => a.getAttribute("href") === "/accounts" && /explore/i.test(a.textContent)),
    hasHeader: !!document.querySelector("header"),
    hasFooter: !!document.querySelector("footer"),
  }));
  check("404 shows lost-in-marketplace", /Lost in the/i.test(nf.text), nf.text.slice(0, 80));
  check("404 has Back home link", nf.homeLink);
  check("404 has Explore listings link", nf.exploreLink);
  check("404 keeps header + footer chrome", nf.hasHeader && nf.hasFooter);

  // ---- 6. Branded favicon links (canonical official logo) ----
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  const icons = await page.evaluate(() => ({
    icons: Array.from(document.querySelectorAll('link[rel="icon"]')).map((l) => l.getAttribute("href") || ""),
    apple: document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href") || "",
  }));
  const canonIcon = icons.icons.find((h) => h.includes("fftrust.png")) || "";
  check("favicon links reference the canonical logo", canonIcon.includes("fftrust.png"), icons.icons.join(","));
  check("apple-touch-icon references the canonical logo", icons.apple.includes("fftrust.png"), icons.apple);
  const canonResp = await page.goto(`${BASE}${canonIcon}`, { waitUntil: "networkidle0", timeout: 60000 });
  check("canonical logo served", [200, 304].includes(canonResp.status()), canonResp.status());
  const icoResp = await page.goto(`${BASE}/favicon.ico`, { waitUntil: "networkidle0", timeout: 60000 });
  check("favicon.ico served", [200, 304].includes(icoResp.status()), icoResp.status());

  // ---- 7. No horizontal overflow across 15 widths on P3 pages ----
  const OVERFLOW_ROUTES = ["/safety", "/contact", "/disclaimer", "/this-page-does-not-exist-xyz", "/proof", "/privacy"];
  let overflowFailures = 0;
  const overflowDetail = [];
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 900 });
    for (const route of OVERFLOW_ROUTES) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
      await sleep(150);
      const m = await page.evaluate(() => {
        const de = document.documentElement;
        const over = de.scrollWidth - de.clientWidth;
        const vw = window.innerWidth;
        const offenders = [];
        document.querySelectorAll("body *").forEach((el) => {
          if (!(el.offsetParent || el.getBoundingClientRect().width)) return;
          if (el.closest("[aria-hidden]") || el.closest("svg") || el.closest(".pointer-events-none")) return;
          if (getComputedStyle(el).position === "fixed") return;
          const r = el.getBoundingClientRect();
          if (r.width === 0) return;
          const cls = (el.className && typeof el.className === "string") ? el.className.slice(0, 40) : el.tagName;
          if (r.right > vw + 1) offenders.push(`${el.tagName}.${cls} right=${Math.round(r.right)}`);
          if (r.left < -1) offenders.push(`${el.tagName}.${cls} left=${Math.round(r.left)}`);
        });
        return { over, offenders: offenders.slice(0, 3) };
      });
      if (m.over > 1) {
        overflowFailures++;
        overflowDetail.push(`${w}px ${route}: over=${m.over} ${JSON.stringify(m.offenders)}`);
      }
    }
  }
  check("No horizontal overflow (P3 routes x 15 widths)", overflowFailures === 0, overflowDetail.slice(0, 6).join(" | "));

  // ---- 8. No fatal console errors on P3 pages (404 route asserts its own status) ----
  consoleErrors.length = 0;
  for (const route of ["/safety", "/contact", "/disclaimer"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(200);
  }
  const fatal = consoleErrors.filter((e) => !/favicon\.ico|websocket|Back-forward|BackForward/i.test(e));
  check("No fatal console errors on P3 pages", fatal.length === 0, fatal.slice(0, 5).join(" | "));

  // ---- 9. Home JSON-LD still intact + truthful ----
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  const ld = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent),
  );
  const parsed = [];
  for (const block of ld) { try { parsed.push(JSON.parse(block)); } catch { parsed.push(null); } }
  const types = parsed.map((p) => p && p["@type"]).join(",");
  check("Home JSON-LD types Organization/WebSite/FAQ", types.includes("Organization") && types.includes("WebSite") && types.includes("FAQPage"), types);
  check("No fake review/rating claims in JSON-LD", !JSON.stringify(parsed).toLowerCase().includes('"review"'));

  await browser.close();
  console.log(failures === 0 ? "\nALL PROMPT 13 HARDENING CHECKS PASS" : `\n${failures} PROMPT 13 HARDENING CHECKS FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})();
