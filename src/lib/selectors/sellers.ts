/**
 * FF TRUST — Seller selectors.
 */

import { allSellers } from "@/data/sellers";
import type { SellerReference } from "@/data/types";

export function getSellerById(id: string, source?: SellerReference[]): SellerReference | undefined {
  const pool = source ?? allSellers;
  return pool.find((s) => s.id === id);
}

export function getPublishedSellers(source?: SellerReference[]): SellerReference[] {
  const pool = source ?? allSellers;
  return pool.filter((s) => !s.demo);
}
