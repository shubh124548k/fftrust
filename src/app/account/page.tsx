"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { User, Heart, ShoppingCart, MessageCircle, Clock, Shield, ArrowRight } from "lucide-react";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = React.useState<{ wishlistCount: number; inquiryCount: number; orderCount: number } | null>(null);

  React.useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/account")
        .then((r) => r.json())
        .then((data) => {
          if (data.stats) setStats(data.stats);
        })
        .catch(() => {});
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="section-ff">
        <div className="container-wide">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-cyan)] border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="section-ff">
        <div className="container-wide flex flex-col items-center py-20 text-center">
          <User className="h-12 w-12 text-[var(--ink-soft)]" />
          <h1 className="mt-4 font-heading text-2xl font-semibold text-[var(--ink)]">Sign in required</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">Please sign in to view your account.</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: Heart, label: "My Wishlist", desc: "Saved listings", href: "/wishlist", count: stats?.wishlistCount },
    { icon: ShoppingCart, label: "My Orders", desc: "Order history", href: "/account?tab=orders", count: stats?.orderCount },
    { icon: MessageCircle, label: "My Inquiries", desc: "Contact history", href: "/account?tab=inquiries", count: stats?.inquiryCount },
    { icon: Clock, label: "Recently Viewed", desc: "Browse history", href: "/account?tab=recently-viewed" },
    { icon: Shield, label: "Seller Dashboard", desc: "Manage listings", href: "/seller/dashboard" },
  ];

  return (
    <div className="section-ff overflow-hidden">
      <div className="container-wide max-w-3xl">
        <div className="glass-panel mb-8 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3 sm:gap-4">
            {session.user?.image ? (
              <img src={session.user.image} alt={session.user.name || "User"} className="h-16 w-16 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-violet)] text-2xl font-bold text-white">
                {session.user?.name?.[0] || "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-heading text-xl font-semibold text-[var(--ink)]">{session.user?.name}</h1>
              <p className="truncate text-sm text-[var(--ink-soft)]">{session.user?.email}</p>
              <p className="mt-1 font-mono-label text-[9px] text-[var(--accent-azure)]">
                Role: {session.user?.role || "USER"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="glass-embed group flex items-center gap-4 rounded-2xl p-4 transition-all hover:shadow-[var(--glass-shadow-lift)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, oklch(0.82 0.1 200 / 0.15), oklch(0.7 0.12 290 / 0.12))" }}>
                <item.icon className="h-5 w-5 text-[var(--accent-azure)]" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--ink)]">{item.label}</p>
                <p className="text-xs text-[var(--ink-soft)]">{item.desc}</p>
              </div>
              {item.count !== undefined && (
                <span className="font-mono-label text-xs text-[var(--ink-soft)]">{item.count}</span>
              )}
              <ArrowRight className="h-4 w-4 text-[var(--ink-soft)] transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
