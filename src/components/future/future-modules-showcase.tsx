"use client";

import * as React from "react";
import { Sparkles, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { GlassPanel } from "@/components/visual/glass-panel";
import { SectionHeading } from "@/components/visual/section-heading";
import { RevealText } from "@/components/visual/reveal-text";
import { StatusChip } from "@/components/visual/status-chip";
import { MagneticButton } from "@/components/visual/magnetic-button";
import {
  Home, Compass, ShieldCheck, BadgeIndianRupee, LayoutList, Server,
  Trophy, Video, Workflow, AlertTriangle, Columns3, HelpCircle, Info,
  Scale, MessageCircle, GraduationCap, Circle,
} from "lucide-react";
import { getAllPublishedModules, getComingModules } from "@/lib/selectors/modules";
import { cn } from "@/lib/utils";
import type { ModuleDefinition } from "@/data/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Compass, ShieldCheck, BadgeIndianRupee, LayoutList, Server,
  Trophy, Video, Workflow, AlertTriangle, Columns3, HelpCircle, Info,
  Scale, MessageCircle, GraduationCap, Circle,
};

/**
 * FF TRUST — Future Modules Showcase (PROMPT 14).
 *
 * Proves the ModuleDefinition system: all published modules (live + coming)
 * are discovered automatically from canonical configuration. A "coming" module
 * renders an honest "Coming Soon" card — never a fake link.
 *
 * Future modules inherit the same 10D system: glass depth, editorial type,
 * controlled lighting, motion tiers.
 */
export function FutureModulesShowcase() {
  const liveModules = getAllPublishedModules();
  const comingModules = getComingModules();

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        overline="Module Engine"
        title="Future-proof"
        italic="module system"
        support="Every module below is discovered from canonical configuration — adding a new ModuleDefinition automatically propagates to navigation, footer, sitemap and SEO. Future modules inherit the same 10D visual system. 'Coming Soon' modules are honest, never fake links."
      />

      {/* Live modules grid */}
      <div>
        <p className="mb-4 font-mono-label text-[9px] text-[var(--accent-azure)]">
          Live modules ({liveModules.length})
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {liveModules.map((mod, i) => (
            <RevealText key={mod.key} delay={Math.min(i * 40, 240)}>
              <ModuleCard module={mod} />
            </RevealText>
          ))}
        </div>
      </div>

      {/* Coming modules */}
      {comingModules.length > 0 && (
        <div>
          <p className="mb-4 font-mono-label text-[9px] text-[var(--accent-azure)]">
            Coming soon ({comingModules.length})
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {comingModules.map((mod, i) => (
              <RevealText key={mod.key} delay={Math.min(i * 40, 240)}>
                <ComingModuleCard module={mod} />
              </RevealText>
            ))}
          </div>
        </div>
      )}

      {/* ModuleLanding inheritance note */}
      <GlassPanel depth="embed" className="p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-azure)]" />
          <div>
            <p className="text-sm font-medium text-[var(--ink)]">ModuleLanding template</p>
            <p className="mt-1 text-xs text-[var(--ink-soft)] text-pretty">
              Future modules inherit a reusable composition: cinematic hero, search, filters, cards, detail, safety, FAQ and contact. The 10D system (glass, depth, lighting, motion tiers) applies automatically. No shell rewrites needed.
            </p>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

function ModuleCard({ module: mod }: { module: ModuleDefinition }) {
  const Icon = mod.iconKey ? iconMap[mod.iconKey] : null;
  return (
    <GlassPanel
      depth="float"
      interactive
      className="group flex flex-col gap-3 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[oklch(0.82_0.1_200/0.12)] text-[var(--accent-azure)]"
        >
          {Icon && <Icon className="h-5 w-5" />}
        </span>
        <StatusChip tone="good" icon={<CheckCircle2 className="h-3 w-3" />}>Live</StatusChip>
      </div>
      <div>
        <h3 className="font-heading text-sm font-semibold text-[var(--ink)]">{mod.label}</h3>
        {mod.description && <p className="mt-1 text-xs text-[var(--ink-soft)] text-pretty">{mod.description}</p>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {mod.category && <StatusChip tone="neutral">{mod.category}</StatusChip>}
        {mod.surface && <StatusChip tone="neutral">{mod.surface}</StatusChip>}
      </div>
      <a
        href={mod.href}
        className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-azure)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
      >
        Visit module
        <ArrowRight className="h-3 w-3" />
      </a>
    </GlassPanel>
  );
}

function ComingModuleCard({ module: mod }: { module: ModuleDefinition }) {
  const Icon = mod.iconKey ? iconMap[mod.iconKey] : null;
  return (
    <GlassPanel depth="embed" className="flex flex-col gap-3 p-5 opacity-70">
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[oklch(0.86_0.01_245/0.3)] text-[var(--ink-soft)]"
        >
          {Icon && <Icon className="h-5 w-5" />}
        </span>
        <StatusChip tone="warn" icon={<Clock className="h-3 w-3" />}>Coming Soon</StatusChip>
      </div>
      <div>
        <h3 className="font-heading text-sm font-semibold text-[var(--ink)]">{mod.label}</h3>
        {mod.description && <p className="mt-1 text-xs text-[var(--ink-soft)] text-pretty">{mod.description}</p>}
      </div>
      <p className="mt-auto font-mono-label text-[8px] text-[var(--ink-soft)]">
        Intentionally configured · not yet published
      </p>
    </GlassPanel>
  );
}
