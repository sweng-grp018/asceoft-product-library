import { PLACEHOLDER_ROWS } from "@/modules/catalog/features/list-products/list-products.data";
import type { IndexStatus } from "@/modules/catalog/features/list-products/list-products.types";

export type DashboardActivity = {
  id: string;
  sku: string;
  name: string;
  status: IndexStatus;
  addedAt: string;
};

// Fixed demo timestamps keep ordering and dates stable across server and browser.
const SAMPLE_LATEST_ADDED_AT = Date.parse("2026-11-14T10:00:00+08:00");

export const DASHBOARD_ACTIVITIES: DashboardActivity[] = PLACEHOLDER_ROWS.map((row, index) => ({
  id: row.id,
  sku: row.sku,
  name: row.name,
  status: row.status,
  addedAt: new Date(SAMPLE_LATEST_ADDED_AT - index * 60 * 60 * 1000).toISOString(),
}));
