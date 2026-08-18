import puppeteer from "puppeteer";

const BASE = "http://localhost:1111";
let passed = 0;
let failed = 0;
const results: string[] = [];
function ok(l: string) { passed++; results.push(`  ✅ ${l}`); }
function fail(l: string, d?: string) { failed++; results.push(`  ❌ ${l}${d ? ` — ${d}` : ""}`); }
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); } catch (e: any) { fail(name, e.message?.substring(0, 300)); }
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await test("1. Homepage loads", async () => {
    const r = await page.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
    if (r?.status() === 200) ok("200 OK"); else fail("status", String(r?.status()));
  });

  await test("2. Desktop Sign in button visible", async () => {
    await new Promise(r => setTimeout(r, 2000));
    const btns = await page.$$('button[aria-label="Sign in"]');
    for (const btn of btns) {
      const box = await btn.boundingBox();
      if (box && box.width > 0) { ok(`Visible (${Math.round(box.width)}x${Math.round(box.height)})`); return; }
    }
    fail("Not visible");
  });

  await test("3. Login modal opens", async () => {
    const btns = await page.$$('button[aria-label="Sign in"]');
    for (const btn of btns) {
      const box = await btn.boundingBox();
      if (box && box.width > 0) { await btn.click(); break; }
    }
    await new Promise(r => setTimeout(r, 1000));
    const modal = await page.$('[role="dialog"][aria-label="Sign in"]');
    if (modal) ok("Modal opened"); else fail("No modal");
  });

  let googleClicked = false;
  await test("4. Continue with Google button exists", async () => {
    const btns = await page.$$('button');
    for (const b of btns) {
      const t = await page.evaluate(el => el.textContent || "", b);
      if (t.includes("Continue with Google")) { googleClicked = true; ok("Found"); return; }
    }
    fail("Not found");
  });

  await test("5. Click → Google OAuth (redirect_uri correct)", async () => {
    if (!googleClicked) { fail("Skip"); return; }
    const btns = await page.$$('button');
    for (const b of btns) {
      const t = await page.evaluate(el => el.textContent || "", b);
      if (t.includes("Continue with Google")) {
        try { await Promise.all([page.waitForNavigation({ timeout: 10000 }), b.click()]); } catch {}
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));
    const url = page.url();
    if (!url.includes("accounts.google.com")) { fail("Not on Google", url.substring(0, 100)); return; }
    const u = new URL(url);
    const ri = u.searchParams.get("redirect_uri");
    if (ri === "http://localhost:1111/api/auth/callback/google") ok(`redirect_uri: ${ri}`);
    else fail("redirect_uri", ri || "null");
    const scope = u.searchParams.get("scope");
    if (scope?.includes("openid") && scope?.includes("email")) ok(`scope: ${scope}`);
    else fail("scope", scope || "null");
    const pkce = u.searchParams.get("code_challenge_method");
    if (pkce === "S256") ok("PKCE: S256");
    else fail("PKCE", pkce || "null");
  });

  await test("6. Google page (no redirect_uri_mismatch)", async () => {
    const body = await page.evaluate(() => document.body?.innerText || "");
    if (body.includes("redirect_uri_mismatch")) fail("redirect_uri_mismatch!");
    else if (body.includes("Error 400")) fail("Google Error 400");
    else ok(`Page OK (${body.length} chars)`);
  });

  await test("7. Navigate back → clean state", async () => {
    await page.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    if (page.url().startsWith(BASE)) ok("Back on homepage"); else fail("Wrong URL");
  });

  await test("8. /account → proxy redirect → auto-opens modal", async () => {
    await page.goto(`${BASE}/account`, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    const modal = await page.$('[role="dialog"][aria-label="Sign in"]');
    if (modal) ok("Modal auto-opened"); else fail("No modal");
  });

  await test("9. /seller → proxy redirect → auto-opens modal", async () => {
    await page.goto(`${BASE}/seller`, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    const modal = await page.$('[role="dialog"][aria-label="Sign in"]');
    if (modal) ok("Modal auto-opened"); else fail("No modal");
  });

  await test("10. CSRF endpoint", async () => {
    await page.goto(`${BASE}/api/auth/csrf`, { waitUntil: "networkidle2", timeout: 10000 });
    const body = await page.evaluate(() => document.body?.innerText || "");
    try { const d = JSON.parse(body); if (d.csrfToken) ok(`Token: ${d.csrfToken.substring(0, 8)}...`); else fail("No token"); } catch { fail("Non-JSON"); }
  });

  await test("11. Providers endpoint → Google", async () => {
    await page.goto(`${BASE}/api/auth/providers`, { waitUntil: "networkidle2", timeout: 10000 });
    const body = await page.evaluate(() => document.body?.innerText || "");
    try {
      const p = JSON.parse(body);
      if (p.google) ok(`id=${p.google.id}, callback=${p.google.callbackUrl}`);
      else fail("No Google");
    } catch { fail("Non-JSON"); }
  });

  await test("12. POST /api/auth/signin/google → Google redirect (verified)", async () => {
    await page.goto(BASE, { waitUntil: "networkidle2", timeout: 15000 });
    const csrf = await page.evaluate(async () => (await (await fetch("/api/auth/csrf")).json()).csrfToken);
    const r = await page.evaluate(async (t: string) => {
      const res = await fetch("/api/auth/signin/google", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `csrfToken=${t}`,
        redirect: "manual",
      });
      return { status: res.status, location: res.headers.get("location"), type: res.type };
    }, csrf);
    if (r.location?.includes("accounts.google.com")) {
      ok("POST → Google redirect");
      const url = new URL(r.location);
      if (url.searchParams.get("redirect_uri") === "http://localhost:1111/api/auth/callback/google")
        ok("redirect_uri correct in POST");
      else fail("redirect_uri wrong in POST", url.searchParams.get("redirect_uri") || "null");
    } else {
      fail("POST did not redirect", `type=${r.type} loc=${r.location?.substring(0, 80) || "none"}`);
    }
  });

  await test("13. Footer", async () => {
    await page.goto(BASE, { waitUntil: "networkidle2", timeout: 15000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 500));
    if (await page.$("footer")) ok("Present"); else fail("Not found");
  });

  // MOBILE
  const m = await browser.newPage();
  await m.setViewport({ width: 375, height: 812 });

  await test("14. Mobile homepage", async () => {
    const r = await m.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
    if (r?.status() === 200) ok("200 OK"); else fail("status");
  });

  await test("15. Mobile Sign in visible", async () => {
    await new Promise(r => setTimeout(r, 2000));
    const btns = await m.$$('button[aria-label="Sign in"]');
    for (const b of btns) {
      const box = await b.boundingBox();
      if (box && box.width > 0) { ok(`Visible (${Math.round(box.width)}x${Math.round(box.height)})`); return; }
    }
    fail("Not visible");
  });

  await test("16. Mobile modal opens", async () => {
    const btns = await m.$$('button[aria-label="Sign in"]');
    for (const b of btns) {
      const box = await b.boundingBox();
      if (box && box.width > 0) { await b.click(); break; }
    }
    await new Promise(r => setTimeout(r, 1000));
    if (await m.$('[role="dialog"][aria-label="Sign in"]')) ok("Opened"); else fail("No modal");
  });

  await test("17. Mobile Google button + OAuth", async () => {
    const btns = await m.$$('button');
    for (const b of btns) {
      const t = await m.evaluate(el => el.textContent || "", b);
      if (t.includes("Continue with Google")) {
        try { await Promise.all([m.waitForNavigation({ timeout: 8000 }), b.click()]); } catch {}
        await new Promise(r => setTimeout(r, 2000));
        if (m.url().includes("accounts.google.com")) {
          const ri = new URL(m.url()).searchParams.get("redirect_uri");
          if (ri === "http://localhost:1111/api/auth/callback/google") ok(`Mobile → Google (redirect_uri correct)`);
          else fail("Mobile redirect_uri", ri || "null");
        } else fail("Mobile not on Google");
        return;
      }
    }
    fail("No Google button");
  });

  await test("18. Mobile hamburger", async () => {
    await m.goto(BASE, { waitUntil: "networkidle2", timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    const btns = await m.$$('button');
    for (const b of btns) {
      const label = await m.evaluate(el => el.getAttribute("aria-label"), b);
      if (label === "Open menu") {
        ok("Hamburger visible");
        await b.click();
        await new Promise(r => setTimeout(r, 800));
        const has = await m.evaluate(() => {
          for (const el of document.querySelectorAll("button")) {
            if (el.textContent?.includes("Sign in") || el.textContent?.includes("Google")) return true;
          }
          return false;
        });
        if (has) ok("Menu has auth options");
        return;
      }
    }
    fail("No hamburger");
  });

  await test("19. Mobile /account → auto-opens modal", async () => {
    await m.goto(`${m.url().split("?")[0].split("#")[0]}`, { waitUntil: "networkidle2", timeout: 15000 });
    await m.goto(`${BASE}/account`, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    if (await m.$('[role="dialog"][aria-label="Sign in"]')) ok("Auto-opened"); else fail("No modal");
  });

  console.log("\n" + "=".repeat(70));
  console.log("  FF TRUST E2E AUTH TEST RESULTS");
  console.log("=".repeat(70));
  results.forEach(r => console.log(r));
  console.log("=".repeat(70));
  console.log(`  PASSED: ${passed}  FAILED: ${failed}`);
  console.log("=".repeat(70));
  if (failed > 0) console.log(`\n⚠️  ${failed} failed`);
  else console.log("\n✅ ALL PASSED!");

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
