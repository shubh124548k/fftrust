"use client";

import * as React from "react";
import { validateVideoUrl } from "@/lib/validation";
import { getYouTubeId, getVimeoId } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Canonical Video Component (single reusable video template).
 *
 * THE one video renderer for the whole app. Every category (accounts, panel
 * services, paid push, Instagram) plays its video through this component —
 * the Details media viewer (media-gallery) and the card lightbox both consume
 * it, so video behavior is defined exactly once.
 *
 * The URL is ALWAYS the canonical `videoUrl` from src/data (never a hardcoded
 * URL in the UI). Rendering is decided by the URL itself:
 *  - YouTube URLs → sandboxed iframe embed (youtube-nocookie)
 *  - Vimeo URLs → sandboxed iframe embed
 *  - Direct video files (.mp4, .webm, etc.) → <video> element
 *  - All other URLs → rejected (not rendered)
 *
 * Playback contract (uniform across every provider):
 *  - MUTED BY DEFAULT (mute=1 / muted=1 / muted attr) — no sound until the
 *    visitor opts in via the player controls
 *  - playsinline / playsInline — no fullscreen takeover on mobile, inline play
 *  - NOT autoplay — the visitor presses play; preload=metadata for direct files
 *  - No microphone permission on any provider (`allow` never grants `microphone`)
 *  - `allowFullScreen` kept so the visitor can enter true fullscreen
 *  - Lazy loading — the player element is only loaded when it scrolls near the
 *    viewport (never fetched for sections the visitor never opens)
 *
 * Security:
 *  - Never renders arbitrary iframe HTML
 *  - Uses sandbox attribute to restrict iframe capabilities
 *  - Validates URL scheme (http/https only, provider allowlist)
 *  - No JavaScript execution from untrusted sources
 *
 * Responsive:
 *  - Standalone: 16:9 aspect ratio with max-height constraints
 *  - `fill`: fills the nearest positioned parent (used inside media stages,
 *    e.g. the Details gallery stage or the lightbox player)
 */

interface SafeVideoProps {
  url: string;
  title?: string;
  className?: string;
  poster?: string;
  /** When true, fills the nearest positioned parent (no aspect-ratio wrapper)
   *  — for embedding inside media stages / lightbox players. */
  fill?: boolean;
}

export function SafeVideo({ url, title, className, poster, fill }: SafeVideoProps) {
  const validatedUrl = validateVideoUrl(url);

  if (!validatedUrl) {
    // Silently skip invalid/unsafe video URLs — no empty player shown
    return null;
  }

  const youTubeId = getYouTubeId(validatedUrl);
  const vimeoId = getVimeoId(validatedUrl);

  const containerClass = fill
    ? cn("absolute inset-0 h-full w-full overflow-hidden", className)
    : cn(
        "relative w-full overflow-hidden rounded-2xl",
        "aspect-video",
        className,
      );

  // Uniform `allow` list: NEVER includes `microphone` (no listener mic), no
  // autoplay (visitor opt-in only), fullscreen + picture-in-picture kept.
  const iframeAllow = "encrypted-media; picture-in-picture; fullscreen; clipboard-write";

  return (
    <div className={containerClass}>
      {youTubeId ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youTubeId}?mute=1&playsinline=1&modestbranding=1&rel=0`}
          title={title || "Video"}
          loading="lazy"
          className="absolute inset-0 h-full w-full"
          allow={iframeAllow}
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        />
      ) : vimeoId ? (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?muted=1&playsinline=1`}
          title={title || "Video"}
          loading="lazy"
          className="absolute inset-0 h-full w-full"
          allow={iframeAllow}
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        />
      ) : (
        <video
          src={validatedUrl}
          poster={poster}
          controls
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-contain"
        >
          Your browser does not support video playback.
        </video>
      )}
    </div>
  );
}
