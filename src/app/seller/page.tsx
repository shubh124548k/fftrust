"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle, AlertCircle, MessageCircle, Video, Lock } from "lucide-react";
import { MagneticButton } from "@/components/visual/magnetic-button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export default function SellerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [displayName, setDisplayName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (status === "authenticated" && session?.user?.name) {
      setDisplayName(session.user.name);
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="section-ff overflow-hidden">
        <div className="container-wide flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-cyan)] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="section-ff overflow-hidden">
        <div className="container-wide flex flex-col items-center py-20 text-center">
          <ShieldCheck className="h-12 w-12 text-[var(--ink-soft)]" />
          <h1 className="mt-4 font-heading text-2xl font-semibold text-[var(--ink)]">Sign in required</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">Please sign in to become a seller.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create seller profile");
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="section-ff">
        <div className="container-wide max-w-lg">
          <div className="glass-panel flex flex-col items-center rounded-3xl p-8 text-center">
            <CheckCircle className="h-12 w-12 text-[var(--accent-cyan)]" />
            <h1 className="mt-4 font-heading text-xl font-semibold text-[var(--ink)]">Seller Profile Created!</h1>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Your seller account has been created. You can now list your services.
            </p>
            <MagneticButton
              onClick={() => router.push("/seller/dashboard")}
              className="mt-6"
            >
              Go to Seller Dashboard
            </MagneticButton>
          </div>
        </div>
      </div>
    );
  }

  const waUrl = buildWhatsAppUrl({ inquiry: "I need help with seller verification." });

  return (
    <div className="section-ff overflow-hidden">
      <div className="container-wide max-w-2xl">
        <h1 className="font-heading text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
          Become a Seller
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Create your seller profile to start listing accounts and services on FF TRUST.
        </p>

        <div className="mt-6 rounded-2xl border border-[oklch(0.7_0.14_45/0.3)] bg-[oklch(0.86_0.1_80/0.18)] p-4">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-[oklch(0.45_0.16_45)]" />
            <p className="font-mono-label text-[9px] text-[oklch(0.45_0.16_45)]">Important</p>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-[var(--ink)] text-balance">
            TURN ON SCREEN RECORDING BEFORE VERIFICATION/PURCHASE.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="font-mono-label mb-1.5 block text-[9px] text-[var(--accent-azure)]">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="glass-embed w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent-cyan)]"
              placeholder="Your seller name"
            />
          </div>
          <div>
            <label className="font-mono-label mb-1.5 block text-[9px] text-[var(--accent-azure)]">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="glass-embed w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent-cyan)] resize-none"
              placeholder="Tell buyers about your services..."
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-[oklch(0.7_0.14_45/0.3)] bg-[oklch(0.86_0.1_80/0.1)] p-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-[oklch(0.55_0.14 25)]" />
              <p className="text-xs text-[var(--ink-soft)]">{error}</p>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-2xl border border-[var(--border)] bg-[oklch(0.96_0.006_245/0.4)] p-3">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ink-soft)]" />
            <p className="text-xs text-[var(--ink-soft)]">
              Never send passwords, OTPs or recovery codes through this website.
            </p>
          </div>

          <MagneticButton type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Profile..." : "Create Seller Profile"}
          </MagneticButton>
        </form>

        <div className="mt-6 text-center">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[var(--accent-azure)] hover:underline"
          >
            <MessageCircle className="h-4 w-4" />
            Need help? Contact on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
