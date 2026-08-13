"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, X, Expand, ImageOff, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ListingMedia } from "@/data/types";
import { usePerformanceTier } from "@/lib/design/use-performance-tier";
import { toVideoEmbedUrl } from "@/lib/media";

/**
 * FF TRUST — Media Gallery (PROMPT 07).
 *
 * A large media stage with:
 *  - up to 30 real images (lazy-loaded, reserved aspect, broken-media fallback)
 *  - thumbnail rail (click to select, scrollable)
 *  - touch swipe (pointer events, transform-only)
 *  - lightbox (fullscreen overlay, keyboard nav)
 *  - keyboard navigation (← → for prev/next, Escape to close lightbox)
 *  - video with poster (play button overlay)
 *  - no-media decorative state (crystalline gradient + motif)
 *
 * Tier-aware: swipe parallax reduced on low tiers. Reduced-motion: no swipe
 * animation, direct selection. All decorative layers pointer-events-none.
 */

const DECORATIVE_GRADIENT =
  "linear-gradient(135deg, oklch(0.82 0.1 200 / 0.35) 0%, oklch(0.7 0.12 290 / 0.22) 50%, oklch(0.9 0.02 245 / 0.5) 100%)";

export function MediaGallery({ media, title }: { media: ListingMedia[]; title: string }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [brokenUrls, setBrokenUrls] = React.useState<Set<number>>(new Set());
  const tier = usePerformanceTier();

  const images = media.filter((m) => m.kind === "image");
  const videos = media.filter((m) => m.kind === "video");
  const allMedia = [...images, ...videos];
  const hasMedia = allMedia.length > 0;
  const active = allMedia[Math.min(activeIndex, allMedia.length - 1)];

  const touchStartX = React.useRef<number | null>(null);
  const touchDelta = React.useRef(0);
  const directionRef = React.useRef<"next" | "prev">("next");

  const goNext = React.useCallback(() => {
    directionRef.current = "next";
    setActiveIndex((i) => Math.min(i + 1, allMedia.length - 1));
  }, [allMedia.length]);

  const goPrev = React.useCallback(() => {
    directionRef.current = "prev";
    setActiveIndex((i) => Math.max(i - 1, 0));
  }, []);

  React.useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else return;
      // Intercept before the hosting overlay sees the key — Escape closes the
      // lightbox only, never the whole Details dialog underneath.
      e.stopPropagation();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [lightboxOpen, goNext, goPrev]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDelta.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDelta.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    const threshold = 50;
    if (touchDelta.current > threshold) goPrev();
    else if (touchDelta.current < -threshold) goNext();
    touchStartX.current = null;
    touchDelta.current = 0;
  };

  const markBroken = (idx: number) => {
    setBrokenUrls((s) => new Set(s).add(idx));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Large stage — hard max-heights so it never spans the viewport (mobile 280 / tablet 360 / desktop 420) */}
      <div
        className="relative aspect-[16/10] w-full max-h-[280px] overflow-hidden rounded-2xl sm:max-h-[360px] lg:max-h-[420px]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {hasMedia && active ? (
          active.kind === "image" ? (
            brokenUrls.has(activeIndex) ? (
              <BrokenMediaState />
            ) : (
              <img
                key={activeIndex}
                src={active.url}
                alt={active.alt ?? title}
                loading="lazy"
                className={cn(
                  "absolute inset-0 h-full w-full object-contain",
                  directionRef.current === "next" ? "media-enter-right" : "media-enter-left",
                )}
                onError={() => markBroken(activeIndex)}
              />
            )
          ) : (
            <VideoStage url={active.url} poster={active.alt} title={title} />
          )
        ) : (
          <NoMediaState />
        )}

        {hasMedia && active?.evidence && (
          <span className="absolute left-3 top-3 rounded-full bg-[oklch(0.55_0.14_160/0.85)] px-2.5 py-1 font-mono-label text-[8px] text-white">
            Evidence
          </span>
        )}

        {allMedia.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous media"
              onClick={goPrev}
              disabled={activeIndex === 0}
              className="glass-embed absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[var(--ink)] transition-opacity disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next media"
              onClick={goNext}
              disabled={activeIndex >= allMedia.length - 1}
              className="glass-embed absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[var(--ink)] transition-opacity disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {hasMedia && (
          <button
            type="button"
            aria-label="Open fullscreen"
            onClick={() => setLightboxOpen(true)}
            className="glass-embed absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
          >
            <Expand className="h-3.5 w-3.5" />
          </button>
        )}

        {allMedia.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-[oklch(0.16_0.012_255/0.6)] px-2.5 py-1 font-mono-label text-[8px] text-white backdrop-blur-sm">
            {activeIndex + 1} / {allMedia.length}
          </span>
        )}
      </div>

      {/* Thumbnail rail */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {allMedia.map((m, i) => (
            <button
              key={i}
              type="button"
              aria-label={`View media ${i + 1}`}
              aria-current={i === activeIndex}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]",
                i === activeIndex
                  ? "border-[var(--accent-cyan)] opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              {m.kind === "image" ? (
                brokenUrls.has(i) ? (
                  <div className="flex h-full w-full items-center justify-center" style={{ background: DECORATIVE_GRADIENT }}>
                    <ImageOff className="h-4 w-4 text-[var(--ink-soft)]" />
                  </div>
                ) : (
                  <img
                    src={m.url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                    onError={() => markBroken(i)}
                  />
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center" style={{ background: DECORATIVE_GRADIENT }}>
                  <Play className="h-4 w-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && hasMedia && (
        <Lightbox
          media={allMedia}
          title={title}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          onClose={() => setLightboxOpen(false)}
          brokenUrls={brokenUrls}
          markBroken={markBroken}
        />
      )}
    </div>
  );
}

function NoMediaState() {
  return (
    <div className="relative h-full w-full" style={{ background: DECORATIVE_GRADIENT }}>
      <svg aria-hidden className="drift-float absolute right-8 top-8 opacity-60" width="100" height="100" viewBox="0 0 100 100" fill="none">
        <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" stroke="oklch(1 0 0 / 0.6)" strokeWidth="1" fill="oklch(1 0 0 / 0.1)" />
        <polygon points="50,28 70,40 70,60 50,72 30,60 30,40" stroke="oklch(0.74 0.15 196 / 0.5)" strokeWidth="0.8" fill="none" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <ImageOff className="h-8 w-8 text-[var(--ink-soft)] opacity-40" />
        <p className="font-mono-label text-[9px] text-[var(--ink-soft)]">No real media on file</p>
      </div>
    </div>
  );
}

function BrokenMediaState() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2" style={{ background: DECORATIVE_GRADIENT }}>
      <ImageOff className="h-8 w-8 text-[var(--ink-soft)] opacity-40" />
      <p className="font-mono-label text-[9px] text-[var(--ink-soft)]">Media unavailable</p>
    </div>
  );
}

