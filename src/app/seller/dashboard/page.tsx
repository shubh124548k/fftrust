"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LayoutList, Plus, Eye, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { MagneticButton } from "@/components/visual/magnetic-button";
import { useSellerContactStore } from "@/stores/seller-contact";

export default function SellerDashboardPage() {
  const { data: session, status } = useSession();
  const openPopup = useSellerContactStore((s) => s.openPopup);
  const [profile, setProfile] = React.useState<{ displayName: string; verificationState: string; listings: unknown[] } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/seller")
        .then((r) => r.json())
        .then((data) => {
          setProfile(data.profile);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="section-ff">
        <div className="container-wide flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-cyan)] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="section-ff">
        <div className="container-wide flex flex-col items-center py-20 text-center">
          <ShieldCheck className="h-12 w-12 text-[var(--ink-soft)]" />
          <h1 className="mt-4 font-heading text-2xl font-semibold text-[var(--ink)]">Sign in required</h1>
        </div>
      </div>
    );
  }

  if (!profile) {
    const handleCreateProfile = async () => {
      setCreating(true);
      try {
        const res = await fetch("/api/seller", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName: session?.user?.name || "Seller" }),
        });
        if (res.ok) {
          setCreating(false);
          window.location.reload();
        } else {
          openPopup("account");
          setCreating(false);
        }
      } catch {
        openPopup("account");
        setCreating(false);
      }
    };

    return (
      <div className="section-ff overflow-hidden">
        <div className="container-wide max-w-lg">
          <div className="glass-panel flex flex-col items-center rounded-3xl p-8 text-center">
            <LayoutList className="h-12 w-12 text-[var(--ink-soft)]" />
            <h1 className="mt-4 font-heading text-xl font-semibold text-[var(--ink)]">No Seller Profile</h1>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              You haven&apos;t created a seller profile yet. Become a seller to list your services.
            </p>
            <MagneticButton onClick={handleCreateProfile} className="mt-6" disabled={creating}>
              {creating ? "Creating..." : "Become a Seller"}
            </MagneticButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-ff overflow-hidden">
      <div className="container-wide max-w-3xl">
        <div className="glass-panel mb-8 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-[var(--accent-cyan)]" />
            <div>
              <h1 className="font-heading text-xl font-semibold text-[var(--ink)]">Seller Dashboard</h1>
              <p className="text-sm text-[var(--ink-soft)]">{profile.displayName}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="font-mono-label rounded-full bg-[oklch(0.82_0.1_200/0.15)] px-3 py-1 text-[9px] text-[var(--accent-azure)]">
              Status: {profile.verificationState}
            </span>
            <span className="font-mono-label rounded-full bg-[oklch(0.7_0.12_290/0.15)] px-3 py-1 text-[9px] text-[var(--accent-violet)]">
              Listings: {profile.listings.length}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="glass-embed flex items-center gap-3 rounded-2xl p-4 sm:gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, oklch(0.82 0.1 200 / 0.15), oklch(0.7 0.12 290 / 0.12))" }}>
              <Plus className="h-5 w-5 text-[var(--accent-azure)]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--ink)]">Create New Listing</p>
              <p className="text-xs text-[var(--ink-soft)] line-clamp-2">List a Free Fire account, panel service, or paid push</p>
            </div>
            <button type="button" onClick={() => openPopup("account")} className="inline-flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-azure)]" />
            </button>
          </div>

          <div className="glass-embed flex items-center gap-3 rounded-2xl p-4 sm:gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, oklch(0.82 0.1 200 / 0.15), oklch(0.7 0.12 290 / 0.12))" }}>
              <Eye className="h-5 w-5 text-[var(--accent-azure)]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--ink)]">My Listings</p>
              <p className="text-xs text-[var(--ink-soft)] line-clamp-2">
                {profile.listings.length === 0
                  ? "No listings yet — create your first listing above"
                  : `${profile.listings.length} active listing(s)`}
              </p>
            </div>
          </div>

          <div className="glass-embed flex items-center gap-3 rounded-2xl p-4 sm:gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, oklch(0.82 0.1 200 / 0.15), oklch(0.7 0.12 290 / 0.12))" }}>
              <MessageCircle className="h-5 w-5 text-[var(--accent-azure)]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--ink)]">Inquiries</p>
              <p className="text-xs text-[var(--ink-soft)]">No new inquiries</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/accounts" className="inline-flex items-center gap-2 text-sm text-[var(--accent-azure)] hover:underline">
            Browse Marketplace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
