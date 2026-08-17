import { Info } from "lucide-react";

/**
 * FF TRUST — SAMPLE Notice Banner.
 *
 * Rendered whenever a marketplace is showing demo (SAMPLE) fixtures because
 * the owner has not yet published real canonical inventory. Keeps the listing
 * honest: demo records are always clearly labeled, never presented as real.
 */
export function SampleNoticeBanner() {
  return (
    <div
      className="glass-stack acrylic-sheen flex items-start gap-3 rounded-2xl p-4"
      style={{ boxShadow: "var(--glass-shadow-lift)" }}
      role="status"
      aria-label="Sample listings notice"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: "linear-gradient(135deg, oklch(0.74 0.15 196) 0%, oklch(0.6 0.19 290) 100%)",
        }}
      >
        <Info className="h-4 w-4 text-white" />
      </span>
      <div className="min-w-0">
        <p className="font-mono-label text-[9px] font-semibold text-[var(--accent-azure)]">
          SAMPLE PREVIEW
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--ink-soft)] text-pretty">
          The owner has not published real listings yet. The cards below are
          demo fixtures showing the layout — no real inventory is displayed.
          Published canonical records replace them automatically.
        </p>
      </div>
    </div>
  );
}
