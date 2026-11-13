"use client";

import { useCallback, useMemo, useState } from "react";
import { filterCatalogRows } from "./list-products.search";
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
  const [query, setQuery] = useState("");

  const visibleRows = useMemo(() => filterCatalogRows(rows, query), [rows, query]);

  const createRow = useCallback((draft: CatalogDraft) => {
    const row: CatalogRow = { id: crypto.randomUUID(), ...normalizeDraft(draft) };
    setRows((current) => [row, ...current]);
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

  return { rows, visibleRows, query, setQuery, createRow, updateRow, removeRow };
}
