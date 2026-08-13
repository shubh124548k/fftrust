"use client";

import * as React from "react";
import { Object3D, ObjectGradients } from "./object-3d";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — HolographicShield.
 *
 * Original anime-inspired futuristic shield: translucent faceted hexagon with
 * a luminous inner core and orbiting light arcs. Communicates trust/protection
 * without copying any protected character. Decorative only.
 */
export function HolographicShield({ className }: { className?: string }) {
  return (
    <Object3D className={className} tiltStrength={10}>
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, oklch(0.82 0.12 200 / 0.5) 0%, oklch(0.7 0.12 290 / 0.24) 40%, oklch(1 0 0 / 0) 68%)",
        }}
      />
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <ObjectGradients idPrefix="shield" />
        <filter id="shield-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1" />
        </filter>
        {/* Outer hex shield */}
        <g filter="url(#shield-soft)">
          <polygon
            points="200,40 340,120 340,280 200,360 60,280 60,120"
            fill="url(#shield-facetA)"
            stroke="oklch(1 0 0 / 0.6)"
            strokeWidth="1.2"
          />
          <polygon
            points="200,80 305,140 305,260 200,320 95,260 95,140"
            fill="url(#shield-facetB)"
            stroke="oklch(0.74 0.15 196 / 0.5)"
            strokeWidth="0.8"
            opacity="0.8"
          />
        </g>
        {/* Inner core */}
        <circle cx="200" cy="200" r="52" fill="url(#shield-glow)" />
        <circle cx="200" cy="200" r="22" fill="url(#shield-core)" opacity="0.92" />
        {/* Orbiting arcs */}
        <ellipse cx="200" cy="200" rx="150" ry="60" fill="none" stroke="oklch(0.74 0.15 196 / 0.4)" strokeWidth="0.8" strokeDasharray="3 6" />
        <ellipse cx="200" cy="200" rx="60" ry="150" fill="none" stroke="oklch(0.6 0.19 290 / 0.3)" strokeWidth="0.6" strokeDasharray="2 8" />
      </svg>
      <div className="sheen-sweep rounded-full" style={{ mixBlendMode: "screen" }} />
    </Object3D>
  );
}

/**
 * FF TRUST — DataCube.
 *
 * Transparent data cube with visible edges and a floating inner shard —
 * communicates data/transparency. Original abstract geometry.
 */
export function DataCube({ className }: { className?: string }) {
  return (
    <Object3D className={className} tiltStrength={14}>
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.74 0.15 196 / 0.4) 0%, oklch(0.62 0.16 258 / 0.2) 45%, oklch(1 0 0 / 0) 70%)",
        }}
      />
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <ObjectGradients idPrefix="cube" />
        {/* Cube faces — isometric */}
        <g opacity="0.85">
          {/* top */}
          <polygon points="200,80 320,140 200,200 80,140" fill="url(#cube-facetA)" stroke="oklch(1 0 0 / 0.6)" strokeWidth="0.9" />
          {/* right */}
          <polygon points="320,140 320,260 200,320 200,200" fill="url(#cube-facetB)" stroke="oklch(1 0 0 / 0.5)" strokeWidth="0.9" />
          {/* left */}
          <polygon points="80,140 80,260 200,320 200,200" fill="url(#cube-facetA)" stroke="oklch(1 0 0 / 0.5)" strokeWidth="0.9" opacity="0.6" />
        </g>
        {/* Inner floating shard */}
        <polygon points="200,170 250,195 200,220 150,195" fill="url(#cube-core)" opacity="0.8" />
        {/* Edge highlights */}
        <line x1="200" y1="80" x2="200" y2="200" stroke="oklch(1 0 0 / 0.35)" strokeWidth="0.6" />
        <line x1="200" y1="200" x2="320" y2="140" stroke="oklch(1 0 0 / 0.3)" strokeWidth="0.5" />
        <line x1="200" y1="200" x2="80" y2="140" stroke="oklch(1 0 0 / 0.3)" strokeWidth="0.5" />
      </svg>
      <div className="sheen-sweep rounded-full" style={{ mixBlendMode: "screen" }} />
    </Object3D>
  );
}

