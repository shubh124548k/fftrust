"use client";

import * as React from "react";
import { validateVideoUrl } from "@/lib/validation";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Safe Video Component.
 *
 * Renders video URLs from canonical data with allowlist-based safety:
 *  - YouTube URLs → sandboxed iframe embed
 *  - Vimeo URLs → sandboxed iframe embed
 *  - Direct video files (.mp4, .webm, etc.) → <video> element
 *  - All other URLs → rejected (not rendered)
 *
 * Security:
 *  - Never renders arbitrary iframe HTML
 *  - Uses sandbox attribute to restrict iframe capabilities
 *  - Validates URL scheme (http/https only)
 *  - No JavaScript execution from untrusted sources
 *
 * Responsive:
 *  - 16:9 aspect ratio maintained
 *  - Max-height constraints for mobile
 *  - Lazy loading
 */

interface SafeVideoProps {
  url: string;
  title?: string;
  className?: string;
  poster?: string;
}

/** Extract YouTube video ID from various URL formats. */
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/** Extract Vimeo video ID from URL. */
function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

export function SafeVideo({ url, title, className, poster }: SafeVideoProps) {
  const validatedUrl = validateVideoUrl(url);

  if (!validatedUrl) {
    // Silently skip invalid/unsafe video URLs — no empty player shown
    return null;
  }

  const youTubeId = getYouTubeId(validatedUrl);
  const vimeoId = getVimeoId(validatedUrl);

  const containerClass = cn(
    "relative w-full overflow-hidden rounded-2xl",
    "aspect-video",
    className,
  );

  // YouTube embed
  if (youTubeId) {
    return (
      <div className={containerClass}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youTubeId}`}
          title={title || "Video"}
          loading="lazy"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        />
      </div>
    );
  }

  // Vimeo embed
  if (vimeoId) {
    return (
      <div className={containerClass}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          title={title || "Video"}
          loading="lazy"
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        />
      </div>
    );
  }

  // Direct video file
  return (
    <div className={containerClass}>
      <video
        src={validatedUrl}
        poster={poster}
        controls
        preload="metadata"
        className="absolute inset-0 h-full w-full object-contain"
      >
        Your browser does not support video playback.
      </video>
    </div>
  );
}
