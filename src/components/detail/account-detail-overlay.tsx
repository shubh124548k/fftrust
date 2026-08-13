"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useDetailStore } from "@/stores/detail";
import { getAccountById } from "@/lib/selectors/accounts";
import { AccountDossier } from "./account-dossier";
import { EmptyState } from "@/components/visual/empty-state";
import { Compass } from "lucide-react";
import { z } from "@/lib/design/depth";

/**
 * FF TRUST — Account Detail Overlay (PROMPT 07).
 *
 * A full-screen cinematic glass dialog that opens when a user clicks "View
 * Details" on an account card. Reads the selected ID from the detail store,
 * resolves the canonical record via getAccountById, and renders the
 * AccountDossier.
 *
 * Features:
 *  - full-screen glass-stack overlay with scroll
 *  - focus trap, Escape to close, body scroll lock
 *  - staggered entrance (ff-slide-down)
 *  - close button (top-right, sticky)
 *  - honest empty state if the record isn't found
 *  - z = z("modal")
 */
export function AccountDetailOverlay() {
  const selectedId = useDetailStore((s) => s.selectedId);
  const close = useDetailStore((s) => s.close);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  // Focus management + Escape + body scroll lock.
  React.useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      cancelAnimationFrame(id);
    };
  }, [selectedId, close]);

  // Reset scroll position when opening.
  React.useEffect(() => {
    if (selectedId && panelRef.current) {
      panelRef.current.scrollTop = 0;
    }
  }, [selectedId]);

  if (!selectedId) return null;

  const record = getAccountById(selectedId);

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: z("modal") }}
      role="dialog"
      aria-modal="true"
      aria-label="Account detail"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[oklch(0.12_0.01_255/0.5)] backdrop-blur-md"
        onClick={close}
        style={{ animation: "ff-fade-in 220ms ease-out" }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="glass-stack absolute inset-x-0 top-0 m-3 max-h-[96vh] overflow-y-auto rounded-[2rem] p-5 sm:m-6 sm:p-8"
        style={{ animation: "ff-slide-down 360ms cubic-bezier(0.22,1,0.36,1)" }}
      >
        {/* Sticky close bar */}
        <div className="sticky top-0 z-10 -mx-5 mb-6 flex items-center justify-end bg-gradient-to-b from-[var(--glass-bg-strong)] to-transparent px-5 pb-3 pt-1 sm:-mx-8 sm:px-8">
          <button
            ref={closeRef}
            type="button"
            aria-label="Close detail"
            onClick={close}
            className="glass-embed inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--ink)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {record ? (
          <AccountDossier record={record} />
        ) : (
          <EmptyState
            icon={<Compass className="h-6 w-6" />}
            title="Account not found"
            description="This listing may have been unpublished or removed. Browse the catalogue for available accounts."
          />
        )}
      </div>
    </div>
  );
}
