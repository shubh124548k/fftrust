/* eslint-disable no-console */
// PROMPT 7 — Legal pages audit.
// Privacy/Terms/Refund: 200, content present, footer links, responsive across
// all 15 widths, metadata (title + canonical), no console errors, truthful
// contact number, valid JSON-LD on home.
const puppeteer = require("puppeteer-core");

const BASE = "http://localhost:1111";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const WIDTHS = [320, 360, 375, 390, 414, 430, 480, 768, 820, 1024, 1280, 1366, 1440, 1600, 1920];
const LEGAL = [
  { route: "/privacy", title: "Privacy Policy" },
  { route: "/terms", title: "Terms of Service" },
  { route: "/refund-policy", title: "Refund Policy" },
];

let failures = 0;
function check(name, ok, extra = "") {
  if (ok) console.log(`PASS  ${name}`);
  else { failures++; console.log(`FAIL  ${name} ${extra}`); }
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

  // ---- 1. Route status + title + canonical + content ----
  for (const { route, title } of LEGAL) {
    const resp = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
    check(`${route} returns 200`, resp.status() === 200, resp.status());
    const head = await page.evaluate(() => ({
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
      h1: document.querySelector("h1")?.textContent?.trim() || "",
      sections: document.querySelectorAll("h2").length,
      paragraphWords: (document.body.innerText || "").length,
    }));
    check(`${route} title contains "${title}"`, head.title.includes(title), head.title);
    check(`${route} canonical present`, head.canonical === `${BASE}${route}` || head.canonical.includes(`${route}`), head.canonical);
    check(`${route} has h1 + content`, head.h1.length > 0 && head.paragraphWords > 500, `h1=${head.h1} words=${head.paragraphWords}`);
    check(`${route} has >= 4 sections`, head.sections >= 4, head.sections);
  }

  // ---- 2. Footer legal links reachable from home ----
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  const footerLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll("footer a")).map((a) => ({ href: a.getAttribute("href"), text: a.textContent.trim() })),
  );
  const legals = ["/privacy", "/terms", "/refund-policy"];
  const found = legals.filter((l) => footerLinks.some((f) => f.href === l));
  check("Footer links Privacy/Terms/Refund present", found.length === 3, JSON.stringify(footerLinks));

  // ---- 3. Footer generic WhatsApp targets canonical number (not placeholder) ----
  const waLinks = footerLinks.map((f) => f.href).filter((h) => h && h.includes("wa.me/"));
  const noPlaceholder = waLinks.every((h) => h.includes("wa.me/919330564851") && !h.includes("919999999999"));
  check("Footer WhatsApp targets 919330564851 (no placeholder)", noPlaceholder && waLinks.length > 0, waLinks.join(" "));

  // ---- 4. Horizontal overflow across 15 widths x 3 legal routes ----
  let overflowFailures = 0;
  const overflowDetail = [];
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 900 });
    for (const { route } of LEGAL) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
      await sleep(200);
      const m = await page.evaluate(() => {
        const de = document.documentElement;
        const over = de.scrollWidth - de.clientWidth;
        const vw = window.innerWidth;
        const offenders = [];
        document.querySelectorAll("body *").forEach((el) => {
          if (!(el.offsetParent || el.getBoundingClientRect().width)) return;
          if (el.closest("[aria-hidden]") || el.closest("svg") || el.closest(".pointer-events-none")) return;
          if (el.getBoundingClientRect().width === 0) return;
          if (getComputedStyle(el).position === "fixed") return;
          const r = el.getBoundingClientRect();
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
  check("No horizontal overflow on legal pages (15 widths x 3 routes)", overflowFailures === 0, overflowDetail.slice(0, 6).join(" | "));

  // ---- 5. No console errors on legal pages ----
  consoleErrors.length = 0;
  for (const { route } of LEGAL) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(200);
  }
  const fatal = consoleErrors.filter((e) => !/favicon\.ico|websocket|Back-forward|BackForward/i.test(e));
  check("No fatal console errors on legal pages", fatal.length === 0, fatal.slice(0, 5).join(" | "));

  // ---- 6. Home JSON-LD blocks parse as valid JSON and stay truthful ----
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  const ld = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent),
  );
  const parsed = [];
  for (const block of ld) { try { parsed.push(JSON.parse(block)); } catch { parsed.push(null); } }
  check("Home JSON-LD blocks present and valid JSON", parsed.length >= 3 && parsed.every(Boolean), `blocks=${ld.length}`);
  const types = parsed.map((p) => p && p["@type"]).join(",");
  check("JSON-LD types are Organization/WebSite/FAQPage", types.includes("Organization") && types.includes("WebSite") && types.includes("FAQPage"), types);
  const hasFakeReview = JSON.stringify(parsed).toLowerCase().includes('"review"');
  check("JSON-LD has no fake review/rating claims", !hasFakeReview);

  await browser.close();
  console.log(failures === 0 ? "\nALL LEGAL CHECKS PASS" : `\n${failures} LEGAL CHECKS FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})();
