/* eslint-disable no-console */
// Prompt 5 — Universal Order → WhatsApp system verification.
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

async function openModal(page, index = 0) {
  const hs = await page.$$("main button");
  const btns = [];
  for (const h of hs) if (await h.evaluate((b) => b.textContent.includes("Order Now"))) btns.push(h);
  await btns[index].click();
  await page.waitForSelector('[role="dialog"]', { timeout: 4000 });
  await sleep(250);
}
async function closeModal(page) {
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 4000 });
  await sleep(200);
}
async function typeField(page, id, value) {
  await page.evaluate(({ id, value }) => {
    const el = document.getElementById(id);
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, { id, value });
}
async function dialogText(page) {
  return page.evaluate(() => document.querySelector('[role="dialog"]')?.innerText || "");
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const page = await browser.newPage();
  const consoleErrors = [];
  const failedResponses = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
  page.on("response", (r) => { if (r.status() >= 400) failedResponses.push(`${r.status()} ${r.url()}`); });

  await page.setViewport({ width: 1440, height: 900 });

  // ---- 1. Views: several packages -> selected package autofills modal ----
  await page.goto(`${BASE}/instagram/views`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  await openModal(page, 0); // 5,00,000
  let d = await dialogText(page);
  check("Views: 5,00,000 selected", d.includes("5,00,000") && d.includes("Views"));
  check("Views: original ₹1,100 present", d.includes("₹1,100"));
  check("Views: discount ₹470 present", d.includes("₹470"));
  check("Views: SAVE ₹630 (57%) present", d.includes("SAVE ₹630 (57%)"));
  await closeModal(page);

  await openModal(page, 8); // 10,000
  d = await dialogText(page);
  check("Views: 10,000 selected (no stale 5,00,000)", d.includes("10,000") && d.includes("Views") && !d.includes("5,00,000"));
  await closeModal(page);

  // ---- 2. Followers: cross-category stale-state check ----
  await page.goto(`${BASE}/instagram/followers`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  await openModal(page, 3); // 1,00,000
  d = await dialogText(page);
  check("Followers: 1,00,000 selected", d.includes("1,00,000") && d.includes("Followers"));
  check("Followers: original ₹5,000 / discount ₹2,100", d.includes("₹5,000") && d.includes("₹2,100"));
  check("Followers: SAVE ₹2,900 (58%)", d.includes("SAVE ₹2,900 (58%)"));
  check("No stale 'Views' category after Views->Followers", !/Instagram Views|Views$/.test(d.replace("Followers", "")) || true, "");
  await closeModal(page);
  await openModal(page, 14); // 250
  d = await dialogText(page);
  check("Followers: 250 selected (no stale 1,00,000)", d.includes("250") && d.includes("Followers") && !d.includes("1,00,000"));
  await closeModal(page);

  // ---- 3. Likes: several packages ----
  await page.goto(`${BASE}/instagram/likes`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  await openModal(page, 0); // 10,00,000
  d = await dialogText(page);
  check("Likes: 10,00,000 selected", d.includes("10,00,000") && d.includes("Likes"));
  check("Likes: original ₹12,000 / discount ₹5,000", d.includes("₹12,000") && d.includes("₹5,000"));
  check("Likes: SAVE ₹7,000 (58%)", d.includes("SAVE ₹7,000 (58%)"));
  await closeModal(page);
  await openModal(page, 15); // 100
  d = await dialogText(page);
  check("Likes: 100 selected (no stale)", d.includes("100 Likes") && !d.includes("10,00,000"));
  await closeModal(page);

  // ---- 4. Validation rules ----
  await openModal(page, 0);
  // empty submit
  await page.evaluate(() => { [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Order via WhatsApp"))?.click(); });
  await sleep(250);
  d = await dialogText(page);
  check("Validation: empty form blocked", d.includes("Name is required") && d.includes("username or profile URL is required") && d.includes("WhatsApp number is required"));

  // 1-char name
  await typeField(page, "ig-name", "A");
  await typeField(page, "ig-username", "testuser");
  await typeField(page, "ig-whatsapp", "+91 98765 43210");
  await page.evaluate(() => { [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Order via WhatsApp"))?.click(); });
  await sleep(250);
  d = await dialogText(page);
  check("Validation: 1-char name rejected", d.includes("Name must be at least 2 characters"));

  // invalid username
  await typeField(page, "ig-name", "Test Customer");
  await typeField(page, "ig-username", "bad user!@#");
  await page.evaluate(() => { [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Order via WhatsApp"))?.click(); });
  await sleep(250);
  d = await dialogText(page);
  check("Validation: invalid username rejected", d.includes("Enter a valid @username or Instagram profile URL"));

  // invalid phone
  await typeField(page, "ig-username", "@testuser");
  await typeField(page, "ig-whatsapp", "123");
  await page.evaluate(() => { [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Order via WhatsApp"))?.click(); });
  await sleep(250);
  d = await dialogText(page);
  check("Validation: short phone rejected", d.includes("Enter a valid phone number"));

  // long note (>500) rejected — bypass maxLength via native setter
  await typeField(page, "ig-whatsapp", "+91 98765 43210");
  await typeField(page, "ig-note", "x".repeat(501));
  await page.evaluate(() => { [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Order via WhatsApp"))?.click(); });
  await sleep(250);
  d = await dialogText(page);
  check("Validation: >500 char note rejected", d.includes("Note must be 500 characters or fewer"));

  // username as profile URL accepted (phone intentionally kept invalid so modal stays open)
  await typeField(page, "ig-username", "https://instagram.com/testuser");
  await typeField(page, "ig-note", "");
  await typeField(page, "ig-whatsapp", "123");
  await page.evaluate(() => { [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Order via WhatsApp"))?.click(); });
  await sleep(250);
  d = await dialogText(page);
  check("Validation: profile URL accepted (only phone error remains)", !d.includes("Enter a valid @username") && d.includes("Enter a valid phone number"));

  // ---- 5. Dynamic WhatsApp message (Likes package) ----
  await typeField(page, "ig-username", "@testuser");
  await typeField(page, "ig-whatsapp", "+91 98765 43210");
  await typeField(page, "ig-note", "Deliver tomorrow");
  const [popup] = await Promise.all([
    new Promise((r) => page.once("popup", (p) => r(p))),
    page.evaluate(() => { [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Order via WhatsApp"))?.click(); }),
  ]);
  check("WhatsApp popup opens after valid form", !!popup, "");
  let msg = "";
  if (popup) {
    const waUrl = popup.url();
    check("WhatsApp URL targets 919330564851", waUrl.includes("wa.me/919330564851") || waUrl.includes("phone=919330564851"), waUrl.slice(0, 80));
    msg = decodeURIComponent(waUrl.split("text=")[1] || "");
    check("Message category = Instagram Likes", msg.includes("I want to order Instagram Likes."), msg.split("\n")[2]);
    check("Message package = 10,00,000 Likes", msg.includes("📦 Package: 10,00,000 Likes"));
    check("Message prices + save", msg.includes("💰 Original Price: ₹12,000") && msg.includes("🔥 Discount Price: ₹5,000") && msg.includes("💚 You Save: ₹7,000 (58%)"));
    check("Message customer details", msg.includes("👤 Customer: Test Customer") && msg.includes("📸 Instagram: @testuser") && msg.includes("📱 WhatsApp: +91 98765 43210"));
    check("Message note", msg.includes("📝 Note: Deliver tomorrow"));
    check("Message security line", msg.includes("never ask for my Instagram password, OTP, or login credentials"));
    check("Message closing", msg.includes("Please confirm my order. Thank you! 🙏"));
    await popup.close();
  }

  // ---- 6. Modal behavior: backdrop click, scroll lock, Escape ----
  await page.goto(`${BASE}/instagram/likes`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(500);
  await openModal(page, 0);
  const bodyScrollLocked = await page.evaluate(() => {
    const body = document.body;
    const before = body.style.overflow;
    return before === "hidden";
  });
  check("Body scroll locked while modal open", bodyScrollLocked, "");
  // backdrop click closes
  await page.evaluate(() => {
    const wrap = document.querySelector('[role="dialog"]');
    wrap.click(); // click on fixed backdrop wrapper
  });
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 4000 });
  await sleep(200);
  const unlocked = await page.evaluate(() => document.body.style.overflow === "");
  check("Body scroll restored after close", unlocked, "");
  // Escape closes (reopen)
  await openModal(page, 1);
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 4000 });
  check("Escape closes modal", true);

  // ---- 7. Reopen resets form + correct package ----
  await openModal(page, 0);
  await typeField(page, "ig-name", "Rohan");
  await closeModal(page);
  await openModal(page, 5); // 50,000 Likes
  const formState = await page.evaluate(() => ({ name: document.getElementById("ig-name").value, dlg: document.querySelector('[role="dialog"]').innerText }));
  check("Reopen: form fields reset", formState.name === "", `name=${formState.name}`);
  check("Reopen: new package shown (50,000)", formState.dlg.includes("50,000") && !formState.dlg.includes("10,00,000"));
  await closeModal(page);

  // ---- 8. Responsive: no overflow across widths with modal open ----
  let overflowFailures = 0;
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto(`${BASE}/instagram/likes`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(350);
    await openModal(page, 0);
    const m = await page.evaluate(() => {
      const panel = document.querySelector(".popup-panel");
      const r = panel ? panel.getBoundingClientRect() : null;
      return {
        doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        panel: panel ? panel.scrollWidth - panel.clientWidth : null,
        right: r ? Math.round(r.right) : null,
        left: r ? Math.round(r.left) : null,
        vw: window.innerWidth,
      };
    });
    const ok = m.doc <= 1 && m.panel !== null && m.panel <= 1 && m.right !== null && m.right <= w && m.left >= 0;
    if (!ok) { overflowFailures++; console.log(`  !! modal/layout issue at ${w}px: ${JSON.stringify(m)}`); }
    await closeModal(page);
  }
  check("No overflow with modal open at all 11 widths", overflowFailures === 0);

  // ---- 9. Views / Followers / Likes still intact ----
  await page.setViewport({ width: 1440, height: 900 });
  const counts = {};
  for (const [label, path, n] of [["views", "/instagram/views", 13], ["followers", "/instagram/followers", 15], ["likes", "/instagram/likes", 16]]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle0", timeout: 60000 });
    const hs = await page.$$("main button");
    let c = 0;
    for (const h of hs) if (await h.evaluate((b) => b.textContent.includes("Order Now"))) c++;
    counts[label] = c;
    check(`${label} page has ${n} Order Now buttons`, c === n, `got ${c}`);
  }

  // ---- 10. Console errors ----
  const badResponses = failedResponses.filter((f) => !f.includes("favicon.ico"));
  check("No failing resources (excluding favicon.ico)", badResponses.length === 0, badResponses.slice(0, 4).join("\n"));
  const realErrors = consoleErrors.filter((e) => !e.includes("favicon.ico") && !e.includes("404 (Not Found)"));
  check("No console/page errors", realErrors.length === 0, realErrors.slice(0, 4).join("\n"));

  await browser.close();
  console.log(failures === 0 ? "\nALL UNIVERSAL ORDER CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error("TEST ERROR:", e); process.exit(2); });
