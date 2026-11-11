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

/** Fields the create step validates before it lets the draft advance. */
export type CatalogDraftErrors = Partial<Record<keyof CatalogDraft, string>>;

/**
 * A file the operator picked in the create drawer. It never leaves the browser:
 * uploads need a stored product id and a presigned URL from the API.
 */
export type CatalogPhoto = {
  id: string;
  name: string;
  size: number;
  /** `URL.createObjectURL` handle; revoked when the photo is removed or the drawer closes. */
  previewUrl: string;
};

export type CatalogToast = {
  message: string;
  tone: "success" | "danger";
};
