import assert from "node:assert/strict";
import test from "node:test";
import { filterDashboardActivities, type ActivityFilters } from "./dashboard-activity.filters";
import type { DashboardActivity } from "./dashboard-activity.data";
import { paginateDashboardActivities } from "./dashboard-activity.paging";

const filters: ActivityFilters = {
  status: "all",
  period: "all",
  today: "2026-11-16",
  from: "",
  to: "",
};
const dates = [
  "2026-11-16T16:00:00Z",
  "2026-11-16T15:59:59Z",
  "2026-11-15T16:00:00Z",
  "2026-11-15T15:59:59Z",
  "2026-11-10T00:00:00+08:00",
  "2026-11-09T23:59:59+08:00",
  "2026-10-18T00:00:00+08:00",
  "2026-10-17T23:59:59+08:00",
];
const rows: DashboardActivity[] = dates.map((addedAt, i) => ({
  id: String(i),
  sku: String(i),
  name: `Item ${i}`,
  status: i % 2 ? "INDEXED" : "PENDING",
  addedAt,
}));
const ids = (overrides: Partial<ActivityFilters>) =>
  filterDashboardActivities(rows, { ...filters, ...overrides }).map((row) => row.id);

test("today uses inclusive Philippine midnight boundaries and excludes tomorrow", () => {
  assert.deepEqual(ids({ period: "today" }), ["1", "2"]);
});

test("7 and 30 day windows include today and their first calendar day", () => {
  assert.deepEqual(ids({ period: "week" }), ["1", "2", "3", "4"]);
  assert.deepEqual(ids({ period: "month" }), ["1", "2", "3", "4", "5", "6"]);
});

test("custom range includes both entire days and supports a single date", () => {
  assert.deepEqual(ids({ period: "custom", from: "2026-11-16", to: "2026-11-16" }), ["1", "2"]);
  assert.deepEqual(ids({ period: "custom", from: "2026-11-15", to: "2026-11-16" }), [
    "1",
    "2",
    "3",
  ]);
  assert.deepEqual(ids({ period: "custom", from: "2026-11-17", to: "2026-11-16" }), []);
  assert.deepEqual(ids({ period: "custom", from: "2026-11-16", to: "" }), []);
});

test("status and timeline filters intersect before pagination", () => {
  assert.deepEqual(ids({ status: "ready", period: "week" }), ["1", "3"]);
  const failed = { ...rows[0], id: "failed", status: "FAILED" as const };
  const processing = { ...rows[0], id: "processing", status: "PROCESSING" as const };
  const result = filterDashboardActivities([...rows, failed, processing], {
    ...filters,
    status: "needs-indexing",
  });
  assert(result.some((row) => row.id === "failed"));
  assert(!result.some((row) => row.id === "processing"));
  assert.equal(paginateDashboardActivities(result, 99).total, result.length);
  assert.equal(filterDashboardActivities(rows, filters).length, rows.length);
});

test("rolling date arithmetic crosses month and year boundaries", () => {
  const januaryRows = rows.slice(0, 2).map((row, i) => ({
    ...row,
    addedAt: i ? "2026-12-26T23:59:59+08:00" : "2026-12-27T00:00:00+08:00",
  }));
  assert.deepEqual(
    filterDashboardActivities(januaryRows, { ...filters, period: "week", today: "2027-01-02" }).map(
      (row) => row.id,
    ),
    ["0"],
  );
});
