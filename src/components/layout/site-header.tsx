"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Heart,
  MessageCircle,
  ChevronDown,
  Eye,
  Users,
  Instagram as InstagramIcon,
} from "lucide-react";
import { primaryNav, servicesNav, wishlistNav, instagramNav, instagramSubNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { MagneticButton } from "@/components/visual/magnetic-button";
import { AnimatedHamburger } from "./animated-hamburger";
import { MobileCommandCenter } from "./mobile-command-center";
import { useSellerContactStore } from "@/stores/seller-contact";
import { useFavoritesStore } from "@/stores/favorites";
import { cn } from "@/lib/utils";
import { z } from "@/lib/design/depth";
import { usePerformanceTier } from "@/lib/design/use-performance-tier";

/**
 * FF TRUST — Site Header (Navigation System Final).
 *
 * Desktop: full navbar with all links + Instagram dropdown. No hamburger.
 * Tablet: adapts intelligently — nav visible if width allows, else hamburger.
 * Mobile: compact logo + hamburger drawer.
 *
 * Instagram: desktop dropdown (Views, Followers, Likes), mobile accordion.
 * Active state: derived from pathname, not hardcoded.
 * No search icon. No theme toggle. Dark-only.
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [instagramOpen, setInstagramOpen] = React.useState(false);
  const [activeAnchor, setActiveAnchor] = React.useState<string>("top");
  const tier = usePerformanceTier();
  const openSellerPopup = useSellerContactStore((s) => s.openPopup);
  const favoritesCount = useFavoritesStore((s) => s.favorites.length);
  const pathname = usePathname();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (tier === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const sections = [
      "top", "explore", "price-guide", "list-account",
      "panel-seller", "paid-push",
      "trust", "buyer-safety", "safety-academy", "scam-center",
      "compare", "faq", "about", "legal",
    ];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveAnchor(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [tier]);

  // Close Instagram dropdown when clicking outside or pressing Escape
  const instagramRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!instagramOpen) return;
    const onClick = (e: MouseEvent) => {
      if (instagramRef.current && !instagramRef.current.contains(e.target as Node)) {
        setInstagramOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInstagramOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [instagramOpen]);

  // Active state logic — uses pathname for dedicated pages, anchor for home sections
  const isPathActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/instagram")) return pathname.startsWith("/instagram");
    return pathname === href;
  };

  const isAnchorActive = (anchor: string | undefined) => {
    if (!anchor) return false;
    return activeAnchor === anchor.slice(1);
  };

  const isInstagramActive = pathname.startsWith("/instagram");

  // Desktop nav: primary + services + instagram + wishlist
  const desktopNav = [...primaryNav, ...servicesNav];

  // Icon map for Instagram sub-items
  const igIcons: Record<string, React.ReactNode> = {
    "instagram-views": <Eye className="h-3.5 w-3.5" />,
    "instagram-followers": <Users className="h-3.5 w-3.5" />,
    "instagram-likes": <Heart className="h-3.5 w-3.5" />,
  };

  return (
    <header
      className="fixed inset-x-0 top-0"
      style={{ zIndex: z("nav") }}
    >
      <div className={cn("container-wide transition-all duration-500", scrolled ? "py-2" : "py-3")}>
        <div
          className={cn(
            "glass-float relative flex items-center justify-between gap-2 overflow-visible rounded-full px-3 py-2 transition-all duration-500 sm:gap-3 sm:px-4",
            scrolled && "shadow-[var(--glass-shadow-lift)]",
          )}
        >
          {/* Top sheen — clipped to the pill via inline position so the bar keeps
              overflow:visible (the Instagram dropdown must float below the bar). */}
          <div
            aria-hidden
            className="acrylic-sheen pointer-events-none inset-0 rounded-full"
            style={{ position: "absolute", overflow: "hidden" }}
          />
          {/* Brand */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label={`${siteConfig.name} home`}>
            <Image
              src={siteConfig.brandLogo}
              alt={siteConfig.name}
              width={1536}
              height={1024}
              priority
              sizes="64px"
              className="h-7 w-auto transition-transform duration-300 group-hover:scale-105 sm:h-8 lg:h-9"
            />
          </Link>

          {/* Desktop nav — visible at lg+ (1024px). All links + Instagram dropdown. */}
          <nav aria-label="Primary" className="hidden min-w-0 flex-1 items-center justify-center gap-0 lg:flex">
            {desktopNav.map((item) => {
              const active = isPathActive(item.href) || isAnchorActive(item.anchor);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "relative whitespace-nowrap rounded-full px-1 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] xl:px-2 xl:py-1.5 xl:text-sm",
                    active
                      ? "text-[var(--ink)] font-semibold"
                      : "text-[var(--foreground)] opacity-70 hover:opacity-100 hover:text-[var(--ink)]",
                  )}
                >
                  {item.label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full"
                      style={{ background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-violet))" }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Instagram dropdown */}
            <div ref={instagramRef} className="relative">
              <button
                type="button"
                onClick={() => setInstagramOpen(!instagramOpen)}
                aria-expanded={instagramOpen}
                aria-label="Instagram menu"
                className={cn(
                  "relative inline-flex items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] xl:px-2 xl:py-1.5 xl:text-sm",
                  isInstagramActive
                    ? "text-[var(--ink)] font-semibold"
                    : "text-[var(--foreground)] opacity-70 hover:opacity-100 hover:text-[var(--ink)]",
                )}
              >
                Instagram
                <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", instagramOpen && "rotate-180")} />
                {isInstagramActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full"
                    style={{ background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-violet))" }}
                  />
                )}
              </button>

              {/* Promotional label — compact, 1440+ so the navbar never overflows */}
              <div className="pointer-events-none ml-1.5 hidden flex-col items-start gap-0 leading-none min-[1440px]:flex">
                <span className="font-mono-label text-[7px] font-semibold text-[var(--accent-azure)]">
                  INSTA — PAID AT VERY LOW PRICE
                </span>
                <span className="mt-0.5 font-mono-label text-[7px] text-[var(--ink-soft)]">
                  Views • Followers • Likes
                </span>
              </div>

              {/* Dropdown panel — floating glass (absolute, over the bar, no height growth) */}
              {instagramOpen && (
                <div
                  className="glass-stack absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded-2xl p-2"
                  style={{
                    boxShadow: "var(--glass-shadow-lift)",
                    animation: "ff-dropdown-in 250ms cubic-bezier(0.22,1,0.36,1)",
                    minWidth: "180px",
                  }}
                >
                  {instagramSubNav.map((sub) => {
                    const active = isPathActive(sub.href);
                    return (
                      <Link
                        key={sub.key}
                        href={sub.href}
                        onClick={() => setInstagramOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all hover:bg-[oklch(0.82_0.1_200/0.12)]",
                          active ? "text-[var(--accent-cyan)]" : "text-[var(--ink)]",
                        )}
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg, oklch(0.82 0.1 200 / 0.15), oklch(0.7 0.12 290 / 0.12))" }}>
                          {igIcons[sub.key] || <InstagramIcon className="h-3.5 w-3.5 text-[var(--accent-azure)]" />}
                        </span>
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Wishlist is reachable via the heart icon button in Actions — kept
                out of the text nav so the pill never overflows on lg–xl. */}
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Wishlist icon (with count badge) — visible on all sizes */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="glass-embed relative inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-violet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
            >
              <Heart className="h-4 w-4" />
              {favoritesCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[8px] font-semibold text-white"
                  style={{ background: "oklch(0.6 0.19 290)" }}
                >
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Contact to Owner — opens seller popup */}
            <MagneticButton
              onClick={() => openSellerPopup("account")}
              className="nav-contact-btn inline-flex items-center gap-1.5 px-2 py-2 text-xs sm:px-3.5 lg:px-3 lg:text-sm"
              strength={8}
              aria-label="Contact to Owner"
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Contact</span>
            </MagneticButton>

            {/* Hamburger — visible below lg (1024px) */}
            <AnimatedHamburger open={menuOpen} onToggle={setMenuOpen} />
          </div>
        </div>
      </div>

      <MobileCommandCenter open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
