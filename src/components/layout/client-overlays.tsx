"use client";

import dynamic from "next/dynamic";

const AccountDetailOverlay = dynamic(
  () => import("@/components/detail/account-detail-overlay").then((m) => m.AccountDetailOverlay),
  { ssr: false },
);
const ServiceDetailOverlay = dynamic(
  () => import("@/components/detail/service-detail-overlay").then((m) => m.ServiceDetailOverlay),
  { ssr: false },
);
const CompareDock = dynamic(
  () => import("@/components/compare/compare-dock").then((m) => m.CompareDock),
  { ssr: false },
);
const CompareEducationHint = dynamic(
  () => import("@/components/compare/compare-education-hint").then((m) => m.CompareEducationHint),
  { ssr: false },
);
const SellerContactPopup = dynamic(
  () => import("@/components/seller/seller-contact-popup").then((m) => m.SellerContactPopup),
  { ssr: false },
);
const ScrollProgressBar = dynamic(
  () => import("@/components/motion/scroll-progress-bar").then((m) => m.ScrollProgressBar),
  { ssr: false },
);
const LoginModal = dynamic(
  () => import("@/components/auth/login-modal").then((m) => m.LoginModal),
  { ssr: false },
);

export function ClientOverlays() {
  return (
    <>
      <AccountDetailOverlay />
      <ServiceDetailOverlay />
      <CompareDock />
      <CompareEducationHint />
      <SellerContactPopup />
      <ScrollProgressBar />
      <LoginModal />
    </>
  );
}
