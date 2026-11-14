import type { CatalogRow } from "./list-products.types";

export const CATALOG_PAGE_SIZE = 6;

/** Page already-filtered records and keep the requested page within bounds. */
export function paginateCatalogRows(rows: CatalogRow[], requestedPage: number) {
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const page = Math.max(1, Math.min(requestedPage, pageCount));
  const offset = (page - 1) * CATALOG_PAGE_SIZE;
  const visibleRows = rows.slice(offset, offset + CATALOG_PAGE_SIZE);

  return {
    visibleRows,
    total,
    page,
    pageCount,
    start: total ? offset + 1 : 0,
    end: offset + visibleRows.length,
  };
}
