"use client";

import { useCallback, useMemo, useState } from "react";
import { filterCatalogRows } from "./list-products.search";
import { paginateCatalogRows } from "./list-products.paging";
import type { CatalogDraft, CatalogRow } from "./list-products.types";

function normalizeDraft(draft: CatalogDraft): CatalogDraft {
  return {
    sku: draft.sku.trim(),
    name: draft.name.trim(),
    brand: draft.brand.trim(),
    category: draft.category.trim() || "Uncategorized",
    description: draft.description.trim(),
    status: draft.status,
  };
}

/**
 * Owns catalog rows for the static preview. Replace the four mutators with
 * server calls; the presentational components stay unchanged.
 */
export function useListProducts(initialRows: CatalogRow[]) {
  const [rows, setRows] = useState<CatalogRow[]>(initialRows);
  const [query, setSearchQuery] = useState("");
  const [requestedPage, setPage] = useState(1);

  const filteredRows = useMemo(() => filterCatalogRows(rows, query), [rows, query]);
  const pagination = paginateCatalogRows(filteredRows, requestedPage);

  // Persist the clamped page when deletion or editing removes the last page.
  if (requestedPage !== pagination.page) setPage(pagination.page);

  const setQuery = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const createRow = useCallback((draft: CatalogDraft) => {
    const row: CatalogRow = { id: crypto.randomUUID(), ...normalizeDraft(draft) };
    setRows((current) => [row, ...current]);
    setSearchQuery("");
    setPage(1);
    return row;
  }, []);

  const updateRow = useCallback((id: string, draft: CatalogDraft) => {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              ...normalizeDraft(draft),
              indexError: draft.status === "FAILED" ? row.indexError : undefined,
            }
          : row,
      ),
    );
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
  }, []);

  return {
    rows,
    ...pagination,
    query,
    setQuery,
    previousPage: () => setPage(Math.max(1, pagination.page - 1)),
    nextPage: () => setPage(Math.min(pagination.pageCount, pagination.page + 1)),
    createRow,
    updateRow,
    removeRow,
  };
}
