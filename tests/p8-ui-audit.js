/* eslint-disable no-console */
// PROMPT 8 — Final UI audit.
// 1. Instagram dropdown floats (header height constant), inside viewport, Escape closes.
// 2. Global Contact popup works from Home / Views / Followers / Likes / Compare / Wishlist / Privacy,
//    shows the "Want to sell something?" line, closes via Escape and outside click.
// 3. Anchor navigation lands on the correct section (fixed-header-aware offset, no random scroll).
// 4. Media lightbox: image slides, arrows, counter, thumbnails, VIDEO option, video popup (no autoplay).
// 5. No horizontal overflow across 11 widths on key routes.
// 6. No console/page errors.
const puppeteer = require("puppeteer-core");

const BASE = "http://localhost:1111";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const WIDTHS = [320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1920];

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

  // ---- 1. Dropdown floats over navbar (desktop) ----
  let ddOk = true;
  let ddDetail = [];
  for (const w of [1024, 1280, 1440, 1920]) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(400);
    const h0 = await page.evaluate(() => document.querySelector("header").getBoundingClientRect().height);
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll("header button")).find((x) => x.textContent.includes("Instagram"));
      b && b.click();
    });
    await sleep(250);
    const m = await page.evaluate(() => {
      const header = document.querySelector("header");
      const panel = Array.from(header.querySelectorAll("*")).find((el) =>
        getComputedStyle(el).position === "absolute" &&
        (el.textContent || "").includes("Followers") &&
        (el.textContent || "").includes("Likes") &&
        el.getBoundingClientRect().height > 50,
      );
      const r = panel ? panel.getBoundingClientRect() : null;
      return {
        headerH: header.getBoundingClientRect().height,
        panel: r ? { pos: getComputedStyle(panel).position, right: Math.round(r.right), left: Math.round(r.left), vw: window.innerWidth } : null,
      };
    });
    const ok = m.panel && m.panel.pos === "absolute" && Math.abs(h0 - m.headerH) < 1 && m.panel.right <= m.panel.vw && m.panel.left >= 0;
    if (!ok) ddDetail.push(`${w}px h0=${h0} h1=${m.headerH} ${JSON.stringify(m.panel)}`);
    ddOk = ddOk && ok;
  }
  check("Dropdown floats over navbar (header height constant, inside viewport) at 1024-1920", ddOk, ddDetail.join(" | "));

  // Escape closes dropdown
  await page.keyboard.press("Escape");
  await sleep(200);
  const ddClosed = await page.evaluate(() =>
    !Array.from(document.querySelectorAll("header *")).some((el) =>
      el.tagName === "A" && (el.textContent || "").trim() === "Likes" && el.getBoundingClientRect().width > 0),
  );
  check("Escape closes Instagram dropdown", ddClosed);

  // ---- 2. Contact popup global — all routes ----
  const routes = ["/", "/instagram/views", "/instagram/followers", "/instagram/likes", "/compare", "/wishlist", "/privacy"];
  for (const route of routes) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(350);
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll("header button")).find((x) => (x.getAttribute("aria-label") || "").includes("Contact"));
      b && b.click();
    });
    await sleep(250);
    const ok = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"][aria-label="List Your Account"]');
      if (!dlg) return false;
      const r = dlg.getBoundingClientRect();
      return r.width > 200 && dlg.textContent.includes("Want to sell something?") && dlg.textContent.includes("Contact Owner on WhatsApp");
    });
    check(`Contact popup works on ${route}`, ok);
    // close via Escape
    await page.keyboard.press("Escape");
    await sleep(200);
    const closed = await page.evaluate(() => !document.querySelector('[role="dialog"][aria-label="List Your Account"]'));
    check(`Contact popup closes via Escape on ${route}`, closed);
  }

  // Outside click closes popup
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(350);
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll("header button")).find((x) => (x.getAttribute("aria-label") || "").includes("Contact"));
    b && b.click();
  });
  await sleep(250);
  await page.mouse.click(30, 500); // click on backdrop area
  await sleep(250);
  const closedOutside = await page.evaluate(() => !document.querySelector('[role="dialog"][aria-label="List Your Account"]'));
  check("Contact popup closes on outside click", closedOutside);

  // ---- 3. Anchor navigation lands on the correct section ----
  const clickAnchor = async (hash) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);
    await page.evaluate((h) => {
      const a = Array.from(document.querySelectorAll('header a')).find((x) => x.getAttribute("href") === h);
      a && a.click();
    }, hash);
    await sleep(1600); // smooth scroll settle
  };

  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(500);

  await clickAnchor("/#explore");
  const exploreTop = await page.evaluate(() => document.getElementById("explore").getBoundingClientRect().top);
  check("Explore anchor lands with fixed-header offset (not under navbar, not random)", exploreTop > 70 && exploreTop < 160, `top=${Math.round(exploreTop)}`);

  await clickAnchor("/#price-guide");
  const priceTop = await page.evaluate(() => document.getElementById("price-guide").getBoundingClientRect().top);
  check("Price Guide anchor lands with fixed-header offset", priceTop > 70 && priceTop < 160, `top=${Math.round(priceTop)}`);

  await clickAnchor("/#how-it-works");
  const howTop = await page.evaluate(() => document.getElementById("how-it-works").getBoundingClientRect().top);
  check("How It Works anchor lands with fixed-header offset", howTop > 70 && howTop < 160, `top=${Math.round(howTop)}`);

  // ---- 4. Media lightbox on a real card (images/arrows/counter/thumbnails/ESC/scroll-lock) ----
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  await page.evaluate(() => {
    const btn = document.querySelector("button[aria-label^='View images']");
    btn && btn.click();
  });
  await sleep(400);
  const lb = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
    if (!dlg) return null;
    return {
      hasCounter: /\/\s*\d/.test(dlg.textContent),
      hasThumbnails: dlg.querySelectorAll("button[aria-label^='View image']").length,
      hasVideoTile: !!Array.from(dlg.querySelectorAll("button")).find((b) => (b.getAttribute("aria-label") || "") === "Open video"),
      hasPrev: !!Array.from(dlg.querySelectorAll("button")).find((b) => (b.getAttribute("aria-label") || "") === "Previous media"),
      hasNext: !!Array.from(dlg.querySelectorAll("button")).find((b) => (b.getAttribute("aria-label") || "") === "Next media"),
    };
  });
  check("Lightbox opens from a real card", lb !== null);
  check("Lightbox has counter + thumbnails", lb && lb.hasCounter && lb.hasThumbnails > 0, JSON.stringify(lb));
  check("Lightbox shows Next arrow at first slide", lb && lb.hasNext, JSON.stringify(lb));
  check("Cards without video show NO empty VIDEO option", lb && !lb.hasVideoTile, JSON.stringify(lb));

  // Next arrow advances the slide counter and then the Previous arrow appears
  const beforeCounter = lb && lb.hasCounter;
  if (beforeCounter) {
    await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
      const n = Array.from(dlg.querySelectorAll("button")).find((b) => (b.getAttribute("aria-label") || "") === "Next media");
      n && n.click();
    });
    await sleep(200);
    const after = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
      return dlg ? dlg.textContent.match(/(\d)\s*\/\s*(\d)/)?.[1] : null;
    });
    check("Next arrow advances slide counter", after === "2", `after=${after}`);
    const hasPrevNow = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
      return !!Array.from(dlg.querySelectorAll("button")).find((b) => (b.getAttribute("aria-label") || "") === "Previous media");
    });
    check("Previous arrow appears after advancing", hasPrevNow);
  }

  // Body scroll locked while lightbox open
  const locked = await page.evaluate(() => document.body.style.overflow === "hidden");
  check("Body scroll locked while lightbox open", locked);

  // ESC closes lightbox
  await page.keyboard.press("Escape");
  await sleep(300);
  const lbClosed = await page.evaluate(() => !document.querySelector('[role="dialog"][aria-label*="media gallery"]'));
  check("ESC closes lightbox", lbClosed);

  // ---- 4b. Mobile: hamburger + Instagram accordion ----
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(400);
  await page.evaluate(() => {
    const h = document.querySelector('button[aria-label="Open menu"]');
    h && h.click();
  });
  await sleep(300);
  const drawerOpen = await page.evaluate(() => !!document.querySelector('[role="dialog"][aria-label="Command center"]'));
  check("Mobile hamburger opens command center", drawerOpen);

  const igAccordion = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label="Command center"]');
    const btn = dlg && Array.from(dlg.querySelectorAll("button")).find((b) => (b.textContent || "").includes("Instagram"));
    if (btn) btn.click();
    return !!btn;
  });
  await sleep(250);
  const igMobileLinks = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label="Command center"]');
    const links = dlg ? Array.from(dlg.querySelectorAll("a")).map((a) => a.getAttribute("href")) : [];
    return ["/instagram/views", "/instagram/followers", "/instagram/likes"].every((h) => links.includes(h));
  });
  check("Instagram accordion in hamburger shows Views/Followers/Likes", igAccordion && igMobileLinks);
  await page.keyboard.press("Escape");
  await sleep(200);

  // ---- 4c. Mobile: lightbox swipe advances slide ----
  await page.evaluate(() => {
    const btn = document.querySelector("button[aria-label^='View images']");
    btn && btn.click();
  });
  await sleep(400);
  const swipeAdvanced = await page.evaluate(() => {
    const img = document.querySelector('[role="dialog"][aria-label*="media gallery"] img');
    if (!img) return false;
    const base = { identifier: 1, target: img, clientX: 300, clientY: 400, screenX: 300, screenY: 400, pageX: 300, pageY: 400, radiusX: 2, radiusY: 2, rotationAngle: 0, force: 1 };
    const mk = (c) => new Touch({ ...base, clientX: c, pageX: c, screenX: c });
    img.dispatchEvent(new TouchEvent("touchstart", { touches: [mk(300)], targetTouches: [mk(300)], changedTouches: [mk(300)], bubbles: true, cancelable: true }));
    img.dispatchEvent(new TouchEvent("touchmove", { touches: [mk(180)], targetTouches: [mk(180)], changedTouches: [mk(180)], bubbles: true, cancelable: true }));
    img.dispatchEvent(new TouchEvent("touchend", { touches: [], targetTouches: [], changedTouches: [mk(180)], bubbles: true, cancelable: true }));
    return true;
  });
  await sleep(250);
  const swipeAfter = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
    return dlg ? dlg.textContent.match(/(\d)\s*\/\s*(\d)/)?.[1] : null;
  });
  check("Mobile swipe advances lightbox slide", swipeAdvanced && swipeAfter === "2", `after=${swipeAfter}`);
  await page.keyboard.press("Escape");
  await sleep(250);

  // ---- 5. No horizontal overflow across widths x key routes ----
  let overflowFailures = 0;
  const overflowDetail = [];
  const routes2 = ["/", "/instagram/views", "/instagram/followers", "/instagram/likes", "/compare", "/wishlist", "/privacy", "/terms", "/refund-policy"];
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 900 });
    for (const route of routes2) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
      await sleep(250);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 1) { overflowFailures++; overflowDetail.push(`${w}px ${route} over=${over}`); }
    }
  }
  check("No horizontal overflow (11 widths x 9 routes)", overflowFailures === 0, overflowDetail.slice(0, 6).join(" | "));

  // ---- 6. No fatal console errors ----
  const fatal = consoleErrors.filter((e) => !/favicon\.ico|websocket|Back-forward|BackForward/i.test(e));
  check("No console/page errors", fatal.length === 0, fatal.slice(0, 5).join(" | "));

  await browser.close();
  console.log(failures === 0 ? "\nALL P8 CHECKS PASS" : `\n${failures} P8 CHECKS FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})();
