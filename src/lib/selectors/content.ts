/**
 * FF TRUST — Content selectors (Trust, Price Guide, FAQ, Legal).
 * Components read canonical copy from here — never hardcode copy into JSX.
 */

import {
  trustContent,
  priceGuideContent,
  faqItems,
  legalContent,
  howItWorksContent,
  scamCenterContent,
  compareContent,
  safetyAcademyContent,
} from "@/data/content";
import type {
  TrustContent,
  PriceGuideContent,
  FAQItem,
  LegalContent,
  HowItWorksContent,
  ScamCenterContent,
  CompareContent,
  SafetyAcademyContent,
} from "@/data/types";

export function getTrustContent(): TrustContent {
  return trustContent;
}

export function getPriceGuideContent(): PriceGuideContent {
  return priceGuideContent;
}

export function getFAQs(category?: string): FAQItem[] {
  if (!category) return faqItems;
  return faqItems.filter((f) => f.category === category);
}

export function getLegalContent(): LegalContent {
  return legalContent;
}

export function getHowItWorksContent(): HowItWorksContent {
  return howItWorksContent;
}

export function getScamCenterContent(): ScamCenterContent {
  return scamCenterContent;
}

export function getCompareContent(): CompareContent {
  return compareContent;
}

export function getSafetyAcademyContent(): SafetyAcademyContent {
  return safetyAcademyContent;
}
