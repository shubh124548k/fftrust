/* eslint-disable no-console */
/**
 * PROMPT 12 audit — Premium Details + Buyer Proof + media viewer + Proof page.
 * Verifies live on http://localhost:1111.
 *
 * Checks:
 * 1. Account Details opens/closes from a card (dialog, scroll-lock, Escape).
 * 2. Media gallery: up to 30-image stage, thumbnails, counter, prev/next,
 *    fullscreen lightbox, keyboard, scroll-lock release.
 * 3. Video: YouTube/Vimeo embed via youtube-nocookie rendered BELOW the image
 *    gallery (no autoplay, no native broken <video src>).
 * 4. WhatsApp auto-inquiry from Details carries canonical id/title/price +
 *    Category + Buyer Proof lines (recording reminder + never-share).
 * 5. Service Details (Panel + Paid Push) show the BuyerProofPanel and send
 *    category-aware WhatsApp with buyer-proof lines.
 * 6. Instagram order modal shows the BuyerProofPanel.
 * 7. Homepage #buyer-safety section + footer Buyer Proof → /proof link.
 * 8. PROOF nav link on desktop + inside the mobile hamburger menu.
 * 9. /proof page renders every canonical proofContent.section + keep-recording
 *    checklist + never-share list + independent disclaimer + metadata.
 * 10. CSP header allows youtube-nocookie + player.vimeo frame-src.
 * 11. Responsive: no horizontal overflow on / and /proof at the full width set.
 * 12. No console errors during any interaction.
 */
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

const ARCHITECT = "SAMPLE — Architect Account";
const STARTER = "SAMPLE — Starter Vault";
const PANEL = "SAMPLE — Diamond Panel (Streaming)";

const PROOF_SECTION_TITLES = [
  "Why screen recording matters",
  "When to start recording",
  "Keep recording during verification",
  "Keep recording during the transaction",
  "WhatsApp, video meeting or screen sharing",
  "What evidence to preserve",
  "What NOT to share",
  "Platform limitations",
  "Buyer responsibilities",
  "Seller responsibilities",
  "Evidence and provenance",
  "Independent platform disclaimer",
  "What verification involves",
  "Transaction safety",
  "Scam prevention",
  "Impersonation warning",
  "Recovery & account-transfer safety",
  "Dispute evidence",
];

const PROOF_KEEP_RECORDING = [
  "Before verification or purchase — start recording first",
  "Throughout verification (walkthrough, live checks, shared screen)",
  "Throughout the transaction and delivery",
  "Until every step is complete",
];

