import type { CatalogRow } from "./list-products.types";

export type CatalogStatusFilter = "all" | "ready" | "needs-indexing";

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
export function filterCatalogRows(
  rows: CatalogRow[],
  query: string,
  status: CatalogStatusFilter = "all",
): CatalogRow[] {
  const needle = normalize(query);
  return rows.filter((row) => {
    if (status === "ready" && row.status !== "INDEXED") return false;
    if (status === "needs-indexing" && row.status !== "PENDING" && row.status !== "FAILED")
      return false;
    return !needle || matches(row, needle);
  });
}
