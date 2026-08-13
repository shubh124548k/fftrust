import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

/**
 * FF TRUST — Breadcrumbs (PROMPT 3).
 *
 * Accessible, responsive navigation trail. The current page is marked with
 * `aria-current="page"` and rendered as plain text (no link). Wraps on narrow
 * screens so it can never overflow. Pure server component — no client state.
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono-label text-[10px] text-[var(--ink-soft)] sm:text-xs">
        <li>
          <Link
            href="/"
            className="inline-flex items-center gap-1 transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
          >
            <Home className="h-3 w-3" aria-hidden />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex min-w-0 items-center gap-1.5">
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate text-[var(--ink)]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
