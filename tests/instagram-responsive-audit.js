/* eslint-disable no-console */
// PROMPT 6 — Responsive + UI + performance audit.
// Overflow scan across 15 widths x 6 routes + nav/modal/WhatsApp/reduced-motion checks.
const puppeteer = require("puppeteer-core");

const BASE = "http://localhost:1111";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const WIDTHS = [320, 360, 375, 390, 414, 430, 480, 768, 820, 1024, 1280, 1366, 1440, 1600, 1920];
const ROUTES = ["/", "/compare", "/wishlist", "/instagram/views", "/instagram/followers", "/instagram/likes"];

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
  const failedResponses = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
  page.on("response", (r) => { if (r.status() >= 400) failedResponses.push(`${r.status()} ${r.url()}`); });

  // ---- 1. Horizontal overflow + width scan ----
  let overflowFailures = 0;
  const overflowDetail = [];
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 900 });
    for (const route of ROUTES) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
      await sleep(300);
      const m = await page.evaluate(() => {
        const de = document.documentElement;
        const over = de.scrollWidth - de.clientWidth;
        const vw = window.innerWidth;
        const offenders = [];
        document.querySelectorAll("body *").forEach((el) => {
          if (!(el.offsetParent || el.getBoundingClientRect().width)) return;
          if (el.closest("[aria-hidden]") || el.closest("svg") || el.closest(".pointer-events-none")) return;
          const r = el.getBoundingClientRect();
          if (r.width === 0) return;
          const pos = getComputedStyle(el).position;
          if (pos === "fixed") return;
          const cls = (el.className && typeof el.className === "string") ? el.className.slice(0, 50) : el.tagName;
          if (r.right > vw + 1 && !el.closest("button")) offenders.push(`${el.tagName}.${cls} right=${Math.round(r.right)}`);
          if (r.left < -1 && !el.closest("button")) offenders.push(`${el.tagName}.${cls} left=${Math.round(r.left)}`);
        });
        return { over, bodyOver: document.body.scrollWidth - document.body.clientWidth, offenders: offenders.slice(0, 3) };
      });
      if (m.over > 1) {
        overflowFailures++;
        overflowDetail.push(`${w}px ${route}: docOverflow=${m.over} offenders=${JSON.stringify(m.offenders)}`);
      }
    }
  }
  check("No horizontal overflow across 15 widths x 6 routes", overflowFailures === 0, overflowDetail.slice(0, 8).join("  |  "));

  // ---- 2. Console / resource errors (filter known favicon 404) ----
  await page.setViewport({ width: 1440, height: 900 });
  for (const route of ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(300);
  }
  const bad = failedResponses.filter((f) => !f.includes("favicon.ico"));
  check("No failing resources (excl. favicon.ico)", bad.length === 0, bad.slice(0, 4).join("\n"));
  const realErrs = consoleErrors.filter((e) => !e.includes("favicon.ico") && !e.includes("404 (Not Found)"));
  check("No console/page errors", realErrs.length === 0, realErrs.slice(0, 4).join("\n"));

  // ---- 3. Desktop navbar (1440px) ----
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/instagram/views`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(400);
  const navVisible = await page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Primary"]');
    return !!nav && getComputedStyle(nav).display !== "none";
  });
  check("Desktop: primary nav visible", navVisible);
  const igBtn = await page.$('button[aria-label="Instagram menu"]');
  check("Desktop: Instagram button present", !!igBtn);
  if (igBtn) {
    await igBtn.click();
    await sleep(300);
    const dd = await page.evaluate(() => document.body.innerText);
    check("Desktop: dropdown shows Views/Followers/Likes", /Views/.test(dd) && /Followers/.test(dd) && /Likes/.test(dd));
    await page.keyboard.press("Escape");
  }

  // ---- 4. Mobile hamburger + drawer (375px) ----
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(400);
  const ham = await page.$('button[aria-label="Open menu"], button[aria-label="Close menu"]');
  check("Mobile: hamburger present", !!ham);
  if (ham) {
    await ham.click();
    await sleep(400);
    const dlg = await page.$('[role="dialog"][aria-label="Command center"]');
    check("Mobile: command center opens", !!dlg);
    const dlgBox = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-label="Command center"]');
      const panel = d.querySelector(".glass-stack");
      const r = panel.getBoundingClientRect();
      const scroll = document.documentElement;
      return { right: Math.round(r.right), left: Math.round(r.left), vw: window.innerWidth, docOverflow: scroll.scrollWidth - scroll.clientWidth, bodyLocked: document.body.style.overflow };
    });
    check("Mobile: drawer fits viewport", dlgBox.left >= 0 && dlgBox.right <= dlgBox.vw, JSON.stringify(dlgBox));
    check("Mobile: no horizontal overflow with drawer open", dlgBox.docOverflow <= 1, `over=${dlgBox.docOverflow}`);
    check("Mobile: body scroll locked", dlgBox.bodyLocked === "hidden", `overflow=${dlgBox.bodyLocked}`);
    // Instagram accordion
    await page.evaluate(() => { [...document.querySelectorAll('[role="dialog"] button')].find((b) => b.textContent.trim() === "Instagram")?.click(); });
    await sleep(300);
    const sub = await page.evaluate(() => document.querySelector('[role="dialog"]').innerText);
    check("Mobile: Instagram accordion shows Views/Followers/Likes", /Views/.test(sub) && /Followers/.test(sub) && /Likes/.test(sub));
    // Escape closes
    await page.keyboard.press("Escape");
    await sleep(300);
    check("Mobile: Escape closes drawer", !(await page.$('[role="dialog"][aria-label="Command center"]')));
    const unlocked = await page.evaluate(() => document.body.style.overflow);
    check("Mobile: body scroll restored", unlocked === "");
  }

  // ---- 5. Mobile order modal fits viewport (320px + 390px) ----
  for (const w of [320, 390]) {
    await page.setViewport({ width: w, height: 700 });
    await page.goto(`${BASE}/instagram/views`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(400);
    await page.evaluate(() => { [...document.querySelectorAll("main button")].find((b) => b.textContent.includes("Order Now"))?.click(); });
    await page.waitForSelector('[role="dialog"]', { timeout: 4000 });
    await sleep(300);
    const m = await page.evaluate(() => {
      const panel = document.querySelector(".popup-panel");
      const r = panel.getBoundingClientRect();
      const de = document.documentElement;
      const close = document.querySelector(".popup-close-btn").getBoundingClientRect();
      const footer = document.querySelector(".popup-footer");
      const fr = footer.getBoundingClientRect();
      return {
        left: Math.round(r.left), right: Math.round(r.right), vw: window.innerWidth,
        docOverflow: de.scrollWidth - de.clientWidth,
        panelH: Math.round(r.height), vh: window.innerHeight,
        closeVisible: close.top >= 0 && close.right <= window.innerWidth && close.bottom <= window.innerHeight,
        footerVisible: fr.bottom <= window.innerHeight + 1,
      };
    });
    check(`Modal fits viewport at ${w}px`, m.left >= 0 && m.right <= m.vw && m.docOverflow <= 1, JSON.stringify(m));
    check(`Modal scrolls internally + footer reachable at ${w}px`, m.panelH <= m.vh + 1 && m.closeVisible && m.footerVisible, JSON.stringify(m));
    await page.keyboard.press("Escape");
    await sleep(200);
  }

  // ---- 6. Reduced motion ----
  const rmPage = await browser.newPage();
  await rmPage.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await rmPage.setViewport({ width: 1440, height: 900 });
  await rmPage.goto(`${BASE}/instagram/views`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(400);
  const rm = await rmPage.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.cssText = "transition: transform 1s; animation: ff-drift 3s infinite;";
    document.body.appendChild(probe);
    const cs = getComputedStyle(probe);
    const out = { transitionDuration: cs.transitionDuration, animationDuration: cs.animationDuration, animationIterationCount: cs.animationIterationCount };
    probe.remove();
    return out;
  });
  const rmNum = (s) => (parseFloat(s) || 0);
  check("Reduced motion disables animation/transition", rmNum(rm.transitionDuration) < 0.01 && rmNum(rm.animationDuration) < 0.01, JSON.stringify(rm));
  await rmPage.close();

  await browser.close();
  console.log(failures === 0 ? "\nAUDIT: ALL CHECKS PASSED" : `\nAUDIT: ${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error("TEST ERROR:", e); process.exit(2); });
