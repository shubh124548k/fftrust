import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Route Transition.
 *
 * A subtle, non-blocking entrance animation applied to the main content on
 * mount. Transform/opacity only (no layout shift), 420ms outExpo, reduced-motion
 * safe (the CSS `.route-transition` is frozen to near-instant by the global
 * reduced-motion rule). Never slows interaction — it's purely decorative and
 * the content is interactive immediately.
 *
 * For a single-page app with anchor navigation, this wraps the page content so
 * each "route" (the home experience) gets a cinematic entrance. Future
 * multi-route prompts can wrap each route's content with this same component.
 */
export function RouteTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("route-transition", className)}>{children}</div>;
}
