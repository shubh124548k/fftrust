"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight, Play, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateVideoUrl } from "@/lib/validation";
import { SafeVideo } from "@/components/visual/safe-video";

/**
 * FF TRUST — Media Lightbox (PROMPT 8 rework).
 *
 * A premium fullscreen image viewer with a separate VIDEO popup.
 * Opens when a user clicks a card image.
 *
 * Images:
 *  - image slides (1 to 30)
 *  - previous/next arrows (desktop) + swipe (mobile)
 *  - slide counter + thumbnail strip
 *  - keyboard arrows (← →), ESC closes, body scroll locked
 *  - click image to open the fullscreen viewer
 *
 * Video:
 *  - a VIDEO option appears inside the same viewer ONLY when a valid
 *    videoUrl exists (never an empty tile)
 *  - clicking VIDEO opens a dedicated video popup with play/pause, volume,
 *    seek/progress, fullscreen and close (native controls for direct files,
 *    the player UI for YouTube/Vimeo embeds)
 *  - the video NEVER autoplays with sound (no autoplay param, no autoPlay)
 *  - responsive sizing, holo animated border, smooth entrance + exit
 */

export interface MediaItem {
  type: "image";
  url: string;
  alt?: string;
}

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
  const [videoOpen, setVideoOpen] = React.useState(false);
  const [videoClosing, setVideoClosing] = React.useState(false);
  const touchStartX = React.useRef<number | null>(null);
  const touchEndX = React.useRef<number | null>(null);

  // Image slides only — video is a separate VIDEO option (never an empty tile).
  const mediaItems: MediaItem[] = React.useMemo(
    () =>
      images.map((url) => ({
        type: "image" as const,
        url,
        alt: title,
      })),
    [images, title],
  );

  const validatedVideo = React.useMemo(
    () => validateVideoUrl(videoUrl),
    [videoUrl],
  );

  // Reset index + video state when the lightbox (re)opens.
  // Render-phase state adjustment (official React pattern) — avoids the
  // cascading-render warning that a setState-in-effect would trigger.
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setCurrentIndex(Math.min(initialIndex, mediaItems.length - 1));
      setVideoOpen(false);
      setVideoClosing(false);
    }
  }

  // Close the video popup with a short exit animation
  const closeVideo = React.useCallback(() => {
    if (videoClosing) return;
    setVideoClosing(true);
    window.setTimeout(() => {
      setVideoClosing(false);
      setVideoOpen(false);
    }, 160);
  }, [videoClosing]);

  // Lock body scroll + keyboard nav
  React.useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (videoOpen) closeVideo();
        else onClose();
        return;
      }
      // Arrow keys only navigate image slides when the video popup is closed
      if (videoOpen) return;
      if (e.key === "ArrowRight" && currentIndex < mediaItems.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [open, videoOpen, closeVideo, currentIndex, mediaItems.length, onClose]);

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

  const renderImage = () => {
    if (!currentItem) return null;
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
    <>
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

        {/* Media container */}
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
          {renderImage()}
        </div>

        {/* Thumbnail strip — images + optional VIDEO option */}
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
              aria-label={`View image ${i + 1}`}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "relative shrink-0 overflow-hidden rounded-lg transition-all",
                i === currentIndex
                  ? "ring-2 ring-[oklch(0.74_0.15_196)] opacity-100"
                  : "opacity-50 hover:opacity-80",
              )}
              style={{
                width: "clamp(36px, 8vw, 56px)",
                height: "clamp(36px, 8vw, 56px)",
              }}
            >
              <img
                src={item.url}
                alt={`Thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}

          {/* VIDEO option — shown only when a valid videoUrl exists */}
          {validatedVideo && (
            <button
              type="button"
              aria-label="Open video"
              onClick={() => setVideoOpen(true)}
              className={cn(
                "relative flex shrink-0 items-center justify-center gap-1 rounded-lg transition-all",
                "text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]",
              )}
              style={{
                width: "clamp(52px, 12vw, 84px)",
                height: "clamp(36px, 8vw, 56px)",
                background: "linear-gradient(135deg, oklch(0.3 0.1 290 / 0.6), oklch(0.3 0.1 196 / 0.6))",
                border: "1px solid oklch(1 0 0 / 0.2)",
              }}
            >
              <Play className="h-4 w-4" fill="white" />
              <span className="font-mono-label text-[9px]">VIDEO</span>
            </button>
          )}
        </div>
      </div>

      {/* Video popup — separate viewer with controls; never autoplays */}
      {videoOpen && (
        <VideoLightbox
          url={validatedVideo!}
          title={title}
          closing={videoClosing}
          onClose={closeVideo}
        />
      )}
    </>
  );
}

/**
 * VideoLightbox — dedicated video popup.
 *
 * Controls come from the platform player (native <video> for direct files,
 * the YouTube/Vimeo player UI for embeds) so play/pause, volume, seek/progress
 * and fullscreen all work. Never autoplays with sound.
 */
function VideoLightbox({
  url,
  title,
  closing,
  onClose,
}: {
  url: string;
  title: string;
  closing: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 10001, animation: closing ? "ff-lightbox-out 160ms ease-in both" : "ff-fade-in 200ms ease-out" }}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — video`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="popup-backdrop absolute inset-0"
        style={{
          backdropFilter: "blur(24px) saturate(1.5)",
          WebkitBackdropFilter: "blur(24px) saturate(1.5)",
          animation: "ff-fade-in 200ms ease-out",
        }}
      />

      {/* Close button */}
      <button
        type="button"
        aria-label="Close video"
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

      {/* Player — holo animated border, responsive 16:9 */}
      <div
        className="holo-border relative w-full overflow-hidden rounded-3xl"
        style={{
          width: "min(92vw, 960px)",
          aspectRatio: "16 / 9",
          animation: "ff-lightbox-in 320ms cubic-bezier(0.22,1,0.36,1)",
          boxShadow: "0 32px 100px -20px oklch(0 0 0 / 0.85), 0 12px 40px -12px oklch(0.5 0.15 250 / 0.35)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brand chip */}
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-[oklch(0.16_0.012_255/0.7)] px-2.5 py-1 backdrop-blur-sm">
          <Clapperboard className="h-3 w-3 text-[var(--accent-cyan)]" />
          <span className="font-mono-label text-[9px] text-white">VIDEO</span>
        </div>

        <SafeVideo url={url} title={title} fill />
      </div>
    </div>
  );
}
