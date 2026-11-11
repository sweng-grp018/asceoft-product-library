export type IndexStatus = "INDEXED" | "PROCESSING" | "PENDING" | "FAILED";

/**
 * Catalog row as rendered by the list. `indexStatus` is the API field name;
 * `IndexStatus` mirrors it so wiring this screen to `/products` is a mapping
 * change, not a rewrite.
 */
export type CatalogRow = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  status: IndexStatus;
  indexError?: string;
};

/** Editable fields of a catalog record. */
export type CatalogDraft = Omit<CatalogRow, "id" | "indexError">;

export type CatalogEditor =
  | { mode: "create"; row: null; session: number }
  | { mode: "edit"; row: CatalogRow; session: number };

export type CatalogToast = {
  message: string;
  tone: "success" | "danger";
};
