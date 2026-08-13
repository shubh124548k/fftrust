/**
 * FF TRUST — Canonical content (Trust, Price Guide, FAQ, Legal).
 *
 * Single source of truth for editorial / trust / legal copy. Components read
 * from selectors — never hardcode copy into JSX. Editing copy here propagates
 * to every consumer after the normal static refresh/build/deploy.
 *
 * CONTRACT: no absolute "100% safe", "no scam", "guaranteed" claims.
 * Independence disclosure present. Provenance ≠ guarantee.
 */

import type { TrustContent, PriceGuideContent, FAQItem, LegalContent, HowItWorksContent, ScamCenterContent, CompareContent, SafetyAcademyContent } from "@/data/types";

export const trustContent: TrustContent = {
  disclaimer:
    "Transparency and provenance are not the same as a guarantee. Labels reflect the real canonical evidence state on file — nothing more.",
  pillars: [
    {
      key: "bound-email",
      title: "Bound email",
      body: "Whether the original bound email transfers with the account — a real evidence flag, recorded per listing.",
      iconKey: "Mail",
    },
    {
      key: "original-receipt",
      title: "Original receipt",
      body: "Whether a purchase receipt is on file. Presence is shown as a chip; absence is shown honestly, never hidden.",
      iconKey: "Receipt",
    },
    {
      key: "recovery-access",
      title: "Recovery access",
      body: "Whether recovery-code access is part of the listing scope. FF TRUST never collects OTPs or recovery codes itself.",
      iconKey: "KeyRound",
    },
  ],
  evidenceLabels: [
    { key: "bound-email", label: "Bound email", description: "Original bound email transfers with the account." },
    { key: "original-receipt", label: "Receipt", description: "Purchase receipt is on file." },
    { key: "recovery-access", label: "Recovery", description: "Recovery-code access is part of the listing scope." },
  ],
};

export const priceGuideContent: PriceGuideContent = {
  intro:
    "Price bounds are computed from published canonical records — never hardcoded. When no real listings exist, the guide says so honestly.",
  emptyNote: "The guide recomputes automatically once canonical listings are published.",
  derivedFromReal: true,
};

export const faqItems: FAQItem[] = [
  {
    q: "Is FF TRUST affiliated with Garena or Free Fire?",
    a: "No. FF TRUST is an independent platform. It is not affiliated with, endorsed by, or sponsored by Garena or Free Fire. All trademarks belong to their respective owners.",
    category: "Platform",
  },
  {
    q: "Does FF TRUST guarantee account safety?",
    a: "No. Transparency and provenance are not the same as a guarantee. Labels reflect the real canonical evidence state on file — nothing more. We never claim “100% safe”, “no scam” or “guaranteed”.",
    category: "Trust",
  },
  {
    q: "What should I do before buying an account?",
    a: "Before you buy an account, please immediately TURN ON SCREEN RECORDING. Keep SCREEN RECORDING ON throughout the transaction for PROOF. The website cannot start recording — it only reminds you.",
    category: "Buyer safety",
  },
  {
    q: "Does FF TRUST ask for passwords, OTPs or recovery codes?",
    a: "Never. FF TRUST never asks for passwords, OTPs or recovery codes. WhatsApp can open with a prefilled, URL-encoded message, but you press Send.",
    category: "Buyer safety",
  },
  {
    q: "Do Paid Push packages guarantee a rank?",
    a: "No. Paid Push packages (CS Rank Push, BR Rank Push) provide scope and effort only. There is no guaranteed rank, wins, completion, anti-ban or safety. No cheats, exploits or credential access.",
    category: "Paid Push",
  },
  {
    q: "How does WhatsApp contact work?",
    a: "The website opens WhatsApp with a prefilled, URL-encoded message containing only public fields (record id, title, INR price, package). You review it and press Send. The website never sends automatically.",
    category: "Platform",
  },
];

export const legalContent: LegalContent = {
  terms: {
    intro:
      "These terms describe the independent FF TRUST platform. By using the site you acknowledge them. FF TRUST is not affiliated with Garena or Free Fire.",
    sections: [
      {
        heading: "Independent platform",
        body: "FF TRUST is an independent account-trust marketplace. It is not affiliated with, endorsed by, or sponsored by Garena or Free Fire. All trademarks belong to their respective owners.",
      },
      {
        heading: "No guarantees",
        body: "Transparency and provenance are not the same as a guarantee. Account evidence labels reflect the real canonical state on file. Paid Push packages provide scope and effort only — no guaranteed rank, wins, completion, anti-ban or safety.",
      },
      {
        heading: "Buyer safety",
        body: "Before buying an account, turn on screen recording and keep it on throughout the transaction for proof. The website cannot start recording. FF TRUST never asks for passwords, OTPs or recovery codes.",
      },
      {
        heading: "WhatsApp contact",
        body: "The website opens WhatsApp with a prefilled, URL-encoded message. The user presses Send. The website never sends messages automatically and never collects credentials.",
      },
    ],
  },
  privacy: {
    intro:
      "FF TRUST is a frontend-only platform. It does not operate a paid backend, paid database or hidden metered service. This summary describes how public information is handled.",
    sections: [
      {
        heading: "No credential collection",
        body: "FF TRUST never collects passwords, OTPs or recovery codes. WhatsApp inquiries contain only public fields (record id, title, INR price, package) that you review before pressing Send.",
      },
      {
        heading: "Canonical data",
        body: "Listing and service data is canonical configuration. Public selectors expose only published, non-demo records. SAMPLE fixtures are clearly labeled and isolated from production inventory.",
      },
      {
        heading: "Independent platform",
        body: "FF TRUST is not affiliated with Garena or Free Fire. No absolute safety or guarantee claims are made.",
      },
    ],
  },
};

