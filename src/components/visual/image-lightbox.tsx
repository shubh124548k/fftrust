"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateVideoUrl } from "@/lib/validation";
import { SafeVideo } from "@/components/visual/safe-video";

/**
 * FF TRUST — Media Lightbox (PROMPT 03 unified sequence).
 *
 * A premium fullscreen media viewer that treats images AND video as ONE
 * navigable sequence. Opens when a user clicks a card image.
 *
 * Images + video:
 *  - one shared sequence: prev/next, slide counter and thumbnail strip all
 *    navigate across images and the canonical videoUrl together
 *  - video appears as a VIDEO tile at the end of the thumbnail strip (only
 *    when a valid videoUrl exists — never an empty tile) and plays inline in
 *    the same viewer via the single reusable SafeVideo renderer
 *  - the video NEVER autoplays with sound (no autoplay param, no autoPlay)
 *  - keyboard arrows (← →) move through the whole sequence, ESC closes
 *  - swipe (mobile), holo animated border, responsive sizing, entrance + exit
 */

type MediaItem =
  | { type: "image"; url: string; alt?: string }
  | { type: "video"; url: string; alt?: string };

interface MediaLightboxProps {
  images: string[];
  videoUrl?: string | null;
  title: string;
  open: boolean;
  initialIndex?: number;
  onClose: () => void;
}