/**
 * FF TRUST — LuminousRings.
 *
 * Concentric luminous rings with a holographic core — communicates rank/
 * progression. Original abstract geometry, no protected insignia.
 */
export function LuminousRings({ className }: { className?: string }) {
  return (
    <Object3D className={className} tiltStrength={8} drift={false}>
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.82 0.12 200 / 0.35) 0%, oklch(0.6 0.19 290 / 0.18) 50%, oklch(1 0 0 / 0) 72%)",
        }}
      />
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <ObjectGradients idPrefix="rings" />
        <g opacity="0.9">
          <circle cx="200" cy="200" r="180" fill="none" stroke="url(#rings-facetA)" strokeWidth="1.4" />
          <circle cx="200" cy="200" r="140" fill="none" stroke="url(#rings-facetB)" strokeWidth="1" strokeDasharray="4 8" />
          <circle cx="200" cy="200" r="100" fill="none" stroke="url(#rings-facetA)" strokeWidth="0.8" />
          <circle cx="200" cy="200" r="62" fill="url(#rings-glow)" />
          <circle cx="200" cy="200" r="26" fill="url(#rings-core)" />
        </g>
        {/* Tick marks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const r2 = (n: number) => n.toFixed(2);
          const x1 = 200 + Math.cos(a) * 185;
          const y1 = 200 + Math.sin(a) * 185;
          const x2 = 200 + Math.cos(a) * 175;
          const y2 = 200 + Math.sin(a) * 175;
          return <line key={i} x1={r2(x1)} y1={r2(y1)} x2={r2(x2)} y2={r2(y2)} stroke="oklch(0.74 0.15 196 / 0.5)" strokeWidth="1" />;
        })}
      </svg>
      <div className="sheen-sweep rounded-full" style={{ mixBlendMode: "screen" }} />
    </Object3D>
  );
}

/**
 * FF TRUST — ControllerGeometry.
 *
 * Abstract controller-inspired geometry — two translucent grips and a
 * holographic center. Futuristic/anime-inspired, NOT a real product copy.
 */
export function ControllerGeometry({ className }: { className?: string }) {
  return (
    <Object3D className={className} tiltStrength={12}>
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 55%, oklch(0.74 0.15 196 / 0.4) 0%, oklch(0.6 0.19 290 / 0.2) 45%, oklch(1 0 0 / 0) 70%)",
        }}
      />
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <ObjectGradients idPrefix="ctrl" />
        {/* Body — rounded abstract shape */}
        <path
          d="M 110 180 Q 90 120 150 110 L 250 110 Q 310 120 290 180 Q 300 240 240 250 L 160 250 Q 100 240 110 180 Z"
          fill="url(#ctrl-facetA)"
          stroke="oklch(1 0 0 / 0.55)"
          strokeWidth="1"
          opacity="0.85"
        />
        {/* Grips */}
        <ellipse cx="120" cy="220" rx="40" ry="55" fill="url(#ctrl-facetB)" stroke="oklch(1 0 0 / 0.4)" strokeWidth="0.8" opacity="0.7" />
        <ellipse cx="280" cy="220" rx="40" ry="55" fill="url(#ctrl-facetB)" stroke="oklch(1 0 0 / 0.4)" strokeWidth="0.8" opacity="0.7" />
        {/* Center core */}
        <circle cx="200" cy="180" r="32" fill="url(#ctrl-glow)" />
        <circle cx="200" cy="180" r="14" fill="url(#ctrl-core)" />
        {/* Abstract pads */}
        <circle cx="160" cy="200" r="8" fill="oklch(0.74 0.15 196 / 0.5)" />
        <circle cx="240" cy="200" r="8" fill="oklch(0.6 0.19 290 / 0.5)" />
      </svg>
      <div className="sheen-sweep rounded-full" style={{ mixBlendMode: "screen" }} />
    </Object3D>
  );
}