export const howItWorksContent: HowItWorksContent = {
  intro:
    "A transparent, four-step flow — from canonical evidence to WhatsApp inquiry. No hidden steps, no credential collection.",
  steps: [
    {
      key: "browse",
      title: "Browse with evidence",
      body: "Explore accounts and services with honest evidence metadata — bound email, receipt, recovery access — never invented ratings.",
      iconKey: "Compass",
    },
    {
      key: "verify",
      title: "Verify provenance",
      body: "Labels reflect the real canonical evidence state on file. Provenance is shown honestly; it is never a promise of safety.",
      iconKey: "ShieldCheck",
    },
    {
      key: "record",
      title: "Turn on screen recording",
      body: "Before you buy, turn on screen recording and keep it on throughout the transaction for proof. The site cannot record.",
      iconKey: "Video",
    },
    {
      key: "contact",
      title: "Inquire on WhatsApp",
      body: "The website opens WhatsApp with a prefilled, URL-encoded message. You review it and press Send — never automatic.",
      iconKey: "MessageCircle",
    },
  ],
};

export const scamCenterContent: ScamCenterContent = {
  intro:
    "Awareness, not alarm. Know the red flags before any transaction. FF TRUST never asks for passwords, OTPs or recovery codes.",
  redFlags: [
    { key: "credentials", label: "Password / OTP requests", body: "Anyone asking for your password, OTP or recovery code is a red flag. FF TRUST never does this." },
    { key: "guarantees", label: "Guaranteed rank / wins", body: "No legitimate service guarantees rank, wins, anti-ban or safety. Paid Push is scope & effort only." },
    { key: "off-platform", label: "Off-platform pressure", body: "Pressure to move off-platform or skip screen recording is a red flag. Keep recording ON for proof." },
    { key: "fake-proof", label: "Fabricated evidence", body: "Be cautious of screenshots that cannot be verified against canonical listing media. Ask for the listing ref." },
    { key: "ai-evidence", label: "AI-generated evidence", body: "AI can fabricate convincing screenshots and videos. Cross-check against the canonical listing's real media URLs — not against re-sent images." },
    { key: "impersonation", label: "Impersonation", body: "Scammers may impersonate FF TRUST or the owner. Always start WhatsApp from the site's canonical button — never from a forwarded number." },
    { key: "payment-manipulation", label: "Payment manipulation", body: "Requests for unusual payment methods, upfront transfers to personal accounts, or splitting payments are red flags. Use normal channels only." },
  ],
  goldenRule:
    "If it feels wrong, stop. Keep screen recording ON, ask for the canonical listing reference, and press Send yourself on WhatsApp.",
};

export const safetyAcademyContent: SafetyAcademyContent = {
  intro:
    "A visual journey through safe trading — from preparation to proof. No fake safety percentages, no guaranteed outcomes.",
  lessons: [
    {
      key: "prepare",
      title: "Prepare before you buy",
      body: "Turn on screen recording before opening any chat. Keep it on throughout the entire transaction for proof. The website cannot start recording — only you can.",
      iconKey: "Video",
    },
    {
      key: "verify",
      title: "Verify the listing",
      body: "Always ask for the canonical listing reference. Cross-check media against the listing's real URLs — not against re-sent images or AI-generated screenshots.",
      iconKey: "ShieldCheck",
    },
    {
      key: "protect",
      title: "Protect your credentials",
      body: "Never share passwords, OTPs or recovery codes. FF TRUST never asks for them. WhatsApp inquiries contain only public fields you review before pressing Send.",
      iconKey: "KeyRound",
    },
    {
      key: "record",
      title: "Keep recording ON",
      body: "Keep screen recording on throughout payment, login transfer and confirmation. If anyone pressures you to stop recording, stop the transaction instead.",
      iconKey: "CircleRecord",
    },
    {
      key: "confirm",
      title: "Confirm on your own",
      body: "Press Send yourself on WhatsApp. The website never sends automatically. Verify the destination number matches the canonical owner configuration on the site.",
      iconKey: "Check",
    },
  ],
};

export const compareContent: CompareContent = {
  intro:
    "Compare accounts side-by-side and save favorites. The comparison stage derives from canonical records — no fake metrics.",
  emptyNote:
    "When real listings are published, the comparison stage populates automatically with price, level, rank, Prime and evidence columns.",
};
