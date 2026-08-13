"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  BadgeIndianRupee,
  ShieldCheck,
  LayoutList,
  Server,
  Trophy,
  Video,
  HelpCircle,
  Info,
  Scale,
  MessageCircle,
  X,
  ChevronDown,
  Eye,
  Users,
  Heart,
  Instagram as InstagramIcon,
} from "lucide-react";
import { primaryNav, servicesNav, safetyNav, systemNav, wishlistNav, instagramNav, instagramSubNav, type NavItem } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { MagneticButton } from "@/components/visual/magnetic-button";
import { useSellerContactStore } from "@/stores/seller-contact";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";
import { z } from "@/lib/design/depth";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Compass,
  BadgeIndianRupee,
  ShieldCheck,
  LayoutList,
  Server,
  Trophy,
  Video,
  HelpCircle,
  Info,
  Scale,
  MessageCircle,
  Heart,
  Eye,
  Users,
  Instagram: InstagramIcon,
};

/**
 * FF TRUST — Mobile Command Center.
 *
 * Premium Holo-Chrome mobile drawer with:
 *  - Instagram accordion (Views, Followers, Likes)
 *  - All nav items (Home, Explore, Price Guide, List Your Account, How It Works,
 *    Compare, Panel Seller, Paid Push, Instagram, Wishlist, Contact Owner)
 *  - Proper body scroll lock
 *  - Blurred backdrop
 *  - Internal scrolling
 *  - Active state from pathname
 */
