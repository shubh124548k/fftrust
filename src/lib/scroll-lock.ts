/**
 * FF TRUST — Global scroll lock utility.
 *
 * Uses a counter so multiple components (popup, mobile command center) can
 * lock/unlock scroll without race conditions. The lock is only removed when
 * ALL components have unlocked. This prevents the bug where:
 *  - Component A locks (count=1)
 *  - Component B locks (count=2)
 *  - Component A unlocks (count=1, still locked)
 *  - Component B unlocks (count=0, fully unlocked)
 *
 * Without this, each component saves/restores "previous" overflow values,
 * which causes a race condition when one component captures another's
 * "hidden" state and restores it on cleanup — permanently locking the page.
 */

let lockCount = 0;
let savedScrollY = 0;

// Active event listeners (stored so we can remove them exactly once)
let activeWheelListener: ((e: WheelEvent) => void) | null = null;
let activeTouchListener: ((e: TouchEvent) => void) | null = null;
let activeKeyListener: ((e: KeyboardEvent) => void) | null = null;

/**
 * Returns the scrollable container of a dialog, if any. This is the element
 * that should be allowed to scroll even when the background is locked.
 */
function getScrollContainer(ref?: React.RefObject<HTMLElement | null> | null): HTMLElement | null {
  return ref?.current ?? null;
}

/**
 * Lock scroll on the page. Call this when a modal/popup/drawer opens.
 * Pass a ref to the scrollable container so wheel/touch events inside it
 * are allowed (not blocked).
 */
export function lockBodyScroll(scrollRef?: React.RefObject<HTMLElement | null>) {
  lockCount++;

  // Save scroll position on first lock
  if (lockCount === 1) {
    savedScrollY = window.scrollY;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  // If listeners are already active, update the scroll ref they check against
  // by removing and re-adding with the new ref. This ensures the current
  // topmost modal's scroll area is the one that's allowed.
  if (activeWheelListener) {
    document.removeEventListener("wheel", activeWheelListener);
  }
  if (activeTouchListener) {
    document.removeEventListener("touchmove", activeTouchListener);
  }
  if (activeKeyListener) {
    window.removeEventListener("keydown", activeKeyListener);
  }

  // Block wheel scroll (except inside the scroll container)
  activeWheelListener = (e: WheelEvent) => {
    const container = getScrollContainer(scrollRef);
    if (container && container.contains(e.target as Node)) return;
    e.preventDefault();
  };
  document.addEventListener("wheel", activeWheelListener, { passive: false });

  // Block touchmove (except inside the scroll container)
  activeTouchListener = (e: TouchEvent) => {
    const container = getScrollContainer(scrollRef);
    if (container && container.contains(e.target as Node)) return;
    e.preventDefault();
  };
  document.addEventListener("touchmove", activeTouchListener, { passive: false });

  // Block keyboard scroll keys
  const scrollKeys = new Set([
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
    " ", "PageUp", "PageDown", "Home", "End",
  ]);
  activeKeyListener = (e: KeyboardEvent) => {
    if (e.key === "Escape") return; // handled by component
    const container = getScrollContainer(scrollRef);
    if (scrollKeys.has(e.key) && !(container?.contains(e.target as Node))) {
      e.preventDefault();
    }
  };
  window.addEventListener("keydown", activeKeyListener);
}

/**
 * Unlock scroll on the page. Call this when a modal/popup/drawer closes.
 * The lock is only fully removed when all components have unlocked.
 */
export function unlockBodyScroll() {
  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0) {
    // Fully unlock — remove all listeners and restore overflow
    if (activeWheelListener) {
      document.removeEventListener("wheel", activeWheelListener);
      activeWheelListener = null;
    }
    if (activeTouchListener) {
      document.removeEventListener("touchmove", activeTouchListener);
      activeTouchListener = null;
    }
    if (activeKeyListener) {
      window.removeEventListener("keydown", activeKeyListener);
      activeKeyListener = null;
    }
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    // Restore scroll position
    window.scrollTo(0, savedScrollY);
  }
}

/**
 * Force unlock — clears everything regardless of counter.
 * Use this as a safety net in case of unexpected unmounts.
 */
export function forceUnlockBodyScroll() {
  lockCount = 0;
  if (activeWheelListener) {
    document.removeEventListener("wheel", activeWheelListener);
    activeWheelListener = null;
  }
  if (activeTouchListener) {
    document.removeEventListener("touchmove", activeTouchListener);
    activeTouchListener = null;
  }
  if (activeKeyListener) {
    window.removeEventListener("keydown", activeKeyListener);
    activeKeyListener = null;
  }
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}
