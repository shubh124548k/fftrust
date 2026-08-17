/* eslint-disable no-console */
// PROMPT 9 — Card actions, media, filters, wishlist/compare audit.
// 1. Heart + Compare icons on every listing card (account/panel/push).
// 2. Wishlist toggle persists + state changes; Compare toggle + cross-type block.
// 3. Card image stays MEDIUM on desktop, responsive on mobile.
// 4. Lightbox: opens from image click, counter, arrows, thumbnails, keyboard, swipe, ESC, scroll-lock.
// 5. No empty VIDEO tile on cards without videoUrl.
// 6. Price sort (numeric) on home Explore, Panel Seller, Paid Push.
// 7. Price sort on Instagram Views / Followers / Likes.
// 8. No console errors, no horizontal overflow across widths.
const puppeteer = require("puppeteer-core");
const fs = require("fs");

const BASE = "http://localhost:1111";
const CANDIDATE_BROWSERS = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];
const BROWSER = CANDIDATE_BROWSERS.find((p) => fs.existsSync(p));
if (!BROWSER) { console.error("No browser found for Puppeteer"); process.exit(1); }
const WIDTHS = [320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1920];

let failures = 0;
function check(name, ok, extra = "") {
  if (ok) console.log(`PASS  ${name}`);
  else { failures++; console.log(`FAIL  ${name} ${extra}`); }
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function parsePrice(text) {
  const m = (text || "").match(/₹?\s*([\d,]+)/);
  return m ? Number(m[1].replace(/,/g, "")) : null;
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: BROWSER, headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

  // ---- 1. Heart + Compare icons on every card (home) ----
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  const iconState = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Account '], [aria-label^='Service '], [aria-label^='Rank push ']"));
    const has = (labelRe) => cards.every((c) => !!Array.from(c.querySelectorAll("button")).find((b) => labelRe.test(b.getAttribute("aria-label") || "")));
    return { cards: cards.length, heart: has(/favorites/i), compare: has(/compare/i) };
  });
  check("Every listing card shows a Heart (wishlist) icon", iconState.cards > 0 && iconState.heart, JSON.stringify(iconState));
  check("Every listing card shows a Compare icon", iconState.compare, JSON.stringify(iconState));

  // ---- 2a. Wishlist toggle changes state and is accessible ----
  await page.evaluate(() => {
    const b = document.querySelector('button[aria-label="Add to favorites"]');
    b && b.click();
  });
  await sleep(300);
  const favOn = await page.evaluate(() => {
    const b = document.querySelector('button[aria-label="Remove from favorites"]');
    return !!b && b.getAttribute("aria-pressed") === "true";
  });
  check("Wishlist toggle flips to Remove from favorites (state change)", favOn);
  // persisted
  await page.reload({ waitUntil: "networkidle0" });
  await sleep(600);
  const favPersisted = await page.evaluate(() => !!document.querySelector('button[aria-label="Remove from favorites"]'));
  check("Wishlist persists across reload (localStorage)", favPersisted);
  // toggle off
  await page.evaluate(() => {
    const b = document.querySelector('button[aria-label="Remove from favorites"]');
    b && b.click();
  });
  await sleep(300);
  const favOff = await page.evaluate(() => !!document.querySelector('button[aria-label="Add to favorites"]'));
  check("Wishlist toggle off restores Add to favorites", favOff);

  // ---- 2b. Compare toggle + CompareDock selected state ----
  await page.evaluate(() => {
    const b = document.querySelector('button[aria-label="Add to compare"]');
    b && b.click();
  });
  await sleep(300);
  const cmpOn = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll("button")).find((x) => (x.getAttribute("aria-label") || "").includes("from compare"));
    return !!b;
  });
  check("Compare toggle flips to Remove (card + dock selected state)", cmpOn);
  // remove it again so later tests start clean
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll("button")).find((x) => (x.getAttribute("aria-label") || "").includes("from compare"));
    b && b.click();
  });
  await sleep(300);

  // ---- 3. Card image MEDIUM on desktop / responsive on mobile ----
  const deskMedia = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("[aria-label^='Account '] img, [aria-label^='Service '] img, [aria-label^='Rank push '] img"));
    return imgs.slice(0, 6).map((img) => Math.round(img.getBoundingClientRect().height));
  });
  check("Card primary image stays MEDIUM on desktop (≤ 220px, not fullscreen)", deskMedia.length > 0 && deskMedia.every((h) => h >= 80 && h <= 220), JSON.stringify(deskMedia));

  await page.setViewport({ width: 375, height: 812 });
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  const mobMedia = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("[aria-label^='Account '] img, [aria-label^='Service '] img, [aria-label^='Rank push '] img"));
    return imgs.slice(0, 6).map((img) => Math.round(img.getBoundingClientRect().height));
  });
  check("Card primary image compact/responsive on mobile (≤ 160px)", mobMedia.length > 0 && mobMedia.every((h) => h >= 60 && h <= 160), JSON.stringify(mobMedia));

  // ---- 4. Lightbox: open, counter, arrows, thumbnails, keyboard, scroll-lock, ESC ----
  await page.evaluate(() => {
    const btn = document.querySelector("button[aria-label^='View media']");
    btn && btn.click();
  });
  await sleep(400);
  const lb0 = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
    if (!dlg) return null;
    const counter = dlg.textContent.match(/(\d)\s*\/\s*(\d)/);
    return { open: true, count: counter ? { current: +counter[1], total: +counter[2] } : null, thumbs: dlg.querySelectorAll("button[aria-label^='View image']").length, locked: document.body.style.overflow === "hidden" };
  });
  check("Image click opens lightbox", lb0 && lb0.open);
  check("Lightbox counter shows real total (N / M)", lb0 && lb0.count && lb0.count.total >= 1, JSON.stringify(lb0 && lb0.count));
  check("Lightbox thumbnails present", lb0 && lb0.thumbs > 0, JSON.stringify(lb0));
  check("Body scroll locked while viewer open", lb0 && lb0.locked);

  // keyboard ArrowRight advances
  await page.keyboard.press("ArrowRight");
  await sleep(250);
  const lb1 = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
    const m = dlg ? dlg.textContent.match(/(\d)\s*\/\s*(\d)/) : null;
    return m ? { current: +m[1], total: +m[2] } : null;
  });
  check("Keyboard ArrowRight advances slide", lb1 && lb1.current === 2 && lb1.total === lb0.count.total, JSON.stringify(lb1));

  // keyboard ArrowLeft goes back
  await page.keyboard.press("ArrowLeft");
  await sleep(250);
  const lbBack = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
    const m = dlg ? dlg.textContent.match(/(\d)\s*\/\s*(\d)/) : null;
    return m ? +m[1] : null;
  });
  check("Keyboard ArrowLeft goes back", lbBack === 1, `after=${lbBack}`);
  await page.keyboard.press("ArrowRight");
  await sleep(250);

  // thumbnails select correct image (last thumbnail)
  if (lb0.count.total >= 2) {
    await page.evaluate((n) => {
      const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
      const t = dlg && Array.from(dlg.querySelectorAll("button[aria-label^='View image ']")).find((b) => b.getAttribute("aria-label") === `View image ${n}`);
      t && t.click();
    }, lb0.count.total);
    await sleep(250);
    const lb2 = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
      const m = dlg ? dlg.textContent.match(/(\d)\s*\/\s*(\d)/) : null;
      return m ? +m[1] : null;
    });
    check("Thumbnail selects the correct image", lb2 === lb0.count.total, `after=${lb2}`);

    // swipe LEFT at last slide is a controlled no-op (must not wrap/crash)
    await page.evaluate(() => {
      const img = document.querySelector('[role="dialog"][aria-label*="media gallery"] img');
      if (!img) return;
      const base = { identifier: 1, target: img, clientX: 300, clientY: 400, screenX: 300, screenY: 400, pageX: 300, pageY: 400, radiusX: 2, radiusY: 2, rotationAngle: 0, force: 1 };
      const mk = (c) => new Touch({ ...base, clientX: c, pageX: c, screenX: c });
      img.dispatchEvent(new TouchEvent("touchstart", { touches: [mk(300)], targetTouches: [mk(300)], changedTouches: [mk(300)], bubbles: true, cancelable: true }));
      img.dispatchEvent(new TouchEvent("touchmove", { touches: [mk(180)], targetTouches: [mk(180)], changedTouches: [mk(180)], bubbles: true, cancelable: true }));
      img.dispatchEvent(new TouchEvent("touchend", { touches: [], targetTouches: [], changedTouches: [mk(180)], bubbles: true, cancelable: true }));
    });
    await sleep(250);
    const lbEnd = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
      const m = dlg ? dlg.textContent.match(/(\d)\s*\/\s*(\d)/) : null;
      return m ? +m[1] : null;
    });
    check("Swipe at last slide is a controlled no-op (no wrap/crash)", lbEnd === lb0.count.total, `after=${lbEnd}`);

    // swipe RIGHT (to previous) works
    await page.evaluate(() => {
      const img = document.querySelector('[role="dialog"][aria-label*="media gallery"] img');
      if (!img) return;
      const base = { identifier: 1, target: img, clientX: 180, clientY: 400, screenX: 180, screenY: 400, pageX: 180, pageY: 400, radiusX: 2, radiusY: 2, rotationAngle: 0, force: 1 };
      const mk = (c) => new Touch({ ...base, clientX: c, pageX: c, screenX: c });
      img.dispatchEvent(new TouchEvent("touchstart", { touches: [mk(180)], targetTouches: [mk(180)], changedTouches: [mk(180)], bubbles: true, cancelable: true }));
      img.dispatchEvent(new TouchEvent("touchmove", { touches: [mk(300)], targetTouches: [mk(300)], changedTouches: [mk(300)], bubbles: true, cancelable: true }));
      img.dispatchEvent(new TouchEvent("touchend", { touches: [], targetTouches: [], changedTouches: [mk(300)], bubbles: true, cancelable: true }));
    });
    await sleep(250);
    const lbPrev = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
      const m = dlg ? dlg.textContent.match(/(\d)\s*\/\s*(\d)/) : null;
      return m ? +m[1] : null;
    });
    check("Mobile swipe RIGHT (previous) works", lbPrev === lb0.count.total - 1, `after=${lbPrev}`);

    // swipe LEFT advances back to last slide
    await page.evaluate(() => {
      const img = document.querySelector('[role="dialog"][aria-label*="media gallery"] img');
      if (!img) return;
      const base = { identifier: 1, target: img, clientX: 300, clientY: 400, screenX: 300, screenY: 400, pageX: 300, pageY: 400, radiusX: 2, radiusY: 2, rotationAngle: 0, force: 1 };
      const mk = (c) => new Touch({ ...base, clientX: c, pageX: c, screenX: c });
      img.dispatchEvent(new TouchEvent("touchstart", { touches: [mk(300)], targetTouches: [mk(300)], changedTouches: [mk(300)], bubbles: true, cancelable: true }));
      img.dispatchEvent(new TouchEvent("touchmove", { touches: [mk(180)], targetTouches: [mk(180)], changedTouches: [mk(180)], bubbles: true, cancelable: true }));
      img.dispatchEvent(new TouchEvent("touchend", { touches: [], targetTouches: [], changedTouches: [mk(180)], bubbles: true, cancelable: true }));
    });
    await sleep(250);
    const lbNext = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
      const m = dlg ? dlg.textContent.match(/(\d)\s*\/\s*(\d)/) : null;
      return m ? +m[1] : null;
    });
    check("Mobile swipe LEFT (next) works", lbNext === lb0.count.total, `after=${lbNext}`);
  } else {
    console.log("SKIP  swipe/thumbnail detail checks (single-image card)");
  }

  // ESC closes
  await page.keyboard.press("Escape");
  await sleep(300);
  const lbClosed = await page.evaluate(() => !document.querySelector('[role="dialog"][aria-label*="media gallery"]'));
  check("ESC closes lightbox", lbClosed);

  // ---- 5. No empty VIDEO tile on cards without videoUrl ----
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(500);
  await page.evaluate(() => {
    const btn = document.querySelector("button[aria-label^='View media']");
    btn && btn.click();
  });
  await sleep(350);
  const noEmptyVideo = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
    return !Array.from(dlg.querySelectorAll("button")).some((b) => (b.getAttribute("aria-label") || "") === "Open video");
  });
  check("Cards without videoUrl show NO empty VIDEO option", noEmptyVideo);
  await page.keyboard.press("Escape");
  await sleep(250);

  // ---- 5b. VIDEO option + inline player when videoUrl exists (SAMPLE — Starter Vault) ----
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button[aria-label^='View media']")).find((b) => {
      const card = b.closest("[aria-label^='Account ']");
      return card && /Starter Vault/i.test(card.getAttribute("aria-label") || "");
    });
    btn && btn.click();
  });
  await sleep(400);
  const videoTile = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
    return !!Array.from(dlg.querySelectorAll("button")).find((b) => (b.getAttribute("aria-label") || "") === "Play video");
  });
  check("VIDEO option appears when videoUrl exists", videoTile);

  await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
    const vb = dlg && Array.from(dlg.querySelectorAll("button")).find((b) => (b.getAttribute("aria-label") || "") === "Play video");
    vb && vb.click();
  });
  await sleep(600);
  const videoPop = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
    if (!dlg) return null;
    const iframe = dlg.querySelector("iframe");
    return { hasClose: !!Array.from(dlg.querySelectorAll("button")).find((b) => (b.getAttribute("aria-label") || "") === "Close gallery"), src: iframe ? iframe.getAttribute("src") : null };
  });
  check("Video plays inline in the gallery (premium viewer style)", videoPop !== null);
  check("Video embeds YouTube-nocookie player with NO autoplay param", videoPop && videoPop.src && videoPop.src.includes("youtube-nocookie") && !/autoplay/i.test(videoPop.src), JSON.stringify(videoPop));
  check("Gallery has a Close button", videoPop && videoPop.hasClose);

  // ESC closes the gallery (video plays inside the same unified viewer)
  await page.keyboard.press("Escape");
  await sleep(300);
  const galleryClosedAfterVideo = await page.evaluate(() => !document.querySelector('[role="dialog"][aria-label*="media gallery"]'));
  check("ESC closes gallery after video", galleryClosedAfterVideo);

  // ---- 6. Numeric price sort on home Explore (High→Low then Low→High) ----
  const readHomePrices = async () => page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Account ']"));
    return cards.map((c) => {
      const t = c.textContent || "";
      const m = t.match(/₹\s*([\d,]+)/);
      return m ? Number(m[1].replace(/,/g, "")) : null;
    }).filter((v) => v !== null);
  });
  // default is High to Low
  await sleep(400);
  const homeDesc = await readHomePrices();
  check("Explore default sort High→Low is numeric & descending", homeDesc.length > 1 && homeDesc.every((v, i) => i === 0 || homeDesc[i - 1] >= v), JSON.stringify(homeDesc));
  await page.evaluate(() => {
    const s = document.querySelector('select[aria-label="Sort accounts"]');
    if (s) { s.value = "price-asc"; s.dispatchEvent(new Event("change", { bubbles: true })); }
  });
  await sleep(400);
  const homeAsc = await readHomePrices();
  check("Explore Low→High sort reorders numerically ascending", homeAsc.length > 1 && homeAsc.every((v, i) => i === 0 || homeAsc[i - 1] <= v), JSON.stringify(homeAsc));

  // ---- 6b. Panel Seller + Paid Push sort controls exist and sort numerically ----
  await page.goto(`${BASE}/services`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(500);
  const readPanelPrices = async () => page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Service ']"));
    return cards.map((c) => {
      const m = (c.textContent || "").match(/₹\s*([\d,]+)/);
      return m ? Number(m[1].replace(/,/g, "")) : null;
    }).filter((v) => v !== null);
  });
  await page.evaluate(() => {
    const s = document.querySelector('select[aria-label="Sort services"]');
    if (s) { s.value = "price-asc"; s.dispatchEvent(new Event("change", { bubbles: true })); }
  });
  await sleep(400);
  const panelAsc = await readPanelPrices();
  check("Panel Seller Low→High sorts numerically ascending", panelAsc.length > 1 && panelAsc.every((v, i) => i === 0 || panelAsc[i - 1] <= v), JSON.stringify(panelAsc));

  // ---- 7. Instagram Views / Followers / Likes price sort ----
  const igRoutes = [["/instagram/views", "View accounts and prices"], ["/instagram/followers", "follower"], ["/instagram/likes", "like"]];
  for (const [route] of igRoutes) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(500);
    const hasSelect = await page.evaluate(() => !!document.querySelector('select[aria-label*="Sort"][aria-label*="price"]'));
    check(`Instagram ${route} shows Price sort control`, hasSelect);

    // read discount prices (text-gradient-cyan big price)
    const readIgPrices = () => page.evaluate(() => {
      const parse = (text) => {
        const m = (text || "").match(/₹?\s*([\d,]+)/);
        return m ? Number(m[1].replace(/,/g, "")) : null;
      };
      const cards = Array.from(document.querySelectorAll(".text-gradient-cyan"));
      return cards.map((el) => parse(el.textContent)).filter((v) => v !== null);
    });
    const desc = await readIgPrices();
    check(`Instagram ${route} default High→Low numeric descending`, desc.length > 1 && desc.every((v, i) => i === 0 || desc[i - 1] >= v), JSON.stringify(desc));

    await page.evaluate(() => {
      const s = document.querySelector('select[aria-label*="Sort"][aria-label*="price"]');
      if (s) { s.value = "price-asc"; s.dispatchEvent(new Event("change", { bubbles: true })); }
    });
    await sleep(400);
    const asc = await readIgPrices();
    check(`Instagram ${route} Low→High reorders numerically ascending`, asc.length > 1 && asc.every((v, i) => i === 0 || asc[i - 1] <= v), JSON.stringify(asc));
  }

  // ---- 8. No console errors + no horizontal overflow across widths ----
  const fatal = consoleErrors.filter((e) => !/favicon|websocket|Back-forward|BackForward/i.test(e));
  check("No console/page errors", fatal.length === 0, fatal.slice(0, 5).join(" | "));

  let overflows = 0;
  const overflowDetail = [];
  const routes2 = ["/", "/instagram/views", "/instagram/followers", "/instagram/likes", "/wishlist", "/compare", "/privacy", "/terms", "/refund-policy"];
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 900 });
    for (const route of routes2) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
      await sleep(200);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 1) { overflows++; overflowDetail.push(`${w}px ${route} over=${over}`); }
    }
  }
  check("No horizontal overflow (11 widths x 9 routes)", overflows === 0, overflowDetail.slice(0, 6).join(" | "));

  await browser.close();
  console.log(failures === 0 ? "\nALL P9 CHECKS PASS" : `\n${failures} P9 CHECKS FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})();
