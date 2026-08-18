"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, LayoutList, Heart, ShoppingCart, MessageCircle, Settings, ChevronDown, Shield } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (status === "loading") {
    return (
      <div className="glass-embed inline-flex h-9 w-9 items-center justify-center rounded-full">
        <div className="h-4 w-4 animate-pulse rounded-full bg-[var(--border)]" />
      </div>
    );
  }

  if (!session) {
    const openLoginModal = useAuthStore.getState().openLoginModal;
    return (
      <button
        type="button"
        onClick={() => openLoginModal()}
        className="glass-embed inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-[var(--ink)] transition-all hover:shadow-[var(--glass-shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
        aria-label="Sign in"
      >
        <User className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }

  const isSeller = session.user?.role === "SELLER" || session.user?.role === "ADMIN";
  const initials = session.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Account menu"
        className="glass-embed flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-2.5 transition-all hover:shadow-[var(--glass-shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[10px] font-bold text-white">
            {initials}
          </span>
        )}
        <span className="hidden text-xs font-medium text-[var(--ink)] sm:inline">
          {session.user?.name?.split(" ")[0] || "Account"}
        </span>
        <ChevronDown className={cn("h-3 w-3 text-[var(--ink-soft)] transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className="glass-stack absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl p-1.5"
          style={{
            boxShadow: "var(--glass-shadow-lift)",
            animation: "ff-dropdown-in 250ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div className="mb-1 border-b border-[var(--border)] px-3 py-2.5">
            <p className="text-sm font-semibold text-[var(--ink)]">{session.user?.name}</p>
            <p className="text-xs text-[var(--ink-soft)] truncate">{session.user?.email}</p>
          </div>

          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[oklch(0.82_0.1_200/0.12)]"
          >
            <User className="h-4 w-4 text-[var(--accent-azure)]" />
            My Profile
          </Link>
          <Link
            href="/wishlist"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[oklch(0.82_0.1_200/0.12)]"
          >
            <Heart className="h-4 w-4 text-[var(--accent-violet)]" />
            My Wishlist
          </Link>
          <Link
            href="/account?tab=orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[oklch(0.82_0.1_200/0.12)]"
          >
            <ShoppingCart className="h-4 w-4 text-[var(--accent-cyan)]" />
            My Orders
          </Link>
          <Link
            href="/account?tab=inquiries"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[oklch(0.82_0.1_200/0.12)]"
          >
            <MessageCircle className="h-4 w-4 text-[var(--accent-azure)]" />
            My Inquiries
          </Link>
          {isSeller && (
            <Link
              href="/seller/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[oklch(0.82_0.1_200/0.12)]"
            >
              <LayoutList className="h-4 w-4 text-[var(--accent-violet)]" />
              Seller Dashboard
            </Link>
          )}
          <Link
            href="/seller"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[oklch(0.82_0.1_200/0.12)]"
          >
            <Shield className="h-4 w-4 text-[var(--accent-azure)]" />
            {isSeller ? "Seller Settings" : "Become a Seller"}
          </Link>

          <div className="mt-1 border-t border-[var(--border)] pt-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-[var(--ink-soft)] transition-colors hover:bg-[oklch(0.7_0.14_45/0.1)] hover:text-[oklch(0.55_0.14_25)]"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