/**
 * FF TRUST — GlassCapsule.
 *
 * A translucent glass capsule containing a floating shard — communicates
 * "contained/verified". Original abstract.
 */
export function GlassCapsule({ className }: { className?: string }) {
  return (
    <Object3D className={className} tiltStrength={10}>
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.82 0.1 200 / 0.35) 0%, oklch(0.62 0.16 258 / 0.18) 50%, oklch(1 0 0 / 0) 72%)",
        }}
      />
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <ObjectGradients idPrefix="cap" />
        {/* Capsule body */}
        <rect x="150" y="70" width="100" height="260" rx="50" fill="url(#cap-facetA)" stroke="oklch(1 0 0 / 0.55)" strokeWidth="1" opacity="0.7" />
        <rect x="160" y="80" width="80" height="240" rx="40" fill="none" stroke="oklch(0.74 0.15 196 / 0.4)" strokeWidth="0.7" strokeDasharray="2 5" />
        {/* Inner floating shard */}
        <polygon points="200,150 235,200 200,250 165,200" fill="url(#cap-core)" opacity="0.85" />
        <polygon points="200,170 220,200 200,230 180,200" fill="oklch(1 0 0)" opacity="0.6" />
        {/* Caps */}
        <ellipse cx="200" cy="70" rx="50" ry="14" fill="url(#cap-facetB)" stroke="oklch(1 0 0 / 0.5)" strokeWidth="0.8" />
        <ellipse cx="200" cy="330" rx="50" ry="14" fill="url(#cap-facetB)" stroke="oklch(1 0 0 / 0.5)" strokeWidth="0.8" />
      </svg>
      <div className="sheen-sweep rounded-full" style={{ mixBlendMode: "screen" }} />
    </Object3D>
  );
}

/**
 * FF TRUST — FloatingDossier.
 *
 * A floating account-dossier abstraction — stacked translucent panels with a
 * holographic seal. Communicates "account record / verified file". Decorative.
 */
export function FloatingDossier({ className }: { className?: string }) {
  return (
    <Object3D className={className} tiltStrength={11}>
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.74 0.15 196 / 0.35) 0%, oklch(0.6 0.19 290 / 0.18) 50%, oklch(1 0 0 / 0) 72%)",
        }}
      />
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <ObjectGradients idPrefix="doss" />
        {/* Back panel */}
        <rect x="120" y="90" width="160" height="220" rx="12" fill="url(#doss-facetA)" stroke="oklch(1 0 0 / 0.4)" strokeWidth="0.8" opacity="0.6" transform="rotate(-6 200 200)" />
        {/* Mid panel */}
        <rect x="130" y="100" width="150" height="210" rx="12" fill="url(#doss-facetB)" stroke="oklch(1 0 0 / 0.5)" strokeWidth="0.9" opacity="0.8" />
        {/* Front panel */}
        <rect x="140" y="110" width="140" height="200" rx="12" fill="oklch(1 0 0 / 0.35)" stroke="oklch(1 0 0 / 0.6)" strokeWidth="1" />
        {/* Lines (abstract content) */}
        <line x1="160" y1="140" x2="260" y2="140" stroke="oklch(0.74 0.15 196 / 0.4)" strokeWidth="1.2" />
        <line x1="160" y1="160" x2="240" y2="160" stroke="oklch(0.62 0.16 258 / 0.3)" strokeWidth="1" />
        <line x1="160" y1="180" x2="250" y2="180" stroke="oklch(0.74 0.15 196 / 0.35)" strokeWidth="1" />
        <line x1="160" y1="200" x2="220" y2="200" stroke="oklch(0.6 0.19 290 / 0.3)" strokeWidth="1" />
        {/* Holographic seal */}
        <circle cx="210" cy="260" r="22" fill="url(#doss-glow)" />
        <circle cx="210" cy="260" r="11" fill="url(#doss-core)" />
      </svg>
      <div className="sheen-sweep rounded-full" style={{ mixBlendMode: "screen" }} />
    </Object3D>
  );
}