const PROOF_DONT_SHARE = [
  "Your password",
  "One-time passwords (OTPs)",
  "Recovery / backup codes",
  "Private credentials of any kind",
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
    executablePath: BROWSER,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  const consoleErrors = [];

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push("console: " + msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push("pageerror: " + String(err)));

  // ---------------------------------------------------------------
  // 1) Account Details open/close
  // ---------------------------------------------------------------
  console.log("1) Account Details open/close");
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);

  await page.evaluate((t) => {
    window.__opened = [];
    window.open = (u) => { window.__opened.push(String(u)); return null; };
    const b = Array.from(document.querySelectorAll("button")).find((x) => (x.getAttribute("aria-label") || "") === `View details for ${t}`);
    if (b) b.click();
  }, ARCHITECT);
  await sleep(700);

  {
    const dlg = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-label="Account detail"]');
      if (!d) return null;
      const t = d.textContent || "";
      return {
        title: t.includes("SAMPLE — Architect Account"),
        id: t.includes("SAMPLE-ACC-001"),
        region: t.includes("India"),
        category: t.includes("battleground"),
        price: t.includes("₹4,200") || t.includes("₹4200"),
        sample: t.includes("SAMPLE"),
        scrollLocked: document.body.style.overflow === "hidden",
        proof: t.includes("KEEP SCREEN RECORDING ON"),
      };
    });
    check("account dialog opens", !!dlg, "no [role=dialog][aria-label=Account detail]");
    check("dialog shows title", !!(dlg && dlg.title));
    check("dialog shows id", !!(dlg && dlg.id));
    check("dialog shows region", !!(dlg && dlg.region));
    check("dialog shows category", !!(dlg && dlg.category));
    check("dialog shows price", !!(dlg && dlg.price));
    check("dialog shows SAMPLE chip", !!(dlg && dlg.sample));
    check("dialog shows BuyerProofPanel", !!(dlg && dlg.proof));
    check("body scroll locked while open", !!(dlg && dlg.scrollLocked));
  }

  await page.keyboard.press("Escape");
  await sleep(400);
  {
    const closed = await page.evaluate(() => ({
      gone: !document.querySelector('[role="dialog"][aria-label="Account detail"]'),
      scrollRestored: document.body.style.overflow !== "hidden",
    }));
    check("Escape closes account dialog", closed.gone);
    check("body scroll restored after close", closed.scrollRestored);
  }

  // ---------------------------------------------------------------
  // 2) Media gallery — 5-image account
  // ---------------------------------------------------------------
  console.log("2) Media gallery (Architect, 5 images)");
  await page.evaluate((t) => {
    const b = Array.from(document.querySelectorAll("button")).find((x) => (x.getAttribute("aria-label") || "") === `View details for ${t}`);
    if (b) b.click();
  }, ARCHITECT);
  await sleep(600);

  {
    const g = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-label="Account detail"]');
      if (!d) return null;
      const spans = Array.from(d.querySelectorAll("span")).map((s) => s.textContent || "");
      return {
        thumbs: d.querySelectorAll('button[aria-label^="View media"]').length,
        counter: spans.find((s) => /^\d+ \/ \d+$/.test(s)) || null,
      };
    });
    check("gallery renders 5 thumbnails", g && g.thumbs === 5, JSON.stringify(g));
    check("counter starts at 1 / 6 (5 images + video)", g && g.counter === "1 / 6", JSON.stringify(g));
  }

  await page.click('button[aria-label="Next media"]');
  await sleep(250);
  let counter = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"][aria-label="Account detail"]');
    const spans = Array.from(d.querySelectorAll("span")).map((s) => s.textContent || "");
    return spans.find((s) => /^\d+ \/ \d+$/.test(s)) || null;
  });
  check("Next media → 2 / 6", counter === "2 / 6", counter || "no counter");

  await page.click('button[aria-label="Previous media"]');
  await sleep(250);
  counter = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"][aria-label="Account detail"]');
    const spans = Array.from(d.querySelectorAll("span")).map((s) => s.textContent || "");
    return spans.find((s) => /^\d+ \/ \d+$/.test(s)) || null;
  });
  check("Previous media → 1 / 6", counter === "1 / 6", counter || "no counter");

  await page.click('button[aria-label="View media 5"]');
  await sleep(250);
  counter = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"][aria-label="Account detail"]');
    const spans = Array.from(d.querySelectorAll("span")).map((s) => s.textContent || "");
    return spans.find((s) => /^\d+ \/ \d+$/.test(s)) || null;
  });
  check("thumbnail 5 → 5 / 6", counter === "5 / 6", counter || "no counter");

  // Lightbox
  await page.click('button[aria-label="Open fullscreen"]');
  await sleep(500);
  {
    const lb = await page.evaluate((t) => {
      const d = document.querySelector(`[aria-label="${t} — fullscreen gallery"]`);
      if (!d) return null;
      return {
        imgs: d.querySelectorAll("img").length,
        counter: /(\d+) \/ (\d+) · Escape to close/.exec(d.textContent || "")?.[0] || null,
        locked: document.body.style.overflow === "hidden",
      };
    }, ARCHITECT);
    check("lightbox opens with aria-label", !!lb);
    check("lightbox displays the active image", lb && lb.imgs === 1, JSON.stringify(lb));
    check("lightbox counter 5 / 6", lb && lb.counter === "5 / 6 · Escape to close", JSON.stringify(lb));
    check("lightbox locks scroll", lb && lb.locked);
  }
  await page.keyboard.press("Escape");
  await sleep(400);
  {
    const after = await page.evaluate((t) => ({
      lbGone: !document.querySelector(`[aria-label="${t} — fullscreen gallery"]`),
      detailStillOpen: !!document.querySelector('[role="dialog"][aria-label="Account detail"]'),
      scrollRestored: document.body.style.overflow !== "hidden",
    }), ARCHITECT);
    check("Escape closes lightbox only", after.lbGone && after.detailStillOpen);
    check("scroll restored after lightbox close", after.scrollRestored);
  }
  await page.keyboard.press("Escape");
  await sleep(300);

  // ---------------------------------------------------------------
  // 3) Video embed (Starter Vault, 2 images + YouTube below gallery)
  // ---------------------------------------------------------------
  console.log("3) Video embed — below gallery, no autoplay, youtube-nocookie");
  await page.evaluate((t) => {
    const b = Array.from(document.querySelectorAll("button")).find((x) => (x.getAttribute("aria-label") || "") === `View details for ${t}`);
    if (b) b.click();
  }, STARTER);
  await sleep(600);

  {
    const g = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-label="Account detail"]');
      const spans = Array.from(d.querySelectorAll("span")).map((s) => s.textContent || "");
      return {
        thumbs: d.querySelectorAll('button[aria-label^="View media"]').length,
        counter: spans.find((s) => /^\d+ \/ \d+$/.test(s)) || null,
        videoTile: Array.from(d.querySelectorAll("button")).some((b) => (b.getAttribute("aria-label") || "").startsWith("Play video")),
        videoLabel: (d.textContent || "").includes("Video"),
        iframes: d.querySelectorAll("iframe").length,
      };
    });
    check("video account gallery is images-only (2 thumbnails)", g && g.thumbs === 2, JSON.stringify(g));
    check("image counter starts at 1 / 3 (2 images + video)", g && g.counter === "1 / 3", JSON.stringify(g));
    check("video appears as a gallery tile (Play video button)", g && g.videoTile, JSON.stringify(g));
  }

  // activate the video tile → SafeVideo mounts the embed inside the same gallery
  await page.click('button[aria-label^="Play video"]');
  await sleep(600);

  {
    const v = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-label="Account detail"]');
      const iframe = d.querySelector("iframe");
      const video = d.querySelector("video");
      return {
        iframeSrc: iframe ? iframe.getAttribute("src") : null,
        nativeVideoSrc: video ? video.getAttribute("src") : null,
        autoplayParam: iframe ? (iframe.getAttribute("src") || "").includes("autoplay") : false,
      };
    });
    check("exactly one video iframe (gallery tile active)", !!v.iframeSrc && !v.nativeVideoSrc, JSON.stringify(v));
    check("video renders as youtube-nocookie iframe", !!v.iframeSrc && v.iframeSrc.includes("youtube-nocookie.com/embed/"), JSON.stringify(v));
    check("no native <video src> (no broken tile)", !v.nativeVideoSrc);
    check("no autoplay parameter", !v.autoplayParam);
  }

  // return to the first image slide so the fullscreen lightbox opens on an image
  await page.click('button[aria-label="View media 1"]');
  await sleep(300);

  await page.click('button[aria-label="Open fullscreen"]');
  await sleep(500);
  {
    const lb = await page.evaluate((t) => {
      const d = document.querySelector(`[aria-label="${t} — fullscreen gallery"]`);
      if (!d) return null;
      return {
        imgs: d.querySelectorAll("img").length,
        iframes: d.querySelectorAll("iframe").length,
        nativeVideos: d.querySelectorAll("video").length,
      };
    }, STARTER);
    check("lightbox shows the active image", !!lb && lb.imgs === 1, JSON.stringify(lb));
    check("lightbox is images-only (no video iframe)", !!lb && lb.iframes === 0, JSON.stringify(lb));
    check("lightbox has no native <video>", !!lb && lb.nativeVideos === 0, JSON.stringify(lb));
  }
  await page.keyboard.press("Escape");
  await sleep(300);
  await page.keyboard.press("Escape");
  await sleep(300);

  // ---------------------------------------------------------------
  // 4) WhatsApp auto-inquiry from account Details
  // ---------------------------------------------------------------
  console.log("4) WhatsApp auto-inquiry (account)");
  await page.evaluate((t) => {
    window.__opened = [];
    const b = Array.from(document.querySelectorAll("button")).find((x) => (x.getAttribute("aria-label") || "") === `View details for ${t}`);
    if (b) b.click();
  }, ARCHITECT);
  await sleep(600);
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"][aria-label="Account detail"]');
    const btn = Array.from(d.querySelectorAll("button")).find((b) => (b.textContent || "").includes("Inquire on WhatsApp"));
    if (btn) btn.click();
  });
  await sleep(400);
  const waUrl = await page.evaluate(() => (window.__opened || [])[0] || null);
  check("dossier WhatsApp opens wa.me", !!waUrl && waUrl.includes("wa.me/"), waUrl || "no window.open");
  if (waUrl) {
    const text = decodeURIComponent(waUrl.split("?text=")[1] || "");
    const frags = {
      "Ref: SAMPLE-ACC-001": "Ref: SAMPLE-ACC-001",
      "Category: battleground": "Category: battleground",
      "Item: SAMPLE — Architect Account": "Item: SAMPLE — Architect Account",
      "Listed price: ₹4200 INR": "Listed price: ₹4200 INR",
      "Inquiry line": "Interested in this account. Please share more detail.",
      "TURN ON SCREEN RECORDING": "TURN ON SCREEN RECORDING",
      "KEEP SCREEN RECORDING ON": "KEEP SCREEN RECORDING ON",
      "Never-send line": "Never send passwords, OTPs, recovery codes or other sensitive credentials through FF TRUST.",
      "Buyer Proof line": "Buyer Proof: KEEP SCREEN RECORDING ON — never share passwords, OTPs or recovery codes.",
      "Independence footer": "(Sent via FF TRUST — independent platform.)",
    };
    for (const [label, frag] of Object.entries(frags)) {
      check(`wa message has ${label}`, text.includes(frag));
    }
  }
  await page.keyboard.press("Escape");
  await sleep(300);

  // ---------------------------------------------------------------
  // 5) Service Details (Panel + Paid Push) BuyerProofPanel + WA
  // ---------------------------------------------------------------
  console.log("5) Service Details (Panel)");
  await page.goto(`${BASE}/services`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  await page.evaluate((t) => {
    window.__opened = [];
    window.open = (u) => { window.__opened.push(String(u)); return null; };
    const b = Array.from(document.querySelectorAll("button")).find((x) => (x.getAttribute("aria-label") || "") === `View details for ${t}`);
    if (b) b.click();
  }, PANEL);
  await sleep(700);
  {
    const s = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-label="Service detail"]');
      if (!d) return null;
      const t = d.textContent || "";
      return {
        title: t.includes("SAMPLE — Diamond Panel (Streaming)"),
        id: t.includes("SAMPLE-SVC-PANEL-001"),
        proof: t.includes("KEEP SCREEN RECORDING ON"),
        scrollLocked: document.body.style.overflow === "hidden",
      };
    });
    check("service dialog opens", !!s);
    check("service dialog shows title", !!(s && s.title));
    check("service dialog shows id", !!(s && s.id));
    check("service dialog shows BuyerProofPanel", !!(s && s.proof));
    check("service dialog locks scroll", !!(s && s.scrollLocked));

    const btn = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-label="Service detail"]');
      const b = Array.from(d.querySelectorAll("button")).find((x) => (x.textContent || "").includes("Inquire on WhatsApp"));
      if (b) b.click();
      return !!b;
    });
    await sleep(400);
    const swa = await page.evaluate(() => (window.__opened || [])[0] || null);
    check("service Inquire on WhatsApp exists", btn);
    if (swa) {
      const text = decodeURIComponent(swa.split("?text=")[1] || "");
      check("service wa has Category: panel", text.includes("Category: panel"));
      check("service wa has Item title", text.includes("Item: SAMPLE — Diamond Panel (Streaming)"));
      check("service wa has Ref", text.includes("Ref: SAMPLE-SVC-PANEL-001"));
      check("service wa has Listed price ₹699", text.includes("Listed price: ₹699 INR"));
      check("service wa has Package (mode)", text.includes("Package: panel"));
      check("service wa has buyer-proof TURN ON SCREEN RECORDING", text.includes("TURN ON SCREEN RECORDING"));
      check("service wa has Buyer Proof line", text.includes("Buyer Proof: KEEP SCREEN RECORDING ON"));
    } else {
      check("service wa opens wa.me", !!swa, "no window.open captured");
    }
  }
  await page.keyboard.press("Escape");
  await sleep(300);

  // ---------------------------------------------------------------
  // 6) Instagram order modal BuyerProofPanel
  // ---------------------------------------------------------------
  console.log("6) Instagram order modal BuyerProofPanel");
  await page.goto(`${BASE}/instagram/views`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) => (b.textContent || "").includes("Order Now"));
    if (btn) btn.click();
  });
  await sleep(600);
  {
    const m = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-label="Order"][aria-modal="true"]') ||
        Array.from(document.querySelectorAll('[role="dialog"]')).find((el) => (el.textContent || "").includes("Order"));
      if (!d) return null;
      return {
        order: (d.textContent || "").includes("Order"),
        proof: (d.textContent || "").includes("KEEP SCREEN RECORDING ON"),
      };
    });
    check("order modal opens", !!m);
    check("order modal has BuyerProofPanel", !!(m && m.proof), JSON.stringify(m));
  }
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    if (d) {
      const btn = Array.from(d.querySelectorAll("button")).find((b) => (b.getAttribute("aria-label") || "") === "Close");
      if (btn) btn.click();
    }
  });
  await sleep(300);

  // ---------------------------------------------------------------
  // 7) Homepage #buyer-safety + footer link
  // ---------------------------------------------------------------
  console.log("7) Homepage buyer-safety + footer link");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  {
    const s = await page.evaluate(() => {
      const sec = document.querySelector("#buyer-safety");
      const footer = document.querySelector("footer");
      const links = footer ? Array.from(footer.querySelectorAll('a[href="/proof"]')) : [];
      const strip = links.find((a) => (a.textContent || "").includes("Buyer Proof")) || null;
      return {
        section: !!sec,
        text: sec ? (sec.textContent || "").includes("KEEP SCREEN RECORDING ON") : false,
        footerLink: links.length > 0,
        footerText: !!strip,
        footerHasProofLabel: links.some((a) => (a.textContent || "").trim().toUpperCase() === "PROOF"),
      };
    });
    check("#buyer-safety section exists", s.section);
    check("#buyer-safety shows KEEP SCREEN RECORDING ON", s.text);
    check("footer has /proof link", s.footerLink);
    check("footer safety strip says Buyer Proof", s.footerText);
    check("footer nav also lists PROOF", s.footerHasProofLabel);
  }

  // ---------------------------------------------------------------
  // 8) PROOF nav link (desktop + mobile)
  // ---------------------------------------------------------------
  console.log("8) PROOF nav link");
  {
    const d = await page.evaluate(() => {
      const a = Array.from(document.querySelectorAll("header a")).find((x) => (x.getAttribute("href") || "") === "/proof");
      if (!a) return null;
      const r = a.getBoundingClientRect();
      const cs = getComputedStyle(a);
      return {
        text: (a.textContent || "").trim(),
        visible: cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0,
        href: a.getAttribute("href"),
      };
    });
    check("desktop nav has PROOF link", !!d && d.href === "/proof" && d.visible, JSON.stringify(d));
    check("nav link labeled PROOF", !!(d && (d.text || "").toUpperCase() === "PROOF"), JSON.stringify(d));
  }

  await page.setViewport({ width: 375, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  const hb = await page.$('button[aria-label="Open menu"]');
  if (hb) await hb.click({ delay: 30 });
  await sleep(600);
  {
    const m = await page.evaluate(() => {
      const menu = document.querySelector('[aria-label="Command center"]');
      const a = menu && Array.from(menu.querySelectorAll("a")).find((x) => (x.getAttribute("href") || "") === "/proof");
      return {
        menu: !!menu,
        link: !!a,
        text: a ? (a.textContent || "").trim() : null,
      };
    });
    check("mobile menu exists", m.menu);
    check("mobile menu has PROOF link", m.link, JSON.stringify(m));
    check("mobile PROOF labeled PROOF", m.text && m.text.toUpperCase() === "PROOF", JSON.stringify(m));
  }
  await page.keyboard.press("Escape");
  await sleep(200);

  // ---------------------------------------------------------------
  // 9) /proof page
  // ---------------------------------------------------------------
  console.log("9) /proof page");
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/proof`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  {
    const p = await page.evaluate(() => {
      const t = document.body.textContent || "";
      const back = Array.from(document.querySelectorAll("a")).find((a) => (a.textContent || "").trim() === "Back to home");
      return {
        h1: !!document.querySelector("#proof-title"),
        eyebrow: t.includes("FF TRUST · Buyer proof"),
        backLink: !!back && back.getAttribute("href") === "/",
        panel: t.includes("KEEP SCREEN RECORDING ON"),
        cardCount: document.querySelectorAll("[class*=glass-stack]").length,
      };
    });
    check("/proof loads (title heading)", p.h1);
    check("eyebrow FF TRUST · Buyer proof", p.eyebrow);
    check("Back to home link", p.backLink);
    check("hero BuyerProofPanel present", p.panel);

    const body = await page.evaluate(() => document.body.textContent || "");
    for (const title of PROOF_SECTION_TITLES) {
      check(`/proof has section "${title}"`, body.includes(title));
    }
    for (const item of PROOF_KEEP_RECORDING) {
      check(`/proof keep-recording "${item}"`, body.includes(item));
    }
    for (const item of PROOF_DONT_SHARE) {
      check(`/proof never-share "${item}"`, body.includes(item));
    }
    check("neverSend warning present", body.includes("Never send passwords, OTPs, recovery codes or other sensitive credentials through FF TRUST."));
    check("independent disclaimer present", body.includes("FF TRUST is an independent platform and does not guarantee the underlying transaction."));
  }

  // ---------------------------------------------------------------
  // 10) CSP header
  // ---------------------------------------------------------------
  console.log("10) CSP header");
  const resp = await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  const csp = resp.headers()["content-security-policy"] || "";
  check("CSP header present", csp.length > 0);
  check("CSP frame-src allows youtube-nocookie", csp.includes("https://www.youtube-nocookie.com"));
  check("CSP frame-src allows player.vimeo", csp.includes("https://player.vimeo.com"));

  // ---------------------------------------------------------------
  // 11) Responsive overflow scan on / and /proof
  // ---------------------------------------------------------------
  console.log("11) Responsive overflow scan");
  for (const w of [320, 360, 375, 390, 414, 430, 480, 768, 820, 1024, 1280, 1440, 1920]) {
    for (const path of ["/", "/proof"]) {
      await page.setViewport({ width: w, height: 900 });
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle0", timeout: 60000 });
      await sleep(500);
      const r = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        vw: window.innerWidth,
      }));
      check(`no horizontal overflow ${path} @${w}px`, r.sw <= r.vw, JSON.stringify(r));
    }
  }

  // ---------------------------------------------------------------
  // 12) Console errors
  // ---------------------------------------------------------------
  console.log("12) Console errors");
  check("no console/page errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" | "));

  await browser.close();

  console.log("\n========================================");
  console.log(`P12 RESULT: ${pass} PASS / ${fail} FAIL`);
  if (failures.length) {
    console.log("Failures:");
    failures.forEach((f) => console.log(`  - ${f}`));
  }
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
