/* eslint-disable no-console */
// PROMPT 6 — Supplementary: page consistency, UI navigation, refresh, a11y basics.
const puppeteer = require("puppeteer-core");
const BASE = "http://localhost:1111";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
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
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });

  // ---- 1. Instagram page consistency (desktop) ----
  await page.setViewport({ width: 1440, height: 900 });
  const expect = { views: { word: "Views", label: "VIEWS", n: 13 }, followers: { word: "Followers", label: "FOLLOWERS", n: 15 }, likes: { word: "Likes", label: "LIKES", n: 16 } };
  for (const [key, cfg] of Object.entries(expect)) {
    await page.goto(`${BASE}/instagram/${key}`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(500);
    const m = await page.evaluate((cfg) => {
      const h1 = document.querySelector("main h1")?.innerText || "";
      const subtitle = document.querySelector("main h1 + p")?.innerText || "";
      const cards = [...document.querySelectorAll("main .glass-stack.group")];
      const badges = document.querySelectorAll("main .glass-stack.group .rounded-bl-xl").length;
      const prices = [...document.querySelectorAll("main .glass-stack.group")].map((c) => c.innerText.match(/₹[0-9,]+/g) || []);
      const orderBtns = [...document.querySelectorAll("main button")].filter((b) => b.textContent.includes("Order Now")).length;
      const hasBadge = badges > 0;
      return { h1, subtitle, cardCount: cards.length, badges, orderBtns, hasBadge, firstCardPrices: prices[0] || [] };
    }, cfg);
    check(`${key}: hero title`, m.h1.includes("Very Low Price") && m.h1.includes(cfg.word), m.h1.slice(0, 60));
    check(`${key}: subtitle`, /Fast • Affordable • Transparent/.test(m.subtitle), m.subtitle);
    check(`${key}: ${cfg.n} order buttons`, m.orderBtns === cfg.n, `got ${m.orderBtns}`);
    check(`${key}: cards have prices`, m.firstCardPrices.length >= 2, JSON.stringify(m.firstCardPrices));
  }

  // ---- 2. Instagram page consistency (mobile 375px, single column) ----
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(`${BASE}/instagram/views`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(500);
  const mobileCards = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("main .glass-stack.group")];
    const rects = cards.slice(0, 4).map((c) => {
      const r = c.getBoundingClientRect();
      return { left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) };
    });
    return { count: cards.length, rects, vw: window.innerWidth };
  });
  check("Mobile: cards single-column full-width", mobileCards.rects.every((r) => r.left >= 0 && r.right <= mobileCards.vw && r.w > 300), JSON.stringify(mobileCards.rects));

  // ---- 3. Home page integrity after geometry fix ----
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  const home = await page.evaluate(() => {
    const ids = ["explore", "price-guide", "trust", "list-account", "panel-seller", "paid-push", "buyer-safety", "how-it-works", "scam-center", "compare", "faq", "about", "legal", "safety-academy"];
    const present = ids.filter((id) => document.getElementById(id));
    const heroTitle = document.getElementById("hero-title")?.innerText || "";
    const svg = document.querySelector("#top svg") ? true : false;
    return { present, missing: ids.filter((id) => !present.includes(id)), heroTitle, svg };
  });
  check("Home: all sections present", home.missing.length === 0, `missing: ${home.missing.join(",")}`);
  check("Home: hero renders 3D object", home.svg, "");
  check("Home: hero title intact", home.heroTitle.length > 10, home.heroTitle.slice(0, 50));

  // ---- 4. UI navigation: dropdown -> Views, hamburger -> Likes, back link ----
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(500);
  await page.evaluate(() => { document.querySelector('button[aria-label="Instagram menu"]').click(); });
  await sleep(300);
  await page.evaluate(() => { [...document.querySelectorAll('nav[aria-label="Primary"] a')].find((a) => a.textContent.trim() === "Views")?.click(); });
  await sleep(700);
  check("Nav dropdown -> Views page", page.url().endsWith("/instagram/views"), page.url());
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(500);
  await page.evaluate(() => { document.querySelector('button[aria-label="Open menu"]').click(); });
  await sleep(400);
  await page.evaluate(() => { [...document.querySelectorAll('[role="dialog"] button')].find((b) => b.textContent.trim() === "Instagram")?.click(); });
  await sleep(300);
  await page.evaluate(() => { [...document.querySelectorAll('[role="dialog"] a')].find((a) => a.textContent.trim() === "Likes")?.click(); });
  await sleep(700);
  check("Mobile drawer -> Likes page", page.url().endsWith("/instagram/likes"), page.url());

  // ---- 5. Refresh + back/forward ----
  await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
  await sleep(500);
  check("Refresh keeps Likes page", page.url().endsWith("/instagram/likes"), "");
  const btnCountAfter = await page.evaluate(() => [...document.querySelectorAll("main button")].filter((b) => b.textContent.includes("Order Now")).length);
  check("After refresh: 16 order buttons", btnCountAfter === 16, `got ${btnCountAfter}`);
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(500);
  await page.goBack();
  await sleep(700);
  check("Back to Likes page", page.url().endsWith("/instagram/likes"), page.url());

  // ---- 6. Touch targets on mobile (WCAG 2.2 min 24px; inline text links exempt) ----
  await page.setViewport({ width: 375, height: 812 });
  const small = await page.evaluate(() => {
    const bad = [];
    document.querySelectorAll("button, a").forEach((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return;
      if (r.width === 0 || r.height === 0) return;
      // Inline text links (line-height, not block) are exempt per WCAG 2.5.8 spacing exception.
      const isInlineText = cs.display === "inline";
      const minDim = Math.min(r.width, r.height);
      if (minDim < 24 && !isInlineText) bad.push(`${el.tagName}.${(el.className && typeof el.className === "string") ? el.className.slice(0, 30) : ""} ${Math.round(r.width)}x${Math.round(r.height)}`);
    });
    return bad.slice(0, 6);
  });
  check("Mobile: touch targets meet WCAG min 24px", small.length === 0, small.join(" | "));

  // ---- 7. Focus visible on keyboard ----
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/instagram/views`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(400);
  await page.keyboard.press("Tab");
  await sleep(150);
  await page.keyboard.press("Tab");
  await sleep(150);
  const focusStyle = await page.evaluate(() => {
    const el = document.activeElement;
    const cs = getComputedStyle(el);
    return { tag: el.tagName, outline: cs.outline, outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle };
  });
  check("Keyboard focus visible", focusStyle.outlineStyle === "solid" && parseFloat(focusStyle.outlineWidth) > 0, JSON.stringify(focusStyle));

  // ---- 8. Console errors across everything above (filter dev-only HMR/BFCache noise) ----
  const realErrs = consoleErrors.filter((e) => !e.includes("favicon.ico") && !e.includes("404 (Not Found)") && !e.includes("hmr?id=") && !e.includes("Back-Forward Cache"));
  check("No console/page errors in supplementary run", realErrs.length === 0, realErrs.slice(0, 3).join("\n"));

  await browser.close();
  console.log(failures === 0 ? "\nSUPPLEMENTARY: ALL CHECKS PASSED" : `\nSUPPLEMENTARY: ${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error("TEST ERROR:", e); process.exit(2); });
