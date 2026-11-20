/**
 * SKU helpers. Pure functions so the drawer stays presentational and the rules
 * can be exercised without mounting React.
 */

/** Generates a grocery product code; the database enforces uniqueness. */
export function generateSku(): string {
  return `PH-GR-${Math.floor(10000 + Math.random() * 90000)}`;
}

/** The API enforces `@unique` on `Product.sku`; mirror it before submitting. */
export function isSkuTaken(sku: string, existingSkus: readonly string[]): boolean {
  const candidate = sku.trim().toLowerCase();
  if (!candidate) return false;
  return existingSkus.some((existing) => existing.trim().toLowerCase() === candidate);
}
