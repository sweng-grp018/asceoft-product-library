import SYNTHETIC_GROCERY_PRODUCTS from "../../grocery-products.json";
import type { CatalogDraft, IndexStatus } from "./list-products.types";

/**
 * Presentation metadata for an indexing state. Status colour roles live in
 * `globals.css` (`--status-*`) so a rebrand never touches this file.
 */
export const STATUS_META: Record<IndexStatus, { label: string; pill: string; dot: string }> = {
  INDEXED: {
    label: "Ready",
    pill: "bg-status-ready-bg text-status-ready-fg",
    dot: "bg-status-ready-dot",
  },
  PROCESSING: {
    label: "Preparing",
    pill: "bg-status-processing-bg text-status-processing-fg",
    dot: "bg-status-processing-dot",
  },
  PENDING: {
    label: "Not ready",
    pill: "bg-status-pending-bg text-status-pending-fg",
    dot: "bg-status-pending-dot",
  },
  FAILED: {
    label: "Needs attention",
    pill: "bg-status-failed-bg text-status-failed-fg",
    dot: "bg-status-failed-dot",
  },
};

export const STATUS_OPTIONS: IndexStatus[] = ["PENDING", "PROCESSING", "INDEXED", "FAILED"];

export const EMPTY_DRAFT: CatalogDraft = {
  sku: "",
  name: "",
  brand: "",
  category: "",
  description: "",
  status: "PENDING",
};

/* -------------------------------------------------------------------------- */
/* Editor limits                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Field limits mirror the `productInput` schema in `src/api/modules/catalog`.
 * The description cap is deliberately tighter than the API's 5000: the drawer
 * is an identification hint, not a marketing page.
 */
export const SKU_MAX_LENGTH = 100;
export const BRAND_MAX_LENGTH = 100;
export const NAME_MAX_LENGTH = 200;
export const CATEGORY_MAX_LENGTH = 100;
export const DESCRIPTION_LIMIT = 500;

/** Mirrors `IMAGE_TYPES` and the presigned-upload `maxBytes` in the API. */
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const PHOTO_LIMIT = 5;

/* -------------------------------------------------------------------------- */
/* Create wizard                                                              */
/* -------------------------------------------------------------------------- */

export const CREATE_STEPS = [
  { key: "metadata", label: "Product details" },
  { key: "photos", label: "Photos" },
  { key: "review", label: "Review" },
] as const;

/** Suggested captures. Guidance only: the API requires one photo, not angles. */
export const SUGGESTED_ANGLES = ["Front view", "Side view", "Pack label", "Packaging"] as const;

/**
 * Suggestions for the brand and category comboboxes, seeded from the fixtures
 * so a new SKU reuses an existing spelling instead of splitting the catalogue.
 */
export const BRAND_SUGGESTIONS = Array.from(
  new Set(SYNTHETIC_GROCERY_PRODUCTS.map((row) => row.brand)),
).sort((a, b) => a.localeCompare(b));

export const CATEGORY_SUGGESTIONS = Array.from(
  new Set(SYNTHETIC_GROCERY_PRODUCTS.map((row) => row.category)),
).sort((a, b) => a.localeCompare(b));
