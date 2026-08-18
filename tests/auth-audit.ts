import puppeteer from "puppeteer";

const BASE = "http://localhost:1111";

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  
  let passed = 0;
  let failed = 0;
  
  const ok = (label: string) => { passed++; console.log(`  ✅ ${label}`); };
  const fail = (label: string, detail?: string) => { failed++; console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ""}`); };
  
  console.log("\n=== §A — AUTH SYSTEM ===");
  
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
  const title = await page.title();
  if (title.includes("FF TRUST")) ok("Homepage loads with correct title");
  else fail("Homepage title", title);
  
  const loginBtn = await page.$('button[aria-label="Sign in"]');
  if (loginBtn) ok("Sign in button exists in navbar");
  else fail("Sign in button not found");
  
  if (loginBtn) {
    await loginBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    const modal = await page.$('[role="dialog"][aria-label="Sign in"]');
    if (modal) ok("Login modal opens on click");
    else fail("Login modal did not open");
    
    const googleText = await page.evaluate(() => {
      return document.body.textContent?.includes("Continue with Google") ?? false;
    });
    if (googleText) ok("Google login button text exists in modal");
    else fail("Google login button text not found");
    
    const secureText = await page.evaluate(() => {
      return document.body.textContent?.includes("No password required") ?? false;
    });
    if (secureText) ok("Secure authentication text present");
    else fail("Secure authentication text missing");
    
    const closeBtn = await page.$('.popup-close-btn');
    if (closeBtn) {
      await closeBtn.click();
      await new Promise(r => setTimeout(r, 500));
      const modalGone = await page.$('[role="dialog"][aria-label="Sign in"]');
      if (!modalGone) ok("Login modal closes on X click");
      else fail("Login modal did not close");
    }
  }
  
  console.log("\n=== §B — API ROUTES ===");
  
  const apiRoutes = ["/api/auth/session", "/api/wishlist"];
  for (const route of apiRoutes) {
    const resp = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle2", timeout: 15000 }).catch(() => null);
    const status = resp?.status() || 0;
    if (status === 200 || status === 401) ok(`API ${route} responds (${status})`);
    else fail(`API ${route}`, `status ${status}`);
  }
  
  console.log("\n=== §C — PAGES ===");
  
  await page.goto(`${BASE}/account`, { waitUntil: "networkidle2", timeout: 15000 });
  const accountText = await page.evaluate(() => document.body.textContent || "");
  if (accountText.includes("Sign in required") || accountText.includes("FF TRUST")) ok("Account page loads (requires auth)");
  else fail("Account page broken");
  
  await page.goto(`${BASE}/seller`, { waitUntil: "networkidle2", timeout: 15000 });
  const sellerText = await page.evaluate(() => document.body.textContent || "");
  if (sellerText.includes("Sign in required") || sellerText.includes("Seller")) ok("Seller page loads (requires auth)");
  else fail("Seller page broken");
  
  await page.goto(`${BASE}/seller/dashboard`, { waitUntil: "networkidle2", timeout: 15000 });
  const dashText = await page.evaluate(() => document.body.textContent || "");
  if (dashText.includes("Sign in required") || dashText.includes("Seller Dashboard") || dashText.includes("No Seller Profile") || dashText.includes("FF TRUST")) ok("Seller dashboard loads (redirects to home if unauth)");
  else fail("Seller dashboard broken");
  
  const existingPages = ["/", "/accounts", "/services", "/paid-push", "/instagram", "/wishlist", "/compare", "/proof", "/safety", "/contact"];
  for (const p of existingPages) {
    const resp = await page.goto(`${BASE}${p}`, { waitUntil: "networkidle2", timeout: 15000 });
    if (resp?.status() === 200) ok(`Page ${p} loads (200)`);
    else fail(`Page ${p}`, `status ${resp?.status()}`);
  }
  
  console.log("\n=== §D — MOBILE ===");
  
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
  
  const hamburger = await page.$('button[aria-label="Toggle menu"]');
  if (hamburger) {
    await hamburger.click();
    await new Promise(r => setTimeout(r, 500));
    const mobileSignIn = await page.evaluate(() => {
      return document.body.textContent?.includes("Sign in with Google") ?? false;
    });
    if (mobileSignIn) ok("Mobile hamburger has Sign in with Google");
    else fail("Mobile hamburger missing Sign in button");
    
    const closeHamburger = await page.$('button[aria-label="Close command center"]');
    if (closeHamburger) await closeHamburger.click();
    await new Promise(r => setTimeout(r, 300));
  }
  
  const noOverflow = await page.evaluate(() => {
    return document.body.scrollWidth <= window.innerWidth;
  });
  if (noOverflow) ok("No horizontal overflow on mobile");
  else fail("Horizontal overflow on mobile");
  
  console.log("\n=== §E — NAVBAR ===");
  
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
  
  const navbar = await page.$('header');
  if (navbar) ok("Navbar renders");
  else fail("Navbar not found");
  
  const allNavLinks = await page.evaluate(() => {
    const links = document.querySelectorAll('header a[href]');
    return links.length;
  });
  if (allNavLinks > 3) ok(`Navbar has ${allNavLinks} navigation links`);
  else fail("Navbar missing navigation links");
  
  console.log(`\n============================================================`);
  console.log(`Auth & Integration Audit: ${passed} passed, ${failed} failed`);
  console.log(`============================================================\n`);
  
  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
