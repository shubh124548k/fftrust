"use client";

import * as React from "react";
import {
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Search,
  Eye,
  Send,
  AlertCircle,
  Lock,
  Video,
} from "lucide-react";
import { GlassPanel } from "@/components/visual/glass-panel";
import { StatusChip } from "@/components/visual/status-chip";
import { MagneticButton } from "@/components/visual/magnetic-button";
import { GlassCapsule } from "@/components/visual/objects";
import { useReveal } from "@/lib/design/use-performance-tier";
import { buildSellerIntakeWhatsAppUrl, type SellerIntakeData } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { z } from "@/lib/design/depth";

const STEPS = [
  { key: "contact", label: "Contact Owner", icon: MessageCircle },
  { key: "details", label: "Provide Details", icon: FileText },
  { key: "evidence", label: "Provide Evidence", icon: ImageIcon },
  { key: "verification", label: "Live Verification", icon: Search },
  { key: "review", label: "Owner Review", icon: Eye },
  { key: "publication", label: "Publication", icon: Send },
] as const;

export function SellerIntakeOverlay({ onClose }: { onClose: () => void }) {
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState<SellerIntakeData>({});
  const panelRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; cancelAnimationFrame(id); };
  }, [onClose]);

  const update = (patch: Partial<SellerIntakeData>) => setData((d) => ({ ...d, ...patch }));

  const canProceed = React.useMemo(() => {
    switch (step) {
      case 0: return true;
      case 1: return !!data.title && typeof data.price === "number";
      case 2: return !!data.evidenceAvailability;
      default: return true;
    }
  }, [step, data]);

  const waUrl = buildSellerIntakeWhatsAppUrl(data);

  return (
    <div className="fixed inset-0" style={{ zIndex: z("modal") }} role="dialog" aria-modal="true" aria-label="Seller intake workflow">
      <div className="absolute inset-0 bg-[oklch(0.12_0.01_255/0.5)] backdrop-blur-md" onClick={onClose} style={{ animation: "ff-fade-in 220ms ease-out" }} />
      <div ref={panelRef} className="glass-stack absolute inset-x-0 top-0 m-3 max-h-[96vh] overflow-y-auto rounded-[2rem] p-5 sm:m-6 sm:p-8" style={{ animation: "ff-slide-down 360ms cubic-bezier(0.22,1,0.36,1)" }} data-light="dossier">
        <div className="sticky top-0 z-10 -mx-5 mb-6 flex items-center justify-between bg-gradient-to-b from-[var(--glass-bg-strong)] to-transparent px-5 pb-3 pt-1 sm:-mx-8 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="font-heading text-base font-semibold text-[var(--ink)] sm:text-lg">List Your Account</span>
            <StatusChip tone="cyan" icon={<ShieldCheck className="h-3 w-3" />}>Seller Intake</StatusChip>
          </div>
          <button ref={closeRef} type="button" aria-label="Close intake" onClick={onClose} className="glass-embed inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--ink)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <ProgressNodes step={step} />

        <div className="mt-8">
          {step === 0 && <StepContact />}
          {step === 1 && <StepDetails data={data} update={update} />}
          {step === 2 && <StepEvidence data={data} update={update} />}
          {step === 3 && <StepVerification />}
          {step === 4 && <StepReview data={data} />}
          {step === 5 && <StepPublication waUrl={waUrl} />}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button type="button" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))} className="glass-embed inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]">
            <ChevronLeft className="h-4 w-4" />
            {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < STEPS.length - 1 ? (
            <MagneticButton onClick={() => setStep((s) => s + 1)} disabled={!canProceed} className="px-6 py-2.5" strength={6}>
              Next <ChevronRight className="h-4 w-4" />
            </MagneticButton>
          ) : null}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[oklch(0.7_0.14_45/0.25)] bg-[oklch(0.86_0.1_80/0.14)] p-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.5_0.16_45)]" />
          <p className="text-xs text-[var(--ink-soft)] text-pretty">
            <span className="font-mono-label text-[9px] text-[oklch(0.5_0.16_45)]">Safety</span><br />
            FF TRUST never asks for passwords, OTPs or recovery codes. Submission is not verification and not publication. The owner reviews and manually publishes approved canonical records.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProgressNodes({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {STEPS.map((s, i) => {
        const isDone = i < step;
        const isActive = i === step;
        const Icon = s.icon;
        return (
          <React.Fragment key={s.key}>
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border-2 transition-all duration-300", isDone ? "border-[oklch(0.55_0.14_160)] bg-[oklch(0.55_0.14_160/0.15)] text-[oklch(0.45_0.14_160)]" : isActive ? "border-[var(--accent-cyan)] bg-[oklch(0.82_0.1_200/0.15)] text-[var(--accent-azure)]" : "border-[var(--border)] bg-transparent text-[var(--ink-soft)]")} style={isActive ? { boxShadow: "var(--neon-soft)" } : undefined}>
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={cn("font-mono-label text-[7px] text-center", isActive ? "text-[var(--accent-azure)]" : "text-[var(--ink-soft)]")}>{String(i + 1).padStart(2, "0")}</span>
            </div>
            {i < STEPS.length - 1 && <div className={cn("h-0.5 w-6 shrink-0 transition-colors duration-300 sm:w-10", i < step ? "bg-[oklch(0.55_0.14_160/0.4)]" : "bg-[var(--border)]")} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function StepContact() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-heading text-xl font-semibold text-[var(--ink)]">Step 01 — <span className="text-gradient-cyan italic">Contact Owner</span></h3>
        <p className="mt-2 text-sm text-[var(--ink-soft)] text-pretty">Start by establishing WhatsApp contact with the owner. You'll provide your listing details in the next steps, then review and press Send yourself — the website never sends automatically.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard icon={<MessageCircle className="h-4 w-4" />} title="WhatsApp first" body="All intake flows through WhatsApp with a structured, URL-encoded message. You review before sending." />
        <InfoCard icon={<Lock className="h-4 w-4" />} title="No secrets" body="FF TRUST never asks for passwords, OTPs or recovery codes. Only public listing information is collected." />
      </div>
    </div>
  );
}

function StepDetails({ data, update }: { data: SellerIntakeData; update: (p: Partial<SellerIntakeData>) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-heading text-xl font-semibold text-[var(--ink)]">Step 02 — <span className="text-gradient-cyan italic">Provide Details</span></h3>
        <p className="mt-2 text-sm text-[var(--ink-soft)] text-pretty">Enter your listing's public information. All fields are non-secret. Required: title and price.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Display name"><input type="text" value={data.displayName ?? ""} onChange={(e) => update({ displayName: e.target.value })} placeholder="Your display name" className="glass-embed w-full rounded-lg px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]" /></Field>
        <Field label="Listing title" required><input type="text" value={data.title ?? ""} onChange={(e) => update({ title: e.target.value })} placeholder="e.g. Heroic Account — Full Collection" className="glass-embed w-full rounded-lg px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]" /></Field>
        <Field label="Price (INR)" required><input type="number" value={data.price ?? ""} onChange={(e) => update({ price: e.target.value ? Number(e.target.value) : undefined })} placeholder="e.g. 4200" className="glass-embed w-full rounded-lg px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]" /></Field>
        <Field label="Level"><input type="number" value={data.level ?? ""} onChange={(e) => update({ level: e.target.value ? Number(e.target.value) : undefined })} placeholder="e.g. 75" className="glass-embed w-full rounded-lg px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]" /></Field>
        <Field label="Rank (optional)"><input type="text" value={data.rank ?? ""} onChange={(e) => update({ rank: e.target.value || undefined })} placeholder="e.g. Heroic" className="glass-embed w-full rounded-lg px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]" /></Field>
        <Field label="Prime"><select value={data.prime === undefined ? "" : data.prime ? "yes" : "no"} onChange={(e) => update({ prime: e.target.value === "" ? undefined : e.target.value === "yes" })} className="glass-embed w-full appearance-none rounded-lg px-3 py-2 text-sm text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"><option value="">—</option><option value="yes">Yes</option><option value="no">No</option></select></Field>
        <Field label="Collections (comma-separated)"><input type="text" value={data.collections ?? ""} onChange={(e) => update({ collections: e.target.value || undefined })} placeholder="e.g. Anime Bundle, Summer Collection" className="glass-embed w-full rounded-lg px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]" /></Field>
        <Field label="Weapons (comma-separated)"><input type="text" value={data.weapons ?? ""} onChange={(e) => update({ weapons: e.target.value || undefined })} placeholder="e.g. AK — Dragon, MP40 — Butterfly" className="glass-embed w-full rounded-lg px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]" /></Field>
        <Field label="Evo (comma-separated)"><input type="text" value={data.evo ?? ""} onChange={(e) => update({ evo: e.target.value || undefined })} placeholder="e.g. M1014 — Dragon Evo 3" className="glass-embed w-full rounded-lg px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]" /></Field>
        <Field label="Contact preference"><select value={data.contactPreference ?? ""} onChange={(e) => update({ contactPreference: e.target.value || undefined })} className="glass-embed w-full appearance-none rounded-lg px-3 py-2 text-sm text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"><option value="">—</option><option value="WhatsApp">WhatsApp</option><option value="WhatsApp + Email">WhatsApp + Email</option></select></Field>
      </div>
      <Field label="Description"><textarea value={data.description ?? ""} onChange={(e) => update({ description: e.target.value || undefined })} placeholder="A brief, honest description of the account…" rows={3} className="glass-embed w-full rounded-lg px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]" /></Field>
    </div>
  );
}

function StepEvidence({ data, update }: { data: SellerIntakeData; update: (p: Partial<SellerIntakeData>) => void }) {
  const evidenceOptions = [
    { key: "screenshots", label: "Screenshots available", desc: "Real inventory screenshots you can share via WhatsApp" },
    { key: "video", label: "Video walkthrough available", desc: "A video showing the account inventory" },
    { key: "bound-email", label: "Bound email transfers", desc: "Original bound email is included" },
    { key: "receipt", label: "Original receipt on file", desc: "Purchase receipt is available" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-heading text-xl font-semibold text-[var(--ink)]">Step 03 — <span className="text-gradient-cyan italic">Provide Evidence</span></h3>
        <p className="mt-2 text-sm text-[var(--ink-soft)] text-pretty">Indicate what genuine evidence you can provide. This is not verification — the owner reviews everything manually. Never fabricate screenshots or AI-generated evidence.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {evidenceOptions.map((opt) => {
          const selected = data.evidenceAvailability?.includes(opt.label);
          return (
            <button key={opt.key} type="button" onClick={() => { const current = data.evidenceAvailability ?? ""; const items = current ? current.split(", ").filter(Boolean) : []; const next = selected ? items.filter((i) => i !== opt.label) : [...items, opt.label]; update({ evidenceAvailability: next.join(", ") || undefined }); }} className={cn("glass-float flex items-start gap-3 rounded-2xl p-4 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]", selected && "ring-2 ring-[var(--accent-cyan)]")}>
              <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors", selected ? "border-[oklch(0.55_0.14_160)] bg-[oklch(0.55_0.14_160/0.15)] text-[oklch(0.45_0.14_160)]" : "border-[var(--border)] text-transparent")}><Check className="h-3.5 w-3.5" /></span>
              <div><p className="text-sm font-medium text-[var(--ink)]">{opt.label}</p><p className="text-xs text-[var(--ink-soft)] text-pretty">{opt.desc}</p></div>
            </button>
          );
        })}
      </div>
      <Field label="Terms (optional)"><textarea value={data.terms ?? ""} onChange={(e) => update({ terms: e.target.value || undefined })} placeholder="Transfer terms the buyer should know…" rows={2} className="glass-embed w-full rounded-lg px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]" /></Field>
    </div>
  );
}

function StepVerification() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-heading text-xl font-semibold text-[var(--ink)]">Step 04 — <span className="text-gradient-cyan italic">Live Verification</span></h3>
        <p className="mt-2 text-sm text-[var(--ink-soft)] text-pretty">The owner will verify your evidence against canonical standards. This step is illustrative — verification happens off-platform via WhatsApp.</p>
      </div>
      <div ref={ref} className={cn("grid items-center gap-8 transition-all duration-700 lg:grid-cols-[1fr_1fr]", visible ? "opacity-100" : "opacity-0")}>
        <div className="relative mx-auto aspect-square w-full max-w-xs"><GlassCapsule className="h-full w-full" /></div>
        <div className="flex flex-col gap-4">
          <VerificationRow label="Evidence cross-check" desc="Screenshots/video verified against listing claims" />
          <VerificationRow label="Provenance flags" desc="Bound email, receipt, recovery access recorded honestly" />
          <VerificationRow label="No fabrication" desc="AI-generated or fabricated evidence is rejected" />
          <div className="flex items-start gap-3 rounded-2xl border border-[oklch(0.7_0.14_45/0.25)] bg-[oklch(0.86_0.1_80/0.14)] p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.5_0.16_45)]" />
            <p className="text-xs text-[var(--ink-soft)] text-pretty">Verification does not guarantee safety. Provenance is shown honestly — it is never a promise of outcome.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerificationRow({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.82_0.1_200/0.15)] text-[var(--accent-azure)]"><Check className="h-3.5 w-3.5" /></span>
      <div><p className="text-sm font-medium text-[var(--ink)]">{label}</p><p className="text-xs text-[var(--ink-soft)] text-pretty">{desc}</p></div>
    </div>
  );
}

function StepReview({ data }: { data: SellerIntakeData }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-heading text-xl font-semibold text-[var(--ink)]">Step 05 — <span className="text-gradient-cyan italic">Owner Review</span></h3>
        <p className="mt-2 text-sm text-[var(--ink-soft)] text-pretty">Review your structured intake data below. When you press Send, WhatsApp opens with this prefill — you review and press Send yourself.</p>
      </div>
      <GlassPanel depth="float" className="p-5">
        <p className="mb-3 font-mono-label text-[9px] text-[var(--accent-azure)]">Intake summary</p>
        <div className="flex flex-col gap-2">
          {data.displayName && <SummaryRow label="Display name" value={data.displayName} />}
          {data.title && <SummaryRow label="Title" value={data.title} />}
          {typeof data.price === "number" && <SummaryRow label="Price" value={`₹${data.price} INR`} />}
          {typeof data.level === "number" && <SummaryRow label="Level" value={String(data.level)} />}
          {data.rank && <SummaryRow label="Rank" value={data.rank} />}
          {typeof data.prime === "boolean" && <SummaryRow label="Prime" value={data.prime ? "Yes" : "No"} />}
          {data.collections && <SummaryRow label="Collections" value={data.collections} />}
          {data.weapons && <SummaryRow label="Weapons" value={data.weapons} />}
          {data.evo && <SummaryRow label="Evo" value={data.evo} />}
          {data.description && <SummaryRow label="Description" value={data.description} />}
          {data.evidenceAvailability && <SummaryRow label="Evidence" value={data.evidenceAvailability} />}
          {data.contactPreference && <SummaryRow label="Contact" value={data.contactPreference} />}
          {data.terms && <SummaryRow label="Terms" value={data.terms} />}
        </div>
      </GlassPanel>
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[oklch(0.96_0.006_245/0.5)] p-4">
        <Eye className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-azure)]" />
        <p className="text-xs text-[var(--ink-soft)] text-pretty">Submission is not verification and not publication. The owner reviews and manually publishes approved canonical records. Once published, every public consumer (Home, Explore, Price Guide, Compare, WhatsApp) updates automatically.</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-2 last:border-b-0">
      <span className="font-mono-label text-[9px] text-[var(--ink-soft)]">{label}</span>
      <span className="text-right text-sm text-[var(--ink)]">{value}</span>
    </div>
  );
}

function StepPublication({ waUrl }: { waUrl: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-heading text-xl font-semibold text-[var(--ink)]">Step 06 — <span className="text-gradient-cyan italic">Publication</span></h3>
        <p className="mt-2 text-sm text-[var(--ink-soft)] text-pretty">Send your structured intake data to the owner via WhatsApp. The owner reviews, verifies, and manually publishes the approved canonical record. Once published, every public consumer updates automatically.</p>
      </div>
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[var(--accent-cyan)] bg-[oklch(0.82_0.1_200/0.12)]" style={{ boxShadow: "var(--neon-soft)" }}>
          <Send className="h-6 w-6 text-[var(--accent-azure)]" />
        </div>
        <MagneticButton onClick={() => window.open(waUrl, "_blank", "noopener,noreferrer")} className="px-8 py-3.5" strength={8}>
          <MessageCircle className="h-4 w-4" />
          Send intake on WhatsApp
        </MagneticButton>
        <p className="font-mono-label text-[9px] text-[var(--ink-soft)]">You review and press Send — the website never sends automatically</p>
      </div>
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[oklch(0.96_0.006_245/0.5)] p-4">
        <Video className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.5_0.16_45)]" />
        <p className="text-xs text-[var(--ink-soft)] text-pretty">{siteConfig.safety.recordingRemind} Keep recording ON throughout any transaction.</p>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono-label text-[9px] text-[var(--ink-soft)]">{label}{required && <span className="text-[oklch(0.6_0.16_45)]"> *</span>}</span>
      {children}
    </label>
  );
}

function InfoCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <GlassPanel depth="embed" className="flex items-start gap-3 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.82_0.1_200/0.12)] text-[var(--accent-azure)]">{icon}</span>
      <div><p className="text-sm font-medium text-[var(--ink)]">{title}</p><p className="text-xs text-[var(--ink-soft)] text-pretty">{body}</p></div>
    </GlassPanel>
  );
}
