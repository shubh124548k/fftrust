"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * FF TRUST — Scroll Manager.
 *
 * The home route (`/`) must always open at the absolute top (Y=0) — never at
 * a stale offset carried over from a previous page or a previous visit.
 * This applies to:
 *  - push/replace navigations to `/` from any other route;
 *  - back/forward (popstate) landings on `/`;
 *  - clicking a "Home" link (href="/") while already on `/`.
 *
 * Deliberately does NOT run for:
 *  - hash / anchor navigations (e.g. `/#category-hub`) — the fixed-header
 *    anchor CSS (scroll-padding-top) handles those, and we must not stomp
 *    the landing offset that the p8 audit depends on;
 *  - any other route — normal per-page scroll behavior is untouched;
 *  - the initial page load (the browser already loads at the top).
 *
 * `behavior: "instant"` bypasses the global `scroll-behavior: smooth` rule so
 * the reset is immediate instead of animating through the whole page.
 */
export function ScrollManager() {
  const pathname = usePathname();
  const prevPath = React.useRef(pathname);

  React.useEffect(() => {
    const previous = prevPath.current;
    prevPath.current = pathname;

    if (previous === pathname) return;
    if (pathname !== "/") return;
    if (window.location.hash) return;

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  // While on the home route, mark history entries as "manual" so the browser
  // never saves (and later restores) a scroll offset for "/" — the home page
  // must always open at the absolute top. Every other route stays "auto" so
  // its normal back/forward scroll restoration is untouched.
  React.useEffect(() => {
    window.history.scrollRestoration = pathname === "/" ? "manual" : "auto";
  }, [pathname]);

  // bfcache restores (back to "/" after a full page navigation): React state
  // survives so the effects above do not re-run, so reset the scroll here.
  React.useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      if (window.location.pathname !== "/") return;
      if (window.location.hash) return;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // Clicking any "Home" link (exact href="/") while already on the home route
  // re-sets the scroll to the top even though the pathname does not change —
  // covers the brand logo, the Home nav item and mobile/footer links. Uses the
  // capture phase so the reset happens BEFORE Next.js Link records the current
  // scroll position for the outgoing history entry (e.g. when removing a hash
  // from `/#category-hub`), which prevents the browser from restoring it. When a
  // hash is present, Next.js also runs its own scroll restore after the
  // navigation settles, so the top position is re-asserted for a short window
  // until that restore finishes.
  React.useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest?.("a");
      const href = link?.getAttribute("href");
      if (!href || href !== "/") return;
      if (window.location.pathname !== "/") return;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (window.location.hash) {
        const startedAt = performance.now();
        const holdTop = () => {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          if (performance.now() - startedAt < 700) {
            requestAnimationFrame(holdTop);
          }
        };
        requestAnimationFrame(holdTop);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