export function MobileCommandCenter({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const searchRef = React.useRef<HTMLInputElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const openSellerPopup = useSellerContactStore((s) => s.openPopup);
  const pathname = usePathname();
  const [instagramExpanded, setInstagramExpanded] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    lockBodyScroll(panelRef);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    const id = requestAnimationFrame(() => closeRef.current?.focus());

    return () => {
      window.removeEventListener("keydown", onKey);
      unlockBodyScroll();
      cancelAnimationFrame(id);
    };
  }, [open, onClose]);

  // Auto-expand Instagram if on an Instagram page
  React.useEffect(() => {
    if (pathname.startsWith("/instagram")) setInstagramExpanded(true);
  }, [pathname]);

  if (!open) return null;

  const isPathActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/instagram")) return pathname.startsWith("/instagram");
    return pathname === href;
  };

  // Build nav groups — Instagram is a special accordion item, not a plain link
  const navigateItems = [...primaryNav, wishlistNav];
  const servicesItems = servicesNav;

  const igIcons: Record<string, React.ReactNode> = {
    "instagram-views": <Eye className="h-4 w-4" />,
    "instagram-followers": <Users className="h-4 w-4" />,
    "instagram-likes": <Heart className="h-4 w-4" />,
  };

  return (
    <div
      className="fixed left-0 right-0 top-0 lg:hidden"
      style={{ zIndex: z("modal"), height: "100dvh" }}
      role="dialog"
      aria-modal="true"
      aria-label="Command center"
    >
      {/* Backdrop */}
      <div
        className="absolute left-0 right-0 top-0 cursor-pointer"
        onClick={onClose}
        style={{
          height: "100dvh",
          background: "oklch(0.1 0.01 255 / 0.5)",
          backdropFilter: "blur(12px) saturate(1.2)",
          WebkitBackdropFilter: "blur(12px) saturate(1.2)",
          animation: "ff-fade-in 220ms ease-out",
        }}
      >
        <div aria-hidden className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, oklch(0.74 0.15 196 / 0.08) 0%, oklch(1 0 0 / 0) 70%)" }} />
        <div aria-hidden className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, oklch(0.6 0.19 290 / 0.06) 0%, oklch(1 0 0 / 0) 70%)" }} />
      </div>

      {/* Panel */}
      <div
        ref={panelRef}
        className="glass-stack acrylic-sheen absolute inset-x-0 top-0 m-0 rounded-none p-4 sm:m-3 sm:rounded-3xl"
        style={{ animation: "ff-slide-down 320ms cubic-bezier(0.22,1,0.36,1)", bottom: "0", maxHeight: "100dvh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between bg-gradient-to-b from-[var(--glass-bg-strong)] to-transparent px-4 pb-2 pt-1">
          <div className="flex items-center gap-2.5">
            <Image
              src={siteConfig.brandLogo}
              alt={siteConfig.name}
              width={1536}
              height={1024}
              sizes="56px"
              className="h-8 w-auto"
            />
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close command center"
            onClick={onClose}
            className="glass-embed inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--ink)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex flex-col gap-1.5">
          {/* Navigate items (Home, Explore, etc. + Wishlist) */}
          {navigateItems.map((item) => {
            const Icon = item.iconKey ? iconMap[item.iconKey] : null;
            const active = isPathActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex min-w-0 items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-[oklch(0.82_0.1_200/0.12)]",
                  active && "bg-[oklch(0.82_0.1_200/0.15)]",
                )}
              >
                {Icon && (
                  <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg, oklch(0.82 0.1 200 / 0.2), oklch(0.7 0.12 290 / 0.16))" }}>
                    <Icon className="h-4 w-4 text-[var(--accent-azure)]" />
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className={cn("truncate text-sm font-medium", active ? "text-[var(--accent-cyan)]" : "text-[var(--ink)]")}>{item.label}</span>
                </span>
              </Link>
            );
          })}

          {/* Instagram accordion */}
          <div>
            <button
              type="button"
              onClick={() => setInstagramExpanded(!instagramExpanded)}
              aria-expanded={instagramExpanded}
              className={cn(
                "flex w-full min-w-0 items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-[oklch(0.82_0.1_200/0.12)]",
                pathname.startsWith("/instagram") && "bg-[oklch(0.82_0.1_200/0.15)]",
              )}
            >
              <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg, oklch(0.82 0.1 200 / 0.2), oklch(0.7 0.12 290 / 0.16))" }}>
                <InstagramIcon className="h-4 w-4 text-[var(--accent-azure)]" />
              </span>
              <span className={cn("flex-1 text-left text-sm font-medium", pathname.startsWith("/instagram") ? "text-[var(--accent-cyan)]" : "text-[var(--ink)]")}>
                Instagram
              </span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-[var(--ink-soft)] transition-transform duration-200", instagramExpanded && "rotate-180")} />
            </button>

            {/* Promotional label — clean, inside the accordion header */}
            <div className="ml-11 mt-1 flex flex-col gap-0.5">
              <span className="font-mono-label text-[9px] font-semibold text-[var(--accent-azure)]">
                INSTA — PAID AT VERY LOW PRICE
              </span>
              <span className="font-mono-label text-[8px] text-[var(--ink-soft)]">
                Views • Followers • Likes
              </span>
            </div>

            {/* Accordion sub-items */}
            {instagramExpanded && (
              <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l border-[var(--border)] pl-3" style={{ animation: "ff-stagger-in 250ms cubic-bezier(0.22,1,0.36,1) both" }}>
                {instagramSubNav.map((sub) => {
                  const active = isPathActive(sub.href);
                  return (
                    <Link
                      key={sub.key}
                      href={sub.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-[oklch(0.82_0.1_200/0.08)]",
                        active ? "text-[var(--accent-cyan)] font-medium" : "text-[var(--ink-soft)]",
                      )}
                    >
                      {igIcons[sub.key]}
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Services items (Panel Seller, Paid Push) */}
          {servicesItems.map((item) => {
            const Icon = item.iconKey ? iconMap[item.iconKey] : null;
            const active = isPathActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex min-w-0 items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-[oklch(0.82_0.1_200/0.12)]",
                  active && "bg-[oklch(0.82_0.1_200/0.15)]",
                )}
              >
                {Icon && (
                  <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg, oklch(0.82 0.1 200 / 0.2), oklch(0.7 0.12 290 / 0.16))" }}>
                    <Icon className="h-4 w-4 text-[var(--accent-azure)]" />
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className={cn("truncate text-sm font-medium", active ? "text-[var(--accent-cyan)]" : "text-[var(--ink)]")}>{item.label}</span>
                </span>
              </Link>
            );
          })}
        </div>

        {/* Contact to Owner CTA */}
        <MagneticButton
          onClick={() => {
            onClose();
            requestAnimationFrame(() => openSellerPopup("account"));
          }}
          className="nav-contact-btn mt-5 w-full"
          strength={6}
        >
          <MessageCircle className="h-4 w-4" />
          Contact to Owner
        </MagneticButton>

        {/* Safety reminder */}
        <div className="mt-4 mb-2 rounded-2xl border border-[oklch(0.7_0.14_45/0.25)] bg-[oklch(0.86_0.1_80/0.14)] p-3">
          <p className="font-mono-label text-[9px] text-[oklch(0.45_0.14_45)]">Buyer safety</p>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            {siteConfig.safety.recordingRemind}
          </p>
        </div>
      </div>
    </div>
  );
}
