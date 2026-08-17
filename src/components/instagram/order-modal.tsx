"use client";

import * as React from "react";
import { X, MessageCircle, Eye, ShieldCheck } from "lucide-react";
import { MagneticButton } from "@/components/visual/magnetic-button";
import { BuyerProofPanel } from "@/components/proof/buyer-proof-panel";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";
import {
  buildInstagramOrderMessage,
  buildWhatsAppUrl,
  formatPrice,
  sanitizeInstagramLine,
  unitLabelForService,
  validateInstagramOrderForm,
  type InstagramPackageWithSavings,
} from "@/lib/selectors/instagram";
import type { InstagramServiceType } from "@/data/types";

interface InstagramOrderModalProps {
  open: boolean;
  onClose: () => void;
  service: InstagramServiceType;
  pkg: InstagramPackageWithSavings | null;
}

export function InstagramOrderModal({ open, onClose, service, pkg }: InstagramOrderModalProps) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [customerName, setCustomerName] = React.useState("");
  const [instagramUsername, setInstagramUsername] = React.useState("");
  const [whatsappNumber, setWhatsappNumber] = React.useState("");
  const [note, setNote] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset the form when the modal opens or the selected package changes.
  // Derived during render so no synchronous state updates run in an effect.
  const [prevSession, setPrevSession] = React.useState<{ open: boolean; pkg: InstagramPackageWithSavings | null }>({ open, pkg });
  if (open !== prevSession.open || pkg !== prevSession.pkg) {
    setPrevSession({ open, pkg });
    if (open) {
      setCustomerName("");
      setInstagramUsername("");
      setWhatsappNumber("");
      setNote("");
      setErrors({});
    }
  }

  React.useEffect(() => {
    if (!open) return;
    lockBodyScroll();
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

  if (!open || !pkg) return null;

  const validate = () => {
    const errs = validateInstagramOrderForm({
      customerName,
      instagramUsername,
      whatsappNumber,
      note,
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOrder = () => {
    if (!validate() || !pkg) return;
    const message = buildInstagramOrderMessage({
      service,
      pkg,
      customerName: sanitizeInstagramLine(customerName),
      instagramUsername: sanitizeInstagramLine(instagramUsername),
      whatsappNumber: sanitizeInstagramLine(whatsappNumber),
      note: note.trim().slice(0, 500),
    });
    const url = buildWhatsAppUrl(service.whatsappNumber, message);
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Order ${pkg.formattedQuantity} Instagram ${unitLabelForService(service.key)}`}
    >
      <div
        className="popup-backdrop absolute inset-0"
        style={{
          backdropFilter: "blur(8px) saturate(1.2)",
          WebkitBackdropFilter: "blur(8px) saturate(1.2)",
          animation: "ff-fade-in 200ms ease-out",
        }}
      />
      <div
        className="popup-panel acrylic-sheen relative flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl"
        style={{ animation: "ff-popup-in 350ms cubic-bezier(0.22,1,0.36,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg, oklch(0.74 0.15 196) 0%, oklch(0.6 0.19 290) 100%)",
                  boxShadow: "var(--neon-cyan)",
                }}
              >
                <Eye className="h-4 w-4 text-white" />
              </span>
              <div>
                <p className="font-heading text-base font-semibold text-[var(--ink)]">Place Order</p>
                <p className="font-mono-label text-[8px] text-[var(--ink-soft)]">{service.label}</p>
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="popup-close-btn inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--ink)] transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              style={{ background: "var(--popup-close-bg)" }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-5 rounded-2xl border border-[var(--border)] p-4" style={{ background: "oklch(0.2 0.014 255 / 0.4)" }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono-label text-[8px] text-[var(--accent-azure)]">Selected Package</p>
                <p className="mt-1 font-heading text-lg font-semibold text-[var(--ink)]">
                  {pkg.formattedQuantity} {unitLabelForService(service.key)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--ink-soft)] line-through">{formatPrice(pkg.originalPrice)}</p>
                <p className="font-heading text-xl font-bold text-gradient-cyan">{formatPrice(pkg.discountPrice)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-[var(--border)] pt-3">
              <span className="rounded-full bg-[oklch(0.55_0.14_160/0.15)] px-2.5 py-1 text-[10px] font-semibold text-[oklch(0.65_0.14_160)]">
                SAVE {formatPrice(pkg.savingAmount)} ({pkg.savingPercentage}%)
              </span>
            </div>
          </div>

          <div className="mb-4">
            <BuyerProofPanel variant="card" />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="ig-name" className="mb-1.5 block font-mono-label text-[9px] text-[var(--accent-azure)]">
                Customer Name *
              </label>
              <input
                id="ig-name"
                type="text"
                maxLength={60}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your name"
                className="glass-embed w-full rounded-xl px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              />
              {errors.customerName && <p className="mt-1 text-xs text-[oklch(0.68_0.2_24)]">{errors.customerName}</p>}
            </div>
            <div>
              <label htmlFor="ig-username" className="mb-1.5 block font-mono-label text-[9px] text-[var(--accent-azure)]">
                Instagram Username / Profile URL *
              </label>
              <input
                id="ig-username"
                type="text"
                maxLength={200}
                value={instagramUsername}
                onChange={(e) => setInstagramUsername(e.target.value)}
                placeholder="@username or https://instagram.com/username"
                className="glass-embed w-full rounded-xl px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              />
              {errors.instagramUsername && <p className="mt-1 text-xs text-[oklch(0.68_0.2_24)]">{errors.instagramUsername}</p>}
            </div>
            <div>
              <label htmlFor="ig-whatsapp" className="mb-1.5 block font-mono-label text-[9px] text-[var(--accent-azure)]">
                WhatsApp Number *
              </label>
              <input
                id="ig-whatsapp"
                type="tel"
                maxLength={20}
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="glass-embed w-full rounded-xl px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              />
              {errors.whatsappNumber && <p className="mt-1 text-xs text-[oklch(0.68_0.2_24)]">{errors.whatsappNumber}</p>}
            </div>
            <div>
              <label htmlFor="ig-note" className="mb-1.5 block font-mono-label text-[9px] text-[var(--accent-azure)]">
                Optional Note
              </label>
              <textarea
                id="ig-note"
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any specific instructions..."
                rows={2}
                className="glass-embed w-full resize-none rounded-xl px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              />
              {errors.note && <p className="mt-1 text-xs text-[oklch(0.68_0.2_24)]">{errors.note}</p>}
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[oklch(0.7_0.14_45/0.2)] bg-[oklch(0.86_0.1_80/0.1)] p-3">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[oklch(0.45_0.14_45)]" />
            <p className="text-xs text-[var(--ink-soft)]">
              We never ask for your Instagram password, OTP, or login credentials.
            </p>
          </div>
        </div>

        <div className="popup-footer shrink-0 border-t border-[var(--border)] p-4">
          <MagneticButton onClick={handleOrder} className="w-full" strength={6}>
            <MessageCircle className="h-4 w-4" />
            Order via WhatsApp
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