function VideoStage({ url, poster, title }: { url: string; poster?: string; title: string }) {
  const embedUrl = toVideoEmbedUrl(url);
  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        title={`Video for ${title}`}
        className="absolute inset-0 h-full w-full rounded-2xl object-cover"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }
  return (
    <video
      src={url}
      poster={poster}
      controls
      preload="metadata"
      className="absolute inset-0 h-full w-full object-cover"
      aria-label={`Video for ${title}`}
    />
  );
}

function Lightbox({
  media,
  title,
  activeIndex,
  setActiveIndex,
  onClose,
  brokenUrls,
  markBroken,
}: {
  media: ListingMedia[];
  title: string;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
  brokenUrls: Set<number>;
  markBroken: (i: number) => void;
}) {
  const active = media[activeIndex];
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-[oklch(0.1_0.01_255/0.9)] backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — fullscreen gallery`}
      style={{ animation: "ff-fade-in 220ms ease-out" }}
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close fullscreen"
        onClick={onClose}
        className="glass-embed absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
      >
        <X className="h-5 w-5" />
      </button>
      {media.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((i) => Math.max(i - 1, 0));
            }}
            disabled={activeIndex === 0}
            className="glass-embed absolute left-5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((i) => Math.min(i + 1, media.length - 1));
            }}
            disabled={activeIndex >= media.length - 1}
            className="glass-embed absolute right-5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
      <div className="max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        {active?.kind === "image" ? (
          brokenUrls.has(activeIndex) ? (
            <div className="flex h-[60vh] w-[80vw] items-center justify-center rounded-2xl" style={{ background: DECORATIVE_GRADIENT }}>
              <ImageOff className="h-10 w-10 text-white opacity-40" />
            </div>
          ) : (
            <img
              src={active.url}
              alt={active.alt ?? title}
              className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
              onError={() => markBroken(activeIndex)}
            />
          )
        ) : (
          <VideoStage url={active?.url ?? ""} poster={active?.alt} title={title} />
        )}
      </div>
      <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-[oklch(0.16_0.012_255/0.7)] px-3 py-1.5 font-mono-label text-[9px] text-white backdrop-blur-sm">
        {activeIndex + 1} / {media.length} · Escape to close
      </span>
    </div>
  );
}
