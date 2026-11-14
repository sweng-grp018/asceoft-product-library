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
  {
    id: "p-31001",
    sku: "SKU-31001",
    name: "Cordless Circular Saw 18V",
    brand: "Makita",
    category: "Power tools",
    description: "Compact circular saw with a brushless motor and adjustable cutting depth.",
    status: "INDEXED",
  },
  {
    id: "p-31002",
    sku: "SKU-31002",
    name: "Rotary Hammer Drill SDS Plus",
    brand: "Hilti",
    category: "Power tools",
    description: "Rotary hammer with a side handle for drilling masonry.",
    status: "PENDING",
  },
  {
    id: "p-31003",
    sku: "SKU-31003",
    name: "Digital Multimeter Auto Range",
    brand: "Klein Tools",
    category: "Measuring tools",
    description: "Auto-ranging multimeter with insulated test leads and a backlit display.",
    status: "INDEXED",
  },
  {
    id: "p-31004",
    sku: "SKU-31004",
    name: "Adjustable Wrench 250 mm",
    brand: "Milwaukee",
    category: "Hand tools",
    description: "Wide-jaw adjustable wrench with an ergonomic grip.",
    status: "PROCESSING",
  },
  {
    id: "p-31005",
    sku: "SKU-31005",
    name: "Reusable Half-Face Respirator",
    brand: "3M Safety",
    category: "Safety equipment",
    description: "Reusable respirator body with replaceable filter mounts.",
    status: "PENDING",
  },
  {
    id: "p-31006",
    sku: "SKU-31006",
    name: "Cross-Line Laser Level",
    brand: "Bosch",
    category: "Measuring tools",
    description: "Self-levelling laser with horizontal and vertical alignment lines.",
    status: "FAILED",
    indexError: "Reference photo is blurred",
  },
  {
    id: "p-31007",
    sku: "SKU-31007",
    name: "Cordless Angle Grinder 20V",
    brand: "DeWalt",
    category: "Power tools",
    description: "Cordless angle grinder with a tool-free guard adjustment.",
    status: "INDEXED",
  },
  {
    id: "p-31008",
    sku: "SKU-31008",
    name: "Insulated Screwdriver Set (6-pc)",
    brand: "Klein Tools",
    category: "Hand tools",
    description: "Six insulated screwdrivers in a fitted storage case.",
    status: "PENDING",
  },
  {
    id: "p-31009",
    sku: "SKU-31009",
    name: "Compact Thermal Camera C5",
    brand: "FLIR Systems",
    category: "Imaging equipment",
    description: "Pocket-size thermal camera with a touchscreen display.",
    status: "PROCESSING",
  },
  {
    id: "p-31010",
    sku: "SKU-31010",
    name: "Cordless Inspection Light",
    brand: "Makita",
    category: "Inspection equipment",
    description: "Portable LED inspection light with a rotating head.",
    status: "INDEXED",
  },
  {
    id: "p-31011",
    sku: "SKU-31011",
    name: "Over-Ear Hearing Protectors",
    brand: "3M Safety",
    category: "Safety equipment",
    description: "Padded hearing protectors with an adjustable headband.",
    status: "PENDING",
  },
  {
    id: "p-31012",
    sku: "SKU-31012",
    name: "Torque Wrench 1/2-inch Drive",
    brand: "Milwaukee",
    category: "Hand tools",
    description: "Click-type torque wrench supplied with a protective carrying case.",
    status: "INDEXED",
  },
];

/* -------------------------------------------------------------------------- */
/* Editor limits                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Field limits mirror the `productInput` schema in `api/src/modules/catalog`.
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
  { key: "metadata", label: "SKU & specs" },
  { key: "photos", label: "Visual photos" },
  { key: "review", label: "Review" },
] as const;

/** Suggested captures. Guidance only: the API requires one photo, not angles. */
export const SUGGESTED_ANGLES = ["Front view", "Side profile", "Spec label", "Packaging"] as const;

/**
 * Suggestions for the brand and category comboboxes, seeded from the fixtures
 * so a new SKU reuses an existing spelling instead of splitting the catalogue.
 */
export const BRAND_SUGGESTIONS = Array.from(
  new Set([...PLACEHOLDER_ROWS.map((row) => row.brand), "Makita", "Hilti"]),
).sort((a, b) => a.localeCompare(b));

export const CATEGORY_SUGGESTIONS = Array.from(
  new Set(PLACEHOLDER_ROWS.map((row) => row.category)),
).sort((a, b) => a.localeCompare(b));
