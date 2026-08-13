"use client";

import { useScrollProgress } from "@/lib/design/motion-system";

export function ScrollProgressBar() {
  const progress = useScrollProgress();
  return (
    <div
      className="scroll-progress-bar"
      style={{ transform: `scaleX(${progress})` }}
      aria-hidden
    />
  );
}
