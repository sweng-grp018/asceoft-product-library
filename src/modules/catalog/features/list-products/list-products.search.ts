import type { CatalogRow } from "./list-products.types";

function normalize(query: string): string {
  return query.trim().toLowerCase();
}

function matches(row: CatalogRow, needle: string): boolean {
  return [row.sku, row.name, row.brand, row.category].some((field) =>
    field.toLowerCase().includes(needle),
  );
}

/**
 * Case-insensitive search across the fields an administrator scans by.
 * Pure and dependency-free so it can be unit tested without a DOM.
 */
export function filterCatalogRows(rows: CatalogRow[], query: string): CatalogRow[] {
  const needle = normalize(query);
  if (!needle) return rows;
  return rows.filter((row) => matches(row, needle));
}
