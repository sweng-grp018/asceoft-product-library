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
  description: "",
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
    description:
      "Brushless 20V drill with a two-speed transmission and LED work light. The compact body fits between shelf uprights where a full-size drill will not.",
    status: "INDEXED",
  },
  {
    id: "p-88412",
    sku: "SKU-88412",
    name: "Industrial Impact Socket Set (32-pc)",
    brand: "Milwaukee",
    category: "Hand tools",
    description:
      "32 impact-rated sockets in a labelled case, sized 8–32 mm. Case artwork is the most reliable visual marker on a shelf photo.",
    status: "INDEXED",
  },
  {
    id: "p-77291",
    sku: "SKU-77291",
    name: "Laser Distance Measure 165ft",
    brand: "Bosch",
    category: "Measuring tools",
    description:
      "Class 2 laser measure rated to 50 m with a backlit display. Reference photos are still being captured from the vendor sheet.",
    status: "PROCESSING",
  },
  {
    id: "p-65103",
    sku: "SKU-65103",
    name: "ANSI Z87.1 Safety Eyewear (Smoke)",
    brand: "3M Safety",
    category: "Safety equipment",
    description:
      "Smoke-lens safety glasses with a wraparound frame. No reference photos submitted yet, so the SKU cannot be matched by sight.",
    status: "PENDING",
  },
  {
    id: "p-52199",
    sku: "SKU-52199",
    name: "Thermal Imaging Camera FLIR E4",
    brand: "FLIR Systems",
    category: "Imaging equipment",
    description:
      "Handheld thermal camera, 80 × 60 IR resolution. Submitted photos were rejected before indexing completed.",
    status: "FAILED",
    indexError: "Image resolution too low",
  },
  {
    id: "p-44029",
    sku: "SKU-44029",
    name: "Waterproof Inspection Borescope HD",
    brand: "Klein Tools",
    category: "Inspection equipment",
    description:
      "IP67 borescope with a 9 mm camera head and a 6 ft probe. Awaiting its first reference photo set.",
    status: "PENDING",
  },
];

/** Placeholder library totals, consistent with the dashboard's fixtures. */
export const PLACEHOLDER_TOTAL = 1248;
export const PLACEHOLDER_PAGE_COUNT = 208;
export const PLACEHOLDER_PAGE = 1;
