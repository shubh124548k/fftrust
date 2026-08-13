/**
 * FF TRUST — Homepage rotation windows (PROMPT 3).
 *
 * Deterministic, data-driven homepage rotation over a **sliding window** that
 * advances one record at a time and wraps around the pool.
 *
 * Why a window and not page-slices: with the current canonical sample counts
 * (3 accounts / 2 panel / 2 push) a 3-per-page slice yields exactly ONE page,
 * so the section never visibly rotates. A sliding window always produces
 * `pool.length` windows — every section actually animates every 5 seconds and
 * the window steps forward, while the window content remains 100% canonical.
 *
 * Rules:
 *  - 0 records            -> no windows (empty state, no rotation)
 *  - 1 record             -> 1 window, no rotation (one card cannot rotate)
 *  - 2 records [A,B]      -> [A,B], [B,A] (visible swap every cycle)
 *  - 3 records [A,B,C]    -> [A,B,C], [B,C,A], [C,A,B] (visible reorder loop)
 *  - 5 records [A,B,C,D,E]-> [A,B,C], [B,C,D], [C,D,E], [D,E,A], [E,A,B]
 *                            (genuinely different cards appear each step)
 *  - a record never appears twice inside one visible window
 *  - the pool order (after sort) is the source of truth: adding a canonical
 *    record automatically joins the rotation, removing one disappears it.
 */

export const ROTATION_PAGE_SIZE = 3;

/**
 * Build rotation windows over `records`. Window count == pool length; each
 * window is the next `windowSize` records starting at index `i`, wrapping.
 */
export function buildRotationWindows<T>(
  records: readonly T[],
  windowSize = ROTATION_PAGE_SIZE,
): T[][] {
  const n = records.length;
  if (n === 0) return [];
  const size = Math.max(1, Math.min(windowSize, n));
  if (size >= n) {
    // Window covers the whole pool -> rotate the ordering so every section
    // still visibly animates (positions shift) with current sample counts.
    const windows: T[][] = [];
    for (let i = 0; i < n; i++) {
      const w: T[] = [];
      for (let j = 0; j < n; j++) w.push(records[(i + j) % n]);
      windows.push(w);
    }
    return windows;
  }
  const windows: T[][] = [];
  for (let i = 0; i < n; i++) {
    const w: T[] = [];
    for (let j = 0; j < size; j++) w.push(records[(i + j) % n]);
    windows.push(w);
  }
  return windows;
}

/**
 * Back-compat alias: page-slicing helper retained for any consumer that still
 * wants strict non-overlapping pages (full catalogue / tests). Home sections
 * use `buildRotationWindows`.
 */
export function buildRotationPages<T>(
  records: readonly T[],
  pageSize = ROTATION_PAGE_SIZE,
): T[][] {
  if (pageSize <= 0) return records.length > 0 ? [records.slice()] : [];
  const pages: T[][] = [];
  for (let i = 0; i < records.length; i += pageSize) {
    pages.push(records.slice(i, i + pageSize));
  }
  return pages;
}

/** True when the section should auto-rotate (more than one visible window). */
export function shouldAutoRotate(totalWindows: number): boolean {
  return totalWindows > 1;
}
