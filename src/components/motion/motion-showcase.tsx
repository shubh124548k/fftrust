"use client";

import * as React from "react";
import { Sparkles, MousePointerClick, Wind, Zap, Layers, ArrowRight } from "lucide-react";
import { GlassPanel } from "@/components/visual/glass-panel";
import { SectionHeading } from "@/components/visual/section-heading";
import { RevealText } from "@/components/visual/reveal-text";
import { MagneticButton } from "@/components/visual/magnetic-button";
import { ParallaxLayer } from "@/components/visual/parallax-layer";
import { SculpturalObject } from "@/components/visual/sculptural-object";
import { useReveal } from "@/lib/design/use-performance-tier";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Motion Showcase (PROMPT 12).
 *
 * Proves the central motion system: staggered text, card reveal, hover/press,
 * magnetic button, 3D drift, neon sweep, glass reflection, parallax depth.
 * Each demo is interactive and tier-aware.
 */
export function MotionShowcase() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        overline="Motion Engine"
        title="One central"
        italic="motion system"
        support="Physically believable timing. Background moves slowly; hero objects have deeper parallax; foreground UI has restrained movement. Three tiers: high, balanced, reduced. Transform/opacity only — no layout shift. Motion never obscures data."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <StaggerDemo />
        <CardRevealDemo />
        <MagneticDemo />
        <DriftDemo />
        <NeonSweepDemo />
        <GlassReflectionDemo />
      </div>
    </div>
  );
}

function StaggerDemo() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <GlassPanel depth="float" className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[var(--accent-azure)]" />
        <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">Text stagger</p>
      </div>
      <div ref={ref} className={cn("text-stagger", visible && "is-visible")}>
        {["Account", "trust", "engineered", "with", "light"].map((word, i) => (
          <span
            key={word}
            className="mr-2 inline-block font-heading text-2xl font-semibold text-[var(--ink)]"
            style={{ transitionDelay: `${i * 70}ms` }}
          >
            {word}
          </span>
        ))}
      </div>
    </GlassPanel>
  );
}

function CardRevealDemo() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <GlassPanel depth="float" className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Layers className="h-4 w-4 text-[var(--accent-azure)]" />
        <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">Card reveal</p>
      </div>
      <div ref={ref} className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn("card-reveal glass-embed aspect-square rounded-xl", visible && "is-visible")}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className="flex h-full items-center justify-center font-heading text-lg font-semibold text-[var(--accent-azure)]">
              {String(i + 1).padStart(2, "0")}
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

function MagneticDemo() {
  return (
    <GlassPanel depth="float" className="flex flex-col items-center justify-center gap-4 p-6">
      <div className="mb-2 flex items-center gap-2">
        <MousePointerClick className="h-4 w-4 text-[var(--accent-azure)]" />
        <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">Magnetic + press</p>
      </div>
      <MagneticButton strength={12} className="press-feedback px-6 py-3">
        Hover me
        <ArrowRight className="h-4 w-4" />
      </MagneticButton>
      <p className="font-mono-label text-[8px] text-[var(--ink-soft)]">Pointer parallax on desktop · disabled on touch</p>
    </GlassPanel>
  );
}

function DriftDemo() {
  return (
    <GlassPanel depth="float" className="flex flex-col items-center justify-center gap-4 p-6">
      <div className="mb-2 flex items-center gap-2">
        <Wind className="h-4 w-4 text-[var(--accent-azure)]" />
        <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">3D drift + parallax</p>
      </div>
      <ParallaxLayer depth={2} className="relative h-24 w-24">
        <SculpturalObject className="h-full w-full" />
      </ParallaxLayer>
      <p className="font-mono-label text-[8px] text-[var(--ink-soft)]">Slow camera drift · scroll for parallax</p>
    </GlassPanel>
  );
}

function NeonSweepDemo() {
  return (
    <GlassPanel depth="float" className="flex flex-col items-center justify-center gap-4 p-6">
      <div className="mb-2 flex items-center gap-2">
        <Zap className="h-4 w-4 text-[var(--accent-azure)]" />
        <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">Neon edge sweep</p>
      </div>
      <button
        type="button"
        className="neon-sweep-edge glass-embed press-feedback rounded-full border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
      >
        Hover for neon sweep
      </button>
      <p className="font-mono-label text-[8px] text-[var(--ink-soft)]">Controlled accent · high tier only</p>
    </GlassPanel>
  );
}

function GlassReflectionDemo() {
  return (
    <GlassPanel depth="float" className="flex flex-col items-center justify-center gap-4 p-6">
      <div className="mb-2 flex items-center gap-2">
        <Layers className="h-4 w-4 text-[var(--accent-azure)]" />
        <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">Glass reflection</p>
      </div>
      <div className="glass-reflection glass-float relative flex h-20 w-full max-w-xs items-center justify-center rounded-2xl">
        <p className="font-heading text-sm font-semibold text-[var(--ink)]">Slow sheen sweep</p>
      </div>
      <p className="font-mono-label text-[8px] text-[var(--ink-soft)]">8s loop · disabled in reduced motion</p>
    </GlassPanel>
  );
}
