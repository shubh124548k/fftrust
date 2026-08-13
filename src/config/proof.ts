/**
 * FF TRUST — Canonical Buyer Proof / Safety content (PROMPT 2).
 *
 * ONE source of truth for every buyer-proof surface:
 *  - BuyerProofPanel (Details, overlays, homepage, footer)
 *  - /proof dedicated page
 *  - WhatsApp buyer-proof confirmation lines
 *
 * Copy is professional, legally cautious and never guarantees the outcome of
 * an underlying transaction. FF TRUST remains an independent marketplace and
 * never collects passwords, OTPs, recovery codes or other credentials.
 */

export interface ProofSection {
  key: string;
  title: string;
  body: string;
  iconKey?: string;
}

export const proofContent = {
  eyebrow: "FF TRUST · Buyer proof",
  /** The large, always-visible sentence. */
  heading: "KEEP SCREEN RECORDING ON",
  /** Short lead sentence shown in the proof panel + hero. */
  core: "Before verification or purchase, turn ON screen recording and keep it ON throughout the complete process.",
  /** Supporting explanation. */
  body: "Screen recording preserves clear evidence of the verification and transaction. For additional proof, use WhatsApp, a video meeting or screen sharing when required.",
  /** Hard no-list sentence. */
  neverSend:
    "Never send passwords, OTPs, recovery codes or other sensitive credentials through FF TRUST.",
  /** Independent-platform limitation — honest, no false guarantees. */
  disclaimer:
    "FF TRUST is an independent platform and does not guarantee the underlying transaction. The website cannot record your screen and never collects credentials.",
  /** What NOT to share — list. */
  dontShare: [
    "Your password",
    "One-time passwords (OTPs)",
    "Recovery / backup codes",
    "Private credentials of any kind",
  ],
  /** When to keep recording. */
  keepRecording: [
    "Before verification or purchase — start recording first",
    "Throughout verification (walkthrough, live checks, shared screen)",
    "Throughout the transaction and delivery",
    "Until every step is complete",
  ],
  /** Dedicated /proof page sections. */
  sections: [
    {
      key: "why-recording",
      title: "Why screen recording matters",
      iconKey: "Video",
      body: "Screen recording preserves clear, time-stamped evidence of what was shown, said and agreed during the process. It protects both the buyer and the seller, and gives both sides honest material if a dispute ever needs to be reviewed.",
    },
    {
      key: "when-start",
      title: "When to start recording",
      iconKey: "Play",
      body: "Start recording BEFORE you begin verification or purchase. Evidence is strongest when it captures the entire process from the first step, not just the end.",
    },
    {
      key: "during-verification",
      title: "Keep recording during verification",
      iconKey: "ShieldCheck",
      body: "Keep the recording running for the whole verification: walkthroughs, live checks, shared screens and any steps where the listing is inspected.",
    },
    {
      key: "during-transaction",
      title: "Keep recording during the transaction",
      iconKey: "Wallet",
      body: "Keep it running through the transaction and delivery, including settlement and handover steps, so the full sequence is on record.",
    },
    {
      key: "extra-proof",
      title: "WhatsApp, video meeting or screen sharing",
      iconKey: "MessageCircle",
      body: "When appropriate, use WhatsApp, a video meeting or screen sharing for additional proof. These channels can provide an independent record beyond the screen recording.",
    },
    {
      key: "evidence-preserve",
      title: "What evidence to preserve",
      iconKey: "FileCheck",
      body: "Preserve the listing screenshot, the recorded video, conversation timestamps, transaction references and any media or proof the seller provides. Keep them organised until the transaction is complete.",
    },
    {
      key: "never-share",
      title: "What NOT to share",
      iconKey: "Lock",
      body: "Never share your password, OTPs, recovery codes or any private credentials through FF TRUST or in a conversation opened from it. Legitimate verification never requires these.",
    },
    {
      key: "platform-limits",
      title: "Platform limitations",
      iconKey: "Info",
      body: "FF TRUST is an independent marketplace and contact platform. It does not verify account ownership, does not execute the transaction and cannot guarantee its outcome.",
    },
    {
      key: "buyer-responsibilities",
      title: "Buyer responsibilities",
      iconKey: "UserCheck",
      body: "Keep screen recording ON, review the listing evidence, keep sensitive credentials private, and confirm every important detail with the seller before proceeding.",
    },
    {
      key: "seller-responsibilities",
      title: "Seller responsibilities",
      iconKey: "Store",
      body: "Describe the listing honestly, share real canonical evidence, never ask for credentials, and keep their own record of the verification and transaction.",
    },
    {
      key: "evidence-provenance",
      title: "Evidence and provenance",
      iconKey: "Fingerprint",
      body: "Provenance is not the same as a guarantee. Labels reflect the real canonical evidence state on file — nothing more. Always verify for yourself during the process.",
    },
    {
      key: "independent-disclaimer",
      title: "Independent platform disclaimer",
      iconKey: "Scale",
      body: "FF TRUST is not affiliated with, endorsed by, or sponsored by Garena or Free Fire. The website cannot start screen recording and never collects your credentials.",
    },
    {
      key: "verification",
      title: "What verification involves",
      iconKey: "ScanSearch",
      body: "Verification is an honest live inspection of the listed account: in-game walkthrough, live checks and shared screen where agreed. It is a process, not a guarantee — verify the claimed value yourself while recording.",
    },
    {
      key: "transaction-safety",
      title: "Transaction safety",
      iconKey: "Receipt",
      body: "Keep recording through payment, settlement and handover. Confirm the exact price, delivery method and account details in writing before sending anything, and keep the recorded sequence until every step is complete.",
    },
    {
      key: "scam-prevention",
      title: "Scam prevention",
      iconKey: "AlertTriangle",
      body: "Be alert to pressure tactics, urgent off-platform deals, prices that look too good, and requests to move the conversation away from recorded channels. When something feels rushed, slow down and re-verify before continuing.",
    },
    {
      key: "impersonation-warning",
      title: "Impersonation warning",
      iconKey: "ShieldAlert",
      body: "Scammers may impersonate FF TRUST, its owner or a seller. FF TRUST never asks for credentials or payment on behalf of any party — always confirm the real identity of who you are dealing with, in the recorded conversation.",
    },
    {
      key: "recovery-account-transfer",
      title: "Recovery & account-transfer safety",
      iconKey: "RefreshCcw",
      body: "During delivery and after handover, keep recovery and login details private, change them in your control only after the transfer is agreed, and never share recovery codes, OTPs or linked-account credentials.",
    },
    {
      key: "dispute-evidence",
      title: "Dispute evidence",
      iconKey: "Gavel",
      body: "If a dispute arises, the screen recording, listing screenshot, conversation timestamps and transaction references are the honest evidence base. Keep them organised and complete — they are the record of what actually happened.",
    },
  ] satisfies ProofSection[],
};
