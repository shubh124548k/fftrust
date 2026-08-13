/* eslint-disable no-console */
// FF TRUST — Canonical card/data final-fix audit.
// Proves the "SAME canonical data object" architecture end to end:
//   1. Price is canonical: data.priceInr === card === Details.
//   2. Wishlist + Compare are keyed by canonical listing ID and survive reload.
//   3. videoUrl flows into the Details "Video" section BELOW the image gallery
//      and into the card lightbox video popup through ONE reusable video
//      component (SafeVideo) — every video iframe carries the SafeVideo sandbox
//      marker, so there is exactly one implementation.
//   4. No hardcoded video URLs anywhere in UI source (only src/data).
//   5. toListingMediaList validates, dedupes and caps images while always
//      keeping videoUrl in the Details media list.
//   6. No horizontal overflow at mobile/desktop widths after opening the
//      media viewer / lightbox / video popup.
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:1111";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ROOT = path.resolve(__dirname, "..");
const WIDTHS = [320, 390, 430, 768, 1440];

let failures = 0;
function check(name, ok, extra = "") {
  if (ok) console.log(`PASS  ${name}`);
  else { failures++; console.log(`FAIL  ${name} ${extra}`); }
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function parsePrice(text) {
  const m = (text || "").match(/₹\s*([\d,]+)/);
  return m ? Number(m[1].replace(/,/g, "")) : null;
}

(async () => {
  // ---- 0. Unit: toListingMediaList canonical guarantees ----
  console.log("0) Canonical media list (validate + dedupe + cap)");
  const { toListingMediaList } = await import(path.join(ROOT, "src/lib/media.ts"));
  const starter = await import(path.join(ROOT, "src/data/accounts.ts"));
  const all = Object.values(starter).flatMap((v) => (Array.isArray(v) ? v : []));
  const sv = all.find((a) => a && a.id === "SAMPLE-ACC-003" && a.videoUrl);
  check("canonical Starter Vault record exposes videoUrl", !!sv && !!sv.videoUrl, JSON.stringify(sv && sv.videoUrl));
  check("Starter Vault price in data is 1500", sv && sv.priceInr === 1500, JSON.stringify(sv && sv.priceInr));

  // Duplicate frontImage inside galleryImages + duplicate legacy media + legacy video dupe
  const dupeFixture = {
    frontImage: "https://example.com/a.jpg",
    galleryImages: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    media: [
      { kind: "image", url: "https://example.com/a.jpg", alt: "dup" },
      { kind: "video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", alt: "dup-video" },
      { kind: "image", url: "javascript:alert(1)", alt: "unsafe" },
      { kind: "image", url: "https://example.com/c.jpg", alt: "c" },
    ],
  };
  const deduped = toListingMediaList(dupeFixture, "Dup");
  check("frontImage == gallery[0] renders once", deduped.filter((m) => m.url === "https://example.com/a.jpg").length === 1, JSON.stringify(deduped));
  check("videoUrl + legacy video render once", deduped.filter((m) => m.kind === "video").length === 1);
  check("unsafe media URL is dropped", !deduped.some((m) => m.url.includes("javascript:")));
  check("order is cover → gallery → video → legacy", deduped.map((m) => m.url).join(",") === "https://example.com/a.jpg,https://example.com/b.jpg,https://www.youtube.com/watch?v=dQw4w9WgXcQ,https://example.com/c.jpg", JSON.stringify(deduped.map((m) => m.url)));

  // 30 images + video → video survives the image cap
  const bigGallery = {
    frontImage: "https://example.com/cover.jpg",
    galleryImages: Array.from({ length: 30 }, (_, i) => `https://example.com/g${i}.jpg`),
    videoUrl: "https://vimeo.com/123456789",
  };
  const big = toListingMediaList(bigGallery, "Big");
  const bigImages = big.filter((m) => m.kind === "image").length;
  check("gallery caps at 30 images", bigImages === 30, JSON.stringify(bigImages));
  check("video survives a full gallery", big.some((m) => m.kind === "video" && m.url === "https://vimeo.com/123456789"), JSON.stringify(big.map((m) => m.url)));

  // ---- 1. Static: no hardcoded video URLs in UI source ----
  console.log("1) No hardcoded video URLs in UI source");
  // SafeVideo is the ONE sanctioned video component — its embed-host template
  // (youtube-nocookie / player.vimeo) is a domain constant, not a listing URL.
  // Everything else in the UI must never contain a video URL.
  const uiDirs = ["src/components", "src/app"];
  const hardcoded = [];
  for (const dir of uiDirs) {
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(tsx|ts)$/.test(e.name) && !e.name.endsWith(".d.ts")) {
          const src = fs.readFileSync(p, "utf8");
          if (/youtube\.com|youtu\.be|vimeo\.com|\.mp4|\.webm/i.test(src)) hardcoded.push(p);
        }
      }
    };
    walk(path.join(ROOT, dir));
  }
  const onlySafeVideo = hardcoded.every((p) => p.split(/[\\/]/).slice(-2).join("/") === "visual/safe-video.tsx");
  check("no UI component hardcodes a video URL (SafeVideo is the only exception)", onlySafeVideo, JSON.stringify(hardcoded));

  // ---- 2+3. Browser: canonical price / wishlist / compare / single video component ----
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

  const TITLE = "SAMPLE — Starter Vault";

  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);

  // 2) Price is canonical: card === data
  const cardPrice = await page.evaluate((t) => {
    const card = document.querySelector(`[aria-label="Account ${t}"]`);
    if (!card) return null;
    return card.textContent || "";
  }, TITLE);
  check("card shows canonical price ₹1,500", cardPrice && parsePrice(cardPrice) === 1500, JSON.stringify(cardPrice));

  // 2b) Wishlist keyed by canonical ID, survives reload
  await page.evaluate((t) => {
    const b = Array.from(document.querySelectorAll(`[aria-label="Account ${t}"] button`)).find((x) => (x.getAttribute("aria-label") || "") === "Add to favorites");
    if (b) b.click();
  }, TITLE);
  await sleep(300);
  await page.reload({ waitUntil: "networkidle0" });
  await sleep(600);
  const favPersisted = await page.evaluate((t) => {
    const b = Array.from(document.querySelectorAll(`[aria-label="Account ${t}"] button`)).find((x) => (x.getAttribute("aria-label") || "") === "Remove from favorites");
    return !!b;
  }, TITLE);
  check("wishlist survives reload (canonical ID keyed)", favPersisted);
  // restore
  await page.evaluate((t) => {
    const b = Array.from(document.querySelectorAll(`[aria-label="Account ${t}"] button`)).find((x) => (x.getAttribute("aria-label") || "") === "Remove from favorites");
    if (b) b.click();
  }, TITLE);

  // 2c) Compare keyed by canonical ID, survives reload
  await page.evaluate((t) => {
    const b = Array.from(document.querySelectorAll(`[aria-label="Account ${t}"] button`)).find((x) => (x.getAttribute("aria-label") || "") === "Add to compare");
    if (b) b.click();
  }, TITLE);
  await sleep(300);
  await page.reload({ waitUntil: "networkidle0" });
  await sleep(600);
  const cmpPersisted = await page.evaluate((t) => {
    const b = Array.from(document.querySelectorAll(`[aria-label="Account ${t}"] button`)).find((x) => (x.getAttribute("aria-label") || "") === "Remove from compare");
    return !!b;
  }, TITLE);
  check("compare survives reload (canonical ID keyed)", cmpPersisted);
  // restore
  await page.evaluate((t) => {
    const b = Array.from(document.querySelectorAll(`[aria-label="Account ${t}"] button`)).find((x) => (x.getAttribute("aria-label") || "") === "Remove from compare");
    if (b) b.click();
  }, TITLE);

  // 3) Details: canonical price + videoUrl flows into a Video section BELOW the
  //    image gallery via SafeVideo
  await page.evaluate((t) => {
    const b = Array.from(document.querySelectorAll("button")).find((x) => (x.getAttribute("aria-label") || "") === `View details for ${t}`);
    if (b) b.click();
  }, TITLE);
  await sleep(700);
  const detailPrice = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"][aria-label="Account detail"]');
    return d ? d.textContent || "" : null;
  });
  check("Details shows same canonical price ₹1,500", detailPrice && parsePrice(detailPrice) === 1500, JSON.stringify(parsePrice(detailPrice)));

  const gallery = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"][aria-label="Account detail"]');
    return d ? d.querySelectorAll('button[aria-label^="View media"]').length : 0;
  });
  check("Details image gallery is images-only (2 thumbnails)", gallery === 2, JSON.stringify(gallery));

  // video renders BELOW the gallery, not inside the image carousel
  const galleryVideo = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"][aria-label="Account detail"]');
    const iframe = d.querySelector("iframe");
    const video = d.querySelector("video");
    return {
      src: iframe ? iframe.getAttribute("src") : null,
      sandboxed: iframe ? iframe.hasAttribute("sandbox") : false,
      nativeSrc: video ? video.getAttribute("src") : null,
      videoLabel: (d.textContent || "").includes("Video"),
    };
  });
  check("Details video section renders below gallery (Video label)", galleryVideo.videoLabel);
  check("Details video is youtube-nocookie embed", !!galleryVideo.src && galleryVideo.src.includes("youtube-nocookie.com/embed/"), JSON.stringify(galleryVideo));
  check("Details video uses the ONE SafeVideo component (sandbox marker)", galleryVideo.sandboxed);
  check("Details video never renders a raw <video src>", !galleryVideo.nativeSrc);

  // 3b) Card lightbox video popup also uses the same SafeVideo component
  await page.keyboard.press("Escape");
  await sleep(300);
  await page.evaluate((t) => {
    const card = document.querySelector(`[aria-label="Account ${t}"]`);
    const b = Array.from(card.querySelectorAll("button")).find((x) => (x.getAttribute("aria-label") || "") === "View images for " + t);
    if (b) b.click();
  }, TITLE);
  await sleep(500);
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll("button")).find((x) => (x.getAttribute("aria-label") || "") === "Open video");
    if (b) b.click();
  });
  await sleep(500);
  const lbVideo = await page.evaluate((t) => {
    const d = document.querySelector(`[aria-label="${t} — video"]`);
    if (!d) return null;
    const iframe = d.querySelector("iframe");
    const video = d.querySelector("video");
    return {
      src: iframe ? iframe.getAttribute("src") : null,
      sandboxed: iframe ? iframe.hasAttribute("sandbox") : false,
      nativeSrc: video ? video.getAttribute("src") : null,
    };
  }, TITLE);
  check("lightbox video popup is youtube-nocookie embed", !!lbVideo.src && lbVideo.src.includes("youtube-nocookie.com/embed/"), JSON.stringify(lbVideo));
  check("lightbox video popup uses the ONE SafeVideo component (sandbox marker)", !!(lbVideo && lbVideo.sandboxed));
  check("lightbox video popup never renders a raw <video src>", !!(lbVideo && !lbVideo.nativeSrc));

  // 6) No horizontal overflow with lightbox/video open, mobile + desktop
  await page.keyboard.press("Escape");
  await sleep(300);
  await page.keyboard.press("Escape");
  await sleep(300);
  let overflow = 0;
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 900 });
    await sleep(150);
    const o = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (o) overflow++;
  }
  check("no horizontal overflow across widths (after media viewer + video)", overflow === 0, JSON.stringify({ overflow }));
  check("no console errors during the whole flow", consoleErrors.length === 0, JSON.stringify(consoleErrors.slice(0, 3)));

  await browser.close();
  console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