export function ImageLightbox({
  images,
  videoUrl,
  title,
  open,
  initialIndex = 0,
  onClose,
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const touchStartX = React.useRef<number | null>(null);
  const touchEndX = React.useRef<number | null>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const restoreFocusRef = React.useRef<HTMLElement | null>(null);

  // One unified sequence: images first, then the canonical video (if any).
  // The video only ever becomes an item when a valid URL exists.
  const mediaItems: MediaItem[] = React.useMemo(() => {
    const items: MediaItem[] = images.map((url) => ({
      type: "image" as const,
      url,
      alt: title,
    }));
    if (validateVideoUrl(videoUrl)) {
      items.push({ type: "video", url: videoUrl!, alt: title });
    }
    return items;
  }, [images, videoUrl, title]);

  // Reset the index when the lightbox (re)opens. Render-phase state adjustment
  // (official React pattern) — avoids the cascading-render warning a
  // setState-in-effect would trigger.
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setCurrentIndex(Math.min(initialIndex, mediaItems.length - 1));
    }
  }

  // Lock body scroll + keyboard nav + focus management (moves focus into the
  // dialog, traps Tab, and restores focus to the trigger on close).
  React.useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowRight" && currentIndex < mediaItems.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
      if (e.key === "Tab") {
        const focusable = document.querySelectorAll<HTMLElement>(
          '[role="dialog"] a[href], [role="dialog"] button:not([disabled]), [role="dialog"] input:not([disabled]), [role="dialog"] select:not([disabled]), [role="dialog"] [tabindex]:not([tabindex="-1"])',
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
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      cancelAnimationFrame(id);
      restoreFocusRef.current?.focus();
    };
  }, [open, currentIndex, mediaItems.length, onClose]);

  if (!open || mediaItems.length === 0) return null;

  const hasMultiple = mediaItems.length > 1;
  const currentItem = mediaItems[currentIndex];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < mediaItems.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const renderMedia = () => {
    if (!currentItem) return null;
    if (currentItem.type === "video") {
      return (
        <div
          className="holo-border relative overflow-hidden rounded-2xl"
          style={{
            width: "min(92vw, 960px)",
            aspectRatio: "16 / 9",
            maxHeight: "85vh",
            boxShadow: "0 24px 80px -16px oklch(0 0 0 / 0.8), 0 8px 32px -8px oklch(0.5 0.15 250 / 0.35)",
          }}
        >
          <SafeVideo url={currentItem.url} title={currentItem.alt || title} fill />
        </div>
      );
    }
    return (
      <img
        src={currentItem.url}
        alt={currentItem.alt || title}
        className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
        style={{
          boxShadow: "0 24px 80px -16px oklch(0 0 0 / 0.8), 0 8px 32px -8px oklch(0 0 0 / 0.6)",
        }}
        onError={(e) => {
          e.currentTarget.style.opacity = "0.3";
        }}
      />
    );
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — media gallery`}
    >
      {/* Backdrop — blurred dark */}
      <div
        className="popup-backdrop absolute inset-0"
        style={{
          backdropFilter: "blur(24px) saturate(1.5)",
          WebkitBackdropFilter: "blur(24px) saturate(1.5)",
          animation: "ff-fade-in 200ms ease-out",
        }}
      />

      {/* Close button — always visible */}
      <button
        ref={closeRef}
        type="button"
        aria-label="Close gallery"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="popup-close-btn absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-all hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
        style={{
          background: "oklch(0.2 0.02 255 / 0.8)",
          border: "1px solid oklch(1 0 0 / 0.2)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <X className="h-5 w-5" />
      </button>

      {/* Counter — top center */}
      {hasMultiple && (
        <div
          className="absolute top-6 left-1/2 z-10 -translate-x-1/2 rounded-full px-4 py-1.5"
          style={{
            background: "oklch(0.2 0.02 255 / 0.8)",
            border: "1px solid oklch(1 0 0 / 0.2)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            animation: "ff-fade-in 300ms ease-out",
          }}
        >
          <span className="font-mono-label text-[10px] text-white">
            {currentIndex + 1} / {mediaItems.length}
          </span>
        </div>
      )}

      {/* Previous button — desktop only (swipe on mobile) */}
      {hasMultiple && currentIndex > 0 && (
        <button
          type="button"
          aria-label="Previous media"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex(currentIndex - 1);
          }}
          className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full transition-all hover:scale-110 sm:flex"
          style={{
            background: "oklch(0.2 0.02 255 / 0.8)",
            border: "1px solid oklch(1 0 0 / 0.2)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            width: "clamp(40px, 5vw, 56px)",
            height: "clamp(40px, 5vw, 56px)",
          }}
        >
          <ChevronLeft className="text-white" style={{ width: "clamp(20px, 3vw, 28px)", height: "clamp(20px, 3vw, 28px)" }} />
        </button>
      )}

      {/* Next button — desktop only (swipe on mobile) */}
      {hasMultiple && currentIndex < mediaItems.length - 1 && (
        <button
          type="button"
          aria-label="Next media"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex(currentIndex + 1);
          }}
          className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full transition-all hover:scale-110 sm:flex"
          style={{
            background: "oklch(0.2 0.02 255 / 0.8)",
            border: "1px solid oklch(1 0 0 / 0.2)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            width: "clamp(40px, 5vw, 56px)",
            height: "clamp(40px, 5vw, 56px)",
          }}
        >
          <ChevronRight className="text-white" style={{ width: "clamp(20px, 3vw, 28px)", height: "clamp(20px, 3vw, 28px)" }} />
        </button>
      )}

      {/* Media container — images and the canonical video share one stage */}
      <div
        className="relative z-[1] flex max-h-[90vh] max-w-[90vw] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          animation: "ff-lightbox-in 350ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {renderMedia()}
      </div>

      {/* Thumbnail strip — images + VIDEO tile in one sequence */}
      <div
        className="absolute bottom-4 left-1/2 z-10 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-2xl p-2"
        style={{
          background: "oklch(0.2 0.02 255 / 0.8)",
          border: "1px solid oklch(1 0 0 / 0.15)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          animation: "ff-slide-up 400ms cubic-bezier(0.22,1,0.36,1) both",
          animationDelay: "100ms",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {mediaItems.map((item, i) => (
          <button
            key={i}
            type="button"
            aria-label={item.type === "video" ? "Play video" : `View image ${i + 1}`}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "relative shrink-0 overflow-hidden rounded-lg transition-all",
              i === currentIndex
                ? "ring-2 ring-[oklch(0.74_0.15_196)] opacity-100"
                : "opacity-50 hover:opacity-80",
            )}
            style={{
              width: item.type === "video" ? "clamp(52px, 12vw, 84px)" : "clamp(36px, 8vw, 56px)",
              height: "clamp(36px, 8vw, 56px)",
            }}
          >
            {item.type === "video" ? (
              <div
                className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-white"
                style={{
                  background: "linear-gradient(135deg, oklch(0.3 0.1 290 / 0.6), oklch(0.3 0.1 196 / 0.6))",
                  border: "1px solid oklch(1 0 0 / 0.2)",
                }}
              >
                <Play className="h-3.5 w-3.5" fill="white" />
                <span className="font-mono-label text-[8px]">VIDEO</span>
              </div>
            ) : (
              <img
                src={item.url}
                alt={`Thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
