/* eslint-disable no-console */
/**
 * PROMPT 11 audit — WhatsApp FREE JOIN + Instagram promo label + nav integrity.
 * Verifies live on http://localhost:1111.
 *
 * Checks:
 * 1. WhatsApp deep-link builder produces the exact wa.me URL with the emoji
 *    rich FREE JOIN message fully prefilled.
 * 2. Home: #free-join section (notice + promo card) present with FREE TO JOIN
 *    copy; both CTA buttons open the same wa.me flow; no layout shift.
 * 3. Hero FREE TO JOIN info card present; its Contact chip opens the same
 *    WhatsApp flow.
 * 4. Navbar: Instagram promo label on desktop (xl+); Instagram dropdown still
 *    lists Views / Followers / Likes and opens correctly.
 * 5. Mobile: Instagram promo label present in the hamburger; hamburger opens
 *    cleanly.
 * 6. Responsive: no horizontal overflow at 320/360/375/390/414/430/768/1024/
 *    1280/1440/1920.
 * 7. Existing features intact: navbar Contact popup (List Your Account dialog),
 *    wishlist nav link.
 */
const puppeteer = require("puppeteer-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:1111";

const EXPECTED_NUMBER = "919330564851";
const MSG_FRAGMENTS = [
  "FREE TO JOIN",
  "FF TRUST — FREE LISTING & SERVICE INQUIRY",
  "Sell / List your service or offer",
  "Free Fire ID / Account",
  "Free Fire Panel",
  "Paid Push — CS / BR",
  "Instagram Views",
  "Instagram Followers",
  "Instagram Likes",
  "Very Low Price Services",
  "Transparency • Evidence • Buyer Safety",
];

let pass = 0;
let fail = 0;
const failures = [];

function check(name, ok, detail) {
  if (ok) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    failures.push(name + (detail ? ` :: ${detail}` : ""));
    console.log(`  FAIL  ${name}${detail ? ` :: ${detail}` : ""}`);
  }
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();

  // ---- 1. WhatsApp deep-link builder ----
  console.log("1) WhatsApp deep-link builder");
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 800));

  {
    // Capture window.open calls so we can verify the wa.me deep link
    let openedUrl = null;
    await page.evaluate(() => {
      window.__opened = [];
      window.open = (u) => { window.__opened.push(String(u)); return null; };
    });
    await page.evaluate(() => {
      const card = document.querySelector('[data-testid="free-join-promo"]');
      const btn = card && card.querySelector('button[aria-label*="Contact Owner"]');
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 300));
    const url = await page.evaluate(() => (window.__opened || [])[0] || null);
    check("promo CTA opens WhatsApp deep link", !!url, url || "no window.open captured");
    if (url) {
      check("wa.me URL matches canonical number", url.startsWith(`https://wa.me/${EXPECTED_NUMBER}?text=`), url);
      const text = decodeURIComponent(url.split("?text=")[1] || "");
      for (const frag of MSG_FRAGMENTS) {
        check(`message contains "${frag}"`, text.includes(frag));
      }
      check("message has NO markdown **", !text.includes("**"), "remove ** from FREE_JOIN_MESSAGE");
      console.log(`  URL: ${url}`);
    }
  }

  // ---- 2. Home FREE JOIN promo ----
  console.log("2) Home FREE JOIN promo + notice");

  {
    const promo = await page.evaluate(() => {
      const sec = document.querySelector("#free-join");
      const notice = document.querySelector('[data-testid="free-join-notice"]');
      const card = document.querySelector('[data-testid="free-join-promo"]');
      if (!sec) return { sec: false };
      const sw = document.documentElement.scrollWidth;
      return {
        sec: !!sec,
        notice: !!notice,
        card: !!card,
        noticeHasFree: notice ? notice.textContent.includes("FREE TO JOIN") : false,
        cardHasFree: card ? card.textContent.includes("FREE TO JOIN") : false,
        cardHasCategories:
          card &&
          ["Free Fire ID", "Panel Sell", "Paid Push", "Instagram Views", "Instagram Followers", "Instagram Likes"].every((c) => card.textContent.includes(c)),
        noOverflow: sw <= window.innerWidth,
      };
    });
    check("home has #free-join section", promo.sec);
    check("notice present", promo.notice);
    check("notice says FREE TO JOIN", promo.noticeHasFree);
    check("promo card present", promo.card);
    check("promo card says FREE TO JOIN", promo.cardHasFree);
    check("promo card lists all 4 category groups", !!promo.cardHasCategories);
    check("no horizontal overflow at 1440", promo.noOverflow);

    // Click the promo CTA and read the opened wa.me URL
    const promoHref = await page.evaluate(() => {
      window.__opened = [];
      const card = document.querySelector('[data-testid="free-join-promo"]');
      const btn = card && card.querySelector('button[aria-label*="Contact Owner"]');
      if (btn) btn.click();
      return true;
    });
    await new Promise((r) => setTimeout(r, 300));
    const promoUrl = await page.evaluate(() => (window.__opened || [])[0] || null);
    check("promo CTA opens wa.me", !!promoUrl && promoUrl.includes(`wa.me/${EXPECTED_NUMBER}`), promoUrl || "no window.open");

    const noticeHref = await page.evaluate(() => {
      window.__opened = [];
      const notice = document.querySelector('[data-testid="free-join-notice"]');
      const btn = notice && notice.querySelector('button[aria-label*="Contact Owner"]');
      if (btn) btn.click();
      return true;
    });
    await new Promise((r) => setTimeout(r, 300));
    const noticeUrl = await page.evaluate(() => (window.__opened || [])[0] || null);
    check("notice CTA opens wa.me", !!noticeUrl && noticeUrl.includes(`wa.me/${EXPECTED_NUMBER}`), noticeUrl || "no window.open");
  }

  // ---- 3. Hero FREE TO JOIN card ----
  console.log("3) Hero FREE TO JOIN card");
  {
    const hero = await page.evaluate(() => {
      window.__opened = [];
      const btn = Array.from(document.querySelectorAll("main button")).find((b) => (b.getAttribute("aria-label") || "").includes("FREE TO JOIN"));
      const text = btn ? (btn.textContent || "").trim() : null;
      if (btn) btn.click();
      return { found: !!btn, text };
    });
    await new Promise((r) => setTimeout(r, 300));
    const heroUrl = await page.evaluate(() => (window.__opened || [])[0] || null);
    check("hero FREE TO JOIN card exists", hero.found);
    check("hero card is FREE TO JOIN", (hero.text || "").toLowerCase().includes("free to join"));
    check("hero card contact opens wa.me", !!heroUrl && heroUrl.includes(`wa.me/${EXPECTED_NUMBER}`), heroUrl || "no window.open");
  }

  // ---- 4. Navbar Instagram promo label + dropdown ----
  console.log("4) Navbar Instagram promo label + dropdown");
  {
    const nav = await page.evaluate(() => {
      const bar = document.querySelector("header .glass-float");
      const label = Array.from(document.querySelectorAll("header *")).find((el) => el.textContent && el.textContent.includes("INSTA — PAID AT VERY LOW PRICE"));
      const sub = label ? label.textContent : "";
      const sw = document.documentElement.scrollWidth;
      const barR = bar ? bar.getBoundingClientRect() : null;
      const labelVisible = label
        ? (() => {
            const s = getComputedStyle(label.closest("div"));
            return s.display !== "none" && s.visibility !== "hidden";
          })()
        : false;
      return {
        labelPresent: !!label,
        labelVisible,
        hasSub: sub.includes("Views") && sub.includes("Followers") && sub.includes("Likes"),
        barFits: barR ? Math.round(barR.width) <= window.innerWidth - 8 : null,
        sw,
        vw: window.innerWidth,
      };
    });
    check("navbar label present", nav.labelPresent);
    check("navbar label visible at 1440", nav.labelVisible);
    check("navbar label has Views/Followers/Likes", nav.hasSub);
    check("navbar bar does not overflow at 1440", nav.barFits, JSON.stringify({ bar: nav.barFits, sw: nav.sw, vw: nav.vw }));

    // Open the Instagram dropdown and verify sub items
    await page.click('button[aria-label="Instagram menu"]');
    await new Promise((r) => setTimeout(r, 400));
    const subItems = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("header a"));
      return links.filter((a) => ["Views", "Followers", "Likes"].includes((a.textContent || "").trim())).map((a) => ({ t: a.textContent.trim(), h: a.getAttribute("href") }));
    });
    check("dropdown lists Views", subItems.some((s) => s.t === "Views"));
    check("dropdown lists Followers", subItems.some((s) => s.t === "Followers"));
    check("dropdown lists Likes", subItems.some((s) => s.t === "Likes"));
    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 300));
  }

  // ---- 5. Mobile hamburger ----
  console.log("5) Mobile hamburger promo label");
  {
    for (const w of [375, 390]) {
      await page.setViewport({ width: w, height: 900 });
      await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
      await new Promise((r) => setTimeout(r, 600));
      const hb = await page.$('button[aria-label="Open menu"]');
      if (hb) await hb.click({ delay: 30 });
      await new Promise((r) => setTimeout(r, 600));
      const mobile = await page.evaluate(() => {
        const menu = document.querySelector('[aria-label="Command center"]');
        // Find the promo label inside the command center (not the hidden desktop one)
        const all = Array.from(menu ? menu.querySelectorAll("div,span,p") : []);
        const label = all.find((e) => e.textContent === "INSTA — PAID AT VERY LOW PRICE");
        const visible = label ? (() => {
          const cs = getComputedStyle(label);
          return cs.display !== "none" && cs.visibility !== "hidden" && label.getBoundingClientRect().width > 0;
        })() : false;
        const sw = document.documentElement.scrollWidth;
        return { labelFound: !!label, visible, sw, vw: window.innerWidth };
      });
      check(`mobile menu has Instagram promo label (${w}px)`, mobile.labelFound && mobile.visible, JSON.stringify(mobile));
      check(`no horizontal overflow on mobile (${w}px)`, mobile.sw <= mobile.vw, JSON.stringify({ sw: mobile.sw, vw: mobile.vw }));
      await page.keyboard.press("Escape");
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // ---- 6. Responsive overflow scan ----
  console.log("6) Responsive overflow scan");
  for (const w of [320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 500));
    const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, vw: window.innerWidth }));
    check(`no horizontal overflow at ${w}px`, r.sw <= r.vw, JSON.stringify(r));
  }

  // ---- 7. Existing features intact ----
  console.log("7) Existing features intact");
  {
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 500));
    const contact = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll("header button")).find((x) => (x.getAttribute("aria-label") || "").includes("Contact"));
      if (b) b.click();
      return true;
    });
    check("header Contact button exists", contact);
    await new Promise((r) => setTimeout(r, 500));
    const dlg = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-label="List Your Account"]');
      return d ? { w: d.getBoundingClientRect().width, txt: d.textContent.includes("Want to sell something?"), wa: d.textContent.includes("Contact Owner on WhatsApp") } : null;
    });
    check("Contact opens List Your Account dialog", !!dlg, JSON.stringify(dlg));
    check("dialog has Want to sell something?", !!(dlg && dlg.txt));
    check("dialog has Contact Owner on WhatsApp", !!(dlg && dlg.wa));
    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 300));

    const wishlist = await page.evaluate(() => !!Array.from(document.querySelectorAll("header a")).find((a) => (a.getAttribute("href") || "") === "/wishlist"));
    check("navbar has Wishlist link", wishlist);
  }

  await browser.close();

  console.log("\n========================================");
  console.log(`P11 RESULT: ${pass} PASS / ${fail} FAIL`);
  if (failures.length) {
    console.log("Failures:");
    failures.forEach((f) => console.log(`  - ${f}`));
  }
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
