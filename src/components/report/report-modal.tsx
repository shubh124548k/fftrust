"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { X, AlertCircle, Flag } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";
import { z } from "@/lib/design/depth";

const REPORT_REASONS = [
  "Incorrect information",
  "Suspicious listing",
  "Misleading price",
  "Fake evidence",
  "Other",
];

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  targetType: "listing" | "seller";
  targetId: string;
}

export function ReportModal({ open, onClose, targetType, targetId }: ReportModalProps) {
  const { data: session } = useSession();
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const [reason, setReason] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;
    lockBodyScroll(scrollRef);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockBodyScroll();
      cancelAnimationFrame(id);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      openLoginModal({ type: "report", listingId: targetId });
      onClose();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason, description }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(onClose, 2000);
      }
    } catch {
      // silent
    }
    setLoading(false);
  };

  return (
    <div
      className="fixed left-0 right-0 top-0 flex items-center justify-center p-4"
      style={{ zIndex: z("modal"), height: "100dvh" }}
      role="dialog"
      aria-modal="true"
      aria-label="Report"
    >
      <div
        className="popup-backdrop fixed left-0 right-0 top-0 cursor-pointer"
        onClick={onClose}
        style={{
          height: "100dvh",
          backdropFilter: "blur(28px) saturate(1.8)",
          WebkitBackdropFilter: "blur(28px) saturate(1.8)",
          animation: "ff-fade-in 200ms ease-out",
        }}
      />

      <div
        ref={panelRef}
        className="popup-panel acrylic-sheen relative flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl"
        style={{ animation: "ff-popup-in 350ms cubic-bezier(0.22,1,0.36,1)" }}
      >
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-[var(--accent-azure)]" />
              <h2 className="font-heading text-base font-semibold text-[var(--ink)]">Report {targetType}</h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="popup-close-btn inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--ink)] transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              style={{
                background: "var(--popup-close-bg, oklch(0.92 0.008 245 / 0.95))",
                border: "1px solid var(--glass-border)",
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Flag className="h-8 w-8 text-[var(--accent-cyan)]" />
              <p className="mt-3 text-sm font-semibold text-[var(--ink)]">Report submitted</p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">Thank you for helping keep FF TRUST safe.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <p className="font-mono-label mb-2 text-[9px] text-[var(--accent-azure)]">Reason</p>
                <div className="flex flex-col gap-1.5">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r}
                      className={`glass-embed flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                        reason === r
                          ? "border-[var(--accent-cyan)] bg-[oklch(0.82_0.1_200/0.15)] text-[var(--ink)]"
                          : "text-[var(--ink-soft)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="sr-only"
                      />
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        reason === r ? "border-[var(--accent-cyan)]" : "border-[var(--border)]"
                      }`}>
                        {reason === r && <span className="h-2 w-2 rounded-full bg-[var(--accent-cyan)]" />}
                      </span>
                      {r}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-mono-label mb-1.5 block text-[9px] text-[var(--accent-azure)]">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="glass-embed w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent-cyan)] resize-none"
                  placeholder="Additional details..."
                />
              </div>
              <button
                type="submit"
                disabled={!reason || loading}
                className="glass-embed flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--ink)] transition-all hover:shadow-[var(--glass-shadow-lift)] disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
