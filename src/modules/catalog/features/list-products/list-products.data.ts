import type { CatalogDraft, CatalogRow, IndexStatus } from "./list-products.types";

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
    label: "Processing",
    pill: "bg-status-processing-bg text-status-processing-fg",
    dot: "bg-status-processing-dot",
  },
  PENDING: {
    label: "Unindexed",
    pill: "bg-status-pending-bg text-status-pending-fg",
    dot: "bg-status-pending-dot",
  },
  FAILED: {
    label: "Failed",
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
  status: "PENDING",
};

/** Placeholder records. Replace with `GET /products` when the screen is wired. */
export const PLACEHOLDER_ROWS: CatalogRow[] = [
  {
    id: "p-90214",
    sku: "SKU-90214",
    name: "Heavy-Duty Cordless Drill 20V",
    brand: "DeWalt",
    category: "Power tools",
    status: "INDEXED",
  },
  {
    id: "p-88412",
    sku: "SKU-88412",
    name: "Industrial Impact Socket Set (32-pc)",
    brand: "Milwaukee",
    category: "Hand tools",
    status: "INDEXED",
  },
  {
    id: "p-77291",
    sku: "SKU-77291",
    name: "Laser Distance Measure 165ft",
    brand: "Bosch",
    category: "Measuring tools",
    status: "PROCESSING",
  },
  {
    id: "p-65103",
    sku: "SKU-65103",
    name: "ANSI Z87.1 Safety Eyewear (Smoke)",
    brand: "3M Safety",
    category: "Safety equipment",
    status: "PENDING",
  },
  {
    id: "p-52199",
    sku: "SKU-52199",
    name: "Thermal Imaging Camera FLIR E4",
    brand: "FLIR Systems",
    category: "Imaging equipment",
    status: "FAILED",
    indexError: "Image resolution too low",
  },
  {
    id: "p-44029",
    sku: "SKU-44029",
    name: "Waterproof Inspection Borescope HD",
    brand: "Klein Tools",
    category: "Inspection equipment",
    status: "PENDING",
  },
];

/** Placeholder library totals, consistent with the dashboard's fixtures. */
export const PLACEHOLDER_TOTAL = 1248;
export const PLACEHOLDER_PAGE_COUNT = 208;
export const PLACEHOLDER_PAGE = 1;
