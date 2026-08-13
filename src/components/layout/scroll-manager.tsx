"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * FF TRUST — Scroll Manager.
 *
 * When arriving at the home route (`/`) from any other route via an in-app
 * navigation (push/replace), force an immediate scroll to the top so the
 * visitor lands at the top of the catalogue rather than at a stale offset.
 *
 * Deliberately does NOT run for:
 *  - hash / anchor navigations (e.g. `/#explore`) — the fixed-header anchor
 *    CSS (scroll-padding-top) handles those, and we must not stomp the
 *    landing offset that the p8 audit depends on;
 *  - back/forward (popstate) — the browser's native scroll restoration wins;
 *  - the initial page load.
 *
 * `behavior: "instant"` bypasses the global `scroll-behavior: smooth` rule so
 * the reset is immediate instead of animating through the whole page.
 */
export function ScrollManager() {
  const pathname = usePathname();
  const popRef = React.useRef(false);
  const prevPath = React.useRef(pathname);

  React.useEffect(() => {
    const previous = prevPath.current;
    prevPath.current = pathname;

    if (previous === pathname) return;
    if (pathname !== "/") return;
    if (window.location.hash) return;
    if (popRef.current) {
      popRef.current = false;
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  React.useEffect(() => {
    const onPopState = () => {
      if (!window.location.hash) popRef.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return null;
}
