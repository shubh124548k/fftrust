"use client";

import * as React from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCardMediaRotation } from "@/hooks/use-card-media-rotation";
import { DECORATIVE_GRADIENT } from "@/lib/design/constants";

/**
 * FF TRUST — CardMediaStage (PROMPT 03 repair, shared primitive).
 *
 * The single media surface used by every listing card (Account, Panel Seller,
 * Paid Push). Renders the listing's images (cover first) in one reserved-aspect
 * stage with:
 *  - 5-second auto crossfade through the cover + gallery images (via
 *    useCardMediaRotation) — paused on hover/focus/touch, hidden tabs and
 *    reduced motion; single-image listings never rotate
 *  - a full-stage click target that opens the card lightbox (media button
 *    lives at z-[1]; cards render their own action controls at z-[2]+)
 *  - graceful broken-media fallback (per-image onError, decorative gradient)
 *  - decorative `overlay` children (rank-path, glyphs) rendered above the
 *    media at z-[2] with pointer-events-none so the stage stays clickable
 *  - lazy-loaded images, no layout shift (reserved height by parent class)
 *
 * The listing's canonical video is NEVER auto-played or preloaded here — a
 * video badge/cue lives on the card and playback happens in the lightbox or
 * details gallery (SafeVideo). Cards pass their resolved `videoUrl` to the
 * ImageLightbox, not to this stage.
 */
export interface CardMediaStageProps {
  /** All validated displayable image URLs (cover + gallery, cover first). */
  images: string[];
  /** Validated cover URL (deduped into `images` when not already present). */
  frontImage: string | null;
  title: string;
  /** Stage sizing (height etc.). Defaults to the standard product stage. */
  className?: string;
  /** Decorative fallback gradient for no-media listings. */
  fallbackGradient?: string;
  /** Decorative overlays above the media. Must be pointer-events-none. */
  overlay?: React.ReactNode;
  onOpenLightbox: () => void;
}

export function CardMediaStage({
  images,
  frontImage,
  title,
  className,
  fallbackGradient,
  overlay,
  onOpenLightbox,
}: CardMediaStageProps) {
  // Rotation pool: cover first, then gallery — deduped, cover takes priority.
  const pool = React.useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    const push = (url: string | null | undefined) => {
      if (!url || seen.has(url)) return;
      seen.add(url);
      out.push(url);
    };
    push(frontImage);
    images.forEach(push);
    return out;
  }, [frontImage, images]);

  const stageRef = React.useRef<HTMLDivElement | null>(null);
  // IntersectionObserver: only rotate when visible or near viewport.
  // Start true (optimistic) so rotation begins immediately for visible cards;
  // the observer corrects to false for offscreen cards.
  const [isVisible, setIsVisible] = React.useState(true);
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "200px 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rotation = useCardMediaRotation(pool.length, { enabled: isVisible });
  const [brokenUrls, setBrokenUrls] = React.useState<Set<number>>(new Set());
  const markBroken = React.useCallback((i: number) => {
    setBrokenUrls((s) => (s.has(i) ? s : new Set(s).add(i)));
  }, []);
  // A resource that fails BEFORE React attaches its onError listener (offline,
  // blocked network, instant 4xx) never fires a synthetic event — but the
  // browser still reports complete=true / naturalWidth=0. Re-scan the mounted
  // images after mount and whenever the active slide changes so those failures
  // still reach the decorative-gradient fallback.
  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    // Deferred so the browser can settle the image (a fast-failing resource
    // reports complete=true / naturalWidth=0 in the next frame even when the
    // error event fired before React attached its onError listener).
    const id = requestAnimationFrame(() => {
      const failed: number[] = [];
      stage.querySelectorAll("img").forEach((img) => {
        if (img.complete && img.naturalWidth === 0) {
          const src = img.getAttribute("src");
          const i = src ? pool.findIndex((p) => p === src) : -1;
          if (i >= 0) failed.push(i);
        }
      });
      if (failed.length) {
        setBrokenUrls((s) => {
          const next = new Set(s);
          failed.forEach((i) => next.add(i));
          return next;
        });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [rotation.index, pool]);
  const allBroken = pool.length > 0 && pool.every((_, i) => brokenUrls.has(i));
  const showMedia = pool.length > 0 && !allBroken;
  // Render at most the next 3 images after the active one so a 30-image
  // gallery never mounts 30 stacked <img> layers on one card.
  const visibleRange = React.useMemo(() => {
    const len = pool.length;
    const start = Math.max(0, rotation.index - 1);
    const end = Math.min(len, start + 3);
    return { start, end };
  }, [pool.length, rotation.index]);

  return (
    <div ref={stageRef} data-rotation-index={rotation.index} data-rotation-paused={rotation.paused || undefined} className={cn("relative h-full w-full overflow-hidden rounded-t-3xl", className)}>
      {/* Decorative fallback — always beneath the images */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: fallbackGradient ?? DECORATIVE_GRADIENT,
        }}
      />

      {showMedia ? (
        <button
          type="button"
          aria-label={`View media for ${title}`}
          onClick={onOpenLightbox}
          className="absolute inset-0 z-[1] cursor-pointer"
          onPointerEnter={rotation.hold}
          onPointerLeave={rotation.release}
          onFocusCapture={rotation.hold}
          onBlurCapture={rotation.release}
          onPointerDownCapture={rotation.hold}
        >
          {pool.map((url, i) => {
            const inView = i >= visibleRange.start && i < visibleRange.end;
            const active = i === rotation.index;
            return (
              <img
                key={url}
                src={url}
                alt={i === 0 ? title : ""}
                loading="lazy"
                decoding="async"
                aria-hidden={i !== 0}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover",
                  "transition-[opacity,transform] duration-700 ease-out",
                  active && !brokenUrls.has(i) ? "opacity-100" : "opacity-0",
                  active && "group-hover:scale-105",
                )}
                onError={() => markBroken(i)}
                style={inView ? undefined : { display: "none" }}
              />
            );
          })}
          {/* Light sweep on hover */}
          <div
            aria-hidden
            className="sheen-sweep pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </button>
      ) : (
        <div aria-hidden className="absolute inset-0 flex items-center justify-center">
          <ImageOff className="h-6 w-6 text-[var(--ink-soft)] opacity-40" />
        </div>
      )}

      {/* Decorative overlays above the media (never intercept clicks) */}
      {overlay && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[2]">
          {overlay}
        </div>
      )}
    </div>
  );
}
